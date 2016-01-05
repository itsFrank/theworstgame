app.factory('$socket', function(){
    var socket_obj = {
        id : null,
        socket : null,
        connected : false
    };

    socket_obj.init = function(){
        socket_obj.socket = io.connect(window.location.host);
        socket_obj.socket.on("connectConfirm", function(data){
            socket_obj.connected = true;
            socket_obj.id = data.id;
            console.log('confirmed');
            console.log(data);
        });
    };

    socket_obj.createLobby = function(name){
        if (!socket_obj.connected) return;

        socket_obj.socket.emit("createLobby", {
            id : socket_obj.id,
            screen_name : name
        });
    };

    socket_obj.joinLobby = function(code, name){
        if (!socket_obj.connected) return;

        socket_obj.socket.emit("joinLobby", {
                id : socket_obj.id,
                screen_name : name,
                room_code : code
        });
    };

    return socket_obj;
});
