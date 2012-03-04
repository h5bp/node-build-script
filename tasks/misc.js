
var path = require('path'),
  minimatch = require('minimatch'),
  rimraf = require("rimraf"),
  win32 = process.platform === 'win32',
  fs = require('fs'),
  util = require('util'),
  crlf = win32 ? '\r\n' : '\n',
  copyFileSync;

copyFileSync = function(srcFile, destFile) {
  var BUF_LENGTH, buff, bytesRead, fdr, fdw, pos;
  BUF_LENGTH = 64 * 1024;
  buff = new Buffer(BUF_LENGTH);
  fdr = fs.openSync(srcFile, 'r');
  fdw = fs.openSync(destFile, 'w');
  bytesRead = 1;
  pos = 0;
  while (bytesRead > 0) {
    bytesRead = fs.readSync(fdr, buff, 0, BUF_LENGTH, pos);
    fs.writeSync(fdw, buff, 0, bytesRead);
    pos += bytesRead;
  }
  fs.closeSync(fdr);
  return fs.closeSync(fdw);
};

//
// ### Tasks
//

task.registerTask('intro', 'Kindly inform the developer about the impending magic', function(data, name) {

  var output = [
    "=====================================================================",
    "",
    "We're going to get your site all ship-shape and ready for prime time.",
    "",
    "This should take somewhere between 15 seconds and a few minutes,",
    "mostly depending on how many images we're going to compress.",
    "",
    "Feel free to come back or stay here and follow along.",
    "",
    "====================================================================="
  ].join(crlf);

});


task.registerBasicTask('mkdirs', 'Prepares the build dirs', function(data, name) {
  var dirname = path.resolve(config(name));
  file.mkdir(dirname);

  var files = file.expand(['**']).filter(function(f) {
    // filter out files to exclude from `<config:mkdirs:target>`
    return data.reduce(function(a, b) {
      return a && !minimatch(f, b);
    }, true);
  });

  files.forEach(function(src){
    var dst, is, os;
    // only relevant on windows platform, where glob-whatev seems to also return
    // dirs, with a trailing `/`
    dst = path.resolve(dirname, src);
    if(src.charAt(src.length - 1) === '/') return file.mkdir(dst);
    //http://procbits.com/2011/11/15/synchronous-file-copy-in-node-js/
    copyFileSync(src, dst);
  });


  // temporary posix fix on empty dirs that we know we want created
  // to avoid a ENOTFOUND error in file.expand of rev:img
  if(!win32) {
    file.mkdir(path.resolve(dirname, 'img'));
  }

  log.writeln('Copy done for ' + dirname);
});

task.registerTask('clean', 'Wipe the previous build dirs', function() {
  var dirs = [config('staging'), config('output')];
  dirs.forEach(task._helpers.clean);
});


task.registerBasicTask('manifest', 'Generates manifest files automatically from static assets reference.', function(data, name) {
  // Otherwise, print a success message.
  log.writeln('not yet implemented');
});


//
// ### Helpers
//

task.registerHelper('clean', function(dir, cb) {
  if(typeof cb !== 'function') return rimraf.sync(dir);
  rimraf(dir, cb);
});
