'use strict';

const synth = new Tone.Synth({
    oscillator : {
        type: 'sine'
    }
});

var feedbackDelay = new Tone.FeedbackDelay('8n',  0.6);

synth.connect(feedbackDelay);
synth.connect(Tone.Master);
feedbackDelay.connect(Tone.Master);

(async function () {
    await Tone.start();
}) ();

var mainChartOfPrice = new Vue({
    delimiters: ['${', '}'],
    el: '#vue-chart-price',
    data: {
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

        // Listen data channel
        socket.on ('chartData', (data) => {

            let object = JSON.parse(data);

            if (object.exchange == (barn.get('chart_exchange') ? barn.get('chart_exchange') : 'deribit')) {
                switch (object.type) {

                    case 'SMA':
                        this.lines.SMA.setData(object.chart)
                        break;

                    case 'BARS':
                        this.lines.BARS.setData(object.chart)
                        break;

                    case 'VOLUME':
                        this.lines.VOLUME.setData(object.chart)
                        break;

                    case 'BB':
                        this.lines.BBLower.setData(object.chart.lower)
                        this.lines.BBMiddle.setData(object.chart.middle)
                        this.lines.BBUpper.setData(object.chart.upper)
                        break;

                    default:
                        break

                }
            }

        });

    }
});

var rviChartOfIndicator = new Vue({
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

        // Listen data channel
        socket.on ('chartData', (data) => {

            let object = JSON.parse(data);

            if (object.exchange == (barn.get('chart_exchange') ? barn.get('chart_exchange') : 'deribit')) {
                switch (object.type) {

                    case 'RVI':
                        this.lines.RVI.setData(object.chart)
                        break;

                    default:
                        break;

                }
            }

        });

    }
});

var macdChartOfIndicator = new Vue({
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

        // Listen data channel
        socket.on ('chartData', (data) => {

            let object = JSON.parse(data);

            if (object.exchange == (barn.get('chart_exchange') ? barn.get('chart_exchange') : 'deribit')) {
                switch (object.type) {

                    case 'MACD':
                        this.lines.MACD.setData(object.chart.macd)
                        this.lines.MACDHistogram.setData(object.chart.histogram)
                        this.lines.MACDSignal.setData(object.chart.signal)
                        break;

                    default:
                        break;

                }
            }

        });

    }
})

var mvrvzscopeChartOfIndicator = new Vue({
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

        // Listen data channel
        socket.on ('chartData', (data) => {

            let object = JSON.parse(data);

            if (object.exchange == (barn.get('chart_exchange') ? barn.get('chart_exchange') : 'deribit')) {
                switch (object.type) {

                    case 'MVRVZSCOPE':
                        this.lines.ZScope.setData(object.chart)
                        break;

                    default:
                        break;

                }
            }

        });

    }
})

var highPriceOfCrypto = new Vue({
    delimiters: ['${', '}'],
    el: '#priceStat',
    data: {
        high: 0,
        low: 0,
        change: 0,
        volume: 0,
    }
})

var orderBookOfCrypto = new Vue({
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

var feedOfCrypto = new Vue({
    delimiters: ['${', '}'],
    el: '#feed',
    data: {
        chunk: 0,
        items: []
    },
    mounted: function () {

        const this_ = this;

        socket.on('feed', function(msg){

            const feed = JSON.parse(msg);
            if (this_.chunk > feed.length) {this_.chunk = 0;}
            this_.items = feed[this_.chunk + 3] ? [feed[this_.chunk + 1], feed[this_.chunk + 2], feed[this_.chunk + 3]] : [];
            this_.chunk++;

        });

    }
})

var marketsOfCrypto = new Vue({
    delimiters: ['${', '}'],
    el: '#markets',
    data: {
        markets: {
            bybit: [],
            deribit: [],
        }
    },
    filters: {
        cryptofont: function (value) {
            if (!value) return ''
            value = value.toString();
            return `cf cf-${value.toLowerCase()}`;
        }
    }
})

var soundPriceChangeOfToolBar = new Vue({
    delimiters: ['${', '}'],
    el: '#toolbar-sound-on-change-price',
    methods: {
        toggle: function (event) {
            let data = barn.get('settings_sound-on-change-price');
            if (!data || data == 'true') {
                barn.set('settings_sound-on-change-price', 'false')
            } else {
                barn.set('settings_sound-on-change-price', 'true')
            }
        }
    }
})

var exchangeChangeOfToolBar = new Vue({
    delimiters: ['${', '}'],
    el: '#toolbar-select-chart',
    methods: {
        toggle: function (event) {
            barn.set('chart_exchange', event.target.value);
        }
    },
    mounted: function (event) {
        this.$el.value = barn.get('chart_exchange');
    }
})

