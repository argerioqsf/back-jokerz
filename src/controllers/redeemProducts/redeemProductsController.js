
const RedeemProduct = require('../../schemas/RedeemProduct');
const dotenv = require('dotenv');
const Pessoa = require('../../schemas/pessoa');
dotenv.config();
// const botController = require('../../controllers/bot/botController');

const listRedeemProducts = async (req, res) => {
    const { page = 1, limit = 12, last = false, status = null, user = false } = req.query;
    try {
        let id_owner = req.userId?req.userId:'';
        let redeeems_quant = 0;
        let redeeems = [];
        let find = status?{status:status}:{}
        if (user) {
            find = id_owner?
            {
                ...find,
                id_user:id_owner
            }:find;
        } else {
            find = id_owner?
            {
                ...find,
                id_owner:id_owner
            }:find;
        }

        if (last) {
            redeeems = await RedeemProduct.find(find)
            .populate('id_user')
            .populate('product_id')
            .populate('id_owner')
            .populate('id_channel')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort('-date_create')
            .exec();
            redeeems_quant = await RedeemProduct.find(find)
            .sort('-date_create')
            .exec();
            redeeems_quant = redeeems_quant.length;
        }else{
            redeeems = await RedeemProduct.find(find)
            .populate('id_user')
            .populate('product_id')
            .populate('id_owner')
            .populate('id_channel')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();
            redeeems_quant = await RedeemProduct.find(find)
            .sort('-date_create')
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
    } catch (error) {
          res.status(400).send({
              message:'ERRO ao listar resgates de produtos',
              error:error
          });
    }
};

const changeStatusRedeemProducts = async (req, res)=> {
    try {
        const data = req.body;
        let id_redeem = data.id_redeem;
        let status = data.status;
        if (status == "cancelado") {
            let redeemProduct = await RedeemProduct.findById(id_redeem);
            let person = await Pessoa.findById(redeemProduct.id_user);
            person.points = person.points+redeemProduct.price;
            redeemProduct.status = status;
            await person.save();
            await redeemProduct.save();
        } else {
            let redeem_new = await RedeemProduct.findByIdAndUpdate(id_redeem,{
                status:status
            });
        }
        res.status(200).json({
          data:'atualizadao com sucesso'
        });

    } catch (error) {
        res.status(400).send({
            message:'erro ao mudar status do resgate',
            error:error
        });
    }
}


module.exports = {
    listRedeemProducts,
    changeStatusRedeemProducts
}