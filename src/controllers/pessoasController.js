
const Pessoa = require("../models/Pessoas");
const PessoaCanal = require("../models/PessoaCanal");

const listPessoas = async (req, res) => {
    Pessoa.selectPessoas().then((data) => {
      res.status(200).json({
        pessoas:data
      });
    }).catch((err) => {
      res.status(400).send(['Erro ao listar pessoas']);
    });
};

const listPessoasOn = async (req, res) => {
    Pessoa.selectPessoasOn().then((data) => {
      res.status(200).json({
        pessoas:data
      });
    }).catch((err) => {
      res.status(400).send(['Erro ao listar pessoas on']);
    });
};
  
const registerPessoa = async (req, res) => {
    const { points, userName, timeOn, timeOff } = req.body;
    Pessoa.insertPessoas([
        points,
        userName,
        timeOn,
        timeOff
    ]).then((data)=>{
        res.status(200).json({
            pessoas:data
        });
    }).catch((err) => {
        res.status(400).send({
            message:'Erro ao listar pessoas:',
            error:err
        });
    });;

};

const setPointPessoa = async (points,id) => {
    return Pessoa.setPointPessoa(points,id);
};

const zerarPontosPessoas = async (req, res) => {
    Pessoa.zerarPointPessoa().then((data) => {
        PessoaCanal.zerarPointPessoaCanal().then((data) => {
            res.status(200).json({
                message:'pontos zerados'
            });
        }).catch((err) => {
            res.status(200).json({
                message:'erro ao zerar os pontos 1',
                error:err
            });
        });
    }).catch((err) => {
        res.status(200).json({
            message:'erro ao zerar os pontos 2',
            error:err
        });
    });
};

module.exports = {
    listPessoas,
    registerPessoa,
    listPessoasOn,
    setPointPessoa,
    zerarPontosPessoas
}