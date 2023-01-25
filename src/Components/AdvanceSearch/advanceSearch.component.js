function SearchController($scope, RequestApis, $compile, $timeout, global) {
    var $ctrl = this;
    $scope.searchItems = {};
    $scope.advanceSearch = {};
    $scope.advanceSearch.showAll = true;
    $scope.advanceSearch.searchItems = {};
    $scope.advanceSearch.getEmployeeType = {};
    $scope.advanceSearch.maritalStateOn = true;
    $scope.advanceSearch.employeeStateOn = true;
    $scope.advanceSearch.getEmployeeType.PageSize = 10;
    $scope.advanceSearch.getEmployeeType.PageIndex = 1;
    $ctrl.$onInit = function () {
        $scope.advanceSearch.getChartBySDate = $ctrl.searchData.startDate;
        $scope.advanceSearch.getChartByFDate = $ctrl.searchData.finishDate;
    }
    $scope.advanceSearch.checkVisibilityItem = function (item) {
        result = false;
        if ($ctrl.searchData.Items.some(x => x === item)) {
            result = true;
        }
        return result;
    }
    //======================= use checkExistIn html ===========
    $scope.checkingExist = function (item) {
        return global.checkExist(item);
    }
    //======================= input masks =====================
    $scope.inputMasks = function () {
        $(".precent").inputmask('integer', {min: 0, max: 100});
        $(".precentF").inputmask({
            alias: "numeric",
            integerDigits: 3,
            digits: 2,
            max: 100,
            allowMinus: false,
            digitsOptional: false,
        });
        $(".numeric").inputmask('integer', {min: 0});
        $('.numeric').change(function () {
            angular.element($(this)).triggerHandler('input');
        });
        $('.numericF').change(function () {
            angular.element($(this)).triggerHandler('input');
        });
        $('.precent').change(function () {
            angular.element($(this)).triggerHandler('input');
        });
    };
    $scope.inputMasks();
    //==================== maritalState Section =========================
    $scope.advanceSearch.returnedMaritalStateData = {}
    $scope.advanceSearch.getMaritalStateData = {
        data: [],
        lable: "وضعیت تاهل",
        parameter: [{latin: 'Title', per: 'عنوان'}]

    }
    $scope.advanceSearch.getMaritalStateFunc = function () {
        RequestApis.HR(`constants/enum/MaritalState`, 'Get', '', '', '', function (response) {
            if (response.status === 200) {
                $scope.advanceSearch.getMaritalStateData.data = response.data
            }
        })
    }
    $scope.advanceSearch.getMaritalStateFunc();
    $scope.advanceSearch.returnMaritalStateFunc = function (data = $scope.advanceSearch.getMaritalStateData.data) {
        if (global.checkExist(data.item)) {
            let newId = 0;
            if (data.type.toUpperCase() === "SELECTEDTHISPAGE" || data.type.toUpperCase() === "SELECTED") {
                Object.values(data.item).forEach(x => {
                    newId += Number(x.Id);
                })
                $scope.advanceSearch.searchItems.mariageState = newId.toString();
            }
        } else {
            $scope.advanceSearch.searchItems.mariageState = "";
            $scope.advanceSearch.getMaritalStateFunc();
        }
    }

    //================= select chart ==============================
    $scope.advanceSearch.changeSelectPostStatus = function () {
        $scope.advanceSearch.selectPostStatus = !$scope.advanceSearch.selectPostStatus;
    }
    $scope.advanceSearch.dataunit = {
        data: {},
        status: true
    }
    $scope.advanceSearch.useSelectedChart = function (data = $scope.advanceSearch.dataunit.data) {
        if ($scope.advanceSearch.dataunit.status === false) {
            $scope.advanceSearch.chartOrganizationInfo = data.data;
            $scope.advanceSearch.searchItems.tri = data.data.Id;
            $scope.advanceSearch.searchItems.treeName = data.data.Title
            $scope.advanceSearch.changeSelectPostStatus();
        }
    }
    $scope.advanceSearch.clearChart = function () {
        $scope.advanceSearch.searchItems.tri = null;
        $scope.advanceSearch.searchItems.treeName = "";
        $scope.advanceSearch.changeSelectPostStatus();
    }

    //=================== Employee Type ===================
    $scope.advanceSearch.returnedEmployeeTypeData = {}
    $scope.advanceSearch.getEmployeeType = {
        data: {},
        PageSize: 10,
        PageIndex: 1,
        TotalRow: null,
        TotalPages: null,
        lable: "نوع استخدام",
        parameter: [{latin: 'Title', per: 'عنوان'}]

    }
    $scope.advanceSearch.getDataEmployeeTypeFunc = function (querys) {
        let path = `employees/type?ps=${$scope.advanceSearch.getEmployeeType.PageSize}&pn=${$scope.advanceSearch.getEmployeeType.PageIndex}`;
        if (global.checkExist(querys)) {
            path = `employees/type?ps=${$scope.advanceSearch.getEmployeeType.PageSize}&pn=${$scope.advanceSearch.getEmployeeType.PageIndex}${querys}`;
        }
        RequestApis.HR(path, 'Get', '', '', '', function (response) {
            if (response.status === 200) {
                $scope.advanceSearch.getEmployeeType.data = response.data.Items;
                $scope.advanceSearch.getEmployeeType.PageIndex = response.data.PageIndex;
                $scope.advanceSearch.getEmployeeType.PageSize = response.data.PageSize;
                $scope.advanceSearch.getEmployeeType.TotalRow = response.data.TotalRow;
                $scope.advanceSearch.getEmployeeType.TotalPages = response.data.TotalPages;
                if ($scope.advanceSearch.getEmployeeType.TotalPages === 1) {
                    $scope.advanceSearch.EmployeeTypePageNumber = 1;
                }
            }

        })
    }
    $scope.advanceSearch.getDataEmployeeTypeFunc();
    $scope.advanceSearch.returnDataEmployeeTypeFunc = function (data = $scope.advanceSearch.getEmployeeType.data) {
        if (global.checkExist(data.item)) {
            if (data.type.toUpperCase() === "PAGESIZE") {
                $scope.advanceSearch.getEmployeeType.PageSize = data.item
                $scope.advanceSearch.getDataEmployeeTypeFunc();
            }
            if (data.type.toUpperCase() === "PAGENUMBER") {
                $scope.advanceSearch.getEmployeeType.PageIndex = data.item
                $scope.advanceSearch.getDataEmployeeTypeFunc();
            }
            if (data.type.toUpperCase() === "SEARCH") {
                $scope.advanceSearch.getEmployeeType.PageIndex = 1;
                $scope.advanceSearch.getEmployeeType.PageSize = 10;
                $scope.advanceSearch.getDataEmployeeTypeFunc(`&etq=${data.item.search}`);
            }
            if (data.type.toUpperCase() === "SELECTED") {
                let newId = "";
                Object.values(data.item).forEach(x => {
                    if (!global.checkExist(newId)) {
                        newId += x.Id;
                    } else {
                        newId = newId.concat(",", x.Id);
                    }
                })
                $scope.advanceSearch.searchItems.employeeType = newId;
            }
        } else {
            $scope.advanceSearch.getDataEmployeeTypeFunc();
            $scope.advanceSearch.searchItems.employeeType = "";
        }
    }

    //=================== Employee state ===================
    $scope.advanceSearch.returnedEmployeeStateData = {}
    $scope.advanceSearch.getEmployeeState = {
        data: {},
        PageSize: 10,
        PageIndex: 1,
        TotalRow: null,
        TotalPages: null,
        lable: "وضعیت استخدام",
        parameter: [{latin: 'Title', per: 'عنوان'}]

    }
    $scope.advanceSearch.getDataEmployeeStateFunc = function (querys) {
        let path = `employees/state?ps=${$scope.advanceSearch.getEmployeeState.PageSize}&pn=${$scope.advanceSearch.getEmployeeState.PageIndex}`;
        if (global.checkExist(querys)) {
            path = `employees/state?ps=${$scope.advanceSearch.getEmployeeState.PageSize}&pn=${$scope.advanceSearch.getEmployeeState.PageIndex}${querys}`;
        }
        RequestApis.HR(`${path}`, 'Get', '', '', '', function (response) {
            $scope.advanceSearch.getEmployeeState.data = response.data.Items;
            $scope.advanceSearch.getEmployeeState.PageIndex = response.data.PageIndex;
            $scope.advanceSearch.getEmployeeState.PageSize = response.data.PageSize;
            $scope.advanceSearch.getEmployeeState.TotalRow = response.data.TotalRow;
            $scope.advanceSearch.getEmployeeState.TotalPages = response.data.TotalPages;
            if ($scope.advanceSearch.getEmployeeState.TotalPages === 1) {
                $scope.advanceSearch.EmployeeTypePageNumber = 1;
            }
        })
    }
    $scope.advanceSearch.getDataEmployeeStateFunc();
    $scope.advanceSearch.returnDataEmployeeStateFunc = function (data = $scope.advanceSearch.getEmployeeState.data) {
        if (global.checkExist(data.item)) {
            if (data.type.toUpperCase() === "PAGESIZE") {
                $scope.advanceSearch.getEmployeeState.PageSize = data.item
                $scope.advanceSearch.getDataEmployeeStateFunc();
            }
            if (data.type.toUpperCase() === "PAGENUMBER") {
                $scope.advanceSearch.getEmployeeState.PageIndex = data.item
                $scope.advanceSearch.getDataEmployeeStateFunc();
            }
            if (data.type.toUpperCase() === "SEARCH") {
                $scope.advanceSearch.getEmployeeState.PageSize = 10;
                $scope.advanceSearch.getEmployeeState.PageIndex = 1;
                $scope.advanceSearch.getDataEmployeeStateFunc(`&q=${data.item.search}`);
            }
            if (data.type.toUpperCase() === "SELECTED") {
                let newId = "";
                Object.values(data.item).forEach(x => {
                    if (!global.checkExist(newId)) {
                        newId += x.Id;
                    } else {
                        newId = newId.concat(",", x.Id);
                    }
                    ;
                })
                $scope.advanceSearch.searchItems.employeeState = newId;
            }
        } else {
            $scope.advanceSearch.getDataEmployeeStateFunc();
            $scope.advanceSearch.searchItems.employeeState = "";
        }
    }

    //=================== JobType ===================
    $scope.advanceSearch.returnedJobTypeData = {}
    $scope.advanceSearch.getJobTypeData = {
        data: [],
        lable: "پایه شغلی",
        parameter: [{latin: 'Title', per: 'عنوان'}]

    }
    $scope.advanceSearch.getJobTypeFunc = function () {
        RequestApis.HR(`constants/enum/JobType`, 'Get', '', '', '', function (response) {
            $scope.advanceSearch.getJobTypeData.data = response.data
        })
    }
    $scope.advanceSearch.getJobTypeFunc();
    $scope.advanceSearch.returnJobTypeFunc = function (data = $scope.advanceSearch.getJobTypeData.data) {
        if (global.checkExist(data.item)) {
            let newId = 0;
            if (data.type.toUpperCase() === "SELECTEDTHISPAGE" || data.type.toUpperCase() === "SELECTED") {
                Object.values(data.item).forEach(x => {
                    newId += Number(x.Id);
                })
                $scope.advanceSearch.searchItems.baseJob = newId.toString();
            }
        } else {
            $scope.advanceSearch.searchItems.baseJob = "";
            $scope.advanceSearch.getJobTypeFunc();
        }
    }

    //============================ war state =========================
    $scope.advanceSearch.returnedWarStateData = {}
    $scope.advanceSearch.getWarStateData = {
        data: [],
        lable: "وضعیت ایثارگری",
        parameter: [{latin: 'Title', per: 'عنوان'}]

    }
    $scope.advanceSearch.getWarStateFunc = function () {
        RequestApis.HR(`scores/war/types`, 'Get', '', '', '', function (response) {
            $scope.advanceSearch.getWarStateData.data = response.data
        })
    }
    $scope.advanceSearch.getWarStateFunc();
    $scope.advanceSearch.returnWarStateFunc = function (data = $scope.advanceSearch.getWarStateData.data) {
        if (global.checkExist(data.item)) {
            let newId = 0;
            if (data.type.toUpperCase() === "SELECTEDTHISPAGE" || data.type.toUpperCase() === "SELECTED") {
                Object.values(data.item).forEach(x => {
                    newId += Number(x.Id);
                })
                $scope.advanceSearch.searchItems.warState = newId.toString();
            }
        } else {
            $scope.advanceSearch.searchItems.warState = "";
            $scope.advanceSearch.getWarStateFunc();
        }
    }

    //============================ war state relative =========================
    $scope.advanceSearch.returnedWarStateRelativeData = {}
    $scope.advanceSearch.getWarStateRelativeData = {
        data: [],
        lable: "رابطه وضعیت ایثارگری",
        parameter: [{latin: 'Title', per: 'عنوان'}]

    }
    $scope.advanceSearch.getWarStateRelativeFunc = function () {
        RequestApis.HR(`constants/enum/relative`, 'Get', '', '', '', function (response) {
            $scope.advanceSearch.getWarStateRelativeData.data = response.data
        })
    }
    $scope.advanceSearch.getWarStateRelativeFunc();
    $scope.advanceSearch.returnWarStateRelativeFunc = function (data = $scope.advanceSearch.getWarStateRelativeData.data) {
        if (global.checkExist(data.item)) {
            let newId = 0;
            if (data.type.toUpperCase() === "SELECTEDTHISPAGE" || data.type.toUpperCase() === "SELECTED") {
                Object.values(data.item).forEach(x => {
                    newId += Number(x.Id);
                })
                $scope.advanceSearch.searchItems.warRelativeState = newId.toString();
            }
        } else {
            $scope.advanceSearch.searchItems.warRelativeState = "";
            $scope.advanceSearch.getWarStateRelativeFunc();
        }
    }

    //============================ post class =========================
    $scope.advanceSearch.returnedPostClassData = {}
    $scope.advanceSearch.getPostClass = {
        data: {},
        PageSize: 10,
        PageIndex: 1,
        TotalRow: null,
        TotalPages: null,
        lable: "رده پست",
        parameter: [{latin: 'Title', per: 'عنوان'}]

    }
    $scope.advanceSearch.getDataPostClassFunc = function (querys) {
        let path = `postclasses?ps=${$scope.advanceSearch.getPostClass.PageSize}&pn=${$scope.advanceSearch.getPostClass.PageIndex}`;
        if (global.checkExist(querys)) {
            path = `postclasses?ps=${$scope.advanceSearch.getPostClass.PageSize}&pn=${$scope.advanceSearch.getPostClass.PageIndex}${querys}`;
        }
        RequestApis.HR(path, 'Get', '', '', '', function (response) {
            $scope.advanceSearch.getPostClass.data = response.data.Items;
            $scope.advanceSearch.getPostClass.PageIndex = response.data.PageIndex;
            $scope.advanceSearch.getPostClass.PageSize = response.data.PageSize;
            $scope.advanceSearch.getPostClass.TotalRow = response.data.TotalRow;
            $scope.advanceSearch.getPostClass.TotalPages = response.data.TotalPages;
            if ($scope.advanceSearch.getPostClass.TotalPages === 1) {
                $scope.advanceSearch.PostClassPageNumber = 1;
            }
        })
    }
    $scope.advanceSearch.getDataPostClassFunc();
    $scope.advanceSearch.returnDataPostClassFunc = function (data = $scope.advanceSearch.getPostClass.data) {
        if (global.checkExist(data.item)) {
            if (data.type.toUpperCase() === "PAGESIZE") {
                $scope.advanceSearch.getPostClass.PageSize = data.item
                $scope.advanceSearch.getDataPostClassFunc();
            }
            if (data.type.toUpperCase() === "PAGENUMBER") {
                $scope.advanceSearch.getPostClass.PageIndex = data.item
                $scope.advanceSearch.getDataPostClassFunc();
            }
            if (data.type.toUpperCase() === "SEARCH") {
                $scope.advanceSearch.getPostClass.PageSize = 10;
                $scope.advanceSearch.getPostClass.PageIndex = 1;
                $scope.advanceSearch.getDataPostClassFunc(`&q=${data.item.search}`);
            }
            if (data.type.toUpperCase() === "SELECTED") {
                let newId = "";
                Object.values(data.item).forEach(x => {
                    if (!global.checkExist(newId)) {
                        newId += x.Id;
                    } else {
                        newId = newId.concat(",", x.Id);
                    }
                    ;
                })
                $scope.advanceSearch.searchItems.postClass = newId;
            }
        } else {
            $scope.advanceSearch.getDataPostClassFunc();
            $scope.advanceSearch.searchItems.postClass = "";
        }
    }

    //============================ grade =========================
    $scope.advanceSearch.returnedGradeData = {}
    $scope.advanceSearch.getGradeData = {
        data: [],
        lable: "رتبه",
        parameter: [{latin: 'Title', per: 'عنوان'}]

    }
    $scope.advanceSearch.getGradeFunc = function () {
        RequestApis.HR(`experttypes/simple`, 'Get', '', '', '', function (response) {
            $scope.advanceSearch.getGradeData.data = response.data
        })
    }
    $scope.advanceSearch.getGradeFunc();
    $scope.advanceSearch.returnGradeFunc = function (data = $scope.advanceSearch.getGradeData.data) {
        if (global.checkExist(data.item)) {
            let newId = "";
            if (data.type.toUpperCase() === "SELECTEDTHISPAGE" || data.type.toUpperCase() === "SELECTED") {
                Object.values(data.item).forEach(x => {
                    if (!global.checkExist(newId)) {
                        newId += x.Id;
                    } else {
                        newId = newId.concat(",", x.Id);
                    }
                })
                $scope.advanceSearch.searchItems.Grade = newId;
            }
        } else {
            $scope.advanceSearch.searchItems.Grade = "";
            $scope.advanceSearch.getGradeFunc();
        }
    }

    //============================ job Field =========================
    $scope.advanceSearch.returnedJobFieldData = {}
    $scope.advanceSearch.getJobField = {
        data: {},
        PageSize: 10,
        PageIndex: 1,
        TotalRow: null,
        TotalPages: null,
        lable: "رسته و رشته شغلی",
        parameter: [{latin: 'Title', per: 'عنوان'}]

    }
    $scope.advanceSearch.getDataJobFieldFunc = function (querys) {
        let path = `postcategories/auto?ps=${$scope.advanceSearch.getJobField.PageSize}&pn=${$scope.advanceSearch.getJobField.PageIndex}`;
        if (global.checkExist(querys)) {
            path = `postcategories/auto?ps=${$scope.advanceSearch.getJobField.PageSize}&pn=${$scope.advanceSearch.getJobField.PageIndex}${querys}`;
        }
        RequestApis.HR(path, 'Get', '', '', '', function (response) {
            $scope.advanceSearch.getJobField.data = response.data.Items;
            $scope.advanceSearch.getJobField.PageIndex = response.data.PageIndex;
            $scope.advanceSearch.getJobField.PageSize = response.data.PageSize;
            $scope.advanceSearch.getJobField.TotalRow = response.data.TotalRow;
            $scope.advanceSearch.getJobField.TotalPages = response.data.TotalPages;
            if ($scope.advanceSearch.getJobField.TotalPages === 1) {
                $scope.advanceSearch.JobFieldPageNumber = 1;
            }
        })
    }
    $scope.advanceSearch.getDataJobFieldFunc();
    $scope.advanceSearch.returnJobFieldFunc = function (data = $scope.advanceSearch.getJobField.data) {
        if (global.checkExist(data.item)) {
            if (data.type.toUpperCase() === "PAGESIZE") {
                $scope.advanceSearch.getJobField.PageSize = data.item
                $scope.advanceSearch.getDataJobFieldFunc();
            }
            if (data.type.toUpperCase() === "PAGENUMBER") {
                $scope.advanceSearch.getJobField.PageIndex = data.item
                $scope.advanceSearch.getDataJobFieldFunc();
            }
            if (data.type.toUpperCase() === "SEARCH") {
                $scope.advanceSearch.getJobField.PageSize = 10;
                $scope.advanceSearch.getJobField.PageIndex = 1;
                $scope.advanceSearch.getDataJobFieldFunc(`&q=${data.item.search}`);
            }
            if (data.type.toUpperCase() === "SELECTED") {
                let newId = "";
                Object.values(data.item).forEach(x => {
                    if (!global.checkExist(newId)) {
                        newId += x.Id;
                    } else {
                        newId = newId.concat(",", x.Id);
                    }
                })
                $scope.advanceSearch.searchItems.jobField = newId;
            }
        } else {
            $scope.advanceSearch.getDataJobFieldFunc();
            $scope.advanceSearch.searchItems.jobField = "";
        }
    }

    //============================ class =========================
    $scope.advanceSearch.returnedClassData = {}
    $scope.advanceSearch.getClassData = {
        data: [],
        lable: "طبقه",
        parameter: [{latin: 'Title', per: 'عنوان'}]

    }
    $scope.advanceSearch.getClassFunc = function () {
        RequestApis.HR(`jobpositions/simple`, 'Get', '', '', '', function (response) {
            $scope.advanceSearch.getClassData.data = response.data
        })
    }
    $scope.advanceSearch.getClassFunc();
    $scope.advanceSearch.returnClassFunc = function (data = $scope.advanceSearch.getClassData.data) {
        if (global.checkExist(data.item)) {
            let newId = "";
            if (data.type.toUpperCase() === "SELECTEDTHISPAGE" || data.type.toUpperCase() === "SELECTED") {
                Object.values(data.item).forEach(x => {
                    if (!global.checkExist(newId)) {
                        newId += x.Id;
                    } else {
                        newId = newId.concat(",", x.Id);
                    }
                })
                $scope.advanceSearch.searchItems.class = newId;
            }
        } else {
            $scope.advanceSearch.searchItems.class = "";
            $scope.advanceSearch.getClassFunc();
        }
    }
    //============================ add to filter =========================

    $scope.advanceSearch.AddFilter = function (filters) {
        let seachQuery = "";
        if (global.checkExist(filters)) {
            if (global.checkExist(filters.tri)) {
                if (seachQuery.length)
                    seachQuery += `&tri=${filters.tri}`
                else
                    seachQuery += `?tri=${filters.tri}`
            }
            if (global.checkExist(filters.name)) {
                if (seachQuery.length)
                    seachQuery += `&n=${filters.name}`
                else
                    seachQuery += `?n=${filters.name}`
            }
            if (global.checkExist(filters.family)) {
                if (seachQuery.length)
                    seachQuery += `&f=${filters.family}`
                else
                    seachQuery += `?f=${filters.family}`
            }
            if (global.checkExist(filters.fatherName)) {
                if (seachQuery.length)
                    seachQuery += `&fn=${filters.fatherName}`
                else
                    seachQuery += `?fn=${filters.fatherName}`
            }
            if (global.checkExist(filters.nationalCode)) {
                if (seachQuery.length)
                    seachQuery += `&nc=${filters.nationalCode}`
                else
                    seachQuery += `?nc=${filters.nationalCode}`
            }
            if (global.checkExist(filters.sex)) {
                if (seachQuery.length)
                    seachQuery += `&gn=${filters.sex}`
                else
                    seachQuery += `?gn=${filters.sex}`
            }
            if (global.checkExist(filters.ageFrom)) {
                if (seachQuery.length)
                    seachQuery += `&ag1=${filters.ageFrom}`
                else
                    seachQuery += `?ag1=${filters.ageFrom}`
            }
            if (global.checkExist(filters.ageUntil)) {
                if (seachQuery.length)
                    seachQuery += `&ag2=${filters.ageUntil}`
                else
                    seachQuery += `?ag2=${filters.ageUntil}`
            }
            if (global.checkExist(filters.childrenCountFrom)) {
                if (seachQuery.length)
                    seachQuery += `&cf=${filters.childrenCountFrom}`
                else
                    seachQuery += `?cf=${filters.childrenCountFrom}`
            }
            if (global.checkExist(filters.childrenCountUntil)) {
                if (seachQuery.length)
                    seachQuery += `&cu=${filters.childrenCountUntil}`
                else
                    seachQuery += `?cu=${filters.childrenCountUntil}`
            }
            if (global.checkExist($scope.advanceSearch.searchItems.mariageState)) {
                if (seachQuery.length)
                    seachQuery += `&ms=${$scope.advanceSearch.searchItems.mariageState}`
                else
                    seachQuery += `?ms=${$scope.advanceSearch.searchItems.mariageState}`
            }
            if (global.checkExist(filters.employeeFrom)) {
                if (seachQuery.length)
                    seachQuery += `&efd=${filters.employeeFrom}`
                else
                    seachQuery += `?efd=${filters.employeeFrom}`
            }
            if (global.checkExist(filters.employeeUntil)) {
                if (seachQuery.length)
                    seachQuery += `&eud=${filters.employeeUntil}`
                else
                    seachQuery += `?eud=${filters.employeeUntil}`
            }
            if (global.checkExist(filters.employeeCode)) {
                if (seachQuery.length)
                    seachQuery += `&dn=${filters.employeeCode}`
                else
                    seachQuery += `?dn=${filters.employeeCode}`
            }
            if (global.checkExist($scope.advanceSearch.searchItems.employeeType)) {
                if (seachQuery.length)
                    seachQuery += `&et=${$scope.advanceSearch.searchItems.employeeType}`
                else
                    seachQuery += `?et=${$scope.advanceSearch.searchItems.employeeType}`
            }
            if (global.checkExist($scope.advanceSearch.searchItems.employeeState)) {
                if (seachQuery.length)
                    seachQuery += `&es=${$scope.advanceSearch.searchItems.employeeState}`
                else
                    seachQuery += `?es=${$scope.advanceSearch.searchItems.employeeState}`
            }
            if (global.checkExist($scope.advanceSearch.searchItems.baseJob)) {
                if (seachQuery.length)
                    seachQuery += `&jt=${$scope.advanceSearch.searchItems.baseJob}`
                else
                    seachQuery += `?jt=${$scope.advanceSearch.searchItems.baseJob}`
            }
            if (global.checkExist($scope.advanceSearch.searchItems.warState)) {
                if (seachQuery.length)
                    seachQuery += `&wt=${$scope.advanceSearch.searchItems.warState}`
                else
                    seachQuery += `?wt=${$scope.advanceSearch.searchItems.warState}`
            }
            if (global.checkExist($scope.advanceSearch.searchItems.warRelativeState)) {
                if (seachQuery.length)
                    seachQuery += `&rl=${$scope.advanceSearch.searchItems.warRelativeState}`
                else
                    seachQuery += `?rl=${$scope.advanceSearch.searchItems.warRelativeState}`
            }
            if (global.checkExist($scope.advanceSearch.searchItems.postClass)) {
                if (seachQuery.length)
                    seachQuery += `&pc=${$scope.advanceSearch.searchItems.postClass}`
                else
                    seachQuery += `?pc=${$scope.advanceSearch.searchItems.postClass}`
            }
            if (global.checkExist($scope.advanceSearch.searchItems.Grade)) {
                if (seachQuery.length)
                    seachQuery += `&xpt=${$scope.advanceSearch.searchItems.Grade}`
                else
                    seachQuery += `?xpt=${$scope.advanceSearch.searchItems.Grade}`
            }
            if (global.checkExist($scope.advanceSearch.searchItems.jobField)) {
                if (seachQuery.length)
                    seachQuery += `&pct=${$scope.advanceSearch.searchItems.jobField}`
                else
                    seachQuery += `?pct=${$scope.advanceSearch.searchItems.jobField}`
            }
            if (global.checkExist($scope.advanceSearch.searchItems.class)) {
                if (seachQuery.length)
                    seachQuery += `&jp=${$scope.advanceSearch.searchItems.class}`
                else
                    seachQuery += `?jp=${$scope.advanceSearch.searchItems.class}`
            }
        }
        $ctrl.searchData.data = seachQuery;
        $ctrl.returnFunc($ctrl.searchData);
    }
    //============================ remove fiels section ==================
    $scope.removeNameParam = function () {
        $scope.advanceSearch.searchItems.name = '';
    }
    $scope.removeFamilyParam = function () {
        $scope.advanceSearch.searchItems.family = '';
    }
    $scope.removeFatherNameParam = function () {
        $scope.advanceSearch.searchItems.fatherName = '';
    }
    $scope.removeNationalCodeParam = function () {
        $scope.advanceSearch.searchItems.nationalCode = '';
    }
    $scope.removeAgeFromParam = function () {
        $scope.advanceSearch.searchItems.ageFrom = '';
    }
    $scope.removeAgeUntilParam = function () {
        $scope.advanceSearch.searchItems.ageUntil = '';
    }
    $scope.removeChildrenCountFromParam = function () {
        $scope.advanceSearch.searchItems.childrenCountFrom = '';
    }
    $scope.removeChildrenCountUntilParam = function () {
        $scope.advanceSearch.searchItems.childrenCountUntil = '';
    }
    $scope.removePersonnelCodeParam = function () {
        $scope.advanceSearch.searchItems.personnelCode = '';
    }
    $scope.removeEmployeeFromParam = function () {
        $scope.advanceSearch.searchItems.employeeFrom = '';
    }
    $scope.removeEmployeeUntilParam = function () {
        $scope.advanceSearch.searchItems.employeeUntil = '';
    }
    $scope.removeEmployeeCodeParam = function () {
        $scope.advanceSearch.searchItems.employeeCode = '';
    }
    $scope.advanceSearch.clearFilter = function () {
        $scope.advanceSearch.searchItems = {};
        $scope.advanceSearch.showAll = false;
        $timeout(function () {
            $scope.advanceSearch.showAll = true;
        }, 10)
    }
}

