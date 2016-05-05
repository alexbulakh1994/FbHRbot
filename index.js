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
  if (req.query['hub.verify_token'] === 'EAAD6bH65BkQBAGPizWuBi0RANKD4iZBuz09OIg83ZBzGewfLCi7BONMvU7x0637ZB7kYNlGoTTdvXzfdQPhSW03ZAdmiZAgwNSt89ZAZBeZBKWYP5TfWiZBMvVLVLlLElZBvctSTevYiANR1u00POHjZBSdy5MxE1HTAjxq8nZBYTmylPwZDZD') {
    res.send(req.query['hub.challenge']);
  } else {
    res.send('Error, wrong validation token');    
  }
});