const Products = require('../../schemas/products');
const products_steam = require('../../services/products_steam');
var path = require('path');
let fs = require('fs');
const Pessoa = require('../../schemas/pessoa');
const RedeemProduct = require('../../schemas/RedeemProduct');
const Channel = require('../../schemas/channel');
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');
var remetenteEmail = nodemailer.createTransport({
    host: '',
    service: 'Gmail',
    port: 587,
    secure: true,
    auth:{
        user: 'notificadordocirco@gmail.com',
        pass: 'jokerz2019' 
    }
});
const dotenv = require('dotenv');
const RedeemPoints = require('../../schemas/RedeemPoints');
dotenv.config();

const listProducts = async (req, res) => {
    const {
        page = 1,
        limit = 12,
        last = false,
        status = null,
        filtroType = null,
        filtroPrice = null
    } = req.query;

    try {
        let products_quant = 0;
        let products = [];
        let find = status?{status:status}:{}
        let findFilter = status?{status:status}:{}
        let filtros_type = [];
        let regra_filtros = ["Pistol","Rifle","Sniper Rifle","SMG","Shotgun","Machinegun","Knife","Gloves","Sticker","Agent"];
        let exists_outros = false;
        let filters_order = [];

        if (filtroType && filtroType != "Other") {
            find = {
                ...find,
                type:filtroType
            };
        }

        if (filtroType && filtroType == "Other") {
            console.log("filtros_type Other");
            find = {
                ...find,
                type: { $nin: regra_filtros }
            };
        }

        filtros_type = await Products.aggregate([
            {
              $group:{_id: "$type"}
            },
            {
              $sort:{_id: 1}
            }
        ]);

        if (filtros_type.length > 0) {
            // console.log("filtros_type: ",filtros_type);
            for (let i = 0; i < filtros_type.length; i++) {
                // console.log(regra_filtros.includes(filtros_type[i]._id));
                if (regra_filtros.includes(filtros_type[i]._id) && filtros_type[i]._id.length > 0) {
                    // console.log("passou: ",filtros_type[i]._id);
                    filters_order.push(filtros_type[i]);
                }else{
                    // filtros_type.splice(i,1);
                    exists_outros = true;
                }
            }
        }
        
        if(exists_outros) filters_order.push({"_id": "Other"});

        products = Products.find(find).limit(limit * 1).skip((page - 1) * limit);
        products_quant = await Products.find(find).exec();
        products_quant = products_quant.length;

        if (last) {
            console.log("filtro last");
            products = products.sort('-_id');
        }

        if (filtroPrice) {
            if (filtroPrice == 'up') {
                console.log("filtroPrice: up");
                products = products.sort('-price');
            }
            if (filtroPrice == 'down') {
                console.log("filtroPrice: down");
                products = products.sort('price')
            }
        }
        
        products = await products.exec();
        const count = products_quant;
        let totalPages = Math.ceil(count / limit);
        res.status(200).json({
          data:products,
          totalPages: totalPages,
          currentPage: page,
          total_itens: products_quant,
          filtros_type:filters_order,
          regra_filtros:regra_filtros
        });
    } catch (error) {
          res.status(400).send({
              message:'ERRO ao listar products',
              error:error
          });
    }
};

const findProductById = async (req, res) => {
    const id = req.params.id;
    try {
        let product = await Products.findById(id);
        res.status(200).json({
          data:product
        });
    } catch (error) {
        res.status(500).send({
            message:'ERRO ao listar products',
            error:error
        });
    }

};
  
