var fs = require('fs');
var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({port: 6458});

console.log(process.cwd());

fs.exists('../database', function(exists) {
	if(!exists){
		fs.writeFile("../database", JSON.stringify({}), function(err){
			if(err){
				console.log(err);
			} else{
				console.log("The file was saved!");
			}
		});
	}

});

wss.on('connection', function(ws){
    ws.on('message', function(message){
        console.log('received: %s', message);
		ws.send(message);
    });
});