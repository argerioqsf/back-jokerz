
// const Canal = require("../../models/Canais");
const Premiacao = require('../../schemas/Premiacoes');

const listPremiacoes = async (req, res) => {
    try {
      let premiacoes = await Premiacao.find().populate('nivel');
        res.status(200).json({
          data:premiacoes
        });
    } catch (error) {
          res.status(400).send({
              message:'ERRO ao listar premiacoes',
              error:error
          });
    }
};

const registerPremiacao = async (req, res) => {
  const { titulo, valor, nivel, indice } = req.body;
  console.log('imagem: ', req.file);
  try {
    let premiacao = await Premiacao.create({
        titulo:titulo,
        nivel:nivel,
        valor:valor,
        indice:indice,
        image:req.file.path,
        image:req.file.path
    });
    console.log('Premiacao cadastrada');
    res.status(201).json({
        message:'Premiacao cadastrada com sucesso!',
        data:premiacao
    });
  } catch (error) {
        res.status(400).send({
            message:'Erro ao criar cadastro de Premiacao',
            error:error
        });
  }
};

const deletePremiacao = async (req, res) => {
    const id = req.params.id;
    try {
        let deletado = await Premiacao.findByIdAndDelete(id);
        res.status(200).json({
          message: 'Premiacao deletada',
          data: deletado
        });
    } catch (error) {
        res.status(400).send({
            message:'Erro ao deletar Premiacao',
            error:error,
            id:id
        });
    }
};

const findPremiacao = async (req, res) => {
    const id = req.params.id;
    try {
        let premiacao = await Premiacao.findById(id).populate('nivel');
        res.status(200).json({
          data:premiacao
        });
    } catch (error) {
        res.status(400).send({
            message:'Erro ao procurar por premiacao',
            error:error
        });
    }
};

module.exports = {
    listPremiacoes,
    registerPremiacao,
    deletePremiacao,
    findPremiacao
}