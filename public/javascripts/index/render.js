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

    const mainChartOfPrice = new Vue({
        delimiters: ['${', '}'],
        el: '#vue-chart-price',
        data: {
            lastClose: 0,
            chart: false,
            lines: {
                bars: false,
                volume: false,
                SMA: false,
                WMA: false,
                EMA: false,
                BBLower: false,
                BBMiddle: false,
                BBUpper: false,
            }
        },
        mounted: function () {

            this.chart = LightweightCharts.createChart(price_chart, {
                height: 500,
                crosshair: {
                    vertLine: {
                        color: '#7f7f7f',
                        width: 0.5,
                        style: 3,
                        visible: true,
                        labelVisible: true,
                    },
                    horzLine: {
                        color: '#7f7f7f',
                        width: 0.5,
                        style: 3,
                        visible: true,
                        labelVisible: true,
                    },
                    mode: 1,
                },
                grid: {
                    vertLines: {
                        color: '#252423',
                        style: 1,
                        visible: true,
                    },
                    horzLines: {
                        color: '#252423',
                        style: 1,
                        visible: true,
                    },
                },
                watermark: {
                    color: '#323232',
                    visible: true,
                    text: 'BTC/USD',
                    fontSize: 24,
                    horzAlign: 'right',
                    vertAlign: 'top',
                },
                layout: {
                    backgroundColor: '#131313',
                    textColor: '#ffffff',
                    fontSize: 12,
                    fontFamily: 'Roboto Regular, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Fira Sans, Droid Sans, Helvetica Neue, sans-serif',
                },
                handleScroll: {
                    mouseWheel: true,
                    pressedMouseMove: true,
                },
                handleScale: {
                    axisPressedMouseMove: true,
                    mouseWheel: true,
                    pinch: true,
                },
                timeScale: {
                    rightOffset: 12,
                    barSpacing: 3,
                    fixLeftEdge: true,
                    lockVisibleTimeRangeOnResize: true,
                    rightBarStaysOnScroll: true,
                    borderVisible: true,
                    visible: true,
                    timeVisible: true,
                    secondsVisible: true
                },
            });
            this.lines.BARS = this.chart.addCandlestickSeries({
                upColor: '#8BC94D',
                downColor: '#EE4D4D',
                borderVisible: false,
                wickVisible: true,
                borderUpColor: '#8BC94D',
                borderDownColor: '#EE4D4D',
                wickUpColor: '#7DB545',
                wickDownColor: '#D64545',
            })
            this.lines.VOLUME = this.chart.addHistogramSeries({
                color: 'red',
                priceFormat: {
                    type: 'volume',
                },
                priceScaleId: '',
                scaleMargins: {
                    top: 0.8,
                    bottom: 0,
                },
            });
            this.lines.SMA = this.chart.addLineSeries({
                color: '#7599b1',
                lineStyle: 0,
                lineWidth: 1,
                crosshairMarkerVisible: true,
                crosshairMarkerRadius: 6,
                lineType: 4
            });
            this.lines.WMA = this.chart.addLineSeries({
                color: '#5e345e',
                lineStyle: 0,
                lineWidth: 1,
                crosshairMarkerVisible: true,
                crosshairMarkerRadius: 6,
                lineType: 4
            });
            this.lines.EMA = this.chart.addLineSeries({
                color: '#f2b620',
                lineStyle: 0,
                lineWidth: 1,
                crosshairMarkerVisible: true,
                crosshairMarkerRadius: 6,
                lineType: 4
            });
            this.lines.BBLower = this.chart.addLineSeries({
                color: 'rgba(248, 177, 53, 0.3)',
                lineStyle: 0,
                lineWidth: 1,
                crosshairMarkerVisible: true,
                crosshairMarkerRadius: 6,
                lineType: 4
            });
            this.lines.BBMiddle = this.chart.addLineSeries({
                color: 'rgba(248, 177, 53, 0.3)',
                lineStyle: 0,
                lineWidth: 1,
                crosshairMarkerVisible: true,
                crosshairMarkerRadius: 6,
                lineType: 4
            });
            this.lines.BBUpper = this.chart.addLineSeries({
                color: 'rgba(248, 177, 53, 0.3)',
                lineStyle: 0,
                lineWidth: 1,
                crosshairMarkerVisible: true,
                crosshairMarkerRadius: 6,
                lineType: 4
            });

        }
    });

    const rviChartOfIndicator = new Vue({
        delimiters: ['${', '}'],
        el: '#vue-chart-indicator-rvi',
        data: {
            chart: false,
            lines: {
                RVI: false
            }
        },
        mounted: function () {

            this.chart = LightweightCharts.createChart(indicators_chart_rvi, {
                height: 120,
                crosshair: {
                    vertLine: {
                        color: '#7f7f7f',
                        width: 0.5,
                        style: 3,
                        visible: true,
                        labelVisible: true,
                    },
                    horzLine: {
                        color: '#7f7f7f',
                        width: 0.5,
                        style: 3,
                        visible: true,
                        labelVisible: true,
                    },
                    mode: 1,
                },
                grid: {
                    vertLines: {
                        color: '#252423',
                        style: 1,
                        visible: true,
                    },
                    horzLines: {
                        color: '#252423',
                        style: 1,
                        visible: true,
                    },
                },
                layout: {
                    backgroundColor: '#131313',
                    textColor: '#ffffff',
                    fontSize: 12,
                    fontFamily: 'Roboto Regular, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Fira Sans, Droid Sans, Helvetica Neue, sans-serif',
                },
                handleScroll: {
                    mouseWheel: true,
                    pressedMouseMove: true,
                },
                handleScale: {
                    axisPressedMouseMove: true,
                    mouseWheel: true,
                    pinch: true,
                },
                timeScale: {
                    rightOffset: 12,
                    barSpacing: 3,
                    fixLeftEdge: true,
                    lockVisibleTimeRangeOnResize: true,
                    rightBarStaysOnScroll: true,
                    borderVisible: true,
                    visible: true,
                    timeVisible: true,
                    secondsVisible: true
                },
            });
            this.lines.RVI = this.chart.addLineSeries({
                color: '#7599b1',
                lineStyle: 0,
                lineWidth: 1,
                crosshairMarkerVisible: true,
                crosshairMarkerRadius: 6,
                lineType: 4
            });

        }
    });

    const macdChartOfIndicator = new Vue({
        delimiters: ['${', '}'],
        el: '#vue-chart-indicator-macd',
        data: {
            chart: false,
            lines: {
                MACD: false,
                MACDSignal: false,
                MACDHistogram: false
            }
        },
        mounted: function () {

            this.chart = LightweightCharts.createChart(indicators_chart_macd, {
                height: 120,
                crosshair: {
                    vertLine: {
                        color: '#7f7f7f',
                        width: 0.5,
                        style: 3,
                        visible: true,
                        labelVisible: true,
                    },
                    horzLine: {
                        color: '#7f7f7f',
                        width: 0.5,
                        style: 3,
                        visible: true,
                        labelVisible: true,
                    },
                    mode: 1,
                },
                grid: {
                    vertLines: {
                        color: '#252423',
                        style: 1,
                        visible: true,
                    },
                    horzLines: {
                        color: '#252423',
                        style: 1,
                        visible: true,
                    },
                },
                layout: {
                    backgroundColor: '#131313',
                    textColor: '#ffffff',
                    fontSize: 12,
                    fontFamily: 'Roboto Regular, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Fira Sans, Droid Sans, Helvetica Neue, sans-serif',
                },
                handleScroll: {
                    mouseWheel: true,
                    pressedMouseMove: true,
                },
                handleScale: {
                    axisPressedMouseMove: true,
                    mouseWheel: true,
                    pinch: true,
                },
                timeScale: {
                    rightOffset: 12,
                    barSpacing: 3,
                    fixLeftEdge: true,
                    lockVisibleTimeRangeOnResize: true,
                    rightBarStaysOnScroll: true,
                    borderVisible: true,
                    visible: true,
                    timeVisible: true,
                    secondsVisible: true
                },
            });
            this.lines.MACD = this.chart.addLineSeries({
                color: '#7599b1',
                lineStyle: 0,
                lineWidth: 1,
                crosshairMarkerVisible: true,
                crosshairMarkerRadius: 6,
                lineType: 4
            });
            this.lines.MACDSignal = this.chart.addLineSeries({
                color: '#ee4d4d',
                lineStyle: 0,
                lineWidth: 1,
                crosshairMarkerVisible: true,
                crosshairMarkerRadius: 6,
                lineType: 4
            });
            this.lines.MACDHistogram = this.chart.addHistogramSeries({
                base: 0,
                color: '#f89500'
            });

        }
    })

    const obvChartOfIndicator = new Vue({
        delimiters: ['${', '}'],
        el: '#vue-chart-indicator-obv',
        data: {
            chart: false,
            lines: {
                OBV: false
            }
        },
        mounted: function () {

            this.chart = LightweightCharts.createChart(indicators_chart_obv, {
                height: 120,
                crosshair: {
                    vertLine: {
                        color: '#7f7f7f',
                        width: 0.5,
                        style: 3,
                        visible: true,
                        labelVisible: true,
                    },
                    horzLine: {
                        color: '#7f7f7f',
                        width: 0.5,
                        style: 3,
                        visible: true,
                        labelVisible: true,
                    },
                    mode: 1,
                },
                grid: {
                    vertLines: {
                        color: '#252423',
                        style: 1,
                        visible: true,
                    },
                    horzLines: {
                        color: '#252423',
                        style: 1,
                        visible: true,
                    },
                },
                layout: {
                    backgroundColor: '#131313',
                    textColor: '#ffffff',
                    fontSize: 12,
                    fontFamily: 'Roboto Regular, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Fira Sans, Droid Sans, Helvetica Neue, sans-serif',
                },
                handleScroll: {
                    mouseWheel: true,
                    pressedMouseMove: true,
                },
                handleScale: {
                    axisPressedMouseMove: true,
                    mouseWheel: true,
                    pinch: true,
                },
                timeScale: {
                    rightOffset: 12,
                    barSpacing: 3,
                    fixLeftEdge: true,
                    lockVisibleTimeRangeOnResize: true,
                    rightBarStaysOnScroll: true,
                    borderVisible: true,
                    visible: true,
                    timeVisible: true,
                    secondsVisible: true
                },
            });
            this.lines.OBV = this.chart.addLineSeries({
                color: '#1aa758',
                lineStyle: 0,
                lineWidth: 1,
                crosshairMarkerVisible: true,
                crosshairMarkerRadius: 6,
                lineType: 4
            });

        }
    })

    const mvrvzscrChartOfIndicator = new Vue({
        delimiters: ['${', '}'],
        el: '#vue-chart-indicator-mvrvzscr',
        data: {
            chart: false,
            lines: {
                ZScope: false
            }
        },
        mounted: function () {

            this.chart = LightweightCharts.createChart(indicators_chart_mvrvzscr, {
                height: 120,
                crosshair: {
                    vertLine: {
                        color: '#7f7f7f',
                        width: 0.5,
                        style: 3,
                        visible: true,
                        labelVisible: true,
                    },
                    horzLine: {
                        color: '#7f7f7f',
                        width: 0.5,
                        style: 3,
                        visible: true,
                        labelVisible: true,
                    },
                    mode: 1,
                },
                grid: {
                    vertLines: {
                        color: '#252423',
                        style: 1,
                        visible: true,
                    },
                    horzLines: {
                        color: '#252423',
                        style: 1,
                        visible: true,
                    },
                },
                layout: {
                    backgroundColor: '#131313',
                    textColor: '#ffffff',
                    fontSize: 12,
                    fontFamily: 'Roboto Regular, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Fira Sans, Droid Sans, Helvetica Neue, sans-serif',
                },
                handleScroll: {
                    mouseWheel: true,
                    pressedMouseMove: true,
                },
                handleScale: {
                    axisPressedMouseMove: true,
                    mouseWheel: true,
                    pinch: true,
                },
                timeScale: {
                    rightOffset: 12,
                    barSpacing: 3,
                    fixLeftEdge: true,
                    lockVisibleTimeRangeOnResize: true,
                    rightBarStaysOnScroll: true,
                    borderVisible: true,
                    visible: true,
                    timeVisible: true,
                    secondsVisible: true
                },
            });
            this.lines.ZScope = this.chart.addLineSeries({
                color: '#e4df17',
                lineStyle: 0,
                lineWidth: 1,
                crosshairMarkerVisible: true,
                crosshairMarkerRadius: 6,
                lineType: 4
            });

        }
    })

    const stochasticChartOfIndicator = new Vue({
        delimiters: ['${', '}'],
        el: '#vue-chart-indicator-stochastic',
        data: {
            chart: false,
            lines: {
                StochasticD: false,
                StochasticK: false,
            }
        },
        mounted: function () {

            this.chart = LightweightCharts.createChart(indicators_chart_stochastic, {
                height: 120,
                crosshair: {
                    vertLine: {
                        color: '#7f7f7f',
                        width: 0.5,
                        style: 3,
                        visible: true,
                        labelVisible: true,
                    },
                    horzLine: {
                        color: '#7f7f7f',
                        width: 0.5,
                        style: 3,
                        visible: true,
                        labelVisible: true,
                    },
                    mode: 1,
                },
                grid: {
                    vertLines: {
                        color: '#252423',
                        style: 1,
                        visible: true,
                    },
                    horzLines: {
                        color: '#252423',
                        style: 1,
                        visible: true,
                    },
                },
                layout: {
                    backgroundColor: '#131313',
                    textColor: '#ffffff',
                    fontSize: 12,
                    fontFamily: 'Roboto Regular, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Fira Sans, Droid Sans, Helvetica Neue, sans-serif',
                },
                handleScroll: {
                    mouseWheel: true,
                    pressedMouseMove: true,
                },
                handleScale: {
                    axisPressedMouseMove: true,
                    mouseWheel: true,
                    pinch: true,
                },
                timeScale: {
                    rightOffset: 12,
                    barSpacing: 3,
                    fixLeftEdge: true,
                    lockVisibleTimeRangeOnResize: true,
                    rightBarStaysOnScroll: true,
                    borderVisible: true,
                    visible: true,
                    timeVisible: true,
                    secondsVisible: true
                },
            });
            this.lines.StochasticD = this.chart.addLineSeries({
                color: '#1aaf5d',
                lineStyle: 0,
                lineWidth: 1,
                crosshairMarkerVisible: true,
                crosshairMarkerRadius: 6,
                lineType: 4
            });
            this.lines.StochasticK = this.chart.addLineSeries({
                color: '#612626',
                lineStyle: 0,
                lineWidth: 1,
                crosshairMarkerVisible: true,
                crosshairMarkerRadius: 6,
                lineType: 4
            });

        }
    })

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

                    case 'SMA':
                        mainChartOfPrice.lines.SMA.setData(object.chart)
                        break;

                    case 'WMA':
                        mainChartOfPrice.lines.WMA.setData(object.chart)
                        break;

                    case 'EMA':
                        mainChartOfPrice.lines.EMA.setData(object.chart)
                        break;

                    case 'BARS':

                        let data = barn.get('settings_sound-on-change-price');
                        if (!data || data == 'true') {

                            if (Tone.context.state !== 'running') {
                                Tone.context.resume();
                            } else {

                                let bar = object.chart.pop();

                                if (mainChartOfPrice.lastClose != bar.close) {

                                    if (bar.close > mainChartOfPrice.lastClose) {
                                        synth.triggerAttackRelease("C6", "8n", Tone.now());
                                    } else {
                                        synth.triggerAttackRelease("A3", "8n", Tone.now());
                                    }

                                    mainChartOfPrice.lastClose = bar.close;
                                }

                            }
                        }

                        mainChartOfPrice.lines.BARS.setData(object.chart);

                        break;

                    case 'VOLUME':
                        mainChartOfPrice.lines.VOLUME.setData(object.chart)
                        break;

                    case 'OBV':
                        obvChartOfIndicator.lines.OBV.setData(object.chart)
                        break;

                    case 'BB':
                        mainChartOfPrice.lines.BBLower.setData(object.chart.lower)
                        mainChartOfPrice.lines.BBMiddle.setData(object.chart.middle)
                        mainChartOfPrice.lines.BBUpper.setData(object.chart.upper)
                        break;

                    case 'RVI':
                        rviChartOfIndicator.lines.RVI.setData(object.chart)
                        break;

                    case 'MACD':
                        macdChartOfIndicator.lines.MACD.setData(object.chart.macd)
                        macdChartOfIndicator.lines.MACDHistogram.setData(object.chart.histogram)
                        macdChartOfIndicator.lines.MACDSignal.setData(object.chart.signal)
                        break;

                    case 'MVRVZScr':
                        mvrvzscrChartOfIndicator.lines.ZScope.setData(object.chart)
                        break;

                    case 'STOCHASTIC':
                        stochasticChartOfIndicator.lines.StochasticD.setData(object.chart.d)
                        stochasticChartOfIndicator.lines.StochasticK.setData(object.chart.k)
                        break;

                    default:
                        break

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