// ===================================================== create component ================================================
//$scope.SearchData = {
//    Items: ["name", "family", "fatherName", "nationalCode", "sex", "age", "maritalState", "childCount", "dossierNum", "personnelNum", "chart", "employeeState", "employeeDate", "employee", "jobLevel", "sacrificeState", "sacrificeRelation", "postGrade", "grade", "jobField", "class"],
//    startDate: moment().format('jYYYY/jMM/jDD'),
//    finishDate: moment().format('jYYYY/jMM/jDD'),
//}
/*<advance-search search-data="SearchData" acardion-heading="advanceSearch-headingp" acardion-target="advanceSearch-collapsep" return-search-data-func="returnSearchDataFunc" by-start-date="byStartDate" by-finish-date="byFinishDate"></advance-search>*/
app.component("advanceSearch", {
    bindings: {
        searchData: "=",
        returnFunc: "&",
        acardionHeading: "@",
        acardionTarget: "@"
    },
    controller: SearchController,
    template: `<style>
    .input-group-prepend, .input-group-text {
        width: 100px !important;
    }
</style>
<div class="card">
    <div class="row" ng-if="advanceSearch.showAll">
        <div class="col-lg-4" ng-if="advanceSearch.checkVisibilityItem('name')">
            <div class="input-group">
                <div class="input-group-prepend">
                    <label class="input-group-text">
                        نام
                    </label>
                </div>
                <input class="form-control" type="text" ng-model="advanceSearch.searchItems.name">
                <i class="far fa-close text-danger" style="position: absolute;left: 5%;top: 0.3em;"
                   ng-show="checkingExist(advanceSearch.searchItems.name)" ng-click="removeNameParam()"></i>
            </div>
        </div>
        <div class="col-lg-4" ng-if="advanceSearch.checkVisibilityItem('family')">
            <div class="input-group">
                <div class="input-group-prepend">
                    <label class="input-group-text">
                        نام خانوادگی
                    </label>
                </div>
                <input class="form-control" type="text" ng-model="advanceSearch.searchItems.family">
                <span  style="position: absolute;left: 5%;top: 0.3em;"
                   ng-show="checkingExist(advanceSearch.searchItems.family)" ng-click="removeFamilyParam()"><i class="far fa-close text-danger"></i></span>
            </div>
        </div>
        <div class="col-lg-4" ng-if="advanceSearch.checkVisibilityItem('fatherName')">
            <div class="input-group">
                <div class="input-group-prepend">
                    <label class="input-group-text">
                        نام پدر
                    </label>
                </div>
                <input class="form-control" type="text" ng-model="advanceSearch.searchItems.fatherName">
                <span style="position: absolute;left: 5%;top: 0.3em;"
                   ng-show="checkingExist(advanceSearch.searchItems.fatherName)" ng-click="removeFatherNameParam()"><i class="far fa-close text-danger"></i></span>
            </div>
        </div>
        <div class="col-lg-4" ng-if="advanceSearch.checkVisibilityItem('nationalCode')">
            <div class="input-group">
                <div class="input-group-prepend">
                    <label class="input-group-text">
                        کد ملی
                    </label>
                </div>
                <input type="text" class="form-control" ng-model="advanceSearch.searchItems.nationalCode">
                <span style="position: absolute;left: 5%;top: 0.3em;"
                   ng-show="checkingExist(advanceSearch.searchItems.nationalCode)" ng-click="removeNationalCodeParam()"><i class="far fa-close text-danger"></i></span>
            </div>
        </div>
        <div class="col-lg-4" ng-if="advanceSearch.checkVisibilityItem('sex')">
            <div class="input-group">
                <div class="input-group-prepend">
                    <label class="input-group-text">
                        جنسیت
                    </label>
                </div>
                <div class="form-control bg-transparent">
                    <div class="row col-12 justify-content-center" >
                        <div class="d-flex ml-4 mr-2">
                            <input type="radio" id="customRadio" ng-model="advanceSearch.searchItems.sex" name="marige" value="{{null}}">
                            <label class=" pt-1" for="customRadio">هردو</label>
                        </div>
                        <div class="d-flex ml-4">
                            <input type="radio" id="customRadio1" ng-model="advanceSearch.searchItems.sex" name="marige" value="1">
                            <label class=" pt-1" for="customRadio1">مرد</label>
                        </div>
                        <div class="d-flex">
                            <input type="radio" id="customRadio2" ng-model="advanceSearch.searchItems.sex" name="marige" value="2">
                            <label class=" pt-1" for="customRadio2">زن</label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-lg-4" ng-if="advanceSearch.checkVisibilityItem('age')">
            <div class="input-group">
                <div class="input-group-prepend">
                    <label class="input-group-text">
                        سن از
                    </label>
                </div>
                <input type="text" class="form-control ml-1" ng-model="advanceSearch.searchItems.ageFrom">
                <span style="position: absolute;left: 5%;top: 0.3em;"
                   ng-show="checkingExist(advanceSearch.searchItems.ageFrom)" ng-click="removeAgeFromParam()"><i class="far fa-close text-danger"></i></span>
                <p class="small-font p-0 m-0 mt-2">تا</p>
                <input type="text" class="form-control mr-1" ng-model="advanceSearch.searchItems.ageUntil">
                <span style="position: absolute;left: 5%;top: 0.3em;"
                   ng-show="checkingExist(advanceSearch.searchItems.ageUntil)" ng-click="removeAgeUntilParam()"><i class="far fa-close text-danger"></i></span>
            </div>
        </div>
        <div class="col-lg-4" ng-if="advanceSearch.checkVisibilityItem('maritalState')" ng-click="advanceSearch.getMaritalStateFunc()">
            <custom-select selected-id="AdvanceSearch_1" disabled="false" required="false" footer="false" max-selectable="0" get-data="advanceSearch.getMaritalStateData" returned-data="advanceSearch.returnedMaritalStateData" return-func="advanceSearch.returnMaritalStateFunc(advanceSearch.returnedMaritalStateData)"></custom-select>
        </div>
        <div class="col-lg-4" ng-if="advanceSearch.checkVisibilityItem('childCount')">
            <div class="input-group">
                <div class="input-group-prepend">
                    <label class="input-group-text">
                        تعداد فرزند از
                    </label>
                </div>
                <input type="text" class="form-control ml-1" ng-model="advanceSearch.searchItems.childrenCountFrom">
                <span style="position: absolute;left: 5%;top: 0.3em;"
                   ng-show="checkingExist(advanceSearch.searchItems.childrenCountFrom)" ng-click="removeChildrenCountFromParam()"><i class="far fa-close text-danger"></i></span>
                <p class="small-font p-0 m-0 mt-2">تا</p>
                <input type="text" class="form-control mr-1" ng-model="advanceSearch.searchItems.childrenCountUntil">
                <span style="position: absolute;left: 5%;top: 0.3em;"
                   ng-show="checkingExist(advanceSearch.searchItems.childrenCountUntil)" ng-click="removeChildrenCountUntilParam()"><i class="far fa-close text-danger"></i></span>
            </div>
        </div>
        <div class="col-11 mr-auto  ml-auto mt-1 mb-1 d-flex justify-content-center border"></div>
        <div class="col-lg-4" ng-if="advanceSearch.checkVisibilityItem('dossierNum')">
            <div class="input-group">
                <div class="input-group-prepend">
                    <label class="input-group-text">
                        شماره مستخدم
                    </label>
                </div>
                <input class="form-control" type="text" ng-model="advanceSearch.searchItems.personnelCode">
                <span style="position: absolute;left: 5%;top: 0.3em;"
                   ng-show="checkingExist(advanceSearch.searchItems.personnelCode)" ng-click="removePersonnelCodeParam()"><i class="far fa-close text-danger"></i></span>
            </div>
        </div>
        <div class="col-lg-4" ng-if="advanceSearch.checkVisibilityItem('employeeDate')">
            <div class="input-group">
                <div class="input-group-prepend">
                    <label class="input-group-text">
                        استخدام از
                    </label>
                </div>
                <input type="text" class="form-control ml-1 date-picker" ng-model="advanceSearch.searchItems.employeeFrom">
                <span style="position: absolute;left: 5%;top: 0.3em;"
                   ng-show="checkingExist(advanceSearch.searchItems.employeeFrom)" ng-click="removeEmployeeFromParam()"><i class="far fa-close text-danger"></i></span>
                <p class="small-font p-0 m-0 mt-2">تا</p>
                <input type="text" class="form-control mr-1  date-picker" ng-model="advanceSearch.searchItems.employeeUntil">
                <span style="position: absolute;left: 5%;top: 0.3em;"
                   ng-show="checkingExist(advanceSearch.searchItems.employeeUntil)" ng-click="removeEmployeeUntilParam()"><i class="far fa-close text-danger"></i></span>
            </div>
        </div>

        <div class="col-lg-4" ng-if="advanceSearch.checkVisibilityItem('employee')">
            <custom-select selected-id="AdvanceSearch_2" max-selectable="0" disabled="false" required="false" footer="true" get-data="advanceSearch.getEmployeeType" returned-data="advanceSearch.returnedEmployeeTypeData" return-func="advanceSearch.returnDataEmployeeTypeFunc(advanceSearch.returnedEmployeeTypeData)"></custom-select>
        </div>

        <div class="col-lg-4" ng-if="advanceSearch.checkVisibilityItem('personnelNum')">
            <div class="input-group">
                <div class="input-group-prepend">
                    <label class="input-group-text">
                        کد پرسنلی
                    </label>
                </div>
                <input class="form-control" type="text" ng-model="advanceSearch.searchItems.employeeCode">
                <span style="position: absolute;left: 5%;top: 0.3em;"
                   ng-show="checkingExist(advanceSearch.searchItems.employeeCode)" ng-click="removeEmployeeCodeParam()"><i class="far fa-close text-danger"></i></span>
            </div>
        </div>

        <div class="col-lg-4" ng-if="advanceSearch.checkVisibilityItem('chart')">
            <div class="input-group">
                <div class="input-group-prepend">
                    <label class="input-group-text lable-Width">
                        چارت سازمانی
                    </label>
                </div>
                <p class="form-control pointer" style="text-align: right;" ng-click="advanceSearch.changeSelectPostStatus()">
                    {{advanceSearch.searchItems.treeName}}
                    <i class="far fa-chevron-down dropIcon"></i>
                    <span class="float-left" style="font-size: 16px;margin-left: 10px;"
                       ng-if="checkingExist(advanceSearch.searchItems.tri)" ng-click="advanceSearch.clearChart()"><i class="far fa-close text-danger"></i></span>
                </p>
                <div ng-if="advanceSearch.selectPostStatus" class="selectItem card p-1">
                    <chart state-select="All" by-sdate="{{advanceSearch.getChartBySDate}}" by-fdate="{{advanceSearch.getChartByFDate}}" dataunit="advanceSearch.dataunit" use-selected-chart="advanceSearch.useSelectedChart(advanceSearch.dataunit)"></chart>
                </div>
            </div>
        </div>


        <div class="col-lg-4" ng-if="advanceSearch.checkVisibilityItem('employeeState')" ng-click="advanceSearch.getDataEmployeeStateFunc()">
            <custom-select selected-id="AdvanceSearch_3" max-selectable="0" disabled="false" required="false" footer="true" get-data="advanceSearch.getEmployeeState" returned-data="advanceSearch.returnedEmployeeStateData" return-func="advanceSearch.returnDataEmployeeStateFunc(advanceSearch.returnedEmployeeStateData)"></custom-select>
        </div>

        <div class="col-lg-4" ng-if="advanceSearch.checkVisibilityItem('jobLevel')" ng-click="advanceSearch.getJobTypeFunc()">
            <custom-select selected-id="AdvanceSearch_4" disabled="false" required="false" max-selectable="0" get-data="advanceSearch.getJobTypeData" returned-data="advanceSearch.returnedJobTypeData" return-func="advanceSearch.returnJobTypeFunc(advanceSearch.returnedJobTypeData)"></custom-select>
        </div>
        <div class="col-lg-4" ng-if="advanceSearch.checkVisibilityItem('sacrificeState')" ng-click="advanceSearch.getWarStateFunc()">
            <custom-select selected-id="AdvanceSearch_5" disabled="false" required="false" footer="false" max-selectable="0" get-data="advanceSearch.getWarStateData" returned-data="advanceSearch.returnedWarStateData" return-func="advanceSearch.returnWarStateFunc(advanceSearch.returnedWarStateData)"></custom-select>
        </div>
        <div class="col-lg-4" ng-if="advanceSearch.checkVisibilityItem('sacrificeRelation')" ng-click="advanceSearch.getWarStateRelativeFunc()">
            <custom-select selected-id="AdvanceSearch_6" disabled="false" required="false" footer="false" max-selectable="0" get-data="advanceSearch.getWarStateRelativeData" returned-data="advanceSearch.returnedWarStateRelativeData" return-func="advanceSearch.returnWarStateRelativeFunc(advanceSearch.returnedWarStateRelativeData)"></custom-select>
        </div>
        <div class="col-lg-4" ng-if="advanceSearch.checkVisibilityItem('postGrade')">
            <custom-select selected-id="AdvanceSearch_7" max-selectable="0" disabled="false" required="false" footer="true" get-data="advanceSearch.getPostClass" returned-data="advanceSearch.returnedPostClassData" return-func="advanceSearch.returnDataPostClassFunc(advanceSearch.returnedPostClassData)"></custom-select>
        </div>

        <div class="col-lg-4" ng-if="advanceSearch.checkVisibilityItem('grade')" ng-click="advanceSearch.getGradeFunc()">
            <custom-select selected-id="AdvanceSearch_8" disabled="false" required="false" footer="false" max-selectable="0" get-data="advanceSearch.getGradeData" returned-data="advanceSearch.returnedGradeData" return-func="advanceSearch.returnGradeFunc(advanceSearch.returnedGradeData)"></custom-select>
        </div>
        <div class="col-lg-4" ng-if="advanceSearch.checkVisibilityItem('jobField')">
            <custom-select selected-id="AdvanceSearch_9" max-selectable="0" disabled="false" required="false" footer="true" get-data="advanceSearch.getJobField" returned-data="advanceSearch.returnedJobFieldData" return-func="advanceSearch.returnJobFieldFunc(advanceSearch.returnedJobFieldData)"></custom-select>
        </div>
        <div class="col-lg-4" ng-if="advanceSearch.checkVisibilityItem('class')" ng-click="advanceSearch.getClassFunc()">
            <custom-select selected-id="AdvanceSearch_10" disabled="false" required="false" footer="false" max-selectable="0" get-data="advanceSearch.getClassData" returned-data="advanceSearch.returnedClassData" return-func="advanceSearch.returnClassFunc(advanceSearch.returnedClassData)"></custom-select>
        </div>
    </div>
    <div class="col-lg-12" style="text-align: left;">
        <button type="button" class="new-button red" ng-click="advanceSearch.clearFilter()">
            پاک کردن تمامی فیلترها
        </button>
        <button type="button" class="new-button green" ng-click="advanceSearch.AddFilter(advanceSearch.searchItems)" id="{{$ctrl.acardionHeading}}"
                data-toggle="collapse"
                data-target="#{{$ctrl.acardionTarget}}"
                aria-expanded="false"
                aria-controls="{{$ctrl.acardionTarget}}">
            اعمال فیلتر
        </button>
    </div>
</div>`
});
