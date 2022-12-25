const authController = require("../../controllers/auth/authController");
let ws;
let reconnect = true;
const WebSocket = require("ws");

const heartbeat = () => {
  let message = {
    type: "PING",
  };
  // $('.ws-output').append('SENT: ' + JSON.stringify(message) + '\n');
  console.log("SENT: " + JSON.stringify(message));
  ws.send(JSON.stringify(message));
};

const unlisten = (topic, token, id_user) => {
  let message = {
    type: "UNLISTEN",
    nonce: JSON.stringify({ id_user: id_user, type: "UNLISTEN" }),
    data: {
      topics: [topic],
      auth_token: token,
    },
  };
  // $('.ws-output').append('SENT: ' + JSON.stringify(message) + '\n');
  console.log("SENT: " + JSON.stringify(message));
  return ws.send(JSON.stringify(message));
};

const listen = (topic, token, id_user) => {
  console.log("foi 6");
  let message = {
    type: "LISTEN",
    nonce: JSON.stringify({ id_user: id_user, type: "LISTEN" }),
    data: {
      topics: [topic],
      auth_token: token,
    },
  };
  // $('.ws-output').append('SENT: ' + JSON.stringify(message) + '\n');
  console.log("SENT: " + JSON.stringify(message));
  return ws.send(JSON.stringify(message));
};

const connect = () => {
  return new Promise((resolve, reject) => {
    var heartbeatInterval = 1000 * 60; //ms between PING
    var reconnectInterval = 1000 * 3; //ms to wait before reconnect
    var heartbeatHandle;
    reconnect = true;

    ws = new WebSocket("wss://pubsub-edge.twitch.tv");

    ws.onopen = async function (event) {
      console.log("INFO: Socket Opened");
      heartbeat();
      heartbeatHandle = setInterval(heartbeat, heartbeatInterval);
      // await pessoasController.setPersonSyncPointsInitial();
      return resolve(true);
      // return true;
      // listen('channel-points-channel-v1.427822134');
    };

    ws.onerror = function (error) {
      console.log("ERR:  " + JSON.stringify(error));
      console.log("ERR:  ", error);
      return resolve(false);
      // return false;
    };

    ws.onmessage = async function (event) {
      let message = JSON.parse(event.data);
      if (message.type == "RECONNECT") {
        console.log("INFO: Reconnecting...");
        setTimeout(connect, reconnectInterval);
      } else {
        console.log("message json: ", message);
        if (message.data && message.data.message) {
          // console.log("message json: ",JSON.parse(message.data.message));
          let data = JSON.parse(message.data.message);
          data = data.data;
          let topic_split = message.data.topic;
          topic_split = topic_split.split(".");
          let id_channel = topic_split[1];
          let topic = topic_split[0];
          if (message.type == "MESSAGE") {
            // console.log('topic_split: ',topic_split);
            // console.log('id_channel: ',id_channel);
            // console.log('topic: ',topic);
            // console.log('data: ',data.redemption);
            let reward = {
              cost: data.redemption.reward.cost,
              name_user: data.redemption.user.login,
              id_twitch_user: data.redemption.user.id,
              reward_id: data.redemption.reward.id,
              redemption_id: data.redemption.id,
              id_twitch_streamer: data.redemption.channel_id,
            };
            // console.log('reward: ',reward);
            const pointsController = require("../../controllers/points/pointsController");
            await pointsController.addpoints(reward);
          }
        } else {
          // console.log("message text: ",message);

          const pessoasController = require("../../controllers/pessoas/pessoasController");

          if (message.type == "RESPONSE") {
            if (message.error == "ERR_BADAUTH") {
              console.log("token atualizando 1");
              let nonce = JSON.parse(message.nonce);
              console.log("nonce: ", nonce);
              let id_user = nonce.id_user;
              await pessoasController.changePointsSyncTwitch(id_user, false);
              await authController.refreshToken(id_user);
              console.log("token atualizado do id_user: ", id_user);
            }

            if (message.error.length == 0) {
              if (message.nonce.length > 0) {
                let nonce = JSON.parse(message.nonce);
                // console.log("nonce: ",nonce);
                if (nonce.type == "LISTEN") {
                  await pessoasController.changePointsSyncTwitch(
                    nonce.id_user,
                    true
                  );
                }
                if (nonce.type == "UNLISTEN") {
                  await pessoasController.changePointsSyncTwitch(
                    nonce.id_user,
                    false
                  );
                }
              }
            }
          }
        }
      }
    };

    ws.onclose = function () {
      console.log("INFO: Socket Closed");
      clearInterval(heartbeatHandle);
      if (reconnect) {
        console.log("INFO: Reconnecting...");
        setTimeout(connect, reconnectInterval);
      } else {
        console.log("INFO: Aguardando nova conexão");
      }
    };
  });
};

const desconnect = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      reconnect = false;
      await ws.close();
      resolve(true);
    } catch (error) {
      resolve(false);
    }
  });
};

module.exports = {
  connect,
  listen,
  unlisten,
  desconnect,
};
