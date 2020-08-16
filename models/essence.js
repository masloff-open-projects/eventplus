class essence {

    constructor() {

        this.actions = [];
        this.essence = {};

    }

    on (action = 'default', callback = null) {
        return this.actions.push({
            action: action,
            function: callback
        });
    }

    call (action = 'default', data) {
        for (const callback of this.actions) {
            if ((action === callback.action) || ('*' === callback.action)) {
                try {
                    callback.function(data, action)
                } catch (e) {
                    console.error(e)
                }
            }
        }
    }

    use (essence='default', instance='default', object=Object) {

        if (!(essence in this.essence)) {this.essence[essence] = {} }
        this.essence[essence][instance] = object;

        this.call('setUse', {
            'use': {essence, instance},
            'object': object
        });

    }

    go (essence='default', instance=false, data=Object) {

        if (essence in this.essence) {
            if (instance === false) {
                return this.essence[essence];
            } else {
                if (instance in this.essence[essence]) {
                    try {
                        if (typeof this.essence[essence][instance] === 'function') {
                            return this.essence[essence][instance](data);
                        } else {
                            return this.essence[essence][instance];
                        }
                    } catch (e) {
                        console.error(e)
                    }
                }
            }
        }

    }

}


module.exports = essence;
