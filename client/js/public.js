controllers.Auth = function($scope){
	"ngInject";
	var user = $scope.user = {};
	/*
	*	ReCaptcha
	*/
		$scope.response = null;
		$scope.widgetId = null;
		$scope.model = {
		    key: '6Lf4nUsUAAAAAMtjSbr2Nfj0iDrc3RSlkEzepIcN'
		};
		$scope.setResponse = function (response) {
		    console.info('Response available');
		    $scope.response = response;
		};
		$scope.setWidgetId = function (widgetId) {
		    console.info('Created widget ID: %s', widgetId);
		    $scope.widgetId = widgetId;
		};
		$scope.cbExpiration = function() {
		    console.info('Captcha expired. Resetting response object');
		    vcRecaptchaService.reload($scope.widgetId);
		    $scope.response = null;
		};
		$scope.submit = function () {
		    var valid;
		    console.log('sending the captcha response to the server', $scope.response);
		    if (valid) {
		        console.log('Success');
		    } else {
		        console.log('Failed validation');
		        vcRecaptchaService.reload($scope.widgetId);
		    }
		};
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
			}  else if(!$scope.response){
				user.err = 3;
				return alert('Please confirm that you are no a robot.');
			}
			document.getElementById('SignupFormID').action='/api/user/signup';
			document.getElementById('SignupFormID').method='POST';
			document.getElementById('SignupFormID').submit();
		}
	/*
	*	End
	*/
};
controllers.Users = function($scope, User){
	"ngInject";
	$scope.u = User;
};
directives.lusers = function(){
	return {
		restrict: "A",
		transclude: true,
		templateUrl: '/html/public/_explore_local.html'
	}
};