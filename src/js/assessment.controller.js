app.controller('evaluationCtrl', function ($scope, $templateCache, $state, $stateParams, $timeout, RequestApis, global) {
    //======================= variables =======================
    $scope.assessment = {};
    $scope.assessment.personnelInfo = {};
    $scope.assessment.UserId = {};
    $scope.assessment.priodsInfo = {};
    $scope.assessment.urlParamsInfo = {};
    $scope.assessment.headerInfo = {};
    $scope.assessment.formEntryInfo = {};
    $scope.assessment.formInfo = {};
    $scope.assessment.workflowInfo = {};
    $scope.assessment.anyApiInfo = {};
    $scope.assessment.fieldInfo = {};
    $scope.assessment.children = {};
    $scope.assessment.goalsToAdd = {};
    $scope.assessment.tableDataAdd1 = {};
    $scope.assessment.tableDataAdd = {};
    $scope.assessment.tableData = {};
    $scope.assessment.tableData1 = {};
    $scope.lastValueIndex = 0;
    $scope.assessment.createNewOneForProgram = {};
    $scope.assessment.tableDataList = {};
    $scope.assessment.buttonInfo = {};
    $scope.assessment.currentLevel = {};
    $scope.assessment.secondTableData = {};
    $scope.assessment.publicTableData = {};
    $scope.assessment.adviceTableData = {};
    $scope.assessment.SumScoreSpecialSection = 0;
    $scope.assessment.SumScorePublicSection = 0;
    $scope.assessment.ach = null;
    $scope.assessment.personnelSelectedPS = 10;
    $scope.assessment.personnelSelectedPN = 1;
    $scope.assessment.dataToDelete = [];
    $scope.assessment.historyOfgoalsToAdd = [];
    $scope.assessment.historyOfgoalsToAdd1 = [];
    $scope.assessment.historyOfTableDataAdd1 = [];
    $scope.assessment.programsForPersonnel = [];
    $scope.assessment.selectedPersonnelForMove = [];
    $scope.assessment.personnelForSelecting = [];
    $scope.assessment.itemForSecondTable = [];
    $scope.assessment.AllowSpecialPage = false;
    $scope.assessment.AllowAdvicePage = false;
    $scope.assessment.AllowPublicPage = false;
    $scope.assessment.isFromCartable = false;
    $scope.assessment.checkValidation = true;
    $scope.assessment.loadingPage = false;
    $scope.assessment.loadingFailed = false;
    $scope.assessment.Isstarted = false;
    $scope.assessment.IsRequester = false;
    $scope.assessment.checkingWorkflow = false;
    $scope.assessment.deleteAllowed = false;
    $scope.assessment.paginationItemsForTableData1_2 = `&ps=100&pn=1`;
    $scope.assessment.paginationItemsForNewListOfProgramTableData = '';
    $scope.assessment.pageNumberForListTable = '';
    $scope.assessment.directStyle = {
        'overflow-y': 'auto',
        'overflow-x': 'hidden',
        'height': '90vh',
        'margin-bottom': '10vh'
    };
    $scope.assessment.PublicStyle = {
        'overflow-y': 'auto',
        'overflow-x': 'hidden',
    };
    $scope.evaluation = [
        {
            Title: "الف - عوامل اختصاصی:",
            Id: "1",
            page: '../../views/Assessment/specialEvaluation.html?v=' + Date.now(),
            selected: false,
            form: 1
        },
        {
            Title: " ب - عوامل عمومی:",
            Id: "2",
            page: '../../views/Assessment/publicEvaluation.html?v=' + Date.now(),
            selected: false,
            form: 1
        },
        {
            Title: " 10 - نقاط قوت و ضعف ارزشیابی شونده و توصیه های مقام مافوق با توجه به نتیجه ارزشیابی",
            Id: "3",
            page: '../../views/Assessment/a5.html?v=' + Date.now(),
            selected: false,
            form: 1
        }
    ];

    $scope.reloadPage = function () {
        const currentState = $state.current.name;
        $templateCache.remove($state.current.templateUrl);
        $state.go('initPage');
        $timeout(function () {
            $state.go(currentState);
        }, 200);
    };
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
    //======================= check authorization =============
    $scope.checkAuth = function () {
        RequestApis.HR(`securities/HR/view/HR_ASSESSMENT`, 'Get', '', '', '', function (response) {
            if (response.status != 200) {
                $scope.assessment.redirectUrlForUnAuth = '../../views/PermissionWarning.html';
                $scope.assessment.checkValidation = false;
            } else {
                $scope.getUrlInfo();
            }
        });
    };
    $scope.checkAuth();
    //======================= use checkExistIn html ===========
    $scope.checkingExist = function (item) {
        return global.checkExist(item);
    };
    //======================= get url info ====================
    $scope.getUrlInfo = function () {
        global.currentUser(function (data) {
            if ($scope.$parent.requestAssessment) {
                $scope.assessment.isFromCartable = false;
                $scope.getPersonnelInfo(data.personnelInfo.Id);
            } else {
                $scope.assessment.isFromCartable = true;
                $scope.assessment.urlParamsInfo = {
                    FormEntryId: $scope.$parent.urlParams.formEntryId,
                    PeriodId: $scope.$parent.urlParams.periodId,
                    PersonnelId: $scope.$parent.urlParams.personnelId,
                    RequestId: $scope.$parent.urlParams.requestId,
                    stateBox: $scope.$parent.urlParams.stateBox,
                    UserId: $scope.$parent.urlParams.userId,
                    behalfId: $scope.$parent.urlParams.behalfId
                };
                $scope.getPersonnelInfo($scope.$parent.urlParams.personnelId);
            }
        });
    };
    //======================= get header infos ================
    $scope.getPersonnelInfo = function (id) {
        $scope.assessment.loadingPage = true;
        RequestApis.HR(`personnel/${id}/info`, 'get', '', '', '', function (response) {
            $scope.assessment.personnelInfo = response.data;
            if (!$scope.assessment.isFromCartable) {
                RequestApis.HR(`periods/active`, 'get', '', '', '', function (responseParent) {
                    $scope.assessment.priodsInfo = responseParent.data;
                    if (responseParent.data.IsActive) {
                        RequestApis.HR(`assessments/personnel/${id}/period/${responseParent.data.Id}/formentries`, 'get', '', '', '', function (response) {
                            if (response.status === 200 && global.checkExist(response.data[0])) {
                                if (!global.checkExist(response.data[0].RequestId)) {
                                    $scope.loadPageForFirstTime($scope.assessment.priodsInfo.Id);
                                } else {
                                    $scope.startDateFromFormEntriesApi = moment(response.data[0].StartDate).format('jYYYY/jMM/jDD');
                                    RequestApis.HR(`assessments/${id}/programs/any?frm=${response.data[0].FormId}&prd=${response.data[0].PeriodId}`, 'get', '', '', '', function (responseSub) {
                                        if (responseSub.status === 404) {
                                            if (response.status === 200 && global.checkExist(response.data[0])) {
                                                $scope.loadPageNotForFirstTime(response.data[0].Id);
                                            } else {
                                                $scope.loadPageForFirstTime($scope.assessment.priodsInfo.Id);
                                            }
                                        } else {
                                            $scope.loadPageNotForFirstTime(response.data[0].Id);
                                        }
                                    });
                                }
                            } else {
                                $scope.loadPageForFirstTime($scope.assessment.priodsInfo.Id);
                            }
                        });
                    } else {
                        global.Toast('error', 'دوره ی ارزشیابی برای شما تعریف نشده است');
                    }
                });
            } else {
                RequestApis.HR(`periods`, 'get', '', '', '', function (responsePeriod) {
                    $scope.assessment.priodsInfo = responsePeriod.data.Items.find(x => x.Id === $scope.assessment.urlParamsInfo.PeriodId);
                    RequestApis.HR(`assessments/personnel/${id}/period/${$scope.assessment.urlParamsInfo.PeriodId}/formentries`, 'get', '', '', '', function (response) {
                        if (response.status === 200 && global.checkExist(response.data[0])) {
                            if (!global.checkExist(response.data[0].RequestId)) {
                                $scope.loadPageForFirstTime($scope.assessment.urlParamsInfo.PeriodId);
                            } else {
                                $scope.startDateFromFormEntriesApi = moment(response.data[0].StartDate).format('jYYYY/jMM/jDD');
                                RequestApis.HR(`assessments/${id}/programs/any?frm=${response.data[0].FormId}&prd=${response.data[0].PeriodId}`, 'get', '', '', '', function (responseSub) {
                                    if (responseSub.status === 404) {
                                        if (response.status === 200 && global.checkExist(response.data[0])) {
                                            $scope.loadPageNotForFirstTime(response.data[0].Id);
                                        } else {
                                            $scope.loadPageForFirstTime($scope.assessment.urlParamsInfo.PeriodId);
                                        }
                                    } else {
                                        $scope.loadPageNotForFirstTime(response.data[0].Id);
                                    }
                                });
                            }
                        } else {
                            $scope.loadPageForFirstTime($scope.assessment.urlParamsInfo.PeriodId);
                        }
                    });
                });
            }
        });
    };
    //===================== get data for first time =============
    $scope.loadPageForFirstTime = function (id) {
        RequestApis.HR(`personnel/services/${$scope.assessment.personnelInfo.Id}/situation?ss=${$scope.startDateFromFormEntriesApi ?? moment().format('jYYYY/jMM/jDD')}&sgn=Accepted`, 'get', '', '', '', function (response) {
            $scope.assessment.headerInfo = response.data;
            if (!$scope.assessment.headerInfo.Allowed) {
                global.Toast('error', 'شما امکان شرکت در ارزشیابی را ندارید.');
            } else {
                let path;
                if (global.checkExist($scope.assessment.headerInfo.PostClassId)) {
                    path = `assessments/postclass/${$scope.assessment.headerInfo.PostClassId}/forms`;
                } else {
                    path = `assessments/jobtype/${$scope.assessment.headerInfo.JobType}/forms`;
                }
                RequestApis.HR(path, 'get', '', '', '', function (responseParent) {
                    $scope.assessment.formInfo = responseParent.data[0];
                    RequestApis.HR(`assessments/${$scope.assessment.personnelInfo.Id}/programs/any?frm=${$scope.assessment.formInfo.Id}&prd=${id}`, 'get', '', '', '', function (responseMiddle) {
                        $scope.assessment.anyApiInfo = responseMiddle;
                        RequestApis.HR(`assessments/${$scope.assessment.personnelInfo.Id}/formentry?frm=${$scope.assessment.formInfo.Id}&prd=${id}`, 'get', '', '', '', function (responseChild) {
                            $scope.assessment.formEntryInfo = responseChild.data;
                            if (responseMiddle.status === 200) {
                                if (!global.checkExist($scope.assessment.formEntryInfo.RequestId)) {
                                    $scope.getworkflowLevels(global.checkExist($scope.assessment.headerInfo.PostId) ? $scope.assessment.headerInfo.PostId : (global.checkExist($scope.assessment.headerInfo.UnitId) ? $scope.assessment.headerInfo.UnitId : $scope.assessment.headerInfo.OrganId));
                                } else {
                                    $scope.assessment.checkingWorkflow = true;
                                    $scope.getWorkFlowCurrentLevel(global.checkExist($scope.assessment.headerInfo.PostId) ? $scope.assessment.headerInfo.PostId : (global.checkExist($scope.assessment.headerInfo.UnitId) ? $scope.assessment.headerInfo.UnitId : $scope.assessment.headerInfo.OrganId));
                                }
                            } else {
                                $scope.getworkflowLevels(global.checkExist($scope.assessment.headerInfo.PostId) ? $scope.assessment.headerInfo.PostId : (global.checkExist($scope.assessment.headerInfo.UnitId) ? $scope.assessment.headerInfo.UnitId : $scope.assessment.headerInfo.OrganId));
                            }
                        })
                    });
                });
            }
        });
    };
    //===================== get data for not first time =========
    $scope.loadPageNotForFirstTime = function (formEntryId) {
        RequestApis.HR(`assessments/${formEntryId}/header/info`, 'get', '', '', '', function (response) {
            $scope.assessment.loadingPage = false;
            if (response.status === 200) {
                if (!response.data.Situation.Allowed) {
                    global.Toast('error', 'شما امکان شرکت در ارزشیابی را ندارید.');
                } else {
                    $scope.assessment.headerInfo = response.data.Situation;
                    $scope.assessment.formEntryInfo = response.data.FormEntry;
                    $scope.assessment.formInfo = response.data.Form;
                    $scope.getWorkFlowCurrentLevel(global.checkExist($scope.assessment.headerInfo.PostId) ? $scope.assessment.headerInfo.PostId : (global.checkExist($scope.assessment.headerInfo.UnitId) ? $scope.assessment.headerInfo.UnitId : $scope.assessment.headerInfo.OrganId));
                }
            } else {
                $scope.assessment.loadingFailed = true;
            }

        });
    };
    //===================== workflows ===========================
    $scope.getWorkFlowCurrentLevel = function (item) {
        $scope.assessment.checkingWorkflow = true;
        localStorage.removeItem("dynamicButtonAllow");
        let path = "";
        let pathForAllwApi = "";
        let pathForStartApi = "";
        if ($scope.assessment.isFromCartable) {
            path = `workflows/request/${$scope.assessment.urlParamsInfo.RequestId}/status?feid=${$scope.assessment.urlParamsInfo.FormEntryId}`;
        } else {
            path = `workflows/request/${$scope.assessment.formEntryInfo.RequestId}/status?feid=${$scope.assessment.formEntryInfo.Id}`;
        }
        RequestApis.HR(path, 'get', '', '', '', function (response) {
            $scope.assessment.workflowInfo = response.data;
            //this code create for getting title of assessment form level
            RequestApis.HR(`assessments/workflow/form/${$scope.assessment.formEntryInfo.FormId}`, 'get', '', '', '', function (response) {
                $scope.assessment.headerInfo.secondTitle = null;
                if (response.status != 404) {
                    $scope.assessment.headerInfo.secondTitle = response.data[0].Title;
                } else {
                    RequestApis.HR(`workflows/form/${$scope.assessment.workflowInfo[0].SecurityForms[0].Id}`, 'get', '', '', '', function (subResponse) {
                        $scope.assessment.headerInfo.secondTitle = subResponse.data[0].Title;
                    });
                }
            });
            if ($scope.assessment.workflowInfo[0].SecurityForms.length > 0) {
                $scope.assessment.SumScoreSpecialSection = 0;
                RequestApis.HR(`assessments/${$scope.assessment.formEntryInfo.Id}/exclusive/score`, 'Get', '', '', '', function (response) {
                    $scope.assessment.SumScoreSpecialSection = response.data;
                });
                $scope.assessment.SumScorePublicSection = 0;
                RequestApis.HR(`assessments/${$scope.assessment.formEntryInfo.Id}/nonexclusive/score`, 'Get', '', '', '', function (response) {
                    $scope.assessment.SumScorePublicSection = response.data;
                });
                RequestApis.HR(`workflows/state/${$scope.assessment.workflowInfo[0].StateId}/actions`, 'get', '', '', '', function (subResponse) {
                    if (subResponse.status == 200) {
                        $scope.assessment.buttonsArray = subResponse.data;
                    } else {
                        $scope.assessment.buttonsArray = [];
                    }
                });
                Object.values($scope.assessment.workflowInfo[0].SecurityForms).forEach(securityForm => {
                    if (securityForm.Codes[0] === "HR_ASMT_ADVISE") {
                        $scope.assessment.AllowAdvicePage = true;
                    }
                    if (securityForm.Codes[0] === "HR_ASMT_A1" || securityForm.Codes[0] === "HR_ASMT_A2") {
                        $scope.assessment.AllowSpecialPage = true;
                    }
                    if (securityForm.Codes[0] === "HR_ASMT_PUBLIC") {
                        $scope.assessment.AllowPublicPage = true;
                    }
                    if ($scope.assessment.isFromCartable) {
                        pathForAllwApi = "workflows/request/" + $scope.assessment.urlParamsInfo.RequestId + "/form/" + securityForm.Id + "/allow";
                        pathForStartApi = "workflows/request/" + $scope.assessment.urlParamsInfo.RequestId + "/is/start";
                    } else {
                        pathForAllwApi = "workflows/request/" + $scope.assessment.formEntryInfo.RequestId + "/form/" + securityForm.Id + "/allow";
                        pathForStartApi = "workflows/request/" + $scope.assessment.formEntryInfo.RequestId + "/is/start";
                    }
                    RequestApis.HR(pathForStartApi, 'get', '', '', '', function (response) {
                        if (global.checkExist(response.data)) {
                            $scope.assessment.Isstarted = response.data.IsStart;
                            $scope.assessment.IsRequester = response.data.IsRequester;
                        }
                    });
                    RequestApis.HR(pathForAllwApi, 'get', '', '', '', function (allownece) {
                        if (allownece.status == 406) {
                            $scope.assessment.dynamicButtonAllow = false;
                            localStorage.setItem("dynamicButtonAllow", false);
                        } else {
                            $scope.assessment.dynamicButtonAllow = true;
                            localStorage.setItem("dynamicButtonAllow", true);
                        }
                        RequestApis.HR(`securities/form/${securityForm.Id}`, 'get', '', '', '', function (response) {
                            $scope.assessment.securityFormInfo = response.data;
                            if (securityForm.Codes[0] == "HR_ASMT_A1") {
                                $scope.getFirstSpecialData(item);
                            } else if (securityForm.Codes[0] == "HR_ASMT_A2") {
                                $scope.getSecondSpecialTable(item);
                            } else if (securityForm.Codes[0] == "HR_ASMT_PUBLIC") {
                                $scope.getPublicTables(item);
                            } else if (securityForm.Codes[0] == "HR_ASMT_ADVISE") {
                                $scope.getAdvicePart(item);
                            }
                        });
                    });
                });
            } else {
                $scope.assessment.loadingPage = false;
            }
        });

    };
    $scope.getworkflowLevels = function (item) {
        RequestApis.HR(`securities/form/code?seccd=HR_ASMT_A1`, 'get', '', '', '', function (response) {
            $scope.assessment.currentLevel = response.data;
            RequestApis.HR(`securities/form/${response.data.Id}`, 'get', '', '', '', function (subResponse) {
                //if (global.checkExist(subResponse.data)) {
                //  $scope.assessment.checkingWorkflow = true;
                //}
                $scope.getFirstSpecialData(item);
            });
        });
    };
    $scope.preStartWorkFlow = function () {
        //$scope.assessment.behalfPersonnel = [];
        //RequestApis.HR('securities/current/user/behalf', 'get', '', '', '', function (response) {
        //  if (response.status === 200) {
        //    if (response.data.length) {
        //      $scope.assessment.behalfPersonnel = response.data;
        //      $('#showBehafUser').modal();
        //    }
        //  } else {
        //    $scope.startWorkFlow();
        //  }
        //})
        $scope.startWorkFlow();
    };
    $scope.cancelStartWorkFlow = function () {
        $('#showBehafUser').modal('hide');
    };
    $scope.confirmPreStartWorkFlow = function (item) {
        $scope.assessment.behalfPerson = item;
        $('#showBehafUser').modal('hide');
        $scope.startWorkFlow();
    };
    $scope.startWorkFlow = function () {
        $scope.loadingStartWorkFlow = true;
        if (global.checkExist($scope.assessment.securityFormInfo)) {
            var path = "workflows/form/" + $scope.assessment.securityFormInfo.Id;
        } else {
            var path = "workflows/form/" + $scope.assessment.currentLevel.Id;
        }
        RequestApis.HR(path, 'get', '', '', '', function (response) {
            var dataToSend = {
                UserId: $scope.assessment.UserId,
                PersonnelId: $scope.assessment.headerInfo.PersonnelId,
                Personnel: $scope.assessment.personnelInfo.PoliteName,
                PeriodId: $scope.assessment.priodsInfo.Id,
                PeriodTitle: $scope.assessment.priodsInfo.Title,
                FormEntryId: $scope.assessment.formEntryInfo.Id,
                FormEntryRowVersion: $scope.assessment.formEntryInfo.RowVersion
            };
            let bhus = "";
            if (global.checkExist($scope.assessment.behalfPerson)) {
                bhus = bhus.concat(`?bhus=${$scope.assessment.behalfPerson.Id}`);
            }
            RequestApis.HR(`assessments/workflow/${response.data[0].Id}/start`, 'Post', '', '', dataToSend, function (response) {
                if (response.status !== 200) {
                    global.Toast('error', 'عملیات شروع فرایند با خطا مواجه شد');
                } else {
                    $scope.refreshSpecialForm();
                }
                global.messaging(response);
                $scope.loadingStartWorkFlow = false;
            });
        });
    };
    $scope.dynamicButton = function (btnInfo) {
        btnInfo.loadingDynamicButton = true;
        $scope.assessment.buttonInfo = {};
        $scope.assessment.buttonInfo = btnInfo;
        let psn = "";
        if (!isNaN($scope.assessment.urlParamsInfo.personelId)) {
            psn = psn.concat(`&psn=${$scope.assessment.urlParamsInfo.personelId}`);
        }
        let curst = "";
        if (global.checkExist($scope.assessment.workflowInfo[0].StateId)) {
            curst = curst.concat(`&curst=${$scope.assessment.workflowInfo[0].StateId}`);
        }
        let nxtst = "";
        if (global.checkExist($scope.assessment.buttonInfo.NextStateId)) {
            nxtst = nxtst.concat(`&nxtst=${$scope.assessment.buttonInfo.NextStateId}`);
        }
        let act = "";
        if (global.checkExist($scope.assessment.buttonInfo.ActionId)) {
            act = act.concat(`&act=${$scope.assessment.buttonInfo.ActionId}`);
        }
        if (global.checkExist($scope.assessment.buttonInfo.ActorTypeId)) {
            RequestApis.HR(`workflows/actortype/${$scope.assessment.buttonInfo.ActorTypeId}/next/personnel?rq=${$scope.assessment.workflowInfo[0].RequestId}${psn}${curst}${nxtst}${act}`, 'get', '', '', '', function (response) {
                if (response.status == 404) {
                    const {value: text} = Swal.fire({
                        input: 'textarea',
                        inputLabel: 'یادداشت',
                        inputPlaceholder: ' در صورت تمایل یادداشت خود را بگذارید...',
                        inputAttributes: {
                            'aria-label': ' در صورت تمایل یادداشت خود را بگذارید...'
                        },
                        customClass: {
                            input: 'small-font',
                            title: 'titleInsweatAlert',
                            confirmButton: 'small-font',
                        },
                        confirmButtonText: 'تأیید'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            if (result.value.length) {
                                let str = '"' + result.value + '"';
                                RequestApis.HR(`workflows/request/${$scope.assessment.workflowInfo[0].RequestId}/notes`, 'Post', '', '', str, function (response) {
                                    global.messaging(response);
                                });
                            }
                            $scope.movement();
                        }
                    });
                } else {
                    $scope.assessment.selectedPersonnelForMove = [];
                    $scope.assessment.personnelForSelecting = response.data;
                    $("#selectPersonnel").modal();
                }
                btnInfo.loadingDynamicButton = false;
            });
        } else {
            $scope.assessment.selectedPersonnelForMove = [];
            const {value: text} = Swal.fire({
                input: 'textarea',
                inputLabel: 'یادداشت',
                inputPlaceholder: ' در صورت تمایل یادداشت خود را بگذارید...',
                inputAttributes: {
                    'aria-label': ' در صورت تمایل یادداشت خود را بگذارید...'
                },
                customClass: {
                    input: 'small-font',
                    title: 'titleInsweatAlert',
                    confirmButton: 'small-font',
                },
                confirmButtonText: 'تأیید'
            }).then((result) => {
                if (result.isConfirmed) {
                    $scope.movement();
                    btnInfo.loadingDynamicButton = false;
                }
            });
        }


    };
    $scope.movement = function () {
        let path = '';
        if ($scope.assessment.isFromCartable) {
            path = "workflows/request/" + $scope.assessment.urlParamsInfo.RequestId;
        } else {
            path = "workflows/request/" + $scope.assessment.formEntryInfo.RequestId;
        }
        RequestApis.HR(path, 'get', '', '', '', function (response) {
            var itemtosend = {
                Id: response.data.Id,
                RowVersion: response.data.RowVersion,
                ActionId: $scope.assessment.buttonInfo.ActionId,
                NextPersonnel: []
            };
            Object.values($scope.assessment.selectedPersonnelForMove).forEach(person => {
                var itemtopsuh = {
                    ActorTypeId: $scope.assessment.buttonInfo.ActorTypeId,
                    ActionTransitionId: $scope.assessment.buttonInfo.ActionTransitionId,
                    PersonnelId: person.Id
                };
                itemtosend.NextPersonnel.push(itemtopsuh);
            });
            let bhus = "";
            if (!isNaN($scope.assessment.urlParamsInfo.behalfId)) {
                bhus = bhus.concat(`?bhus=${$scope.assessment.urlParamsInfo.behalfId}`);
            }
            RequestApis.HR(`assessments/workflow/request/${response.data.Id}/simple/move`, 'Patch', '', '', itemtosend, function (response) {
                RequestApis.HR(`cartables/request/${$scope.assessment.workflowInfo[0].RequestId}/unseen`, 'Post', '', '', {}, function (response) {
                    if (!$scope.assessment.isFromCartable) {
                        $scope.reloadPage();
                    } else {
                        $scope.reloadPage();
                    }
                    global.messaging(response);
                });
                global.messaging(response);
                $scope.assessment.IsRequester = false;
            });
        });
    };
    //==================== selecting personnel section ==========
    $scope.addToSelectedPersonnel = function (event, person) {
        if (event.target.checked) {
            if (!$scope.assessment.selectedPersonnelForMove.some(x => x.Id === person.Id)) {
                $scope.assessment.selectedPersonnelForMove.push(person);
            }
        } else {
            $scope.assessment.selectedPersonnelForMove = $scope.assessment.selectedPersonnelForMove.filter(y => y.Id != person.Id);
        }
    };
    $scope.getMore = function () {
        $scope.assessment.ach = 1;
        $scope.getAllNextPersonnel();
    };
    $scope.getAllNextPersonnel = function () {
        $scope.assessment.selectedPersonnelForMove = [];
        let psn = "";
        if (!isNaN($scope.assessment.urlParamsInfo.personelId)) {
            psn = psn.concat(`&psn=${$scope.assessment.urlParamsInfo.personelId}`);
        }
        let curst = "";
        if (global.checkExist($scope.assessment.workflowInfo[0].StateId)) {
            curst = curst.concat(`&curst=${$scope.assessment.workflowInfo[0].StateId}`);
        }
        let nxtst = "";
        if (global.checkExist($scope.assessment.buttonInfo.NextStateId)) {
            nxtst = nxtst.concat(`&nxtst=${$scope.assessment.buttonInfo.NextStateId}`);
        }
        let act = "";
        if (global.checkExist($scope.assessment.buttonInfo.ActionId)) {
            act = act.concat(`&act=${$scope.assessment.buttonInfo.ActionId}`);
        }
        RequestApis.HR(`workflows/actortype/${$scope.assessment.buttonInfo.ActorTypeId}/next/personnel?rq=${$scope.assessment.workflowInfo[0].RequestId}${psn}${curst}${nxtst}${act}${$scope.assessment.ach !== null ? "&ach=" + $scope.assessment.ach : ""}&ps=${$scope.assessment.personnelSelectedPS}&pn=${$scope.assessment.personnelSelectedPN}`, 'get', '', '', '', function (response) {
            $scope.assessment.personnelForSelecting = response.data;
        });
    };
    $scope.loadPagePersonnelSelected = function (page) {
        if ($scope.assessment.personnelForSelecting.TotalPages >= page && $scope.assessment.personnelForSelecting.TotalPages > $scope.assessment.personnelForSelecting.PageIndex && page > 0) {
            $scope.assessment.personnelSelectedPN = Number(page);
            $scope.getAllNextPersonnel();
        }
    };
    $scope.pageSizePersonnelSelected = function (size) {
        $scope.assessment.personnelSelectedPS = Number(size);
        $scope.getAllNextPersonnel();
    };
    $scope.confirmSelectPersonnel = function () {
        $("#selectPersonnel").modal("hide");
        const {value: text} = Swal.fire({
            input: 'textarea',
            inputLabel: 'یادداشت',
            inputPlaceholder: ' در صورت تمایل یادداشت خود را بگذارید...',
            inputAttributes: {
                'aria-label': ' در صورت تمایل یادداشت خود را بگذارید...'
            },
            customClass: {
                input: 'small-font',
                title: 'titleInsweatAlert',
                confirmButton: 'small-font',
            },
            confirmButtonText: 'تأیید'
        }).then((result) => {
            if (result.isConfirmed) {
                if (result.value.length) {
                    let str = '"' + result.value + '"';
                    RequestApis.HR(`workflows/request/${$scope.assessment.workflowInfo[0].RequestId}/notes`, 'Post', '', '', str, function (response) {
                        global.messaging(response);
                    });
                }
                $scope.movement();
            }
        });
    };
    $scope.cancelSelectPersonnel = function () {
        $("#selectPersonnel").modal("hide");
        $scope.assessment.selectedPersonnelForMove = [];
    };
    //===================== special form section ================
    $scope.changeTableViewS = function (item) {
        $scope.evaluation[0].form = item;
        $(".list-group-item").removeClass("selected-list-group");
        $("#HR_ASM_A" + item).addClass("selected-list-group");
    };
    $scope.getFirstSpecialData = function (item) {
        let addingPathj = "";
        let addingPathp = "";
        let priodFirstApiPath = "";
        if ($scope.assessment.anyApiInfo.status === 404) {
            if (global.checkExist($scope.assessment.headerInfo.JobType)) {
                addingPathj = "&jt=" + $scope.assessment.headerInfo.JobType;
            }
            if (global.checkExist($scope.assessment.headerInfo.PostClassId)) {
                addingPathp = "&pc=" + $scope.assessment.headerInfo.PostClassId;
            }
            if (!global.checkExist($scope.assessment.formEntryInfo)) {
                priodFirstApiPath = "assessments/period/" + $scope.assessment.priodsInfo.Id + "/programs/first/init?ss=" + $scope.assessment.priodsInfo.StartDatePersian + "&psn=" + $scope.assessment.headerInfo.PersonnelId + "&chid=" + item + addingPathj + addingPathp + $scope.assessment.paginationItemsForTableData1_2;
            } else {
                priodFirstApiPath = "assessments/period/" + $scope.assessment.priodsInfo.Id + "/programs/first/init?feid=" + $scope.assessment.formEntryInfo.Id + "&psn=" + $scope.assessment.headerInfo.PersonnelId + "&ss=" + $scope.assessment.priodsInfo.StartDatePersian + "&chid=" + item + addingPathj + addingPathp + $scope.assessment.paginationItemsForTableData1_2;
            }

            //the number 6 witch is here is constant for finding type-identity, as mr.azimi said on Monday,April 18,2022
            RequestApis.HR(`assessments/field/6?prd=${$scope.assessment.priodsInfo.Id}&frm=${$scope.assessment.formInfo.Id}`, 'get', '', '', '', function (field) {
                $scope.assessment.fieldOneInfo = field.data;
                RequestApis.HR(`assessments/field/${$scope.assessment.fieldOneInfo.Id}/children`, 'get', '', '', '', function (children) {
                    if (global.checkExist(children.data)) {
                        $scope.assessment.children = children.data;
                        RequestApis.HR(priodFirstApiPath, 'get', '', '', '', function (subchildren) {
                            $scope.evaluation.find(x => x.Id === "1").selected = true;
                            $scope.assessment.tableData = subchildren.data;
                            $scope.assessment.AllowSpecialPage = true;
                            $scope.assessment.loadingTable = false;
                            if ($scope.assessment.children.status != 404) {
                                $scope.assessment.goalsToAdd = {
                                    Header: {
                                        PeriodId: $scope.assessment.priodsInfo.Id,
                                        AssessingUserId: null,
                                        PersonnelId: $scope.assessment.headerInfo.PersonnelId,
                                        ChartTreeId: $scope.assessment.headerInfo.TreeId,
                                        StartDate: $scope.assessment.priodsInfo.StartDatePersian,
                                        ServiceId: $scope.assessment.headerInfo.PersonnelServiceId,
                                        FormId: $scope.assessment.formInfo.Id,
                                    },
                                    FormEntryId: null,
                                    ParentFieldId: $scope.assessment.fieldOneInfo.Id,
                                    FirstFieldId: $scope.assessment.children[0].Id,
                                    SecondFieldId: $scope.assessment.children[1].Id,
                                    Values: []
                                };
                                $scope.assessment.tableDataAdd1 = {
                                    FormEntryId: null,
                                    Header: {
                                        FormId: $scope.assessment.formInfo.Id,
                                        PeriodId: $scope.assessment.priodsInfo.Id,
                                        AssessingUserId: null,
                                        PersonnelId: $scope.assessment.headerInfo.PersonnelId,
                                        ChartTreeId: $scope.assessment.headerInfo.TreeId,
                                        StartDate: $scope.assessment.priodsInfo.StartDatePersian,
                                        ServiceId: $scope.assessment.headerInfo.PersonnelServiceId,
                                    },
                                    ParentFieldId: $scope.assessment.fieldOneInfo.Id,
                                    FirstFieldId: $scope.assessment.children[0].Id,
                                    SecondFieldId: $scope.assessment.children[1].Id,
                                    Values: []
                                };
                                if (global.checkExist($scope.assessment.formEntryInfo)) {
                                    $scope.assessment.goalsToAdd.FormEntryId = $scope.assessment.formEntryInfo.Id;
                                }
                            }
                            $scope.assessment.loadingPage = false;
                        });
                    }
                });
            });
        } else {
            $scope.assessment.deleteAllowed = true;
            // this number 6 here is constant for getting alef-1 mr.azimi said in 20-04-2022
            RequestApis.HR(`assessments/field/6?prd=${$scope.assessment.priodsInfo.Id}&frm=${$scope.assessment.formInfo.Id}`, 'get', '', '', '', function (field) {
                $scope.assessment.fieldOneInfo = field.data;
                RequestApis.HR(`assessments/field/${$scope.assessment.fieldOneInfo.Id}/children`, 'get', '', '', '', function (children) {
                    if (global.checkExist(children.data)) {
                        $scope.assessment.children = children.data;
                        let flds = '';
                        Object.values($scope.assessment.children).forEach(child => {
                            flds = flds.concat(",", child.Id.toString());
                        });
                        if (flds.indexOf(",") === 0) {
                            flds = flds.substring(1);
                        }
                        RequestApis.HR(`assessments/${$scope.assessment.formEntryInfo.Id}/programs/first?pfld=${$scope.assessment.fieldOneInfo.Id}&psn=${$scope.assessment.headerInfo.PersonnelId}&flds=${flds}${$scope.assessment.paginationItemsForTableData1_2}`, 'get', '', '', '', function (subchildren) {
                            $scope.evaluation.find(x => x.Id === "1").selected = true;
                            $scope.assessment.tableData1 = subchildren.data;
                            $scope.assessment.AllowSpecialPage = true;
                            $scope.assessment.loadingTable = false;
                            $scope.assessment.goalsToAdd = {
                                Header: {
                                    PeriodId: $scope.assessment.priodsInfo.Id,
                                    AssessingUserId: null,
                                    PersonnelId: $scope.assessment.headerInfo.PersonnelId,
                                    ChartTreeId: $scope.assessment.headerInfo.TreeId,
                                    StartDate: $scope.assessment.priodsInfo.StartDatePersian,
                                    ServiceId: $scope.assessment.headerInfo.PersonnelServiceId,
                                    FormId: $scope.assessment.formInfo.Id,
                                },
                                FormEntryId: $scope.assessment.formEntryInfo.Id,
                                FormId: $scope.assessment.formInfo.Id,
                                PeriodId: $scope.assessment.priodsInfo.Id,
                                AssessingUserId: null,
                                PersonnelId: $scope.assessment.headerInfo.PersonnelId,
                                ChartTreeId: $scope.assessment.headerInfo.TreeId,
                                ServiceId: $scope.assessment.headerInfo.PersonnelServiceId,
                                ParentFieldId: $scope.assessment.fieldOneInfo.Id,
                                FirstFieldId: $scope.assessment.children[0].Id,
                                SecondFieldId: $scope.assessment.children[1].Id,
                                Values: []
                            };
                            $scope.assessment.tableDataAdd1 = {
                                Header: {
                                    FormId: $scope.assessment.formInfo.Id,
                                    PeriodId: $scope.assessment.priodsInfo.Id,
                                    AssessingUserId: null,
                                    PersonnelId: $scope.assessment.headerInfo.PersonnelId,
                                    ChartTreeId: $scope.assessment.headerInfo.TreeId,
                                    StartDate: $scope.assessment.priodsInfo.StartDatePersian,
                                    ServiceId: $scope.assessment.headerInfo.PersonnelServiceId,
                                },
                                FormEntryId: $scope.assessment.formEntryInfo.Id,
                                FormId: $scope.assessment.formInfo.Id,
                                PeriodId: $scope.assessment.priodsInfo.Id,
                                AssessingUserId: null,
                                PersonnelId: $scope.assessment.headerInfo.PersonnelId,
                                ChartTreeId: $scope.assessment.headerInfo.TreeId,
                                ServiceId: $scope.assessment.headerInfo.PersonnelServiceId,
                                ParentFieldId: $scope.assessment.fieldOneInfo.Id,
                                FirstFieldId: $scope.assessment.children[0].Id,
                                SecondFieldId: $scope.assessment.children[1].Id,
                                Values: []
                            };
                            $scope.lastValueIndex = global.checkExist($scope.assessment.tableData1.Items) ? $scope.assessment.tableData1.Items[0].MaxValueIndex : 0;
                            if (global.checkExist($scope.assessment.tableData1.Items)) {
                                for (var i = 0; i < $scope.assessment.tableData1.Items.length; i++) {
                                    $scope.assessment.goalsToAdd.Values.push($scope.assessment.tableData1.Items[i]);
                                }
                            }
                            $scope.assessment.loadingPage = false;
                        });
                    }
                });
            });
        }

    };
    $scope.getSecondSpecialTable = function () {
        $scope.changeTableViewS(2);
        // this number 7 here is constant for getting alef-2 mr.azimi said in 20-04-2022
        RequestApis.HR(`assessments/field/7?prd=${$scope.assessment.priodsInfo.Id}&frm=${$scope.assessment.formInfo.Id}`, 'get', '', '', '', function (field) {
            $scope.assessment.fieldTwoInfo = field.data;
            RequestApis.HR(`assessments/${$scope.assessment.formEntryInfo.Id}/programs/second?pfld=${$scope.assessment.fieldTwoInfo.CategoryId}`, 'get', '', '', '', function (response) {
                if (response.status === 200) {
                    $("#demo-1").collapse("show");
                }
                $scope.assessment.secondTableData = response.data;
                $scope.assessment.AllowSpecialPage = true;
                let i = 0;
                Object.values(response.data.Values[0].Rows).forEach(row => {
                    Object.values(row.Items).forEach(item => {
                        let itemToPush = {
                            ParentFieldId: $scope.assessment.secondTableData.Fields.Main.Id,
                            FieldId: item.FieldId,
                            NumericValue: item.NumericValue,
                            ScoreValue: item.ScoreValue,
                            StringValue: item.StringValue,
                            ValueIdx: i + 1,
                            ProgramId: item.ProgramId,
                            RelatedId: item.RelatedId,
                            Id: item.Id,
                            RowVersion: item.RowVersion
                        };
                        $scope.assessment.itemForSecondTable.push(itemToPush);
                    });
                    ++i;
                });
                $scope.assessment.AllowSpecialPage = true;
                $scope.assessment.loadingTable = false;
                $scope.assessment.loadingPage = false;
            });
        });
    };
    $scope.checkAllStateFunc = function (items) {
        let result = false;
        let itr = 0;
        Object.values(items).forEach(y => {
            if ($scope.assessment.historyOfgoalsToAdd.some(x => x.Id === y.Id)) {
                ++itr;
            }
        });
        if (Number(items.length) === Number(itr)) {
            result = true;
        }
        return result;
    };
    $scope.addToListAll = function (all, state) {
        if (!state.target.checked) {
            if (global.checkExist($scope.assessment.historyOfgoalsToAdd)) {
                Object.values(all).forEach(item => {
                    if ($scope.assessment.historyOfgoalsToAdd.some(x => x.Id === item.Id)) {
                        $scope.assessment.historyOfgoalsToAdd = $scope.assessment.historyOfgoalsToAdd.filter(x => x.Id !== item.Id);
                    }
                    $scope.checkState(item);
                });
            }
        } else {
            let counter = 1;
            if ($scope.assessment.historyOfgoalsToAdd.length) {
                counter += $scope.assessment.historyOfgoalsToAdd.length;
            }
            Object.values(all).forEach(item => {
                if ($scope.assessment.historyOfgoalsToAdd.length != 0) {
                    if ($scope.assessment.historyOfgoalsToAdd.some(x => x.Id != item.Id)) {
                        if (item.FirstFieldId == undefined) {
                            item.FirstFieldId = $scope.assessment.children[0].Id;
                            item.SecondFieldId = $scope.assessment.children[1].Id;
                            item.ProgramId = item.Id;
                            item.ValueIndex = $scope.lastValueIndex + counter;
                        }
                        $scope.assessment.historyOfgoalsToAdd.push(item);
                    }
                } else {
                    if (item.FirstFieldId == undefined) {
                        item.FirstFieldId = $scope.assessment.children[0].Id;
                        item.SecondFieldId = $scope.assessment.children[1].Id;
                        item.ProgramId = item.Id;
                        item.ValueIndex = $scope.lastValueIndex + counter;
                    }
                    $scope.assessment.historyOfgoalsToAdd.push(item);
                }
                $scope.checkState(item);
                ++counter;
            });
        }
    };
    $scope.addToList = function (event, goal) {
        if (event.target.checked) {
            if (!$scope.assessment.historyOfgoalsToAdd.some(x => x.Id === goal.Id)) {
                if (!global.checkExist(goal.FirstFieldId)) {
                    goal.FirstFieldId = $scope.assessment.children[0].Id;
                    goal.SecondFieldId = $scope.assessment.children[1].Id;
                    goal.ProgramId = goal.Id;
                    goal.ValueIndex = $scope.lastValueIndex + $scope.assessment.historyOfgoalsToAdd.length + 1;
                }
                $scope.assessment.historyOfgoalsToAdd.push(goal);
            }
        } else {
            $scope.assessment.historyOfgoalsToAdd = $scope.assessment.historyOfgoalsToAdd.filter(x => x.Id != goal.Id);
        }
    };
    $scope.checkAllStateFunc1 = function (items) {
        let result = false;
        let itr = 0;
        Object.values(items).forEach(y => {
            if ($scope.assessment.historyOfgoalsToAdd1.some(x => x.ProgramId === y.ProgramId)) {
                ++itr;
            }
        });
        if (Number(items.length) === Number(itr)) {
            result = true;
        }
        return result;
    };
    $scope.addToListAll1 = function (all, state) {
        if (!state.target.checked) {
            Object.values(all).forEach(item => {
                $scope.assessment.historyOfgoalsToAdd1 = $scope.assessment.historyOfgoalsToAdd1.filter(x => x.ProgramId === item.ProgramId);
            });
        } else {
            Object.values(all).forEach(item => {
                if (!$scope.assessment.historyOfgoalsToAdd1.some(x => x.ProgramId === item.ProgramId)) {
                    $scope.assessment.historyOfgoalsToAdd1.push(item);
                }
            });
        }
    };
    $scope.addToList1 = function (event, goal) {
        if (event.target.checked) {
            if (!$scope.assessment.historyOfgoalsToAdd1.some(x => x.ProgramId === goal.ProgramId)) {
                if (!global.checkExist(goal.FirstFieldId)) {
                    goal.FirstFieldId = $scope.assessment.children[0].Id;
                    goal.SecondFieldId = $scope.assessment.children[1].Id;
                    goal.ProgramId = goal.ProgramId;
                    goal.ValueIndex = $scope.lastValueIndex + $scope.assessment.historyOfgoalsToAdd1.length + 1;
                }
                $scope.assessment.historyOfgoalsToAdd1.push(goal);
            }
        } else {
            $scope.assessment.historyOfgoalsToAdd1 = $scope.assessment.historyOfgoalsToAdd1.filter(x => x.ProgramId !== goal.ProgramId);
        }
    };
    $scope.checkState = function (goal) {
        let result = false;
        if ($scope.assessment.historyOfgoalsToAdd.some(x => x.Id === goal.Id)) {
            result = true;
        }
        return result;
    };
    $scope.checkState1 = function (goal) {
        let result = false;
        if ($scope.assessment.historyOfgoalsToAdd1.some(x => x.ProgramId === goal.ProgramId)) {
            result = true;
        }
        return result;
    };
    $scope.deleteFormTable = function (goal) {
        $scope.assessment.dataToDelete = [
            {
                Id: goal.FormEntryId,
                RowVersion: $scope.assessment.formEntryInfo.RowVersion
            },
            {
                Id: goal.FirstId,
                RowVersion: goal.FirstRowVersion
            }, {
                Id: goal.SecondId,
                RowVersion: goal.SecondRowVersion
            }
        ];
        $("#deleteConfirm").modal();

    };
    $scope.confirmDeleteModal = function () {
        if (global.checkExist($scope.assessment.securityFormInfo)) {
            var path = "assessments/programs/first?secfid=" + $scope.assessment.securityFormInfo.Id;
        } else {
            var path = "assessments/programs/first?secfid=" + $scope.assessment.currentLevel.Id;
        }
        RequestApis.HR(path, 'Delete', '', '', $scope.assessment.dataToDelete, function (response) {
            if (response.status === 204) {
                $scope.cancelDelete();
            }
            global.messaging(response);
        });
    };
    $scope.cancelDelete = function () {
        $scope.assessment.dataToDelete = [];
        $("#deleteConfirm").modal('hide');
        $timeout(function () {
            $scope.refreshSpecialForm();
        }, 1000);
    };
    $scope.changeEditMode = function (goal) {
        if (goal.editMode) {
            goal.editMode = false;
        } else {
            goal.editMode = true;
            $("#demo-" + goal.FirstId).collapse("down");
        }
    };
    $scope.editTitle = function (goalEdit, index) {
        $scope.assessment.goalsToAdd.Values[index].Title = goalEdit.Title;
        $scope.assessment.goalsToAdd.Values[index].QuantitativeResult = goalEdit.QuantitativeResult;
        $scope.assessment.goalsToAdd.RowVersion = $scope.assessment.formEntryInfo.RowVersion;
        $scope.changeEditMode(goalEdit);
        if (global.checkExist($scope.assessment.securityFormInfo)) {
            var path = "assessments/programs/first?secfid=" + $scope.assessment.securityFormInfo.Id;
        } else {
            var path = "assessments/programs/first?secfid=" + $scope.assessment.currentLevel.Id;
        }
        RequestApis.HR(path, 'Patch', '', '', $scope.assessment.goalsToAdd, function (response) {
            $scope.refreshSpecialForm();
            global.messaging(response);
        });
    };
    $scope.changeEditModeFromCartable = function (goalC) {
        if (goalC.editMode) {
            goalC.editMode = false;
        } else {
            goalC.editMode = true;
            $("#demo-" + goalC.FirstId).collapse("down");
        }
    };
    $scope.pagingTableData = function (page) {
        $scope.assessment.paginationItemsForTableData1_2 = '';
        if (global.checkExist($scope.assessment.tableData.Items)) {
            if ($scope.assessment.tableData.TotalPages >= Number(page) && $scope.assessment.tableData.TotalPages >= $scope.assessment.tableData.PageIndex && Number(page) > 0) {
                $scope.assessment.paginationItemsForTableData1_2 += `&ps=100&pn=${Number(page)}`;
                //$scope.refreshSpecialForm();
                $scope.getFirstSpecialData(global.checkExist($scope.assessment.headerInfo.PostId) ? $scope.assessment.headerInfo.PostId : (global.checkExist($scope.assessment.headerInfo.UnitId) ? $scope.assessment.headerInfo.UnitId : $scope.assessment.headerInfo.OrganId));

            }
        }
        if (global.checkExist($scope.assessment.tableData1.Items)) {
            if ($scope.assessment.tableData1.TotalPages >= Number(page) && $scope.assessment.tableData1.TotalPages >= $scope.assessment.tableData1.PageIndex && Number(page) > 0) {
                $scope.assessment.paginationItemsForTableData1_2 += `&ps=100&pn=${Number(page)}`;
                //$scope.refreshSpecialForm();
                $scope.getFirstSpecialData(global.checkExist($scope.assessment.headerInfo.PostId) ? $scope.assessment.headerInfo.PostId : (global.checkExist($scope.assessment.headerInfo.UnitId) ? $scope.assessment.headerInfo.UnitId : $scope.assessment.headerInfo.OrganId));
            }
        }

    };
    $scope.createNewOne = function () {
        $("#createNewOne").modal();
    };
    $scope.cancelCreate = function () {
        $scope.assessment.createNewOneForProgram = {};
        $scope.createNewOneForProgramLoading = false;
        $("#createNewOne").modal("hide");
    };
    $scope.confirmCreateNew = function (item) {
        $scope.createNewOneForProgramLoading = true;
        let jobType = null;
        let PostClassId = null;
        if (global.checkExist($scope.assessment.headerInfo.JobType)) {
            jobType = $scope.assessment.headerInfo.JobType;
        } else {
            jobType = null;
        }
        if (global.checkExist($scope.assessment.headerInfo.PostClassId)) {
            PostClassId = [$scope.assessment.headerInfo.PostClassId];
        } else {
            PostClassId = [];
        }
        RequestApis.HR(`assessment/categories/hasprogram`, 'get', '', '', '', function (response) {
            var dataToSend = [
                {
                    TypeId: response.data[0].Id,
                    PeriodId: $scope.assessment.priodsInfo.Id,
                    ChartId: $scope.assessment.headerInfo.PostId,
                    JobType: jobType,
                    Title: item.Title,
                    QuantitativeResult: item.QuantitativeResult,
                    PersonnelId: item.Public != true ? $scope.assessment.headerInfo.PersonnelId : null,
                    PostClasses: {
                        Inserted: PostClassId,
                        Updated: [],
                        Deleted: []
                    }
                }
            ];
            if (global.checkExist($scope.assessment.headerInfo.PostId)) {
                dataToSend[0].ChartId = $scope.assessment.headerInfo.PostId;
            } else if (global.checkExist($scope.assessment.headerInfo.UnitId)) {
                dataToSend[0].ChartId = $scope.assessment.headerInfo.UnitId;
            } else {
                dataToSend[0].ChartId = $scope.assessment.headerInfo.OrganId;
            }
            RequestApis.HR(`assessments/program`, 'Post', '', '', dataToSend, function (response) {
                if (response.status === 200) {
                    $scope.cancelCreate();
                    $timeout(function () {
                        $scope.refreshSpecialForm();
                    }, 1000);
                }
                global.messaging(response);
            });
        });

    };
    $scope.openFormModal = function () {
        let itemToSet = null;
        let addingPathJ = '';
        let addingPathP = '';
        let path = '';
        if (global.checkExist($scope.assessment.headerInfo.PostId)) {
            itemToSet = $scope.assessment.headerInfo.PostId;
        } else if (global.checkExist($scope.assessment.headerInfo.UnitId)) {
            itemToSet = $scope.assessment.headerInfo.UnitId;
        } else {
            itemToSet = $scope.assessment.headerInfo.OrganId;
        }
        if (global.checkExist($scope.assessment.headerInfo.JobType)) {
            addingPathJ = "&jt=" + $scope.assessment.headerInfo.JobType;
        }
        if (global.checkExist($scope.assessment.headerInfo.PostClassId)) {
            addingPathP = "&pc=" + $scope.assessment.headerInfo.PostClassId;
        }
        if (!global.checkExist($scope.assessment.formEntryInfo.Id)) {
            path = `assessments/period/${$scope.assessment.priodsInfo.Id}/programs/first/init?ss=${$scope.assessment.priodsInfo.StartDatePersian}&psn=${$scope.assessment.headerInfo.PersonnelId}&chid=${itemToSet}${addingPathJ}${addingPathP}${$scope.assessment.paginationItemsForNewListOfProgramTableData}`;
        } else {
            path = `assessments/period/${$scope.assessment.priodsInfo.Id}/programs/first/init?feid=${$scope.assessment.formEntryInfo.Id}&ss=${$scope.assessment.priodsInfo.StartDatePersian}&psn=${$scope.assessment.headerInfo.PersonnelId}&chid=${itemToSet}${addingPathJ}${addingPathP}${$scope.assessment.paginationItemsForNewListOfProgramTableData}`;
        }
        RequestApis.HR(path, 'get', '', '', '', function (response) {
            $scope.assessment.tableDataList = response.data;
            $("#list").modal();
        });
    };
    $scope.cancelList = function () {
        $scope.assessment.pageNumberForListTable = '';
        $scope.assessment.tableDataList = {};
        $("#list").modal("hide");
    };
    $scope.addToListPrePed = function (event, goal) {
        if (event.target.checked) {
            if (!$scope.assessment.historyOfTableDataAdd1.some(x => x.Id === goal.Id)) {
                if (!global.checkExist(goal.FirstFieldId)) {
                    goal.FirstFieldId = $scope.assessment.children[0].Id;
                    goal.SecondFieldId = $scope.assessment.children[1].Id;
                    goal.ProgramId = goal.Id;
                    goal.ValueIndex = $scope.lastValueIndex + $scope.assessment.historyOfTableDataAdd1.length + 1;
                }
                $scope.assessment.historyOfTableDataAdd1.push(goal);
            }
        } else {
            $scope.assessment.historyOfTableDataAdd1 = $scope.assessment.historyOfTableDataAdd1.filter(x => x.Id != goal.Id);
        }
    };
    $scope.checkListTableSelected = function (goal) {
        let result = false;
        if ($scope.assessment.historyOfTableDataAdd1.some(x => x.Id === goal.Id)) {
            result = true;
        }
        return result;
    };
    $scope.loadPageModal = function (page) {
        $scope.assessment.paginationItemsForNewListOfProgramTableData = '';
        if ($scope.assessment.tableDataList.TotalPages >= Number(page) && $scope.assessment.tableDataList.TotalPages >= $scope.assessment.tableDataList.PageIndex && Number(page) > 0) {
            $scope.assessment.paginationItemsForNewListOfProgramTableData = `&ps=10&pn=${Number(page)}`;
            $scope.openFormModal();
        }
    };
    $scope.addFromNewListToTableData = function () {
        $scope.AddProgramFromListLoading = true;
        $scope.assessment.tableDataAdd1.Values = $scope.assessment.historyOfTableDataAdd1;
        if (global.checkExist($scope.assessment.securityFormInfo)) {
            path = "assessments/programs/first?secfid=" + $scope.assessment.securityFormInfo.Id;
        } else {
            path = "assessments/programs/first?secfid=" + $scope.assessment.currentLevel.Id;
        }
        RequestApis.HR(path, 'Post', '', '', $scope.assessment.tableDataAdd1, function (response) {
            if (response.status === 200) {
                $("#list").modal("hide");
                $timeout(function () {
                    $scope.refreshSpecialForm();
                }, 1000);
            }
            global.messaging(response);
            $scope.AddProgramFromListLoading = false;
        });
    };
    $scope.deleteAllFormTable = function () {
        $scope.deleteFormLoading = true;
        let itemsToDelete = [];
        if (global.checkExist($scope.assessment.securityFormInfo)) {
            var path = "assessments/programs/first?secfid=" + $scope.assessment.securityFormInfo.Id;
        } else {
            var path = "assessments/programs/first?secfid=" + $scope.assessment.currentLevel.Id;
        }
        itemsToDelete.push({
            Id: $scope.assessment.formEntryInfo.Id,
            RowVersion: $scope.assessment.formEntryInfo.RowVersion
        });
        Object.values($scope.assessment.historyOfgoalsToAdd1).forEach(item => {
            itemsToDelete.push({
                Id: item.FirstId,
                RowVersion: item.FirstRowVersion
            });
            itemsToDelete.push({
                Id: item.SecondId,
                RowVersion: item.SecondRowVersion
            });
        });
        RequestApis.HR(path, 'Delete', '', '', itemsToDelete, function (response) {
            if (response.status === 204) {
                $scope.assessment.deleteAllowed = false;
                $scope.refreshSpecialForm();
            }
            $scope.deleteFormLoading = false;
            global.messaging(response);
        });

    };
    $scope.submitingForm = function () {
        $scope.submitingFormLoading = true;
        $scope.assessment.goalsToAdd.Values = $scope.assessment.historyOfgoalsToAdd;
        let path = null;
        if (global.checkExist($scope.assessment.securityFormInfo)) {
            path = "assessments/programs/first?secfid=" + $scope.assessment.securityFormInfo.Id;
        } else {
            path = "assessments/programs/first?secfid=" + $scope.assessment.currentLevel.Id;
        }
        RequestApis.HR(path, 'Post', '', '', $scope.assessment.goalsToAdd, function (response) {
            $scope.assessment.tableDataAdd = {};
            $scope.submitingFormLoading = false;
            $scope.refreshSpecialForm();
            global.messaging(response);
        });
    };
    $scope.checkingPermissionForSecond = function (id) {
        let result = false;
        for (var i = 0; i < $scope.assessment.workflowInfo[0].StateFields.length; i++) {
            if (id == $scope.assessment.workflowInfo[0].StateFields[i].FieldId) {
                if (($scope.assessment.workflowInfo[0].StateFields[i].Permission & 2) == 2 || ($scope.assessment.workflowInfo[0].StateFields[i].Permission & 8) == 8) {
                    result = true;
                }
            }
        }
        return result;
    };
    $scope.getValue = function (value, tableId) {
        let result = null;
        Object.values(value).forEach(item => {
            if (item.FieldId == tableId) {
                if (global.checkExist(item.StringValue) && global.checkExist(item.StringValue)) {
                    result = item.StringValue;
                } else {
                    result = item.NumericValue;
                }
            }
        });
        return result;
    };
    $scope.getSumationInstanceSpecial = function () {
        $scope.assessment.SumScoreSpecialSection = 0;
        let items = document.getElementById("allparent").querySelectorAll(".sumationInput");
        Object.values(items).forEach(item => {
            $scope.assessment.SumScoreSpecialSection += Number(document.getElementById(`${item.id}`).value);
        });
    };
    $scope.settingValueForSec = function (id, index, type) {
        $scope.getSumationInstanceSpecial();
        var found = false;
        Object.values($scope.assessment.itemForSecondTable).forEach(item => {
            if (id == item.FieldId && (index + 1) === item.ValueIdx) {
                if (!global.checkExist(document.getElementById(`${index}-${id}`).value) && !global.checkExist(document.getElementById(`${index}-${id}`).value)) {
                    $scope.assessment.itemForSecondTable = $scope.assessment.itemForSecondTable.filter(x => x.Id != id);
                } else {
                    if (item.NumericValue != null) {
                        item.NumericValue = Number(document.getElementById(`${index}-${id}`).value);
                        item.ScoreValue = Number(document.getElementById(`${index}-${id}`).value);
                    } else {
                        item.StringValue = document.getElementById(`${index}-${id}`).value;
                    }
                    found = true;
                }
            }
        });
        if (!found && global.checkExist(document.getElementById(`${index}-${id}`).value) && global.checkExist(document.getElementById(`${index}-${id}`).value)) {
            let itemToPush = {
                ParentFieldId: $scope.assessment.secondTableData.Fields.Main.Id,
                FieldId: id,
                NumericValue: type === 0 || type === 1 ? null : Number(document.getElementById(`${index}-${id}`).value),
                ScoreValue: type === 0 || type === 1 ? null : Number(document.getElementById(`${index}-${id}`).value),
                ValueIdx: index + 1,
                ProgramId: null,
                RelatedId: null,
                StringValue: type === 0 || type === 1 ? document.getElementById(`${index}-${id}`).value : null
            };
            $scope.assessment.itemForSecondTable.push(itemToPush);
        }
    };
    $scope.confirmSecondLevel = function () {
        $scope.loadingConfirmSecondLevel = true;
        var itemToPost = [];
        var itemToEdit = [];
        Object.values($scope.assessment.itemForSecondTable).forEach(item => {
            if (!global.checkExist(item.Id)) {
                itemToPost.push(item);
            } else {
                itemToEdit.push(item);
            }
        });
        RequestApis.HR(`securities/form/code?seccd=HR_ASMT_A2`, 'get', '', '', '', function (sec) {
            if (global.checkExist(itemToPost)) {
                var itemToSend = {
                    FormEntryId: $scope.assessment.formEntryInfo.Id,
                    FormRowVersion: $scope.assessment.formEntryInfo.RowVersion,
                    Header: $scope.assessment.secondTableData.Values[0].Header,
                    Values: itemToPost
                };
                RequestApis.HR(`assessments/programs/second/${$scope.assessment.fieldTwoInfo.Id}?secfid=${sec.data.Id}`, 'Post', '', '', itemToSend, function (response) {
                    if (response.status == 200) {
                        if (global.checkExist(itemToEdit)) {
                            var itemToPatch = {
                                FormEntryId: $scope.assessment.formEntryInfo.Id,
                                FormRowVersion: $scope.assessment.formEntryInfo.RowVersion,
                                Header: $scope.assessment.secondTableData.Values[0].Header,
                                Values: itemToEdit
                            };
                            RequestApis.HR(`assessments/programs/second?secfid=${sec.data.Id}`, 'patch', '', '', itemToPatch, function (response) {
                                global.messaging(response);
                            });
                        } else {
                            global.messaging(response);
                            $scope.refreshSpecialSecondForm();
                        }
                    } else {
                        global.messaging(response);
                    }
                    $scope.loadingConfirmSecondLevel = false;
                });
            } else {
                if (global.checkExist(itemToEdit)) {
                    var itemToPatch = {
                        FormEntryId: $scope.assessment.formEntryInfo.Id,
                        FormRowVersion: $scope.assessment.formEntryInfo.RowVersion,
                        Header: $scope.assessment.secondTableData.Values[0].Header,
                        Values: itemToEdit
                    };
                    RequestApis.HR(`assessments/programs/second?secfid=${sec.data.Id}`, 'patch', '', '', itemToPatch, function (response) {
                        if (response.status == 200) {
                            $scope.refreshSpecialSecondForm();
                        }
                        $scope.loadingConfirmSecondLevel = false;
                        global.messaging(response);
                    });
                }
            }

        });
    };
    $scope.checkmaxMinInSpecialForm = function (item, event) {
        if (Number(event.target.value) > item.MaxValue || Number(event.target.value) < item.MinValue) {
            document.getElementById(`${event.target.id}`).value = '';
        }
        let inputs = $('#allparent').find('input');
        let sum = 0;
        Object.values(inputs).forEach(x => {
            if (x.id != undefined && Number(x.id.toString().split('-')[1]) == Number(event.target.id.toString().split('-')[1])) {
                if (x.value != null) {
                    sum += Number(x.value);
                }
            }
        });
        if (Number(event.target.id.toString().split('-')[1]) === 10 && Number(event.target.value) > Number(document.getElementById(`${event.target.id.toString().split('-')[0]}-${Number(event.target.id.toString().split('-')[1]) - 1}`).value)) {
            document.getElementById(`${event.target.id}`).value = '';
        }
        if ($scope.assessment.secondTableData.Fields.Main.MaxValue < sum || $scope.assessment.secondTableData.Fields.Main.MinValue > sum) {
            document.getElementById(`${event.target.id}`).value = '';
        }
    };
    $scope.refreshSpecialForm = function () {

        $scope.assessment.goalsToAdd = {};
        $scope.assessment.tableDataAdd1 = {};
        $scope.assessment.tableDataAdd = {};
        $scope.assessment.tableData = {};
        $scope.assessment.tableData1 = {};
        $scope.assessment.tableDataList = {};
        $scope.assessment.historyOfgoalsToAdd = [];
        $scope.assessment.historyOfgoalsToAdd1 = [];
        $scope.assessment.historyOfTableDataAdd1 = [];
        $scope.assessment.paginationItemsForTableData1_2 = `&ps=100&pn=1`;
        $scope.assessment.AllowSpecialPage = false;
        $scope.assessment.AllowAdvicePage = false;
        $scope.assessment.AllowPublicPage = false;
        $scope.assessment.isFromCartable = false;
        $scope.assessment.checkValidation = true;
        $scope.assessment.loadingPage = false;
        $scope.assessment.loadingFailed = false;
        $scope.assessment.Isstarted = false;
        $scope.assessment.IsRequester = false;
        $scope.assessment.checkingWorkflow = false;
        $scope.assessment.deleteAllowed = false;
        $scope.getUrlInfo();
    };
    $scope.refreshSpecialSecondForm = function () {
        $scope.assessment.itemForSecondTable = [];
        $scope.assessment.secondTableData = {};
        $scope.assessment.AllowSpecialPage = false;
        $scope.assessment.AllowAdvicePage = false;
        $scope.assessment.AllowPublicPage = false;
        $scope.assessment.isFromCartable = false;
        $scope.assessment.checkValidation = true;
        $scope.assessment.loadingPage = false;
        $scope.assessment.loadingFailed = false;
        $scope.assessment.Isstarted = false;
        $scope.assessment.IsRequester = false;
        $scope.assessment.checkingWorkflow = false;
        $scope.assessment.deleteAllowed = false;
        $scope.getUrlInfo();
    };
    //======================== public section ============================
    $scope.getPublicTables = function () {
        $scope.assessment.loadingTable = false;
        let itemToPost = [];
        let publicSecutityId = $scope.assessment.workflowInfo[0].SecurityForms.find(x => x.Codes[0] === "HR_ASMT_PUBLIC");
        let StateFieldsId = $scope.assessment.workflowInfo[0].StateFields.filter(x => x.SecurityFormId === publicSecutityId.Id);
        Object.values(StateFieldsId).forEach(x => {
            itemToPost.push(x.FieldId);
        });
        RequestApis.HR(`assessments/categories/${$scope.assessment.formEntryInfo.Id}`, 'Post', '', '', itemToPost, function (response) {
            if (response.status === 200) {
                $scope.evaluation.find(x => x.Id === "2").selected = true;
            }
            $scope.assessment.publicTableData = response.data;
            $timeout(function () {
                Object.values($scope.assessment.workflowInfo[0].StateFields).forEach(workFlow => {
                    if ((workFlow.Permission & 2) != 2 && (workFlow.Permission & 8) != 8) {
                        $("#test-" + workFlow.FieldId).attr("disabled", "true");
                    } else {
                        $scope.assessment.allowPublic = true;
                        $scope.assessment.loadingPage = false;
                        $scope.assessment.loadingFailed = false;
                    }
                });
            }, 1000);
            //setTimeout(function () {
            //    for (var i = 0; i < $scope.currentWorkFlowLevel[0].StateFields.length; i++) {
            //        if (($scope.currentWorkFlowLevel[0].StateFields[i].Permission & 2) != 2 && ($scope.currentWorkFlowLevel[0].StateFields[i].Permission & 8) != 8) {
            //            $("#test-" + $scope.currentWorkFlowLevel[0].StateFields[i].FieldId).attr("disabled", "true")
            //        } else {
            //            $scope.assessment.allowPublic = true;
            //        }
            //    }
            //}, 1000)

        });
    };
    $scope.checkmaxMinInNon = function (item) {
        if (Number(document.getElementById(`test-${item.Field.Id}`).value) > Number(item.Field.MaxValue) || Number(document.getElementById(`test-${item.Field.Id}`).value) < Number(item.Field.MinValue)) {
            document.getElementById(`test-${item.Field.Id}`).value = '';
        }
    };
    $scope.getSumationInstanceSpecial = function () {
        $scope.assessment.SumScoreSpecialSection = 0;
        let items = document.getElementById("allparent").querySelectorAll(".sumationInput");
        Object.values(items).forEach(item => {
            $scope.assessment.SumScoreSpecialSection += Number(document.getElementById(`${item.id}`).value);
        });
    };
    $scope.confirmPublic = function () {
        $scope.loadingaccept = true;
        let item = $(".directive-input");
        let checkingItems = [];
        let itemToPost = [];
        let itemToPatch = [];
        for (var i = 0; i < item.length; i++) {
            if (JSON.parse($(item[i]).attr('data')).ScoreValue != null) {
                var itemToPush = {
                    FieldId: Number(JSON.parse($(item[i]).attr('data')).FieldId),
                    ScoreValue: Number(JSON.parse($(item[i]).attr('data')).ScoreValue)
                };
                checkingItems.push(itemToPush);
                if (JSON.parse($(item[i]).attr('data')).Id != null) {
                    itemToPatch.push(JSON.parse($(item[i]).attr('data')));
                    itemToPatch[itemToPatch.length - 1].ScoreValue = Number(itemToPatch[itemToPatch.length - 1].ScoreValue);
                    itemToPatch[itemToPatch.length - 1].NumericValue = Number(itemToPatch[itemToPatch.length - 1].ScoreValue);
                } else {
                    itemToPost.push(JSON.parse($(item[i]).attr('data')));
                    itemToPost[itemToPost.length - 1].ScoreValue = Number(itemToPost[itemToPost.length - 1].ScoreValue);
                    itemToPost[itemToPost.length - 1].NumericValue = Number(itemToPost[itemToPost.length - 1].ScoreValue);
                }
                // JSON.parse($(item[i]).attr('data')).NumericValue = JSON.parse($(item[i]).attr('data')).ScoreValue;
            }
        }
        RequestApis.HR(`assessments/${$scope.assessment.formEntryInfo.Id}/check`, 'Post', '', '', checkingItems, function (response) {
            if (response.status === 404) {
                if (global.checkExist(itemToPost)) {
                    let itemToConfirm = {
                        FormEntryId: $scope.assessment.publicTableData.FormEntryId,
                        FormRowVersion: $scope.assessment.publicTableData.FormRowVersion,
                        Header: $scope.assessment.publicTableData.Header,
                        Values: itemToPost
                    };
                    RequestApis.HR(`assessments/programs/common?secfid=${$scope.assessment.workflowInfo[0].SecurityForms[0].Id}`, 'Post', '', '', itemToConfirm, function (response1) {
                        if (response1.status === 200) {
                            if (global.checkExist(itemToPatch)) {
                                let itemToConfirmPatch = {
                                    FormEntryId: $scope.assessment.publicTableData.FormEntryId,
                                    FormRowVersion: $scope.assessment.publicTableData.FormRowVersion,
                                    Header: $scope.assessment.publicTableData.Header,
                                    Values: itemToPatch
                                };
                                RequestApis.HR(`assessments/programs/common?secfid=${$scope.assessment.workflowInfo[0].SecurityForms[0].Id}`, 'Patch', '', '', itemToConfirmPatch, function (response2) {
                                    if (response2.status === 200) {
                                        $scope.refreshPublicSection();
                                    }
                                    global.messaging(response2);
                                });
                            } else {
                                global.messaging(response1);
                                $scope.refreshPublicSection();
                            }

                        } else {
                            global.messaging(response1);
                        }
                        $scope.loadingaccept = false;
                    });
                } else if (global.checkExist(itemToPatch)) {
                    var itemToConfirmPatch = {
                        FormEntryId: $scope.assessment.publicTableData.FormEntryId,
                        FormRowVersion: $scope.assessment.publicTableData.FormRowVersion,
                        Header: $scope.assessment.publicTableData.Header,
                        Values: itemToPatch
                    };
                    RequestApis.HR(`assessments/programs/common?secfid=${$scope.assessment.workflowInfo[0].SecurityForms[0].Id}`, 'Patch', '', '', itemToConfirmPatch, function (response2) {
                        if (response2.status === 200) {
                            $scope.refreshPublicSection();
                        }
                        global.messaging(response2);
                        $scope.loadingaccept = false;
                    });
                }
            } else {
                $scope.assessment.publicErrors = response.data;
                $("#publicErrorModal").modal();
            }
        });
    };
    $scope.cancelPublickError = function () {
        $("#publicErrorModal").modal('hide');
    };
    $scope.refreshPublicSection = function () {
        $scope.loadingaccept = false;
        $scope.assessment.publicTableData = {};
        $scope.getUrlInfo();
    };
    $scope.sumationPublic = function () {
        $timeout(function () {
            let result = 0;
            let itemsNon = document.getElementById("publicSum").querySelectorAll(".sumationInput");
            Object.values(itemsNon).forEach(item => {
                result += Number(document.getElementById(`${item.id}`).value);
            });
            document.getElementById("public").innerHTML = result;
        }, 1);

    };
    //================================== Advice Section ================================
    $scope.getAdvicePart = function () {
        let itemToPost = [];
        let ADVISESecutityId = $scope.assessment.workflowInfo[0].SecurityForms.find(x => x.Codes[0] === "HR_ASMT_ADVISE");
        let StateFieldsId = $scope.assessment.workflowInfo[0].StateFields.filter(x => x.SecurityFormId === ADVISESecutityId.Id);
        Object.values(StateFieldsId).forEach(x => {
            itemToPost.push(x.FieldId);
        });
        RequestApis.HR(`assessments/categories/${$scope.assessment.formEntryInfo.Id}`, 'Post', '', '', itemToPost, function (response) {
            if (response.status === 200) {
                $scope.evaluation.find(x => x.Id === "3").selected = true;
            }
            $scope.assessment.adviceTableData = response.data;
            $timeout(function () {
                for (var i = 0; i < $scope.assessment.workflowInfo[0].StateFields.length; i++) {
                    if (($scope.assessment.workflowInfo[0].StateFields[i].Permission & 2) != 2 && ($scope.assessment.workflowInfo[0].StateFields[i].Permission & 2) != 8) {
                        $("#test-" + $scope.assessment.workflowInfo[0].StateFields[i].FieldId).attr("disabled", "true");
                    }
                }
            }, 1000);
            $scope.assessment.loadingPage = false;
            $scope.assessment.AllowAdvicePage = true;
        });
    };
    $scope.confirmAdvice = function () {
        $scope.loadingAdvice = true;
        let itemToPost = [];
        let itemToPatch = [];
        for (var i = 0; i < $scope.assessment.adviceTableData.Categories[0].Values.length; i++) {
            if (global.checkExist($scope.assessment.adviceTableData.Categories[0].Values[i].StringValue)) {
                if (global.checkExist($scope.assessment.adviceTableData.Categories[0].Values[i].Id)) {
                    itemToPatch.push($scope.assessment.adviceTableData.Categories[0].Values[i]);
                } else {
                    itemToPost.push($scope.assessment.adviceTableData.Categories[0].Values[i]);
                }
            }
        }

        if (global.checkExist(itemToPost)) {
            var itemToConfirm = {
                FormEntryId: $scope.assessment.adviceTableData.FormEntryId,
                FormRowVersion: $scope.assessment.adviceTableData.FormRowVersion,
                Header: $scope.assessment.adviceTableData.Header,
                Values: itemToPost
            };
            RequestApis.HR(`assessments/programs/common?secfid=${$scope.assessment.workflowInfo[0].SecurityForms[0].Id}`, 'Post', '', '', itemToConfirm, function (response1) {
                if (response1.status === 200) {
                    if (global.checkExist(itemToPatch)) {
                        var itemToConfirmPatch = {
                            FormEntryId: $scope.adviceTableData.FormEntryId,
                            FormRowVersion: $scope.adviceTableData.FormRowVersion,
                            Header: $scope.adviceTableData.Header,
                            Values: itemToPatch
                        };
                        RequestApis.HR(`assessments/programs/common?secfid=${$scope.assessment.workflowInfo[0].SecurityForms[0].Id}`, 'Patch', '', '', itemToConfirmPatch, function (response2) {
                            if (response2.status === 200) {
                                $scope.loadingAdvice = false;
                                $scope.refreshAdviceSection();
                            }
                            global.messaging(response2);
                        });
                    } else {
                        $scope.loadingAdvice = false;
                        global.messaging(response1);
                        $scope.refreshAdviceSection();
                    }
                } else {
                    global.messaging(response1);
                }
            });
        } else if (global.checkExist(itemToPatch)) {
            var itemToConfirmPatch = {
                FormEntryId: $scope.assessment.adviceTableData.FormEntryId,
                FormRowVersion: $scope.assessment.adviceTableData.FormRowVersion,
                Header: $scope.assessment.adviceTableData.Header,
                Values: itemToPatch
            };
            RequestApis.HR(`assessments/programs/common?secfid=${$scope.assessment.workflowInfo[0].SecurityForms[0].Id}`, 'Patch', '', '', itemToConfirmPatch, function (response2) {
                if (response2.status === 200) {
                    $scope.loadingAdvice = false;
                    $scope.refreshAdviceSection();
                }
                global.messaging(response2);
            });
        }

    };
    $scope.refreshAdviceSection = function () {
        $scope.loadingAdvice = false;
        $scope.assessment.adviceTableData = {};
        $scope.getUrlInfo();
    };
});
app.controller('PrintEvaluationPriodCtrl', function ($scope, $templateCache, $state, RequestApis, global, FileSaver, Blob) {
    $templateCache.remove($state.current.templateUrl);
    //======================= check authorization =============
    $scope.checkValidation = true;
    $scope.checkAuth = function () {
        $scope.loadingPage = true;
        RequestApis.HR(`securities/HR/view/HR_ASSESSMENT`, 'Get', '', '', '', function (response) {
            if (response.status !== 200) {
                // $scope.redirectUrlForUnAuth = '../PermissionWarning.html';
                // $scope.checkValidation = false;
            } else {
                RequestApis.HR(`securities/HR/exec/HR_ASSESSMENT`, 'Get', '', '', '', function (response) {
                    if (response.status === 200) {
                        $scope.checkValidationOnBtn = true;
                    } else {
                        $scope.checkValidationOnBtn = false;
                    }
                });
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
    //============= initialize section ===========================
    this.$onInit = function () {
        $scope.getState();
        $scope.getPeriods();
        $scope.getListItems();
        $scope.HasValueChecking();
    };
    $scope.loadingPrint = false;
    $scope.loadingSearch = false;
    $scope.selectedItems = [];
    $scope.loadingMultiPrint = false;
    $scope.getChartBySDate = moment().format('jYYYY/jMM/jDD');
    $scope.getChartByFDate = "";
    //================= select chart ==============================
    $scope.changeSelectPostStatus = function () {
        $scope.selectPostStatus = !$scope.selectPostStatus;
    };
    $scope.dataunit = {
        data: {},
        status: true
    };
    $scope.useSelectedChart = function () {
        if ($scope.dataunit.status === false) {
            $scope.chartOrganizationInfo = $scope.dataunit.data;
            $scope.searchItems.tri = $scope.dataunit.data.Id;
            $scope.searchItems.treeName = $scope.dataunit.data.Title;
            $scope.changeSelectPostStatus();
        }
    };
    //================= advance search ============================
    $scope.marigeStatus = [];
    $scope.openMarige = function () {
        if ($scope.marigeStatus.length == 0) {
            RequestApis.HR("constants/enum/MaritalState", 'Get', '', '', '', function (response) {
                $scope.marigeStatus = response.data;
            });
        }
    };
    $scope.warStatus = [];
    $scope.openWar = function () {
        if ($scope.warStatus.length == 0) {
            RequestApis.HR("scores/war/types", 'Get', '', '', '', function (response) {
                $scope.warStatus = response.data;
            });
        }
    };
    $scope.jobStatus = [];
    $scope.openJob = function () {
        if ($scope.jobStatus.length == 0) {
            RequestApis.HR("constants/enum/JobType", 'Get', '', '', '', function (response) {
                $scope.jobStatus = response.data;
            });
        }
    };
    $scope.MarigeStateChange = function (item) {
        if ($("#check-m-" + item.Id).is(':checked')) {
            $scope.searchItems.marrige.push(item);
        } else {
            for (var i = 0; i < $scope.searchItems.marrige.length; i++) {
                if (item.Id == $scope.searchItems.marrige[i].Id) {
                    $scope.searchItems.marrige.splice(i, 1);
                }
            }
        }
    };
    $scope.serviceStateChange = function (item) {
        if ($("#check-s-service-" + item.Id).is(':checked')) {
            $scope.searchItems.serviceStatus.push(item);
        } else {
            for (var i = 0; i < $scope.searchItems.serviceStatus.length; i++) {
                if (item.Id == $scope.searchItems.serviceStatus[i].Id) {
                    $scope.searchItems.serviceStatus.splice(i, 1);
                }
            }
        }
    };
    $scope.removeService = function (index, id) {
        $scope.searchItems.serviceStatus.splice(index, 1);
        $("#check-s-service-" + id).prop("checked", false);
    };
    $scope.eStateChange = function (item) {
        if ($("#check-e-" + item.Id).is(':checked')) {
            $scope.searchItems.employeeStatus.push(item);
        } else {
            for (var i = 0; i < $scope.searchItems.employeeStatus.length; i++) {
                if (item.Id == $scope.searchItems.employeeStatus[i].Id) {
                    $scope.searchItems.employeeStatus.splice(i, 1);
                }
            }
        }
    };
    $scope.ePostChange = function (item) {
        if ($("#check-post-" + item.Id).is(':checked')) {
            $scope.searchItems.postTypes.push(item);
        } else {
            for (var i = 0; i < $scope.searchItems.postTypes.length; i++) {
                if (item.Id == $scope.searchItems.postTypes[i].Id) {
                    $scope.searchItems.postTypes.splice(i, 1);
                }
            }
        }
    };
    $scope.ePostcatChange = function (item) {
        if ($("#check-postcat-" + item.Id).is(':checked')) {
            $scope.searchItems.postcat.push(item);
        } else {
            for (var i = 0; i < $scope.searchItems.postcat.length; i++) {
                if (item.Id == $scope.searchItems.postcat[i].Id) {
                    $scope.searchItems.postcat.splice(i, 1);
                }
            }
        }
    };
    $scope.removeEmployee = function (index, id) {
        $scope.searchItems.employeeStatus.splice(index, 1);
    };
    $scope.checkingState = function (item) {
        var found = false;
        for (var i = 0; i < $scope.searchItems.employeeStatus.length; i++) {
            if (item.Id == $scope.searchItems.employeeStatus[i].Id) {
                found = true;
                break;
            }
        }
        return found;
    };
    $scope.checkingPost = function (item) {
        var found = false;
        for (var i = 0; i < $scope.searchItems.postTypes.length; i++) {
            if (item.Id == $scope.searchItems.postTypes[i].Id) {
                found = true;
                break;
            }
        }
        return found;
    };
    $scope.checkingPostCat = function (item) {
        var found = false;
        for (var i = 0; i < $scope.searchItems.postcat.length; i++) {
            if (item.Id == $scope.searchItems.postcat[i].Id) {
                found = true;
                break;
            }
        }
        return found;
    };
    $scope.warStateChange = function (item) {
        if ($("#check-w-war-" + item.Id).is(':checked')) {
            $scope.searchItems.warStatus.push(item);
        } else {
            for (var i = 0; i < $scope.searchItems.warStatus.length; i++) {
                if (item.Id == $scope.searchItems.warStatus[i].Id) {
                    $scope.searchItems.warStatus.splice(i, 1);
                }
            }
        }
    };
    $scope.removeWar = function (index, id) {
        $scope.searchItems.warStatus.splice(index, 1);
        $("#check-w-war-" + id).prop("checked", false);
    };
    $scope.jobStateChange = function (item) {
        if ($("#customCheck-work-" + item.Id).is(':checked')) {
            $scope.searchItems.jobType.push(item);
        } else {
            for (var i = 0; i < $scope.searchItems.jobType.length; i++) {
                if (item.Id == $scope.searchItems.jobType[i].Id) {
                    $scope.searchItems.jobType.splice(i, 1);
                }
            }
        }
    };
    $scope.removeJob = function (index, id) {
        $scope.searchItems.jobType.splice(index, 1);
        $("#customCheck-work-" + id).prop("checked", false);
    };
    $scope.getPostClasses = function () {
        $scope.postPath = "postclasses?paging.pn=";
        RequestApis.HR($scope.postPath + '1', 'Get', '', '', '', function (response) {
            $scope.postClassesArray = response.data;
        });
    };
    $scope.postSearch = '';
    $scope.postcatSearch = '';
    $scope.getTableDataPost = function (path) {
        RequestApis.HR(path, 'Get', '', '', '', function (response) {
            $scope.postClassesArray = response;
        });
    };
    $scope.getTableDataPostCat = function (path) {
        RequestApis.HR(path, 'Get', '', '', '', function (response) {
            $scope.postClassesCatArray = response;
        });
    };
    $scope.loadPagePost = function (method) {
        var newPath;
        if (method == 1) {
            if (!$scope.postClassesArray.LastPage) {
                var page = Number($scope.postClassesArray.PageIndex) + 1;
                // $scope.currentPage = page;
                newPath = $scope.postPath + page + "&q=" + $scope.postSearch;
                $scope.getTableDataPost(newPath);

            }
        } else if (method == -1) {
            if ($scope.postClassesArray.PageIndex > 1) {
                var page = Number($scope.postClassesArray.PageIndex) - 1;
                // $scope.currentPage = page;
                newPath = $scope.postPath + page + "&q=" + $scope.postSearch;
                $scope.getTableDataPost(newPath);

            }
        } else if (method == "first") {
            var page = 1;
            // $scope.currentPage = 1;
            newPath = $scope.postPath + page + "&q=" + $scope.postSearch;
            $scope.getTableDataPost(newPath);
        } else {
            var page = $scope.postClassesArray.TotalPages;
            // $scope.currentPage = page;
            newPath = $scope.postPath + page + "&q=" + $scope.postSearch;
            $scope.getTableDataPost(newPath);
        }
    };
    $scope.changePagePost = function (event, page) {
        $("form").submit(function () {
            return false;
        });
        if (event.keyCode == 13) {
            if (page <= $scope.postClassesArray.TotalPages & page >= 1) {
                newPath = $scope.postPath + page + "&q=" + $scope.postSearch;
                $scope.getTableDataPost(newPath);
                $("#pagingPost").val("");
            } else {
                $("#pagingPost").val("");
            }
        }
    };
    $scope.loadPagePostCat = function (method) {
        var newPath;
        if (method == 1) {
            if (!$scope.postClassesCatArray.LastPage) {
                var page = Number($scope.postClassesCatArray.PageIndex) + 1;
                // $scope.currentPage = page;
                newPath = $scope.jobBranchPath + page + "&q=" + $scope.postcatSearch;
                $scope.getTableDataPostCat(newPath);

            }
        } else if (method == -1) {
            if ($scope.postClassesCatArray.PageIndex > 1) {
                var page = Number($scope.postClassesCatArray.PageIndex) - 1;
                // $scope.currentPage = page;
                newPath = $scope.jobBranchPath + page + "&q=" + $scope.postcatSearch;
                $scope.getTableDataPostCat(newPath);

            }
        } else if (method == "first") {
            var page = 1;
            // $scope.currentPage = 1;
            newPath = $scope.jobBranchPath + page + "&q=" + $scope.postcatSearch;
            $scope.getTableDataPostCat(newPath);
        } else {
            var page = $scope.postClassesCatArray.TotalPages;
            // $scope.currentPage = page;
            newPath = $scope.jobBranchPath + page + "&q=" + $scope.postcatSearch;
            $scope.getTableDataPostCat(newPath);
        }
    };
    $scope.changePagePostCat = function (event, page) {
        $("form").submit(function () {
            return false;
        });
        if (event.keyCode == 13) {
            if (page <= $scope.postClassesCatArray.TotalPages & page >= 1) {
                newPath = $scope.jobBranchPath + page + "&q=" + $scope.postcatSearch;
                $scope.getTableDataPostCat(newPath);
                $("#pagingCat").val("");
            } else {
                $("#pagingCat").val("");
            }
        }
    };
    $scope.searchPost = function (item) {
        $scope.postSearch = item;
        var newPath = $scope.postPath + 1 + "&q=" + $scope.postSearch;
        $scope.getTableDataPost(newPath);
    };
    $scope.searchPostCat = function (item) {
        var newPath = $scope.jobBranchPath + 1 + "&q=" + $scope.postcatSearch;
        $scope.getTableDataPostCat(newPath);
    };
    $scope.removePost = function (index, id) {
        $scope.searchItems.postTypes.splice(index, 1);
    };
    $scope.removePostCat = function (index, id) {
        $scope.searchItems.postcat.splice(index, 1);
    };
    $scope.getJobBranch = function () {
        $scope.jobBranchPath = "postcategories/auto?pn=";
        RequestApis.HR($scope.jobBranchPath + '1', 'Get', '', '', '', function (response) {
            $scope.postClassesCatArray = response.data;
        });
    };
    $scope.getOrder = function () {
        RequestApis.HR("experttypes/simple", 'Get', '', '', '', function (response) {
            $scope.ordersArray = response.data;
        });
    };
    $scope.orderChange = function (item) {
        if ($("#check-order-" + item.Id).is(':checked')) {
            $scope.searchItems.order.push(item);
        } else {
            for (var i = 0; i < $scope.searchItems.order.length; i++) {
                if (item.Id == $scope.searchItems.order[i].Id) {
                    $scope.searchItems.order.splice(i, 1);
                }
            }
        }
    };
    $scope.eRelativeChange = function (item) {
        if ($("#relative-" + item.Id).is(':checked')) {
            $scope.searchItems.relative.push(item);
        } else {
            for (var i = 0; i < $scope.searchItems.relative.length; i++) {
                if (item.Id == $scope.searchItems.relative[i].Id) {
                    $scope.searchItems.relative.splice(i, 1);
                }
            }
        }
    };
    $scope.removeRelated = function (index) {
        $scope.searchItems.relative.splice(index, 1);
    };
    $scope.checkingOrder = function (item) {
        var found = false;
        for (var i = 0; i < $scope.searchItems.order.length; i++) {
            if (item.Id == $scope.searchItems.order[i].Id) {
                found = true;
                break;
            }
        }
        return found;
    };
    $scope.checkingRelative = function (item) {
        var found = false;
        for (var i = 0; i < $scope.searchItems.relative.length; i++) {
            if (item.Id == $scope.searchItems.relative[i].Id) {
                found = true;
                break;
            }
        }
        return found;
    };
    $scope.removeOrder = function (index, id) {
        $scope.searchItems.order.splice(index, 1);
    };
    $scope.getStore = function () {
        RequestApis.HR("jobpositions/simple", 'Get', '', '', '', function (response) {
            $scope.storeArray = response.data;
        });
    };
    $scope.storeChange = function (item) {
        if ($("#check-stroreArray-" + item.Id).is(':checked')) {
            $scope.searchItems.store.push(item);
        } else {
            for (var i = 0; i < $scope.searchItems.store.length; i++) {
                if (item.Id == $scope.searchItems.store[i].Id) {
                    $scope.searchItems.store.splice(i, 1);
                }
            }
        }
    };
    $scope.checkingStore = function (item) {
        var found = false;
        for (var i = 0; i < $scope.searchItems.store.length; i++) {
            if (item.Id == $scope.searchItems.store[i].Id) {
                found = true;
                break;
            }
        }
        return found;
    };
    $scope.removeStore = function (index, id) {
        $scope.searchItems.store.splice(index, 1);
    };
    $scope.getRelated = function () {
        RequestApis.HR("constants/enum/relative", 'Get', '', '', '', function (response) {
            $scope.relatives = response.data;
        });
    };
    $scope.getInitEmployees = function () {
        RequestApis.HR("employees/simple/type", 'Get', '', '', '', function (response) {
            $scope.employeeType = response.data;
        });
    };
    $scope.getStateArray = function () {
        RequestApis.HR("employees/state?paging.pn=1", 'Get', '', '', '', function (response) {
            $scope.stateArray = response.data;
            $scope.statePath = "employees/state?paging.pn=";
        });
    };
    $scope.searchState = function (item) {
        $scope.stateSearch = item;
        RequestApis.HR($scope.statePath + "1&q=" + item, 'Get', '', '', '', function (response) {
            $scope.stateArray = response.data;
        });
    };
    //================= get list of priods ============================
    $scope.getPeriods = function () {
        RequestApis.HR('periods', 'Get', '', '', '', function (response) {
            $scope.PriodItems = response.data.Items;
        });
    };
    $scope.getListItems = function () {
        RequestApis.HR('assessments/forms', 'Get', '', '', '', function (response) {
            $scope.ListItems = response.data;
        });
    };
    $scope.getState = function () {
        RequestApis.HR('assessments/workflow/states', 'Get', '', '', '', function (response) {
            $scope.stateItems = response.data[0].States;
        });
    };
    $scope.HasValueChecking = function () {
        $scope.hasValueState = [{Id: null, Title: 'تمامی موارد'}, {Id: 0, Title: 'بدون مقادیر'}, {
            Id: 1,
            Title: 'دارای مقادیر'
        }];
    };
    $scope.searchItems = {
        name: "",
        family: "",
        fatherName: "",
        nationalCode: "",
        birthCode: "",
        personnelCode: "",
        employeeCode: "",
        sex: "",
        tri: null,
        treeName: null,
        marrige: [],
        ageFrom: "",
        ageUntil: "",
        warStatus: [],
        serviceStatus: [],
        employeeStatus: [],
        jobType: [],
        postTypes: [],
        order: [],
        store: [],
        postcat: [],
        employmentFrom: "",
        employmentUntil: "",
        childrenCountFrom: "",
        childrenCountUntil: "",
        PriodDate: "",
        HasValues: "",
        stateDate: "",
        relative: []
    };
    $scope.getDataTable = function (page = 1) {
        var searchParameter = '';
        if ($scope.searchItems.name != "") {
            searchParameter = "&n=" + $scope.searchItems.name;
        }
        if ($scope.searchItems.family != "") {
            searchParameter = searchParameter + "&f=" + $scope.searchItems.family;
        }
        if ($scope.searchItems.fatherName != "") {
            searchParameter = searchParameter + "&fn=" + $scope.searchItems.fatherName;
        }
        if ($scope.searchItems.nationalCode != "") {
            searchParameter = searchParameter + "&nc=" + $scope.searchItems.nationalCode;
        }
        if ($scope.searchItems.personnelCode != "") {
            searchParameter = searchParameter + "&pnn=" + $scope.searchItems.personnelCode;
        }
        if ($scope.searchItems.employeeCode != "") {
            searchParameter = searchParameter + "&dn=" + $scope.searchItems.employeeCode;
        }
        if ($scope.searchItems.ageFrom != "") {
            searchParameter = searchParameter + "&ag1=" + $scope.searchItems.ageFrom;
        }
        if ($scope.searchItems.ageUntil != "") {
            searchParameter = searchParameter + "&ag2=" + $scope.searchItems.ageUntil;
        }
        if ($scope.searchItems.childrenCountFrom != "") {
            searchParameter = searchParameter + "&cf=" + $scope.searchItems.childrenCountFrom;
        }
        if ($scope.searchItems.childrenCountUntil != "") {
            searchParameter = searchParameter + "&cu=" + $scope.searchItems.childrenCountUntil;
        }
        if ($scope.searchItems.sex != "" & $scope.searchItems.sex != 0) {
            searchParameter = searchParameter + "&gn=" + $scope.searchItems.sex;
        }
        if ($("#from").val() != '') {
            searchParameter = searchParameter + "&efd=" + $("#from").val();
        }
        if ($("#until").val() != '') {
            searchParameter = searchParameter + "&eud=" + $("#until").val();
        }
        if ($scope.searchItems.tri != null) {
            searchParameter = searchParameter + "&tri=" + $scope.searchItems.tri;
        }
        if ($scope.searchItems.marrige.length != 0) {
            var mValue = 0;
            for (var i = 0; i < $scope.searchItems.marrige.length; i++) {
                mValue = mValue + $scope.searchItems.marrige[i].Id;
            }
            searchParameter = searchParameter + "&ms=" + mValue;
        }
        if ($scope.searchItems.warStatus.length != 0) {
            var wValue = $scope.searchItems.warStatus[0].Id;
            for (var i = 1; i < $scope.searchItems.warStatus.length; i++) {
                wValue = wValue + "," + $scope.searchItems.warStatus[i].Id;
            }
            searchParameter = searchParameter + "&wt=" + wValue;
        }
        if ($scope.searchItems.jobType.length != 0) {
            var jValue = 0;
            for (var i = 0; i < $scope.searchItems.jobType.length; i++) {
                jValue = jValue + $scope.searchItems.jobType[i].Id;
            }
            searchParameter = searchParameter + "&jt=" + jValue;
        }
        if ($scope.searchItems.relative.length != 0) {
            var rValue = 0;
            for (var i = 0; i < $scope.searchItems.relative.length; i++) {
                rValue = rValue + $scope.searchItems.relative[i].Id;
            }

            searchParameter = searchParameter + "&rl=" + rValue;
        }
        if ($scope.searchItems.serviceStatus.length != 0) {
            var jValue = $scope.searchItems.serviceStatus[0].Id;
            for (var i = 1; i < $scope.searchItems.serviceStatus.length; i++) {
                jValue = jValue + "," + $scope.searchItems.serviceStatus[i].Id;
            }
            searchParameter = searchParameter + "&et=" + jValue;
        }
        if ($scope.searchItems.employeeStatus.length != 0) {
            var jValue = $scope.searchItems.employeeStatus[0].Id;
            for (var i = 1; i < $scope.searchItems.employeeStatus.length; i++) {
                jValue = jValue + "," + $scope.searchItems.employeeStatus[i].Id;
            }
            searchParameter = searchParameter + "&es=" + jValue;
        }
        if ($scope.searchItems.postTypes.length != 0) {
            var jValue = $scope.searchItems.postTypes[0].Id;
            for (var i = 1; i < $scope.searchItems.postTypes.length; i++) {
                jValue = jValue + "," + $scope.searchItems.postTypes[i].Id;
            }
            searchParameter = searchParameter + "&pc=" + jValue;
        }
        if ($scope.searchItems.postcat.length != 0) {
            var pCValue = $scope.searchItems.postcat[0].Id;
            for (var i = 1; i < $scope.searchItems.postcat.length; i++) {
                pCValue = pCValue + "," + $scope.searchItems.postcat[i].Id;
            }
            searchParameter = searchParameter + "&pct=" + pCValue;
        }
        if ($scope.searchItems.order.length != 0) {
            var ordering = $scope.searchItems.order[0].Id;
            for (var i = 1; i < $scope.searchItems.order.length; i++) {
                ordering = ordering + "," + $scope.searchItems.order[i].Id;
            }
            searchParameter = searchParameter + "&xpt=" + ordering;
        }
        if ($scope.searchItems.store.length != 0) {
            var storing = $scope.searchItems.store[0].Id;
            for (var i = 1; i < $scope.searchItems.store.length; i++) {
                storing = storing + "," + $scope.searchItems.store[i].Id;
            }
            searchParameter = searchParameter + "&jp=" + storing;
        }
        if ($scope.searchItems.stateDate.length != 0) {
            var result = '';
            switch ($scope.searchItems.stateDate) {
                case 1:
                    return result = '&hrs=1';
                case 2:
                    return result = '&hr=1';
                case 3:
                    return result = '&hrf=1';
                default:
                    return result = '';
            }
            searchParameter = searchParameter + result;
        }
        if ($scope.searchItems.state) {
            searchParameter = searchParameter + "&st=" + $scope.searchItems.state;
        }
        if ($scope.searchItems.HasValues != undefined) {
            searchParameter = searchParameter + "&hav=" + $scope.searchItems.HasValues;
        }
        if ($scope.searchItems.PriodDate.length != 0) {
            searchParameter = searchParameter + "&prd=" + $scope.searchItems.PriodDate;
        }
        //if ($scope.searchItems.ListItem.length != 0) {
        //  searchParameter = searchParameter + "&frm=" + $scope.searchItems.ListItem;
        //}
        $scope.searchParam = searchParameter;

        if ($scope.searchItems.PriodDate.length == 0) {
            Toast.fire({icon: 'warning', title: 'لطفا دوره ارزشیابی را مشخص نمایید.'});

        } else {
            $scope.loadingSearch = true;
            let path = "";
            if ($scope.CheckAllItem) {
                path = 'assessments/all?pn=' + page + $scope.searchParam;
            } else {
                path = 'assessments?pn=' + page + $scope.searchParam;
            }
            RequestApis.HR(path, 'Get', '', '', '', function (response) {
                if (response.status === 200) {
                    if ($scope.CheckAllItem) {
                        Object.values(response.data).forEach(item => {
                            $scope.selectedItems.push(item.Id);
                        });
                    } else {
                        $scope.selectedItems = [];
                    }
                    $scope.priods = response.data;
                } else {
                    Toast.fire({
                        icon: 'error',
                        title: 'داده ای برای نمایش وجود ندارد'
                    });
                    $scope.priods = [];
                }
                $scope.loadingSearch = false;
            });
        }
    };

    $scope.changePriod = function (item) {
        $scope.priod = item;
    };
    $scope.changeState = function (item) {
        $scope.state = item;
    };
    $scope.changeValueState = function (item) {
        $scope.valueState = item;
    };
    //====================== pagination =============================
    $scope.loadPage = function (method) {
        if (method == 1) {
            if (!$scope.priods.LastPage) {
                $scope.getDataTable(Number($scope.priods.PageIndex) + 1);
            }
        } else if (method == -1) {
            if ($scope.priods.PageIndex > 1) {
                $scope.getDataTable(Number($scope.priods.PageIndex) - 1);
            }
        } else if (method == "first") {
            $scope.getDataTable(1);
        } else {
            $scope.getDataTable($scope.priods.TotalPages);
        }
    };
    $scope.changePage = function (event, page) {
        $("form").submit(function () {
            return false;
        });
        if (event.keyCode == 13) {
            if (page <= $scope.priods.TotalPages && page >= 1) {
                $scope.currentPage = page;
                newPath = $scope.currentPath + "&paging.pn=" + page;
                $scope.getTableData(newPath);
                $("#paging").val("");
            } else {
                $("#paging").val("");
            }
        }
    };
    //======================== get Print ========================

    $scope.ShowPrintFormModal = function (type, item) {
        $scope.reportType = [{id: 0, type: 'pdf'}, {id: 1, type: 'docx'}, {id: 2, type: 'xlsx'}];
        $scope.priodsId = $scope.priod;
        $scope.singleItems = item;
        $('#PrintModal').modal();
        if (type == 'Multi') {
            $scope.typeState = 'Multi';
        } else {
            $scope.typeState = 'single';
        }
    };
    $scope.cancelPrint = function () {
        $('#PrintModal').modal('hide');
    };
    $scope.setThisPage = function (event, items) {
        if (event.target.checked) {
            Object.values(items).forEach(item => {
                if (!$scope.selectedItems.some(x => x === item.Id))
                    $scope.selectedItems.push(item.Id);
            });
        } else {
            Object.values(items).forEach(item => {
                $scope.selectedItems = $scope.selectedItems.filter(x => x !== item.Id);
            });
        }
    };
    $scope.CheckAllItem = false;
    $scope.setAlls = function (event) {
        if (event.target.checked) {
            $scope.CheckAllItem = true;
        } else {
            $scope.CheckAllItem = false;
        }
        $scope.getDataTable();
    };
    $scope.checkItemState = function (id) {
        let result = false;
        if ($scope.selectedItems.some(x => x === id)) {
            result = true;
        }
        return result;
    };

    $scope.checkItem = function (event, id) {
        if (event.target.checked) {
            if (!$scope.selectedItems.some(x => x === id))
                $scope.selectedItems.push(id);
        } else {
            $scope.selectedItems = $scope.selectedItems.filter(x => x !== id);
        }
    };
    $scope.confirmPrint = function () {

        $scope.loadingPrint = true;
        $scope.loadingMultiPrint = true;
        var checks = $('#parentCkeck').find('input[name="type"]:checked');
        var checkSelected = '';
        for (var i = 0; i < checks.length; i++) {
            checkSelected += checks[i].id;
        }
        var radioSelected = $('#parentCkeck').find('input[name="item"]:checked')[0].id;
        $scope.fileName = 'گزارش در تاریخ - ' + new Date().toLocaleDateString();
        if ($scope.typeState == "Multi") {
            if ($scope.selectedItems.length) {
                RequestApis.HR('assessments/report/' + radioSelected + '?q=' + $scope.fileName + checkSelected, 'POST', '', "arraybuffer", $scope.selectedItems, function (response) {
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
                        const blob = new Blob([response.data], {type: "'" + response.headers(["content-type"]) + "'"});
                        FileSaver.saveAs(blob, 'report-' + new Date().toLocaleDateString() + '.' + suffix);
                        $scope.loadingMultiPrint = false;
                        $scope.loadingPrint = false;
                        $('#PrintModal').modal('hide');
                    }
                    global.messaging(response);
                });

            } else {
                Toast.fire({
                    icon: 'error',
                    title: 'موردی جهت چاب از جدول انتخاب نشده است'
                });
            }

        }
        if ($scope.typeState == "single") {
            RequestApis.HR('assessments/report/' + $scope.singleItems.Id + '/' + radioSelected + '?q=' + $scope.fileName + checkSelected, 'GET', '', "arraybuffer", '', function (response) {
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
                    const blob = new Blob([response.data], {type: "'" + response.headers(["content-type"]) + "'"});
                    FileSaver.saveAs(blob, 'report-' + new Date().toLocaleDateString() + '.' + suffix);
                    $scope.loadingPrint = false;
                    $scope.loadingMultiPrint = false;
                    $('#PrintModal').modal('hide');
                }
            });
        }
    };
    $scope.ShowGridExcle = function (items) {
        $scope.loadingGridExcel = true;
        var xlsHeader = [];
        var headers = [{latinName: "FormId", PersianName: "شماره فرم"}, {
            latinName: "FirstName",
            PersianName: "نام ارزشیابی شونده"
        }, {latinName: "LastName", PersianName: "نام خانوادگی ارزشیابی شونده"}, {
            latinName: "MainState",
            PersianName: "وضعیت"
        }, {latinName: "TotalCalculatedScoreValue", PersianName: "امتیاز"}];
        for (let i = 0; i < headers.length; i++) {
            xlsHeader.push(headers[i].PersianName);
        }
        var createXLSLFormatObj = [];
        createXLSLFormatObj.push(xlsHeader);
        /* XLS body Columns */
        var bodyItems = document.createElement('tbody');
        for (let i = 0; i < items.length; i++) {
            const element = [];
            let tr = document.createElement('tr');
            for (let j = 0; j < headers.length; j++) {
                element[j] = document.createElement('td');
                element[j].appendChild(document.createTextNode(`${items[i][headers[j].latinName]}`));
                tr.appendChild(element[j]);
            }
            bodyItems.appendChild(tr);
        }

        for (let i = 0; i < bodyItems.children.length; i++) {
            var xlsBody = [];
            for (let j = 0; j < bodyItems.children[i].children.length; j++) {
                if (bodyItems.children[i].children[j].innerHTML.trim() != "undefined" && bodyItems.children[i].children[j].innerHTML.trim() != "null") {
                    xlsBody.push(bodyItems.children[i].children[j].innerHTML.trim());
                } else {
                    xlsBody.push("-");
                }
            }
            createXLSLFormatObj.push(xlsBody);
        }
        /* File Name */
        var filename = `خروجی جدول ارزشیابی.xlsx`;
        //
        /* Sheet Name */
        var ws_name = "خروجی جدول ارزشیابی";
        var wb = XLSX.utils.book_new(),
            ws = XLSX.utils.aoa_to_sheet(createXLSLFormatObj);
        if (!wb.Workbook) wb.Workbook = {};
        if (!wb.Workbook.Views) wb.Workbook.Views = [{RTL: true}];
        XLSX.utils.book_append_sheet(wb, ws, ws_name);
        var wopts = {bookType: 'xlsx', bookSST: false, type: 'array'};
        var wbout = XLSX.write(wb, wopts);
        FileSaver.saveAs(new Blob([wbout], {type: "application/octet-stream"}), filename);
        $scope.loadingGridExcel = false;
    };
});
app.controller('OldAssessmentCtrl', function ($scope, $templateCache, $state, RequestApis, global) {
    $templateCache.remove($state.current.templateUrl);
    $scope.availableForms = [];
    $scope.selectedListItems = [];
    $scope.readOnlyState = true;
    this.$onInit = function () {
        $scope.setTrue = true;
        $scope.getShenasname();
    };
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
    //============================== check exist or not ====================================
    let checkExist = function (item) {
        if (item != undefined && item.toString().length) {
            return true;
        } else {
            return false;
        }
    };
    ////============================ search and selecting personnel ========================
    $scope.personnelData = {
        data: [],
        dataIdsObj: {},
    };
    $scope.useSelectedPersonnel = function (data = $scope.personnelData.data) {
        $scope.selectedListItems = [];
        $scope.personnelInfo = data;
        $scope.filterPersonelItem = $scope.personnelInfo;
        $scope.getShenasname();
    };
    //=============== input masks ====================
    $scope.inputMasks = function () {
        $(".precent").inputmask('integer', {min: 0, max: 100});
        $(".year").inputmask('integer', {min: 1300, max: 1500});
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
        $('.precentF').change(function () {
            angular.element($(this)).triggerHandler('input');
        });
        $('.precent').change(function () {
            angular.element($(this)).triggerHandler('input');
        });
        $('.year').change(function () {
            angular.element($(this)).triggerHandler('input');
        });
    };
    //==================================== table data ===========================================
    $scope.filterYear = function (item) {
        if (!isNaN(item)) {
            if (item.toString().length === 4) {
                $scope.filterYearItem = Number(item);
            } else {
                $scope.filterYearItem = undefined;
            }
            $scope.getShenasname();
        } else {
            $scope.filterYearModel = '';
        }

    };
    $scope.filterFunct = function () {
        let filters = '';
        if ($scope.filterYearItem != undefined && !isNaN($scope.filterYearItem)) {
            filters += `?prdpy=${$scope.filterYearItem}`;
        }
        if ($scope.filterPersonelItem != undefined && $scope.filterPersonelItem.length) {
            Object.values($scope.filterPersonelItem).forEach(person => {
                if (filters.includes('?')) {
                    filters += `&ids=${person.Id}`;
                } else {
                    filters += `?ids=${person.Id}`;
                }
            });
        }
        return filters;
    };
    $scope.getShenasname = function () {
        $scope.loading = true;
        RequestApis.HR(`old/assessments${$scope.filterFunct()}`, 'Get', '', '', '', function (response) {
            $scope.Shenasname = response.data;
            $scope.loading = false;
        });
    };
    $scope.loadSPage = function (page) {
        if ($scope.Shenasname.TotalPages > $scope.Shenasname.PageIndex && page > 0 && $scope.Shenasname.TotalPages >= page) {
            $scope.pageNum = page;
        }
    };
    $scope.changePriod = function (item) {
        $scope.priod = item;
    };
    $scope.ShowShenasnameModal = function (item) {
        $scope.edit = item;
        $scope.personelId = item.Personnel.Id;
        $scope.findFormItem(item.PeriodPersianYear);
        $scope.editOrNot = false;
        $scope.notFillRetailItemState = false;
        $scope.notFillSumItemState = false;
        $('#ShenasnameModal').modal();
    };
    $scope.removeShenasnameModal = function (item) {
        let itemToDelete = {
            "Id": item.Id,
            "RowVersion": item.RowVersion
        };
        Swal.fire({
            icon: 'warning',
            title: 'آیا برای حذف این مورد اطمینان داری؟',
            customClass: {
                title: 'medium-font',
                confirmButton: 'small-font',
                cancelButton: 'small-font',
            },
            cancelButtonText: 'انصراف',
            confirmButtonText: 'تأیید',
            showCancelButton: true,
        }).then((result) => {
            if (result.isConfirmed) {
                RequestApis.HR(`old/assessments`, 'Delete', '', '', itemToDelete, function (response) {
                    if (response.status === 204) {
                        $scope.getShenasname();
                    }
                    global.messaging(response);
                });
            } else {
                $scope.getShenasname();
            }

        });
    };
    $scope.closeShenasnameModal = function () {
        $scope.edit = {};
        $scope.readOnlyState = true;
        $scope.notFillSumItemState = true;
        $scope.notFillRetailItemState = true;
        $scope.getShenasname();
        $('#ShenasnameModal').modal('hide');
    };
    $scope.CreateShenasnameModal = function () {
        if ($scope.personnelInfo.length > 1) {
            global.Toast('error', 'تعداد پرسنل انتخابی از یک بیشتر است و امکان وارد کردن امتیاز برای چند پرسنل بصورت همزمان وجود ندارد');
        } else {
            $scope.create = {};
            $scope.personelId = $scope.personnelInfo[0].Id;
            $('#CreateShenasnameModal').modal();
        }
    };
    $scope.CancelShenasname = function () {
        $scope.create = {};
        $scope.readOnlyState = true;
        $scope.notFillSumItemState = true;
        $scope.notFillRetailItemState = true;
        $scope.getShenasname();
        $('#CreateShenasnameModal').modal('hide');
    };
    $scope.findFormItem = function (item) {
        if (item.toString().length === 4) {
            RequestApis.HR(`old/assessments/available/form?psn=${$scope.personelId}&pyr=${Number(item)}`, 'Get', '', '', '', function (response) {
                $scope.availableForms = response.data;
            });
        }
    };
    //===================================== create shenasname ============================
    $scope.checkParameters = function (item) {
        let result = "";
        if (checkExist(item.Id)) {
            if (result.length) {
                result += `&id=${item.Id}`;
            } else {
                result += `?id=${item.Id}`;
            }
        }
        if (checkExist($scope.personelId)) {
            if (result.length) {
                result += `&personnelId=${$scope.personelId}`;
            } else {
                result += `?personnelId=${$scope.personelId}`;
            }
        }
        if (checkExist(item.PeriodId)) {
            if (result.length) {
                result += `&periodId=${item.PeriodId}`;
            } else {
                result += `?periodId=${item.PeriodId}`;
            }

        }
        if (checkExist(item.PeriodPersianYear)) {
            if (result.length) {
                result += `&periodPersianYear=${item.PeriodPersianYear}`;
            } else {
                result += `?periodPersianYear=${item.PeriodPersianYear}`;
            }

        }
        if (checkExist(item.FormId)) {
            if (result.length) {
                result += `&formId=${item.FormId}`;
            } else {
                result += `?formId=${item.FormId}`;
            }

        }
        if (checkExist(item.FormScoreValue)) {
            if (result.length) {
                result += `&formScoreValue=${item.FormScoreValue}`;
            } else {
                result += `?formScoreValue=${item.FormScoreValue}`;
            }

        }
        if (checkExist(item.TotalScoreValue)) {
            if (result.length) {
                result += `&totalScoreValue=${item.TotalScoreValue}`;
            } else {
                result += `?totalScoreValue=${item.TotalScoreValue}`;
            }

        }
        if (checkExist(item.Exclusive)) {
            if (result.length) {
                result += `&exclusive=${item.Exclusive}`;
            } else {
                result += `?exclusive=${item.Exclusive}`;
            }

        }
        if (checkExist(item.Management)) {
            if (result.length) {
                result += `&management=${item.Management}`;
            } else {
                result += `?management=${item.Management}`;
            }

        }
        if (checkExist(item.Support)) {
            if (result.length) {
                result += `&support=${item.Support}`;
            } else {
                result += `?support=${item.Support}`;
            }

        }
        if (checkExist(item.Develop)) {
            if (result.length) {
                result += `&develop=${item.Develop}`;
            } else {
                result += `?develop=${item.Develop}`;
            }

        }
        if (checkExist(item.Encouragement)) {
            if (result.length) {
                result += `&encouragement=${item.Encouragement}`;
            } else {
                result += `?encouragement=${item.Encouragement}`;
            }

        }
        if (checkExist(item.Behavior)) {
            if (result.length) {
                result += `&behavior=${item.Behavior}`;
            } else {
                result += `?behavior=${item.Behavior}`;
            }

        }
        return result;
    };
    $scope.ConfirmShenasname = function (item) {
        if (checkExist($scope.personelId)) {
            item.personnelId = $scope.personelId;
        }
        if (!checkExist(item.FormId)) {
            delete item.FormId;
        }
        let canQuery = $scope.checkParameters(item);
        RequestApis.HR(`old/assessments/can${canQuery}`, 'Get', '', '', '', function (response) {
            if (response.status === 200) {
                RequestApis.HR(`old/assessments`, 'Post', '', '', item, function (response) {
                    global.messaging(response);
                });
            } else {
                global.Toast('error', 'امکان ایجاد این نوع فرم با این مقادیر ورودی را ندارید');
            }
            $scope.CancelShenasname();
        });
    };

    //===================================== update shenasname ============================
    $scope.ConfirmUpdateShenasname = function (item) {
        /*item.Id = $scope.edit.Id;*/
        let canQuery = $scope.checkParameters(item);
        RequestApis.HR(`old/assessments/can${canQuery}`, 'Get', '', '', '', function (response) {
            if (response.status === 200) {
                RequestApis.HR(`old/assessments`, 'Post', '', '', item, function (response) {
                    global.messaging(response);
                });
            } else {
                global.Toast('error', 'امکان ایجاد این نوع فرم با این مقادیر ورودی را ندارید');
            }
            $scope.closeShenasnameModal();
        });
    };
    $scope.editRow = function () {
        $scope.editOrNot = !$scope.editOrNot;
    };
    $scope.confirmExistRecord = function (item) {
        $scope.editOrNot = false;
        //if (checkExist(item.FormId)) {
        //    delete item.FormId;
        //}
        //if (!checkExist(item.FormScoreValue)) {
        //    delete item.FormScoreValue;
        //}
        //if (checkExist($scope.edit.TotalScoreValue) && (checkExist(item.FormScoreValue) || checkExist(item.Values))) {
        //    delete item.TotalScoreValue;
        //}
        //if (checkExist(item.TotalScoreValue) && (checkExist($scope.edit.FormScoreValue) || checkExist($scope.edit.Values))) {
        //    delete item.FormScoreValue;
        //    delete item.Values;
        //}
    };
    $scope.editMode = function (item) {
        return checkExist(item);
    };
    //===================================== permissions for inputs ============================
    $scope.checkReadOnly = function (ite) {
        if (checkExist(ite)) {
            $scope.readOnlyState = false;
        } else {
            $scope.readOnlyState = true;
        }
    };
    $scope.checkReadOnlyE = function (ite) {
        if (checkExist(ite)) {
            $scope.readOnlyState = false;
        } else {
            $scope.readOnlyState = true;
        }
    };
    $scope.notFillRetailItem = function (ite) {
        $scope.notFillRetailItemState = false;
        if (checkExist(ite)) {
            $scope.notFillRetailItemState = true;
        }
    };
    $scope.notFillSumItem = function (ite) {
        $scope.notFillSumItemState = false;
        if (checkExist(ite)) {
            $scope.notFillSumItemState = true;
        }
    };
    $scope.disableCheck = function (ite) {
        let result = false;
        if (checkExist(ite) && checkExist(ite.PeriodPersianYear)) {
            if (checkExist(ite.TotalScoreValue) || checkExist(ite.FormScoreValue) || checkExist(ite.Exclusive) || checkExist(ite.Management) || checkExist(ite.Support) || checkExist(ite.Exclusive) || checkExist(ite.Develop) || checkExist(ite.Encouragement) || checkExist(ite.Behavior)) {
                result = true;
            }
        }
        return result;
    };
    $scope.disableCheckEdit = function (ite) {
        let result = false;
        if (checkExist(ite) && checkExist(ite.PeriodPersianYear)) {
            if (checkExist(ite.Values)) {
                if (checkExist(ite.Values.Exclusive.SumScoreValue) || checkExist(ite.Values.Management.SumScoreValue) || checkExist(ite.Values.Support.SumScoreValue) || checkExist(ite.Values.Exclusive.SumScoreValue) || checkExist(ite.Values.Develop.SumScoreValue) || checkExist(ite.Values.Encouragement.SumScoreValue) || checkExist(ite.Values.Behavior.SumScoreValue)) {
                    result = true;
                }

            } else if (checkExist(ite.FormScoreValue)) {
                result = true;
            } else if (checkExist(ite.TotalScoreValue)) {
                result = true;
            }

        }
        return result;
    };

    //================================== selecting record ===========================
    $scope.setAlls = function (event, items) {
        if (event.target.checked) {
            Object.values(items).forEach(item => {
                if (!$scope.selectedListItems.some(x => x.Id === item.Id)) {
                    $scope.selectedListItems.push(item);
                    if (!$scope.personnelInfo.some(x => x.Id === item.Personnel.Id)) {
                        $scope.personnelInfo.push(item.Personnel);
                    }
                }
            });
        } else {
            Object.values(items).forEach(item => {
                $scope.selectedListItems = $scope.selectedListItems.filter(x => x.Id != item.Id);
                if (!$scope.selectedListItems.some(x => x.Personnel.Id === item.Personnel.Id)) {
                    $scope.personnelInfo = $scope.personnelInfo.filter(x => x.Id != item.Personnel.Id);
                }
            });
        }

    };
    $scope.addItemToSelectList = function (item) {
        let input = document.getElementById(`${item.Id}`);
        if (input.checked) {
            if (!$scope.selectedListItems.some(x => x.Id === item.Id)) {
                $scope.selectedListItems.push(item);
                if (!$scope.personnelInfo.some(x => x.Id === item.Personnel.Id)) {
                    $scope.personnelInfo.push(item.Personnel);
                }
            }
        } else {
            $scope.selectedListItems = $scope.selectedListItems.filter(x => x.Id != item.Id);
            if (!$scope.selectedListItems.some(x => x.Personnel.Id === item.Personnel.Id)) {
                $scope.personnelInfo = $scope.personnelInfo.filter(x => x.Id != item.Personnel.Id);
            }
        }
    };
    $scope.checkState = function (item) {
        let result = false;
        if ($scope.selectedListItems.some(x => x.Id === item.Id)) {
            result = true;
        }
        return result;
    };

    //========================= Print Section =============================
    $scope.singlePrint = function (item) {
        //item.loadingPrint = true;
        //RequestApis.HR(`assessments/period/${item.periodId}/personnel/${item.Personnel.Id}/identitycard/report/pdf`, 'GET', '', "arraybuffer",', function (response) {
        //    if (response.status === 200) {
        //        const blob = new Blob([response.data], { type: "'" + response.headers(["content-type"]) + "'" });
        //        FileSaver.saveAs(blob, 'report-' + new Date().toLocaleDateString() + '.pdf')
        //        item.loadingPrint = false;
        //    } else {
        //        Toast.fire({
        //            icon: 'error',
        //            title: 'خطا در دریافت پرینت گزارش'
        //        })
        //    }
        //})
    };
    $scope.multiPrint = function (item) {
        //item.loadingMultiPrint = true;
        //let ids = "";
        //Object.values($scope.personnelInfo).forEach(x => {
        //    if (checkExist(ids)) {
        //        ids += `&ids=${x.Id}`
        //    } else {
        //        ids += `?ids=${x.Id}`
        //    }
        //})
        //RequestApis.HR(`assessments/period/${item.periodId}/identitycard/report/pdf${ids}`, 'GET', '', "arraybuffer",'', function (response) {
        //    if (response.status === 200) {
        //        const blob = new Blob([response.data], { type: "'" + response.headers(["content-type"]) + "'" });
        //        FileSaver.saveAs(blob, 'report-' + new Date().toLocaleDateString() + '.pdf')
        //        item.loadingPrint = false;
        //    } else {
        //        Toast.fire({
        //            icon: 'error',
        //            title: 'خطا در دریافت پرینت گزارش'
        //        })
        //    }
        //})
    };

    //$scope.removeNewRecord = function (removeItem) {
    //    document.getElementById(`${removeItem}`).remove();
    //}
    //$scope.addNewRecord = function () {
    //    let existItemLength = document.getElementById('addNewItem').childNodes.length;
    //    //this is is for using in td in buttom appending
    //    //< td >
    //    //<div class="d-inline-flex mt-c1">
    //    //    <div class="pr-1 pl-1">
    //    //        <input type="text" id="headquarters-${existItemLength}" class="form-control numeric text-center" />
    //    //    </div>
    //    //    <div class="pr-1 pl-1">
    //    //        <input type="text" id="State-${existItemLength}" class="form-control numeric text-center" />
    //    //    </div>
    //    //    <div class="pr-1 pl-1">
    //    //        <input type="text" id="city-${existItemLength}" class="form-control numeric text-center" />
    //    //    </div>
    //    //</div>
    //    //</td >
    //    //<td>
    //    //< input type = "text" id = "decision-${existItemLength}" class="form-control text-center" />
    //    //</td >
    //    //<td><input type="text" id="managmentScore-${existItemLength}" class="form-control numeric text-center"/></td>
    //    let newItem = $compile(`
    //                            <tr id="${existItemLength}">
    //                                <td><input type="text" id="year-${existItemLength}" class="form-control numeric text-center"/></td>

    //                                <td>
    //                                    <div class="d-inline-flex col-12 mt-c">
    //                                        <div class="pr-1 pl-1 w-25 pt-1">
    //                                            <input type="text" id="exclosiveScore-${existItemLength}" class="form-control numeric text-center"/>
    //                                        </div>
    //                                        <div class="pr-1 pl-1 w-25 pt-1">
    //                                            <input type="text" id="publicManagementScore-${existItemLength}" class="form-control numeric text-center"/>
    //                                        </div>
    //                                        <div class="pr-1 pl-1 w-25 pt-1">
    //                                            <input type="text" id="publicSupportScore-${existItemLength}" class="form-control numeric text-center"/>
    //                                        </div>
    //                                        <div class="pr-1 pl-1 w-50">
    //                                            <div class="d-inline-flex col-12">
    //                                                <div class="pr-1 pl-1">
    //                                                    <input type="text" id="publicDevelopScore-${existItemLength}" class="form-control numeric text-center"/>
    //                                                </div>
    //                                                <div class="pr-1 pl-1">
    //                                                     <input type="text" id="publicEncourageScore-${existItemLength}" class="form-control numeric text-center"/>
    //                                                </div>
    //                                                <div class="pr-1 pl-1">
    //                                                   <input type="text" id="publicBehaviorScore-${existItemLength}" class="form-control numeric text-center"/>
    //                                                </div>
    //                                            </div>
    //                                        </div>
    //                                    </div>
    //                                </td>
    //                                <td><input type="text" id="sumScore-${existItemLength}" class="form-control numeric text-center"/></td>

    //                                <td><input type="text" id="AllSumScore-${existItemLength}" class="form-control numeric text-center"/></td>

    //                                <td>
    //                                    <div class="d-flex m-1">
    //                                        <i class="far fa-check new-button ml-1 green" title="تایید آیتم" ng-click="confirmNewRecord()"></i>
    //                                        <i class="far fa-trash new-button green" title="حذف آیتم" ng-click="removeNewRecord(${existItemLength})"></i>
    //                                    </div>
    //                                </td>
    //                            </tr>
    //                            `)($scope);
    //    document.getElementById('addNewItem').insertBefore(newItem[0], document.getElementById('firstEl'))
    //}
});
app.directive('public', function ($timeout, RequestApis, global) {
        return {
            restrict: 'E',
            scope: {
                info: '=data',
                items: '=item',
                parent: '=parent'
            },
            template: `<div ng-repeat='data in info'>
                            <p ng-if='data.OrderTitle != null' class='medium-font' style='text-align:right;'>{{data.OrderTitle}} ) {{data.Title}} <strong ng-if='data.Comment != undefined && data.Comment.length'> ({{data.Comment}}) </strong></p>
                            <public ng-if='data.CategoryLabel == null' item='items' parent='parent' data='data.Children'></public>
                            <div ng-if='data.OrderTitle != null && data.Children[0].CategoryLabel != null && data.Children[0].Children[0].Fields[0].Title != undefined' class='card' >
                                <div class='card-body'>
                                    <table class='defaultTableStyle'>
                                        <thead>
                                            <tr>
                                                <th style='width:10%'></th>
                                                <th style='width:20%'>معیار</th>
                                                <th style='width:40%'>شاخص</th>
                                                <th style='width:10%'>حداکثر امتیاز</th>
                                                 <th style='width:10%'>امتیاز مکتسبه</th>
                                                 <th style='width:5%'>#</th>
                                            </tr>
                                        </thead>
                                        <tbody ng-repeat='item in data.Children'>
                                            <tr class='big-font'>
                                                <td style='padding-right:10px' rowspan='{{item.Children.length}}'>{{item.Title}}
                                                 <strong ng-if='item.Comment.length'>({{item.Comment}})</strong>
                                                </td>
                                                <td style='padding-right:5px'>{{item.Children[0].Title}}
                                                 <strong ng-if='item.Children[0].Comment.length'>({{item.Children[0].Comment}})</strong>
                                                </td>
                                                <td style='padding-right:5px'>
                                                    <div ng-repeat='subItem in item.Children[0].Fields' style="min-height:25px"> {{ subItem.Title }}
                                                        <strong ng-if='subItem.ShowComment'> ({{subItem.Comment}})</strong>
                                                    </div>    
                                                </td>
                                                <td ng-if='item.MaxValue != null' rowspan='{{item.Children.length}}' class='center'>{{item.MaxValue}}</td>
                                                <td ng-if='item.MaxValue == null' class='center'>{{item.Children[0].MaxValue}}
                                                    <div ng-repeat='title in item.Children[0].Fields' style="min-height:25px">
                                                        <span w-100" ng-if='title.MinValue != 0 && item.Children[0].MaxValue == null'>{{title.MinValue}}</span>
                                                        <span w-100" ng-if='title.MaxValue != 0 && item.Children[0].MaxValue == null'>{{title.MaxValue}}</span>
                                                    </div>
                                                </td>
                                                <td ng-if='item.MaxValue != null'>
                                                    <div ng-repeat='fieldInput in item.Children[0].Values'>
                                       <input dir="ltr" ng-init="inputMasksX()" autocomplete="off" ng-readonly="!dynamicButtonAllow" ng-class="{'sumationInput':fieldInput.Field.IsScore}" autocomplete="off" ng-keyup='checkmaxMin(item,item.Children[0].Fields[$index])' ng-model='fieldInput.ScoreValue' id='test-{{fieldInput.Field.Id}}' data='{{fieldInput}}'  class='form-control directive-input small-font text-center numericX' type='text'>
                                                    </div>
                                                </td>
                                                <td ng-if='item.MaxValue == null'>
                                                    <div ng-repeat='fieldInput in item.Children[0].Values'>
                                                        <input dir="ltr" ng-init="inputMasksX()" ng-readonly="!dynamicButtonAllow" ng-class="{'sumationInput':fieldInput.Field.IsScore}"  autocomplete="off" ng-keyup='checkmaxMin(item,item.Children[0].Fields[$index]);sumationPublic()' ng-model='fieldInput.ScoreValue' id='test-{{fieldInput.Field.Id}}' data='{{fieldInput}}' class='form-control numericX small-font text-center directive-input' type='text'>
                                                    </div>
                                                </td>
                                                <td class='text-center'>
                                                    <div class='text-center' ng-repeat='UploadFiles in item.Children[0].Fields'>
                                                        <div ng-if='UploadFiles.HasAttachment && dynamicButtonAllow'>
                                                             <span class="pointer" style="font-size:15px;" ng-class="item.Children[0].Values[$index].Id ===null ?'text-danger':'text-primary'" ng-attr-title="{{item.Children[0].Values[$index].Id !=null?'فایل های ضمیمه':'برای مدیریت فایل های ضمیمه، ابتدا نیاز است امتیازی برای این ایتم ثبت گردد'}}" ng-click="item.Children[0].Values[$index].Id !=null && showAttachmentsModal(item.Children[0].Values[$index])"><i class="far fa-paperclip "></i></span>
                                                        </div>
                                                    </div>
                                                 </td>
                                            </tr>
                                            <tr ng-repeat='row in item.Children' ng-if='!$first' class='big-font'>
                                                <td style='padding-right:5px'>{{row.Title}}
                                                    <strong ng-if='row.Comment.length'>({{row.Comment}})</strong>
                                                </td>
                                                <td style='padding-right:5px'>
                                                    <div ng-repeat='subRow in row.Fields' style="height:40px">
                                                        {{subRow.Title}}
                                                       <strong ng-if='subRow.ShowComment'>({{subRow.Comment}})</strong>
                                                    </div>
                                                </td>
                                                <td class='center' ng-if='item.MaxValue == null'>{{row.MaxValue}}
                                                    <div class="p-0" style="height:40px" ng-if='row.MaxValue == null' ng-repeat='score in row.Fields'>
                                                        <span ng-if='score.TypeIdentity!=14 && score.MaxValue !== 0' dir='ltr'>{{score.MaxValue}}</span>
                                                        <span ng-if='score.TypeIdentity!=14 && score.MinValue !== 0' dir='ltr'>{{score.MinValue}}</span>
                                                        <div class="small-font border-0 col-12 p-0" ng-if='score.TypeIdentity==14 && score.MaxValue !== 0'>رضایت = <strong dir='ltr'>{{score.MaxValue}}</strong></div>
                                                        <div class="small-font border-0 col-12 p-0" ng-if='score.TypeIdentity==14 && score.MinValue !== 0'>عدم رضایت = <strong dir='ltr'>{{score.MinValue}}</strong></div>
                                                     </div>
                                                </td>
                                                <td>
                                                    <div ng-repeat='fieldInput in row.Values' style="height:40px">
                                                        <input dir="ltr" ng-init="inputMasksX()" ng-readonly="!dynamicButtonAllow" ng-class="{'sumationInput':fieldInput.Field.IsScore}" autocomplete="off"  ng-keyup='checkmaxMin(item,fieldInput.Field);sumationPublic()' class='form-control  text-center small-font  directive-input numericX' id='test-{{fieldInput.Field.Id}}' data='{{fieldInput}}' ng-model='fieldInput.ScoreValue'  type='text'>
                                                    </div>
                                                </td>
                                                <td class='text-center'>
                                                    <div ng-repeat='fieldInput in row.Values' style="height:40px">
                                                        <div ng-if='fieldInput.Field.HasAttachment && dynamicButtonAllow'>
                                                               <span class="pointer" style="font-size:15px" ng-class="row.Values[$index].Id ===null?'text-danger':'text-primary'" ng-attr-title="{{row.Values[$index].Id !=null?'فایل های ضمیمه':'برای مدیریت فایل های ضمیمه، ابتدا نیاز است امتیازی برای این ایتم ثبت گردد'}}" ng-click="row.Values[$index].Id !=null && showAttachmentsModal(row.Values[$index])"><i class="far fa-paperclip "></i></span>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div ng-if='data.OrderTitle != null && data.Children[0].Fields[0].Title != undefined' class='card'>
                                <div class='card-body'>
                                    <table class='defaultTableStyle'>
                                        <thead>
                                            <tr>
                                                <th style='width:20%'>معیار</th>
                                                <th style='width:40%'>شاخص</th>
                                                <th style='width:10%'>حداکثر امتیاز</th>
                                                <th ng-if='data.Children[0].MaxValue != null' style='width:10%'>حداکثر امتیاز</th>
                                                <th style='width:10%'>امتیاز مکتسبه</th>
                                                <th style='width:5%'>#</th>
                                            </tr>
                                        </thead>
                                        <tbody ng-repeat='item in data.Children'>
                                            <tr class='big-font'>
                                                <td style='padding-right:5px' rowspan='{{item.Fields.length}}'>{{item.Title}}
                                                    <strong ng-if='item.Comment.length'>({{item.Comment}})</strong>
                                               </td>
                                                <td style='padding-right:5px'>{{item.Fields[0].Title}}
                                                    <strong ng-if='item.Fields[0].ShowComment'>({{item.Fields[0].Comment}})</strong>
                                                </td>
                                                <td class='center'>
                                                    <span dir='ltr'> {{item.Fields[0].MaxValue}}</span>
                                                    <span ng-if="item.Fields[0].MinValue !== 0">حداقل = <span dir='ltr'> {{item.Fields[0].MinValue}}</span></span>
                                                </td>
                                                <td style='padding-right:5px' ng-if='item.MaxValue != null' rowspan='{{item.Fields.length}}'>
                                                    <span  class='text-danger'>حداکثر امتیاز = {{item.MaxValue}}</span>
                                                </td>
                                                <td>
                                                    <div class="pt-1 pb-1">
                                                         <input dir="ltr" ng-init="inputMasksX()" ng-readonly="!dynamicButtonAllow" ng-class="{'sumationInput':item.Values[0].Field.IsScore}" autocomplete="off" ng-keyup='checkmaxMin(data,item.Values[0].Field);sumationPublic()' ng-model='item.Values[0].ScoreValue' id='test-{{item.Values[0].Field.Id}}' data='{{item.Values[0]}}'  class='form-control numericX small-font text-center directive-input' type='text'>
                                                    </div>
                                                </td>
                                                  <td class='text-center'>
                                                        <div class="pt-1 pb-1" ng-if='item.Fields[0].HasAttachment && dynamicButtonAllow'>
                                                             <span class="pointer" ng-class="item.Values[0].Id ===null?'text-danger':'text-primary'" style="font-size:15px;" ng-attr-title="{{item.Values[0].Id !=null?'فایل های ضمیمه':'برای مدیریت فایل های ضمیمه، ابتدا نیاز است امتیازی برای این ایتم ثبت گردد'}}" ng-click="item.Values[0].Id !=null && showAttachmentsModal(item.Values[0])"><i class="far fa-paperclip "></i></span>
                                                        </div>
                                                 </td>
                                            </tr>
                                            <tr ng-repeat='row in item.Values' ng-if='!$first' class='big-font'>
                                                <td style='padding-right:5px'>{{row.Field.Title}}
                                                    <strong ng-if='row.Field.Comment.length'>({{row.Field.Comment}})</strong>
                                                </td>
                                                <td class='center'>
                                                     <span dir='ltr'>{{row.Field.MaxValue}}</span>
                                                     <span ng-if="item.Fields[0].MinValue !== 0">حداقل = <span dir='ltr'>{{row.Field.MinValue}}</span></span>
                                                </td>
                                                <td>
                                                    <div class="pt-1 pb-1">
                                                        <input dir="ltr" ng-init="inputMasksX()" ng-readonly="!dynamicButtonAllow" ng-class="{'sumationInput':row.Field.IsScore}" autocomplete="off" data="{{row}}" class='form-control text-center small-font numericX directive-input' ng-keyup='checkmaxMin(data,row.Field);sumationPublic()' id='test-{{row.Field.Id}}' ng-model='row.ScoreValue'  type='text'>
                                                    </div>
                                                </td>
                                                <td class='text-center'>
                                                   <div ng-if='row.Field.HasAttachment && dynamicButtonAllow'>
                                                         <span class="pointer" ng-class="row.Id ===null?'text-danger':'text-primary'" style="font-size:15px;" ng-attr-title="{{row.Id !=null?'فایل های ضمیمه':'برای مدیریت فایل های ضمیمه، ابتدا نیاز است امتیازی برای این ایتم ثبت گردد'}}" ng-click="row.Id !=null && showAttachmentsModal(row)"><i class="far fa-paperclip "></i></span>
                                                   </div>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                        <div ng-if="attachmentsModals" id="attachmentsModal" class="showAttachments">
                            <div class="card div">
                                <p class="HeaderForm">
                                    مدیریت فایل ضمیمه برای :  <strong class="text-dark small-font">{{showAttachInfo.Field.CategoryTitle}} - {{showAttachInfo.Field.Title}}</strong>
                                </p>
                                <div class="card">
                                    <ul class="list-unstyled">
                                        <li ng-repeat="item in attachmentItems track by $index" class="medium-font p-0 m-0 pointer">
                                            <a href="#" title="دانلود فایل" ng-click="downloadAttachment(item)" dir="ltr">{{$index+1}} - {{item.Name}} </a>
                                            <span class="float-right" title="حذف فایل" ng-click="removeAttachments(item)"><i class="far fa-trash text-danger medium-font"></i></span>
                                            <div class="border border-info mb-1 col-12 "></div>
                                        </li>
                                    </ul>
                                </div>
                                <div class="col">
                                    <div class="float-left mr-1">
                                        <input file-Model='files' type='file' name='files[]' accept='.xls,.xlsx,.pdf,.png,.jpg' onchange="angular.element(this).scope().uploadFile(this)" multiple='multiple' id="attach" class='inputfile  hidden' title='آپلود فایل' />
                                        <label class="new-button bg-primary pl-3 pr-3" for='attach'>
                                            <i class='far fa-plus'></i>
                                            افزودن
                                        </label>
                                    </div>
                                    <div class="float-left">
                                        <button type="button" class="new-button bg-danger float-left" ng-click="returnModalAttachment()">
                                            <i class='far fa-undo'></i>
                                            بازگشت
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>`,
            link: function (scope, element, attrs) {
                //=============== toast notification ======================
                scope.dynamicButtonAllow = localStorage.getItem("dynamicButtonAllow") != "false";
                scope.inputMasksX = function () {
                    //$(".numericx").inputmask({
                    //    alias: 'numeric',
                    //    digits: 2,
                    //});
                    $('.numericx').change(function () {
                        angular.element($(this)).triggerHandler('input');
                    });
                };
                scope.checkmaxMin = function (parent, item) {
                    let value = document.getElementById(`test-${item.Id}`).value;
                    let sum = 0;
                    let maxValue = -1000;
                    let minValue = -1000;
                    let maxValueItem = -1000;
                    let minValueItem = -1000;
                    if (parent.MaxValue != null && parent.MinValue != null) {
                        maxValue = parent.MaxValue;
                        minValue = parent.MinValue;
                        Object.values(parent.Children).forEach(firstChild => {
                            if (firstChild.MaxValue != null && firstChild.MinValue != null && item.CategoryId === firstChild.Id) {
                                maxValue = firstChild.MaxValue;
                                minValue = firstChild.MinValue;
                                Object.values(firstChild.Fields).forEach(secondChild => {
                                    if (!isNaN(document.getElementById(`test-${secondChild.Id}`).value)) {
                                        sum += Number(document.getElementById(`test-${secondChild.Id}`).value);
                                    }
                                    if (secondChild.MaxValue != null && secondChild.MinValue != null && item.CategoryId === firstChild.Id && item.Id === secondChild.Id) {
                                        maxValueItem = secondChild.MaxValue;
                                        minValueItem = secondChild.MinValue;
                                    }
                                });
                            } else {
                                Object.values(firstChild.Fields).forEach(secondChild => {
                                    if (!isNaN(document.getElementById(`test-${secondChild.Id}`).value)) {
                                        sum += Number(document.getElementById(`test-${secondChild.Id}`).value);
                                    }
                                    if (secondChild.MaxValue != null && secondChild.MinValue != null && item.CategoryId === firstChild.Id && item.Id === secondChild.Id) {
                                        maxValueItem = secondChild.MaxValue;
                                        minValueItem = secondChild.MinValue;
                                    }
                                });
                            }
                        });
                    } else {
                        Object.values(parent.Children).forEach(firstChild => {
                            if (firstChild.MaxValue != null && firstChild.MinValue != null && item.CategoryId === firstChild.Id) {
                                maxValue = firstChild.MaxValue;
                                minValue = firstChild.MinValue;
                                Object.values(firstChild.Fields).forEach(secondChild => {
                                    if (!isNaN(document.getElementById(`test-${secondChild.Id}`).value)) {
                                        sum += Number(document.getElementById(`test-${secondChild.Id}`).value);
                                    }
                                    if (secondChild.MaxValue != null && secondChild.MinValue != null && item.CategoryId === firstChild.Id && item.Id === secondChild.Id) {
                                        maxValueItem = secondChild.MaxValue;
                                        minValueItem = secondChild.MinValue;
                                    }
                                });
                            } else {
                                Object.values(firstChild.Fields).forEach(secondChild => {
                                    if (!isNaN(document.getElementById(`test-${secondChild.Id}`).value)) {
                                        sum += Number(document.getElementById(`test-${secondChild.Id}`).value);
                                    }
                                    if (secondChild.MaxValue != null && secondChild.MinValue != null && item.CategoryId === firstChild.Id && item.Id === secondChild.Id) {
                                        maxValueItem = secondChild.MaxValue;
                                        minValueItem = secondChild.MinValue;
                                    }
                                });
                            }
                        });
                    }
                    if (value.toString() != '-') {
                        if (maxValue != -1000 && minValue != -1000) {
                            if (maxValueItem != -1000 && minValueItem != -1000) {
                                if (maxValueItem != maxValue) {
                                    if (isNaN(value) || maxValueItem < value || minValueItem > value || maxValue < sum || minValue > sum) {
                                        document.getElementById(`test-${item.Id}`).value = '';
                                    }
                                } else {
                                    if (isNaN(value) || maxValueItem < value || minValueItem > value) {
                                        document.getElementById(`test-${item.Id}`).value = '';
                                    }
                                }
                            } else {
                                if ((maxValue < value || minValue > value || maxValue < sum || minValue > sum)) {
                                    document.getElementById(`test-${item.Id}`).value = '';
                                }
                            }

                        } else {
                            if (isNaN(value) || maxValueItem < Number(value) || minValueItem > Number(value)) {
                                document.getElementById(`test-${item.Id}`).value = '';
                            }
                        }
                    } else {
                        if (value.toString().length > 1 && value.toString().indexOf('-') != 0) {
                            document.getElementById(`test-${item.Id}`).value = Number(value.toString().substring(0, value.toString().length - 1));
                            value = Number(value.toString().substring(0, value.toString().length - 1));
                            if (maxValue != -1000 && minValue != -1000) {
                                if (maxValueItem != -1000 && minValueItem != -1000) {
                                    if (maxValueItem != maxValue) {
                                        if (isNaN(value) || maxValueItem < value || minValueItem > value || maxValue < sum || minValue > sum) {
                                            document.getElementById(`test-${item.Id}`).value = '';
                                        }
                                    } else {
                                        if (isNaN(value) || maxValueItem < value || minValueItem > value) {
                                            document.getElementById(`test-${item.Id}`).value = '';
                                        }
                                    }
                                } else {
                                    if ((maxValue < value || minValue > value || maxValue < sum || minValue > sum)) {
                                        document.getElementById(`test-${item.Id}`).value = '';
                                    }
                                }

                            } else {
                                if (isNaN(value) || maxValueItem < Number(value) || minValueItem > Number(value)) {
                                    document.getElementById(`test-${item.Id}`).value = '';
                                }
                            }
                        }

                    }

                };
                scope.returnModalAttachment = function () {
                    scope.showAttachInfo = {};
                    scope.attachmentsModals = false;
                };
                const getMimetype = (signature) => {
                    switch (signature.toUpperCase()) {
                        case '89504E47':
                            return 'image/png';
                        //case '47494638':
                        //  return 'image/gif'
                        case '25504446':
                            return 'application/pdf';
                        case 'FFD8FFDB':
                        case 'FFD8FFE0':
                        case 'FFD8FFE1':
                            return 'image/jpeg';
                        //case '504B0304':
                        //  return 'application/zip'
                        default:
                            return 'Unknown';
                    }
                };
                scope.uploadFile = function (thiss) {
                    const formData = new FormData();
                    if (thiss.files.length) {
                        for (let j = 0; j < thiss.files.length; j++) {
                            let blob = thiss.files[j]; // See step 1 above
                            let fileReader = new FileReader();
                            fileReader.onloadend = function (e) {
                                let arr = (new Uint8Array(e.target.result)).subarray(0, 4);
                                let header = "";
                                for (let i = 0; i < arr.length; i++) {
                                    header += arr[i].toString(16);
                                }
                                if (getMimetype(header) !== "Unknown") {
                                    formData.append(thiss.files[j].name.toString(), thiss.files[j]);
                                } else {
                                    global.Toast('error', 'مستندات بارگزاری باید فقط از نوع عکس و  پی دی اف باشد');
                                }
                            };
                            fileReader.readAsArrayBuffer(blob);
                        }
                        $timeout(function () {
                            RequestApis.HR(`assessments/${scope.showAttachInfo.FormEntryId}/values/${scope.showAttachInfo.Id}/attachments?psn=${scope.parent.PersonnelId}`, 'Post', 'multipart/form-data', '', formData, function (response) {
                                if (response.status === 200) {
                                    scope.showAttachmentsModal(scope.showAttachInfo);
                                }
                                global.messaging(response);
                            });
                        }, 1000)
                    }
                };

                scope.downloadAttachment = function (item) {
                    RequestApis.HR(`assessments/values/${scope.showAttachInfo.Id}/attachments/${item.StreamId}`, 'Get', '', 'arraybuffer', '', function (response) {
                        if (response.status == 200) {
                            var a = document.createElement("a");
                            var file = new Blob([response.data], {type: `application/${item.Name.split('.')[1]}`});
                            var fileURL = window.URL.createObjectURL(file);
                            a.href = fileURL;
                            a.download = item.Name;
                            a.click();
                        }
                    });
                };
                scope.removeAttachments = function (item) {
                    let itemToDelete = [
                        {
                            "Id": item.Id,
                            "RowVersion": item.RowVersion
                        }
                    ];
                    RequestApis.HR(`assessments/values/${scope.showAttachInfo.Id}/attachments`, 'Delete', '', '', itemToDelete, function (response) {
                        if (response.status === 204) {
                            scope.showAttachmentsModal(scope.showAttachInfo);
                        }
                        global.messaging(response);
                    });
                };
                scope.showAttachmentsModal = function (item) {
                    scope.showAttachInfo = item;
                    RequestApis.HR(`assessments/values/${item.Id}/attachments`, 'Get', '', '', '', function (response) {
                        if (response.status = 200) {
                            scope.attachmentItems = response.data;
                        }
                    });
                    scope.reload();
                };
                scope.reload = function () {
                    scope.attachmentsModals = false;
                    $timeout(function () {
                        scope.attachmentsModals = true;
                    }, 10);
                };
                scope.sumationPublic = function () {
                    $timeout(function () {
                        let result = 0;
                        let items = document.getElementById("publicSum").querySelectorAll(".sumationInput");
                        Object.values(items).forEach(item => {
                            result += Number(document.getElementById(`${item.id}`).value);
                        });
                        document.getElementById("public").innerHTML = result;
                    }, 1);

                };
            }
        };
    }
);
app.directive('fileModel', ['$parse', function ($parse) {
    var uploadDirective = {};
    uploadDirective.restrict = 'A';
    uploadDirective.link = function (scope, element, attrs) {
        element.bind('change', function () {
            $parse(attrs.fileModel).assign(scope, {data: element[0].files, id: element[0].id});
            scope.$apply();
        });
    };
    return uploadDirective;
}]);
app.controller('searchCtrl', function ($scope, $templateCache, $state, RequestApis) {
    $templateCache.remove($state.current.templateUrl);
    $scope.searching = function () {
        $scope.searchLoading = true;
        $scope.currentPath = "charts/group?search.cd=" + $scope.searchParam.cd + "&search.q=" + $scope.searchParam.q + "&search.uc=" + $scope.searchParam.uc;
        RequestApis.HR($scope.currentPath, 'Get', '', '', '', function (response) {
            $scope.searchLoading = false;
            if (response.data != 404) {
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
        RequestApis.HR($scope.currentPath + "&paging.pn=" + $scope.currentPage, 'Get', '', '', '', function (response) {
            $scope.searchLoading = false;
            if (response.data != 404) {
                $scope.searchResult = response.data;
            }
        });
    };
    $scope.loadPage = function (type) {
        if ($scope.searchResult.length != 0) {
            if (type == 'last') {
                $scope.currentPage = $scope.TotalPages;
                $scope.getTableData();
            } else if (type == 'first') {
                $scope.searching();
            } else if (type == 1) {
                if ($scope.currentPage < $scope.TotalPages) {
                    $scope.currentPage++;
                    $scope.getTableData();
                }
            } else {
                if ($scope.currentPage > 1) {
                    $scope.currentPage--;
                    $scope.getTableData();
                }
            }
        }
    };
    $scope.searchParam = {
        q: '',
        cd: '',
        uc: ''
    };
    $scope.setTree = function (result, node) {
        $scope.searchParam = {
            q: '',
            cd: '',
            uc: ''
        };
        $scope.loadTree(result.BreadCrumb, node);
    };
});
