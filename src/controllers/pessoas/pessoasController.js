
// const Pessoa = require("../../models/Pessoas");
// const PessoaCanal = require("../../models/PessoaCanal");
const Pessoa = require('../../schemas/pessoa')
const Channel = require('../../schemas/channel');
const pessoa = require('../../schemas/pessoa');

const listPessoas = async (req, res) => {
    try {
        let pessoas = await Pessoa.find().populate('channels.info_channel');
          res.status(200).json({
            data:pessoas
          });
    } catch (error) {
          res.status(400).send({
              message:'ERRO ao listar pessoas',
              error:error
          });
    }

    // Pessoa.selectPessoas().then((data) => {
    //   res.status(200).json({
    //     pessoas:data
    //   });
    // }).catch((err) => {
    //   res.status(400).send(['Erro ao listar pessoas']);
    // });
};

const listPessoasOn = async (req, res) => {
    try {
        let pessoasOn = await Pessoa.find({'channels.status':{$in:true}}).populate('channels.info_channel');
          res.status(200).json({
            data:pessoasOn
          });
    } catch (error) {
            res.status(400).send({
                message:'Erro ao lista usuarios online',
                error:{error}
            });
    }
    // Pessoa.selectPessoasOn().then((data) => {
    //   res.status(200).json({
    //     pessoas:data
    //   });
    // }).catch((err) => {
    //   res.status(400).send(['Erro ao listar pessoas on']);
    // });
};

const findPessoaById = async (req, res) => {
    const id = parseInt(req.params.id);
    Pessoa.selectCanalById(id).then((data) => {
      res.status(200).json({
        data:data[0]
      });
    }).catch((err) => {
      res.status(400).send(['Erro ao procurar canal']);
    });
};

const findPessoaBySession = (req, res) => {
    if (req.user) {
        res.status(200).json({
          data:req.user
        });
    }else{
        res.status().send({
            message:'Erro ao procurar por usuario'
        });
    }
};
  
const registerPessoa = async (req, res) => {
    const { points, nome, nickname, timeOn, timeOff, channel_id } = req.body;
    let data = {
        points:points,
        name:nome,
        nickname:nickname,
        timeon:timeOn,
        timeoff:timeOff,
        channels:[{
            info_channel:channel_id,
            points:0,
            status:false
        }]
    }
    
    try {
        let resp = await Pessoa.create(data);
        res.status(201).json({
            message:'Pessoa cirada com sucesso!',
            pessoa:resp
        });
    } catch (error) {
        res.status(400).json({
            message:'Erro ao criar cadastro de pessoa',
            err:error
        });
    }


    
    // Pessoa.insertPessoas([
    //     points,
    //     userName,
    //     timeOn,
    //     timeOff
    // ]).then((data)=>{
    //     res.status(200).json({
    //         pessoas:data
    //     });
    // }).catch((err) => {
    //     res.status(400).send({
    //         message:'Erro ao listar pessoas:',
    //         error:err
    //     });
    // });;

};
 
const registerOrUpdatePessoa = async (data) => {
    const { points = 0, nickname, timeOn = '', timeOff = '', idTwitch, session } = data;

    let info = {
        points:points,
        name:nickname,
        nickname:nickname,
        timeon:timeOn,
        timeoff:timeOff,
        idTwitch:idTwitch,
        session:session
    }
    
    try {
        let pessoa = await Pessoa.findOne({idTwitch:idTwitch});
        if (pessoa) {
            console.log('pessoa '+pessoa.name+' atualizada');
            pessoa.nickname=nickname;
            pessoa.idTwitch=idTwitch;
            pessoa.session=session;
            return pessoa.save();
            // console.log('achou user: ',pessoa);
        } else {
            console.log('não achou user');
            return Pessoa.create(info);
        }
    } catch (error) {
        console.log('error achou user');
        return null;
    }
};

