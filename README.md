# Event+

Event+ repository

### How to install your program in the terminal?

Use the `Studio Code` in the web version of the terminal or make changes to the `firmware` file in the root folder of the terminal. 

### How to create a trading algorithm

The Event+ trading terminal has an asynchronous architecture, which allows it to process a large amount of data very quickly. But the asynchrony creates a question - how to catch events? To capture events, you need to create a "trap".

```javascript
new trap ({
    name: "Trap",
    filter: function (sender={}, action='default', prop={}) {
        return sender.meta.exchange == 'deribit';
    },
    step: function () {},
    watch: {
        getChartForTradingview: function () {
        },

        SMA:  function () {
        },

        getOrderBook:  function () {
        },

        getPositions:  function () {
        }
    }
});
```

The essence of the trap is simple - it captures all events in the virtual environment and concentrates them in its object.

#### How to filter the data that the trap can receive?
Since there are so many events in the virtual environment, you can create a trap only for some events. To do this, you have a `filter` key in which you must accept the filter function. 

```javascript
filter: function (sender={}, action='default', prop={}) {
    return sender.meta.exchange == 'deribit';
}
```

The `sender` variable contains information about the sender of the event. In the example above, we check whether the data sender exchanger with the name 'deribit'.
To accept the data in the trap, you must return `true` as a response function. If you do not need the data, you must return `false`. To accept all data at all, just return `true` anyway or remove the `filter` key at all.

#### How do I observe the changes in the data trapped?
To observe the data changes, simply create a `watch` key with the object of corresponding keys and functions.

```javascript
watch: {
    getChartForTradingview: function () {
    },

    SMA:  function () {
    }
}
```
In the example above, when changing data in the cell `getChartForTradingview` the corresponding function will be called. 

```javascript
getChartForTradingview: function (chart) {
    var chart; //The variable chart will contain the data of the new chart
}
```
You can specify a variable in a function, then you can get checked hot data directly in the function. 

#### How to track each trap call?
If you have a need to track each trap call rather than update a specific data cell, you can use the `step` key.
```javascript
step: function () {
    // is called at any interaction of the virtual environment with the trap 
}
```

#### How to make debugging?
Enter the folder from terminals and execute the command `npm run visualize`. After that the full virtual machine state dump will be displayed in the console. 
You can also observe a specific virtual environment variable
``` shell script
$ node bin.js --v=true --w=__traps__  
```

or dump data into a file

``` shell script
$ node bin.js --v=true --w=__traps__ --f=dump.json
```
Alternatively, you can write data to a file by specifying the `--file=filename` or `--f=filename` agent. Be careful, the file with data dump can so big the size more than 1TB in 10 minutes of using the terminal

#### How to open positions?
To work with the markets, the Event has a CCXT module for each driver. You can call it on the curly word `$exchange`, where you can replace `exchange` put the exchange trunk. For example, creating an order on deribit will look like this
```javascript
$deribit.createLimitSellOrder('BTC-PERPETUAL', 10, 11000).then(Event => {
    console.log(Event)
}).catch(Event => {
    console.log(Event)
})
```
See the CCXT documentation for all available methods.

##### Authors and collaborators 
Icons made by [iconixar](https://www.flaticon.com/authors/iconixar) from [flaticon](https://www.flaticon.com/)  
Icons made by [surang](https://www.flaticon.com/free-icon/pcb_2399658?term=processor&page=2&position=1) from [flaticon](https://www.flaticon.com/)  
Icons made by [Freepik](https://www.flaticon.com/authors/freepik) from [flaticon](https://www.flaticon.com/)  
Icons made by [Dimitry Miroliubov](https://www.flaticon.com/free-icon/money-bag_639364?term=bank&page=1&position=28) from [flaticon](https://www.flaticon.com/)
