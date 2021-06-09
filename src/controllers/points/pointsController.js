
// const Canal = require("../../models/Canais");
const Pessoa = require('../../schemas/pessoa');
const RedeemPoints = require('../../schemas/RedeemPoints');
const pessoasController = require('../../controllers/pessoas/pessoasController');
const accountsLinkController = require('../../controllers/accountsLink/accountsLinkController');
const Channel = require('../../schemas/channel');
const pubsubTwitch = require('../../services/pubsubTwitch');
const axios = require('axios');
const dotenv = require('dotenv');
var ObjectId = require('mongodb').ObjectId;
dotenv.config();
// const botController = require('../../controllers/bot/botController');

const activeSyncPointsTwitch = async (req, res) => {
    console.log('req.userId: ',req.userId);
    try {
        let person = await Pessoa.findById(req.userId).populate('permissions.ifo_permission').populate('accountsLinks.info_accountLink');
        // console.log('person: ',person);
        if (person) {
            if (person.permissions.length > 0) {
                let perm_streamer = person.permissions.findIndex((permisao)=>{
                    return permisao.ifo_permission.name === "streamer";
                });
                console.log('perm_streamer: ',perm_streamer);
                if (perm_streamer != -1) {
                    let active = req.query.active;
                    active = (active === 'true');
                    console.log("active",active);
                    console.log("person.accessTokenTwitch",person.accessTokenTwitch);
                    let topic = `channel-points-channel-v1.${person.idTwitch}`;
                    if (active) {
                        await pubsubTwitch.listen(topic,person.accessTokenTwitch,person._id);
                    } else {
                        await pubsubTwitch.unlisten(topic,person.accessTokenTwitch,person._id);
                    }
                    return res.status(200).json({
                      message: 'Pontos da twitch sincronizados'
                    });
                }else{
                    return res.status(400).send({
                        message:'Erro ao sincronizar pontos da twitch, o usuário não possui permissão de streamer',
                    });
                }
            }
        }else{
            return res.status(400).send({
                message:'Erro ao sincronizar pontos da twitch, o usuário não existe',
            });
        }
    } catch (error) {
        return res.status(400).send({
            message:'Erro ao sincronizar pontos da twitch',
        });
    }
};

const addpoints = async(reward)=>{
    try {
        let { 
            cost,
            name_user,
            id_twitch_user,
            reward_id,
            redemption_id,
            id_twitch_streamer
        } = reward;
        let person = await Pessoa.findOne({idTwitch: id_twitch_user}).populate('channel.info_channel');
        let person_streamer = await Pessoa.findOne({idTwitch: id_twitch_streamer}).populate('channel');
        console.log('person_streamer._id: ',person_streamer._id);
        let channel = person_streamer.channel;
        console.log('channel._id: ',channel._id);
        
        if ((channel && person)) {

            let new_points = parseInt(cost/parseInt(person_streamer.divisorPoints));
            person.points = person.points + new_points;
            let index_channel = person.channels.findIndex(channel_=>{
                console.log(`channel_.info_channel (${channel_.info_channel}) :: channel._id (${channel._id})`);
                return String(channel_.info_channel) == String(channel._id);
            });
            console.log('index_channel: ',index_channel);

            if (index_channel != -1 ) {
                person.channels[index_channel].points = person.channels[index_channel].points + new_points;
                await person.save();
                let dataRedeeem = {
                    date:new Date(),
                    amount:new_points,
                    id_user:person._id,
                    id_channel:channel._id
                }
                let redeem = await RedeemPoints.create(dataRedeeem);
                // console.log("redeem criado: ",redeem);
                return true;
            }else{
                console.log('canal nao encontrado no usuario');
                person.channels = [
                    ...person.channels,
                    {
                        info_channel: channel._id,
                        points: new_points
                    }
                ];
                await person.save();
                let dataRedeeem = {
                    date:new Date(),
                    amount:new_points,
                    id_user:person._id,
                    id_channel:channel._id
                }
                let redeem = await RedeemPoints.create(dataRedeeem);
                // console.log("redeem criado: ",redeem);
                return true;
            }

        }else{
            console.log('pessoa nao encontrada');
            if (person_streamer) {
                console.log('Criando pessoa nova');
                let new_points = parseInt(cost/parseInt(person_streamer.divisorPoints));
                let data = {
                    nickname:name_user,
                    name:name_user,
                    idTwitch:id_twitch_user,
                    points:new_points,
                    channels:[
                        {
                            info_channel: channel._id,
                            points: new_points
                        }
                    ]
                }
                let new_person = await pessoasController.registerPerson(data);
                if (new_person.status && new_person.code == 201) {
                    console.log('Pessoa nova criada: ',new_person);
                    let dataRedeeem = {
                        date:new Date(),
                        amount:new_points,
                        id_user:new_person.data._id,
                        id_channel:channel._id
                    }
                    let redeem = await RedeemPoints.create(dataRedeeem);
                    return true;
                }
            }
        }

    } catch (error) {
        console.log("error addpoints: ", error);
        if (error.response) {
        console.log("error addpoints: ", error.response.data.message);
        } else if (error.request) {
        console.log("error addpoints: ", error.message);
        } else {
        console.log("error addpoints: ", error.message);
        }
    }
}

