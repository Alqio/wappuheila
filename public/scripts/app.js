'use strict';

angular.module('fuksicruise', [])

.controller("MainController", function($scope, $http){
    var self = this;
    
    this.scrollPage = function(page){
        var bheight = $(window).height();
        $('html, body').animate({
            scrollTop: ($("#"+page).offset().top - 64)
        },400);
    };
    
    this.cabins = {"a": "b", "c": "d"}; 
    $http.get("/groups")
            .then(function(response){
                console.log("Fetched groups.");
                self.cabins = response.data;
            }, function(response){
                console.log("error groups");
            });
    
    this.registrations = [];
    $http.get("/registrations")
            .then(function(response){
                console.log("Fetched registrations.");
                self.registrations = response.data;
            }, function(response){
                console.log("error groups");
            });

    this.registration = {};

    this.registrationStatus = false;
    this.registrationMessage = "";
    
    this.postData = function(){
        console.log("Trying to sign up\n");
        if(self.registration["group"] == "Uusi/New"){
            self.registration["group"] = self.registration["newgroup"];
            self.registration["is_new_group"] = true;
        } else {
            self.registration["is_new_group"] = false;
        }
        
        $http.post("/registrations", self.registration)
            .then(function(response){
                console.log("success\n");
                self.registration["group_name"] = self.registration["group"];
                self.registrations.push(self.registration);
                self.registrationStatus = true;
                self.registrationMessage = "Ilmoittautuminen onnistui! Success!";
                var flag = false;
                for(var i = 0; i < self.cabins.length; i++){
                    if(self.cabins[i] === self.registration["group"]) {
                        flag = true;
                        break;
                    }
                }
                if(!flag) self.cabins.push({"name": self.registration["group"], "free": self.registration["password"] == ''});
                self.registration = {};
            }, function(response,err){
                console.log("error\n");
                self.registrationStatus = true;
                self.registrationMessage = "VIRHE: " + response.data.msg;
            }); 
    };

})


.controller("CountdownController", ["$interval", function($interval){
      
    var t1 = Date.parse("2015-11-25T15:00+02:00");
    var t2 = Date.now();
    var dif = t1 - t2;
    this.timeUntil = dif/1000; //milliseconds away
    
    var self = this;
    
    this.update = $interval(function(){
        self.timeUntil = (t1 - new Date()) / 1000;
    }, 1000);
    
    this.getSeconds = function(){
        return Math.floor(this.timeUntil) % 60;
    };
    
    this.getMinutes = function(){
        return Math.floor(this.timeUntil / 60) % 60;
    };
    
    this.getHours = function(){
        return Math.floor(this.timeUntil / 3600) % 24;
    };  
    
    this.getDays = function(){
        return Math.floor(this.timeUntil / 3600 / 24);
    };          
}]);
