
// const Canal = require("../../models/Canais");
const Pessoa = require('../../schemas/pessoa');
const RedeemPoints = require('../../schemas/RedeemPoints');
const pessoasController = require('../../controllers/pessoas/pessoasController');
const authController = require('../../controllers/auth/authController');
const pointsController = require('../points/pointsController');
const accountsLinkController = require('../../controllers/accountsLink/accountsLinkController');
const pubsubTwitch = require('../../services/pubsubTwitch');
const axios = require('axios');
const dotenv = require('dotenv');
const Rewards = require('../../schemas/Rewards');
const { v4: uuidv4 } = require('uuid');
const { percentageChance } = require('../../services/roleta');
const AccountsLink = require('../../schemas/AccountsLink');
const Channel = require('../../schemas/channel');
dotenv.config();
let limit = 1000
let totalusers = 0
// const credenciais = require('./config');
// const botController = require('../../controllers/bot/botController');

exports.activeSyncPointsTwitch = async function(req, res){
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

exports.verifyQuantAccountFarm = async function (id_channel, id_primary_account){
    return new Promise((resolve,reject)=>{
            return resolve(0);
    });
}

exports.addpoints = async function(reward){
    try {
        let { 
            cost,
            name_user,
            id_twitch_user,
            reward_id,
            redemption_id,
            id_twitch_streamer
        } = reward;
        
        let reward_exist = await Rewards.findOne({id_reward:reward_id});
        if (reward_exist) {
            let person = null;
            person = await Pessoa.findOne({idTwitch: id_twitch_user}).populate('channel.info_channel');
            if (!person) {
                person = await Pessoa.findOne({nickname: name_user.toLowerCase()}).populate('channel.info_channel');
            }
            let person_streamer = await Pessoa.findOne({idTwitch: id_twitch_streamer}).populate('channel');
            let channel = person_streamer.channel;
            if (person) {
                if (channel) {
                    if (person_streamer) {
                        let new_points = parseInt(cost/parseInt(person_streamer.divisorPoints));
                        person.points = person.points + new_points;

                        let index_channel = person.channels.findIndex(channel_=>{
                            return String(channel_.info_channel) == String(channel._id);
                        });
        
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
                                id_channel:channel._id,
                                status:'entregue',
                                reward_id:reward_id,
                                redemption_id:redemption_id
                            }
                            let redeem = await RedeemPoints.create(dataRedeeem);
                            let redemptions_change_status = await pointsController.changeStatus(person_streamer._id,'FULFILLED',id_twitch_streamer,reward_id,redemption_id,person_streamer.accessTokenTwitch);
                            if (redemptions_change_status) {
                                console.log("Status do redemptions atualizadoo");
                                return true;
                            } else {
                                let deletado = await RedeemPoints.findByIdAndDelete(redeem._id);
                                person.points = person.points - new_points;
                                await person.save();
                                return false;
                            }
                        }else{
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
                                id_channel:channel._id,
                                status:'entregue',
                                reward_id:reward_id,
                                redemption_id:redemption_id
                            }
                            let redeem = await RedeemPoints.create(dataRedeeem);
                            let redemptions_change_status = await pointsController.changeStatus(person_streamer._id,'FULFILLED',id_twitch_streamer,reward_id,redemption_id,person_streamer.accessTokenTwitch);
                            if (redemptions_change_status) {
                                console.log("Status do redemptions atualizadoo");
                                return true;
                            } else {
                                let deletado = await RedeemPoints.findByIdAndDelete(redeem._id);
                                person.points = person.points - new_points;
                                await person.save();
                                return false;
                            }
                        }
                    } else {
                        console.log("Streamer não encontrado");
                        return false;
                    }
                }else{
                    console.log("Canal nao encontrado");
                    return false;
                }
            }else{
                console.log('pessoa nao encontrada');
                if (person_streamer) {
                    // console.log('Criando pessoa nova');
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
                    let new_person = await pessoasController.registerPerson(data);
                    if (new_person.status && new_person.code == 201) {
                        console.log('Pessoa nova criada: ',new_person);
                        let dataRedeeem = {
                            date:new Date(),
                            amount:new_points,
                            id_user:new_person.data._id,
                            id_channel:channel._id,
                            status:'entregue',
                            reward_id:reward_id,
                            redemption_id:redemption_id
                        }
                        let redeem = await RedeemPoints.create(dataRedeeem);
                        let redemptions_change_status = await pointsController.changeStatus(person_streamer._id,'FULFILLED',id_twitch_streamer,reward_id,redemption_id,person_streamer.accessTokenTwitch);
                        if (redemptions_change_status) {
                            console.log("Status do redemptions atualizadoo");
                            return true;
                        } else {
                            let deletado = await RedeemPoints.findByIdAndDelete(redeem._id);
                            person.points = person.points - new_points;
                            await person.save();
                            return false;
                        }
                    }
                }
            }
        }else{
           console.log("reward não cadastrado pelo sistema addpoints"); 
        }
    } catch (error) {
        // console.log("error addpoints: ", error);
        if (error.response) {
        console.log("error addpoints: ", error.response.data.message);
        } else if (error.request) {
        console.log("error addpoints: ", error.message);
        } else {
        console.log("error addpoints: ", error.message);
        }
    }
}

