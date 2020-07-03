const db = require("../../config/database/connect");

exports.selectPessoaCanal= async (res)=>{
    try {
      let arrayFormatado = [];
      const res = await db.query(`
      SELECT 
        pc.id as id_pessoa_canal,
        p.id as pessoa_id,
        c.id as canal_id,
        pc.points as points_canal,
        p.points as points_total,
        pc.status as status,
        c.nome as nome_canal,
        p.username as nome_usuario 
      from pessoa_canal as pc left join canais as c on pc.canal_id = c.id left join pessoas as p on pc.pessoa_id = p.id order by p.id`);let resultado = res.rows;
      for (let i = 0; i < resultado.length; i++) {
        let index = arrayFormatado.findIndex((resp)=> {return resultado[i].pessoa_id == resp.pessoa_id});
      //   console.log('index usuario: ',index);
        if (index == -1) {
            arrayFormatado = [
                ...arrayFormatado,
                {
                  pessoa_id:resultado[i].pessoa_id,
                  points_total:resultado[i].points_total,
                  nome_usuario:resultado[i].nome_usuario,
                  canais:[
                      {
                          id_pessoa_canal:resultado[i].id_pessoa_canal,
                          canal_id:resultado[i].canal_id,
                          points_canal:resultado[i].points_canal,
                          status:resultado[i].status,
                          nome_canal:resultado[i].nome_canal,
                      }
                  ]
                }
            ]
        }else{
          let indexCanal = arrayFormatado[index].canais.findIndex((resp)=> {return resultado[i].canal_id == resp.canal_id});
          // console.log('index indexCanal: ',indexCanal);
          if (indexCanal == -1) {
              arrayFormatado[index].canais = [
                  ...arrayFormatado[index].canais,
                  {
                    id_pessoa_canal:resultado[i].id_pessoa_canal,
                    canal_id:resultado[i].canal_id,
                    points_canal:resultado[i].points_canal,
                    status:resultado[i].status,
                    nome_canal:resultado[i].nome_canal,
                  }
              ]
          }else{
            //   arrayFormatado[index].canais = [
            //       ...arrayFormatado[index].canais,
            //       {
            //           teste:'teste'
            //       }
            //   ]
          }
        }
        if (i == resultado.length-1) {
        }
      }
      return arrayFormatado;
    } catch (error) {
      return error.stack;
    }
}

exports.insertPessoaCanal = async(values)=>{
    try {
      const res = await db.query(`INSERT INTO pessoa_canal (pessoa_id, canal_id, points, status) VALUES($1, $2, $3, $4)`,values);
      return res;
    } catch (error) {
      return error.stack;
    }
}

exports.setPointPessoaCanal = async(points,id)=>{
      const res = db.query(`UPDATE pessoa_canal SET points = $1 where id = $2`,[points,id]);
      return res;
}

exports.zerarPointPessoaCanal = async()=>{
    try {
      const res = await db.query(`UPDATE pessoa_canal SET points = 0`);
      return res;
    } catch (error) {
      return error.stack;
    }
}   

exports.setStatusPessoaCanal = async(status,id)=>{
    const res = db.query(`UPDATE pessoa_canal SET status = $1 where id = $2`,[status,id]);
    return res;
}