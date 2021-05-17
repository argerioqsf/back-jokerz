
const Pessoa = require("../../schemas/pessoa");
const oauth = require('../../services/oauthtwitch');
const uuid = require("uuid").v4;
const pessoasController = require('../../controllers/pessoas/pessoasController');
const canalController = require('../../controllers/canal/canalController');
// const botController = require('../../controllers/bot/botController');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authConfig = require('../../configs/auth.json');

const genereteToken = (params = {})=>{
    return jwt.sign(params, authConfig.secret,{
        expiresIn:86400,
    });
}

const getUrlTwitch = async (req, res) => {
  
    let url = `https://id.twitch.tv/oauth2/authorize`;
    url += `?response_type=code`;
    url += `&client_id=cxzb1067dgz0mtca08o9s9k9ny9aqk`;
    url += `&redirect_uri=http://localhost:3000/callback_oauth`;
    url += `&scope=user_read+openid`;
    url += `&claims={"id_token":{"preferred_username":null}}`;
  
    res.status(200).json({
      message:'url de login gerada com sucesso',
      data:{url:url},
    });
};

const authFromCodePerson = async (req, res) => {
    const { code } = req.query;
    console.log('code: ',code);
    res.header('Access-Control-Allow-Credentials', true)
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000')
    try {
        const resp = await oauth.getTokenFromCode(code);
        let data = resp.resp.data;
        console.log('resp.status: ',resp.status);
        
        if (resp.status) {
            let decodedResponse = await oauth.parseJWTToken(resp.resp.data.id_token);
            console.log('decodedResponse: ',decodedResponse);
            
            let createOrUpdate = await pessoasController.registerOrUpdatePessoa({
                idTwitch:decodedResponse.resp.sub,
                nickname:decodedResponse.resp.preferred_username
            });
            if (createOrUpdate) {
                res.status(200).json({
                    message:'Token gerado atraves do code com sucesso!',
                    data:decodedResponse.resp,
                    token:genereteToken({ id:createOrUpdate._id })
                });
            }else{
                res.status(500).json({
                    message:'Erro cadastrar usuario.'
                });
            }
        }else{
            res.status(500).json({
                message:'Erro ao autenticar usuário.',
                error:resp.error
            });
        }
    } catch (error) {
        res.status(500).json({
            message:'Erro ao autenticar usuário, fale com os administradores do sistema.',
            error:error
        });
        console.log('erro auth from code: ',error);
    }
};
  
const registerAuthStreamer = async (req, res) => {
  
  const {
      name,
      password,
      nickname,
      points = 0,
      tradelinkSteam = '',
      permissions,
      linkTwitch = ''
    } = req.body;

    let data = {
        streamer:true,
        linkTwitch:linkTwitch,
        name:name,
        password:password,
        nickname:nickname,
        points:points,
        tradelinkSteam:tradelinkSteam,
        permissions:permissions,
    }
    try {
        let cad_person = await pessoasController.registerPerson(data);
        if (cad_person.status) {
            if (cad_person.code == 201) {
                data.id_person = cad_person.data._id;
                let cad_channel = await canalController.registerCanal(data);
                if (cad_channel.status) {
                    if (cad_channel.code == 201) {
                        cad_person.data.password = undefined;
                        res.status(cad_person.code).json({
                            message:'Conta de Streamer criada com sucesso!',
                            token:genereteToken({ id:cad_person.data._id }),
                            data:cad_person.data,
                        });
                        // let join_bot = await botController.addChannel(cad_channel.data._id);
                        // console.log('join_bot: ',join_bot);
                    } else {
                        res.status(cad_person.code).json({
                            message:'Conta não criada pois o nickname ja está cadastrado no sistema'
                        });
                    }
                }else{
                    res.status(500).json({
                        message:cad_channel.message,
                        error:cad_channel.error
                    });
                }
            }else{
                res.status(cad_person.code).json({
                    message:'Conta não criada pois ja existe um usuário com este nickname'
                });
            }
        }else{
            res.status(500).json({
                message:cad_person.message,
                error:cad_person.error
            });
        }
    } catch (error) {
        res.status(500).json({
            message:'Erro ao cadastrar e autenticar o usuário',
            error:error
        });
    }
};

const loginStreamer = async (req, res) => {
    const { nickname, password } = req.body;
        let data = {
            name:nickname,
        }
    try {
        let person = await Pessoa.findOne({nickname:nickname}).select('+password');
        if (!person) {
            return res.status(400).send({
                message:'Usuario não existe'
            });
        }else{
            if (!await bcrypt.compare(password, person.password)) {
                return  res.status(400).send({
                    message:'Senha inválida'
                });
            }else{
                person.password = undefined;

                res.status(200).send({
                    message:'usuário autenticado com sucesso',
                    token:genereteToken({ id:person._id }),
                    data:person
                });
            }
        }
    } catch (error) {
        res.status(400).json({
            message:'Erro ao autenticar usuário',
            err:error
        });
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

module.exports = {
    getUrlTwitch,
    authFromCodePerson,
    loginStreamer,
    registerAuthStreamer
}