
const AccountsLink = require("../../schemas/AccountsLink");

const listAccountsLink = async (req, res) => {
    try {
        let accountsLink = await AccountsLink.find();
          res.status(200).json({
            data:accountsLink
          });
    } catch (error) {
          res.status(400).send({
              message:'Erro ao listar contas vinculadas',
              error:error
          });
    }
};

const registerAccountLink = async (req, res) => {
    const { name, icon, color } = req.body;
    try {
      let accountLink = await AccountsLink.create({
        name:name,
        icon:icon,
        color:color
      });
      res.status(201).json({
          message:'Conta vinculada cadastrada com sucesso!',
          data:accountLink
      });
    } catch (error) {
          res.status(400).send({
              message:'Erro ao criar conta vinculada',
              error:error
          });
    }
};

module.exports = {
    registerAccountLink,
    listAccountsLink
}