const Pessoa = require("../../schemas/pessoa");
const Channel = require("../../schemas/channel");
const oauth = require("../../services/oauthtwitch");
const uuid = require("uuid").v4;
const pessoasController = require("../../controllers/pessoas/pessoasController");
const authController = require("../../controllers/auth/authController");
const canalController = require("../../controllers/canal/canalController");
// const botController = require('../../controllers/bot/botController');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authConfig = require("../../configs/auth.json");
const axios = require("axios");
const dotenv = require("dotenv");
const { getUserInfo } = require("../../services/twitch");
dotenv.config();

exports.genereteToken = function (params = {}) {
  return jwt.sign(params, authConfig.secret, {
    expiresIn: 86400,
  });
};

exports.getUrlTwitch = async function (req, res) {
  let { state } = req.query;
  let url = `https://id.twitch.tv/oauth2/authorize`;
  url += `?response_type=code`;
  url += `&client_id=${process.env.CLIENT_ID}`;
  url += `&redirect_uri=${process.env.REDIRECT_URI}`;
  url += `&scope=user_read+openid`;
  if (state) {
    url += `&state=${state}`;
  }
  url += `&claims={"id_token":{"preferred_username":null},"userinfo":{"picture":null}}}`;

  res.status(200).json({
    message: "url de login gerada com sucesso",
    data: { url: url },
  });
};

exports.getUrlTwitchLinkedAccount = async function (req, res) {
  let { state } = req.query;
  let url = `https://id.twitch.tv/oauth2/authorize`;
  url += `?response_type=code`;
  url += `&client_id=${process.env.CLIENT_ID}`;
  url += `&redirect_uri=${process.env.REDIRECT_URI}`;
  url += `&scope=channel:manage:redemptions+channel:read:redemptions+user_read+openid`;
  if (state) {
    url += `&state=${state}`;
  }
  url += `&claims={"id_token":{"preferred_username":null},"userinfo":{"picture":null}}}`;

  res.status(200).json({
    message: "url de login gerada com sucesso",
    data: { url: url },
  });
};

