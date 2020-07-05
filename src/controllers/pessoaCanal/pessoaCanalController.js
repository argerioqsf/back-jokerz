const PessoaCanal = require("../../models/PessoaCanal");

const registerPessoaCanal = async (req, res) => {
    const { pessoa_id, canal_id, points, status } = req.body;
    PessoaCanal.insertPessoaCanal([
            pessoa_id,
            canal_id,
            points,
            status
        ]).then((data)=>{
            res.status(200).json({
                pessoas_canais:data
            });
        }).catch((err) => {
            res.status(400).send({
                message:'Erro ao cadastrar pessoa_canal:',
                error:err
            });
        });;
};

const listPessoaCanal = async (req, res) => {
    PessoaCanal.selectPessoaCanal().then((data) => {
      res.status(200).json({
        pessoas:data
      });
    }).catch((err) => {
      res.status(400).send(['Erro ao listar pessoa_canal']);
    });
};

const setPointPessoaCanal = async (points,id) => {
    return PessoaCanal.setPointPessoaCanal(points,id);
};

const setStatusPessoaCanal = async (req, res) => {
    const { status, id } = req.body;
    PessoaCanal.setStatusPessoaCanal(status,id).then((data) => {
        res.status(200).json({
          message:'status mudado para '+status+' com sucesso!'
        });
    }).catch((err) => {
        res.status(400).send(['Erro ao mudar o status do canal']);
    });
};

module.exports = {
    registerPessoaCanal,
    listPessoaCanal,
    setPointPessoaCanal,
    setStatusPessoaCanal
}