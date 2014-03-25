# TempoDB Sync

Sync metadata from Google Spreadsheets to TempoDB. 

### Setup

Syncing depends on access to spreadsheets and tempodb. I put the following in `env.sh` and source it each time I want to test the package anew. 

```bash
export GOOGLE_EMAIL=your-google-email
export GOOGLE_PASSWORD=your-google-password

export TEMPO_KEY=your-api-key
export TEMPO_SECRET=your-api-secret
```

The premise is that each spreadsheet embodies a namespace.

```javascript
var namespaces = {
  "namespace": "google-spreadsheet-key"
}
```

Definitely need a mapping because Google messes with your column names, and TempoDB allows both tags and attributes. Suppose a table like so:

id | mac address
----------------
01 | 
02 | 00:12:a2:00:40:a8:2f:8b!

Google removes spaces and underscores, so the "mac address" column header will be "macaddress". No matter, make sure it gets mapped back to mac_address. 

```javascript
var options = {
  key: 'id',
  tags: [],
  attributes: {
    'id': 'id',
    'mac_address': 'macaddress'
  }
};
```

The key should be unique within the namespace. The namespace is automatically prepended to the key with a dash, and added as a tag. I use namespaces to separate different labs. 

```javascript
var sync = require('tempodb-sync');
sync(namespaces, options, function (err) {
  if (err) throw err;
	console.log('all synced!');
});
```

### Notes

Using my own fork and branch of the tempodb client until it improves, so it's all a bit unstable. Hopefully with their v1 I can start versioning this package too. 

```
$ npm install aj0strow/tempodb-sync
```

The library uses the debug module. To enable, either set `DEBUG=*` or `DEBUG=tempodb-sync`. 

```
  tempodb-sync syncing 1 spreadsheet +0ms
  tempodb-sync namespace "mtl" at 0Ar7CEEnyIlg7dEVDRGx… +1ms
  tempodb-sync authenticated as alexander.ostrow@gmail.com +188ms
  tempodb-sync created series mtl-1003-1  +814ms
  tempodb-sync synced 5 series +396ms
```

License: MIT
