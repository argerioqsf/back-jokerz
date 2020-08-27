const tmi = require('tmi.js');
const moment = require('moment');
const Canal = require("../../schemas/channel");
const Pessoa = require("../../schemas/pessoa");
const crypto = require("crypto");
let intervalSetPoints = null; 
const client = require("../../configs/twitch");
// const pessoaCanalController = require("../pessoaCanal/pessoaCanalController");
const pessoasController = require("../pessoas/pessoasController");
const channel = require('../../schemas/channel');


client.on('message', onMessageHandler);
client.on('join', onJoinHandler); 
client.on('connected', onConnectedHandler);
// client.on("notice", onNoticeHandler);
// client.on("logon", onLogonHandler);
client.on("part", onPartHandler);


const addChannelsInitial = async ()=>{
    try {
      let channels = await Canal.find();
      for (let i = 0; i < channels.length; i++) {
        await rmChannel(channels[i]._id);
      }
      let channels_active = await Canal.find({active:true});
      // console.log('canais ativos: ',channels_active);
      for (let j = 0; j < channels_active.length; j++) {
        await addChannel(channels_active[j]._id);
      }
    } catch (error) {
      console.log('erro ao adicionar canais no bot:',error);
    }
}

function onConnectedHandler (addr, port) {
  console.log(`* Connected to ${addr}:${port}`);
  addChannelsInitial();
  // setPoints();
}

const addChannel = async (id_channel) => {
  try {
    let canal = await Canal.findById(id_channel);
    // console.log('canal acahado para add no bot:',canal);
    await client.join(canal.name);
    client.say(canal.name, `Bot TeamJokerz conectado ao chat`);
    return {
      status:true,
      message:'canal '+ canal.name +' adicionado ao bot'
    }
  } catch (error) {
    return {
        status:false,
        message:'Canal com o id '+id_channel+' não adicionado',
        error:error
      };
  }
};

