//================================================================
app.factory("global", function (RequestApis) {

    return {
        CheckAppNameFromUrl: function () {
            let applications = ["HR", "DASHBOARD"];
            let appNameFromUrl = window.location.pathname.toString().split("/")[1].toUpperCase();
            if (applications.some(x => x === appNameFromUrl)) {
                return `${window.location.origin}/${window.location.pathname.toString().split("/")[1]}`;
            } else {
                return `${window.location.origin}`;
            }
        },
        getMimetype: function (signature) {
            switch (signature.toUpperCase()) {
                case '89504E47':
                    return 'image/png';
                case '47494638':
                 return 'image/gif'
                case '25504446':
                    return 'application/pdf';
                case 'FFD8FFDB':
                case 'FFD8FFE0':
                case 'FFD8FFE1':
                    return 'image/jpeg';
                case '504B0304':
                 return 'application/zip'
                default:
                    return 'Unknown';
            }
        },
        messaging: function (response) {
            let div = document.createElement('div');
            div.style.backgroundColor = "transparent"
            let p = document.createElement('p');
            let html = '';
            let title = '';
            if (this.checkExist(response.data) && this.checkExist(response.data.ModelState)) {
                Object.values(response.data.ModelState).forEach(value => {
                    p.innerHTML = value[0].toString();
                    div.appendChild(p)
                })
                html = div;
            } else if (this.checkExist(response.data) && this.checkExist(response.data.Message)) {
                p.innerHTML = response.data.Message.toString();
                div.appendChild(p)
                html = div;
            } else {
                if (response.status === 200 || response.status === 204) {
                    title = "عملیات با موفقیت انجام شد"
                } else if (response.status === 404 && response.data.length) {
                    title = "آدرسی با مشخصات : [" + response.config.url + "] یافت نشد . لطفا مقادیر ورودی را چک نمایید."
                } else if (response.status === 404 && !response.data.length) {
                    title = "داده ای برای نمایش وجود ندارد"
                } else if (response.status === 403 || response.status === 401) {
                    title = "شما مجوز دسترسی به آدرس : [" + response.config.url + "] را ندارید "
                } else if (response.status === 415) {
                    title = "نوع ورودی قابل قبول نیست. لطفا بررسی نمایید."
                } else if (response.status === 422) {
                    title = "روش ارسالی برای آدرس : [" + response.config.url + "] معتبر نیست. لطفا روش و نوع ارسال داده را بررسی نمایید."
                } else {
                    title = this.checkExist(response.data) && this.checkExist(response.data.Message) ? response.data.Message : 'عملیات با خطا مواجه شد. لطفا مجدد تلاش نمایید...';
                }
            }
            Swal.mixin({
                icon: response.status === 200 || response.status === 204 ? 'success' : 'error',
                title: title,
                html: html,
                width: '700px',
                position: 'center',
                allowOutsideClick: false,
                showConfirmButton: false,
                timer: 1000,
                customClass: {
                    title: 'big-font',
                    confirmButton: 'medium-font',
                    cancelButton: 'medium-font',
                    htmlContainer: 'medium-font w-100'
                },
                timerProgressBar: true,
                didOpen: (toast) => {
                    toast.addEventListener("mouseenter", Swal.stopTimer);
                    toast.addEventListener("mouseleave", Swal.resumeTimer);
                },
            }).fire({});
        },
        Toast: function (icon, title) {
            Swal.mixin({
                icon: icon,
                title: title,
                position: 'center',
                allowOutsideClick: false,
                showConfirmButton: false,
                timer: 2000,
                customClass: {
                    title: 'medium-font',
                    confirmButton: 'medium-font',
                    cancelButton: 'medium-font',
                },
                timerProgressBar: true,
                didOpen: (toast) => {
                    toast.addEventListener("mouseenter", Swal.stopTimer);
                    toast.addEventListener("mouseleave", Swal.resumeTimer);
                },
            }).fire({});
        },
        getQueryParams: function (query) {
            try {
                return JSON.parse('{"' + decodeURI(query).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"') + '"}');
            } catch (error) {
                return false;
            }
        },
        currentUser: function (callback) {
            RequestApis.HR(`personnel/current`, 'get', '', '', '', function (response) {
                RequestApis.HR(`securities/current/user`, 'get', '', '', '', function (user) {
                    callback({personnelInfo: response.data, UserId: Number(user.data)});
                })
            })
        },
        objEqual: function (obj1, obj2) {
            let result = false;
            let iter = 0;
            Object.keys(obj1).forEach(key1 => {
                Object.keys(obj2).forEach(key2 => {
                    if (key1 === key2)
                        if (obj1[key1] === obj2[key2])
                            ++iter;
                })
            })
            if (Object.keys(obj1).length === iter)
                result = true;
            return result;
        }
        ,
        checkExist: function (item) {
            if (item !== undefined) {
                if (item === null || item === '' || item === "") {
                    return false;
                } else if (item !== null && !item.toString().trim().length) {
                    return false;
                } else {
                    let type = typeof (item);
                    switch (type) {
                        case "object":
                            if (item.length === undefined) {
                                if (Object.keys(item).length) {
                                    return true;
                                } else {
                                    return false;
                                }
                            } else {
                                if (item.length) {
                                    return true;
                                } else {
                                    return false;
                                }
                            }
                            break;
                        case "string":
                            if (item === null || !item.length) {
                                return false;
                            } else {
                                return true;
                            }

                            break;
                        case "number":
                            if (item === 0) {
                                return false;
                            } else {
                                return true;
                            }
                            break;
                        default:
                            return false;
                            break;
                    }
                }
            } else {
                return false;
            }
        },
        stringEquality: function (item, value) {
            let result = false;
            if (item.toString().toUpperCase() === value.toString().toUpperCase()) {
                result = true;
            }
            return result;
        }
    };
});