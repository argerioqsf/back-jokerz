
// const Pessoa = require("../../models/Pessoas");
// const PessoaCanal = require("../../models/PessoaCanal");
const PubSubTwitch = require('../../services/pubsubTwitch');
const Pessoa = require('../../schemas/pessoa');
const Channel = require('../../schemas/channel');
const AccountsLink = require('../../schemas/AccountsLink');

const listPessoas = async (req, res) => {
    try {
        let pessoas = await Pessoa.find()
        .populate('channels.info_channel')
        .populate('permissions.ifo_permission')
        .populate('accountsLinks.info_accountLink');
          res.status(200).json({
            data:pessoas
          });
    } catch (error) {
          res.status(400).send({
              message:'ERRO ao listar pessoas',
              error:error
          });
    }
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
        let person = await Pessoa.findById(req.userId).populate('primary_account_ref').populate('secondary_accounts').populate('permissions.ifo_permission')
        .populate('channels.info_channel').populate('accountsLinks.info_accountLink');
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
    return new Promise(async(resolve, reject)=>{
        try {
          let person_exists = await Pessoa.find({nickname:data.nickname.toLowerCase()});
          if (person_exists.length > 0) {
                console.log('pessoa ja existe');
                resolve({
                    status:true,
                    message:'Conta ja criada',
                    data:{},
                    code:200
                })
          }else{
              let person = await Pessoa.create(data);
              console.log('pessoa criada');
              resolve({
                  status:true,
                  message:'Cadastro criado com sucesso!',
                  data:person,
                  code:201
              })
          }
      } catch (error) {
          console.log('erro cadastro user: ',error);
          resolve({
              status:false,
              message:'Erro ao criar cadastro do usuário',
              error:error
          })
      }
    });
};
 
const registerOrUpdatePessoa = async (data) => {
    const {
        points = 0,
        nickname,
        timeOn = '',
        timeOff = '',
        idTwitch,
        session,
        permissions,
        accessTokenTwitch = '',
        refreshTokenTwitch = ''
    } = data;

    let nick = nickname.toLowerCase();
    let info = {
        points:points,
        name:nickname,
        nickname:nick,
        timeon:timeOn,
        timeoff:timeOff,
        idTwitch:idTwitch,
        session:session,
        permissions:permissions,
        accessTokenTwitch:accessTokenTwitch,
        refreshTokenTwitch:refreshTokenTwitch
    }
    
    try {
        let pessoa_idTwitch = await Pessoa.findOne({idTwitch:idTwitch});
        if (pessoa_idTwitch) {
            console.log('pessoa '+pessoa_idTwitch.name+' atualizada');
            pessoa_idTwitch.nickname=nick;
            pessoa_idTwitch.idTwitch=idTwitch;
            pessoa_idTwitch.session=session;
            pessoa_idTwitch.accessTokenTwitch=accessTokenTwitch;
            pessoa_idTwitch.refreshTokenTwitch=refreshTokenTwitch;
            return pessoa_idTwitch.save();
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

                if (type_account == 'primary') {
                    let person = await Pessoa.findById(id_person);
                    const ip = person.ip_user?person.ip_user:'';
                    let persons_primary = await Pessoa.find({ip_user:ip,type_account:'primary'});
                    if (persons_primary.length > 0) {
                        return res.status(400).json({
                            message:'Erro ao setar o tipo de conta, limite de contas primarias esgotado',
                        });
                    }
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

const setPointPessoaCanal = async (id_user, channel_id, points) => {
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

const setAccountLink = async (req,res)=>{
    const { id_user, id_accountLink } = req.body;
    try {
        let accountLink = {
            info_accountLink:id_accountLink
        }
        let pessoa = await Pessoa.findById(id_user);
        let accountLink_ = await AccountsLink.findById(id_accountLink);
        if (pessoa && accountLink_) {
            pessoa.accountsLinks = [
                ...pessoa.accountsLinks,
                accountLink
            ];
            let pessoa_new = await pessoa.save();
            res.status(200).json({
                message:'Conta vinculada com sucesso',
                data:pessoa_new
            });
        }else{
            res.status(400).json({
                message:'Erro setar conta vinculada, usuário ou conta não encontrado(a)'
            });
        }
    } catch (error) {
        res.status(400).json({
            message:'Erro ao setar conta vinculada',
            err:error
        });
    }
}

const changePointsSyncTwitch = async (id_user,status)=>{
    return new Promise(async (resolve,reject)=>{
        try {
            let pessoa = await Pessoa.findById(id_user);
            if (pessoa) {
                pessoa.pointsSyncTwitch = status;
                let pessoa_new = await pessoa.save();
                resolve({
                    message:'Status de sincronia dos pontos com a twitch trocado',
                    data:pessoa_new
                });
            }else{
                resolve(false);
            }
        } catch (error) {
            resolve(false);
        }
    });
}

const setPersonSyncPointsInitial = async ()=>{
    return new Promise(async (resolve,reject)=>{
        try {
            let pessoas = await Pessoa.find({pointsSyncTwitch:true});
            if (pessoas && pessoas.length > 0) {
                for (let i = 0; i < pessoas.length; i++) {
                    let topic = `channel-points-channel-v1.${pessoas[0].idTwitch}`;
                    console.log("foi 3:",topic);
                    console.log("foi 4:",pessoas[0].accessTokenTwitch);
                    console.log("foi 5:",pessoas[0]._id);
                    await PubSubTwitch.listen(topic,pessoas[0].accessTokenTwitch,pessoas[0]._id);
                }
                resolve(true);
            }else{
                resolve(false);
            }
        } catch (error) {
            resolve(false);
        }
    });
}

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
    listPersonForType,
    setAccountLink,
    changePointsSyncTwitch,
    setPersonSyncPointsInitial
}