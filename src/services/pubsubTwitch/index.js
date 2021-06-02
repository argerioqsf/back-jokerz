var axios = require('axios');
const jwt = require('jsonwebtoken');
const token = 'dllmgt1cup52pyalt7ggnflyi8r2hl';
var state = 'jokerz';
let ws;
const WebSocket = require('ws');

const heartbeat = ()=>{
    let message = {
        type: 'PING'
    };
    // $('.ws-output').append('SENT: ' + JSON.stringify(message) + '\n');
    console.log('SENT: ' + JSON.stringify(message));
    ws.send(JSON.stringify(message));
}

const unlisten = (topic)=>{
    let message = {
        type: 'UNLISTEN',
        nonce: state,
        data: {
            topics: [topic],
            auth_token: token
        }
    };
    // $('.ws-output').append('SENT: ' + JSON.stringify(message) + '\n');
    console.log('SENT: ' + JSON.stringify(message));
    return ws.send(JSON.stringify(message));
}

const listen = (topic)=>{
    let message = {
        type: 'LISTEN',
        nonce: state,
        data: {
            topics: [topic],
            auth_token: token
        }
    };
    // $('.ws-output').append('SENT: ' + JSON.stringify(message) + '\n');
    console.log('SENT: ' + JSON.stringify(message));
    return ws.send(JSON.stringify(message));
}

const connect = ()=>{
    var heartbeatInterval = 1000 * 60; //ms between PING
    var reconnectInterval = 1000 * 3; //ms to wait before reconnect
    var heartbeatHandle;

    ws = new WebSocket('wss://pubsub-edge.twitch.tv');

    ws.onopen = function(event) {
        console.log("INFO: Socket Opened");
        heartbeat();
        heartbeatHandle = setInterval(heartbeat, heartbeatInterval);
        // listen('channel-points-channel-v1.427822134');
    };

    ws.onerror = function(error) {
        console.log('ERR:  ' + JSON.stringify(error));
    };

    ws.onmessage = function(event) {
        let message = JSON.parse(event.data);
        if (message.type == 'RECONNECT') {
            console.log('INFO: Reconnecting...');
            setTimeout(connect, reconnectInterval);
        }else{
            if (message.data && message.data.message) {
                console.log("message json: ",JSON.parse(message.data.message));
            } else {
                console.log("message text: ",message);
            }
        }
    };

    ws.onclose = function() {
        console.log('INFO: Socket Closed');
        clearInterval(heartbeatHandle);
        console.log('INFO: Reconnecting...');
        setTimeout(connect, reconnectInterval);
    };

}

module.exports = {
    connect,
    listen,
    unlisten
}