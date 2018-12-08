controllers.Auth = function($scope){
	"ngInject";
	var user = $scope.user = {};
	
	/*
	*	Submit Register
	*/
		$scope.doSignup = function(){
			if (!user.username) {
				user.err = 1;
				return alert('You have to fill email.');
			} else if (!user.password || user.password.length < 8) {
				user.err = 2;
				return alert('Make sure your password have more then 7 characters.');
			}  else if (!user.nickname|| user.nickname.length<4) {
				user.err = 3;
				return alert('You have to fill nickname with at least 4 characters.');
			}  
			document.getElementById('SignupFormID').action='/api/user/signup';
			document.getElementById('SignupFormID').method='POST';
			document.getElementById('SignupFormID').submit();
		}
	/*
	*	End
	*/
};
controllers.Users = function($scope, User, Request){
	"ngInject";
	$scope.u = User;
	$scope.req = Request;
};