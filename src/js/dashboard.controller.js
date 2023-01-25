app.controller('DashboardController', function ($scope, $timeout, RequestApis, global) {
  $scope.pageSize = 10;
  $scope.pageNum = 1;
  $scope.loading = false;
  $scope.personnelInfoExist = false;
  $scope.religions = [];
  $scope.personnel = {};
  $scope.traffice = {};
  $scope.search = {};
  $scope.createDayVacationData = {};
  $scope.createDayMissionData = {};
  $scope.searchBtn = false;
  let applications = ["HR", "DASHBOARD", "RC", "DASH", "DRC", "HELPDESK"];
  let appNameFromUrl = window.location.pathname.toString().split("/")[1].toUpperCase();
  let check = applications.some(x => x === appNameFromUrl);
  $scope.checkCookie = function () {
    $scope.authHeaders = {};

    if ($scope.getCookie("UID") == "" || $scope.getCookie("UID") == null) {

      if ($scope.getCookie("UserId") == "" || $scope.getCookie("UserId") == null) {
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
  $scope.initFunc = function () {
    $scope.checkCookie();
    RequestApis.HR(`personnel/user/${$scope.currentUserId}/current`, 'Get', '', '', '', function (response) {
      if (response.status === 200) {
        $scope.personel = response.data;
        $scope.myInfo($scope.personel);
      }
    })
  }
  $scope.initFunc();
  $scope.loginFunction = function () {
    $scope.loadingLogin = true;
    let loginItem = JSON.parse(localStorage.getItem("infos"));
    localStorage.removeItem(`userId`);
    localStorage.removeItem(`userName`);
    // window.location.href = "Views/panel.html";
    RequestApis.RC('Account/Login', 'Post','','',loginItem, function (response) {
      console.log(response)
      localStorage.setItem(`access_token`, response.data.access_token);
      localStorage.setItem(`refresh_token`, response.data.refresh_token);
      if (response.status === 200) {
        RequestApis.RC('Account/GetUserData', 'get', '', '','', function (response) {
          localStorage.setItem("userId", response.data.nameIdentifier);
        })
        //var base64Url = response.data.data.jwtToken.split('.')[1];
        //var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        //var jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
        //    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        //}).join(''));
        //let jsonResult = JSON.parse(jsonPayload)
        //localStorage.setItem("userId", jsonResult.nameid);

      } else {
        $scope.error = true;
      }
      $scope.loadingLogin = false;
    })
  }
  $scope.loginFunction();
  //============ Get duration vacation in days by function ==========
  $scope.getdiffDay = function (dateFrom, DateTo) {
    var datefrom = new Date(dateFrom.toString().split('T')[0]);
    var dateto = new Date(DateTo.toString().split('T')[0]);
    let Diff_In_Time = dateto.getTime() - datefrom.getTime();
    let Diff_In_Days = Diff_In_Time / (1000 * 3600 * 24);
    return Diff_In_Days;
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
  //=============== Comma seprator ======================
  $scope.addComma = function (item) {
    if (item != undefined) {
      return item.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
  }
  $scope.addCommaToNUmericValue = function (item) {
    if (item != undefined) {
      return Numeric(item.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
    }
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
  //============= date time picker==================
  $scope.dateTimeMask = function () {
    $timeout(function () {
      $(".date-picker").datepicker({
        dateFormat: "yy/mm/dd",
        changeMonth: true,
        changeYear: true
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
  //=============== toast notification ======================
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
  //============ side bar creation ======================
  $scope.sideBarItems = [
    { Id: 0, Title: 'اطلاعات من', selected: true },
    { Id: 6, Title: 'اطلاعات تکمیلی', selected: false },
    { Id: 1, Title: 'احکام', selected: false },
    { Id: 2, Title: 'تردد', selected: false },
    { Id: 3, Title: 'مأموریت', selected: false },
    { Id: 4, Title: 'مرخصی', selected: false },
    { Id: 5, Title: 'فیش حقوقی', selected: false },
    { Id: 7, Title: 'گزارش ارزشیابی', selected: false }
  ]
  $scope.selectedSideBar = $scope.sideBarItems[0].Id;
  $scope.getSideBar = function (sideBar) {
    $(`#parentSideBarItem li div`).removeClass('selected-list-group');
    $timeout(function () {
      $(`#sideBarItem-${sideBar.Id}`).attr('selected', 'selected');
    }, 100)
    for (var i = 0; i < $scope.sideBarItems.length; i++) {
      $scope.sideBarItems[i].selected = false;
    }
    if (sideBar.Id === 0) {
      $scope.pageLoading = true;
      $scope.myInfo($scope.personel)
    }
    if (sideBar.Id === 1) {
      $scope.pageLoading = true;
      $scope.pageSize = 10;
      $scope.pageNum = 1;
      $scope.getUserIssuance($scope.personel);
    }
    if (sideBar.Id === 2) {
      $scope.pageLoading = true;
      $scope.DADPageNumber = undefined;
      $scope.pageNumberI = undefined;
      $scope.pageNumberV = undefined;
      $scope.getYearsArray();
      $scope.thisMonth = moment().format('jYYYY/jMM/jDD').split('/')[1];
      let toDateSelect = $scope.currentDate = moment().format('jYYYY/jMM/jDD');
      let fromDateSelect = `${moment().format('jYYYY/jMM/jDD').split('/')[0]}/01/01`
      let itemToSend = {
        "toDate": $scope.convertToMiladi(toDateSelect),
        "toDatePersian": toDateSelect,
        "personIds": [$scope.personel.Id],
        "negativeRemaining": false,
        "pageNumber": 1,
        "pageSize": 10,
      }
      RequestApis.RC(`Reports/GetLeaveStatusByPersonReport`, 'Post','','', itemToSend,  function (response) {
        if (response.status == 200) {
          $scope.yearResult = response.data.data.item1[0]
        }
      })
      $scope.getDailyApiDetails();

    }
    if (sideBar.Id === 5) {
      $scope.pageLoading = true;
      $scope.getYearsArray();
      $scope.thisMonth = moment().format('jYYYY/jMM/jDD').split('/')[1];
      $scope.thisYear = moment().format('jYYYY/jMM/jDD').split('/')[0];
      $scope.getVageBillData(moment().format('jYYYY/jMM/jDD').split('/')[1], moment().format('jYYYY/jMM/jDD').split('/')[0]);
    }
    sideBar.selected = true;
    $scope.selectedSideBar = sideBar.Id
  }
  //============================ details section ============
  $scope.myInfo = function (personnel) {
    RequestApis.HR(`personnel/${personnel.Id}/info`, 'Get', '', '', '', function (response) {
      if (response.status === 200) {
        $scope.personnelInfoExist = true;
        $scope.selectedInfo = {};
        $scope.selectedInfo = response.data;
        if (response.data.AvatarBase64 != undefined) {
          $scope.selectedInfoAvatarBase64 = `data:image/png;base64,${response.data.AvatarBase64}`;
        }
        $scope.ListAddressEdit = response.data.Addresses;
        if ($scope.religions.length == 0) {
          RequestApis.HR(`constants/enum/Religion`, 'Get', '', '', '', function (response) {
            if (response.status === 200) {
              $scope.religions = response.data;
            }
          })
        }
        RequestApis.HR(`personnel/${personnel.Id}/faith`, 'Get', '', '', '', function (response) {
          if (response.status === 200) {
            $scope.religionBranch = response.data;
          }
        })
        RequestApis.HR(`constants/enum/AssuranceType`, 'Get', '', '', '', function (response) {
          $scope.assurances = response.data;
        })
        RequestApis.HR(`constants/enum/MaritalState`, 'Get', '', '', '', function (response) {
          $scope.marigeStatus = response.data;
        })
        RequestApis.HR(`millitaries`, 'Get', '', '', '', function (response) {
          $scope.militaryState = response.data;
          $scope.pageLoading = false;
        })
      }
    })
  }
  $scope.showNationalCodeModal = function (personnel) {
    $('#NationalCodeModal').modal();
    RequestApis.HR(`personnel/${personnel}/NationalCode/x64`, 'Get', '', '', '', function (response) {
      if (response.status === 200) {
        $timeout(function () {
          $scope.imageNationalCode = `data:image/png;base64,${response.data}`;
        }, 200)
      }
    })
  }
  $scope.cancelNationalCodeModal = function () {
    $('#NationalCodeModal').modal('hide');
    $('#imageNationalCodeInModal').empty();
  }

  $scope.showIdentityCodeModal = function (personnel) {
    $('#IdentityCodeModal').modal();
    RequestApis.HR(`personnel/${personnel}/IdentityCode/x64`, 'Get', '', '', '', function (response) {
      if (response.status === 200) {
        $timeout(function () {
          $scope.imageIdentityCode = `data:image/png;base64,${response.data}`;
        }, 200)
      }
    })
  }
  $scope.cancelIdentityCodeModal = function () {
    $('#IdentityCodeModal').modal('hide');
    $('#imageIdentityCodeInModal').empty();
  }

  $scope.showSignModal = function (personnel) {
    $('#SignModal').modal();
    RequestApis.HR(`personnel/${personnel}/signature/x64`, 'Get', '', '', '', function (response) {
      if (response.status === 200) {
        $timeout(function () {
          $scope.imageSign = `data:image/png;base64,${response.data}`;
        }, 200)
      }
    })
  }
  $scope.cancelSignModal = function () {
    $('#SignModal').modal('hide');
    $('#imageSignInModal').empty();
  }

  //=============================== writ section ===============================
  $scope.showIssuance = function (data) {
    $scope.showDetailsItemState = false;
    $scope.WritInfo = [];
    $scope.printingData = data;
    data.loading = true;
    $scope.correctStatus = false;
    $scope.viewType = null;
    $('#prewrit').removeClass('active');
    $('#exedit').removeClass('active');
    $('#current').addClass('active');
    if (!data.IsDraft) {
      RequestApis.HR(`pafs/${data.Id}`, 'Get', '', '', '', function (response) {
        if (response.status === 200) {
          $scope.WritInfo = response.data;
          if ($scope.WritInfo.ExOne != undefined) {
            $scope.exIsTrue = true;
          } else {
            $scope.exIsTrue = false;
          }
          data.loading = false;
          $("#issuanceModal").modal();
        }
      })
    } else {
      if (data.IsTouched) {
        RequestApis.HR(`pafs/draft/${data.Id}`, 'Post', '', '', '', function (response) {
          if (response.status === 200) {

            RequestApis.HR(`pafs/${data.Id}`, 'Get', '', '', '', function (response) {
              if (response.status === 200) {
                $scope.WritInfo = response.data;
                if ($scope.WritInfo.ExOne != undefined) {
                  $scope.exIsTrue = true;
                } else {
                  $scope.exIsTrue = false;
                }
                data.loading = false;
                $("#issuanceModal").modal();
              }
            })
            Toast.fire({
              icon: 'success',
              title: 'بارگزاری اطلاعات با موفقیت انجام شد'
            })
          } else {
            Toast.fire({
              icon: 'error',
              title: 'خطا در محاسبه مقادیر'
            })
          }
        })
      } else {

        RequestApis.HR(`pafs/${data.Id}`, 'Get', '', '', '', function (response) {
          if (response.status === 200) {
            $scope.WritInfo = response.data;
            if ($scope.WritInfo.ExOne != undefined) {
              $scope.exIsTrue = true;
            } else {
              $scope.exIsTrue = false;
            }
            data.loading = false;
            $("#issuanceModal").modal();
            Toast.fire({
              icon: 'success',
              title: 'بارگزاری اطلاعات با موفقیت انجام شد'
            })
          }
        })

      }
    }

  }

  $scope.getUserIssuance = function (personnel) {
    let items = [];
    $scope.loading = true;
    RequestApis.HR(`pafs/personnel/${personnel.Id}?dft=0&ps=${$scope.pageSize}&pn=${$scope.pageNum}&hp=1`, 'Get', '', '', '', function (response) {
      if (response.status === 200) {
        $scope.userIssuance = response.data.Items;
        $scope.userIssuance.TotalPages = response.data.TotalPages;
        $scope.userIssuance.PageIndex = response.data.PageIndex;
      }
      //$scope.userIssuance = response.data;
      $scope.loading = false;
      $scope.pageLoading = false;
    })
  }
  $scope.loadPage = function (page) {
    if ($scope.userIssuance.PageIndex <= $scope.userIssuance.TotalPages && page <= $scope.userIssuance.TotalPages) {
      $scope.pageNum = page;
      $scope.getUserIssuance($scope.personel);
    } else {
      $scope.getUserIssuance($scope.personel);
    }
  }
  $scope.setView = function (type) {
    $scope.viewType = type;
  }
  $scope.checkNonCurrency = function (item) {
    var found = false;
    if ($scope.viewType != null && $scope.viewType != undefined) {
      if ($scope.WritInfo != undefined) {
        if ($scope.WritInfo.PreCurrent != undefined) {
          Object.keys($scope.WritInfo.PreCurrent.NonCurrencyDiffs).forEach(sunItem => {
            if (sunItem == item) {
              found = true;
            }
          })
        }
      }
    }
    return found;
  }
  $scope.checkCurrency = function (item) {
    var found = false;
    if ($scope.viewType != null && $scope.viewType != undefined) {
      if ($scope.WritInfo != undefined) {
        if ($scope.WritInfo.PreCurrent != undefined) {
          Object.keys($scope.WritInfo.PreCurrent.CurrencyDiffs).forEach(sunItem => {
            if (sunItem == item) {
              found = true;
            }
          })
        }
      }
    }
    return found;
  }
  $scope.checkCurrencyWithEx = function (item) {
    var found = false;
    if ($scope.viewType != null && $scope.viewType != undefined) {
      if ($scope.WritInfo != undefined) {
        if ($scope.WritInfo.ExOneCurrent != undefined) {
          Object.keys($scope.WritInfo.ExOneCurrent.CurrencyDiffs).forEach(sunItem => {
            if (sunItem == item) {
              found = true;
            }
          })
        }
      }
    }
    return found;
  }
  $scope.checkNonCurrencyWithEx = function (item) {
    var found = false;
    if ($scope.viewType != null && $scope.viewType != undefined) {
      if ($scope.WritInfo != undefined) {
        if ($scope.WritInfo.ExOneCurrent != undefined) {
          Object.keys($scope.WritInfo.ExOneCurrent.NonCurrencyDiffs).forEach(sunItem => {
            if (sunItem == item) {
              found = true;
            }
          })
        }
      }
    }
    return found;
  }
  $scope.showDetails = function () {
    $scope.showDetailsItem = null
    $scope.showDetailsItemManual = null
    $scope.showDetailsItemPre = null
    $scope.showDetailsItemManualPre = null
    if ($scope.WritInfo != undefined || $scope.WritInfo != null) {
      if ($scope.WritInfo.Current.Helps != undefined) {
        if ($scope.showDetailsItemState) {
          $scope.showDetailsItemState = false;
        } else {
          $scope.showDetailsItemState = true;
        }
        $scope.showDetailsItem = $scope.WritInfo.Current.Helps;
        $scope.showDetailsItemPre = $scope.WritInfo.Pre.Helps;
      }
    }
    if ($scope.WritInfo != undefined || $scope.WritInfo != null) {
      if ($scope.WritInfo.Current.Helps != undefined) {
        if ($scope.showDetailsItemState) {
          $scope.showDetailsItemState = false;
        } else {
          $scope.showDetailsItemState = true;
        }
        $scope.showDetailsItemManual = $scope.WritInfo.Current.Helps;
        $scope.showDetailsItemManualPre = $scope.WritInfo.Pre.Helps;
      }
    }

  }
  $scope.closeIsssuanceModal = function () {
    $("#issuanceModal").modal('hide');
  }
  $scope.showChildren = function (param) {
    if ($("#tr-" + param.Id).hasClass("hidden")) {
      //$(".custom-table-success").addClass("hidden");
      //$(".first-icon").removeClass("fa-minus")
      //$(".first-icon").addClass("fa-plus")
      if (param.childrenIssuance == undefined) {
        RequestApis.HR(`pafs/${param.Id}/children`, 'Get', '', '', '', function (response) {
          param.childrenIssuance = response.data;
          $("#tr-" + param.Id).removeClass("hidden");
          $("#children-" + param.Id).slideToggle();
          $("#plus-" + param.Id).removeClass("fa-plus")
          $("#plus-" + param.Id).addClass("fa-minus")
        })
      } else {
        $("#tr-" + param.Id).removeClass("hidden");
        $("#tr-" + param.Id).addClass("show");
        $("#children-" + param.Id).slideToggle();
        $("#plus-" + param.Id).removeClass("fa-plus")
        $("#plus-" + param.Id).addClass("fa-minus")
      }
    } else {
      setTimeout(function () {
        $("#tr-" + param.Id).addClass("hidden");
      }, 400)
      $("#children-" + param.Id).slideToggle();
      $("#plus-" + param.Id).addClass("fa-plus")
      $("#plus-" + param.Id).removeClass("fa-minus")
    }
  }
  //============= print section ====================
  $scope.printSetting = null;
  $scope.correctStatusPrint = false;
  $scope.printingData = null;
  $scope.printData = function (issuance) {
    issuance.loading = true;
    $scope.printingData = issuance.Id;
    RequestApis.HR('settings/paf', 'Get', '', '', '', function (response) {
      $scope.printSetting = response.data
      $scope.typeItemsToPrint = [];
      Object.values($scope.printSetting.Items).forEach(item => {
        Object.values(item.Values).forEach(subItem => {
          if (subItem.t === "مستخدم") {
            $scope.typeItemsToPrint.push(subItem);
          }
        })
      })
      //$("#printConfirmModal").modal();
      if ($scope.typeItemsToPrint.length > 0) {
        $scope.setDesable = false;
      } else {
        $scope.setDesable = true;
      }
      $scope.confirmPrint(1, issuance);
      issuance.loading = false;
    })
  }
  $scope.typeItemsToPrint = [];
  $scope.setCheckboxForWritPrintType = function (event, items) {
    if (event.target.checked) {
      $scope.typeItemsToPrint.push(items);
    } else {
      for (var i = 0; i < $scope.typeItemsToPrint.length; i++) {
        if ($scope.typeItemsToPrint[i].t === items.t) {
          $scope.typeItemsToPrint.splice(i, 1);
        }
      }
    }
    if ($scope.typeItemsToPrint.length > 0) {
      $scope.setDesable = false;
    } else {
      $scope.setDesable = true;
    }
  }
  $scope.cancelPrint = function () {
    $("#printConfirmModal").modal('hide');
    $scope.printAll = false;
    $("#all").prop("checked", false);
    $scope.correctStatusPrint = false;
  }
  $scope.confirmPrint = function (type, issuance) {
    var itemToSendVss = null;
    var itemToSendSgs = null;
    if ($scope.typeItemsToPrint.length > 0) {
      Object.values($scope.typeItemsToPrint).forEach(item => {
        if (itemToSendVss == null) {
          itemToSendVss = "&vss=" + item.t
        } else {
          itemToSendVss = itemToSendVss + "," + item.t
        }
        if (itemToSendSgs == null) {
          itemToSendSgs = "&sgs=" + item.sg
        } else {
          itemToSendSgs = itemToSendSgs + "," + item.sg
        }
      })
      $scope.setDesable = true;
    } else {
      $scope.setDesable = false;
    }
    var path
    if (type == 1) {
      path = "/pdf?q='file'";
      $scope.loadingPrint = true;
    } else {
      path = "/docx?q='file'";
      $scope.loadingPrintD = true;
    }
    if ($scope.correctStatusPrint) {
      RequestApis.HR('pafs/correct/report/' + $scope.printingData + path + itemToSendVss.toString() + itemToSendSgs.toString(), 'Get', '', 'arraybuffer', '', function (response) {
        if (type == 1) {
          var fileName = "چاپ حکم.pdf";
        } else {
          var fileName = "چاپ حکم.docx";
        }
        var a = document.createElement("a");
        if (type == 1) {
          var file = new Blob([response.data], { type: 'application/pdf' });
        } else {
          var file = new Blob([response.data], { type: 'application/docx' });
        }
        var fileURL = window.URL.createObjectURL(file);
        a.href = fileURL;
        a.download = fileName;
        a.click();
        $("#printConfirmModal").modal("hide");
        $scope.printAll = false;
        $("#all").prop("checked", false);
        $scope.loadingPrint = false;
        $scope.loadingPrintD = false;
        issuance.loading = false;
      });
    } else {
      pathToPrint = "pafs/report/" + $scope.printingData + path + itemToSendVss.toString() + itemToSendSgs.toString();
      RequestApis.HR(pathToPrint, 'Get', '', 'arraybuffer', '', function (response) {
        if (type == 1) {
          var fileName = "چاپ حکم.pdf";
        } else {
          var fileName = "چاپ حکم.docx";
        }
        var a = document.createElement("a");
        if (type == 1) {
          var file = new Blob([response.data], { type: 'application/pdf' });
        } else {
          var file = new Blob([response.data], { type: 'application/docx' });
        }
        var fileURL = window.URL.createObjectURL(file);
        a.href = fileURL;
        a.download = fileName;
        a.click();
        $("#printConfirmModal").modal("hide");
        $scope.printAll = false;
        $("#all").prop("checked", false);
        $scope.loadingPrint = false;
        $scope.loadingPrintD = false;
        issuance.loading = false;
      });
    }
  }

  $scope.printData1 = function (id) {
    for (var i = 0; i < $scope.childrenIssuances.length; i++) {
      if (id == $scope.childrenIssuances[i].Id) {
        $scope.printData($scope.childrenIssuances[i]);
        break;
      }
    }
  }
  $scope.printModal = function (item) {
    $scope.closeIsssuanceModal();
    setTimeout(function () {
      $scope.printData(item.PersonnelActionFormId)
    }, 500)
  }
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
        return returnItem = ""
    }
  }

  //======================== traffic section =====================
  $scope.yearSelected = function (ite) {
    $scope.yearSelectedItem = ite;
    let toDateSelect = moment(
      $scope.convertToMiladi(`${Number(ite)}/12/10`)
    ).endOf('jMonth').format('jYYYY/jMM/jDD');
    if (Number(moment().format('jYYYY/jMM/jDD').split('/')[0]) === Number(ite)) {
      toDateSelect = moment().format('jYYYY/jMM/jDD')
    }
    let itemToSend = {
      "toDate": $scope.convertToMiladi(toDateSelect),
      "toDatePersian": toDateSelect,
      "personIds": [$scope.personel.Id],
      "negativeRemaining": false,
      "pageNumber": 1,
      "pageSize": 10,
    }
    RequestApis.RC(`Reports/GetLeaveStatusByPersonReport`, 'Post','','', itemToSend, function (response) {
      if (response.status == 200) {
        $scope.yearResult = response.data.data.item1[0]
      }
    })

    if ($scope.ShowVacationGrid) {
      $scope.getVacationByCheck();
    }
    if ($scope.ShowAbsenceGrid) {
      $scope.getAbsenceByCheck();
    }
    if ($scope.ShowIncompleteGrid) {
      $scope.getIncompleteByCheck();
    }
    $scope.monthselectedItem = $scope.thisMonth;
    $scope.getDailyApiDetails();
  }
  $scope.chengeradio = function (item) {
    $scope.ShowVacationGrid = false;
    $scope.ShowAbsenceGrid = false;
    $scope.ShowIncompleteGrid = false;
    if (item == 1) {
      $scope.ShowVacationGrid = true;
      $scope.getVacationByCheck();
    }
    if (item == 2) {
      $scope.ShowAbsenceGrid = true;
      $scope.getAbsenceByCheck();
    }
    if (item == 3) {
      $scope.ShowIncompleteGrid = true;
      $scope.getIncompleteByCheck();
    }
  }
  $scope.monthSelected = function (month) {
    $scope.monthselectedItem = month;
    $scope.getDailyApiDetails();
  }
  $scope.getYearsArray = function () {
    $scope.thisYear = moment().format('jYYYY/jMM/jDD').split("/")[0];
    $('#selectYear').val($scope.thisYear);
    $scope.yearsArr = [];
    let j = 0;
    for (let i = $scope.thisYear - 5; i < parseInt($scope.thisYear) + 5; i++) {
      $scope.yearsArr.push({ id: j, name: i.toString() });
      ++j
    }
  }
  $scope.monthsObjInfo = [
    {
      id: '01',
      name: 'فروردین',
    },
    {
      id: '02',
      name: 'اردیبهشت',
    },
    {
      id: '03',
      name: 'خرداد',
    },
    {
      id: '04',
      name: 'تیر',
    },
    {
      id: '05',
      name: 'مرداد',
    },
    {
      id: '06',
      name: 'شهریور',
    },
    {
      id: '07',
      name: 'مهر',
    },
    {
      id: '08',
      name: 'آبان',
    },
    {
      id: '09',
      name: 'آذر',
    },
    {
      id: '10',
      name: 'دی',
    },
    {
      id: '11',
      name: 'بهمن',
    },
    {
      id: '12',
      name: 'اسفند',
    }
  ];
  //$scope.changeState = function (item, type) {
  //    switch (type) {
  //        case 'mission':
  //            if ($scope.itemToSetVacation.find(x => Number(x.startDayPersian.split('/').join('')) === Number(item.startDayPersian.split('/').join('')))) {
  //                $scope.itemToSetVacation = $scope.itemToSetVacation.filter(x => Number(x.startDayPersian.split('/').join('')) != Number(item.startDayPersian.split('/').join('')))
  //            }
  //            $scope.itemToSetMission.push(item);
  //            break;
  //        case 'vacation':
  //            if ($scope.itemToSetMission.find(x => Number(x.startDayPersian.split('/').join('')) === Number(item.startDayPersian.split('/').join('')))) {
  //                $scope.itemToSetMission = $scope.itemToSetMission.filter(x => Number(x.startDayPersian.split('/').join('')) != Number(item.startDayPersian.split('/').join('')))
  //            }
  //            $scope.itemToSetVacation.push(item);
  //            break;
  //        case 'notSet':
  //            if ($scope.itemToSetVacation.find(x => Number(x.startDayPersian.split('/').join('')) === Number(item.startDayPersian.split('/').join('')))) {
  //                $scope.itemToSetVacation = $scope.itemToSetVacation.filter(x => Number(x.startDayPersian.split('/').join('')) != Number(item.startDayPersian.split('/').join('')))
  //            }
  //            if ($scope.itemToSetMission.find(x => Number(x.startDayPersian.split('/').join('')) === Number(item.startDayPersian.split('/').join('')))) {
  //                $scope.itemToSetMission = $scope.itemToSetMission.filter(x => Number(x.startDayPersian.split('/').join('')) != Number(item.startDayPersian.split('/').join('')))
  //            }
  //            break;
  //        default:

  //            break;
  //    }
  //    $scope.checkTickState(item)
  //}
  //$scope.checkTickState = function (item) {
  //    let result = '';
  //    if ($scope.itemToSetMission.length) {
  //        if ($scope.itemToSetMission.find(x => Number(x.startDayPersian.split('/').join('')) === Number(item.startDayPersian.split('/').join('')))) {
  //            return 'mission'
  //        }
  //    }
  //    if ($scope.itemToSetVacation.length) {
  //        if ($scope.itemToSetVacation.find(x => Number(x.startDayPersian.split('/').join('')) === Number(item.startDayPersian.split('/').join('')))) {
  //            return 'vacation'
  //        }
  //    }
  //    if (!$scope.itemToSetMission.length && !$scope.itemToSetVacation.length) {
  //        if ($scope.itemToSetVacation.find(x => Number(x.startDayPersian.split('/').join('')) === Number(item.startDayPersian.split('/').join('')))) {
  //            $scope.itemToSetVacation = $scope.itemToSetVacation.filter(x => Number(x.startDayPersian.split('/').join('')) != Number(item.startDayPersian.split('/').join('')))
  //        }
  //        if ($scope.itemToSetMission.find(x => Number(x.startDayPersian.split('/').join('')) === Number(item.startDayPersian.split('/').join('')))) {
  //            $scope.itemToSetMission = $scope.itemToSetMission.filter(x => Number(x.startDayPersian.split('/').join('')) != Number(item.startDayPersian.split('/').join('')))
  //        }
  //    }
  //    return result;
  //}
  //$scope.changeStateH = function (item, type) {
  //    switch (type) {
  //        case 'mission':
  //            if ($scope.itemToSetVacationH.find(x => Number(x.startTime.split(':').join('')) === Number(item.startTime.split(':').join('')) && Number(x.endTime.split(':').join('')) === Number(item.endTime.split(':').join('')))) {
  //                $scope.itemToSetVacationH = $scope.itemToSetVacationH.filter(x => Number(x.startTime.split(':').join('')) != Number(item.startTime.split(':').join('')) && Number(x.endTime.split(':').join('')) != Number(item.endTime.split(':').join('')))
  //            }
  //            $scope.itemToSetMissionH.push(item);
  //            break;
  //        case 'vacation':
  //            if ($scope.itemToSetMissionH.find(x => Number(x.startTime.split(':').join('')) === Number(item.startTime.split(':').join('')) && Number(x.endTime.split(':').join('')) === Number(item.endTime.split(':').join('')))) {
  //                $scope.itemToSetMissionH = $scope.itemToSetMissionH.filter(x => Number(x.startTime.split(':').join('')) != Number(item.startTime.split(':').join('')) && Number(x.endTime.split(':').join('')) != Number(item.endTime.split(':').join('')))
  //            }
  //            $scope.itemToSetVacationH.push(item);
  //            break;
  //        case 'notSet':
  //            if ($scope.itemToSetVacationH.find(x => Number(x.startTime.split(':').join('')) === Number(item.startTime.split(':').join('')) && Number(x.endTime.split(':').join('')) === Number(item.endTime.split(':').join('')))) {
  //                $scope.itemToSetVacationH = $scope.itemToSetVacationH.filter(x => Number(x.startTime.split(':').join('')) != Number(item.startTime.split(':').join('')) && Number(x.endTime.split(':').join('')) != Number(item.endTime.split(':').join('')))
  //            }
  //            if ($scope.itemToSetMissionH.find(x => Number(x.startTime.split(':').join('')) === Number(item.startTime.split(':').join('')) && Number(x.endTime.split(':').join('')) === Number(item.endTime.split(':').join('')))) {
  //                $scope.itemToSetMissionH = $scope.itemToSetMissionH.filter(x => Number(x.startTime.split(':').join('')) != Number(item.startTime.split(':').join('')) && Number(x.endTime.split(':').join('')) != Number(item.endTime.split(':').join('')))
  //            }
  //            break;
  //        default:

  //            break;
  //    }
  //    console.log($scope.itemToSetMissionH)
  //    console.log($scope.itemToSetVacationH)
  //    $scope.checkTickStateH(item)
  //}
  //$scope.checkTickStateH = function (item) {
  //    let result = '';
  //    if ($scope.itemToSetMissionH.length) {
  //        if ($scope.itemToSetMissionH.find(x => Number(x.startTime.split(':').join('')) === Number(item.startTime.split(':').join('')) && Number(x.endTime.split(':').join('')) === Number(item.endTime.split(':').join('')))) {
  //               return 'mission'
  //        }
  //    }
  //    if ($scope.itemToSetVacationH.length) {
  //        if ($scope.itemToSetVacationH.find(x => Number(x.startTime.split(':').join('')) === Number(item.startTime.split(':').join('')) && Number(x.endTime.split(':').join('')) === Number(item.endTime.split(':').join('')))) {
  //                return 'vacation'
  //        }
  //    }
  //    return result;
  //}




  //====================== grid by vacation =================================

  $scope.getVacationByCheck = function () {
    let toDateSelect = $scope.convertToMiladi(moment().format('jYYYY/jMM/jDD'));
    let fromDateSelect = $scope.convertToMiladi(`${moment().format('jYYYY/jMM/jDD').split('/')[0]}/01/01`);
    if ($scope.yearSelectedItem != undefined && Number($scope.yearSelectedItem) !== Number(moment().format('jYYYY/jMM/jDD').split('/')[0])) {
      toDateSelect = $scope.convertToMiladi(moment($scope.convertToMiladi(`${Number($scope.yearSelectedItem)}/12/10`)).endOf('jMonth').format('jYYYY/jMM/jDD'));
      fromDateSelect = $scope.convertToMiladi(moment($scope.convertToMiladi(`${Number($scope.yearSelectedItem)}/01/10`)).startOf('jMonth').format('jYYYY/jMM/jDD'));
    }
    let itemToGet = {
      "fromDate": fromDateSelect,
      "toDate": toDateSelect,
      "personIds": [Number($scope.personel.Id)],
      "reportType": 2,
      "status": 1,
      "pageNumber": $scope.pageNumberV != undefined ? $scope.pageNumberV : 1,
      "pageSize": $scope.pageSizeV != undefined ? $scope.pageSizeV : 10,
    }
    RequestApis.RC(`Reports/GetLeaveMissionReport`, 'Post','','', itemToGet,  function (response) {
      $scope.vacationListData = response.data.data
      $scope.vacationListData.PageIndex = response.data.data.item3;
      $scope.vacationListData.TotalRows = response.data.data.item2;
      $scope.vacationListData.TotalPages = Math.ceil(response.data.data.item2 / response.data.data.item4);
    })
  }
  $scope.changePageV = function (page) {
    if ($scope.vacationListData.TotalPages >= $scope.vacationListData.PageIndex && page >= 1 && page <= $scope.vacationListData.TotalPages) {
      $scope.pageNumberV = page;
      $scope.getVacationByCheck();
    }
  }
  $scope.changePageSizeV = function (pagesize) {
    $scope.pageSizeV = Number(pagesize);
    $scope.pageNumberV = undefined;
    $scope.getVacationByCheck();
  }
  $scope.requestDropDown = function () {

  }
  //============================grid by absence ============================
  $scope.getAbsenceByCheck = function () {
    let toDateSelect = $scope.convertToMiladi($scope.currentDate = moment().format('jYYYY/jMM/jDD'));
    let fromDateSelect = $scope.convertToMiladi(`${moment().format('jYYYY/jMM/jDD').split('/')[0]}/01/01`);
    if ($scope.yearSelectedItem != undefined && Number($scope.yearSelectedItem) !== Number(moment().format('jYYYY/jMM/jDD').split('/')[0])) {
      toDateSelect = $scope.convertToMiladi(moment($scope.convertToMiladi(`${Number($scope.yearSelectedItem)}/12/10`)).endOf('jMonth').format('jYYYY/jMM/jDD'));
      fromDateSelect = $scope.convertToMiladi(moment($scope.convertToMiladi(`${Number($scope.yearSelectedItem)}/01/10`)).startOf('jMonth').format('jYYYY/jMM/jDD'));
    }
    let itemToGet = {
      "fromDate": fromDateSelect,
      "toDate": toDateSelect,
      "personId": Number($scope.personel.Id),
      "pageNumber": $scope.pageNumberA != undefined ? $scope.pageNumberA : 1,
      "pageSize": $scope.pageSizeA != undefined ? $scope.pageSizeA : 10,
      "presenceStatus": -106,
    }
    RequestApis.RC(`PersonRollCalls/GetPersonRollCallInfoByPerson`, 'Post','','', itemToGet,  function (response) {
      $scope.absenceListData = response.data.data
      $scope.absenceListData.PageIndex = response.data.data.item3;
      $scope.absenceListData.TotalRows = response.data.data.item2;
      $scope.absenceListData.TotalPages = Math.ceil(response.data.data.item2 / response.data.data.item4);
    })
  }
  $scope.changePageA = function (page) {
    if ($scope.absenceListData.TotalPages >= $scope.absenceListData.PageIndex && page >= 1 && page <= $scope.absenceListData.TotalPages) {
      $scope.pageNumberA = page;
      $scope.getAbsenceByCheck();
    }
  }
  $scope.changePageSizeA = function (pagesize) {
    $scope.pageSizeA = Number(pagesize);
    $scope.getAbsenceByCheck();
  }
  //============================grid by Incomplete ============================
  $scope.getIncompleteByCheck = function () {
    let toDateSelect = $scope.convertToMiladi($scope.currentDate = moment().format('jYYYY/jMM/jDD'));
    let fromDateSelect = $scope.convertToMiladi(`${moment().format('jYYYY/jMM/jDD').split('/')[0]}/01/01`);
    if ($scope.yearSelectedItem != undefined && Number($scope.yearSelectedItem) !== Number(moment().format('jYYYY/jMM/jDD').split('/')[0])) {
      toDateSelect = $scope.convertToMiladi(moment($scope.convertToMiladi(`${Number($scope.yearSelectedItem)}/12/10`)).endOf('jMonth').format('jYYYY/jMM/jDD'));
      fromDateSelect = $scope.convertToMiladi(moment($scope.convertToMiladi(`${Number($scope.yearSelectedItem)}/01/10`)).startOf('jMonth').format('jYYYY/jMM/jDD'));
    }
    let itemToGet = {
      "fromDate": fromDateSelect,
      "toDate": toDateSelect,
      "personId": Number($scope.personel.Id),
      "pageNumber": $scope.pageNumberI != undefined ? $scope.pageNumberI : 1,
      "pageSize": $scope.pageSizeI != undefined ? $scope.pageSizeI : 10,
      "presenceStatus": -104,
    }
    RequestApis.RC(`PersonRollCalls/GetPersonRollCallInfoByPerson`, 'Post','','', itemToGet, function (response) {
      $scope.incompleteListData = response.data.data
      $scope.incompleteListData.PageIndex = response.data.data.item3;
      $scope.incompleteListData.TotalRows = response.data.data.item2;
      $scope.incompleteListData.TotalPages = Math.ceil(response.data.data.item2 / response.data.data.item4);
    })
  }
  $scope.changePageI = function (page) {
    if ($scope.incompleteListData.TotalPages >= $scope.incompleteListData.PageIndex && page >= 1 && page <= $scope.incompleteListData.TotalPages) {
      $scope.pageNumberI = page;
      $scope.getIncompleteByCheck();
    }
  }
  $scope.changePageSizeI = function (pagesize) {
    $scope.pageSizeI = Number(pagesize);
    $scope.pageNumberI = undefined;
    $scope.getIncompleteByCheck();
  }
  //===============================================================
  $scope.changeSelectRequest = function (items, item, date) {
    console.log(item)
    $scope.loadingRequest = true;
    if (Number(item) === 1) {//vacation request
      $scope.loadingRequestHourM = false;
      $scope.loadingRequestHourV = true;
      let itemToSend = {
        "personId": parseInt($scope.personel.Id),
        "leaveDate": $scope.convertToMiladi(date),
        "fromTime": items.startTime,
        "toTime": items.endTime,
        "requesterId": Number($scope.currentUserId),
        "hourLeaveStateId": 0,
        "createdBy": Number($scope.currentUserId),
        "createdAt": moment().format('YYYY-MM-DD')
      };
      RequestApis.RC('HourLeaves/Create', 'Post','','', itemToSend,  function (responsep) {
        if (responsep.data.success == true) {
          let ParentResponse = responsep.data.data;
          $scope.RequestIdVH = responsep.data.data
          RequestApis.HR("securities/form/code?seccd=RC_HOUREL", 'get', '', '', '', function (response) {
            RequestApis.HR("workflows/form/" + response.data.Id, 'get', '','','', function (subResponse) {
              let requestItem = {
                "parentId": null,
                "personnelId": parseInt($scope.personel.Id),
                "rootId": null,
                "workflowId": subResponse.data[0].Id,
                "initialDate": moment().format('YYYY-MM-DD'),
                "requesterUserId": Number($scope.currentUserId),
                "statusTypeIdentity": 1,
                "isDone": false,
                "hasChildren": false,
                "title": "درخواست مرخصی ساعتی " + $scope.personel.PoliteName,
                "requestNo": "RC_HOUREL",
                "comment": "",
                "additionalInfo": JSON.stringify(
                  {
                    personnelId: $scope.personel.Id,
                    userId: $scope.currentUserId,
                    title: "درخواست مرخصی ساعتی " + $scope.personel.PoliteName,
                    hourVacationId: ParentResponse
                  }),
                "requestTypeIdentity": subResponse.data[0].Id,
                "createdBy": Number($scope.currentUserId),
                "createdAt": moment().format('YYYY-MM-DD')
              }
              RequestApis.RC('Request/CreateRequest/' + $scope.personel.Id, 'Post','','', requestItem, function (responsex) {
                if (responsex.data.success == true) {
                  $scope.SubmitOccured = true;
                  RequestApis.HR("workflows/request/" + responsex.data.data + "/status/", 'Get', '','','', function (response1) {

                    $scope.formInformation = response1.data[0];
                    RequestApis.HR("workflows/state/" + $scope.formInformation.StateId + "/actions", 'Get', '','','', function (response2) {
                      $scope.buttonsArrayShowDay = false;
                      if (response2.status == 200) {
                        $scope.selectedManagers(responsex.data.data, response2.data[0], $scope.RequestIdVH);
                      } else {
                        $scope.buttonsArray = [];
                        $scope.buttonsArrayShow = false;

                      }
                      $scope.loadingRequest = false;
                    })
                  })
                }
              })
            })
          })

        } else {
          if (responsep.data.errorMessages != undefined) {
            if (responsep.data.errorMessages[0].trim() === "HASOVERLAP") {
              Toast.fire({
                icon: "warning",
                title: "تداخل زمانی وجود دارد لطفا تاریخ را بررسی نمایید",
              });
            } else if (responsep.data.errorMessages[0].trim() === "ISCLOSEDDAY") {
              Toast.fire({
                icon: "warning",
                title: "شما به دلیل بسته شدن محاسبه کارکردتان در تاریخ انتخابی امکان ثبت مرخصی را ندارید",
              });
              $scope.showClosedList(responsep.data);
            } else if (responsep.data.errorMessages[0].trim() === "HasOverlapDailyMission") {
              Toast.fire({
                icon: "warning",
                title: "شما قبلا مأموریت روزانه در این روز ، ثبت نموده اید",
              });
            } else if (responsep.data.errorMessages[0].trim() === "HasOverlapDailyLeave") {
              Toast.fire({
                icon: "warning",
                title: "شما قبلا مرخصی روزانه در این روز، ثبت نموده اید",
              });
            } else if (responsep.data.errorMessages[0].trim() === "HasOverlapHourMission") {
              Toast.fire({
                icon: "warning",
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
    if (Number(item) === 2) {//mission request
      $scope.loadingRequestHourM = true;
      $scope.loadingRequestHourV = false;
      let createHourMissionData = {
        personId: parseInt($scope.personel.Id),
        personName: $scope.personel.PoliteName,
        dossierNo: $scope.personel.DossierNo,
        personnelNo: $scope.personel.PersonnelNo,
        nationalCode: $scope.personel.NationalCode,
        missionDate: $scope.convertToMiladi(date),
        fromTime: items.startTime,
        toTime: items.endTime,
        hourMissionStateId: 0,
        hourMissionStateTitle: "درخواست",
        subjectMission: "",
        missionLocation: "",
        description: "ثبت درخواست از طریق بخش تردد کارتابل ",
        requesterId: Number($scope.currentUserId)
      };
      RequestApis.RC('HourMission/UpsertHourMissionBatch', 'Post','','', [createHourMissionData], function (response) {
        if (response.data.success == true) {
          let parentHourId = response.data.data[0].Id;
          $scope.parentHourId = response.data.data[0].Id;
          let ParentResponse = response.data.data[0];
          RequestApis.HR("securities/form/code?seccd=RC_HOURM", 'get', '','','', function (response) {
            $scope.currentLevel = response.data;
            RequestApis.HR("workflows/form/" + $scope.currentLevel.Id, 'get', '','','', function (subResponse) {
              let requestItem = {
                "parentId": null,
                "personnelId": parseInt($scope.personel.Id),
                "rootId": null,
                "workflowId": subResponse.data[0].Id,
                "initialDate": moment().format('YYYY-MM-DD'),
                "requesterUserId": Number($scope.currentUserId),
                "statusTypeIdentity": 1,
                "isDone": false,
                "hasChildren": false,
                "title": "درخواست مأموریت ساعتی " + $scope.personel.PoliteName,
                "requestNo": "RC_HOURM",
                "comment": "",
                "additionalInfo": JSON.stringify(
                  {
                    personnelId: $scope.personel.Id,
                    userId: $scope.currentUserId,
                    title: "درخواست مأموریت ساعتی " + $scope.personel.PoliteName,
                    hourMissionId: parentHourId
                  }),
                "requestTypeIdentity": subResponse.data[0].Id,
                "createdBy": Number($scope.currentUserId),
                "createdAt": moment().format('YYYY-MM-DD')
              }
              RequestApis.RC('Request/CreateRequest/' + $scope.personel.Id, 'Post','','', requestItem,  function (responsex) {

                if (responsex.data.success == true) {
                  RequestApis.HR("workflows/request/" + responsex.data.data + "/status/", 'Get', '','','', function (response1) {

                    let formInformation = response1.data[0];
                    RequestApis.HR("workflows/state/" + formInformation.StateId + "/actions", 'Get', '','','', function (response2) {
                      if (response2.status == 200) {
                        $scope.selectedManagers(responsex.data.data, response2.data[0], $scope.parentHourId);
                      } else {
                        $scope.buttonsArray = [];
                        $scope.buttonsArrayShow = false;
                      }
                      $scope.loadingRequest = false;
                    })
                  })
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
  }
  //=============== traffic request ===============================
  $scope.addTrafficRequest = function (time) {
    $scope.loadingRequestHourM = false;
    $scope.loadingRequestHourV = false;
    $scope.loadingRequestTraffic = true;
    let itemToSend = {
      "personId": parseInt($scope.personel.Id),
      "personName": "string",
      "dossierNo": "string",
      "personnelNo": "string",
      "nationalCode": "string",
      "rollcall": `${$scope.convertToMiladi($scope.trafficDate)}T${time}:00`,
      "rollCallDate": `${$scope.convertToMiladi($scope.trafficDate)}T${time}:00`,
      "description": "تبت تردد دستی از طریق  تردد داشبورد",
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
    RequestApis.RC('PersonRollCalls/Create', 'Post','','', itemToSend,  function (responsep) {
      if (responsep.data.success == true) {
        let ParentResponse = responsep.data.data;
        $scope.RequestIdVH = responsep.data.data
        RequestApis.HR("securities/form/code?seccd=RC_TRDD", 'get', '', '', '', function (response) {
          RequestApis.HR("workflows/form/" + response.data.Id, 'get','','','' ,function (subResponse) {
            let requestItem = {
              "parentId": null,
              "personnelId": parseInt($scope.personel.Id),
              "rootId": null,
              "workflowId": subResponse.data[0].Id,
              "initialDate": moment().format('YYYY-MM-DD'),
              "requesterUserId": Number($scope.currentUserId),
              "statusTypeIdentity": 1,
              "isDone": false,
              "hasChildren": false,
              "title": "درخواست تردد " + $scope.personel.PoliteName,
              "requestNo": "RC_TRDD",
              "comment": "",
              "additionalInfo": JSON.stringify(
                {
                  personnelId: $scope.personel.Id,
                  userId: $scope.currentUserId,
                  title: "درخواست تردد " + $scope.personel.PoliteName,
                  TrafficId: ParentResponse
                }),
              "requestTypeIdentity": subResponse.data[0].Id,
              "createdBy": Number($scope.currentUserId),
              "createdAt": moment().format('YYYY-MM-DD')
            }
            RequestApis.RC('Request/CreateRequest/' + $scope.personel.Id, 'Post','','', requestItem, function (responsex) {
              if (responsex.data.success == true) {
                $scope.SubmitOccured = true;
                RequestApis.HR("workflows/request/" + responsex.data.data + "/status/", 'Get', '','','', function (response1) {
                  $scope.formInformation = response1.data[0];
                  RequestApis.HR("workflows/state/" + $scope.formInformation.StateId + "/actions", 'Get', '','','', function (response2) {
                    $scope.buttonsArrayShowDay = false;
                    if (response2.status == 200) {
                      $scope.selectedManagers(responsex.data.data, response2.data[0], $scope.RequestIdVH);
                    } else {
                      $scope.buttonsArray = [];
                      $scope.buttonsArrayShow = false;
                    }
                  })
                })
              }
            })
          })
        })

      } else {
        if (responsep.data.errorMessages != undefined) {
          if (responsep.data.errorMessages[0].trim() === "HASOVERLAP") {
            Toast.fire({
              icon: "warning",
              title: "تداخل زمانی وجود دارد لطفا تاریخ را بررسی نمایید",
            });
          } else if (responsep.data.errorMessages[0].trim() === "ISCLOSEDDAY") {
            Toast.fire({
              icon: "warning",
              title: "شما به دلیل بسته شدن محاسبه کارکردتان در تاریخ انتخابی امکان ثبت مرخصی را ندارید",
            });
            $scope.showClosedList(responsep.data);
          } else if (responsep.data.errorMessages[0].trim() === "HasOverlapDailyMission") {
            Toast.fire({
              icon: "warning",
              title: "شما قبلا مأموریت روزانه در این روز ، ثبت نموده اید",
            });
          } else if (responsep.data.errorMessages[0].trim() === "HasOverlapDailyLeave") {
            Toast.fire({
              icon: "warning",
              title: "شما قبلا مرخصی روزانه در این روز، ثبت نموده اید",
            });
          } else if (responsep.data.errorMessages[0].trim() === "HasOverlapHourMission") {
            Toast.fire({
              icon: "warning",
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
      $scope.traffice.TimeToSend = "";
    })
  }
  //----------------------- vacation & mission  request ------------------------
  $scope.selectedManagers = function (requestid, actionType, idsToUpdateH) {
    $scope.idToUpdateH = idsToUpdateH;
    $scope.buttonInfoH = actionType;
    RequestApis.HR(`workflows/actortype/${actionType.ActorTypeId}/next/personnel?rq=${requestid}`, 'Get', '','','', function (response) {
      $scope.requestId = requestid;
      $scope.addToManager = [];
      if (response.status === 200) {
        $scope.managers = response.data;
        if ($scope.managers.Items.length) {
          $("#selectManagers").modal();
        } else {
          $scope.SendToManager($scope.addToManager, requestid);
        }
      } else {
        $scope.SendToManager($scope.addToManager, requestid);
      }
    })
  }
  $scope.cancelManagerSelection = function () {
    $("#selectManagers").modal('hide');
    $scope.addToManager = [];
  }
  $scope.addToManager = [];
  $scope.Addmanagers = function (item) {
    if ($scope.addToManager.some(x => x.Id === item)) {
      $scope.addToManager = $scope.addToManager.filter(y => y.Id === item)
    } else {
      $scope.addToManager.push(item)
    }
  }
  $scope.confirmSelectManagers = function () {
    $("#selectManagers").modal('hide');
    let requestId = $scope.requestId
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
        //if (result.value.length) {
        //    $scope.Comment = result.value;
        //    let str = '"' + result.value + '"';
        //    RequestApis.HR(`workflows/request/${requestId}/notes`, "Post",'','', str, function (response) {
        //    })
        //}
        RequestApis.HR("workflows/request/" + requestId, 'get', '','','', function (response) {
          if ($scope.loadingRequestHourV) {
            $scope.itemToUpdateFuncH($scope.idToUpdateH);
          }
          if ($scope.loadingRequestHourM) {
            $scope.itemToUpdateFuncM($scope.idToUpdateH);
          }
          if ($scope.loadingRequestTraffic) {
            $scope.itemToUpdateFuncT($scope.idToUpdateH);
          }
        })
      }
    })
  }
  $scope.itemToUpdateFuncH = function (items) {
    RequestApis.RC(`HourLeaves/GetById/${items}/false`, 'Get', '', '','', function (response) {
      let item = response.data.data;
      $scope.loadingUpdateHourM = true;
      let requestId = $scope.requestId ?? $scope.urlsearch.requestId;
      let subItemToSend = {
        "personId": item.personId,
        "leaveDate": item.leaveDate,
        "fromTime": item.fromTime,
        "toTime": item.toTime,
        "requestId": requestId,
        "requesterId": item.requesterId,
        "hourLeaveStateId": item.hourLeaveStateId,
        "id": item.id,
        "createdBy": item.createdBy,
        "createdAt": item.createdAt,
        "updatedBy": Number($scope.currentUserId),
        "updatedAt": moment().format('YYYY-MM-DD')
      }
      $scope.finalRequest = true;
      if ($scope.buttonInfoH.PreUrls != undefined) {
        RequestApis.RC($scope.buttonInfoH.PreUrls[0], 'Post','','', subItemToSend,  function (response) {
          if (response.data.success == true) {
            RequestApis.HR("workflows/request/" + requestId, 'get', '','','', function (response1) {
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
              RequestApis.HR('workflows/request/' + requestId + '/simple/move', 'Patch','','', itemTosend, function (response2) {
                if (response2.status === 200) {
                  $scope.loadingUpdateHourM = false;
                  Toast.fire({
                    icon: "success",
                    title: "عملیات با موفقیت انجام شد",
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
        RequestApis.HR("workflows/request/" + requestId, 'get', '','','', function (response1) {
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
          RequestApis.HR('workflows/request/' + requestId + '/simple/move', 'Patch','','', itemTosend, function (response2) {
            if (response2.status === 200) {
              $scope.loadingUpdateHourM = false;
              Toast.fire({
                icon: "success",
                title: "عملیات با موفقیت انجام شد",
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
  $scope.itemToUpdateFuncM = function (id) {
    RequestApis.RC(`HourMission/GetById/${id}`, 'Get', '', '','', function (response) {
      $scope.loadingUpdateHourM = true;
      let items = response.data.data;
      let requestId = $scope.requestId ?? $scope.urlsearch.requestId;
      let subItemToSend = {
        id: items.id,
        personId: parseInt($scope.personel.Id),
        personName: $scope.personel.PoliteName,
        dossierNo: $scope.personel.DossierNo,
        personnelNo: $scope.personel.PersonnelNo,
        nationalCode: $scope.personel.NationalCode,
        missionDate: items.missionDate,
        fromTime: items.fromTime,
        toTime: items.toTime,
        subjectMission: items.subjectMission,
        missionLocation: items.missionLocation,
        description: items.description,
        requestId: Number(requestId),
        requesterId: Number($scope.currentUserId),
        updatedBy: Number($scope.currentUserId),
        updatedAt: moment().format('YYYY-MM-DD')
      }
      $scope.finalRequest = true;
      if ($scope.buttonInfoH.PreUrls != undefined) {
        RequestApis.RC($scope.buttonInfoH.PreUrls[0], 'Post','','', subItemToSend, function (response) {
          if (response.data.success == true) {
            RequestApis.HR("workflows/request/" + requestId, 'get', '','','', function (response1) {
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
              RequestApis.HR('workflows/request/' + requestId + '/simple/move', 'Patch','','', itemTosend, function (response2) {
                if (response2.status === 200) {
                  $scope.loadingUpdateHourM = false;
                  Toast.fire({
                    icon: "success",
                    title: "عملیات با موفقیت انجام شد",
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
        RequestApis.HR("workflows/request/" + requestId, 'get', '','','', function (response1) {
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
          RequestApis.HR('workflows/request/' + requestId + '/simple/move', 'Patch','','', itemTosend, function (response2) {
            if (response2.status === 200) {
              $scope.loadingUpdateHourM = false;
              Toast.fire({
                icon: "success",
                title: "عملیات با موفقیت انجام شد",
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
  $scope.itemToUpdateFuncT = function (id) {
    RequestApis.RC(`PersonRollCalls/GetById/${id}`, 'Get', '', '','', function (response) {
      $scope.loadingUpdateHourM = true;
      let items = response.data.data;
      let requestId = $scope.requestId ?? $scope.urlsearch.requestId;
      let subItemToSend = {
        "rowNo": 0,
        "personId": parseInt($scope.personel.Id),
        "personName": $scope.personel.PoliteName,
        "dossierNo": $scope.personel.DossierNo,
        "personnelNo": $scope.personel.PersonnelNo,
        "nationalCode": $scope.personel.NationalCode,
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
        "isDeleted": true
      }
      $scope.finalRequest = true;
      if ($scope.buttonInfoH.PreUrls != undefined) {
        RequestApis.RC($scope.buttonInfoH.PreUrls[0], 'Post','','', subItemToSend,  function (response) {
          if (response.data.success == true) {
            RequestApis.HR("workflows/request/" + requestId, 'get', '','','', function (response1) {
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
              RequestApis.HR('workflows/request/' + requestId + '/simple/move', 'Patch','','', itemTosend, function (response2) {
                if (response2.status === 200) {
                  $scope.loadingUpdateHourM = false;
                  Toast.fire({
                    icon: "success",
                    title: "عملیات با موفقیت انجام شد",
                  })
                  $('#showTimeField').modal('hide');
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
        RequestApis.HR("workflows/request/" + requestId, 'get', '','','', function (response1) {
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
          RequestApis.HR('workflows/request/' + requestId + '/simple/move', 'Patch','','', itemTosend, function (response2) {
            if (response2.status === 200) {
              $scope.loadingUpdateHourM = false;
              Toast.fire({
                icon: "success",
                title: "عملیات با موفقیت انجام شد",
              })
              $('#showTimeField').modal('hide');
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
  $scope.chengeHurryAbsenceDelay = function (item) {
    $scope.IsAbsence = item;
    $scope.getDailyApiDetails();
  }
  $scope.getDailyApiDetails = function () {
    let fromDateSelect = '';
    let toDateSelect = '';
    if ($scope.monthselectedItem != undefined) {
      fromDateSelect = moment(`${$scope.yearSelectedItem != undefined ? $scope.yearSelectedItem : moment().format('jYYYY/jMM/jDD').split('/')[0]}/${$scope.monthselectedItem}/01`)._i;
      toDateSelect = moment($scope.convertToMiladi(`${$scope.yearSelectedItem != undefined ? $scope.yearSelectedItem : moment().format('jYYYY/jMM/jDD').split('/')[0]}/${$scope.monthselectedItem}/10`)).endOf('jMonth').format('jYYYY/jMM/jDD');
    } else {
      fromDateSelect = moment(`${$scope.yearSelectedItem != undefined ? $scope.yearSelectedItem : moment().format('jYYYY/jMM/jDD').split('/')[0]}/${moment().format('jYYYY/jMM/jDD').split('/')[1]}/01`)._i;
      toDateSelect = moment().endOf('jMonth').format('jYYYY/jMM/jDD');
    }
    let itemToSend1 = {
      "fromDate": $scope.convertToMiladi(fromDateSelect),
      "toDate": $scope.convertToMiladi(toDateSelect),
      "fromDatePersian": fromDateSelect,
      "toDatePersian": toDateSelect,
      "personIds": [$scope.personel.Id],
      "formatType": 2,
      "presenceStatus": [],
      "dayStatus": null,
      "isLinerReport": false,
      "unitTypeGroupId": null,
      "isAbsence": $scope.IsAbsence != undefined ? $scope.IsAbsence : false,
      "pageNumber": $scope.DADPageNumber != undefined ? $scope.DADPageNumber : 1,
      "pageSize": $scope.DADpageSize != undefined ? $scope.DADpageSize : 31,
    }
    RequestApis.RC(`Reports/GetDailyCalculatedReport`, 'Post','','', itemToSend1, function (response) {
      if (response.status == 200) {
        $scope.monthResult = response.data.data.item1[0]
        $scope.gridItem = response.data.data;
        $scope.gridItem.PageIndex = response.data.data.item3;
        $scope.gridItem.TotalRows = response.data.data.item2;
        $scope.gridItem.TotalPages = Math.ceil(response.data.data.item2 / response.data.data.item4);
        $scope.pageLoading = false;
      }
    })
  }
  $scope.changePagefirstTable = function (page) {
    if ($scope.gridItem.TotalPages >= $scope.gridItem.PageIndex && page >= 1 && page <= $scope.gridItem.TotalPages) {
      $scope.DADPageNumber = page;
      $scope.getDailyApiDetails();
    }
  }
  $scope.changePageSize = function (pagesize) {
    $scope.DADpageSize = Number(pagesize);
    $scope.DADPageNumber = undefined;
    $scope.getDailyApiDetails();
  }
  $scope.showSecondGrid = function (item) {
    $scope.startDayShow = item.startDayPersian
    RequestApis.RC(`PersonRollCalls/GetRollCallDetails?PersonId=${$scope.personel.Id}&Date=${item.startDay}`, 'Get', '','','', function (response) {
      if (response.data.success) {
        $scope.secondItemsData = response.data.data
        $('#selectSta').val('');
        $('#SecondGridModal').modal();
      } else {
        Toast.fire({
          icon: 'error',
          title: 'دریافت اطلاعات تردد با خطا مواجه شد'
        })
      }
    })
  }
  $scope.cancelSecondgrid = function () {
    $('#SecondGridModal').modal('hide');
  }
  $scope.Completetraffic = function (item) {
    $scope.trafficDate = item.startDayPersian
    RequestApis.RC(`PersonRollCalls/GetPersonRollWithStateList?Person=${$scope.personel.Id}&Date=${$scope.convertToMiladi(item.startDayPersian)}`, 'Post','','', { "pageNumber": 1, "pageSize": 1000 }, function (response) {
      console.log(response)
      $scope.preRequest = response.data.data.item1;
    })
    $scope.traffice.TimeToSend = "";
    $('#showTimeField').modal();
  }
  $scope.cancelCompleteTrafficModal = function () {
    $scope.TimeToSend = "";
    $('#showTimeField').modal('hide');
  }

  $scope.acceptChanges = function () {
    if ($scope.itemToSetVacation.length) {

    }
    if ($scope.itemToSetMission.length) {

    }
    if ($scope.itemToSetVacationH.length) {
      Object.values($scope.itemToSetVacationH).forEach(x => {

      })
    }
    if ($scope.itemToSetMissionH.length) {

    }
  }
  $scope.checkFunc = function (item) {
    let result = false;
    if (Number(item.split(':').join('')) > 0) {
      result = true;
    }
    return result;
  }
  $scope.searching = function (searchItem) {
    $scope.numbertype = true;
    $scope.paginationReport = [];
    var itemToSend = {
      "fromDate": searchItem.fromDatePersian != undefined ? $scope.convertToMiladi(searchItem.fromDatePersian) : "",
      "toDate": searchItem.toDatePersian != undefined ? $scope.convertToMiladi(searchItem.toDatePersian) : "",
      "fromDatePersian": searchItem.fromDatePersian != undefined ? searchItem.fromDatePersian : "",
      "toDatePersian": searchItem.toDatePersian != undefined ? searchItem.toDatePersian : "",
      "fromTime": searchItem.fromTime != undefined ? searchItem.fromTime.length > 0 ? searchItem.fromTime + ":00" : null : null,
      "toTime": searchItem.toTime != undefined ? searchItem.toTime.length > 0 ? searchItem.toTime + ":00" : null : null,
      "inCompleteRC": searchItem.inCompleteRC ? true : false,
      "isFirst": searchItem.isFirst,
      "aDeviceCode": searchItem.aDeviceCode != undefined ? searchItem.aDeviceCode : null,
      "rollCallType": searchItem.rollCallType != undefined ? searchItem.rollCallType.length > 0 ? searchItem.rollCallType : null : null,
      "registeredType": searchItem.registeredType != undefined ? searchItem.registeredType.length > 0 ? searchItem.registeredType : null : null,
      "registeredCode": searchItem.registeredCode != undefined ? searchItem.registeredType.length > 0 ? searchItem.registeredCode : null : null,
      "number": searchItem.number,
      "personIds": [$scope.personel.Id]
    }
    var path = "";
    if (searchItem.number == 1) {
      path = "Reports/GetCompositeSearchReport1"
    } else {
      path = "Reports/GetCompositeSearchReport2"
    }
    RequestApis.RC(path, 'Post','','', itemToSend, function (response) {
      if (response.status == 200) {
        $scope.reports = response.data.data;
        $scope.searchBtn = true;
        $scope.err = false;
      } else {
        $scope.searchBtn = false;
        $scope.err = true;
        $scope.reports = [];
      }
      $scope.paginationReports();
    })
  }

  $scope.fnExcelReport = function (searchItem) {
    $scope.loadingForSaveExcel = true;
    var createXLSLFormatObj = [];
    /* XLS Head Columns */
    if (searchItem.number == 1 && $scope.numbertype) {
      var headerItems = document.getElementById('header').children;
    } else {
      var headerItems = document.getElementById('header1').children;
    }
    var xlsHeader = [];
    for (let i = 0; i < headerItems.length; i++) {
      xlsHeader.push(headerItems[i].innerHTML.trim());
    }
    createXLSLFormatObj.push(xlsHeader);
    /* XLS body Columns */
    var bodyItems = document.createElement('tbody');
    if (searchItem.number == 1 && $scope.numbertype) {
      for (let i = 0; i < $scope.reports.length; i++) {
        let tr = document.createElement('tr');
        let td0 = document.createElement('td');
        td0.appendChild(document.createTextNode($scope.reports[i].personName));
        tr.appendChild(td0);
        let td1 = document.createElement('td');
        td1.appendChild(document.createTextNode($scope.reports[i].startDayPersian));
        tr.appendChild(td1);
        let td2 = document.createElement('td');
        td2.appendChild(document.createTextNode($scope.reports[i].dayNamePersian));
        tr.appendChild(td2);
        let td3 = document.createElement('td');
        td3.appendChild(document.createTextNode($scope.reports[i].presenceStatus));
        tr.appendChild(td3);
        let td4 = document.createElement('td');
        td4.appendChild(document.createTextNode($scope.reports[i].rollCallDate));
        tr.appendChild(td4);
        for (let j = 0; j < $scope.reports[i].items.length; j++) {
          const element = [];
          element[j] = document.createElement('td');
          element[j].appendChild(document.createTextNode($scope.reports[i].items[j].hour));
          tr.appendChild(element[j]);
        }
        for (let j = 0; j < $scope.reports[i].items.length; j++) {
          const element = [];
          element[j] = document.createElement('td');
          element[j].appendChild(document.createTextNode($scope.reports[i].items[j].type));
          tr.appendChild(element[j]);
        }
        for (let j = 0; j < $scope.reports[i].items.length; j++) {
          const element = [];
          element[j] = document.createElement('td');
          element[j].appendChild(document.createTextNode($scope.reports[i].items[j].aDevice));
          tr.appendChild(element[j]);
        }
        bodyItems.appendChild(tr);
      }
    } else {
      for (let i = 0; i < $scope.reports.length; i++) {
        let tr = document.createElement('tr');
        let td0 = document.createElement('td');
        td0.appendChild(document.createTextNode($scope.reports[i].PersonName));
        tr.appendChild(td0);
        let td1 = document.createElement('td');
        td1.appendChild(document.createTextNode($scope.reports[i].StartDayPersian));
        tr.appendChild(td1);
        let td2 = document.createElement('td');
        td2.appendChild(document.createTextNode($scope.reports[i].DayNamePersian));
        tr.appendChild(td2);
        let td3 = document.createElement('td');
        td3.appendChild(document.createTextNode($scope.reports[i].PresenceStatus));
        tr.appendChild(td3);
        let td4 = document.createElement('td');
        td4.appendChild(document.createTextNode($scope.reports[i].RollCallTime));
        tr.appendChild(td4);
        let td5 = document.createElement('td');
        td5.appendChild(document.createTextNode($scope.reports[i].RollcallType));
        tr.appendChild(td5);
        let td6 = document.createElement('td');
        td6.appendChild(document.createTextNode($scope.reports[i].RegisteredCode));
        tr.appendChild(td6);
        bodyItems.appendChild(tr);
      }
    }
    for (let i = 0; i < bodyItems.children.length; i++) {
      var xlsBody = [];
      for (let j = 0; j < bodyItems.children[i].children.length; j++) {
        xlsBody.push(bodyItems.children[i].children[j].innerHTML.trim());
      }
      createXLSLFormatObj.push(xlsBody);
    }
    /* File Name */
    var filename = "result";

    /* Sheet Name */
    var ws_name = "گزارش";
    var wb = XLSX.utils.book_new(),
      ws = XLSX.utils.aoa_to_sheet(createXLSLFormatObj);
    if (!wb.Workbook) wb.Workbook = {};
    if (!wb.Workbook.Views) wb.Workbook.Views = [{ RTL: true }];
    XLSX.utils.book_append_sheet(wb, ws, ws_name);
    var wopts = { bookType: 'xlsx', bookSST: false, type: 'array' };
    var wbout = XLSX.write(wb, wopts);
    saveAs(new Blob([wbout], { type: "application/octet-stream" }), filename + ".xlsx");
    $scope.loadingForSaveExcel = false;
  }

  $scope.PersonIds = [];
  $scope.saveReportPdf = function (searchItem) {
    $scope.loadingForSave = true;
    var itemToSend = {
      "fromDate": searchItem.fromDatePersian != undefined ? $scope.convertToMiladi(searchItem.fromDatePersian) : "",
      "toDate": searchItem.toDatePersian != undefined ? $scope.convertToMiladi(searchItem.toDatePersian) : "",
      "fromDatePersian": searchItem.fromDatePersian != undefined ? searchItem.fromDatePersian : "",
      "toDatePersian": searchItem.toDatePersian != undefined ? searchItem.toDatePersian : "",
      "fromTime": searchItem.fromTime != undefined ? searchItem.fromTime.length > 0 ? searchItem.fromTime + ":00" : null : null,
      "toTime": searchItem.toTime != undefined ? searchItem.toTime.length > 0 ? searchItem.toTime + ":00" : null : null,
      "inCompleteRC": searchItem.inCompleteRC ? true : false,
      "isFirst": searchItem.isFirst,
      "aDeviceCode": searchItem.aDeviceCode != undefined ? searchItem.aDeviceCode : null,
      "rollCallType": searchItem.rollCallType != undefined ? searchItem.rollCallType.length > 0 ? searchItem.rollCallType : null : null,
      "registeredType": searchItem.registeredType != undefined ? searchItem.registeredType.length > 0 ? searchItem.registeredType : null : null,
      "registeredCode": searchItem.registeredCode != undefined ? searchItem.registeredType.length > 0 ? searchItem.registeredCode : null : null,
      "number": searchItem.number,
      "personIds": [$scope.personel.Id]
    }
    RequestApis.RC('Reports/GetCompositeSearchReportStimule', 'Post','','', itemToSend, function (response) {
      const arr = new Uint8Array(response.data);
      const blob = new Blob([arr], { type: 'application/pdf' });
      saveAs(blob, "تفضیلی در تاریخ-" + new Date().toLocaleString() + '.pdf')
      $scope.loadingForSave = false;
    })
  }
  //==================== vacation section ========================
  // ----- show traffic for selected day-------
  $scope.showTrafficThisDay = function () {
    if ($scope.personnelData.data.length == 1) {
      let thisDate = $scope.convertToMiladi($('#startHDate').val());

      var path =
        "PersonRollCalls/GetListPersonRollCall/" +
        $scope.personnelData.data[0].Id +
        "?FromDt=" +
        thisDate +
        "&ToDt=" +
        thisDate;

      requests.gettingData(path, function (response) {
        $scope.trafficHours = response.data
      })
    }

  }

  $scope.selectedHours = {
    fromTime: "notSet",
    toTime: "notSet"
  }

  /*============= pagination ==================*/
  //------------- selected personnel paging--------
  $scope.paginate = function () {
    $scope.currentPage = 1;
    $scope.pageSize = 10;
    $scope.paginationSelectedPersonnel = JSON.parse(localStorage.getItem("MultiSelectionPersonnel"));
    $scope.totalLength = $scope.paginationSelectedPersonnel.length;
  }
  //----------- default hour vacation paging --------------
  $scope.paginationSelectedPersonnelH = [];
  $scope.paginateHVacation = function () {
    $scope.currentPageHV = 1;
    $scope.pageSizeHV = 10;
    $scope.paginationSelectedPersonnelH = $scope.hourVacation;
    if ($scope.personel != undefined && $scope.personel.length != 0) {
      $scope.totalLengthH = $scope.paginationSelectedPersonnelH.length;
    }
  }
  //----------- default day vacation paging --------------
  $scope.paginateDVacation = function () {
    $scope.currentPageDV = 1;
    $scope.pageSizeDV = 10;
    $scope.paginationSelectedPersonnelD = $scope.dayVacation;
    $scope.totalLengthD = $scope.dayVacation.item2;
  }
  //================ Initialize Vacation type ==========================

  $scope.changeStateVacationFunc = function (item) {
    $scope.firstShow = false;
    $scope.leavInformation = {}
    switch (item) {
      case 1:
        $scope.DayVacationList = false;
        $scope.HourVacationList = true;
        $scope.GetHourVacationList();
        break;
      case 2:
        $scope.DayVacationList = true;
        $scope.HourVacationList = false;
        $scope.GetPersonalVacationList();
        break;
      default:
        $scope.HourVacationList = false;
        $scope.DayVacationList = false;
    }
  }

  //------------ Get hour Vacations List ----------------
  $scope.GetHourVacationList = function () {
    $scope.hourVacation = [];
    let item = {
      pageNumber: 1,
      pageSize: 10000,
      sortField: null,
      sortAsc: true,
      fillNestedClass: true,
      searchList: [
        {
          searchValue: $scope.personel.Id.toString(),
          searchField: "HL.PersonId",
          operatorType: 0,
          operandType: 0
        }]
    }
    RequestApis.RC("HourLeaves/GetList", 'Post','','', item,  function (response) {
      if (response.status == 200) {
        $scope.hourVacation = response.data.data.item1;
        $scope.paginateHVacation();
      } else {
        Toast.fire({
          icon: "error",
          title: response.errorMessages ?? "عملیات با خطا مواجه شد",
        });
      }

    })
  }
  $scope.downloadVacationCard = function (item) {
    RequestApis.RC("Reports/GetHourLeaveForPrint/", 'Get', '', 'arraybuffer','', function (response) {
      if (response === 'Not Found') {
        Toast.fire({
          icon: 'error',
          title: 'برگه مرخصی برای پرینت وجود ندارد'
        })
      } else {
        const arr = new Uint8Array(response.data);
        const blob = new Blob([arr], { type: 'application/pdf' });
        saveAs(blob, "برگه مرخصی " + item.personName);
      }
    })
  }
  $scope.downloadVacationCardDay = function (item) {
    RequestApis.RC(`Reports/GetPersonLeaveForPrint/${item.id}`, 'Get', '', 'arraybuffer','', function (response) {
      if (response === 'Not Found') {
        Toast.fire({
          icon: 'error',
          title: 'برگه مرخصی برای پرینت وجود ندارد'
        })
      } else {
        const arr = new Uint8Array(response.data);
        const blob = new Blob([arr], { type: 'application/pdf' });
        saveAs(blob, "برگه مرخصی " + item.personName);
      }
    })
  }
  $scope.dayVacation = [];
  //------------ Get day Vacations List ----------------
  $scope.GetPersonalVacationList = function () {
    $scope.dayVacation = [];

    let item = {
      pageNumber: 1,
      pageSize: 10000,
      sortField: null,
      sortAsc: true,
      searchList: [{
        searchValue: $scope.personel.Id.toString(),
        searchField: "PL.PersonId",
        operatorType: 0,
        operandType: 0
      }]
    }
    RequestApis.RC(`PersonLeave/GetList`, 'Post','','', item, function (response) {
      if (response.status == 200) {
        $scope.dayVacation = response.data.data.item1;
      } else {
        Toast.fire({
          icon: "error",
          title: response.errorMessages ?? "عملیات با خطا مواجه شد",
        });
      }
      $scope.paginateDVacation();
    })

  };


  //========================= mission section ======================
  //----------- hour Mission paging --------------
  $scope.paginationSelectedPersonnelHM = [];
  $scope.paginateHMission = function () {
    $scope.currentPageHM = 1;
    $scope.pageSizeHM = 10;
    $scope.paginationSelectedPersonnelHM = $scope.hourMission.item1;
    $scope.totalLengthHM = $scope.hourMission.item2;
  }
  //----------- day Mission paging --------------
  $scope.paginateDMission = function () {
    $scope.currentPageDM = 1;
    $scope.pageSizeDM = 10;
    $scope.paginationSelectedPersonnelDM = $scope.dayMission.item1;
    $scope.totalLengthDM = $scope.dayMission.item2;
  }
  //------------------------------------------------
  $scope.missionChangeType = function (item) {
    switch (item) {
      case 1:
        $scope.GetHourMissionList();
        $scope.hourMistionListTrue = true;
        $scope.dayMistionListTrue = false;
        $scope.paginateHMission();
        break;
      case 2:
        $scope.GetDayMissionList();
        $scope.dayMistionListTrue = true;
        $scope.hourMistionListTrue = false;
        $scope.selectId = [];
        $scope.dayMission = [];
        $scope.paginateDMission();
        break;
      default:
        $scope.dayMistionListTrue = false;
        $scope.hourMistionListTrue = false;
    }
  }
  //------------ Get hour missions List by personnel id ----------------
  $scope.hourMission = [];
  $scope.GetHourMissionList = function (pageItem = null) {
    $scope.hourMission = [];
    let searchLists = [];
    let searchList = {
      "searchValue": $scope.personel.Id.toString(),
      "searchField": "HM.PersonId",
      "operatorType": 0,
      "operandType": 0
    }
    searchLists.push(searchList);
    let item = {
      pageNumber: 1,
      pageSize: 10000,
      sortField: null,
      sortAsc: true,
      searchList: searchLists
    }
    RequestApis.RC(`HourMission/GetList`, 'Post','','', item, function (response) {
      if (response.status == 200) {
        $scope.hourMission = response.data.data;
        $scope.paginateHMission();
      }
    })
  }
  //------------ Get day missions List gloabaly----------------
  $scope.GetDayMissionList = function (pageItem = null) {
    let searchLists = [];
    $scope.dayMission = [];
    $scope.dayMistionListTrue = true;
    let searchList = {
      "searchValue": $scope.personel.Id.toString(),
      "searchField": "PM.PersonId",
      "operatorType": 0,
      "operandType": 0
    }
    searchLists.push(searchList);
    let item = {
      pageNumber: 1,
      pageSize: 10000,
      sortField: null,
      sortAsc: true,
      searchList: searchLists
    }
    RequestApis.RC(`PersonMission/GetList`, 'Post','','', item, function (response) {
      if (response.status == 200) {
        $scope.dayMission = response.data.data;
        $scope.paginateDMission();
      }
    })
  }
  $scope.downloadMissionCard = function (item) {
    RequestApis.RC(`Reports/GetHourMissionForPrint/${item.id}`, 'Get', '', 'arraybuffer','', function (response) {
      if (response === 'Not Found') {
        Toast.fire({
          icon: 'error',
          title: 'برگه مأموریتی برای پرینت وجود ندارد'
        })
      } else {
        const arr = new Uint8Array(response.data);
        const blob = new Blob([arr], { type: 'application/pdf' });
        saveAs(blob, "برگه مأموریت " + item.personName + '.pdf')
      }
    })
  }
  $scope.downloadMissionCardDay = function (item) {
    RequestApis.RC(`Reports/GetPersonMissionForPrint/${item.id}/person/${item.personId}`, 'Get', '', 'arraybuffer','', function (response) {
      if (response === 'Not Found') {
        Toast.fire({
          icon: 'error',
          title: 'برگه مأموریتی برای پرینت وجود ندارد'
        })
      } else {
        const arr = new Uint8Array(response.data);
        const blob = new Blob([arr], { type: 'application/pdf' });
        saveAs(blob, "برگه مأموریت " + item.personName + '.pdf')
      }

    })
  }

  //======================== vage bills section ==================
  $scope.monthSelectedFish = function (item) {
    $scope.selectedMonthFish = item;
    if ($scope.selectedYearFish != undefined) {
      $scope.getVageBillData(item, $scope.selectedYearFish)
    } else {
      $scope.getVageBillData(item, moment().format('jYYYY/jMM/jDD').split('/')[0])
    }
  }
  $scope.yearSelectedF = function (item) {
    $scope.selectedYearFish = item;
    if ($scope.selectedMonthFish != undefined) {
      $scope.getVageBillData($scope.selectedMonthFish, item)
    } else {
      $scope.getVageBillData(moment().format('jYYYY/jMM/jDD').split('/')[1], item)
    }
  }

  $scope.getVageBillData = function (month, year) {
    let fullDate = Number(`${year}${month}`)
    let sumPay = 0;
    let sumPay2 = 0;
    let sumPay3 = 0;
    RequestApis.RC(`PersonRollCalls/GetPersonelPaymentInfo?PersonId=${$scope.personel.Id}&Date=${fullDate}`, 'get', '', '','', function (res) {
      if (res.data.success) {
        $scope.vagebilldata = res.data.data;
        Object.values($scope.vagebilldata.payInfoModels).forEach(x => {
          sumPay += x.pay1
          sumPay2 += x.pay2
          sumPay3 += x.pay3
        })
        $scope.pureVage = sumPay - (sumPay2 + sumPay3);
        $scope.sumReduced = (sumPay2 + sumPay3);
        $scope.sumVages = sumPay;
        $scope.pageLoading = false;
      }
    })
  }
  $scope.printBill = function (month, year) {
    $scope.loadingBillPrint = true;
    RequestApis.RC(`Reports/GetPersonelPaymentInfoPrint?personId=${$scope.selectedInfo.Id}&date=${Number(`${year}${month}`)}&strDate=${$scope.monthsObjInfo.find(x => Number(x.id) === Number(month)).name} ${year}`, 'Post', '', 'arraybuffer','', function (response) {
      console.log(response)
      var fileName = `${$scope.monthsObjInfo.find(x => Number(x.id) === Number(month)).name}.pdf`;
      var a = document.createElement("a");
      var file = new Blob([response.data], { type: 'application/pdf' });
      var fileURL = window.URL.createObjectURL(file);
      a.href = fileURL;
      a.download = fileName;
      a.click();
      $scope.loadingBillPrint = false;
    });
  }



  //==================== vacation request Section ================
  $scope.clearingItems = function () {
    $scope.createDayVacationData = {};
    $scope.leaveDayInfo = {};
    $scope.treatmentData = {};
    $scope.IntitlementInfo = {};
    $scope.maternityData = {};
    $scope.entitlement = false;
    $scope.maternity = false;
    $scope.hardDisease = false;
    $scope.treatment = false;
    $scope.buttonsArrayShowDay = false;
    $scope.buttonsArrayDay = [];
  }
  $scope.showVacationRequestModal = function (item) {
    RequestApis.RC(`PersonRollCalls/CheckMissionOrLeave?PersonId=${$scope.personel.Id}&Date=${item.startDay}`, 'Post', '', '','', function (response) {
      if (!response.data.success) {
        Toast.fire({
          icon: "error",
          title: response.data.errorMessages[0]
        });
      } else {
        if (response.data.data != null) {
          Toast.fire({
            icon: "error",
            title: response.data.data
          });
        } else {
          $scope.checkLimitation(item.startDayPersian)
          $scope.clearingItems();
          $scope.createDayVacationData.fromDate = item.startDayPersian;
          $scope.createDayVacationData.toDate = item.startDayPersian;
          $scope.getTypeOfVacation();
          $('#vacationRequestModal').modal();
        }

      }
    })
  }
  $scope.cancelVacationRequest = function () {
    $('#vacationRequestModal').modal('hide');
  }
  $scope.checkLimitation = function (item) {
    $scope.IsLimited = false;
    RequestApis.RC(`PersonLeave/CheckRequestTimeLimit?fromDate=${$scope.convertToMiladi(item)}`, 'Get', '', '','', function (response) {
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
  } //----------- validator for dates -------------------
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
          personId: $scope.personel.Id,
          fromDate: $scope.convertToMiladi(fromDate),
          toDate: $scope.convertToMiladi(Todate)
        };
        $scope.SideInfoData = {};
        RequestApis.RC(`PersonLeave/GetAllTimeRollCalls`, 'Post','','', item, function (response) {
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
  $scope.getLeaveDayInfo = function () {
    if ($scope.createDayVacationData.fromDate != undefined && $scope.createDayVacationData.toDate != undefined) {
      let fromDate = $scope.convertToMiladi($scope.createDayVacationData.fromDate);
      let toDate = $scope.convertToMiladi($scope.createDayVacationData.toDate);
      RequestApis.RC(`PersonLeave/GetLeaveDays/${$scope.personel.Id}?FromDate=${fromDate}&ToDate=${toDate}`, 'Get', '', '','', function (response) {
        $scope.leaveDayInfo = response.data.data;
      })
    }
  }
  $scope.getIntitlementInfo = function () {
    let item = {
      "toDate": moment().format('YYYY-MM-DD'),
      "toDatePersian": moment().format('jYYYY-jMM-jDD'),
      "personIds": [$scope.personel.Id],
      "negativeRemaining": false,
      "pageNumber": 1,
      "pageSize": 1,
      "searchList": []
    }
    RequestApis.RC('Reports/GetLeaveStatusByPersonReport', 'Post','','', item,function (response) {
      $scope.IntitlementInfo = response.data.data.item1[0];
    })
  }
  $scope.checkFriday = function (fromDate) {
    if (fromDate != undefined) {
      RequestApis.RC(`PersonLeave/IsFriday?FromDate=${$scope.convertToMiladi(fromDate)}`, 'Get', '', '','', function (response) {
        if (response.data) {
          Toast.fire({
            icon: "warning",
            title: "روز انتخاب شده شما جمعه است.",
          });
        }
      })
    }
  }
  $scope.getTypeOfVacation = function () {
    $scope.item = {
      pageNumber: 1,
      pageSize: 10,
      sortField: null,
      sortAsc: true,
      fillNestedClass: true,
      searchList: []
    }
    RequestApis.RC('DayLeaveType/GetList', 'Post','','', $scope.item,  function (response) {
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
  $scope.getTreatmentInfo = function () {
    if ($scope.createDayVacationData.fromDate != undefined && $scope.createDayVacationData.toDate != undefined) {
      let fromDate = $scope.convertToMiladi($scope.createDayVacationData.fromDate);
      let toDate = $scope.convertToMiladi($scope.createDayVacationData.toDate);
      RequestApis.RC(`PersonLeave/GetSickLeaveDays/${$scope.personel.Id}?FromDate=${fromDate}&ToDate=${toDate}`, 'Get', '', '','', function (response) {
        $scope.treatmentData = response.data.data;
        $scope.createDayVacationData.sickLeaveInMonth = response.data.sickLeaveInMonth;
        $scope.createDayVacationData.sickLeaveInYear = response.data.sickLeaveInYear;
      })
    }
  }
  $scope.getMaternityInfo = function () {
    if ($scope.createDayVacationData.fromDate != undefined && $scope.createDayVacationData.toDate != undefined) {
      let fromDate = $scope.convertToMiladi($scope.createDayVacationData.fromDate);
      let toDate = $scope.convertToMiladi($scope.createDayVacationData.toDate);
      RequestApis.RC('PersonLeave/GetMaternityLeaveDays/' + $scope.personel.Id + '?FromDate=' + fromDate + '&ToDate=' + toDate, 'Get', '', '','', function (response) {
        $scope.maternityData = response.data.data;
      })
    }
  }
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
          RequestApis.RC('Search/GetAutoComplete/' + typeAuto + '/' + val, 'Get', '', '','', function (response) {
            if (response.data.success === true) {
              if (response.data.data.length) {
                type == "TreatmentUnitAC" ? $scope.wordListUnit = response.data.data : (type == "SubjectLeaveAC" ? $scope.wordListReason = response.data.data : (type == "TrustedDoctorAC" ? $scope.wordListDoctor = response.data.data : $scope.wordList = null))
              } else {
                type == "TreatmentUnitAC" ? $scope.wordListUnit = [] : (type == "SubjectLeaveAC" ? $scope.wordListReason = [] : (type == "TrustedDoctorAC" ? $scope.wordListDoctor = [] : $scope.wordList = []))
              }
            }
          })
        } else {
          RequestApis.RC('Search/GetAutoComplete/' + typeAuto + '/ ', 'Get', '', '','', function (response) {
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
        RequestApis.RC('Search/InsertAutoComplete?autoCompleteName=' + typeAuto + '&str=' + item, 'Post', '', '','', function (response) {
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
  $scope.getDiffDayForVacation = function (dateFrom, DateTo) {
    var datefrom = new Date(dateFrom.toString().split('T')[0]);
    var dateto = new Date(DateTo.toString().split('T')[0]);
    let Diff_In_Time = dateto.getTime() - datefrom.getTime();
    let Diff_In_Days = Diff_In_Time / (1000 * 3600 * 24);
    return Diff_In_Days + 1;
  }
  $scope.getRemindVacation = function () {
    let currentDate = moment().format('YYYY-MM-DD');
    RequestApis.RC(`LeaveRemainings/CalculateCurrentLeaveRemaining?currentDate=${currentDate}`, 'Post','', '', [$scope.personel.Id], function (response) {
      $scope.leavInformation = response.data.data[0];
    })
  }
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
        "personId": $scope.personel.Id,
        "personName": $scope.personel.PoliteName,
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
      RequestApis.RC('PersonLeave/UpsertPersonLeaveBatch', 'Post','', '', [itemtosend],  function (response) {
        if (response.data.success == true) {
          let ParentResponse = response.data.data[0];
          $scope.createdId = response.data.data[0].Id;
          RequestApis.HR("securities/form/code?seccd=" + $scope.WorkFlowCode, 'get', '','', '', function (response) {
            RequestApis.HR("workflows/form/" + response.data.Id, 'get', '','', '', function (subResponse) {
              let requestItem = {
                "parentId": null,
                "personnelId": parseInt($scope.personel.Id),
                "rootId": null,
                "workflowId": subResponse.data[0].Id,
                "initialDate": moment().format('YYYY-MM-DD'),
                "requesterUserId": Number($scope.currentUserId),
                "statusTypeIdentity": 1,
                "isDone": false,
                "hasChildren": false,
                "title": "درخواست مرخصی " + $scope.workFlowCodePersian + " برای " + $scope.personel.PoliteName,
                "requestNo": $scope.WorkFlowCode,
                "comment": "",
                "additionalInfo": JSON.stringify({
                  personnelId: $scope.personel.Id,
                  userId: $scope.currentUserId,
                  title: "درخواست مرخصی " + $scope.workFlowCodePersian + " برای " + $scope.personel.PoliteName,
                  dailyVacationId: ParentResponse.Id
                }),
                "requestTypeIdentity": subResponse.data[0].Id,
                "createdBy": Number($scope.currentUserId),
                "createdAt": moment().format('YYYY-MM-DD')
              }
              RequestApis.RC('Request/CreateRequest/' + $scope.personel.Id, 'Post','', '', requestItem, function (response) {
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
                icon: "warning",
                title: "تداخل زمانی وجود دارد لطفا تاریخ را بررسی نمایید",
              });
            } else if (response.data.errorMessages[0].trim() === "ISCLOSEDDAY") {
              Toast.fire({
                icon: "warning",
                title: "شما به دلیل بسته شدن محاسبه کارکردتان در تاریخ انتخابی امکان ثبت مأموریت را ندارید",
              });
              $scope.showClosedList(response.data);
            } else if (response.data.errorMessages[0].trim() === "HasOverlapHourMission") {
              Toast.fire({
                icon: "warning",
                title: "شما قبلا مأموریت ساعتی در یکی از روزهای این بازه تاریخی انتخابیتان، ثبت نموده اید",
              });
            } else if (response.data.errorMessages[0].trim() === "HasOverlapDailyMission") {
              Toast.fire({
                icon: "warning",
                title: "شما قبلا مأموریت روزانه در یکی از روزهای این بازه تاریخی انتخابیتان، ثبت نموده اید",
              });
            } else if (response.data.errorMessages[0].trim() === "HasOverlapHourLeave") {
              Toast.fire({
                icon: "warning",
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
    RequestApis.HR("workflows/request/" + requestId + "/status/", 'Get', '','', '', function (response1) {
      $scope.formInformation = response1.data[0];
      RequestApis.HR("workflows/state/" + $scope.formInformation.StateId + "/actions", 'Get', '', '', '',function (response2) {
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
    RequestApis.HR(`workflows/actortype/${actionType.ActorTypeId}/next/personnel?rq=${requestid}&ach=${$scope.ach}&paging.ps=${$scope.personnelSelectedPSD != undefined ? $scope.personnelSelectedPSD : 10}&paging.pn=${$scope.personnelSelectedPND != undefined ? $scope.personnelSelectedPND : 1}`, 'Get', '','', '', function (response) {
      $scope.requestIdDay = requestid;
      $scope.addToManagerDay = [];
      if (response.status === 200) {
        $scope.managers = response.data;
        if ($scope.managers.Items.length) {
          $("#selectManagers").modal();
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
    if ($scope.buttonsArrayShowDayM) {

      $scope.selectedManagersDayM($scope.requestIdDay, $scope.buttonInfoDay, $scope.itemsToUpdate);
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
    $("#selectManagers").modal('hide');
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
    $scope.SendToManagerDay($scope.addToManager, requestId);
    $scope.addToManager = [];
    $("#selectManagers").modal('hide');
  }
  $scope.SendToManagerDay = function (managersId, requestId) {
    $scope.managersId = managersId;
    RequestApis.HR("workflows/request/" + requestId, 'get', '','', '', function (response) {
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
        "personId": $scope.personel.Id,
        "personName": $scope.personel.PoliteName,
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
      RequestApis.RC($scope.buttonInfoDay.PreUrls[0], 'Post','', '', subItemToSend,  function (response3) {
        if (response3.data.success == true) {
          RequestApis.HR("workflows/request/" + requestId, 'get', '', '', '',function (response7) {
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
            RequestApis.HR('workflows/request/' + requestId + '/simple/move', 'Patch','', '', itemTosend, function (response) {
              if (response.status === 200) {
                Toast.fire({
                  icon: "success",
                  title: "عملیات با موفقیت انجام شد",
                }).then((result) => {
                  $scope.cancelVacationRequest();
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
        title: response.data.errorMessages ?? "عملیات با خطا مواجه شد",
      });
    }
  }


  //==================== mission request Section ================
  $scope.showMissionRequestModal = function (item) {
    RequestApis.RC(`PersonRollCalls/CheckMissionOrLeave?PersonId=${$scope.personel.Id}&Date=${item.startDay}`, 'Post', '', '','', function (response) {
      if (!response.data.success) {
        Toast.fire({
          icon: "error",
          title: response.data.errorMessages[0]
        });
      } else {
        if (response.data.data != null) {
          Toast.fire({
            icon: "error",
            title: response.data.data
          });
        } else {
          $scope.checkLimitation(item.startDayPersian)
          $scope.clearingMissionItems();
          $scope.createDayMissionData.fromDate = item.startDayPersian;
          $scope.createDayMissionData.toDate = item.startDayPersian;
          $scope.MissionDuration();
          $scope.getTypeOfMission();
          $scope.getVehicleType();
          $('#missionRequestModal').modal();

        }
      }
    })
  }
  $scope.cancelMissionRequest = function () {
    $('#missionRequestModal').modal('hide');
  }
  $scope.clearingMissionItems = function () {
    $scope.createDayMissionData = {};
    $scope.buttonsArrayShowDay = false;
    $scope.buttonsArrayDay = [];
  }
  $scope.getDiffDayFOrMission = function (dateFrom, DateTo) {
    var datefrom = new Date(dateFrom.toString().split('T')[0]);
    var dateto = new Date(DateTo.toString().split('T')[0]);
    let Diff_In_Time = dateto.getTime() - datefrom.getTime();
    let Diff_In_Days = Diff_In_Time / (1000 * 3600 * 24);
    return Diff_In_Days + 1;
  }
  //---------- residence -----------
  $scope.AutoCompleteSearchResidence = function (item) {
    if (item != undefined && item.length != 0) {
      RequestApis.RC('Search/GetAutoComplete/ResidenceAC/' + item, 'Get', '', '', '', function (response) {
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
      RequestApis.RC('Search/GetAutoComplete/ResidenceAC/ ', 'Get', '', '', '', function (response) {
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
        RequestApis.RC('Search/InsertAutoComplete?autoCompleteName=ResidenceAC&str=' + item, 'Post', '', '', '', function (response) {
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
      RequestApis.RC('Search/GetAutoComplete/missionLocation/' + item, 'Get', '', '', '', function (response) {
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
      RequestApis.RC('Search/GetAutoComplete/missionLocation/ ', 'Get', '', '', '', function (response) {
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
        RequestApis.RC('Search/InsertAutoComplete?autoCompleteName=missionLocation&str=' + item, 'Post', '', '', '', function (response) {
          $scope.showAutoCompleteSubjectMission = false;
        })
      }
    } else {
      $timeout(function () { $scope.showAutoCompleteSubjectMission = false; }, 150)
    }
  }
  $scope.selectPredictlocation = function (item) {
    $scope.createDayMissionData.missionLocation = item
    $scope.showAutoCompletelocation = false;
  }

  //--------- subject mission ------
  $scope.AutoCompleteSearchSubjectMission = function (item) {
    if (item != undefined && item.length != 0) {
      RequestApis.RC('Search/GetAutoComplete/SubjectMissionAC/' + item, 'Get', '', '', '', function (response) {
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
      RequestApis.RC('Search/GetAutoComplete/SubjectMissionAC/ ', 'Get', '', '', '', function (response) {
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
        RequestApis.RC('Search/InsertAutoComplete?autoCompleteName=SubjectMissionAC&str=' + item, 'Post', '', '', '', function (response) {
          $scope.showAutoCompleteSubjectMission = false;
        })
      }
    } else {
      $timeout(function () { $scope.showAutoCompleteSubjectMission = false; }, 150)
    }
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
    RequestApis.RC('DayMissionType/GetLookUp', 'Post','', '', item, function (response) {
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
    RequestApis.RC('api/Constants/enum/VehicleType', 'Get', '', '', '', function (response) {
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
  $scope.MissionDuration = function () {
    if ($scope.createDayMissionData.fromDate != undefined && $scope.createDayMissionData.fromDate.length && $scope.createDayMissionData.toDate != undefined && $scope.createDayMissionData.toDate.length) {
      if ($scope.getDiffDayFOrMission($scope.createDayMissionData.fromDate, $scope.createDayMissionData.toDate) > 0) {
        $scope.createDayMissionData.dayCount = $scope.getDiffDayFOrMission($scope.createDayMissionData.fromDate, $scope.createDayMissionData.toDate)
        let item = {
          personId: $scope.personel.Id,
          fromDate: $scope.convertToMiladi($scope.createDayMissionData.fromDate),
          toDate: $scope.convertToMiladi($scope.createDayMissionData.toDate)
        };
        $scope.SideInfoData = {};
        RequestApis.RC(`PersonLeave/GetAllTimeRollCalls`, 'Post','', '', item, function (response) {
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
      RequestApis.RC(`PersonLeave/IsFriday?FromDate=${$scope.convertToMiladi($scope.createDayMissionData.fromDate)}`, 'Get', '', '', '', function (response) {
        if (response.data) {
          Toast.fire({
            icon: "warning",
            title: "روز انتخاب شده شما جمعه است.",
          });
        }
      })
    }
  }
  $scope.requestDayM = function (item) {
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
      "personIds": [parseInt($scope.personel.Id)],
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
    RequestApis.RC('PersonMission/InsertMissionRequest', 'Post','', '', itemtosend, function (responsep) {

      if (responsep.data.success == true) {
        let ParentResponse = responsep.data.data;
        $scope.requestMD = responsep.data.data.id
        RequestApis.HR("securities/form/code?seccd=RC_DAYM", 'get', '','', '', function (response) {
          RequestApis.HR("workflows/form/" + response.data.Id, 'get', '','', '', function (subResponse) {
            let requestItem = {
              "parentId": null,
              "personnelId": parseInt($scope.personel.Id),
              "rootId": null,
              "workflowId": subResponse.data[0].Id,
              "initialDate": moment().format('YYYY-MM-DD'),
              "requesterUserId": Number($scope.currentUserId),
              "statusTypeIdentity": 1,
              "isDone": false,
              "hasChildren": false,
              "title": "درخواست مأموریت روزانه " + $scope.personel.PoliteName,
              "requestNo": "RC_DAYM",
              "comment": "",
              "additionalInfo": JSON.stringify({
                personnelId: $scope.personel.Id,
                userId: $scope.currentUserId,
                title: "درخواست مأموریت روزانه " + $scope.personel.PoliteName,
                DayMissionFormId: ParentResponse.id
              }),
              "requestTypeIdentity": subResponse.data[0].Id,
              "createdBy": Number($scope.currentUserId),
              "createdAt": moment().format('YYYY-MM-DD')
            }
            RequestApis.RC('Request/CreateRequest/' + $scope.personel.Id, 'Post','', '', requestItem, function (response) {
              if (response.data.success == true) {
                $scope.SubmitOccured = true;
                $scope.loadingRequestDayM = false;
                $scope.dynamicBtnsDayM(ParentResponse, response.data.data);
              }
            })
          })
        })

      } else {
        if (responsep.data.errorMessages != undefined) {

          if (responsep.data.errorMessages[0].trim() === "HASOVERLAP") {
            Toast.fire({
              icon: "warning",
              title: "تداخل زمانی وجود دارد لطفا تاریخ را بررسی نمایید",
            });
          } else if (responsep.data.errorMessages[0].trim() === "ISCLOSEDDAY") {
            Toast.fire({
              icon: "warning",
              title: "شما به دلیل بسته شدن محاسبه کارکردتان در تاریخ انتخابی امکان ثبت مأموریت را ندارید",
            });
            $scope.showClosedList(responsep.data.data);
          } else if (responsep.data.errorMessages[0].trim() === "HasOverlapHourMission") {
            Toast.fire({
              icon: "warning",
              title: "شما قبلا مأموریت ساعتی در یکی از روزهای این بازه تاریخی انتخابیتان، ثبت نموده اید",
            });
          } else if (responsep.data.errorMessages[0].trim() === "HasOverlapDailyLeave") {
            Toast.fire({
              icon: "warning",
              title: "شما قبلا مرخصی روزانه در یکی از روزهای این بازه تاریخی انتخابیتان، ثبت نموده اید",
            });
          } else if (responsep.data.errorMessages[0].trim() === "HasOverlapHourLeave") {
            Toast.fire({
              icon: "warning",
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
  $scope.dynamicBtnsDayM = function (items, requestId) {
    $scope.returnDataFromCreateApiDay = items;
    $scope.requestIdDay = requestId;
    RequestApis.HR("workflows/request/" + requestId + "/status/", 'Get', '','', '', function (response1) {
      $scope.formInformation = response1.data[0];
      RequestApis.HR("workflows/state/" + $scope.formInformation.StateId + "/actions", 'Get', '','', '', function (response2) {
        if (response2.status == 200) {
          $scope.buttonsArrayDayM = response2.data;
          $scope.buttonsArrayShowDayM = true;
        } else {
          $scope.buttonsArrayDayM = [];
          $scope.buttonsArrayShowDayM = false;
        }
      })
    })
  }
  $scope.DynamicConfirmsDayM = function (actionType, itemToUpdate) {
    let requestId = $scope.requestIdDay ?? $scope.urlsearch.requestId;
    $scope.buttonsArrayShowDayM = true;
    $scope.buttonsArrayShowM = false;
    $scope.selectedManagersDayM(requestId, actionType, itemToUpdate);
  }
  $scope.selectedManagersDayM = function (requestid, actionType, itemToUpdate) {

    $scope.itemsToUpdate = itemToUpdate;
    $scope.buttonInfoDay = actionType;
    RequestApis.HR(`workflows/actortype/${actionType.ActorTypeId}/next/personnel?rq=${requestid}&ach=${$scope.ach}&paging.ps=${$scope.personnelSelectedPSD != undefined ? $scope.personnelSelectedPSD : 10}&paging.pn=${$scope.personnelSelectedPND != undefined ? $scope.personnelSelectedPND : 1}`, 'Get', '', '', '',function (response) {
      $scope.requestIdDay = requestid;
      $scope.addToManagerDay = [];
      if (response.status === 200) {
        $scope.managers = response.data;
        if ($scope.managers.Items.length) {
          $("#selectManagers").modal();
        } else {
          $scope.SendToManagerDayM($scope.addToManagerDay, requestid);
        }
      } else {
        $scope.SendToManagerDayM($scope.addToManagerDay, requestid);
      }
    })
  }
  $scope.confirmSelectManagersDayM = function () {
    let requestId = $scope.requestIdDay ?? $scope.urlsearch.requestId;
    $("#selectManagers").modal('hide');
    $scope.SendToManagerDayM($scope.addToManager, requestId);
    $scope.addToManager = [];
  }
  $scope.SendToManagerDayM = function (managersId, requestId) {
    $scope.managersId = managersId;
    RequestApis.HR("workflows/request/" + requestId, 'get', '','', '', function (response) {
      if (response.status === 200) {
        $scope.itemToUpdateFuncDM($scope.itemsToUpdate);
      } else {
        Toast.fire({
          icon: 'error',
          title: 'عملیات در مرحله دریافت اطلاعات درخواست، با خطا مواجه شد'
        })
      }
    })
  }
  $scope.itemToUpdateFuncDM = function (items) {
    let requestId = items.requestId != undefined ? items.requestId : $scope.requestIdDay != undefined ? $scope.requestIdDay : $scope.urlsearch.requestId;
    $scope.finalRequest = true;
    let id = items.id != undefined ? items.id : $scope.requestMD
    RequestApis.RC('PersonMission/GetMission?RequestId=' + id + '&PersonId=', 'Get', '', '', '', function (response) {
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
        RequestApis.RC($scope.buttonInfoDay.PreUrls[0], 'Post','', '', subItemToSend,  function (response3) {
          if (response3.data.success == true) {
            RequestApis.HR("workflows/request/" + requestId, 'get', '','', '', function (response7) {
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
              RequestApis.HR('workflows/request/' + requestId + '/simple/move', 'Patch','', '', itemTosend, function (response) {
                if (response.status === 200) {
                  Toast.fire({
                    icon: "success",
                    title: "عملیات با موفقیت انجام شد",
                  }).then((result) => {
                    $scope.cancelMissionRequest();
                  });
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
        Toast.fire({
          icon: "error",
          title: response.data.errorMessages ?? "عملیات با خطا مواجه شد",
        });
      }
    })
  }
  //==================== assessment report =========================
  $scope.getPeriods = function () {
    RequestApis.HR('periods', 'Get', '','', '', function (response) {
      $scope.PriodItems = response.data.Items;
    })
  }
  $scope.getDataTable = function () {
    RequestApis.HR('assessments?pn=1&ps=100&id=' + $scope.selectedInfo.Id, 'Get', '','', '', function (response) {
      if (response.status === 200) {
        $scope.priods = response.data;
      } else {
        Toast.fire({
          icon: 'error',
          title: 'داده ای برای نمایش وجود ندارد'
        })
        $scope.priods = [];
      }

      $scope.loadingSearch = false;
    })
  }
  $scope.ShowPrintFormModal = function (item) {
    item.loadingPrint = true;
    $scope.fileName = 'گزارش در تاریخ - ' + new Date().toLocaleDateString('fa-IR');
    RequestApis.HR('assessments/report/' + item.Id + '/pdf?q=' + $scope.fileName, 'GET', '', "arraybuffer",'', function (response) {
      if (response.status === 200) {
        const blob = new Blob([response.data], { type: "'" + response.headers(["content-type"]) + "'" });
        saveAs(blob, 'report-' + new Date().toLocaleDateString() + '.pdf')
      } else {
        Toast.fire({
          icon: 'error',
          title: 'خطا در دریافت پرینت گزارش'
        })
      }
      item.loadingPrint = false;
    })
  }
  //==================== log out =================================
  $scope.logOut = function () {
    RequestApis.RC(`Account/Logout?refreshToken=${localStorage.getItem(`refresh_token`)}`, 'get', '', '','', function (response) {
      document.cookie = '.ASPXAUTH' + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/';
      document.cookie = 'ASP.NET_SessionId' + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/';
      window.location.href = check ? `${window.origin}/${window.location.pathname.toString().split("/")[1]}/login/Login.aspx` : `${window.origin}/login/Login.aspx`;
    })
  }
  $scope.goToPage = function (item) {
    if (item === "cartable") {
      check ? `${window.origin}/${window.location.pathname.toString().split("/")[1]}/api/` : `${window.origin}/api/`
      window.location.href = check ? `${window.origin}/${window.location.pathname.toString().split("/")[1]}/GlobalValue/cartable.html` : `${window.origin}/GlobalValue/cartable.html`;
    }
  }
  $scope.changePass = function () {
    window.parent.location.href = check ? `${window.origin}/${window.location.pathname.toString().split("/")[1]}/Login/ChangePassword.aspx` : `${window.origin}/Login/ChangePassword.aspx`;
  }
})
app.controller('abilityCtrl', function ($scope, $compile, $timeout, RequestApis, global) {
  //=============== initial variables ==================
  $scope.loadingCreateCulture = false;
  $scope.loadingEditCulture = false;
  $scope.loadingDeleteCulture = false;
  $scope.loadingCreateLicense = false;
  $scope.loadingEditLicense = false;
  $scope.loadingDeleteLicense = false;
  $scope.loadingCreateFreeCourse = false;
  $scope.loadingEditFreeCourse = false;
  $scope.loadingDeleteFreeCourse = false;
  $scope.loadingCreateAssay = false;
  $scope.loadingEditAssay = false;
  $scope.loadingDeleteAssay = false;
  $scope.organizationAllow = false;
  $scope.organizationAllowE = false;
  $scope.createCultureState = false;
  $scope.editCultureState = false;
  $scope.createLicenseState = false;
  $scope.editLicenseState = false;
  $scope.createFreeCourseState = false;
  $scope.editFreeCourseState = false;
  $scope.loadedPage = ""
  $scope.languageAbility = [];
  $scope.NoItems = false;
  $scope.loadingList = false;
  $scope.PageNum = 1;
  $scope.PageSize = 10;

  $scope.bodyData = [];
  $scope.abilitiesParent = [{ Id: -1, Title: 'صفحه نخست', Identifier: "FirstTab", IsVirtual: false, IsDisable: false }]
  //======================= input masks =====================
  $scope.inputMasks = function (minDate = null) {
    $timeout(function () {
      $(".date-picker").datepicker({
        dateFormat: "yy/mm/dd",
        changeMonth: true,
        changeYear: true,
        minDate: minDate
      });
    }, 1)
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

  //============= find nummeric item input ======
  $scope.NumericItems = function (item) {
    return [3, 4, 7, 12].some(x => x === item)
  }
  //============= get location ================
  $scope.data = {
    data: {},
    status: true
  };
  $scope.useSelectedLocation = function () {
    switch ($scope.State) {
      case 'createCulture':
        $scope.createCulture.province = $scope.data.data.Name;
        $scope.createCulture.provinceId = $scope.data.data.Id;
        $scope.createCultureState = false;
        $scope.editCultureState = false;
        break;
      case 'editCulture':
        $scope.editCulture.province = $scope.data.data.Name;
        $scope.editCulture.provinceId = $scope.data.data.Id;
        $scope.editCultureState = false;
        $scope.createCultureState = false;
        break;
      case 'createLicense':
        $scope.createLicense.province = $scope.data.data.Name;
        $scope.createLicense.provinceId = $scope.data.data.Id;
        $scope.createLicenseState = false;
        $scope.editLicenseState = false;
        break;
      case 'editLicense':
        $scope.editLicense.province = $scope.data.data.Name;
        $scope.editLicense.provinceId = $scope.data.data.Id;
        $scope.editLicenseState = false;
        $scope.createLicenseState = false;
        break;
      case 'createFreeCourse':
        $scope.createFreeCourse.province = $scope.data.data.Name;
        $scope.createFreeCourse.provinceId = $scope.data.data.Id;
        $scope.createFreeCourseState = false;
        $scope.editFreeCourseState = false;
        break;
      case 'editFreeCourse':
        $scope.editFreeCourse.province = $scope.data.data.Name;
        $scope.editFreeCourse.provinceId = $scope.data.data.Id;
        $scope.editFreeCourseState = false;
        $scope.createFreeCourseState = false;
        break;
      case 'createAssay':
        $scope.createAssay.province = $scope.data.data.Name;
        $scope.createAssay.provinceId = $scope.data.data.Id;
        $scope.createAssayState = false;
        $scope.editAssayState = false;
        break;
      case 'editAssay':
        $scope.editAssay.province = $scope.data.data.Name;
        $scope.editAssay.provinceId = $scope.data.data.Id;
        $scope.editAssayState = false;
        $scope.createAssayState = false;
        break;
      default:
    }
  }
  $scope.cleanLocation = function (item) {
    switch (item) {
      case 'createCulture':
        $scope.createCulture.province = "";
        $scope.createCulture.provinceId = "";
        $scope.createCultureState = true;
        $scope.editCultureState = false;
        break;
      case 'editCulture':
        $scope.editCulture.province = "";
        $scope.editCulture.provinceId = "";
        $scope.editCultureState = true;
        $scope.createCultureState = false;
        break;
      case 'createLicense':
        $scope.createLicense.province = "";
        $scope.createLicense.provinceId = "";
        $scope.createLicenseState = true;
        $scope.editLicenseState = false;
        break;
      case 'editLicense':
        $scope.editLicense.province = "";
        $scope.editLicense.provinceId = "";
        $scope.editLicenseState = true;
        $scope.createLicenseState = false;
        break;
      case 'createFreeCourse':
        $scope.createFreeCourse.province = "";
        $scope.createFreeCourse.provinceId = "";
        $scope.createFreeCourseState = true;
        $scope.editFreeCourseState = false;
        break;
      case 'editFreeCourse':
        $scope.editFreeCourse.province = "";
        $scope.editFreeCourse.provinceId = "";
        $scope.editFreeCourseState = true;
        $scope.createFreeCourseState = false;
        break;
      case 'createAssay':
        $scope.createAssay.province = "";
        $scope.createAssay.provinceId = "";
        $scope.createAssayState = true;
        $scope.editAssayState = false;
        break;
      case 'editAssay':
        $scope.editAssay.province = "";
        $scope.editAssay.provinceId = "";
        $scope.editAssayState = true;
        $scope.createAssayState = false;
        break;
      default:
    }
  }
  $scope.showLocationFunc = function (item) {
    switch (item) {
      case 'createCulture':
        $scope.State = 'createCulture'
        $scope.createCultureState = $scope.createCultureState === false;
        break;
      case 'editCulture':
        $scope.State = 'editCulture';
        $scope.editCultureState = $scope.editCultureState === false;
        break;
      case 'createLicense':
        $scope.State = 'createLicense'
        $scope.createLicenseState = $scope.createLicenseState === false;
        break;
      case 'editLicense':
        $scope.State = 'editLicense';
        $scope.editLicenseState = $scope.editLicenseState === false;
        break;
      case 'createFreeCourse':
        $scope.State = 'createFreeCourse'
        $scope.createFreeCourseState = $scope.createFreeCourseState === false;
        break;
      case 'editFreeCourse':
        $scope.State = 'editFreeCourse';
        $scope.editFreeCourseState = $scope.editFreeCourseState === false;
        break;
      case 'createAssay':
        $scope.State = 'createAssay'
        $scope.createAssayState = $scope.createAssayState === false;
        break;
      case 'editAssay':
        $scope.State = 'editAssay';
        $scope.editAssayState = $scope.editAssayState === false;
        break;
      default:
    }
  }

  $scope.checkingExist = function (item) {
    return global.checkExist(item);
  }
  //============== get organization ============
  $scope.data = {
    data: {},
    status: true
  };
  $scope.useSelectedOrganization = function () {
    if ($scope.editCulture != undefined) {
      $scope.editCulture.OrgTitle = $scope.data.data.Title;
      $scope.editCulture.OrgId = $scope.data.data.Id;
      $scope.organizationAllowE = false;
    }
    if ($scope.createCulture != undefined) {
      $scope.createCulture.OrgTitle = $scope.data.data.Title;
      $scope.createCulture.OrgId = $scope.data.data.Id;
      $scope.organizationAllow = false;
    }
    if ($scope.editLicense != undefined) {
      $scope.editLicense.OrgTitle = $scope.data.data.Title;
      $scope.editLicense.OrgId = $scope.data.data.Id;
      $scope.organizationAllowE = false;
    }
    if ($scope.createLicense != undefined) {
      $scope.createLicense.OrgTitle = $scope.data.data.Title;
      $scope.createLicense.OrgId = $scope.data.data.Id;
      $scope.organizationAllow = false;
    }
    if ($scope.editFreeCourse != undefined) {
      $scope.editFreeCourse.OrgTitle = $scope.data.data.Title;
      $scope.editFreeCourse.OrgId = $scope.data.data.Id;
      $scope.organizationAllowE = false;
    }
    if ($scope.createFreeCourse != undefined) {
      $scope.createFreeCourse.OrgTitle = $scope.data.data.Title;
      $scope.createFreeCourse.OrgId = $scope.data.data.Id;
      $scope.organizationAllow = false;
    }
    if ($scope.editAssay != undefined) {
      $scope.editAssay.OrgTitle = $scope.data.data.Title;
      $scope.editAssay.OrgId = $scope.data.data.Id;
      $scope.organizationAllowE = false;
    }
    if ($scope.createAssay != undefined) {
      $scope.createAssay.OrgTitle = $scope.data.data.Title;
      $scope.createAssay.OrgId = $scope.data.data.Id;
      $scope.organizationAllow = false;
    }
  }
  $scope.changeOrganizationStatus = function () {
    $scope.organizationAllowE = $scope.organizationAllowE === false;
    $scope.organizationAllow = $scope.organizationAllow === false;
  }

  //============ side bar creation ======================
  RequestApis.HR('miscellanea/group', 'Get', '', '', '', function (response) {
    $scope.abilitiesParent = $scope.abilitiesParent.concat(response.data);
    $scope.abilitiesParent[0].selected = true;
    $scope.firstTab = true;
  })
  $scope.getAbilityData = function (abilityParent) {
    $scope.abilitiesParent.map(x => x.selected = false);
    $timeout(function () {
      $scope.abilitiesParent.find(x => x.Id === abilityParent.Id).selected = true;
    }, 1)
    $scope.manageItemForUI(abilityParent);
  }
  //============ manage sidebar selction =============
  $scope.manageItemForUI = function (item) {
    if (item.Identifier.toUpperCase() === "FIRSTTAB")
      $scope.firstTab = true;
    else {
      $scope.firstTab = false;
      RequestApis.HR(`miscellanea/personnel/${$scope.selectedInfo.Id}/group/${item.Id}`, 'Get', '', '', '', function (response) {
        Object.values(item.Template.Items).forEach(itm => {
          if (global.checkExist(itm.SelectionMethod))
            $scope.getBodyData(itm);
          if (global.checkExist(itm.Field)) {
            if (global.checkExist(itm.Field.SelectionMethod))
              $scope.getBodyData(itm.Field);
            if (response.status !== 404) {
              if (global.checkExist(itm.Header)) {
                Object.values(itm.Header).forEach(header => {
                  if (global.checkExist(header.SelectionMethod))
                    $scope.getBodyData(header);
                })
                itm.Values = response.data.FieldValues.find(x => x.FieldId === itm.Field.Id).Values;
                if (global.checkExist(itm.Values[0].DataValue)) {
                  itm.Values = [{ FieldId: itm.Field.Id, DataValue: null }]
                  itm.Values = itm.Values.concat(response.data.FieldValues.find(x => x.FieldId === itm.Field.Id).Values);
                  Object.values(itm.Values).forEach(value => {
                    if (global.checkExist(value.DataValue))
                      value.CurrentValue = JSON.parse(value.DataValue);
                    else {
                      value.CurrentValue = { Value: JSON.parse(itm.Field.DataTemplate) }
                    }
                  })
                } else {
                  itm.Values[0].CurrentValue = { Value: JSON.parse(itm.Field.DataTemplate) };
                }
              }
              else {
                itm.Values = response.data.FieldValues.find(x => x.FieldId === itm.Field.Id).Values;
                if (global.checkExist(itm.Values[0].DataValue)) {
                  if (Object.hasOwn(JSON.parse(itm.Values[0].DataValue), "Value")) {
                    itm.Values[0].CurrentValue = JSON.parse(itm.Values[0].DataValue);
                  } else {
                    itm.Values[0].CurrentValue = { Value: JSON.parse(itm.Values[0].DataValue) };
                  }
                }
                else {
                  if (Object.hasOwn(JSON.parse(itm.Field.DataTemplate), "Value")) {
                    itm.Values[0].CurrentValue = JSON.parse(itm.Field.DataTemplate);
                  } else {
                    itm.Values[0].CurrentValue = { Value: JSON.parse(itm.Field.DataTemplate) };
                  }
                }
              }
            }
          }
        })
        $scope.miscellaneaInfo = item;
      });
    }
  }
  $scope.checkIfCanChange = function (field, itemsG) {
    let result = false;
    if ((global.checkExist(field.IsReadOnly) && field.IsReadOnly))
      result = true;
    if (global.checkExist(field.EnableFormula)) {
      let item = JSON.parse(field.EnableFormula)[0]
      let items = itemsG.Template.Items.filter(x => global.checkExist(x.Field));
      if (global.checkExist(items.find(x => x.Identifier === item.Identifier).Values[0].CurrentValue)) {
        console.log(items.find(x => x.Identifier === item.Identifier).Values[0].CurrentValue)
        console.log(Number(items.find(x => x.Identifier === item.Identifier).Values[0].CurrentValue.Value))
        if (typeof (items.find(x => x.Identifier === item.Identifier).Values[0].CurrentValue.Value) !== "boolean") {
          if (Number(items.find(x => x.Identifier === item.Identifier).Values[0].CurrentValue.Value) !== item.Value || items.find(x => x.Identifier === item.Identifier).Values[0].CurrentValue === null)
            result = true;
          console.log("ee")
        } else {
          if (items.find(x => x.Identifier === item.Identifier).Values[0].CurrentValue.Value !== item.Value || items.find(x => x.Identifier === item.Identifier).Values[0].CurrentValue === null)
            result = true;
          console.log("rr")
        }
      }
      
    }
    return result;
  }
  $scope.getValueForGroupCheckWithHasFlag = function (item, selfValue) {
    let result = false;
    if ((Number(item) & Number(selfValue)) === Number(selfValue))
      result = true;
    return result;
  }
  $scope.setValueForGroupCheckWithHasFlag = function (item, selfValue) {
    item.CurrentValue = { Value: (item.CurrentValue !== null && global.checkExist(item.CurrentValue.Value)) ? (Number(item.CurrentValue.Value) + Number(selfValue)).toString() : Number(selfValue).toString() }
  }
  $scope.setGroupRadioItem = function (currentValue, identifier) {
    Object.keys(currentValue.Value).forEach(x => {
      if (identifier.Group === x.split('_')[1])
        if (identifier.Identifier !== x)
          currentValue.Value[x] = false;
        else
          currentValue.Value[x] = true;
    });
  }
  $scope.getBodyData = function (item) {
    $scope.loadingBodyData = true;
    if (item.SelectionMethodType === 32) {
      let url = "";
      if (item.SelectionMethod.includes('{') || item.SelectionMethod.includes('}')) {
        let leftSide = item.SelectionMethod.slice(0, item.SelectionMethod.indexOf('{'))
        let rightSide = item.SelectionMethod.slice(item.SelectionMethod.indexOf('}') + 1)
        url = leftSide + $scope.selectedInfo.Id + rightSide
      } else {
        url = item.SelectionMethod;
      }
      RequestApis.HR(`${url}${url.includes('?') ? '&' : '?'}ps=10000&pn=1`, 'Get', '', '', '', function (response) {
        if (response.status === 200) {
          if (global.checkExist(response.data.Items))
            item.bodyData = response.data.Items
          else
            item.bodyData = response.data
        }
        $scope.loadingBodyData = true;
      })
    } else {
      url = item.SelectionMethod;
      RequestApis.HR(`constants/enum/${url}`, 'Get', '', '', '', function (response) {
        if (global.checkExist(response.data.Items))
          item.bodyData = response.data.Items
        else
          item.bodyData = response.data
        $scope.loadingBodyData = true;
      })
    }

  }
  $scope.setSelectBoxItem = function (item, value) {
    item.CurrentValue = { Id: value.Id, Title: value.Title };
  }
  $scope.saveItems = function (item) {
    $scope.loadingSave = true;
    let itemsToCreate = [];
    let itemsToUpdate = [];
    if (global.checkExist(item.Template))
      if (item.Template.Items.length) {
        Object.values(item.Template.Items).forEach(itm => {
          if (global.checkExist(itm.Values)) {
            Object.values(itm.Values).forEach(val => {
              if (!global.checkExist(val.RowVersion)) {
                if (!global.objEqual(Object.hasOwn(JSON.parse(itm.Field.DataTemplate), "Value") ? val.CurrentValue : val.CurrentValue.Value, JSON.parse(itm.Field.DataTemplate))) {
                  if (global.checkExist(val.CurrentValue)) {
                    if (Object.hasOwn(val.CurrentValue, "Value")) {
                      itemsToCreate.push({
                        "DataValue": JSON.stringify({ Value: val.CurrentValue.Value }),
                        "FieldId": val.FieldId
                      })
                    }
                  }
                }
              } else {
                itemsToUpdate.push({
                  "Id": val.Id,
                  "DataValue": JSON.stringify({ Value: val.CurrentValue.Value }),
                  "ValueIdx": val.ValueIdx,
                  "RowVersion": val.RowVersion,
                  "FieldId": val.FieldId,
                  "HasAnyAttachments": val.HasAnyAttachments
                })
              }
            })
          }
        })
        if (itemsToUpdate.length) {
          RequestApis.HR(`miscellanea/personnel/${$scope.selectedInfo.Id}/group/${item.Id}`, 'patch', '', '', itemsToUpdate, function (response) {
            if (response.status === 200) {
              $scope.getAbilityData($scope.miscellaneaInfo)
            }
            global.messaging(response);
            $scope.loadingSave = false;
          })
        }
        if (itemsToCreate.length) {
          RequestApis.HR(`miscellanea/personnel/${$scope.selectedInfo.Id}/group/${item.Id}`, 'post', '', '', itemsToCreate, function (response) {
            if (response.status === 200) {
              $scope.getAbilityData($scope.miscellaneaInfo)
            }
            global.messaging(response);
            $scope.loadingSave = false;
          })
        }
      }
  }
  $scope.removeItem = function (item) {
    RequestApis.HR(`miscellanea/personnel`, 'delete','', '', { Id: item.Id, RowVersion: item.RowVersion }, function (response) {
      if (response.status === 204) {
        $scope.getAbilityData($scope.miscellaneaInfo)
      }
      global.messaging(response);
    })
  }
  $scope.print = function () {
    $scope.loadingPrint = true;
    RequestApis.HR(`miscellanea/personnel/${$scope.selectedInfo.Id}/report/pdf`, 'GET', '', "arraybuffer",'', function (response) {
      if (response.status === 200) {
        const blob = new Blob([response.data], { type: "application/pdf" });
        saveAs(blob, 'report-' + new Date().toLocaleDateString() + '.pdf')
      }
      global.messaging(response);
      $scope.loadingPrint = false;
    })
  }
});