const registerProduct = async (req, res) => {
    console.log('req.userId: ',req.userId);
    const id_user = req.userId;
    const data = req.body;
    // console.log("data: ",data);
    data.price = parseInt(data.price_real * 1500);
    data.date_create = new Date();
    let files = req.files;
    let image_product = files.filter((file)=>{return file.fieldname == "imageurl";});
    data.imagepath = image_product.length > 0?image_product[0].path:"";
    data.stickersinfo = data.stickersinfo?JSON.parse(data.stickersinfo):[];
    let quant_stickers = data.quant_stickers?parseInt(data.quant_stickers):0;
    data.quant_stickers = quant_stickers;
    data.id_owner = id_user;
    console.log("files: ",files);
    console.log("data.stickersinfo: ",data.stickersinfo);
    if (data.stickersinfo.length > 0 && files) {
        let stickersinfo = [];
        for (let i = 0; i < quant_stickers; i++) {
            let slot_sticker = data.stickersinfo[i].slot;
            console.log("slot_sticker: ",slot_sticker);
            let image_sticker = files.filter((file)=>{return file.fieldname == `stickers_${slot_sticker}`;});
            console.log("image_sticker: ",image_sticker);
            let stickerinfo = {
                name:data.stickersinfo[i].name,
                path_img: image_sticker.length > 0?image_sticker[0].path:"",
                slot:data.stickersinfo[i].slot
            };
            console.log("stickerinfo: ",stickerinfo);
            stickersinfo.push(stickerinfo);
        }
        data.stickersinfo = stickersinfo;
    }
  try {
      let resp = await Products.create(data);
      res.status(201).json({
          message:'Produto criado com sucesso!',
          data:resp,
        //   stickersinfo:data.stickersinfo
        //   files:files,
        //   file:req.file
      });
  } catch (error) {
      res.status(400).json({
          message:'Erro ao criar produto',
          error:error
      });
  }
};

const editProduct = async (req, res) => {
    // console.log("dir: ",dir);
    try {
        const id = req.params.id;
        let product = await Products.findById(id);
        if (product) {
            let data = req.body;
            let files = req.files;
            let quant_stickers = 0;
            if (data.price_real) {
                data.price_real = data.price_real?data.price_real:0;
                data.price = data.price_real?parseInt(data.price_real * 1500):0;
            }
            if (data.quant_stickers) {
                quant_stickers = data.quant_stickers?parseInt(data.quant_stickers):0;
                data.quant_stickers = quant_stickers;
            }

            console.log("files: ",files);
            console.log("data.stickersinfo: ",data.stickersinfo);
            console.log("quant_stickers: ",quant_stickers);

            let stickersinfo_temp = data.stickersinfo?JSON.parse(data.stickersinfo):[];
            if (stickersinfo_temp.length > 0) {
                let stickersinfo_old = product.stickersinfo;
                data.stickersinfo = stickersinfo_temp;
                if (data.stickersinfo.length > 0 && files) {
                    console.log("Tem sticker");
                    for (let i = 0; i < quant_stickers; i++) {
                        let slot_exist = stickersinfo_old.filter((stiker)=>{return stiker.slot == data.stickersinfo[i].slot});
                        let sticker_index = stickersinfo_old.findIndex((sticker)=>sticker.slot == data.stickersinfo[i].slot);
                        let image_sticker = files.filter((file)=>{return file.fieldname == `stickers_${data.stickersinfo[i].slot}`;});
                        console.log("slot exists.length: ",slot_exist.length);
                        console.log("slot exists: ",slot_exist);
                        console.log("sticker_index: ",sticker_index);
                        console.log("image_sticker.length: ",image_sticker.length);
                        let stickerinfo = {};
                        //se a imagem do sticker for editada
                        if (image_sticker.length > 0) {
                            console.log("se a imagem do sticker for editada");

                            if (slot_exist.length > 0 && slot_exist[0].link_img.length > 0) {
                                data.imageurl = null;
                            }
                            //apaga as imagens antigas dos stickers
                            if (slot_exist.length > 0 && slot_exist[0].path_img.length > 0) {
                                console.log("slot: ",slot_exist[0]);
                                let dir = path.resolve(slot_exist[0].path_img);
                                console.log("dir 2: ",dir);
                                await fs.promises.unlink(dir);
                            }

                            stickerinfo = {
                                name:data.stickersinfo[i].name,
                                path_img: image_sticker.length > 0?image_sticker[0].path:"",
                                slot:data.stickersinfo[i].slot,
                                link_img: null
                            };
                            
                        }else 
                        //se apenas o nome do sticker for editada e existir um path_img
                        if (slot_exist[0] && slot_exist[0].path_img && slot_exist[0].path_img.length > 0 && data.stickersinfo[i].name.length > 0) {
                            console.log("se apenas o nome do sticker for editada e existir um path_img");
                            stickerinfo = {
                                name:data.stickersinfo[i].name,
                                path_img: slot_exist[0].path_img,
                                slot:data.stickersinfo[i].slot
                            };
                        }else 
                        //se apenas o nome do sticker for editada e existir um link_img
                        if (slot_exist[0] && slot_exist[0].link_img && slot_exist[0].link_img.length > 0 && data.stickersinfo[i].name.length > 0) {
                            console.log("se apenas o nome do sticker for editada e existir um link_img");
                            stickerinfo = {
                                name:data.stickersinfo[i].name,
                                link_img: slot_exist[0].link_img,
                                slot:data.stickersinfo[i].slot
                            };
                        }

                        if (sticker_index != -1) {
                            stickersinfo_old[sticker_index] = stickerinfo;
                        }else{
                            stickersinfo_old.push(stickerinfo);
                        }
                        console.log("stickerinfo: ",stickerinfo);
                    }
                }
                    data.stickersinfo = stickersinfo_old;
            }

            //apaga a imagem do produto antiga
            let image_product = files.filter((file)=>{return file.fieldname == "imageurl";});
            console.log("image_product: ",image_product);
            if (image_product.length > 0) {
                data.imagepath = image_product.length > 0?image_product[0].path:"";
                if (product.imageurl && product.imageurl.length > 0) {
                    data.imageurl = null;
                }
                console.log("product.imagepath: ",product.imagepath);
                if (product.imagepath && product.imagepath.length > 0) {
                    let dir = path.resolve(product.imagepath);
                    console.log("dir 3: ",dir);
                    await fs.promises.unlink(dir);
                }
            }

            let resp = await Products.findByIdAndUpdate(id,{
                ...data
            });
            res.status(201).json({
                message:'Produto editado com sucesso!',
                data:resp,
                // data2:data
            });
        }else{
            res.status(400).json({
                message:'Erro ao editar produto, produto não encontrado'
            });
        }
  } catch (error) {
      res.status(400).json({
          message:'Erro ao editar produto',
          error:error
      });
  }
};

