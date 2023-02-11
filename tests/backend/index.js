// get require to work in ES6 module
import '../../index.js';

import test from '../test.js';

console.log('__filename', __filename)
console.log('__dirname', __dirname);

let old = require('./old');
old();

test();

// get settings from settings.json
const { port, sqlUser, sqlPassword } = require('./settings.json');

console.log(port);