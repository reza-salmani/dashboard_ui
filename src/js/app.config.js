app.config(['$stateProvider', '$locationProvider', '$urlRouterProvider', '$authProvider', function ($stateProvider, $locationProvider, $urlRouterProvider, $authProvider) {
    const states = [
        {
            name: 'initPage',
            templateUrl: '../../views/initPage.html?v=' + Date.now(),
            url: '/',
            controller: 'loginController'
        },{
            name: 'cartable',
            templateUrl: '../../views/Cartable/cartable.html?v=' + Date.now(),
            url: '/cartable',
            controller: 'cartableCtrl'
        },
        {
            name: 'dashboard',
            templateUrl: '../../views/dashboard.html?v=' + Date.now(),
            url: '/dashboard',
            controller: 'DashboardController'
        }
    ];
    states.forEach((state) => $stateProvider.state(state));
    $urlRouterProvider.otherwise('/');
    //$locationProvider.html5Mode({ enabled: true, requireBase: true });
    $locationProvider.hashPrefix('');
    $authProvider.configure({
        authority: 'https://localhost:4431',
        redirect_uri: 'https://localhost:4433/#/auth/callback/',
        popup_redirect_uri: 'https://localhost:4433/#/auth/popup/',
        redirectCallback: 'https://localhost:4433/',
        silent_redirect_uri: 'https://localhost:4433/#/auth/silent/',
        logout_uri: 'https://localhost:4431/Account/Logout',
        post_logout_redirect_uri: 'https://localhost:4433/',
        client_id: 'dashboard_spa',
        response_type: 'id_token token',
        scope: 'api1 openid profile',
        loadUserInfo: true,
        automaticSilentRenew: false,
        monitorSession: false,
        checkSessionInterval: 0,
        filterProtocolClaims: false,
        silentRequestTimeout: 1000,
        accessTokenExpiringNotificationTime: 60,
        revokeAccessTokenOnSignout: true,
        client_authentication: 'client_secret_basic',
    });
}]);