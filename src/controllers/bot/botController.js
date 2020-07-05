const tmi = require('tmi.js');
const moment = require('moment');
const Canal = require("../../models/Canais");
const Pessoa = require("../../schemas/pessoa");
const crypto = require("crypto");
let intervalSetPoints = null; 
const client = require("../../configs/twitch");
// const pessoaCanalController = require("../pessoaCanal/pessoaCanalController");
const pessoasController = require("../pessoas/pessoasController");
const channel = require('../../schemas/channel');


// client.on('message', onMessageHandler);
client.on('join', onJoinHandler);
// client.on("notice", onNoticeHandler);
// client.on("logon", onLogonHandler);
// client.on("part", onPartHandler);

const addChannel = async (req, res) => {
  const { id_channel } = req.body;
  Canal.selectCanalById(id_channel).then(async (data)=>{
    await client.join(data[0].nome);
    res.status(200).send({
      message:'canal '+ data[0].nome +' adicionado ao bot'
    });
  }).catch((err) => {
    res.status(400).send({
      message:'Canal com o id '+id_channel+' não cadastrado',
      error:err
    });
  });
};

const rmChannel = async (req, res) => {
  const { id_channel } = req.body;
  Canal.selectCanalById(id_channel).then(async (data)=>{
    await client.part(data[0].nome);
    res.status(200).send(['canal '+ data[0].nome +' removido do bot']);
  }).catch((err) => {
    res.status(400).send(['Erro ao remover o canal '+id_channel]);
  });
};

const listPessoas = async (req, res) => {
  Pessoa.selectPessoas().then((data) => {
    res.status(200).json({
      pessoas:data
    });
  }).catch((err) => {
    res.status(400).send(['Erro ao listar pessoas']);
  });
};

const registerPessoa = async (req, res) => {
  const { points, userName, timeOn, timeOff } = req.body;
  Pessoa.insertPessoas([
      points,
      userName,
      timeOn,
      timeOff
    ]).then((data)=>{
      res.status(200).json({
        pessoas:data
      });
    }).catch((err) => {
      res.status(400).send({
        message:'Erro ao listar pessoas:',
        error:err
      });
    });;

};

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

  // if (/argério/i.exec(commandName)) {
  //   client.say(channel, `${userstate.username} Não diga o nome do mestre em vão...`);
  //   console.log(`Não diga o nome do mestre em vão...`);
  // }
  
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

  // if (/argerio/i.exec(commandName)) {
  //   client.say(channel, `${userstate.username} Não diga o nome do mestre em vão...`);
  //   console.log(`Não diga o nome do mestre em vão...`);
  // }
  
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
    return user.userName == username;
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
    return user.userName == username;
  });
  console.log('indexUser:',indexUser);
  // let timeOnline = 0;
  if (indexUser != -1) {
    usersOnChat[indexUser].offTime = moment().format('h:mm:ss');
    usersOnChat[indexUser].status = false;
    let indexChannel = usersOnChat[indexUser].channels.findIndex(ch=>{
      return ch.name == channel;
    });
    if (indexChannel == -1) {
      usersOnChat[indexUser].channels = [
        ...usersOnChat[indexUser].channels,
        {
          name:channel,
          status:false,
          points:0
        }
      ]
    }else{
      usersOnChat[indexUser].channels[indexChannel].status = false;
    }
    // tiemOnline = diffTime('12:39:00','12:37:58');
    // let point = parseInt(tiemOnline.toFixed(0)) 
    // usersOnChat[indexUser].points = point >= 10?(point):;
    // console.log('timeOnline:',timeOnline);
    console.log('user:',usersOnChat[indexUser]);
  }else{
    let user = {
      status:false,
      userName:username,
      channels:[
        {
          name:channel,
          status:false,
          points:0
        }
      ],
      points:0,
      onTime:0,
      offTime:moment().format('h:mm:ss')
    };
    usersOnChat = [
      ...usersOnChat,
      user
    ]
    console.log('user:',user);
  }
  // indexUser[indexUser]
  // usersOnChat.splice(indexUser,1);
  // console.log('username:',username);
  // console.log('self:',self);
}

function diffTime (time1, time2) {
  let time = moment(time1,'HH:mm:ss').diff(moment(time2,'HH:mm:ss'));
  return moment.duration(time).asMinutes();
}

async function setPoints (){
  intervalSetPoints = setInterval(async() => {
    try {
      let pessoas = await Pessoa.find({'channels.status':{$in:true}});
      // console.log('pessoas.length: ',pessoas.length);
      console.log('PONTOS ADICIONADOS PARA  USUARIOS', 111111);
      for (let i = 0; i < pessoas.length; i++) {
        let channelsOn = pessoas[i].channels.filter((channel)=>{
          return channel.status == true;
        });
        let total = 0;
        // console.log('channelsOn.length: ',channelsOn.length);
        for (let j = 0; j < channelsOn.length; j++) {
          // console.log('canal on: ',channelsOn[j]);
          let points = channelsOn[j].points + 3;
          total = total + points;
          pessoasController.setPointPessoaCanal(String(pessoas[i]._id),String(channelsOn[j].info_channel),points );
          if (j == channelsOn.length-1) {
              pessoasController.setPointPessoa(String(pessoas[i]._id),total);
          }
        }

        if (i == pessoas.length-1) {
          console.log('Pontos atribuidos com sucesso!');
        }
      }
    } catch (error) {
        console.log('Erro ao iniciar contagem de pontuação 1',error);
    }
    // Pessoa.selectPessoasOn().then(async (data)=>{
    //   let UsersON = data.length;
    //   let usersOnChat = data;
    //   console.log('PONTOS ADICIONADOS PARA '+UsersON+' USUARIOS', 111111);
    //   // console.log('usuarios on: ',usersOnChat);
    //   for (let i = 0; i < usersOnChat.length; i++) {
    //     let total = 0;
    //     for (let j = 0; j < usersOnChat[i].canais.length; j++) {
    //       console.log('canal on: ',usersOnChat[i].canais[j]);
    //       let points = usersOnChat[i].canais[j].points_canal + 3;
    //       total = total + points;
    //       try {
    //         await pessoaCanalController.setPointPessoaCanal(points,usersOnChat[i].canais[j].id_pessoa_canal);
    //       } catch (error) {
    //         console.log('Erro ao adicionar pontucao total pessoa_canal id => '+usersOnChat[i].canais[j].id_pessoa_canal+', error =>',error);
    //       }
    //       if (j == usersOnChat[i].canais.length-1) {
    //         try {
    //           await pessoasController.setPointPessoa(total,usersOnChat[i].pessoa_id);
    //         } catch (error) {
    //           console.log('Erro ao adicionar pontucao total pessoa id => '+usersOnChat[i].pessoa_id+', error =>',error);
    //         }
    //       }
    //     }
    //     if (i == usersOnChat.length-1) {
    //       console.log('Pontos atribuidos com sucesso!');
    //     }
    //   }
    // }).catch((err)=>{
    //   console.log('Erro ao iniciar contagem de pontuação 1',err);
    // })
  }, 60000);
}

function stopPoints(){
  clearInterval(intervalSetPoints);
}
///teste
module.exports = {
  addChannel,
  rmChannel,
  listPessoas,
  registerPessoa,
  setPoints
}