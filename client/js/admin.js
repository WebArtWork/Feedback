var services = {}, filters = {}, directives = {}, controllers = {};
app.service(services).filter(filters).directive(directives).controller(controllers);
services.User = function($http, $timeout, $state, mongo){
	"ngInject";
	var self = this;
	var selectUser = function() {
		for (var i = 0; i < self.users.length; i++) {
			if (self.users[i]._id == $state.params._id) {
				self.user = self.users[i];
				break;
			}
		}
	}
	$http.get('/api/user/me').then(function(resp){
		for(let key in resp.data){
			self[key] = resp.data[key];
		}
		self.birth = new Date(self.birth);
		self.skills_checked = {};
		for (var i = 0; i < self.skills.length; i++) {
			self.skills_checked[self.skills[i]] = true;
		}
		self.users = mongo.get('user', {
			age: function(val, cb, doc){
				doc.birth = new Date(doc.birth);
				let ageDate = new Date(Date.now() - doc.birth.getTime());
				cb(Math.abs(ageDate.getUTCFullYear() - 1970));
			},
			architect: mongo.beArr
		}, {
			query: 'getadmin'
		}, function(){
			if($state.params._id) selectUser();
		});
	});
	this.delete = function(user) {
		return mongo.delete('user', user, 'admin');
	}
	this.changePassword = function(user) {
		if(!user.newPass) return;
		$http.post('/api/user/admin/changePassword', {
			newPass: user.newPass,
			_id: user._id
		});
		user.newPass = '';
		alert('password for user '+user.name+' changed');
	}
	this.update = function(user) {
		if(self.is.super_admin){
			mongo.updateAll('user', user, 'super');
		}else if(self.is.admin){
			mongo.updateAll('user', user, 'admin');
		}
	}
	this.updateAfterWhile = function(user){
		mongo.afterWhile(user, function(){
			if(self.is.super_admin){
				mongo.updateAll('user', user, 'super');
			}else if(self.is.admin){
				mongo.updateAll('user', user, 'admin');
			}
		});
	}
}
controllers.topbar=function($scope, User){
	"ngInject";
	$scope.u = User;
};
var userCtrl = function($scope, User){
	var u = $scope.u = User;
}
app.config(function($stateProvider, $locationProvider, $urlRouterProvider) {
	var root = '/Admin';
	$urlRouterProvider.otherwise(root);
	$stateProvider.state({
		name: 'Users',
		url: root, controller: userCtrl,
		templateUrl: '/html/admin/Users.html'
	}).state({
		name: 'Profile', controller: userCtrl,
		url: root+'/Profile/:_id',
		templateUrl: '/html/admin/Profile.html'
	}).state({
		name: 'SuperAdmin', controller: userCtrl,
		url: root+'/SuperAdmin',
		templateUrl: '/html/admin/SuperAdmin.html'
	});
	$locationProvider.html5Mode(true);
});