
// const Canal = require("../../models/Canais");
const Channel = require('../../schemas/channel');
// const botController = require('../../controllers/bot/botController');

const listCanais = async (req, res) => {
  
    try {
      let channels = await Channel.find().populate('id_person').populate({
        path:'id_person',
        populate: { path: 'permissions.ifo_permission' }
      });
        res.status(200).json({
          data:channels
        });
    } catch (error) {
          res.status(400).send({
              message:'ERRO ao listar channels',
              error:error
          });
    }
    // Canal.selectCanais().then((data) => {
    //   res.status(200).json({
    //     canais:data
    //   });
    // }).catch((err) => {
    //   res.status(400).send(['Erro ao listar canais']);
    // });
};

const findCanaisById = async (req, res) => {
    const id = parseInt(req.params.id)
    Canal.selectCanalById(id).then((data) => {
      res.status(200).json({
        canal:data[0]
      });
    }).catch((err) => {
      res.status(400).send(['Erro ao procurar canal']);
    });
};
  
const registerCanal = async (data) => {
  try {
      let channel_exists = await Channel.find({
        name:data.nickname
      });
      if (channel_exists.length > 0) {
        console.log('canal ja existe:',channel_exists);
        return {
            code:200,
            status:true,
            message:'Canal já existe',
            data:resp
        };
      } else {
        let resp = await Channel.create({
          name:data.nickname,
          id_person:data.id_person,
          linkTwitch:data.linkTwitch
        });
        console.log('canal cadastrado');
        return {
            code:201,
            status:true,
            message:'Canal cadastrado com sucesso!',
            data:resp
        };
      }
  } catch (error) {
      return {
          status:false,
          message:'Erro ao criar cadastro de canal',
          error:error
      };
  }
// const { nome } = req.body;
//     Canal.insertCanal(nome).then((data)=>{
//         res.status(200).json({
//             canais:data
//         });
//     }).catch((err) => {
//         res.status(400).send({
//             message:'Erro ao registrar canal:',
//             error:err
//         });
//     });;
};

const statusChannel = async (req, res) => {
  let { status, id_channel } = req.body;
  try {
    if (status) {
      let on_channel = await Channel.findById(id_channel);
      if (on_channel) {
        // let status_bot = await botController.addChannel(id_channel);
        on_channel.active = true;
        await on_channel.save();
        res.status(200).json({
          message:"Status do canal "+on_channel.name+" atualizado para "+status,
          data:on_channel
        });
        // if (status_bot.status) {
        //   res.status(200).json({
        //     message:status_bot.message,
        //     data:status_bot
        //   });
        // } else {
        //   res.status(500).json({
        //     message:status_bot.message,
        //     data:status_bot.error
        //   });
        // }
      }else{
        res.status(200).json({
          message:"Erro ao atualizar status do canal "+on_channel.name+" para "+status,
          error:"Canal não encontrado"
        });
      }
    }else{
      let off_channel = await Channel.findById(id_channel);
      if (off_channel) {
        // let status_bot = await botController.rmChannel(id_channel);
        off_channel.active = false;
        await off_channel.save();
        res.status(200).json({
          message:"Status do canal "+on_channel.name+" atualizado para "+status,
          data:on_channel
        });
        // if (status_bot.status) {
        //   res.status(200).json({
        //     message:status_bot.message,
        //     data:status_bot
        //   });
        // } else {
        //   res.status(500).json({
        //     message:status_bot.message,
        //     data:status_bot.error
        //   });
        // }
      }else{
        res.status(200).json({
          message:"Erro ao atualizar status do canal "+on_channel.name+" para "+status,
          error:"Canal não encontrado"
        });
      }
    }
  } catch (error) {
      res.status(500).json({
        message:'Erro ao mudar status do canal',
        error:error
      });
  }
};

module.exports = {
    listCanais,
    registerCanal,
    findCanaisById,
    statusChannel
}