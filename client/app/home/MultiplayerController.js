
app.controller('MultiplayerController', ['$scope', '$timeout', 'Session', 'ColorIndexService', '$interval', function($scope, $timeout, Session, ColorIndexService, $interval) {


  var socket = io.connect('http://localhost:3000');


  // stores the users currently logged in for sockets
  $scope.usersCollection = {};

  ////////////////
  // SOCKETS LOGIC
  ////////////////
  
  // DEBUG data from user input
  $scope.testUsername;
  $scope.testColorIndex;

  $scope.debugSendCurrentUser = function () {
    console.log(Session.getUser());

  };


  // uploads user data to server
  $scope.sendUserData = function() {
    var username = Session.getUser().username;
    var colorIndex = ColorIndexService.get();

    console.log('trying to send to sockets', username, colorIndex)
    socket.emit('postUserUpdate', {username: username, colorIndex: colorIndex});
  };

  $interval($scope.sendUserData, 1000)

  // initiates update function when a user has sent their data to the server
  socket.on('getUserUpdate', function(data) {
    // NOTE: must use timeout because angular requires time to add the element to the DOM
    $timeout(function() {
      $scope.handleUserUpdate(data);
    }, 1);
  });

  // iniates removal of a user from the userlist, when a user sent their
  // disconnect signal to the server
  socket.on('userExit', function(user) {
    $scope.handleDeleteUser(user)
  });

  // gets all users currently logged in
  socket.on('allServerUsers', function(data) {
    for (var key in data) {
      $timeout(function() {
        $scope.handleUserUpdate(data[key]);
      }, 1)
    }
  });

  // on page load, goes and gets all of the users currently logged in
  socket.emit('getAllUsers');


  // deletes passed in user from the users collection
  $scope.handleDeleteUser = function(user) {
    $timeout(function(){
      delete $scope.usersCollection[user.username];
    }, 0);
  };


  // takes in an actual score and potential score
  // calculates color based on the quotient between actual and potential
  // returns a corresponding index between 0 - 10
  // var getRoundedIndex = function(actual, potential) {
  //   if (actual > potential) {
  //     throw "ERROR: Trying to find quotient when the actual score is higher than potential";
  //   }

  //   var prop = actual / potential;
    
  //   return Math.floor(prop * 10) / 10;
  // };
  
  ////////////
  // colors for red <-> yellow <-> green
  ////////////
  // usage:
  // var roundedIndex = getRoundedIndex(actual, potential);
  // user.colorIndex = roundedIndex;
  // setColor(user);
  ////////////
  // to generate new color midpoints, use this generator:
  // http://meyerweb.com/eric/tools/color-blend/#:::hex
  ////////////
  // the color pallette used is here:
  // http://www.colourlovers.com/palette/110225/Vintage_Modern
  ////////////
  var colors = [
    '#8C2318', // .0
    '#A64B29', // .1
    '#BF7439', // .2
    '#D99C4A', // .3
    '#F2C45A', // .4
    '#CDB65E', // .5
    '#A8A862', // .6
    '#839A66', // .7
    '#5E8C6A', // .8 /////////
    '#5E8C6A', // .9 // the highest green is used for .8 to 1.0
    '#5E8C6A' // 1.0 /////////
  ];


  

  // DEBUG: pre-made users
  var user1 = {
      username: 'jd',
      colorIndex: 4
    };

  var user2 = {
      username: 'bahia',
      colorIndex: 8
    };

  var user3 = {
      username: 'peter',
      colorIndex: 6
    };

  // determines length and width of circle box
  // and the diameter of the circle
  var circleBoxWidth = 20;

  // adds user to usersCollection array and creates their SVG circle
  $scope.handleUserUpdate = function(user) {

    // if the user already exists
    if ($scope.usersCollection[user.username]) {
      return $scope.setColor(user);
    }

    // adds user to users collection
    $scope.usersCollection[user.username] = user;


    // string to access the user's circle box directly
    var elementId = '#' + user.username + '-user-circle-box';

    // sets up new circle
    // must be in timeout due to delay in angular for setting up
    // new DOM elements
    $timeout(function() {
      // sets up SVG based on the passed in user
      var svgContainer = d3.select(elementId).append('svg')
                            .attr('width', circleBoxWidth)
                            .attr('height', circleBoxWidth)
                            .attr('class', user.username + '-user-circle');


      // adds circle to the new svg
      var circle = svgContainer.append("circle")
                     .attr("cx", circleBoxWidth/2)
                     .attr("cy", circleBoxWidth/2)
                     .attr("r", circleBoxWidth/2)
                     .attr('fill', 'rgb(173,216,199)');
                     

      $scope.setColor(user);
    }, 1);
  };

  /////////////
  // SVG COLOR CIRCLE LOGIC
  /////////////

  // changes color of circle based on passed in user
  // call this when receiving a new event from sockets to update their color
  $scope.setColor = function(user) {
    // console.log('color index is', user.colorIndex, 'user is', user.username)

    if (user.colorIndex === undefined) {
      throw "ERROR: must supply a color index to setColor";
    }

    // takes passed in username to build DOM ID of their circle box
    var elementId = "#" + user.username + "-user-circle-box";

    // select individual svg circle for the user

    $timeout(function() {
      var element = d3.select(elementId).selectAll('circle');

      // changes the user's circle color to their passed in color
      element
        .transition().duration(1000)
          .ease('linear')
          .attr('fill', colors[user.colorIndex]);

    }, 1);

  };

  // DEBUG SECTION
  $scope.handleUserUpdate(user1);
  $scope.handleUserUpdate(user2);
  $scope.handleUserUpdate(user3);

  user2.colorIndex = 1;

  $scope.setColor(user2);

}]);