exports.roletaPoints = async function(req, res){
    try {
        const points = req.params?parseInt(req.params.points):null;
        const id_channel = req.params?req.params.id_channel:'';
        const id_user = req.userId;
        console.log("points: ",points);
        console.log("userId: ",id_user);
        let person = await Pessoa.findById(id_user);
        let channel = await Channel.findById(id_channel);
        if (channel) {
            console.log("channel.probability_roulette: ",channel.probability_roulette);
            if (person) {
                if (person.type_account == 'primary' || person.streamer == true) {
                    console.log("person.points: ",person.points);
                    if (points && person.points >= points) {
                        if (points >= 10) {
                            if (channel.roleta.length > 0) {
                                console.log("Tem pontos");
                                let opcoes = channel.roleta.map((opcao)=>{
                                    return opcao.name;
                                });
                                let probabilitys = channel.roleta.map((opcao)=>{
                                    return opcao.probability;
                                });
                                let roleta = percentageChance(opcoes, probabilitys);
                                let opcao_selected = channel.roleta.filter((opcao)=>{
                                    return opcao.name == roleta;
                                });
                                if (opcao_selected.length > 0) {
                                    opcao_selected = opcao_selected[0];
                                    let new_points = (opcao_selected.multiplicador * points);
                                    let person_update = await Pessoa.findByIdAndUpdate(person._id,{points:person.points + new_points});
                                    let probabilitys_indice = [];
                                    for (let i = 0; i < opcao_selected.campos.length; i++) {
                                        probabilitys_indice.push(100/opcao_selected.campos.length);
                                    }
                                    let roleta_indice = percentageChance(opcao_selected.campos, probabilitys_indice);
                                    let dataRedeeem = {
                                        date:new Date(),
                                        amount:(new_points),
                                        id_user:person._id,
                                        id_channel:channel._id,
                                        status:'entregue',
                                        type:'roleta',
                                        redemption_id:uuidv4()
                                    }
                                    let redeem = await RedeemPoints.create(dataRedeeem);
                                    return res.status(201).json({
                                        message:'Roleta acionada com sucesso',
                                        data:new_points,
                                        roleta:roleta,
                                        roleta_indice
                                    });
                                } else {
                                    return res.status(500).json({
                                        message:'Erro ao utilizar a roleta: erro ao girar a roleta'
                                    });
                                }
                            }else{
                                return res.status(400).json({
                                    message:'Erro ao utilizar a roleta: roleta não cadastrada para esse canal'
                                });
                            }
                        }else{
                            return res.status(400).json({
                                message:'Erro ao utilizar a roleta: apostas permitidas apartir de 10 pontos'
                            });
                        }
                    }else{
                        console.log("Não tem pontos");
                        return res.status(400).json({
                            message:'Erro ao utilizar a roleta: pontos insuficientes'
                        });
                    }
                }else{
                    return res.status(400).json({
                        message:'Erro ao utilizar a roleta: apenas para contas primárias'
                    });
                }
            } else {
                return res.status(400).json({
                    message:'Erro ao utilizar a roleta: usuário não encontrado'
                });
            }
        } else {
            return res.status(400).json({
                message:'Erro ao utilizar a roleta: Canal não encontrado'
            });
        }
    } catch (error) {
        return res.status(500).json({
            error:error,
            message:'Erro ao utilizar a roleta: '+error.message
        });
    }
}

