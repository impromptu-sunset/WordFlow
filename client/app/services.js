angular.module('app.services', [])

  .factory('Results', ['$http', function($http) {
    var results = {};
    var duration, text, scores;

    var funcs = {};

    funcs.getTotalScore = function() {
      console.log('hi');
      return _.reduce(scores, function(memo, score) {
        return memo + score;
      }, 0);
    };
    funcs.getScoresPerMinute = function() {
      var result = [];
      for (var i = 0; i < scores.length; i++) {
        if (!(i % 60)) result.push(0);
        result[Math.floor(i / 60)] += scores[i];
      }
      return result;
    };
    funcs.getWordCount = function() {
      return text.split(' ').length;
    };
    funcs.getCharacterCount = function() {
      return text.length;
    };
    funcs.setDuration = function(minutes){
      duration = minutes;

    };
    funcs.setText = function(string) {
      text = string;
    };
    funcs.setScores = function(array) {
      scores = array;
    };
    funcs.getDuration = function() {
      console.log("here");
      return duration;
    };
    funcs.getText = function() {
      return text;
    };
    funcs.getScores = function() {
      return scores;
    };

    // DEBUG FUNCS
    funcs.postResults = function(valuesObj) {
      $http({
        method: 'POST',
        url: '/api/sessions',
        data: valuesObj
      })
      .then(function(response) {
        console.log(response);
      });
    };
    return funcs;
  }])

  .factory('Session',['$cookies', '$injector', function ($cookies, $injector) {
    
    var user = function(){
      return($cookies.getObject("user") || {username: "", userId: ""});
    };

    var session = {};
    session.getUser = function(){
      return {username: user().username, userId: user().userId};
    };
    session.create = function (userId, userName) {
      $cookies.putObject('user', {userId: userId, username: userName});
      var $state = $injector.get('$state');
      $state.go('index');
    };
    session.destroy = function () {
      $cookies.remove("user");
      // also redirect to sign in page
      var $state = $injector.get('$state');
      $state.go('login');
    };
    session.isAuthenticated = function(){
      return (!!user().username);
    };

    return session;
  }])

  .factory('sessionInjector', ['Session','$q', function(Session, $q) {
    var sessionInjector = {
      responseError: function(rejection) {

        if (rejection.status == 401) {
            // remove the cookie if it exists.
            Session.destroy(); 
        }

        return $q.reject(rejection);
      }
    };
    return sessionInjector;
  }])

  .factory('Sessions', function($http){
    var getSessions = function(callback){
      $http({
        method: 'GET',
        url: '/api/sessions'
      })
      .then(function(response) {
        callback(response.data);
      });
    };

    return{
      getSessions: getSessions
    };
  })

  .factory('Users', function ($http, Session) {
    var logout = function() {
      $http({
        method: 'GET',
        url: '/api/users/logout'
      })
      .then(function(response) {
        Session.destroy();
      });
    };

    var login = function(user) {
      return $http({
        method: 'POST',
        url: '/api/users/login',
        data: user
      })
      .success(function(data, status) {
        Session.create(
          data.id,
          data.username
        );
      })
      .error(function(data, status) {
        console.error(data);
      });
    };

    var signUp = function(user) {
      return $http({
        method: 'POST',
        url: 'api/users/signup',
        data: user
      })
      .success(function(data, status) {
        Session.create(
          data.id,
          data.username
        );
      }).error(function(data, status) {
        console.log('data', data, 'staus', status);
      });
    };


    return {
      login: login,
      signUp: signUp,
      logout: logout
    };
  });
