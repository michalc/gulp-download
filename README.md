# gulp-download-stream [![Build Status](https://travis-ci.org/michalc/gulp-download-stream.svg?branch=master)](https://travis-ci.org/michalc/gulp-download-stream) [![Coverage Status](https://coveralls.io/repos/michalc/gulp-download-stream/badge.svg?branch=master&service=github)](https://coveralls.io/github/michalc/gulp-download-stream?branch=master) [![Dependency Status](https://david-dm.org/michalc/gulp-download-stream.svg)](https://david-dm.org/michalc/gulp-download-stream)

[Request](https://github.com/mikeal/request) wrapper for gulp, allowing you to download files via http/https. The files contents are [streamed](streamed) into a stream of [Vinyl](https://github.com/gulpjs/vinyl) files and so download in parallel / concurrently.


## Installation

```
npm install gulp-download-stream --save
```


## Usage

```javascript
var download = require("gulp-download-stream");
```
	
### Download single file

To download a single file, pass a string as the first argument to `download`.
	
```javascript
download("http://domain.com/path/to/file.ext")
  .pipe(gulp.dest("downloads/"));
```


### Download multiple files

To download multiple files, pass an array of strings as the first argument to `download`.

```javascript
download([
  "http://domain.com/path/to/file1.ext",
  "http://domain.com/path/to/file2.ext"
])
  .pipe(gulp.dest("downloads/"));
```

The files are downloaded concurrently into stream of Vinyl files, and so are suitable to be piped into other gulp plugins. Each Vinyl file is also itself a stream, and so any downstream plugins must also support stream-based Vinyl files.


### Specify local file name

You can specify the local file names of files downloaded. You can do this for one file

```javascript
download({
  file: "newFileName.ext",
  url: "http://domain.com/path/to/file.ext"
})
  .pipe(gulp.dest("downloads/"));
```

or for multiple files.

```javascript
download([{
  file: "newFileName1.ext",
  url: "http://domain.com/path/to/file1.ext"
}, {
  file: "newFileName2.ext",
  url: "http://domain.com/path/to/file2.ext"
}])
  .pipe(gulp.dest("downloads/"));
```


### Pass options to request

You can pass options to request as the second argument. For example, you can request using HTTP authentication.

```javascript
download("http://domain.com/path/to/file.ext", {
  "auth": {
    "user": "username",
    "pass": "password",
    "sendImmediately": false
  }
})
  .pipe(gulp.dest("downloads/"));

```


## Error handling

For any file, if node can't connect to the server, or the server returns a status code >= 400, then the Vinyl stream will emit an error and the containing gulp task will fail.