const changeStatusProduct = async (req, res) => {
    console.log("changeStatusProduct");
    try {
        const id_user = req.userId;
        const id = req.params.id;
        let product = await Products.findById(id);
        if (product) {
            let data = req.body;
            data.id_owner = id_user;
            let status = data.status;
            console.log("data: ",data);
            if (status && (status === "cadastrado" || status === "emEstoque" || status === "esgotado")) {
                product.status = status;
                let product_new = await product.save();
                res.status(201).json({
                    message:'Status atualizado com sucesso!',
                    data:product_new
                });
            }else{
                res.status(400).json({
                    message:'Status inválido'
                });
            }
        }else{
            res.status(400).json({
                message:'Erro ao editar status, produto não encontrado'
            });
        }
  } catch (error) {
      res.status(400).json({
          message:'Erro ao editar produto',
          error:error
      });
  }
};

const registerProductsCs = async (req, res) => {
    try {
        console.log('req.userId: ',req.userId);
        const id_user = req.userId;
        console.log('antes getItensCs ');
        const itens_cs = await products_steam.getItensCs();
        console.log('depois getItensCs ');
        // let data = itens_cs.data.rgDescriptions;
        if (itens_cs.data.assets.length > 0) {
            res.status(200).json({
                message:'Atualizando produtos...',
                time:(itens_cs.data.assets.length * 5)/60
            });
        } else {
            res.status(200).json({
                message:'Sem itens na steam.'
            });
        }
        itens_cs.id_user = id_user;
        let info_register = await products_steam.scrapsteam(itens_cs);
        console.log('info_register: ',info_register);
        return true;

    } catch (error) {
        console.log("Erro ao carregar itens do CS 2: ",error);
    }
};

