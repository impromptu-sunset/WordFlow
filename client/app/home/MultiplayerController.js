
app.controller('MultiplayerController', ['$scope', '$timeout', 'Session', 'ColorIndexService', '$interval', function($scope, $timeout, Session, ColorIndexService, $interval) {

  $scope.socket = io();


  // stores the users currently logged in for sockets
  $scope.usersCollection = {};

  // stores the current user
  // NOTE: myUser is the client's user data
  // this variable is used to always display the client's username
  // and color at the top of the userlist
  $scope.myUser = {};

  ////////////////
  // MY USER LOGIC (client user)
  ////////////////

  // returns the current myUser and the colorIndex in an object
  $scope.getMyUserAndColor = function () {
    var username = Session.getUser().username;
    var colorIndex = ColorIndexService.get();
    // if no username is provided (they haven't logged in)
    if (username === '' ||
        username === undefined) {
      // set a default username of 'you'
      username = 'you';
    }

    if (colorIndex === undefined) {
      colorIndex = 10;
    }

    return {username: username, colorIndex: colorIndex};
  }

  // updates the new myUser data
  $scope.updateMyUserAndColor = function() {
    var currentUser = $scope.getMyUserAndColor();
    // if the name has changed (by login or logout)
    if (currentUser.username !== $scope.myUser.username) {
      // delete the old and new usernames from the users collection
      delete $scope.usersCollection[$scope.myUser.username];
      delete $scope.usersCollection[currentUser.username];
      // set myUser to the user data retrieved from the session
      $scope.myUser = currentUser;
      // set a default color index of 10
      $scope.myUser.colorIndex = 10;
      // send the new user to get their dom element created
      $scope.handleUserUpdate($scope.myUser);
    } // if the username has not changed
    else {
      // update the myUser value
      $scope.myUser = currentUser;
    }
  }


  // every second, set the current user username and color
  // and send that data to the socket server
  $interval(function () {
    $scope.updateMyUserAndColor();
    $scope.sendUserData($scope.myUser);
    if ($scope.myUser.username === 'you') {
      $scope.handleUserUpdate($scope.myUser);
    }
  }, 1000);

  ////////////////
  // SOCKETS LOGIC
  ////////////////

  // initiates update function when a user has sent their data to the server
  $scope.socket.on('getUserUpdate', function(data) {
    // NOTE: must use timeout because angular requires time to add the element to the DOM
    return $timeout(function() {
      $scope.handleUserUpdate(data);
    }, 1);
  });

  // iniates removal of a user from the userlist, when a user sent their
  // disconnect signal to the server
  $scope.socket.on('userExit', function(user) {
    $scope.handleDeleteUser(user)
  });

  // gets the array of all users currently logged in
  $scope.socket.on('allServerUsers', function(data) {
    for (var i = 0; i < data.length; i++) {
      $timeout(function() {
        $scope.handleUserUpdate(data[i]);
      }, 1)
    }
  });

  // on page load, goes and gets all of the users currently logged in
  // $scope.socket.emit('getAllUsers');


  // deletes passed in user from the users collection
  $scope.handleDeleteUser = function(user) {
    return $timeout(function(){
      delete $scope.usersCollection[user.username];
    }, 1);
  };

    // uploads user data to server
  $scope.sendUserData = function() {
    var username = Session.getUser().username;
    var colorIndex = ColorIndexService.get();

    $scope.socket.emit('postUserUpdate', {username: username, colorIndex: colorIndex});
  };

  
  ////////////
  // CIRCLE COLOR NOTES
  ////////////
  // colors for red <-> yellow <-> green
  //
  // usage:
  // var roundedIndex = getRoundedIndex(actual, potential);
  // user.colorIndex = roundedIndex;
  // setColor(user);
  //
  // to generate new color midpoints, use this generator:
  // http://meyerweb.com/eric/tools/color-blend/#:::hex
  //
  // the color pallette used is here:
  // http://www.colourlovers.com/palette/110225/Vintage_Modern
  ////////////
  $scope.colors = [
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

  // determines length and width of circle box
  // and the diameter of the circle
  var circleBoxWidth = 40;

  // adds user to usersCollection array and creates their SVG circle
  $scope.handleUserUpdate = function(user) {


    // if the user already exists
    if ($scope.usersCollection[user.username]) {
      return $scope.setColor(user);
    } else { // if the user does not already exist
      // add the user to the user collection
      $scope.usersCollection[user.username] = user;
    }


    // string to access the user's circle box directly
    var elementId = '#' + user.username + '-user-circle-box';

    // sets up new circle
    // must be in timeout due to delay in angular for setting up
    // new DOM elements
    return $timeout(function() {
      // sets up SVG based on the passed in user
      d3.select(elementId).html("");
      
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

    if (user.colorIndex === undefined) {
      throw "ERROR: must supply a color index to setColor";
    }

    // takes passed in username to build DOM ID of their circle box
    var elementId = "#" + user.username + "-user-circle-box";

    // select individual svg circle for the user

    return $timeout(function() {
      var element = d3.select(elementId).selectAll('circle');

      // changes the user's circle color to their passed in color
      element
        .transition().duration(1000)
          .ease('linear')
          .attr('fill', $scope.colors[user.colorIndex]);

    }, 1);

  };

  // DEBUG SECTION

  // This sets up a few debug users and tests changing the color

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
    
  $scope.handleUserUpdate(user1);
  $scope.handleUserUpdate(user2);
  $scope.handleUserUpdate(user3);

  user2.colorIndex = 1;

  $scope.setColor(user2);

}]);