exports.addpointsManual = async function(req, res) {
    try {
        const points = req.params?parseInt(req.params.points):null;
        const nickname = req.params?req.params.nickname:'';
        const id_streamer = req.userId;
        console.log("points: ",points);
        console.log("nickname: ",nickname);
        console.log("id_streamer: ",id_streamer);
        let user_streamer = await Pessoa.findById(id_streamer).populate('permissions.ifo_permission');
        let person = await Pessoa.findOne({nickname:nickname});
        if (user_streamer) {
            if (person) {
                let perm_streamer = user_streamer.permissions.findIndex((permisao)=>{
                    return permisao.ifo_permission.indice === 2;
                });
                console.log("perm_streamer: ",perm_streamer);
                console.log("user_streamer.streamer: ",user_streamer.streamer);
                if (perm_streamer != -1 && user_streamer.streamer) {
                    person.points = person.points + (points);
                    let index_channel = person.channels.findIndex(channel_=>{
                        return String(channel_.info_channel) == String(user_streamer.channel);
                    });
                    if (index_channel != -1) {
                        console.log('canal encontrado no usuario');
                        if (person.type_account == 'secondary') {
                            let person_primary = await Pessoa.findById(person.primary_account_ref);
                            person_primary.points = person_primary.points + (points);
                            await person_primary.save();
                        }
                        person.channels[index_channel].points = person.channels[index_channel].points + (points);
                        person.channels[index_channel].status = true;
                        await person.save();
                        let dataRedeeem = {
                            date:new Date(),
                            amount:(points),
                            id_user:person._id,
                            id_channel:user_streamer.channel,
                            status:'entregue',
                            type:'adicionado',
                            redemption_id:uuidv4()
                        }
                        let redeem = await RedeemPoints.create(dataRedeeem);
                        return res.status(201).json({
                            message:'Pontos adicionados com sucesso ao usuario '+person.nickname
                        });
                    } else {
                        console.log('canal nao encontrado no usuario');
                        if (person.type_account == 'secondary') {
                            let person_primary = await Pessoa.findById(person.primary_account_ref);
                            person_primary.points = person_primary.points + (points);
                            await person_primary.save();
                        }
                        person.channels = [
                            ...person.channels,
                            {
                                info_channel: user_streamer.channel,
                                points: (points),
                                status:true
                            }
                        ];
                        await person.save();
                        let dataRedeeem = {
                            date:new Date(),
                            amount:(points),
                            id_user:person._id,
                            id_channel:user_streamer.channel,
                            status:'entregue',
                            type:'adicionado',
                            redemption_id:uuidv4()
                        }
                        let redeem = await RedeemPoints.create(dataRedeeem);
                        return res.status(201).json({
                            message:'Pontos adicionados com sucesso ao usuario '+person.nickname
                        });
                    }
                } else {
                    return res.status(500).json({
                        message:'Erro ao adicionar pontos: sem permissão'
                    });
                }
            } else {
                return res.status(400).json({
                    message:'Erro ao adicionar pontos: nickname não encontrado'
                });
            }
        } else {
            return res.status(400).json({
                message:'Erro ao adicionar pontos: streamer não encontrado'
            });
        }
    } catch (error) {
        return res.status(500).json({
            error:error,
            message:'Erro ao adicionar pontos: '+error.message
        });
    }
}

