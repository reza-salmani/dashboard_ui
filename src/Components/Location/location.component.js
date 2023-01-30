function LocationController($scope, RequestApis, $compile, $timeout) {
    var $ctrl = this;
    $scope.selectedLocationInfo = {
        data: {},
        status: true
    }
    $ctrl.$onInit = function () {
        $scope.getLocations();
    }
    $scope.getLocations = function (page = 1) {
        var route = "locations?pn=" + page;
        $scope.LocationBreadCrumbs = [];
        RequestApis.HR(route, "Get", "","","", function (data) {
            console.log(data);
            $scope.locationCurrentRoute = route;
            $scope.locationsData = data.data;
            $scope.locationChoosing = true;
        })
    }
    $scope.changeLocationPage = function (method) {
        if (method == 1) {
            if (!$scope.locationsData.LastPage) {
                $scope.getLocations(Number($scope.locationsData.PageIndex) + 1)
            }
        } else if (method == -1) {
            if ($scope.locationsData.PageIndex > 1) {
                $scope.getLocations(Number($scope.locationsData.PageIndex) - 1)
            }
        } else if (method == "first") {
            $scope.getLocations(1)
        } else {
            $scope.getLocations($scope.locationsData.TotalPages)

        }
    }
    $scope.getChildrenLocation = function (location) {
        var route = "locations/" + location.Id + "/children";
        $scope.locationCurrentRoute = route;
        $scope.LocationBreadCrumbs.push(location);
        RequestApis.HR(route, "Get" , "","","", function (data) {
            $scope.locationsData = data.data;
        })
    }
    $scope.getChildrenLocationBread = function (id, index) {
        $scope.LocationBreadCrumbs.splice(index + 1, $scope.LocationBreadCrumbs.length - 1);
        var route = "locations/" + id + "/children";
        $scope.locationCurrentRoute = route;
        RequestApis.HR(route, "Get", "","","", function (data) {
            $scope.locationsData = data.data;
        })
    }
    $scope.LocationBreadCrumbs = [];
    $scope.searchLocationfunction = function (item) {
        // console.log(item);
        if (item != '') {
            $scope.searchLocationItem = item;
            RequestApis.HR("locations/group?search.q=" + item, "Get", "","","", function (response) {
                console.log(response);
                $scope.locationSearchResult = response.data;
                if (response != 404) {
                    $scope.locationSearchResult = response.data;
                    $scope.currentPageLocation = 1;
                    $scope.TotalPagesLocation = Math.ceil(response.data.TotalRow / 10);
                } else {
                    $scope.locationSearchResult = [];
                    $scope.currentPageLocation = 0;
                    $scope.TotalPagesLocation = 0;
                }
            })
            $scope.searchMode = true
        } else {
            $scope.searchMode = false;
        }

    }
    $scope.locationPagination = [];
    $scope.getTableDataSearchLocation = function (page = 1) {
        RequestApis.HR("locations/group?search.q=" + $scope.searchLocationItem + "&&pn=" + page, "Get", "", "","", function (response) {
            $scope.locationSearchResult = response.data;
            if (response != 404) {
                $scope.locationSearchResult = response.data;
            } else {
                $scope.locationSearchResult = [];
                $scope.currentPageLocation = 0;
                $scope.TotalPagesLocation = 0;
            }
        })
    }
    $scope.loadPageSL = function (method) {
        if (method == 1) {
            if (!$scope.locationsData.LastPage) {
                $scope.getTableDataSearchLocation(Number($scope.locationsData.PageIndex) + 1)
            }
        } else if (method == -1) {
            if ($scope.locationsData.PageIndex > 1) {
                $scope.getTableDataSearchLocation(Number($scope.locationsData.PageIndex) - 1)
            }
        } else if (method == "first") {
            $scope.getTableDataSearchLocation(1)
        } else {
            $scope.getTableDataSearchLocation($scope.locationsData.TotalPages)

        }
    }
    $scope.changePageSL = function (event) {
        $("form").submit(function () { return false; });
        if (event.keyCode == 13) {
            if (page <= $scope.TotalPagesLocation && page >= 1) {
                $scope.getTableDataSearchLocation(page)
            } else {
                $("#pagingG").val("");
            }
        }
    }
    $scope.setLocation = function (info) {
        $ctrl.data.data = info;
        $ctrl.data.status = false;
        $ctrl.useSelectedLocation($ctrl.data);
    }
}
// ===================================================== create component ================================================
app.component("location", {
    bindings: {
        data:"=",
        useSelectedLocation: "&",
    },
    controller: LocationController,
    template: `
    <div class="card">
    <div style="text-align: right;padding: 0 15px;">
        <span class="asp-label pointer" ng-click="getLocations()">
            <i class="far fa-home"></i>
            خانه /
        </span>
        <span ng-repeat="breadCrumb in LocationBreadCrumbs" ng-click="getChildrenLocationBread(breadCrumb.Id,$index)"
              ng-if="!$last" class="asp-label pointer">
            {{breadCrumb.Name}} /
        </span>
        <span ng-repeat="breadCrumb in LocationBreadCrumbs" ng-if="$last" class="asp-label pointer">
            {{breadCrumb.Name}} /
        </span>
    </div>
    <div ng-if="!locationCreateStatus" class="overflow-y" style="height: 250px;">
        <div id="demo" class="collapse">
            <div class="row" style="padding: 0 15px;">
                <div class="col-sm-6">
                    <div class="input-group">
                        <div class="input-group-prepend">
                            <label class="input-group-text">
                                عنوان
                            </label>
                        </div>
                        <input class="form-control" ng-model="headerCreate.name" type="text">
                    </div>
                </div>
                <div class="col-sm-6">
                    <div class="input-group">
                        <div class="input-group-prepend">
                            <label class="input-group-text">
                                نوع
                            </label>
                        </div>
                        <select class="form-control" ng-model="headerCreate.type">
                            <option ng-repeat="type in locationsData.Items[0].SiblingsTypes" ng-value="type.Id">
                                {{type.Name}}
                            </option>
                        </select>
                    </div>
                </div>
                <div class="col-sm-12" style="text-align: left;">
                    <input type="button" data-toggle="collapse" data-target="#demo" value="انصراف"
                           class="new-button red">
                    <input type="button" value="تایید" ng-click="createHeader(headerCreate)" class="new-button green">
                </div>
            </div>
        </div>
        <div>
            <table class="newTableStyle">
                <thead>
                    <tr>
                        <th style="width: 10%">

                        </th>
                        <th>
                            عنوان
                            مکان
                        </th>
                    </tr>
                    <tr>
                        <th style="width: 10%">
                        </th>
                        <th>
                            <input class="form-control" ng-model="searchLocation"
                                   ng-keyup="searchLocationfunction(searchLocation)">
                        </th>
                    </tr>
                </thead>
            </table>
        </div>
        <div ng-if="searchLocation != '' && searchLocation != undefined" class="table-body">
            <div>
                <div ng-repeat="result in locationSearchResult">
                    <p ng-if="result.BreadCrumb.length != 0" class="asp-label alert alert-primary"
                       style="text-align: right;margin: 5px 0;padding: 0 15px;">
                        <span ng-repeat="bread in result.BreadCrumb">
                            {{bread.Title}}
                            /
                        </span>
                    </p>
                    <table>
                        <tbody class="special-tbody">
                            <tr ng-repeat="location in result.Items" ng-if="!tst.IsDeleted" ng-click="setTree(result,location)">
                                <td style="width:10%;text-align: center;">
                                    <input type="radio" value="{{location.Id}}"
                                           ng-click="setLocation(location)"
                                           ng-model="creatingItem.DutyLocationId" name="locationDefault">
                                </td>
                                <td class="asp-label" style="width: 90%;">
                                    <p title="{{location.Title}}"
                                       style="width: 90%;overflow: hidden !important;text-overflow: ellipsis;margin-bottom: 0;">
                                        {{location.Name}}
                                        <span class="badge badge-info">
                                            {{location.TypeName}}
                                        </span>
                                    </p>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="card" style="margin: 0;">
                    <div class="row">
                        <div class="col-sm-12" style="text-align: right;">
                            <span ng-click="loadPageSL('last')" style="cursor: pointer;">
                                <i class="far fa-chevron-right" style="font-size: 0.7em;"></i>
                                <i class="far fa-chevron-right asp-label"
                                   style="margin-right: -3px;font-size: 0.7em;"></i>
                            </span>
                           <span ng-click="loadPageSL(1)">
                            <i class="far fa-chevron-right asp-label" 
                               style="margin: 0 10px;cursor: pointer;font-size: 0.7em;"></i>
</span>
                            <input class="form-control" id="pagingD"
                                   placeholder="{{currentPageLocation}} از  {{TotalPagesLocation}}"
                                   style="width: 30%;display: inline-block;position: relative;top: 0px;font-size: 0.7em;"
                                   ng-model="pageNumber" ng-keyup="changePageSL($event,pageNumber);">
                            <span ng-click="loadPageSL(-1)">
                            <i class="far fa-chevron-left asp-label" 
                               style="margin: 0 10px;cursor: pointer;font-size: 0.7em;"></i>
</span>
                            <span ng-click="loadPageSL('first')" style="cursor: pointer;">
                                <i class="far fa-chevron-left asp-label" style="margin-left: -3px;font-size: 0.7em;"></i>
                                <i class=" far fa-chevron-left asp-label" style="font-size: 0.7em;"></i>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div ng-if="searchLocation == '' || searchLocation == undefined">

            <div>
                <table class="newTableStyle">
                    <tbody>
                        <tr ng-repeat="location in locationsData.Items">
                            <td style="width: 10%">
                                <input type="radio" value="{{location.Id}}"
                                       ng-click="setLocation(location)"
                                       ng-model="creatingItem.DutyLocationId" name="locationDefault">
                            </td>
                            <td>
                                {{location.Name}}
                                <span class="badge badge-secondary">{{location.TypeName}}</span>
                               <span ng-if="location.HasChildren" ng-click="getChildrenLocation(location)">
                                <i class="far fa-chevron-left"
                                   ></i>
</span>
                                <span ng-click="createLocation(location)"
                                   ng-if="location.CanChildren">
                                <i class="far fa-plus" ></i>
</span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div class="card">
                <div class="row">
                    <div class="col-sm-12 no-border" style="text-align: right;padding-right: 35px;">
                        <span ng-click="changeLocationPage('last')" style="cursor: pointer;">
                            <i class="far fa-chevron-right" style="font-size: 0.7em;"></i>
                            <i class="far fa-chevron-right asp-label" style="margin-right: -3px;font-size: 0.7em;"></i>
                        </span>
                        <span ng-click="changeLocationPage(1)">
                        <i class="far fa-chevron-right asp-label" 
                           style="margin: 0 10px;cursor: pointer;font-size: 0.7em;"></i>
</span>
                        <input class="form-control" id="pagingD"
                               placeholder="{{locationsData.PageIndex}} از  {{locationsData.TotalPages}}"
                               style="width: 30%;display: inline-block;position: relative;top: 0px;font-size: 0.7em;"
                               ng-model="pageNumber" ng-keyup="changePageLocation($event,pageNumber);">
                       <span ng-click="changeLocationPage(-1)">
                        <i class="far fa-chevron-left asp-label" 
                           style="margin: 0 10px;cursor: pointer;font-size: 0.7em;"></i>
</span>
                        <span ng-click="changeLocationPage('first')" style="cursor: pointer;">
                            <i class="far fa-chevron-left asp-label" style="margin-left: -3px;font-size: 0.7em;"></i>
                            <i class=" far fa-chevron-left asp-label" style="font-size: 0.7em;"></i>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
    `
});
