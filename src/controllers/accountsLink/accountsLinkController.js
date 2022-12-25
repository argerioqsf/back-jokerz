const AccountsLink = require("../../schemas/AccountsLink");
const Pessoa = require("../../schemas/pessoa");

const listAccountsLink = async (req, res) => {
  try {
    let accountsLink = await AccountsLink.find();
    res.status(200).json({
      data: accountsLink,
    });
  } catch (error) {
    res.status(400).send({
      message: "Erro ao listar contas vinculadas",
      error: error,
    });
  }
};

const registerAccountLink = async (req, res) => {
  const { name, icon, color } = req.body;
  try {
    let new_accountLink = createAccountLink(name, icon, color);
    res.status(new_accountLink.code).json({
      message: new_accountLink.message,
      data: new_accountLink.data,
      error: new_accountLink.error,
    });
  } catch (error) {
    res.status(400).send({
      message: "Erro ao criar conta vinculada",
      error: error,
    });
  }
};

const createAccountLink = async (name, icon, color) => {
  try {
    let accountLink = await AccountsLink.create({
      name: name,
      icon: icon,
      color: color,
    });
    return {
      code: 201,
      status: true,
      message: "Conta vinculada cadastrada com sucesso!",
      data: accountLink,
      error: {},
    };
  } catch (error) {
    return {
      code: 400,
      status: false,
      message: "Erro ao criar conta vinculada",
      data: {},
      error: error,
    };
  }
};

const changeStatusPubsub = async (status, id_accountLink) => {
  return new Promise(async (resolve, reject) => {
    try {
      let account = await AccountsLink.findOne({ name: "twitch" });
      let personsPointsOn = await Pessoa.find({ pointsSyncTwitch: true });
      // console.log("personsPointsOn 1: ",personsPointsOn);
      for (let i = 0; i < personsPointsOn.length; i++) {
        personsPointsOn[i].pointsSyncTwitch = false;
        await personsPointsOn[i].save();
      }
      if (account) {
        account.statusPubSub = status;
        await account.save();
        resolve(true);
      } else {
        console.log(
          "Erro ao mudar status do Pubsub, conta vinculada não encontrada"
        );
        // throw new Error(
        //   "Erro ao mudar status do Pubsub, conta vinculada não encontrada"
        // );
      }
    } catch (error) {
      console.log("Erro ao mudar status do Pubsub: ", error);
      resolve(true);
    }
  });
};

const checkExistAccountLinks = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      let accountLinks = await AccountsLink.find();
      if (accountLinks.length == 0) {
        let accountLink_1 = await createAccountLink("twitch", "", "");
        let accountLink_2 = await createAccountLink("streamelements", "", "");
        console.log("AccountLinks inicias criados com sucesso ");
        resolve(true);
      } else {
        console.log("AccountLinks inicias já criados");
        resolve(true);
      }
    } catch (error) {
      console.log("Erro ao criar AccountLinks inicias");
      resolve(true);
    }
  });
};

module.exports = {
  registerAccountLink,
  listAccountsLink,
  changeStatusPubsub,
  checkExistAccountLinks,
};
