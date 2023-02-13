# require-from-es
This module, **require-from-es**, makes *require*, *__dirname* and *__filename* work flawlessly in ES-modules.

## So you finally made the switch to using ES modules in Node.js?
Congratulations!

So you added the following in your **package.json** (or maybe a build tool like Vite added it...):

```json
"type" : "module"
```
and you are ready to start using **import** and **export** everywhere? Those *ARE* good intentions.


## But what about:
* old legacy code (your own and npm modules) that only works with **require**?
* or the convenience of requiring a json-file with **require('x.json')**?
* or being able to read the absolute path of your file with **__filename**?
* or the dir name where your file is at with **__dirname**?

All of this has just gone out the window...

But, fear not, just:

```
npm i require-from-es
```

And then **once**, at the top/start file of your application:

```js
import 'require-from-es';
```

Now you can use **require**, **__filename** and **__dirname** *anywhere* in your application. No need to include something extra in each file.

## More info, less important


### Tested on Mac, Windows and Linux
Since requiring files requires (pun intended) a lot of juggling of file paths and those being slightly different on different OS:es, we've tested **require-from-es** on both Mac, Linux and Windows. 

The result of our tests: It works!

### How? (Only for nerds)
You're a nerd? That's good. (If not stop reading.)

So how did we do it? Well, recreating **require** in ES modules is done by using the function **createRequire** (built in to native Node.js module 'module').

The problem is that **createRequire** demands you to input **import.meta.url** as an argument. That's the same as the path to the file your code is running in. 

And it is different for each file... But we are reading this path from a stack trace (carefully parsed to find the file path of the file calling **require**).

Then we create getters for **require**, **__dirname** and **__filename** in the global namespace (**globalThis**)... among with some other trickery to make **require** work in several steps down the file hierarchy :). 

This means: **require** is created using the correct 'base path' everywhere. And you only have to import **require-from-es** once in your project.
