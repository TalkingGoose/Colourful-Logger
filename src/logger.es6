/**
 * Created by paul.watkinson on 12/08/2015.
 */

'use strict';

const Colours = require('colours');
const TypeOf = require('typeof');

const assert = require('assert');
const util = require('util');
const path = require('path');

/**
 * @constructor Logger
 * @extends Object
 */
function Logger() {
    if (!(this instanceof Logger)) {
        return new Logger();
    }

    Logger.super_.call(this);

    // By default, only show warnings
    this.level = 2;

    this.setStream(process.stdout);

    return this;
}

util.inherits(Logger, Object);

Object.defineProperties(Logger.prototype, {
    'LEVEL_SILENT':  { 'value': 0 },
    'LEVEL_ERROR':   { 'value': 1 },
    'LEVEL_WARNING': { 'value': 2 },
    'LEVEL_INFO':    { 'value': 3 },
    'LEVEL_DEBUG':   { 'value': 4 },
    'LEVEL_MAX':     { 'value': 5 },

    'setLevel': {
        'value': function(newLevel) {
            let level = newLevel;

            if (TypeOf.isString(level)) {
                level = this['LEVEL_' + newLevel.toUpperCase()];
            }

            assert(TypeOf.isNumber(level) && level >= 0 && level <= this.LEVEL_MAX, 'Unknown logger level!');

            this.level = level;
        }
    },

    /**
     * Gets the current logging level
     *
     * @this Logger
     * @memberof Logger#
     * @alias Logger.getLevel
     * @method Logger#getLevel
     */
    'getLevel': {
        'value': function() {
            return this.level;
        }
    },

    /**
     * Turns anything that isn't a string into one using 'util.inspect'
     *
     * @this Logger
     * @memberof Logger#
     * @alias Logger.setStream
     * @method Logger#setStream
     * @param {Stream} stream The stream to write to
     */
    'setStream': {
        'value': function(stream) {
            this.stream = stream;

            if (process.browser) {
                return (this.output = this.outputBrowser);
            }

            if (Colours.isValid(this.stream)) {
                Colours.enable();
                return (this.output = this.outputColour);
            }

            Colours.disable();
            this.output = this.outputPlaintext;
        }
    },

    'trace': {
        'value': (function() {
            const regexes = [
                /at\s+(.*)\s+\((.*):(\d*):(\d*)\)/i,
                /at\s+()(.*):(\d*):(\d*)/i
            ];

            /**
             * Generates trace data
             *
             * @this Logger
             * @memberof Logger#
             * @alias Logger.trace
             * @method Logger#trace
             * @param {Number} depth How far into the trace stack to obtain data
             * @returns {Object} The trace data
             */
            return function(depth) {
                let string = (new Error()).stack || '';
                let lines = string.split('\n').slice(depth || 4);
                let data = (regexes[0].exec(lines[0]) || regexes[1].exec(lines[0])) || {};

                return {
                    'method': data[1],
                    'path': data[2],
                    'line': data[3],
                    'char': data[4],
                    'file': path.basename(data[2], '.js'),
                    'trace': string
                };
            };
        }())
    },

    /**
     * Gets the current time formatted as a timestamp
     *
     * @this Logger
     * @memberof Logger#
     * @alias Logger.timestamp
     * @property {String} Logger.timestamp
     * @readonly
     */
    'timestamp': {
        /**
         * @this Logger
         * @memberof Logger#
         * @alias Logger.timestamp
         * @method Logger.timestamp#get
         * @returns {String}
         */
        'get': function() {
            return `[${(new Date()).toTimeString().split(/[\s]+/)[0]}]`;
        }
    },

    'stringify': {
        'value': (() => {
            /**
             * Turns anything that isn't a string into one using 'util.inspect'
             *
             * @this Logger
             * @memberof Logger#
             * @alias Logger.stringify
             * @method Logger#stringify
             * @param {*} value The object to stringify
             * @returns {String} The object stringified
             */
            return function(value) {
                if (TypeOf.isString(value)) {
                    return value;
                }

                return util.inspect(value, {
                    'depth': null,
                    'colors': Colours.isValid(this.stream)
                });
            };
        })()
    },

    /**
     * Output the given string into the browser console
     *
     * @this Logger
     * @memberof Logger#
     * @alias Logger.outputBrowser
     * @method Logger#outputBrowser
     * @param {String} ...strings The strings to output
     */
    'outputBrowser': {
        'value': function(...strings) {
            const length = strings.length;
            let i;

            for (i = 0; i < length; ++i) {
                console.log(strings[i]);
            }
        }
    },

    /**
     * Output the given string into a valid tty/console (in plaintext)
     *
     * @this Logger
     * @memberof Logger#
     * @alias Logger.output
     * @method Logger#output
     * @param {String} ...strings The strings to output
     */
    'outputPlaintext': {
        'value': (function() {
            const EOL = require('os').EOL;
            return function(...strings) {
                const length = strings.length;
                let i;

                for (i = 0; i < length; ++i) {
                    this.stream.write(`${strings[i]}${EOL}`);
                }
            };
        }())
    },

    /**
     * Output the given string into a valid stream (in colour)
     *
     * @this Logger
     * @memberof Logger#
     * @alias Logger.output
     * @method Logger#output
     * @param {String} ...strings The strings to output
     */
    'outputColour': {
        'value': (function() {
            const EOL = require('os').EOL + '\u001b[49m\u001b[0m';
            return function(...strings) {
                const length = strings.length;
                let i, str;
                for (i = 0; i < length; ++i) {
                    str = strings[i];

                    this.stream.write(str);

                    if (str.visibleLength !== process.stdout.columns) {
                        this.stream.write(EOL);
                    }
                }
            };
        })()
    },

    'skip': {
        /**
         * Skip a number of lines in the output
         *
         * @this Logger
         * @memberof Logger#
         * @alias Logger.skip
         * @method Logger#skip
         * @param {Number} count The amount of lines to skip
         */
        'value': function(count) {
            if (this.level <= this.LEVEL_INFO) {
                return;
            }

            for (let i = 0; i < count; ++i) {
                this.output('');
            }
        }
    },

    'print': {
        'value': function(level, prefix, ...messages) {
            if (level > this.level) {
                return;
            }

            let trace = this.trace();
            let traceString = `[${trace.file}:${trace.line}]`.grey;
            let message = messages.map(this.stringify).join('');

            this.output(`${this.timestamp.grey} ${traceString} ${prefix} ${message}`);
        }
    },

    'debug': {
        'value': function(...messages) {
            this.print(this.LEVEL_DEBUG, '[d]'.blue, ...messages);
        }
    },

    'info': {
        'value': function(...messages) {
            this.print(this.LEVEL_INFO, '[i]'.grey, ...messages);
        }
    },

    'warn': {
        'value': function(...messages) {
            this.print(this.LEVEL_WARNING, '[w]'.yellow, ...messages);
        }
    },

    'error': {
        'value': function(...messages) {
            this.print(this.LEVEL_ERROR, '[!]'.red, ...messages);
        }
    },

    'fatal': {
        'value': function(...messages) {
            this.print(this.LEVEL_ERROR, `[x]`.red, ...messages);
            process.exit(-1);
        }
    },

    'ok': {
        'value': function(...messages) {
            this.print(this.LEVEL_INFO, `[\u2713]`.green, ...messages);
        }
    }
});

module.exports = global.logger = new Logger();
