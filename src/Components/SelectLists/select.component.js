function SelectController($scope, RequestApis, $compile, $timeout) {
    var $ctrl = this;
    //======================= check Url =======================

    $scope.selected = false;
    $scope.pageSizes = 10;
    $scope.pageNumber = 1;
    $ctrl.returnedData = {};
    $ctrl.$onInit = function () {
        if ($ctrl.getData.identifier === undefined)
            $ctrl.getData.identifier = "Id";
        if (localStorage.getItem('pageSizeGloab')) {
            $scope.pageSizes = Number(localStorage.getItem('pageSizeGloab'));
            $scope.returnDataFunc('pageSize', $scope.pageSizes);
        }
        if (localStorage.getItem(`pageNumGloab${$ctrl.selectedId}`)) {
            $scope.pageNumber = Number(localStorage.getItem(`pageNumGloab${$ctrl.selectedId}`));
            $scope.returnDataFunc('pageNumber', $scope.pageNumber);
        }
        $scope.selectItem = [];
        if ($ctrl.returnedData.item != undefined) {
            if ($ctrl.returnedData.item.length) {
                $scope.selectItem = $ctrl.returnedData.item;
            }
        }
    }
    $scope.$watch(`$ctrl.getData.data`, function () {
        if ($ctrl.getData !== undefined && $ctrl.getData.data !== undefined && $ctrl.getData.data.length)
            $scope.dataItems = [...$ctrl.getData.data];
    })
    $scope.$watch(`$ctrl.getData.BreadCrumbs.Items`, function () {
        if ($ctrl.getData != undefined && $ctrl.getData.BreadCrumbs != undefined) {
            $scope.breadCrumbsItems = $ctrl.getData.BreadCrumbs.Items;
        }
    })
    $scope.$watch('selected', function () {
        if ($scope.selected) {
            let position = document.getElementById(`header_${$ctrl.selectedId}`).getBoundingClientRect();
            $timeout(function () {
                let itemPosition = document.getElementById(`items_${$ctrl.selectedId}`).getBoundingClientRect();
                if (position.width < 250) {
                    document.getElementById(`items_${$ctrl.selectedId}`).style.width = "250px"
                } else {
                    document.getElementById(`items_${$ctrl.selectedId}`).style.width = position.width + "px"
                }
                //if ((window.innerWidth - position.right) < itemPosition.width) {
                //  document.getElementById(`items_${$ctrl.selectedId}`).style.right = `${window.innerWidth - (position.right)}px`
                //} else {
                //  document.getElementById(`items_${$ctrl.selectedId}`).style.left = `${position.left}px`
                //}
                //if ((window.innerHeight - (position.top + position.height)) < itemPosition.height) {
                //  document.getElementById(`items_${$ctrl.selectedId}`).style.top = `${position.top - (position.height + itemPosition.height)}px`
                //}
                //else {
                //  document.getElementById(`items_${$ctrl.selectedId}`).style.top = `${position.top + position.height}px`
                //}
                document.getElementById(`items_${$ctrl.selectedId}`).style.opacity = "1";
                document.getElementById(`items_${$ctrl.selectedId}`).style.transition = "opacity 0.2s ease-in-out"
            }, 1)
        }
    })

    $scope.mouseOver = function () {
        $scope.selected = true;
        $scope.timeout = 150;
    }
    $scope.leaveMouse = function () {
        $timeout(function () {
            $scope.selected = false;
        }, $scope.timeout != undefined ? $scope.timeout : 150)
    }
    $scope.searchItem = function (param, item) {
        let search = '';
        if (!$ctrl.footer) {
            if (item != undefined && item != '') {
                if (item.length) {
                    search = item;
                }
                $scope.dataItems = $scope.dataItems.filter(x => x[param.latin].toString().includes(search))
            } else {
                $scope.dataItems = [...$ctrl.getData.data];
            }
        } else {
            if (item !== undefined && item.toString().length !== 0)
                search = item;
            $scope.returnDataFunc('search', {param: param, search: search});
        }
    }
    $scope.loadPage = function (item) {
        if (Number(item) <= $ctrl.getData.TotalPages && $ctrl.getData.TotalPages >= $ctrl.getData.PageIndex && Number(item) > 0) {
            localStorage.setItem(`pageNumGloab${$ctrl.selectedId}`, item);
            if ($ctrl.maxSelectable !== 1) {
                document.getElementById('ThisPageData').checked = false;
            }
            $scope.returnDataFunc('pageNumber', Number(item));
        }
    }
    $scope.checkState = function (item) {

        console.log("**********************************")
        console.log(item)
        console.log($scope.selectItem)
        let result = false;
        if ($scope.selected && $scope.selectItem != undefined) {
            if ($scope.selectItem.some(x => x[$ctrl.getData.identifier] === item[$ctrl.getData.identifier])) {
                result = true;
            }
        }
        return result;
    }
    $scope.calcState = function (item) {
        let result = false;
        if (item != undefined) {
            result = !item;
        }
        return result;
    }
    $scope.showState = function () {
        if (!$ctrl.disabled) {
            $scope.selected = !$scope.selected;
            $scope.checkState($scope.selectItem);
        }
    }

    $scope.closeList = function () {
        $scope.selected = false;
    }
    $scope.removeItem = function (item) {
        if ($scope.selectItem.length) {
            $scope.selectItem = $scope.selectItem.filter(x => x[$ctrl.getData.identifier] != item[$ctrl.getData.identifier]);
            $scope.returnDataFunc('selected', $scope.selectItem);
        }
    }
    $scope.setThisPageData = function (event, item) {
        if (event.target.checked) {
            Object.values(item).forEach(x => {
                if (!$scope.selectItem.some(y => y[$ctrl.getData.identifier] === x[$ctrl.getData.identifier])) {
                    $scope.selectItem.push(x);
                    $scope.checkState(x[$ctrl.getData.identifier])
                }
            })
        } else {
            if (item.length) {
                Object.values(item).forEach(y => {
                    $scope.selectItem = $scope.selectItem.filter(x => x[$ctrl.getData.identifier] != y[$ctrl.getData.identifier]);
                    $scope.checkState(y[$ctrl.getData.identifier])
                })
            }
        }
        $scope.returnDataFunc('selectedThisPage', $scope.selectItem);
    }
    $scope.checkClass = function () {
        let classes1 = '';
        let classes = '';
        if (!$ctrl.disabled) {
            classes += 'pointer';
        } else {
            classes += 'notPointer';
            $scope.selectItem = [];
        }
        if ($ctrl.required && !$scope.selectItem.length) {
            classes1 += 'border border-danger';
        } else {
            classes1 += '';
        }
        classes += classes1;
        return classes
    }
    $scope.setData = function (event, item) {
        let input = event.target.querySelector('input');
        if (event.target.nodeName !== "TR") {
            input = event.target.parentNode.querySelector('input');
        }
        if ($ctrl.maxSelectable !== 1) {
            if (input.checked === true) {
                if ($scope.selectItem.length < $ctrl.maxSelectable || $ctrl.maxSelectable === 0) {
                    if (!$scope.selectItem.some(x => x[$ctrl.getData.identifier] === item[$ctrl.getData.identifier]))
                        $scope.selectItem.push(item);
                }
            } else {
                if ($scope.selectItem.length) {
                    $scope.selectItem = $scope.selectItem.filter(x => x[$ctrl.getData.identifier] !== item[$ctrl.getData.identifier]);
                }
            }
        } else {
            $scope.selectItem = [];
            $scope.selectItem.push(item);
            $scope.selected = false;
        }
        $scope.returnDataFunc('selected', $scope.selectItem);
    }
    $scope.btnSelection = function (btn) {
        $scope.returnDataFunc('btn', btn);
    }
    $scope.goToBreadCrumbItems = function (item) {
        $scope.returnDataFunc('breadCrumb', item);
    }
    $scope.returnDataFunc = function (type, item) {
        $ctrl.returnedData.item = item;
        $ctrl.returnedData.type = type;
        $ctrl.returnFunc($ctrl.returnedData);
    }
    //======================== settings ======================
    $scope.showModalSetting = function () {
        document.getElementById('settingModal').classList.remove('hidden');
        document.getElementById('settingModal').classList.add('show');
    }
    $scope.cancelSetting = function () {
        document.getElementById('settingModal').classList.remove('show');
        document.getElementById('settingModal').classList.add('hidden');
    }
    $scope.setting = function (item) {
        if (item.length) {
            localStorage.setItem("pageSizeGloab", Number(item));
            $scope.returnDataFunc('pageSize', Number(item));
            $scope.cancelSetting();
            $scope.settings = "";
        }
    }
}

