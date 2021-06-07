
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

const changeStatusPubsub = async (status,id_accountLink) => {
  return new Promise(async(resolve,reject)=>{
    try {
      let account = await AccountsLink.findOne({name:'twitch'});
      if (account) {
        account.statusPubSub = status;
        await account.save();
        resolve(true);
      } else {
        throw new Error("Erro ao mudar status do Pubsub, conta vinculada não encontrada");
      }
    } catch (error) {
      console.log("Erro ao mudar status do Pubsub: ", error);
      resolve(true);
    }
  });
}

module.exports = {
    registerAccountLink,
    listAccountsLink,
    changeStatusPubsub
}