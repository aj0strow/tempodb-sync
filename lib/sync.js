var debug = require('debug')('tempodb-sync');
var Spreadsheet = require('google-spreadsheet');
var async = require('async');

var email = process.env.GOOGLE_EMAIL;
var password = process.env.GOOGLE_PASSWORD;

if (! (email && password)) {
  var message = 'environment vars required\n\n'
    + '  export GOOGLE_EMAIL=your-email-here\n'
    + '  export GOOGLE_PASSWORD=your-password-here\n';
  throw { name: 'Sync Error', message: message };
}

function sync (tempodb, namespace, sheetkey, options, cb) {
  debug('namespace "%s" at %s\u2026', namespace, sheetkey.substring(0, 20));
  var sheet = new Spreadsheet(sheetkey);
  async.waterfall([

    function authenticate (cb) {
      sheet.setAuth(email, password, cb); 
    },

    function fetch (_, cb) {
      debug('authenticated as %s', email);
      sheet.getRows(1, cb); 
    },

    function process (rows, cb) {
      rows = rows.map(function (row) {
        clean(row);
        var series = {
          key: row[options.key],
          tags: options.tags.slice(0),
          attributes: {}
        };
        Object.keys(options.attributes).forEach(function (attr) {

          // tempodb rejects blank attributes
          var value = row[options.attributes[attr]];
          if (value === '' || value === null || value === undefined) value = '-';
          series.attributes[attr] = value;
        });
        if (namespace) {
          series.key = namespace + '-' + series.key;
          series.tags.push(namespace);
        }
        return series;
      });
      cb(null, rows);
    },

    function update (rows, cb) {
      async.map(rows, function (series, cb) {
        ensure(tempodb, series, cb);
      }, cb);
    },

    function log (series, cb) {
      debug('synced %d series', series.length);
      cb(null); 
    }

  ], cb);
}

function ensure (tempodb, series, cb) {
  async.waterfall([

    function get (cb) {
      tempodb.get({ key: series.key }, cb);
    },

    function maybeCreate (res, cb) {
      var prev = res.body[0];
      if (prev == undefined) {
        create(tempodb, series, cb);
      } else {
        series.id = prev.id;
        cb(null);
      }
    },

    function update (cb) {
      tempodb.update(series, cb);
    }
  ], cb)
}

function create (tempodb, series, cb) {
  tempodb.create(series.key, function (err, res) {
    if (err) return cb(err);
    debug('created series %s', series.key);
    series.id = res.id;
    cb(null);
  });
}

function clean (row) {
  delete row._links;
  delete row._xml;
  delete row.save;
  delete row.del;
  delete row.title;
  delete row.content;
}

module.exports = function (tempodb, namespaces, options, cb) {
  var keys = Object.keys(namespaces);
  debug('syncing %d spreadsheet%s', keys.length, keys.length == 1 ? '' : 's');
  async.each(Object.keys(namespaces), function (namespace, cb) {
    var sheetkey = namespaces[namespace];
    sync(tempodb, namespace, sheetkey, options, cb);
  }, cb);
};
