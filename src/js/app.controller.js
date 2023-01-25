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
  RequestApis.GetInternalJson('menus', (response) => {
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
  //fix submenuItems for allways show
  $scope.fixSecondLevel = function (parentSystem) {
    $scope.fixLevel = true;
    $scope.showSecondLevelPanel(parentSystem);
  };
  $scope.cancelFixed = function () {
    $scope.fixLevel = false;
  };

  //close submenuItems
  $scope.closeSecondLevel = function () {
    $(".navigate-second-level").slideUp();
  };

  //set children to submenu
  $scope.showSecondLevelPanel = function (parentSystem) {
    if (!$scope.fixLevel) {
      $scope.nonVisited = true;
      $scope.loading = true;
      $scope.animate = false;
      $scope.style = {
        'color': "#75BEEA",
        'padding': '5px',
        'font-weight': 'bold',
        'font-size': '1.2em',
        'cursor': 'default'
      };
      $scope.currentSystem = parentSystem;
      $(".selective-p").removeClass("selective-p");
      $("#p-" + parentSystem.Id).addClass("selective-p");
      // for(var i = 0)
      $scope.currentSystemId = parentSystem.Id;
      $scope.parentIdToShow = parentSystem.Id;
      $(".navigate-second-level").slideDown();
      $timeout(function () {
        $scope.loading = false;
        $scope.animate = true;
      }, 50);
    }
  };

  //hide submenu panel
  $scope.hideSecondLevelPanel = function (parentSystem) {
    document.querySelector('.main-panel-container').querySelectorAll(".selective-p").forEach(item => {
      item.classList.remove("selective-p");
    });
    document.getElementById(`p-${parentSystem.Id}`).classList.add("selective-p");
    $scope.currentSystemId = parentSystem.Id;
    $scope.parentIdToShow = parentSystem.Id;
    $(".navigate-second-level").slideUp();
    $timeout(function () {
      $scope.loading = false;
      $scope.animate = true;
    }, 50);
  };

  // show help of show/hide menu
  $scope.showHelp = function () {
    if (document.querySelector("#help-container").classList.contains("hidden")) {
      $("#help-container").removeClass("hidden");
    } else {
      $("#help-container").addClass("hidden");
    }
  };

  // message box in navbar
  $scope.hiddenMessage = function () {
    $("#message").toggleClass("hidden");
  };

  // search in navbar
  $scope.lookUp = function (event) {
    // event.preventDefault();
    // var ArrayLength = Number($filter('filter')($scope.pages, $scope.filter).length) - 1;
    $scope.filterPages = $filter('filter')(JSON.parse(JSON.stringify($scope.pages)), $scope.filter);
    // if (event.keyCode == 40) {
    //   if ($scope.indexOfKeyup < ArrayLength) {
    //     $scope.indexOfKeyup++;
    //   } else {
    //     $scope.indexOfKeyup = 0;
    //   }
    // } else if (event.keyCode == 38) {
    //   if ($scope.indexOfKeyup >= 1) {
    //     $scope.indexOfKeyup--;
    //   }
    // } else if (event.keyCode == 13) {
    //   var data = $filter('filter')($scope.pages, $scope.filter)[$scope.indexOfKeyup];
    //   $scope.changeIframeUrlSearch(data);
    // } else {
    //   $scope.indexOfKeyup = 0;
    // }
    $(".filtered").removeClass("selected-filter");
    $("#search-page-" + $filter('filter')($scope.pages, $scope.filter)[$scope.indexOfKeyup].Id).addClass("selected-filter");
  };
  $scope.searchInputWidthToggler = function () {
    $("#search-input").toggleClass("show-input");
    if ($("#search-input").hasClass("show-input")) {
      $scope.searchAllow = true;
    } else {
      $scope.searchAllow = false;
      $scope.filter.Title = "";
    }
  };
  $scope.removeSearch = function () {
    if (document.getElementById('search-input').classList.contains('show-input')) {
      document.getElementById('search-input').classList.remove('show-input');
      $scope.searchAllow = false;
      if ($scope.filter.Title !== undefined && $scope.filter.Title.length)
        $scope.filter.Title = "";
    }
  };

  //show innerpanel pop up
  $scope.showingInnerPanel = function (item, type) {
    if ($("#inner-" + item.Id).hasClass("hidden")) {
      if (type == 1) {
        $(".first-icon").removeClass("fa-angle-right");
        $(".first-icon").addClass("fa-angle-left");
        $(".inner-panel").addClass('hidden');
      } else {
        $(".second-icon").removeClass("fa-angle-right");
        $(".second-icon").addClass("fa-angle-left");
        $(".second").addClass('hidden');
      }
      $("#icon-" + item.Id).removeClass("fa-angle-left");
      $("#icon-" + item.Id).addClass("fa-angle-right");
      $("#inner-" + item.Id).removeClass("hidden");
    } else {
      $("#icon-" + item.Id).addClass("fa-angle-left");
      $("#icon-" + item.Id).removeClass("fa-angle-right");
      $("#inner-" + item.Id).addClass("hidden");
    }
  };

  $scope.gotoPage = function (item) {
    if (item.HasAccess) {
      $state.go(item.RouteValue);
      $(".main-panel-container").slideUp();
      $scope.removeSearch();
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