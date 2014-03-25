var sync = require('./lib/sync');

var key = process.env.TEMPO_KEY;
var secret = process.env.TEMPO_SECRET;

if (! (key && secret)) {
  var message = 'environment vars required\n\n'
    + '  export TEMPO_KEY=your-api-key\n'
    + '  export TEMPO_SECRET=your-secret-key\n';
  throw { name: 'Sync Error', message: message };
}

var tempodb = require('tempodb')(key, secret);

module.exports = function (namespaces, options, cb) {
  sync(tempodb, namespaces, options, cb);
};
