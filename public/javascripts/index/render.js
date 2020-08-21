'use strict';

const barn = new Barn(localStorage);
const notyf = new Notyf();
const websocket = new ReconnectingWebSocket(`${location.protocol == 'https:' ? "wss:" : "ws:"}//${location.host}`, null, {debug: false, reconnectInterval: 3000});

const synth = new Tone.Synth({
    oscillator : {
        type: 'sine'
    }
}).toDestination();

$(document).ready(function(event=null) {

    NProgress.start()

    const chart = new Vue({
        el: '#chart',
        components: {
            'trading-vue': TradingVueLib.TradingVue
        },
        data: {
            chart: {
                ohlcv: [],
                onchart: [
                    {
                        "name": "SMA",
                        "type": "SMA",
                        "data": [],
                        "settings": {
                            "color": "#7599b1"
                        }
                    },
                    {
                        "name": "EMA",
                        "type": "EMA",
                        "data": [],
                        "settings": {
                            "color": "#f2b620"
                        }
                    }
                ],
                offchart: [
                    {
                        "name": "SMA",
                        "type": "SMA",
                        "data": [],
                        "settings": {
                            "color": "#7599b1"
                        }
                    },
                    {
                        "name": "EMA",
                        "type": "EMA",
                        "data": [],
                        "settings": {
                            "color": "#f2b620"
                        }
                    }
                ],
            },
            width: $("#chart").width(),
            height: 700,
            colors: {
                colorBack: '#131313',
                colorGrid: '#252423',
                colorText: '#fff',
            },
            toolbar: true,
            titleTxt: 'Welcome',
            font: 'Roboto Regular, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Fira Sans,' +
                ' Droid Sans, Helvetica Neue, sans-serif',
            overlays: function () { return [] },
            methods: {
                onResize() {
                    this.width = $("#chart").width()
                    this.height = 500
                }
            },
            mounted() {
                window.addEventListener('resize', this.onResize)
                setTimeout(() => {
                    // Async data setup
                    this.$set(this, 'chart', Data)
                }, 0)
            },
            beforeDestroy() {
                window.removeEventListener('resize', this.onResize)
            },
        }
    });

    const instrumentOfCrypto = new Vue({
        delimiters: ['${', '}'],
        el: '#instrumentData',
        data: {
            maxPrice24h: 0,
            minPrice24h: 0,
            changePrice24h: 0,
            totalTurnover: 0,
            totalTurnover24h: 0,
            volume24h: 0,
            openInterest: 0,
            openValue: 0,
            fundingRate: 0
        }
    })

    const orderBookOfCrypto = new Vue({
        delimiters: ['${', '}'],
        el: '#ordersBook',
        data: {
            lastPrice: 0,
            tweenedPrice: 0,
            asks: [
                [0, 0]
            ],
            bids: [
                [0, 0]
            ]
        },
        watch: {
            lastPrice: function(price) {
                gsap.to(this.$data, { duration: 0.3, tweenedPrice: price });
            }
        },
        filters: {
            format: function (e) {
                return numeral(parseFloat(e)).format('0,0.00');
            }
        }
    })

    const feedOfCrypto = new Vue({
        delimiters: ['${', '}'],
        el: '#feed',
        data: {
            chunk: 0,
            items: false
        },
        mounted: function () {

            const this_ = this;

            axios({
                method: 'get',
                url: `/api/v1/feed/news`
            }).then(function (response) {
                if (response.status == 200) {
                    this_.items = (response.data.feed.items).splice(0, 3)
                }
            });

        }
    })

    const marketsOfCrypto = new Vue({
        delimiters: ['${', '}'],
        el: '#markets',
        data: {
            markets: false
        },
        filters: {
            cryptofont: function (value) {
                if (!value) return ''
                value = value.toString();
                return `cf cf-${value.toLowerCase()}`;
            }
        },
        mounted: function () {

            const this_ = this;

        }
    })

    const soundPriceChangeOfToolBar = new Vue({
        delimiters: ['${', '}'],
        el: '#toolbar-sound-on-change-price',
        methods: {
            toggle: function (event) {
                let data = barn.get('settings_sound-on-change-price');
                if (!data || data == 'true') {
                    barn.set('settings_sound-on-change-price', 'false');
                    this.turn = false;
                } else {
                    barn.set('settings_sound-on-change-price', 'true');
                    this.turn = true;

                    if (Tone.context.state !== 'running') {
                        Tone.context.resume();
                    }

                    synth.triggerAttackRelease("C6", "8n", Tone.now());
                }
            }
        },
        data: {
            turn: (!barn.get('settings_sound-on-change-price') || barn.get('settings_sound-on-change-price') == 'true')
        }
    })

    const exchangeChangeOfToolBar = new Vue({
        delimiters: ['${', '}'],
        el: '#toolbar-select-chart',
        methods: {
            toggle: function (event) {
                barn.set('chart_exchange', event.target.value);
            }
        },
        data: {
            exchanges: [
                {
                    name: "Deribit",
                    value: 'deribit',
                    pair: 'BTC/USD'
                },
                {
                    name: "ByBit",
                    value: 'bybit',
                    pair: 'BTC/USD'
                },
                {
                    name: "BitMex",
                    value: 'bitmex',
                    pair: 'XBT/USD'
                },
                {
                    name: "Arbitrage",
                    value: 'arb-deribit-bitmex',
                    pair: 'XBT/USD BTC/USD'
                },
            ]
        },
        mounted: function (event) {
            this.$el.value = (barn.get('chart_exchange') ? barn.get('chart_exchange') : 'deribit');
        }
    })

    const capitalOfCrypto = new Vue({
        delimiters: ['${', '}'],
        el: '#capital',
        data: {
            capital: false
        },
        filters: {
            upper: function (e) {
                if (!e) return '';
                return e.toLocaleUpperCase()
            },
            id: function (e) {
                if (!e) return '';
                return `exchange-balance-for-${e}`;
            },
        },
        mounted: function () {

            axios({
                method: 'get',
                url: `/api/v1/exchange/all/balance`
            }).then((response) => {
                if (response.status == 200 || response.status == 304) {
                    console.log(response.data)
                    this.capital = response.data;
                    console.log(this.capital)
                }
            });

        }
    });

    // Listen data channel
    websocket.onopen = function(e) {

        NProgress.done();

        notyf.success({
            message: `WebSocket is connected!`,
            duration: 4000,
            icon: false
        });

        websocket.send(JSON.stringify({
            method: 'connected',
            connect: true
        }));

    };

    websocket.onmessage = function(event) {

        let object = JSON.parse(event.data);

        if (object.response == 'chartData') {

            if (object.exchange == (barn.get('chart_exchange') ? barn.get('chart_exchange') : 'deribit')) {

                switch (object.type) {

                    case 'TRADINGVUE':
                        chart.chart.ohlcv = (object.chart);
                        break;

                    case 'SMA':
                        chart.chart.onchart[0].data = (object.chart)
                        break;

                    case 'EMA':
                        chart.chart.onchart[1].data = (object.chart)
                        break;

                    //
                    // case 'WMA':
                    //     mainChartOfPrice.lines.WMA.setData(object.chart)
                    //     break;
                    //
                    //
                    // case 'BARS':
                    //
                    //     let data = barn.get('settings_sound-on-change-price');
                    //     if (!data || data == 'true') {
                    //
                    //         if (Tone.context.state !== 'running') {
                    //             Tone.context.resume();
                    //         } else {
                    //
                    //             let bar = object.chart.pop();
                    //
                    //             if (mainChartOfPrice.lastClose != bar.close) {
                    //
                    //                 if (bar.close > mainChartOfPrice.lastClose) {
                    //                     synth.triggerAttackRelease("C6", "8n", Tone.now());
                    //                 } else {
                    //                     synth.triggerAttackRelease("A3", "8n", Tone.now());
                    //                 }
                    //
                    //                 mainChartOfPrice.lastClose = bar.close;
                    //             }
                    //
                    //         }
                    //     }
                    //
                    //     mainChartOfPrice.lines.BARS.setData(object.chart);
                    //
                    //     break;
                    //
                    // case 'VOLUME':
                    //     mainChartOfPrice.lines.VOLUME.setData(object.chart)
                    //     break;
                    //
                    // case 'OBV':
                    //     obvChartOfIndicator.lines.OBV.setData(object.chart)
                    //     break;
                    //
                    // case 'BB':
                    //     mainChartOfPrice.lines.BBLower.setData(object.chart.lower)
                    //     mainChartOfPrice.lines.BBMiddle.setData(object.chart.middle)
                    //     mainChartOfPrice.lines.BBUpper.setData(object.chart.upper)
                    //     break;
                    //
                    // case 'RVI':
                    //     rviChartOfIndicator.lines.RVI.setData(object.chart)
                    //     break;
                    //
                    // case 'MACD':
                    //     macdChartOfIndicator.lines.MACD.setData(object.chart.macd)
                    //     macdChartOfIndicator.lines.MACDHistogram.setData(object.chart.histogram)
                    //     macdChartOfIndicator.lines.MACDSignal.setData(object.chart.signal)
                    //     break;
                    //
                    // case 'MVRVZSCOPE':
                    //     mvrvzscrChartOfIndicator.lines.ZScope.setData(object.chart)
                    //     break;
                    //
                    // case 'STOCHASTIC':
                    //     stochasticChartOfIndicator.lines.StochasticD.setData(object.chart.d)
                    //     stochasticChartOfIndicator.lines.StochasticK.setData(object.chart.k)
                    //     break;
                    //
                    // default:
                    //     break

                }

            } else if ((barn.get('chart_exchange') ? barn.get('chart_exchange') : 'deribit') == 'arb-deribit-bitmex' ) {

                // switch (object.type) {
                //
                //     case 'SMA':
                //         mainChartOfPrice.lines.SMA.setData(object.chart)
                //         break;
                //
                //
                //     default:
                //         break
                //
                // }

            }

        } else if (object.response == 'instrumentData') {

            if (object.exchange == (barn.get('chart_exchange') ? barn.get('chart_exchange') : 'deribit')) {
                for (const index in object.instrument) {
                    instrumentOfCrypto[index] = numeral(object.instrument[index]).format('0a');
                }

                orderBookOfCrypto.lastPrice = 'lastPrice' in object.instrument ? object.instrument.lastPrice : 0

            }

        } else if (object.response == 'ordersBookData') {

            if (object.exchange == (barn.get('chart_exchange') ? barn.get('chart_exchange') : 'deribit')) {
                orderBookOfCrypto.asks = object.book.asks;
                orderBookOfCrypto.bids = object.book.bids;
            }

        } else if (object.response == 'markets') {

            if (object.exchange == (barn.get('chart_exchange') ? barn.get('chart_exchange') : 'deribit')) {
                marketsOfCrypto.markets = Object.values(object.markets);
            }
        }

    };

    websocket.onerror = function (e) {

        NProgress.done();

        notyf.error({
            message: `WebSocket Error`,
            duration: 4000,
            icon: false,
            dismissible: true
        });
    }

    websocket.onclose = function (e) {

        NProgress.done();

        notyf.error({
            message: `WebSocket Close Code: ${String(e.code)}`,
            duration: 4000,
            icon: false,
            dismissible: true
        });
    }

});
