
// const Canal = require("../../models/Canais");
const Channel = require('../../schemas/channel')

const listCanais = async (req, res) => {
  
    try {
      let channels = await Channel.find();
        res.status(200).json({
          data:channels
        });
    } catch (error) {
          res.status(400).send({
              message:'ERRO ao listar channels',
              error:error
          });
    }
    // Canal.selectCanais().then((data) => {
    //   res.status(200).json({
    //     canais:data
    //   });
    // }).catch((err) => {
    //   res.status(400).send(['Erro ao listar canais']);
    // });
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
  
  const { name } = req.body;
    let data = {
        name:name,
    }
  try {
      let resp = await Channel.create(data);
      res.status(201).json({
          message:'Canal cirada com sucesso!',
          data:resp
      });
  } catch (error) {
      res.status(400).json({
          message:'Erro ao criar cadastro de canal',
          err:error
      });
  }
// const { nome } = req.body;
//     Canal.insertCanal(nome).then((data)=>{
//         res.status(200).json({
//             canais:data
//         });
//     }).catch((err) => {
//         res.status(400).send({
//             message:'Erro ao registrar canal:',
//             error:err
//         });
//     });;
};

module.exports = {
    listCanais,
    registerCanal,
    findCanaisById
}