const addChannel = async (req, res) => {
    const { id_user, channel_id } = req.body;
    
    try {
        let exist_channel_in_user = await Pessoa.find({'channels.info_channel':{$in:channel_id}}).where({_id:id_user});
        let exist_channel = await Channel.findById(channel_id);
        if (exist_channel_in_user.length == 0) {
            if (exist_channel) {
                let pessoa_old = await Pessoa.findById(id_user);
                let data =[
                    ...pessoa_old.channels,
                    {
                        info_channel:channel_id,
                        points:0,
                        status:false
                    }
                ]
                let pessoa = await Pessoa.findByIdAndUpdate(id_user,{channels:data});
                res.status(201).json({
                    message:'canal adicionado com sucesoo',
                    pessoa:pessoa,
                    // exist_channel:exist_channel,
                    // exist_channel_in_user:exist_channel_in_user
                });
            }else{
                res.status(400).json({
                    message:'id do canal incorreto'
                });
            }
        }else{
            res.status(200).json({
                message:'canal ja cadastrado nesse usuario'
            });
        }
    } catch (error) {
        res.status(400).json({
            message:'Erro ao adicionar o canal',
            err:JSON.stringify(error)
        });
    }
};

const setPointPessoa = async (id_user, points) => {
    try {
        let pessoa = await Pessoa.findById(id_user);
            pessoa.points = points;
            return pessoa.save();
    } catch (error) {
        console.log('Erro ao adicionar pontos 2',error);
    }
};

const zerarPontosPessoas = async (req, res) => {
    try {
        const delete_points_user = await Pessoa.updateMany({}, {points:0});
        const delete_points_user_channel = await Pessoa.updateMany({},{$set:{'channels.$[].points': 0}});
        res.status(201).json({
            message:'pontos deletados com sucesso!',
            delete_points_user:delete_points_user,
            delete_points_user_channel:delete_points_user_channel
        });
    } catch (error) {
        res.status(400).json({
            message:'Erro ao zerar os pontos 2',
            err:error
        });
    }
    // Pessoa.zerarPointPessoa().then((data) => {
    //     PessoaCanal.zerarPointPessoaCanal().then((data) => {
    //         res.status(200).json({
    //             message:'pontos zerados'
    //         });
    //     }).catch((err) => {
    //         res.status(200).json({
    //             message:'erro ao zerar os pontos 1',
    //             error:err
    //         });
    //     });
    // }).catch((err) => {
    //     res.status(200).json({
    //         message:'erro ao zerar os pontos 2',
    //         error:err
    //     });
    // });
};

const setStatusPessoaCanal = async (req,res) =>{
    const { id_user, channel_id, status } = req.body;
    try {
        let pessoa_old = await Pessoa.findById(id_user);
        let index_channel = pessoa_old.channels.findIndex((channel)=>{
            console.log(`channel_id (${channel_id}) :: channel.info_channel (${channel.info_channel})`);
            return channel_id == channel.info_channel;
        });
        if (index_channel != -1 ) {
            pessoa_old.channels[index_channel].status = status;
            pessoa_old.save();
            res.status(200).json({
                message:pessoa_old
            });
        }else{
            res.status(400).json({
                message:'Canal não cadastrado neste usuario'
            });
        }
    } catch (error) {
        res.status(400).json({
            message:'Erro ao mudar status do canal',
            err:error
        });
    }
}

const setPointPessoaCanal = async (id_user, channel_id, points) => {
    let data = {id_user, channel_id, points};
    // console.log('info add points canal: ',data);
    try {
        let pessoa = await Pessoa.findById(id_user);
        let index_channel = pessoa.channels.findIndex(channel=>{
            // console.log(`channel_id (${channel_id}) :: channel.info_channel (${channel.info_channel})`);
            return channel.info_channel == channel_id;
        });
        if (index_channel != -1 ) {
            pessoa.channels[index_channel].points = points;
            return pessoa.save();
        }else{
            console.log('canal nao encontrado no usuario');
        }
    } catch (error) {
        console.log('Erro ao adicionar pontos 2',error);
    }
};

module.exports = {
    listPessoas,
    registerPessoa,
    listPessoasOn,
    setPointPessoa,
    zerarPontosPessoas,
    addChannel,
    setStatusPessoaCanal,
    setPointPessoaCanal,
    registerOrUpdatePessoa,
    findPessoaById,
    findPessoaBySession
}