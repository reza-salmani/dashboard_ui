function personnelController($scope, RequestApis, $compile, $timeout, global) {
  //====================== initial variable ===============================
  var $ctrl = this;
  $scope.selectedNames = "";
  $scope.countInPage = 10;
  $scope.pageNum = 1;
  $scope.isShowAdvancedSearch = 0;
  $scope.isOpen = false;
  $scope.selectPostStatus = false;
  $scope.showLastPersonnel = false;
  $scope.fastSearchChar = "";
  $scope.personnels = [];
  $scope.filterChar = {};
  $scope.lastSelectedTable = {};
  $scope.searchFilterItems = '';
  $scope.lastSelectedTable.Items = [];

  //============================== get current user id section ===================================
  $scope.checkCookie = function () {
    $scope.authHeaders = {};
    if ($scope.getCookie("UID") == "" || $scope.getCookie("UID") == null) {

      if ($scope.getCookie("UserId") == "" || $scope.getCookie("UserId") == null) {
        $scope.currentUserId = '';
        $scope.allow = false;
      } else {
        $scope.currentUserId = $scope.getCookie("UserId");
        $scope.authHeaders.UID = $scope.currentUserId
        $scope.allow = true;
      }
      $scope.getCookie("UserId")
    } else {
      $scope.currentUserId = $scope.getCookie("UID");
      $scope.authHeaders.UID = $scope.currentUserId
      $scope.allow = true;
    }
  }
  $scope.getCookie = function (cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }
  $ctrl.$onInit = function () {
    if (localStorage.getItem(`localPersonnelItem`) !== "undefined" && localStorage.getItem(`localPersonnelItem`) !== null) {
      $scope.lastSelectedTable.Items = JSON.parse(localStorage.getItem(`localPersonnelItem`));
    }
    if (localStorage.getItem(`lastSelected`) !== "undefined" && localStorage.getItem(`lastSelected`) !== null) {
      $scope.personnels.push(JSON.parse(localStorage.getItem(`lastSelected`))[0])
      $scope.confirmAddingPersonnel();
    } else {
      $scope.personnels = [];
    }

    //======================= advance search ==================
    $scope.SearchDataItemPersonnel = {
      data: {},
      Items: ["name", "family", "fatherName", "nationalCode", "sex", "age", "maritalState", "childCount", "dossierNum", "personnelNum", "chart", "employeeState", "employeeDate", "employee", "jobLevel", "sacrificeState", "sacrificeRelation", "postGrade", "grade", "jobField", "class"],
      startDate: $ctrl.personnelData.fromDate != undefined ? $ctrl.personnelData.fromDate : moment().format('jYYYY/jMM/jDD'),
      finishDate: $ctrl.personnelData.toDate != undefined ? $ctrl.personnelData.toDate : moment().format('jYYYY/jMM/jDD'),
    }
    $scope.returnSearchDataPersonnelFunc = function (data = $scope.SearchDataItemPersonnel.data) {
      $scope.searchFilterItems = data.data;
      $scope.getPersonnelList();
    }
  }

  //============================== select personnel =============================================
  $scope.selectPersonnel = function () {
    $('#table_body input:checked').prop('checked', false);
    $('#selectPersonnel').modal();
    $scope.isOpen = true;
    $scope.getPersonnelList();

  }
  $scope.getPersonnelList = function () {
    RequestApis.HR(`personnel?pn=${$scope.pageNum}&ps=${$scope.countInPage}${$scope.searchFilterItems}`, 'get', '','',null, function (response) {
      $scope.tableData = response.data;
    })
  }
  $scope.changePagination = function (page) {
    if ($scope.tableData.PageIndex <= $scope.tableData.TotalPages && page <= $scope.tableData.TotalPages && page >= 1) {
      $scope.pageNum = page;
      $scope.getPersonnelList();
    }
  }
  $scope.checkAll = function (event) {
    let filters = '';
    if (event.target.checked) {
      if (global.checkExist($scope.searchFilterItems)) {
        filters += `?${$scope.searchFilterItems.substring(1, $scope.searchFilterItems.toString().length)}`
      }
      RequestApis.HR(`personnel/nopg${filters}`, 'get', '', '', null, function (response) {
        $scope.tableData.Items = response.data;
        $scope.personnels = response.data;
        $scope.tableData.PageIndex = 1;
        $scope.tableData.TotalPages = 1;
      })
    } else {
      $scope.personnels = [];
      $scope.getPersonnelList();
    }

  }
  $scope.checkThisPage = function (event, items) {
    if (event.target.checked) {
      Object.values(items).forEach(item => {
        if (!$scope.personnels.some(x => x.Id === item.Id)) {
          $scope.personnels.push(item);
        }
      })
    } else {
      Object.values(items).forEach(item => {
        $scope.personnels = $scope.personnels.filter(x => x.Id != item.Id)
      })
    }
  }
  $scope.selectPersonelItem = function (personnel) {
    if ($ctrl.stateSelect === 'check') {
      if (document.getElementById(`${personnel.Id}`).checked) {
        Object.values($scope.personnels).forEach(pers => {
          if (personnel.Id === pers.Id) {
            $scope.personnels = $scope.personnels.filter(x => x.Id !== pers.Id);
            document.getElementById(`${personnel.Id}`).checked = false;
          }
        })
        if (localStorage.getItem(`lastSelected$`).length) {
          Object.values(JSON.parse(localStorage.getItem(`lastSelected`))).forEach(perj => {
            if (personnel.Id === perj.Id) {
              $scope.lastSelectedTable.Items = $scope.lastSelectedTable.Items.filter(x => x.Id !== perj.Id);
            }
          })
        }
      } else {
        document.getElementById(`${personnel.Id}`).checked = true;
        $scope.personnels.push(personnel);
        if (localStorage.getItem(`lastSelected`) != "undefined" && localStorage.getItem(`lastSelected`) !== null) {
          if (!localStorage.getItem(`lastSelected`).includes(`"Id":${personnel.Id}`)) {
            $scope.lastSelectedTable.Items.splice(0, 0, personnel);
          }
        } else {
          $scope.lastSelectedTable.Items.splice(0, 0, personnel);
        }
      }
    } else {
      $scope.personnels = [];
      document.getElementById(`R-${personnel.Id}`).checked = true;
      $scope.personnels.push(personnel);
      if (localStorage.getItem(`lastSelected`) != "undefined" && localStorage.getItem(`lastSelected`) !== null) {
        if (!localStorage.getItem(`lastSelected`).includes(`"Id":${personnel.Id}`)) {
          $scope.lastSelectedTable.Items.splice(0, 0, personnel);
        }
      } else {
        $scope.lastSelectedTable.Items.splice(0, 0, personnel);
      }
      $scope.confirmAddingPersonnel();
    }


  }
  $scope.checkState = function (item) {
    let result = false;
    if ($scope.personnels.some(x => x.Id === item.Id)) {
      result = true;
    }
    return result;
  }
  //============================== clear input names ===================================
  $scope.clearAllPersonel = function () {
    $scope.personnels = [];
    $scope.selectedNames = "";
    $scope.fastSearchChar = "";
    localStorage.removeItem(`lastSelected`)
    $scope.confirmAddingPersonnel();
  }

  // ===================================== advanced search ======================================
  $scope.doSearch = () => {
    let item = $scope.filterChar;
    $scope.searchParameters = '';
    if (item.FirstName != undefined && item.FirstName.toString().length) {
      $scope.searchParameters += `&n=${item.FirstName}`
    }
    if (item.LastName != undefined && item.LastName.toString().length) {
      $scope.searchParameters += `&n=${item.LastName}`
    }
    if (item.PersonnelNo != undefined && item.PersonnelNo.toString().length) {
      $scope.searchParameters += `&n=${item.PersonnelNo}`
    }
    if (item.DossierNo != undefined && item.DossierNo.toString().length) {
      $scope.searchParameters += `&n=${item.DossierNo}`
    }
    $scope.getPersonnelList();
  };

  $scope.clearinputSearch = function (column) {
    $scope.filterChar[column] = "";
    $scope.doSearch();
  };
  $scope.searchItems = {
    n: "", //name
    f: "", //family
    fn: "", // fatherName
    nc: "", //nationalCode
    // birthCode: "",
    pnn: "", //personnelCode
    dn: "", //employeeCode
    gn: "", //sex
    tri: "", // tri
    treeName: "",
    ms: [], //marrige
    ag1: "", //agefrom
    ag2: "", //age to
    wt: [], //warStatus
    et: [], //serviceStatus
    es: [], //employeeStatus
    jt: [], //jobType
    efd: "", //employmentFrom
    eud: "", //employmentUntil
    cf: "", //childrenCountFrom
    cu: "", //childrenCountUntil
  };

  $scope.confirmAdvancedSearch = function () {
    var searchParameter = ""
    let s = 0;
    Object.values($scope.searchItems).forEach(value => {
      if (value.length != 0) {
        s++
      }
    });
    if (s != 0) {
      searchParameter = "?";//initialize for send params (should first paramets starts with "?")
    }
    for (let key in $scope.searchItems) {
      if (
        key != 'ms' &&
        key != 'wt' &&
        key != 'et' &&
        key != 'es' &&
        key != 'jt' &&
        key != 'treeName' &&
        $scope.searchItems[key]
      ) {
        searchParameter = searchParameter + "&" + key + "=" + $scope.searchItems[key];
      } else {
        if ($scope.searchItems[key].length > 0 && key != 'treeName') {
          if (key == 'et' || key == 'es') {

            let stringOfArr = ""
            let i = 0;
            let kama = "";
            for (const item of $scope.searchItems[key]) {
              kama = i > 0 ? "," : "";
              stringOfArr = stringOfArr + kama + item.Id;
              i++
            }
            searchParameter = searchParameter + "&" + key + "=" + stringOfArr;

          } else {

            let sumArr = 0
            for (const item of $scope.searchItems[key]) {
              sumArr = sumArr + item.Id;
            }
            searchParameter = searchParameter + "&" + key + "=" + sumArr;

          }
        }
      }
    }
    $scope.searchParameters = searchParameter;
    $scope.getPersonnelList();
  }

  $scope.clearFilter = function () {
    $scope.searchItems = {
      n: "", //name
      f: "", //family
      fn: "", // fatherName
      nc: "", //nationalCode
      // birthCode: "",
      pnn: "", //personnelCode
      dn: "", //employeeCode
      gn: "", //sex
      tri: "", // tri
      treeName: "",
      ms: [], //marrige
      ag1: "", //agefrom
      ag2: "", //age to
      wt: [], //warStatus
      et: [], //serviceStatus
      es: [], //employeeStatus
      jt: [], //jobType
      efd: "", //employmentFrom
      eud: "", //employmentUntil
      cf: "", //childrenCountFrom
      cu: "", //childrenCountUntil
    };
    $scope.confirmAdvancedSearch();
  }
  // ======= select chart =========================

  $scope.settingChart = function (item) {
    $scope.selectPostStatus = false;
    $scope.searchItems.tri = item.Id;
    $scope.searchItems.treeName = item.Title;
    document.getElementById('selectCaratArrow').click();
  };
  $scope.clearChart = function () {
    $scope.searchItems.tri = "";
    $scope.searchItems.treeName = "";
  };
  $('[data-toggle="tooltip"]').tooltip();
  $scope.getOfficialPositions = function () {
    $scope.chargesData = [];
    var route = "charts/" + $scope.editingRow.ChartId + "/charges"
    RequestApis.HR(route, 'get', '','',null, function (data) {
      $scope.chargesData = data.data;
      $scope.createPaginationCharges(Math.ceil(data.data[0].TotalRow / 10))
    })
  }
  $scope.editingRow = {}
  $scope.mainTableData = [];
  $scope.breadCrumbs = [];

  $scope.currentRoute = "charts";
  $scope.getChildrenData = function (id) {
    var route = "charts/" + id + "/children";
    $scope.currentRoute = route;
    RequestApis.HR(route, 'get', '','',null, function (data) {
      $scope.mainTableData = data.data[0].Charts;
      $scope.breadCrumbs = data.data[0].ChartBreadCrumb;
      $scope.createPagination(Math.ceil(data[0].TotalRow / 10));
    })
  }
  $scope.showingChart = function () {
    $scope.chartLoading = true;
    var route = $scope.currentRoute + "/all";
    RequestApis.HR(route, 'get', '','',null, function (data) {
      $scope.chartLoading = false;
      $scope.chartData = data.data;
      $("#chart").modal("show");
    })
  }
  $scope.showOrganizationTree = function () {
    $scope.treePage = 'organizationTree.html?v=' + Date.now();
    $("#tree").modal("show");
  }
  $scope.nodes = [];
  $scope.totalNodes = [];
  $scope.getTreeRootNode = function () {
    var route = "charts/all";
    RequestApis.HR(route, 'get', '','',null, function (node) {
      $scope.nodes = node.data;
      $scope.totalNodes = node.data;
    })
  }
  $scope.getSubNode = function (id) {
    if ($("#tree-select-" + id + ":empty").length == 1 || $("#tree-" + id + ":empty").length == 2) {
      var route = "charts/" + id + "/children/all";
      RequestApis.HR(route, 'get', '','',null, function (node) {
        $scope.makingTreeNode(id, node.data)
      })
    } else {
      $("#tree-select-" + id).slideToggle();
    }
  }
  $scope.selectingNode = function (id) {
    for (var i = 0; i < $scope.totalNodes.length; i++) {
      if (id == $scope.totalNodes[i].ChartId) {
        $scope.settingChart($scope.totalNodes[i]);
        break;
      }
    }
  }
  $scope.getTableData = function () {
    RequestApis.HR($scope.currentPath + "&pn=" + $scope.currentPage, 'get', '','',null, function (response) {
      $scope.searchLoading = false;
      if (response != 404) {
        $scope.searchResult = response.data;
      }
    })
  }
  $scope.loadPage = function (type) {
    if ($scope.searchResult.length != 0) {
      if (type == 'last') {
        $scope.currentPage = $scope.TotalPages;
        $scope.getTableData()
      } else if (type == 'first') {
        $scope.searching();
      } else if (type == 1) {
        if ($scope.currentPage < $scope.TotalPages) {
          $scope.currentPage++;
          $scope.getTableData()
        }
      } else {
        if ($scope.currentPage > 1) {
          $scope.currentPage--;
          $scope.getTableData()
        }
      }
    }
  }
  $scope.selectingNode1 = function (id) {
    $scope.searchParam = {
      q: '',
      cd: '',
      uc: ''
    }
    $scope.settingChart(id);
  }
  $scope.searchParam = {
    q: '',
    cd: '',
    uc: ''
  }
  $scope.searching = function () {
    $scope.searching = function () {
      $scope.searchLoading = true;
      if ($scope.pageName != undefined) {
        $scope.currentPath = "charts/group?search.cd=" + $scope.searchParam.cd + "&search.q=" + $scope.searchParam.q + "&search.uc=" + $scope.searchParam.uc + "&search.ss=" + $("#periodDate").val()
      } else {

        $scope.currentPath = "charts/group?search.cd=" + $scope.searchParam.cd + "&search.q=" + $scope.searchParam.q + "&search.uc=" + $scope.searchParam.uc
      }
      RequestApis.HR($scope.currentPath, 'get', '','',null, function (response) {
        $scope.searchLoading = false;
        if (response != 404) {
          $scope.searchResult = response.data;
          $scope.currentPage = 1;
          $scope.TotalPages = Math.ceil($scope.searchResult[0].TotalRow / 10);
        } else {
          $scope.searchResult = [];
          $scope.currentPage = 0;
          $scope.TotalPages = 0;
        }
      })
    }
  }
  $scope.setTable = function (result, node) {
    $scope.searchParam = {
      q: '',
      cd: '',
      uc: ''
    }
    $scope.loadTree(result.BreadCrumb, node)
  }
  $scope.makingTreeNode = function (id, data) {
    for (var i = 0; i < data.length; i++) {
      $scope.totalNodes.push(data[i]);
      $("#tree-select-" + id).append(
        $compile(
          "<li>\
                      <div  class='li-info asp-label'>\
                      <span class='user-span' data-toggle='tooltip' title='دارای تصدی'  ng-if='" + data[i].HasPersonnel + "' id='user-" + data[i].ChartId + "' ><i class='far fa-user'></i></span>\
                          <span id='icon-" + data[i].ChartId + "' ng-if='" + data[i].IsOraganization + "'  ng-click='getSubNode(" + data[i].ChartId + ")'><i class='far fa-building'></i></span>\
                          <i class='far fa-address-card' id='icon-" + data[i].ChartId + "' ng-if='" + data[i].IsPost + "'></i>\
                          <span id='icon-" + data[i].ChartId + "' ng-if='" + !data[i].IsOraganization + "&&" + !data[i].IsPost + "'  ng-click='getSubNode(" + data[i].ChartId + ")'><i class='far fa-users'></i></span>\
                          <input type='radio' ng-if='!selectMultiChart' ng-click='selectingNode(" + data[i].ChartId + ")' name='chart id='radio-" + data[i].ChartId + "' >\
                          <input type='checkbox' ng-if='selectMultiChart' ng-click='addToChartList(" + data[i].ChartId + ")' name='chart id='check-" + data[i].ChartId + "' >\
                          <span>" + data[i].Title + "\
                          </span >\
                      </div>\
                      <ul id='tree-select-" + data[i].ChartId + "'></ul>\
                  </li> "
        )($scope)
      )
      // if(data[i].IsPost) {
      //     $("#plus-" + data[i].ChartId).css("display","none");
      // }
    }
    $('[data-toggle="tooltip"]').tooltip();
    $("#tree-select-" + id).slideToggle();
  }
  $scope.dropdownChart = function (id) {

    if ($('#chart-select-' + id).is(':empty')) {
      $scope.childrenLoading = true;
      var route = "charts/" + id + "/children/all";
      RequestApis.HR(route, 'get', '','',null, function (data) {
        $scope.arrayToCreateChart = data.data;
        $scope.childrenLoading = false;
        $scope.appendingChart(id);
        $timeout(function () {
          $('#icon-' + id).addClass("rotate-up");
        }, 500)
      })
    } else {
      $('#chart-select-' + id).toggle();
      $('#icon-' + id).toggleClass("rotate-up");
    }
  }
  $scope.appendingChart = function (idToAdd) {
    for (var i = 0; i < $scope.arrayToCreateChart.length; i++) {
      if (!$scope.arrayToCreateChart[i].IsPost) {
        $("#chart-select-" + idToAdd).append(
          $compile(
            "<li>\
                          <span title='" + $scope.arrayToCreateChart[i].Title + "'>\
                              <span>" + $scope.arrayToCreateChart[i].Title + "\
                              </span >\
                              <i class='far fa-chevron-down' id='icon-" + $scope.arrayToCreateChart[i].ChartId + "' ng-if='!childrenLoading && " + $scope.arrayToCreateChart[i].HasNonPostChildren + "' ng-click='dropdownChart(" + $scope.arrayToCreateChart[i].ChartId + ")'></i>\
                              <div class='spinner-border text-primary spinner-border-sm' role='status' ng-if='childrenLoading'>\
                                  <span class='sr-only'>Loading...</span>\
                              </div>\
                          </span>\
                          <ul id='chart-select-" + $scope.arrayToCreateChart[i].ChartId + "'></ul>\
                      </li> "
          )($scope)
        )
      }
    }
  }
  $scope.createModalType = "";
  $scope.ParentIdToCreate = null;
  $scope.locationChoosing = false;



  // ===========================marige status ====================
  $scope.marigeStatus = [];
  $scope.openMarige = function () {
    if ($scope.marigeStatus.length == 0) {
      RequestApis.HR("constants/enum/MaritalState", 'get', '','',null, function (response) {
        $scope.marigeStatus = response.data;
      });
    }
  };
  $scope.MarigeStateChange = function (item) {
    if ($("#check-m-" + item.Id).is(":checked")) {
      $scope.searchItems.ms.push(item);
    } else {
      for (var i = 0; i < $scope.searchItems.ms.length; i++) {
        if (item.Id == $scope.searchItems.ms[i].Id) {
          $scope.searchItems.ms.splice(i, 1);
        }
      }
    }
  };

  // ==============================datePicker pakage==================
  $scope.dateTimeMask = function () {
    $timeout(function () {
      $(".date-picker").datepicker({
        dateFormat: "yy/mm/dd",
        changeMonth: true,
        changeYear: true,
      });
      /*$(".time").clockpicker();*/
    }, 500);
    $(".time").inputmask({
      regex: "(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]",
      placeholder: "HH:MM",
    });
    $(".date-picker").inputmask({
      regex:
        "([1-9][3-9][0-9][0-9])/(0[0-9]|1[0-2])/(0[1-9]|1[0-9]|2[0-9]|3[0-1])",
      placeholder: "xxxx/xx/xx",
    });
    $(".date-picker").change(function () {
      angular.element($(this)).triggerHandler("input");
    });
    $(".time").change(function () {
      angular.element($(this)).triggerHandler("input");
    });
  };
  $scope.showBigDateError = 0
  $scope.calculateDate = function () {
    let start = parseInt($("#EditstartDayDate").val().split("/")[0] + $("#EditstartDayDate").val().split("/")[1] + $("#EditstartDayDate").val().split("/")[2]);
    let end = parseInt($("#EditendDayDate").val().split("/")[0] + $("#EditendDayDate").val().split("/")[1] + $("#EditendDayDate").val().split("/")[2]);

    if (start != 'NaN' && end != 'NaN' && start > end) {
      $scope.showBigDateError = 1
    } else if (start != 'NaN' && end != 'NaN') {
      $scope.showBigDateError = 0
    }
  }

  // =========================== employee kind ====================
  $scope.getStateArray = function () {
    RequestApis.HR("employees/state?paging.pn=1", 'get', '','',null, function (response) {
      $scope.stateArray = response.data;
      $scope.statePath = "employees/state?paging.pn=";
    });
  };

  // =========================== employee status ====================
  $scope.removeEmployee = function (id) {
    $scope.searchItems.es = $scope.searchItems.es.filter(x => x.Id != id);
  };
  $scope.selectEmployeeState = function (item) {
    if (!document.getElementById(`check-e-${item.Id}`).checked) {
      $scope.searchItems.es = $scope.searchItems.es.filter(x => x.Id != item.Id)
    } else {
      $scope.searchItems.es.push(item);
    }
  }
  $scope.checkingState = function (item) {
    let result = false;
    if ($scope.searchItems.es.some(x => x.Id === item.Id)) {
      result = true;
    }
    return result
  }
  // ========================= employee type ======================
  RequestApis.HR("employees/simple/type", 'get', '','',null, function (response) {
    $scope.employeeType = response.data;
  });
  $scope.checkedStateType = function (item) {
    let result = false;
    if ($scope.searchItems.et.some(x => x.Id === item.Id)) {
      result = true;
    }
    return result;
  };
  $scope.removeService = function (id) {
    $scope.searchItems.et = $scope.searchItems.et.filter(x => x.Id !== id);
  };
  $scope.servicestateSelectChange = function (item) {
    if (!document.getElementById(`check-s-service-${item.Id}`).checked) {
      $scope.searchItems.et = $scope.searchItems.et.filter(x => x.Id != item.Id);
    } else {
      $scope.searchItems.et.push(item)
    }
  };
  // =========================== job status ====================
  $scope.jobStatus = [];
  $scope.openJob = function () {
    if ($scope.jobStatus.length == 0) {
      RequestApis.HR("constants/enum/JobType", 'get', '','',null, function (response) {
        $scope.jobStatus = response.data;
      });
    }
  };
  $scope.jobstateSelectChange = function (item) {
    if (!document.getElementById(`customCheck-work-${item.Id}`).checked) {
      $scope.searchItems.jt = $scope.searchItems.jt.filter(x => x.Id != item.Id);
    } else {
      $scope.searchItems.jt.push(item)
    }
  };
  $scope.removeJob = function (index, id) {
    $scope.searchItems.jt = $scope.searchItems.jt.filter(x => x.Id !== id);
  };
  $scope.jobstateCheckChange = function (item) {
    let result = false;
    if ($scope.searchItems.jt.some(x => x.Id === item.Id)) {
      result = true;
    }
    return result;
  };


  // =========================== war status ====================
  $scope.warStatus = [];
  $scope.openWar = function () {
    if ($scope.warStatus.length == 0) {
      RequestApis.HR("scores/war/types", 'get', '','',null, function (response) {
        $scope.warStatus = response.data;
      });
    }
  };
  $scope.warstateSelectChange = function (item) {
    if (!document.getElementById(`check-w-war-${item.Id}`).checked) {
      $scope.searchItems.wt = $scope.searchItems.wt.filter(x => x.Id != item.Id);
    } else {
      $scope.searchItems.wt.push(item)
    }
  };
  $scope.checkStateWar = function (item) {
    let result = false;
    if ($scope.searchItems.wt.some(x => x.Id === item.Id)) {
      result = true;
    }
    return result;
  };
  $scope.removeWar = function (id) {
    $scope.searchItems.wt = $scope.searchItems.wt.filter(x => x.Id !== id);
  };
  //============================== show last personnel section ===================================
  $scope.handleShowLastPersonnel = function () {
    $scope.showLastPersonnel = true;
    $scope.getLastPersonnel();
  }
  $scope.getLastPersonnel = function () {
    if (localStorage.getItem(`localPersonnelItem`) != "undefined" && localStorage.getItem(`localPersonnelItem`) !== null) {
      $scope.lastSelectedTable.TotalPages = Math.ceil(JSON.parse(localStorage.getItem(`localPersonnelItem`)).length / 5);
      $scope.lastSelectedTable.PageIndex = 1;
      $scope.lastSelectedTable.Items = JSON.parse(localStorage.getItem(`localPersonnelItem`)).slice(($scope.lastSelectedTable.PageIndex - 1) * 5, 5);
    } else {
      $scope.lastSelectedTable = {};
      $scope.lastSelectedTable.Items = [];
    }
  }
  $scope.calcPagination = function () {
    $scope.lastSelectedTable.Items = JSON.parse(localStorage.getItem(`localPersonnelItem`)).slice($scope.lastSelectedTable.PageIndex * 5, 5);
  }
  $scope.paginatelastPersonnel = function (page) {
    if (page <= $scope.lastSelectedTable.TotalPages && page >= 1 && $scope.lastSelectedTable.TotalPages >= $scope.lastSelectedTable.PageIndex) {
      $scope.lastSelectedTable.PageIndex = page;
      $scope.calcPagination();
    }
  }
  $scope.handleClearLastSelected = function () {
    //localStorage.removeItem(`lastSelected${$scope.currentUserId}`);
    //localStorage.removeItem(`lastSelectedTime${$scope.currentUserId}`);
    localStorage.removeItem(`lastSelected`);
    localStorage.removeItem(`lastSelectedTime`);
    // $scope.selectedNames = '';
    $scope.lastSelectedTable = [];
    //$scope.personnels = [];
    $scope.showLastPersonnel = false;
  }
  $scope.selectlastItem = function (item) {
    $scope.personnels = [];
    if (!$scope.personnels.some(x => x.Id === item.Id)) {
      $scope.personnels.push(item);
    }
    $scope.confirmAddingPersonnel();
    $scope.showLastPersonnel = false;
  }
  //================================ fast search ===================================
  $scope.handleFastSearch = function () {
    if ($scope.fastSearchChar != undefined && $scope.fastSearchChar != '') {
      $scope.fastSearchCharModal = true;
      $scope.showLastPersonnel = false;
      $scope.getFastPersonnel();
    } else {
      $scope.fastSearchCharModal = false;
    }
  }
  $scope.getFastPersonnel = function () {
    let page = "";
    if($scope.fastSearchTable !== undefined)
    if($scope.fastSearchTable.PageIndex !== undefined)
page = page.concat(`&ps=10&pn=${$scope.fastSearchTable.PageIndex}`)
    RequestApis.HR(`personnel/auto?q=${$scope.fastSearchChar}${page}`, 'get', '','',null, function (response) {
      $scope.fastSearchTable = response.data;
    })
  }

  $scope.paginateFastSearch = function (page) {
    if (page <= $scope.fastSearchTable.TotalPages && page >= 1 && $scope.fastSearchTable.TotalPages >= $scope.fastSearchTable.PageIndex) {
      $scope.fastSearchTable.PageIndex = page;
      $scope.getFastPersonnel();
    }
  }
  $scope.selectFastItem = function (item) {
    $scope.personnels = [];
    $scope.personnels.push(item);
    $scope.fastSearchChar = '';
    if (localStorage.getItem(`lastSelected`) != "undefined" && localStorage.getItem(`lastSelected}`) != null) {
      if (!localStorage.getItem(`lastSelected`).includes(`"Id":${item.Id}`)) {
        $scope.lastSelectedTable.Items.splice(0, 0, item);
      }
    } else {
      $scope.lastSelectedTable.Items.splice(0, 0, item);
    }
    $scope.confirmAddingPersonnel();
    $scope.fastSearchCharModal = false;
  }
  //================================ select name ===================================
  $scope.setSelectedNames = function () {
    $scope.selectedNames = "";
    $scope.fastSearchChar = "";
    if ($scope.personnels.length) {
      let dash = ""
      for (let i = 0; i < $scope.personnels.length; i++) {
        if (i < 2) {
          i == 1 ? dash = " - " : dash = "";
          $scope.fastSearchChar = $scope.selectedNames = $scope.selectedNames + dash + $scope.personnels[i].PoliteName
        }
      }
      if ($scope.personnels.length > 2) {
        $scope.fastSearchChar = $scope.selectedNames = `${$scope.selectedNames} و ${(parseInt($scope.personnels.length) - 2)}  نفر دیگر ...`;
      }
    }
  }
  //================================ sending data to parent controller =================================
  $scope.confirmAddingPersonnel = function () {
    $ctrl.personnelData.data = $scope.personnels;
    let personnelIds = [];
    if ($scope.personnels.length) {
      Object.values($scope.personnels).forEach(x => {
        personnelIds.push(x.Id);
      })
      $scope.setSelectedNames();
      localStorage.setItem(`lastSelected`, JSON.stringify([$scope.personnels[0]]))
      localStorage.setItem(`localPersonnelItem`, JSON.stringify($scope.lastSelectedTable.Items))
    } else {
      personnelIds = [];
    }
    $ctrl.personnelData.dataIdsObj = personnelIds;
    $ctrl.useSelectedPersonnel($scope.personnels);
    //localStorage.setItem(`lastSelected${$scope.currentUserId}`, JSON.stringify($scope.lastSelectedTable.Items))
    $scope.CancelAddPersonnel();
  }
  $scope.CancelAddPersonnel = function () {
    $("#selectPersonnel").modal('hide');
    //$scope.clearFilter();
    //$scope.filterChar = {};
    //if ($scope.isShowAdvancedSearch) {
    //    document.getElementById('showAdvancedSearch').click();
    //}
  }
  $scope.handleShowAdvancedSearch = function () {
    $scope.isShowAdvancedSearch = $scope.isShowAdvancedSearch == 0 ? 1 : 0;
  }
}

