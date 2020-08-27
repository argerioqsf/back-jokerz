const tmi = require('tmi.js');
const moment = require('moment');

const opts = {
    options: {
        debug: true
    },
    connection: {
        reconnect: true,
        secure: true
    },
  identity: {
    username: 'bottesteargerio',
    password: 'oauth:t9kmvemmn6ahybzzmkqjug7h4wsv7w'
  },
  channels: [
  ]
};

const client = new tmi.client(opts);

function onMessageHandler (channel, userstate, msg, self) {

    if (self) { return; }
    
    let indexUser = usersOnChat.findIndex(user=>{
      return user.userName == userstate.username;
    });
  
    // console.log(`mensagem userstate:`,userstate);
    const commandName = msg.trim();
    const num = rollDice();
    if (/dudis/i.exec(commandName)) {
      client.say(channel, `@TeamJokerz`);
      console.log(`Dudis chamado`);
    }

    if (/duds/i.exec(commandName)) {
      client.say(channel, `@TeamJokerz`);
      console.log(`Dudis chamado`);
    }
  
    if (/!msg:/i.exec(commandName)) {
      let msg = commandName.split(':');
      console.log(msg[1]);
      client.say(channel, ` !resgatar mensagem ${msg[1]}`);
      console.log(`mensagem enviada`);
    }
    
    if (/!status:/i.exec(commandName)) {
      let username = commandName.split(':')[1].toLowerCase();
      let indexUserS = usersOnChat.findIndex(user=>{
        return user.userName.toLowerCase() == username.toLowerCase();
      });
      console.log(`indexUserS: `,indexUserS);
      if (indexUserS != -1) {
        let indexChannel = usersOnChat[indexUserS].channels.findIndex(ch=>{
          return ch.name == channel;
        });
        if (indexChannel != -1) {
          if (usersOnChat[indexUserS].channels[indexChannel].status) {
            client.say(channel, `${username} está online neste chat`);
          }else{
            client.say(channel, `${username} está offline neste chat`);
          }
        }else{
          client.say(channel, `${username} não está aqui`);
        }
      }else{
        client.say(channel, `${username} não está aqui`);
      }
      console.log(`* Executed ${commandName} command`);
    }
    
    if (commandName.split(':')[0] == '!join') {
      
      if (userstate.mod) {
        let channelJoin = commandName.split(':')[1].toLowerCase();
        client.join(channelJoin)
        .then((data) => {
          client.say(channel, `bot conectado no canal ${channelJoin}`);
        }).catch((err) => {
          console.log('err join: ',join);
          client.say(channel, `Houve algum erro no servidor e não foi possivel conectar no canal -> ${channelJoin}`);
        });
        console.log(`* Executed ${commandName} command`);
      }else{
        client.say(channel, `você não tem permição para esse comando neste canal join`);
      }
    }
  
    if (commandName.split(':')[0] == '!part') {
      
      if (userstate.mod) {
        let channelJoin = commandName.split(':')[1].toLowerCase();
        client.part(channelJoin)
        .then((data) => {
          client.say(channel, `bot desconectado do canal ${channelJoin}`);
        }).catch((err) => {
          console.log('err join: ',join);
          client.say(channel, `Houve algum erro no servidor e não foi possivel desconectar do canal -> ${channelJoin}`);
        });
        console.log(`* Executed ${commandName} command`);
      }else{
        client.say(channel, `você não tem permição para esse comando neste canal part`);
      }
    }
    
    switch (commandName) {
      case '!sair':
           client.say(channel, `Bot desligado`);
           client.disconnect();
           console.log(`* Executed ${commandName} command`);
           break;
      case '!teste':
           client.say(channel, `Teste PopCorn`);
           console.log(`* Executed ${commandName} command`);
           break;
      case '!sorte':
           client.say(channel, `Esse é o seu numero da sorte ${num}`);
           console.log(`* Executed ${commandName} command`);
           break;
      case '!clear':
           client.clear('teamjokerz');
           console.log(`* Executed ${commandName} command`);
           break;
      case '!points':
            if (indexUser != -1) {
              let user = usersOnChat[indexUser];
              let indexChannel = usersOnChat[indexUser].channels.findIndex(ch=>{
                return ch.name == channel;
              });
              console.log('indexChannel: ',indexChannel);
              if (indexChannel != -1) {
                let channelUser = usersOnChat[indexUser].channels[indexChannel];
                client.say(channel, `@${userstate.username}, tem ${channelUser.points} pipocas neste canal e ${user.points} pipocas totais PopCorn `);
                console.log(`* Executed ${commandName} command`);
              }
             else{
                client.say(channel, `@${userstate.username}, tem ${user.points} pipocas totais e 0 pipocas neste canal`);
                console.log(`* Executed ${commandName} command`);
              }
            }else{
              client.say(channel, `@${userstate.username} não encontrado`);
              console.log(`* Executed ${commandName} command`);
            }
            break;
      default:
          break;
    }
    
}

function onJoinHandler (channel, username, self) {
    console.info(username+' ENTROU ',);
    
    console.log('channel:',channel);
    let indexUser = usersOnChat.findIndex(user=>{
      return user.userName == username;
    });

    

    
    let user = {
      status:true,
      userName:username,
      channels:[
        {
          name:channel,
          status:true,
          points:0
        }
      ],
      points:0,
      onTime:moment().format('h:mm:ss'),
      offTime:0
    };
    
    if (indexUser == -1) {
      //Se nao tiver o usuário cadastrado ele cadastra o usuario
      usersOnChat = [
        ...usersOnChat,
        user
      ]
      console.log('user:',user);
    }else{
      usersOnChat[indexUser].status = true;
      usersOnChat[indexUser].onTime = moment().format('h:mm:ss');
      let indexChannel = usersOnChat[indexUser].channels.findIndex(ch=>{
        return ch.name == channel;
      });
      //Se nao tiver o canal cadastrado ele cadastra o canal no usuario
      if (indexChannel == -1) {
        usersOnChat[indexUser].channels = [
          ...usersOnChat[indexUser].channels,
          {
            name:channel,
            status:true,
            points:0
          }
        ]
        console.log('user:',usersOnChat[indexUser]);
      }else{
        //Se tiver o canal ele so atualiza o status do usuario pra verdadeiro
        usersOnChat[indexUser].channels[indexChannel].status = true;
        console.log('user:',usersOnChat[indexUser]);
      }
    }
    // console.log('username:',username);
}

client.connect()
.then((data) => {
    console.log('bot conectado na twitch');
}).catch((err) => {
    console.log('erro ao conectar o bot na twitch');
});;

module.exports = client;