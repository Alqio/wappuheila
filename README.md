# Wappuheila

Wappuheila site using NodeJS, Bootstrap & Postgres

## Running Locally

```sh
$ cd wappuheila
$ npm install
$ npm start
```

Your app should now be running on [localhost:5000](http://localhost:5000/).

## Deployment to heroku

1. Create heroku app
2. Add postgres addon
3. Push files to heroku
4. run ```heroku pg:psql --app application-name DATABASE < schema.sql``` to create database schema NOTE: requires psql installed on local computer


#### Switching from heila registration to normal registration
The idea is that you first register heilas that users will match to. For switching you can comment and uncommend the stuff as necessary from the code (index.ejs, signup.ejs)