const setPromo = async (req, res) => {
    const { product_id, pricePromo, statusPromo } = req.body;
    console.log('query: ',req.body);
    try {
        console.log('req.userId: ',req.userId);
        const id_user = req.userId;
        let person = await Pessoa.findById(id_user).populate('permissions.ifo_permission');
        if (person) {
            let perm_streamer = person.permissions.findIndex((permisao)=>{
                return permisao.ifo_permission.indice === 2;
            });
            if (perm_streamer != -1) {
                let prod = await Products.findById(product_id);
                prod.pricePromo = statusPromo?pricePromo:0;
                prod.promo = statusPromo;
                let resp = await prod.save();
                res.status(200).json({
                    message: statusPromo?'Promoção Criada':'Promoção Finalizada'
                });
            }else{
                res.status(400).json({
                    message:"Erro modificar Promoção: sem permissão"
                });
            }
        } else {
            res.status(400).json({
                message:"Erro modificar Promoção: usuário não encontrado"
            });
        }
    } catch (error) {
        res.status(500).json({
            message:"Erro modificar Promoção",
            error:error
        });
    }
};

const deleteProduct = async (req,res) => {
    const id = req.params.id;
    try {
        let product = await Products.findById(id);
        if (product) {
            if (product.imagepath && product.imagepath.length > 0) {
                let dir = path.resolve(product.imagepath);
                console.log("dir 7: ",dir);
                await fs.promises.unlink(dir);
            }
            for (let i = 0; i < product.stickersinfo.length; i++) {
                if (product.stickersinfo[i].path_img && product.stickersinfo[i].path_img.length > 0) {
                    let dir = path.resolve(product.stickersinfo[i].path_img);
                    console.log("dir 5: ",dir);
                    await fs.promises.unlink(dir);
                }
            }
            let deletado = await Products.findByIdAndDelete(id);
            res.status(200).json({
              message: 'Produto deletado',
              data: deletado
            });
        }else{
            res.status(400).send({
                message:'Produto não existe',
            });
        }
    } catch (error) {
        res.status(500).send({
            message:'Erro ao deletar produto',
            error:error
        });
    }
}

const deleteStickerProduct = async (req, res) => {
    const { product_id, slot } = req.body;
    console.log('body: ',req.body);
    try {
        let product = await Products.findById(product_id);
        let sticker = product.stickersinfo.filter((sticker_)=>sticker_.slot == slot);
        console.log('sticker: ',sticker);
        let index_sticker = product.stickersinfo.findIndex((sticker_)=>sticker_.slot == slot);
        console.log('index_sticker: ',index_sticker);
        if (sticker.length > 0 && index_sticker != -1) {
            if (sticker[0].path_img && sticker[0].path_img.length > 0) {
                let dir = path.resolve(sticker[0].path_img);
                console.log("dir 4: ",dir);
                await fs.promises.unlink(dir);
                console.log("imagem deletada 2: ",sticker[0].path_img);
            }
            product.stickersinfo.splice(index_sticker,1);
            let product_new = await product.save();
            res.status(200).json({
                message: 'Sticker removido',
                data:product_new
            });
        }else{
            res.status(400).json({
                message:"O slot "+ slot +" ja está vazio!"
            });
        }
    } catch (error) {
        res.status(500).json({
            message:"Erro ao remover sticker",
            error:error
        });
    }
};

const listProductsPromo = async (req, res) => {
    const { page = 1, limit = 4 } = req.query;
    try {
      let products = await Products.find({promo:true})
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();
        const count = await Products.countDocuments();
        res.status(200).json({
          data:products,
          totalPages: Math.ceil(count / limit),
          currentPage: page
        });
    } catch (error) {
          res.status(400).send({
              message:'ERRO ao listar products na promoção',
              error:error
          });
    }
};

const historyRedeemProduct = async (id_user, id_product, id_owner, id_channel)=>{
    return new Promise( async (resolve,reject)=>{
        try {
            let product = await Products.findById(id_product);
            let person = await Pessoa.findById(id_user);
            if (product && person) {
                let redeem = {
                    date:new Date(),
                    product_id:product._id,
                    amount:product.price,
                    product_float:parseFloat(product.floatvalue) > 0?product.floatvalue:null,
                    id_user:person._id,
                    tradeLink:person.tradelinkSteam.length > 0?product.tradelinkSteam:null,
                    id_owner:id_owner,
                    id_channel:id_channel,
                    price:product.price
                }
                let new_redeem = await RedeemProduct.create(redeem);
                resolve(new_redeem);
            } else {
                resolve(false);
            }
        } catch (error) {
            console.log("erro ao criar histórico de resgate de produto")
            resolve(false);
        }
    });
}

