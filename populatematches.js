'use strict';

var when = require("when");
var query = require("pg-query");
var matching = require("./matching");
query.connectionParameters = process.env.DATABASE_URL;

function fetchAnswers() {
    var deferred = when.defer();
    query("SELECT * FROM answers JOIN registrations ON answers.id = registrations.answer_id")
        .then(
            function (rows) {
                deferred.resolve(rows[0]);
            },
            function (err) {
                deferred.reject(err);
            }
        );
    return deferred.promise;
}

function separateAnswers(answers) {
    var heilat = [];
    var muut = [];
    for (var i = 0; i < answers.length; i += 1) {
        var answer = answers[i];
        if (answer.profilepic) {
            heilat.push(answer);
        } else {
            muut.push(answer);
        }
    }
    return [heilat, muut];
}

exports.fetchMatches = function () {
    when(fetchAnswers())
        .then(
            function (answers) {
                var res = separateAnswers(answers);
                var heilat = res[0];
                var muut = res[1];
                var matches = [];
                for (var i = 0; i < muut.length; i += 1) {
                    var match = matching.calculateClosestMatch(heilat, muut[i]);
                    matches += {'heila': match.name, 'muu': muut[i].name};
                    console.log("Pari löydetty: " + match.name + " <3 " + muut[i].name + ". Kilta: " + muut[i].association + ", Email: " + muut[i].email);
                }
                return matches;
            },
            function (err) {
                console.log(err);
            }
        );
}
/*separateAnswers
when(fetchAnswers())
  .then(
    function(answers){
      var res = separateAnswers(answers);
      var heilat = res[0]; var muut = res[1];
      var matches = []
      for(var i=0; i<muut.length; i+=1){
        var match = matching.calculateClosestMatch(heilat, muut[i]);
        matches += {'heila': match.name, 'muu': muut[i].name}
        console.log("Pari löydetty: " + match.name + " <3 " + muut[i].name);
      }
      return matches;
    },
    function(err){
      console.log(err);
    }
  );
*/