app.factory('AuthService', function ($auth) {
    return {
        authenticate: () => {
            return $auth.getUser().then((res) => {
                if (res !== null) {
                    return res.access_token !== undefined && !res.expired;
                } else {
                    return false;
                }
            })
        },
        signIn: function () {
            $auth.signinRedirect();
        },
        getUserInfo: function (result) {
            $auth.getUser().then(res => result(res));
        },
        handleRedirectCallback: function () {
            $auth.handleRedirectCallback();
        },
        querySessionStatus: function () {
            return $auth.querySessionStatus();
        },
        signOut: function () {
            $auth.signoutRedirect();
            $auth.revokeAccessToken();
        },
        removeUser: function () {
            $auth.removeUser();
        },
        getAccessToken: function () {
            return $auth.getUser().then((res) => {
                if (res !== null) {
                    return res.access_token;
                } else {
                    return null;
                }
            })
        }
    };
});