var express = require("express");
var app     = express();
var path    = require("path");
var server = require('http').Server(app);
var io = require('socket.io')(server);
var socket_manager = require('./server/socket-manager')(io);
var ip = require('ip');

var address = ip.address();
var port = '80';
var client_web_dir = 'client-web/dist';

app.use('/client-web', express.static(__dirname + '/client-web'));
app.use('/bower_components', express.static(__dirname + '/bower_components'));
app.use('/html', express.static(__dirname + '/client-web/dist/html'));

app.get('/',function(req,res){
  // res.sendFile(path.join(__dirname+ '/' + client_web_dir + '/index.html'));
  res.sendFile(path.join(__dirname+ '/' + client_web_dir + '/index.html'));
});

server.listen(port);

console.log("Running at: " + address + ":" + port);
