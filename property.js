function registerPropertyChangeHandler(obj,name,handler){
	var oval = obj[name];	
	Object.defineProperty(obj,name,{
		configurable:false,
		enumerable:false,
		get:function(){
			return oval;	
		},
		set:function(nval){
			if(oval != nval){
				handler(nval);
			}
			oval = nval;	
		}
	});
}

var data = {};
registerPropertyChangeHandler(data,'hi',function(nval){
	console.log("new value " + nval);
});

data.hi = 3;
data.hi = 3;
data.hi = 3;
data.hi = 3;
