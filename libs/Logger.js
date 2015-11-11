"use strict";

var Colours = require('./Colours.js');

function Logger(options) {
    if (!(this instanceof Logger)) {
        return new Logger(options);
    }

    this._outputLevel = options.outputLevel || null;

    this.isPrettyPrintEnabled = (
        options.isPrettyPrintEnabled !== undefined ?
        options.isPrettyPrintEnabled : true
    );

    this.prefix = options.prefix || null;
}


Logger.prototype = Object.create(Object.prototype);
Logger.prototype.constructor = Logger;

// Debug level constants
Object.defineProperties(Logger.prototype, {
    LEVEL_NONE:    { value: 0 },
    LEVEL_ERROR:   { value: 1 },
    LEVEL_WARNING: { value: 2 },
    LEVEL_INFO:    { value: 3 },
    LEVEL_DEBUG:   { value: 4 },
    LEVEL_MAX:     { value: 5 }
});

Object.defineProperty(Logger.prototype, 'outputLevel', {
    get: function() {
        return this._outputLevel || this.LEVEL_MAX;
    },

    set: function(value) {
        if (value <= this.LEVEL_MAX) {
            this._outputLevel = value;
        } else {
            this.error('Logger', 'Invalid log level given...');
        }
    }
});

Object.defineProperty(Logger.prototype, 'timestamp', {
    get: function() {
        var date = new Date();
        return `[${('0' + date.getHours()).slice(-2)}:${('0' + date.getMinutes()).slice(-2)}:${('0' + date.getSeconds()).slice(-2)}]`;
    }
});

var colours = {
    'ERROR': {
        'timestamp': 'grey',
        'prefix': 'red',
        'name': 'red',
        'message': 'red'
    },

    'WARNING': {
        'timestamp': 'grey',
        'prefix': 'yellow',
        'name': 'yellow',
        'message': 'white'
    },

    'INFO': {
        'timestamp': 'grey',
        'prefix': 'grey',
        'name': 'grey',
        'message': 'grey'
    },

    'LOG': {
        'timestamp': 'grey',
        'prefix': 'white',
        'name': 'white',
        'message': 'white'
    },

    'DEBUG': {
        'timestamp': 'grey',
        'prefix': 'magenta',
        'name': 'magenta',
        'message': 'magenta'
    }
};

Object.defineProperty(Logger.prototype, 'colours', { value: colours });

for (var id in colours) {
    if (colours.hasOwnProperty(id)) {
        let colour = colours[id];
        Object.defineProperty(Logger.prototype, id.toLowerCase(), {
            value: function() {
                var args = Array.from(arguments);
                if (args.length > 0) {
                    if (this.prefix !== null) {
                        args.unshift(`[${this.prefix}]`[colour.prefix]);
                    }

                    args.unshift(this.timestamp[colour.timestamp]);

                    let offset = (args.length - arguments.length);

                    if (arguments.length > 1) {
                        args[offset] = (args[offset] + ':')[colour.name];
                        args[++offset] = (args.slice(offset).join(', '))[colour.message];

                        args.length = offset + 1;
                    } else {
                        args[offset] = args[offset][colour.message];
                    }

                    console.log(args.join(' '));
                }
            }
        });
    }
}

Logger.prototype.skip = function(count) {
    for (let i = 0; i < count; ++i) {
        console.log('');
    }
};

Logger.prototype.prettyPrint = function(object) {
    if (this.isPrettyPrintEnabled) {
        console.log(this.prettyJSON(JSON.stringify(object, null, 4)));
    }
};

Logger.prototype.prettyJSON = function(json) {
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, match => {
        var colour = 'red';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                colour = 'grey';
            } else {
                colour = 'magenta';
            }
        } else if (/true|false/.test(match)) {
            colour = 'blue';
        } else if (/null/.test(match)) {
            colour = 'yellow';
        }

        return match[colour];
    });
};

Logger.prototype.test = function() {
    var testStr = 'abcdefghijklmnopqrstuvwxyz';

    for (let property in Colours) {
        if (Colours.hasOwnProperty(property)) {
            console.log(property.toString() + ': ' + Colours[property](testStr));
            console.log(property.toString() + ': ' + (testStr.toUpperCase())[property]);
        }
    }
};

module.exports = Logger;
