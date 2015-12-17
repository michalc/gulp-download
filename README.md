# gulp-download-stream

[Request](https://github.com/mikeal/request) wrapper for gulp, allowing you to download files via http/https. The files contents are [streamed](streamed) into a stream of [Vinyl](https://github.com/gulpjs/vinyl) files and run concurrently / in parallel.


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

Note that the request is streamed, so the gulp task doesn't wait for the entire download to be completed.


## Download multiple files

To download multiple files, pass an array of strings as the first argument to `download`.

```javascript
download([
  "http://domain.com/path/to/file1.ext",
  "http://domain.com/path/to/file2.ext"
])
  .pipe(gulp.dest("downloads/"));
```

The files are downloaded concurrently, using the usual stream of Vinyl files that gulp uses. Each Vinyl file is also itself a stream, and so any other plugins the files are piped to must also support stream-based Vinyl files.


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
  file: "newFileName.ext",
  url: "http://domain.com/path/to/file.ext"
}, {
  file: "newFileName.ext",
  url: "http://domain.com/path/to/file.ext"
}])
  .pipe(gulp.dest("downloads/"));
```

