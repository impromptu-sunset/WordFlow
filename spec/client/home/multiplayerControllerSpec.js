"use strict";

describe('Multiplayer Controller', function() {
  var $scope;
  var ctrl;
  var $controller;
  var createController;
  var $rootScope;
  var $httpBackend;
  var ColorIndexService;
  var Session;
  var $interval;
  var $timeout;

  beforeEach(module('app'));


  beforeEach(inject(function($injector) {

    $rootScope = $injector.get('$rootScope');
    $httpBackend = $injector.get('$httpBackend');
    $timeout = $injector.get('$timeout');

    Session = $injector.get('Session');
    ColorIndexService = $injector.get('ColorIndexService');

    $scope = $rootScope.$new();

    var $controller = $injector.get('$controller');


    createController = function() {
      return $controller('MultiplayerController', {
        $scope: $scope,
        Session: Session,
        ColorIndexService: ColorIndexService,
        $timeout: $timeout,
        $httpBackend: $httpBackend
      });
    };
  }));


  it('should have a users collection', function() {
    createController();
    expect($scope.usersCollection).toBeDefined();
  }); 

  describe('socket io', function() {
    it('should emit a user update properly', function() {
      createController();
      spyOn($scope.socket, 'emit');
      $scope.socket.emit();
      expect($scope.socket.emit).toHaveBeenCalled();
    });

    it('should delete users when they log out', function(done) {
      // note this test doesn't test the socket listener itself
      // the socket listener that listens for 'userExit' calls handleDeleteUser
      $httpBackend.expectGET('/app/home/home.html').respond(200);
      createController();
      $scope.usersCollection['Cruella'] = {username: 'Cruella', colorIndex: 5};
      $scope.handleDeleteUser({username: 'Cruella', colorIndex: 5});
      // NOTE: must run $timeout.flush() to let the $timeout promises run to completion
      $timeout.flush();
      expect($scope.usersCollection['Cruella']).not.toBeDefined();
      done();
      });
  })

  describe('setting and updating myUser', function() {
    it('should create a default username and colorIndex', function() {
      createController();

      var user = $scope.getMyUserAndColor();
      var expectedUser = {username: 'you', colorIndex: 10};

      expect(user).toEqual(expectedUser);
    });

    it('should update myUser and color when the session data changes', function() {
      createController();
      var newUserData = {username: 'spiderdog', colorIndex: 8};
      $scope.myUser = {username: 'flipper', colorIndex: 4};
      expect($scope.myUser).not.toEqual(newUserData);
      spyOn($scope, 'getMyUserAndColor').and.returnValue(newUserData);
      $scope.updateMyUserAndColor();
      expect($scope.myUser).toEqual(newUserData);
    });


  });

  describe('user list functions', function() {
    it('should have an array of 11 colors for setting the circle colors', function() {
      createController();
      expect($scope.colors.length).toBe(11);
    });

    it('should add new users to the user list', function() {
      $httpBackend.expectGET('/app/home/home.html').respond(200);
      createController();
      var newUser = {username: 'JackSparrow', colorIndex: 7};
      expect($scope.usersCollection['JackSparrow']).not.toBeDefined();
      $scope.handleUserUpdate(newUser);
      $timeout.flush();
      expect($scope.usersCollection['JackSparrow']).toBe(newUser);
    });

    it('should add new users to the DOM', function() {
      $httpBackend.expectGET('/app/home/home.html').respond(200);
      createController();
      var newUser = {username: 'JackSparrow', colorIndex: 7};
      expect($scope.usersCollection['JackSparrow']).not.toBeDefined();
      $scope.handleUserUpdate(newUser);
      $timeout.flush();
      expect($scope.usersCollection['JackSparrow']).toBe(newUser);
    });
  });


});