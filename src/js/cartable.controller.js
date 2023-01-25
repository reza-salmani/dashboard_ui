app.controller("cartableCtrl", function ($scope, $templateCache,$state, $http, RequestApis, $location, global) {
  //======================= check authorization =============
  $templateCache.remove($state.current.templateUrl);
  $scope.checkValidation = true;
  $scope.checkAuth = function () {
    $scope.loadingPage = true;
    RequestApis.HR(`securities/HR/view/HR_ASSESSMENT`, 'Get', '', '', '', function (response) {
      if (response.status !== 200) {
        // $scope.redirectUrlForUnAuth = '../../views/PermissionWarning.html';
        // $scope.checkValidation = false;
      } else {
        RequestApis.HR(`securities/HR/exec/HR_ASSESSMENT`, 'Get', '', '', '', function (response) {
          if (response.status === 200) {
            $scope.checkValidationOnBtn = true;
          } else {
            $scope.checkValidationOnBtn = false;
          }
        })
      }
      $scope.loadingPage = false;
    })
  }
  $scope.checkAuth();
  //================== initial variable ========================
  $scope.inBox = false;
  $scope.outBox = false;
  $scope.searchInrequest = {};
  $scope.PageSize = 10;
  $scope.PageItem = 1;
  let applications = ["HR", "DASHBOARD", "RC", "DASH", "DRC", "HELPDESK"];
  let appNameFromUrl = window.location.pathname.toString().split("/")[1].toUpperCase();
  let check = applications.some(x => x === appNameFromUrl);
  $scope.checkingExist = function (item) {
    return global.checkExist(item);
  }
  //============= date picker===============
  $scope.maskInput = function () {
    setTimeout(function () {
      $(".date-picker").datepicker({
        dateFormat: "yy/mm/dd",
        changeMonth: true,
        changeYear: true,

      });
      $('.time').clockpicker();
    }, 500)
    $('.time').inputmask({ regex: "(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]", "placeholder": "HH:MM" });
    //validation input setter for working correctly with date & time picker

    $('.date-picker').change(function () {
      angular.element($(this)).triggerHandler('input');
    });
    $('.time').change(function () {
      angular.element($(this)).triggerHandler('input');
    });

  }
  //=============== toast notification =========================
  const Toast = Swal.mixin({
    toast: true,
    position: 'center',
    showConfirmButton: false,
    timer: 2000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer)
      toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
  })
  //=============== remove WhiteSpaces =============================
  Object.defineProperty(String.prototype, "removeWhiteSpaces", {
    value: function removeWhiteSpaces() {
      return this.replace(/\s+/g, '');
    },
    writable: true,
    configurable: true
  });
  //=============== convert num to string =============================
  $scope.convertNumToString = function (date) {
    return data.toString();
  }
  //=============== convert date to shamsi =============================
  $scope.convertToShamsi = function (date) {
    if (date != null) {
      return moment(date, 'YYYY/M/D').format('jYYYY/jMM/jDD');
    } else {
      return "-"
    }
  }
  //=============== convert date to miladi =============================
  $scope.convertToMiladi = function (date) {
    if (date != null) {
      return moment(date, 'jYYYY/jM/jD').format('YYYY-MM-DD');
    } else {
      return "-"
    }
  }
  //====================================================================
  $scope.initFunc = function () {
    global.urlInfo(function (data) {
      $scope.currentUserId = data.UserId;
      RequestApis.HR(`personnel/user/${$scope.currentUserId}/current`, 'Get', '', '', '', function (response) {
        if (response.status === 200) {
          $scope.personel = response.data;
          $scope.getCartablelist()
        }
      })
    })
  }
  $scope.initFunc();
  $scope.tags = [];
  $scope.getCartablelist = function () {
    RequestApis.HR("cartables/tags", 'Get', '', '', '', function (response) {
      if (response.status == 404) {
        $scope.tags = [];
      } else {
        $scope.tags = response.data
      }
      $scope.currentCat = "cartables";
      RequestApis.HR("cartables", 'Get', '', '', '', function (response) {
        if (response.status == 404) {
          Toast.fire({
            icon: 'warning',
            title: 'مورد برای نمایش وجود ندارد.'
          })
        } else {
          $scope.cartableList = response.data;
        }
      })
    })
  }
  $scope.clickRequrstBtn = function () {
    $scope.requestItems = !$scope.requestItems;
    $('#requestItemsId').fadeToggle();
  }
  $scope.selectedRequestApis = [];
  $scope.addToSelectedList = function (item) {
    if (item.selected) {
      if (!$scope.selectedRequestApis.some(x => x.Id === item.Id)) {
        $scope.selectedRequestApis.push(item)
      }
    } else {
      $scope.selectedRequestApis = $scope.selectedRequestApis.filter(x => x.Id !== item.Id);
    }
  }
  $scope.setAsRead = function (items) {

    Object.values(items).forEach(value => {
      RequestApis.HR('cartables/request/' + item.Request.Id + '/seen', 'Post', '', '', '', function (response) {
      })
      value.Seen = true;
      value.selected = false;
    })
    $scope.selectAll = false;
    $scope.selectedRequestApis = [];
  }
  $scope.setAll = function () {
    if ($scope.searchInrequest.selectAll) {
      $scope.searchInrequest.selectAll = false;
      Object.values($scope.cartableList.Items).forEach(value => {
        value.selected = false;
      })
      $scope.selectedRequestApis = []
    } else {
      $scope.searchInrequest.selectAll = true;
      Object.values($scope.cartableList.Items).forEach(value => {
        value.selected = true;
        $scope.selectedRequestApis.push(value);
      })
    }
  }
  $scope.addNewTag = function () {
    $("#createTagModal").modal()
  }
  $scope.cancelCreateTag = function () {
    $("#createTagModal").modal("hide")
  }
  $scope.confirmCreateTag = function (title) {
    var itemToSend = {
      Tag: title,
      Colro: 0
    }
    RequestApis.HR("cartables/tags", 'Post', '', '', itemToSend, function (response) {
      RequestApis.HR("cartables/tags", 'Get', '', '', '', function (response1) {
        $scope.tags = response1.data;
      })
    })
    $("#createTagModal").modal("hide")
  }
  $scope.editingStateFromCartable = false;
  //========== go to assessment period page from cartable ==============
  $scope.setPage = function (item) {
    if ($scope.itemToSetCat != "tracking") {

      if (item.Request.AdditionalInfo != null) {
        var test = Object.keys(JSON.parse(item.Request.AdditionalInfo))

        var element = JSON.parse(item.Request.AdditionalInfo)
        var addingPath = "?" + test[0] + "=" + element[test[0]]
        for (var i = 1; i < test.length; i++) {
          addingPath = addingPath + "&" + test[i] + "=" + element[test[i]]
        }

      } else {
        var test = Object.keys(JSON.parse(item.ParentRequest.AdditionalInfo))
        var element = JSON.parse(item.ParentRequest.AdditionalInfo)
        var addingPath = "?" + test[0] + "=" + element[test[0]]
        for (var i = 1; i < test.length; i++) {
          addingPath = addingPath + "&" + test[i] + "=" + element[test[i]]
        }
      }
      localStorage.setItem('enableEditing', "true");
      addingPath = addingPath + "&requestId=" + item.Request.Id + "&stateBox=" + $scope.itemToSetCat + "&behalfId=" + item.BehalfUserId
      $scope.pageLoaded = true;
      RequestApis.HR('cartables/request/' + item.Request.Id + '/seen', 'Post', '', '', '', function (response) {
      })
      setTimeout(function () {
        // document.getElementById('pageIframe').src = window.location.protocol + "//" + item.SecurityForms[0].Url + addingPath;
        // $scope.pagesItem = ""
        //$("#pageIframe").attr("src", item.SecurityForms[0].Url + addingPath)
      }, 100)

    }
  }
  $scope.backToMainPage = function () {
    $scope.pageLoaded = false;
    $scope.setCartableList($scope.itemToSetCat);
  }
  $scope.deleteTag = function (item) {
    $scope.tagForDelete = item;
    $("#tagDeleteConfirm").modal();
  }
  $scope.cancelDeleteTag = function () {
    $("#tagDeleteConfirm").modal("hide");
  }
  $scope.confirmDeleteTag = function () {
    RequestApis.HR('cartables/tags', 'Delete', '', '', $scope.tagForDelete, function (trash) {
      $("#tagDeleteConfirm").modal("hide");
      RequestApis.HR('cartables/tags', 'Get', '', '', '', function (response1) {
        $scope.tags = response1.data;
      })
    })
  }
  $scope.editTag = function (item) {
    $scope.editTagItem = item;
    $("#editTagModal").modal();
  }
  $scope.cancelEditTag = function () {
    $("#editTagModal").modal("hide");
  }
  $scope.confirmEditTag = function (newTitle) {
    var itemToSend = {
      Id: $scope.editTagItem.Id,
      RowVersion: $scope.editTagItem.RowVersion,
      Tag: newTitle
    }
    RequestApis.HR('cartables/tags', 'Patch', '', '', itemToSend, function (response) {
      $("#editTagModal").modal("hide");
      RequestApis.HR('cartables/tags', 'Get', '', '', '', function (response1) {
        $scope.tags = response1.data;
      })
    })
  }
  $scope.changeStateOfFilterItem = function (item) {
    $scope.loadingSearchInrequest = true;
    $scope.filterItem = item;
    $scope.getCartableListPagination();
    $scope.loadingSearchInrequest = false;
  }
  $scope.setCartableList = function (boxState) {
    $scope.searchInrequest = {};
    $scope.cartableList = null;
    $(".cat-li").removeClass("selected-cat");
    $scope.pageLoaded = false;
    $("#" + boxState).addClass("selected-cat");
    $scope.filterItem = undefined;
    $scope.PageSize = 10;
    $scope.PageItem = 1;
    $scope.currentState = '';
    switch (boxState) {
      case "inbox":
        $scope.itemToSetCat = 'inbox';
        $scope.currentCat = "cartables";
        $scope.currentState = "&cur=1";

        break;
      case "outbox":
        $scope.itemToSetCat = 'outbox';
        $scope.currentCat = "cartables/my"
        break;
      case "tracking":
        $scope.itemToSetCat = 'tracking';
        $scope.currentCat = "cartables/track"
        $scope.currentState = "&cur=1";
        break;
      default:
    }
    $scope.filterItems = [];
    RequestApis.HR(`${$scope.currentCat}/workflow`, 'Get', 'text/json', '', '', function (response) {
      $scope.filterItems = response.data;

    })
    $scope.getCartableListPagination();
  }
  $scope.showProccess = function (requestId) {
    RequestApis.HR(`workflows/request/${requestId}/flow`, 'get', '', '', '', function (response) {
      if (response.status === 200) {
        $scope.proccessData = response.data
        $('#showProccessModal_' + requestId).modal();
      }
    })
  }
  $scope.reloadBox = function () {
    $scope.setCartableList($scope.itemToSetCat);
  }
  $scope.getCartableListPagination = function () {
    let filterItemx = "";
    if ($scope.filterItem != undefined) {
      if ($scope.filterItem.itemX != undefined) {
        filterItemx += `&wf=${$scope.filterItem.itemX}`;
      }
      if ($scope.filterItem.requestTitle != undefined && $scope.filterItem.requestTitle != "") {
        filterItemx += `&rqt=${$scope.filterItem.requestTitle}`;
      }
      if ($scope.filterItem.requestNomber != undefined && $scope.filterItem.requestNomber != "") {
        filterItemx += `&rqn=${$scope.filterItem.requestNomber}`;
      }
      if ($scope.filterItem.fromDateInRequests != undefined && $scope.filterItem.fromDateInRequests != "") {
        filterItemx += `&sd=${$scope.filterItem.fromDateInRequests}`;
      }
      if ($scope.filterItem.toDateInRequests != undefined && $scope.filterItem.toDateInRequests != "") {
        filterItemx += `&fd=${$scope.filterItem.toDateInRequests}`;
      }
    }
    RequestApis.HR(`${$scope.currentCat}?ps=${$scope.PageSize}&pn=${$scope.PageItem}${$scope.currentState}${filterItemx}`, 'Get', 'text/json', '', '', function (response) {
      if (response.status === 200) {
        $scope.setAsRead = false;
        $scope.cartableList = null;
        $scope.cartableList = response.data;
        $scope.Unseen = 0;
        Object.values(response.data.Items).forEach(x => {
          if (!x.Seen) {
            ++$scope.Unseen
          }
        })
        $scope.setAsRead = $scope.Unseen === response.data.Items.length;

      } else {
        $scope.cartableList = [];
        if (response.status === 404) {
          Toast.fire({
            icon: 'warning',
            title: 'مورد جدیدی برای نمایش وجود ندارد.'
          })
        } else {
          Toast.fire({
            icon: 'warning',
            title: 'بارگذاری اطلاعات با خطا مواجه شد'
          })
        }
      }
    })

  }

  $scope.changePageCartable = function (item) {
    if ($scope.cartableList.PageIndex <= $scope.cartableList.TotalPages && item >= 1 && $scope.cartableList.TotalPages >= item) {
      $scope.PageItem = Number(item);
      $scope.getCartableListPagination()
    }
  }
  $scope.changePageSize = function (item) {
    $scope.PageSize = Number(item);
    $scope.getCartableListPagination();
  }
  $scope.setAsReadFunc = function (items) {
    i = 1;
    Object.values(items).forEach(x => {
      RequestApis.HR(`cartables/request/${x.RequestId}/seen`, 'Post', '', '', {}, function (response) {
        if (response.status === 200) {
          if (i === items.length) {
            $scope.setAsRead = true;
            $scope.reloadBox();
          }
          ++i;
        }
      })
    })
  }
  $scope.setAsUnReadFunc = function (items) {
    i = 1;
    Object.values(items).forEach(x => {
      RequestApis.HR(`cartables/request/${x.RequestId}/unseen`, 'Post', '', '', {}, function (response) {
        if (response.status === 200) {
          if (i === items.length) {
            $scope.setAsRead = false;
            $scope.reloadBox();
          }
          ++i;
        }
      })
    })

  }
  $scope.GetNotes = function (requestId, page = null) {
    $scope.RequestIdForNote = requestId;
    if (page != null) {
      RequestApis.HR('workflows/request/' + requestId + '/notes?ps=3&pn=' + page, 'Get', '', '', '', function (responseNote) {
        $scope.Notes = responseNote.data;
        $('#shownotesModal').modal();
      })
    } else {
      RequestApis.HR('workflows/request/' + requestId + '/notes?ps=3&pn=1', 'Get', '', '', '', function (responseNote) {
        $scope.Notes = responseNote.data;
        $('#shownotesModal').modal();
      })
    }
    $scope.unseenNoteAll = [];
    $scope.unseenNote = 0;
  }

  $scope.paginngForNotes = function (method) {
    if (method == 1) {
      if (!$scope.Notes.LastPage) {
        $scope.GetNotes($scope.RequestIdForNote, Number($scope.Notes.PageIndex) + 1);
      }
    } else if (method == -1) {
      if ($scope.Notes.PageIndex > 1) {
        $scope.GetNotes($scope.RequestIdForNote, Number($scope.Notes.PageIndex) - 1);
      }
    } else if (method == "first") {
      $scope.GetNotes(1);
    } else {
      $scope.GetNotes($scope.RequestIdForNote, $scope.Notes.TotalPages);
    }
  }
  $scope.changePaginngForNotes = function (event, page) {
    if (event.keyCode == 13) {
      if (page <= $scope.Notes.TotalPages && page >= 1) {
        $scope.GetNotes($scope.RequestIdForNote, page);
      } else {
        $("#paging").val("");
      }
    }
  }
  $scope.leaveNotes = function () {
    $scope.Notes = [];
    $('#shownotesModal').modal('hide');
  }

  $scope.GetMyNotes = function (requestId, page = null) {
    $scope.RequestIdForMyNote = requestId;
    if (page != null) {
      RequestApis.HR('cartables/request/' + requestId + '/personal/notes/', 'Get', '', '', '', function (responseNote) {
        $scope.MyNotes = responseNote.data;
        $('#showMyNotesModal').modal();
      })
    } else {
      RequestApis.HR('cartables/request/' + requestId + '/personal/notes/', 'Get', '', '', '', function (responseNote) {
        $scope.MyNotes = responseNote.data;
        $('#showMyNotesModal').modal();
      })
    }
  }

  $scope.paginngForMyNotes = function (method) {
    if (method == 1) {
      if (!$scope.Notes.LastPage) {
        $scope.GetMyNotes($scope.RequestIdForMyNote, Number($scope.Notes.PageIndex) + 1);
      }
    } else if (method == -1) {
      if ($scope.Notes.PageIndex > 1) {
        $scope.GetMyNotes($scope.RequestIdForMyNote, Number($scope.Notes.PageIndex) - 1);
      }
    } else if (method == "first") {
      $scope.GetNotes(1);
    } else {
      $scope.GetMyNotes($scope.RequestIdForMyNote, $scope.Notes.TotalPages);
    }
  }
  $scope.changePaginngForMyNotes = function (event, page) {
    if (event.keyCode == 13) {
      if (page <= $scope.Notes.TotalPages && page >= 1) {
        $scope.GetNotes($scope.RequestIdForMyNote, page);
      } else {
        $("#paging").val("");
      }
    }
  }
  $scope.leaveMyNotes = function () {
    $scope.MyNotes = [];
    $('#showMyNotesModal').modal('hide');
  }
  $scope.leaveCreateMyNotes = function () {
    $('#showCreateMyNotesModal').modal('hide');
    $scope.createTextMyNote = "";
  }
  $scope.showMyNode = function () {
    $('#showCreateMyNotesModal').modal();
    $scope.createTextMyNote = "";
  }
  $scope.createMyNode = function (requestId, text) {
    RequestApis.HR('cartables/request/' + requestId + '/personal/notes/', 'Post', '', '', `"${text}"`, function (responseNote) {
      $scope.leaveCreateMyNotes();
      $scope.GetMyNotes(requestId);
    });
  }
  $scope.postDataWithCridential = function (route, data, callback) {
    $http({
      "url": $scope.path + route,
      "method": "POST",
      "Content-Type": "text/json;",
      "data": data
    })
      .then(function (response) {
        callback(response);
      })
      .catch(function (xhr) {
        callback("error")
      })
  }
  $scope.ChangeToSeen = function (item) {
    RequestApis.HR("workflows/request/notes/mark/read ", 'Post', '', '', [item.Id], function (response) { })
  }
  $scope.goToPage = function (item) {
    $scope.requestItems = false;
    $("#pageIframe").parent().removeClass('card');
    $(".cat-li").removeClass("selected-cat");
    $("#" + item).addClass("selected-cat");
    switch (item) {
      case "mission":
        $scope.pageLoaded = true;
        $scope.pagesItem = `../../views/Cartable/RequestPages/Mission.html?v=${Date.now()}`;
        break;
      case "vacation":
        $scope.pageLoaded = true;
        $scope.pagesItem = `../../views/Cartable/RequestPages/Vacation.html?v=${Date.now()}`
        break;
      case "traffic":
        $scope.pageLoaded = true;
        $scope.pagesItem = `../../views/Cartable/RequestPages/Traffic.html?v=${Date.now()}`
        break;
      case "assessment":
        $scope.pageLoaded = true;
        $scope.pagesItem = `../../views/Assessment/Assessment.html?v=${Date.now()}`
        break;
      default:
    }
  }
  $scope.getDataWithCookie = function () {
    if (window.location.toString().split("?").length != 1) {
      var search = window.location.search.substring(1);
      $scope.urlsearch = JSON.parse('{"' + decodeURI(search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"') + '"}')
      $scope.setCartableList($scope.urlsearch.data);
    } else {
      $scope.setCartableList('inbox');
    }
  }
  $scope.getDataWithCookie();

  //==================== log out =================================
  $scope.logOut = function () {
    document.cookie = '.ASPXAUTH' + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/';
    document.cookie = 'ASP.NET_SessionId' + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/';
    window.location.href = check ? `${window.origin}/${window.location.pathname.toString().split("/")[1]}/login/Login.aspx` : `${window.origin}/login/Login.aspx`;
  }
  $scope.goToPageX = function (item) {
    if (item === "dashboard") {
      check ? `${window.origin}/${window.location.pathname.toString().split("/")[1]}/api/` : `${window.origin}/api/`
      window.location.href = check ? `${window.origin}/${window.location.pathname.toString().split("/")[1]}/Default.aspx` : `${window.origin}/Default.aspx`;
    }
  }
});
app.controller("missionRequestCtrl", function ($scope, $templateCache, $state, RequestApis, $timeout, $location, global) {
  $templateCache.remove($state.current.templateUrl);
  //=========== initial variable ===========
  this.$onInit = function () {
    $scope.getDataUrlParams();
    $scope.getPersonnelInfo();
    $scope.IsLimited = false;
    $scope.changeType(2);
  }
  let applications = ["HR", "DASHBOARD", "RC", "DASH", "DRC", "HELPDESK"];
  let appNameFromUrl = window.location.pathname.toString().split("/")[1].toUpperCase();
  let check = applications.some(x => x === appNameFromUrl);
  $scope.DetailsHourMode = false;
  $scope.DetailsDayMode = false;
  $scope.CheckStateDay = false;
  $scope.CheckState = false;
  $scope.dayMistion = false;
  $scope.SubmitOccured = false;
  $scope.buttonsArrayShow = false;
  $scope.buttonsArrayShowDay = false;
  $scope.showAutoCompleteSubjectMission = false;
  $scope.createHourMissionData = {};
  $scope.getPersonnelInfo = function () {
    global.urlInfo(function (data) {
      $scope.currentUserId = data.UserId;
      RequestApis.HR(`personnel/user/${$scope.currentUserId}/current`, 'Get', '', '', '', function (response) {
        if (response.status === 200) {
          $scope.PersonnelInfo = response.data;
        }
      })
    })
  }
  $scope.createDayMissionData = {}
  $scope.finalRequest = false;
  $scope.showChart = false;
  $scope.showLocation = false;
  $scope.getDataUrlParams = function () {
    global.urlInfo(function (data) {
      if(global.checkExist(data.UrlParams)){
        if (data.UrlParams.hourMissionId !== undefined) {
          $scope.checkStatus($scope.urlsearch);
        }
        if (data.UrlParams.DayMissionFormId !== undefined) {
          $scope.checkStatusDay($scope.urlsearch);
        }
      }
    })
  }
  $scope.checkStatusDay = function (items) {
    RequestApis.HR("workflows/request/" + items.requestId + "/status/", 'Get', '', '', '', function (response1) {
      if (items.stateBox === "outbox" && response1.status == 404) {
        $scope.CheckStateDay = false;
        $scope.dayMistion = false;
        $scope.DetailsDayMode = true;
        $scope.buttonsArrayDay = [];
        $scope.getDetailsForManagerAcceptionDay(items.DayMissionFormId)
      } else if (response1.status === 200) {
        $scope.formInformation = response1.data[0];
        RequestApis.HR("workflows/state/" + $scope.formInformation.StateId + "/actions", 'Get', '', '', '', function (response2) {
          if (response2.status == 200) {
            if (items.stateBox === "inbox") {
              $scope.CheckStateDay = true;
              $scope.buttonsArrayDay = response2.data;
            } else {
              $scope.CheckStateDay = false;
              $scope.buttonsArrayDay = [];
            }
          }
          $scope.getDetailsForManagerAcceptionDay(items.DayMissionFormId)
          $scope.buttonsArrayShowDay = true;
          $scope.finalRequest = true;
        })
      }
    })
  }
  $scope.checkStatus = function (items) {
    RequestApis.HR(`workflows/request/${items.requestId}/status/`, 'Get', '', '', '', function (response1) {
      if (items.stateBox === "outbox" && response1.status == 404) {
        $scope.CheckState = false;
        $scope.hourMistion = false;
        $scope.DetailsHourMode = true;
        $scope.buttonsArray = [];
        $scope.getDetailsForManagerAcception(items.hourMissionId);
      } else if (response1.status === 200) {

        $scope.formInformationMIssionH = response1.data[0];

        RequestApis.HR("workflows/state/" + $scope.formInformationMIssionH.StateId + "/actions", 'Get', '', '', '', function (response2) {
          if (response2.status == 200) {
            if (items.stateBox === "inbox") {
              $scope.CheckState = true;
              $scope.buttonsArray = response2.data;
            } else {
              $scope.CheckState = false;
              $scope.buttonsArray = [];
            }
          }
          $scope.getDetailsForManagerAcception(items.hourMissionId);
          $scope.buttonsArrayShow = true;
          $scope.finalRequest = true;
        })
      }
    })
  }

  $scope.checkLimitation = function (item) {
    $scope.IsLimited = false;
    RequestApis.RC(`PersonLeave/CheckRequestTimeLimit?fromDate=${$scope.convertToMiladi(item)}`, 'Get', '', '', function (response) {
      if (response.data.data.isLimit) {
        Toast.fire({
          icon: "error",
          title: response.data.data.message
        });
        if (response.data.data.limitType) {
          $scope.IsLimited = true;
        }
      }
    })
  }
  //========== toast notification ==========
  const Toast = Swal.mixin({
    toast: true,
    position: 'center',
    showConfirmButton: false,
    timer: 2000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer)
      toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
  })

  //========== remove WhiteSpaces ==========
  Object.defineProperty(String.prototype, "removeWhiteSpaces", {
    value: function removeWhiteSpaces() {
      return this.replace(/\s+/g, '');
    },
    writable: true,
    configurable: true
  });

  //========= convert num to string ========
  $scope.convertNumToString = function (date) {
    return data.toString();
  }

  //===== convert date to shamsi ===========
  $scope.convertToShamsi = function (date) {
    if (date != null) {
      return moment(date, 'YYYY/M/D').format('jYYYY/jMM/jDD');
    } else {
      return "-"
    }
  }

  //====== convert date to miladi ==========
  $scope.convertToMiladi = function (date) {
    if (date != null) {
      return moment(date, 'jYYYY/jM/jD').format('YYYY-MM-DD');
    } else {
      return "-"
    }
  }

  //======= Get days from to Date ==========
  $scope.getDiffDayFOrMission = function (dateFrom, DateTo) {
    var datefrom = new Date(dateFrom.toString().split('T')[0]);
    var dateto = new Date(DateTo.toString().split('T')[0]);
    let Diff_In_Time = dateto.getTime() - datefrom.getTime();
    let Diff_In_Days = Diff_In_Time / (1000 * 3600 * 24);
    return Diff_In_Days + 1;
  }

  //============= date picker===============
  $scope.maskInput = function () {
    setTimeout(function () {
      $(".date-picker").datepicker({
        dateFormat: "yy/mm/dd",
        changeMonth: true,
        changeYear: true,

      });
      $('.time').clockpicker();
    }, 500)
    $('.time').inputmask({ regex: "(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]", "placeholder": "HH:MM" });
    //validation input setter for working correctly with date & time picker

    $('.date-picker').change(function () {
      angular.element($(this)).triggerHandler('input');
    });
    $('.time').change(function () {
      angular.element($(this)).triggerHandler('input');
    });

  }

  $scope.handleSelectHourToUse = function (id) {
    let resValue = $(`#selectHourToUse${id}`).val()
    if (resValue) {
      let hourTagId = resValue.split("-")[0];
      let hourValue = resValue.split("-")[1];
      hourValue = hourValue.split(":")[0] + ":" + hourValue.split(":")[1];
      $scope.selectedHours[hourTagId] = `selectHourToUse${id}`
      if (hourTagId == 'fromTime') {
        $scope.createHourMissionData.fromTime = hourValue
      } else {
        $scope.createHourMissionData.toTime = hourValue
      }
      $(`#${hourTagId}`).val(hourValue);
    }
  }
  //======== auto complete search ==========
  $scope.editHourMissionData = {}

  //---------- residence -----------
  $scope.AutoCompleteSearchResidence = function (item) {
    if (item != undefined && item.length != 0) {
      RequestApis.RC('Search/GetAutoComplete/ResidenceAC/' + item, 'Get', '', 'json', function (response) {
        if (response.data.success === true) {
          if (response.data.data.length) {
            $scope.showAutoCompleteResidence = true;
            $scope.wordListResidence = response.data.data;
          } else {
            $scope.wordListResidence = [];
          }
        }
      })
    } else {
      RequestApis.RC('Search/GetAutoComplete/ResidenceAC/ ', 'Get', '', 'json', function (response) {
        if (response.data.success === true) {
          if (response.data.data.length) {
            $scope.showAutoCompleteResidence = true;
            $scope.wordListResidence = response.data.data;
          } else {
            $scope.wordListResidence = [];
          }
        }
      })
    }
  }
  $scope.AutoCompleteSearchCreateResidence = function (item) {
    if (item != undefined && item.length != 0) {
      let same = false;
      Object.values($scope.wordListResidence).forEach(value => {
        if (value.description == item) {
          same = true;
        }
      })
      if (!same) {
        RequestApis.RC('Search/InsertAutoComplete?autoCompleteName=ResidenceAC&str=' + item, 'Post', '', 'json', function (response) {
          $scope.showAutoCompleteResidence = false;
        })
      }
    } else {
      $timeout(function () { $scope.showAutoCompleteResidence = false; }, 150)
    }
  }
  $scope.selectPredictResidence = function (item) {
    $scope.createDayMissionData.residence = item
    $scope.showAutoCompleteResidence = false;
  }

  //----------- location -----------
  $scope.AutoCompleteSearchlocation = function (item) {
    if (item != undefined && item.length != 0) {
      RequestApis.RC('Search/GetAutoComplete/missionLocation/' + item, 'Get', '', 'json', function (response) {
        if (response.data.success === true) {
          if (response.data.data.length) {
            $scope.showAutoCompletelocation = true;
            $scope.wordListLocation = response.data.data;
          } else {
            $scope.wordListLocation = [];
          }
        }
      })
    } else {
      RequestApis.RC('Search/GetAutoComplete/missionLocation/ ', 'Get', '', 'json', function (response) {
        if (response.data.success === true) {
          if (response.data.data.length) {
            $scope.showAutoCompletelocation = true;
            $scope.wordListLocation = response.data.data;
          } else {
            $scope.wordListLocation = [];
          }
        }
      })
    }
  }
  $scope.AutoCompleteSearchCreatelocation = function (item) {
    if (item != undefined && item.length != 0) {
      let same = false;
      Object.values($scope.wordListSubjectMission).forEach(value => {
        if (value.description == item) {
          same = true;
        }
      })
      if (!same) {
        RequestApis.RC('Search/InsertAutoComplete?autoCompleteName=missionLocation&str=' + item, 'Post', '', 'json', function (response) {
          $scope.showAutoCompleteSubjectMission = false;
        })
      }
    } else {
      $timeout(function () { $scope.showAutoCompleteSubjectMission = false; }, 150)
    }
  }
  $scope.selectPredictlocationH = function (item) {
    $scope.createHourMissionData.missionLocation = item
    $scope.showAutoCompletelocation = false;
  }
  $scope.selectPredictlocation = function (item) {
    $scope.createDayMissionData.missionLocation = item
    $scope.showAutoCompletelocation = false;
  }

  //--------- subject mission ------
  $scope.AutoCompleteSearchSubjectMission = function (item) {
    if (item != undefined && item.length != 0) {
      RequestApis.RC('Search/GetAutoComplete/SubjectMissionAC/' + item, 'Get', '', 'json', function (response) {
        if (response.data.success === true) {
          if (response.data.data.length) {
            $scope.showAutoCompleteSubjectMission = true;
            $scope.wordListSubjectMission = response.data.data;
          } else {
            $scope.wordListSubjectMission = [];
          }
        }
      })
    } else {
      RequestApis.RC('Search/GetAutoComplete/SubjectMissionAC/ ', 'Get', '', 'json', function (response) {
        if (response.data.success === true) {
          if (response.data.data.length) {
            $scope.showAutoCompleteSubjectMission = true;
            $scope.wordListSubjectMission = response.data.data;
          } else {
            $scope.wordListSubjectMission = [];
          }
        }
      })
    }
  }
  $scope.AutoCompleteSearchCreateSubjectMission = function (item) {
    if (item != undefined && item.length != 0) {
      let same = false;
      Object.values($scope.wordListSubjectMission).forEach(value => {
        if (value.description == item) {
          same = true;
        }
      })
      if (!same) {
        RequestApis.RC('Search/InsertAutoComplete?autoCompleteName=SubjectMissionAC&str=' + item, 'Post', '', 'json', function (response) {
          $scope.showAutoCompleteSubjectMission = false;
        })
      }
    } else {
      $timeout(function () { $scope.showAutoCompleteSubjectMission = false; }, 150)
    }
  }
  $scope.selectPredictSubjectMissionH = function (item) {
    $scope.createHourMissionData.subjectMission = item
    $scope.editHourMissionData.subjectMission = item
    $scope.showAutoCompleteSubjectMission = false;
  }
  $scope.selectPredictSubjectMission = function (item) {
    $scope.createDayMissionData.subjectMission = item
    $scope.showAutoCompleteSubjectMission = false;
  }

  //=========== type of mission ===============
  $scope.getTypeOfMission = function () {
    //$scope.item = {
    //    pageNumber: 1,
    //    pageSize: 10,
    //    sortField: null,
    //    sortAsc: true,
    //    fillNestedClass: true,
    //    searchList: []
    //}
    let item = {
      "filter": "",
      "orderBy": ""
    }
    RequestApis.RC('DayMissionType/GetLookUp', 'Post', item, 'json', function (response) {
      if (response.status == 200) {
        $scope.selectgroupMissionType = response.data.data;
        $scope.selectgroupMissionType.splice(1, 1);
      } else {
        Toast.fire({
          icon: 'error',
          title: response.data.errorMessages ?? 'عملیات با خطا مواجه شد'
        })
      }

    })
  }
  //============ vehicle list =================
  $scope.getVehicleType = function () {
    RequestApis.RC('api/Constants/enum/VehicleType', 'Get', '', 'json', function (response) {
      $scope.vehicleTypesList = response.data;
    })
  }
  //============= get unit ================
  $scope.useSelectedChart = function (data) {
    $scope.selectedUnit = data;
  }
  $scope.dataunit = {
    data: {},
    status: true
  }
  $scope.useSelectedChart = function () {
    if ($scope.dataunit.status === false) {
      $scope.showChartFunc();
      $scope.createDayMissionData.chartTreeIDName = $scope.dataunit.data.Title;
      $scope.createDayMissionData.chartTreeID = $scope.dataunit.data.Id;
    }
  }
  $scope.showChartFunc = function () {
    $scope.showChart = $scope.showChart === false
  }
  $scope.clearChart = function () {
    $scope.createDayMissionData.chartTreeIDName = "";
    $scope.createDayMissionData.chartTreeID = "";
    $scope.showChart = true;
  }
  //============= get location ================
  $scope.data = {
    data: {},
    status: true
  };
  $scope.useSelectedLocation = function () {
    if ($scope.data.status === false) {
      $scope.showLocationFunc();
      $scope.createDayMissionData.locationName = $scope.data.data.Name;
      $scope.createDayMissionData.locationID = $scope.data.data.Id;
    }
  }
  $scope.cleanLocation = function () {
    $scope.createDayMissionData.locationName = "";
    $scope.createDayMissionData.locationID = "";
    $scope.showLocation = true;
  }
  $scope.showLocationFunc = function () {
    $scope.showLocation = $scope.showLocation === false
  }
  //======== change type of mission ========
  $scope.changeType = function (item) {
    $scope.dayMistion = false;
    $scope.hourMistion = false;
    if (item == 1) {
      $scope.hourMistion = true;
    }
    if (item == 2) {
      $scope.dayMistion = true;
      $scope.getVehicleType();
      $scope.getTypeOfMission();
    }
  }

  //****************************************************************************
  //**************** submit and start workflow for mission hour ****************
  //****************************************************************************
  //========== submit and start workflow for mission hour ==============
  $scope.request = function (item) {
    $scope.loadingRequestHourM = true;
    let createHourMissionData = {
      personId: parseInt($scope.PersonnelInfo.Id),
      personName: $scope.PersonnelInfo.PoliteName,
      dossierNo: $scope.PersonnelInfo.DossierNo,
      personnelNo: $scope.PersonnelInfo.PersonnelNo,
      nationalCode: $scope.PersonnelInfo.NationalCode,
      missionDate: $scope.convertToMiladi(item.missionDate),
      fromTime: item.fromTime.removeWhiteSpaces() + ":00",
      toTime: item.toTime.removeWhiteSpaces() + ":00",
      hourMissionStateId: 0,
      hourMissionStateTitle: "درخواست",
      subjectMission: item.subjectMission,
      missionLocation: item.missionLocation,
      description: item.description,
      requesterId: Number($scope.currentUserId)
    };
    RequestApis.RC('HourMission/UpsertHourMissionBatch', 'Post', [createHourMissionData], 'json', function (response) {
      if (response.data.success == true) {
        let parentHourId = response.data.data[0].Id;
        $scope.parentHourId = response.data.data[0].Id;
        let ParentResponse = response.data.data[0];
        RequestApis.HR("securities/form/code?seccd=RC_HOURM", 'get', '', '', '', function (response) {
          $scope.currentLevel = response.data;
          RequestApis.HR("workflows/form/" + $scope.currentLevel.Id, 'get', '', '', '', function (subResponse) {
            let requestItem = {
              "parentId": null,
              "personnelId": parseInt($scope.PersonnelInfo.Id),
              "rootId": null,
              "workflowId": subResponse.data[0].Id,
              "initialDate": moment().format('YYYY-MM-DD'),
              "requesterUserId": Number($scope.currentUserId),
              "statusTypeIdentity": 1,
              "isDone": false,
              "hasChildren": false,
              "title": "درخواست مأموریت ساعتی " + $scope.PersonnelInfo.PoliteName,
              "requestNo": "RC_HOURM",
              "comment": "",
              "additionalInfo": JSON.stringify(
                {
                  personnelId: $scope.PersonnelInfo.Id,
                  userId: $scope.currentUserId,
                  title: "درخواست مأموریت ساعتی " + $scope.PersonnelInfo.PoliteName,
                  hourMissionId: parentHourId
                }),
              "requestTypeIdentity": subResponse.data[0].Id,
              "createdBy": Number($scope.currentUserId),
              "createdAt": moment().format('YYYY-MM-DD')
            }
            RequestApis.RC('Request/CreateRequest/' + $scope.PersonnelInfo.Id, 'Post', requestItem, 'json', function (response) {
              if (response.data.success == true) {
                $scope.SubmitOccured = true;
                $scope.loadingRequestHourM = false;
                $scope.dynamicBtns(ParentResponse, response.data.data);
              }
            })
          })
        })

      } else {
        if (response.data.errorMessages != undefined) {
          if (response.data.errorMessages[0].trim() === "HASOVERLAP") {
            Toast.fire({
              icon: "error",
              title: "تداخل زمانی وجود دارد لطفا تاریخ را بررسی نمایید",
            });
          } else if (response.data.errorMessages[0].trim() === "ISCLOSEDDAY") {
            Toast.fire({
              icon: "error",
              title: "شما به دلیل بسته شدن محاسبه کارکردتان در تاریخ انتخابی امکان ثبت مأموریت را ندارید",
            });
            $scope.showClosedList(response.data);
          } else if (response.data.errorMessages[0].trim() === "HasOverlapDailyMission") {
            Toast.fire({
              icon: "error",
              title: "شما قبلا مأموریت روزانه در یکی از روزهای این بازه تاریخی انتخابیتان، ثبت نموده اید",
            });
          } else if (response.data.errorMessages[0].trim() === "HasOverlapDailyLeave") {
            Toast.fire({
              icon: "error",
              title: "شما قبلا مرخصی روزانه در یکی از روزهای این بازه تاریخی انتخابیتان، ثبت نموده اید",
            });
          } else if (response.data.errorMessages[0].trim() === "HasOverlapHourLeave") {
            Toast.fire({
              icon: "error",
              title: "شما قبلا مرخصی ساعتی در یکی از روزهای این بازه تاریخی انتخابیتان، ثبت نموده اید",
            });
          } else {
            Toast.fire({
              icon: "error",
              title: response.data.errorMessages[0] ?? "عملیات با خطا مواجه شد",
            });
          }

        }
      }
    })
  }
  $scope.dynamicBtns = function (items, requestId) {
    $scope.returnDataFromCreateApi = items;
    $scope.requestId = requestId;
    RequestApis.HR("workflows/request/" + requestId + "/status/", 'Get', '', '', '', function (response1) {
      $scope.formInformationMIssionH = response1.data[0];
      RequestApis.HR("workflows/state/" + $scope.formInformationMIssionH.StateId + "/actions", 'Get', '', '', '', function (response2) {
        if (response2.status == 200) {
          $scope.buttonsArray = response2.data;
          $scope.buttonsArrayShow = true;
        } else {
          $scope.buttonsArray = [];
          $scope.buttonsArrayShow = false;
        }
      })
    })
  }
  $scope.DynamicConfirms = function (actionType, itemToUpdate, mode) {
    if (mode === "create") {
      $scope.EditMode = false;
    } else {
      $scope.EditMode = true;
    }
    let requestId = $scope.requestId ?? $scope.urlsearch.requestId;
    $scope.buttonsArrayShow = true;
    $scope.buttonsArrayShowDay = false;
    $scope.selectedManagers(requestId, actionType, itemToUpdate);
  }

  //========== managers list ================
  $scope.selectedManagers = function (requestid, actionType, itemToUpdate) {
    $scope.itemsToUpdateH = itemToUpdate;
    $scope.buttonInfoH = actionType;
    let psn = "";
    if (global.checkExist($scope.urlsearch) && !isNaN($scope.urlsearch.personelId)) {
      psn = psn.concat(`&psn=${$scope.urlsearch.personelId}`)
    } else {
      psn = psn.concat(`&psn=${$scope.PersonnelInfo.Id}`)
    }
    let curst = "";
    if (global.checkExist($scope.formInformationMIssionH.StateId)) {
      curst = curst.concat(`&curst=${$scope.formInformationMIssionH.StateId}`)
    }
    let nxtst = "";
    if (global.checkExist(actionType.NextStateId)) {
      nxtst = nxtst.concat(`&nxtst=${actionType.NextStateId}`)
    }
    let act = "";
    if (global.checkExist(actionType.ActionId)) {
      act = act.concat(`&act=${actionType.ActionId}`)
    }
    RequestApis.HR(`workflows/actortype/${actionType.ActorTypeId}/next/personnel?rq=${requestid}${psn}${curst}${nxtst}${act}${$scope.ach !== undefined ? "&ach=" + $scope.ach : ""}}&paging.ps=${$scope.personnelSelectedPS != undefined ? $scope.personnelSelectedPS : 10}&paging.pn=${$scope.personnelSelectedPND != undefined ? $scope.personnelSelectedPND : 1}`, 'Get', '', '', '', function (response) {
      $scope.requestId = requestid;
      $scope.addToManager = [];
      if (response.status === 200) {
        $scope.managers = response.data;
        if ($scope.managers.Items.length) {
          $("#selectManagers").fadeIn();
        } else {
          $scope.SendToManager($scope.addToManager, requestid);
        }
      } else {
        $scope.SendToManager($scope.addToManager, requestid);
      }
    })
  }

  $scope.loadPagePersonnelSelected = function (page) {
    if ($scope.managers.TotalPages >= page && $scope.managers.TotalPages > $scope.managers.PageIndex && page > 0) {
      $scope.personnelSelectedPN = Number(page);
      $scope.selectedManagers($scope.requestId, $scope.buttonInfoH, $scope.itemsToUpdateH);
    }
  }
  $scope.pageSizePersonnelSelected = function (size) {
    $scope.personnelSelectedPS = Number(size);
    $scope.selectedManagers($scope.requestId, $scope.buttonInfoH, $scope.itemsToUpdateH);
  }

  $scope.cancelManagerSelection = function () {
    $("#selectManagers").fadeOut();
    $scope.addToManager = [];
  }
  $scope.addToManager = [];
  $scope.Addmanagers = function (item) {
    if (document.getElementById(`select-manager-${item}`).checked) {
      if (!$scope.addToManager.some(x => x === item)) {
        $scope.addToManager.push(item)
      }
    } else {
      $scope.addToManager = $scope.addToManager.filter(y => y != item)
    }
  }
  $scope.confirmSelectManagers = function () {
    let requestId = $scope.requestId ?? $scope.urlsearch.requestId;
    $("#selectManagers").fadeOut();
    $scope.SendToManager($scope.addToManager, requestId);
    $scope.addToManager = [];
  }

  //send request to selected manager
  $scope.SendToManager = function (managersId, requestId) {
    $scope.managersIdH = managersId;
    const { value: text } = Swal.fire({
      input: 'textarea',
      inputLabel: 'یادداشت',
      inputPlaceholder: ' در صورت تمایل یادداشت خود را بگذارید...',
      inputAttributes: {
        'aria-label': ' در صورت تمایل یادداشت خود را بگذارید...'
      },
      customClass: {
        input: 'small-font',
        confirmButton: 'small-font',
      },
      confirmButtonText: 'تأیید'
    }).then((result) => {
      if (result.isConfirmed) {
        if (result.value.length) {
          $scope.Comment = result.value;
          let str = '"' + result.value + '"';
          RequestApis.HR('workflows/request/' + requestId + '/notes', "Post", '', '', str, function (response0) {
          })
        }
        RequestApis.HR("workflows/request/" + requestId, 'get', '', '', '', function (response) {
          if (response.status === 200) {
            $scope.itemToUpdateFuncH($scope.itemsToUpdateH);
          } else {
            Toast.fire({
              icon: 'error',
              title: 'عملیات در مرحله دریافت اطلاعات درخواست، با خطا مواجه شد'
            })
          }
        })
      }
    })
  }
  //confirm request for hour mission 
  $scope.getDetailsForManagerAcception = function (id) {
    $scope.hourMistion = false;
    $scope.DetailsDayMode = false;
    $scope.dayMistion = false;
    RequestApis.RC('HourMission/GetById/' + id, 'Get', '', 'json', function (response) {
      if (response.status === 200) {
        $scope.hourMissionDetailsData = response.data.data;
        $scope.DetailsHourMode = true;
        $scope.finalRequest = true;
        $scope.buttonsArrayShow = true;
      } else {
        Toast.fire({
          icon: 'error',
          title: 'خطا در دریافت اطلاعات'
        })
      }
    })
  }
  $scope.itemToUpdateFuncH = function (items) {
    $scope.loadingUpdateHourM = true;
    let requestId = $scope.requestId ?? $scope.urlsearch.requestId;
    let subItemToSend = {};
    if ($scope.EditMode) {
      subItemToSend = {
        id: items.id,
        personId: items.personId,
        personName: items.personName,
        dossierNo: items.DossierNo,
        personnelNo: items.PersonnelNo,
        nationalCode: items.NationalCode,
        missionDate: items.missionDate,
        fromTime: items.fromTime,
        toTime: items.toTime,
        subjectMission: items.subjectMission,
        missionLocation: items.missionLocation,
        description: items.description,
        requestId: items.requestId,
        requesterId: Number($scope.currentUserId),
        updatedBy: Number($scope.currentUserId),
        updatedAt: moment().format('YYYY-MM-DD')
      }
    } else {
      subItemToSend = {
        id: $scope.parentHourId,
        personId: parseInt($scope.PersonnelInfo.Id),
        personName: $scope.PersonnelInfo.PoliteName,
        dossierNo: $scope.PersonnelInfo.DossierNo,
        personnelNo: $scope.PersonnelInfo.PersonnelNo,
        nationalCode: $scope.PersonnelInfo.NationalCode,
        missionDate: $scope.convertToMiladi(items.missionDate),
        fromTime: items.FromTime ?? items.fromTime,
        toTime: items.ToTime ?? items.toTime,
        subjectMission: items.SubjectMission ?? items.subjectMission,
        missionLocation: items.MissionLocation ?? items.missionLocation,
        description: items.Description ?? items.description,
        requestId: Number(requestId),
        requesterId: Number($scope.currentUserId),
        updatedBy: Number($scope.currentUserId),
        updatedAt: moment().format('YYYY-MM-DD')
      }
    }
    $scope.finalRequest = true;
    if ($scope.buttonInfoH.PreUrls != undefined) {
      RequestApis.RC($scope.buttonInfoH.PreUrls[0], 'Post', subItemToSend, 'json', function (response) {
        if (response.data.success == true) {
          RequestApis.HR("workflows/request/" + requestId, 'get', '', '', '', function (response1) {
            var itemTosend = {
              Id: response1.data.Id,
              RowVersion: response1.data.RowVersion,
              ActionId: $scope.buttonInfoH.ActionId,
              NextPersonnel: []
            }
            for (var i = 0; i < $scope.managersIdH.length; i++) {
              var itemToPsuh = {
                ActorTypeId: $scope.buttonInfoH.ActorTypeId,
                ActionTransitionId: $scope.buttonInfoH.ActionTransitionId,
                PersonnelId: $scope.managersIdH[i]
              }
              itemTosend.NextPersonnel.push(itemToPsuh);
            }
            let bhus = ""
            if (global.checkExist($scope.urlsearch) && global.checkExist($scope.urlsearch.behalfId)) {
              bhus = bhus.concat(`?bhus=${$scope.urlsearch.behalfId}`)
            }
            RequestApis.HR(`workflows/request/${requestId}/simple/move${bhus}`, 'Patch', '', '', itemTosend, function (response2) {
              if (response2.status === 200) {
                $scope.loadingUpdateHourM = false;
                Toast.fire({
                  icon: "success",
                  title: "عملیات با موفقیت انجام شد",
                }).then((result) => {
                  if ($scope.EditMode) {
                    window.parent.location.href = check ? `${window.origin}/${window.location.pathname.toString().split("/")[1]}/GlobalValue/cartable.html?data=inbox` : `${window.origin}/GlobalValue/cartable.html?data=inbox`;
                  } else {
                    window.parent.location.href = check ? `${window.origin}/${window.location.pathname.toString().split("/")[1]}/GlobalValue/cartable.html?data=outbox` : `${window.origin}/GlobalValue/cartable.html?data=outbox`;
                  }
                })
              } else {
                Toast.fire({
                  icon: "error",
                  title: response2.data.errorMessages ?? "عملیات در مرحله ارسال به شخص بعدی با خطا مواجه شد",
                });
              }
            })
          })
        } else {
          Toast.fire({
            icon: "error",
            title: response.data.errorMessages[0] ?? "عملیات در مرحله بروزرسانی سیستم تردد با خطا مواجه شد",
          });
        }
      })
    } else {
      RequestApis.HR("workflows/request/" + requestId, 'get', '', '', '', function (response1) {
        var itemTosend = {
          Id: response1.data.Id,
          RowVersion: response1.data.RowVersion,
          ActionId: $scope.buttonInfoH.ActionId,
          NextPersonnel: []
        }
        for (var i = 0; i < $scope.managersIdH.length; i++) {
          var itemToPsuh = {
            ActorTypeId: $scope.buttonInfoH.ActorTypeId,
            ActionTransitionId: $scope.buttonInfoH.ActionTransitionId,
            PersonnelId: $scope.managersIdH[i]
          }
          itemTosend.NextPersonnel.push(itemToPsuh);
        }
        let bhus = ""
        if (global.checkExist($scope.urlsearch) && global.checkExist($scope.urlsearch.behalfId)) {
          bhus = bhus.concat(`?bhus=${$scope.urlsearch.behalfId}`)
        }
        RequestApis.HR(`workflows/request/${requestId}/simple/move${bhus}`, 'Patch', '', '', itemTosend, function (response2) {
          if (response2.status === 200) {
            $scope.loadingUpdateHourM = false;
            Toast.fire({
              icon: "success",
              title: "عملیات با موفقیت انجام شد",
            }).then((result) => {
              if ($scope.EditMode) {
                window.parent.location.href = check ? `${window.origin}/${window.location.pathname.toString().split("/")[1]}/GlobalValue/cartable.html?data=inbox` : `${window.origin}/GlobalValue/cartable.html?data=inbox`;
              } else {
                window.parent.location.href = check ? `${window.origin}/${window.location.pathname.toString().split("/")[1]}/GlobalValue/cartable.html?data=outbox` : `${window.origin}/GlobalValue/cartable.html?data=outbox`;
              }
            })
          } else {
            Toast.fire({
              icon: "error",
              title: response2.data.errorMessages ?? "عملیات در مرحله ارسال به شخص بعدی با خطا مواجه شد",
            });
          }
        })
      })
    }
  }

  //****************************************************************************
  //************* submit and start workflow for mission day ******************
  //****************************************************************************
  //----------- validator for dates -------------------
  $scope.MissionDuration = function () {
    if ($scope.createDayMissionData.fromDate != undefined && $scope.createDayMissionData.fromDate.length && $scope.createDayMissionData.toDate != undefined && $scope.createDayMissionData.toDate.length) {
      if ($scope.getDiffDayFOrMission($scope.createDayMissionData.fromDate, $scope.createDayMissionData.toDate) > 0) {
        $scope.createDayMissionData.dayCount = $scope.getDiffDayFOrMission($scope.createDayMissionData.fromDate, $scope.createDayMissionData.toDate)
        let item = {
          personId: $scope.PersonnelInfo.Id,
          fromDate: $scope.convertToMiladi($scope.createDayMissionData.fromDate),
          toDate: $scope.convertToMiladi($scope.createDayMissionData.toDate)
        };
        $scope.SideInfoData = {};
        RequestApis.RC(`PersonLeave/GetAllTimeRollCalls`, 'Post', item, 'json', function (response) {
          if (response.data.success) {
            $scope.SideInfoData = response.data.data;
            $scope.sideInfo = true;
          } else {
            $scope.sideInfo = false;
          }
        })
      } else {
        Toast.fire({
          icon: 'error',
          title: 'تاریخ شروع نمیتواند از تاریخ پایان جلوتر باشد'
        })

      }
    }
    if ($scope.createDayMissionData.fromDate != undefined) {
      RequestApis.RC(`PersonLeave/IsFriday?FromDate=${$scope.convertToMiladi($scope.createDayMissionData.fromDate)}`, 'Get', '', 'json', function (response) {
        if (response.data) {
          Toast.fire({
            icon: "warning",
            title: "روز انتخاب شده شما جمعه است.",
          });
        }
      })
    }
  }
  $scope.requestDay = function (item) {
    $scope.loadingRequestDayM = true;
    let itemtosend = {
      "chartTreeID": item.chartTreeID != undefined ? parseInt(item.chartTreeID) : null,
      "locationID": item.locationID != undefined ? parseInt(item.locationID) : null,
      "subject": item.subjectMission != undefined ? item.subjectMission : null,
      "fromDate": $scope.convertToMiladi(item.fromDate),
      "toDate": $scope.convertToMiladi(item.toDate),
      "requesterId": Number($scope.currentUserId),
      "dayMissionStateId": 0,
      "dayMissionTypeId": item.dayMissionTypeId,
      "description": item.description != undefined ? item.description : null,
      "createdBy": Number($scope.currentUserId),
      "personIds": [parseInt($scope.PersonnelInfo.Id)],
      "descriptions": item.description != undefined ? [item.description] : [],
      "otherLocations": item.otherLocation != undefined ? [item.otherLocation] : [],
      "vehicleTypes": item.vehicleType != undefined ? [item.vehicleType.id] : [],
      "otherVehicles": item.otherVehicle != undefined ? [item.otherVehicle] : [],
      "requiredDevices": item.requiredDevice != undefined ? [item.requiredDevice] : [],
      "dayCount": item.dayCount,
      "withoutDayCount": item.withoutDayCount != undefined ? item.withoutDayCount : null,
      "withDayCount": item.withDayCount != undefined ? item.withDayCount : null,
      "subjectMission": item.subjectMission != undefined ? item.subjectMission : null,
      "driving": item.driving != undefined ? item.driving : false,
      "supplyResidence": item.supplyResidence != undefined ? item.supplyResidence : false,
      "residence": item.residence != undefined ? item.residence : null,
      "hokmNO": item.hokmNO != undefined ? item.hokmNO : null,
      "licenseNums": []
    }
    RequestApis.RC('PersonMission/InsertMissionRequest', 'Post', itemtosend, 'json', function (responsep) {
      if (responsep.data.success == true) {
        let ParentResponse = responsep.data.data;
        $scope.requestMD = responsep.data.data.id
        RequestApis.HR("securities/form/code?seccd=RC_DAYM", 'get', '', '', '', function (response) {
          RequestApis.HR("workflows/form/" + response.data.Id, 'get', '', '', '', function (subResponse) {
            let requestItem = {
              "parentId": null,
              "personnelId": parseInt($scope.PersonnelInfo.Id),
              "rootId": null,
              "workflowId": subResponse.data[0].Id,
              "initialDate": moment().format('YYYY-MM-DD'),
              "requesterUserId": Number($scope.currentUserId),
              "statusTypeIdentity": 1,
              "isDone": false,
              "hasChildren": false,
              "title": "درخواست مأموریت روزانه " + $scope.PersonnelInfo.PoliteName,
              "requestNo": "RC_DAYM",
              "comment": "",
              "additionalInfo": JSON.stringify({
                personnelId: $scope.PersonnelInfo.Id,
                userId: $scope.currentUserId,
                title: "درخواست مأموریت روزانه " + $scope.PersonnelInfo.PoliteName,
                DayMissionFormId: ParentResponse.id
              }),
              "requestTypeIdentity": subResponse.data[0].Id,
              "createdBy": Number($scope.currentUserId),
              "createdAt": moment().format('YYYY-MM-DD')
            }
            RequestApis.RC('Request/CreateRequest/' + $scope.PersonnelInfo.Id, 'Post', requestItem, 'json', function (response) {
              if (response.data.success == true) {
                $scope.SubmitOccured = true;
                $scope.loadingRequestDayM = false;
                $scope.dynamicBtnsDay(ParentResponse, response.data.data);
              }
            })
          })
        })

      } else {
        if (responsep.data.errorMessages != undefined) {

          if (responsep.data.errorMessages[0].trim() === "HASOVERLAP") {
            Toast.fire({
              icon: "success",
              title: "تداخل زمانی وجود دارد لطفا تاریخ را بررسی نمایید",
            });
          } else if (responsep.data.errorMessages[0].trim() === "ISCLOSEDDAY") {
            Toast.fire({
              icon: "success",
              title: "شما به دلیل بسته شدن محاسبه کارکردتان در تاریخ انتخابی امکان ثبت مأموریت را ندارید",
            });
            $scope.showClosedList(responsep.data);
          } else if (responsep.data.errorMessages[0].trim() === "HasOverlapHourMission") {
            Toast.fire({
              icon: "success",
              title: "شما قبلا مأموریت ساعتی در یکی از روزهای این بازه تاریخی انتخابیتان، ثبت نموده اید",
            });
          } else if (responsep.data.errorMessages[0].trim() === "HasOverlapDailyLeave") {
            Toast.fire({
              icon: "success",
              title: "شما قبلا مرخصی روزانه در یکی از روزهای این بازه تاریخی انتخابیتان، ثبت نموده اید",
            });
          } else if (responsep.data.errorMessages[0].trim() === "HasOverlapHourLeave") {
            Toast.fire({
              icon: "success",
              title: "شما قبلا مرخصی ساعتی در یکی از روزهای این بازه تاریخی انتخابیتان، ثبت نموده اید",
            });
          } else {
            Toast.fire({
              icon: "error",
              title: responsep.data.errorMessages[0] ?? "عملیات با خطا مواجه شد",
            });
          }

        }
      }
    })
  }
  $scope.dynamicBtnsDay = function (items, requestId) {
    $scope.returnDataFromCreateApiDay = items;
    $scope.requestIdDay = requestId;
    RequestApis.HR("workflows/request/" + requestId + "/status/", 'Get', '', '', '', function (response1) {
      $scope.formInformation = response1.data[0];
      RequestApis.HR("workflows/state/" + $scope.formInformation.StateId + "/actions", 'Get', '', '', '', function (response2) {
        if (response2.status == 200) {
          $scope.buttonsArrayDay = response2.data;
          $scope.buttonsArrayShowDay = true;
        } else {
          $scope.buttonsArrayDay = [];
          $scope.buttonsArrayShowDay = false;
        }
      })
    })
  }
  $scope.DynamicConfirmsDay = function (actionType, itemToUpdate, mode) {
    if (mode === "create") {
      $scope.EditMode = false;
    } else {
      $scope.EditMode = true;
    }
    let requestId = $scope.requestIdDay ?? $scope.urlsearch.requestId;
    $scope.buttonsArrayShowDay = true;
    $scope.buttonsArrayShow = false;
    $scope.selectedManagersDay(requestId, actionType, itemToUpdate);
  }
  $scope.selectedManagersDay = function (requestid, actionType, itemToUpdate) {

    $scope.itemsToUpdate = itemToUpdate;
    $scope.buttonInfoDay = actionType;
    let psn = "";
    if (global.checkExist($scope.urlsearch) && !isNaN($scope.urlsearch.personelId)) {
      psn = psn.concat(`&psn=${$scope.urlsearch.personelId}`)
    } else {
      psn = psn.concat(`&psn=${$scope.PersonnelInfo.Id}`)
    }
    let curst = "";
    if (global.checkExist($scope.formInformation.StateId)) {
      curst = curst.concat(`&curst=${$scope.formInformation.StateId}`)
    }
    let nxtst = "";
    if (global.checkExist(actionType.NextStateId)) {
      nxtst = nxtst.concat(`&nxtst=${actionType.NextStateId}`)
    }
    let act = "";
    if (global.checkExist(actionType.ActionId)) {
      act = act.concat(`&act=${actionType.ActionId}`)
    }
    RequestApis.HR(`workflows/actortype/${actionType.ActorTypeId}/next/personnel?rq=${requestid}${psn}${curst}${nxtst}${act}${$scope.ach !== undefined ? "&ach=" + $scope.ach : ""}&paging.ps=${$scope.personnelSelectedPSD != undefined ? $scope.personnelSelectedPSD : 10}&paging.pn=${$scope.personnelSelectedPND != undefined ? $scope.personnelSelectedPND : 1}`, 'Get', '', '', '', function (response) {
      $scope.requestIdDay = requestid;
      $scope.addToManagerDay = [];
      if (response.status === 200) {
        $scope.managers = response.data;
        if ($scope.managers.Items.length) {
          $("#selectManagers").fadeIn();
        } else {
          $scope.SendToManagerDay($scope.addToManagerDay, requestid);
        }
      } else {
        $scope.SendToManagerDay($scope.addToManagerDay, requestid);
      }
    })
  }

  $scope.getMore = function () {
    $scope.ach = 1;
    if ($scope.buttonsArrayShow) {
      $scope.selectedManagers($scope.requestId, $scope.buttonInfoH, $scope.itemsToUpdateH);
    }
    if ($scope.buttonsArrayShowDay) {

      $scope.selectedManagersDay($scope.requestIdDay, $scope.buttonInfoDay, $scope.itemsToUpdate);
    }
  }
  $scope.loadPagePersonnelSelected = function (page) {
    if ($scope.managers.TotalPages >= page && $scope.managers.TotalPages > $scope.managers.PageIndex && page > 0) {
      $scope.personnelSelectedPND = Number(page);
      $scope.selectedManagersDay($scope.requestIdDay, $scope.buttonInfoDay, $scope.itemsToUpdate);
    }
  }
  $scope.pageSizePersonnelSelected = function (size) {
    $scope.personnelSelectedPSD = Number(size);
    $scope.selectedManagersDay($scope.requestIdDay, $scope.buttonInfoDay, $scope.itemsToUpdate);
  }
  $scope.cancelManagerSelection = function () {
    $("#selectManagers").fadeOut();
    $scope.addToManager = [];
  }
  $scope.addToManager = [];
  $scope.Addmanagers = function (item) {
    if (document.getElementById(`select-manager-${item}`).checked) {
      if (!$scope.addToManager.some(x => x === item)) {
        $scope.addToManager.push(item)
      }
    } else {
      $scope.addToManager = $scope.addToManager.filter(y => y != item)
    }
  }
  $scope.confirmSelectManagersDay = function () {
    let requestId = $scope.requestIdDay ?? $scope.urlsearch.requestId;
    $("#selectManagers").fadeOut();
    $scope.SendToManagerDay($scope.addToManager, requestId);
    $scope.addToManager = [];
  }
  $scope.SendToManagerDay = function (managersId, requestId) {
    $scope.managersId = managersId;
    const { value: text } = Swal.fire({
      input: 'textarea',
      inputLabel: 'یادداشت',
      inputPlaceholder: ' در صورت تمایل یادداشت خود را بگذارید...',
      inputAttributes: {
        'aria-label': ' در صورت تمایل یادداشت خود را بگذارید...'
      },
      customClass: {
        input: 'small-font',
        confirmButton: 'small-font',
      },
      confirmButtonText: 'تأیید'
    }).then((result) => {
      if (result.isConfirmed) {
        if (result.value.length) {
          $scope.Comment = result.value;
          let str = '"' + result.value + '"';
          RequestApis.HR('workflows/request/' + requestId + '/notes', "Post", '', '', str, function (response0) {
          })
        }
        RequestApis.HR("workflows/request/" + requestId, 'get', '', '', '', function (response) {
          if (response.status === 200) {
            $scope.itemToUpdateFunc($scope.itemsToUpdate);
          } else {
            Toast.fire({
              icon: 'error',
              title: 'عملیات در مرحله دریافت اطلاعات درخواست، با خطا مواجه شد'
            })
          }
        })
      }
    })
  }
  $scope.itemToUpdateFunc = function (items) {
    let requestId = items.requestId != undefined ? items.requestId : $scope.requestIdDay != undefined ? $scope.requestIdDay : $scope.urlsearch.requestId;
    $scope.finalRequest = true;
    let id = items.id != undefined ? items.id : $scope.requestMD
    RequestApis.RC('PersonMission/GetMission?RequestId=' + id + '&PersonId=', 'Get', '', 'json', function (response) {
      let subItemToSend = {
        "requestCode": response.data.data[0].requestCode,
        "chartTreeID": response.data.data[0].chartTreeID,
        "locationID": response.data.data[0].locationID,
        "requestId": requestId,
        "subject": response.data.data[0].subject,
        "fromDate": $scope.convertToMiladi(items.fromDate),
        "toDate": $scope.convertToMiladi(items.toDate),
        "requesterId": items.requesterId != undefined ? items.requesterId : Number($scope.currentUserId),
        "dayMissionTypeId": items.dayMissionTypeId,
        "description": items.description,
        "personsMissions": response.data.data[0].personsMission,
        "id": response.data.data[0].id,
        "updatedBy": Number($scope.currentUserId),
        "updatedAt": moment().format('YYYY-MM-DD'),
        "isDeleted": response.data.data[0].isDeleted
      }
      if ($scope.buttonInfoDay.PreUrls != undefined) {
        RequestApis.RC($scope.buttonInfoDay.PreUrls[0], 'Post', subItemToSend, 'json', function (response3) {
          if (response3.data.success == true) {
            RequestApis.HR("workflows/request/" + requestId, 'get', '', '', '', function (response7) {
              var itemTosend = {
                Id: response7.data.Id,
                RowVersion: response7.data.RowVersion,
                ActionId: $scope.buttonInfoDay.ActionId,
                NextPersonnel: []
              }
              for (var i = 0; i < $scope.managersId.length; i++) {
                var itemToPsuh = {
                  ActorTypeId: $scope.buttonInfoDay.ActorTypeId,
                  ActionTransitionId: $scope.buttonInfoDay.ActionTransitionId,
                  PersonnelId: $scope.managersId[i]
                }
                itemTosend.NextPersonnel.push(itemToPsuh);
              }
              let bhus = ""
              if (global.checkExist($scope.urlsearch) && global.checkExist($scope.urlsearch.behalfId)) {
                bhus = bhus.concat(`?bhus=${$scope.urlsearch.behalfId}`)
              }
              RequestApis.HR(`workflows/request/${requestId}/simple/move${bhus}`, 'Patch', '', '', itemTosend, function (response) {
                if (response.status === 200) {
                  Toast.fire({
                    icon: "success",
                    title: "عملیات با موفقیت انجام شد",
                  }).then((result) => {
                    if ($scope.EditMode) {
                      window.parent.location.href = check ? `${window.origin}/${window.location.pathname.toString().split("/")[1]}/GlobalValue/cartable.html?data=inbox` : `${window.origin}/GlobalValue/cartable.html?data=inbox`;
                    } else {
                      window.parent.location.href = check ? `${window.origin}/${window.location.pathname.toString().split("/")[1]}/GlobalValue/cartable.html?data=outbox` : `${window.origin}/GlobalValue/cartable.html?data=outbox`;
                    }
                  })
                } else {
                  Toast.fire({
                    icon: "error",
                    title: response.data.errorMessages ?? "عملیات در مرحله ارسال به شخص بعدی با خطا مواجه شد",
                  });
                }
              })
            })
          } else {
            Toast.fire({
              icon: "error",
              title: response.data.errorMessages[0] ?? "عملیات در مرحله بروزرسانی سیستم تردد با خطا مواجه شد",
            });
          }
        })
      } else {
        RequestApis.HR("workflows/request/" + requestId, 'get', '', '', '', function (response7) {
          var itemTosend = {
            Id: response7.data.Id,
            RowVersion: response7.data.RowVersion,
            ActionId: $scope.buttonInfoDay.ActionId,
            NextPersonnel: []
          }
          for (var i = 0; i < $scope.managersId.length; i++) {
            var itemToPsuh = {
              ActorTypeId: $scope.buttonInfoDay.ActorTypeId,
              ActionTransitionId: $scope.buttonInfoDay.ActionTransitionId,
              PersonnelId: $scope.managersId[i]
            }
            itemTosend.NextPersonnel.push(itemToPsuh);
          }
          let bhus = ""
          if (global.checkExist($scope.urlsearch) && global.checkExist($scope.urlsearch.behalfId)) {
            bhus = bhus.concat(`?bhus=${$scope.urlsearch.behalfId}`)
          }
          RequestApis.HR(`workflows/request/${requestId}/simple/move${bhus}`, 'Patch', '', '', itemTosend, function (response) {
            if (response.status === 200) {
              $scope.loadingUpdateDayM = false;
              Toast.fire({
                icon: "success",
                title: "عملیات با موفقیت انجام شد",
              }).then((result) => {
                if ($scope.EditMode) {
                  window.parent.location.href = check ? `${window.origin}/${window.location.pathname.toString().split("/")[1]}/GlobalValue/cartable.html?data=inbox` : `${window.origin}/GlobalValue/cartable.html?data=inbox`;
                } else {
                  window.parent.location.href = check ? `${window.origin}/${window.location.pathname.toString().split("/")[1]}/GlobalValue/cartable.html?data=outbox` : `${window.origin}/GlobalValue/cartable.html?data=outbox`;
                }
              })
            } else {
              Toast.fire({
                icon: "error",
                title: response.data.errorMessages ?? "عملیات در مرحله ارسال به شخص بعدی با خطا مواجه شد",
              });
            }
          })
        })
      }
    })
  }
  $scope.getDetailsForManagerAcceptionDay = function (id) {
    $scope.DetailsHourMode = false;
    $scope.hourMistion = false;
    $scope.dayMistion = false;
    $scope.dayVacation = false;
    RequestApis.RC('PersonMission/GetMission?RequestId=' + id + '&PersonId=', 'Get', '', 'json', function (response1) {
      if (response1.status === 200) {
        $scope.dayMissionDetailsData = response1.data.data[0];
        $scope.DetailsDayMode = true;
        $scope.finalRequest = true;
        $scope.buttonsArrayShowDay = true;
        $scope.buttonsArrayShow = false;
      } else {
        Toast.fire({
          icon: 'error',
          title: 'خطا در دریافت اطلاعات'
        })
      }
    })
  }
  $scope.showClosedList = function (items) {
    $scope.showClosedList = items.data;
    $('#showClosedModal').fadeIn();
  }
  $scope.closeClosedList = function () {
    $('#showClosedModal').fadeOut();
  }
})
app.controller("vacationRequestCtrl", function ($scope, RequestApis, $templateCache, $state, $timeout, $location, global) {
  $templateCache.remove($state.current.templateUrl);
  //========= initial variable =============
  this.$onInit = function () {
    $scope.getPersonnelInfo();
    $scope.getDataWithCookie();
    $scope.IsLimited = false;
    $scope.changeVacationType(2);
  }
  let applications = ["HR", "DASHBOARD", "RC", "DASH", "DRC", "HELPDESK"];
  let appNameFromUrl = window.location.pathname.toString().split("/")[1].toUpperCase();
  let check = applications.some(x => x === appNameFromUrl);
  $scope.getPersonnelInfo = function () {
    global.urlInfo(function (data) {
      $scope.currentUserId = data.UserId;
      RequestApis.HR(`personnel/user/${$scope.currentUserId}/current`, 'Get', '', '', '', function (response) {
        if (response.status === 200) {
          $scope.PersonnelDetails(response.data);
        }
      })
    })
  }
  $scope.PersonnelDetails = function (item) {
    $scope.PersonnelInfo = item;
  }
  $scope.CheckStateDay = false;
  $scope.CheckState = false;
  $scope.createDayVacationData = {};
  $scope.showReasonMission = false
  $scope.hourVacation = false;
  $scope.dayVacation = false;
  $scope.SubmitOccured = false;
  $scope.buttonsArrayShowDay = false;
  $scope.buttonsArrayShow = false;
  $scope.finalRequest = false;
  $scope.returnDataFromCreateApi = [];

  $scope.getIntitlementInfo = function () {
    let item = {
      "toDate": moment().format('YYYY-MM-DD'),
      "toDatePersian": moment().format('jYYYY-jMM-jDD'),
      "personIds": [$scope.PersonnelInfo.Id],
      "negativeRemaining": false,
      "pageNumber": 1,
      "pageSize": 1,
      "searchList": []
    }
    RequestApis.RC('Reports/GetLeaveStatusByPersonReport', 'Post', item, '', function (response) {
      $scope.IntitlementInfo = response.data.data.item1[0];
    })
  }

  $scope.getDataWithCookie = function () {
    if (window.location.toString().split("?").length != 1) {
      var search = window.location.search.substring(1);
      $scope.urlsearch = JSON.parse('{"' + decodeURI(search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"') + '"}')
      if ($scope.urlsearch.hourVacationId != undefined) {

        $scope.checkStatus($scope.urlsearch);
      }
      if ($scope.urlsearch.dailyVacationId != undefined) {
        $scope.checkStatusDay($scope.urlsearch)
      }
    }
  }
  $scope.checkStatusDay = function (items) {
    RequestApis.HR("workflows/request/" + items.requestId + "/status/", 'Get', '', '', '', function (response1) {
      $scope.formInformation = response1.data[0];
      if (items.stateBox === "outbox" && response1.status == 404) {
        $scope.CheckStateDay = false;
        $scope.dayVacation = false;
        $scope.DetailsDayMode = true;
        $scope.buttonsArrayDay = [];
        $scope.getDetailsForManagerAcceptionDay(items.dailyVacationId)
      } else {
        RequestApis.HR("workflows/state/" + $scope.formInformation.StateId + "/actions", 'Get', '', '', '', function (response2) {
          if (response2.status == 200) {
            if (items.stateBox === "inbox") {
              $scope.CheckStateDay = true;
              $scope.buttonsArrayDay = response2.data;
            } else {
              $scope.CheckStateDay = false;
              $scope.buttonsArrayDay = [];
            }
          }
          $scope.getDetailsForManagerAcceptionDay(items.dailyVacationId)
          $scope.buttonsArrayShowDay = true;
          $scope.finalRequest = true;

        })
      }
    })
  }
  $scope.checkStatus = function (items) {
    RequestApis.HR("workflows/request/" + items.requestId + "/status/", 'Get', '', '', '', function (response1) {
      $scope.formInformationVacationH = response1.data[0];
      if (items.stateBox === "outbox" && response1.status == 404) {
        $scope.CheckState = false;
        $scope.hourVacation = false;
        $scope.DetailsHourMode = true;
        $scope.buttonsArray = [];
        $scope.getDetailsForManagerAcception(items.hourVacationId);
      } else {
        RequestApis.HR("workflows/state/" + $scope.formInformationVacationH.StateId + "/actions", 'Get', '', '', '', function (response2) {
          if (response2.status == 200) {
            if (items.stateBox === "inbox") {
              $scope.CheckState = true;
              $scope.buttonsArray = response2.data;
            } else {
              $scope.CheckState = false;
              $scope.buttonsArray = [];
            }
          }
          $scope.getDetailsForManagerAcception(items.hourVacationId);
          $scope.buttonsArrayShow = true;
          $scope.finalRequest = true;
        })
      }
    })
  }

  //========== toast notification ==========
  const Toast = Swal.mixin({
    toast: true,
    position: 'center',
    showConfirmButton: false,
    timer: 2000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer)
      toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
  })
  //========== remove WhiteSpaces ==========
  Object.defineProperty(String.prototype, "removeWhiteSpaces", {
    value: function removeWhiteSpaces() {
      return this.replace(/\s+/g, '');
    },
    writable: true,
    configurable: true
  });

  //========= convert num to string ========
  $scope.convertNumToString = function (date) {
    return data.toString();
  }

  //===== convert date to shamsi ===========
  $scope.convertToShamsi = function (date) {
    if (date != null) {
      return moment(date, 'YYYY/M/D').format('jYYYY/jMM/jDD');
    } else {
      return "-"
    }
  }

  //====== convert date to miladi ==========
  $scope.convertToMiladi = function (date) {
    if (date != null) {
      return moment(date, 'jYYYY/jM/jD').format('YYYY-MM-DD');
    } else {
      return "-"
    }
  }

  //======= Get days from to Date ==========
  $scope.getDiffDayForVacation = function (dateFrom, DateTo) {
    var datefrom = new Date(dateFrom.toString().split('T')[0]);
    var dateto = new Date(DateTo.toString().split('T')[0]);
    let Diff_In_Time = dateto.getTime() - datefrom.getTime();
    let Diff_In_Days = Diff_In_Time / (1000 * 3600 * 24);
    return Diff_In_Days + 1;
  }

  //============= date picker===============
  $scope.maskInput = function () {
    setTimeout(function () {
      $(".date-picker").datepicker({
        dateFormat: "yy/mm/dd",
        changeMonth: true,
        changeYear: true,

      });
      $('.time').clockpicker();
    }, 500)
    $('.time').inputmask({ regex: "(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]", "placeholder": "HH:MM" });
    $('.date-picker').change(function () {
      angular.element($(this)).triggerHandler('input');
    });
    $('.time').change(function () {
      angular.element($(this)).triggerHandler('input');
    });

  }

  $scope.getLeaveDayInfo = function () {
    if ($scope.createDayVacationData.fromDate != undefined && $scope.createDayVacationData.toDate != undefined) {
      let fromDate = $scope.convertToMiladi($scope.createDayVacationData.fromDate);
      let toDate = $scope.convertToMiladi($scope.createDayVacationData.toDate);
      RequestApis.RC(`PersonLeave/GetLeaveDays/${$scope.PersonnelInfo.Id}?FromDate=${fromDate}&ToDate=${toDate}`, 'Get', '', 'json', function (response) {
        $scope.leaveDayInfo = response.data.data;
      })
    }
  }
  //------- get vacation info -------------------
  $scope.leavInformation = {}

  //---------- vacation type -----------------
  $scope.changeVacationType = function (type) {
    switch (type) {
      case 1:
        $scope.hourVacation = true;
        $scope.dayVacation = false;
        break;
      case 2:
        $scope.SideInfoData = {};
        $scope.hourVacation = false;
        $scope.dayVacation = true;
        $scope.getTypeOfVacation();
        break;

      default:
    }
  }

  $scope.getRemindVacation = function () {
    let currentDate = moment().format('YYYY-MM-DD');
    RequestApis.RC(`LeaveRemainings/CalculateCurrentLeaveRemaining?currentDate=${currentDate}`, 'Post', [$scope.PersonnelInfo.Id], 'json', function (response) {
      $scope.leavInformation = response.data.data[0];
    })
  }

  //------- get select change info -------------------
  $scope.entitlement = false;
  $scope.maternity = false;
  $scope.treatment = false;
  $scope.SelectInit = {
    createdAt: "2021-02-01T00:00:00",
    createdBy: 123,
    description: null,
    id: -1,
    isDeleted: false,
    name: "لطفا انتخاب نمایید...",
    updatedAt: "2021-02-01T00:00:00",
    updatedBy: 123,
  }
  $scope.onChangeVacationType = function (item) {
    switch (item) {
      case 1:
        $scope.treatment = true;
        $scope.maternity = false;
        $scope.entitlement = false;
        $scope.hardDisease = false;
        $scope.getTreatmentInfo();
        $scope.WorkFlowCode = "RC_TREATENT";
        $scope.workFlowCodePersian = "استعلاجی"
        break;
      case 2:
        $scope.treatment = false;
        $scope.maternity = false;
        $scope.entitlement = true;
        $scope.hardDisease = false;
        $scope.getRemindVacation();
        $scope.getIntitlementInfo();
        $scope.getLeaveDayInfo();
        $scope.WorkFlowCode = "RC_DESERVE";
        $scope.workFlowCodePersian = "استحقاقی"
        break;
      case 3:
        $scope.entitlement = false;
        $scope.maternity = false;
        $scope.treatment = false;
        $scope.hardDisease = false;
        $scope.WorkFlowCode = "RC_URGE";
        $scope.workFlowCodePersian = "اضطراری"
        break;
      case 4:
        $scope.entitlement = false;
        $scope.maternity = false;
        $scope.treatment = false;
        $scope.hardDisease = false;
        $scope.WorkFlowCode = "RC_FREE";
        $scope.workFlowCodePersian = "مرخصی بدون حقوق"
        break;
      case 5:
        $scope.treatment = false;
        $scope.maternity = false;
        $scope.entitlement = false;
        $scope.hardDisease = true;
        $scope.WorkFlowCode = "RC_HARDDISEASE";
        $scope.workFlowCodePersian = "صعب العلاج"
        break;
      case 6:
        $scope.treatment = false;
        $scope.maternity = true;
        $scope.entitlement = false;
        $scope.hardDisease = false;
        $scope.getMaternityInfo();
        $scope.WorkFlowCode = "RC_MATERNITY";
        $scope.workFlowCodePersian = "زایمان"
        break;
      case 7:
        $scope.entitlement = false;
        $scope.maternity = false;
        $scope.treatment = false;
        $scope.hardDisease = false;
        $scope.WorkFlowCode = "RC_MARITAL";
        $scope.workFlowCodePersian = "ازدواج"
        break;
      case 8:
        $scope.entitlement = false;
        $scope.maternity = false;
        $scope.treatment = false;
        $scope.hardDisease = false;
        $scope.WorkFlowCode = "RC_ENCOURAGE";
        $scope.workFlowCodePersian = "تشویقی پدران"
        break;
      case 9:
        $scope.entitlement = false;
        $scope.maternity = false;
        $scope.treatment = false;
        $scope.hardDisease = false;
        $scope.WorkFlowCode = "RC_DIE";
        $scope.workFlowCodePersian = "فوت بستگان"
        break;
      default:
        $scope.entitlement = false;
        $scope.maternity = false;
        $scope.treatment = false;
        $scope.hardDisease = false;
        $scope.WorkFlowCode = "";
        break;
    }
  }
  //======================= type of Vacation =======================
  $scope.getTypeOfVacation = function () {
    $scope.item = {
      pageNumber: 1,
      pageSize: 10,
      sortField: null,
      sortAsc: true,
      fillNestedClass: true,
      searchList: []
    }
    RequestApis.RC('DayLeaveType/GetList', 'Post', $scope.item, 'json', function (response) {
      if (response.data.success == true) {
        $scope.selectgroupVacationType = response.data.data;
      } else {
        Toast.fire({
          icon: "error",
          title: response.data.errorMessages ?? "عملیات با خطا مواجه شد",
        });
      }
    })
  }
  $scope.checkLimitation = function (item) {
    $scope.IsLimited = false;
    RequestApis.RC(`PersonLeave/CheckRequestTimeLimit?fromDate=${$scope.convertToMiladi(item)}`, 'Get', '', '', function (response) {
      if (response.data.data.isLimit) {
        Toast.fire({
          icon: "error",
          title: response.data.data.message
        });
        if (response.data.data.limitType) {
          $scope.IsLimited = true;
        }
      }
    })
  }
  //------- get treatment info -------------------
  $scope.getTreatmentInfo = function () {
    if ($scope.createDayVacationData.fromDate != undefined && $scope.createDayVacationData.toDate != undefined) {
      let fromDate = $scope.convertToMiladi($scope.createDayVacationData.fromDate);
      let toDate = $scope.convertToMiladi($scope.createDayVacationData.toDate);
      RequestApis.RC(`PersonLeave/GetSickLeaveDays/${$scope.PersonnelInfo.Id}?FromDate=${fromDate}&ToDate=${toDate}`, 'Get', '', 'json', function (response) {
        $scope.treatmentData = response.data.data;
        $scope.createDayVacationData.sickLeaveInMonth = response.data.sickLeaveInMonth;
        $scope.createDayVacationData.sickLeaveInYear = response.data.sickLeaveInYear;
      })
    }
  }

  //------- get maternity info --------------------------
  $scope.getMaternityInfo = function () {
    if ($scope.createDayVacationData.fromDate != undefined && $scope.createDayVacationData.toDate != undefined) {
      let fromDate = $scope.convertToMiladi($scope.createDayVacationData.fromDate);
      let toDate = $scope.convertToMiladi($scope.createDayVacationData.toDate);
      RequestApis.RC('PersonLeave/GetMaternityLeaveDays/' + $scope.PersonnelInfo.Id + '?FromDate=' + fromDate + '&ToDate=' + toDate, 'Get', '', 'json', function (response) {
        $scope.maternityData = response.data.data;
      })
    }
  }

  //=================== autocomplete section =========================
  $scope.showAutoCompleteReason = false;
  $scope.showAutoCompleteTreatmentUnitAC = false;
  $scope.showAutoCompleteTrustedDoctorAC = false;
  $scope.AutoCompleteSearch = function (type) {
    var filterTextTimeout;
    var typeAuto = "";
    var watch = "";
    switch (type) {
      case "TreatmentUnitAC":
        $scope.showAutoCompleteTreatmentUnitAC = true;
        $scope.showAutoCompleteReason = false;
        $scope.showAutoCompleteTrustedDoctorAC = false;
        typeAuto = "TreatmentUnitAC";
        $scope.wordListUnit = null;
        watch = 'createDayVacationData.treatmentUnitAC';
        break;
      case "SubjectLeaveAC":
        $scope.showAutoCompleteReason = true;
        $scope.showAutoCompleteTreatmentUnitAC = false;
        $scope.showAutoCompleteTrustedDoctorAC = false;
        typeAuto = "SubjectLeaveAC";
        $scope.wordListReason = null;
        watch = 'createDayVacationData.subjectLeaveAC';
        break;
      case "TrustedDoctorAC":
        $scope.showAutoCompleteTrustedDoctorAC = true;
        $scope.showAutoCompleteReason = false;
        $scope.showAutoCompleteTreatmentUnitAC = false;
        typeAuto = "TrustedDoctorAC";
        $scope.wordListDoctor = null;
        watch = 'createDayVacationData.trustedDoctorAC';
        break;
      default:
        break;
    }
    $scope.wordList = null;
    $scope.$watch(watch, function (val) {
      if (filterTextTimeout) $timeout.cancel(filterTextTimeout);
      filterTextTimeout = $timeout(function () {
        if (val != undefined && val.length) {
          RequestApis.RC('Search/GetAutoComplete/' + typeAuto + '/' + val, 'Get', '', 'json', function (response) {
            if (response.data.success === true) {
              if (response.data.data.length) {
                type == "TreatmentUnitAC" ? $scope.wordListUnit = response.data.data : (type == "SubjectLeaveAC" ? $scope.wordListReason = response.data.data : (type == "TrustedDoctorAC" ? $scope.wordListDoctor = response.data.data : $scope.wordList = null))
              } else {
                type == "TreatmentUnitAC" ? $scope.wordListUnit = [] : (type == "SubjectLeaveAC" ? $scope.wordListReason = [] : (type == "TrustedDoctorAC" ? $scope.wordListDoctor = [] : $scope.wordList = []))
              }
            }
          })
        } else {
          RequestApis.RC('Search/GetAutoComplete/' + typeAuto + '/ ', 'Get', '', 'json', function (response) {
            if (response.data.success === true) {
              if (response.data.data.length) {
                type == "TreatmentUnitAC" ? $scope.wordListUnit = response.data.data : (type == "SubjectLeaveAC" ? $scope.wordListReason = response.data.data : (type == "TrustedDoctorAC" ? $scope.wordListDoctor = response.data.data : $scope.wordList = null))
              } else {
                type == "TreatmentUnitAC" ? $scope.wordListUnit = [] : (type == "SubjectLeaveAC" ? $scope.wordListReason = [] : (type == "TrustedDoctorAC" ? $scope.wordListDoctor = [] : $scope.wordList = []))
              }
            }
          })
        }
      }, 50); // delay 250 ms
    })

  }
  $scope.AutoCompleteSearchCreate = function (item, type) {
    if (item != undefined && item.length != 0) {
      var typeAuto = "";
      let dataList = null;
      switch (type) {
        case "TreatmentUnitAC":
          $scope.showAutoCompleteTreatmentUnitAC = true;
          typeAuto = "TreatmentUnitAC";
          dataList = $scope.wordListUnit;

          break;
        case "SubjectLeaveAC":
          $scope.showAutoCompleteReason = true;
          typeAuto = "SubjectLeaveAC";
          dataList = $scope.wordListReason;
          $scope.showAutoCompleteReason = false;
          break;
        case "TrustedDoctorAC":
          typeAuto = "TrustedDoctorAC";
          dataList = $scope.wordListDoctor;

          break;
        default:
          break;
      }
      let same = false;
      if (dataList != null) {
        Object.values(dataList).forEach(value => {
          if (value.description == item) {
            same = true;
          }
        })
      }
      if (!same) {
        RequestApis.RC('Search/InsertAutoComplete?autoCompleteName=' + typeAuto + '&str=' + item, 'Post', '', 'json', function (response) {
          $scope.showAutoCompleteTreatmentUnitAC = false;
          $scope.showAutoCompleteTrustedDoctorAC = true;
          $scope.showAutoCompleteTrustedDoctorAC = false;
        })
      }

    } else {
      $timeout(function () { $scope.cancle(type) }, 150)
    }

  }
  $scope.cancle = function (type) {
    switch (type) {
      case "TreatmentUnitAC":
        $scope.showAutoCompleteTreatmentUnitAC = false;
        break;
      case "SubjectLeaveAC":
        $scope.showAutoCompleteReason = false;
        break;
      case "TrustedDoctorAC":
        $scope.showAutoCompleteTrustedDoctorAC = false;
        break;
      default:
        break;
    }
  }
  $scope.selectPredict = function (item, type) {
    switch (type) {
      case "TreatmentUnitAC":
        $scope.createDayVacationData.treatmentUnitAC = item;
        $scope.showAutoCompleteTreatmentUnitAC = false;
        break;
      case "SubjectLeaveAC":
        $scope.createDayVacationData.subjectLeaveAC = item;
        $scope.showAutoCompleteReason = false;
        break;
      case "TrustedDoctorAC":
        $scope.createDayVacationData.trustedDoctorAC = item;
        $scope.showAutoCompleteTrustedDoctorAC = false;
        break;
      default:
        break;
    }
  }
  $scope.showReasonOfMission = function () {
    $scope.showReasonMission = $scope.showReasonMission === false
  }

  //----------- validator for dates -------------------
  $scope.setValidatorFn = function (formName, fromDate, Todate) {
    if (fromDate != undefined && Todate != undefined) {
      if ($scope.getDiffDayForVacation(fromDate, Todate) < 0) {
        global.Toast.fire({
          icon: "error",
          title: "تاریخ ها بدرستی انتخاب نشده اند",

        });
        formName.$invalid = true;
        $scope.errorForDate = true;
        $scope.createDayVacationData.toDate = "";
      } else {
        $scope.getTreatmentInfo();
        $scope.getRemindVacation();
        $scope.getMaternityInfo();
        $scope.getLeaveDayInfo();
        $scope.errorForDate = false;
        let item = {
          personId: $scope.PersonnelInfo.Id,
          fromDate: $scope.convertToMiladi(fromDate),
          toDate: $scope.convertToMiladi(Todate)
        };
        $scope.SideInfoData = {};
        RequestApis.RC(`PersonLeave/GetAllTimeRollCalls`, 'Post', item, 'json', function (response) {
          if (response.data.success) {
            $scope.SideInfoData = response.data.data;
            $scope.sideInfo = true;
          } else {
            $scope.sideInfo = false;
          }
        })
      }
    }
    $scope.checkFriday(fromDate)
  }
  $scope.checkFriday = function (fromDate) {
    if (fromDate != undefined) {
      RequestApis.RC(`PersonLeave/IsFriday?FromDate=${$scope.convertToMiladi(fromDate)}`, 'Get', '', 'json', function (response) {
        if (response.data) {
          Toast.fire({
            icon: "warning",
            title: "روز انتخاب شده شما جمعه است.",
          });
        }
      })
    }
  }
  // -------selectHourToUse--------------->>>>>>
  $scope.handleSelectHourToUse = function (id) {
    let resValue = $(`#selectHourToUse${id}`).val()
    if (resValue) {
      let hourTagId = resValue.split("-")[0];
      let hourValue = resValue.split("-")[1];
      hourValue = hourValue.split(":")[0] + ":" + hourValue.split(":")[1];
      $scope.selectedHours[hourTagId] = `selectHourToUse${id}`
      if (hourTagId == 'fromTime') {
        $scope.NExitTimeH = hourValue
      } else {
        $scope.NInterTimeH = hourValue
      }
      //check biger 4 hour-----
      if ($scope.NExitTimeH && $scope.NInterTimeH) {
        let from = parseInt($scope.NExitTimeH.split(":")[0] + $scope.NExitTimeH.split(":")[1]);
        let to = parseInt($scope.NInterTimeH.split(":")[0] + $scope.NInterTimeH.split(":")[1]);
        if ((to - from) > 400) {
          Toast.fire({
            icon: "warning",
            title: "بازه انتخاب شده بیشتر از 4 ساعت می باشد",
          });
        }
      }
      $(`#${hourTagId}`).val(hourValue);
    }
  }

  //****************************************************************************
  //**************** submit and start workflow for vacation hour ****************
  //****************************************************************************
  //========== submit and start workflow for mission hour ==============

  $scope.request = function (item) {
    let itemToSend = {
      "personId": parseInt($scope.PersonnelInfo.Id),
      "leaveDate": $scope.convertToMiladi(item.leaveDate),
      "fromTime": item.fromTime,
      "toTime": item.toTime,
      "requesterId": Number($scope.currentUserId),
      "hourLeaveStateId": 0,
      "createdBy": Number($scope.currentUserId),
      "createdAt": moment().format('YYYY-MM-DD')
    };
    RequestApis.RC('HourLeaves/Create', 'Post', itemToSend, 'json', function (responsep) {
      if (responsep.data.success == true) {
        let ParentResponse = responsep.data.data;
        $scope.RequestIdVH = responsep.data.data
        RequestApis.HR("securities/form/code?seccd=RC_HOUREL", 'get', '', '', '', function (response) {
          RequestApis.HR("workflows/form/" + response.data.Id, 'get', '', '', '', function (subResponse) {
            let requestItem = {
              "parentId": null,
              "personnelId": parseInt($scope.PersonnelInfo.Id),
              "rootId": null,
              "workflowId": subResponse.data[0].Id,
              "initialDate": moment().format('YYYY-MM-DD'),
              "requesterUserId": Number($scope.currentUserId),
              "statusTypeIdentity": 1,
              "isDone": false,
              "hasChildren": false,
              "title": "درخواست مرخصی ساعتی " + $scope.PersonnelInfo.PoliteName,
              "requestNo": "RC_HOUREL",
              "comment": "",
              "additionalInfo": JSON.stringify(
                {
                  personnelId: $scope.PersonnelInfo.Id,
                  userId: $scope.currentUserId,
                  title: "درخواست مرخصی ساعتی " + $scope.PersonnelInfo.PoliteName,
                  hourVacationId: ParentResponse
                }),
              "requestTypeIdentity": subResponse.data[0].Id,
              "createdBy": Number($scope.currentUserId),
              "createdAt": moment().format('YYYY-MM-DD')
            }
            RequestApis.RC('Request/CreateRequest/' + $scope.PersonnelInfo.Id, 'Post', requestItem, 'json', function (responsex) {
              if (responsex.data.success == true) {
                $scope.SubmitOccured = true;
                $scope.dynamicBtns(ParentResponse, responsex.data.data);
              }
            })
          })
        })

      } else {
        if (responsep.data.errorMessages != undefined) {
          if (responsep.data.errorMessages[0].trim() === "HASOVERLAP") {
            Toast.fire({
              icon: "success",
              title: "تداخل زمانی وجود دارد لطفا تاریخ را بررسی نمایید",
            });
          } else if (responsep.data.errorMessages[0].trim() === "ISCLOSEDDAY") {
            Toast.fire({
              icon: "success",
              title: "شما به دلیل بسته شدن محاسبه کارکردتان در تاریخ انتخابی امکان ثبت مرخصی را ندارید",
            });
            $scope.showClosedList(responsep.data);
          } else if (responsep.data.errorMessages[0].trim() === "HasOverlapDailyMission") {
            Toast.fire({
              icon: "success",
              title: "شما قبلا مأموریت روزانه در این روز ، ثبت نموده اید",
            });
          } else if (responsep.data.errorMessages[0].trim() === "HasOverlapDailyLeave") {
            Toast.fire({
              icon: "success",
              title: "شما قبلا مرخصی روزانه در این روز، ثبت نموده اید",
            });
          } else if (responsep.data.errorMessages[0].trim() === "HasOverlapHourMission") {
            Toast.fire({
              icon: "success",
              title: "شما قبلا مأموریت ساعتی در این روز، ثبت نموده اید",
            });
          } else {
            Toast.fire({
              icon: "error",
              title: responsep.data.errorMessages[0] ?? "عملیات با خطا مواجه شد",
            });
          }

        }
      }
    })
  }
  $scope.dynamicBtns = function (vacationId, requestId) {
    $scope.useVacationId = vacationId;
    $scope.requestId = requestId;
    RequestApis.HR("workflows/request/" + requestId + "/status/", 'Get', '', '', '', function (response1) {
      $scope.formInformationVacationH = response1.data[0];
      RequestApis.HR("workflows/state/" + $scope.formInformationVacationH.StateId + "/actions", 'Get', '', '', '', function (response2) {
        $scope.buttonsArrayShowDay = false;
        if (response2.status == 200) {
          $scope.buttonsArray = response2.data;
          $scope.buttonsArrayShow = true;
        } else {
          $scope.buttonsArray = [];
          $scope.buttonsArrayShow = false;
        }
      })
    })
  }
  $scope.DynamicConfirms = function (actionType, itemToUpdate, mode) {
    if (mode === "create") {
      $scope.EditMode = false;
    } else {
      $scope.EditMode = true;
    }
    $scope.buttonsArrayShow = true;
    $scope.buttonsArrayShowDay = false;
    let idRequest = $scope.requestId ?? $scope.urlsearch.requestId;
    $scope.selectedManagers(idRequest, actionType, itemToUpdate);
  }

  // ----- show traffic for selected day------->>>>
  $scope.showTrafficThisDay = function () {
    let thisDate = $scope.convertToMiladi($('#startHDate').val());

    var path =
      "PersonRollCalls/GetListPersonRollCall/" +
      $scope.PersonnelInfo.Id +
      "?FromDt=" +
      thisDate +
      "&ToDt=" +
      thisDate;

    RequestApis.RC(path, 'Get', '', 'json', function (response) {
      $scope.trafficHours = response.data
    })
  }

  //========== managers list ================
  $scope.selectedManagers = function (requestid, actionType, itemToUpdate) {
    $scope.itemsToUpdateH = itemToUpdate;
    $scope.buttonInfoH = actionType;
    let psn = "";
    if (global.checkExist($scope.urlsearch) && !isNaN($scope.urlsearch.personelId)) {
      psn = psn.concat(`&psn=${$scope.urlsearch.personelId}`)
    } else {
      psn = psn.concat(`&psn=${$scope.PersonnelInfo.Id}`)
    }
    let curst = "";
    if (global.checkExist($scope.formInformationVacationH.StateId)) {
      curst = curst.concat(`&curst=${$scope.formInformationVacationH.StateId}`)
    }
    let nxtst = "";
    if (global.checkExist(actionType.NextStateId)) {
      nxtst = nxtst.concat(`&nxtst=${actionType.NextStateId}`)
    }
    let act = "";
    if (global.checkExist(actionType.ActionId)) {
      act = act.concat(`&act=${actionType.ActionId}`)
    }
    RequestApis.HR(`workflows/actortype/${actionType.ActorTypeId}/next/personnel?rq=${requestid}${psn}${curst}${nxtst}${act}${$scope.ach !== undefined ? "&ach=" + $scope.ach : ""}&paging.ps=${$scope.personnelSelectedPS != undefined ? $scope.personnelSelectedPS : 10}&paging.pn=${$scope.personnelSelectedPN != undefined ? $scope.personnelSelectedPN : 1}`, 'Get', '', '', '', function (response) {
      $scope.requestId = requestid;
      $scope.addToManager = [];
      if (response.status === 200) {
        $scope.managers = response.data;
        if ($scope.managers.Items.length) {
          $("#selectManagers").fadeIn();
        } else {
          $scope.SendToManager($scope.addToManager, requestid);
        }
      } else {
        $scope.SendToManager($scope.addToManager, requestid);
      }
    })
  }

  $scope.loadPagePersonnelSelected = function (page) {
    if ($scope.managers.TotalPages >= page && $scope.managers.TotalPages > $scope.managers.PageIndex && page > 0) {
      $scope.personnelSelectedPN = Number(page);
      $scope.selectedManagers($scope.requestId, $scope.buttonInfoH, $scope.itemsToUpdateH);
    }
  }
  $scope.pageSizePersonnelSelected = function (size) {
    $scope.personnelSelectedPS = Number(size);
    $scope.selectedManagers($scope.requestId, $scope.buttonInfoH, $scope.itemsToUpdateH);
  }


  $scope.cancelManagerSelection = function () {
    $("#selectManagers").fadeOut();
    $scope.addToManager = [];
  }
  $scope.addToManager = [];
  $scope.Addmanagers = function (item) {
    if (document.getElementById(`select-manager-${item}`).checked) {
      if (!$scope.addToManager.some(x => x === item)) {
        $scope.addToManager.push(item)
      }
    } else {
      $scope.addToManager = $scope.addToManager.filter(y => y != item)
    }
  }
  $scope.confirmSelectManagers = function () {
    $("#selectManagers").fadeOut();
    let requestId = $scope.requestId ?? $scope.urlsearch.requestId
    $scope.SendToManager($scope.addToManager, requestId);
    $scope.addToManager = [];
  }
  $scope.SendToManager = function (managersId, requestId) {
    $scope.managersIdH = managersId;
    const { value: text } = Swal.fire({
      input: 'textarea',
      inputLabel: 'یادداشت',
      inputPlaceholder: ' در صورت تمایل یادداشت خود را بگذارید...',
      inputAttributes: {
        'aria-label': ' در صورت تمایل یادداشت خود را بگذارید...'
      },
      customClass: {
        input: 'small-font',
        confirmButton: 'small-font',
      },
      confirmButtonText: 'تأیید'
    }).then((result) => {
      if (result.isConfirmed) {
        if (result.value.length) {
          $scope.Comment = result.value;
          let str = '"' + result.value + '"';
          RequestApis.HR('workflows/request/' + requestId + '/notes', "Post", '', '', str, function (response) {
          })
        }
        RequestApis.HR("workflows/request/" + requestId, 'get', '', '', '', function (response) {
          if (response.status === 200) {
            $scope.itemToUpdateFuncH($scope.itemsToUpdateH);
          } else {
            Toast.fire({
              icon: 'error',
              title: 'عملیات در مرحله دریافت اطلاعات درخواست، با خطا مواجه شد'
            })
          }
        })
      }
    })
  }
  $scope.getDetailsForManagerAcception = function (id) {
    $scope.useVacationId = id;
    $scope.hourVacation = false;
    $scope.DetailsDayMode = false;
    $scope.dayVacation = false;
    RequestApis.RC('HourLeaves/GetById/' + id + '/true', 'Get', '', 'json', function (response) {
      if (response.status === 200) {
        $scope.hourVacationDetailsData = response.data.data;
        $scope.DetailsHourMode = true;
      } else {
        Toast.fire({
          icon: 'error',
          title: 'خطا در دریافت اطلاعات'
        })
      }
    })
  }
  $scope.itemToUpdateFuncH = function (items) {
    let requestId = $scope.requestId ?? $scope.urlsearch.requestId;
    let subItemToSend = {};
    if ($scope.EditMode) {
      subItemToSend = {
        "personId": items.personId,
        "leaveDate": items.leaveDate,
        "fromTime": items.fromTime,
        "toTime": items.toTime,
        "requestId": Number(requestId),
        "requesterId": Number($scope.currentUserId),
        "id": items.id,
        "updatedBy": Number($scope.currentUserId),
        "updatedAt": moment().format('YYYY-MM-DD')
      }
    } else {
      subItemToSend = {
        "id": $scope.RequestIdVH,
        "personId": parseInt($scope.PersonnelInfo.Id),
        "leaveDate": $scope.convertToMiladi(items.leaveDate),
        "fromTime": items.fromTime,
        "toTime": items.toTime,
        "requestId": Number(requestId),
        "requesterId": Number($scope.currentUserId),
        "updatedBy": Number($scope.currentUserId),
        "updatedAt": moment().format('YYYY-MM-DD')
      }
    }
    $scope.finalRequest = true;
    if ($scope.buttonInfoH.PreUrls != undefined) {
      RequestApis.RC($scope.buttonInfoH.PreUrls[0], 'Post', subItemToSend, 'json', function (response) {
        if (response.data.success == true) {
          RequestApis.HR("workflows/request/" + requestId, 'get', '', '', '', function (response7) {
            var itemTosend = {
              Id: response7.data.Id,
              RowVersion: response7.data.RowVersion,
              ActionId: $scope.buttonInfoH.ActionId,
              NextPersonnel: []
            }
            for (var i = 0; i < $scope.managersIdH.length; i++) {
              var itemToPsuh = {
                ActorTypeId: $scope.buttonInfoH.ActorTypeId,
                ActionTransitionId: $scope.buttonInfoH.ActionTransitionId,
                PersonnelId: $scope.managersIdH[i]
              }
              itemTosend.NextPersonnel.push(itemToPsuh);
            }
            let bhus = ""
            if (global.checkExist($scope.urlsearch) && global.checkExist($scope.urlsearch.behalfId)) {
              bhus = bhus.concat(`?bhus=${$scope.urlsearch.behalfId}`)
            }
            RequestApis.HR(`workflows/request/${requestId}/simple/move${bhus}`, 'Patch', '', '', itemTosend, function (response) {
              if (response.status === 200) {
                Toast.fire({
                  icon: "success",
                  title: "عملیات با موفقیت انجام شد",
                }).then((result) => {
                  if ($scope.EditMode) {
                    window.parent.location.href = check ? `${window.origin}/${window.location.pathname.toString().split("/")[1]}/GlobalValue/cartable.html?data=inbox` : `${window.origin}/GlobalValue/cartable.html?data=inbox`;
                  } else {
                    window.parent.location.href = check ? `${window.origin}/${window.location.pathname.toString().split("/")[1]}/GlobalValue/cartable.html?data=outbox` : `${window.origin}/GlobalValue/cartable.html?data=outbox`;
                  }
                })
              } else {
                Toast.fire({
                  icon: "error",
                  title: response.data.errorMessages ?? "عملیات در مرحله ارسال به شخص بعدی با خطا مواجه شد",
                });
              }
            })
          })
        } else {
          Toast.fire({
            icon: "error",
            title: response.data.errorMessages ?? "عملیات  تأیید با خطا مواجه شد",
          });
        }
      })

    } else {
      RequestApis.HR("workflows/request/" + requestId, 'get', '', '', '', function (response7) {
        var itemTosend = {
          Id: response7.data.Id,
          RowVersion: response7.data.RowVersion,
          ActionId: $scope.buttonInfoH.ActionId,
          NextPersonnel: []
        }
        for (var i = 0; i < $scope.managersIdH.length; i++) {
          var itemToPsuh = {
            ActorTypeId: $scope.buttonInfoH.ActorTypeId,
            ActionTransitionId: $scope.buttonInfoH.ActionTransitionId,
            PersonnelId: $scope.managersIdH[i]
          }
          itemTosend.NextPersonnel.push(itemToPsuh);
        }
        let bhus = ""
        if (global.checkExist($scope.urlsearch) && global.checkExist($scope.urlsearch.behalfId)) {
          bhus = bhus.concat(`?bhus=${$scope.urlsearch.behalfId}`)
        }
        RequestApis.HR(`workflows/request/${requestId}/simple/move${bhus}`, 'Patch', '', '', itemTosend, function (response) {
          if (response.status === 200) {
            Toast.fire({
              icon: "success",
              title: "عملیات با موفقیت انجام شد",
            }).then((result) => {
              if ($scope.EditMode) {
                window.parent.location.href = check ? `${window.origin}/${window.location.pathname.toString().split("/")[1]}/GlobalValue/cartable.html?data=inbox` : `${window.origin}/GlobalValue/cartable.html?data=inbox`;
              } else {
                window.parent.location.href = check ? `${window.origin}/${window.location.pathname.toString().split("/")[1]}/GlobalValue/cartable.html?data=outbox` : `${window.origin}/GlobalValue/cartable.html?data=outbox`;
              }
            })
          } else {
            Toast.fire({
              icon: "error",
              title: response.data.errorMessages ?? "عملیات در مرحله ارسال به شخص بعدی با خطا مواجه شد",
            });
          }
        })
      })
    }
  }

  //****************************************************************************
  //************* submit and start workflow for vacation day ******************
  //****************************************************************************

  $scope.requestDay = function (item) {
    if ($scope.treatment && $scope.treatment != undefined && !$scope.treatmentData.canEsLeave) {
      Toast.fire({
        icon: 'warning',
        title: 'شما امکان ثبت  درخواست مرخصی استعلاجی را ندارید.'
      })
    } else if ($scope.maternity && $scope.maternityData != undefined && !$scope.maternityData.allowedCntDays == 0) {
      Toast.fire({
        icon: 'warning',
        title: 'شما امکان ثبت  درخواست مرخصی زایمان را ندارید.'
      })
    } else {
      let itemtosend = {
        "personId": $scope.PersonnelInfo.Id,
        "personName": $scope.PersonnelInfo.PoliteName,
        "fromDate": $scope.convertToMiladi(item.fromDate),
        "toDate": $scope.convertToMiladi(item.toDate),
        "leaveStateId": 0,
        "leaveStateTitle": "درخواست",
        "dayLeaveTypeId": item.SelectVacationTypeInCreate.id,
        "dayLeaveTypeTitle": item.SelectVacationTypeInCreate.name,
        "description": item.description != undefined ? item.description : null,
        "subjectLeave": item.subjectLeaveAC != undefined ? item.subjectLeaveAC : null,
        "treatmentUnit": item.treatmentUnitAC != undefined ? item.treatmentUnitAC : null,
        "doctorName": item.treatmentDoctor != undefined ? item.treatmentDoctor : null,
        "medicalSystemNo": item.doctorialNum != undefined ? item.doctorialNum : null,
        "trustedDoctor": item.trustedDoctorAC != undefined ? item.trustedDoctorAC : null,
        "letterNo": item.letterNum != undefined ? item.letterNum : null,
        "licenseNo": item.licenseNum != undefined ? item.licenseNum : null,
        "licenseDate": item.licenseDate != undefined ? $scope.convertToMiladi(item.licenseDate) : null,
        "requesterId": Number($scope.currentUserId),
        "createdBy": Number($scope.currentUserId),
        "createdAt": moment().format('YYYY-MM-DD')
      }
      RequestApis.RC('PersonLeave/UpsertPersonLeaveBatch', 'Post', [itemtosend], 'json', function (response) {
        if (response.data.success == true) {
          let ParentResponse = response.data.data[0];
          $scope.createdId = response.data.data[0].Id;
          RequestApis.HR("securities/form/code?seccd=" + $scope.WorkFlowCode, 'get', '', '', '', function (response) {
            RequestApis.HR("workflows/form/" + response.data.Id, 'get', '', '', '', function (subResponse) {
              let requestItem = {
                "parentId": null,
                "personnelId": parseInt($scope.PersonnelInfo.Id),
                "rootId": null,
                "workflowId": subResponse.data[0].Id,
                "initialDate": moment().format('YYYY-MM-DD'),
                "requesterUserId": Number($scope.currentUserId),
                "statusTypeIdentity": 1,
                "isDone": false,
                "hasChildren": false,
                "title": "درخواست مرخصی " + $scope.workFlowCodePersian + " برای " + $scope.PersonnelInfo.PoliteName,
                "requestNo": $scope.WorkFlowCode,
                "comment": "",
                "additionalInfo": JSON.stringify({
                  personnelId: $scope.PersonnelInfo.Id,
                  userId: $scope.currentUserId,
                  title: "درخواست مرخصی " + $scope.workFlowCodePersian + " برای " + $scope.PersonnelInfo.PoliteName,
                  dailyVacationId: ParentResponse.Id
                }),
                "requestTypeIdentity": subResponse.data[0].Id,
                "createdBy": Number($scope.currentUserId),
                "createdAt": moment().format('YYYY-MM-DD')
              }
              RequestApis.RC('Request/CreateRequest/' + $scope.PersonnelInfo.Id, 'Post', requestItem, 'json', function (response) {
                if (response.data.success == true) {
                  $scope.SubmitOccured = true;
                  $scope.dynamicBtnsDay(ParentResponse, response.data.data);
                }
              })
            })
          })

        } else {
          if (response.data.errorMessages != undefined) {
            if (response.data.errorMessages[0].trim() === "HASOVERLAP") {
              Toast.fire({
                icon: "success",
                title: "تداخل زمانی وجود دارد لطفا تاریخ را بررسی نمایید",
              });
            } else if (response.data.errorMessages[0].trim() === "ISCLOSEDDAY") {
              Toast.fire({
                icon: "success",
                title: "شما به دلیل بسته شدن محاسبه کارکردتان در تاریخ انتخابی امکان ثبت مأموریت را ندارید",
              });
              $scope.showClosedList(response.data);
            } else if (response.data.errorMessages[0].trim() === "HasOverlapHourMission") {
              Toast.fire({
                icon: "success",
                title: "شما قبلا مأموریت ساعتی در یکی از روزهای این بازه تاریخی انتخابیتان، ثبت نموده اید",
              });
            } else if (response.data.errorMessages[0].trim() === "HasOverlapDailyMission") {
              Toast.fire({
                icon: "success",
                title: "شما قبلا مأموریت روزانه در یکی از روزهای این بازه تاریخی انتخابیتان، ثبت نموده اید",
              });
            } else if (response.data.errorMessages[0].trim() === "HasOverlapHourLeave") {
              Toast.fire({
                icon: "success",
                title: "شما قبلا مرخصی ساعتی در یکی از روزهای این بازه تاریخی انتخابیتان، ثبت نموده اید",
              });
            } else {
              Toast.fire({
                icon: "error",
                title: response.data.errorMessages[0] ?? "عملیات با خطا مواجه شد",
              });
            }
          }
        }
      })
    }
  }
  $scope.dynamicBtnsDay = function (items, requestId) {
    $scope.returnDataFromCreateApiDay = items;
    $scope.requestIdDay = requestId;
    RequestApis.HR("workflows/request/" + requestId + "/status/", 'Get', '', '', '', function (response1) {
      $scope.formInformation = response1.data[0];
      RequestApis.HR("workflows/state/" + $scope.formInformation.StateId + "/actions", 'Get', '', '', '', function (response2) {
        $scope.buttonsArrayShow = false;
        if (response2.status == 200) {
          $scope.buttonsArrayDay = response2.data;
          $scope.buttonsArrayShowDay = true;

        } else {
          $scope.buttonsArrayDay = [];
          $scope.buttonsArrayShowDay = false;
        }
      })
    })
  }
  $scope.DynamicConfirmsDay = function (actionType, itemToUpdate, mode) {
    if (mode === "create") {
      $scope.EditMode = false;
    } else {
      $scope.EditMode = true;
    }
    let requestId = $scope.requestIdDay ?? $scope.urlsearch.requestId;
    $scope.buttonsArrayShowDay = true;
    $scope.buttonsArrayShow = false;
    $scope.selectedManagersDay(requestId, actionType, itemToUpdate);
  }
  $scope.selectedManagersDay = function (requestid, actionType, itemToUpdate) {
    $scope.itemsToUpdate = itemToUpdate;
    $scope.buttonInfoDay = actionType;
    let psn = "";
    if (global.checkExist($scope.urlsearch) && !isNaN($scope.urlsearch.personelId)) {
      psn = psn.concat(`&psn=${$scope.urlsearch.personelId}`)
    } else {
      psn = psn.concat(`&psn=${$scope.PersonnelInfo.Id}`)
    }
    let curst = "";
    if (global.checkExist($scope.formInformationMIssionH.StateId)) {
      curst = curst.concat(`&curst=${$scope.formInformationMIssionH.StateId}`)
    }
    let nxtst = "";
    if (global.checkExist(actionType.NextStateId)) {
      nxtst = nxtst.concat(`&nxtst=${actionType.NextStateId}`)
    }
    let act = "";
    if (global.checkExist(actionType.ActionId)) {
      act = act.concat(`&act=${actionType.ActionId}`)
    }
    RequestApis.HR(`workflows/actortype/${actionType.ActorTypeId}/next/personnel?rq=${requestid}${psn}${curst}${nxtst}${act}${$scope.ach !== undefined ? "&ach=" + $scope.ach : ""}&paging.ps=${$scope.personnelSelectedPSD != undefined ? $scope.personnelSelectedPSD : 10}&paging.pn=${$scope.personnelSelectedPND != undefined ? $scope.personnelSelectedPND : 1}`, 'Get', '', '', '', function (response) {
      $scope.requestIdDay = requestid;
      $scope.addToManagerDay = [];
      if (response.status === 200) {
        $scope.managers = response.data;
        if ($scope.managers.Items.length) {
          $("#selectManagers").fadeIn();
        } else {
          $scope.SendToManagerDay($scope.addToManagerDay, requestid);
        }
      } else {
        $scope.SendToManagerDay($scope.addToManagerDay, requestid);
      }
    })
  }

  $scope.getMore = function () {
    $scope.ach = 1;
    if ($scope.buttonsArrayShow) {
      $scope.selectedManagers($scope.requestId, $scope.buttonInfoH, $scope.itemsToUpdateH);
    }
    if ($scope.buttonsArrayShowDay) {

      $scope.selectedManagersDay($scope.requestIdDay, $scope.buttonInfoDay, $scope.itemsToUpdate);
    }
  }
  $scope.loadPagePersonnelSelected = function (page) {
    if ($scope.managers.TotalPages >= page && $scope.managers.TotalPages > $scope.managers.PageIndex && page > 0) {
      $scope.personnelSelectedPND = Number(page);
      $scope.selectedManagersDay($scope.requestIdDay, $scope.buttonInfoDay, $scope.itemsToUpdate);
    }
  }
  $scope.pageSizePersonnelSelected = function (size) {
    $scope.personnelSelectedPSD = Number(size);
    $scope.selectedManagersDay($scope.requestIdDay, $scope.buttonInfoDay, $scope.itemsToUpdate);
  }



  $scope.cancelManagerSelection = function () {
    $("#selectManagers").fadeOut();
    $scope.addToManager = [];
  }
  $scope.addToManager = [];
  $scope.Addmanagers = function (item) {
    if (document.getElementById(`select-manager-${item}`).checked) {
      if (!$scope.addToManager.some(x => x === item)) {
        $scope.addToManager.push(item)
      }
    } else {
      $scope.addToManager = $scope.addToManager.filter(y => y != item)
    }
  }
  $scope.confirmSelectManagersDay = function () {
    $("#selectManagers").fadeOut();
    let requestId = $scope.requestIdDay ?? $scope.urlsearch.requestId;
    $scope.SendToManagerDay($scope.addToManager, requestId);
    $scope.addToManager = [];
  }
  $scope.SendToManagerDay = function (managersId, requestId) {
    $scope.managersId = managersId;
    const { value: text } = Swal.fire({
      input: 'textarea',
      inputLabel: 'یادداشت',
      inputPlaceholder: ' در صورت تمایل یادداشت خود را بگذارید...',
      inputAttributes: {
        'aria-label': ' در صورت تمایل یادداشت خود را بگذارید...'
      },
      customClass: {
        input: 'small-font',
        confirmButton: 'small-font',
      },
      confirmButtonText: 'تأیید'
    }).then((result) => {
      if (result.isConfirmed) {
        if (result.value.length) {
          $scope.Comment = result.value;
          let str = '"' + result.value + '"';
          RequestApis.HR('workflows/request/' + requestId + '/notes', "Post", '', '', str, function (response0) {
          })
        }
        RequestApis.HR("workflows/request/" + requestId, 'get', '', '', '', function (response) {
          if (response.status === 200) {
            $scope.itemToUpdateFunc($scope.itemsToUpdate);
          } else {
            Toast.fire({
              icon: 'error',
              title: 'عملیات در مرحله دریافت اطلاعات درخواست، با خطا مواجه شد'
            })
          }
        })
      }
    })
  }
  $scope.itemToUpdateFunc = function (item) {
    let requestId = $scope.requestIdDay ?? $scope.urlsearch.requestId;
    let subItemToSend = {};
    if ($scope.EditMode) {
      subItemToSend = {
        "id": item.id,
        "personId": item.personId,
        "personName": item.personName,
        "fromDate": item.fromDate,
        "toDate": item.toDate,
        "dayLeaveTypeId": item.dayLeaveTypeId,
        "dayLeaveTypeTitle": item.dayLeaveTypeTitle,
        "description": item.description,
        "subjectLeave": item.subjectLeave,
        "treatmentUnit": item.treatmentUnit,
        "doctorName": item.doctorName,
        "medicalSystemNo": item.medicalSystemNo,
        "trustedDoctor": item.trustedDoctor,
        "letterNo": item.letterNo,
        "licenseNo": item.licenseNo,
        "licenseDate": item.licenseDate,
        "requestId": Number(requestId),
        "requesterId": Number($scope.currentUserId),
        "updatedBy": Number($scope.currentUserId),
        "updatedAt": moment().format('YYYY-MM-DD')
      }
    } else {
      subItemToSend = {
        "id": $scope.createdId,
        "personId": $scope.PersonnelInfo.Id,
        "personName": $scope.PersonnelInfo.PoliteName,
        "fromDate": $scope.convertToMiladi(item.fromDate),
        "toDate": $scope.convertToMiladi(item.toDate),
        "dayLeaveTypeId": item.SelectVacationTypeInCreate.id,
        "dayLeaveTypeTitle": item.SelectVacationTypeInCreate.name,
        "description": item.description != undefined ? item.description : null,
        "subjectLeave": item.subjectLeaveAC != undefined ? item.subjectLeaveAC : null,
        "treatmentUnit": item.treatmentUnitAC != undefined ? item.treatmentUnitAC : null,
        "doctorName": item.treatmentDoctor != undefined ? item.treatmentDoctor : null,
        "medicalSystemNo": item.doctorialNum != undefined ? item.doctorialNum : null,
        "trustedDoctor": item.trustedDoctorAC != undefined ? item.trustedDoctorAC : null,
        "letterNo": item.letterNum != undefined ? item.letterNum : null,
        "licenseNo": item.licenseNum != undefined ? item.licenseNum : null,
        "licenseDate": item.licenseDate != undefined ? $scope.convertToMiladi(item.licenseDate) : null,
        "requesterId": Number($scope.currentUserId),
        "createdBy": Number($scope.currentUserId),
        "createdAt": moment().format('YYYY-MM-DD')
      }
    }
    $scope.finalRequest = true;
    if ($scope.buttonInfoDay.PreUrls != undefined) {
      RequestApis.RC($scope.buttonInfoDay.PreUrls[0], 'Post', subItemToSend, 'json', function (response3) {
        if (response3.data.success == true) {
          RequestApis.HR("workflows/request/" + requestId, 'get', '', '', '', function (response7) {
            var itemTosend = {
              Id: response7.data.Id,
              RowVersion: response7.data.RowVersion,
              ActionId: $scope.buttonInfoDay.ActionId,
              NextPersonnel: []
            }
            for (var i = 0; i < $scope.managersId.length; i++) {
              var itemToPsuh = {
                ActorTypeId: $scope.buttonInfoDay.ActorTypeId,
                ActionTransitionId: $scope.buttonInfoDay.ActionTransitionId,
                PersonnelId: $scope.managersId[i]
              }
              itemTosend.NextPersonnel.push(itemToPsuh);
            }
            let bhus = ""
            if (global.checkExist($scope.urlsearch) && global.checkExist($scope.urlsearch.behalfId)) {
              bhus = bhus.concat(`?bhus=${$scope.urlsearch.behalfId}`)
            }
            RequestApis.HR(`workflows/request/${requestId}/simple/move${bhus}`, 'Patch', '', '', itemTosend, function (response) {
              if (response.status === 200) {
                Toast.fire({
                  icon: "success",
                  title: "عملیات با موفقیت انجام شد",
                }).then((result) => {
                  if ($scope.EditMode) {
                    window.parent.location.href = check ? `${window.origin}/${window.location.pathname.toString().split("/")[1]}/GlobalValue/cartable.html?data=inbox` : `${window.origin}/GlobalValue/cartable.html?data=inbox`;
                  } else {
                    window.parent.location.href = check ? `${window.origin}/${window.location.pathname.toString().split("/")[1]}/GlobalValue/cartable.html?data=outbox` : `${window.origin}/GlobalValue/cartable.html?data=outbox`;
                  }
                })
              } else {
                Toast.fire({
                  icon: "error",
                  title: response.data.errorMessages ?? "عملیات در مرحله ارسال به شخص بعدی با خطا مواجه شد",
                });
              }
            })
          })

        } else {
          {
            Toast.fire({
              icon: "error",
              title: response.data.errorMessages ?? "عملیات در مرحله بروزرسانی در سیستم تردد با خطا مواجه شد",
            });
          }
        }
      })
    } else {
      Toast.fire({
        icon: "error",
        title: response.data.errorMessages ?? "عملیات با موفقیت شد",
      });
    }
  }
  $scope.getDetailsForManagerAcceptionDay = function (id) {
    $scope.dayVacation = false;
    $scope.DetailsHourMode = false;
    $scope.hourVacation = false;
    RequestApis.RC('PersonLeave/GetById/' + id, 'Get', '', 'json', function (response) {
      if (response.status === 200) {
        $scope.dayVacationDetailsData = response.data.data;
        $scope.DetailsDayMode = true;
        $scope.getRemindVacation();
        $scope.getTreatmentInfo();
        $scope.getMaternityInfo();
      } else {
        Toast.fire({
          icon: 'error',
          title: 'خطا در دریافت اطلاعات'
        })
      }
    })
  }
  $scope.showClosedList = function (items) {
    $scope.showClosedList = items;
    $('#showClosedModal').fadeIn();
  }
  $scope.closeClosedList = function () {
    $('#showClosedModal').fadeOut();
  }
})
app.controller("trafficRequestCtrl", function ($scope, RequestApis, $templateCache, $state, $timeout, $location, global) {
  $templateCache.remove($state.current.templateUrl);
  //========= initial variable =============
  this.$onInit = function () {
    $scope.getPersonnelInfo();
    $scope.getDataWithCookie();
  }

  $scope.getPersonnelInfo = function (id) {
    global.urlInfo(function (data) {
      $scope.currentUserId = data.UserId;
      RequestApis.HR(`personnel/user/${$scope.currentUserId}/current`, 'Get', '', '', '', function (response) {
        if (response.status === 200) {
          $scope.PersonnelDetails(response.data);
        }
      })
    })
  }
  $scope.PersonnelDetails = function (item) {
    $scope.PersonnelInfo = item;
  }
  $scope.CheckStateDay = false;
  $scope.CheckState = false;
  $scope.createDayVacationData = {};
  $scope.showReasonMission = false
  $scope.hourVacation = false;
  $scope.dayVacation = false;
  $scope.SubmitOccured = false;
  $scope.buttonsArrayShowTraffic = false;
  $scope.finalRequest = false;
  $scope.returnDataFromCreateApi = [];
  $scope.getDataWithCookie = function () {
    if (window.location.toString().split("?").length != 1) {
      var search = window.location.search.substring(1);
      $scope.urlsearch = JSON.parse('{"' + decodeURI(search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"') + '"}')
      if ($scope.urlsearch.TrafficId != undefined) {
        $scope.checkStatus($scope.urlsearch);
        $scope.updateState = true;
      } else { $scope.updateState = false; }
    }
  }
  $scope.checkStatus = function (items) {
    RequestApis.HR("workflows/request/" + items.requestId + "/status/", 'Get', '', '', '', function (response1) {
      $scope.formInformation = response1.data[0];
      RequestApis.HR("workflows/state/" + $scope.formInformation.StateId + "/actions", 'Get', '', '', '', function (response2) {
        if (response2.status == 200) {
          if (items.stateBox === "inbox") {
            $scope.CheckState = true;
            $scope.buttonsArrayTraffic = response2.data;
          } else {
            $scope.CheckState = false;
            $scope.buttonsArrayTraffic = [];
          }
        }
        $scope.getDetailsForManagerAcception(items.TrafficId);
        $scope.buttonsArrayShowTraffic = true;
        $scope.finalRequest = true;
      })
    })
  }
  //========== toast notification ==========
  const Toast = Swal.mixin({
    toast: true,
    position: 'center',
    showConfirmButton: false,
    timer: 2000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer)
      toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
  })
  //========== remove WhiteSpaces ==========
  Object.defineProperty(String.prototype, "removeWhiteSpaces", {
    value: function removeWhiteSpaces() {
      return this.replace(/\s+/g, '');
    },
    writable: true,
    configurable: true
  });

  //========= convert num to string ========
  $scope.convertNumToString = function (date) {
    return data.toString();
  }

  //===== convert date to shamsi ===========
  $scope.convertToShamsi = function (date) {
    if (date != null) {
      return moment(date, 'YYYY/M/D').format('jYYYY/jMM/jDD');
    } else {
      return "-"
    }
  }

  //====== convert date to miladi ==========
  $scope.convertToMiladi = function (date) {
    if (date != null) {
      return moment(date, 'jYYYY/jM/jD').format('YYYY-MM-DD');
    } else {
      return "-"
    }
  }

  //======= Get days from to Date ==========
  $scope.getDiffDayForVacation = function (dateFrom, DateTo) {
    var datefrom = new Date(dateFrom.toString().split('T')[0]);
    var dateto = new Date(DateTo.toString().split('T')[0]);
    let Diff_In_Time = dateto.getTime() - datefrom.getTime();
    let Diff_In_Days = Diff_In_Time / (1000 * 3600 * 24);
    return Diff_In_Days + 1;
  }

  //============= date picker===============
  $scope.maskInput = function () {
    setTimeout(function () {
      $(".date-picker").datepicker({
        dateFormat: "yy/mm/dd",
        changeMonth: true,
        changeYear: true,

      });
      $('.time').clockpicker();
    }, 500)
    $('.time').inputmask({ regex: "(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]", "placeholder": "HH:MM" });
    $('.date-picker').change(function () {
      angular.element($(this)).triggerHandler('input');
    });
    $('.time').change(function () {
      angular.element($(this)).triggerHandler('input');
    });

  }

  //----------- validator for dates -------------------
  $scope.setValidatorFn = function (formName, fromDate, Todate) {
    if (fromDate != undefined && Todate != undefined) {
      if ($scope.getDiffDayForVacation(fromDate, Todate) < 0) {
        Toast.fire({
          icon: "error",
          title: "تاریخ پایان نمیتواند قبلتر از تاریخ شروع باشد",

        });
        formName.$invalid = true;
        $scope.errorForDate = true;
      } else {
        $scope.getTreatmentInfo();
        $scope.getRemindVacation();
        $scope.getMaternityInfo();
        $scope.errorForDate = false;
      }
    }
  }
  // -------selectHourToUse--------------->>>>>>
  $scope.handleSelectHourToUse = function (id) {
    let resValue = $(`#selectHourToUse${id}`).val()
    if (resValue) {
      let hourTagId = resValue.split("-")[0];
      let hourValue = resValue.split("-")[1];
      hourValue = hourValue.split(":")[0] + ":" + hourValue.split(":")[1];
      $scope.selectedHours[hourTagId] = `selectHourToUse${id}`
      if (hourTagId == 'fromTime') {
        $scope.NExitTimeH = hourValue
      } else {
        $scope.NInterTimeH = hourValue
      }
      //check biger 4 hour-----
      if ($scope.NExitTimeH && $scope.NInterTimeH) {
        let from = parseInt($scope.NExitTimeH.split(":")[0] + $scope.NExitTimeH.split(":")[1]);
        let to = parseInt($scope.NInterTimeH.split(":")[0] + $scope.NInterTimeH.split(":")[1]);
        if ((to - from) > 400) {
          Toast.fire({
            icon: "warning",
            title: "بازه انتخاب شده بیشتر از 4 ساعت می باشد",
          });
        }
      }
      $(`#${hourTagId}`).val(hourValue);
    }
  }

  $scope.request = function (item) {
    $scope.loadingRequestTraffic = true;
    let itemToSend = {
      "personId": parseInt($scope.PersonnelInfo.Id),
      "personName": $scope.PersonnelInfo.personName,
      "dossierNo": $scope.PersonnelInfo.dossierNo,
      "personnelNo": $scope.PersonnelInfo.personnelNo,
      "nationalCode": $scope.PersonnelInfo.nationalCode,
      "rollcall": `${$scope.convertToMiladi(document.getElementById('rollCallDate').value)}T${item.rollCallTime}:00`,
      "rollCallDate": `${$scope.convertToMiladi(document.getElementById('rollCallDate').value)}T${item.rollCallTime}:00`,
      "description": item.description,
      "rollCallStateId": 1,
      "rollCallStateTitle": "",
      "rollCallTypeId": 201,
      "rollCallTypeTitle": "",
      "registeredType": 2,
      "registeredCode": "",
      "requesterId": Number($scope.currentUserId),
      "createdBy": Number($scope.currentUserId),
      "createdAt": moment().format('YYYY-MM-DD'),
      "isDeleted": true
    };
    RequestApis.RC('PersonRollCalls/Create', 'Post', itemToSend, 'json', function (responsep) {
      if (responsep.data.success == true) {
        let ParentResponse = responsep.data.data;
        $scope.RequestIdVH = responsep.data.data
        RequestApis.HR("securities/form/code?seccd=RC_TRDD", 'get', '', '', null, function (response) {
          RequestApis.HR("workflows/form/" + response.data.Id, 'get', '', '', null, function (subResponse) {
            let requestItem = {
              "parentId": null,
              "personnelId": parseInt($scope.PersonnelInfo.Id),
              "rootId": null,
              "workflowId": subResponse.data[0].Id,
              "initialDate": moment().format('YYYY-MM-DD'),
              "requesterUserId": Number($scope.currentUserId),
              "statusTypeIdentity": 1,
              "isDone": false,
              "hasChildren": false,
              "title": "درخواست تردد " + $scope.PersonnelInfo.PoliteName,
              "requestNo": "RC_TRDD",
              "comment": "",
              "additionalInfo": JSON.stringify(
                {
                  personnelId: $scope.PersonnelInfo.Id,
                  userId: $scope.currentUserId,
                  title: "درخواست تردد " + $scope.PersonnelInfo.PoliteName,
                  TrafficId: ParentResponse
                }),
              "requestTypeIdentity": subResponse.data[0].Id,
              "createdBy": Number($scope.currentUserId),
              "createdAt": moment().format('YYYY-MM-DD')
            }
            RequestApis.RC('Request/CreateRequest/' + $scope.PersonnelInfo.Id, 'Post', requestItem, 'json', function (responsex) {
              if (responsex.data.success == true) {
                $scope.SubmitOccured = true;
                $scope.dynamicBtns(ParentResponse, responsex.data.data);
              }
            })
          })
        })

      } else {
        if (responsep.data.errorMessages != undefined) {
          if (responsep.data.errorMessages[0].trim() === "HASOVERLAP") {
            Toast.fire({
              icon: "success",
              title: "تداخل زمانی وجود دارد لطفا تاریخ را بررسی نمایید",
            });
          } else if (responsep.data.errorMessages[0].trim() === "ISCLOSEDDAY") {
            Toast.fire({
              icon: "success",
              title: "شما به دلیل بسته شدن محاسبه کارکردتان در تاریخ انتخابی امکان ثبت مرخصی را ندارید",
            });
            $scope.showClosedList(responsep.data);
          } else if (responsep.data.errorMessages[0].trim() === "HasOverlapDailyMission") {
            Toast.fire({
              icon: "success",
              title: "شما قبلا مأموریت روزانه در این روز ، ثبت نموده اید",
            });
          } else if (responsep.data.errorMessages[0].trim() === "HasOverlapDailyLeave") {
            Toast.fire({
              icon: "success",
              title: "شما قبلا مرخصی روزانه در این روز، ثبت نموده اید",
            });
          } else if (responsep.data.errorMessages[0].trim() === "HasOverlapHourMission") {
            Toast.fire({
              icon: "success",
              title: "شما قبلا مأموریت ساعتی در این روز، ثبت نموده اید",
            });
          } else {
            Toast.fire({
              icon: "error",
              title: responsep.data.errorMessages[0] ?? "عملیات با خطا مواجه شد",
            });
          }

        }
      }
    })
  }
  $scope.dynamicBtns = function (vacationId, requestId) {
    $scope.useVacationId = vacationId;
    $scope.requestId = requestId;
    RequestApis.HR("workflows/request/" + requestId + "/status/", 'Get', '', '', '', function (response1) {
      $scope.formInformation = response1.data[0];
      RequestApis.HR("workflows/state/" + $scope.formInformation.StateId + "/actions", 'Get', '', '', '', function (response2) {
        $scope.buttonsArrayShowDay = false;
        if (response2.status == 200) {
          $scope.buttonsArray = response2.data;
          $scope.buttonsArrayShow = true;
        } else {
          $scope.buttonsArray = [];
          $scope.buttonsArrayShow = false;
        }
      })
    })
  }
  $scope.DynamicConfirmsTraffic = function (actionType, itemToUpdate) {
    $scope.EditMode = true;
    $scope.buttonsArrayShow = true;
    $scope.buttonsArrayShowDay = false;
    let idRequest = $scope.requestId ?? $scope.urlsearch.requestId;
    $scope.selectedManagers(idRequest, actionType, itemToUpdate);
  }

  // ----- show traffic for selected day------->>>>
  $scope.showTrafficThisDay = function () {
    let thisDate = $scope.convertToMiladi($('#startHDate').val());

    var path =
      "PersonRollCalls/GetListPersonRollCall/" +
      $scope.PersonnelInfo.Id +
      "?FromDt=" +
      thisDate +
      "&ToDt=" +
      thisDate;

    RequestApis.RC(path, 'Get', '', 'json', function (response) {
      $scope.trafficHours = response.data
    })
  }

  //========== managers list ================
  $scope.selectedManagers = function (requestid, actionType, itemToUpdate) {
    $scope.itemsToUpdateH = itemToUpdate;
    $scope.buttonInfoH = actionType;
    let psn = "";
    if (global.checkExist($scope.urlsearch) && !isNaN($scope.urlsearch.personelId)) {
      psn = psn.concat(`&psn=${$scope.urlsearch.personelId}`)
    } else {
      psn = psn.concat(`&psn=${$scope.PersonnelInfo.Id}`)
    }
    let curst = "";
    if (global.checkExist($scope.formInformation.StateId)) {
      curst = curst.concat(`&curst=${$scope.formInformation.StateId}`)
    }
    let nxtst = "";
    if (global.checkExist(actionType.NextStateId)) {
      nxtst = nxtst.concat(`&nxtst=${actionType.NextStateId}`)
    }
    let act = "";
    if (global.checkExist(actionType.ActionId)) {
      act = act.concat(`&act=${actionType.ActionId}`)
    }
    RequestApis.HR(`workflows/actortype/${actionType.ActorTypeId}/next/personnel?rq=${requestid}${psn}${curst}${nxtst}${act}${$scope.ach !== undefined ? "&ach=" + $scope.ach : ""}&paging.ps=${$scope.personnelSelectedPS != undefined ? $scope.personnelSelectedPS : 10}&paging.pn=${$scope.personnelSelectedPN != undefined ? $scope.personnelSelectedPN : 1}`, 'Get', '', '', '', function (response) {
      $scope.requestId = requestid;
      $scope.addToManager = [];
      if (response.status === 200) {
        $scope.managers = response.data;
        if ($scope.managers.Items.length) {
          $("#selectManagers").fadeIn();
        } else {
          $scope.SendToManager($scope.addToManager, requestid);
        }
      } else {
        $scope.SendToManager($scope.addToManager, requestid);
      }
    })
  }

  $scope.getMore = function () {
    $scope.ach = 1;
    $scope.selectedManagers($scope.requestId, $scope.buttonInfoH, $scope.itemsToUpdateH);
  }
  $scope.loadPagePersonnelSelected = function (page) {
    if ($scope.managers.TotalPages >= page && $scope.managers.TotalPages > $scope.managers.PageIndex && page > 0) {
      $scope.personnelSelectedPN = Number(page);
      $scope.selectedManagers($scope.requestId, $scope.buttonInfoH, $scope.itemsToUpdateH);
    }
  }
  $scope.pageSizePersonnelSelected = function (size) {
    $scope.personnelSelectedPS = Number(size);
    $scope.selectedManagers($scope.requestId, $scope.buttonInfoH, $scope.itemsToUpdateH);
  }



  $scope.cancelManagerSelection = function () {
    $("#selectManagers").fadeOut();
    $scope.addToManager = [];
  }
  $scope.addToManager = [];
  $scope.Addmanagers = function (item) {
    if (document.getElementById(`select-manager-${item}`).checked) {
      if (!$scope.addToManager.some(x => x === item)) {
        $scope.addToManager.push(item)
      }
    } else {
      $scope.addToManager = $scope.addToManager.filter(y => y != item)
    }
  }
  $scope.confirmSelectManagers = function () {
    $("#selectManagers").fadeOut();
    let requestId = $scope.requestId ?? $scope.urlsearch.requestId
    $scope.SendToManager($scope.addToManager, requestId);
    $scope.addToManager = [];
  }
  $scope.SendToManager = function (managersId, requestId) {
    $scope.managersIdH = managersId;
    const { value: text } = Swal.fire({
      input: 'textarea',
      inputLabel: 'یادداشت',
      inputPlaceholder: ' در صورت تمایل یادداشت خود را بگذارید...',
      inputAttributes: {
        'aria-label': ' در صورت تمایل یادداشت خود را بگذارید...'
      },
      customClass: {
        input: 'small-font',
        confirmButton: 'small-font',
      },
      confirmButtonText: 'تأیید'
    }).then((result) => {
      if (result.isConfirmed) {
        if (result.value.length) {
          $scope.Comment = result.value;
          let str = '"' + result.value + '"';
          RequestApis.HR('workflows/request/' + requestId + '/notes', "Post", '', '', str, function (response) {
          })
        }
        RequestApis.HR("workflows/request/" + requestId, 'get', '', '', '', function (response) {
          if (response.status === 200) {
            $scope.itemToUpdateFuncH($scope.itemsToUpdateH.id);
          } else {
            Toast.fire({
              icon: 'error',
              title: 'عملیات در مرحله دریافت اطلاعات درخواست، با خطا مواجه شد'
            })
          }
        })
      }
    })
  }
  $scope.getDetailsForManagerAcception = function (id) {
    $scope.useVacationId = id;
    RequestApis.RC(`PersonRollCalls/GetById/${id}`, 'Get', '', 'json', function (response) {
      if (response.status === 200) {
        $scope.rollCall = response.data.data;
        $scope.DetailsHourMode = true;
      } else {
        Toast.fire({
          icon: 'error',
          title: 'خطا در دریافت اطلاعات'
        })
      }
    })
  }
  $scope.itemToUpdateFuncH = function (id) {
    RequestApis.RC(`PersonRollCalls/GetById/${id}`, 'Get', '', '', function (response) {
      $scope.loadingUpdateHourM = true;
      let items = response.data.data;
      let requestId = $scope.requestId ?? $scope.urlsearch.requestId;
      let subItemToSend = {
        "rowNo": items.rowNo,
        "personId": parseInt($scope.PersonnelInfo.Id),
        "personName": $scope.PersonnelInfo.PoliteName,
        "dossierNo": $scope.PersonnelInfo.DossierNo,
        "personnelNo": $scope.PersonnelInfo.PersonnelNo,
        "nationalCode": $scope.PersonnelInfo.NationalCode,
        "rollcall": items.rollcall,
        "rollCallDate": items.rollCallDate,
        "rollCallTime": items.rollCallTime,
        "description": items.description,
        "rollCallTypeId": items.rollCallTypeId,
        "rollCallTypeTitle": items.rollCallTypeTitle,
        "aDeviceId": items.aDeviceId,
        "aDeviceCode": items.aDeviceCode,
        "registeredType": items.registeredType,
        "registeredCode": items.registeredCode,
        "requestId": Number(requestId),
        "requesterId": Number($scope.currentUserId),
        "id": items.id,
        "createdBy": items.createdBy,
        "createdAt": items.createdAt,
        "updatedBy": Number($scope.currentUserId),
        "updatedAt": moment().format('YYYY-MM-DD'),
        "isDeleted": items.isDeleted
      }
      $scope.finalRequest = true;
      if ($scope.buttonInfoH.PreUrls != undefined) {
        RequestApis.RC($scope.buttonInfoH.PreUrls[0], 'Post', subItemToSend, 'json', function (response) {
          if (response.data.success == true) {
            RequestApis.HR("workflows/request/" + requestId, 'get', '', '', '', function (response1) {
              var itemTosend = {
                Id: response1.data.Id,
                RowVersion: response1.data.RowVersion,
                ActionId: $scope.buttonInfoH.ActionId,
                NextPersonnel: []
              }
              for (var i = 0; i < $scope.managersIdH.length; i++) {
                var itemToPsuh = {
                  ActorTypeId: $scope.buttonInfoH.ActorTypeId,
                  ActionTransitionId: $scope.buttonInfoH.ActionTransitionId,
                  PersonnelId: $scope.managersIdH[i]
                }
                itemTosend.NextPersonnel.push(itemToPsuh);
              }
              let bhus = ""
              if (global.checkExist($scope.urlsearch) && global.checkExist($scope.urlsearch.behalfId)) {
                bhus = bhus.concat(`?bhus=${$scope.urlsearch.behalfId}`)
              }
              RequestApis.HR(`workflows/request/${requestId}/simple/move${bhus}`, 'Patch', '', '', itemTosend, function (response2) {
                if (response2.status === 200) {
                  $scope.loadingUpdateHourM = false;
                  Toast.fire({
                    icon: "success",
                    title: "عملیات با موفقیت انجام شد",
                  }).then((result) => {
                    if ($scope.EditMode) {
                      window.parent.location.href = check ? `${window.origin}/${window.location.pathname.toString().split("/")[1]}/GlobalValue/cartable.html?data=inbox` : `${window.origin}/GlobalValue/cartable.html?data=inbox`;
                    } else {
                      window.parent.location.href = check ? `${window.origin}/${window.location.pathname.toString().split("/")[1]}/GlobalValue/cartable.html?data=outbox` : `${window.origin}/GlobalValue/cartable.html?data=outbox`;
                    }
                  })
                } else {
                  Toast.fire({
                    icon: "error",
                    title: response2.data.errorMessages ?? "عملیات در مرحله ارسال به شخص بعدی با خطا مواجه شد",
                  });
                }
              })
            })
          } else {
            Toast.fire({
              icon: "error",
              title: response.data.errorMessages[0] ?? "عملیات در مرحله بروزرسانی سیستم تردد با خطا مواجه شد",
            });
          }
        })
      } else {
        RequestApis.HR("workflows/request/" + requestId, 'get', '', '', '', function (response1) {
          var itemTosend = {
            Id: response1.data.Id,
            RowVersion: response1.data.RowVersion,
            ActionId: $scope.buttonInfoH.ActionId,
            NextPersonnel: []
          }
          for (var i = 0; i < $scope.managersIdH.length; i++) {
            var itemToPsuh = {
              ActorTypeId: $scope.buttonInfoH.ActorTypeId,
              ActionTransitionId: $scope.buttonInfoH.ActionTransitionId,
              PersonnelId: $scope.managersIdH[i]
            }
            itemTosend.NextPersonnel.push(itemToPsuh);
          }
          let bhus = ""
          if (global.checkExist($scope.urlsearch) && global.checkExist($scope.urlsearch.behalfId)) {
            bhus = bhus.concat(`?bhus=${$scope.urlsearch.behalfId}`)
          }
          RequestApis.HR(`workflows/request/${requestId}/simple/move${bhus}`, 'Patch', '', '', itemTosend, function (response2) {
            if (response2.status === 200) {
              $scope.loadingUpdateHourM = false;
              Toast.fire({
                icon: "success",
                title: "عملیات با موفقیت انجام شد",
              }).then((result) => {
                if ($scope.EditMode) {
                  window.parent.location.href = check ? `${window.origin}/${window.location.pathname.toString().split("/")[1]}/GlobalValue/cartable.html?data=inbox` : `${window.origin}/GlobalValue/cartable.html?data=inbox`;
                } else {
                  window.parent.location.href = check ? `${window.origin}/${window.location.pathname.toString().split("/")[1]}/GlobalValue/cartable.html?data=outbox` : `${window.origin}/GlobalValue/cartable.html?data=outbox`;
                }
              })
            } else {
              Toast.fire({
                icon: "error",
                title: response2.data.errorMessages ?? "عملیات در مرحله ارسال به شخص بعدی با خطا مواجه شد",
              });
            }
          })
        })
      }

    })
  }
  $scope.showClosedList = function (items) {
    $scope.showClosedList = items;
    $('#showClosedModal').fadeIn();
  }
  $scope.closeClosedList = function () {
    $('#showClosedModal').fadeOut();
  }
})