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
q_post = q_post.substring(0, q_post.length-2) + ") RETURNING id;";

var q_str = q_pre+q_post;

function saveRegistration(req, answer_id) {
  var deferred = when.defer();
  query("INSERT INTO registrations (name, email, allergies, answer_id, association, profilequote, profilepic) VALUES ($1, $2, $3, $4, $5, $6, $7)",
  //query("INSERT INTO registrations (name, email, allergies, answer_id, association) VALUES ($1, $2, $3, $4, $5)",
    [req.name, req.email, req.allergies, answer_id, req.association, req.profilequote, req.profilepic])
    .then(
      function(rows, res){
        if(req.profilequote) { 
          console.log("New heila!"); 
        }
        console.log("Saved a new registration, name: " + req.name);
        deferred.resolve(true);
      },
      function(err){
        console.log("Error at saveRegistration.");
        console.log(err);
        deferred.reject([500, err]);
      });
  return deferred.promise;
}

function saveAnswer(req, points){
  var deferred = when.defer();
  var str = q_str;
  var q_arr = [];
  for(var field_name in answers_meta.fields){
    // check that the field is found in the input
    var field = !isNaN(points[field_name]) ? points[field_name] : req[field_name];
    if(field === undefined){
      console.log("Invalid data! No " + field_name + " found!");
      return false;
    }
    q_arr.push(field);
  }
  query(q_str, q_arr)
    .then(
      function(rows, result){
        var answer_id = rows[0][0].id;
        console.log("Saved a new answer with id " + answer_id);
        if(req.arvonta){
          when(saveRegistration(req, answer_id))
            .then(
              function(){
                deferred.resolve(answer_id);
              },
              function(err){
                deferred.reject(err);
              }
            );
        }
      },
      function(err){
        console.log(err);
        deferred.resolve([500, "Internal server error"]);
      });
  return deferred.promise;
}

function collectPoints(req) {
  var points = {};
  var scale = 0;
  for(var field_name in answers_meta.fields){
    if(req[field_name]) {
      var field_meta = answers_meta.fields[field_name];
      if(field_meta.type === 'scale'){
        scale = answers_meta['scaled-max'] / field_meta.max;
        points[field_name] = Math.round(Number(req[field_name]) * scale);
      } else if(field_meta.type === 'choice') {
        scale = answers_meta['scaled-max'] / field_meta.choices.length;
        points[field_name] = Math.round(Number(req[field_name]) * scale);
      } else {
        console.log("Text field " + field_name + ": " + req[field_name]);
        // text fields
      }
    } else {
      console.log("Field " + field_name + " missing!");
      return false;
    }
  }
  return points;
}

var allowed_fields = ['profilepic', 'profilequote', 'name'];

function stripInformation(match) {
  var info = {};
  for(var i=0; i < allowed_fields.length; i+=1){
    if(match[allowed_fields[i]]){
      info[allowed_fields[i]] = match[allowed_fields[i]];
    }
  }
  return info;
}

function fetchMatchableAnswers() {
  var deferred = when.defer();
  var registrations = {};
  query("SELECT * FROM answers JOIN registrations ON answers.id = registrations.answer_id AND registrations.profilequote IS NOT null AND registrations.profilepic IS NOT null")
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
exports.calculateClosestMatch = function(regs, points){
  var min_points = 99999;
  var match;
  for(var i=0; i<regs.length; i+=1){
    var reg = regs[i];
    var cur_points = 0;
    for(var field_name in answers_meta.fields){
      if(!isNaN(points[field_name])){
        cur_points += Math.abs(reg[field_name] - points[field_name]);
      }
    }
    if(cur_points < min_points){
      min_points = cur_points;
      match = reg;
    }
  }
  return match;
};

function returnClosestMatch(points) {
  var deferred = when.defer();
  var match = {};
  when(fetchMatchableAnswers())
    .then(
      function(regs){
        var match = exports.calculateClosestMatch(regs, points);
        match = stripInformation(match);
        console.log("Found closest match: " + match.name);
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
  console.log("----");
  console.log("Trying to match!");
  
  var deferred = when.defer();
  var match = {};
  var points = collectPoints(req);
  if(!points) {
    deferred.reject([400, "Invalid input!"]);
    return deferred.promise;
  }
  
  // save answer
  saveAnswer(req, points);
  
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
