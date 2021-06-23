

const dotenv = require('dotenv');
const Rewards = require('../../schemas/Rewards');
const Pessoa = require('../../schemas/pessoa');
const twitch = require('.');
dotenv.config();
const axios = require('axios');
const authController = require('../../controllers/auth/authController');
const { normalizeUnits } = require('moment');

exports.deleteRewardGeneral = async function(id_reward, id_user,refresh = false){
    return new Promise(async(resolve,request)=>{
        try {
            let user_streamer = await Pessoa.findById(id_user);
            if (user_streamer) {
                const instance = axios.create({
                    baseURL: 'https://api.twitch.tv/helix/channel_points/',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${user_streamer.accessTokenTwitch}`,
                        'Client-Id':process.env.CLIENT_ID
                    }
                });
                let perm_admin = user_streamer?user_streamer.permissions.findIndex((permisao)=>{
                    return permisao.ifo_permission.indice === 1;
                }):-1;
                let reward = await Rewards.findById(id_reward).populate('id_channel');
                if (reward) {
                    if (perm_admin != -1) {
                        const response = await instance.delete(`custom_rewards?broadcaster_id=${user_streamer.idTwitch}&id=${reward.id_reward}`);
                        await reward.remove();
                        resolve(true);
                    }else{
                        console.log("reward.id_channel:",reward.id_channel.id_person);
                        console.log("user_streamer._id:",user_streamer._id);
                        if (String(reward.id_channel.id_person) == String(user_streamer._id)) {
                            const response = await instance.delete(`custom_rewards?broadcaster_id=${user_streamer.idTwitch}&id=${reward.id_reward}`);
                            await reward.remove();
                            resolve(true);
                        }else{
                            console.log('Erro ao deletar rewards, sem permissão');
                            resolve(false);
                        }
                    }
                }else{
                    console.log('Erro ao deletar rewards, reward não encontrado');
                    resolve(false);
                }
            } else {
                console.log('Erro ao deletar rewards, usuário não encontrado');
                resolve(false);
            }
        } catch (error) {
            if (error.response) {
                // console.log('error response: ',error.response);
                console.log('error response status: ',error.response.status);
                if (error.response.status == 401) {
                    let resp = await authController.refreshToken(id_user);
                    if (resp) {
                        if ( refresh ) {
                            resolve(false);
                        } else {
                            let resp_refresh = await twitch.deleteRewardGeneral(id_reward, id_user, true);
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
                console.log('error request: ',error.message);
                resolve(false);
            } else {
                console.log('error desc: ',error.message);
                resolve(false);
            }

            console.log('Erro ao deletar rewards');
            resolve(false);
        }
    });
}

exports.listRedemptions = async function(id_reward, id_streamer, status = 'UNFULFILLED', refresh = false){

    return new Promise(async(resolve,request)=>{
        try {
            let user_streamer = await Pessoa.findById(id_streamer).populate('permissions.ifo_permission');
            if (user_streamer && user_streamer.streamer) {
                const instance = axios.create({
                    baseURL: 'https://api.twitch.tv/helix/channel_points/',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${user_streamer.accessTokenTwitch}`,
                        'Client-Id':process.env.CLIENT_ID
                    }
                });
                let perm_streamer = user_streamer?user_streamer.permissions.findIndex((permisao)=>{
                    return permisao.ifo_permission.indice === 2;
                }):-1;
                let reward = await Rewards.findById(id_reward).populate('id_channel');
                console.log("reward._id: ",reward.id_reward);
                if (reward) {
                    if (perm_streamer != -1) {
                        const response = await instance.get(`custom_rewards/redemptions?broadcaster_id=${user_streamer.idTwitch}&reward_id=${reward.id_reward}&status=${status}`);
                        // console.log("response listRedemptions: ",response);
                        resolve(response.data);
                    }else{
                        if (String(reward.id_channel.id_person) == String(user_streamer._id)) {
                            const response = await instance.get(`custom_rewards/redemptions?broadcaster_id=${user_streamer.idTwitch}&reward_id=${reward.id_reward}&status=${status}`);
                            // console.log("response listRedemptions: ",response);
                            resolve(response.data);
                        }else{
                            console.log('Erro ao listar redemptions, sem permissão');
                            resolve(false);
                        }
                    }
                }else{
                    console.log('Erro ao listar redemptions, reward não encontrado');
                    resolve(false);
                }
            } else {
                console.log('Erro ao listar redemptions, usuario não existe ou não tem permissão');
                resolve(false);
            }
        } catch (error) {
            if (error.response) {
                // console.log('error response: ',error.response);
                console.log('error response listRedemptions status: ',error.response.status);
                // console.log('error response: ',error.response);
                if (error.response.status == 401) {
                    // console.log('error response: ',error.response);
                    let resp = await authController.refreshToken(id_streamer);
                    if (resp) {
                        if ( refresh ) {
                            resolve(false);
                        } else {
                            let resp_refresh = await twitch.listRedemptions(id_reward, id_streamer, status, true);
                            if (resp_refresh) {
                                resolve(resp_refresh.data);
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
                console.log('error request listRedemptions: ',error.message);
                resolve(false);
            } else {
                console.log('error desc listRedemptions: ',error.message);
                resolve(false);
            }
            console.log('Erro ao listar redemptions: '+error.message);
            resolve(false);
        }
    });
}

exports.getUserInfo = async function(token) {
    return new Promise(async(resolve,reject)=>{
        try {
            let url = `https://id.twitch.tv/oauth2/userinfo`;
            const api = await axios.create({
              baseURL: url,
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            const resp = await api.get(url);
            resolve({
                status:true,
                resp:resp
            });
        } catch (error) {
            resolve({
                status:false,
                error:error
            });
        }
    });
}