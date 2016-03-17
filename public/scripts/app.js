'use strict';

angular.module('wappuheila', [])

.controller("MainController", function($scope, $http){

    this.registration = {};
    var self = this;

    this.postData = function(){
        console.log("Trying to sign up\n");
        self.registration.admin = true;
        
        $http.post("/registration", self.registration)
            .then(function(response){
            }, function(response,err){
                console.log("error\n");
                self.registrationStatus = true;
                self.registrationMessage = "VIRHE: " + response.data.msg;
                console.log(self.registrationMessage);
            }); 
    };
});
