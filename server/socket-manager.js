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
    socket.on('startGame', startGame);
    socket.on('sendResponse', newResponse);
    socket.on('sendVote', newVote);
    socket.on('startNewQuestion', newQuestion);
    socket.on('endGame', endGame);

    emitData(socket, 'connectConfirm', player);

    socket.on('disconnect', function(){
        if (player.lobby_id !== null || player.lobby_id !== undefined) {
            var lobby = getLobby(socket, player.lobby_id, 'NO_EVENT');
            if (lobby === null) return;
            lobby.playerDisconnected(player);
            if(player.ishost){
                emitRoomData(socket_manager.io.sockets, player.lobby_id, 'destroyLoby', player);
                delete socket_manager.lobbys[player.lobby_id];
            } else {
                emitRoomData(socket_manager.io.sockets, player.lobby_id, 'removePlayer', player);
            }
        }
        delete socket_manager.players[player.id];
        console.log(player.id = " disconnected");
    });
}

/// SOCKET RESPONSE FUNCTIONS ///

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

function startGame(data) {
     var hostsocket = getSocket(data.host.id);
     var host = getPlayer(hostsocket, data.host.id, 'gameStartFailed');
     var lobby = getLobby(hostsocket, data.host.lobby_id, 'gameStartFailed');

     if (hostsocket === null || host === null) return;
     if (lobby === null) return;

     lobby.responses = {};

     console.log('Host: ' + host.id + ' has started a game in Lobby: ' + host.lobby_id);
     lobby.startGame();
     emitRoomData(socket_manager.io.sockets, host.lobby_id, 'gameStarted', {questions: getQuestionArray(data.num_questions)});
}

function newResponse(data){
    var player = data.player;
    var playersocket = getSocket(player.id);
    var lobby = getLobby(playersocket, data.player.lobby_id);

    if (player === null || playersocket === null) return;
    if (lobby === null) return;

    var res = {
        id : player.id,
        name : player.name,
        response : data.response,
        votes : 0
    };

    lobby.responses[player.id] = res;

    emitRoomData(socket_manager.io.sockets, player.lobby_id, 'newResponse', res);
}

function newVote(data){
    var player = data.player;
    var playersocket = getSocket(player.id);
    var lobby = getLobby(playersocket, player.lobby_id);

    if (player === null || playersocket === null) return;
    if (lobby === null) return;

    lobby.responses[data.vote].vote += 1;

    emitRoomData(socket_manager.io.sockets, player.lobby_id, 'newVote', {vote : data.vote});
}

function newQuestion(data){
    var player = data.player;
    var playersocket = getSocket(player.id);
    var lobby = getLobby(playersocket, player.lobby_id);

    if (player === null || playersocket === null) return;
    if (lobby === null) return;

    lobby.responses = {};

    emitRoomData(socket_manager.io.sockets, player.lobby_id, 'newQuestion', {});
}

function endGame(data){
    var player = data.player;
    var playersocket = getSocket(player.id);
    var lobby = getLobby(playersocket, player.lobby_id);

    if (player === null || playersocket === null) return;
    if (lobby === null) return;

    lobby.responses = {};

    emitRoomData(socket_manager.io.sockets, player.lobby_id, 'gameEnded', {});
}

/// UTIL FUNCTIONS ///
function hasLobbyCode(code){
    return socket_manager.lobbys.hasOwnProperty(code);
}

function getPlayer(socket, id, response_event){
    var player = socket_manager.players[id];

    if (player === null || player === undefined) {
        console.log("ERR: INEXISTANT PLAYER: "+ id +" ATTEMPTING TO CREATE LOBBY");
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

function getQuestionArray(num_questions){
    var indices = [];

    while (indices.length < num_questions) {
        var new_i = Math.floor(Math.random() * QUESTION_COUNT);
        if (indices.indexOf(new_i) == -1) {
            indices.push(new_i);
        }
    }

    var questions = [];

    for (var i = 0; i < indices.length; i++) {
        questions.push(QUESTION_ARRAY[indices[i]]);
    }

    return questions;
}

var QUESTION_ARRAY = [
        'What is the worst thing to accidentally text your mother?',
        'What is the worst thing to find under your bed?',
        'What is the worst thing to do in an elevator?',
        'Where is the worst place to store a dead body?',
        'What is the worst thing to tell an officer after getting pulled over?',
        'What is the worst way to get arrested?',
        'What is the worst thing to tell a customs officer?',
        'What is the worst thing to say at dinner at your in-laws?',
        'What is the worst "accomplishment" to put on your resume?',
        'What is the worst compliment to receive?',
        'Who is the worst famous person to be stuck with on a desert island? Bonus: why?',
        'Who is the worst person to run the country?',
        'What is the worst sandwich?',
        'What\'s the worst premise for a movie?',
        'What is the worst excuse for missing an exam?',
        'What is the worst excuse for being late?',
        'What is the worst way to announce to someone they have a terminal illness?',
        'What is the worst way to propose to your significant other?',
        'What is the worst date idea?',
        'What is the worst way to end a relationship?',
        'What is the worst movie to watch on a first date?',
        'What is the worst thing to lose?',
        'What animal would make the worst pet?',
        'What is the worst sports franchise?',
        'What is the worst thing to say after sex?',
        'Worst pickup line?',
        'What is the worst event to announce using a postcard?',
        'What is the worst thing that could happen at your wedding?',
        'What is the worst way to crash a party?',
        'What is the worst weapon?',
        'What is the worst smell?',
        'What is the worst thing to tell someone who just got dumped?',
        'What is the worst object to use as a tool to fell a tree?',
        'What is the worst thing to hear when waking up from an operation?',
        'What is worse than going to the dentist?',
        'Whats your worst nightmare?',
        'What good food would taste the worst over rice?',
        'Worst name to give to a cat?',
        'Worst thing to tell someone about to take a plane?',
        'Worst rock band name?',
        'What is the worst thing to drop?',
        'Worst superpower?',
        'Worst name for a super hero?',
        'Worst pornstar name?',
        'Worst reasont to sue someone?',
        'Worst time to lose wifi?',
        'Worst time to get a call from your mom?',
        'Worst subject to bring up at the dinner table?',
        'Worst thing to wear to a funeral?',
        'Worst thing to tell the widow at a funeral?',
        'Worst thing to talk about in a funeral eulogy?',
        'What is the worst thing to put in your mouth?',
        'Worst fast food burger name?',
        'Worst flavour of ice cream',
        'What is the worst thing to respond to "I love you"?',
        'Worst flavour of cake?',
        'What is the worst thing to drop on your toe?'
];

var QUESTION_COUNT = QUESTION_ARRAY.length;