const redeemProduct = async (req, res)=>{
    console.log('req.userId: ',req.userId);
    try {
        const data = req.body;
        let id_user = req.userId?req.userId:'';
        let id_product = data.id_product?data.id_product:'';
        console.log('id_product: ',id_product);
        let product = await Products.findById(id_product);
        console.log('product: ',product);
        let person = await Pessoa.findById(id_user);
        if (product) {
            let id_owner = product.id_owner?product.id_owner:'';
            let channel = await Channel.findOne({id_person:id_owner});
            console.log('channel: ',channel);
            console.log('person.tradelinkSteam: ',person.tradelinkSteam);
            let id_channel = channel&&channel._id?channel._id:'';
            console.log('id_channel: ',id_channel);
            if (String(id_channel).length > 0) {
                if (person.tradelinkSteam && person.tradelinkSteam.length > 0) {
                    if (product.status == 'emEstoque') {
                        let price_real = product.promo?product.pricePromo:product.price;
                        console.log('price_real: ',price_real);
                        if (person.points >= price_real) {
                            var emailASerEnviado = {
                                from: 'notificadordocirco@gmail.com',
                                to: 'jokerzcsgo@gmail.com',
                                subject: `O item ${product.name} foi retirado na loja`,
                                text: 'For clients with plaintext support only',
                                html:`<!doctype html>
                                <html ⚡4email>
                                    <head>
                                        <meta charset="utf-8">
                                        <style>
                                            .content-email{
                                                border: 2px solid black;
                                                background-color: #05060D;
                                                color:#fff !important;
                                                font-family: Arial, Helvetica, sans-serif;
                                                display:block;
                                                text-align: center;
                                            }
                                            .info-product{
                                                margin: 0;
                                            }
                                            .content-image{
                                                background-color:brown;
                                                border-radius:12px;
                                                border-bottom: 2px solid #fff;
                                                border-bottom-left-radius:0px;
                                                border-bottom-right-radius:0px;
                                                padding:15px;
                                                width:80%;
                                                /* height:10vw; */
                                                margin: 0 auto;
                                                margin-bottom: 20px;
                                            }
                                            .content-info{
                                                color:#fff !important;
                                                display:block;
                                                margin: 0 auto;
                                            }
                                            .containerButton{
                                                padding: 10px;
                                                background-color: #DAA520;
                                                width: 150px;
                                                display:block  !important;
                                                margin: 0 auto;
                                                margin-bottom: 20px;
                                                border-radius: 10px;
                                            }
                                            a:link 
                                            { 
                                            text-decoration:none; 
                                                color: #000 !important;
                                            } 
                                        </style>
                                    </head>
                                    <body>
                                        <div class="content-email">
                                            <h1><b>Um item foi retirado na loja:</b></h1><br>
                                            <div class="content-image">
                                                <img 
                                                style="
                                                max-width: 100%;
                                                max-height: 100%;"
                                                src="cid:image_product_email"
                                                alt="Produto">
                                            </div>
                                            <div class="containerButton">
                                                <a class="buttonEntrega" href="${process.env.URL_SITE}/dashboard/resgateProdutosPendentes""  >Entrega produto</a>
                                            </div>
                                            <div class="content-info">
                                                <p class="info-product"><b>Nome do produto:</b> ${product.name?product.name:'Não cadastrado'} </p><br>
                                                <p class="info-product"><b>Float do produto:</b> ${product.floatvalue?product.floatvalue:'Não cadastrado'} </p><br>
                                                <p class="info-product"><b>Desgaste do produto:</b> ${product.exterior?product.exterior:'Não cadastrado'} </p><br>
                                                <p class="info-product"><b>Trade link do usuário:</b> ${person.tradelinkSteam?person.tradelinkSteam:'Não cadastrado'} </p><br>
                                                <p class="info-product"><b>Valor do produto:</b> ${product.price?product.price:'Não cadastrado'} </p><br>
                                            </div>
                                        </div>
                                    </body>
                                </html>`,
                                attachments: [{
                                    filename: 'image_product.png',
                                    path: product.imageurl?product.imageurl:product.imagepath?(process.env.URL_SERVER+"/"+product.imagepath):'https://cdn.neemo.com.br/uploads/settings_webdelivery/logo/3136/image-not-found.jpg',
                                    cid: 'image_product_email' //same cid value as in the html img src
                                }]
                            };
                            if (product.amount > 1) {
                                let product_up = await Products.findByIdAndUpdate(id_product,{
                                    amount: product.amount -1
                                });
                                let person_up = await Pessoa.findByIdAndUpdate(id_user,{
                                    points: person.points - price_real
                                });
                                let dataRedeeem = {
                                    date:new Date(),
                                    amount:-(price_real),
                                    id_user:person._id,
                                    id_channel:id_channel,
                                    status:'entregue',
                                    type:'produto',
                                    redemption_id:uuidv4()
                                }
                                let redeem = await RedeemPoints.create(dataRedeeem);
                                let resp = await historyRedeemProduct(id_user, id_product, id_owner, id_channel);
                                if (resp) {
                                    remetenteEmail.sendMail(emailASerEnviado, function(err) {
                                        if (err) {
                                            console.log('Email não enviado.');
                                        }else{
                                            console.log('Email enviado com sucesso.');
                                        }
                                      });
                                    return res.status(200).json({
                                      data:resp,
                                      message:"Produto resgatado com sucesso"
                                    });
                                } else {
                                    let product_up = await Products.findByIdAndUpdate(id_product,{
                                        amount: product.amount +1
                                    });
                                    return res.status(500).send({
                                        message:'Erro ao resgatar produto, erro ao cadastro log de resgate'
                                    });
                                }
                            }else{
                                console.log('product.amount: ',product.amount);
                                if (product.amount > 0) {
                                    let product_up = await Products.findByIdAndUpdate(id_product,{
                                        status:'esgotado',
                                        amount: 0
                                    });
                                    let person_up = await Pessoa.findByIdAndUpdate(id_user,{
                                        points: person.points - price_real
                                    });
                                    let dataRedeeem = {
                                        date:new Date(),
                                        amount:-(price_real),
                                        id_user:person._id,
                                        id_channel:id_channel,
                                        status:'entregue',
                                        type:'produto',
                                        redemption_id:uuidv4()
                                    }
                                    let redeem = await RedeemPoints.create(dataRedeeem);
                                    let resp = await historyRedeemProduct(id_user, id_product, id_owner, id_channel);
                                    if (resp) {
                                        remetenteEmail.sendMail(emailASerEnviado, function(err) {
                                            if (err) {
                                                console.log('Email não enviado.');
                                            }else{
                                                console.log('Email enviado com sucesso.');
                                            }
                                          });
                                        return res.status(200).json({
                                          data:resp,
                                          message:"Produto resgatado com sucesso"
                                        });
                                    } else {
                                        let product_up = await Products.findByIdAndUpdate(id_product,{
                                            amount: 1
                                        });
                                        return res.status(500).send({
                                            message:'Erro ao resgatar produto, erro ao cadastro log de resgate'
                                        });
                                    }
                                }else{
                                    return res.status(400).send({
                                        message:'Erro ao resgatar produto, produto fora de estoque'
                                    });
                                }
                            }
                        }else{
                            return res.status(400).send({
                                message:'Erro ao resgatar produto, pontos insuficientes'
                            });
                        }
                    } else {
                        return res.status(400).send({
                            message:'Erro ao resgatar produto, produto fora de estoque'
                        });
                        
                    }
                }else{
                    return res.status(400).send({
                        message:'Erro ao resgatar produto, tradeLink não encontrado'
                    });
                }
            } else {
                return res.status(400).send({
                    message:'Erro ao resgatar produto, canal não encantrado'
                });
            }
        } else {
            return res.status(400).send({
                message:'Erro ao resgatar produto, produto não encontrado'
            });
        }
    } catch (error) {
        return res.status(500).send({
            message:'Erro ao resgatar produto: '+error.message,
            error:error
        });
    }
}

module.exports = {
    listProducts,
    listProductsPromo,
    findProductById,
    registerProduct,
    registerProductsCs,
    setPromo,
    editProduct,
    deleteStickerProduct,
    changeStatusProduct,
    deleteProduct,
    // historyRedeemProduct,
    redeemProduct
}