const rmChannel = async (id_channel) => {
  try {
    let canal = await Canal.findById(id_channel);
    // console.log('canal acahado para remover no bot:',canal);
    await client.part(canal.name);
    return {
      status:true,
      message:'canal '+ canal.name +' removido do bot'
    }
  } catch (error) {
    return {
        status:false,
        message:'Canal com o id '+id_channel+' não removido',
        error:error
      };
  }
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

const verifyActive = async(username,name_channel)=>{

  //verificar se o usuario esta ativo
    //se não, setar ele como ativo
    //se sim, não fazer nada

  try {
      let person_verify = await Pessoa.find({nickname:username});
      if (person_verify.length > 0 && person_verify[0].active == false) {
        person_verify[0].active = true;
        await person_verify[0].save();
        console.log('pessoa setada com ativa:',person_verify[0].name);
      }
  } catch (error) {
    console.log('error ao setar status de ativo ao usuario: ',error);
  }
}

function onMessageHandler (channel, userstate, msg, self) {
  if (self) { return; }
  //estruturando nome do canal
  let name_channel = channel.split('#');
  name_channel = name_channel[1];
  //pegando nome do usuário
  let username = userstate.username.toLowerCase();
  // console.log('userstate: ',userstate);
  console.log('username onMessageHandler: ',username);
  console.log('channel onMessageHandler: ',channel);
  console.log('name_channel onMessageHandler: ',name_channel);
  //funcao para setar o usuario como ativo caso ainda não esteja
  verifyActive(username,name_channel);
  
//   let indexUser = usersOnChat.findIndex(user=>{
//     return user.userName == userstate.username;
//   });

//   // console.log(`mensagem userstate:`,userstate);
//   const commandName = msg.trim();
//   const num = rollDice();
//   if (/dudis/i.exec(commandName)) {
//     client.say(channel, `@TeamJokerz`);
//     console.log(`Dudis chamado`);
//   }
//   if (/duds/i.exec(commandName)) {
//     client.say(channel, `@TeamJokerz`);
//     console.log(`Dudis chamado`);
//   }

//   // if (/argério/i.exec(commandName)) {
//   //   client.say(channel, `${userstate.username} Não diga o nome do mestre em vão...`);
//   //   console.log(`Não diga o nome do mestre em vão...`);
//   // }
  
//   if (/!msg:/i.exec(commandName)) {
//     let msg = commandName.split(':');
//     console.log(msg[1]);
//     client.say(channel, ` !resgatar mensagem ${msg[1]}`);
//     console.log(`mensagem enviada`);
//   }
  
//   if (/!status:/i.exec(commandName)) {
//     let username = commandName.split(':')[1].toLowerCase();
//     let indexUserS = usersOnChat.findIndex(user=>{
//       return user.userName.toLowerCase() == username.toLowerCase();
//     });
//     console.log(`indexUserS: `,indexUserS);
//     if (indexUserS != -1) {
//       let indexChannel = usersOnChat[indexUserS].channels.findIndex(ch=>{
//         return ch.name == channel;
//       });
//       if (indexChannel != -1) {
//         if (usersOnChat[indexUserS].channels[indexChannel].status) {
//           client.say(channel, `${username} está online neste chat`);
//         }else{
//           client.say(channel, `${username} está offline neste chat`);
//         }
//       }else{
//         client.say(channel, `${username} não está aqui`);
//       }
//     }else{
//       client.say(channel, `${username} não está aqui`);
//     }
//     console.log(`* Executed ${commandName} command`);
//   }
  
//   if (commandName.split(':')[0] == '!join') {
    
//     if (userstate.mod) {
//       let channelJoin = commandName.split(':')[1].toLowerCase();
//       client.join(channelJoin)
//       .then((data) => {
//         client.say(channel, `bot conectado no canal ${channelJoin}`);
//       }).catch((err) => {
//         console.log('err join: ',join);
//         client.say(channel, `Houve algum erro no servidor e não foi possivel conectar no canal -> ${channelJoin}`);
//       });
//       console.log(`* Executed ${commandName} command`);
//     }else{
//       client.say(channel, `você não tem permição para esse comando neste canal join`);
//     }
//   }

//   if (commandName.split(':')[0] == '!part') {
    
//     if (userstate.mod) {
//       let channelJoin = commandName.split(':')[1].toLowerCase();
//       client.part(channelJoin)
//       .then((data) => {
//         client.say(channel, `bot desconectado do canal ${channelJoin}`);
//       }).catch((err) => {
//         console.log('err join: ',join);
//         client.say(channel, `Houve algum erro no servidor e não foi possivel desconectar do canal -> ${channelJoin}`);
//       });
//       console.log(`* Executed ${commandName} command`);
//     }else{
//       client.say(channel, `você não tem permição para esse comando neste canal part`);
//     }
//   }

//   // if (/argerio/i.exec(commandName)) {
//   //   client.say(channel, `${userstate.username} Não diga o nome do mestre em vão...`);
//   //   console.log(`Não diga o nome do mestre em vão...`);
//   // }
  
//   switch (commandName) {
//     case '!sair':
//          client.say(channel, `Bot desligado`);
//          client.disconnect();
//          console.log(`* Executed ${commandName} command`);
//          break;
//     case '!teste':
//          client.say(channel, `Teste PopCorn`);
//          console.log(`* Executed ${commandName} command`);
//          break;
//     case '!sorte':
//          client.say(channel, `Esse é o seu numero da sorte ${num}`);
//          console.log(`* Executed ${commandName} command`);
//          break;
//     case '!clear':
//          client.clear('teamjokerz');
//          console.log(`* Executed ${commandName} command`);
//          break;
//     case '!points':
//           if (indexUser != -1) {
//             let user = usersOnChat[indexUser];
//             let indexChannel = usersOnChat[indexUser].channels.findIndex(ch=>{
//               return ch.name == channel;
//             });
//             console.log('indexChannel: ',indexChannel);
//             if (indexChannel != -1) {
//               let channelUser = usersOnChat[indexUser].channels[indexChannel];
//               client.say(channel, `@${userstate.username}, tem ${channelUser.points} pipocas neste canal e ${user.points} pipocas totais PopCorn `);
//               console.log(`* Executed ${commandName} command`);
//             }
//            else{
//               client.say(channel, `@${userstate.username}, tem ${user.points} pipocas totais e 0 pipocas neste canal`);
//               console.log(`* Executed ${commandName} command`);
//             }
//           }else{
//             client.say(channel, `@${userstate.username} não encontrado`);
//             console.log(`* Executed ${commandName} command`);
//           }
//           break;
//     default:
//         break;
// }
  
}

async function onJoinHandler (channel, username, self) {
  
  if (self) { return; }
  console.log('channel:',channel);
  //estruturando nome do canal
  let name_channel = channel.split('#');
  name_channel = name_channel[1];
  username = username.toLowerCase();
  //verificar se ja ta cadastrado
  //se sim, verificar se ja tem o canal cadastrado
    //se sim, atualizar o status dele pra true no canal que ele entrou
    //se não, criar cadastro de canal dentro do usuário e setar o status como true
  //se nao, fazer um cdastro dele e adicionar o canal no cadastro dele com status true

  try {
    let person = await Pessoa.find({nickname:username}).populate('channels.info_channel');
    if (person[0] && person.length > 0) {
      let index_channel = person[0].channels.findIndex((channel)=>{
        if (channel.info_channel.name == name_channel) {
          return true;
        }
      });
      if(index_channel != -1){
        person[0].channels[index_channel].status = true;
        await person[0].save();
        console.log('canal atualizado para true no usuário: ',person[0].name);
      }else{
        let channel_on = await Canal.find({name:name_channel});
        person[0].channels = [
          ...person[0].channels,
          {
            info_channel:channel_on[0]._id,
            status:true,
            points:0
          }
        ];
        await person[0].save();
        console.log('canal adicionado ao usuario como true: ',person[0].name);
      }
    }else{
      // let channel_on = await Canal.find({name:name_channel});
      // let new_person = await Pessoa.create({
      //   name:username,
      //   nickname:username,
      //   channels:[
      //     {
      //       info_channel:channel_on[0]._id,
      //       status:true,
      //       points:0
      //     }
      //   ]
      // });
      // console.log('pessoa nova criada: ',new_person.name);
      console.log('pessoa não cadsatrada entrando: ',username);
    }
  } catch (error) {
    console.log('erro ao setar que usuario entrou: ',error);
  }





  // let indexUser = usersOnChat.findIndex(user=>{
  //   return user.userName == username;
  // });
  
  // console.log('indexUser:',indexUser);
  // let user = {
  //   status:true,
  //   userName:username,
  //   channels:[
  //     {
  //       name:channel,
  //       status:true,
  //       points:0
  //     }
  //   ],
  //   points:0,
  //   onTime:moment().format('h:mm:ss'),
  //   offTime:0
  // };
  // if (indexUser == -1) {
  //   //Se nao tiver o usuário cadastrado ele cadastra o usuario
  //   usersOnChat = [
  //     ...usersOnChat,
  //     user
  //   ]
  //   console.log('user:',user);
  // }else{
  //   usersOnChat[indexUser].status = true;
  //   usersOnChat[indexUser].onTime = moment().format('h:mm:ss');
  //   let indexChannel = usersOnChat[indexUser].channels.findIndex(ch=>{
  //     return ch.name == channel;
  //   });
  //   //Se nao tiver o canal cadastrado ele cadastra o canal no usuario
  //   if (indexChannel == -1) {
  //     usersOnChat[indexUser].channels = [
  //       ...usersOnChat[indexUser].channels,
  //       {
  //         name:channel,
  //         status:true,
  //         points:0
  //       }
  //     ]
  //     console.log('user:',usersOnChat[indexUser]);
  //   }else{
  //     //Se tiver o canal ele so atualiza o status do usuario pra verdadeiro
  //     usersOnChat[indexUser].channels[indexChannel].status = true;
  //     console.log('user:',usersOnChat[indexUser]);
  //   }
  // }
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

async function onPartHandler (channel, username, self) {
  if (self) { return; }
  console.log('channel:',channel);
  //estruturando nome do canal
  let name_channel = channel.split('#');
  name_channel = name_channel[1];
  username = username.toLowerCase();
  //verificar se ja ta cadastrado
  //se sim, verificar se ja tem o canal cadastrado
    //se sim, atualizar o status dele pra falsw no canal que ele saiu
    //se não, criar cadastro de canal dentro do usuário e setar o status como false
  //se nao, fazer um cdastro dele e adicionar o canal no cadastro dele com status false

  try {
    let person = await Pessoa.find({nickname:username}).populate('channels.info_channel');
    if (person[0] && person.length > 0) {
      let index_channel = person[0].channels.findIndex((channel)=>{
        if (channel.info_channel.name == name_channel) {
          return true;
        }
      });
      if(index_channel != -1){
        person[0].channels[index_channel].status = false;
        await person[0].save();
        console.log('canal atualizado para false no usuário: ',person[0].name);
      }else{
        let channel_on = await Canal.find({name:name_channel});
        person[0].channels = [
          ...person[0].channels,
          {
            info_channel:channel_on[0]._id,
            status:false,
            points:0
          }
        ];
        await person[0].save();
        console.log('canal adicionado ao usuario como false: ',person[0].name);
      }
    }else{
      // let channel_on = await Canal.find({name:name_channel});
      // let new_person = await Pessoa.create({
      //   name:username,
      //   nickname:username,
      //   channels:[
      //     {
      //       info_channel:channel_on[0]._id,
      //       status:true,
      //       points:0
      //     }
      //   ]
      // });
      // console.log('pessoa nova criada: ',new_person.name);
      console.log('pessoa não cadsatrada partindo: ',username);
    }
  } catch (error) {
    console.log('erro ao setar que usuario saiu: ',error);
  }
}

function diffTime (time1, time2) {
  let time = moment(time1,'HH:mm:ss').diff(moment(time2,'HH:mm:ss'));
  return moment.duration(time).asMinutes();
}

async function setPoints (){
  intervalSetPoints = setInterval(async() => {
    try {
      let pessoas = await Pessoa.find({'channels.status':{$in:true},active:true});
      // console.log('pessoas.length: ',pessoas.length);
      console.log('PONTOS ADICIONADOS PARA  USUARIOS', 111111);
      for (let i = 0; i < pessoas.length; i++) {
        let channelsOn = pessoas[i].channels.filter((channel)=>{
          return channel.status == true;
        });
        let total = 0;
        let total_for_primary = 0;
        // console.log('channelsOn.length: ',channelsOn.length);
        for (let j = 0; j < channelsOn.length; j++) {
          //adiciona 3 pontos ao canal q tiver online do usuario
          // let points = channelsOn[j].points + 3;
          total = total + 3;
          total_for_primary = total_for_primary + 3;
          await pessoasController.setPointPessoaCanal(String(pessoas[i]._id),String(channelsOn[j].info_channel));

          if (j == channelsOn.length-1) {
            if (pessoas[i].type_account == 'secondary') {
              if (pessoas[i].primary_account_ref) {
                await pessoasController.setPointPessoa(String(pessoas[i]._id),total);
                await pessoasController.setPointPessoa(String(pessoas[i].primary_account_ref),total_for_primary);
              }else{
                continue;
              }
            }else{
              await pessoasController.setPointPessoa(String(pessoas[i]._id),total);
            }
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
  }, 180000);
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
  setPoints,
  addChannelsInitial
}