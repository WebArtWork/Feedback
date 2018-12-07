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
		this.all_skills = ['cooking','fishing','painting'];
		let updateAll = function(){
			return {
				gender: self.gender,
				skills: self.skills,
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
			self.skills_checked = {};
			if(self._id){
				for (var i = 0; i < self.skills.length; i++) {
					self.skills_checked[self.skills[i]] = true;
				}
			}
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
		this.updateSkill = function(skill){
			self.skills = [];
			for(let key in self.skills_checked){
				if(self.skills_checked[key]){
					self.skills.push(key);
				}
			}
			mongo.updateAll('user', updateAll());
		}
	// Search
		this.sMale = this.sFemale = true;
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
				for (var i = 0; i < self.all_skills.length; i++) {
					if(self['ss_'+self.all_skills[i]]){
						mongo.keepByText(self.qu, 'skills', self.all_skills[i], true);
					}
				}
				self.sMinAge&&mongo.keepByBiggerNumber(self.qu, 'age', self.sMinAge);
				self.sMaxAge&&mongo.keepBySmallerNumber(self.qu, 'age', self.sMaxAge);
			}, 500);
		}
		this.if_false_make_true = function(prefix){
			if(!self[prefix]) self[prefix] = true;
		}
	// Follow Management
		this.following = function(_id){
			if(!self._id) return false;
			for (var i = 0; i < self.followings.length; i++) {
				if(self.followings[i] == _id) return true;
			}
			return false;
		}
		this.follow = function(user){
			user.following = true;
			self.followings.push(user._id);
			$http.post('/api/user/follow', {
				_id: user._id
			});
		}
		this.unfollow = function(user){
			user.following = false;
			for (var i = self.followings.length - 1; i >= 0; i--) {
				if(self.followings[i]==user._id){
					self.followings.splice(i, 1);
				}
			}
			$http.post('/api/user/unfollow', {
				_id: user._id
			});
		}
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