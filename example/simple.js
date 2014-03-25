process.env.DEBUG = 'tempodb-sync';

var sync = require('..');

var namespaces = {
  "mtl": "0Ar7CEEnyIlg7dEVDRGxrODNqWXBjUnM2eGFOQUJfcXc"
};

var options = {
  key: 'id',
  tags: [],
  attributes: {
    'id': 'id',
    'mac_address': 'macaddress',
    'gateway_id': 'gatewayid' 
  }
};

sync(namespaces, options, function (err, res) {
  if (err) throw err;
  console.log('all synced!');
});
