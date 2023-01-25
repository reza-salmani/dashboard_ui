app.controller('PersonnelActionFormCtrl', function ($scope, RequestApis, $timeout, global, $compile, $templateCache, $state, FileSaver, Blob) {
  //=================== initial variable ===================
  $templateCache.remove($state.current.templateUrl);
  $scope.PersonnelActionForm = {};
  $scope.PersonnelActionForm.showFilters = {};
  $scope.PersonnelActionForm.validation = false;
  $scope.PersonnelActionForm.loadingPage = false;
  $scope.PersonnelActionForm.loadingFailed = false;
  $scope.PersonnelActionForm.showAdvanced = false;
  $scope.PersonnelActionForm.checkValidationOnBtn = false;
  $scope.PersonnelActionForm.checkValidation = true;
  $scope.PersonnelActionForm.refreshWritTypeState = true;
  $scope.PersonnelActionForm.refreshEmployeeTypeState = true;
  $scope.PersonnelActionForm.checkThisState = false;
  $scope.PersonnelActionForm.NotAllowed = true;
  $scope.PersonnelActionForm.showGrid = false;
  $scope.PersonnelActionForm.CheckAllItems = false;
  $scope.PersonnelActionForm.employeeTypeDisable = false;
  $scope.PersonnelActionForm.writTypeDisable = true;
  $scope.PersonnelActionForm.writGridPageNumber = 1;
  $scope.PersonnelActionForm.pageNumber = '';
  $scope.PersonnelActionForm.writGridPageSize = 10;
  $scope.PersonnelActionForm.localSelectedWritItems = [];
  $scope.PersonnelActionForm.selectedPrintSettingItems = [];
  $scope.PersonnelActionForm.localSelectedWritItemsExcluded = [];
  $scope.PersonnelActionForm.writInfo = {};
  $scope.PersonnelActionForm.selectedWritItemInfo = {};
  $scope.PersonnelActionForm.printItems = {};
  $scope.PersonnelActionForm.SelectedSignerData = [];
  $scope.PersonnelActionForm.correctToSend = [];
  $scope.PersonnelActionForm.createItem = {};
  $scope.PersonnelActionForm.createItemManual = {};
  $scope.PersonnelActionForm.createItem.showOtherTag = false;
  $scope.PersonnelActionForm.manualWritInfo = [];
  $scope.PersonnelActionForm.selectedItemsInfo = [];
  $scope.PersonnelActionForm.groupCreate = {};
  $scope.PersonnelActionForm.groupCreate.personnels = [];
  $scope.PersonnelActionForm.groupCreate.IdsP = [];
  $scope.PersonnelActionForm.groupCreate.pafIdsAfterCreate = [];
  $scope.PersonnelActionForm.firstLevel = false;
  $scope.PersonnelActionForm.ShowPersonnels = false;
  $scope.PersonnelActionForm.secondLevel = false;
  $scope.PersonnelActionForm.thirdLevel = false;
  $scope.PersonnelActionForm.forthLevel = false;
  $scope.PersonnelActionForm.FinalIds = [];
  $scope.PersonnelActionForm.currentPage = '../../views/PersonnelActionForms/current.html?v=' + Date.now();
  $scope.PersonnelActionForm.prePage = '../../views/PersonnelActionForms/pre.html?v=' + Date.now();
  $scope.PersonnelActionForm.exPage = '../../views/PersonnelActionForms/ex.html?v=' + Date.now();
  $scope.PersonnelActionForm.currentPageM = '../../views/PersonnelActionForms/currentManual.html?v=' + Date.now();
  $scope.PersonnelActionForm.prePageM = '../../views/PersonnelActionForms/preManual.html?v=' + Date.now();
  $scope.PersonnelActionForm.exPageM = '../../views/PersonnelActionForms/exManual.html?v=' + Date.now();
  $scope.PersonnelActionForm.showDetailsItemStateCurrent = false;
  $scope.PersonnelActionForm.showDetailsItemStatePre = false;
  $scope.PersonnelActionForm.showDetailsItemStateEx = false;
  $scope.searchFilterItemsInGroupP = {};
  $scope.PersonnelActionForm.createItemManual.nextLevelInCreatingManualWrit = false;
  //======================= refresh page ====================
  $scope.RefreshWritType = function () {
    localStorage.removeItem("pageNumGloabwritType");
    $scope.PersonnelActionForm.refreshWritTypeState = false;
    $timeout(function () {
      $scope.PersonnelActionForm.getWritType.PageIndex = 1;
      $scope.PersonnelActionForm.getWritType.PageSize = 10;

      $scope.PersonnelActionForm.refreshWritTypeState = true;
    }, 100);
  };
  $scope.RefreshEmployeeType = function () {
    localStorage.removeItem("pageNumGloabemployeeType");
    $scope.PersonnelActionForm.refreshEmployeeTypeState = false;
    $timeout(function () {
      $scope.PersonnelActionForm.refreshEmployeeTypeState = true;
    }, 100);
  };
  //======================= check authorization =============
  $scope.checkAuth = function () {
    $scope.RefreshWritType();
    $scope.RefreshEmployeeType();
    $scope.PersonnelActionForm.loadingPage = true;
    RequestApis.HR(`securities/HR/view/HR_PAF`, 'Get', '', '', '', function (response) {
      if (response.status !== 200) {
        // $scope.PersonnelActionForm.redirectUrlForUnAuth = '../../views/PermissionWarning.html';
        // $scope.PersonnelActionForm.checkValidation = false;
      } else {
        $scope.getDataEmployeeTypeFunc();
        RequestApis.HR(`securities/HR/exec/HR_PAF`, 'Get', '', '', '', function (response) {
          if (response.status === 200) {
            $scope.PersonnelActionForm.checkValidationOnBtn = true;
          } else {
            $scope.PersonnelActionForm.checkValidationOnBtn = false;
          }
        });
      }
      $scope.PersonnelActionForm.loadingPage = false;
    });
  };
  $scope.checkAuth();
  ////============================ search and selecting personnel ========================
  $scope.personnelData = {
    data: [],
    dataIdsObj: {},
  };
  $scope.useSelectedPersonnel = function (data = $scope.personnelData.data) {
    $scope.personnelInfo = data;
    if (global.checkExist($scope.personnelInfo)) {
      $scope.searchFilter($scope.PersonnelActionForm.showFilters);
      $scope.getDataEmployeeTypeFunc();
    }
  };
  //======================= advance search ==================
  $scope.SearchDataItem = {
    data: {},
    Items: ["name", "family", "fatherName", "nationalCode", "sex", "age", "maritalState", "childCount", "dossierNum", "personnelNum", "chart", "employeeState", "employeeDate", "jobLevel", "sacrificeState", "sacrificeRelation", "postGrade", "grade", "jobField", "class"],
    startDate: moment().format('jYYYY/jMM/jDD'),
    finishDate: moment().format('jYYYY/jMM/jDD'),
  };
  $scope.returnSearchDataFunc = function (data = $scope.SearchDataItem.data) {
    $scope.searchFilterItems = data;
  };


  //===== convert date to shamsi ===========
  $scope.convertToShamsi = function (date) {
    if (date != null) {
      return moment(date, 'YYYY/M/D').format('jYYYY/jMM/jDD');
    } else {
      return "-";
    }
  };
  //====== convert date to miladi ==========
  $scope.convertToMiladi = function (date) {
    if (date != null) {
      return moment(date, 'jYYYY/jM/jD').format('YYYY-MM-DD');
    } else {
      return "-";
    }
  };
  //======================= input masks =====================
  $scope.inputMasks = function () {
    $timeout(function () {
      $(".date-picker").datepicker({
        dateFormat: "yy/mm/dd",
        changeMonth: true,
        changeYear: true,
      });
    }, 1);
    $(".precent").inputmask('integer', { min: 0, max: 100 });
    $(".precentF").inputmask({
      alias: "numeric",
      integerDigits: 3,
      digits: 2,
      max: 100,
      allowMinus: false,
      digitsOptional: false,
    });
    $(".numeric").inputmask('integer', { min: 0 });
    Inputmask({
      clearMaskOnLostFocus: false,
      clearIncomplete: true,
    }).mask(document.querySelectorAll("input"));
    $('.numeric').change(function () {
      angular.element($(this)).triggerHandler('input');
    });
    $('.numericF').change(function () {
      angular.element($(this)).triggerHandler('input');
    });
    $('.precent').change(function () {
      angular.element($(this)).triggerHandler('input');
    });
    $('.date-picker').change(function () {
      angular.element($(this)).triggerHandler('input');
    });
  };
  //======================= use checkExistIn html ===========
  $scope.checkingExist = function (item) {
    return global.checkExist(item);
  };
  //======================= addComma ===========
  $scope.addComma = function (item) {
    if (item != undefined) {
      return item.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
  };
  $scope.addCommaToNUmericValue = function (item) {
    if (item != undefined) {
      return Numeric(item.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
    }
  };
  //======================= sum ===========
  Array.prototype.Sum = function () {
    var total = 0;
    var i = this.length;

    while (i--) {

      total = total + Number(this[i]);
    }
    return total;
  };
  //=================== set preffix to location ==================
  $scope.setPreLocationTitle = function (location) {
    switch (location.TypeIdentity) {
      case 1:
        return "کشور :";
        break;
      case 2:
        return "استان :";
        break;
      case 4:
        return "شهرستان :";
        break;
      case 8:
        return "بخش :";
        break;
      case 16:
        return "شهر :";
        break;
      case 32:
        return "دهستان :";
        break;
      case 64:
        return "روستا :";
        break;

      default:
        return returnItem = "";
    }
  };
  //=================== Employee Type ===================
  $scope.PersonnelActionForm.returnedEmployeeTypeData = {
  };
  $scope.PersonnelActionForm.getEmployeeType = {
    data: {},
    PageSize: 10,
    PageIndex: 1,
    TotalRow: null,
    TotalPages: null,
    lable: "نوع استخدام",
    parameter: [{ latin: 'Title', per: 'عنوان' }]

  };
  $scope.getDataEmployeeTypeFunc = function (querys) {
    let path = `employees/type?ps=10&pn=${$scope.PersonnelActionForm.getEmployeeType.PageIndex != undefined ? $scope.PersonnelActionForm.getEmployeeType.PageIndex : 1}`;
    if (global.checkExist(querys)) {
      path = `employees/type?ps=10&pn=${$scope.PersonnelActionForm.getEmployeeType.PageIndex != undefined ? $scope.PersonnelActionForm.getEmployeeType.PageIndex : 1}${querys}`;
    }
    RequestApis.HR(path, 'Get', '', '', '', function (response) {
      $scope.PersonnelActionForm.getEmployeeType.data = response.data.Items;
      $scope.PersonnelActionForm.getEmployeeType.PageIndex = response.data.PageIndex;
      $scope.PersonnelActionForm.getEmployeeType.PageSize = response.data.PageSize;
      $scope.PersonnelActionForm.getEmployeeType.TotalRow = response.data.TotalRow;
      $scope.PersonnelActionForm.getEmployeeType.TotalPages = response.data.TotalPages;
      if ($scope.PersonnelActionForm.getEmployeeType.TotalPages === 1) {
        $scope.PersonnelActionForm.getEmployeeType.PageIndex = 1;
      }
    });
  };
  $scope.returnDataEmployeeTypeFunc = function (data = $scope.PersonnelActionForm.getEmployeeType.data) {
    if (!global.checkExist(data.item)) {
      if (global.checkExist(data) && data.type.toUpperCase() === "SELECTED") {
        $scope.RefreshWritType();
      }
    }
    if (global.checkExist(data.item)) {
      if (data.type.toUpperCase() === "PAGESIZE") {
        $scope.PersonnelActionForm.getEmployeeType.PageSize = data.item;
        $scope.getDataEmployeeTypeFunc();
      }
      if (data.type.toUpperCase() === "PAGENUMBER") {
        $scope.PersonnelActionForm.getEmployeeType.PageIndex = data.item;
        $scope.getDataEmployeeTypeFunc();
      }
      if (data.type.toUpperCase() === "SEARCH") {
        $scope.PersonnelActionForm.getEmployeeType.PageSize = 10;
        $scope.PersonnelActionForm.getEmployeeType.PageIndex = 1;
        $scope.getDataEmployeeTypeFunc(`&etq=${data.item.search}`);
      }
      if (data.type.toUpperCase() === "SELECTED") {
        $scope.PersonnelActionForm.employeeTypeItem = data.item[0].Id;
        $scope.RefreshWritType();
        $scope.PersonnelActionForm.writTypeDisable = false;
        $scope.getDataWritTypeFunc(data.item[0].Id, null);
      }
    } else {
      $scope.PersonnelActionForm.getEmployeeType.PageSize = 10;
      $scope.PersonnelActionForm.getEmployeeType.PageIndex = 1;
      $scope.PersonnelActionForm.employeeTypeItem = "";
      $scope.PersonnelActionForm.writTypeDisable = true;
      $scope.getDataEmployeeTypeFunc();
    }
  };
  //=================== writ Type ===================
  $scope.PersonnelActionForm.returnedWritTypeData = {
  };
  $scope.PersonnelActionForm.getWritType = {
    data: {},
    PageSize: 10,
    PageIndex: 1,
    TotalRow: null,
    TotalPages: null,
    lable: "نوع حکم",
    parameter: [{ latin: 'Title', per: 'عنوان' }]

  };
  $scope.getDataWritTypeFunc = function (data, querys) {
    if (global.checkExist(data)) {
      let path = `actiontypes/employeeType/${data}?ps=10&pn=${$scope.PersonnelActionForm.getWritType.PageIndex != undefined ? $scope.PersonnelActionForm.getWritType.PageIndex != undefined : 1}`;
      if (global.checkExist(querys)) {
        path = `actiontypes/employeeType/${data}?ps=10&pn=${$scope.PersonnelActionForm.getWritType.PageIndex != undefined ? $scope.PersonnelActionForm.getWritType.PageIndex : 1}${querys}`;
      }
      RequestApis.HR(path, 'Get', '', '', '', function (response) {
        $scope.PersonnelActionForm.getWritType.data = response.data.Items;
        $scope.PersonnelActionForm.getWritType.PageIndex = response.data.PageIndex;
        $scope.PersonnelActionForm.getWritType.PageSize = response.data.PageSize;
        $scope.PersonnelActionForm.getWritType.TotalRow = response.data.TotalRow;
        $scope.PersonnelActionForm.getWritType.TotalPages = response.data.TotalPages;
        if ($scope.PersonnelActionForm.getWritType.TotalPages === 1) {
          $scope.PersonnelActionForm.getWritType.PageIndex = 1;
        }
      });
    }
  };
  $scope.returnDataWritTypeFunc = function (data = $scope.PersonnelActionForm.getWritType.data) {
    if (global.checkExist(data.item)) {
      if (data.type.toUpperCase() === "PAGESIZE") {
        $scope.PersonnelActionForm.getWritType.PageSize = data.item;
        $scope.getDataWritTypeFunc($scope.PersonnelActionForm.employeeTypeItem, null);
      }
      if (data.type.toUpperCase() === "PAGENUMBER") {
        $scope.PersonnelActionForm.getWritType.PageIndex = data.item;
        $scope.getDataWritTypeFunc($scope.PersonnelActionForm.employeeTypeItem, null);
      }
      if (data.type.toUpperCase() === "SEARCH") {
        $scope.PersonnelActionForm.getWritType.PageIndex = 1;
        $scope.PersonnelActionForm.getWritType.PageSize = 10;
        $scope.getDataWritTypeFunc($scope.PersonnelActionForm.employeeTypeItem, `&q=${data.item.search}`);
      }
      if (data.type.toUpperCase() === "SELECTED") {

        if (data.type.toUpperCase() === "SELECTEDTHISPAGE" || data.type.toUpperCase() === "SELECTED") {
          $scope.PersonnelActionForm.writTypeItem = data.item[0].Id;
        }
      }
    } else {
      $scope.PersonnelActionForm.getWritType.PageIndex = 1;
      $scope.PersonnelActionForm.getWritType.PageSize = 10;
      $scope.PersonnelActionForm.writTypeItem = "";
      $scope.getDataWritTypeFunc($scope.PersonnelActionForm.employeeTypeItem, null);
    }
  };
  //=================== ActionForm TypeIdentiy ===================
  $scope.PersonnelActionForm.returnedActionFormTypeIdentiy = {
  };
  $scope.PersonnelActionForm.getActionFormTypeIdentiy = {
    data: {},
    PageSize: 10,
    PageIndex: 1,
    TotalRow: null,
    TotalPages: null,
    lable: "نوع ثبت حکم",
    parameter: [{ latin: 'Title', per: 'عنوان' }]

  };
  $scope.getActionFormTypeIdentiyFunc = function () {
    RequestApis.HR(`constants/enum/ActionFormTypeIdentiy`, 'Get', '', '', '', function (response) {
      $scope.PersonnelActionForm.getActionFormTypeIdentiy.data = response.data;
    });
  };
  $scope.returnActionFormTypeIdentiyFunc = function (data = $scope.PersonnelActionForm.getActionFormTypeIdentiy.data) {
    if (global.checkExist(data.item)) {
      if (data.type.toUpperCase() === "SELECTEDTHISPAGE" || data.type.toUpperCase() === "SELECTED") {
        $scope.PersonnelActionForm.actionFormTypeIdentiy = data.item[0].Id;
      }
    } else {
      $scope.PersonnelActionForm.actionFormTypeIdentiy = "";
      $scope.getActionFormTypeIdentiyFunc();
    }
  };
  //=================== DirtyCause ===================
  $scope.PersonnelActionForm.returnedDirtyCause = {
  };
  $scope.PersonnelActionForm.getDirtyCause = {
    data: [],
    PageSize: 10,
    PageIndex: 1,
    TotalRow: null,
    TotalPages: null,
    lable: "دلیل اشکال",
    parameter: [{ latin: 'Title', per: 'عنوان' }]

  };
  $scope.getDirtyCauseFunc = function () {
    RequestApis.HR(`constants/enum/DirtyCause`, 'Get', '', '', '', function (response) {
      $scope.PersonnelActionForm.getDirtyCause.data = response.data;
    });
  };
  $scope.returnDirtyCauseFunc = function (data = $scope.PersonnelActionForm.getDirtyCause.data) {
    if (global.checkExist(data.item)) {
      if (data.type.toUpperCase() === "SELECTEDTHISPAGE" || data.type.toUpperCase() === "SELECTED") {
        let sum = 0;
        Object.values(data.item).forEach(item => {
          sum += Number(item.Id);
        });
        $scope.PersonnelActionForm.DirtyCause = sum;
      }
    } else {
      $scope.PersonnelActionForm.DirtyCause = "";
      $scope.getDirtyCauseFunc();
    }
  };

  //=================== get writs ===================
  $scope.removeFilter = function () {
    $scope.PersonnelActionForm.showFilters = {};
    $scope.returnDataEmployeeTypeFunc({});
    $scope.returnDataWritTypeFunc({});
    $scope.returnActionFormTypeIdentiyFunc({});
    $scope.returnDirtyCauseFunc({});
  };
  $scope.ShowSearchFilter = function () {
    $scope.PersonnelActionForm.writGridPageNumber = 1;
    $scope.PersonnelActionForm.writGridPageSize = 10;
    $scope.searchFilter($scope.PersonnelActionForm.showFilters);
  };
  $scope.searchFilter = function (additionalFilter) {
    $scope.seachQuery = `?ps=${$scope.PersonnelActionForm.writGridPageSize}&pn=${$scope.PersonnelActionForm.writGridPageNumber}`;
    $scope.SearchQueryForAll = "";
    if (global.checkExist($scope.searchFilterItems)) {
      $scope.seachQuery += $scope.searchFilterItems.data;
      if (global.checkExist($scope.SearchQueryForAll)) {
        $scope.SearchQueryForAll += $scope.searchFilterItems.data;
      } else {
        $scope.SearchQueryForAll += `?${$scope.searchFilterItems.data.substring(1, $scope.searchFilterItems.data.toString().length)}`;
      }
    }
    if (global.checkExist(additionalFilter.isfd)) {
      $scope.seachQuery += `&isfd=${additionalFilter.isfd}`;
      if (global.checkExist($scope.SearchQueryForAll)) {
        $scope.SearchQueryForAll += `&isfd=${additionalFilter.isfd}`;
      } else {
        $scope.SearchQueryForAll += `?isfd=${additionalFilter.isfd}`;
      }
    }
    if (global.checkExist(additionalFilter.isud)) {
      $scope.seachQuery += `&isud=${additionalFilter.isud}`;
      if (global.checkExist($scope.SearchQueryForAll)) {
        $scope.SearchQueryForAll += `&isud=${additionalFilter.isud}`;
      } else {
        $scope.SearchQueryForAll += `?isud=${additionalFilter.isud}}`;
      }
    }
    if (global.checkExist(additionalFilter.exfd)) {
      $scope.seachQuery += `&exfd=${additionalFilter.exfd}`;
      if (global.checkExist($scope.SearchQueryForAll)) {
        $scope.SearchQueryForAll += `&exfd=${additionalFilter.exfd}`;
      } else {
        $scope.SearchQueryForAll += `?exfd=${additionalFilter.exfd}`;
      }
    }
    if (global.checkExist(additionalFilter.exud)) {
      $scope.seachQuery += `&exud=${additionalFilter.exud}`;
      if (global.checkExist($scope.SearchQueryForAll)) {
        $scope.SearchQueryForAll += `&exud=${additionalFilter.exud}`;
      } else {
        $scope.SearchQueryForAll += `?exud=${additionalFilter.exud}`;
      }
    }
    if (global.checkExist($scope.PersonnelActionForm.employeeTypeItem)) {
      $scope.seachQuery += `&et=${$scope.PersonnelActionForm.employeeTypeItem}`;
      if (global.checkExist($scope.SearchQueryForAll)) {
        $scope.SearchQueryForAll += `&et=${$scope.PersonnelActionForm.employeeTypeItem}`;
      } else {
        $scope.SearchQueryForAll += `?et=${$scope.PersonnelActionForm.employeeTypeItem}`;
      }
    }
    if (global.checkExist($scope.PersonnelActionForm.writTypeItem)) {
      $scope.seachQuery += `&at=${$scope.PersonnelActionForm.writTypeItem}`;
      if (global.checkExist($scope.SearchQueryForAll)) {
        $scope.SearchQueryForAll += `&at=${$scope.PersonnelActionForm.writTypeItem}`;
      } else {
        $scope.SearchQueryForAll += `?at=${$scope.PersonnelActionForm.writTypeItem}`;
      }
    }
    if (global.checkExist(additionalFilter.dft)) {
      $scope.seachQuery += `&dft=${Number(additionalFilter.dft)}`;
      if (global.checkExist($scope.SearchQueryForAll)) {
        $scope.SearchQueryForAll += `&dft=${Number(additionalFilter.dft)}`;
      } else {
        $scope.SearchQueryForAll += `?dft=${Number(additionalFilter.dft)}`;
      }
    }
    if (global.checkExist(additionalFilter.dp)) {
      $scope.seachQuery += `&dp=${additionalFilter.dp}`;
      if (global.checkExist($scope.SearchQueryForAll)) {
        $scope.SearchQueryForAll += `&dp=${additionalFilter.dp}`;
      } else {
        $scope.SearchQueryForAll += `?dp=${additionalFilter.dp}`;
      }
    }
    if (global.checkExist(additionalFilter.il)) {
      $scope.seachQuery += `&il=${additionalFilter.il}`;
      if (global.checkExist($scope.SearchQueryForAll)) {
        $scope.SearchQueryForAll += `&il=${additionalFilter.il}`;
      } else {
        $scope.SearchQueryForAll += `?il=${additionalFilter.il}`;
      }
    }
    if (global.checkExist(additionalFilter.hv)) {
      $scope.seachQuery += `&hv=${additionalFilter.hv}`;
      if (global.checkExist($scope.SearchQueryForAll)) {
        $scope.SearchQueryForAll += `&hv=${additionalFilter.hv}`;
      } else {
        $scope.SearchQueryForAll += `?hv=${additionalFilter.hv}`;
      }
    }
    if (global.checkExist(additionalFilter.gidx)) {
      $scope.seachQuery += `&gidx=${additionalFilter.gidx}`;
      if (global.checkExist($scope.SearchQueryForAll)) {
        $scope.SearchQueryForAll += `&gidx=${additionalFilter.gidx}`;
      } else {
        $scope.SearchQueryForAll += `?gidx=${additionalFilter.gidx}`;
      }
    }
    if (global.checkExist(additionalFilter.frno)) {
      $scope.seachQuery += `&frno=${additionalFilter.frno}`;
      if (global.checkExist($scope.SearchQueryForAll)) {
        $scope.SearchQueryForAll += `&frno=${additionalFilter.frno}`;
      } else {
        $scope.SearchQueryForAll += `?frno=${additionalFilter.frno}`;
      }
    }
    if (global.checkExist($scope.PersonnelActionForm.actionFormTypeIdentiy)) {
      $scope.seachQuery += `&ti=${$scope.PersonnelActionForm.actionFormTypeIdentiy}`;
      if (global.checkExist($scope.SearchQueryForAll)) {
        $scope.SearchQueryForAll += `&ti=${$scope.PersonnelActionForm.actionFormTypeIdentiy}`;
      } else {
        $scope.SearchQueryForAll += `?ti=${$scope.PersonnelActionForm.actionFormTypeIdentiy}`;
      }
    }
    if (global.checkExist(additionalFilter.idt)) {
      $scope.seachQuery += `&idt=${additionalFilter.idt}`;
      if (global.checkExist($scope.SearchQueryForAll)) {
        $scope.SearchQueryForAll += `&idt=${additionalFilter.idt}`;
      } else {
        $scope.SearchQueryForAll += `?idt=${additionalFilter.idt}`;
      }
      if (global.checkExist($scope.PersonnelActionForm.DirtyCause)) {
        $scope.seachQuery += `&dc=${$scope.PersonnelActionForm.DirtyCause}`;
        if (global.checkExist($scope.SearchQueryForAll)) {
          $scope.SearchQueryForAll += `&dc=${$scope.PersonnelActionForm.DirtyCause}`;
        } else {
          $scope.SearchQueryForAll += `?dc=${$scope.PersonnelActionForm.DirtyCause}`;
        }
      }
    }
    if (global.checkExist(additionalFilter.hp)) {
      $scope.seachQuery += `&hp=${additionalFilter.hp}`;
      if (global.checkExist($scope.SearchQueryForAll)) {
        $scope.SearchQueryForAll += `&hp=${additionalFilter.hp}`;
      } else {
        $scope.SearchQueryForAll += `?hp=${additionalFilter.hp}`;
      }
      if (global.checkExist(additionalFilter.hpfd)) {
        $scope.seachQuery += `&hpfd=${additionalFilter.hpfd}`;
        if (global.checkExist($scope.SearchQueryForAll)) {
          $scope.SearchQueryForAll += `&hpfd=${additionalFilter.hpfd}`;
        } else {
          $scope.SearchQueryForAll += `?hpfd=${additionalFilter.hpfd}`;
        }
      }
      if (global.checkExist(additionalFilter.hpud)) {
        $scope.seachQuery += `&hpud=${additionalFilter.hpud}`;
        if (global.checkExist($scope.SearchQueryForAll)) {
          $scope.SearchQueryForAll += `&hpud=${additionalFilter.hpud}`;
        } else {
          $scope.SearchQueryForAll += `?hpud=${additionalFilter.hpud}`;
        }
      }
    } else {
      additionalFilter.hpfd = '';
      additionalFilter.hpud = '';
    }
    $scope.getWritList($scope.seachQuery);
  };
  $scope.getWritList = function (filters) {
    $scope.PersonnelActionForm.loadingGridData = true;
    $scope.PersonnelActionForm.showGrid = true;
    if (global.checkExist($scope.personnelInfo)) {
      RequestApis.HR(`pafs/personnel/${$scope.personnelInfo[0].Id}${filters}`, 'Get', '', '', '', function (response) {
        if (response.status === 200) {
          $scope.PersonnelActionForm.writList = response.data;
        } else {
          $scope.PersonnelActionForm.writList = [];
        }
        $scope.PersonnelActionForm.loadingGridData = false;
      });
    } else {
      RequestApis.HR(`pafs${filters}`, 'Get', '', '', '', function (response) {
        if (response.status === 200) {
          $scope.PersonnelActionForm.writList = response.data;
        } else {
          $scope.PersonnelActionForm.writList = [];
        }
        $scope.PersonnelActionForm.loadingGridData = false;
      });
    }

  };
  $scope.pagingGrid = function (page) {
    if ($scope.PersonnelActionForm.writList.PageIndex <= $scope.PersonnelActionForm.writList.TotalPages && Number(page) > 0 && $scope.PersonnelActionForm.writList.TotalPages >= Number(page)) {
      $scope.PersonnelActionForm.writGridPageNumber = Number(page);
      $scope.searchFilter($scope.PersonnelActionForm.showFilters);
      $scope.PersonnelActionForm.pageNumber = '';
    }
  };
  //================ check Section ==================
  $scope.checkAllBtn = function (event) {
    if (event.target.checked) {
      $scope.PersonnelActionForm.CheckAllItems = true;
    } else {
      $scope.PersonnelActionForm.CheckAllItems = false;
    }
  };
  $scope.checkThisPageBtn = function (event, items) {
    if (event.target.checked) {
      $scope.PersonnelActionForm.checkThisState = true;
      Object.values(items).forEach(item => {
        if (!$scope.PersonnelActionForm.localSelectedWritItems.some(x => x.Id === item.Id)) {
          $scope.PersonnelActionForm.localSelectedWritItems.push(item);
          $scope.PersonnelActionForm.localSelectedWritItemsExcluded = $scope.PersonnelActionForm.localSelectedWritItemsExcluded.filter(x => x.Id != item.Id);
        }
      });
    } else {
      $scope.PersonnelActionForm.checkThisState = false;
      Object.values(items).forEach(item => {
        $scope.PersonnelActionForm.localSelectedWritItems = $scope.PersonnelActionForm.localSelectedWritItems.filter(x => x.Id != item.Id);
        if (!$scope.PersonnelActionForm.localSelectedWritItemsExcluded.some(x => x.Id === item.Id)) {
          $scope.PersonnelActionForm.localSelectedWritItemsExcluded.push(item);
        }
      });
    }
  };
  $scope.checkThisItemBtn = function (event, item) {
    if (event.target.checked) {
      if (!$scope.PersonnelActionForm.localSelectedWritItems.some(x => x.Id === item.Id)) {
        $scope.PersonnelActionForm.localSelectedWritItems.push(item);
        $scope.PersonnelActionForm.localSelectedWritItemsExcluded = $scope.PersonnelActionForm.localSelectedWritItemsExcluded.filter(x => x.Id != item.Id);
      }
    } else {
      $scope.PersonnelActionForm.localSelectedWritItems = $scope.PersonnelActionForm.localSelectedWritItems.filter(x => x.Id != item.Id);
      if (!$scope.PersonnelActionForm.localSelectedWritItemsExcluded.some(x => x.Id === item.Id)) {
        $scope.PersonnelActionForm.localSelectedWritItemsExcluded.push(item);
      }
    }
  };
  $scope.checkState = function (item) {
    let result = false;
    if ($scope.PersonnelActionForm.localSelectedWritItems.some(x => x.Id === item.Id) || $scope.PersonnelActionForm.CheckAllItems) {
      result = true;
    }
    return result;
  };
  $scope.checkThisPageState = function () {
    let result = false;
    if (global.checkExist($scope.PersonnelActionForm.writList)) {
      if ($scope.PersonnelActionForm.writList.Items.length === $scope.PersonnelActionForm.localSelectedWritItems.length) {
        result = true;
      }
    }
    return result;
  };
  $scope.colorMarker = function (writ) {
    let color = '';
    if (writ.TypeIdentity == 1) {
      color = 'AutoColor';
    }
    if (writ.TypeIdentity == 2) {
      color = 'ManualColor';
    }
    if (writ.IsDirty) {
      color = 'dirtyColor';
    }
    return color;
  };
  //================= show Writ section =============
  $scope.showWrit = function (writ) {
    $scope.PersonnelActionForm.showDetailsItemStateCurrent = false;
    $scope.PersonnelActionForm.showDetailsItemStatePre = false;
    $scope.PersonnelActionForm.showDetailsItemStateEx = false;
    $scope.PersonnelActionForm.selectedWritItemInfo = writ;
    writ.loading = true;
    $scope.PersonnelActionForm.viewType = null;
    document.querySelectorAll('.active').forEach(act => {
      act.classList.remove('active');
    });
    document.getElementById('current').classList.add('active');
    if (writ.TypeIdentity === 1) {
      if (!writ.IsDraft) {
        RequestApis.HR(`pafs/${writ.Id}`, 'Get', '', '', '', function (response) {
          $scope.PersonnelActionForm.writInfo = response.data;
          if (global.checkExist($scope.PersonnelActionForm.writInfo.Current.SignatureBase64))
            $scope.PersonnelActionForm.currentSignatureBase64 = `data:image/png;base64,${$scope.PersonnelActionForm.writInfo.Current.SignatureBase64}`;
          if (global.checkExist($scope.PersonnelActionForm.writInfo.Pre.SignatureBase64))
            $scope.PersonnelActionForm.preSignatureBase64 = `data:image/png;base64,${$scope.PersonnelActionForm.writInfo.Pre.SignatureBase64}`;
          if (global.checkExist($scope.PersonnelActionForm.writInfo.ExOne)) {
            $scope.PersonnelActionForm.exIsTrue = true;
            if (global.checkExist($scope.PersonnelActionForm.writInfo.ExOne.SignatureBase64))
              $scope.PersonnelActionForm.exSignatureBase64 = `data:image/png;base64,${$scope.PersonnelActionForm.writInfo.ExOne.SignatureBase64}`;
          } else {
            $scope.PersonnelActionForm.exIsTrue = false;
          }
          writ.loading = false;
          $("#writModal").modal();
        });
      } else {
        if (writ.IsTouched) {
          RequestApis.HR(`pafs/draft/${writ.Id}`, 'Post', '', '', '', function (draftResponse) {
            if (draftResponse.status == 200) {
              RequestApis.HR(`pafs/${writ.Id}`, 'Get', '', '', '', function (response) {
                $scope.PersonnelActionForm.writInfo = response.data;
                if (global.checkExist($scope.PersonnelActionForm.writInfo.Current.SignatureBase64))
                  $scope.PersonnelActionForm.currentSignatureBase64 = `data:image/png;base64,${$scope.PersonnelActionForm.writInfo.Current.SignatureBase64}`;
                if (global.checkExist($scope.PersonnelActionForm.writInfo.Pre.SignatureBase64))
                $scope.PersonnelActionForm.preSignatureBase64 = `data:image/png;base64,${$scope.PersonnelActionForm.writInfo.Pre.SignatureBase64}`;
                if (global.checkExist($scope.PersonnelActionForm.writInfo.ExOne)) {
                  $scope.PersonnelActionForm.exIsTrue = true;
                  if (global.checkExist($scope.PersonnelActionForm.writInfo.ExOne.SignatureBase64))
                  $scope.PersonnelActionForm.exSignatureBase64 = `data:image/png;base64,${$scope.PersonnelActionForm.writInfo.ExOne.SignatureBase64}`;
                } else {
                  $scope.PersonnelActionForm.exIsTrue = false;
                }
                writ.loading = false;
                $("#writModal").modal();
              });
            }
            global.messaging(draftResponse);
          });
        } else {
          RequestApis.HR(`pafs/${writ.Id}`, 'Get', '', '', '', function (response) {
            if (response.status === 200) {
              $scope.PersonnelActionForm.writInfo = response.data;
              if (global.checkExist($scope.PersonnelActionForm.writInfo.Current.SignatureBase64))
                $scope.PersonnelActionForm.currentSignatureBase64 = `data:image/png;base64,${$scope.PersonnelActionForm.writInfo.Current.SignatureBase64}`;
              if (global.checkExist($scope.PersonnelActionForm.writInfo.Pre.SignatureBase64))
              $scope.PersonnelActionForm.preSignatureBase64 = `data:image/png;base64,${$scope.PersonnelActionForm.writInfo.Pre.SignatureBase64}`;
              if (global.checkExist($scope.PersonnelActionForm.writInfo.ExOne)) {
                $scope.PersonnelActionForm.exIsTrue = true;
                if (global.checkExist($scope.PersonnelActionForm.writInfo.ExOne.SignatureBase64))
                $scope.PersonnelActionForm.exSignatureBase64 = `data:image/png;base64,${$scope.PersonnelActionForm.writInfo.ExOne.SignatureBase64}`;
              } else {
                $scope.PersonnelActionForm.exIsTrue = false;
              }
              writ.loading = false;
              $("#writModal").modal();
            }
            global.messaging(response);
          });
        }
      }

    }
    else if (writ.TypeIdentity === 2) {
      RequestApis.HR(`pafs/manual/${writ.Id}`, 'Get', '', '', '', function (response) {
        $scope.PersonnelActionForm.writInfo = response.data;
        if (global.checkExist($scope.PersonnelActionForm.writInfo.Current.SignatureBase64))
        $scope.PersonnelActionForm.currentSignatureBase64 = `data:image/png;base64,${$scope.PersonnelActionForm.writInfo.Current.SignatureBase64}`;
        if (global.checkExist($scope.PersonnelActionForm.writInfo.Pre.SignatureBase64))
        $scope.PersonnelActionForm.preSignatureBase64 = `data:image/png;base64,${$scope.PersonnelActionForm.writInfo.Pre.SignatureBase64}`;
        if (global.checkExist($scope.PersonnelActionForm.writInfo.ExOne)) {
          $scope.PersonnelActionForm.exIsTrue = true;
          if (global.checkExist($scope.PersonnelActionForm.writInfo.ExOne.SignatureBase64))
          $scope.PersonnelActionForm.exSignatureBase64 = `data:image/png;base64,${$scope.PersonnelActionForm.writInfo.ExOne.SignatureBase64}`;
        } else {
          $scope.PersonnelActionForm.exIsTrue = false;
        }
        writ.loading = false;
        $("#writModal").modal();
      });
    }
  };
  $scope.showDetails = function (item) {
    if (global.stringEquality(item, 'current')) {
      $scope.PersonnelActionForm.showDetailsItemStateCurrent = !$scope.PersonnelActionForm.showDetailsItemStateCurrent;
    }
    if (global.stringEquality(item, 'pre')) {
      $scope.PersonnelActionForm.showDetailsItemStatePre = !$scope.PersonnelActionForm.showDetailsItemStatePre;
    }
    if (global.stringEquality(item, 'Ex')) {
      $scope.PersonnelActionForm.showDetailsItemStateEx = !$scope.PersonnelActionForm.showDetailsItemStateEx;
    }
  };
  $scope.showTitle = function (item, items, index, parentIndex, viewType) {
    let newTag = document.createElement('span');
    newTag.style = "color:white";
    newTag.setAttribute("dir", "ltr");
    if (item === "H_IDX_SVC") {
      newTag.innerHTML = `<div class="d-flex m-auto">
                                <div class="d-flex m-auto mr-1">
                                      <div class="text-white mr-1 small-font" style="margin-bottom:5%">(</div>
                                      <div class="mr-1">
                                            <div class="d-flex m-auto justify-content-center">
                                                <div class="text-warning mr-1 small-font" title="سال">${items.Service.Year}</div>
                                                <div class="text-white mr-1 small-font">x</div>
                                                <div class="text-danger small-font" title="ضریب سنوات خدمتی سال">${items.Service.Coef}</div>
                                            </div>
                                      </div>
                                      <div class="text-white small-font" style="margin-bottom:5%">)</div>
                                </div>
                                <div class="text-white mr-1 ml-1 small-font" style="margin-top:5%">+</div>
                                <div class="d-flex m-auto mr-1">
                                      <div class="text-white mr-1 small-font" style="margin-top:10%">(</div>
                                      <div class="mr-1">
                                            <div class="d-flex m-auto justify-content-center">
                                                <div class="text-warning mr-1 small-font" title="ماه">${items.Service.Month}</div>
                                                <div class="text-white mr-1 small-font">x</div>
                                                <div class="text-danger small-font" title="ضریب سنوات خدمتی سال">${items.Service.Coef}</div>
                                            </div>
                                            <div class="col-12 d-flex border justify-content-center m-auto mt-1 mb-1 border-white"></div>
                                            <div class="text-white small-font">12</div>
                                      </div>
                                      <div class="text-white small-font" style="margin-top:10%">)</div>
                                </div>
                                <div class="text-white mr-1 ml-1 small-font" style="margin-top:5%">+</div>
                                <div class="d-flex m-auto">
                                      <div class="text-white mr-1 small-font" style="margin-top:10%">(</div>
                                      <div class="mr-1">
                                            <div class="d-flex m-auto justify-content-center">
                                                <div class="text-warning mr-1 small-font" title="روز">${items.Service.Day}</div>
                                                <div class="text-white mr-1 small-font">x</div>
                                                <div class="text-danger small-font" title="ضریب سنوات خدمتی سال">${items.Service.Coef}</div>
                                            </div>
                                            <div class="col-12 d-flex border justify-content-center m-auto mt-1 mb-1 border-white"></div>
                                            <div class="text-white small-font">360</div>
                                      </div>
                                      <div class="text-white small-font" style="margin-top:10%">)</div>
                                </div>
                                <div class="text-white mr-1 ml-1 small-font" style="margin-top:5%">=</div>
                                <div class="text-white small-font" style="margin-top:5%">${items.Service.Sum}</div>
                                </div>
                                `;
      $(`#PREsvc${index}${parentIndex}`).empty();
      $(`#EXsvc${index}${parentIndex}`).empty();
      $(`#svc${index}${parentIndex}`).empty();
      switch (viewType.toUpperCase()) {
        case 'PRE':
          $(`#PREsvc${index}${parentIndex}`).fadeIn();
          $(`#PREsvc${index}${parentIndex}`).append(newTag);
          break;
        case 'EX':
          $(`#EXsvc${index}${parentIndex}`).fadeIn();
          $(`#EXsvc${index}${parentIndex}`).append(newTag);
          break;
        case 'CURRENT':
          $(`#svc${index}${parentIndex}`).fadeIn();
          $(`#svc${index}${parentIndex}`).append(newTag);
          break;
        default:
          break;
      }
    }
    if (item === "H_IDX_EXP") {
      newTag.innerHTML = `<div class="d-flex m-auto">
                                <div class="d-flex m-auto mr-1">
                                      <div class="text-white mr-1 small-font" style="margin-bottom:5%">(</div>
                                      <div class="mr-1">
                                            <div class="d-flex m-auto justify-content-center">
                                                <div class="text-warning mr-1 small-font" title="سال">${items.Experience.Year}</div>
                                                <div class="text-white mr-1 small-font">x</div>
                                                <div class="text-danger small-font" title="ضریب سنوات تجربی سال">${items.Experience.Coef}</div>
                                            </div>
                                      </div>
                                      <div class="text-white small-font" style="margin-bottom:5%">)</div>
                                </div>
                                <div class="text-white mr-1 ml-1 small-font" style="margin-top:5%">+</div>
                                <div class="d-flex m-auto mr-1">
                                      <div class="text-white mr-1 small-font" style="margin-top:10%">(</div>
                                      <div class="mr-1">
                                            <div class="d-flex m-auto justify-content-center">
                                                <div class="text-warning mr-1 small-font" title="ماه">${items.Experience.Month}</div>
                                                <div class="text-white mr-1 small-font">x</div>
                                                <div class="text-danger small-font" title="ضریب سنوات تجربی سال">${items.Experience.Coef}</div>
                                            </div>
                                            <div class="col-12 d-flex border justify-content-center m-auto mt-1 mb-1 border-white"></div>
                                            <div class="text-white small-font">12</div>
                                      </div>
                                      <div class="text-white small-font" style="margin-top:10%">)</div>
                                </div>
                                <div class="text-white mr-1 ml-1 small-font" style="margin-top:5%">+</div>
                                <div class="d-flex m-auto">
                                      <div class="text-white mr-1 small-font" style="margin-top:10%">(</div>
                                      <div class="mr-1">
                                            <div class="d-flex m-auto justify-content-center">
                                                <div class="text-warning mr-1 small-font" title="روز">${items.Experience.Day}</div>
                                                <div class="text-white mr-1 small-font">x</div>
                                                <div class="text-danger small-font" title="ضریب سنوات تجربی سال">${items.Experience.Coef}</div>
                                            </div>
                                            <div class="col-12 d-flex border justify-content-center m-auto mt-1 mb-1 border-white"></div>
                                            <div class="text-white small-font">360</div>
                                      </div>
                                      <div class="text-white small-font" style="margin-top:10%">)</div>
                                </div>
                                <div class="text-white mr-1 ml-1 small-font" style="margin-top:5%">=</div>
                                <div class="text-white small-font" style="margin-top:5%">${items.Experience.Sum}</div>
                                </div>
                                `;
      $(`#PREexp${index}${parentIndex}`).empty();
      $(`#EXexp${index}${parentIndex}`).empty();
      $(`#exp${index}${parentIndex}`).empty();
      switch (viewType.toUpperCase()) {
        case 'PRE':
          $(`#PREexp${index}${parentIndex}`).fadeIn();
          $(`#PREexp${index}${parentIndex}`).append(newTag);
          break;
        case 'EX':
          $(`#EXexp${index}${parentIndex}`).fadeIn();
          $(`#EXexp${index}${parentIndex}`).append(newTag);
          break;
        case 'CURRENT':
          $(`#exp${index}${parentIndex}`).fadeIn();
          $(`#exp${index}${parentIndex}`).append(newTag);
          break;
        default:
          break;
      }
    }
  };
  $scope.showTitleLeave = function (index, parentIndex, viewType) {
    switch (viewType.toUpperCase()) {
      case 'PRE':
        $(`#parentIdPRE #PREexp${index}${parentIndex}`).fadeOut();
        $(`#parentIdPRE #PREsvc${index}${parentIndex}`).fadeOut();
        break;
      case 'EX':
        $(`#parentIdEX #EXsvc${index}${parentIndex}`).fadeOut();
        $(`#parentIdEX #EXexp${index}${parentIndex}`).fadeOut();
        break;
      case 'CURRENT':
        $(`#parentId #exp${index}${parentIndex}`).fadeOut();
        $(`#parentId #svc${index}${parentIndex}`).fadeOut();
        break;
      default:
        break;
    }
  };
  $scope.showTitleSum = function (item, identifier, viewType) {
    let newTag = document.createElement('span');
    newTag.style = "color:white";
    newTag.setAttribute("dir", "ltr");
    let title = '';
    if (identifier === "svcSum") {
      title = 'خدمتی سال';
    }
    if (identifier === "expSum") {
      title = 'تجربی سال';
    }
    $(`#PRE${identifier}`).empty();
    $(`#EX${identifier}`).empty();
    $(`#${identifier}`).empty();
    for (var i = item.length - 1; i >= 0; i--) {
      newTag.innerHTML += `<div class="d-flex m-auto">
                                <div class="d-flex m-auto mr-1">
                                      <div class="text-white mr-1 small-font" style="margin-bottom:5%">(</div>
                                      <div class="mr-1">
                                            <div class="d-flex m-auto justify-content-center">
                                                <div class="text-warning mr-1 small-font" title="سال">${item[i].Year}</div>
                                                <div class="text-white mr-1 small-font">x</div>
                                                <div class="text-danger small-font" title="ضریب سنوات ${title}">${item[i].Coef}</div>
                                            </div>
                                      </div>
                                      <div class="text-white small-font" style="margin-bottom:5%">)</div>
                                </div>
                                <div class="text-white mr-1 ml-1 small-font" style="margin-top:5%">+</div>
                                <div class="d-flex m-auto mr-1">
                                      <div class="text-white mr-1 small-font" style="margin-top:10%">(</div>
                                      <div class="mr-1">
                                            <div class="d-flex m-auto justify-content-center">
                                                <div class="text-warning mr-1 small-font" title="ماه">${item[i].Month}</div>
                                                <div class="text-white mr-1 small-font">x</div>
                                                <div class="text-danger small-font" title="ضریب سنوات ${title}">${item[i].Coef}</div>
                                            </div>
                                            <div class="col-12 d-flex border justify-content-center m-auto mt-1 mb-1 border-white"></div>
                                            <div class="text-white small-font">12</div>
                                      </div>
                                      <div class="text-white small-font" style="margin-top:10%">)</div>
                                </div>
                                <div class="text-white mr-1 ml-1 small-font" style="margin-top:5%">+</div>
                                <div class="d-flex m-auto">
                                      <div class="text-white mr-1 small-font" style="margin-top:10%">(</div>
                                      <div class="mr-1">
                                            <div class="d-flex m-auto justify-content-center">
                                                <div class="text-warning mr-1 small-font" title="روز">${item[i].Day}</div>
                                                <div class="text-white mr-1 small-font">x</div>
                                                <div class="text-danger small-font" title="ضریب سنوات ${title}">${item[i].Coef}</div>
                                            </div>
                                            <div class="col-12 d-flex border justify-content-center m-auto mt-1 mb-1 border-white"></div>
                                            <div class="text-white small-font">360</div>
                                      </div>
                                      <div class="text-white small-font" style="margin-top:10%">)</div>
                                </div>
                                <div class="text-white mr-1 ml-1 small-font" style="margin-top:5%">=</div>
                                <div class="text-white small-font" style="margin-top:5%">${item[i].Sum}</div>
                                </div>
                                `;
      if (i > 0) {
        newTag.innerHTML += `<div class="text-white small-font">+</div>`;
      }
    }
    switch (viewType.toUpperCase()) {
      case 'PRE':
        $(`#PRE${identifier}`).fadeIn();
        $(`#PRE${identifier}`).append(newTag);
        break;
      case 'EX':
        $(`#EX${identifier}`).fadeIn();
        $(`#EX${identifier}`).append(newTag);
        break;
      case 'CURRENT':
        $(`#${identifier}`).fadeIn();
        $(`#${identifier}`).append(newTag);
        break;
      default:
        break;
    }
  };
  $scope.showTitleLeaveSum = function (identifier, viewType) {
    switch (viewType.toUpperCase()) {
      case 'PRE':
        $(`#parentIdsumPRE #PRE${identifier}`).fadeOut();
        break;
      case 'EX':
        $(`#parentIdsumEX #EX${identifier}`).fadeOut();
        break;
      case 'CURRENT':
        $(`#parentIdsum #${identifier}`).fadeOut();
        break;
      default:
        break;
    }
  };
  $scope.closeWritModal = function () {
    $("#writModal").modal('hide');
    $scope.PersonnelActionForm.writInfo = [];
  };
  $scope.setView = function (type) {
    $scope.PersonnelActionForm.viewType = type;
  };
  $scope.checkNonCurrency = function (item) {
    let Color = '';
    if (global.checkExist($scope.PersonnelActionForm.viewType)) {
      if (global.checkExist($scope.PersonnelActionForm.writInfo)) {
        if (global.checkExist($scope.PersonnelActionForm.writInfo.PreCurrent)) {
          Object.keys($scope.PersonnelActionForm.writInfo.PreCurrent.NonCurrencyDiffs).forEach(sunItem => {
            if (sunItem == item) {
              switch ($scope.PersonnelActionForm.writInfo.PreCurrent.NonCurrencyDiffs[sunItem].ChangeType) {
                case 2:
                  Color = 'blue';
                  break;
                case 4:
                  Color = 'yellow';
                  break;
                case 8:
                  Color = 'redInWrit';
                  break;
                default:
              }
            }
          });
        }
      }
    }
    return Color;
  };
  $scope.checkCurrency = function (item) {
    let Color = '';
    if (global.checkExist($scope.PersonnelActionForm.viewType)) {
      if (global.checkExist($scope.PersonnelActionForm.writInfo)) {
        if (global.checkExist($scope.PersonnelActionForm.writInfo.PreCurrent)) {
          Object.keys($scope.PersonnelActionForm.writInfo.PreCurrent.CurrencyDiffs).forEach(sunItem => {
            if (sunItem == item) {
              switch ($scope.PersonnelActionForm.writInfo.PreCurrent.CurrencyDiffs[sunItem].ChangeType) {
                case 2:
                  Color = 'blue';
                  break;
                case 4:
                  Color = 'yellow';
                  break;
                case 8:
                  Color = 'redInWrit';
                  break;
                default:
              }
            }
          });
        }
      }
    }
    return Color;
  };
  $scope.checkCurrencyWithEx = function (item) {
    let Color = '';
    if (global.checkExist($scope.PersonnelActionForm.viewType)) {
      if (global.checkExist($scope.PersonnelActionForm.writInfo)) {
        if (global.checkExist($scope.PersonnelActionForm.writInfo.ExOneCurrent)) {
          Object.keys($scope.PersonnelActionForm.writInfo.ExOneCurrent.CurrencyDiffs).forEach(sunItem => {
            if (sunItem == item) {
              switch ($scope.PersonnelActionForm.writInfo.ExOneCurrent.CurrencyDiffs[sunItem].ChangeType) {
                case 2:
                  Color = 'blue';
                  break;
                case 4:
                  Color = 'yellow';
                  break;
                case 8:
                  Color = 'redInWrit';
                  break;
                default:
              }
            }
          });
        }
      }
    }

    return Color;
  };
  $scope.checkNonCurrencyWithEx = function (item) {
    let Color = '';
    if (global.checkExist($scope.PersonnelActionForm.viewType)) {
      if (global.checkExist($scope.PersonnelActionForm.writInfo)) {
        if (global.checkExist($scope.PersonnelActionForm.writInfo.ExOneCurrent)) {
          Object.keys($scope.PersonnelActionForm.writInfo.ExOneCurrent.NonCurrencyDiffs).forEach(sunItem => {
            if (sunItem == item) {
              switch ($scope.PersonnelActionForm.writInfo.ExOneCurrent.NonCurrencyDiffs[sunItem].ChangeType) {
                case 2:
                  Color = 'blue';
                  break;
                case 4:
                  Color = 'yellow';
                  break;
                case 8:
                  Color = 'redInWrit';
                  break;
                default:
              }
            }
          });
        }
      }
    }
    return Color;
  };
  $scope.changeCorrectStatus = function () {
    $scope.PersonnelActionForm.correctStatus = !$scope.PersonnelActionForm.correctStatus;
    $scope.PersonnelActionForm.viewType = null;
    document.querySelectorAll('.active').forEach(act => {
      act.classList.remove('active');
    });
    document.getElementById('current').classList.add('active');
    $scope.getDrpBoxSigners();
    if ($scope.PersonnelActionForm.selectedWritItemInfo.TypeIdentity === 2) {
      $timeout(function () {
        $scope.changeScoreValueInCreate();
        $scope.changeCurrencyValueInCreate();
      }, 100);
    }
  };
  $scope.cancelCorrectStatus = function () {
    $scope.PersonnelActionForm.writInfo = {};
    RequestApis.HR(`pafs/${$scope.PersonnelActionForm.selectedWritItemInfo.Id}`, 'Get', '', '', '', function (response) {
      if (response.status === 200) {
        $scope.PersonnelActionForm.writInfo = response.data;
        if (global.checkExist($scope.PersonnelActionForm.writInfo.ExOne)) {
          $scope.PersonnelActionForm.exIsTrue = true;
        } else {
          $scope.PersonnelActionForm.exIsTrue = false;
        }
      }
      $scope.PersonnelActionForm.correctStatus = false;
    });
  };
  $scope.showChildren = function (param) {
    param.loadingChildInfo = true;
    let parent = document.getElementById(`plus-${param.Id}`);
    let subChild = document.getElementById(`innerchild-${param.Id}`);
    if (subChild.children.length) {
      subChild.removeChild(subChild.firstElementChild);
    }
    if (parent != null && parent.classList.contains('fa-plus')) {
      parent.classList.add('fa-minus');
      parent.classList.remove('fa-plus');
      RequestApis.HR(`pafs/${param.Id}/children`, 'Get', '', '', '', function (response) {
        param.loadingChildInfo = false;
        if (global.checkExist(response.data)) {
          $scope.childInfo = response.data;
          param.childrenIssuance = response.data;
          $scope.paramInfo = param;
          $timeout(function () {
            $(`#innerchild-${param.Id}`).append($compile(`
        <table class="table-striped">
        <tbody class="big-font font-weight-lighter">
        <tr id="parent-tr-${param.childrenIssuance.Id}">
        <td class="w-40px">
        </td>
        <td class="text-center w-20p">
            <span class="pointer float-right mr-1" id="plus-${param.childrenIssuance.Id}"
                ng-if="${param.childrenIssuance.HasChildren}"
                ng-click="showChildren(paramInfo.childrenIssuance)"
                title="مشاهده اصلاحیه"><i class="far fa-plus "></i></span>
                <span ng-if="${global.checkExist(response.data.Medium)}"
                                                                class="badge badge-info pointer"
                                                                ng-click="showIssuance(paramInfo.childrenIssuance.Medium)">${global.checkExist(response.data.Medium) ? response.data.Medium.ActionTypeTitle : ''}
                                                            </span>
            ${param.childrenIssuance.Personnel.FirstName} ${param.childrenIssuance.Personnel.LastName}
        </td>
        <td class="text-center w-45p pointer" ng-click="showWrit(param)">${param.childrenIssuance.ActionTypeTitle}</td>
        <td class="text-center w-15p">${param.childrenIssuance.FormNumber}</td>
        <td class="text-center w-60px">
            <i class="far fa-check text-success d-flex justify-content-center m-auto" title="تأیید شده سیستمی" ng-if="${!param.childrenIssuance.IsDraft} && ${!param.childrenIssuance.HasPayment}"></i>
            <i class="far fa-close text-danger d-flex justify-content-center m-auto" title="تأیید نشده" ng-if="${param.childrenIssuance.IsDraft} && ${!param.childrenIssuance.HasPayment}"></i>
            <div class="d-flex justify-content-center m-auto" title="تأیید شده مالی" ng-if="${param.childrenIssuance.HasPayment}">
                <div class="p-0" style="z-index: 10; margin: 0 0 0 -2px"><i class="far fa-check text-success"></i></div>
                <div class=" p-0" style="z-index: 10; margin: 0 -2px 0 0"><i class="far fa-check text-success"></i></div>
            </div>
        </td>
        <td class="text-center w-10p">${param.childrenIssuance.ExecuteDatePersian}</td>
        <td class="text-center w-10p">${param.childrenIssuance.IssueDatePersian}</td>
        <td class="text-center w-60px">
            <div class="d-flex" dir="ltr">
                <div class="spinner-border spinner-border-sm float-left text-primary"
                        ng-if="${param.childrenIssuance.loading}"
                        style="margin-top: 0; margin-right: 5px;">
                </div>
                <span ng-if="${!param.childrenIssuance.loading} && ${!param.childrenIssuance.HasPayment}" class="pointer float-left"
                    style="margin: 0 7px 0 0px;" ng-click="showWrit(childInfo)"
                    title="مشاهده حکم"><i class="far fa-eye "></i></span>

                <span class="pointer float-left" ng-if="${param.childrenIssuance.HasValue}"
                    style="margin: 0 7px 0 0;" title="چاپ" ng-click="printModal([childInfo],'grid')"><i class="far fa-print "></i></span>
                <span class="float-left pointer"
                    ng-if="${param.childrenIssuance.DependantType != 1} && ${!param.childrenIssuance.IsDraft} && ${!param.childrenIssuance.HasPayment}"
                    style="margin: 0 7px 0 0;" title="اصلاحیه حکم"
                    ng-click="correction(childInfo)"><i class="far fa-book "></i></span>
                <span class="pointer float-left" style="margin: 0 7px 0 0;"
                    ng-if="${param.childrenIssuance.IsDraft} && ${!param.childrenIssuance.HasPayment}" title="تایید حکم" ng-click="accept(childInfo)"><i class="far fa-check-square "></i></span>
                <span class="pointer float-left" ng-if="${param.childrenIssuance.IsDraft} && ${!param.childrenIssuance.HasPayment}"
                    style="margin: 0px 7px 0 0;" title="حذف حکم" ng-click="deleteIssuance(childInfo)"><i class="far fa-trash "></i></span>
                <span class="pointer float-left" ng-click="setForReturn(childInfo)" ng-if="${!param.childrenIssuance.IsDraft} && ${!param.childrenIssuance.IsMiddleMan} && ${!param.childrenIssuance.HasPayment}"
                    style="margin: 0 7px 0 0;"><i class="far fa-undo "></i></span>
            </div>
        </td>
        </tr>

        <tr id="plusCollapse-${param.childrenIssuance.Id}">
                                    <td colspan="8" style="display:none" id="innerchild-${param.childrenIssuance.Id}">
                                    </td>
                                </tr>
        </tbody>
        </table>`)($scope));
          }, 100);
        }
      });
      $(`#innerchild-${param.Id}`).fadeIn('fast');
    } else {
      $(`#innerchild-${param.Id}`).fadeOut('fast');
      parent.classList.add('fa-plus');
      parent.classList.remove('fa-minus');
    }

  };
  $scope.getSortedItems = function (items) {
    let result = items.sort(function (m1, m2) {
      if (m1.FieldIdentifier === "H_IDX_SVC" && m2.FieldIdentifier != "H_IDX_SVC")
        return -1;

      if (m1.FieldIdentifier === "H_IDX_EXP" && m2.FieldIdentifier != "H_IDX_EXP")
        return 1;

      //return m1.FieldTitle.toString().localeCompare(m2.FieldTitle.toString());
    });
    return result;
  };
  //================= edit writ section ============
  $scope.getDrpBoxSigners = function () {
    RequestApis.HR(`signers/level`, 'Get', '', '', '', function (response) {
      $scope.PersonnelActionForm.drpBoxSigners = response.data;
    });
  };
  $scope.setSelectedSigner = function () {
    let issueDate = "";
    if (global.checkExist($scope.PersonnelActionForm.writInfo.Current.Issue.StringValue)) {
      issueDate = `?ss=${$scope.PersonnelActionForm.writInfo.Current.Issue.StringValue}`;
    }
    RequestApis.HR(`signers/${$('#selectedSigner').val()}/boss${issueDate}`, 'Get', '', '', '', function (response) {
      $scope.PersonnelActionForm.SelectedSignerData = response.data[0];
      if ($scope.PersonnelActionForm.SelectedSignerData != undefined) {
        $('#SiniorInfo').val($scope.PersonnelActionForm.SelectedSignerData.BossName);
      } else {
        global.messaging(response);
      }
    });

  };
  $scope.confirmCorrectModal = function () {
    let itemToSend = [];
    let itemToPost = [];
    if (!global.checkExist($scope.PersonnelActionForm.writInfo.Current.BriefField)) {
      if (global.checkExist($scope.PersonnelActionForm.writInfo.Current.Brief)) {
        let itemToAdd = {
          StringValue: $scope.PersonnelActionForm.writInfo.Current.Brief.StringValue,
          Id: $scope.PersonnelActionForm.writInfo.Current.Brief.Id,
          RowVersion: $scope.PersonnelActionForm.writInfo.Current.Brief.RowVersion
        };
        if (!global.checkExist($scope.PersonnelActionForm.writInfo.Current.Brief.Id)) {
          itemToPost.push(itemToAdd);
        } else {
          itemToSend.push(itemToAdd);
        }
      }
    } else {
      if (global.checkExist($scope.PersonnelActionForm.writInfo.Current.Brief)) {
        let itemToAdd = {
          StringValue: $scope.PersonnelActionForm.writInfo.Current.Brief.StringValue,
          Field: {
            Identifier: $scope.PersonnelActionForm.writInfo.Current.BriefField
          }
        };
        if (!global.checkExist($scope.PersonnelActionForm.writInfo.Current.Brief.Id)) {
          itemToPost.push(itemToAdd);
        } else {

          itemToSend.push(itemToAdd);
        }
      }
    }
    if (!global.checkExist($scope.PersonnelActionForm.writInfo.Current.FormNumberField)) {
      let itemToAdd = {
        StringValue: $scope.PersonnelActionForm.writInfo.Current.FormNumber.StringValue,
        Id: $scope.PersonnelActionForm.writInfo.Current.FormNumber.Id,
        RowVersion: $scope.PersonnelActionForm.writInfo.Current.FormNumber.RowVersion
      };
      if (!global.checkExist($scope.PersonnelActionForm.writInfo.Current.FormNumber.Id)) {
        itemToPost.push(itemToAdd);
      } else {

        itemToSend.push(itemToAdd);
      }
    } else {
      let itemToAdd = {
        StringValue: $scope.PersonnelActionForm.writInfo.Current.FormNumber.StringValue,
        Field: {
          Identifier: $scope.PersonnelActionForm.writInfo.Current.FormNumberField
        }
      };
      if (!global.checkExist($scope.PersonnelActionForm.writInfo.Current.FormNumber.Id)) {
        itemToPost.push(itemToAdd);
      } else {

        itemToSend.push(itemToAdd);
      }
    }
    if (global.checkExist($scope.PersonnelActionForm.writInfo.Current)) {
      $scope.signer = {
        Signer: {
          "actt": Number($('#selectedSigner :selected').val()),
          "sgnr": $scope.PersonnelActionForm.SelectedSignerData.SignerId,
          "Id": $scope.PersonnelActionForm.SelectedSignerData.Id
        }
      };
    }
    if (!global.checkExist($scope.PersonnelActionForm.writInfo.Current.BossNameField)) {
      if ($('#SiniorInfo').val() != null) {
        var itemToAdd = {
          StringValue: $('#SiniorInfo').val(),
          Id: $scope.PersonnelActionForm.writInfo.Current.BossName.Id,
          RowVersion: $scope.PersonnelActionForm.writInfo.Current.BossName.RowVersion,
          CalculationDescription: JSON.stringify($scope.signer)
        };
        itemToSend.push(itemToAdd);
      }
    } else {
      if ($('#SiniorInfo').val() != null) {
        var itemToAdd = {
          StringValue: $('#SiniorInfo').val(),
          Field: {
            Identifier: $scope.PersonnelActionForm.writInfo.Current.BossNameField
          }
        };
        itemToPost.push(itemToAdd);
      }
    }

    if (!global.checkExist($scope.PersonnelActionForm.writInfo.Current.BossPostField) && $('#selectedSigner').val() != "?") {
      if (global.checkExist($('#selectedSigner').val())) {
        var itemToAdd = {
          StringValue: $('#selectedSigner :selected').text(),
          Id: $scope.PersonnelActionForm.writInfo.Current.BossPost.Id,
          RowVersion: $scope.PersonnelActionForm.writInfo.Current.BossPost.RowVersion,
          CalculationDescription: JSON.stringify($scope.signer)
        };
        itemToSend.push(itemToAdd);
      }
    } else {
      if (global.checkExist($('#selectedSigner').val()) && $('#selectedSigner').val() != "?") {
        var itemToAdd = {
          StringValue: $('#selectedSigner :selected').text(),
          Field: {
            Identifier: $scope.PersonnelActionForm.writInfo.Current.BossPostField
          }

        };
        itemToPost.push(itemToAdd);

      }
    }
    if (global.checkExist($scope.PersonnelActionForm.writInfo.Current)) {
      if (global.checkExist($scope.PersonnelActionForm.writInfo.Current.Signer)) {
        if (global.checkExist($('#selectedSigner').val()) && $('#selectedSigner').val() != "?") {
          var itemToAdd = {
            Signer: {
              actt: Number($('#selectedSigner :selected').val()),
              sgnr: $scope.PersonnelActionForm.writInfo.Current.Signer.sgnr,
              Id: $scope.PersonnelActionForm.writInfo.Current.Signer.Id
            }
          };
          itemToSend.push(itemToAdd);
        }
      }
    }

    if (!global.checkExist($scope.PersonnelActionForm.writInfo.Current.IssueField)) {
      var itemToAdd = {
        StringValue: $("#issueDate").val(),
        Id: $scope.PersonnelActionForm.writInfo.Current.Issue.Id,
        RowVersion: $scope.PersonnelActionForm.writInfo.Current.Issue.RowVersion,
        DateValue: $scope.convertToMiladi($("#issueDate").val())
      };
      if (!global.checkExist($scope.PersonnelActionForm.writInfo.Current.Issue.Id)) {
        itemToPost.push(itemToAdd);
      } else {

        itemToSend.push(itemToAdd);
      }
    } else {
      var itemToAdd = {
        StringValue: $("#issueDate").val(),
        DateValue: $scope.convertToMiladi($("#issueDate").val()),
        Field: {
          Identifier: $scope.PersonnelActionForm.writInfo.Current.IssueField
        }
      };
      if (!global.checkExist($scope.PersonnelActionForm.writInfo.Current.Issue.Id)) {
        itemToPost.push(itemToAdd);
      } else {

        itemToSend.push(itemToAdd);
      }
    }

    if (global.checkExist(itemToSend)) {
      RequestApis.HR(`pafs/single/${$scope.PersonnelActionForm.selectedWritItemInfo.Id}`, 'Patch', '', '', itemToSend, function (response) {
        if (response.status != 200) {
          global.messaging(response);
        } else {
          if (global.checkExist(itemToPost)) {
            RequestApis.HR(`pafs/single/${$scope.PersonnelActionForm.selectedWritItemInfo.Id}`, 'Post', '', '', itemToPost, function (response) {
              global.messaging(response);
            });
          } else {
            global.messaging(response);
          }
        }
        $scope.changeCorrectStatus();
        $("#writModal").modal('hide');
        $scope.PersonnelActionForm.viewType = null;
        $('#prewrit').removeClass('active');
        $('#exedit').removeClass('active');
        $('#current').addClass('active');
        $scope.searchFilter($scope.PersonnelActionForm.showFilters);
      });
    } else if (global.checkExist(itemToPost)) {
      RequestApis.HR(`pafs/single/${$scope.PersonnelActionForm.selectedWritItemInfo.Id}`, 'Post', '', '', itemToPost, function (response) {
        global.messaging(response);
        $scope.changeCorrectStatus();
        $scope.PersonnelActionForm.viewType = null;
        $('#prewrit').removeClass('active');
        $('#exedit').removeClass('active');
        $('#current').addClass('active');
        $scope.searchFilter($scope.PersonnelActionForm.showFilters);
      });
    }
  };
  $scope.slider = function (id) {
    $('#' + id).slideToggle('slow');
  };
  //================ create action form section ====
  $scope.addingRow = function () {
    RequestApis.HR(`pafs/formnumber`, 'Get', '', '', '', function (response) {
      $scope.PersonnelActionForm.createItem.maxNumber = Number(response.data);
      $scope.PersonnelActionForm.createItem.showOtherTag = true;
      $scope.PersonnelActionForm.createItem.entry = {
        issuanceTypeName: null,
        isuuanceId: null,
        des: null,
        no: $scope.PersonnelActionForm.createItem.maxNumber,

      };
      $scope.PersonnelActionForm.createItem.showOtherTag = false;
      $scope.PersonnelActionForm.createItem.entryDateStart = moment().format('jYYYY/jMM/jDD');
      $("#addingModal").modal();
    });
  };
  $scope.checkFillCreationItems = function (items) {
    let result = true;
    if (global.checkExist(items.executeDate) && global.checkExist(items.entry.no) && global.checkExist(items.entryDateStart) && global.checkExist(items.entry.isuuanceId)) {
      result = false;
    }
    return result;
  };
  $scope.cancelAdding = function () {
    $scope.PersonnelActionForm.createItem = {};
    $scope.searchFilter($scope.PersonnelActionForm.showFilters);
    $("#addingModal").modal('hide');
  };
  $scope.setTimeToShowOtherTag = function (item) {
    if (global.checkExist(item) && item.length === 10) {
      $scope.PersonnelActionForm.createItem.showOtherTag = true;
      $scope.getDataWritTypeINCreationFunc();
    } else {
      $scope.PersonnelActionForm.createItem.showOtherTag = false;
    }
  };
  $scope.confirmAdding = function (items) {
    $scope.createItemloading = true;
    let itemToSend = {
      aer: {
        ActionTypeId: items.entry.isuuanceId,
        EmployeeTypeId: $scope.PersonnelActionForm.employeeTypeId
      },
      PersonnelIds: [
        $scope.personnelInfo[0].Id
      ],
      IssueDatePersian: items.entryDateStart,
      ExecutionDatePersian: items.executeDate
    };
    RequestApis.HR(`pafs/issue?tmp=${items.entry.no}`, 'Post', '', '', itemToSend, function (response) {
      if (response.status === 200) {
        $scope.cancelAdding();
      }
      global.messaging(response);
      $scope.createItemloading = false;
    });
  };

  $scope.PersonnelActionForm.returnedWritTypeInCreationData = {
  };
  $scope.PersonnelActionForm.getWritTypeInCreation = {
    data: {},
    PageSize: 10,
    PageIndex: 1,
    TotalRow: null,
    TotalPages: null,
    lable: "نوع حکم",
    parameter: [{ latin: 'Title', per: 'عنوان' }]

  };
  $scope.getDataWritTypeINCreationFunc = function (querys) {
    let ss = "";
    if (global.checkExist($scope.PersonnelActionForm.createItem.executeDate)) {
      ss = `?ss=${$scope.PersonnelActionForm.createItem.executeDate}`;
    }
    RequestApis.HR(`personnel/employees/${$scope.personnelInfo[0].Id}/type/status${ss}`, 'Get', '', '', '', function (response) {
      if (response.status === 200) {
        $scope.PersonnelActionForm.employeeTypeId = response.data.EmployeeTypeId;
        let path = `actiontypes/employeeType/${response.data.EmployeeTypeId}${ss}&ps=${$scope.PersonnelActionForm.getWritTypeInCreation.PageSize}&pn=${$scope.PersonnelActionForm.getWritTypeInCreation.PageIndex}`;
        if (global.checkExist(querys)) {
          path = `actiontypes/employeeType/${response.data.EmployeeTypeId}${ss}&ps=${$scope.PersonnelActionForm.getWritTypeInCreation.PageSize}&pn=${$scope.PersonnelActionForm.getWritTypeInCreation.PageIndex}${querys}`;
        }
        RequestApis.HR(path, 'Get', '', '', '', function (response) {
          $scope.PersonnelActionForm.getWritTypeInCreation.data = response.data.Items;
          $scope.PersonnelActionForm.getWritTypeInCreation.PageIndex = response.data.PageIndex;
          $scope.PersonnelActionForm.getWritTypeInCreation.PageSize = response.data.PageSize;
          $scope.PersonnelActionForm.getWritTypeInCreation.TotalRow = response.data.TotalRow;
          $scope.PersonnelActionForm.getWritTypeInCreation.TotalPages = response.data.TotalPages;
          if ($scope.PersonnelActionForm.getWritTypeInCreation.TotalPages === 1) {
            $scope.PersonnelActionForm.getWritTypeInCreation.PageIndex = 1;
          }
        });
      } else {
        global.messaging(response);
      }
    });
  };
  $scope.returnDataWritTypeINCreationFunc = function (data = $scope.PersonnelActionForm.getWritTypeInCreation.data) {
    if (global.checkExist(data.item)) {
      if (data.type.toUpperCase() === "PAGESIZE") {
        $scope.PersonnelActionForm.getWritTypeInCreation.PageSize = data.item;
        $scope.getDataWritTypeINCreationFunc();
      }
      if (data.type.toUpperCase() === "PAGENUMBER") {
        $scope.PersonnelActionForm.getWritTypeInCreation.PageIndex = data.item;
        $scope.getDataWritTypeINCreationFunc();
      }
      if (data.type.toUpperCase() === "SEARCH") {
        $scope.getDataWritTypeINCreationFunc(`&q=${data.item.search}`);
      }
      if (data.type.toUpperCase() === "SELECTED") {
        if (data.type.toUpperCase() === "SELECTEDTHISPAGE" || data.type.toUpperCase() === "SELECTED") {
          $scope.PersonnelActionForm.createItem.entry.des = data.item[0].Brief;
          $scope.PersonnelActionForm.createItem.entry.isuuanceId = data.item[0].Id;
          $scope.PersonnelActionForm.createItem.entry.issuanceTypeName = data.item[0].Title;
        }
      }
    } else {
      $scope.PersonnelActionForm.createItem.entry.des = null;
      $scope.PersonnelActionForm.createItem.entry.isuuanceId = null;
      $scope.PersonnelActionForm.createItem.entry.issuanceTypeName = null;
      $scope.getDataWritTypeINCreationFunc();
    }
  };

  //================ create action manual ==========
  $scope.manualWritModal = function () {
    $scope.PersonnelActionForm.createItemManual.nextLevelInCreatingManualWrit = false;
    $scope.PersonnelActionForm.createItemManual.showOtherTag = false;
    RequestApis.HR(`pafs/formnumber`, 'Get', '', '', '', function (response) {
      $scope.PersonnelActionForm.createItemManual.maxNumber = Number(response.data);
      $scope.PersonnelActionForm.createItemManual.entry = {
        issuanceTypeName: null,
        isuuanceId: null,
        des: null,
        no: $scope.PersonnelActionForm.createItemManual.maxNumber,
      };
      $scope.PersonnelActionForm.createItemManual.entryDateStart = moment().format('jYYYY/jMM/jDD');
      $("#manualWritModal").modal();
    });
  };
  $scope.setTimeToShowOtherTagManual = function (item) {
    if (global.checkExist(item) && item.length === 10) {
      $scope.PersonnelActionForm.createItemManual.showOtherTag = true;
      $scope.getDataWritTypeINCreationManualFunc();
    } else {
      $scope.PersonnelActionForm.createItemManual.showOtherTag = false;
    }
  };
  $scope.cancelAddingManual = function () {
    $scope.PersonnelActionForm.createItemManual = {};
    $scope.searchFilter($scope.PersonnelActionForm.showFilters);
    $("#manualWritModal").modal('hide');
  };
  $scope.PersonnelActionForm.returnedWritTypeInCreationDataManual = {
  };
  $scope.PersonnelActionForm.getWritTypeInCreationManual = {
    data: {},
    PageSize: 10,
    PageIndex: 1,
    TotalRow: null,
    TotalPages: null,
    lable: "نوع حکم",
    parameter: [{ latin: 'Title', per: 'عنوان' }]

  };
  $scope.PersonnelActionForm.getWritTypeInCreationManual.PageIndex = 1;
  $scope.PersonnelActionForm.getWritTypeInCreationManual.PageSize = 10;
  $scope.getDataWritTypeINCreationManualFunc = function (querys) {
    let ss = "";
    if (global.checkExist($scope.PersonnelActionForm.createItemManual.executeDate)) {
      ss = `?ss=${$scope.PersonnelActionForm.createItemManual.executeDate}`;
    }
    RequestApis.HR(`personnel/employees/${$scope.personnelInfo[0].Id}/type/status${ss}`, 'Get', '', '', '', function (response) {
      if (response.status === 200) {
        $scope.PersonnelActionForm.employeeTypeId = response.data.EmployeeTypeId;
        let path = `actiontypes/employeeType/${response.data.EmployeeTypeId}${ss}&ps=${$scope.PersonnelActionForm.getWritTypeInCreationManual.PageSize}&pn=${$scope.PersonnelActionForm.getWritTypeInCreationManual.PageIndex}`;
        if (global.checkExist(querys)) {
          path = `actiontypes/employeeType/${response.data.EmployeeTypeId}${ss}&ps=${$scope.PersonnelActionForm.getWritTypeInCreationManual.PageSize}&pn=${$scope.PersonnelActionForm.getWritTypeInCreationManual.PageIndex}${querys}`;
        }
        RequestApis.HR(path, 'Get', '', '', '', function (response) {
          $scope.PersonnelActionForm.getWritTypeInCreationManual.data = response.data.Items;
          $scope.PersonnelActionForm.getWritTypeInCreationManual.PageIndex = response.data.PageIndex;
          $scope.PersonnelActionForm.getWritTypeInCreationManual.PageSize = response.data.PageSize;
          $scope.PersonnelActionForm.getWritTypeInCreationManual.TotalRow = response.data.TotalRow;
          $scope.PersonnelActionForm.getWritTypeInCreationManual.TotalPages = response.data.TotalPages;
          if ($scope.PersonnelActionForm.getWritTypeInCreationManual.TotalPages === 1) {
            $scope.PersonnelActionForm.getWritTypeInCreationManual.PageIndex = 1;
          }
        });
      } else {
        global.messaging(response);
      }
    });
  };
  $scope.returnDataWritTypeINCreationManualFunc = function (data = $scope.PersonnelActionForm.getWritTypeInCreationManual.data) {
    if (global.checkExist(data.item)) {
      if (data.type.toUpperCase() === "PAGESIZE") {
        $scope.PersonnelActionForm.getWritTypeInCreationManual.PageSize = data.item;
        $scope.getDataWritTypeINCreationManualFunc();
      }
      if (data.type.toUpperCase() === "PAGENUMBER") {
        $scope.PersonnelActionForm.getWritTypeInCreationManual.PageIndex = data.item;
        $scope.getDataWritTypeINCreationManualFunc();
      }
      if (data.type.toUpperCase() === "SEARCH") {
        $scope.getDataWritTypeINCreationManualFunc(`&q=${data.item.search}`);
      }
      if (data.type.toUpperCase() === "SELECTED") {
        if (data.type.toUpperCase() === "SELECTEDTHISPAGE" || data.type.toUpperCase() === "SELECTED") {
          $scope.PersonnelActionForm.createItemManual.entry.des = data.item[0].Brief;
          $scope.PersonnelActionForm.createItemManual.entry.isuuanceId = data.item[0].Id;
          $scope.PersonnelActionForm.createItemManual.entry.issuanceTypeName = data.item[0].Title;
        }
      }
    } else {
      $scope.PersonnelActionForm.createItemManual.entry.des = null;
      $scope.PersonnelActionForm.createItemManual.entry.isuuanceId = null;
      $scope.PersonnelActionForm.createItemManual.entry.issuanceTypeName = null;
      $scope.getDataWritTypeINCreationManualFunc();
    }
  };
  $scope.confirmAddingManualFirstLevel = function (items) {
    $scope.createManualNextloading = true;
    $scope.PersonnelActionForm.manualWritInfo = [];
    RequestApis.HR(`personnel/employees/${$scope.personnelInfo[0].Id}/type/status?ss=${items.executeDate}`, 'Get', '', '', '', function (response) {
      var itemToSend = {
        aer: {
          ActionTypeId: $scope.PersonnelActionForm.createItemManual.entry.isuuanceId,
          EmployeeTypeId: response.data.EmployeeTypeId
        },
        PersonnelIds: [
          $scope.personnelInfo[0].Id
        ],
        IssueDatePersian: items.entryDateStart,
        ExecutionDatePersian: items.executeDate
      };
      RequestApis.HR(`pafs/manual/issue?tmp=${$scope.PersonnelActionForm.createItemManual.entry.no}`, 'Post', '', '', itemToSend, function (responseP) {
        if (response.status == 200) {
          $("#addingModal").modal("hide");
          RequestApis.HR(`pafs/manual/${responseP.data[0].Id}`, 'Post', '', '', '', function (response) {
            if (response.status == 200) {
              RequestApis.HR(`pafs/manual/${responseP.data[0].Id}`, 'Get', '', '', '', function (response) {
                $scope.PersonnelActionForm.manualWritInfo = response.data.Current;
              });
              $scope.searchFilter($scope.PersonnelActionForm.showFilters);
              $scope.PersonnelActionForm.createItemManual.nextLevelInCreatingManualWrit = true;
              $scope.createManualNextloading = false;
              $scope.PersonnelActionForm.createItemManual.entry = {};
            }
          });
        }
        global.messaging(response);
      });

    });

  };
  $scope.confirmAddingManualFinalLevel = function () {
    $scope.createManualFinalloading = true;
    let valuesItemToSends = [];
    let arrayInTag = $('#parentTable').find('input[name="Values"]');
    for (var j = 0; j < arrayInTag.length; j++) {
      for (var i = 0; i < $scope.PersonnelActionForm.selectedItemsInfo.length; i++) {
        if (arrayInTag[j].id != "Currency-TOT_SUM" && arrayInTag[j].id != "Score-TOT_SUM_SCR") {
          if ($scope.PersonnelActionForm.selectedItemsInfo[i].Currency != null && $scope.PersonnelActionForm.selectedItemsInfo[i].Currency.Identifier == arrayInTag[j].id.split('-')[1]) {
            let valuesItemToSend =
            {
              "PersonnelActionFormId": $scope.PersonnelActionForm.manualWritInfo.PersonnelActionFormId,
              "ParentId": $scope.PersonnelActionForm.selectedItemsInfo[i].Currency.Id,
              "FieldId": $scope.PersonnelActionForm.selectedItemsInfo[i].Currency.Id,
              "Field": $scope.PersonnelActionForm.selectedItemsInfo[i].Currency,
              "NumericValue": Number($('#' + arrayInTag[j].id).val()),
              "Numerator": Number($('#' + arrayInTag[j].id).val()),
              "Denominator": 1,
            };
            valuesItemToSends.push(valuesItemToSend);
          }
          if ($scope.PersonnelActionForm.selectedItemsInfo[i].Score != null && $scope.PersonnelActionForm.selectedItemsInfo[i].Score.Identifier == arrayInTag[j].id.split('-')[1]) {
            $scope.valuesItem = {
              title: $scope.PersonnelActionForm.selectedItemsInfo[i].Score.Title,
              Value: $('#' + arrayInTag[j].id).val()
            };
            let valuesItemToSend =
            {
              "PersonnelActionFormId": $scope.PersonnelActionForm.manualWritInfo.PersonnelActionFormId,
              "ParentId": $scope.PersonnelActionForm.selectedItemsInfo[i].Score.Id,
              "FieldId": $scope.PersonnelActionForm.selectedItemsInfo[i].Score.Id,
              "Field": $scope.PersonnelActionForm.selectedItemsInfo[i].Score,
              "NumericValue": Number($('#' + arrayInTag[j].id).val()),
              "Numerator": Number($('#' + arrayInTag[j].id).val()),
              "Denominator": 1,
            };
            valuesItemToSends.push(valuesItemToSend);
          }
        }
      }
    }
    RequestApis.HR(`pafs/manual/single/${$scope.PersonnelActionForm.manualWritInfo.PersonnelActionFormId}`, 'Post', '', '', valuesItemToSends, function (response) {
      if (response.status == 200) {
        $('#manualWritModal').modal('hide');
        $scope.createManualFinalloading = false;
        $scope.PersonnelActionForm.createItemManual.entry = {};
      }
      global.messaging(response);
    });

  };
  $scope.PersonnelActionForm.fieldsAvailableType = [{
    name: 'لطفا انتخاب نمایید',
    Id: 0
  }, {
    name: 'قانون خدمات کشوری',
    Id: 'Type1'
  }, {
    name: 'قانون کار',
    Id: 'Type2'
  }];
  $scope.manualSelectionCreateField = function (item) {

    if (global.checkExist(item)) {
      RequestApis.HR(`fields/availables?rt=${$scope.Type.Id}`, 'Get', '', '', '', function (response) {
        if (response.status != 404) {
          $scope.PersonnelActionForm.selectedItemsInfo = response.data.Group;
        }
      });
      $scope.PersonnelActionForm.selectedItemsInfo.push(item);
      var elementCurrency = angular.element($('#BodyCurrency'));
      $('#HeaderCurrency').append("<input readonly value='" + item.Currency.Title + "' autocomplete='off' class='form-control table-font mb-1'/>");
      elementCurrency.append("<input type='text' name='Values' dir='ltr' id='Currency-" + item.Currency.Identifier + "' ng-blur='changeCurrencyValueInCreate()' autocomplete='off' class='form-control text-right currency table-font mb-1'/>");
      $compile(elementCurrency)($scope);
      var element = angular.element($('#OptionsInRow'));
      element.append("<div class='form-control pointer mb-1 bg-transparent border-0'><i class='far fa-trash' style='font-size:13px;!important' ng-click=\"removeAddedRow('" + item.Currency.Identifier + "')\"></i></div>");
      $compile(element)($scope);
      var elementScore = angular.element($('#BodyScore'));
      if (item.Score != null) {
        elementScore.append("<input type='text' name='Values' id='Score-" + item.Score.Identifier + "' ng-blur='changeScoreValueInCreate()' autocomplete='off' class='form-control score table-font mb-1'/>");
      } else {
        $('#BodyScore').append("<div class='form-control table-font mb-1 bg-transparent border-0'></div>");
      }
      /*$('.currency').inputmask({ regex: "-?[1-9][0-9]{0,20}" });*/
      $('.score').inputmask({ regex: "[1-9][0-9]{0,10}" });
      Inputmask({
        clearMaskOnLostFocus: false,
        clearIncomplete: true,
      }).mask(document.querySelectorAll("input"));
      $compile(elementScore)($scope);
      $scope.sumCurrency = [];
      $scope.sumScore = [];

      if ($scope.PersonnelActionForm.fieldsAvailable.some(c => c.Currency.Id === item.Currency.Id)) {
        $scope.PersonnelActionForm.fieldsAvailable = $scope.PersonnelActionForm.fieldsAvailable.filter(c => c.Currency.Id != item.Currency.Id);
        return false;
      }
    }
  };
  $scope.removeAddedRow = function (item) {
    var selectedInputs = $('#parentTable').find("input[name='Values']");
    for (var i = 0; i < selectedInputs.length; i++) {
      if (selectedInputs[i].id == 'Currency-' + item) {
        var inputItem = $('#parentTable').find('input[id=Currency-' + item + ']');
        if (inputItem.val().length != 0) {
          $timeout(function () {
            $scope.changeScoreValueInCreate();
            $scope.changeCurrencyValueInCreate();
          }, 200);
        }
        var indexItem = inputItem.index();
        $('#parentTable #HeaderCurrency').find('input').eq(indexItem).remove();
        $('#parentTable #BodyCurrency').find('input').eq(indexItem).remove();
        $('#parentTable #BodyScore').children().eq(indexItem).remove();
        $('#parentTable #OptionsInRow').find('div').eq(indexItem).remove();
        var strItems = JSON.stringify($scope.PersonnelActionForm.fieldsAvailable);
        for (var j = 0; j < $scope.PersonnelActionForm.selectedItemsInfo.length; j++) {
          if ($scope.PersonnelActionForm.selectedItemsInfo[j].Currency.Identifier === item) {
            if (!strItems.match(item)) {
              $scope.PersonnelActionForm.fieldsAvailable.unshift($scope.PersonnelActionForm.selectedItemsInfo[j]);
            }
            if (item === "JOB") {
              $scope.PersonnelActionForm.fieldsAvailable.unshift($scope.PersonnelActionForm.selectedItemsInfo[j]);
            }
          }
        }
      }
    }

  };
  $scope.changeType = function (type) {
    if (global.checkExist(type)) {
      $scope.Type = type;
      $scope.PersonnelActionForm.fieldsAvailable = [];
      RequestApis.HR(`fields/availables?rt=${type.Id}`, 'Get', '', '', '', function (response) {
        if (response.status === 200) {
          let itemm = $('#parentTableInEdition').find('input[name="Values"]');
          $scope.PersonnelActionForm.fieldsAvailable = response.data.Group.filter(item => item.Currency.Identifier != 'CST_SUM' && item.Currency.Identifier != 'TOT_SUM');
          if ($('#parentTableInEdition').find('input[name="Values"]').length) {
            for (var i = 0; i < itemm.length; i++) {
              if (itemm[i].id.split('-')[0] == "Currency") {
                $scope.PersonnelActionForm.fieldsAvailable = $scope.PersonnelActionForm.fieldsAvailable.filter(item => item.Currency.Identifier != itemm[i].id.split('-')[1]);
              }
            }
          }

        } else {
          global.messaging(response);
        }
      });
    }
  };
  $scope.changeScoreValueInCreate = function () {
    var items = $('#parentTableInCreate').find('input[name="Values"]');
    var itemsE = $('#parentTableInEdition').find('input[name="Values"]');
    let item = [];
    if (global.checkExist(items)) {
      item = items;
    } else {
      item = itemsE;
    }
    var sumScore = 0;
    for (var i = 0; i < item.length; i++) {
      if (item[i].id != "Score-TOT_SUM_SCR" && item[i].id != "Score-CST_SUM_SCR" && item[i].id != "Currency-TOT_SUM" && item[i].id.split('-')[0] == "Score") {
        sumScore += Number(item[i].value);
      }
    }
    $('#Score-TOT_SUM_SCR').val(sumScore);
  };
  $scope.changeCurrencyValueInCreate = function () {
    var items = $('#parentTableInCreate').find('input[name="Values"]');
    var itemsE = $('#parentTableInEdition').find('input[name="Values"]');
    let item = [];
    if (global.checkExist(items)) {
      item = items;
    } else {
      item = itemsE;
    }
    var sumCurrency = 0;
    for (var i = 0; i < item.length; i++) {
      if (item[i].id != "Currency-TOT_SUM" && item[i].id != "Currency-CST_SUM" && item[i].id != "Score-TOT_SUM_SCR" && item[i].id.split('-')[0] == "Currency") {
        sumCurrency += Number(item[i].value);
      }
    }
    $('#Currency-TOT_SUM').val(sumCurrency);
  };
  $scope.changeScoreValue = function () {
    var items = $('#parentTableInEdit').find('input');

    var sumScore = 0;
    for (var i = 0; i < items.length; i++) {
      if (items[i].name != "Score-TOT_SUM_SCR" && items[i].name.split('-')[0] == "Score") {
        sumScore += Number(items[i].value);
      }
    }

    $('#parentTableInEdit').find('input[name="Score-TOT_SUM_SCR"]').val(sumScore);
  };
  $scope.changeCurrencyValue = function () {
    var items = $('#parentTableInEdit').find('input');
    var sumCurrency = 0;
    for (var i = 0; i < items.length; i++) {
      if (items[i].name != "Currency-TOT_SUM" && items[i].name.split('-')[0] == "Currency") {
        sumCurrency += Number(items[i].value);
      }
    }
    $('#parentTableInEdit').find('input[name="Currency-TOT_SUM"]').val(sumCurrency);
  };
  $scope.editCurrencyAndScoreInputs = function () {
    $scope.loading = true;
    let valuesItemToSendsEdit = [];
    var arrayInTagEdit = $('#parentTableInEdit').find('input');
    for (var j = 0; j < arrayInTagEdit.length; j++) {
      let item = JSON.parse(arrayInTagEdit[j].id);
      let valuesItemToSend =
      {
        "Id": item.Id,
        "PersonnelActionFormId": $scope.PersonnelActionForm.WritInfo.Current.PersonnelActionFormId,
        "Field": { "Id": item.Field.id },
        "FieldId": item.Field.id,
        "NumericValue": Number(arrayInTagEdit[j].value),
        "Numerator": Number(arrayInTagEdit[j].value),
        "Denominator": 2,
        "RowVersion": item.RowVersion
      };
      valuesItemToSendsEdit.push(valuesItemToSend);
    }
    // input score and currency value update
    RequestApis.HR(`pafs/manual/single/${$scope.PersonnelActionForm.WritInfo.Current.PersonnelActionFormId}`, 'Post', '', '', valuesItemToSendsEdit, function (response) {
      if (response.status === 200) {
        $scope.loading = false;
        $('#manualWritModal').modal('hide');
        $scope.loading = false;
      }
      global.messaging(response);
    });

    // other value update
    var itemToSend = [];
    var itemToPost = [];
    if (!global.checkExist($scope.PersonnelActionForm.WritInfo.Current.BriefField)) {
      if (global.checkExist($scope.PersonnelActionForm.WritInfo.Current.Brief)) {
        var itemToAdd = {
          StringValue: $scope.PersonnelActionForm.WritInfo.Current.Brief.StringValue,
          Id: $scope.PersonnelActionForm.WritInfo.Current.Brief.Id,
          RowVersion: $scope.PersonnelActionForm.WritInfo.Current.Brief.RowVersion
        };
        if (!global.checkExist($scope.PersonnelActionForm.WritInfo.Current.Brief.Id)) {
          itemToPost.push(itemToAdd);
        } else {

          itemToSend.push(itemToAdd);
        }
      }
    } else {
      if (global.checkExist($scope.PersonnelActionForm.WritInfo.Current.Brief)) {
        var itemToAdd = {
          StringValue: $scope.PersonnelActionForm.WritInfo.Current.Brief.StringValue,
          Field: {
            Identifier: $scope.PersonnelActionForm.WritInfo.Current.BriefField
          }
        };
        if (!global.checkExist($scope.PersonnelActionForm.WritInfo.Current.Brief.Id)) {
          itemToPost.push(itemToAdd);
        } else {

          itemToSend.push(itemToAdd);
        }
      }
    }
    if (!global.checkExist($scope.PersonnelActionForm.WritInfo.Current.FormNumberField)) {
      var itemToAdd = {
        StringValue: $scope.PersonnelActionForm.WritInfo.Current.FormNumber.StringValue,
        Id: $scope.PersonnelActionForm.WritInfo.Current.FormNumber.Id,
        RowVersion: $scope.PersonnelActionForm.WritInfo.Current.FormNumber.RowVersion
      };
      if (!global.checkExist($scope.PersonnelActionForm.WritInfo.Current.FormNumber.Id)) {
        itemToPost.push(itemToAdd);
      } else {

        itemToSend.push(itemToAdd);
      }
    } else {
      var itemToAdd = {
        StringValue: $scope.PersonnelActionForm.WritInfo.Current.FormNumber.StringValue,
        Field: {
          Identifier: $scope.PersonnelActionForm.WritInfo.Current.FormNumberField
        }
      };
      if (!global.checkExist($scope.PersonnelActionForm.WritInfo.Current.FormNumber.Id)) {
        itemToPost.push(itemToAdd);
      } else {

        itemToSend.push(itemToAdd);
      }
    }
    if (!global.checkExist($scope.PersonnelActionForm.WritInfo.Current.IssueField)) {
      var itemToAdd = {
        StringValue: $("#issueDateManual").val(),
        Id: $scope.PersonnelActionForm.WritInfo.Current.Issue.Id,
        RowVersion: $scope.PersonnelActionForm.WritInfo.Current.Issue.RowVersion,
        DateValue: $scope.convertToMiladi(Number($("#issueDateManual").val().split("/")[0]), Number($("#issueDateManual").val().split("/")[1]), Number($("#issueDateManual").val().split("/")[2]))
      };
      if (!global.checkExist($scope.PersonnelActionForm.WritInfo.Current.Issue.Id)) {
        itemToPost.push(itemToAdd);
      } else {

        itemToSend.push(itemToAdd);
      }
    } else {
      var itemToAdd = {
        StringValue: $("#issueDateManual").val(),
        DateValue: $scope.convertToMiladi(Number($("#issueDateManual").val().split("/")[0]), Number($("#issueDateManual").val().split("/")[1]), Number($("#issueDateManual").val().split("/")[2])),
        Field: {
          Identifier: $scope.PersonnelActionForm.WritInfo.Current.IssueField
        }
      };
      if (!global.checkExist($scope.PersonnelActionForm.WritInfo.Current.Issue.Id)) {
        itemToPost.push(itemToAdd);
      } else {

        itemToSend.push(itemToAdd);
      }
    }
    if (global.checkExist($scope.PersonnelActionForm.WritInfo.Current)) {
      $scope.signer = {
        Signer: {
          "actt": Number($('#selectedSigner :selected').val()),
          "sgnr": $scope.SelectedSignerData.SignerId,
          "Id": $scope.SelectedSignerData.Id
        }
      };
    }
    if (!global.checkExist($scope.PersonnelActionForm.WritInfo.Current.BossNameField)) {
      if ($('#SiniorInfo').val() != null) {
        var itemToAdd = {
          StringValue: $('#SiniorInfo').val(),
          Id: $scope.PersonnelActionForm.WritInfo.Current.BossName.Id,
          RowVersion: $scope.PersonnelActionForm.WritInfo.Current.BossName.RowVersion
        };

        itemToSend.push(itemToAdd);
      }
    } else {
      if (global.checkExist($('#SiniorInfo').val())) {
        var itemToAdd = {
          StringValue: $('#SiniorInfo').val(),
          Field: {
            Identifier: $scope.PersonnelActionForm.WritInfo.Current.BossNameField
          }
          ,
          CalculationDescription: JSON.stringify($scope.signer)
        };
        itemToPost.push(itemToAdd);
      }
    }

    if (!global.checkExist($scope.PersonnelActionForm.WritInfo.Current.BossPostField)) {
      if ($('#selectedSigner').val() != null) {
        var itemToAdd = {
          StringValue: $('#selectedSigner :selected').text(),
          Id: $scope.PersonnelActionForm.WritInfo.Current.BossPost.Id,
          RowVersion: $scope.PersonnelActionForm.WritInfo.Current.BossPost.RowVersion
        };
        itemToSend.push(itemToAdd);
      }
    } else {
      if (global.checkExist($('#selectedSigner').val())) {
        var itemToAdd = {
          StringValue: $('#selectedSigner :selected').text(),
          Field: {
            Identifier: $scope.PersonnelActionForm.WritInfo.Current.BossPostField
          }
          ,
          CalculationDescription: JSON.stringify($scope.signer)
        };
        itemToPost.push(itemToAdd);

      }
    }
    if (global.checkExist(itemToSend)) {
      RequestApis.HR(`pafs/manual/single/${$scope.PersonnelActionForm.editingRowManual.Id}`, 'Patch', '', '', itemToSend, function (response) {
        $("#issuanceModal").modal('hide');
        if (global.checkExist(itemToPost)) {
          RequestApis.HR(`pafs/manual/single/${$scope.PersonnelActionForm.editingRowManual.Id}`, 'Patch', '', '', itemToPost, function (response) {
          });
        } else {
        }
        $scope.searchFilter($scope.PersonnelActionForm.showFilters);
      });
    } else if (global.checkExist(itemToPost)) {
      RequestApis.HR(`pafs/manual/single/${$scope.PersonnelActionForm.editingRowManual.Id}`, 'Patch', '', '', itemToPost, function (response) {
        $scope.searchFilter($scope.PersonnelActionForm.showFilters);
      });
    }

  };
  $scope.confirmCorrectManualModal = function () {
    let savedItems = [];
    $scope.createManualFinalloading = true;
    let valuesItemToSends = [];
    let valuesItemToUpdate = [];
    let arrayInTag = $('#parentTable').find('input[name="Values"]');
    Object.values($scope.PersonnelActionForm.writInfo.Current.CurrencyGroupCategories).forEach(item => {
      Object.values(item.Items).forEach(subItem => {
        if (subItem.Currency.Field.Identifier != "CST_SUM" && subItem.Currency.Field.Identifier != "TOT_SUM")
          savedItems.push({ Identifier: subItem.Currency.Field.Identifier, Score: subItem.Score, Currency: subItem.Currency });
      });
    });
    let copyOfArray = [];
    Object.values(savedItems).forEach(subItem => {
      Object.values(arrayInTag).forEach(array => {
        if (global.checkExist(array.id)) {
          if (subItem.Identifier !== array.id.split('-')[1] && array.id.split('-')[1] != "TOT_SUM" && array.id.split('-')[1] != "TOT_SUM_SCR" && array.id.split('-')[1] != "CST_SUM" && array.id.split('-')[1] != "CST_SUM_SCR") {
            copyOfArray.push(array);
          }
        }

      });
    });
    arrayInTag = copyOfArray;
    if (global.checkExist(savedItems)) {
      Object.values(savedItems).forEach(item => {
        let valueItemToUpdateC =
        {
          "PersonnelActionFormId": $scope.PersonnelActionForm.selectedWritItemInfo.Id,
          "ParentId": item.Currency.Id,
          "FieldId": item.Currency.Field.Id,
          "Field": item.Currency.Field,
          "NumericValue": Number($(`#Currency-${item.Identifier}`).val()),
          "Numerator": Number($(`#Currency-${item.Identifier}`).val()),
          "Denominator": 1,
          "Id": item.Currency.Id,
          "RowVersion": item.Currency.RowVersion,
        };
        valuesItemToUpdate.push(valueItemToUpdateC);
        let valueItemToUpdateS =
        {
          "PersonnelActionFormId": $scope.PersonnelActionForm.selectedWritItemInfo.Id,
          "ParentId": item.Score.Id,
          "FieldId": item.Score.Field.Id,
          "Field": item.Score.Field,
          "NumericValue": Number($(`#Score-${item.Identifier}`).val()),
          "Numerator": Number($(`#Score-${item.Identifier}`).val()),
          "Denominator": 1,
          "Id": item.Score.Id,
          "RowVersion": item.Score.RowVersion,
        };
        valuesItemToUpdate.push(valueItemToUpdateS);
      });
    }

    if (global.checkExist($scope.PersonnelActionForm.selectedItemsInfo)) {
      for (var j = 0; j < arrayInTag.length; j++) {
        for (var i = 0; i < $scope.PersonnelActionForm.selectedItemsInfo.length; i++) {
          if ($scope.PersonnelActionForm.selectedItemsInfo[i].Currency != null && $scope.PersonnelActionForm.selectedItemsInfo[i].Currency.Identifier == arrayInTag[j].id.split('-')[1]) {
            let valuesItemToSend =
            {
              "PersonnelActionFormId": $scope.PersonnelActionForm.selectedWritItemInfo.Id,
              "ParentId": $scope.PersonnelActionForm.selectedItemsInfo[i].Currency.Id,
              "FieldId": $scope.PersonnelActionForm.selectedItemsInfo[i].Currency.Id,
              "Field": $scope.PersonnelActionForm.selectedItemsInfo[i].Currency,
              "NumericValue": Number($('#' + arrayInTag[j].id).val()),
              "Numerator": Number($('#' + arrayInTag[j].id).val()),
              "Denominator": 1,
            };
            valuesItemToSends.push(valuesItemToSend);
          }
          if ($scope.PersonnelActionForm.selectedItemsInfo[i].Score != null && $scope.PersonnelActionForm.selectedItemsInfo[i].Score.Identifier == arrayInTag[j].id.split('-')[1]) {
            $scope.valuesItem = {
              title: $scope.PersonnelActionForm.selectedItemsInfo[i].Score.Title,
              Value: $('#' + arrayInTag[j].id).val()
            };
            let valuesItemToSend =
            {
              "PersonnelActionFormId": $scope.PersonnelActionForm.selectedWritItemInfo.Id,
              "ParentId": $scope.PersonnelActionForm.selectedItemsInfo[i].Score.Id,
              "FieldId": $scope.PersonnelActionForm.selectedItemsInfo[i].Score.Id,
              "Field": $scope.PersonnelActionForm.selectedItemsInfo[i].Score,
              "NumericValue": Number($('#' + arrayInTag[j].id).val()),
              "Numerator": Number($('#' + arrayInTag[j].id).val()),
              "Denominator": 1,
            };
            valuesItemToSends.push(valuesItemToSend);
          }
        }
      }
    }
    if (!global.checkExist($scope.PersonnelActionForm.writInfo.Current.BriefField)) {
      if (global.checkExist($scope.PersonnelActionForm.writInfo.Current.Brief)) {
        let itemToAdd = {
          StringValue: $scope.PersonnelActionForm.writInfo.Current.Brief.StringValue,
          Id: $scope.PersonnelActionForm.writInfo.Current.Brief.Id,
          RowVersion: $scope.PersonnelActionForm.writInfo.Current.Brief.RowVersion
        };
        if (!global.checkExist($scope.PersonnelActionForm.writInfo.Current.Brief.Id)) {
          valuesItemToSends.push(itemToAdd);
        } else {
          valuesItemToUpdate.push(itemToAdd);
        }
      }
    }
    else {
      if (global.checkExist($scope.PersonnelActionForm.writInfo.Current.Brief)) {
        let itemToAdd = {
          StringValue: $scope.PersonnelActionForm.writInfo.Current.Brief.StringValue,
          Field: {
            Identifier: $scope.PersonnelActionForm.writInfo.Current.BriefField
          }
        };
        if (!global.checkExist($scope.PersonnelActionForm.writInfo.Current.Brief.Id)) {
          valuesItemToSends.push(itemToAdd);
        } else {

          valuesItemToUpdate.push(itemToAdd);
        }
      }
    }
    if (!global.checkExist($scope.PersonnelActionForm.writInfo.Current.FormNumberField)) {
      let itemToAdd = {
        StringValue: $scope.PersonnelActionForm.writInfo.Current.FormNumber.StringValue,
        Id: $scope.PersonnelActionForm.writInfo.Current.FormNumber.Id,
        RowVersion: $scope.PersonnelActionForm.writInfo.Current.FormNumber.RowVersion
      };
      if (!global.checkExist($scope.PersonnelActionForm.writInfo.Current.FormNumber.Id)) {
        valuesItemToSends.push(itemToAdd);
      } else {

        valuesItemToUpdate.push(itemToAdd);
      }
    }
    else {
      let itemToAdd = {
        StringValue: $scope.PersonnelActionForm.writInfo.Current.FormNumber.StringValue,
        Field: {
          Identifier: $scope.PersonnelActionForm.writInfo.Current.FormNumberField
        }
      };
      if (!global.checkExist($scope.PersonnelActionForm.writInfo.Current.FormNumber.Id)) {
        valuesItemToSends.push(itemToAdd);
      } else {

        valuesItemToUpdate.push(itemToAdd);
      }
    }
    if (global.checkExist($scope.PersonnelActionForm.writInfo.Current)) {
      $scope.signer = {
        Signer: {
          "actt": Number($('#selectedSigner :selected').val()),
          "sgnr": $scope.PersonnelActionForm.SelectedSignerData.SignerId,
          "Id": $scope.PersonnelActionForm.SelectedSignerData.Id
        }
      };
    }
    if (!global.checkExist($scope.PersonnelActionForm.writInfo.Current.BossNameField)) {
      if ($('#SiniorInfo').val() != null) {
        var itemToAdd = {
          StringValue: $('#SiniorInfo').val(),
          Id: $scope.PersonnelActionForm.writInfo.Current.BossName.Id,
          RowVersion: $scope.PersonnelActionForm.writInfo.Current.BossName.RowVersion,
          CalculationDescription: JSON.stringify($scope.signer)
        };
        valuesItemToUpdate.push(itemToAdd);
      }
    }
    else {
      if ($('#SiniorInfo').val() != null) {
        var itemToAdd = {
          StringValue: $('#SiniorInfo').val(),
          Field: {
            Identifier: $scope.PersonnelActionForm.writInfo.Current.BossNameField
          }
        };
        valuesItemToSends.push(itemToAdd);
      }
    }

    if (!global.checkExist($scope.PersonnelActionForm.writInfo.Current.BossPostField) && $('#selectedSigner').val() != "?") {
      if (global.checkExist($('#selectedSigner').val())) {
        var itemToAdd = {
          StringValue: $('#selectedSigner :selected').text(),
          Id: $scope.PersonnelActionForm.writInfo.Current.BossPost.Id,
          RowVersion: $scope.PersonnelActionForm.writInfo.Current.BossPost.RowVersion,
          CalculationDescription: JSON.stringify($scope.signer)
        };
        valuesItemToUpdate.push(itemToAdd);
      }
    }
    else {
      if (global.checkExist($('#selectedSigner').val()) && $('#selectedSigner').val() != "?") {
        var itemToAdd = {
          StringValue: $('#selectedSigner :selected').text(),
          Field: {
            Identifier: $scope.PersonnelActionForm.writInfo.Current.BossPostField
          }

        };
        valuesItemToSends.push(itemToAdd);

      }
    }
    if (global.checkExist($scope.PersonnelActionForm.writInfo.Current)) {
      if (global.checkExist($scope.PersonnelActionForm.writInfo.Current.Signer)) {
        if (global.checkExist($('#selectedSigner').val()) && $('#selectedSigner').val() != "?") {
          var itemToAdd = {
            Signer: {
              actt: Number($('#selectedSigner :selected').val()),
              sgnr: $scope.PersonnelActionForm.writInfo.Current.Signer.sgnr,
              Id: $scope.PersonnelActionForm.writInfo.Current.Signer.Id
            }
          };
          valuesItemToUpdate.push(itemToAdd);
        }
      }
    }

    if (!global.checkExist($scope.PersonnelActionForm.writInfo.Current.IssueField)) {
      var itemToAdd = {
        StringValue: $("#issueDate").val(),
        Id: $scope.PersonnelActionForm.writInfo.Current.Issue.Id,
        RowVersion: $scope.PersonnelActionForm.writInfo.Current.Issue.RowVersion,
        DateValue: $scope.convertToMiladi($("#issueDate").val())
      };
      if (!global.checkExist($scope.PersonnelActionForm.writInfo.Current.Issue.Id)) {
        valuesItemToSends.push(itemToAdd);
      } else {

        valuesItemToUpdate.push(itemToAdd);
      }
    }
    else {
      var itemToAdd = {
        StringValue: $("#issueDate").val(),
        DateValue: $scope.convertToMiladi($("#issueDate").val()),
        Field: {
          Identifier: $scope.PersonnelActionForm.writInfo.Current.IssueField
        }
      };
      if (!global.checkExist($scope.PersonnelActionForm.writInfo.Current.Issue.Id)) {
        valuesItemToSends.push(itemToAdd);
      } else {

        valuesItemToUpdate.push(itemToAdd);
      }
    }
    if (global.checkExist(valuesItemToUpdate)) {
      RequestApis.HR(`pafs/manual/single/${$scope.PersonnelActionForm.selectedWritItemInfo.Id}`, 'Patch', '', '', valuesItemToUpdate, function (response) {
        if (response.status == 200) {
          $('#manualWritModal').modal('hide');
          $scope.createManualFinalloading = false;
          $scope.PersonnelActionForm.createItemManual.entry = {};
          if (global.checkExist(valuesItemToSends)) {
            RequestApis.HR(`pafs/manual/single/${$scope.PersonnelActionForm.selectedWritItemInfo.Id}`, 'Post', '', '', valuesItemToSends, function (response) {
              if (response.status == 200) {
                $('#manualWritModal').modal('hide');
                $scope.createManualFinalloading = false;
                $scope.PersonnelActionForm.createItemManual.entry = {};
              }
              global.messaging(response);
            });
          }
        } else {
          global.messaging(response);
        }
        $scope.cancelCorrectStatus();
      });
    }
    if (global.checkExist(valuesItemToSends) && global.checkExist(valuesItemToUpdate)) {
      RequestApis.HR(`pafs/manual/single/${$scope.PersonnelActionForm.selectedWritItemInfo.Id}`, 'Post', '', '', valuesItemToSends, function (response) {
        if (response.status == 200) {
          $('#manualWritModal').modal('hide');
          $scope.createManualFinalloading = false;
          $scope.PersonnelActionForm.createItemManual.entry = {};
        }
        global.messaging(response);
        $scope.cancelCorrectStatus();
      });
    }

  };
  //================ group create ==================
  $scope.SearchDataItemGroup = {
    data: {},
    Items: ["name", "family", "fatherName", "nationalCode", "sex", "age", "maritalState", "childCount", "dossierNum", "personnelNum", "chart", "employeeState", "employeeDate", "jobLevel", "sacrificeState", "sacrificeRelation", "postGrade", "grade", "jobField", "class"],
    startDate: moment().format('jYYYY/jMM/jDD'),
    finishDate: moment().format('jYYYY/jMM/jDD'),
  };
  $scope.returnSearchDataGroupFunc = function (data = $scope.SearchDataItemGroup.data) {
    if (global.checkExist(data.data)) {
      $scope.searchFilterItemsInGroupP = data;
    }
  };
  $scope.checkDisable = function (item1, item2) {
    let result = false;
    if (item1 !== undefined)
      if (item1 !== item2)
        result = true;
    return result;
  };
  $scope.returnedEmployeeTypeDataGroupCreate = {
  };
  $scope.getEmployeeTypeGroupCreate = {
    data: {},
    PageSize: 10,
    PageIndex: 1,
    TotalRow: null,
    TotalPages: null,
    lable: "نوع استخدام",
    parameter: [{ latin: 'Title', per: 'عنوان' }]

  };
  $scope.getDataEmployeeTypeGroupFunc = function (querys) {
    let path = `employees/type?ps=${$scope.getEmployeeTypeGroupCreate.PageSize}&pn=${$scope.getEmployeeTypeGroupCreate.PageIndex}`;
    if (global.checkExist(querys)) {
      path = `employees/type?ps=${$scope.getEmployeeTypeGroupCreate.PageSize}&pn=${$scope.getEmployeeTypeGroupCreate.PageIndex}${querys}`;
    }
    RequestApis.HR(path, 'Get', '', '', '', function (response) {
      $scope.getEmployeeTypeGroupCreate.data = response.data.Items;
      $scope.getEmployeeTypeGroupCreate.PageIndex = response.data.PageIndex;
      $scope.getEmployeeTypeGroupCreate.PageSize = response.data.PageSize;
      $scope.getEmployeeTypeGroupCreate.TotalRow = response.data.TotalRow;
      $scope.getEmployeeTypeGroupCreate.TotalPages = response.data.TotalPages;
      if ($scope.getEmployeeTypeGroupCreate.TotalPages === 1) {
        $scope.getEmployeeTypeGroupCreate.PageIndex = 1;
      }
    });
  };
  $scope.returnDataEmployeeTypeGroupCreateFunc = function (data = $scope.getEmployeeTypeGroupCreate.data) {
    if (data.type.toUpperCase() === "SELECTED" && !global.checkExist(data.item)) {
      $scope.RefreshWritType();
    }
    if (global.checkExist(data.item)) {
      if (data.type.toUpperCase() === "PAGESIZE") {
        $scope.getEmployeeTypeGroupCreate.PageSize = data.item;
        $scope.getDataEmployeeTypeGroupFunc();
      }
      if (data.type.toUpperCase() === "PAGENUMBER") {
        $scope.getEmployeeTypeGroupCreate.PageIndex = data.item;
        $scope.getDataEmployeeTypeGroupFunc();
      }
      if (data.type.toUpperCase() === "SEARCH") {
        $scope.getDataEmployeeTypeGroupFunc(`&q=${data.item.search}`);
      }
      if (data.type.toUpperCase() === "SELECTED") {
        $scope.PersonnelActionForm.groupCreate.employeeTypeId = data.item[0].Id;
        $scope.getDataWritTypeFunc(data.item[0].Id, null);
      }
    } else {
      $scope.PersonnelActionForm.groupCreate.employeeTypeId = "";
      $scope.getDataEmployeeTypeGroupFunc();
    }
  };

  $scope.PersonnelActionForm.returnedWritTypeInGroupCreationData = {
  };
  $scope.PersonnelActionForm.getWritTypeInGroupCreation = {
    data: {},
    PageSize: 10,
    PageIndex: 1,
    TotalRow: null,
    TotalPages: null,
    lable: "نوع حکم",
    parameter: [{ latin: 'Title', per: 'عنوان' }]

  };
  $scope.PersonnelActionForm.getWritTypeInGroupCreation.PageIndex = 1;
  $scope.PersonnelActionForm.getWritTypeInGroupCreation.PageSize = 10;
  $scope.getDataWritTypeINCreationGroupFunc = function (querys) {
    let ss = "";
    if (global.checkExist($scope.PersonnelActionForm.groupCreate.executeGroupDate)) {
      ss = `&ss=${$scope.PersonnelActionForm.groupCreate.executeGroupDate}`;
    }
    let path = `actiontypes/employeeType/${$scope.PersonnelActionForm.groupCreate.employeeTypeId}?ps=${$scope.PersonnelActionForm.getWritTypeInGroupCreation.PageSize}&pn=${$scope.PersonnelActionForm.getWritTypeInGroupCreation.PageIndex}${ss}`;
    if (global.checkExist(querys)) {
      path = `actiontypes/employeeType/${$scope.PersonnelActionForm.groupCreate.employeeTypeId}?ps=${$scope.PersonnelActionForm.getWritTypeInGroupCreation.PageSize}&pn=${$scope.PersonnelActionForm.getWritTypeInGroupCreation.PageIndex}${querys}${ss}`;
    }
    RequestApis.HR(path, 'Get', '', '', '', function (response) {
      $scope.PersonnelActionForm.getWritTypeInGroupCreation.data = response.data.Items;
      $scope.PersonnelActionForm.getWritTypeInGroupCreation.PageIndex = response.data.PageIndex;
      $scope.PersonnelActionForm.getWritTypeInGroupCreation.PageSize = response.data.PageSize;
      $scope.PersonnelActionForm.getWritTypeInGroupCreation.TotalRow = response.data.TotalRow;
      $scope.PersonnelActionForm.getWritTypeInGroupCreation.TotalPages = response.data.TotalPages;
      if ($scope.PersonnelActionForm.getWritTypeInGroupCreation.TotalPages === 1) {
        $scope.PersonnelActionForm.getWritTypeInGroupCreation.PageIndex = 1;
      }
    });
  };
  $scope.returnDataWritTypeINGroupCreationFunc = function (data = $scope.PersonnelActionForm.getWritTypeInGroupCreation.data) {
    if (global.checkExist(data.item)) {
      if (data.type.toUpperCase() === "PAGESIZE") {
        $scope.PersonnelActionForm.getWritTypeInGroupCreation.PageSize = data.item;
        $scope.getDataWritTypeINCreationGroupFunc();
      }
      if (data.type.toUpperCase() === "PAGENUMBER") {
        $scope.PersonnelActionForm.getWritTypeInGroupCreation.PageIndex = data.item;
        $scope.getDataWritTypeINCreationGroupFunc();
      }
      if (data.type.toUpperCase() === "SEARCH") {
        $scope.getDataWritTypeINCreationGroupFunc(`&q=${data.item.search}`);
      }
      if (data.type.toUpperCase() === "SELECTED") {
        if (data.type.toUpperCase() === "SELECTEDTHISPAGE" || data.type.toUpperCase() === "SELECTED") {
          $scope.PersonnelActionForm.groupCreate.entry.des = data.item[0].Brief;
          $scope.PersonnelActionForm.groupCreate.entry.isuuanceId = data.item[0].Id;
          $scope.PersonnelActionForm.groupCreate.entry.issuanceTypeName = data.item[0].Title;
        }
      }
    } else {
      $scope.PersonnelActionForm.groupCreate.entry.des = null;
      $scope.PersonnelActionForm.groupCreate.entry.isuuanceId = null;
      $scope.PersonnelActionForm.groupCreate.entry.issuanceTypeName = null;
      $scope.getDataWritTypeINCreationGroupFunc();
    }
  };

  $scope.getPersonnelList = function () {
    let searchParam = '';
    if (global.checkExist($scope.searchFilterItemsInGroupP)) {
      searchParam = $scope.searchFilterItemsInGroupP.data;
    }
    if (global.checkExist($scope.PersonnelActionForm.groupCreate.employeeTypeId)) {
      searchParam += `&et=${$scope.PersonnelActionForm.groupCreate.employeeTypeId}`;
    }
    RequestApis.CommonRequestApi(`personnel?pn=${$scope.PersonnelActionForm.groupCreate.pageNum}&ps=${$scope.PersonnelActionForm.groupCreate.PageSize}${searchParam}`, 'get', '', function (response) {
      $scope.tableData = response.data;
      $scope.PersonnelActionForm.ShowPersonnels = true;
    });
  };
  $scope.changePagination = function (page) {
    if ($scope.tableData.PageIndex <= $scope.tableData.TotalPages && page <= $scope.tableData.TotalPages && page >= 1) {
      $scope.PersonnelActionForm.groupCreate.pageNum = page;
      $scope.getPersonnelList();
    }
  };
  $scope.checkAllGroup = function (event) {
    let filters = '';
    if (event.target.checked) {
      if (global.checkExist($scope.searchFilterItemsInGroupP.data)) {
        filters += `?${$scope.searchFilterItemsInGroupP.data.substring(1, $scope.searchFilterItemsInGroupP.data.toString().length)}`;
      }
      if (global.checkExist($scope.PersonnelActionForm.groupCreate.employeeTypeId)) {
        if (global.checkExist(filters)) {
          filters += `&et=${$scope.PersonnelActionForm.groupCreate.employeeTypeId}`;
        } else {
          filters += `?et=${$scope.PersonnelActionForm.groupCreate.employeeTypeId}`;
        }
      }
      RequestApis.CommonRequestApi(`personnel/nopg${filters}`, 'get', '', function (response) {
        $scope.tableData.Items = response.data;
        $scope.PersonnelActionForm.groupCreate.personnels = response.data;
        $scope.tableData.PageIndex = 1;
        $scope.tableData.TotalPages = 1;
      });
    } else {
      $scope.PersonnelActionForm.groupCreate.personnels = [];
      $scope.getPersonnelList($scope.searchFilterItemsInGroupP.data);
    }

  };
  $scope.checkThisPageGroup = function (event, items) {
    if (event.target.checked) {
      Object.values(items).forEach(item => {
        if (!$scope.PersonnelActionForm.groupCreate.personnels.some(x => x.Id === item.Id)) {
          $scope.PersonnelActionForm.groupCreate.personnels.push(item);
        }
      });
    } else {
      Object.values(items).forEach(item => {
        $scope.PersonnelActionForm.groupCreate.personnels = $scope.PersonnelActionForm.groupCreate.personnels.filter(x => x.Id != item.Id);
      });
    }
  };
  $scope.checkThisPageBtnState = function (items) {
    let result = false;
    let i = 0;
    Object.values(items).forEach(item => {
      if ($scope.PersonnelActionForm.groupCreate.personnels.some(x => x.Id === item.Id)) {
        ++i;
      }
    });
    if (items.length === i) {
      result = true;
    }
    return result;
  };

  $scope.selectPersonelItem = function (event, item) {
    if (event.target.checked) {
      if (!$scope.PersonnelActionForm.groupCreate.personnels.some(x => x.Id === item.Id)) {
        $scope.PersonnelActionForm.groupCreate.personnels.push(item);
      }
    } else {
      $scope.PersonnelActionForm.groupCreate.personnels = $scope.PersonnelActionForm.groupCreate.personnels.filter(x => x.Id != item.Id);
    }
  };
  $scope.checkStateGroup = function (item) {
    if (global.checkExist($scope.PersonnelActionForm.groupCreate.personnels)) {
      let result = false;
      if ($scope.PersonnelActionForm.groupCreate.personnels.some(x => x.Id === item.Id)) {
        result = true;
      }
      return result;
    }
  };
  $scope.showGroupCreateModal = function () {
    $scope.PersonnelActionForm.groupCreate = {};
    $scope.PersonnelActionForm.firstLevel = true;
    $scope.getDataEmployeeTypeGroupFunc();
    $('#groupCreateModal').modal();
  };
  $scope.showPersonnelsInCreateGroup = function () {
    $scope.PersonnelActionForm.groupCreate.pageNum = 1;
    $scope.PersonnelActionForm.groupCreate.PageSize = 10;
    $scope.PersonnelActionForm.groupCreate.personnels = [];
    $scope.getPersonnelList();
  };
  $scope.cancelGroupCreation = function () {
    $scope.PersonnelActionForm.firstLevel = false;
    $scope.PersonnelActionForm.secondLevel = false;
    $scope.PersonnelActionForm.thirdLevel = false;
    $scope.PersonnelActionForm.groupCreate = {};
    $scope.PersonnelActionForm.ShowPersonnels = false;
    $scope.personnelGroupData = {
      data: [],
      dataIdsObj: {},
    };
    $('#groupCreateModal').modal('hide');
  };
  $scope.nextLevel = function () {
    $scope.PersonnelActionForm.groupCreate.IdsP = [];
    Object.values($scope.PersonnelActionForm.groupCreate.personnels).forEach(item => {
      $scope.PersonnelActionForm.groupCreate.IdsP.push(item.Id);
    });

    $scope.PersonnelActionForm.firstLevel = false;
    $scope.PersonnelActionForm.secondLevel = true;
    $scope.PersonnelActionForm.thirdLevel = false;
  };
  $scope.returnLevel = function () {
    $scope.PersonnelActionForm.firstLevel = false;
    $scope.PersonnelActionForm.secondLevel = true;
    $scope.PersonnelActionForm.thirdLevel = false;
    $scope.PersonnelActionForm.groupCreate.Continue = false;
  };
  $scope.enableContinue = function (entryDate) {
    if (entryDate.length === 10) {
      $scope.PersonnelActionForm.groupCreate.Continue = true;
    } else {
      $scope.PersonnelActionForm.groupCreate.Continue = false;
    }
    $scope.PersonnelActionForm.groupCreate.executeGroupDate = entryDate;
  };
  $scope.showThirdLevel = function () {
    RequestApis.CommonRequestApi(`pafs/formnumber`, 'get', '', function (response) {
      $scope.PersonnelActionForm.groupCreate.maxNumber = response.data;
      $scope.PersonnelActionForm.groupCreate.entry = {
        no: $scope.PersonnelActionForm.groupCreate.maxNumber,
        des: null,
        type: "تعیین حقوق و مزایا",
        date: null
      };
    });
    $scope.PersonnelActionForm.groupCreate.entryDateStart = moment().format('jYYYY/jMM/jDD');
    $scope.getDataWritTypeINCreationGroupFunc();
    $scope.PersonnelActionForm.firstLevel = false;
    $scope.PersonnelActionForm.secondLevel = false;
    $scope.PersonnelActionForm.thirdLevel = true;
  };
  $scope.confirmThirdLevel = function (items) {
    $scope.groupCreateLoading = true;
    let itemToSend = {
      aer: {
        ActionTypeId: items.entry.isuuanceId,
        EmployeeTypeId: $scope.PersonnelActionForm.groupCreate.employeeTypeId
      },
      PersonnelIds: $scope.PersonnelActionForm.groupCreate.IdsP,
      IssueDatePersian: items.entryDateStart,
      ExecutionDatePersian: $scope.PersonnelActionForm.groupCreate.executeGroupDate
    };
    RequestApis.HR(`pafs/issue?tmp=${items.entry.no}`, 'Post', '', '', itemToSend, function (response) {
      if (response.status === 200) {
        $scope.PersonnelActionForm.groupCreate.pafIdsAfterCreate = response.data.Issued;
        $scope.groupCreateLoading = false;
        $scope.PersonnelActionForm.firstLevel = false;
        $scope.PersonnelActionForm.secondLevel = false;
        $scope.PersonnelActionForm.thirdLevel = false;
        $scope.PersonnelActionForm.forthLevel = true;
      }
      global.messaging(response);
    });
  };
  $scope.checkAllFinal = function (event) {
    $scope.PersonnelActionForm.FinalIds = [];
    if (event.target.checked) {
      $scope.PersonnelActionForm.FinalIds = $scope.PersonnelActionForm.groupCreate.personnels;
    }
  };
  $scope.selectFinalPersonelItem = function (event, item) {
    if (event.target.checked) {
      if (!$scope.PersonnelActionForm.FinalIds.some(x => x.Id === item.Id)) {
        $scope.PersonnelActionForm.FinalIds.push(item);
      }
    } else {
      $scope.PersonnelActionForm.FinalIds = $scope.PersonnelActionForm.FinalIds.filter(x => x.Id != item.Id);
    }
  };
  $scope.checkFinalState = function (item) {
    if (global.checkExist($scope.PersonnelActionForm.FinalIds)) {
      let result = false;
      if ($scope.PersonnelActionForm.FinalIds.some(x => x.Id === item.Id)) {
        result = true;
      }
      return result;
    }
  };
  $scope.final = function () {
    $scope.cancelGroupCreation();
    $scope.searchFilterItemsInGroupP = {};
    $scope.searchFilter($scope.PersonnelActionForm.showFilters);
    $scope.PersonnelActionForm.firstLevel = false;
    $scope.PersonnelActionForm.secondLevel = false;
    $scope.PersonnelActionForm.thirdLevel = false;
    $scope.PersonnelActionForm.forthLevel = false;
    $scope.PersonnelActionForm.ShowPersonnels = false;
  };
  $scope.confirmActionForms = function () {
    if (global.checkExist($scope.PersonnelActionForm.FinalIds)) {
      $scope.groupCreateAcceptLoading = true;
      let ids = [];
      Object.values($scope.PersonnelActionForm.groupCreate.pafIdsAfterCreate).forEach(pafId => {
        if ($scope.PersonnelActionForm.FinalIds.some(x => x.Id === pafId.PersonnelId)) {
          ids.push(pafId.Id);
        }
        //if (!global.checkExist(ids)) {
        //    ids += `?ids=${person.Id}`
        //} else {
        //    ids = ids.concat('&ids=', person.Id);
        //}
      });
      RequestApis.HR(`pafs/draft/accept`, 'Post', '', '', ids, function (response) {
        if (response.status === 200) {
          $scope.searchFilter($scope.PersonnelActionForm.showFilters);
        }
        global.messaging(response);
        $scope.final();
        $scope.groupCreateAcceptLoading = false;
      });
    }
  };
  $scope.revertActionForms = function () {
    if (global.checkExist($scope.PersonnelActionForm.FinalIds)) {
      $scope.groupCreateRemoveLoading = true;
      let ids = [];
      Object.values($scope.PersonnelActionForm.groupCreate.pafIdsAfterCreate).forEach(pafId => {
        if ($scope.PersonnelActionForm.FinalIds.some(x => x.Id === pafId.PersonnelId)) {
          ids.push(pafId.Id);
        }
        //if (!global.checkExist(ids)) {
        //    ids += `?ids=${person.Id}`
        //} else {
        //    ids = ids.concat('&ids=', person.Id);
        //}
      });
      RequestApis.HR(`pafs/draft`, 'Delete', '', '', ids, function (response) {
        if (response.status === 204) {
          $scope.searchFilter($scope.PersonnelActionForm.showFilters);
        }
        global.messaging(response);
        $scope.final();
        $scope.groupCreateRemoveLoading = false;
      });
    }
  };
  //================ accept writ ===================
  $scope.accept = function (item) {
    $scope.PersonnelActionForm.acceptInfoData = item;
    $("#acceptModal").modal();
  };
  $scope.cancelAccept = function () {
    $("#acceptModal").modal('hide');
  };
  $scope.confirmAccept = function () {
    $scope.PersonnelActionForm.confirmAcceptloading = true;
    if ($scope.PersonnelActionForm.acceptInfoData.HasValue) {
      RequestApis.HR(`pafs/draft/${$scope.PersonnelActionForm.acceptInfoData.Id}/accept`, 'Post', '', '', '', function (response) {
        $scope.searchFilter($scope.PersonnelActionForm.showFilters);
        $("#acceptModal").modal('hide');
        $scope.PersonnelActionForm.confirmAcceptloading = false;
      });
    } else {
      RequestApis.HR(`pafs/draft/${$scope.PersonnelActionForm.acceptInfoData.Id}`, 'Post', '', '', '', function (response) {
        RequestApis.HR(`pafs/draft/${$scope.PersonnelActionForm.acceptInfoData.Id}/accept`, 'Post', '', '', '', function (response) {
          $scope.searchFilter($scope.PersonnelActionForm.showFilters);
          $("#acceptModal").modal('hide');
          $scope.PersonnelActionForm.confirmAcceptloading = false;
        });
      });
    }
  };
  //================ group accepting ===============
  $scope.confirmGroup = function () {
    $scope.PersonnelActionForm.groupConfirmLoading = true;
    let itemx = [];
    if ($scope.PersonnelActionForm.CheckAllItems) {
      $("#checkConfirmModal").modal();
    } else {
      Object.values($scope.PersonnelActionForm.localSelectedWritItems).forEach(item => {
        itemx.push(item.Id);
      });
      RequestApis.HR(`pafs/draft`, 'Post', '', '', itemx, function (response) {
        $scope.PersonnelActionForm.groupConfirmLoading = false;
        $("#checkConfirmModal").modal();
      });
    }
  };
  $scope.cancelCheckConfirm = function () {
    $("#checkConfirmModal").modal("hide");
  };
  $scope.confirmCheck = function () {
    $scope.PersonnelActionForm.confirmAcceptGrouploading = true;
    let items = "";
    let itemm = "";
    let itemx = [];
    if ($scope.PersonnelActionForm.CheckAllItems) {
      if (global.checkExist($scope.PersonnelActionForm.localSelectedWritItemsExcluded)) {
        Object.values($scope.PersonnelActionForm.localSelectedWritItemsExcluded).forEach(item => {
          if (!global.checkExist(itemm)) {
            itemm += item.Id.toString();
          }
          itemm = itemm.concat(item.Id);
        });
        items = `?excludes=${itemm}`;
      }
      RequestApis.HR(`pafs/draft/accept/all${$scope.SearchQueryForAll}${items}`, 'Post', '', '', '', function (response) {
        $scope.searchFilter($scope.PersonnelActionForm.showFilters);
        $("#checkConfirmModal").modal('hide');
        $scope.PersonnelActionForm.confirmAcceptGrouploading = false;
      });
    } else {
      Object.values($scope.PersonnelActionForm.localSelectedWritItems).forEach(item => {
        itemx.push(item.Id);
      });
      RequestApis.HR(`pafs/draft/accept`, 'Post', '', '', itemx, function (response) {
        $scope.searchFilter($scope.PersonnelActionForm.showFilters);
        $("#checkConfirmModal").modal('hide');
        $scope.PersonnelActionForm.confirmAcceptGrouploading = false;
      });
    }
  };
  //================ return accept =================
  $scope.setForReturn = function (issunace) {
    $scope.PersonnelActionForm.returnInfoData = issunace;
    $("#returnModal").modal();
  };
  $scope.cancelReturnIssuance = function () {
    $("#returnModal").modal('hide');
  };
  $scope.confirmReturnIssuance = function () {
    $scope.PersonnelActionForm.confirmReturnloading = true;
    RequestApis.HR(`pafs/revert/${$scope.PersonnelActionForm.returnInfoData.Id}`, 'Patch', '', '', '', function (response) {
      $scope.searchFilter($scope.PersonnelActionForm.showFilters);
      $("#returnModal").modal('hide');
      $scope.PersonnelActionForm.confirmReturnloading = false;
    });
  };
  //================ return group accept =================
  $scope.setForReturnGroup = function () {
    $("#returnGroupModal").modal();
  };
  $scope.cancelReturnGroup = function () {
    $("#returnGroupModal").modal('hide');
  };
  $scope.ReturnGroupConfirm = function () {
    $scope.PersonnelActionForm.groupReturnLoading = true;
    let items = "";
    let itemm = "";
    let itemx = [];
    if ($scope.PersonnelActionForm.CheckAllItems) {
      if (global.checkExist($scope.PersonnelActionForm.localSelectedWritItemsExcluded)) {
        Object.values($scope.PersonnelActionForm.localSelectedWritItemsExcluded).forEach(item => {
          if (!global.checkExist(itemm)) {
            itemm += item.Id.toString();
          }
          itemm = itemm.concat(item.Id);
        });
        items = `?excludes=${itemm}`;
      }
      RequestApis.HR(`pafs/revert/all${$scope.SearchQueryForAll}${items}`, 'Patch', '', '', '', function (response) {
        $scope.searchFilter($scope.PersonnelActionForm.showFilters);
        $("#returnGroupModal").modal('hide');
        $scope.PersonnelActionForm.groupReturnLoading = true;
      });
    } else {
      Object.values($scope.PersonnelActionForm.localSelectedWritItems).forEach(item => {
        itemx.push(item.Id);
      });
      RequestApis.HR(`pafs/revert`, 'Patch', '', '', itemx, function (response) {
        $scope.searchFilter($scope.PersonnelActionForm.showFilters);
        $("#returnGroupModal").modal('hide');
        $scope.PersonnelActionForm.groupReturnLoading = false;
      });
    }
  };
  //================ delete single writ ============
  $scope.deleteIssuance = function (data) {
    data.loading = true;
    $scope.PersonnelActionForm.issuanceForDelete = data;
    data.loading = false;
    $("#issuanceDeleteModal").modal();
  };
  $scope.cancelDeleteIssuance = function () {
    $("#issuanceDeleteModal").modal("hide");
  };
  $scope.confirmDeleteIssuance = function () {
    $scope.confirmDeleteLoading = true;
    RequestApis.HR(`pafs/draft/${$scope.PersonnelActionForm.issuanceForDelete.Id}`, 'Delete', '', '', '', function (response) {
      if (response.status === 204) {
        $scope.searchFilter($scope.PersonnelActionForm.showFilters);
      }
      global.messaging(response);
      $scope.confirmDeleteLoading = false;
      $("#issuanceDeleteModal").modal('hide');
    });
  };
  //================ delete group writ ============
  $scope.deleteIssuanceGroup = function () {
    $("#deleteIssuanceModalGroup").modal();
  };
  $scope.deleteIssuanceGroupConfirm = function () {
    $scope.PersonnelActionForm.groupDeleteLoading = true;
    let items = "";
    let itemm = "";
    let itemx = [];
    if ($scope.PersonnelActionForm.CheckAllItems) {
      if (global.checkExist($scope.PersonnelActionForm.localSelectedWritItemsExcluded)) {
        Object.values($scope.PersonnelActionForm.localSelectedWritItemsExcluded).forEach(item => {
          if (!global.checkExist(itemm)) {
            itemm += item.Id.toString();
          }
          itemm = itemm.concat(item.Id);
        });
        items = `?excludes=${itemm}`;
      }
      RequestApis.HR(`pafs/draft/all${$scope.SearchQueryForAll}${items}`, 'Delete', '', '', '', function (response) {
        $scope.searchFilter($scope.PersonnelActionForm.showFilters);
        $("#deleteIssuanceModalGroup").modal('hide');
        $scope.PersonnelActionForm.groupDeleteLoading = false;
      });
    } else {
      Object.values($scope.PersonnelActionForm.localSelectedWritItems).forEach(item => {
        itemx.push(item.Id);
      });
      RequestApis.HR(`pafs/draft`, 'Delete', '', '', itemx, function (response) {
        global.messaging(response);
        $scope.cancelDeleteIssuanceConfirm();
        $scope.PersonnelActionForm.groupDeleteLoading = false;
        $scope.searchFilter($scope.PersonnelActionForm.showFilters);
      });
    }
  };
  $scope.cancelDeleteIssuanceConfirm = function () {
    $scope.PersonnelActionForm.localSelectedWritItems = [];
    if ($scope.PersonnelActionForm.writGridPageNumber > 1) {
      $scope.PersonnelActionForm.writGridPageNumber -= 1;
    }
    $("#deleteIssuanceModalGroup").modal("hide");
  };
  //============== writ correction =======================
  $scope.cancelCorrect = function () {
    $scope.searchFilter($scope.PersonnelActionForm.showFilters);
    $("#correctModal").modal('hide');
  };
  $scope.correction = function (item) {
    item.loading = true;
    $scope.PersonnelActionForm.correctIssuanceList = [];
    if (item.HasValue && !item.IsDraft) {
      $scope.PersonnelActionForm.correctItem = item;
      $scope.PersonnelActionForm.correctIssuanceList.push(item);
      RequestApis.HR(`pafs/${item.Id}/candidate`, 'Get', '', '', '', function (response) {
        if (response.data != 404) {
          Object.values(response.data).forEach(value => {
            $scope.PersonnelActionForm.correctIssuanceList.push(value);
          });
        }
        RequestApis.HR(`pafs/formnumber`, 'Get', '', '', '', function (response) {
          $scope.PersonnelActionForm.correctItem.maxNumber = Number(response.data);
          $scope.PersonnelActionForm.correctToSend = [];
          Object.values($scope.PersonnelActionForm.correctIssuanceList).forEach(itemSub => {
            let item = {
              Id: itemSub.Id,
              Title: itemSub.ActionTypeTitle
            };
            $scope.PersonnelActionForm.correctToSend.push(item);
          });
          item.loading = false;
          $scope.PersonnelActionForm.correctItem.correctDate = moment().format('jYYYY/jMM/jDD');
          $("#correctModal").modal();
        });
      });
    }
  };
  $scope.checkCorrectList = function (id) {
    var found = false;
    if ($scope.PersonnelActionForm.correctToSend.some(x => x.Id === id)) {
      found = true;
    }
    return found;
  };
  $scope.addAllToCorrectList = function (event, items) {
    if (event.target.checked) {
      Object.values(items).forEach(item => {
        if (!$scope.PersonnelActionForm.correctToSend.some(x => x.Id === item.Id)) {
          $scope.PersonnelActionForm.correctToSend.push(item);
        }
      });
    } else {
      $scope.PersonnelActionForm.correctToSend = [];
    }
  };
  $scope.checkAllState = function (items) {
    let result = true;
    if (global.checkExist(items)) {
      Object.values(items).forEach(item => {
        if (!$scope.PersonnelActionForm.correctToSend.some(x => x.Id === item.Id)) {
          result = false;
        }
      });
    }
    return result;
  };
  $scope.addToCorrectList = function (event, data) {
    if (event.target.checked) {
      if (!$scope.PersonnelActionForm.correctToSend.some(x => x.Id === data.Id)) {
        let item = {
          Id: data.Id,
          Title: data.ActionTypeTitle
        };
        $scope.PersonnelActionForm.correctToSend.push(item);
      }
    } else {
      $scope.PersonnelActionForm.correctToSend = $scope.PersonnelActionForm.correctToSend.filter(x => x.Id != data.Id);
    }
    if (!global.checkExist($scope.PersonnelActionForm.correctToSend)) {
      $scope.PersonnelActionForm.NotAllowed = false;
    } else {
      $scope.PersonnelActionForm.NotAllowed = true;
    }
  };
  $scope.selfSelectorForCorrection = function (index) {
    let result = '';
    if (index === 0) {
      result = 'badge-success';
    }
    return result;
  };
  $scope.confirmCorrect = function (item) {
    $scope.loadingCorrection = true;
    let itemTosend = [];
    let additionalQuery = "?cm=false";
    let i = 0;

    Object.values($scope.PersonnelActionForm.correctToSend.reverse()).forEach(itemx => {
      if (itemx.Id === $scope.PersonnelActionForm.correctItem.Id) {
        additionalQuery = "?cm=true&pfn=" + item.maxNumber;
      } else {
        let itemToPush = {
          Id: itemx.Id,
          Title: (Number(item.maxNumber) + i).toString()
        };
        itemTosend.push(itemToPush);
        ++i;
      }
    });
    if (global.checkExist(item.correctDate)) {
      additionalQuery += `&isd=${item.correctDate}`;
    }

    RequestApis.HR(`pafs/correct/${$scope.PersonnelActionForm.correctItem.Id}${additionalQuery}`, 'Post', '', '', itemTosend, function (response) {
      if (response.status === 200) {
        $scope.searchFilter($scope.PersonnelActionForm.showFilters);
      }
      global.messaging(response);
      $scope.cancelCorrect();
      $scope.loadingCorrection = false;
    });
  };

  //================ printing writ section =========
  $scope.printModal = function (writ, fromWhere) {
    $scope.PersonnelActionForm.selectedItemForPrinting = writ;
    if (global.stringEquality(fromWhere, 'grid')) {
      writ.loading = true;
    } else if (global.stringEquality(fromWhere, 'groupPrint')) {
      $scope.PersonnelActionForm.groupPrintLoading = true;
    } else if (global.stringEquality(fromWhere, 'printFromShowingWrit')) {
      $scope.PersonnelActionForm.inShowPrintLoading = true;
    }
    if (global.checkExist($scope.PersonnelActionForm.localSelectedWritItems)) {
      Object.values($scope.PersonnelActionForm.localSelectedWritItems).forEach(selectedItem => {
        if ($scope.PersonnelActionForm.localSelectedWritItems.filter(selectedItemx => selectedItemx.EmployeeTypeId === selectedItem.EmployeeTypeId).length > 1) {
          $scope.EmployeeTypeIsSameInItems = true;
        } else {
          $scope.EmployeeTypeIsSameInItems = false;
        }
      });
    }
    RequestApis.HR('settings/paf', 'Get', '', '', '', function (response) {
      $scope.PersonnelActionForm.printSetting = response.data;
      Object.values(response.data.Items).forEach(item => {
        Object.values(item.Values).forEach(sitem => {
          if (sitem.sl) {
            $scope.PersonnelActionForm.selectedPrintSettingItems.push(sitem);
          }
        });
      });
      if (global.stringEquality(fromWhere, 'grid')) {
        writ.loading = false;
      } else if (global.stringEquality(fromWhere, 'groupPrint')) {
        $scope.PersonnelActionForm.groupPrintLoading = false;
      } else if (global.stringEquality(fromWhere, 'printFromShowingWrit')) {
        $scope.PersonnelActionForm.inShowPrintLoading = false;
      }
      $scope.PersonnelActionForm.printItems.outputType = "pdf";
      $("#printConfirmModal").fadeIn();
    });
  };
  $scope.cancelPrint = function () {
    $("#printConfirmModal").fadeOut();
    $scope.PersonnelActionForm.printSetting = {};
    $scope.PersonnelActionForm.printItems = {};
    $scope.PersonnelActionForm.selectedPrintSettingItems = [];
  };
  $scope.checkPrintAll = function (event, items) {
    if (event.target.checked) {
      Object.values(items).forEach(item => {
        Object.values(item.Values).forEach(value => {
          $scope.PersonnelActionForm.selectedPrintSettingItems.push(value);
        });
      });
    } else {
      Object.values(items).forEach(item => {
        $scope.PersonnelActionForm.selectedPrintSettingItems = item.Values.filter(x => x.sl);
      });
    }
  };
  $scope.checkSelectedState = function (item) {
    let result = false;
    if ($scope.PersonnelActionForm.selectedPrintSettingItems.some(x => x.t.includes(item.t)) || item.sl) {
      result = true;
    }
    return result;
  };
  $scope.setCheckboxForWritPrintType = function (event, item, index) {
    if (event.target.checked) {
      if (!$scope.PersonnelActionForm.selectedPrintSettingItems.some(x => x.t.match(item.t))) {
        $scope.PersonnelActionForm.selectedPrintSettingItems.push(item);
      }
    } else {
      $scope.PersonnelActionForm.selectedPrintSettingItems = $scope.PersonnelActionForm.selectedPrintSettingItems.filter(x => !x.t.match(item.t));
    }
  };
  $scope.checkSelectPrintState = function (item) {
    let result = false;
    if (item.sl) {
      $scope.PersonnelActionForm.selectedPrintSettingItems.push(item);
      result = true;
    }
    return result;
  };
  $scope.confirmPrint = function (printItems) {
    $scope.PersonnelActionForm.confirmPrintloading = true;
    let itemToSendVss = "";
    let itemToSendSgs = "";
    //this item added in 2022-10-01/09/07/1401 as mr. gheshlaghi's request. this codes let authorized user get multi prefix print
    if (!$scope.PersonnelActionForm.checkValidationOnBtn) {
      $scope.PersonnelActionForm.printItems.outputType = "pdf";
    } else {
      $scope.PersonnelActionForm.printItems.outputType = printItems.outputType;
    }
    if ($scope.PersonnelActionForm.selectedPrintSettingItems.length > 0) {
      Object.values($scope.PersonnelActionForm.selectedPrintSettingItems).forEach(item => {
        if (!global.checkExist(itemToSendVss)) {
          itemToSendVss += `&vss=${item.t}`;
        } else {
          itemToSendVss = itemToSendVss.concat(',', item.t);
        }
        if (!global.checkExist(itemToSendSgs)) {
          itemToSendSgs = `&sgs=${item.sg}`;
        } else {
          itemToSendSgs = itemToSendSgs.concat(',', item.sg);
        }
      });
    }
    let pafIds = [];
    Object.values($scope.PersonnelActionForm.selectedItemForPrinting).forEach(item => {
      if (item.HasValue && !pafIds.some(x => x === item.Id)) {
        pafIds.push(item.Id);
      }
    });
    if ($scope.PersonnelActionForm.CheckAllItems) {
      let itemm = "";
      let items = "";
      if (global.checkExist($scope.PersonnelActionForm.localSelectedWritItemsExcluded)) {
        Object.values($scope.PersonnelActionForm.localSelectedWritItemsExcluded).forEach(item => {
          if (!global.checkExist(itemm)) {
            itemm += item.Id.toString();
          }
          itemm = itemm.concat(item.Id);
        });
        items = `?excludes=${itemm}`;
      }
      RequestApis.HR(`pafs/report/all/${$scope.PersonnelActionForm.printItems.outputType}${$scope.SearchQueryForAll}${items}&q=file${itemToSendVss}${itemToSendSgs}${printItems.allInOne ?? ''}`, 'Post', '', 'arraybuffer', '', function (response) {
        if (response.status === 200) {
          var suffix = '';
          if (response.headers(["content-type"]).split('/')[1] === 'pdf') {
            suffix = 'pdf';
          }
          if (response.headers(["content-type"]).split('/')[1] === 'vnd.openxmlformats-officedocument.wordprocessingml.document') {
            suffix = 'docx';
          }
          if (response.headers(["content-type"]).split('/')[1] === 'vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
            suffix = 'xlsx';
          }
          if (response.headers(["content-type"]).split('/')[1] === 'x-zip-compressed') {
            suffix = 'zip';
          }
          const blob = new Blob([response.data], { type: `${response.headers(["content-type"]) }` });
          FileSaver.saveAs(blob, `report-${new Date().toLocaleDateString()}.${suffix}`);
          $scope.cancelPrint();
          $scope.searchFilter($scope.PersonnelActionForm.showFilters);
        }
        global.messaging(response);
        $("#deleteIssuanceModalGroup").modal('hide');
        $scope.PersonnelActionForm.confirmPrintloading = false;
      });
    } else {
      if (!printItems.correctStatusPrint) {
        RequestApis.HR(`pafs/report/${$scope.PersonnelActionForm.printItems.outputType}?q=file${itemToSendVss}${itemToSendSgs}${printItems.allInOne ?? ''}`, "post", '', 'arraybuffer', pafIds, function (response) {
          if (response.status === 200) {
            var suffix = '';
            if (response.headers(["content-type"]).split('/')[1] === 'pdf') {
              suffix = 'pdf';
            }
            if (response.headers(["content-type"]).split('/')[1] === 'vnd.openxmlformats-officedocument.wordprocessingml.document') {
              suffix = 'docx';
            }
            if (response.headers(["content-type"]).split('/')[1] === 'vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
              suffix = 'xlsx';
            }
            if (response.headers(["content-type"]).split('/')[1] === 'x-zip-compressed') {
              suffix = 'zip';
            }
            const blob = new Blob([response.data], { type: `${response.headers(["content-type"]) }` });
            FileSaver.saveAs(blob, `report-${new Date().toLocaleDateString()}.${suffix}`);
            $scope.cancelPrint();
          }
          global.messaging(response);
          $scope.PersonnelActionForm.confirmPrintloading = false;
        });
      } else {
        RequestApis.HR(`pafs/correct/report/${pafIds[0]}/${$scope.PersonnelActionForm.printItems.outputType}?q=file${itemToSendVss}${itemToSendSgs}${printItems.allInOne ?? ''}`, "Get", "", "arraybuffer", "", function (response) {
          if (response.status === 200) {
            var suffix = '';
            if (response.headers(["content-type"]).split('/')[1] === 'pdf') {
              suffix = 'pdf';
            }
            if (response.headers(["content-type"]).split('/')[1] === 'vnd.openxmlformats-officedocument.wordprocessingml.document') {
              suffix = 'docx';
            }
            if (response.headers(["content-type"]).split('/')[1] === 'vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
              suffix = 'xlsx';
            }
            if (response.headers(["content-type"]).split('/')[1] === 'x-zip-compressed') {
              suffix = 'zip';
            }
            const blob = new Blob([response.data], { type: `${response.headers(["content-type"]) }`});
            FileSaver.saveAs(blob, `report-${new Date().toLocaleDateString()}.${suffix}`);
            $scope.cancelPrint();
          }
          global.messaging(response);
          $scope.PersonnelActionForm.confirmPrintloading = false;
        });
      }
    }
  };
});
app.controller('PaknaCtrl', function ($scope, RequestApis, $timeout, global, $templateCache, $state) {
  //=================== initial variable ===================
  $templateCache.remove($state.current.templateUrl);
  $scope.PageSize = 20;
  $scope.pageNum = 1;
  $scope.loadingPage = false;
  $scope.loadingSend = false;
  $scope.loadingDelete = false;
  $scope.checkValidation = true;
  $scope.checkValidationOnBtn = false;
  $scope.personnels = [];
  $scope.selectedItems = [];
  $scope.selectedSecondItem = [];
  //======================= check authorization =============
  $scope.checkAuth = function () {
    $scope.loadingPage = true;
    RequestApis.HR(`securities/HR/view/HR_Pakna`, 'Get', '', '', '', function (response) {
      if (response.status !== 200) {
        $scope.redirectUrlForUnAuth = '../../views/PermissionWarning.html';
        $scope.checkValidation = false;
      } else {
        RequestApis.HR(`securities/HR/exec/HR_Pakna`, 'Get', '', '', '', function (response) {
          if (response.status === 200) {
            $scope.checkValidationOnBtn = true;
          } else {
            $scope.checkValidationOnBtn = false;
          }
        });
       $scope.getLastIssuances();
      }
      $scope.loadingPage = false;
    });
  };
  $scope.checkAuth();
  //=============== toast notification ======================
  const Toast = Swal.mixin({
    toast: true,
    position: 'center',
    showConfirmButton: false,
    timer: 2000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    }
  });
  //============= date time picker==================
  $scope.dateTimeMask = function () {
    $timeout(function () {
      $(".date-picker").datepicker({
        dateFormat: "yy/mm/dd",
        changeMonth: true,
        changeYear: true
      });
    }, 500);
    Inputmask({
      clearMaskOnLostFocus: false,
      clearIncomplete: true,
}).mask(document.querySelectorAll("input"));
    $('.date-picker').change(function () {
      angular.element($(this)).triggerHandler('input');
    });
    $('.time').change(function () {
      angular.element($(this)).triggerHandler('input');
    });
  };
  //================== selected personnel ==================
  $scope.personnelData = {
    data: [],
    dataIdsObj: {},
  };
  $scope.useSelectedPersonnel = function (data = $scope.personnelData.data) {
    $scope.personnels = data;
    $scope.getLastIssuances();
  };
  //================== get list of last issuance ===========
  $scope.getLastIssuances = function () {
    $scope.loadingFirst = true;
    $scope.selectedPersonnel = [];
    $scope.selectedPersonnels = '';
    if ($scope.personnels.length) {
      Object.values($scope.personnels).forEach(personel => {
        $scope.selectedPersonnel.push(personel.Id);
      });
      $scope.selectedPersonnels = `&pids=${$scope.selectedPersonnel.join(",")}`;
    }
    RequestApis.HR(`paknas/paf/last?ps=${$scope.PageSize}&pn=${$scope.pageNum}${$scope.selectedPersonnels}&hp=1`, 'Get', '', '', '', function (response) {
      $scope.lastIssuance = response.data;
      $scope.loadingFirst = false;
    });
  };
  $scope.lastIssuancePaging = function (item) {
    if ($scope.lastIssuance.TotalPages >= item && $scope.lastIssuance.TotalPages >= $scope.lastIssuance.PageIndex) {
      $scope.pageNum = item;
      $scope.getLastIssuances();
    }
  };
  //====================== check item section ====================
  $scope.checkItems = function (items) {
    if (document.getElementById('checkAll').checked === true) {
      $scope.selectedItems = items;
      Object.values($scope.selectedItems).forEach(x => {
        if (!x.HasPakna) {
          document.getElementById(`ch-${x.Id}`).checked = true;
        }
      });
    } else {
      Object.values($scope.selectedItems).forEach(x => {
        document.getElementById(`ch-${x.Id}`).checked = false;
      });
      $scope.selectedItems = [];
    }
  };
  $scope.checkItem = function (item) {
    if (document.getElementById(`ch-${item.Id}`).checked === true) {
      $scope.selectedItems.push(item);
    } else {
      let i = 0;
      Object.values($scope.selectedItems).forEach(x => {
        if (x.Id === item.Id) {
          $scope.selectedItems.splice(i, 1);
        }
        ++i;
      });

    }
  };
  $scope.checkState = function (item) {
    let result = false;
    Object.values($scope.selectedItems).forEach(x => {
      if (x.Id === item) {
        result = true;
      }
    });
    return result;
  };

  $scope.checkItemsSecond = function (items) {
    if (document.getElementById('checkAllS').checked === true) {
      $scope.selectedSecondItem = items;
      Object.values($scope.selectedSecondItem).forEach(x => {
        document.getElementById(`chS-${x.Id}`).checked = true;
      });
    } else {
      Object.values($scope.selectedSecondItem).forEach(x => {
        document.getElementById(`chS-${x.Id}`).checked = false;
      });
      $scope.selectedSecondItem = [];
    }
  };
  $scope.checkItemSecond = function (item) {
    if (document.getElementById(`chS-${item.Id}`).checked === true) {
      $scope.selectedSecondItem.push(item);
    } else {
      let i = 0;
      Object.values($scope.selectedSecondItem).forEach(x => {
        if (x.Id === item.Id) {
          $scope.selectedSecondItem.splice(i, 1);
        }
        ++i;
      });

    }
  };
  //========================== sending section ==========================
  $scope.sendToSecondWizard = function () {
    $scope.loadingSend = true;
    let ItemIds = [];
    Object.values($scope.selectedItems).forEach(x => {
      ItemIds.push(x.Id);
    });
    RequestApis.HR('paknas/paf', 'Post', '', '', ItemIds, function (response) {
      if (response.status === 200) {
        $scope.getSecondListOfIssuance();
        $('#secondWizardModal').modal();
      }
      global.messaging(response);
      $scope.loadingSend = false;
    });
  };
  //================================ second section of wizard ============================================
  //======================================================================================================
  $scope.getSecondListOfIssuance = function () {
    let selectedPersonnel = [];
    let selectedPersonnels = '';
    if ($scope.personnels.length) {
      Object.values($scope.personnels).forEach(personel => {
        selectedPersonnel.push(personel.Id);
      });
      selectedPersonnels = `&ids=${selectedPersonnel.join(",")}`;
    }
    RequestApis.HR(`paknas/paf?ps=${$scope.PageSize}&pn=${$scope.pageNum}&pksts=1${selectedPersonnels}`, 'Get', '', '', '', function (response) {
      $scope.secondWizardIssuance = response.data;
    });
  };
  $scope.secondWizardIssuancePaging = function (item) {
    if ($scope.lastIssuance.TotalPages >= item && $scope.lastIssuance.TotalPages >= $scope.lastIssuance.PageIndex) {
      $scope.pageNum = item;
      $scope.getLastIssuances();
    }
  };
  $scope.cancelSecondWizardMOdal = function () {
    $scope.secondWizardIssuance = [];
    $scope.selectedItems = [];
    $scope.getLastIssuances();
    $('#secondWizardModal').modal('hide');
  };
  $scope.selected = function (state, type = null) {
    RequestApis.HR(`paknas/${state}/codes?ps=1000&pn=1`, 'Get', '', '', '', function (response) {
      $scope.selectData(state, response.data.Items, type);
    });
  };
  $scope.selectData = function (state, item, type) {
    switch (state) {
      case 'MarriageStatus':
        $scope.marriageData = item;
        break;
      case 'EducationDegree':
        $scope.degreeData = item;
        break;
      case 'Province':
        if (type === "BpProvinceCode") {
          $scope.BpProvinceCodeData = item;
        }
        if (type === "WpProvinceCode") {
          $scope.WpProvinceCodeData = item;
        }
        break;
      case 'County':
        if (type === "BpCityCode") {
          $scope.BpCityCodeData = item;
        }
        if (type === "WpCityCode") {
          $scope.WpCityCodeData = item;
        }
        break;
      case 'EmploymentStatus':
        $scope.EmploymentStatusData = item;
        break;
      case 'EmploymentType':
        $scope.EmploymentTypeData = item;
        break;
      case 'JobRank':
        $scope.JobRankData = item;
        break;
      case 'SacrificialType':
        $scope.SacrificialTypeData = item;
        break;
      case 'OrderType':
        $scope.OrderTypeData = item;
        break;
      case 'PensionFundType':
        $scope.PensionFundTypeData = item;
        break;
      default:
    }
  };
  $scope.showAndEditModal = function (item) {
    $scope.Items = item;
    $scope.showAndEdit = JSON.parse(item.SendDatas);
    $('#showAndEditModal').modal();
  };
  $scope.cancelShowAndEditModal = function () {
    $scope.showAndEdit = {};
    $('#showAndEditModal').modal('hide');
  };
  $scope.confirmEdit = function (item) {
    $scope.loadingEdit = true;
    let itemToUpdate = {
      "Id": $scope.Items.Id,
      "UserId": $scope.Items.UserId,
      "SendDatas": JSON.stringify(item),
      "RowVersion": $scope.Items.RowVersion
    };
    RequestApis.HR('paknas/paf', 'Patch', '', '', itemToUpdate, function (response) {
      if (response.status === 200) {
        $scope.getSecondListOfIssuance();
      }
      global.messaging(response);
      $('#showAndEditModal').modal('hide');
      $scope.loadingEdit = false;
    });
  };
  $scope.removeItemModal = function (item) {
    $scope.deleteItem = {
      "Id": item.Id,
      "RowVersion": item.RowVersion
    };
    $('#deleteModal').modal();
  };
  $scope.confirmDelete = function (item) {
    $scope.loadingDelete = true;
    RequestApis.HR('paknas/paf', 'Delete','','', $scope.deleteItem, function (response) {
      if (response.status === 204) {
        $scope.getSecondListOfIssuance();
      }
      global.messaging(response);
      $scope.loadingDelete = false;
      $('#deleteModal').modal('hide');
    });
  };
  $scope.cancelDelete = function () {
    $('#deleteModal').modal('hide');
    $scope.deleteItem = {};
  };
  //==================================== sending to pakna section ===========================================
  $scope.sendToPakna = function (item) {
    item.loading = true;
    RequestApis.HR(`paknas/${item.Id}/send`, 'Post', '', '', '', function (response) {
      global.messaging(response);
      item.loading = false;
    });
    /*$('#secondWizardModal').modal('hide');*/
  };
});
app.controller('PaknaHistoryCtrl', function ($scope, RequestApis, $timeout, global, $templateCache, $state) {
  //=================== initial variable ===================
  $templateCache.remove($state.current.templateUrl);
  $scope.PageSize = 20;
  $scope.pageNum = 1;
  $scope.loadingSend = false;
  $scope.loadingPage = false;
  $scope.loadingDelete = false;
  $scope.checkValidation = true;
  $scope.checkValidationOnBtn = false;
  $scope.personnels = [];
  $scope.selectedItems = [];
  $scope.selectedSecondItem = [];
  //======================= check authorization =============
  $scope.checkAuth = function () {
    $scope.loadingPage = true;
    RequestApis.HR(`securities/HR/view/HR_Pakna`, 'Get', '', '', '', function (response) {
      if (response.status !== 200) {
        // $scope.redirectUrlForUnAuth = '../../views/PermissionWarning.html';
        // $scope.checkValidation = false;
      } else {
        RequestApis.HR(`securities/HR/exec/HR_Pakna`, 'Get', '', '', '', function (response) {
          if (response.status === 200) {
            $scope.checkValidationOnBtn = true;
          } else {
            $scope.checkValidationOnBtn = false;
          }
        });
        //$scope.getSecondListOfIssuance();
      }
      $scope.getSecondListOfIssuance();
      $scope.loadingPage = false;
    });
  };
  $scope.checkAuth();
  //=============== toast notification ======================
  const Toast = Swal.mixin({
    toast: true,
    position: 'center',
    showConfirmButton: false,
    timer: 2000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    }
  });
  //============= date time picker==================
  $scope.dateTimeMask = function () {
    $timeout(function () {
      $(".date-picker").datepicker({
        dateFormat: "yy/mm/dd",
        changeMonth: true,
        changeYear: true
      });
    }, 500);
    Inputmask({
      clearMaskOnLostFocus: false,
      clearIncomplete: true,
}).mask(document.querySelectorAll("input"));
    $('.date-picker').change(function () {
      angular.element($(this)).triggerHandler('input');
    });
    $('.time').change(function () {
      angular.element($(this)).triggerHandler('input');
    });
  };
  //================== selected personnel ==================
  $scope.personnelData = {
    data: [],
    dataIdsObj: {},
  };
  $scope.useSelectedPersonnel = function (data = $scope.personnelData.data) {
    $scope.personnels = data;
    $scope.getSecondListOfIssuance();
  };
  //====================== check item section ====================
  $scope.checkItemsSecond = function (items) {
    if (document.getElementById('checkAllS').checked === true) {
      $scope.selectedSecondItem = items;
      Object.values($scope.selectedSecondItem).forEach(x => {
        document.getElementById(`chS-${x.Id}`).checked = true;
      });
    } else {
      Object.values($scope.selectedSecondItem).forEach(x => {
        document.getElementById(`chS-${x.Id}`).checked = false;
      });
      $scope.selectedSecondItem = [];
    }
  };
  $scope.checkItemSecond = function (item) {
    if (document.getElementById(`chS-${item.Id}`).checked === true) {
      $scope.selectedSecondItem.push(item);
    } else {
      let i = 0;
      Object.values($scope.selectedSecondItem).forEach(x => {
        if (x.Id === item.Id) {
          $scope.selectedSecondItem.splice(i, 1);
        }
        ++i;
      });

    }
  };
  //========================== sending section ==========================
  $scope.sendToSecondWizard = function () {
    $scope.loadingSend = true;
    let ItemIds = [];
    Object.values($scope.selectedItems).forEach(x => {
      ItemIds.push(x.Id);
    });
    RequestApis.HR('paknas/paf', 'Post', '', '', ItemIds, function (response) {
      if (response.status === 200) {
        $('#secondWizardModal').modal();
        $scope.getSecondListOfIssuance();
      }
      global.messaging(response);
      $scope.loadingSend = false;
    });
  };
  //================================ second section of wizard ============================================
  //======================================================================================================
  $scope.getSecondListOfIssuance = function () {
    let selectedPersonnel = [];
    let selectedPersonnels = '';
    let path = '';
    if ($scope.personnels.length) {
      Object.values($scope.personnels).forEach(personel => {
        selectedPersonnel.push(personel.Id);
      });
      selectedPersonnels = `&ids=${selectedPersonnel.join(",")}`;
      path = `paknas/paf?ps=${$scope.PageSize}&pn=${$scope.pageNum}&pksts=1${selectedPersonnels}`
    } else {
      path = `paknas/paf?ps=${$scope.PageSize}&pn=${$scope.pageNum}&pksts=1`
    }
    RequestApis.HR(path, 'Get', '', '', '', function (response) {
      $scope.secondWizardIssuance = response.data;
    });
  };
  $scope.secondWizardIssuancePaging = function (item) {
    if ($scope.lastIssuance.TotalPages >= item && $scope.lastIssuance.TotalPages >= $scope.lastIssuance.PageIndex) {
      $scope.pageNum = item;
      $scope.getLastIssuances();
    }
  };
  $scope.cancelSecondWizardMOdal = function () {
    $scope.secondWizardIssuance = [];
    $('#secondWizardModal').modal('hide');
  };
  //================ defind title for fields ================
  $scope.selected = function (state, type = null) {
    RequestApis.HR(`paknas/${state}/codes?ps=1000&pn=1`, 'Get', '', '', '', function (response) {
      $scope.selectData(state, response.data.Items, type);
    });
  };
  $scope.selectData = function (state, item, type) {
    switch (state) {
      case 'MarriageStatus':
        $scope.marriageData = item;
        break;
      case 'EducationDegree':
        $scope.degreeData = item;
        break;
      case 'Province':
        if (type === "BpProvinceCode") {
          $scope.BpProvinceCodeData = item;
        }
        if (type === "WpProvinceCode") {
          $scope.WpProvinceCodeData = item;
        }
        break;
      case 'County':
        if (type === "BpCityCode") {
          $scope.BpCityCodeData = item;
        }
        if (type === "WpCityCode") {
          $scope.WpCityCodeData = item;
        }
        break;
      case 'EmploymentStatus':
        $scope.EmploymentStatusData = item;
        break;
      case 'EmploymentType':
        $scope.EmploymentTypeData = item;
        break;
      case 'JobRank':
        $scope.JobRankData = item;
        break;
      case 'SacrificialType':
        $scope.SacrificialTypeData = item;
        break;
      case 'OrderType':
        $scope.OrderTypeData = item;
        break;
      case 'PensionFundType':
        $scope.PensionFundTypeData = item;
        break;
      default:
    }
  };
  $scope.showAndEditModal = function (item) {
    $scope.Items = item;
    $scope.showAndEdit = JSON.parse(item.SendDatas);
    $('#showAndEditModal').modal();
    $scope.dateTimeMask();
  };
  $scope.cancelShowAndEditModal = function () {
    $scope.showAndEdit = {};
    $('#showAndEditModal').modal('hide');
  };
  $scope.confirmEdit = function (item) {
    $scope.loadingEdit = true;
    let itemToUpdate = {
      "Id": $scope.Items.Id,
      "UserId": $scope.Items.UserId,
      "SendDatas": JSON.stringify(item),
      "RowVersion": $scope.Items.RowVersion
    };
    RequestApis.HR('paknas/paf', 'Patch', '', '', itemToUpdate, function (response) {
      if (response.status === 200) {
        $scope.getSecondListOfIssuance();
      }
      global.messaging(response);
      $('#showAndEditModal').modal('hide');
      $scope.loadingEdit = false;
    });
  };
  $scope.removeItemModal = function (item) {
    $scope.deleteItem = {
      "Id": item.Id,
      "RowVersion": item.RowVersion
    };
    $('#deleteModal').modal();
  };
  $scope.confirmDelete = function (item) {
    $scope.loadingDelete = true;
    RequestApis.HR('paknas/paf', 'Delete', '', '', $scope.deleteItem, function (response) {
      if (response.status === 204) {
        $scope.getSecondListOfIssuance();
      }
      global.messaging(response);
      $scope.loadingDelete = false;
      $('#deleteModal').modal('hide');
    });
  };
  $scope.cancelDelete = function () {
    $('#deleteModal').modal('hide');
    $scope.deleteItem = {};
  };
  //==================================== sending to pakna section ===========================================
  $scope.sendToPakna = function (item) {
    item.loading = true;
    RequestApis.HR(`api/paknas/${item.Id}/send`, 'Post', '', '', '', function (response) {
      global.messaging(response);
      item.loading = false;
    });
    $('#secondWizardModal').modal('hide');
  };
});
app.controller('actionTypeCtrl', function ($scope, $templateCache, $timeout, RequestApis, global, $state) {
  //======================= variables =============
  $templateCache.remove($state.current.templateUrl);
  $scope.actionType = {};
  $scope.actionType.createTypeItem = {};
  $scope.actionType.createHistoryTypeItem = {};
  $scope.actionType.issuanceTypeHistory = {};
  $scope.actionType.loading = true;
  $scope.actionType.hasData = false;
  $scope.actionType.hasGroupData = false;
  $scope.actionType.historyHasData = false;
  $scope.actionType.loaded = false;
  $scope.actionType.modalShow = false;
  $scope.actionType.Validation = true;
  $scope.actionType.employeeTypeId = null;
  $scope.actionType.rowVersionKeeper = null;
  $scope.actionType.editEmployeeGroup = [];
  $scope.actionType.addedList = [];
  $scope.actionType.groupPageSize = 10;
  $scope.actionType.groupPageNumber = 1;
  $scope.actionType.issuanceTypePageSize = 10;
  $scope.actionType.issuanceTypePageNumber = 1;
  $scope.actionType.historyIssuanceTypePageSize = 10;
  $scope.actionType.historyIssuanceTypePageNumber = 1;
  $scope.actionType.addedList = [];
  $scope.actionType.searchIssuance = "";
  $scope.actionType.groupSearch = "";
  //======================= check authorization =============
  $scope.checkAuth = function () {
    $scope.actionType.loadingPage = true;
    RequestApis.HR(`securities/HR/view/HR_PAF`, 'Get', '', '', '', function (response) {
      if (response.status !== 200) {
        $scope.actionType.redirectUrlForUnAuth = '../../views/PermissionWarning.html';
        $scope.actionType.Validation = false;
      } else {
        RequestApis.HR(`securities/HR/exec/HR_PAF`, 'Get', '', '', '', function (response) {
          if (response.status === 200) {
            $scope.actionType.checkValidationOnBtn = true;
          } else {
            $scope.actionType.checkValidationOnBtn = false;
          }
          $scope.getRuleType();
        });
      }
      $scope.inputMasks();
      $scope.actionType.loadingPage = false;
    });
  };
  $scope.checkAuth();
  $scope.checkingExist = function (item) {
    return global.checkExist(item);
  };
  //======================= input masks =====================
  $scope.inputMasks = function (name = ".date-picker", minDate = null) {
    $timeout(function () {
      $(name).datepicker({
        dateFormat: "yy/mm/dd",
        changeMonth: true,
        changeYear: true,
        minDate: minDate
      });
    }, 1);
    $(".precent").inputmask('integer', { min: 0, max: 100 });
    $(".precentF").inputmask({
      alias: "numeric",
      integerDigits: 3,
      digits: 2,
      max: 100,
      allowMinus: false,
      digitsOptional: false,
    });
    $(".numeric").inputmask('integer', { min: 0 });
    Inputmask({
      clearMaskOnLostFocus: false,
      clearIncomplete: true,
    }).mask(document.querySelectorAll("input"));
    $('.numeric').change(function () {
      angular.element($(this)).triggerHandler('input');
    });
    $('.numericF').change(function () {
      angular.element($(this)).triggerHandler('input');
    });
    $('.precent').change(function () {
      angular.element($(this)).triggerHandler('input');
    });
    $(name).change(function () {
      angular.element($(this)).triggerHandler('input');
    });
  };

  // get rule
  $scope.getRuleType = function () {
    RequestApis.HR(`constants/enum/RuleType`, 'Get', '', '', '', function (response) {
      $scope.actionType.employeeTypes = response.data;
    });
  };
  // get data for issuance type grid
  $scope.getFirstData = function (item) {
    $scope.actionType.loading = true;
    $scope.actionType.loaded = true;
    $scope.actionType.lawTypeId = item;
    $scope.actionType.historyPart = false;
    $scope.actionType.groupView = false;
    let query = "";
    if (global.checkExist($scope.actionType.searchIssuance))
      query = query.concat(`&q=${$scope.actionType.searchIssuance}`);
    RequestApis.HR(`actiontypes/${$scope.actionType.lawTypeId}/grouping?ps=${$scope.actionType.issuanceTypePageSize}&pn=${$scope.actionType.issuanceTypePageNumber}${query}`, 'Get', '', '', '', function (response) {
      if (response.status === 200) {
        if (response.data.Items.length)
          $scope.actionType.hasData = true;
        $scope.actionType.issuanceType = response.data;
        $scope.actionType.loading = false;
      }
    });
  };
  $scope.loadPageI = function (page) {
    if ($scope.actionType.issuanceType.TotalPages >= $scope.actionType.issuanceType.PageIndex && Number(page) > 0 && $scope.actionType.issuanceType.TotalPages >= page) {
      $scope.actionType.issuanceTypePageNumber = Number(page);
      $scope.getFirstData($scope.actionType.lawTypeId);
    }
  };
  $scope.setSearchIssuance = function () {
    $scope.getFirstData($scope.actionType.lawTypeId);
  };
  $scope.clearIssuanceSearch = function () {
    $scope.actionType.searchIssuance = "";
    $scope.getFirstData($scope.actionType.lawTypeId);
  };

  // manage btn in issuance type grid
  $scope.getHistory = function (type) {
    $scope.actionType.hsitoryType = type;
    let ActionTypeId = type.Id;
    $scope.actionType.rowVersionKeeper = type.RowVersion;
    if (global.checkExist(type.ActionType)) {
      ActionTypeId = type.ActionType.Id;
      $scope.actionType.rowVersionKeeper = type.ActionType.RowVersion;
    }
    RequestApis.HR(`actiontypes/${ActionTypeId}/history?ps=${$scope.actionType.historyIssuanceTypePageSize}&pn=${$scope.actionType.historyIssuanceTypePageNumber}`, 'Get', '', '', '', function (response) {
      $scope.actionType.historyPart = true;
      if (response.status === 200) {
        $scope.actionType.historyHasData = true;
        $scope.actionType.issuanceTypeHistory = response.data;
        $scope.actionType.createTypeItem.CorrectionBrief = $scope.actionType.issuanceTypeHistory.Items[0].CorrectionBrief;
        $scope.actionType.createTypeItem.Description = $scope.actionType.issuanceTypeHistory.Items[0].Description;
        $scope.actionType.createTypeItem.Brief = $scope.actionType.issuanceTypeHistory.Items[0].Brief;
        $scope.actionType.createTypeItem.Title = $scope.actionType.issuanceTypeHistory.Items[0].Title;
      } else {
        $scope.actionType.issuanceTypeHistory.Items = [];
      }
    });
  };
  $scope.setGroup = function (data) {
    $scope.actionType.groupDiv = false;
    $scope.actionType.selectedGroup = data;
    $scope.actionType.groupView = true;
    let rt = "";
    if (global.checkExist($scope.actionType.lawTypeId))
      rt = rt.concat(`?rt=${$scope.actionType.lawTypeId}`);
    let q = "";
    if (global.checkExist($scope.actionType.groupSearch))
      if (rt.length) {
        q = q.concat(`&q=${$scope.actionType.groupSearch}`);
      } else {
        q = q.concat(`?q=${$scope.actionType.groupSearch}`);
      }
    RequestApis.HR(`actiontypes/group/${data.GroupId}${rt}${q}`, 'Get', '', '', '', function (response) {
      if (response.status === 200) {
        if (response.data.Items.length)
          $scope.actionType.hasGroupData = true;
        $scope.actionType.tableData = response.data;
      }
    });
  };
  $scope.openEdit = function (item) {
    $scope.actionType.applyGroup = false;
    if (item.ActionType != undefined) {
      $scope.actionType.editItem = item.ActionType;
      $scope.actionType.editEmployeeGroup = [
        {
          id: item.ActionType.EmployeeTypeId,
          title: item.ActionType.EmployeeTypeTitle
        }
      ];
    } else {
      $scope.actionType.editItem = item;
      $scope.actionType.editEmployeeGroup = [
        {
          id: item.EmployeeTypeId,
          title: item.EmployeeTypeTitle
        }
      ];
    }
    $("#editModal").modal({ backdrop: 'static', keyboard: false });
  };
  $scope.deleteType = function (item) {
    $scope.actionType.applyGroup = false;
    $scope.actionType.deletingItem = item;
    $("#deleteModal").modal({ backdrop: 'static', keyboard: false });
  };


  //get data for group issuance type grid
  $scope.setGroupSearch = function () {
    $scope.setGroup($scope.actionType.selectedGroup);
  };
  $scope.clearGroupSearch = function () {
    $scope.actionType.groupSearch = '';
    $scope.setGroup($scope.actionType.selectedGroup);
  };
  //manage create modal in first grid of inssuance type
  $scope.employeeType = {
    data: [],
    selectedData: [],
    searchItems: [],
    PageSize: 10,
    PageIndex: 1,
    loading: true,
    TotalRow: null,
    TotalPages: null,
    BreadCrumbs: { param: '', Items: [] },
    parameter: [{ latin: 'Title', per: 'عنوان', searchState: true }]
  };
  $scope.$watch('employeeType.selectedData', function () {
    if ($scope.employeeType.selectedData.length) {
      $scope.actionType.addedList = $scope.employeeType.selectedData;
    }
  }, true);
  $scope.$watch('employeeType.searchItems', function () {
    $scope.getEmployeeTypeFunc($scope.employeeType);
  }, true);
  $scope.$watch('employeeType.PageIndex', function () {
    $scope.getEmployeeTypeFunc($scope.employeeType);
  }, true);
  $scope.getEmployeeTypeFunc = function (items) {
    let page = '&pn=1';
    if (global.checkExist(items.PageIndex)) {
      page = `&pn=${items.PageIndex}`;
    }
    let size = '?ps=10';
    if (global.checkExist(items.PageSize)) {
      size = `?ps=${items.PageSize}`;
    }
    let etrt = "";
    if (global.checkExist($scope.actionType.lawTypeId))
      etrt = etrt.concat(`&etrt=${$scope.actionType.lawTypeId}`);
    let query = '';
    if (global.checkExist(items.searchItems)) {
      Object.values(items.searchItems).forEach(searchItem => {
        if (searchItem.key === "Title")
          if (searchItem.value.length)
            query += `&q=${searchItem.value}`;
      });
    }
    RequestApis.HR(`employees/type/nopage${size}${page}${query}${etrt}`, 'Get', '', '', '', function (response) {
      $scope.employeeType.data = JSON.parse(JSON.stringify(response.data)).slice($scope.employeeType.PageSize * ($scope.employeeType.PageIndex - 1), $scope.employeeType.PageSize);
      $scope.employeeType.TotalRow = Number(response.data.length);
      $scope.employeeType.TotalPages = Math.ceil(response.data.length / $scope.employeeType.PageSize);
      if ($scope.employeeType.TotalPages === 1) {
        $scope.employeeType.PageIndex = 1;
      }
      $scope.employeeType.loading = false;
    });
  };
  $scope.cancelCreate = function () {
    $scope.employeeType.selectedData = [];
    $scope.actionType.createTypeItem = {};
    $("#createModal").modal('hide');
    if ($scope.actionType.groupView) {
      $scope.setGroup($scope.actionType.selectedGroup);
    } else {
      $scope.getFirstData($scope.actionType.lawTypeId);
    }
  };
  $scope.changeCreateType = function () {
    $scope.actionType.addedList = [];
    $scope.createTypeItem = {};
    $scope.getEmployeeTypeFunc($scope.employeeType);
    $scope.inputMasks();
    $("#createModal").modal();
  };
  $scope.confirmCreateType = function (items) {
    $scope.loadingCreateType = true;
    items.EmployeeTypes = [];
    items.CategoryId = null;
    items.GroupId = null;
    if (global.checkExist($scope.actionType.tableData.Items[0]))
      items.GroupId = $scope.actionType.tableData.Items[0].GroupId;
    for (var i = 0; i < $scope.actionType.addedList.length; i++) {
      items.EmployeeTypes.push($scope.actionType.addedList[i].Id);
    }
    RequestApis.HR(`actiontypes?rt=${$scope.actionType.lawTypeId}&agrp=true`, 'Post', '', '', items, function (response) {
      if (response.status === 200) {
        $scope.cancelCreate();
      }
      $scope.loadingCreateType = false;
      global.messaging(response);
    });
  };

  //get data for history issuance type grid
  $scope.loadPageHistory = function (page) {
    if ($scope.actionType.issuanceTypeHistory.TotalPages >= $scope.actionType.issuanceTypeHistory.PageIndex && Number(page) > 0 && $scope.actionType.issuanceTypeHistory.TotalPages >= page) {
      $scope.actionType.historyIssuanceTypePageNumber = Number(page);
      $scope.getHistory($scope.actionType.hsitoryType);
    }
  };

  //manage btn in history group inssuance type grid
  $scope.returnToMain = function () {
    $scope.actionType.historyPart = false;
    if ($scope.actionType.groupView) {
      $scope.setGroup($scope.actionType.selectedGroup);
    } else {
      $scope.getFirstData($scope.actionType.lawTypeId);
    }
  };
  $scope.changeCreateTypeHistory = function () {
    let actionTypeId = $scope.actionType.hsitoryType.Id;
    if (global.checkExist($scope.actionType.hsitoryType.ActionType))
      actionTypeId = $scope.actionType.hsitoryType.ActionType.Id;
    RequestApis.HR(`actiontypes/${actionTypeId}/history/date`, 'Get', '', '', '', function (response) {
      $scope.actionType.createHistoryTypeItem = {};
      $scope.actionType.addedList = [];

      if (global.checkExist(response.data))
        $scope.inputMasks(".date-picker-s", response.data);
      else {
        $scope.inputMasks();
        $scope.inputMasks(".date-picker-s", null);
      }
      $("#createHistoryModal").modal({ backdrop: 'static', keyboard: false });
    });
  };
  $scope.returnToPage = function () {
    $scope.actionType.groupView = false;
    $scope.getFirstData($scope.actionType.lawTypeId);
  };
  $scope.editGroup = function () {
    $scope.actionType.applyGroup = true;
    let item = $scope.actionType.tableData.Items[0];
    if (global.checkExist(item.ActionType)) {
      $scope.actionType.editItem = item.ActionType;
      $scope.actionType.editEmployeeGroup = [
        {
          id: item.ActionType.EmployeeTypeId,
          title: item.ActionType.EmployeeTypeTitle
        }
      ];
    } else {
      $scope.actionType.editItem = item;
      $scope.actionType.editEmployeeGroup = [
        {
          id: item.EmployeeTypeId,
          title: item.EmployeeTypeTitle
        }
      ];
    }
    $scope.inputMasks();
    $("#editModal").modal({ backdrop: 'static', keyboard: false });
  };
  $scope.deleteGroup = function () {
    $scope.actionType.applyGroup = true;
    $scope.actionType.deletingItem = $scope.actionType.tableData.Items[0];
    $("#deleteModal").modal({ backdrop: 'static', keyboard: false });
  };

  //manage delete modal in history grid
  $scope.confirmDelete = function () {
    $scope.loadingDeleteGroup = true;
    if ($scope.actionType.deletingItem.ActionType != undefined) {
      var item = {
        Id: $scope.actionType.deletingItem.ActionType.Id,
        RowVersion: $scope.actionType.deletingItem.ActionType.RowVersion
      };
    } else {
      var item = {
        Id: $scope.actionType.deletingItem.Id,
        RowVersion: $scope.actionType.deletingItem.RowVersion
      };
    }
    RequestApis.HR(`actiontypes?agrp=${$scope.actionType.applyGroup}`, 'Delete', '', '', item, function (response) {
      if (response.status === 204) {
        $scope.cancelDelete();
      }
      $scope.loadingDeleteGroup = false;
      global.messaging(response);
    });
  };
  $scope.cancelDelete = function () {
    if ($scope.actionType.applyGroup) {
      $scope.returnToPage();
    } else {
      if ($scope.actionType.groupView) {
        $scope.setGroup($scope.actionType.selectedGroup);
      } else {
        $scope.getFirstData($scope.actionType.lawTypeId);
      }
    }
    $("#deleteModal").modal("hide");
  };

  //manage edit modal in history grid of inssuance type
  $scope.confirmEditType = function (items) {
    $scope.loadingEditType = true;
    RequestApis.HR(`actiontypes?agrp=${$scope.actionType.applyGroup}`, 'patch', '', '', items, function (response) {
      if (response.status === 200) {
        $scope.cancelEdit();
      }
      $scope.loadingEditType = false;
      global.messaging(response);
    });
  };
  $scope.cancelEdit = function () {
    if ($scope.actionType.applyGroup) {
      $scope.returnToPage();
    } else {
      if ($scope.actionType.groupView) {
        $scope.setGroup($scope.actionType.selectedGroup);
      } else {
        $scope.getFirstData($scope.actionType.lawTypeId);
      }
    }
    $("#editModal").modal('hide');
  };

  // manage btns in history grid
  $scope.confirmCreateHistoryType = function (items) {
    $scope.loadingHistoryCreate = true;
    items.EmployeeTypes = [];
    items.Id = $scope.actionType.hsitoryType.Id;
    if (global.checkExist($scope.actionType.hsitoryType.ActionType))
      items.Id = $scope.actionType.hsitoryType.ActionType.Id;
    items.CategoryId = null;
    items.GroupId = null;
    items.RowVersion = $scope.actionType.rowVersionKeeper;
    if (global.checkExist($scope.actionType.tableData))
      if (global.checkExist($scope.actionType.tableData.Items[0]))
        items.GroupId = $scope.actionType.tableData.Items[0].GroupId;
    if (global.checkExist($scope.actionType.issuanceTypeHistory))
      if (global.checkExist($scope.actionType.issuanceTypeHistory.Items[0]))
        items.GroupId = $scope.actionType.issuanceTypeHistory.Items[0].GroupId;
    for (var i = 0; i < $scope.actionType.addedList.length; i++) {
      items.EmployeeTypes.push($scope.actionType.addedList[i].Id);
    }
    let sd = "";
    if (global.checkExist(items.StartDatePersian))
      sd = sd.concat(`&sd=${items.StartDatePersian}`);
    RequestApis.HR(`actiontypes/append?agrp=true${sd}`, 'Post', '', '', items, function (response) {
      if (response.status === 200) {
        $scope.cancelCreateHistory();
      }
      $scope.loadingHistoryCreate = false;
      global.messaging(response);
    });
  };
  $scope.cancelCreateHistory = function () {
    $scope.actionType.createTypeItem = {};
    $scope.getHistory($scope.actionType.hsitoryType);
    $("#createHistoryModal").modal('hide');
  };

  $scope.openEditHistory = function (item) {
    $scope.actionType.editItem = item;
    $scope.actionType.editEmployeeGroup = [
      {
        id: item.EmployeeTypeId,
        title: item.EmployeeTypeTitle
      }
    ];
    $("#editModalHistory").modal({ backdrop: 'static', keyboard: false });
  };
  $scope.confirmEditTypeHistory = function (items) {
    $scope.loadingHistoryEdit = true;
    RequestApis.HR(`actiontypes/history`, 'patch', '', '', items, function (response) {
      if (response.status === 200) {
        $scope.cancelEditHistory();
      }
      $scope.loadingHistoryEdit = false;
      global.messaging(response);
    });
  };
  $scope.cancelEditHistory = function () {
    $scope.actionType.editItem = {};
    $scope.getHistory($scope.actionType.hsitoryType);
    $("#editModalHistory").modal('hide');
  };


  $scope.deleteTypeHistory = function (item) {
    $scope.actionType.deletingItem = item;
    $("#deleteModalHistory").modal({ backdrop: 'static', keyboard: false });
  };

  $scope.cancelDeleteHistory = function () {
    $scope.actionType.deletingItem = {};
    $scope.getHistory($scope.actionType.hsitoryType);
    $("#deleteModalHistory").modal("hide");
  };

  $scope.confirmDeleteHistory = function () {
    $scope.loadingHistoryDelete = true;
    var item = {
      Id: $scope.actionType.deletingItem.Id,
      RowVersion: $scope.actionType.deletingItem.RowVersion
    };
    RequestApis.HR(`actiontypes/history`, 'Delete', '', '', item, function (response) {
      if (response.status === 204) {
        $scope.cancelDeleteHistory();
      }
      $scope.loadingHistoryDelete = false;
      global.messaging(response);
    });
  };



  // change view
  $scope.changeGroupView = function (id, type) {
    $scope.actionType.historyPart = false;
    $(".list-group-item").removeClass("selected-list-group");
    $("#" + id).addClass("selected-list-group");
    $scope.actionType.groupView = type;
  };
  $scope.getGroup = function () {
    let typeId = "";
    if (global.checkExist($scope.actionType.lawTypeId))
      typeId = typeId.concat(`?rt=${$scope.lawTypeId}`);
    RequestApis.HR(`actiontypes/group${typeId}${$scope.actionType.groupPageSize}${$scope.actionType.groupPageNumber}`, 'Get', '', '', '', function (response) {
      if (response.status == 200) {
        $scope.actionType.groupData = response.data;
        $scope.actionType.noGroup = false;
      } else {
        $scope.actionType.noGroup = true;
      }
    });
  };

});