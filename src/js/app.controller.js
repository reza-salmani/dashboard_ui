app.controller("mainController", function ($scope, $timeout, $state, $filter, $rootScope, $location, $templateCache, RequestApis, AuthService) {
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
  //============================functions===================================
  //fetch initial data from json file for creating navbar
  RequestApis.GetInternalJson('./config.json', (response) => {
    $scope.myFunctionJson(response.data);
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
    AuthService.removeUser();
  };

  // show or hide navbar
  $scope.showNavigatPanel = function () {
    $scope.panelIconState = !$scope.panelIconState;
    if (!document.querySelector(".navigate-container").classList.contains("unvisible")) {
      $scope.panelIconState = true;
    }
    $(".navigate-container").toggleClass("unvisible");
    if ($(".navigate-container").hasClass("unvisible")) {
      $(".main-panel-container").slideDown();
      $(".inner-panel").addClass('hidden');
      $(".second-icon").removeClass("fa-angle-right");
      $(".second-icon").addClass("fa-angle-left");
      $(".first-icon").removeClass("fa-angle-right");
      $(".first-icon").addClass("fa-angle-left");
    } else {
      $(".main-panel-container").slideUp();
    }
  };
  $scope.gotoPage = function (item) {
    if (item.HasAccess) {
      $state.go(item.RouteValue);
      $(".main-panel-container").slideUp();
      document.querySelector(".navigate-container").classList.remove("unvisible");
      $scope.panelIconState = false;
    }
  };
  $scope.gotoInitPage = function () {
    $templateCache.remove($state.current.templateUrl);
    $state.go('initPage');
  };
  $scope.reloadPage = function () {
    const currentState = $state.current.name;
    $templateCache.remove($state.current.templateUrl);
    $state.go('initPage');
    $timeout(function () {
      $state.go(currentState);
      $(".main-panel-container").slideUp();
      document.querySelector(".navigate-container").classList.remove("unvisible");
      $scope.panelIconState = false;
    }, 10);
  };

  angular.element(document.addEventListener("click", function (event) {
    if (event.target.classList.contains('main-container-page')) {
      $(".main-panel-container").slideUp();
      document.querySelector(".navigate-container").classList.remove("unvisible");
      $scope.panelIconState = false;
      $scope.$apply();
    }
  }));
}); 