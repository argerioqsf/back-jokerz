
// const Canal = require("../../models/Canais");
const Pergunta = require('../../schemas/Perguntas');

const listPerguntas = async (req, res) => {
    try {
      let perguntas = await Pergunta.find().populate('nivel');
        res.status(200).json({
          data:perguntas
        });
    } catch (error) {
          res.status(400).send({
              message:'ERRO ao listar perguntas',
              error:error
          });
    }
};

const registerPergunta = async (req, res) => {
  const { titulo, alternativas, nivel, categoria, resposta } = req.body;
  try {
    let pergunta = await Pergunta.create({
        titulo:titulo,
        alternativas:alternativas,
        nivel:nivel,
        categoria:categoria,
        resposta:resposta
    });
    console.log('Pergunta cadastrada');
    res.status(201).json({
        message:'Pergunta cadastrada com sucesso!',
        data:pergunta
    });
  } catch (error) {
        res.status(400).send({
            message:'Erro ao criar cadastro de pergunta',
            error:error
        });
  }
};

const atualizarPergunta = async (req, res) => {
  const id = req.params.id;
  try {
    let pergunta = await Pergunta.findByIdAndUpdate(id,{
        ...req.body
    });
    console.log('Pergunta atualizada');
    res.status(201).json({
        message:'Pergunta atualizada com sucesso!',
        data:pergunta
    });
  } catch (error) {
        res.status(400).send({
            message:'Erro ao atualizar pergunta',
            error:error
        });
  }
};

const deletePergunta = async (req, res) => {
    const id = req.params.id;
    try {
        let deletado = await Pergunta.findByIdAndDelete(id);
        res.status(200).json({
          message: 'Pergunta deletada',
          data: deletado
        });
    } catch (error) {
        res.status(400).send({
            message:'Erro ao deletar pergunta',
            error:error,
            id:id
        });
    }
};

const findPergunta = async (req, res) => {
    const id = req.params.id;
    try {
        let pergunta = await Pergunta.findById(id).populate('nivel');
        res.status(200).json({
          data:pergunta
        });
    } catch (error) {
        res.status(400).send({
            message:'Erro ao procurar por pergunta',
            error:error
        });
    }
};

module.exports = {
    listPerguntas,
    registerPergunta,
    deletePergunta,
    findPergunta,
    atualizarPergunta
}