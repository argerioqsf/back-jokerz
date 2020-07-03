const db = require("../../config/database/connect");

exports.selectCanais= async (res)=>{
    try {
      const res = await db.query(`SELECT * FROM canais`);
      return res.rows;
    } catch (error) {
      return error.stack;
    }
}
  
exports.selectCanalById = async (id)=>{
    try {
      const res = await db.query(`SELECT * FROM canais WHERE id = $1`,[id]);
      return res.rows;
    } catch (error) {
      return error.stack;
    }
}
  
exports.insertCanal = async(nome)=>{
    try {
      const res = await db.query(`INSERT INTO canais (nome) VALUES($1)`,[nome]);
      return res;
    } catch (error) {
      return error.stack;
    }
}