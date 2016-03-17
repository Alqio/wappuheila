
var pg = require("pg");
var query = require("pg-query");
var fs = require("fs");

query.connectionParameters = process.env.DATABASE_URL;

query("drop table answers");

var answers_meta = JSON.parse(fs.readFileSync('data/lang_fi.json', 'utf8'));

var str = "create table answers (\n  id serial not null primary key,\n  created_at timestamp default now() not null";

for(var field_name in answers_meta['fields']) {
  var field = answers_meta['fields'][field_name];
  if(field['type'] == 'scale') {
    str += ",\n  " + field_name + " int not null";
  } else {
    str += ",\n  " + field_name + " text not null";
  }
}

str += "\n);"

console.log(query(str));
