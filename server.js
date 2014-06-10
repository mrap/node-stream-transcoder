var express          = require('express')
  , app              = express()
  , bodyParser       = require('body-parser')
  , StreamBodyParser = require('stream-body-parser')
  , streamBodyParser = new StreamBodyParser(app)
  , Transcoder       = require('stream-transcoder')
  , path             = require('path')
  , fs               = require('fs');

app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(bodyParser());

streamBodyParser.process('*/*', function(stream, req, next){
  var filename = req.body.filename;
  if (!filename) return next();

  // For demo, create a file on fs
  var fileStream = fs.createWriteStream(filename);
  var transcoder = new Transcoder(stream)
    .videoCodec('h264')
    .format('mp4')
    .on('finish', function(){
      next();
    })
    .on('error', function(err){
      console.error(err);
      next();
    })
    .stream().pipe(fileStream)
});

app.get('/', function(req, res){
  res.render('index', {});
});

app.post('/', function(req, res){
  res.redirect('/');
});

app.listen(8888);

