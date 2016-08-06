'use strict';

var isEnabled = !process.browser && process.stdout.isTTY;

var styles = {};

var codes = {
    reset: [0, 0],

    bold: [1, 22],
    dim: [2, 22],
    italic: [3, 23],
    underline: [4, 24],
    inverse: [7, 27],
    hidden: [8, 28],
    strikethrough: [9, 29],

    black: [30, 39],
    red: [31, 39],
    green: [32, 39],
    yellow: [33, 39],
    blue: [34, 39],
    magenta: [35, 39],
    cyan: [36, 39],
    white: [37, 39],
    gray: [90, 39],
    grey: [90, 39],

    bgBlack: [40, 49],
    bgRed: [41, 49],
    bgGreen: [42, 49],
    bgYellow: [43, 49],
    bgBlue: [44, 49],
    bgMagenta: [45, 49],
    bgCyan: [46, 49],
    bgWhite: [47, 49]
};

var _loop = function _loop(key) {
    if (!codes.hasOwnProperty(key)) {
        return 'continue';
    }

    val = codes[key];

    styles[key] = {
        'open': '\u001b[' + val[0] + 'm',
        'close': '\u001b[' + val[1] + 'm'
    };

    if (String.prototype[key] === undefined) {
        Object.defineProperty(String.prototype, key, {
            get: function () {
                var style = styles[key];

                /**
                 * Returns a colour formatted string
                 *
                 * @param {String} str The string to format with colour
                 * @returns {String}
                 */
                module.exports[key] = function (str) {
                    return isEnabled ? style.open + str + style.close : str;
                };

                /**
                 * @returns {String} The string, surrounded in the required colour markers
                 */
                return function () {
                    return isEnabled ? style.open + this + style.close : this;
                };
            }()
        });
    }
};

for (var key in codes) {
    var val;

    var _ret = _loop(key);

    if (_ret === 'continue') continue;
}

Object.defineProperties(String.prototype, {
    'properLength': {
        /**
         * Returns the length, minus all the escape characters added from colouring,
         * giving you the visable length of the string.
         *
         * @returns {Number}
         */
        'get': function get() {
            if (/\u001b\[[0-9]+m/g.test(this)) {
                return this.replace(/\u001b\[[0-9]+m/g, '').length;
            }

            return this.length;
        }
    }
});
