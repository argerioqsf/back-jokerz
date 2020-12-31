
// const Pessoa = require("../../models/Pessoas");
// const PessoaCanal = require("../../models/PessoaCanal");
const Pessoa = require('../../schemas/pessoa')
const Channel = require('../../schemas/channel');
const pessoa = require('../../schemas/pessoa');

const listPessoas = async (req, res) => {
    try {
        let pessoas = await Pessoa.find().populate('channels.info_channel').populate('permissions.ifo_permission');
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

const listPersonForType = async (req, res) => {
    const { type } = req.query;

    try {
        let pessoas = await Pessoa.find({type_account:type});
          res.status(200).json({
            message:'Contas '+type+' listadas com sucesso!',
            data:pessoas
          });
    } catch (error) {
          res.status(400).send({
              message:'ERRO ao listar pessoas',
              error:error
          });
    }
};

const listPessoasOn = async (req, res) => {
    try {
        let pessoasOn = await Pessoa.find({'channels.status':{$in:true}}).populate('channels.info_channel').populate('permissions.ifo_permission');
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

const findPerson = async (req, res) => {
    console.log('req.userId: ',req.userId);
    try {
        let person = await Pessoa.findById(req.userId).populate('primary_account_ref').populate('secondary_accounts').populate('channels.info_channel');
        res.status(200).json({
          data:person
        });
    } catch (error) {
        res.status(400).send({
            message:'Erro ao procurar por usuario',
            error:error
        });
    }
};
  
const registerPerson = async (data) => {
    
  try {
    let person_exists = await Pessoa.find({nickname:data.nickname.toLowerCase()});
    if (person_exists.length > 0) {
          console.log('pessoa ja existe');
          return {
              status:true,
              message:'Conta ja criada',
              data:{},
              code:200
          };
    }else{
        let person = await Pessoa.create(data);
        console.log('pessoa criada');
        return {
            status:true,
            message:'Cadastro criado com sucesso!',
            data:person,
            code:201
        };
    }
} catch (error) {
    console.log('erro cadastro user: ',error);
    return {
        status:false,
        message:'Erro ao criar cadastro do usuário',
        error:error
    };
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
    const { points = 0, nickname, timeOn = '', timeOff = '', idTwitch, session, permissions } = data;
    let nick = nickname.toLowerCase();
    let info = {
        points:points,
        name:nickname,
        nickname:nick,
        timeon:timeOn,
        timeoff:timeOff,
        idTwitch:idTwitch,
        session:session,
        permissions:permissions
    }
    
    try {
        let pessoa_idTwitch = await Pessoa.findOne({idTwitch:idTwitch});
        if (pessoa_idTwitch) {
            console.log('pessoa '+pessoa_idTwitch.name+' atualizada');
            pessoa_idTwitch.nickname=nick;
            pessoa_idTwitch.idTwitch=idTwitch;
            pessoa_idTwitch.session=session;
            return pessoa_idTwitch.save();
            // console.log('achou user: ',pessoa_idTwitch);
        } else {
            // let pessoa_nickname = await Pessoa.findOne({nickname:nick});
            // if (pessoa_nickname) {
            //     console.log('pessoa '+pessoa_nickname.name+' atualizada');
            //     pessoa_nickname.nickname=nick;
            //     pessoa_nickname.idTwitch=idTwitch;
            //     pessoa_nickname.session=session;
            //     return pessoa_nickname.save();
            // }else{
                console.log('não achou user');
                return Pessoa.create(info);
            // }
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

const setTypePerson = async (req, res) => {
    const { type_account, id_person_primary = false } = req.body;
    let id_person = req.userId;
    try {
        let person = await Pessoa.findById(id_person);
        if (person && (type_account == 'primary' || type_account == 'secondary')) {
            console.log('person.type_account: ',person.type_account);
            console.log('person: ',person);
            if (person.type_account == 'pendente') {
                person.type_account = type_account;
                if (type_account == 'secondary' && id_person_primary) {
                    person.primary_account_ref = id_person_primary;
                    let person_primary = await Pessoa.findById(id_person_primary);
                    if (person_primary.secondary_accounts.length >= 2) {
                        return res.status(400).json({
                            message:'Conta primária já excedeu o limite de contas secundárias vinculadas',
                        });
                    }
                    person_primary.points = person_primary.points + person.points;
                    person_primary.secondary_accounts = [
                        ...person_primary.secondary_accounts,
                        person._id
                    ]
                    await person_primary.save();
                }
                let person_up = await person.save();
                res.status(200).json({
                    message:'Tipo de conta '+type_account+' setado com sucesso!',
                    data:person_up
                });
            }else{
                return res.status(400).json({
                    message:'Erro ao setar o tipo de conta, tipode conta ja setado',
                });
            }
        }else{
            res.status(400).json({
                message:'Erro ao setar o tipo de conta, id de usuario inválido',
            });
        }
    } catch (error) {
        res.status(400).json({
            message:'Erro ao setar o tipo de conta',
        });
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

const setPointPessoaCanal = async (id_user, channel_id) => {
    let data = {id_user, channel_id};
    // console.log('info add points canal: ',data);
    try {
        let pessoa = await Pessoa.findById(id_user);
        let index_channel = pessoa.channels.findIndex(channel=>{
            // console.log(`channel_id (${channel_id}) :: channel.info_channel (${channel.info_channel})`);
            return channel.info_channel == channel_id;
        });
        if (index_channel != -1 ) {
            pessoa.channels[index_channel].points = pessoa.channels[index_channel].points + 3;
            return pessoa.save();
        }else{
            console.log('canal nao encontrado no usuario');
        }
    } catch (error) {
        console.log('Erro ao adicionar pontos 2',error);
    }
};

const setPointPessoa = async (id_user, points) => {
    try {
        let pessoa = await Pessoa.findById(id_user);
        pessoa.points = pessoa.points + points;
        return pessoa.save();
    } catch (error) {
        console.log('Erro ao adicionar pontos 2',error);
    }
};

module.exports = {
    listPessoas,
    registerPerson,
    listPessoasOn,
    setPointPessoa,
    zerarPontosPessoas,
    addChannel,
    setStatusPessoaCanal,
    setPointPessoaCanal,
    registerOrUpdatePessoa,
    findPessoaById,
    findPerson,
    setTypePerson,
    listPersonForType
}