exports.authFromCodePerson = async function (req, res) {
  const ip =
    (req.headers["x-forwarded-for"] || "").split(",").pop().trim() ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;
  console.log("ip: ", ip);
  const { code, id_user = null } = req.query;
  // console.log('code: ',code);
  // console.log('id_user: ',id_user);
  res.header("Access-Control-Allow-Credentials", true);
  res.header("Access-Control-Allow-Origin", process.env.URL_SITE);
  try {
    const resp = await oauth.getTokenFromCode(code);
    let data = resp.resp.data;
    let infoUser = await getUserInfo(data.access_token);
    console.log("infoUser: ", infoUser.resp.data.picture);
    // console.log('resp.status: ',resp.status);
    // console.log('data: ',data);

    if (resp.status) {
      let decodedResponse = await oauth.parseJWTToken(resp.resp.data.id_token);
      let pessoa = null;
      if (id_user) {
        pessoa = await Pessoa.findById(id_user).populate(
          "accountsLinks.info_accountLink"
        );
      } else {
        pessoa = await Pessoa.find({
          idTwitch: decodedResponse.resp.sub,
        }).populate("accountsLinks.info_accountLink");
        if (pessoa.length == 0) {
          pessoa = await Pessoa.find({
            nickname: decodedResponse.resp.preferred_username.toLowerCase(),
          }).populate("accountsLinks.info_accountLink");
        }
        pessoa = pessoa.length > 0 ? pessoa[0] : null;
      }
      // console.log('pessoa: ',pessoa);
      if (pessoa) {
        if (pessoa.streamer == true && !id_user) {
          return res.status(400).json({
            message:
              "Erro ao autenticar usuário, tente fazer login pela interface administrativa",
          });
        } else {
          // if (pessoa.nickname != decodedResponse.resp.preferred_username) {
          //     return res.status(500).json({
          //         message:'O usuário da Twitch logado no seu navegador não corresponde ao que você quer vincular, faça login na conta conta da twitch correta.',
          //         error:{id_user:pessoa._id}
          //     });
          // }else{
          if (pessoa.streamer && pessoa.accountsLinks) {
            for (let i = 0; i < pessoa.accountsLinks.length; i++) {
              if (pessoa.accountsLinks[i].info_accountLink.name == "twitch") {
                pessoa.accountsLinks[i].active = true;
              }
            }
          }
          pessoa.idTwitch = decodedResponse.resp.sub;
          pessoa.nickname =
            decodedResponse.resp.preferred_username.toLowerCase();
          pessoa.picture = infoUser.resp.data.picture
            ? infoUser.resp.data.picture
            : "https://www.banffcentre.ca/sites/all/themes/tbc_custom/images/default_user.png";
          pessoa.accessTokenTwitch = data.access_token;
          pessoa.refreshTokenTwitch = data.refresh_token;
          if (!pessoa.ip_user) {
            console.log("novo IP:", ip);
            pessoa.ip_user = ip;
          }
          let save = await pessoa.save();
          if (save) {
            return res.status(200).json({
              message:
                "Token gerado atraves do code com sucesso, conta vinculada!",
              data: {
                ...decodedResponse.resp,
                user_id: pessoa._id,
              },
              token: authController.genereteToken({ id: pessoa._id }),
            });
          } else {
            return res.status(500).json({
              message: "Erro ao vincular Twitch a sua conta.",
            });
          }
          // }
        }
      } else {
        const pessoasController = require("../../controllers/pessoas/pessoasController");
        let createOrUpdate = await pessoasController.registerPerson({
          idTwitch: decodedResponse.resp.sub,
          nickname: decodedResponse.resp.preferred_username.toLowerCase(),
          picture: infoUser.resp.data.picture
            ? infoUser.resp.data.picture
            : "https://www.banffcentre.ca/sites/all/themes/tbc_custom/images/default_user.png",
          name: decodedResponse.resp.preferred_username,
          accessTokenTwitch: data.access_token,
          refreshTokenTwitch: data.refresh_token,
          ip_user: ip,
        });
        if (createOrUpdate.status) {
          return res.status(200).json({
            message: "Token gerado atraves do code com sucesso!",
            data: {
              ...decodedResponse.resp,
              user_id: createOrUpdate._id,
            },
            token: authController.genereteToken({
              id: createOrUpdate.data._id,
            }),
          });
        } else {
          return res.status(500).json({
            message: "Erro cadastrar usuario: " + createOrUpdate.error.message,
          });
        }
      }
    } else {
      return res.status(500).json({
        message: "Erro ao autenticar usuário.",
        error: resp.error,
      });
    }
  } catch (error) {
    console.log("erro auth from code: ", error);
    return res.status(500).json({
      message:
        "Erro ao autenticar usuário, fale com os administradores do sistema: " +
        error.message,
      error: error,
    });
  }
};

exports.registerAuthStreamer = async function (req, res) {
  const pessoasController = require("../../controllers/pessoas/pessoasController");
  const {
    name,
    password,
    nickname,
    points = 0,
    tradelinkSteam = "",
    permissions,
    linkTwitch = "",
    accessTokenStreamElements = null,
    IdStreamElements = null,
    porcetagem_indicacao = null,
    divisorPoints = null,
  } = req.body;
  let files = req.files;

  let image_channel = files.filter((file) => {
    return file.fieldname == "picture";
  });
  console.log("image_channel: ", image_channel);
  console.log("permissions: ", permissions);
  console.log("JSON.parse(permissions): ", JSON.parse(permissions));
  let data = {
    streamer: true,
    linkTwitch: linkTwitch,
    name: name,
    password: password,
    nickname: nickname.toLowerCase(),
    points: points,
    tradelinkSteam: tradelinkSteam,
    permissions: JSON.parse(permissions),
    accessTokenStreamElements: accessTokenStreamElements,
    IdStreamElements: IdStreamElements,
    picture: image_channel.length > 0 ? image_channel[0].path : "",
    porcetagem_indicacao: porcetagem_indicacao,
    divisorPoints: divisorPoints,
  };
  try {
    let streamer_create = await authController.createAuthStreamer(data);

    return res.status(streamer_create.code).json({
      message: streamer_create.message,
      token: streamer_create.token ? streamer_create.token : null,
      data: streamer_create.data,
      error: streamer_create.error,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao cadastrar e autenticar o usuário",
      error: error,
    });
  }
};

