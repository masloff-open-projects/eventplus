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
       items: []
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