// ===================================================== create component ================================================
app.component("customSelect", {
    bindings: {
        returnFunc: "&",
        returnedData: "=",
        selectedId: "@",
        disabled: "<",
        required: "<",
        footer: "<",
        getData: "<",
        class: "@",
        maxSelectable: "<",
    },
    controller: SelectController,
    template: `<style>
    .extra-small-font {
        font-size: 8px !important;
    }

    .small-font {
        font-size: 10px !important;
    }

    .medium-font {
        font-size: 12px !important;
    }

    .big-font {
        font-size: 14px !important;
    }

    .dropBtn {
        position: absolute;
        left: 7px;
        top: 7px;
        z-index: 51;
        font-size: 10px !important;
        font-weight: 900;
    }

    .closeBtn {
        position: absolute;
        left: 25px;
        top: 5px;
        z-index: 51;
        font-size: 12px !important;
        cursor: pointer;
        color: red;
    }

    .pointer {
        cursor: pointer;
    }

    .notPointer {
        background-color: rgba(200, 200, 200,0.2);
    }

    .showBox {
        opacity: 0;
        position: absolute;
        z-index: 500;
        max-height: 250px;
        max-width: 400px;
        transition: opacity 0.2s ease-in-out;
    }

    .footer {
    }
    table {
        
    }
    .tableSelect {
        overflow-x: hidden;
        overflow-y: auto;
        border-collapse: separate;
        border-spacing: 0;
    }
    .tableSelect thead tr {
        position: sticky;
        top: 0;
        z-index: 10;
    }

        .tableSelect thead tr:last-child {
            position: sticky;
            top: 25px;
            z-index: 10;
        }
        .tableSelect thead th {
            font-size: 12px !important;
            font-weight: 700;
        }
        .tableSelect thead th p{
            width: max-content;
            padding: 0;
            margin: auto;
            text-align: center;
        }

    .tableStyle {
        max-height: 200px
    }

        .tableStyle td {
            font-size: 10px !important;
        }

    .selectedItems {
        text-align: right;
        display: inline-block;
        overflow-y: auto;
        overflow-x: hidden;
        padding: 0 -25px 0 0;
    }

        .selectedItems .span {
            font-size: 8px !important;
            margin: 0 2px 0 2px;
            padding: 0 2px 0 2px;
            border-radius: 5px;
        }

    .noscroll::-webkit-scrollbar {
        display: none;
    }

    /* Hide scrollbar for IE, Edge and Firefox */
    .noscroll {
        -ms-overflow-style: none; /* IE and Edge */
        scrollbar-width: none; /* Firefox */
    }

    .background {
        background-color: rgba(0,0,0,0.4) !important
    }

    .footer {
        position: absolute;
        bottom: 0
    }

   
</style>
<div id="header_{{$ctrl.selectedId}}">
    <div class="input-group">
        <div class="input-group-prepend" ng-if="$ctrl.getData.lable.length">
            <div class="input-group-text small-font" ng-class="[$ctrl.class !== undefined ? $ctrl.class:'']">
                {{$ctrl.getData.lable}}
            </div>
        </div>
        <p class="form-control noscroll selectedItems" ng-class="checkClass()" ng-click="showState()">
            <i class="far fa-chevron-down dropBtn"></i>
            <span ng-if="selectItem.length && selectItem.length ===1" class="span" style="font-size:11px !important" ng-click="removeItem(selectItem[0])">
{{selectItem[0][$ctrl.getData.parameter[0].latin]}}
{{$ctrl.getData.parameter.length ===2 ? "(" +selectItem[0][$ctrl.getData.parameter[1].latin]+")":''}}<i class="far fa-close mr-1 text-danger pointer" ></i></span>
            <span ng-if="selectItem.length && selectItem.length>1" ng-click="removeItem(item)" class="badge-warning span" ng-repeat="item in selectItem track by $index">{{item[$ctrl.getData.parameter[0].latin]}} {{$ctrl.getData.parameter.length ===2 ? "(" + selectItem[$index][$ctrl.getData.parameter[1].latin]+")":''}}<i class="far fa-close mr-1 text-danger pointer" ></i></span>
            <span class="position-absolute" style="top:5px;font-size:11px" ng-if="!selectItem.length">لطفا انتخاب نمایید...</span>
        </p>
    </div>
</div>
<div id="items_{{$ctrl.selectedId}}" ng-mouseleave="leaveMouse()" ng-mouseover="mouseOver()" ng-if="selected" class="card showBox">
    <p ng-if="$ctrl.getData.BreadCrumbs !== undefined" class="float-right d-flex p-0 m-0 text-right pointer">
      <i class="far fa-home"></i>
      <span class="mx-1 p-0" style="font-size:0.8em" ng-repeat="breadCrumb in breadCrumbsItems track by $index" ng-click="goToBreadCrumbItems(breadCrumb)">{{breadCrumb.Title}}/</p>
    </p>
    <div class="overflow-y">
        <table class="newTableStyle">
            <thead>
                <tr>
                    <th style="width:3%"><p>ردیف</p></th>
                    <th style="width:3%">
                        <!--<input ng-if="$ctrl.maxSelectable!==1" type="checkbox"
                        ng-click="setAllData()">-->
                    </th>
                    <th ng-repeat="param in $ctrl.getData.parameter track by $index"><p>{{param.per}}</p></th>
                </tr>
                <tr>
                    <td><i class="far fa-cog text-primary text-left pointer" title="تنظیمات جدول" ng-attr-title="{{'تعداد کل : ' + $ctrl.getData.TotalRow + ' | ' + 'تعداد در صفحه : ' +pageSizes}}" ng-click="showModalSetting()"></td>
                    <td>
                        <input class="p-0 m-0" id="ThisPageData" ng-if="$ctrl.maxSelectable !== 1" type="checkbox"
                               ng-click="setThisPageData($event,$ctrl.getData.data)">
                    </td>
                    <td ng-repeat="param in $ctrl.getData.parameter track by $index">
                        <input type="text" class="form-control" ng-model="searchValue" ng-disabled="calcState(param.searchState)" ng-keyup="searchItem(param,searchValue)" />                
                    </td>
                </tr>
            </thead>
            <tbody class="tableStyle">
                <tr ng-if="$ctrl.getData.data.length" ng-repeat="dataList in dataItems track by $index" ng-click="setData($event,dataList)">
                    <td class="text-center">
                        {{$ctrl.getData.PageIndex !==undefined ?($ctrl.getData.PageIndex-1)*pageSizes + $index+1 :$index+1}}
                    </td>
                    <td class="text-center">
                        <input ng-if="$ctrl.maxSelectable===1" ng-checked="checkState(dataList)" type="radio" id="{{dataList[$ctrl.getData.identifier]}}" value="{{dataList[$ctrl.getData.identifier]}}">
                        <input class="p-0 m-0" ng-if="$ctrl.maxSelectable!==1" ng-checked="checkState(dataList)" id="{{dataList[$ctrl.getData.identifier]}}" type="checkbox" value="{{dataList[$ctrl.getData.identifier]}}">
                    </td>
                    <td ng-repeat="param in $ctrl.getData.parameter track by $index" class="text-center" ng-click="$ctrl.getData.BreadCrumbs !== undefined && dataList[$ctrl.getData.BreadCrumbs.param] ?goToBreadCrumbItems(dataList):''">
                        {{dataList[param.latin]}}
                        <i ng-if="$ctrl.getData.BreadCrumbs !== undefined && dataList[$ctrl.getData.BreadCrumbs.param]" class="far fa-chevron-left float-left pl-3 font-weight-bold" title="دارای زیر مجموعه" ></i>
                    </td>
                </tr>
                <tr else>
                    <td class="col-12" colspan="6"></td>
                </tr>
            </tbody>
        </table>
    </div>
    <div class=" p-1 m-0" ng-if="$ctrl.footer">
        <div class="col-12 border justify-content-center m-auto mt-1 mb-1">
            <div class="row">
                <div ng-class="[$ctrl.getData.footerBtns !==undefined?'col-lg-6':'col-12']" class="text-right d-flex">
                    <span class="d-flex" ng-click="loadPage($ctrl.getData.TotalPages)" style="cursor: pointer; margin: 5px;">
                        <i class="far fa-chevron-right" style="font-size: 0.7em;"></i>
                        <i class="far fa-chevron-right asp-label"
                           style="margin-right: -1px;font-size: 0.7em;"></i>
                    </span>
                    <span class="asp-label" ng-click="loadPage($ctrl.getData.PageIndex+1)"
                       style="margin:5px;cursor: pointer;font-size: 0.7em;"><i class="far fa-chevron-right "></i></span>
                    <input class="form-control text-center" id="pagingD"
                           placeholder="{{$ctrl.getData.PageIndex}} از {{$ctrl.getData.TotalPages}}"
                           style="display: inline-block;position: relative;top: 0px;font-size: 0.6em !important;"
                           ng-model="pageNumbers" ng-keyup="loadPage(pageNumbers);">
                    <span class="asp-label" ng-click="loadPage($ctrl.getData.PageIndex-1)"
                       style="margin:5px;cursor: pointer;font-size: 0.7em;"><i class="far fa-chevron-left "></i></span>
                    <span class="d-flex" ng-click="loadPage(1)" style="cursor: pointer; margin: 5px;">
                        <i class="far fa-chevron-left asp-label"
                           style="margin-left: -1px;font-size: 0.7em;"></i>
                        <i class=" far fa-chevron-left asp-label" style="font-size: 0.7em;"></i>
                    </span>
                </div>
                <div ng-if="$ctrl.getData.footerBtns !==undefined" class="col-lg-6">
                   <div class="d-flex float-left">
                      <span ng-repeat="btn in $ctrl.getData.footerBtns track by $index"  title="{{btn.per}}" ng-click="btnSelection(btn)"><i ng-class="['far pointer mx-1',btn.icon]"></i></span>
                  </div>
                </div>
            </div>
        </div>
    </div>
    <div class="hidden position-absolute " style="z-index:1000" id="settingModal">
        <div class="card-body background">
            <p class="HeaderForm">
                تنظیمات جدول
                <span class="cancelIcon" ng-click="cancelSetting()"><i class="far fa-close "></i></span>
            </p>
            <div class="card">
                <div class="col-md-12">
                    <div class="input-group">
                        <div class="input-group-prepend">
                            <label class="input-group-text small-font">
                                تعداد سطر در جدول
                            </label>
                        </div>
                        <input type="text" ng-model="settings" class="form-control">
                    </div>
                </div>
            </div>
            <div class="card">
                <div style="text-align: left;">
                    <button type="button" class="new-button bg-danger" ng-click="cancelSetting()">
                        <i class="ml-1 far fa-close"></i>
                        انصراف
                    </button>
                    <button type="button" class="new-button bg-success" ng-click="setting(settings)">
                        <i class="ml-1 far fa-check"></i>
                        تایید
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>`
});

