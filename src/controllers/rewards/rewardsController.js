
const Rewards = require('../../schemas/Rewards');
const dotenv = require('dotenv');
const Channel = require('../../schemas/channel');
const rewardsController = require('../rewards/rewardsController');
dotenv.config();
const axios = require('axios');
const Pessoa = require('../../schemas/pessoa');
const authController = require('../../controllers/auth/authController');
const { deleteRewardGeneral, listRedemptions } = require('../../services/twitch');
const { changeStatus } = require('../points/pointsController');

exports.listRewards = async function (req, res){
    const { page = 1, limit = 12, last = false, status = null } = req.query;
    console.log('req.userId: ',req.userId);
    const id_user = req.userId;
    try {
        let channel = await Channel.findOne({id_person:id_user});
        if (channel) {
            let rewards_quant = 0;
            let rewards = [];
            let find = {id_channel:channel._id};
            if (status) {
                find ={
                    ...find,
                    status:status
                };
            }
            if (last) {
                rewards = await Rewards.find(find)
                .populate('id_user')
                .populate('id_channel')
                .limit(limit * 1)
                .skip((page - 1) * limit)
                .sort('-_id')
                .exec();
                rewards_quant = await Rewards.find(find)
                .sort('-_id')
                .exec();
                rewards_quant = rewards_quant.length;
            }else{
                rewards = await Rewards.find(find)
                .populate('id_user')
                .populate('id_channel')
                .limit(limit * 1)
                .skip((page - 1) * limit)
                .exec();
                rewards_quant = await Rewards.find(find)
                .sort('-_id')
                .exec();
                rewards_quant = rewards_quant.length;
            }
            
            const count = rewards_quant;
            let totalPages = Math.ceil(count / limit);
            res.status(200).json({
              data:rewards,
              totalPages: totalPages,
              currentPage: page,
              total_itens: rewards_quant
            });
        } else {
            res.status(400).send({
                message:'Erro ao listar rewards, canal não vinculado ao usuario'
            });
        }
    } catch (error) {
          res.status(400).send({
              message:'Erro ao listar rewards',
              error:error
          });
    }
};

exports.createReward = async function (req, res){
    try {
        const body = req.body;
        const id_user = req.userId;
        let user_streamer = await Pessoa.findById(id_user);
        if (user_streamer) {
            let channel = await Channel.findById(user_streamer.channel);
            if (channel) {
                const instance = axios.create({
                    baseURL: 'https://api.twitch.tv/helix/channel_points/',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${user_streamer.accessTokenTwitch}`,
                        'Client-Id':process.env.CLIENT_ID
                    }
                });
                let data_reward = {
                    title:body.title?body.title:null,
                    cost:body.cost?body.cost:null,
                    is_enabled:body.is_enabled?body.is_enabled:false
                }
                const response = await instance.post(`custom_rewards?broadcaster_id=${user_streamer.idTwitch}`,data_reward);
                let data = response.data;
                console.log("Reward criado: ",data);
                let new_reward = await Rewards.create({
                    date: Date.now(),
                    id_reward: data.data[0].id,
                    title:data_reward.title,
                    cost:data_reward.cost,
                    id_channel:user_streamer.channel
                });
                return res.status(201).json({
                  data:new_reward,
                  reward:data,
                  message:"Reward cadastrado com sucesso"
                });
            } else {
                return res.status(400).send({
                    message:'Erro ao cadastrar rewards, canal não vinculado ao usuario'
                });
            }
        } else {
            return res.status(400).send({
                message:'Erro ao cadastrar rewards, usuario não encontrado'
            });
        }
    } catch (error) {
        if (error.response) {
            console.log('error response: ',error.response);
            console.log('error response status: ',error.response.status);
            if (error.response.status == 401) {
                const id_user = req.userId;
                let resp = await authController.refreshToken(id_user);
                if (resp) {
                    if ( req.refresh ) {
                        return res.status(400).send({
                            message:'Erro ao cadastrar rewards: falha na autenticação com a Twitch'
                        });
                    } else {
                        req.refresh = true;
                        rewardsController.createReward(req, res);
                    }
                }else{
                    return res.status(400).send({
                        message:'Erro ao cadastrar rewards: '+error.response.data.message
                    });
                }
            }else{
                return res.status(400).send({
                    message:'Erro ao cadastrar rewards: '+error.response.data.message
                });
            }
        } else if (error.request) {
            console.log('error request: ',error.message);
            return res.status(400).send({
                message:'Erro ao cadastrar rewards: '+error.message
            });
        } else {
            console.log('error desc: ',error.message);
            return res.status(400).send({
                message:'Erro ao cadastrar rewards: '+error.message
            });
        }
    }
}

exports.deleteReward = async function(req, res){
    try {
        const id_user = req.userId;
        const id_reward = req.params.id;
        let user_streamer = await Pessoa.findById(id_user);
        if (user_streamer && user_streamer.streamer) {
            let redemptions = await listRedemptions(id_reward,user_streamer._id,'UNFULFILLED');
            if (redemptions &&  redemptions.data && redemptions.data.length > 0) {
                for (let i = 0; i < redemptions.data.length; i++) {
                    let redemption = redemptions.data[i];
                    let cancel_redemption = await changeStatus(user_streamer._id, 'CANCELED', user_streamer.idTwitch, redemption.reward.id, redemption.id,user_streamer.accessTokenTwitch);
                    if (cancel_redemption) {
                        console.log("redemption cancelada");
                    } else {
                        console.log("redemption não cancelada.");
                        return res.status(400).send({
                            message:'Erro ao deletar rewards, erro ao cancelar retirada na Twitch'
                        });
                    }
                }
            }
            let resp = await deleteRewardGeneral(id_reward,id_user);
            if (resp) {
                return res.status(200).json({
                  message:'Reward deletado com sucesso'
                });
            }else{
                return res.status(400).send({
                    message:'Erro ao deletar rewards, erro ao deletar no sistema'
                });
            }
        }else{
            return res.status(400).json({
                message:'Erro ao deletar reward: usuario não existe ou não tem permissão'
            });
        }
    } catch (error) {
        return res.status(400).send({
            message:'Erro ao deletar rewards, '+error.message
        });
    }
}