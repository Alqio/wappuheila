'use strict';

angular.module('wappuheila', [])

.controller("MainController", function($scope, $http){

    this.registration = {};
    var self = this;
    self.registration.results = {'name': 'Joonas Ulmanen', 'success': '87'};

    this.postData = function(){
      console.log("Trying to sign up\n");
        
      $http.post("/registration", self.registration)
        .then(function(response){
          self.registration = {};
          self.popup = true;
          self.registration.match = response.data.match;
        }, function(response,err){
          console.log("error\n");
          self.registrationStatus = true;
          self.registrationMessage = "VIRHE: " + response.data.msg;
          console.log(self.registrationMessage);
        }); 
    };
});
