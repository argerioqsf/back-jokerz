
// const Canal = require("../../models/Canais");
const Pergunta = require('../../schemas/Perguntas');
const Nivel = require('../../schemas/Niveis');

const listPerguntas = async (req, res) => {
    try {
      let perguntas = await Pergunta.find().populate('nivel').populate('categoria');
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
  const { titulo, alternativas, nivel, categoria, resposta, tempo } = req.body;
  try {
    let pergunta = await Pergunta.create({
        titulo:titulo,
        alternativas:alternativas,
        nivel:nivel,
        categoria:categoria,
        resposta:resposta,
        tempo:tempo
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

const statusPerguntas = async (req, res) => {
    try {
        let nivel_1 = await Nivel.findOne({number: 1});
        let nivel_2 = await Nivel.findOne({number: 2});
        let nivel_3 = await Nivel.findOne({number: 3});
        let perguntas_1 = await Pergunta.find({nivel:nivel_1._id, ativa:true});
        let perguntas_2 = await Pergunta.find({nivel:nivel_2._id, ativa:true});
        let perguntas_3 = await Pergunta.find({nivel:nivel_3._id, ativa:true});

        // let perguntasNivel1 = await Pergunta.find({"nivel.number":2}).populate('nivel');
        // let perguntasNivel2 = await Pergunta.find({'nivel.number':{$in:2}});
        // let perguntasNivel3 = await Pergunta.find({'nivel.number':{$in:3}});
        res.status(200).json({
          data:{
              quant_perguntas_1:perguntas_1.length,
              quant_perguntas_2:perguntas_2.length,
              quant_perguntas_3:perguntas_3.length
          }
        });
    } catch (error) {
        res.status(400).send({
            message:'Erro ao procurar status das perguntas',
            error:error
        });
    }
};

module.exports = {
    listPerguntas,
    registerPergunta,
    deletePergunta,
    findPergunta,
    atualizarPergunta,
    statusPerguntas
}