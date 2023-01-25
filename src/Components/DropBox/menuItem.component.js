function menuItems($scope, $timeout) {
  let $ctrl = this;
  $scope.$watch('$ctrl.state', function () {
    if ($ctrl.state) {
      let position = document.getElementById(`${$ctrl.id}`);
      position.classList.add('dropdown');
      $timeout(function () {
        let itemPosition = document.getElementById(`menuItemDrop_${$ctrl.id}`).getBoundingClientRect();
        if (position.getBoundingClientRect().width < 100) {
          document.getElementById(`menuItemDrop_${$ctrl.id}`).style.width = "150px"
        } else {
          document.getElementById(`menuItemDrop_${$ctrl.id}`).style.width = `${position.getBoundingClientRect().width.toString()}px`
        }
        //document.getElementById(`menuItemDrop_${$ctrl.id}`).style.left = 0
        //document.getElementById(`menuItemDrop_${$ctrl.id}`).style.top = position.height + "px"
        if ((window.innerWidth - position.right) < itemPosition.width) {
          document.getElementById(`menuItemDrop_${$ctrl.id}`).style.right = 0// `${window.innerWidth - (position.getBoundingClientRect().right)}px`
        } else {
          document.getElementById(`menuItemDrop_${$ctrl.id}`).style.left = 0//`${position.getBoundingClientRect().left}px`
        }
        if ((window.innerHeight - (position.getBoundingClientRect().top + position.getBoundingClientRect().height)) < 170) {
          document.getElementById(`menuItemDrop_${$ctrl.id}`).style.top =0 // `${position.top - 160}px`
        } else {
          document.getElementById(`menuItemDrop_${$ctrl.id}`).style.top = `${position.getBoundingClientRect().height}px`
        }
        document.getElementById(`menuItemDrop_${$ctrl.id}`).classList.add('show');

      }, 1)
    } else {
      $timeout(function () {
        if (document.getElementById(`menuItemDrop_${$ctrl.id}`) !== null)
          document.getElementById(`menuItemDrop_${$ctrl.id}`).classList.remove('show');
      }, 1)
    }
  })
  $scope.mouseOver = function () {
    //$ctrl.state = true;
    //$scope.timeout = 150;
  }
  $scope.leaveMouse = function () {
    // $timeout(function () {
    //   $ctrl.state = false;
    // }, $scope.timeout !== undefined ? $scope.timeout : 150)
  }
}

function templateFunc() {
  return `<style>
.dropdown {
  width: 100%;
  position: relative;
  display: inline;
}

.dropdown-content {
  position: absolute;
  background-color: #f1f1f1;
  border-radius:5px;
  padding: 5px;
  overflow: auto;
  box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
  z-index: 99999;
  transition: all .2s ease-in-out;
  opacity: 0
}
.show {
  opacity :1
}

</style>
<div class="dropdown-content" ng-mouseleave="leaveMouse()" ng-mouseover="mouseOver()" id="menuItemDrop_{{$ctrl.id}}" ng-transclude>
</div>
`
}

app.component("cMenu", {
  transclude: true, bindings: {
    state: '=', id: '@'
  }, controller: menuItems, template: templateFunc()
})