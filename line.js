//https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/bind
if (!Function.prototype.bind) {

  Function.prototype.bind = function (oThis) {

    if (typeof this !== "function") // closest thing possible to the ECMAScript 5 internal IsCallable function
      throw new TypeError("Function.prototype.bind - what is trying to be fBound is not callable");

    var aArgs = Array.prototype.slice.call(arguments, 1), 
        fToBind = this, 
        fNOP = function () {},
        fBound = function () {
          return fToBind.apply(this instanceof fNOP ? this : oThis || window, aArgs.concat(Array.prototype.slice.call(arguments)));    
        };

    fNOP.prototype = this.prototype;
    fBound.prototype = new fNOP();

    return fBound;

  };

}

function LineMaker(){
}
LineMaker.prototype={
	make:function(obj){
		var df=document.createDocumentFragment();
		var color=this.getColor(obj.ip);
		var dt=el("dt",obj.name);
		if(obj.syslog)dt.classList.add("syslog");
		dt.style.color=color;
		
		df.appendChild(dt);
		var dd=el("dd","");
		var comsp=el("span",obj.comment);
		comsp.classList.add("comment");
		dd.appendChild(comsp);
		var infsp=el("span","(");
		infsp.classList.add("info");
		var date=new Date(obj.time);
		var time=el("time",date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate()+" "+date.getHours()+":"+date.getMinutes()+":"+date.getSeconds());
		time.datetime=date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate()+"T"+date.getHours()+":"+date.getMinutes()+":"+date.getSeconds()+"+09:00";
		
		dd.dataset.id=obj._id;
		if(obj.response){
			dd.dataset.respto=obj.response;
			dd.classList.add("respto");
		}
	
		infsp.appendChild(time);
		infsp.appendChild(document.createTextNode(", "+obj.ip+")"));
		dd.appendChild(infsp);
		dd.style.color=color;
		df.appendChild(dd);
		return df;

		function el(name,text){
			var ret=document.createElement(name);
			ret.textContent=text;
			return ret;
		}
	},
	getColor:function(ip){
		var arr=ip.split(/\./);
		return "rgb("+Math.floor(parseInt(arr[0])*0.75)+", "+
		Math.floor(parseInt(arr[1])*0.75)+", "+
		Math.floor(parseInt(arr[2])*0.75)+")";
	},
}