exports.addpointsStreamElements = async function(quant,nomeUser){
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

exports.changeStatus = async function(id_streamer, status, id_twitch, reward_id, redemption_id, token_twitch, refresh = false){
    console.log("token_twitch changeStatus: ",token_twitch);
    return new Promise(async(resolve,reject)=>{
        try {
            let user_streamer = await Pessoa.findById(id_streamer);
            if (user_streamer) {
                const instance_changeStatus = axios.create({
                    baseURL: 'https://api.twitch.tv/helix/channel_points/custom_rewards/',
                    headers: {
                        'Client-Id': process.env.CLIENT_ID,
                        'Authorization': `Bearer ${token_twitch}`,
                        'Content-Type': 'application/json'
                    }
                });
                const body = {
                    status:status
                }
                const response = await instance_changeStatus.patch(`redemptions?broadcaster_id=${id_twitch}&reward_id=${reward_id}&id=${redemption_id}`,body)
                
                // handle success
                console.log("response changeStatus");
                // console.log(response.data);
                resolve(true);
            }else{
                console.log("usuario nao encontrado");
                resolve(false);
            }
        } catch (error) {
            if (error.response) {
                // console.log('error response: ',error.response);
                console.log('error changeStatus response status: ',error.response.status);
                console.log('error changeStatus response: ',error.response);
                if (error.response.status == 401) {
                    // console.log('error changeStatus response: ',error.response);
                    let resp = await authController.refreshToken(id_streamer);
                    if (resp) {
                        if ( refresh ) {
                            resolve(false);
                        } else {
                            let resp_refresh = await pointsController.changeStatus(id_streamer, status, id_twitch, reward_id, redemption_id, token_twitch, true);
                            if (resp_refresh) {
                                resolve(true);
                            }else{
                                resolve(false);
                            }
                        }
                    }else{
                        resolve(false);
                    }
                }else{
                    resolve(false);
                }
            } else if (error.request) {
                console.log('error changeStatus request: ',error.message);
                resolve(false);
            } else {
                console.log('error changeStatus desc: ',error.message);
                resolve(false);
            }
        }
    });
}

exports.changeSyncPubsub = async function(req, res){
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

exports.restorePointsStreamElements = async function(req, res){
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
                        let resp = await pointsController.add_userpoints(offset, user_streamer, channel, instance);
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

exports.add_userpoints = async function (offset, user_streamer, channel, instance){
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
                                id_channel:channel._id,
                                status:'entregue',
                                type:'streamelements',
                                redemption_id:uuidv4()
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
                                    id_channel:channel._id,
                                    status:'entregue',
                                    type:'streamelements',
                                    redemption_id:uuidv4()
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
                                id_channel:channel._id,
                                status:'entregue',
                                type:'streamelements',
                                redemption_id:uuidv4()
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

exports.addPointsBot = async function(req, res){
    try {
        let hash = req.params?req.params.hash:'';
        let body = req.body?req.body:null;
        console.log("hash: ",hash);
        console.log("body: ",body);
        if (hash == '7a8b979a95529a7aea259e9e26daed950a01937b14fbe34575684a1244618c2d') {
            if (body) {
                let id_user_twitch = body.id_user_twitch;
                let id_streamer = body.id_streamer;
                let points = body.points;
                console.log("id_user_twitch: ",id_user_twitch);
                console.log("id_streamer: ",id_streamer);
                console.log("points: ",points);
                let person = await Pessoa.findOne({idTwitch:id_user_twitch});
                console.log("person: ",person);
                let user_streamer = await Pessoa.findOne({idTwitch:id_streamer});
                console.log("user_streamer: ",user_streamer);
                if (person) {
                    if (user_streamer) {
                        person.points = person.points + (points);
                        let index_channel = person.channels.findIndex(channel_=>{
                            return String(channel_.info_channel) == String(user_streamer.channel);
                        });
                        if (index_channel != -1) {
                            console.log('canal encontrado no usuario DROP');
                            if (person.type_account == 'secondary') {
                                let person_primary = await Pessoa.findById(person.primary_account_ref);
                                person_primary.points = person_primary.points + (points);
                                await person_primary.save();
                            }
                            person.channels[index_channel].points = person.channels[index_channel].points + (points);
                            person.channels[index_channel].status = true;
                            await person.save();
                            let dataRedeeem = {
                                date:new Date(),
                                amount:(points),
                                id_user:person._id,
                                id_channel:user_streamer.channel,
                                status:'entregue',
                                type:'drop',
                                redemption_id:uuidv4()
                            }
                            let redeem = await RedeemPoints.create(dataRedeeem);
                            return res.status(201).json({
                                message:'Pontos adicionados com sucesso ao usuario '+person.nickname,
                                status:201,
                                newAmount:person.points
                            });
                        } else {
                            console.log('canal nao encontrado no usuario DROP');
                            if (person.type_account == 'secondary') {
                                let person_primary = await Pessoa.findById(person.primary_account_ref);
                                person_primary.points = person_primary.points + (points);
                                await person_primary.save();
                            }
                            person.channels = [
                                ...person.channels,
                                {
                                    info_channel: user_streamer.channel,
                                    points: (points),
                                    status:true
                                }
                            ];
                            await person.save();
                            let dataRedeeem = {
                                date:new Date(),
                                amount:(points),
                                id_user:person._id,
                                id_channel:user_streamer.channel,
                                status:'entregue',
                                type:'drop',
                                redemption_id:uuidv4()
                            }
                            let redeem = await RedeemPoints.create(dataRedeeem);
                            return res.status(201).json({
                                message:'Pontos adicionados com sucesso ao usuario '+person.nickname,
                                status:201,
                                newAmount:person.points
                            });
                        }
                    }else{
                        return res.status(200).json({
                            status:500
                        });
                    }
                } else {
                    return res.status(201).json({
                        message:'Erro ao adicionar pontos: nickname não encontrado',
                        status:404
                    });
                }
            }
        }
    } catch (error) {
        return res.status(500).send({
            message:'Erro ao trocr status do PubSub',
        });
    }
}