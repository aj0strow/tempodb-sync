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
  "namespace": "spreadsheet-key"
}
```

The spreadsheet key is right from the url on Google Drive.

```
docs.google.com/spreadsheet/ccc?key= <spreadsheet-key> &usp=drive_web#gid=0
```

The next step is to define a mapping because Google messes with your column names, and TempoDB allows both tags and attributes. Suppose a table like so:

| id  | mac address              |
| --- | :----------------------- |
| 01  |                          |
| 02  | 00:12:a2:00:40:a8:2f:8b! |

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

The key should be unique within the namespace. The namespace is automatically prepended to the key with a dash, and added as a tag. 

```javascript
{
  key: 'namespace-01',
  tags: [ 'namespace' ]
}
```

Once you've defined your namespaces / spreadsheets and options, it's time to sync. 

```javascript
var sync = require('tempodb-sync');
sync(namespaces, options, function (err) {
  if (err) throw err;
  console.log('all synced!');
});
```

TempoDB also doesn't allow blank fields, so I set them to `-` which is good for displaying the values in a table on the client. 

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