function HighChatMaker(infobar){
	this.gyoza1_on=null;	//mouseoverがonになっているか
	this.gyozas=["餃子無展開","餃子オンマウス","餃子常時"];
	this.infobar=infobar;
	if(!infobar){
		this.infobar=document.createElement("div");
	}
	this.init();

	this.setGyoza(localStorage.soc_highchat_gyoza ? localStorage.soc_highchat_gyoza : 0);
	
}
HighChatMaker.prototype=new LineMaker();
HighChatMaker.prototype.init=function(){
	//infobar
	while(this.infobar.firstChild)this.infobar.removeChild(this.infobar.firstChild);
	
	this.gyozab=document.createElement("button");
	this.gyozab.textContent=this.gyozas[this.gyoza];
	this.gyozab.classList.add("gyozainfo");
	
	this.gyozab.addEventListener("click",this.gyozabutton.bind(this),false);
	this.infobar.appendChild(this.gyozab);
};
HighChatMaker.prototype.make=function(obj){
	var df=LineMaker.prototype.make.apply(this,arguments);
	var parse=_parse.bind(this);
	
	var dd=df.childNodes.item(1);
	parse(dd);
	return df;
	
	function _parse(node){
		if(node.nodeType==Node.TEXT_NODE){
			//テキストノード
			var v=node.nodeValue;
			var result;
			//[s]の解析
			result=v.match(/^(.*)\[s\](.*?)(\[\/s\].*)?$/);
			if(result){
				var dff=document.createDocumentFragment();
				if(result[1]){
					dff.appendChild(document.createTextNode(result[1]));
				}
				if(result[2]){
					var span=document.createElement("span");
					span.textContent=result[2];
					span.classList.add("s");
					dff.appendChild(span);
				}
				if(result[3]){
					dff.appendChild(document.createTextNode(result[3].slice(4)));
				}
				parse(dff);
				node.parentNode.replaceChild(dff,node);
				return;
			}
			//[small]の解析
			result=v.match(/^(.*)\[small\](.*?)(\[\/small\].*)?$/);
			if(result){
				if(result[1]){
					dff.appendChild(document.createTextNode(result[1]));
				}

				var dff=document.createDocumentFragment();
				if(result[1]){
					dff.appendChild(document.createTextNode(result[1]));
				}
				if(result[2]){
					var span=document.createElement("span");
					span.textContent=result[2];
					span.classList.add("small");
					dff.appendChild(span);
				}
				if(result[3]){
					dff.appendChild(document.createTextNode(result[3].slice(8)));
				}
				parse(dff);
				node.parentNode.replaceChild(dff,node);
				return;
			}
			//URLの解析
			if(!node.parentNode || node.parentNode.nodeName.toLowerCase()!="a"){
				result=v.match(/^(.*?)(https?:\/\/\S+)(.*)$/);
				if(result){
					var dff=document.createDocumentFragment();
					if(result[1]){
						dff.appendChild(document.createTextNode(result[1]));
					}
					var result2=result[2].match(/^http:\/\/gyazo\.com\/([0-9a-f]{32})(?:\.png)?(.*)$/);
					if(result2){
						//[Gyazo]
						var a=document.createElement("a");
						a.target="_blank";
						a.href="http://gyazo.com/"+result2[1]+".png";
						a.classList.add("gyoza");
						if(this.gyoza==2){
							//餃子常時展開
							var img=document.createElement("img");
							img.src="http://img.gyazo.com/a/"+result2[1]+".png";
							img.classList.add("thumbnail");
							a.appendChild(img);
						}else{
							a.textContent="[Gyazo]";
						}
						dff.appendChild(a);
						if(result2[2]){
							dff.appendChild(document.createTextNode(result2[2]));
						}
					}else{
					
						if(result[2]){
							var a=document.createElement("a");
							a.target="_blank";
							a.href=result[2];
							a.textContent=result[2];
							dff.appendChild(a);
						}
					}
					if(result[3]){
						dff.appendChild(document.createTextNode(result[3]));
					}
					parse(dff);
					node.parentNode.replaceChild(dff,node);
					return;
				}
				
				if(result=v.match(/^(.*)#(\d{4})(.*)$/)){
					var dff=document.createDocumentFragment();
					if(result[1]){
						dff.appendChild(document.createTextNode(result[1]));
					}
					if(result[2]){
						var a=document.createElement("a");
						a.target="_blank";
						a.href="http://81.la/"+result[2];
						a.textContent="#"+result[2];
						dff.appendChild(a);
					}
					if(result[3]){
						dff.appendChild(document.createTextNode(result[3]));
					}
					parse(dff);
					node.parentNode.replaceChild(dff,node);
					return;
				}
				
			}
		}else if(node.childNodes){
			var nodes=[];
			for(var i=0,l=node.childNodes.length;i<l;i++){
				nodes.push(node.childNodes[i]);
			}
			nodes.forEach(function(x){
				if(x.parentNode.isSameNode(node))
					parse(x);
			});
		}
	}
};
HighChatMaker.prototype.setGyoza=function(gyoza){
	this.gyoza=localStorage.soc_highchat_gyoza=gyoza%this.gyozas.length;
	this.gyozab.textContent=this.gyozas[this.gyoza];

	if(this.gyoza==1 && !this.gyoza1_on){
		this.gyoza1_on=this.gyozamouse.bind(this);
		document.addEventListener("mouseover",this.gyoza1_on,false);
	}else if(this.gyoza!=1 && this.gyoza1_on){
		document.removeEventListener("mouseover",this.gyoza1_on,false);
		this.gyoza1_on=null;
	}
};
HighChatMaker.prototype.gyozabutton=function(e){
	this.setGyoza(this.gyoza+1);
};
HighChatMaker.prototype.gyozamouse=function(e){
	var t=e.target;
	if(t.classList.contains("gyoza")){
		var result=t.href.match(/^http:\/\/gyazo\.com\/([0-9a-f]{32})\.png$/);
		if(!result)return;
		var img=document.createElement("img");
		img.src="http://img.gyazo.com/a/"+result[1]+".png";
		
		img.addEventListener("load",ev,false);
		img.style.display="none";
		t.textContent="[Gyoza...]";
		t.appendChild(img);
	}
	
	function ev(e){
		t.removeChild(t.firstChild);
		img.style.display="";
	}
};

function SocketChat(log,info,infobar){
	this.logid=log,this.infoid=info,this.infobarid=infobar;
	
	this.oldest_time=null;
	this.flags={"sound":true};
}
SocketChat.prototype={
	init:function(){
		this.log=document.getElementById(this.logid);
		this.info=document.getElementById(this.infoid);
		this.users=this.info.getElementsByClassName("users")[0];
		this.usernumber=this.info.getElementsByClassName("usernumber")[0];
		this.line=new HighChatMaker(document.getElementById(this.infobarid));
		
		this.usernumber.dataset.actives=this.usernumber.dataset.roms=0;
		this.bots=[];
		
		this.responding_to=null;	//dd
		
		//Audio
		if(this.flags.sound){
			var audio;
			var soundSource=[
				["./sound.ogg", "audio/ogg"],
				["./sound.mp3", "audio/mp3"],
				["./sound.wav", "audio/wav"]
			];
			try{
				audio=new Audio();
				audio.removeAttribute("src");
				soundSource.forEach(function(arr){
					var source=document.createElement("source");
					source.src=arr[0];
					source.type=arr[1];
					audio.appendChild(source);
				});
			}catch(e){
				audio={play:function(){}};
			}
			this.audio=audio;
		}
		
		//Responding tip
		this.responding_tip=document.createElement("span");
		this.responding_tip.textContent="⇒";
		this.responding_tip.classList.add("responding_tip");
		
		var socket;
		socket=this.socket = io.connect(location.origin);
		
		socket.on("init",this.loginit.bind(this));
		socket.on("log",this.recv.bind(this));
		socket.on("users",this.userinit.bind(this));
		socket.on("userinfo",this.userinfo.bind(this));
		socket.on("mottoResponse",this.mottoResponse.bind(this));
		socket.on("idresponse",this.idresponse.bind(this));
		socket.on("disconnect",this.disconnect.bind(this));
		socket.on("newuser",this.newuser.bind(this));
		socket.on("deluser",this.deluser.bind(this));
		socket.on("inout",this.inout.bind(this));
		
		/*document.forms["inout"].addEventListener("submit",this.submit.bind(this),false);
		document.forms["comment"].addEventListener("submit",this.submit.bind(this),false);*/
		document.addEventListener("submit",this.submit.bind(this),false);
		
		this.log.addEventListener('click',this.click.bind(this),false);
		
		if(localStorage.socketchat_name){
			document.forms["inout"].elements["uname"].value=localStorage.socketchat_name;
		}
		
		var hottomottob=document.getElementsByClassName("logs")[0].getElementsByClassName("hottomottobutton")[0];
		hottomottob.addEventListener("click",this.HottoMotto.bind(this),false);
		
		socket.emit("regist",{"mode":"client"});
	},
	loginit:function(data){
		data.logs.reverse().forEach(function(line){
			this.write(line);
		},this);
		if(data.logs.length)this.oldest_time=data.logs.shift().time;
	},
	recv:function(obj){
		this.bots.forEach(function(func){func(obj,this)},this);
		if(this.flags.sound){
			this.audio.play();
		}
		this.write(obj);
	},
	write:function(obj){
		this.log.insertBefore(this.line.make(obj),this.log.firstChild);
	},
	//誰かが来た
	newuser: function(user){
		console.log("newuser", user);
		var li=document.createElement("li");
		var sp=document.createElement("span");
		sp.textContent=user.name;
		sp.title=user.ip+" / "+user.ua;
		li.dataset.id=user.id;
		if(user.rom){
			li.classList.add("rom");
			this.setusernumber(0, 1);
		}else{
			this.setusernumber(1, 0);
		}
		
		li.appendChild(sp);
		this.users.appendChild(li);
	},
	getuserelement: function(id){
		var ul=this.users.childNodes;
		for(var i=0, l=ul.length; i<l; i++){
			if(ul[i].dataset.id==id){
				return ul[i];
			}
		}
		return null;
	},
	//誰かがお亡くなりに
	deluser: function(id){
		console.log("deluser", id);
		var elem=this.getuserelement(id);
		if(!elem) return;
		
		var actives=this.usernumber.dataset.actives, roms=this.usernumber.dataset.roms;
		if(elem.classList.contains("rom")){
			this.setusernumber(0, -1);
		}else{
			this.setusernumber(-1, 0);
		}
		this.users.removeChild(elem);
	},
	//最初にユーザリストを得る
	userinit:function(obj){
		console.log("userinit", obj);
		while(this.users.firstChild)this.users.removeChild(this.users.firstChild);//textNode消す
		
		obj.users.forEach(this.newuser, this);
		//this.setusernumber(obj.actives, obj.roms);
	},
	//人数をセットして反映
	setusernumber: function(actives, roms){
		var dataset=this.usernumber.dataset;
		dataset.actives=parseInt(dataset.actives)+actives;
		dataset.roms=parseInt(dataset.roms)+roms;
		this.usernumber.textContent="入室"+dataset.actives+(dataset.roms!=0? " (ROM"+dataset.roms+")":"");
	},
	//誰かが入退室
	inout: function(obj){
		console.log("inout", obj);
		var elem=this.getuserelement(obj.id);
		if(!elem)return;
		elem.firstChild.textContent=obj.name;
		if(obj.rom){
			elem.classList.add("rom");
			this.setusernumber(-1, 1);
		}else{
			elem.classList.remove("rom");
			this.setusernumber(1, -1);
		}
	},
	//自分が入退室
	userinfo:function(obj){
		var f=document.forms["inout"];
		f.elements["uname"].disabled=!obj.rom;
		
		var result=document.evaluate('descendant::input[@type="submit"]',f,null,XPathResult.ANY_UNORDERED_NODE_TYPE,null);
		var bt=result.singleNodeValue;
		bt.value=obj.rom?"入室":"退室";
		this.inout(obj);
	},
	mottoResponse:function(data){
		data.logs.forEach(function(line){
			this.log.appendChild(this.line.make(line));
		},this);
		if(data.logs.length)this.oldest_time=data.logs.pop().time;
	},
	HottoMotto:function(e){
		this.socket.emit("motto",{"time":this.oldest_time});
	},
	
	submit:function(e){
		var f=e.target;
		if(f.name=="inout"){
			//入退室
			var el=f.elements["uname"];
			this.socket.emit("inout",{"name":el.value});
			
			localStorage.socketchat_name=el.value;
		}else if(f.name=="comment"){
			//発言
			var el=f.elements["comment"];
			this.sayform(f);
			el.value="";
			f.elements["response"].value="";
			this.responding_tip.parentNode && this.responding_tip.parentNode.removeChild(this.responding_tip);
		}
		e.preventDefault();
	},
	sayform:function(f){
		this.say(f.elements["comment"].value,f.elements["response"].value);
	},
	say:function(comment,response){
		this.socket.emit("say",{"comment":comment,"response":response?response:""});
	},
	
	bot:function(func){
		this.bots.push(func);
	},
	click:function(e){
		var t=e.target;
		if(t.isSameNode(this.responding_tip)){
			e.stopPropagation();
			
			document.forms["comment"].elements["response"].value=this.responding_tip.dataset.to;
			document.forms["comment"].elements["comment"].focus();
			this.responding_tip.classList.add("checked");
			return;
		}
		var dd=document.evaluate('ancestor-or-self::dd',t,null,XPathResult.ANY_UNORDERED_NODE_TYPE,null).singleNodeValue;
		if(!dd){

			this.responding_tip.parentNode && this.responding_tip.parentNode.removeChild(this.responding_tip);
			return;
		}
		if(dd.classList.contains("respto") && dd.dataset.open!="open"){
			//開く
			this.responding_to=dd;
			this.socket.emit("idrequest",{"id":dd.dataset.respto});
			dd.dataset.open="open";
			return;
		}
		//コメント
		this.responding_tip.classList.remove("checked");

		document.forms["comment"].elements["response"].value="";
		dd.appendChild(this.responding_tip);
		this.responding_tip.dataset.to=dd.dataset.id;
	},
	idresponse:function(data){
		if(!this.responding_to || !data)return;
		var line=this.line.make(data);
		for(var i=0,l=line.childNodes.length;i<l;i++){
			line.childNodes[i].classList && line.childNodes[i].classList.add("resp");
		}
		var r=this.responding_to;
		r.parentNode.insertBefore(line,r.nextSibling);
		
	},
	disconnect:function(){
		document.body.classList.add("discon");
	}
};
