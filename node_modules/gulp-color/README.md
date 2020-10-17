# gulp-color

[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](https://github.com/standard/standard)

> Color your console.

## Install

Install with [npm](https://npmjs.org/package/gulp-color).

```bash
npm install --save-dev gulp-color
```

## Usage

```js
var gulp = require('gulp');
var color = require('gulp-color');

gulp.task('default', function () {
  console.log(color('Hello World!', 'RED'));
});
```

You can use this following color:

* BLACK
* RED
* GREEN
* YELLOW
* BLUE
* MAGENTA
* CYAN
* WHITE
