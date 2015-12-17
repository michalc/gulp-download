#gulp-download-stream

[Request](https://github.com/mikeal/request) wrapper for gulp, allowing you to download files via http/https. The downloads are [streamed](streamed) and run concurrently.

#Installation

	npm install gulp-download-stream
	
#Usage

	var download = require("gulp-download-stream");
	
	download(url)
		.pipe(gulp.dest("downloads/"));
		
Url: Either a url string or an array of url strings or object with keys: file, url or array of these objects. The file key allows you to define the destination file name and the url is the dowonload url.

