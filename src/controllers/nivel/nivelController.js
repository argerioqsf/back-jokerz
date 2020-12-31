
// const Canal = require("../../models/Canais");
const Nivel = require('../../schemas/Niveis');

const listNiveis = async (req, res) => {
    try {
      let niveis = await Nivel.find();
        res.status(200).json({
          data:niveis
        });
    } catch (error) {
          res.status(400).send({
              message:'ERRO ao listar niveis',
              error:error
          });
    }
};

const registerNivel = async (req, res) => {
  const { name, number } = req.body;
  try {
    let nivel = await Nivel.create({
        name:name,
        number:number
    });
    console.log('Nivel cadastrado');
    res.status(201).json({
        message:'Nivel cadastrado com sucesso!',
        data:nivel
    });
  } catch (error) {
        res.status(400).send({
            message:'Erro ao criar cadastro de nivel',
            error:error
        });
  }
};

const deleteNivel = async (req, res) => {
    const id = req.params.id;
    try {
        await Nivel.findByIdAndDelete(id);
        res.status(200).json({
          message: 'Nivel deletado'
        });
    } catch (error) {
        res.status(400).send({
            message:'Erro ao deletar nivel',
            error:error
        });
    }
}; 

const findNivel = async (req, res) => {
    const id = req.params.id;
    try {
        let nivel = await Nivel.findById(id);
        res.status(200).json({
          data:nivel
        });
    } catch (error) {
        res.status(400).send({
            message:'Erro ao procurar por nivel',
            error:error
        });
    }
};

module.exports = {
    listNiveis,
    registerNivel,
    deleteNivel,
    findNivel
}