// ===================================================== how to use it ================================================
/* <custom-select selected-id="reporter-2" max-selectable="0" disabled="false" footer="true" required="false" get-data="getData" returned-data="returnedData" return-func="returnFunc(returnedData)"></custom-select>
                      */
//$scope.returnedCenterReportData = {
//}
//$scope.getCenterReportData = {
//    data: {},
//    PageSize: 10,
//    PageIndex: 1,
//    TotalRow: null,
//    TotalPages: null,
//    footerBtns: [{ Id: 0, latin: 'Add', icon: 'fa-plus' }],
//    lable: "مرکز آموزش",
//    parameter: [{ latin: 'Title', per: 'عنوان' }]

//}
//$scope.getCenterReportFunc = function () {
//    let query = '';
//    if ($scope.searchCenterReport != undefined && $scope.searchCenterReport.length) {
//        query += `&q=${$scope.searchCenterReport}`
//    }
//    RequestApis.HR(path, 'Get', '', '', '', function (response) {
//        $scope.getCenterReportData.data = response.data.Items;
//        $scope.getCenterReportData.PageIndex = response.data.PageIndex;
//        $scope.getCenterReportData.PageSize = response.data.PageSize;
//        $scope.getCenterReportData.TotalRow = response.data.TotalRow;
//        $scope.getCenterReportData.TotalPages = response.data.TotalPages;
//        if ($scope.getCenterReportData.TotalPages === 1) {
//            $scope.pageCenterReportNumber = 1;
//        }
//    });
//}
//$scope.returnCenterReportFunc = function (data = $scope.getCenterReportData.data) {
//    if (data.type.toUpperCase() === "PAGESIZE") {
//        $scope.pageCenterReportSizes = data.item
//        $scope.getCenterReportFunc();
//    }
//    if (data.type.toUpperCase() === "PAGENUMBER") {
//        $scope.pageCenterReportNumber = data.item
//        $scope.getCenterReportFunc();
//    }
//    if (data.type.toUpperCase() === "SEARCH") {
//        $scope.searchCenterReport = data.item.search;
//        $scope.getCenterReportFunc();
//    }
//    if (data.type.toUpperCase() === "SELECTEDTHISPAGE") {
//        $scope.selectedCenterReportItem = data.item
//    }
//    if (data.type.toUpperCase() === "SELECTED") {
//        $scope.selectedCenterReportItem = data.item
//    }
//}


