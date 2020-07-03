
const Canal = require("../models/Canais");

const listCanais = async (req, res) => {
    Canal.selectCanais().then((data) => {
      res.status(200).json({
        canais:data
      });
    }).catch((err) => {
      res.status(400).send(['Erro ao listar canais']);
    });
};

const findCanaisById = async (req, res) => {
    const id = parseInt(req.params.id)
    Canal.selectCanalById(id).then((data) => {
      res.status(200).json({
        canal:data[0]
      });
    }).catch((err) => {
      res.status(400).send(['Erro ao procurar canal']);
    });
};
  
const registerCanal = async (req, res) => {
const { nome } = req.body;
    Canal.insertCanal(nome).then((data)=>{
        res.status(200).json({
            canais:data
        });
    }).catch((err) => {
        res.status(400).send({
            message:'Erro ao registrar canal:',
            error:err
        });
    });;

};

module.exports = {
    listCanais,
    registerCanal,
    findCanaisById
}