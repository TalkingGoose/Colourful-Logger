'use strict';

// Make sure the colour shortcuts are installed on the string prototypes
require('./libs/Colours');

/** @type TypeOf */
var TypeOf = require('TypeOf');
var util = require('util');
var path = require('path');

var isColourEnabled = !process.browser && process.stdout.isTTY;

/**
 * @constructor Logger
 * @param {Object} options The options for the logger
 * @extends Object
 */
function Logger() {
    if (!(this instanceof Logger)) {
        return new Logger();
    }

    Logger.super_.call(this);

    // By default, only show warnings
    this.level = 2;

    return this;
}

util.inherits(Logger, Object);

Object.defineProperties(Logger.prototype, {
    'LEVEL_SILENT': { 'value': 0 },
    'LEVEL_ERROR': { 'value': 1 },
    'LEVEL_WARNING': { 'value': 2 },
    'LEVEL_INFO': { 'value': 3 },
    'LEVEL_DEBUG': { 'value': 4 },
    'LEVEL_MAX': { 'value': 5 },

    'setLevel': {
        'value': function value(newLevel) {
            var level = newLevel;
            if (TypeOf.isString(newLevel)) {
                level = this['LEVEL_' + newLevel.toUpperCase()];
            }

            if (!TypeOf.isNumber(level) || level < 0 || level > this.LEVEL_MAX) {
                throw Error('Unknown logger level!');
            }

            this.level = level;
        }
    },

    'getLevel': {
        'value': function value() {
            return this.level;
        }
    },

    'trace': {
        'value': function () {
            var regexes = [/at\s+(.*)\s+\((.*):(\d*):(\d*)\)/i, /at\s+()(.*):(\d*):(\d*)/i];

            return function () {
                var stackString = new Error().stack || '';
                var stackLines = stackString.split('\n').slice(4);
                var stackData = regexes[0].exec(stackLines[0]) || regexes[1].exec(stackLines[0]) || {};

                return {
                    'method': stackData[1],
                    'path': stackData[2],
                    'line': stackData[3],
                    'char': stackData[4],
                    'file': path.basename(stackData[2], '.js'),
                    'trace': stackString
                };
            };
        }()
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
        get: function get() {
            var date = new Date();
            return '[' + ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2) + ':' + ('0' + date.getSeconds()).slice(-2) + ']';
        }
    },

    'stringify': {
        'value': function () {
            var options = {
                'depth': null,
                'colors': isColourEnabled
            };

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
            return function (value) {
                if (TypeOf.isString(value)) {
                    return value;
                }

                return util.inspect(value, options);
            };
        }()
    },

    /**
     * Output the given string into a valid tty/console
     *
     * @this Logger
     * @memberof Logger#
     * @alias Logger.output
     * @method Logger#output
     * @param {String} str The string to output
     */
    'output': {
        'value': function () {
            if (process.browser) {
                return function () {
                    for (var _len = arguments.length, strs = Array(_len), _key = 0; _key < _len; _key++) {
                        strs[_key] = arguments[_key];
                    }

                    var length = strs.length;
                    var i = void 0;

                    for (i = 0; i < length; ++i) {
                        console.log(strs[i]);
                    }
                };
            }

            var eol = require('os').EOL;
            if (isColourEnabled) {
                eol += '\u001b[49m\u001b[0m';
            }

            if (!process.stdout.isTTY) {
                return function () {
                    for (var _len2 = arguments.length, strs = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                        strs[_key2] = arguments[_key2];
                    }

                    var length = strs.length;
                    var i = void 0;

                    for (i = 0; i < length; ++i) {
                        process.stdout.write('' + strs[i] + eol);
                    }
                };
            }

            return function () {
                for (var _len3 = arguments.length, strs = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
                    strs[_key3] = arguments[_key3];
                }

                var length = strs.length;
                var i = void 0,
                    str = void 0;

                for (i = 0; i < length; ++i) {
                    str = strs[i];
                    if (str.properLength !== process.stdout.columns) {
                        str += eol;
                    }

                    process.stdout.write(str);
                }
            };
        }()
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
        'value': function value(count) {
            if (this.level <= this.LEVEL_INFO) for (var i = 0; i < count; ++i) {
                this.output('');
            }
        }
    },

    'print': {
        'value': function value(level, prefix) {
            if (level > this.level) {
                return;
            }

            var trace = this.trace();
            var traceString = ('[' + trace.file + ':' + trace.line + ']').grey;

            for (var _len4 = arguments.length, messages = Array(_len4 > 2 ? _len4 - 2 : 0), _key4 = 2; _key4 < _len4; _key4++) {
                messages[_key4 - 2] = arguments[_key4];
            }

            var message = messages.map(this.stringify).join('');

            this.output(this.timestamp.grey + ' ' + traceString + ' ' + prefix + ' ' + message);
        }
    },

    'debug': {
        'value': function value() {
            for (var _len5 = arguments.length, messages = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
                messages[_key5] = arguments[_key5];
            }

            this.print.apply(this, [this.LEVEL_DEBUG, '[d]'.blue].concat(messages));
        }
    },

    'info': {
        'value': function value() {
            for (var _len6 = arguments.length, messages = Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
                messages[_key6] = arguments[_key6];
            }

            this.print.apply(this, [this.LEVEL_INFO, '[i]'.gray].concat(messages));
        }
    },

    'warn': {
        'value': function value() {
            for (var _len7 = arguments.length, messages = Array(_len7), _key7 = 0; _key7 < _len7; _key7++) {
                messages[_key7] = arguments[_key7];
            }

            this.print.apply(this, [this.LEVEL_WARNING, '[w]'.yellow].concat(messages));
        }
    },

    'error': {
        'value': function value() {
            for (var _len8 = arguments.length, messages = Array(_len8), _key8 = 0; _key8 < _len8; _key8++) {
                messages[_key8] = arguments[_key8];
            }

            this.print.apply(this, [this.LEVEL_ERROR, '[!]'.red].concat(messages));
        }
    },

    'fatal': {
        'value': function value() {
            for (var _len9 = arguments.length, messages = Array(_len9), _key9 = 0; _key9 < _len9; _key9++) {
                messages[_key9] = arguments[_key9];
            }

            this.print.apply(this, [this.LEVEL_ERROR, '[x]'.red].concat(messages));
            process.exit(-1);
        }
    },

    'ok': {
        'value': function value() {
            for (var _len10 = arguments.length, messages = Array(_len10), _key10 = 0; _key10 < _len10; _key10++) {
                messages[_key10] = arguments[_key10];
            }

            this.print.apply(this, [this.LEVEL_INFO, '[✓]'.green].concat(messages));
        }
    }
});

module.exports = global.logger = new Logger();
