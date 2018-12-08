var directives = {};
app.directive(directives);
console.log(directives);
var services = {};
app.service(services);
var filters = {};
app.filter(filters);
directives.__index = function() {
    "ngInject";
    return {
        restrict: 'AE',
        controller: function($scope,modal, $state, user, $timeout) {
            $scope.u = user;
            $scope.s = $state;
            var ModalIgnore = false;
            

            $scope.login = function() {
                console.log('aga');
                modal.open({
                    templateUrl: '/html/modals/Login.html'
                });
            }
            /*$scope.update = function(_item) {
                if(ModalIgnore) return;
                item.item = _item
                modal.open({
                    templateUrl: '/html/modals/new.html',
                    i: item,
                    u: user,
                    item: _item
                });
            }
            $scope.settings = function() {
                modal.open({
                    templateUrl: '/html/modals/settings.html',
                    u: user
                });
            }
            
            $scope.notifications = function() {
                modal.open({
                    templateUrl: '/html/modals/notifications.html',
                    u: user,
                    f: finance,
                    i: item
                }); 
            }*/
        },
        templateUrl: '/html/public/__index.html'
    }
};
