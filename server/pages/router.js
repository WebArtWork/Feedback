var Pages = require(__dirname+'/schema.js');
var User = require(process.cwd()+'/server/user/schema.js');
module.exports = function(sd) {
	var router = sd._initRouter('/waw/pages');
	var allow = function(req, res, next){
		if(req.user && req.user.is && (req.user.is.pageadmin || req.user.is.pagesuper) ){
			next();
		}else res.json(false);
	}
	var allowSuper = function(req, res, next){
		if(req.user && req.user.is && req.user.is.pagesuper){
			next();
		}else res.json(false);
	}
	var templates, _templates={};
	for (let i = sd._parts.length - 1; i >= 0; i--) {
		if(sd._parts[i].name=='pages'||sd._parts[i].name=='Pages'){
			templates = sd._parts[i].info.templates;
			for (var j = templates.length - 1; j >= 0; j--) {
				_templates[templates[j].name] = templates[j].file;
			}
		}
	}
	var urls;
	var rewrite_urls = function(){
		urls = {};
		Pages.find({}, function(err, pages){
			for (var i = pages.length - 1; i >= 0; i--) {
				if(pages[i].url && pages[i].view){
					urls[pages[i].url.toLowerCase()]=pages[i].url;

				}
			}
		});
	}
	rewrite_urls();
	/*
	*	CMS
	*/
		router.post('/templates', allow, function(req, res){
			Pages.findOne({
				_id: req.body._id
			}, function(err, page){
				res.json({
					templates: templates,
					page: page,
				});
			});
		});
		router.get('/templates/:file', allow, function(req, res){
			res.sendFile(__dirname + '/templates/' + req.params.file);
		});
		router.get('/', allow, function(req, res){
			res.send(sd._derer.renderFile(__dirname+'/cms/pages.html', req.user));
		});

		router.get("/get", allowSuper, function(req, res) {
			User.find({}, function(err, users){
				res.json({
					users:users
				});
			});
		});
		router.post("/post", allowSuper, function(req, res) {
			User.findOne({
				_id: req.body._id
			}, function(err, user){
				user.is = req.body.is;
				user.save(function(){
					res.json(true);
				});
			});
		});
		var features = sd._getFiles(__dirname+'/features');
		for (var i = 0; i < features.length; i++) {
			features[i] = sd._fs.readFileSync(__dirname+'/features/'+features[i], 'utf8');
		}
		features = features.join('');
		router.get('/page/:_id', allow, function(req, res){
			res.send(sd._derer.renderFile(__dirname+'/cms/page.html', {
				features: features
			}));
		});
		router.get('/cms/:file', allow, function(req, res){
			res.sendFile(__dirname + '/cms/' + req.params.file);
		});
		router.get('/features/:file', allow, function(req, res){
			res.sendFile(__dirname + '/features/' + req.params.file);
		});



		sd['query_get_pages'] = function(req, res) { return {}; };

		sd['query_update_all_pages'] = function(req, res) {
			return {
				_id: req.body._id
			};
		};
		sd['query_unique_field_pages'] = function(req, res) {
			// add code here from part.json ignore
			setTimeout(rewrite_urls, 5000);
			return {
				_id: req.body._id
			};
		};
	/*
	*	Pages Rendering
	*/
		sd._middleware.push(function(next, opt) {
			var req = opt.req;
			var res = opt.res;
			if(urls[req.originalUrl.toLowerCase()]){
				Pages.findOne({
					url: urls[req.originalUrl.toLowerCase()]
				}).lean().exec(function(err, page){
					if(page && page.template && page.view && page.html && _templates[page.template]){
						page.file = _templates[page.template];
						var html = sd._derer.compileFile(__dirname+'/templates/index.html')(page);
						res.send(html.replace('<trix-editor ng-model="page.html" angular-trix trix-change="update(page);" placeholder="Write something.."></trix-editor>', page.html));
					}else res.redirect('/');
				});
			}else next();
		});
	/*
	*	Files Management
	*/
		router.post("/file", function(req, res) {
			Pages.findOne({
				_id: req.body._id,
				moderators: req.user._id
			}, function(err, doc){
				if(err||!doc) return res.json(false);
				doc.avatarUrl = '/api/pages/file/' + doc._id + '.jpg?' + Date.now();
				sd._parallel([function(n){
					doc.save(n);
				}, function(n){
					sd._dataUrlToLocation(req.body.dataUrl,
						__dirname + '/files/', doc._id + '.jpg', n);
				}], function(){
					res.json(doc.avatarUrl);
				});
			});
		});

		router.get("/file/:file", function(req, res) {
			res.sendFile(__dirname + '/files/' + req.params.file);
		});
		router.get("/default.png", function(req, res) {
			res.sendFile(__dirname + '/files/avatar.png');
		});
	/*
	*	End of Pages
	*/
};