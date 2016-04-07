'use strict';

var when = require("when"); 
var query = require("pg-query");
var matching = require("./matching");
query.connectionParameters = process.env.DATABASE_URL;

function fetchAnswers() {
  var deferred = when.defer();
  query("SELECT * FROM answers JOIN registrations ON answers.id = registrations.answer_id")
    .then(
      function(rows){
        deferred.resolve(rows[0]);
      },
      function(err){
        deferred.reject(err);
      }
    );
  return deferred.promise;
}

function separateAnswers(answers) {
  var heilat = [];
  var muut = [];
  for(var i=0;i < answers.length;i += 1){
    var answer = answers[i];
    if(answer.profilepic){
      heilat.push(answer);
    } else {
      muut.push(answer);
    }
  }
  return [heilat, muut];
}

when(fetchAnswers())
  .then(
    function(answers){
      var res = separateAnswers(answers);
      var heilat = res[0]; var muut = res[1];
      for(var i=0; i<muut.length; i+=1){
        var match = matching.calculateClosestMatch(heilat, muut[i]);
        console.log("Pari löydetty: " + match.name + " <3 " + muut[i].name);
      }
    },
    function(err){
      console.log(err);
    }
  );
