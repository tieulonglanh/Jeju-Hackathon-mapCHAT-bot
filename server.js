var nodemon = require('nodemon');
var fs = require('fs');
nodemon({
  script: 'app.js',
  stdout: false // important: this tells nodemon not to output to console
}).on('readable', function() { // the `readable` event indicates that data is ready to pick up
    var currentTime = new Date();
    var year = currentTime.getFullYear();
    var month = currentTime.getMonth() + 1;
    var day = currentTime.getDate();
    var hour = currentTime.getHours();
    var currentTimeStr = year + "-" + month + "-" + day + "-" + hour;
    var logFile = 'logs/nodemon-log-' + currentTimeStr + '.txt';
    var errFile = 'logs/nodemon-err-' + currentTimeStr + '.txt';
    var logStream = fs.createWriteStream(logFile, { flags : 'a' });
    var errStream = fs.createWriteStream(errFile, { flags : 'a' });
    this.stdout.pipe(logStream);
    this.stderr.pipe(errStream);
});