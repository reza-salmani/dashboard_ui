function SelectController($scope, $compile, $timeout) {
  var $ctrl = $scope;
  $scope.clicked = false;
  $scope.selected = false;
  //======================= check Url =======================
  this.$onInit = function () {
    if ($ctrl.getData.identifier === undefined)
      $ctrl.getData.identifier = "Id";
    $scope.outerId = `header_${$scope.$id}`;
    $scope.innerId = `items_${$scope.$id}`;
    if (localStorage.getItem('pageSizeGloab')) {
      $scope.data.PageSize = Number(localStorage.getItem('pageSizeGloab'));
    }
  };
  $scope.$watch(`selectedData`, function () {
    $scope.selectItem = [];
    if ($scope.data.selectedData != undefined) {
      if ($scope.data.selectedData.length) {
        $scope.selectItem = $scope.data.selectedData;
      }
    }
  }, true);
  $scope.$watch(`data.data`, function () {
    if ($scope.data.data.length)
      $scope.dataItems = [...$scope.data.data];

  });
  $scope.$watch(`data.BreadCrumbs.Items`, function () {
    if ($scope.data.BreadCrumbs != undefined) {
      $scope.breadCrumbsItems = $scope.data.BreadCrumbs.Items;
    }
  });
  $scope.$watch('selected', function () {
    if (!$scope.data.selectedData.length) {
      $scope.selectItem = $scope.data.selectedData;
    }
    if ($scope.selected) {
      let position = document.getElementById($scope.outerId).getBoundingClientRect();
      $timeout(function () {
        let itemPosition = document.getElementById($scope.innerId).getBoundingClientRect();
        if (position.width < 250) {
          document.getElementById($scope.innerId).style.width = "250px";
        } else {
          document.getElementById($scope.innerId).style.width = position.width + "px";
        }
        // if ((window.innerWidth - position.right) < itemPosition.width) {
        //  document.getElementById($scope.innerId).style.right = `${window.innerWidth - (position.right)}px`
        // } else {
        //  document.getElementById($scope.innerId).style.left = `${position.left}px`
        // }
        //document.getElementById($scope.innerId).style.left = 0;
        // if ((window.innerHeight - (position.top + position.height)) < 270 - position.height) {
        //  //document.getElementById($scope.innerId).style.top = `${position.top - 260}px`
        //   document.getElementById($scope.innerId).style.top = 0
        //  //document.getElementById($scope.innerId).classList.add('showBoxDirectiveExtras');
        // } else {
        //  //document.getElementById($scope.innerId).style.top = `${position.top + position.height}px`
        //  //document.getElementById($scope.innerId).classList.add('showBoxDirectiveExtra');
        // }
        document.getElementById($scope.innerId).classList.add('showSelect');
      }, 1);
    } else {
      $timeout(function () {
        if (document.getElementById($scope.innerId) !== null)
          document.getElementById($scope.innerId).classList.remove('showSelect');
      }, 1);
    }
  });

  //$scope.mouseOver = function () {
  //  $scope.selected = true;
  //  $scope.timeout = 150;
  //}
  //$scope.leaveMouse = function () {
  //  if (!$scope.selectItem.length) {
  //    $timeout(function () {
  //      $scope.selected = false;
  //    }, $scope.timeout != undefined ? $scope.timeout : 150)
  //  }
  //}
  $scope.searchItem = function (param, item) {
    let search = '';
    if (!$scope.footer) {
      if (item != undefined && item != '') {
        if (item.length) {
          search = item;
        }
        $scope.dataItems = $scope.dataItems.filter(x => x[param.latin].toString().includes(search));
      } else {
        $scope.dataItems = [...$scope.data.data];
      }
    } else {
      if (item !== undefined && item.toString().length !== 0)
        search = item;
      if ($scope.data.searchItems.some(x => x.key === param.latin)) {
        $scope.data.searchItems.find(x => x.key === param.latin).value = search;
      } else {
        $scope.data.searchItems.push({ key: param.latin, value: search });
      }
    }
  };
  $scope.loadPage = function (item) {
    if (Number(item) <= $scope.data.TotalPages && $scope.data.TotalPages >= $scope.data.PageIndex && Number(item) > 0) {
      if ($scope.maxSelectable !== 1) {
        document.getElementById('ThisPageData').checked = false;
      }
      $scope.data.PageIndex = Number(item);
    }
  };
  $scope.checkState = function (item) {
    let result = false;
    if ($scope.selected && $scope.selectItem != undefined) {
      if ($scope.selectItem.some(x => x[$ctrl.getData.identifier] === item)) {
        result = true;
      }
    }
    return result;
  };
  $scope.calcState = function (item) {
    let result = false;
    if (item != undefined) {
      result = !item;
    }
    return result;
  };
  $scope.showState = function () {
    if (!$scope.disabled) {
      $scope.selected = !$scope.selected;
      $scope.checkState();
    }
  };

  $scope.closeList = function () {
    $scope.selected = false;
  };
  $scope.removeItem = function (item) {
    if ($scope.selectItem.length) {
      $scope.selectItem = $scope.selectItem.filter(x => x[$ctrl.getData.identifier] !== item[$ctrl.getData.identifier]);
      if ($scope.selectItem.length) {
        $scope.data.selectedData = $scope.selectItem;
      } else {
        $scope.data.selectedData = [];
        $scope.showDataINEdit = "";
      }
    }
    if ($scope.showDataINEdit.length) {
      $scope.showDataINEdit = "";
    }
  };
  $scope.setThisPageData = function (event, item) {
    if (event.target.checked) {
      Object.values(item).forEach(x => {
        if (!$scope.selectItem.some(y => y[$ctrl.getData.identifier] === x[$ctrl.getData.identifier])) {
          $scope.selectItem.push(x);
          $scope.checkState(x[$ctrl.getData.identifier]);
        }
      });
    } else {
      if (item.length) {
        Object.values(item).forEach(y => {
          $scope.selectItem = $scope.selectItem.filter(x => x[$ctrl.getData.identifier] != y[$ctrl.getData.identifier]);
          $scope.checkState(y[$ctrl.getData.identifier]);
        });
      }
    }
    $scope.data.selectedData = $scope.selectItem;
    if ($scope.data.searchItems.length) {
      $scope.data.searchItems = [];
      $scope.data.PageSize = 10;
      $scope.data.PageIndex = 1;
    }
  };
  $scope.checkClass = function () {
    let classes1 = '';
    let classes = '';
    if (!$scope.disabled) {
      classes += 'pointer';
    } else {
      classes += 'notPointer';
      $scope.selectItem = [];
    }
    if ($scope.required && !$scope.selectItem.length) {
      classes1 += 'border border-danger';
    } else {
      classes1 += '';
    }
    classes += classes1;
    return classes;
  };
  $scope.clickedOnSelect = function () {
    $scope.clicked = !$scope.clicked;
    $scope.data.loading = false;
    if ($scope.clicked)
      $scope.data.loading = true;
  };
  $scope.setData = function (event, item) {
    let input = event.target.querySelector('input');
    if (event.target.nodeName !== "TR") {
      input = event.target.parentNode.querySelector('input');
    }
    if ($scope.maxSelectable !== 1) {
      if (input.checked === true) {
        if ($scope.selectItem.length < $scope.maxSelectable || $scope.maxSelectable === 0) {
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
    $scope.data.selectedData = $scope.selectItem;
    if ($scope.data.searchItems.length) {
      $scope.data.searchItems = [];
      $scope.data.PageSize = 10;
      $scope.data.PageIndex = 1;
    }
  };
  $scope.btnSelection = function (btn) {
    $scope.data.footerBtns.find(x => x.latin === btn.latin).selected = true;
  };
  $scope.goToBreadCrumbItems = function (item) {
    if ($scope.data.BreadCrumbs.Items.length) {
      if (!$scope.data.BreadCrumbs.Items.some(x => x[$ctrl.getData.identifier] === item[$ctrl.getData.identifier])) {
        $scope.data.BreadCrumbs.Items.push(item);
      } else {
        for (var i = 0; i < $scope.data.BreadCrumbs.Items.length; i++) {
          if ($scope.data.BreadCrumbs.Items[i][$ctrl.getData.identifier] === item[$ctrl.getData.identifier]) {
            $scope.data.BreadCrumbs.Items = $scope.data.BreadCrumbs.Items.slice(0, i + 1);
          }
        }
      }
    } else {
      $scope.data.BreadCrumbs.Items.push(item);
    }
  };
  //======================== settings ======================
  $scope.showModalSetting = function () {
    document.getElementById('settingModal').classList.remove('hidden');
    document.getElementById('settingModal').classList.add('showSelect');
  };
  $scope.cancelSetting = function () {
    document.getElementById('settingModal').classList.remove('showSelect');
    document.getElementById('settingModal').classList.add('hidden');
  };
  $scope.setting = function (item) {
    if (item.length) {
      localStorage.setItem("pageSizeGloab", Number(item));
      $scope.data.PageSize = Number(item);
      $scope.cancelSetting();
      $scope.settings = "";
    }
  };
}
// ===================================================== create component ================================================
app.directive("cSelect", function () {
  return {
    restrict: 'E',
    require: ['ngModel'],
    scope: {
      data: '=',
      showDataINEdit: '=ngModel',
      maxSelectable: '<',
      disabled: '<',
      required: '<',
      footer: '<',
      class: '@',
      title: '@',
      mode: '@',
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
    .selectedItems {
        cursor: pointer;
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
    .showBoxDirective {
        opacity: 0;
        position: absolute;
        width:auto;
        height:auto;
        z-index: -1;
        transition: opacity 0.2s ease-in-out;
    }
    .divInnderSelect {
      position:absolute;
        height: 250px;
    }
    .tableSelect {
      overflow:hidden auto
    }
    .showSelect {
      opacity : 1;
      max-width: 400px;
      z-index: 99999;
    }
    .noscroll::-webkit-scrollbar {
        display: none;
    }
    .noscroll {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
    .background {
        background-color: rgba(0,0,0,0.4) !important
    }
    .footer {
      position: absolute;
      bottom: 0
    }
</style>
<div class="position-relative" id="{{outerId}}" ng-click="clickedOnSelect()">
    <div class="input-group">
        <div class="input-group-prepend" ng-if="title.length">
            <div class="input-group-text small-font" ng-class="[class !== undefined ? class:'']">
                {{title}}
            </div>
        </div>
        <p class="form-control noscroll selectedItems" ng-class="checkClass()" ng-click="showState()">
            <i class="far fa-chevron-down dropBtn"></i>
            <span ng-if="(data.selectedData.length === 1 && mode.toUpperCase() === 'CREATE') || (mode.toUpperCase() === 'EDIT' && showDataINEdit.length)" class="span" style="font-size:11px !important" ng-click="removeItem(data.selectedData[0])">
              {{mode.toUpperCase() === 'CREATE' ? data.selectedData[0][data.parameter[0].latin]:showDataINEdit}}
              {{data.parameter.length ===2 ? "(" + data.selectedData[0][data.parameter[1].latin]+")":''}}<i class="far fa-close mr-1 text-danger pointer" ></i></span>
            <span ng-if="data.selectedData.length && data.selectedData.length>1 && mode.toUpperCase() === 'CREATE'" class="badge-warning span" ng-repeat="item in data.selectedData track by $index" ng-click="removeItem(item)">{{item[data.parameter[0].latin]}} {{data.parameter.length ===2 ? "(" + data.selectedData[$index][data.parameter[1].latin]+")":''}}
            <i class="far fa-close mr-1 text-danger pointer" ></i></span>
            <span class="position-absolute" style="top:5px;font-size:11px" ng-if="!data.selectedData.length && !showDataINEdit.length">لطفا انتخاب نمایید...</span>
        </p>      
    </div>
<div id="{{innerId}}" ng-mouseleave="leaveMouse()" ng-mouseover="mouseOver()" class="showBoxDirective">
    <div class="card divInnderSelect">
    <p ng-if="data.BreadCrumbs !== undefined" class="float-right d-flex p-0 m-0 text-right pointer">
      <i class="far fa-home"></i>
      <span class="mx-1 p-0" style="font-size:0.8em" ng-repeat="breadCrumb in breadCrumbsItems track by $index" ng-click="goToBreadCrumbItems(breadCrumb)">{{breadCrumb.Name}}/</p>
    </p>
    <div class="tableSelect">
        <table class="newTableStyle">
            <thead>
                <tr>
                    <th style="width:3%"><p>ردیف</p></th>
                    <th style="width:3%">
                        <!--<input ng-if="maxSelectable!==1" type="checkbox"
                        ng-click="setAllData()">-->
                    </th>
                    <th ng-repeat="param in data.parameter track by $index"><p>{{param.per}}</p></th>
                </tr>
                <tr>
                    <td><i class="far fa-cog text-primary text-left pointer" title="تنظیمات جدول" ng-attr-title="{{'تعداد کل : ' + data.TotalRow + ' | ' + 'تعداد در صفحه : ' +pageSizes}}" ng-click="showModalSetting()"></td>
                    <td>
                        <input class="p-0 m-0" id="ThisPageData" ng-if="maxSelectable !== 1" type="checkbox"
                               ng-click="setThisPageData($event,data.data)">
                    </td>
                    <td ng-repeat="param in data.parameter track by $index">
                        <input type="text" class="form-control" ng-model="searchValue" ng-disabled="calcState(param.searchState)" ng-keyup="searchItem(param,searchValue)" />                
                    </td>
                </tr>
            </thead>
            <tbody class="selectBody">
                <tr ng-if="data.data.length" ng-repeat="dataList in dataItems track by $index" ng-click="setData($event,dataList)">
                    <td class="text-center">
                        {{(data.PageIndex-1)*data.PageSize + $index+1}}
                    </td>
                    <td class="text-center">
                        <input ng-if="maxSelectable===1" ng-checked="checkState(dataList[$ctrl.getData.identifier])" type="radio" id="{{dataList[$ctrl.getData.identifier]}}" value="{{dataList[$ctrl.getData.identifier]}}">
                        <input class="p-0 m-0" ng-if="maxSelectable!==1" ng-checked="checkState(dataList[$ctrl.getData.identifier])" id="{{dataList[$ctrl.getData.identifier]}}" type="checkbox" value="{{dataList[$ctrl.getData.identifier]}}">
                    </td>
                    <td ng-repeat="param in data.parameter track by $index" class="text-center" ng-click="data.BreadCrumbs !== undefined && dataList[data.BreadCrumbs.param] ?goToBreadCrumbItems(dataList):''">
                        {{dataList[param.latin]}}
                        <i ng-if="data.BreadCrumbs !== undefined && dataList[data.BreadCrumbs.param]" class="far fa-chevron-left float-left pl-3 font-weight-bold" title="دارای زیر مجموعه" ></i>
                    </td>
                </tr>
                <tr ng-if="!data.data.length">
                    <td class="col-12 m-auto text-center" colspan="{{data.parameter.length +2}}">در حال دریافت اطلاعات...</td>
                </tr>
            </tbody>
        </table>
    </div>
    <div class=" p-1 m-0" ng-if="footer">
        <div class="col-12 border justify-content-center m-auto mt-1 mb-1">
            <div class="row">
                <div ng-class="[data.footerBtns !==undefined?'col-lg-8':'col-lg-12']" class="d-flex m-auto justify-content-center">
                  <div class="text-center" ng-click="loadPage(data.TotalPages)" style="cursor: pointer;width: 25px;padding-top:2px">
                    <i class="far fa-chevron-right" style="font-size: 0.7em;"></i>
                    <i class="far fa-chevron-right"
                        style="font-size: 0.7em;"></i>
                  </div>
                  <div class="text-center" style="cursor: pointer;width: 25px;padding-top:2px" ng-click="loadPage(data.PageIndex+1)">
                    <i class="far fa-chevron-right"
                        style="font-size: 0.7em;"></i>
                  </div>
                  <div style="width:auto" class="p-0 m-0 text-center">
                    <input class="form-control p-0 m-0" id="pagingD" placeholder="{{data.PageIndex}} از {{data.TotalPages}}"
                            style="font-size: 0.5em;display: inline-block"
                            ng-model="pageNumbers" ng-keyup="loadPage(pageNumbers);">
                  </div>
                  <div class="text-center" style="cursor: pointer;width: 25px;padding-top:2px" ng-click="loadPage(data.PageIndex-1)">
                    <i class="far fa-chevron-left"
                        style="font-size: 0.7em;"></i>
                  </div>
                  <div class="text-center" ng-click="loadPage(1)" style="cursor: pointer;width: 25px;padding-top:2px">
                    <i class="far fa-chevron-left" style="font-size: 0.7em;"></i>
                    <i class=" far fa-chevron-left" style="font-size: 0.7em;"></i>
                  </div>
                </div>
              <div ng-if="data.footerBtns !==undefined" class="col-lg-4">
                  <div class="d-flex float-left">
                    <span ng-repeat="btn in data.footerBtns track by $index" title="{{btn.per}}" ng-click="btnSelection(btn)"><i ng-class="['far pointer mx-1',btn.icon]" ></i></span>
                </div>
              </div>
            </div>
        </div>
    </div>
    <div class="hidden position-absolute " style="z-index:1000" id="settingModal">
        <div class="card-body background">
            <p class="HeaderForm">
                تنظیمات جدول
                <i class="far fa-close cancelIcon" ng-click="cancelSetting()"></i>
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
    </div></div>
</div></div>`
  };
});

// ===================================================== how to use it ================================================
//<c-select data="dataForSelect" class="label-width-90px" required="false" mode="edit" max-selectable="1" disabled="false" footer="true" title="شماره نسخه" ng-model="organization.treeViewPage.chartDataInfo.LicenceNumber"></c-select>
//$scope.dataForSelect = {
//  data: [],
//  selectedData: [],
//  searchItems: [],
//  BreadCrumbs: { param: 'HasChildren', Items: [] },
//  footerBtns: [{ Id: 0, latin: 'Add', icon: 'fa-plus' }],
//  PageSize: 10,
//  PageIndex: 1,
//  loading: false,
//  TotalRow: null,
//  TotalPages: null,
//  parameter: [{ latin: 'LicenceDatePersian', per: 'تاریخ مجوز', searchState: false }, { latin: 'LicenceNumber', per: 'شماره نسخه', searchState: false }]
//}

