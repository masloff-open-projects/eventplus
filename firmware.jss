#!/usr/bin/env node

new trap ({
    filter: function (sender={}, action='default', prop={}) {
        return true;
        // return sender.meta.exchange == 'deribit';
    },
    step: function () {
        console.log()
    },
    watch: {
        getChartForTradingview: function () {
            this.____ = 1;
        }
    }
})