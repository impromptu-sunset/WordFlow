
app.controller('HomeController', ['$scope', '$interval', 'Results', 'ColorIndexService', 'Time', 'Score', function($scope, $interval, Results, ColorIndexService, Time, Score) {


/*
Get start time from the time service
Get the number of words from the text box (on the scope)
Split string, get array.length
words/time
display that in box on homepage
*/



  $scope.unsubmitted = true;
  $scope.gameOver = false;

  // start the app with a perfect colorIndex
  ColorIndexService.set(10);

  var start;


  // pulls timeStamp from the keyUp event and stores it in the Time service
  $scope.setTime = function(event){
    Time.setTime(event.timeStamp);
  };

  // initializes and runs the timer and score calculator
  $scope.startTimer = function() {
    
    // prevents simultaneous sessions
    if (angular.isDefined(start)) return;

    // Delete any scores currently stored in the Score service.
    Score.reset();

    // stores length of session in Time service
    var duration = parseInt($scope.timerInput);
    Time.setMinuteCount(duration);

    // only works if duration is a positive number
    if (duration > 0) {

      $scope.unsubmitted = false;

      Time.setStartTime();

      // Starts the timer and begins scoring immediately
      Score.getScore(Time.getTime(), Time.getLastKeyPress());
      $scope.timer = Time.getTimer();

      // Generates one score and one color index every second until the session times out,
      // and then destroys the session and saves the data.
      start = $interval(function() {
        if (Time.checkForEnd()) {
          $scope.stopTimer();
          setResults(duration);
        } else {
          var currentScore = Score.getScore(Time.getTime(), Time.getLastKeyPress());
          $scope.timer = Time.getTimer();
          var colorIndex = ColorIndexService.getRoundedIndex(currentScore, Score.getMaxScore());
          ColorIndexService.set(colorIndex);
          Results.setText($scope.textInput);
        }
      }, 1000, 0);

    } else {
      $scope.timerInput = '';
    } 
  };

  // Stops and resets the timeout interval to end the session
  $scope.stopTimer = function() {
    if (angular.isDefined(start)) {
      $interval.cancel(start);
      start = undefined;
    }
  };

  // Stores session data in the Results service
  var setResults = function(duration) {
    Results.setDuration(duration);
    Results.setText($scope.textInput);
    Results.setScores(Score.getScores());
    $scope.gameOver = true;
    // Score.reset();
  };


  // For debugging purposes only. Generates a set of results to pass to the results page and/or server.
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
    
    // Store generated results in the Results service for use on the Results page
    Results.setDuration(valuesObj.session_time);
    Results.setText(valuesObj.text);
    Results.setScores(valuesObj.scores);
    $scope.gameOver = true;

    // Uncomment to send generated results directly to the server
    // Results.postResults(valuesObj);
  };

}]);
