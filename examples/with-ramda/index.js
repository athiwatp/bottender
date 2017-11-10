const { ConsoleBot, MongoSessionStore } = require('bottender')
const R = require('ramda')

const {
  cond,
  equals,
  always,
  test,
  T,
  toUpper,
  path,
  when,
  append,
  join,
  compose
} = R

const bot = new ConsoleBot()

/* Handler processes user input */
const sayHello = compose(join(''), append('!'), toUpper)

/* Each array of conditional statements can also be extracted 
(or even generated by a higher order function) */
const greetings = [test(/^(Hello|Hi)/i), sayHello]

/*
This is the real meat of the program where you can process
multiple predicate statements stacked as a multidimensional array:
```
[
  [predicate, transformer],
  [predicate, transformer],
  [predicate, transformer],
  etc...
]
```
buildResponse is a function that is returned that expects final arguments
from context.

Refer to  http://ramdajs.com/docs/#cond for explanation
*/
const buildResponse = R.cond([
  greetings,
  [equals('Whatchyu doing?'), always('nothing much, how about you?')],
  [
    T,
    temp => 'So what are you really saying?'
  ] /* this last array contains the default response for your bot */
])

/* This takes user input and composes it with buildResponse */
const respond = compose(buildResponse, path(['event', 'text']))

const sendResponse = () => async context =>
  when(context.event.isText, await context.sendText(respond(context)))

/* client simply sends context to response builder functions */
bot.onEvent(sendResponse())

bot.createRuntime()
