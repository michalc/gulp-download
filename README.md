# gulp-download-stream

[Request](https://github.com/mikeal/request) wrapper for gulp, allowing you to download files via http/https. The files contents are [streamed](streamed) into a stream of [Vinyl](https://github.com/gulpjs/vinyl) files and so download in parallel / concurrently.


## Installation

```
npm install gulp-download-stream --save
```


## Usage

```javascript
var download = require("gulp-download-stream");
```

	
## Download single file

To download a single file, pass a string as the first argument to `download`.
	
```javascript
download("http://domain.com/path/to/file.ext")
  .pipe(gulp.dest("downloads/"));
```


## Download multiple files

To download multiple files, pass an array of strings as the first argument to `download`.

```javascript
download([
  "http://domain.com/path/to/file1.ext",
  "http://domain.com/path/to/file2.ext"
])
  .pipe(gulp.dest("downloads/"));
```

The files are downloaded concurrently into stream of Vinyl files, and so are suitable to be piped into other gulp plugins. Each Vinyl file is also itself a stream, and so any downstream plugins must also support stream-based Vinyl files.


## Specify local file name

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
://github.com/gulpjs/vinyl
