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
			}, function(arr, obj) {
				self._users = obj;
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

		self.requests = mongo.get('request',{
			replace: {
				averUi: function(val, cb, doc){
					var sum = 0;
					var count = 0;
					for (var i = 0; i < doc.feedbacks.length; i++) {
						var sum = 0;
						sum += doc.feedbacks[i].ui;
						count++;
					}
					cb((sum/count)||0);
				},
				averUx: function(val, cb, doc){
					var sum = 0;
					var count = 0;
					for (var i = 0; i < doc.feedbacks.length; i++) {
						var sum = 0;
						sum += doc.feedbacks[i].ux;
						count++;
					}
					cb((sum/count)||0);
				},
				averSpeed: function(val, cb, doc){
					var sum = 0;
					var count = 0;
					for (var i = 0; i < doc.feedbacks.length; i++) {
						var sum = 0;
						sum += doc.feedbacks[i].speed;
						count++;
					}
					cb((sum/count)||0);
				},
				averBugs: function(val, cb, doc){
					var sum = 0;
					var count = 0;
					for (var i = 0; i < doc.feedbacks.length; i++) {
						var sum = 0;
						sum += doc.feedbacks[i].bugs;
						count++;
					}
					cb((sum/count)||0);
				},
				workLink: function(val, cb, doc){
					if(doc.link.slice(0,3)!='http'){
						cb('http://'+doc.link);
					}else cb(doc.link);
				}
			}
		});
		this.create = function(request){
			
			if(!request){
				return alert('You have to fill link.');
			}
			if(!request.link){
				return alert('You have to fill link.');
			}
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
		this.updateFeedback = function(request, feedback, userId){
			for (var i = self.requests.length - 1; i >= 0; i--) {
				if(self.requests[i]._id==request._id){
					self.requests[i].feedbacks.push({
						author: userId,
						ui: feedback.ui,
						uicomment: feedback.uicomment,
						ux: feedback.ux,
						uxcomment: feedback.uxcomment,
						speed: feedback.speed,
						speedcomment: feedback.speedcomment,
						bugs: feedback.bugs,
						bugscomment: feedback.bugscomment,
						created: new Date()
					})
				}
				mongo.updateAll('request',self.requests[i]);
			}
		}
		this.delete = function(request){
			mongo.delete('request', {
				_id: request._id
			});
		}
	// End of service
}
filters.sort = function() {
	return function(requests,userId , my, sorting) {
		var newreq = []
		if(!sorting||sorting=="Newones"){
			for (var i = 0; i < requests.length; i++) {
				newreq.unshift(requests[i]);
			}
		}
		if(sorting=="Oldones"){
			for (var i = 0; i < requests.length; i++) {
				newreq.push(requests[i]);
			}
		}
		if(sorting=="Bestrating"){
			for (var i = 0; i < requests.length; i++) {
				for (var j = 0; j < requests.lengt-1; j++) {
					var first=(requests[j].averUi+requests[j].averUx+requests[j].averSpeed+requests[j].averBugs)/4;
					var second=(requests[j+1].averUi+requests[j+1].averUx+requests[j+1].averSpeed+requests[j+1].averBugs)/4;
					if (second > first){ 
						var t = requests[j+1]; 
						requests[j+1] = requests[j]; 
						requests[j] = t; 
					}
				}
			}
			for (var i = 0; i < requests.length; i++) {
				newreq.push(requests[i]);
			}
		}
		if(sorting=="Worstrating"){
			for (var i = 0; i < requests.length; i++) {
				for (var j = 0; j < requests.lengt-1; j++) {
					var first=(requests[j].averUi+requests[j].averUx+requests[j].averSpeed+requests[j].averBugs)/4;
					var second=(requests[j+1].averUi+requests[j+1].averUx+requests[j+1].averSpeed+requests[j+1].averBugs)/4;
					if (second > first){ 
						var t = requests[j+1]; 
						requests[j+1] = requests[j]; 
						requests[j] = t; 
					}
				}
			}
			for (var i = 0; i < requests.length; i++) {
				newreq.unshift(requests[i]);
			}
		}
		if(sorting=="BestUI"){
			for (var i = 0; i < requests.length; i++) {
				for (var j = 0; j < requests.lengt-1; j++) {
					if (requests[j+1].averUi > requests[j].averUi){ 
						var t = requests[j+1]; 
						requests[j+1] = requests[j]; 
						requests[j] = t; 
					}
				}
			}
			for (var i = 0; i < requests.length; i++) {
				newreq.push(requests[i]);
			}
		}
		if(sorting=="WorstUI"){
			for (var i = 0; i < requests.length; i++) {
				for (var j = 0; j < requests.lengt-1; j++) {
					if (requests[j+1].averUi > requests[j].averUi){ 
						var t = requests[j+1]; 
						requests[j+1] = requests[j]; 
						requests[j] = t; 
					}
				}
			}
			for (var i = 0; i < requests.length; i++) {
				newreq.unshift(requests[i]);
			}
		}
		if(sorting=="BestUX"){
			for (var i = 0; i < requests.length; i++) {
				for (var j = 0; j < requests.lengt-1; j++) {
					if (requests[j+1].averUx > requests[j].averUx){ 
						var t = requests[j+1]; 
						requests[j+1] = requests[j]; 
						requests[j] = t; 
					}
				}
			}
			for (var i = 0; i < requests.length; i++) {
				newreq.push(requests[i]);
			}
		}
		if(sorting=="WorstUX"){
			for (var i = 0; i < requests.length; i++) {
				for (var j = 0; j < requests.lengt-1; j++) {
					if (requests[j+1].averUx > requests[j].averUx){ 
						var t = requests[j+1]; 
						requests[j+1] = requests[j]; 
						requests[j] = t; 
					}
				}
			}
			for (var i = 0; i < requests.length; i++) {
				newreq.unshift(requests[i]);
			}
		}
		if(sorting=="BestPerformance"){
			for (var i = 0; i < requests.length; i++) {
				for (var j = 0; j < requests.lengt-1; j++) {
					if (requests[j+1].averSpeed > requests[j].averSpeed){ 
						var t = requests[j+1]; 
						requests[j+1] = requests[j]; 
						requests[j] = t; 
					}
				}
			}
			for (var i = 0; i < requests.length; i++) {
				newreq.push(requests[i]);
			}
		}
		if(sorting=="WorstPerformance"){
			for (var i = 0; i < requests.length; i++) {
				for (var j = 0; j < requests.lengt-1; j++) {
					if (requests[j+1].averSpeed > requests[j].averSpeed){ 
						var t = requests[j+1]; 
						requests[j+1] = requests[j]; 
						requests[j] = t; 
					}
				}
			}
			for (var i = 0; i < requests.length; i++) {
				newreq.unshift(requests[i]);
			}
		}
		if(sorting=="LessBugs"){
			for (var i = 0; i < requests.length; i++) {
				for (var j = 0; j < requests.lengt-1; j++) {
					if (requests[j+1].averBugs > requests[j].averBugs){ 
						var t = requests[j+1]; 
						requests[j+1] = requests[j]; 
						requests[j] = t; 
					}
				}
			}
			for (var i = 0; i < requests.length; i++) {
				newreq.push(requests[i]);
			}
		}
		if(sorting=="MoreBugs"){
			for (var i = 0; i < requests.length; i++) {
				for (var j = 0; j < requests.lengt-1; j++) {
					if (requests[j+1].averBugs > requests[j].averBugs){ 
						var t = requests[j+1]; 
						requests[j+1] = requests[j]; 
						requests[j] = t; 
					}
				}
			}
			for (var i = 0; i < requests.length; i++) {
				newreq.unshift(requests[i]);
			}
		}
		

		if(my){
			for (var i = newreq.length-1; i >= 0; i--) {
				if(newreq[i].author!=userId){
					newreq.splice(i,1);
				}
			}
		}
		return newreq;
	}
}