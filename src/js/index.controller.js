app.controller("indexController", function ($scope, $rootScope, RequestApis, AuthService, $templateCache, $state, $stateParams, global) {
    //variables
    $templateCache.remove($state.current.templateUrl);
    $scope.initialPage = "../../views/home.html?v=" + Date.now();
});

