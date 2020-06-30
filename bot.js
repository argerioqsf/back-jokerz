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
    '#teamjokerz'
  ]
};

let usersOnChat = [];

const client = new tmi.client(opts);

client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);
client.on('join', onJoinHandler);
client.on("notice", onNoticeHandler);
client.on("logon", onLogonHandler);
client.on("part", onPartHandler);
client.connect();


function onMessageHandler (channel, userstate, msg, self) {
  if (self) { return; }
  
  let indexUser = usersOnChat.findIndex(user=>{
    return user.userName == userstate.username && user.channel == channel;
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

  if (/argério/i.exec(commandName)) {
    client.say(channel, `${userstate.username} Não diga o nome do mestre em vão...`);
    console.log(`Não diga o nome do mestre em vão...`);
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
      return user.userName.toLowerCase() == username.toLowerCase() && user.channel == channel;
    });
    console.log(`indexUserS: `,indexUserS);
    if (indexUserS != -1) {
      let indexChannel = usersOnChat[indexUserS].channel.findIndex(ch=>{
        return ch.name == channel;
      });
      client.say(channel, `${username} está online neste chat`);
    }else{
      client.say(channel, `${username} não está online neste chat`);
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

  if (/argerio/i.exec(commandName)) {
    client.say(channel, `${userstate.username} Não diga o nome do mestre em vão...`);
    console.log(`Não diga o nome do mestre em vão...`);
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
          user = usersOnChat[indexUser];
          client.say(channel, `@${userstate.username},  ${userstate.username} tem ${user.points} Pipocas PopCorn `);
          console.log(`* Executed ${commandName} command`);
          break;
        }else{
          client.say(channel, `@${userstate.username} não encontrado`);
          console.log(`* Executed ${commandName} command`);
          break;
        }
    case '!amendoins':
        if (indexUser != -1) {
          user = usersOnChat[indexUser];
          client.say(channel, `@${userstate.username},${userstate.username} tem ${user.points} Pipocas PopCorn `);
          console.log(`* Executed ${commandName} command`);
          break;
        }else{
          client.say(channel, `@${userstate.username} não encontrado`);
          console.log(`* Executed ${commandName} command`);
          break;
        }
        
    default:
        break;
}
  
}

function rollDice () {
  const sides = 6;
  return Math.floor(Math.random() * sides) + 1;
}

function onConnectedHandler (addr, port) {
  console.log(`* Connected to ${addr}:${port}`);
  setPoints();
}

function onJoinHandler (channel, username, self) {
  console.info(username+' ENTROU ',);
  
  console.log('channel:',channel);
  let indexUser = usersOnChat.findIndex(user=>{
    return user.userName == username && user.channel == channel;
  });
  
  console.log('indexUser:',indexUser);
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
    usersOnChat = [
      ...usersOnChat,
      user
    ]
    console.log('user:',user);
  }else{
    let indexChannel = usersOnChat[indexUser].channel.findIndex(ch=>{
      return ch.name == channel;
    });
    if (indexChannel == -1) {
      usersOnChat[indexUser].channel = [
        ...usersOnChat[indexUser].channel,
        {
          name:channel,
          status:true,
          points:0
        }
      ]
    }else{
      usersOnChat[indexUser].channel[indexChannel].status = true;
    }
    usersOnChat[indexUser].status = true;
    usersOnChat[indexUser].onTime = moment().format('h:mm:ss');
    console.log('user:',user);
  }
  // console.log('username:',username);
}

function onNoticeHandler (channel, msgid, message) {
  console.log('channel:',channel);
  console.log('msgid:',msgid);
  console.log('message:',message);
}

function onLogonHandler (channel, msgid, message) {
  console.info(message+' LOGON');
  console.log('channel:',channel);
  // console.log('msgid:',msgid);
  // console.log('message:',message);
}

function onPartHandler (channel, username, self) {
  console.info(username+' SAIU');
  console.log('channel:',channel);
  let indexUser = usersOnChat.findIndex(user=>{
    return user.userName == username && user.channel == channel;
  });
  // let timeOnline = 0;
  if (indexUser != -1) {
    usersOnChat[indexUser].offTime = moment().format('h:mm:ss');
    usersOnChat[indexUser].status = false;
    let indexChannel = usersOnChat[indexUser].channel.findIndex(ch=>{
      return ch.name == channel;
    });
    if (indexChannel == -1) {
      usersOnChat[indexUser].channel = [
        ...usersOnChat[indexUser].channel,
        {
          name:channel,
          status:false,
          points:0
        }
      ]
    }else{
      usersOnChat[indexUser].channel[indexChannel].status = false;
    }
    // tiemOnline = diffTime('12:39:00','12:37:58');
    // let point = parseInt(tiemOnline.toFixed(0)) 
    // usersOnChat[indexUser].points = point >= 10?(point):;
    // console.log('timeOnline:',timeOnline);
  }
  // indexUser[indexUser]
  // usersOnChat.splice(indexUser,1);
  // console.log('username:',username);
  // console.log('self:',self);
  console.log('indexUser:',indexUser);
  console.log('user:',usersOnChat[indexUser]);
}

function diffTime (time1, time2) {
  let time = moment(time1,'HH:mm:ss').diff(moment(time2,'HH:mm:ss'));
  return moment.duration(time).asMinutes();
}

function setPoints (){
  const intervalObj = setInterval(() => {
    let UsersON = usersOnChat.filter((value)=>{
      return value.status == true;
    });
    console.log('PONTOS ADICIONADOS PARA '+UsersON.length+' USUARIOS', 111111);
    for (let i = 0; i < usersOnChat.length; i++) {
      if (usersOnChat[i].status) {
        usersOnChat[i].points = usersOnChat[i].points +3;
      }
    }
  }, 600000);
}