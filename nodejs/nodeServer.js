var fs = require('fs');
var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({port: 6458});

var clients=[];

var showing=false;
var ticker={
speed:40,
text:"No Data to Display",
color:"#ffffff",
bgColor:"#000000"
}
var spool={
speed:20,
titles:["","",""],
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
var grand=["Grand Prize","Trip for two","Jonathan Rivas"];

var raw;

fs.exists('../database', function(exists){
	var flag;
	if(!exists){
		saveDb();
		console.log("New database created");
	} else{
		var raw = JSON.parse(fs.readFileSync('../database', 'utf8'));
		if(raw.spool&&raw.ticker&&raw.grand){
			spool=raw.spool;
			ticker=raw.ticker;
			grand=raw.grand;
			showing=raw.showing;
			console.log("Loaded from Database");
		} else{
			saveDb();
		}
	}
});

function saveDb(){
	fs.writeFile("../database", JSON.stringify({spool:spool, ticker:ticker, grand:grand, showing:showing}), function(err){
		if(err){
			console.log(err);
		} else{
			console.log("Database saved");
		}
	});
}

wss.on('connection', function(ws){
	console.log("Connection");
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