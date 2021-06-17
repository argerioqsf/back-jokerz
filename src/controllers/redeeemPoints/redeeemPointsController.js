
const RedeemPoints = require('../../schemas/RedeemPoints');
const dotenv = require('dotenv');
const Channel = require('../../schemas/channel');
const { listRedemptions } = require('../../services/twitch');
const Pessoa = require('../../schemas/pessoa');
const Rewards = require('../../schemas/Rewards');
const { addpoints } = require('../points/pointsController');
dotenv.config();
// const botController = require('../../controllers/bot/botController');

const listRedeemPoints = async (req, res) => {
    const { page = 1, limit = 12, last = false, status = 'entregue' } = req.query;
    console.log('req.userId: ',req.userId);
    const id_user = req.userId;
    try {
        let channel = await Channel.findOne({id_person:id_user});
        if (channel) {
            let redeeems_quant = 0;
            let redeeems = [];
            let find = {id_channel:channel._id};
            if (status) {
                find ={
                    ...find,
                    status:status
                };
            }
            if (last) {
                redeeems = await RedeemPoints.find(find)
                .populate('id_user')
                .populate('id_channel')
                .limit(limit * 1)
                .skip((page - 1) * limit)
                .sort('-_id')
                .exec();
                redeeems_quant = await RedeemPoints.find(find)
                .sort('-_id')
                .exec();
                redeeems_quant = redeeems_quant.length;
            }else{
                redeeems = await RedeemPoints.find(find)
                .populate('id_user')
                .populate('id_channel')
                .limit(limit * 1)
                .skip((page - 1) * limit)
                .exec();
                redeeems_quant = await RedeemPoints.find(find)
                .sort('-_id')
                .exec();
                redeeems_quant = redeeems_quant.length;
            }
            
            const count = redeeems_quant;
            let totalPages = Math.ceil(count / limit);
            res.status(200).json({
              data:redeeems,
              totalPages: totalPages,
              currentPage: page,
              total_itens: redeeems_quant
            });
        } else {
            res.status(400).send({
                message:'Erro ao listar resgates de pontos, canal não vinculado ao usuario'
            });
        }
    } catch (error) {
          res.status(400).send({
              message:'Erro ao listar resgates de pontos',
              error:error
          });
    }
};

const registerRedeemPotionsPendentes = async (req, res)=>{
    try {
        const id_user = req.userId;
        let user_streamer = await Pessoa.findById(id_user);
        if (user_streamer && user_streamer.streamer) {
            let rewards_streamer = await Rewards.find({id_channel:user_streamer.channel});
            if (rewards_streamer.length > 0) {
                for (let i = 0; i < rewards_streamer.length; i++) {
                    let reward = rewards_streamer[i];
                    let redemptions_pendentes = await listRedemptions(reward._id,user_streamer._id,'UNFULFILLED');
                    if (redemptions_pendentes) {
                        if (redemptions_pendentes.data.length > 0) {
                            redemptions_pendentes = await redemptions_pendentes.data.map((redemption)=>{
                                    return {
                                        cost:redemption.reward.cost,
                                        name_user:redemption.user_login.toLowerCase(),
                                        id_twitch_user:redemption.user_id,
                                        reward_id:redemption.reward.id,
                                        redemption_id:redemption.id,
                                        id_twitch_streamer:user_streamer.idTwitch
                                    }
                            })
                            for (let j = 0; j < redemptions_pendentes.length; j++) {
                                let dataRedeeem = redemptions_pendentes[j];
                                let reward_exist = await RedeemPoints.findOne({redemption_id:dataRedeeem.redemption_id});
                                if (reward_exist) {
                                    console.log("RedeemPoint já existe");
                                }else{
                                    let result = await addpoints(dataRedeeem);
                                    if (result) {
                                        console.log("pontos adicionados ao usuario "+dataRedeeem.name_user+" registerRedeemPotionsPendentes");
                                    } else {
                                        console.log("pontos não adicionados ao usuario "+dataRedeeem.name_user+" registerRedeemPotionsPendentes");
                                    }
                                }
                            }
                        }
                    } else {
                        return res.status(400).json({
                            message:'Erro ao cadastrar resgates de pontos pendentes: erro na cominucação com a twitch'
                        });
                    }
                }
                return res.status(200).json({
                    message:'Sucesso ao cadastrar resgates de pontos pendentes'
                });
            }else{
                return res.status(400).json({
                    message:'Erro ao cadastrar resgates de pontos pendentes: usuario não possui rewards cadastrados'
                });
            }
        }else{
            return res.status(400).json({
                message:'Erro ao cadastrar resgates de pontos pendentes: usuario não existe ou não tem permissão'
            });
        }
    } catch (error) {
        return res.status(500).json({
            message:'Erro ao cadastrar resgates de pontos pendentes: '+error.message
        });
    }
}

module.exports = {
    listRedeemPoints,
    registerRedeemPotionsPendentes
}