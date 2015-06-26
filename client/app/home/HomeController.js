
app.controller('HomeController', ['$scope', '$interval', 'Results', 'ColorIndexService', 'Time', 'Score', function($scope, $interval, Results, ColorIndexService, Time, Score) {

  // $scope.lastTime = 1;

  $scope.unsubmitted = true;
  $scope.gameOver = false;

  // $scope.timerInput = 15;

  // $scope.scores = [];

  // var allScores = [];

  $scope.latestScore = 0;

  // $scope.totalScore = 0;

  // $scope.minute = 0;

  // $scope.startTime;

  // $scope.timer = 0;

  // $scope.sessionScore = 0;

  // $scope.potentialScoreSoFar = 0;

  $scope.colorIndex;

  // start the app with a perfect colorIndex
  ColorIndexService.set(10);

  var start;

  $scope.setTime = function(event){
    Time.setTime(event.timeStamp);
  };

  $scope.startTimer = function() {

    if (angular.isDefined(start)) return;

    var duration = parseInt($scope.timerInput);
    Time.setMinuteCount(duration);

    if (duration > 0) {

      $scope.unsubmitted = false;

      Time.setStartTime();
      // $scope.scores = createScoresArray(duration);

      Score.getScore(Time.getTime(), Time.getLastKeyPress());
      $scope.timer = Time.getTimer();

      start = $interval(function() {
        if (Time.checkForEnd()) {
          $scope.stopTimer();
          setResults(duration);
        } else {
          var currentScore = Score.getScore(Time.getTime(), Time.getLastKeyPress());
          $scope.score = currentScore;
          $scope.timer = Time.getTimer();
          console.log(currentScore, Score.getMaxScore());
          var colorIndex = ColorIndexService.getRoundedIndex(currentScore, Score.getMaxScore());
          $scope.colorIndex = colorIndex;
          ColorIndexService.set(colorIndex);
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

  var setResults = function(duration) {
    Results.setDuration(duration);
    Results.setText($scope.textInput);
    Results.setScores(Score.getScores());
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
      var randomScore = getRandomInt(0, 10000);
      valuesObj.scores.push(randomScore);
    }
    // generates random scores for each minute
    for (var i = 0; i < valuesObj.session_time; i++) {
      var randomScore = getRandomInt(0, 60*10000);
      valuesObj.minuteScores.push(randomScore);
    }
    
    Results.setDuration(valuesObj.session_time);
    Results.setText(valuesObj.text);
    Results.setScores(valuesObj.scores);
    $scope.gameOver = true;

    // Results.postResults(valuesObj);
  };

}]);
