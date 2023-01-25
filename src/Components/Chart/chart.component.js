function ChartController($scope, RequestApis, $compile, $timeout) {
    var $ctrl = this;
    $scope.totalNodes = [];
    $ctrl.$onInit = function () {
        $ctrl.searchLoading = true;
        if (!$ctrl.bySdate.length) {
            RequestApis.HR('charts/all', 'Get', '', '', '', function (node) {
                $scope.nodes = node.data;
                $ctrl.searchLoading = false;
            });
        }
        else if ($ctrl.bySdate.length) {
            if (!$ctrl.byFdate.length) {
                RequestApis.HR('charts/all?search.ss=' + $ctrl.bySdate, 'Get', '', '', '', function (node) {
                    $scope.nodes = node.data;
                    $ctrl.searchLoading = false;
                });
            }
            else {
                RequestApis.HR(`charts/all?search.sd=${$ctrl.bySdate}&search.fd=${$ctrl.byFdate}`, 'Get', '', '', '', function (node) {
                    $scope.nodes = node.data;
                    $ctrl.searchLoading = false;
                });
            }
        }
    };

    $scope.getSubNode = function (parentId) {
        if ($ctrl.stateSelect.toUpperCase() === "UNIT") {
            RequestApis.HR('charts/' + parentId + '/children/all?np=1', 'Get', '', '', '', function (node) {
                $scope.makingTreeNodeOfUnit(parentId, node.data);
            });
        }
        if ($ctrl.stateSelect.toUpperCase() === "ALL") {
            RequestApis.HR('charts/' + parentId + '/children/all', 'Get', '', '', '', function (node) {
                $scope.makingTreeNodeOfAll(parentId, node.data);
            });
        }
        if ($ctrl.stateSelect.toUpperCase() === "POST") {
            RequestApis.HR('charts/' + parentId + '/children/all', 'Get', '', '', '', function (node) {
                $scope.makingTreeNodeOfPost(parentId, node.data);
            });
        }
    };
    $scope.makingTreeNodeOfPost = function (parentId, items) {
        Object.values(items).forEach(item => {
            $scope.totalNodes.push(item);
            $("#tree-select-" + parentId).append(
                $compile(`<li class="my-1">
                        <div  class='li-info asp-label border rounded'>
                        <span class='user-span' data-toggle='tooltip' title='دارای تصدی'  ng-if='${item.HasPersonnel}' id='user-${item.ChartId}' ><i class='far fa-user'></i></span>
                            <span  id='icon-${item.ChartId}' ng-if='${item.IsOraganization}'  ng-click='getSubNode(${item.ChartId})'><i class='far fa-building'></i></span>
                            <span id='icon-${item.ChartId}' ng-if='${item.IsPost}'><i class='far fa-building'></i></span>
                            <span id='icon-${item.ChartId}' ng-if='${!item.IsOraganization}&&${!item.IsPost}'  ng-click='getSubNode(${item.ChartId})'><i class='far fa-users'></i></span>
                            <input type='radio' ng-if='${!item.IsOraganization && item.IsPost}' ng-click='selectingNode(${JSON.stringify(item)})' name='chart' id='radio-${item.ChartId}' >
                            <span>${item.Title}
                            </span >
                        </div>
                        <ul id='tree-select-${item.ChartId}'></ul>
                    </li>
                        `
                )($scope)
            );
        });
        $('[data-toggle="tooltip"]').tooltip();
        $("#tree-select-" + parentId).slideToggle();
    };
    $scope.makingTreeNodeOfAll = function (parentId, items) {
        Object.values(items).forEach(item => {
            $scope.totalNodes.push(item);
            $("#tree-select-" + parentId).append(
                $compile(`<li class="my-1">
                        <div  class='li-info asp-label border rounded'>
                        <span class='user-span' data-toggle='tooltip' title='دارای تصدی'  ng-if='${item.HasPersonnel}' id='user-${item.ChartId}' ><i class='far fa-user'></i></span>
                            <span id='icon-${item.ChartId}' ng-if='${item.IsOraganization}'  ng-click='getSubNode(${item.ChartId})'><i class='far fa-building'></i></span>
                            <span id='icon-${item.ChartId}' ng-if='${item.IsPost}'><i class='far fa-building'></i></span>
                            <span id='icon-${item.ChartId}' ng-if='${!item.IsOraganization}&&${!item.IsPost}'  ng-click='getSubNode(${item.ChartId})'><i class='far fa-users'></i></span>
                            <input type='radio' ng-click='selectingNode(${JSON.stringify(item)})' name='chart' id='radio-${item.ChartId}' >
                            <span>${item.Title}
                            </span >
                        </div>
                        <ul id='tree-select-${item.ChartId}'></ul>
                    </li>
                        `
                )($scope)
            );
        });
        $('[data-toggle="tooltip"]').tooltip();
        $("#tree-select-" + parentId).slideToggle();
    };
    $scope.searching = function () {
        $ctrl.searchLoading = true;
        $scope.pathForSearch = 'charts/group';
        if ($ctrl.searchParam.cd != undefined) {
            $scope.pathForSearch += '?search.cd=' + $ctrl.searchParam.cd;
        }
        if ($ctrl.searchParam.q != undefined) {
            if ($ctrl.searchParam.cd != undefined) {
                $scope.pathForSearch += "&search.q=" + $ctrl.searchParam.q;
            } else {
                $scope.pathForSearch += "?search.q=" + $ctrl.searchParam.q;
            }
        }
        if ($ctrl.searchParam.uc != undefined) {
            if ($ctrl.searchParam.cd != undefined && $ctrl.searchParam.q != undefined) {
                $scope.pathForSearch += "?search.uc=" + $ctrl.searchParam.uc;
            } else {
                $scope.pathForSearch += "&search.uc=" + $ctrl.searchParam.uc;
            }
        }
        if ($ctrl.bySdate.length && !$ctrl.byFdate.length) {
            $scope.pathForSearch += "&search.ss=" + $ctrl.bySdate;
        }
        if ($ctrl.bySdate.length && $ctrl.byFdate.length) {
            $scope.pathForSearch += "&search.sd=" + $ctrl.bySdate + "&search.fd=" + $ctrl.byFdate;
        }
        RequestApis.HR($scope.pathForSearch, 'Get', '', '', '', function (response) {
            $ctrl.searchLoading = false;
            if (response.status == 200) {
                $scope.searchResult = response.data;
                $scope.currentPage = 1;
                $scope.TotalPages = Math.ceil($scope.searchResult[0].TotalRow / 10);
            } else {
                $scope.searchResult = [];
                $scope.currentPage = 0;
                $scope.TotalPages = 0;
            }
        });
    };
    $scope.getTableData = function () {
        RequestApis.HR($scope.pathForSearch + "&pn=" + $scope.currentPage, 'Get', '', '', '', function (response) {
            $ctrl.searchLoading = false;
            if (response.status == 200) {
                $scope.searchResult = response.data;
            }
        });
    };
    $scope.loadPage = function (type) {
        if ($scope.searchResult.length != 0) {
            if (type == 'last') {
                $scope.getTableData($scope.TotalPages);
            }
            else if (type == 'first') {
                $scope.searching(1);
            } else if (type == 1) {
                if ($scope.currentPage < $scope.TotalPages) {
                    $scope.getTableData($scope.currentPage++);
                }
            } else {
                if ($scope.currentPage > 1) {
                    $scope.getTableData($scope.currentPage--);
                }
            }
        }
    };
    $scope.makingTreeNodeOfUnit = function (parentId, items) {
        Object.values(items).forEach(item => {
            $scope.totalNodes.push(item);
            $("#tree-select-" + parentId).append(
                $compile(`<li class="my-1">
                        <div  class='li-info asp-label border rounded'>
                        <span class='user-span' data-toggle='tooltip' title='دارای تصدی'  ng-if='${item.HasPersonnel}' id='user-${item.ChartId}' >
                        <i class='far fa-user'></i>
                        </span>
                            <span id='icon-${item.ChartId}' ng-if='${item.IsOraganization}'  ng-click='getSubNode(${item.ChartId})'><i class='far fa-building'></i>
                            </span>
                            <span id='icon-${item.ChartId}' ng-if='${!item.IsOraganization}&&${!item.IsPost}'  ng-click='getSubNode(${item.ChartId})'><i class='far fa-users'></i></span>
                            <input type='radio' ng-click='selectingNode(${JSON.stringify(item)})' name='chart' id='radio-${item.ChartId}' >
                            <span>${item.Title}
                            </span >
                        </div>
                        <ul id='tree-select-${item.ChartId}'></ul>
                    </li>
                        `
                )($scope)
            );
        });
        $('[data-toggle="tooltip"]').tooltip();
        $("#tree-select-" + parentId).slideToggle();
    };
    $scope.selectingNode = function (info) {
        $ctrl.dataunit.data = info;
        $ctrl.dataunit.status = false;
        $ctrl.useSelectedChart($ctrl.dataunit);
    };
}
// ===================================================== create component ================================================
/* this is how to use :  <chart state-select="unit" ny-date="01/08/1400" dataunit="dataunit" use-selected-chart="useSelectedChart(dataunit)"></chart>*/
app.component("chart", {
    bindings: {
        stateSelect: "@",
        dataunit: "=",
        useSelectedChart: "&",
        bySdate: "@",
        byFdate: "@",
    },
    controller: ChartController,
    template: `
    <div class="form-control" style="padding: 0 2px !important;">
        <input type="text" placeholder="شناسه یکتا" ng-model="$ctrl.searchParam.uc" ng-keyup="searching()"
               style="float: left;height: 23px;margin-top: 0;border: none;width: 33%;">
        <input type="text" placeholder="کد" ng-model="$ctrl.searchParam.cd" ng-keyup="searching()"
               style="float: left;height: 23px;margin-top: 0;border: none;border-left: 1px solid lightgray;width: 33%;">
        <input type="text" placeholder="عنوان" ng-model="$ctrl.searchParam.q" ng-keyup="searching()"
               style="float: left;height: 23px;margin-top: 0;border: none;border-left: 1px solid lightgray;width: 33%;">
        <span ng-show="($ctrl.searchParam.q != null && $ctrl.searchParam.q !='') || ($ctrl.searchParam.cd != null && $ctrl.searchParam.cd !='') || ($ctrl.searchParam.uc != null && $ctrl.searchParam.uc !='')"
           ng-click="$ctrl.searchParam.q = '';$ctrl.searchParam.cd = '';$ctrl.searchParam.uc = ''"
           class="inline-search" style="z-index: 5;position: absolute;top: 10px;left: 15px;font-size: 1.3em;"><i class='far fa-close text-danger'></i></span>

    </div>
    <div style="min-height:200px !important" class="pt-2" ng-if="($ctrl.searchParam.q != null && $ctrl.searchParam.q !='') || ($ctrl.searchParam.cd != null && $ctrl.searchParam.cd !='') || ($ctrl.searchParam.uc != null && $ctrl.searchParam.uc !='')">
        <div ng-if="$ctrl.searchLoading" class="d-flex justify-content-center pt-3 m-auto col-12">
            <div class="spinner-border text-primary"></div>
        </div>
        <div ng-if="!$ctrl.searchLoading">
            <div class="card">
                    <table>
                        <thead>
                            <tr>
                                <th style="width: 40%;">
                                    عنوان
                                </th>
                                <th style="width: 20%;">
                                    کد
                                </th>
                                <th style="width: 35%;">
                                    شناسه یکتا
                                </th>
                            </tr>
                        </thead>

                    </table>
                    <div ng-repeat="result in searchResult">
                        <p ng-if="result.BreadCrumb.length != 0" class="asp-label alert alert-primary"
                           style="text-align: right;margin: 5px 0;padding: 0 15px;font-size: 0.8em !important;">
                            <span ng-repeat="bread in result.BreadCrumb">
                                {{bread.Title}} /
                            </span>
                        </p>
                        <table>
                            <tbody class="special-tbody">
                                <tr ng-repeat="item in result.Items" ng-if="!item.IsDeleted"
                                    ng-click='selectingNode(item)'>
                                    <td class="asp-label" style="width: 45%;">
                                        <p title="{{item.Title}}"
                                           style="width: 90%;overflow: hidden !important;text-overflow: ellipsis;margin-bottom: 0;font-size: 1.2em !important;">
                                            {{item.Title}}
                                        </p>
                                    </td>
                                    <td class="asp-label" style="text-align: center;width: 20%;font-size: 0.8em;">
                                        {{item.Code}}
                                    </td>
                                    <td class="asp-label" style="text-align: center;width: 35%;font-size: 0.8em;">
                                        {{item.UniqueCode}}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
            </div>
            <div class="card">
                <div class="row">
                    <div class="col-sm-12" style="text-align: right;">
                        <span ng-click="loadPage('last')" style="cursor: pointer;">
                            <i class="far fa-chevron-right" style="font-size: 0.7em;"></i>
                            <i class="far fa-chevron-right asp-label"
                               style="margin-right: -3px;font-size: 0.7em;"></i>
                        </span>
                        <span class="asp-label" ng-click="loadPage(1)"
                           style="margin: 0 10px;cursor: pointer;font-size: 0.7em;"><i class="far fa-chevron-right "></i></span>
                        <input class="form-control" id="pagingD" placeholder="{{currentPage}} از  {{TotalPages}}"
                               style="width: 30%;display: inline-block;position: relative;top: 0px;font-size: 0.7em;"
                               ng-model="pageNumber" ng-keyup="changePage($event,pageNumber);">
                        <span class="asp-label" ng-click="loadPage(-1)"
                           style="margin: 0 10px;cursor: pointer;font-size: 0.7em;"><i class="far fa-chevron-left "></i></span>
                        <span ng-click="loadPage('first')" style="cursor: pointer;">
                            <i class="far fa-chevron-left asp-label" style="margin-left: -3px;font-size: 0.7em;"></i>
                            <i class=" far fa-chevron-left asp-label" style="font-size: 0.7em;"></i>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div ng-if="$ctrl.searchParam==undefined" style="text-align: right;margin-top: 5px;">
        <div ng-if="$ctrl.searchLoading" class="d-flex justify-content-center pt-3 m-auto col-12">
<p class="p-0 m-0 text-primary small-font">لطفا منتظر بمانید...</p>
            <div class="spinner-border text-primary" style="width: 15px; height: 15px"></div>
        </div>
        <ul class="p-0 m-0">
            <li class="my-1" ng-repeat="treeNode in nodes" ng-if="treeNode.ParentId == null">
                <div class="li-info asp-label border rounded">
                    <span ng-if="treeNode.IsOrganization"
                       ng-click="getSubNode(treeNode.ChartId)"><i class="far fa-building "></i></span>
                    <span ng-if="!treeNode.IsOrganization && !treeNode.IsPost"
                       ng-click="getSubNode(treeNode.ChartId)"><i class="far fa-users "></i></span>
                    <span  ng-if="treeNode.IsPost" ng-click="getSubNode(treeNode.ChartId)"><i class="far fa-address-card"></i></span>
                    <input type='radio' ng-if="$ctrl.stateSelect.toUpperCase() === 'POST' && !treeNode.IsOrganization && treeNode.IsPost" ng-click='selectingNode(treeNode)' name='chart'
                           id='radio-{{treeNode.ChartId}}'>
                    <input type='radio' ng-if="$ctrl.stateSelect.toUpperCase() === 'ALL' || $ctrl.stateSelect.toUpperCase() === 'Unit'" ng-click='selectingNode(treeNode)' name='chart'
                           id='radio-{{treeNode.ChartId}}'>
                    {{treeNode.Title}}
                </div>
                <ul id="tree-select-{{treeNode.ChartId}}"></ul>
            </li>
        </ul>
    </div>`
});
