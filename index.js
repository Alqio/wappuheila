var express = require('express');
var pg = require("pg");
var bodyParser = require('body-parser');
var app = express();
var jsonParser = bodyParser.json();
var validator = require('validator');
var cors = require('cors');
var query = require("pg-query");
var when = require("when"); 
var fs = require("fs");

var correctsignup = ["firstname", "lastname", "email", "phone", "dobday", "dobmonth", "dobyear", "nationality", "guild", "group", "is_new_group"];

query.connectionParameters = process.env.DATABASE_URL;
app.set('port', (process.env.PORT || 5000));

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(__dirname + '/public'));
app.use(cors());

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.listen(app.get('port'), function() {
  console.log('Wappuheila is now running on port', app.get('port'));
});

app.get('/', function(req, res) {
  res.redirect('/fi');
});

app.get('/fi', function(request, response) {
  var lang = JSON.parse(fs.readFileSync('data/lang_fi.json', 'utf8'));
  var t1 = Date.parse("2016-05-01T00:00+02:00");
  var t2 = Date.now();
  var dif = t1 - t2;
  var timeUntil = dif/1000; //milliseconds away
  response.render('pages/index', {lang: lang, timeUntil: timeUntil});
});

app.get('/en', function(request, response) {
  var lang = JSON.parse(fs.readFileSync('data/lang_en.json', 'utf8'));
  var t1 = Date.parse("2015-10-11T16:00+03:00");
  var t2 = Date.now();
  var dif = t1 - t2;
  var timeUntil = dif/1000; //milliseconds away
  response.render('pages/index', {lang: lang, timeUntil: timeUntil});
});

app.post("/registration", jsonParser, function(req, res) {
  printCompareResults(req.body);
});

var answers_meta = JSON.parse(fs.readFileSync('data/lang_fi.json', 'utf8'));

// Compare results by absolute difference in answers
function printCompareResults(req){
  var deferred = when.defer();
  for(var field_name in req){
    if(answers_meta['fields'][field_name] && answers_meta['fields'][field_name]['max']){
      var scale = answers_meta['scaled-max'] / answers_meta['fields'][field_name]['max']
      console.log(field_name + ": " + req[field_name] * scale)
    }
  }
  return deferred.promise;
}
