
// const Canal = require("../../models/Canais");
const Pessoa = require('../../schemas/pessoa');
const RedeemPoints = require('../../schemas/RedeemPoints');
const pessoasController = require('../../controllers/pessoas/pessoasController');
const accountsLinkController = require('../../controllers/accountsLink/accountsLinkController');
const Channel = require('../../schemas/channel');
const pubsubTwitch = require('../../services/pubsubTwitch');
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();
let limit = 1000
let totalusers = 0
// const credenciais = require('./config');
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

const verifyQuantAccountFarm = async (id_channel, id_primary_account) => {
    return new Promise((resolve,reject)=>{
            return resolve(0);
    });
}

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
        let person = null;
        person = await Pessoa.findOne({idTwitch: id_twitch_user}).populate('channel.info_channel');
        if (!person) {
            person = await Pessoa.findOne({nickname: name_user.toLowerCase()}).populate('channel.info_channel');
        }
        let person_streamer = await Pessoa.findOne({idTwitch: id_twitch_streamer}).populate('channel');
        // console.log('person_streamer._id: ',person_streamer._id);
        let channel = person_streamer.channel;
        // console.log('channel._id: ',channel._id);
        let quant_account_farm = 0;
        if (person) {
            if (channel) {
                let id_primary_account = false;
                if (person.type_account == 'primary') {
                    id_primary_account = person._id;
                }
                if (person.type_account == 'secondary') {
                    if (person.primary_account_ref) {
                        id_primary_account = person.primary_account_ref;
                    }else{
                        id_primary_account = null;
                    }
                }
                if (person.type_account == 'pendente') {
                    id_primary_account = person._id;
                }
                if (id_primary_account == null) {
                    console.log("id_primary_account null");
                    return false;
                }
                if (id_primary_account == false) {
                    console.log("id_primary_account false");
                    return false;
                }
                if (id_primary_account) {
                    quant_account_farm = await verifyQuantAccountFarm(channel._id,id_primary_account);
                }

                console.log("quant_account_farm: ",quant_account_farm);
                
                let new_points = parseInt(cost/parseInt(person_streamer.divisorPoints));
                person.points = person.points + new_points;
                let index_channel = person.channels.findIndex(channel_=>{
                    // console.log(`channel_.info_channel (${channel_.info_channel}) :: channel._id (${channel._id})`);
                    return String(channel_.info_channel) == String(channel._id);
                });
                // console.log('index_channel: ',index_channel);

                if (index_channel != -1 ) {
                    person.channels[index_channel].points = person.channels[index_channel].points + new_points;
                    //////////////////////////////////////////////////
                    if (person.type_account == 'secondary') {
                        let person_primary = await Pessoa.findById(person.primary_account_ref);
                        person_primary.points = person_primary.points + new_points;
                        await person_primary.save();
                    }
                    person.channels[index_channel].status = true;
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
                    if (quant_account_farm < channel.max_farm_account) {
                        console.log('canal nao encontrado no usuario');
                        //////////////////////////////////////////////////
                        if (person.type_account == 'secondary') {
                            let person_primary = await Pessoa.findById(person.primary_account_ref);
                            person_primary.points = person_primary.points + new_points;
                            await person_primary.save();
                        }
                        person.channels = [
                            ...person.channels,
                            {
                                info_channel: channel._id,
                                points: new_points,
                                status:true
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
                    }else{
                        //setar resgate como UNFULFILLED
                        //e mandar mensagem no chat informando que o numero maximo de contas farmando foi atingido
                        console.log("conta limite farmando excedido");
                        return false;
                    }
                }
            }else{
                console.log("canal nao encontrado");
                return false;
            }
        }else{
            console.log('pessoa nao encontrada');
            if (person_streamer) {
                console.log('Criando pessoa nova');
                let new_points = parseInt(cost/parseInt(person_streamer.divisorPoints));
                //////////////////////////////////////////////////
                let data = {
                    nickname:name_user.toLowerCase(),
                    name:name_user,
                    idTwitch:id_twitch_user,
                    points:new_points,
                    channels:[
                        {
                            info_channel: channel._id,
                            points: new_points,
                            status:true
                        }
                    ]
                }
                // let reward_change = await changeStatus('FULFILLED',id_twitch_streamer,reward_id,redemption_id,person_streamer.accessTokenTwitch);
                if (true) {
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
                    }
                }else{
                    data.points = 0;
                    let new_person = await pessoasController.registerPerson(data);
                    if (new_person.status && new_person.code == 201) {
                        console.log('Pessoa nova criada: ',new_person);
                    }
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

 const changeStatus = async(status,id_twitch,reward_id,redemption_id,token_twitch)=>{
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
    return new Promise(async(resolve,reject)=>{
        try {
            const response = await instance_changeStatus.patch(`helix/channel_points/custom_rewards/redemptions?broadcaster_id=${id_twitch}&reward_id=${reward_id}&id=${redemption_id}`,body)
            
            // handle success
            console.log("response changeStatus");
            console.log(response.data);
            resolve(true);
        } catch (error) {
            // addpoints(-(quant),nome);
            resolve(false);
            console.log("error changeStatus: ", error);
            if (error.response) {
            console.log("error changeStatus: ", error.response.data.message);
            } else if (error.request) {
            console.log("error changeStatus: ", error.message);
            } else {
            console.log("error changeStatus: ", error.message);
            }
        }
    });
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

const restorePointsStreamElements = async(req, res)=>{
    console.log('req.userId: ',req.userId);
    try {
        let id_user = req.userId;
        const user_streamer = await Pessoa.findById(id_user).populate('channel');
        if (user_streamer && user_streamer.streamer) {
            if (user_streamer.accessTokenStreamElements && user_streamer.IdStreamElements) {
                const instance = axios.create({
                    baseURL: 'https://api.streamelements.com/',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${user_streamer.accessTokenStreamElements}`
                    }
                });
                let channel = user_streamer.channel;
                if (channel) {
                    const response = await instance.get(`kappa/v2/points/5d5ff78d8473a0bc7ec84f01/top?limit=1`);
                    totalusers = parseInt(response.data._total);
                    console.log('totalusers: ',totalusers);
                    let count = Math.ceil(totalusers/1000);
                    let offset = 0;
                    console.log('count: ',count);
                    for (let i = 0; i < count; i++) {
                        let resp = await add_userpoints(offset, user_streamer, channel, instance);
                        if (!resp) {
                            return res.status(500).json({
                                message:'Erro ao fazer restore de postos do streamElements, erro ao listar pontos'
                            });
                        }
                        offset = offset + 1000;
                    }
                    user_streamer.restoreStreamElements = true;
                    await user_streamer.save();
                    return res.status(200).json({
                        data:totalusers,
                        message:'Sucesso no restore de postos do streamElements'
                    });
                }else{
                    return res.status(400).json({
                        message:'Erro ao fazer restore de postos do streamElements, usuário não possui canal cadastrado'
                    });
                }
            }else{
                return res.status(400).json({
                    message:'Erro ao fazer restore de postos do streamElements, credencias do stream elements não cadastradas corretamente'
                });
            }
        }else{
            return res.status(400).json({
                message:'Erro ao fazer restore de postos do streamElements, usuário sem permissão'
            });
        }
    } catch (error) {
        console.log('Error list_userpoints: ', error);
    }
}

const add_userpoints = async (offset, user_streamer, channel, instance)=>{
    return new Promise(async(resolve,reject)=>{
        try {
            const response = await instance.get(`kappa/v2/points/${user_streamer.IdStreamElements}/top?offset=${offset}&limit=${limit}`);
                var totalusers = parseInt(response.data._total);
                console.log('response.data.users.length: ',response.data.users.length);
                let count = response.data.users.length;
                let now = new Date();
                let users = response.data.users;
                for(let i = 0; i < count; i++){
                    let person = await Pessoa.findOne({nickname:users[i].username.toLowerCase()})
                    if (person) {
                        let new_points = users[i].points;
                        person.points = person.points + new_points;
                        let index_channel = person.channels.findIndex(channel_=>{
                            return String(channel_.info_channel) == String(channel._id);
                        });
                        if (index_channel != -1 ) {
                            person.channels[index_channel].points = person.channels[index_channel].points + new_points;
                            //////////////////////////////////////////////////
                            person.channels[index_channel].status = true;
                            await person.save();
                            console.log('Pessoa atualizada com canal: ',person.nickname.toLowerCase());
                            let dataRedeeem = {
                                date:new Date(),
                                amount:new_points,
                                id_user:person._id,
                                id_channel:channel._id
                            }
                            let redeem = await RedeemPoints.create(dataRedeeem);
                            // return true;
                        }else{
                                console.log('canal nao encontrado no usuario');
                                //////////////////////////////////////////////////
                                person.channels = [
                                    ...person.channels,
                                    {
                                        info_channel: channel._id,
                                        points: new_points,
                                        status:true
                                    }
                                ];
                                await person.save();
                                console.log('Pessoa atualizada sem canal: ',person.nickname.toLowerCase());
                                let dataRedeeem = {
                                    date:new Date(),
                                    amount:new_points,
                                    id_user:person._id,
                                    id_channel:channel._id
                                }
                                let redeem = await RedeemPoints.create(dataRedeeem);
                                // console.log("redeem criado: ",redeem);
                                // return true;
                        }
                    }else{
                        console.log('Criando pessoa nova');
                        let new_points = users[i].points;
                        //////////////////////////////////////////////////
                        let data = {
                            nickname:users[i].username.toLowerCase(),
                            name:users[i].username,
                            points:new_points,
                            channels:[
                                {
                                    info_channel: channel._id,
                                    points: new_points,
                                    status:true
                                }
                            ]
                        }
                        let new_person = await pessoasController.registerPerson(data);
                        if (new_person.status && new_person.code == 201) {
                            console.log('Pessoa nova criada: ',new_person.data.nickname.toLowerCase());
                            let dataRedeeem = {
                                date:new Date(),
                                amount:new_points,
                                id_user:new_person.data._id,
                                id_channel:channel._id
                            }
                            let redeem = await RedeemPoints.create(dataRedeeem);
                        }else{
                            return resolve(false);
                        }
                    }
                }
                return resolve(true);
        } catch (error) {
            console.log('Error add_userpoints: ', error);
            return resolve(false);
        }
    });
}

module.exports = {
    activeSyncPointsTwitch,
    addpoints,
    addpointsStreamElements,
    changeStatus,
    changeSyncPubsub,
    restorePointsStreamElements
}