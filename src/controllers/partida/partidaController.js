
// const Canal = require("../../models/Canais");
const Partida = require('../../schemas/Partida');
const Niveis = require('../../schemas/Niveis');

const listPartidas = async (req, res) => {
    try {
      let partidas = await Partida.find().populate('nivel');
        res.status(200).json({
          data:partidas
        });
    } catch (error) {
          res.status(400).send({
              message:'ERRO ao listar partidas',
              error:error
          });
    }
};

const registerPartida = async (req, res) => {
    try {
        let nivel = await Niveis.findOne({number:1});
        console.log('nivel: ',nivel);
        let partida = await Partida.create({
            nivel:nivel._id?nivel._id:''
        });
        console.log('Partida cadastrada');
        res.status(201).json({
            message:'Partida cadastrada com sucesso!',
            data:partida
        });
    } catch (error) {
            res.status(400).send({
                message:'Erro ao criar cadastro de partida',
                error:error
            });
    }
};

const atualizarPartida = async (req, res) => {
    const id = req.params.id;
    // console.log(req.body);
    // console.log(req.params);
    let nivel = '';
    if(req.body.quant_acertos >= 0 && req.body.quant_acertos < 5){
        nivel = await Niveis.findOne({number:1});
    }
    if(req.body.quant_acertos >= 5 && req.body.quant_acertos < 10){
        nivel = await Niveis.findOne({number:2});
    }
    if(req.body.quant_acertos >= 10 && req.body.quant_acertos <= 15){
        nivel = await Niveis.findOne({number:3});
    }
    if(!req.body.quant_acertos){
        let partida = await Partida.findById(id);
        console.log(partida)
        nivel = partida.nivel;
    }

    try {
      let partida = await Partida.findByIdAndUpdate(id,{
          ...req.body,
          nivel:nivel._id
      });
      console.log('Partida atualizada');
      res.status(201).json({
          message:'Partida atualizada com sucesso!',
          data:partida
      });
    } catch (error) {
          res.status(400).send({
              message:'Erro ao atualizar partida',
              error:error
          });
    }
};

const deletePartida = async (req, res) => {
    const id = req.params.id;
    try {
        let deletado = await Partida.findByIdAndDelete(id);
        res.status(200).json({
          message: 'Partida deletada',
          data: deletado
        });
    } catch (error) {
        res.status(400).send({
            message:'Erro ao deletar partida',
            error:error,
            id:id
        });
    }
};

const findPartida = async (req, res) => {
    const id = req.params.id;
    try {
        let partida = await Partida.findById(id).populate('nivel');
        res.status(200).json({
          data:partida
        });
    } catch (error) {
        res.status(400).send({
            message:'Erro ao procurar por partida',
            error:error
        });
    }
};

const findPartidaAtual = async (req, res) => {
    try {
        let partida = await Partida.findOne({status:'iniciada'}).populate('nivel');
        res.status(200).json({
          data:partida
        });
    } catch (error) {
        res.status(400).send({
            message:'Erro ao procurar por partida',
            error:error
        });
    }
};

module.exports = {
    listPartidas,
    registerPartida,
    deletePartida,
    findPartida,
    findPartidaAtual,
    atualizarPartida
}