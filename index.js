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

app.get('/', function(req, res) {
  res.redirect('/fi');
});

app.get('/fi', function(request, response) {
  var lang = JSON.parse(fs.readFileSync('data/lang_fi.json', 'utf8'));
  var t1 = Date.parse("2015-10-11T16:00+03:00");
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

app.get("/groups", function(request, response) {
  query("SELECT name, CASE WHEN password is null THEN true ELSE false END AS free FROM groups WHERE member_count < 4")
    .then(
      function(rows, result){
        response.send(JSON.stringify(rows[0]));
      },
      function(err){
        console.error(err); 
      });
});

app.get("/registrations", function(request, response) {
  
  query('SELECT r.firstname as firstname, r.lastname as lastname, r.guild as guild, r.group_name as group_name, case when g.password is null then true else false end as free FROM registrations AS r LEFT JOIN groups AS g on name=group_name ORDER BY group_name ASC')
    .then(
      function(rows, result){
        response.send(JSON.stringify(rows[0]));
      },
      function(err){
        console.error(err); 
      });
});

function checkGroupPassword(group, password) {
  var deferred = when.defer();
  console.log("Checking group password\n");
  query('SELECT name, password FROM groups WHERE name=$1 and member_count<4 LIMIT 1', [group])
    .then(
      function(rows, res){
        // group == Uusi/New HACK but makes sure we don't get hacky group names
        if(rows[0].length == 0 || group == "Uusi/New"){
          console.log("Tried to join a full group\n");
          deferred.reject([400, {"msg": "No such free group as " + group}]);
        } else {
          var foundGroup = rows[0][0];
          console.log(foundGroup["password"] + " " + password + "\n");
          if(foundGroup["password"] == "" || foundGroup["password"] == password){
            deferred.resolve(true);
          } else {
            console.log("Invalid group password\n");
            deferred.reject([400, {"msg": "Invalid group password!"}]);
          }
        }
      },
      function(err){
        console.error(err);
        deferred.reject([500, {"msg": "Internal server error."}]);
      })
  return deferred.promise;
}

function checkNewGroupValidity(newgroup) {
  var deferred = when.defer();
  // group == Uusi/New HACK but makes sure we don't get hacky group names
  if(newgroup == "Uusi/New"){
    console.log("Tried to create Uusi/New group!");
    deferred.reject([400, {"msg": "Invalid group name."}]);
  } else {
    console.log("Checking if newgroup " + newgroup + " already exists.s");
    query('SELECT name FROM groups WHERE name=$1', [newgroup]) 
      .then(
        function(rows, res){
          if(rows[0].length != 0){
            console.log("Group " + newgroup + " already exists, invalid registration!");
            deferred.reject([400, {"msg": "Group " + newgroup + " already exists!"}]);
          } else
            console.log("New group was valid");
            deferred.resolve(true);
        },
        function(err){
          console.error(err);
          deferred.reject([500, {"msg": "Internal server error"}]);
        });
  }
  
  return deferred.promise;
}

function checkGroupData(group, is_new_group, password) {
  if(is_new_group) {
    return checkNewGroupValidity(group);
  } else {
    return checkGroupPassword(group, password);
  }
}

function updateGroups(group, is_new_group, password){
  var deferred = when.defer();
  if(is_new_group){
    console.log("Creating a new group " + group);
    query('insert into groups (name, password, member_count) values ($1, $2, $3)', [group, password, 1])
      .then(
        function(rows, res){
          console.log("Created a new group " + group + "\n");
          deferred.resolve(true);
        },
        function(err){
          console.log("Creating new group " + group + " failed! ");
          console.error(err);
          deferred.reject([500, {"msg": "Internal server error."}]);
        });
  } else {
    query('update groups set member_count=member_count+1 where name=$1', [group])
      .then(
        function(rows, res){
          console.log("Updated group " + group + " member count \n");
          deferred.resolve(true);
        },
        function(err){
          console.error(err);
          deferred.reject([500, {"msg": "Internal server error."}]);
        });
  }
  return deferred.promise;
}

function insertRegistration(data){
  var deferred = when.defer();
  query('INSERT INTO registrations (firstname, lastname, email, phone, dobday, dobmonth, dobyear, nationality, guild, group_name) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)', [data["firstname"], data["lastname"], data["email"], data["phone"], data["dobday"], data["dobmonth"], data["dobyear"], data["nationality"], data["guild"], data["group"]])
    .then(
      function(rows, res){
        console.log("New registration!\n")
        console.log(data);
        console.log("\n");
        deferred.resolve(true);
      },
      function(err){
        console.error(err);
        deferred.reject([500, {"msg": "Internal server error."}]);
      }
    )
  return deferred.promise;
}

app.post("/registrations", jsonParser, function(req, res) {
  return res.sendStatus(404);
  
  var data = req.body;
  // check that it has all the required fields
  for(var key in correctsignup){
    var val = correctsignup[key];
    if(data[val] == null || data[val] === '' || data[val] === 0){
      res.status(400).send({"msg": "One or more missing fields! Missing at least: " + val});
      return;
    } 
  }

  var numeric = ["dobday", "dobyear", "dobmonth"];

  // check that email is valid and so on
  if(!validator.isEmail(data.email)){
      res.status(400).send({"msg": "Email incorrect!"});
      return;
  }

  for(var key in numeric){
    if(!validator.isNumeric(data[numeric[key]])){
      res.status(400).send({"msg": "Date of birth is not a number!"});
      return;
    }
  }
  
  when(
      checkGroupData(data["group"], data["is_new_group"], data["grouppassword"])
      ).then(
      function(success){
        when
          .all([
            updateGroups(data["group"], data["is_new_group"], data["grouppassword"]),
            insertRegistration(data)
          ]).then(
            function(success){
              res.status(200).send({"msg": "Success!"});
            }),
            function(err){
              res.status(err[0]).send(err[1]);
            }
      },
      function(err){
        res.status(err[0]).send(err[1]);
      });

});


app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});


