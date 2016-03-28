'use strict'; /*jshint -W089 */

var exports = module.exports = {};
var fs = require("fs");
var answers_meta = JSON.parse(fs.readFileSync('data/lang_fi.json', 'utf8'));
var when = require("when"); 
var query = require("pg-query");

var q_pre = "INSERT INTO answers (";
var q_post = "VALUES (";
var i = 1;

for(var field_name in answers_meta.fields) {
  if(answers_meta.fields.hasOwnProperty(field_name)){
    q_pre += field_name + ", ";
    q_post += "$" + i + ", ";
    i += 1;
  }
}

q_pre = q_pre.substring(0, q_pre.length-2) + ") ";
q_post = q_post.substring(0, q_post.length-2) + ");";

var q_str = q_pre+q_post;

exports.saveResults = function(req, res){
  var deferred = when.defer();
  var str = q_str;
  var q_arr = [];
  for(var field_name in answers_meta.fields){
    // check that the field is found in the input
    if(!req[field_name]){
      console.log("Invalid data! No " + field_name + " found!");
      return false;
    }
    q_arr.push(req[field_name]);
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
};

function collectPoints(req) {
  var points = {};
  var scale = 0;
  for(var field_name in answers_meta.fields){
    if(req[field_name]) {
      var field_meta = answers_meta.fields[field_name];
      if(field_meta.type === 'scale'){
        scale = answers_meta['scaled-max'] / field_meta.max;
        points[field_name] = req[field_name] * scale;
      } else if(field_meta.type === 'choice') {
        points[field_name] = Number(req[field_name]);
      } else {
        console.log(field_name + ": " + req[field_name]);
      }
    } else {
      return false;
    }
  }
  return points;
}

function fetchMatchableAnswers() {
  var deferred = when.defer();
  var registrations = {};
  query("SELECT * FROM answers JOIN registrations ON answers.id = registrations.answer_id")
    .then(
      function(rows, res){
        registrations = rows[0];
        deferred.resolve(registrations);
      },
      function(err){
        console.log("Couldn't fetch matchable answers! Error: " + err);
        deferred.reject(['500', 'Internal server error']);
      }
    );
  return deferred.promise;
}

// there's a double loop here, could optimize by moving this to point calculating phase
function calculateClosestMatch(regs, points){
  var min_points = 99999;
  var match;
  for(var i=0; i<regs.length; i+=1){
    var reg = regs[i];
    var cur_points = 0;
    for(var field_name in answers_meta.fields){
      if(points[field_name]){
        cur_points += Math.abs(reg[field_name] - points[field_name]);
        reg[field_name] = undefined;
      }
    }
    if(cur_points < min_points){
      min_points = cur_points;
      match = reg;
    }
  }
  return match;
}

function returnClosestMatch(points) {
  var deferred = when.defer();
  var match = {};
  when(fetchMatchableAnswers())
    .then(
      function(regs){
        var match = calculateClosestMatch(regs, points);
        deferred.resolve(match);
      },
      function(err){
        console.log("Error at returnClosestMatch!");
        deferred.reject(err);
      }
    );
  return deferred.promise;
}

// Compare results by absolute difference in answers
exports.compareResults = function(req, res){
  var deferred = when.defer();
  var match = {};
  var points = collectPoints(req);
  if(!points) {
    deferred.reject([400, "Invalid input!"]);
    return deferred.promise;
  }
  
  when(returnClosestMatch(points))
    .then(
      function(match){
        deferred.resolve(match);
      },
      function(err){
        deferred.reject(err);
      }
    );
  
  return deferred.promise;
};
