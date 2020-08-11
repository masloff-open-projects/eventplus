var barn = new Barn(localStorage);

class addons {

    chunkArray(arr, chunk) {
        var i, j, tmp = [];
        for (i = 0, j = arr.length; i < j; i += chunk) {
            tmp.push(arr.slice(i, i + chunk));
        }
        return tmp;
    }

}

function boot_chart () {


    /**
     * Find chart
     */

    if ($('#price_chart').length) {


        /**
         * Create a regular chart to display prices from the stock exchanges.
         */

        window.priceChart = LightweightCharts.createChart(price_chart, {
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


        /**
         * Create a parent chart for indicators readings
         */

        window.indicatorsChartRVI = LightweightCharts.createChart(indicators_chart_rvi, {
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
        window.indicatorsChartMACD = LightweightCharts.createChart(indicators_chart_macd, {
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
        window.indicatorsChartZScope = LightweightCharts.createChart(indicators_chart_zscope, {
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


        /**
         * Lineage creation
         */

        window.barSeries_chart = priceChart.addCandlestickSeries({
            upColor: '#8BC94D',
            downColor: '#EE4D4D',
            borderVisible: false,
            wickVisible: true,
            borderUpColor: '#8BC94D',
            borderDownColor: '#EE4D4D',
            wickUpColor: '#7DB545',
            wickDownColor: '#D64545',
        });
        window.volumeSeries = priceChart.addHistogramSeries({
            priceFormat: {
                type: 'volume',
            },
            priceScaleId: '',
            scaleMargins: {
                top: 0.8,
                bottom: 0,
            },
        });
        window.SMA_chart = priceChart.addLineSeries({
            color: '#7599b1',
            lineStyle: 0,
            lineWidth: 1,
            crosshairMarkerVisible: true,
            crosshairMarkerRadius: 6,
            lineType: 4
        });
        window.BB_lower_chart = priceChart.addLineSeries({
            color: 'rgba(248, 177, 53, 0.3)',
            lineStyle: 0,
            lineWidth: 1,
            crosshairMarkerVisible: true,
            crosshairMarkerRadius: 6,
            lineType: 4
        });
        window.BB_middle_chart = priceChart.addLineSeries({
            color: 'rgba(248, 177, 53, 0.3)',
            lineStyle: 0,
            lineWidth: 1,
            crosshairMarkerVisible: true,
            crosshairMarkerRadius: 6,
            lineType: 4
        });
        window.BB_upper_chart = priceChart.addLineSeries({
            color: 'rgba(248, 177, 53, 0.3)',
            lineStyle: 0,
            lineWidth: 1,
            crosshairMarkerVisible: true,
            crosshairMarkerRadius: 6,
            lineType: 4
        });
        window.RVI_chart = indicatorsChartRVI.addLineSeries({
            color: '#7599b1',
            lineStyle: 0,
            lineWidth: 1,
            crosshairMarkerVisible: true,
            crosshairMarkerRadius: 6,
            lineType: 4
        });
        window.MACD_chart = indicatorsChartMACD.addLineSeries({
            color: '#7599b1',
            lineStyle: 0,
            lineWidth: 1,
            crosshairMarkerVisible: true,
            crosshairMarkerRadius: 6,
            lineType: 4
        });
        window.MACD_signal_chart = indicatorsChartMACD.addLineSeries({
            color: '#ee4d4d',
            lineStyle: 0,
            lineWidth: 1,
            crosshairMarkerVisible: true,
            crosshairMarkerRadius: 6,
            lineType: 4
        });
        window.MACD_histogram = indicatorsChartMACD.addHistogramSeries({
            base: 0,
            color: '#f89500'
        });
        window.MVRVZScope_chart = indicatorsChartZScope.addLineSeries({
            color: '#e4df17',
            lineStyle: 0,
            lineWidth: 1,
            crosshairMarkerVisible: true,
            crosshairMarkerRadius: 6,
            lineType: 4
        });

    }


}

function init_chart () {

    /**
     * Find chart
     */

    if ($('#price_chart').length && $('#indicators_chart_rvi').length) {

        let chart_exchange = barn.get('chart_exchange') ? barn.get('chart_exchange') : 'deribit';

        const socket = io();

        socket.on('connect', () => {
            socket.emit('bybitMarkets');
            socket.emit('deribitMarkets');
        });

        socket.on('deribitMarkets', function(msg){

            var i = 0;
            var objproto = {};

            for (const [key, value] of Object.entries(Object.freeze(JSON.parse(msg)))) {
               i++;
               if (i > 100) { break; }
               objproto[key] = value;
            }

            marketsOfCrypto.markets.deribit = objproto;

        });

        socket.on('bybitMarkets', function(msg){
            marketsOfCrypto.markets.bybit = Object.freeze(JSON.parse(msg));
        });

        window.feedchunk = 0;

        socket.on('feed', function(msg){

            var chunks = new addons().chunkArray(JSON.parse(msg), 3);

            if (chunks[window.feedchunk]) {
                feedOfCrypto.items = chunks[window.feedchunk];
                window.feedchunk++;
            } else {
                feedOfCrypto.items = chunks[0];
                window.feedchunk=0;
            }

        });

        if (chart_exchange == 'deribit') {

            socket.on('deribitChartPrice', function(msg){
                window.barSeries_chart.setData(JSON.parse(msg))
            });

            socket.on('deribitChartVOLUME', function(msg){
                window.volumeSeries.setData(JSON.parse(msg))
            });

            socket.on('deribitChartPriceSMA', function(msg){
                window.SMA_chart.setData(JSON.parse(msg))
            });

            socket.on('deribitChartPriceRVI', function(msg){
                window.RVI_chart.setData(JSON.parse(msg))
            });

            socket.on('deribitChartPriceBB', function(msg){
                window.BB_lower_chart.setData(JSON.parse(msg).lower)
                window.BB_middle_chart.setData(JSON.parse(msg).middle)
                window.BB_upper_chart.setData(JSON.parse(msg).upper)
            });

            socket.on('deribitChartPriceMACD', function(msg){
                window.MACD_chart.setData(JSON.parse(msg).macd)
                window.MACD_signal_chart.setData(JSON.parse(msg).signal)
                window.MACD_histogram.setData(JSON.parse(msg).histogram)
            });

            socket.on('deribitChartPriceMVRVZSCOPE', function(msg){
                window.MVRVZScope_chart.setData(JSON.parse(msg))
            });

            socket.on('deribitExchangeState', function(msg){

                let stats = JSON.parse(msg).stats;
                let asks = JSON.parse(msg).asks;
                let bids = JSON.parse(msg).bids;

                highPriceOfCrypto.high = stats.high;
                highPriceOfCrypto.low = stats.low;
                highPriceOfCrypto.change = stats.price_change;
                highPriceOfCrypto.volume = Math.round(stats.volume);

                orderBookOfCrypto.asks = asks;
                orderBookOfCrypto.bids = bids;

            });


        } else if (chart_exchange == 'bybit') {

            socket.on('bybitChartPrice', function(msg){
                window.barSeries_chart.setData(JSON.parse(msg))
            });

            socket.on('bybitChartPriceSMA', function(msg){
                window.SMA_chart.setData(JSON.parse(msg))
            });

            socket.on('bybitChartPriceRVI', function(msg){
                window.RVI_chart.setData(JSON.parse(msg))
            });

            socket.on('bybitChartPriceBB', function(msg){
                window.BB_lower_chart.setData(JSON.parse(msg).lower)
                window.BB_middle_chart.setData(JSON.parse(msg).middle)
                window.BB_upper_chart.setData(JSON.parse(msg).upper)
            });

            socket.on('bybitChartPriceMACD', function(msg){
                window.MACD_chart.setData(JSON.parse(msg).macd)
                window.MACD_signal_chart.setData(JSON.parse(msg).signal)
                window.MACD_histogram.setData(JSON.parse(msg).histogram)
            });

            socket.on('bybitExchangeState', function(msg){

                let stats = JSON.parse(msg);

                highPriceOfCrypto.high = stats.high_price_24h_e4 / 10000;
                highPriceOfCrypto.low = stats.low_price_24h_e4 / 10000;
                highPriceOfCrypto.change = stats.price_1h_pcnt_e6 / 10000;
                highPriceOfCrypto.volume = Math.round(stats.volume_24h) / 10000;

            });

        }
    }
}

$(document).ready(function () {

    boot_chart ();
    init_chart ();

    $("#select-chart").val(barn.get('chart_exchange'));

    $("#select-chart").change(function(e) {
        barn.set('chart_exchange', $('#select-chart').val());
        location.reload();
    });

});


