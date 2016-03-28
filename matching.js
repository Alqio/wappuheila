
var exports = module.exports = {};
var fs = require("fs");
var answers_meta = JSON.parse(fs.readFileSync('data/lang_fi.json', 'utf8'));
var when = require("when"); 

var q_pre = "INSERT INTO answers (";
var q_post = "VALUES (";
var i = 1;

for(var field_name in answers_meta['fields']) {
  q_pre += field_name + ", ";
  q_post += "$" + i + ", ";
  i += 1;
}

q_pre = q_pre.substring(0, q_pre.length-2) + ") ";
q_post = q_post.substring(0, q_post.length-2) + ");"

var q_str = q_pre+q_post;

exports.saveResults = function(req, res){
  var deferred = when.defer();
  var str = q_str;
  var q_arr = [];
  for(var field_name in answers_meta['fields']){
    // check that the field is found in the input
    if(!req[field_name]){
      console.log("Invalid data! No " + field_name + " found!");
      return false;
    }
    q_arr.push(data[field_name]);
  }
  query(q_str, q_arr).
    then(
      function(rows, result){
        console.log("success!");
      },
      function(err){
        console.log(err);
      });
  return deferred.promise;
}

// Compare results by absolute difference in answers
exports.compareResults = function(req, res){
  var deferred = when.defer();
  for(var field_name in req){
    if(answers_meta['fields'][field_name]) {
      var field_meta = answers_meta['fields'][field_name];
      if(field_meta['type'] == 'scale'){
        var scale = answers_meta['scaled-max'] / field_meta['max'];
        console.log(field_name + ": " + req[field_name] * scale);
      } else if(field_meta['type'] == 'choice') {
        var scale = answers_meta['scaled-max'] / field_meta['choices'].length;
        console.log(field_name + ": " + req[field_name] * scale);
      } else {
        console.log(field_name + ": " + req[field_name]);
      }
    }
  }
  deferred.resolve(true);
  console.log("lol");
  return res.status(200).send();
}
