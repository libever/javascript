(function(){

	//扩展String的trim方法
	String.prototype.trim=function() {  
		return this.replace(/(^\s*)|(\s*$)/g,'');  
	}; 

	//一个页面声明周期内组织js的对象集合
	gMainApp = {
		//所有的功能对象
		subApps:[]
		//所有的命名方式调用，供模块与模块之间互相调用
		,namedHanlders:[]
		//判断是否属于调试模式，根据SIP判断,该变量来自于服务器
		,isDebug:false
		//存储调用过一次的模板内容
		,tplConents:[]
		//id选择器,document.getElementById()
		,getById:function(){}
		//注册子应用
		,registerApp:function(app){}
		//页面加载完成后，遍历一个应用对象，链式调用该应用对象的方法
		,bootstrapRun:function(subAppIndex){}
		//页面onload以后执行的主流程
		,startUp:function(){}

		//注册命名调用函数
		,registerNamedHandler:function(fnName,callback){}
		//调用已经命名的函数
		,callNamedHandler:function(fnName,option){}

		//封装的get方式调用
		,get:function(url,params,fn){}
		//封装的post方式调用
		,post:function(fn){}

		//添加cookie,名称，值，声明时间
		,addCookie:function(name,value,lifeSeconds){}
		//获取cookie
		,getCookie:function(name,defaultValue){}
		//删除cookie
		,cleanCookie:function(name){}

		//获取一个模板的内容
		,getTplContent:function(name){}
		//把一组数据渲染到一个dom结构中，返回html
		,renderToTpl:function(name,data){}

		//实现对象之间的继承，把extendObj的所有属性方法，附加到obj当中
		,extend:function(obj,extendObj){}

		//异步加载js脚本，加载完成以后执行指定回调
		,loadJsAsync:function(url,fn){}

		//数据管理器
		//uniqueKeyHandler 数据管理器唯一键获取回调,默认返回当前值
		,dataManager:function(uniqueKeyHandler){}
		//空的函数实现
		,blankHandler:function(){}
	};

	gMainApp.getById = function(id){
		return document.getElementById(id);
	}

	gMainApp.registerApp = function(app){
		if(app.name){
			gMainApp[app.name] = app;
		}
		app.init = app.init || function(){}; 
		app.loadData = app.loadData || function(fn){fn()}; 
		app.initUI = app.initUI || function(){};
		app.bindEvent = app.bindEvent|| function(){}; 
		this.subApps.push(app);	
	};

	gMainApp.bootstrapRun = function(subAppIndex){
		var me = this;
		subAppIndex = subAppIndex || 0;
		if(subAppIndex < this.subApps.length){
			var subApp = this.subApps[subAppIndex];
			subApp.init();
			subApp.loadData(function(){
				subApp.initUI();	
				subApp.bindEvent();
				me.bootstrapRun(subAppIndex + 1);
			});
		}
	};

	gMainApp.startUp = function(){
		this.isDebug = SIP && SIP == "10.69.2.90";
		if(this.isDebug){
			console.log("message xingyue xingyue@staff.sina.com.cn 2015-04-09 17:02:55 end_message");
		}
		this.bootstrapRun();	
	};

	gMainApp.registerNamedHandler = function(fnName,callback){
		if(this.namedHanlders[fnName]){
			console.log("Already have handler named : "  + fnName);
		} else {
			this.namedHanlders[fnName] = callback;	
		}
	};

	gMainApp.callNamedHandler = function(fnName,option){
		if(!this.namedHanlders[fnName]){
			console.log("No named  handler : "  + fnName);
		} else {
			return this.namedHanlders[fnName](option);
		}
	};

	gMainApp.get = function(url,params,callback){
		params = params || {};
		params.dataType = params.dataType || "text";
		callback = callback || {};
		callback.success = callback.success || function(){};
		callback.fail = callback.fail || function(){};
		callback.fail404 = callback.fail404 || function(){};
		callback.fail500 = callback.fail500 || function(){};
		var jqxhr = $.ajax({
			url: url,
			type: "GET", // 默认为GET,你可以根据需要更改
			//cache: true, // 默认为true,但对于script,jsonp类型为false,可以自行设置
			data: params, // 将请求参数放这里.
			dataType: params.dataType, // 指定想要的数据类型
			statusCode: { // 如果你想处理各状态的错误的话
				404: callback.fail404,
				500: callback.fail500 
			}
		});
		jqxhr.done(callback.success);
		jqxhr.fail(callback.fail);
	};

	gMainApp.post = function(url,params,callback){
		params = params || {};
		params.dataType = params.dataType || "json";
		params.token = token;
		callback = callback || {};
		callback.success = callback.success || function(){};
		callback.fail = callback.fail || function(){};
		callback.fail404 = callback.fail404 || function(){};
		callback.fail500 = callback.fail500 || function(){};
		var jqxhr = $.ajax({
			url: url,
			type: "POST", // 默认为GET,你可以根据需要更改
			//cache: true, // 默认为true,但对于script,jsonp类型为false,可以自行设置
			data: params, // 将请求参数放这里.
			dataType: params.dataType, // 指定想要的数据类型
			statusCode: { // 如果你想处理各状态的错误的话
				404: callback.fail404,
				500: callback.fail500 
			}
		});
		jqxhr.done(function(data){
			if(data){
				if(params.dataType == "json"){
					token = data.token || "";	
				}
				data = $.parseJSON(data.data);
				callback.success(data);		
			}	
		});
		jqxhr.fail(callback.fail);
	};

	gMainApp.addCookie = function(name,value,lifeSeconds){
		var lifeTime = lifeSeconds * 1000;
		var exp  = new Date();				
		exp.setTime(exp.getTime() + lifeTime);
		document.cookie = name + "="+ escape (value) + ";expires=" + exp.toGMTString();
	};

	gMainApp.getCookie = function(name,defaultValue){
		var arr = document.cookie.match(new RegExp("(^| )"+name+"=([^;]*)(;|$)"));
		if(arr != null) return unescape(arr[2]); return defaultValue;
	};

	gMainApp.cleanCookie = function(name){
		this.addCookie(name,"",-3);	
	};

	gMainApp.getTplContent = function(name){
		this.tplConents = [];
		if( ! this.tplConents[name]) {
			var jsTpl = $("#"+name);	
			this.tplConents[name] = jsTpl && jsTpl.html();
		}
		return this.tplConents[name];
	};

	gMainApp.renderToTpl = function(name,data){
		var tplConent = this.getTplContent(name);			
		if(tplConent){
			return tplConent.replace(/\{(\w+)\}/g,function(index,name) {  
				 if(data[name] && data[name] != null){
					return String(data[name]);
				 } else {
					return name; 
				 }
			});
		}
		return tplConent;
	};

	gMainApp.extend = function(obj,extendObj){
		for ( var m in extendObj){
			if(obj[m]) continue;
			obj[m] = extendObj[m];
		}	
	};

	gMainApp.loadJsAsync = function(url,fn){
		var head = document.getElementsByTagName("head")[0];
		var s = document.createElement("script");
		s.src=url;
		head.appendChild(s);
		if( s.addEventListener ) {
			s.addEventListener("load",fn,false);
		} else if(s.attachEvent) {
			s.attachEvent("onreadystatechagne",function(){
				if(s.readyState==4 || s.readyState == "complete" || s.readyState == "loaded"){
					fn();
				}
			});  
		}
	};

	gMainApp.dataManager = function(uniqueKeyHandler,itemChangeHandler){
		uniqueKeyHandler = uniqueKeyHandler || function(d){return d};
		itemChangeHandler = itemChangeHandler || function(){};
		return {
			realData:[]
			,add:function(d){
				if(!this.exist(d)){
					this.realData.push(d);	
					itemChangeHandler(this.realData.length);
				}
			}	
			,remove:function(k){
				for(var i = 0 , l = this.realData.length ; i < l ; i++ ){
					if(uniqueKeyHandler(this.realData[i]) == k){
						this.realData[i] = null;
						itemChangeHandler(this.data().length);
						break;
					}
				}	
			}
			,exist:function(k){
				for(var i = 0 , l = this.realData.length ; i < l ; i++ ){
					if(uniqueKeyHandler(this.realData[i]) == k){
						return true;
					}
				}	
				return false;
			}
			,data:function(){
				var r_data = [];
				for(var i = 0 , l = this.realData.length ; i < l ; i++ ){
					if(this.realData[i] != null){
						r_data.push(this.realData[i]);
					}
				}	
				this.realData = r_data;
				return r_data;
			}
			,resetData:function(){
				this.realData = [];	
				itemChangeHandler(0);
			}
		}	
	};

})();
