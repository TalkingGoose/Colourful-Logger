# Colourful-Logger
A colourful logger for all your logging needs

## Usage

This was orignaly created for usage in a Node.js environment, but may work elsewhere.

All methods follow the same syntax and are ['varadic'](https://en.wikipedia.org/wiki/Variadic_function).

The two types of call you can make are the following:

### Just a message

    Logger.info("message");

### Named message

    Logger.info("name", "message");

### Basic example

    var logger = new require('./libs/Logger/')({ 'prefix': 'TestLogger' });
    logger.info('\u2713 I worked!'.green);
    logger.error('Oh no!', 'Something went wrong captain!');

## Available Methods

- .error(...)
- .warning(...)
- .info(...)
- .log(...)
- .debug(...)

## Example Output

*Example image here!*

## Beware...

This logger does add some functions to the string prototype in '/libs/Colours.js'.

These functions allow you to simply call the name of the colour on the string and it'll print with that style.

The colours that are usable are as below;

    String.black
    String.red
    String.green
    String.yellow
    String.blue
    String.magenta
    String.cyan
    String.white
    String.grey/gray

You are also able to change the background of text;

    String.bgBlack
    String.bgRed
    String.bgGreen
    String.bgBlue

There are also a few styles that are available to use;

    String.bold
    String.dim
    String.italic
    String.underline
    String.inverse
    String.hidden
    String.strikethrough

These styles may not work and depend on your terminal implementing them.
