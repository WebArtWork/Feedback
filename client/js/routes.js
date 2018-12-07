var directives = {};
app.directive(directives);
var services = {};
app.service(services);
var filters = {};
app.filter(filters);
directives.sidebar = function() {
    "ngInject";
    return {
        restrict: 'AE',
        controller: function($scope, $state, user, $timeout) {
            $scope.u = user;
            $scope.s = $state;
            var ModalIgnore = false;
            

            $scope.new = function() {
                item.item = {
                    avatarUrl: '/api/item/default.png'
                }
                modal.open({
                    templateUrl: '/html/modals/new.html',
                    i: item,
                    item: item.item,
                    currency: 'USD'
                });
            }
            $scope.update = function(_item) {
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
            }
        },
        templateUrl: '/html/sidebar.html'
    }
};
app.config(function($stateProvider, $locationProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/');
    var root = '/';
    $stateProvider.state({
        name: 'Friends',
        url: root + 'Friends',
        controller: function($scope, user, finance, item, modal, spin, popup) {
            "ngInject";
            $scope.u = user;
            $scope.f = finance;
            $scope.i = item;

            $scope.config = {
                template: 'Hello',
                pos: ''
            };
            $scope.spin = function(el) {
                var rsp = spin.open({
                    element: el
                });
                setTimeout(function() {
                    spin.close(rsp);
                }, 1000);
            }

        },
        url: root,
        templateUrl: '/html/pages/Friends.html'
    }).state({
        name: 'Groups',
        url: root + 'Groups',
        controller: function($scope, user, finance, item, group, modal, file) {
            "ngInject";
            $scope.u = user;
            $scope.f = finance;
            $scope.i = item;
            $scope.g = group;
            $scope.newgroup = function(_group) {
                modal.open({
                    templateUrl: '/html/modals/newgroup.html',
                    g: group,
                    group: _group
                });
                file.add({
                    id: 'groupAvatarUrlId',
                    width: 500,
                    height: 500
                }, function(dataUrl) {
                    _group.avatarUrl = dataUrl;
                });
            }
        },
        templateUrl: '/html/pages/Groups.html'
    }).state({
        name: 'Group',
        url: root + 'Group/:_id',
        controller: function($scope, user, finance, item, group, $state,modal) {
            'ngInject';
            $scope.p = $state.params;
            $scope.u = user;
            $scope.f = finance;
            $scope.i = item;
            $scope.g = group;
            $scope.groupUserSearching = function(_group) {
                modal.open({
                    templateUrl: '/html/modals/groupUserSearching.html',
                    g: group,
                    group: _group,
                    u: user
                });
            }
        },
        templateUrl: '/html/pages/Group.html'
    }).state({
        name: 'Events',
        url: root + 'Events',
        controller: function($scope, $http, user, finance, item, event, modal, file) {
            'ngInject';
            $scope.u = user;
            $scope.f = finance;
            $scope.i = item;
            $scope.e = event;
            $scope.eventEdit = function(_event) {
                modal.open({
                    templateUrl: '/html/modals/eventEdit.html',
                    e: event,
                    event: _event
                });
                file.add({
                    id: 'eventAvatarUrlId',
                    width: 500,
                    height: 500
                }, function(dataUrl) {
                    _event.avatarUrl = dataUrl;
                });
            }
        },
        templateUrl: '/html/pages/Events.html'
    }).state({
        name: 'Event',
        url: root + 'Event/:_id',
        controller: function($scope, user, finance, item, event, $state,modal) {
            'ngInject';
            $scope.p = $state.params;
            $scope.u = user;
            $scope.f = finance;
            $scope.i = item;
            $scope.e = event;
            $scope.eventUserSearching = function(_event) {
                modal.open({
                    templateUrl: '/html/modals/eventUserSearching.html',
                    e: event,
                    event: _event,
                    u: user
                });
            }
        },
        templateUrl: '/html/pages/Event.html'
    }).state({
        name: 'Finances',
        url: root + 'Finances',
        controller: function($scope, user, finance, item, group, modal, file) {
            "ngInject";
            $scope.u = user;
            $scope.f = finance;
            $scope.i = item;
            $scope.g = group;    
        },
        templateUrl: '/html/pages/Finances.html'
    })
    $locationProvider.html5Mode(true);
});