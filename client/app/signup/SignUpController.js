app.controller('SignUpController', ['$scope', 'Users', function ($scope, Users) {

  $scope.user = {};

  $scope.message;


  $scope.processSignup = function() {
    Users.signUp($scope.user)
      .catch(function(data){
        $scope.message = "Username already in use";
      });
  }
}]);


