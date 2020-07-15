
// const Canal = require("../../models/Canais");
const oauth = require('../../services/oauthtwitch');
const uuid = require("uuid").v4;
const pessoasController = require('../../controllers/pessoas/pessoasController');

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

const authFromCode = async (req, res) => {
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
        const session = uuid();
        res.cookie('session',session, { maxAge: 24 * 60 * 60 * 1000 });
        let createOrUpdate = await pessoasController.registerOrUpdatePessoa({
            session:session,
            idTwitch:decodedResponse.resp.sub,
            nickname:decodedResponse.resp.preferred_username
        });
        if (createOrUpdate) {
            res.status(200).json({
            message:'Token gerado atraves do code com sucesso!',
            decodedResponse:decodedResponse
            });
        }else{
            res.status(500).json({
            message:'Erro ao recuperar token atraves do code 0'
            });
        }
        }else{
        res.status(500).json({
            message:'Erro ao recuperar token atraves do code 1',
            error:resp.error
        });
        }
    } catch (error) {
        res.status(500).json({
        message:'Erro ao recuperar token atraves do code 2',
        error:error
        });
    }
};
  
const registerCanal = async (req, res) => {
  
  const { name } = req.body;
    let data = {
        name:name,
    }
  try {
      let resp = await Channel.create(data);
      res.status(201).json({
          message:'Canal cirada com sucesso!',
          data:resp
      });
  } catch (error) {
      res.status(400).json({
          message:'Erro ao criar cadastro de canal',
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
    authFromCode
}