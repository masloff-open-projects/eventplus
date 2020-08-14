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
                    fontFamily: 'Calibri',
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
                    fontFamily: 'Calibri',
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
                    fontFamily: 'Calibri',
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

    const mvrvzscopeChartOfIndicator = new Vue({
        delimiters: ['${', '}'],
        el: '#vue-chart-indicator-mvrvzscope',
        data: {
            chart: false,
            lines: {
                ZScope: false
            }
        },
        mounted: function () {

            this.chart = LightweightCharts.createChart(indicators_chart_mvrvzscope, {
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
                    fontFamily: 'Calibri',
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

    const highPriceOfCrypto = new Vue({
        delimiters: ['${', '}'],
        el: '#priceStat',
        data: {
            high: 0,
            low: 0,
            change: 0,
            volume: 0,
        }
    })

    const orderBookOfCrypto = new Vue({
        delimiters: ['${', '}'],
        el: '#ordersBook',
        data: {
            asks: [
                [0, 0]
            ],
            bids: [
                [0, 0]
            ]
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

    // Listen data channel
    websocket.onopen = function(e) {

        NProgress.done();

        notyf.success({
            message: `WebSocket is connected!`,
            duration: 4000,
            icon: false
        });

    };

    websocket.onmessage = function(event) {

        let object = JSON.parse(event.data);

        if (object.response == 'chartData') {

            if (object.exchange == (barn.get('chart_exchange') ? barn.get('chart_exchange') : 'deribit')) {

                switch (object.type) {

                    case 'SMA':
                        mainChartOfPrice.lines.SMA.setData(object.chart)
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

                        mainChartOfPrice.lines.BARS.setData(object.chart)
                        break;

                    case 'VOLUME':
                        mainChartOfPrice.lines.VOLUME.setData(object.chart)
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

                    case 'MVRVZSCOPE':
                        mvrvzscopeChartOfIndicator.lines.ZScope.setData(object.chart)
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