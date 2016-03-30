'use strict';

angular.module('wappuheila', [])

.controller("MainController", function($scope, $http){

    this.registration = {"wappufiilis":"0.8","first_thing":"asd","wappu_lasts":"8","spontaani":"6","wappuheila_before":"0","wappuheila_dream":"1","lempinumero":"7","kossu_or_jallu":"0","wappu_or_juhannus":"1","kissa_or_koira":"1","pizza_or_hamburger":"1","kokis_pepsi":"1","metsa_kaupunki":"1","paalla_alla":"1","kalia":"1","kaljatolkki":"1","hesa_stadi":"2","reilaamaan_rantalomalle":"1","tinder_kinder":"0","ufot":"2","yhdyssanat":"2","muistio":"1","salkkarit":"1","amnesia":"1","blind":"1","lehtimyyja":"1","gt":"0","viimeksi":"0","toteemi":"asd","arvonta":false};
    var self = this;
    this.debug = false;
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
