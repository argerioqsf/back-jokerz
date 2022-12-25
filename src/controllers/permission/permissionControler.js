const { response } = require("express");
const Permissions = require("../../schemas/Permissions");

const registerPermission = async (req, res) => {
  const { name, indice } = req.body;
  try {
    let permission = await createPermission(name, indice);
    if (permission.status) {
      res.status(200).json({
        message: "Permissão criada comsucesso!",
        data: permission.response,
      });
    } else {
      res.status(500).json({
        message: "ERRO ao criar permissão",
        data: permission.response,
      });
    }
  } catch (error) {
    res.status(500).send({
      message: "ERRO ao criar permissão",
      error: error,
    });
  }
};

const createPermission = async (name, indice) => {
  try {
    let permission = await Permissions.create({ name: name, indice: indice });
    return {
      status: true,
      response: permission,
    };
  } catch (error) {
    return {
      status: false,
      response: error,
    };
  }
};

const permissionPerson = async (req, res) => {
  const id = parseInt(req.params.id);
  Canal.selectCanalById(id)
    .then((data) => {
      res.status(200).json({
        canal: data[0],
      });
    })
    .catch((err) => {
      res.status(400).send(["Erro ao procurar canal"]);
    });
};

const listarPermissions = async (req, res) => {
  try {
    let permissions = await Permissions.find();
    res.status(200).json({
      message: "permissões listadas com sucesso!",
      data: permissions,
    });
  } catch (error) {
    res.status(500).send({
      message: "ERRO ao listar permissão",
      error: error,
    });
  }
};
module.exports = {
  registerPermission,
  permissionPerson,
  listarPermissions,
  createPermission,
};
