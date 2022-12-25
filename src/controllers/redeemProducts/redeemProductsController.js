const RedeemProduct = require("../../schemas/RedeemProduct");
const dotenv = require("dotenv");
const Pessoa = require("../../schemas/pessoa");
dotenv.config();
const { v4: uuidv4 } = require("uuid");
const RedeemPoints = require("../../schemas/RedeemPoints");
// const botController = require('../../controllers/bot/botController');

const listRedeemProducts = async (req, res) => {
  const {
    page = 1,
    limit = 12,
    last = false,
    status = null,
    user = false,
  } = req.query;
  try {
    let id_owner = req.userId ? req.userId : "";
    let redeeems_quant = 0;
    let redeeems = [];
    let find = status ? { status: status } : {};
    if (user) {
      find = id_owner
        ? {
            ...find,
            id_user: id_owner,
          }
        : find;
    } else {
      find = id_owner
        ? {
            ...find,
            id_owner: id_owner,
          }
        : find;
    }

    if (last) {
      redeeems = await RedeemProduct.find(find)
        .populate("id_user")
        .populate("product_id")
        .populate("id_owner")
        .populate("id_channel")
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort("-_id")
        .exec();
      redeeems_quant = await RedeemProduct.find(find).sort("-_id").exec();
      redeeems_quant = redeeems_quant.length;
    } else {
      redeeems = await RedeemProduct.find(find)
        .populate("id_user")
        .populate("product_id")
        .populate("id_owner")
        .populate("id_channel")
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();
      redeeems_quant = await RedeemProduct.find(find).sort("-_id").exec();
      redeeems_quant = redeeems_quant.length;
    }

    const count = redeeems_quant;
    let totalPages = Math.ceil(count / limit);
    res.status(200).json({
      data: redeeems,
      totalPages: totalPages,
      currentPage: page,
      total_itens: redeeems_quant,
    });
  } catch (error) {
    res.status(400).send({
      message: "ERRO ao listar resgates de produtos",
      error: error,
    });
  }
};

const changeStatusRedeemProducts = async (req, res) => {
  try {
    const data = req.body;
    let id_redeem = data.id_redeem;
    let status = data.status;
    let redeemProduct = await RedeemProduct.findById(id_redeem);
    if (status == "cancelado") {
      if (redeemProduct) {
        let person = await Pessoa.findById(redeemProduct.id_user);
        let index_channel = person.channels.findIndex((channel_) => {
          return (
            String(channel_.info_channel) == String(redeemProduct.id_channel)
          );
        });
        if (index_channel != -1) {
          person.points = person.points + redeemProduct.price;
          person.channels[index_channel].points =
            person.channels[index_channel].points + redeemProduct.price;
          redeemProduct.status = status;
          await person.save();
          await redeemProduct.save();
          let dataRedeeem = {
            date: new Date(),
            amount: redeemProduct.price,
            id_user: person._id,
            id_channel: redeemProduct.id_channel,
            status: "entregue",
            type: "reembolso",
            redemption_id: uuidv4(),
          };
          await RedeemPoints.create(dataRedeeem);
        } else {
          return res.status(400).send({
            message:
              "erro ao mudar status do resgate: canal não existe para este usuário",
            error: {},
          });
        }
      } else {
        return res.status(400).send({
          message: "erro ao mudar status do resgate: resgate não existe",
          error: {},
        });
      }
    } else {
      await RedeemProduct.findByIdAndUpdate(id_redeem, {
        status: status,
      });
    }
    res.status(200).json({
      data: "atualizadao com sucesso",
      id_channel: redeemProduct.id_channel,
    });
  } catch (error) {
    res.status(400).send({
      message: "erro ao mudar status do resgate",
      error: error,
    });
  }
};

module.exports = {
  listRedeemProducts,
  changeStatusRedeemProducts,
};