exports.createAuthStreamer = async function (data) {
  const pessoasController = require("../../controllers/pessoas/pessoasController");
  try {
    let cad_person = await pessoasController.registerPerson(data);
    if (cad_person.status) {
      if (cad_person.code == 201) {
        data.id_person = cad_person.data._id;
        let cad_channel = await canalController.registerCanal(data);
        if (cad_channel.status) {
          if (cad_channel.code == 201) {
            let person = await Pessoa.findById(data.id_person);
            console.log("cad_channel.data._id: ", cad_channel.data._id);
            person.channel = cad_channel.data._id;
            await person.save();
            cad_person.data.password = undefined;
            return {
              code: cad_person.code,
              status: true,
              token: authController.genereteToken({ id: cad_person.data._id }),
              data: cad_person.data,
              message: "Conta de Streamer criada com sucesso!",
              error: {},
            };
          } else {
            let deletado = await Pessoa.findByIdAndDelete(data.id_person);
            return {
              code: cad_person.code,
              status: false,
              message: "Canal não criado ja exist um canal criado no sistema",
              error: {},
            };
          }
        } else {
          return {
            code: 500,
            status: false,
            message: cad_channel.message,
            error: cad_channel.error,
          };
        }
      } else {
        return {
          code: cad_person.code,
          message:
            "Usuário não criada pois ja existe um usuário com este nickname",
          error: {},
        };
      }
    } else {
      return {
        code: 500,
        message: cad_person.message,
        error: cad_person.error,
      };
    }
  } catch (error) {
    return {
      code: 500,
      message: "Erro ao cadastrar e autenticar o usuário",
      error: error,
    };
  }
};

exports.loginStreamer = async function (req, res) {
  const { nickname, password } = req.body;
  let data = {
    name: nickname.toLowerCase(),
  };
  try {
    let channel = await Channel.findOne({ name: nickname.toLowerCase() })
      .populate("id_person")
      .populate({
        path: "id_person",
        populate: { path: "permissions.ifo_permission" },
      });
    let person = await Pessoa.findById(channel.id_person._id).select(
      "+password"
    );
    if (!person) {
      return res.status(400).send({
        message: "Usuario não existe",
      });
    } else {
      if (!(await bcrypt.compare(password, person.password))) {
        return res.status(400).send({
          message: "Senha inválida",
        });
      } else {
        person.password = undefined;

        return res.status(200).send({
          message: "usuário autenticado com sucesso",
          token: authController.genereteToken({ id: person._id }),
          data: person,
          channel: channel,
        });
      }
    }
  } catch (error) {
    return res.status(400).json({
      message: "Erro ao autenticar usuário",
      err: error,
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

exports.refreshToken = async function (id_user) {
  return new Promise(async (resolve, reject) => {
    const instance_refreshToken = axios.create({
      baseURL: "https://id.twitch.tv/",
    });
    try {
      console.log("id_user: ", id_user);
      let person = await Pessoa.findById(id_user);
      if (person) {
        // console.log("person: ",person);
        let refresh_token = person.refreshTokenTwitch;
        console.log("refresh_token: ", refresh_token);
        console.log("process.env.CLIENT_ID: ", process.env.CLIENT_ID);
        console.log("process.env.CLIENT_SECRET: ", process.env.CLIENT_SECRET);
        let url = `grant_type=refresh_token&refresh_token=${refresh_token}&client_id=${process.env.CLIENT_ID}&client_secret=${process.env.CLIENT_SECRET}`;
        // console.log("url: ",url);
        const response = await instance_refreshToken.post(
          `/oauth2/token?${url}`
        );
        console.log(
          "response refreshToken.expires_in: ",
          response.data.expires_in
        );
        person.accessTokenTwitch = response.data.access_token;
        await person.save();
        resolve(true);
        // return {access_token:response.data.access_token,expires_in:response.data.expires_in};
      } else {
        resolve(false);
      }
    } catch (error) {
      // console.log("error refreshToken: ", error);
      if (error.response) {
        console.log(
          "error refreshToken response: ",
          error.response.data.message
        );
        resolve(false);
      } else if (error.request) {
        resolve(false);
        console.log("error refreshToken request: ", error.message);
      } else {
        resolve(false);
        console.log("error refreshToken ultimo: ", error.message);
      }
    }
  });
};
