var express          = require('express')
  , app              = express()
  , bodyParser       = require('body-parser')
  , StreamBodyParser = require('stream-body-parser')
  , streamBodyParser = new StreamBodyParser(app)
  , Transcoder       = require('stream-transcoder')
  , async            = require('async')
  , path             = require('path')
  , fs               = require('fs');

app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(bodyParser());


var DEFAULT_VIDEO_BITRATE = 2500 * 1000;
var saveMediaStream = function(stream, filename, outputFileType, next, metadata) {
  var completeFilename = path.join(__dirname, filename+'.'+outputFileType);
  var transcoder = new Transcoder(stream)
    .videoCodec('h264')
    .videoBitrate(DEFAULT_VIDEO_BITRATE)
    // .audioCodec('libfaac')
    // .channels(2)
    .sampleRate(44100)
    .minSize(480, 270)
    .maxSize(1280, 720)
    .format(outputFileType)
    .on('finish', function(){
      next();
    })
    .on('error', function(err){
      next(err);
    })
    .writeToFile(completeFilename)
};

var FILE_TYPES = ['mp4', 'flv'];
streamBodyParser.process('video/*', function(stream, req, next){
  var filename = req.body.filename;
  if (!filename) return next();

  console.time('mediaStream')
  async.each(FILE_TYPES, function(fileType, callback){
    saveMediaStream(stream, filename, fileType, callback);
  }, function(err){
    if (err) console.error(err);
    console.timeEnd('mediaStream')
    next(err);
  });
});

app.get('/', function(req, res){
  res.render('index', {});
});

app.post('/', function(req, res){
  res.redirect('/');
});

app.listen(8888);

