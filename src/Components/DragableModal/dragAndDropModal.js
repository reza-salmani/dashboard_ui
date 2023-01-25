function dragAndDropModalFunction($scope) {
    this.$onInit = function () {
      $scope.$this = this;
        $scope.window = document.getElementById($scope.$this.id).querySelector(`#window`)
        $scope.parentNode = $scope.window.parentNode
      $scope.initState = {
        isDragging: false, isShow: false, xDiff: 0, yDiff: 0, x: 0, y: ($scope.parentNode.clientHeight) / 10
        };
        $scope.initState.isShow = !!this.state// !state.isShow;
        $scope.renderWindow($scope.window, $scope.initState);
        $(`#${this.id} #window`).css("width", this.width).animate({opacity: 1}, 500)
        // $(`#${this.id} #window`).css("z-index", (2000 + Number(this.zIndex)).toString() + ' !important')
        // $(`#${this.id} #containerItem`).css("z-index", (1999 + Number(this.zIndex)).toString() + ' !important')
    }
    
    $scope.ready = function (fn) {
        if (document.attachEvent ? document.readyState === "complete" : document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    $scope.renderWindow = function (w, myState) {
        if (!myState.isShow) {
            w.style.display = 'none';
        } else {
            w.style.display = '';
        }

        w.style.transform = 'translate(' + myState.x + 'px, ' + myState.y + 'px)';
    }

    $scope.clampX = function (n) {
        //return Math.min(Math.max(n, -$scope.parentNode.clientWidth / 2 + $scope.window.clientWidth / 2), (+$scope.parentNode.clientWidth / 2) - $scope.window.clientWidth / 2);// container width - window width
        return Math.min(Math.max(n, -$scope.parentNode.clientWidth / 2), (+$scope.parentNode.clientWidth / 2));// container width - window width
    }

    $scope.clampY = function (n) {
        return Math.min(Math.max(n, 0), $scope.parentNode.clientHeight - ($scope.window.clientHeight));
    }

    $scope.onMouseMove = function (e) {
        if ($scope.initState.isDragging) {
            $scope.initState.x = $scope.clampX(e.pageX - $scope.initState.xDiff);
            $scope.initState.y = $scope.clampY(e.pageY - $scope.initState.yDiff);
        }
        $scope.renderWindow($scope.window, $scope.initState);
    }

    $scope.onMouseDown = function (e) {
        $scope.initState.isDragging = true;
        $scope.initState.xDiff = e.pageX - $scope.initState.x;
        $scope.initState.yDiff = e.pageY - $scope.initState.y;
    }

    $scope.onMouseUp = function () {
        $scope.initState.isDragging = false;
    }

    $scope.closeModal = function () {
        $scope.initState.isShow = false;
        $scope.parentNode.classList.remove('containerItem')
        $scope.renderWindow($scope.window, $scope.initState);
    }

    angular.element(document).ready(function () {
        $scope.renderWindow($scope.window, $scope.initState);
        let windowBar = document.getElementById($scope.$this.id).querySelectorAll('.window-bar');
        windowBar[0].addEventListener('mousedown', $scope.onMouseDown);
        document.getElementById($scope.$this.id).addEventListener('mousemove', $scope.onMouseMove);
        document.getElementById($scope.$this.id).addEventListener('mouseup', $scope.onMouseUp);
    })

}

function templateFunc() {
    return `<style>
.window {
    z-index: 200;
    opacity: 0;
    max-width: 95%;
    box-shadow: 1px 1px 5px #75beea;
    background-color: white;
    margin: auto;
    padding:3px;
    word-wrap: break-word;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
}


.window .window-bar {
    padding: 2px 10px;
    color: white;
    background-color: #75beea;
    position: relative;
    margin: 5px;
    cursor: move;
    font-size: 1em;
    text-align: right;
    /* box-shadow: 0 2px 3px rgba(0, 0, 0, 0.3); */
    border-radius: 5px
}
.window .window-bar span{
position: absolute;
left:10px;
top: 5px;
cursor: pointer;
font-size: 16px;
font-weight: 800;
}
.window .window-bar .window-close {
    cursor: pointer;
    display: inline-block;
    position: absolute;
    top: 3px;
    right: 3px;
    background-color: white;
    width: 14px;
    height: 14px;
    padding-left: 2px;
    padding-top: 2px;
}

.window-body {
    margin: 1em;
    position: relative;
    min-height: 200px;
    min-width: 400px;
    max-height: 80%;
    width: auto;
}
.containerItem{
background-color: rgba(0,0,0,0.1);
z-index:199;
overflow-y: auto;
overflow-x: hidden;
width: 100%;
height: 100%;
margin: auto;
align-content: center;
align-items: center;
position: fixed;
transition: all 0.3s ease-in-out;
top: 0;
left: 0;
}
</style>
<div id="containerItem" class="containerItem">
<div class="window" id="window">
    <div class="window-bar">
        <div>{{$this.titles}}</div>
        <span ng-click="closeModal()" title="بستن"><i class="far fa-close"></i> </span>
    </div>
    <div ng-if="$this.url===undefined" ng-transclude>
      
    </div>
    <div ng-if="$this.url!==undefined" ng-transclude ng-include="$this.url">
      
    </div>
</div>
</div>
`
}

app.component("dragDropModal", {
    transclude: true, bindings: {
        titles: '@', zIndex: '@', state: '=', width: '@', id: '@',url:'@'
    }, controller: dragAndDropModalFunction, template: templateFunc()
})