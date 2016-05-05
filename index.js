var cool = require('cool-ascii-faces');
var express = require('express');
var app = express();

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('pages/index')
});

app.get('/cool', function(request, response) {
  response.send(cool());
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

app.get('/webhook', function (req, res) {
  if (req.query['hub.verify_token'] === 'EAAD6bH65BkQBACAjjZBKEqp2gZCvcsHItZBMuOhZCPk9pSkd6ZA2tmA5NsOO8NUKI1tOJXFSHLT6S90I7dBHM3r7G6qQZC2hqxIPCRtpL4Fb6XjcVy91gbnk378ZBfPNwyTpro8iszfCUfsOTTlZCFXrq98aQgZB01ALHEhuYGo6YNAZDZD') {
    res.send(req.query['hub.challenge']);
  } else {
    res.send('Error, wrong validation token');    
  }
});