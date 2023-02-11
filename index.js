// npm: require-from-es
// ironboy 2023

import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { writeFileSync, readFileSync, rmSync } from 'fs';

// a memory for cjs files
const cjsMemory = {};

// get the filepath / url of the file where code calls us
// (~ recreate the import.meta.url of that file)
function getURL() {
  let { stack } = new Error();
  let file = stack
    .replace(/(<anonymous> )\(/g, '$1(file:///')
    .split('file:///').slice(1).map(
      x => 'file:///' + x.split(/js:\d/)[0] + 'js'
    ).find(x => x !== import.meta.url);
  if (!file) {
    throw new Error('COULD NOT EXTRACT FILE FROM STACK TRACE!\n'
      + stack.split('\n').slice(1).join('\n') + '\n');
  }
  return new URL(file);
}

// create global getters for __filename, __dirname and require
Object.defineProperties(globalThis, {
  ___requireES6_toCommonJS_bridge___: {
    // needed to set __filename, __dirname and require
    // correctly in commonJS modules
    get: () => globalThis
  },
  __filename: {
    get: () => {
      let file = fileURLToPath(getURL());
      file.indexOf('//') === 0 && (file = file.slice(1));
      file = cjsMemory[file] || file;
      file.indexOf('//') === 0 && (file = file.slice(1));
      return file;
    }
  },
  __dirname: {
    get: () => {
      let dir = fileURLToPath(new URL('.', getURL()))
        .replace(/[\\|/]{1,}$/, '');
      dir.indexOf('//') === 0 && (dir = dir.slice(1));
      return dir;
    }
  },
  require: {
    value: x => {
      let _r = createRequire(getURL());
      try {
        return _r(x);
      }
      catch (e) {
        if (e.code !== 'ERR_REQUIRE_ESM') { throw e; }
        // trying to require .js file that 
        // Node.js considers to be an ES module
        // -> temporarily create .cjs file and require
        x = _r.resolve(x);
        let temp = x.replace(/.js$/, '.cjs');
        // inject require, __dirname and __filename
        let v = '___requireES6_toCommonJS_bridge___';
        let content = `require=${v}.require;__dirname=${v}.__dirname;`
          + `__filename=${v}.__filename;` + readFileSync(x, 'utf-8');
        // remember original filename for correct __filename getter
        cjsMemory[temp] = x;
        // make the temp file, require it and delete it
        writeFileSync(temp, content, 'utf-8');
        let error, result;
        try {
          result = _r(temp);
        }
        catch (e) { error = e; }
        rmSync(temp);
        if (error) { throw error; }
        return result;
      }
    }
  }
});

// create getters for the standard properties of require
['resolve', 'main', 'extensions', 'cache'].forEach(prop =>
  Object.defineProperty(globalThis.require, prop, {
    get: () => createRequire(getURL())[prop]
  })
);