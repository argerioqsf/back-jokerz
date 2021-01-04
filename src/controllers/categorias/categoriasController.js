
// const Canal = require("../../models/Canais");
const Categories = require('../../schemas/Categories');

const listCategorias = async (req, res) => {
    try {
      let categorias = await Categories.find();
        res.status(200).json({
          data:categorias
        });
    } catch (error) {
          res.status(400).send({
              message:'ERRO ao listar categorias',
              error:error
          });
    }
};

const registerCategoria = async (req, res) => {
  const { name } = req.body;
  try {
    let categoria = await Categories.create({
        name:name
    });
    console.log('Categoria cadastrada');
    res.status(201).json({
        message:'Categoria cadastrada com sucesso!',
        data:categoria
    });
  } catch (error) {
        res.status(400).send({
            message:'Erro ao criar cadastro de Categoria',
            error:error
        });
  }
};

const deleteCategoria = async (req, res) => {
    const id = req.params.id;
    try {
        await Categories.findByIdAndDelete(id);
        res.status(200).json({
          message: 'Categoria deletado'
        });
    } catch (error) {
        res.status(400).send({
            message:'Erro ao deletar categoria',
            error:error
        });
    }
}; 

const findCategoria = async (req, res) => {
    const id = req.params.id;
    try {
        let categoria = await Categories.findById(id);
        res.status(200).json({
          data:categoria
        });
    } catch (error) {
        res.status(400).send({
            message:'Erro ao procurar por categoria',
            error:error
        });
    }
};

module.exports = {
    listCategorias,
    registerCategoria,
    deleteCategoria,
    findCategoria
}