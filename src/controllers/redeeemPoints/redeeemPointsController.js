
const RedeemPoints = require('../../schemas/RedeemPoints');
const dotenv = require('dotenv');
const Channel = require('../../schemas/channel');
dotenv.config();
// const botController = require('../../controllers/bot/botController');

const listRedeemPoints = async (req, res) => {
    const { page = 1, limit = 12, last = false, status = null } = req.query;
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


module.exports = {
    listRedeemPoints
}