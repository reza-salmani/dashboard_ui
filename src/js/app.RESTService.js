app.factory("RequestApis", function ($http, $rootScope, AuthService) {
    var internal_Path = `src/assets/`;
    var Hr_baseUrl = `${window.location.origin}/HRAPI/api/`;
    var RC_baseUrl = `${window.location.origin}/RCAPI/`;
    var xsrfTrustedOrigins = [`${window.location.origin}`];
    return {
        GetInternalJson: function (route, Response) {
            $http.get(internal_Path + route).then((response) => {
                Response(response);
            }).catch((error) => {
                Response(error);
            });
        },
        /**
         * @param {string} route
         * @param {string} method
         * @param {string} contentType
         * @param {string} responseType
         * @param {any} data
         * @param {function} Response
         */
        HR: function (route, method, contentType, responseType, data, Response) {
            AuthService.getUserInfo(res => {
                if (res === null)
                    AuthService.signIn();
                else {
                    if (res.access_token !== undefined && !res.expired) {
                        AuthService.getAccessToken().then((res => {
                            $http.defaults.headers.common = {
                                'Accept': 'application/json, text/plain, */*',
                                'Content-Type': contentType.length ? `${contentType};charset=utf-8;` : 'application/json;charset=utf-8;',
                                'xsrfCookieName': 'XSRF-TOKEN',
                                'xsrfHeaderName': 'X-XSRF-TOKEN',
                                'xsrfTrustedOrigins': xsrfTrustedOrigins,
                                'Authorization': `Bearer ${res}`
                            };
                            let configs = {
                                url: Hr_baseUrl + route,
                                method: method,
                                responseType: responseType.length ? responseType : 'json'
                            };
                            if (method.toUpperCase() === "DELETE")
                                configs.headers = {
                                    "Content-Type": "application/json; charset=utf-8"
                                };
                            if (contentType === "multipart/form-data")
                                configs.headers = {
                                    "Content-Type": undefined,
                                };
                            // if (method.toUpperCase() !== "GET" && data.toString().length)
                                configs.data = data;
                            $http(configs).then((response) => {
                                Response(response);
                            }).catch((error) => {
                                Response(error);
                            });
                        }));
                    } else {
                        AuthService.signIn();
                    }
                }
            })
        },
        /**
         * @param {string} route
         * @param {string} method
         * @param {string} contentType
         * @param {string} responseType
         * @param {any} data
         * @param {function} Response
         */
        RC: function (route, method, contentType, responseType, data, Response) {
            $http.defaults.headers.common = {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': contentType.length ? `${contentType};charset=utf-8;` : 'application/json;charset=utf-8;',
                'xsrfCookieName': 'XSRF-TOKEN',
                'xsrfHeaderName': 'X-XSRF-TOKEN',
                'xsrfTrustedOrigins': xsrfTrustedOrigins
            };
            let configs = {
                url: RC_baseUrl + route,
                method: method,
                dataType: responseType.length ? responseType.toUpperCase() : 'json'
            };
            if (method.toUpperCase() === "DELETE")
                configs.headers = {
                    "Content-Type": "application/json; charset=utf-8"
                };
            if (method.toUpperCase() !== "GET" && data.toString().length)
                configs.data = data;
            $http(configs).then((response) => {
                Response(response);
            }).catch((error) => {
                Response(error);
            });
        }
    };
});