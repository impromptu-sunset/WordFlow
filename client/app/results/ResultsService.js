angular.module('app.services')

  .factory('Results', ['$http', function($http) {
    var results = {};
    var duration, text, scores;

    var funcs = {};

    funcs.getTotalScore = function() {
      return _.reduce(scores, function(memo, score) {
        return memo + score;
      }, 0);
    };
    funcs.getScoresPerMinute = function() {
      var result = [];
      // if there are no scores (if the user goes directly to the results page)
      if (!scores) {
        return null;
      } else {
        for (var i = 0; i < scores.length; i++) {
          if (!(i % 60)) result.push(0);
          result[Math.floor(i / 60)] += scores[i];
        }
        return result;
      }
      
    };
    funcs.getWordCount = function() {
      // if there are no text (if the user goes directly to the results page)
      if (!text) {
        return null;
      }
      return text.split(' ').length;
    };
    funcs.getCharacterCount = function() {
      // if there are no text (if the user goes directly to the results page)
      if (!text) {
        return null;
      }
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
      return $http({
        method: 'POST',
        url: '/api/sessions',
        data: valuesObj
      })
      .success(function(response) {
        console.log(response);
      });
    };
    return funcs;
  }]);