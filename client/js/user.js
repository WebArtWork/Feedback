var ctrl = function($scope, User, Request){
	var u = $scope.u = User;
	var req = $scope.req = Request;

}
app.config(function($stateProvider, $locationProvider, $urlRouterProvider) {
	var root = '/';
	$urlRouterProvider.otherwise(root+'MyProfile');
	$stateProvider.state({
		name: 'MyProfile',
		url: root+'MyProfile', controller: ctrl,
		templateUrl: '/html/user/MyProfile.html'
	}).state({
		name: 'MySettings',
		url: root+'MySettings', controller: ctrl,
		templateUrl: '/html/user/MySettings.html'
	});
	$locationProvider.html5Mode(true);
});