// ===================================================== create component ================================================
//<personnel personnel-data="personnelData" state-select="radio" use-selected-personnel="useSelectedPersonnel()"></personnel>
app.component("personnel", {
  bindings: {
    personnelData: "=",
    stateSelect: "@",
    useSelectedPersonnel: "&",
  },
  controller: personnelController,
  template: `<div class="card" ng-hide="$ctrl.personnelData.onlyButton">
    <div class="row">
        <div class="col-md-8 col-lg-6">
            <div class="input-group">
                <div class="input-group-prepend">
                    <label class="input-group-text">
                        انتخاب پرسنل
                    </label>
                </div>
                <style>
                    .placeholderblack::placeholder {
                        color: black !important;
                        opacity: 1 !important;
                    }

                    .text-start::placeholder {
                        text-align: right !important;
                    }
                </style>
                <input id="personnel-input" autocomplete="off" class="form-control text-start" ng-model="fastSearchChar"
                       ng-change="handleFastSearch()" ng-class="selectedNames.length ? 'placeholderblack' : ''"
                       placeholder="{{selectedNames.length ? selectedNames : 'نام/ نام خانوادگی/ کد ملی/ شماره کارمند'}}">
                <span ng-if="$ctrl.personnelData.data.length" title="حذف کلیه پرسنل انتخابی" ng-click="clearAllPersonel()">
                <i class="far fa-close position-absolute pointer" style="left:50px;top:5px" ></i></span>

                <span title="آخرین پرسنل انتخاب شده" data-bs-placement="bottom"
                   ng-show="!showLastPersonnel" ng-click="handleShowLastPersonnel() ; $event.stopPropagation()">
                <i class="far fa-download mt-1 text-success pointer" 
                   style="position: absolute;left: 5%;z-index: 9;"></i></span>


               <span title="انتخاب گروهی پرسنل" ng-click="selectPersonnel('open')">
                <i class="far fa-bars pointer mt-1" 
                   style="position: relative;right:3px"></i></span>


               <span ng-show="showLastPersonnel" ng-click="showLastPersonnel= false">
                <i id="lastPersonnelId" class="far fa-close text-danger pointer" 
                   style="position: absolute;left: 5%;top:5px;z-index: 9;"></i></span>

                <span ng-show="fastSearchCharModal" ng-click="fastSearchChar = ''">
                <i class="far fa-close text-danger pointer" 
                   style="position: absolute;left: 5%;z-index: 9;"></i></span>


                <div ng-if="fastSearchCharModal" style="position: absolute;top:1.6em;width: 100%;z-index: 10000;">
                    <div class="card" dir="rtl">
                        <div class="card">
                            <!-- ===================================table header=============================== -->
                            <div style="padding-left: 8px !important;">
                                <table class="newTableStyle">
                                    <thead>
                                        <tr class="row p-0 m-0">
                                            <th class="col-1 m-0">

                                            </th>
                                            <th class="col-3 m-0">
                                                نام/
                                                نام خانوادگی
                                            </th>
                                            <th class="col-3 m-0">
                                                نام پدر
                                            </th>
                                            <th class="col-3 m-0">
                                                شماره مستخدمی
                                            </th>
                                            <th class="col-2 m-0">
                                                کد پرسنلی
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr class="row p-0 m-0 pointer" ng-repeat="personnel in fastSearchTable.Items" ng-click="selectFastItem(personnel)">
                                            <td class="col-1 m-0 d-flex justify-content-center align-items-center" style="padding: 0.5rem 0 !important;">
                                                <input type="radio">
                                            </td>
                                            <td class="col-3 m-0 d-flex justify-content-center align-items-center" style="padding: 0.5rem 0 !important;">
                                                {{personnel.PoliteName}}
                                            </td>
                                            <td class="col-3 m-0 d-flex justify-content-center align-items-center" style="padding: 0.5rem 0 !important;">
                                                {{personnel.FatherName}}
                                            </td>
                                            <td class="col-3 m-0 d-flex justify-content-center align-items-center" style="padding: 0.5rem 0 !important;">
                                                {{personnel.PersonnelNo}}
                                            </td>
                                            <td class="col-2 m-0 d-flex justify-content-center align-items-center" style="padding: 0.5rem 0 !important;">
                                                {{personnel.DossierNo}}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <!-- =========================================pagination===================== -->
                        <div class="card not_select">
                            <div class="row">
                                <div class="col-sm-6" style="text-align: right;">

                                    <span ng-click="paginateFastSearch(fastSearchTable.TotalPages)" style="cursor: pointer;">
                                        <i class="far fa-chevron-right" style="font-size: 0.7em;"></i>
                                        <i class="far fa-chevron-right asp-label" style="margin-right: -3px;font-size: 0.7em;"></i>
                                    </span>

                                    <span ng-click="paginateFastSearch(fastSearchTable.PageIndex + 1)">
                                    <i class="far fa-chevron-right asp-label" 
                                       style="margin: 0 10px;cursor: pointer;font-size: 0.7em;"></i></span>

                                    <input class="form-control" id="paging"
                                           placeholder="{{fastSearchTable.PageIndex}} از  {{fastSearchTable.TotalPages}}"
                                           style="width: 30%;display: inline-block;position: relative;top: 0px;font-size: 0.7em;"
                                           ng-model="pageNumber" ng-keyup="paginateFastSearch(pageNumber);">

                                   <span ng-click="paginateFastSearch(fastSearchTable.PageIndex - 1)">
                                    <i class="far fa-chevron-left asp-label" 
                                       style="margin: 0 10px;cursor: pointer;font-size: 0.7em;"></i></span>

                                    <span ng-click="paginateFastSearch(1)" style="cursor: pointer;">
                                        <i class="far fa-chevron-left asp-label" style="margin-left: -3px;font-size: 0.7em;"></i>
                                        <i class=" far fa-chevron-left asp-label" style="font-size: 0.7em;"></i>
                                    </span>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>


                <div ng-if="showLastPersonnel" style="position: absolute;top:1.6em;width: 100%;z-index: 10000;">
                    <div class="card" dir="rtl">
                        <p class="HeaderForm">آخرین پرسنل انتخاب شده</p>
                        <div class="card">
                            <!-- ===================================table header=============================== -->
                            <div style="padding-left: 8px !important;">
                                <table class="newTableStyle">
                                    <thead>
                                        <tr class="row p-0 m-0 medium-font">
                                            <th class="col-1 m-0">

                                            </th>
                                            <th class="col-3 m-0">
                                                نام/
                                                نام خانوادگی
                                            </th>
                                            <th class="col-3 m-0">
                                                نام پدر
                                            </th>
                                            <th class="col-3 m-0">
                                                شماره مستخدمی
                                            </th>
                                            <th class="col-2 m-0">
                                                کد پرسنلی
                                            </th>
                                        </tr>
                                        <tr class="row p-0 m-0 medium-font">
                                            <th class="col-1 m-0">

                                            </th>
                                            <th class="col-3 m-0">
                                                <input type=text class="form-control" />
                                            </th>
                                            <th class="col-3 m-0">
                                                <input type=text class="form-control" ng-model="text3" />
                                            </th>
                                            <th class="col-3 m-0">
                                                <input type=text class="form-control" ng-model="text4" />
                                            </th>
                                            <th class="col-2 m-0">
                                                <input type=text class="form-control" ng-model="text5" />
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr class="row p-0 m-0 pointer big-font" ng-repeat="personnel in lastSelectedTable.Items track by personnel.Id"
                                            ng-click="selectlastItem(personnel)">
                                            <td class="col-1 m-0 d-flex justify-content-center align-items-center" style="padding: 0.5rem 0 !important;">
                                                <input type="radio">
                                            </td>
                                            <td class="col-3 m-0 d-flex justify-content-center align-items-center" style="padding: 0.5rem 0 !important;">
                                                {{personnel.PoliteName}}
                                            </td>
                                            <td class="col-3 m-0 d-flex justify-content-center align-items-center" style="padding: 0.5rem 0 !important;">
                                                {{personnel.FatherName}}
                                            </td>
                                            <td class="col-3 m-0 d-flex justify-content-center align-items-center" style="padding: 0.5rem 0 !important;">
                                                {{personnel.PersonnelNo}}
                                            </td>
                                            <td class="col-2 m-0 d-flex justify-content-center align-items-center" style="padding: 0.5rem 0 !important;">
                                                {{personnel.DossierNo}}
                                            </td>
                                        </tr>
                                        <tr ng-if="!lastSelectedTable.Items.length"><td col-span="5"><span>موردی یافت نشد</span></td></tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <!-- =========================================pagination===================== -->
                        <div class="card not_select position-relative">
                            <div class="row">
                                <div class="col-sm-6" style="text-align: right;">

                                    <span ng-click="paginatelastPersonnel(lastSelectedTable.TotalPages)" style="cursor: pointer;">
                                        <i class="far fa-chevron-right" style="font-size: 0.7em;"></i>
                                        <i class="far fa-chevron-right asp-label" style="margin-right: -3px;font-size: 0.7em;"></i>
                                    </span>

                                    <span ng-click="paginatelastPersonnel(lastSelectedTable.PageIndex + 1)">
                                    <i class="far fa-chevron-right asp-label" 
                                       style="margin: 0 10px;cursor: pointer;font-size: 0.7em;"></i></span>

                                    <input class="form-control" id="paging" placeholder="{{lastSelectedTable.PageIndex}} از  {{lastSelectedTable.TotalPages}}"
                                           style="width: 30%;display: inline-block;position: relative;top: 0px;font-size: 0.7em;" ng-model="pageNumber"
                                           ng-keyup="paginatelastPersonnel(pageNumber);">

                                  <span ng-click="paginatelastPersonnel(lastSelectedTable.PageIndex - 1)">
                                    <i class="far fa-chevron-left asp-label" 
                                       style="margin: 0 10px;cursor: pointer;font-size: 0.7em;"></i></span>

                                    <span ng-click="paginatelastPersonnel(1)" style="cursor: pointer;">
                                        <i class="far fa-chevron-left asp-label" style="margin-left: -3px;font-size: 0.7em;"></i>
                                        <i class=" far fa-chevron-left asp-label" style="font-size: 0.7em;"></i>
                                    </span>

                                </div>
                            </div>
                           <span  title="حذف کامل از حافظه قبلی" style="position: absolute; left: 5px ;" data-placement="bottom" ng-click="handleClearLastSelected()">
                            <i class="far fa-trash text-danger pointer" >
                            </i></span>
                        </div>
                    </div>
                </div>


            </div>
        </div>

        <div class="col-sm-6" style="text-align: center;">
            <div class="spinner-border text-primary" ng-if="loading"></div>
        </div>

    </div>

    <!--................................ show used personnel name .....................-->
    <!-- <small class="text-center d-block" ng-if="$ctrl.personnelData.data.length" style="font-size: 0.7rem;">
        <span>
            <span ng-repeat="personnel in $ctrl.personnelData.data track by $index">
                <span ng-if="$index < 3">
                    <span ng-if="$index > 0"> - </span>
                    <span ng-class="$index%2 == 0 ? 'text-info' : 'text-primary' ">{{personnel.PoliteName}}</span>
                </span>
            </span>
            <span ng-if="$ctrl.personnelData.data.length > 3">
                 <span>
                    و... <span class="text-primary">{{$ctrl.personnelData.data.length - 3}}</span> نفر دیگر
                 </span>
            </span>
        </span>
    </small> -->
</div>
<button type="button" class="new-button" ng-click="selectPersonnel()" ng-show="$ctrl.personnelData.onlyButton">
    <i class="far fa-plus"></i>
    افزودن پرسنل
</button>
<!--================ d-block========= select personnel =========================-->
<div class="modal fade" id="selectPersonnel">
    <div class="modal-dialog modal-xl">
        <div class="modal-content">
            <div class="modal-head">
                <p class="HeaderForm">
                    انتخاب پرسنل
                    <span data-dismiss="modal" ng-click="CancelAddPersonnel()">
                    <i class="far fa-close cancelIcon" ></i></span>
                </p>
            </div>
            <div class="modal-body p-0" style="padding-top: 0;">
                <div ng-if="isOpen">
                    <style>
                        label {
                            width: unset !important;
                        }
                    </style>
                    <div>
                        <!-- shoa date ==================== -->
                        <div class="card  border-dark" ng-show="$ctrl.personnelData.hasDate" ng-init="dateTimeMask()">
                            <div class="row">
                                <div class="col-sm-6">
                                    <div>
                                        <div class="input-group">
                                            <label class="input-group-text font-weight-bold">
                                                از تاریخ
                                            </label>
                                            <input ng-model="$ctrl.personnelData.fromDate" ng-change="calculateDate()"
                                                   ng-class="{'border-danger': !$ctrl.personnelData.fromDate}" type="text" autocomplete="off" class="form-control date-picker"
                                                   placeholder="xxxx/xx/xx" id="EditstartDayDate">
                                        </div>
                                    </div>
                                </div>
                                <div class="col-sm-6">
                                    <div class="input-group">
                                        <label class="input-group-text font-weight-bold">
                                            تا تاریخ
                                        </label>
                                        <input ng-model="$ctrl.personnelData.toDate" ng-change="calculateDate()"
                                               ng-class="{'border-danger': !$ctrl.personnelData.toDate && !$ctrl.personnelData.toDateNull}" type="text" autocomplete="off"
                                               class="form-control date-picker" placeholder="xxxx/xx/xx" id="EditendDayDate">
                                    </div>
                                </div>
                                <small class="d-block text-center" style="font-size: 0.7rem;" ng-if="showBigDateError">
                                    <i class="fas fa-calendar text-danger"></i>
                                    <span class="text-danger">تاریخ شروع نمی تواند از تاریخ پایان بزرگتر باشد</span>
                                </small>
                            </div>
                        </div>
                        <div class="accordion" id="demo">
                            <div class="accordion-item">
                                <div id="advanceSearch-collapsep"
                                     class="accordion-collapse collapse"
                                     aria-labelledby="advanceSearch-headingp"
                                     data-parent="#demo">
                                    <div class="accordion-body">
                                        <advance-search search-data="SearchDataItemPersonnel" acardion-heading="advanceSearch-headingp" acardion-target="advanceSearch-collapsep" return-func="returnSearchDataPersonnelFunc(SearchDataItemPersonnel)"></advance-search>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                    <!-- ==================================  table that show personnel data from database ============================ -->
                    <div class="card">
                        <!-- =========================================  table body ======================================== -->
                        <div style="height:300px !important">
                            <table class="newTableStyle">
                                <thead id="table_header">
                                    <tr class="row p-0 m-0">
                                        <th style="width: 5%" class="d-flex justify-content-center align-items-center">
                                            <div class="custom-control custom-checkbox" ng-if="$ctrl.stateSelect == 'check'">
                                                <input type="checkbox" ng-click="checkAll($event)" class="custom-control-input" id="allCheck">
                                                <label class="custom-control-label" for="allCheck"></label>
                                            </div>
                                        </th>
                                        <th style="width: 25%">
                                            نام
                                        </th>
                                        <th style="width: 25%">
                                            نام خانوادگی
                                        </th>
                                        <th style="width: 25%">
                                            شماره مستخدمی
                                        </th>
                                        <th style="width: 20%">
                                            کد پرسنلی
                                        </th>
                                    </tr>

                                    <!-- ......................... top search inputs tr ........................ -->
                                    <tr class="row p-0 m-0">
                                        <th style="width: 5%" class="d-flex justify-content-center align-items-center">
                                            <div class="custom-control custom-checkbox" ng-if="$ctrl.stateSelect == 'check'">
                                                <input type="checkbox" ng-click="checkThisPage($event,tableData.Items)" title="فقط این صفحه" class="custom-control-input" id="MultiCheck">
                                                <label class="custom-control-label" for="MultiCheck"></label>
                                            </div>
                                        </th>
                                        <th style="width: 25%">
                                            <div style="position: relative;">
                                                <span ng-click="clearinputSearch('FirstName')" ng-show="filterChar.FirstName">
                                                <i class="far fa-close text-danger" style="position: absolute;left: 5%;top: 0.5em;cursor: pointer;"
                                                   ></i></span>
                                                <input type="text" style="font-size: 1em !important;" class="form-control" ng-model="filterChar.FirstName"
                                                       ng-keyup="doSearch()">
                                            </div>
                                        </th>
                                        <th style="width: 25%">
                                            <div style="position: relative;">
                                               <span ng-click="clearinputSearch('LastName')" ng-show="filterChar.LastName">
                                                <i class="far fa-close text-danger" style="position: absolute;left: 5%;top: 0.5em;cursor: pointer;"
                                                   ></i></span>
                                                <input type="text" style="font-size: 1em !important;" class="form-control" ng-model="filterChar.LastName"
                                                       ng-keyup="doSearch()">
                                            </div>
                                        </th>
                                        <th style="width: 25%">
                                            <div style="position: relative;">
                                               <span ng-click="clearinputSearch('PersonnelNo')" ng-show="filterChar.PersonnelNo">
                                                <i class="far fa-close text-danger" style="position: absolute;left: 5%;top: 0.5em;cursor: pointer;"
                                                   ></i></span>
                                                <input type="text" style="font-size: 1em !important;" class="form-control" ng-model="filterChar.PersonnelNo"
                                                       ng-keyup="doSearch()">
                                            </div>
                                        </th>
                                        <th style="width: 20%">
                                            <div style="position: relative;">
                                                <span ng-click="clearinputSearch('DossierNo')" ng-show="filterChar.DossierNo">
                                                <i class="far fa-close text-danger" style="position: absolute;left: 5%;top: 0.5em;cursor: pointer;"
                                                   ></i></span>
                                                <input type="text" style="font-size: 1em !important;" class="form-control" ng-model="filterChar.DossierNo"
                                                       ng-keyup="doSearch()">
                                            </div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody id="table_body" class="row w-100 m-0">
                                    <tr ng-if="$ctrl.stateSelect == 'radio'" ng-repeat="personnel in tableData.Items track by personnel.Id" class="row p-0 m-0 w-100 col-12 pointer" ng-click="selectPersonelItem(personnel)">
                                        <td style="width: 5%;padding: 0 !important" class="d-flex justify-content-center align-items-center">
                                            <div class="custom-control custom-radio">
                                                <input name="radioChecked" type="radio" disabled class="custom-control-input" id="R-{{personnel.Id}}">
                                                <label class="custom-control-label" for="R-{{personnel.Id}}"></label>
                                            </div>
                                        </td>
                                        <td style="width: 25%">
                                            {{personnel.FirstName}}
                                        </td>
                                        <td style="width: 25%">
                                            {{personnel.LastName}}
                                        </td>
                                        <td style="width: 25%">
                                            {{personnel.PersonnelNo}}
                                        </td>
                                        <td style="width: 20%">
                                            {{personnel.DossierNo}}
                                        </td>
                                    </tr>
                                    <tr ng-if="$ctrl.stateSelect == 'check'" ng-repeat="personnel in tableData.Items track by personnel.Id" class="row p-0 m-0 w-100 col-12 pointer" ng-click="selectPersonelItem(personnel)">
                                        <td style="width: 5%" class="d-flex justify-content-center align-items-center">
                                            <div class="custom-control custom-checkbox">
                                                <input type="checkbox" disabled ng-checked="checkState(personnel)" class="custom-control-input" id="{{personnel.Id}}">
                                                <label class="custom-control-label" for="{{personnel.Id}}"></label>
                                            </div>
                                        </td>
                                        <td style="width: 25%">
                                            {{personnel.FirstName}}
                                        </td>
                                        <td style="width: 25%">
                                            {{personnel.LastName}}
                                        </td>
                                        <td style="width: 25%">
                                            {{personnel.PersonnelNo}}
                                        </td>
                                        <td style="width: 20%">
                                            {{personnel.DossierNo}}
                                        </td>
                                    </tr>
                                    <tr ng-if="tableData.Items == undefined">
                                        <td colspan="5">
                                            <p class="text-danger text-center">
                                                موردی با این مشخصات پیدا نشد
                                            </p>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- ==================================  table pagination ============================ -->
                    <div class="card not_select">
                        <div class="row">
                            <div class="col" style="text-align: right;">
                                <span ng-click="changePagination(tableData.TotalPages)" style="cursor: pointer;">
                                    <i class="far fa-angle-double-right" style="font-size: 0.7em;"></i>
                                </span>

                              <span ng-click="changePagination(tableData.PageIndex+1)">
                                <i class="far fa-angle-right asp-label" 
                                   style="margin: 0 10px; cursor: pointer; font-size: 0.7em;"></i></span>

                                <input class="form-control text-center" id="pagingD" placeholder="{{tableData.PageIndex}} از  {{tableData.TotalPages}}"
                                       style="width: 30%; display: inline-block; position: relative; top: 0px; font-size: 0.7em;" ng-model="pageNumber"
                                       ng-keyup="changePagination(pageNumber);">

                               <span ng-click="changePagination(tableData.PageIndex-1)">
                                <i class="far fa-angle-left asp-label" 
                                   style="margin: 0 10px; cursor: pointer; font-size: 0.7em;"></i></span>

                                <span ng-click="changePagination(1)" style="cursor: pointer;">
                                    <i class="far fa-angle-double-left asp-label" style="margin-left: -3px; font-size: 0.7em;"></i>
                                </span>

                            </div>
                            <div class="col"></div>

                            <div class="col" style="text-align: left;">
                                <button type="button" class="new-button green collapsed accordion-header" id="advanceSearch-headingp"
                                        type="button"
                                        data-toggle="collapse"
                                        data-target="#advanceSearch-collapsep"
                                        aria-expanded="false"
                                        aria-controls="advanceSearch-collapsep"
                                        ng-click="handleShowAdvancedSearch()">
                                    جستجو پیشرفته
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
            <div class="card ">
                <div class="text-end">
                    <button type="button" class="new-button red" ng-click="CancelAddPersonnel()">
                        <i class="far fa-close"></i>
                        انصراف
                    </button>
                    <button type="button" ng-if="$ctrl.stateSelect == 'check'" class="new-button green" id="confirmBtn" ng-click="confirmAddingPersonnel()" ng-disabled="itemSelectedArr.length == 0"
                            ng-hide="$ctrl.personnelData.hasDate">
                        <i class="far fa-check"></i>
                        تایید
                    </button>

                    <button type="button" ng-if="$ctrl.stateSelect == 'check'" class="new-button green" id="confirmBtn" ng-click="confirmAddingPersonnel()" ng-disabled="
                    itemSelectedArr.length == 0 ||
                    !$ctrl.personnelData.fromDate ||
                    (!$ctrl.personnelData.toDate && !$ctrl.personnelData.toDateNull) ||
                    showBigDateError" ng-show="$ctrl.personnelData.hasDate">
                        <i class="far fa-check"></i>
                        تایید
                    </button>

                </div>
            </div>
        </div>
    </div>
</div>`
});
