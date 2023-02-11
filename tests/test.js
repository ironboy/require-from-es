export default function () {
  console.log('test.js');
  console.log('__filename', __filename);
  console.log('__dirname', __dirname);
  require('./test2');
}