app.controller("mainController", function ($scope, $timeout, $state, $filter, $rootScope, $location, $templateCache, RequestApis, AuthService,global) {
  //variables
  $scope.logoImage = "../src/images/logo.png";
  $scope.mailImage = "../src/images/male.png";
  $scope.userInfo = {};
  $scope.filter = {};
  $scope.searchAllow = false;
  $scope.panelIconState = false;
  $scope.loaded = false;
  $scope.panelBarItems = [];
  $scope.pages = [];
  $scope.currentSystem = [];
  $scope.indexOfKeyup = 0;
  $scope.numLimit = 10;
  $scope.fixLevel = false;
  $templateCache.remove($state.current.templateUrl);
  // AuthService.authenticate().then((res => {
  //   if (!res)
  //     AuthService.signIn();
  // }));
  //============================functions===================================
  //fetch initial data from json file for creating navbar
  AuthService.authenticate().then(res => {
    $timeout(function (){
      if (!res)
        AuthService.signIn();
      else
        RequestApis.GetInternalJson('./config.json', (response) => {
          global.currentUser((responses) => {
            $state.go('dashboard')
            $scope.userInfo = responses.personnelInfo;
            $scope.myFunctionJson(response.data);
          })
        });
    },1000)
  });

  $scope.myFunctionJson = function (items) {
    $scope.loaded = true;
    $scope.panelBarItems = items.Tree;
    $scope.getPagesByRecursiveFunc(items.Tree);
  };

  //get pages by recursive function
  $scope.getPagesByRecursiveFunc = function (items) {
    if (items !== undefined) {
      Object.values(items).forEach(item => {
        if (item.Children !== undefined && item.Children.length) {
          $scope.getPagesByRecursiveFunc(item.Children);
        } else {
          $scope.pages.push(item);
        }
      });
    }
  };
  //change password
  $scope.changePass = function () {
  };

  //log out function
  $scope.logOut = function () {
    AuthService.signOut();
  };

  $scope.gotoPage = function (item) {
    if (item.HasAccess) {
      $state.go(item.RouteValue);
    }
  };
  $scope.reloadPage = function () {
    const currentState = $state.current.name;
    $templateCache.remove($state.current.templateUrl);
    $state.go('initPage');
    $timeout(function () {
      $state.go(currentState);
      $(".main-panel-container").slideUp();
    }, 200);
  };
});