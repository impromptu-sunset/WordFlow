
app.controller('HomeController', ['$scope', '$interval', 'Results', 'ColorIndexService', function($scope, $interval, Results, ColorIndexService) {

  $scope.lastTime = 1;

  $scope.unsubmitted = true;
  $scope.gameOver = false;

  $scope.timerInput = 15;

  $scope.scores = [];

  var allScores = [];

  $scope.latestScore = 0;

  $scope.totalScore = 0;

  $scope.minute = 0;

  $scope.startTime;

  $scope.timer = 0;

  $scope.sessionScore = 0;

  $scope.potentialScoreSoFar = 0;

  $scope.colorIndex;

  // start the app with a perfect colorIndex
  ColorIndexService.set(10);

  var start;

  var latestScores = [];

  // calculates the colorIndex
  // calculates color based on the quotient between actual and potential
  // returns a corresponding index between 0 - 10
  $scope.getRoundedIndex = function(scores, seconds, maxScore) {

    console.log("the scores are: ", scores);
    console.log("the number of scores is: ", scores.length);

    console.log("the number of seconds is: ", seconds);
    console.log("the maximum score is: ", maxScore);

    var actual = 0;

    actual += _.reduce(scores, function(memo, score){
      return memo + score;
    }, 0);

    var potential = seconds * maxScore;

    if (actual > potential) {
      console.log("ERROR: Trying to find quotient when the actual score is higher than potential");
    }

    var prop = actual / potential;

    console.log(Math.floor(prop * 10));
    
    return Math.floor(prop * 10);
  };
  


  $scope.setTime = function(event){
    $scope.lastTime = event.timeStamp;
  };

  var getTime = function() {
    var date = new Date();
    return date.getTime();
  };

  var updateMinute = function() {
    $scope.minute = Math.floor((getTime() - $scope.startTime) / 60000);
  };

  var getScore = function() {
    // How long to wait before score starts to decrease (in ms)
    var gracePeriod = 1500;
    // Length of time from end of grace period to score of zero (in ms)
    var countdown = 4000; 
    // Number of scores to average for calculating color index
    var interval = 10; 
    // Maximum score per second
    var maxScore = 10000;
       
    var score = maxScore;

    var diff = getTime() - $scope.lastTime;
    
    if (diff > gracePeriod && diff <= gracePeriod + countdown) {
      score -= Math.floor((diff - gracePeriod) * (score / countdown));
    } else if (diff > gracePeriod + countdown) {
      score = 1;
    }

    updateMinute();

    $scope.scores[$scope.minute] += score;
    $scope.sessionScore += score;
    $scope.latestScore = score;

    allScores.push(score);

    
    latestScores.push(score);

    var seconds = latestScores.length <= interval ? latestScores.length : interval;

    if (latestScores.length > interval) {
      latestScores.shift();
    }
    $scope.colorIndex = $scope.getRoundedIndex(latestScores, seconds, maxScore);
    
    ColorIndexService.set($scope.colorIndex);

  };

  var createScoresArray = function(minutes) {
    var array = [];
    for (var i = 0; i < minutes; i++) {
      array.push(0);
    }
    return array;
  };

  var getTimer = function(elapsed) {
    var mins = (parseInt($scope.timerInput) - Math.floor(elapsed / 60000) - 1).toString();
    var seconds = (60 - Math.floor(((elapsed % 60000) / 1000)) - 1).toString();
    if (seconds.length === 1) seconds = '0' + seconds;

    return mins + ':' + seconds;
  }

  var checkForEnd = function(elapsed) {
    return elapsed >= parseInt($scope.timerInput) * 60000;
  }

  $scope.startTimer = function() {

    if (angular.isDefined(start)) return;

    var duration = $scope.timerInput = parseInt($scope.timerInput);

    if (duration > 0) {

      $scope.unsubmitted = false;

      // $scope.potentialSession = $scope.timerInput * 60 * 10000;
      $scope.startTime = getTime();
      $scope.scores = createScoresArray(duration);

      getScore();
      $scope.timer = getTimer(getTime() - $scope.startTime);

      start = $interval(function() {
        var elapsed = getTime() - $scope.startTime;
        if (checkForEnd(elapsed)) {
          $scope.stopTimer();
          $scope.showResults();
        } else {
          getScore();
          $scope.timer = getTimer(elapsed);
        }
      }, 1000, 0);

    } else {
      console.log('invalid time');
    } 
  };

  $scope.stopTimer = function() {
    if (angular.isDefined(start)) {
      $interval.cancel(start);
      start = undefined;
    }
  };

  $scope.showResults = function() {
    Results.setDuration($scope.timerInput);
    Results.setText($scope.textInput);
    Results.setScores(allScores);
    $scope.gameOver = true;
  };

  $scope.makeDebugResults = function() {

    var getRandomInt = function (min, max) {
      return Math.floor(Math.random() * (max - min)) + min;
    }

    var valuesObj = {};

    valuesObj.session_time = getRandomInt(1, 15);
    valuesObj.scores = [];
    valuesObj.text = "Hello I am the raw text";
    valuesObj.minuteScores = [];
    valuesObj.wpm = getRandomInt(30, 120);
    valuesObj.cpm = getRandomInt(40, 200);
    valuesObj.total = getRandomInt(1000, valuesObj.session_time*600000);
    valuesObj.possible = valuesObj.session_time * 60 * 10000;
    valuesObj.consistency = getRandomInt(0, 11) / 10;
    valuesObj.word_count = valuesObj.wpm * valuesObj.session_time;
    valuesObj.char_count = valuesObj.cpm * valuesObj.session_time;

    // $scope._results.scores = Results.getScores();
    // $scope._results.rawText = Results.getText();
    // $scope._results.minuteScores = Results.getScoresPerMinute();
    // $scope._results.wordCount = Results.getWordCount();
    // $scope._results.charCount = Results.getCharacterCount();
    // $scope._results.wpm = $scope.wordCount / $scope.session_time;
    // $scope._results.cpm = $scope.charCount / $scope.session_time;
    // $scope._results.total = Results.getTotalScore();
    // $scope._results.possible = $scope.session_time * 60 * 10000;
    // $scope._results.consistency = $scope.total / $scope.possible;

    // generates random scores for each second
    for (var i = 0; i < valuesObj.session_time*60; i++) {
      var randomScore = getRandomInt(0, 100000);
      valuesObj.scores.push(randomScore);
    }
    // generates random scores for each minute
    for (var i = 0; i < valuesObj.session_time; i++) {
      var randomScore = getRandomInt(0, 60*10000);
      valuesObj.minuteScores.push(randomScore);
    }

    Results.postResults(valuesObj);
  };

}]);
