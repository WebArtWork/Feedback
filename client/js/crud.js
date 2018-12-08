var services = {}, filters = {}, directives = {}, controllers = {};
app.service(services).filter(filters).directive(directives).controller(controllers);

/*
*	Crud file for client side user
*	We don't use waw crud on the user as it's basically personal update.
*	And if user use more then one device we can easly handle that with sockets.
*/
services.User = function($http, $timeout, mongo, file){
	// waw crud
		let self = this;
		let updateAll = function(){
			return {
				gender: self.gender,
				birth: self.birth,
				name: self.name,
				data: self.data,
				_id: self._id,
				is: self.is
			};
		}
		$http.get('/api/user/me').then(function(resp){
			for(let key in resp.data){
				self[key] = resp.data[key];
			}
			self.birth = new Date(self.birth);
			
			self.users = mongo.get('user', {
				age: function(val, cb, doc){
					doc.birth = new Date(doc.birth);
					let ageDate = new Date(Date.now() - doc.birth.getTime());
					cb(Math.abs(ageDate.getUTCFullYear() - 1970));
				},
				following: function(val, cb, doc){
					cb(self.following(doc._id));
				}
			});
		});
	// Search
	/*	this.sMale = this.sFemale = true;
		this.search = function(){
			if(self.sMinAge<1) self.sMinAge = 1;
			if(self.sMaxAge>100) self.sMaxAge = 100;
			// Queried Users
			mongo.afterWhile(self, function(){
				if(self.sMaxAge<self.sMinAge) self.sMaxAge=self.sMinAge;
				self.qu = self.users.slice();
				self.sName&&mongo.keepByText(self.qu, 'name', self.sName);
				if(!self.sMale||!self.sFemale){
					if(self.sMale) mongo.keepByText(self.qu, 'gender', 'male', true);
					else mongo.keepByText(self.qu, 'gender', 'female', true);
				}
				self.sMinAge&&mongo.keepByBiggerNumber(self.qu, 'age', self.sMinAge);
				self.sMaxAge&&mongo.keepBySmallerNumber(self.qu, 'age', self.sMaxAge);
			}, 500);
		}
		this.if_false_make_true = function(prefix){
			if(!self[prefix]) self[prefix] = true;
		}*/
	
	// Custom Routes
		this.updateAfterWhile = function(){
			mongo.afterWhile(self, function(){
				mongo.updateAll('user', updateAll());
			});
		}
		file.add({
			_id: 'ProfileID',
			width: 350,
			height: 350
		}, function(dataUrl) {
			self.avatarUrl = dataUrl;
			$http.post('/api/user/avatar',{
				dataUrl: dataUrl
			}).then(function(resp){
				if(resp) self.avatarUrl = resp.data;
			});
		});
		this.delete = function(){
			mongo.delete('user', {}, function(){
				window.location.href = "/";
			});
		}
		this.changePassword = function(oldPass, newPass, passRepeated){
			if(!oldPass||oldPass.length<8||!newPass) return;
			$http.post('/api/user/changePassword',{
				oldPass: oldPass,
				newPass: newPass
			});
		}
	// End of service
}
services.Request = function($http, $timeout, mongo, file){
	// waw crud
		let self = this;
		self.requests = mongo.get('request');

		this.create = function(request){
			mongo.create('request',{
				name: request.name,
				description: request.description,
				link: request.link,
				_id: request._id
			});
		}
		this.update = function(request){
			mongo.updateAll('request',request);
		}
		this.updateFeedback = function(request, user){
			for (var i = self.requests.length - 1; i >= 0; i--) {
				if(self.requests[i]._id==request._id){
					self.requests[i].feedbacks.push({
						author: user._id,
						ui: request.ui,
						uicomment: request.uicomment,
						ux: request.ux,
						uxcomment: request.uxcomment,
						speed: request.speed,
						speedcomment: request.speedcomment,
						bugs: request.bugs,
						bugscomment: request.bugscomment 
					})
				}
				this.update(self.requests[i]);
			}
		}
	// End of service
}