console.log("Version 2.4");
console.log("Created by Bryce J. Meyer");
console.log("https://brycejmeyer.com/");
console.log("For Disabled Sports Eastern Sierra");
console.log("");
console.log("Open controls.html in a browser to start");
console.log("");

var opened;
var openInterval=setInterval(function(){
	if(!opened){
		console.log("");
		console.log("Open controls.html in a browser to start");
		console.log("");
	} else{
		clearInterval(openInterval);
	}
}, 7000);

var fs = require('fs');
var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({port: 6458});

var clients=[];

var showing=[true];
var ticker={
enable:true,
go:true,
speed:70,
position:"bottom",
text:"",
color:"#ffffff",
bgColor:"#000000"
}
var spool={
go:true,
speed:70,
padding:40,
showing:[0,1],
titles:["","Raffle 1","Raffle 2"],
prizes:[[
	{
	number:"",
	description:"",
	winner:"",
	collected:false
	}
],[
	{
	number:731,
	description:"Buff Gator",
	winner:"",
	collected:false
	},{
	number:732,
	description:"Another Buff Gator",
	winner:"",
	collected:true
	}
],[
	{
	number:831,
	description:"Gift Card",
	winner:"",
	collected:false
	},{
	number:832,
	description:"Another Gift Card",
	winner:"",
	collected:true
	}
]
],
color:"#ffffff",
bgColor1:"#282828",
bgColor2:"#222222"
};
var grand=["Grand Prize","Trip For Two","Jhon Doe"];

var raw;

fs.exists('database', function(exists){
	var flag;
	if(!exists){
		saveDb();
		log("New database created");
	} else{
		var raw = JSON.parse(fs.readFileSync('database', 'utf8'));
		if(raw.spool&&raw.ticker&&raw.grand){
			spool=raw.spool;
			ticker=raw.ticker;
			grand=raw.grand;
			showing=raw.showing;
			spool.go=true;
			ticker.go=true;
			log("Loaded from database");
		} else{
			saveDb();
		}
	}
});

function saveDb(){
	fs.writeFile("database", JSON.stringify({spool:spool, ticker:ticker, grand:grand, showing:showing}), function(err){
		if(err){
			log(err);
		} else{
			log("Database saved");
		}
	});
}
function log(text){
	var time=new Date();
	console.log("["+("0"+Number(time.getHours())).slice(-2)+":"+("0"+Number(time.getMinutes())).slice(-2)+":"+("0"+Number(time.getSeconds())).slice(-2)+"] "+text);
}
wss.on('connection', function(ws){
	opened=true;
	log("Connection");
	clients.push({ws:ws});
	if(ws) ws.send(JSON.stringify({type:"update", spool:spool, ticker:ticker, grand:grand, showing:showing}));
    ws.on('message', function(message){
		var com=JSON.parse(message);
		if(com.type=="update"){
			if(com.spool) spool=com.spool;
			if(com.ticker) ticker=com.ticker;
			if(com.grand) grand=com.grand;
			if(com.showing) showing=com.showing;
			saveDb();
			for(i=0;i<clients.length;i++){
				if(clients[i].ws) clients[i].ws.send(JSON.stringify({type:"update", spool:spool, ticker:ticker, grand:grand, showing:showing}));
			}
		} else if(com.type=="debug"){
			for(i=0;i<clients.length;i++){
				if(clients[i].ws) clients[i].ws.send(JSON.stringify({type:"debug", debug:com.debug}));
			}
		}
    });
	ws.onclose = function(event){
		for(var i=0;i<clients.length;i++){
			if(clients[i].ws==ws){
				clients.splice(i, 1);
			}
		}
	}
});