const addpointsStreamElements = async(quant,nomeUser)=>{
    try {
        const instance2 = axios.create({
            baseURL: 'https://api.streamelements.com/',
            headers: {'Authorization': `Bearer ${credenciais.token_streamElements_jockerz}`}
        });
        const response = await instance2.put(`kappa/v2/points/${credenciais.id_canal_streamElements_jockerz}/${nomeUser}/${quant}`)
        console.log("response addpoints");
        console.log(response.data);
        const now = new Date();
        // let quantdb = quant;
        // connection.query('INSERT INTO pipocas (user, amount) VALUES ('+nomedb+', '+quantdb+')',
        var sql = "INSERT INTO ppcadd (user, amount, data) VALUES ?";
        var values = [
          [nomeUser, quant, now],
        ];
        connection.query(sql, [values],
            function(err, result){
                if(!err){
                    console.log('Pontos adicionados ao DB');
                }else{
                    console.log('Erro ao cadastrar no DB');
                }
        })
        return response;
    } catch (error) {
        console.log("error addpoints: ", error);
        if (error.response) {
        console.log("error addpoints: ", error.response.data.message);
        } else if (error.request) {
        console.log("error addpoints: ", error.message);
        } else {
        console.log("error addpoints: ", error.message);
        }
    }
}

 const changeStatus = async(status,id_twitch,reward_id,id,quant,nome,token_twitch)=>{
    const instance_changeStatus = axios.create({
        baseURL: 'https://api.twitch.tv/',
        headers: {
            'Client-Id': process.env.CLIENT_ID,
            'Authorization': `Bearer ${token_twitch}`,
            'Content-Type': 'application/json'
        }
    });
    const body = {
        status:status
    }
    try {
        const response = await instance_changeStatus.patch(`helix/channel_points/custom_rewards/redemptions?broadcaster_id=${id_twitch}&reward_id=${reward_id}&id=${id}`,body)
        
        // handle success
        console.log("response changeStatus");
        console.log(response.data);
        return response;
    } catch (error) {
        addpoints(-(quant),nome);
        console.log("error changeStatus: ", error);
        if (error.response) {
        console.log("error changeStatus: ", error.response.data.message);
        } else if (error.request) {
        console.log("error changeStatus: ", error.message);
        } else {
        console.log("error changeStatus: ", error.message);
        }
    }
}

const changeSyncPubsub = async (req, res)=>{
    try {
        console.log('req.userId: ',req.userId);
        let active = req.query.active;
        active = (active === 'true');
        console.log('active: ',active);
        let person = await Pessoa.findById(req.userId).populate('accountsLinks.info_accountLink');
        let linkedTwitch = false;
        if (person && person.accountsLinks.length > 0) {
            linkedTwitch = person.accountsLinks.filter((accountLink)=>{
                return accountLink.info_accountLink.name == 'twitch' && accountLink.active == true;
            });
            console.log('linkedTwitch: ',linkedTwitch);
            if (linkedTwitch.length > 0) {
                linkedTwitch = true;
            }else{
                linkedTwitch = false;
            }
        }
        console.log('linkedTwitch: ',linkedTwitch);
        if (linkedTwitch) {
            if (active == true) {
                console.log('active');
                await pubsubTwitch.connect();
                await accountsLinkController.changeStatusPubsub(true,'');
                return res.status(200).json({
                    message: `PubSub ativado com sucesso!`
                });
            }else{
                console.log('desactive');
                await pubsubTwitch.desconnect();
                await accountsLinkController.changeStatusPubsub(false,'');
                return res.status(200).json({
                    message: `PubSub desativado com sucesso!`
                });
            }
        }else{
            return res.status(500).send({
                message:'Vincule a sua conta da Twitch primeiro.',
            });
        }
    } catch (error) {
        return res.status(500).send({
            message:'Erro ao trocr status do PubSub',
        });
    }
}

module.exports = {
    activeSyncPointsTwitch,
    addpoints,
    addpointsStreamElements,
    changeStatus,
    changeSyncPubsub
}