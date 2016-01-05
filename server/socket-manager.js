var Player = require('./objects/player.obj');
var Lobby = require('./objects/lobby.obj');
var Game = require('./objects/game.obj');

var socket_manager = {};

module.exports = function(io){
    socket_manager.io = io;
    socket_manager.lobbys = {};
    socket_manager.players = {};
    /// Event Liking ///
    io.on('connection', newConnection);

    return socket_manager;
};

/// RESPONSE FUNCTIONS ///

function newConnection(socket){
    if (socket_manager.players[socket.id] !== undefined) {
        console.log('ERR: PLAYER WITH ID ALREADY EXISTS');
        emitError(socket, 'connectConfirm', 'Player with connection id already exists');
    }

    console.log('New connection: ' + socket.id);
    var player = new Player(socket.id);
    socket_manager.players[player.id] = player;

    socket.on('createLobby', createLobby);
    socket.on('joinLobby', joinLobby);
    socket.on('kickPlayer', kickPlayer);

    emitData(socket, 'connectConfirm', player);

    socket.on('disconnect', function(){
        if (player.lobby_id !== null || player.lobby_id !== undefined) {
            var lobby = getLobby(socket, player.lobby_id, 'NO_EVENT');
            if (lobby === null) return;
            lobby.playerDisconnected(player);
            emitRoomData(socket_manager.io.sockets, player.lobby_id, 'removePlayer', player);
        }
        delete socket_manager.players[player.id];
        console.log(player.id = " disconnected");
    });
}

function createLobby(data){
    console.log('Lobby Create request recieved');
    var player = socket_manager.players[data.id];

    var socket = socket_manager.io.sockets.connected[data.id];
    if (socket === null || socket === undefined) {
        console.log("ERR: INEXISTANT SOCKET FOR PLAYER ATTEMPTING TO CREATE LOBBY");
        return;
    }

    if (player === null || player === undefined) {
        console.log("ERR: INEXISTANT PLAYER ATTEMPTING TO CREATE LOBBY");
        emitError(socket, 'lobbyCreated', 'Player with socket id does not exist');
        return;
    }

    player.name = data.name;
    player.ishost = true;

    var code = generateRandomString(5);
    while (hasLobbyCode(code)) {
        code = generateRandomString(5);
    }

    var lobby = new Lobby(code, player);
    socket_manager.lobbys[code] = lobby;

    socket.join(code);
    emitData(socket, 'lobbyCreated', {
        player : player,
        lobby : lobby
    });
    console.log('Lobby: ' + code + ' created');
}

function joinLobby(data){
    var socket = getSocket(data.id);
    var player = getPlayer(socket, data.id, 'lobbyJoined');
    var lobby = getLobby(socket, data.code, 'lobbyJoined');

    if (lobby === null || socket === null || player === null) return;

    player.name = data.name;
    lobby.addPlayer(player);
    emitRoomData(socket, data.code, 'playerJoined', player);
    socket.join(data.code);
    console.log('Player: ' + player.id + ' joined lobby: ' + data.code);
    emitData(socket, 'lobbyJoined', {
        player : player,
        lobby : lobby
    });
}

function kickPlayer(data){
    var hostsocket = getSocket(data.host.id);
    var playersocket = getSocket(data.player.id);
    var player = getPlayer(hostsocket, data.player.id, 'kickFailed');
    var host = getPlayer(hostsocket, data.host.id, 'kickFailed');

    if (hostsocket === null || host === null) return;

        emitRoomData(socket_manager.io.sockets, host.lobby_id, 'removePlayer', player);

        console.log('Player: ' + player.id + ' was kicked from lobby: ' + player.lobby_id);

    if (playersocket === null || player === null) return;

    playersocket.leave(host.lobby_id);
    player = new Player(player.id);
}

/// UTIL FUNCTIONS ///
function hasLobbyCode(code){
    return socket_manager.lobbys.hasOwnProperty(code);
}

function getPlayer(socket, id, response_event){
    var player = socket_manager.players[id];

    if (player === null || player === undefined) {
        console.log("ERR: INEXISTANT PLAYER ATTEMPTING TO CREATE LOBBY");
        emitError(socket, response_event, 'Player with socket id does not exist');
        return null;
    }

    return player;
}

function getLobby(socket, code, response_event) {
    var lobby = socket_manager.lobbys[code];

    if (lobby === null || lobby === undefined) {
        console.log("ERR: INEXISTANT PLAYER ATTEMPTING TO CREATE LOBBY");
        emitError(socket, response_event, 'Lobby with socket id does not exist');
        return null;
    }

    return lobby;
}

function getSocket(id){
    var socket = socket_manager.io.sockets.connected[id];

    if (socket === null || socket === undefined) {
        console.log("ERR: INEXISTANT SOCKET FOR PLAYER ATTEMPTING TO CREATE LOBBY");
        return null;
    }

    return socket;
}

function generateRandomString(size){
    var id = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    for( var i=0; i < size; i++ )
        id += possible.charAt(Math.floor(Math.random() * possible.length));

    return id;
}

function emitError(socket, event, errmsg){
    socket.emit(event, {
        data: null,
        err: true,
        errmsg: errmsg
    });
}

function emitData(socket, event, data){
    socket.emit(event, {
        data: data,
        err: false,
        errmsg: null
    });
}

function emitRoomData(socket, room, event, data){
    socket.to(room).emit(event, {
        data: data,
        err: false,
        errmsg: null
    });
}
