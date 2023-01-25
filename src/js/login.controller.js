app.controller("loginController", function ($scope, $rootScope, $state, AuthService, $templateCache) {
    $templateCache.remove($state.current.templateUrl);
    AuthService.authenticate().then((res => {
        if (!res)
            AuthService.signIn();
    }));

    //===================change password  page functions=========================
});
