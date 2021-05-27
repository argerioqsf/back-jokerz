const Products = require('../../schemas/products');
const products_steam = require('../../services/products_steam');
var path = require('path');
let fs = require('fs');

const listProducts = async (req, res) => {
    const { page = 1, limit = 12, last = false, status = null } = req.query;
    try {
        let products_quant = 0;
        let products = [];
        let find = status?{status:status}:{}
        if (last) {
            products = await Products.find(find)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort('-date_create')
            .exec();
            products_quant = await Products.find(find)
            .sort('-date_create')
            .exec();
            products_quant = products_quant.length;
        }else{
            products = await Products.find(find)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();
            products_quant = await Products.find(find)
            .sort('-date_create')
            .exec();
            products_quant = products_quant.length;
        }
        
        const count = products_quant;
        let totalPages = Math.ceil(count / limit);
        res.status(200).json({
          data:products,
          totalPages: totalPages,
          currentPage: page,
          total_itens: products_quant
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

    const data = req.body;
    // console.log("data: ",data);
    data.price = data.price_real * 1500;
    data.date_create = new Date();
    let files = req.files;
    let image_product = files.filter((file)=>{return file.fieldname == "imageurl";});
    data.imagepath = image_product.length > 0?image_product[0].path:"";
    data.stickersinfo = data.stickersinfo?JSON.parse(data.stickersinfo):[];
    let quant_stickers = data.quant_stickers?parseInt(data.quant_stickers):0;
    data.quant_stickers = quant_stickers;
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
                data.price_real = parseFloat(data.price_real?data.price_real:0);
                data.price = parseFloat(data.price_real?data.price_real * 1500:0);
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
        const id = req.params.id;
        let product = await Products.findById(id);
        if (product) {
            let data = req.body;
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
        console.log('antes getItensCs ');
        const itens_cs = await products_steam.getItensCs();
        console.log('depois getItensCs ');
        // let data = itens_cs.data.rgDescriptions;
        let data = await products_steam.scrapsteam(itens_cs);
        console.log('data length: ',data.length);
        let info_register = {
            update:0,
            create:0
        }
        // await Products.deleteMany({});
        if (data) {
            if (data.length > 0) {
                // Object.values(data).map(async(item,index)=>{
                    for (let index = 0; index < data.length; index++) {
                        let item = data[index];
                        let prod = await Products.findOne({
                            name:item.market_name,
                            class_id:item.classid,
                            assetid:item.assetid
                        });

                        let product = {
                            id_owner:item.id_owner,
                            class_id:item.classid,
                            name:item.market_name,
                            name_store:item.market_name,
                            describe:item.description,
                            price:50,
                            price_real:50/1500,
                            imageurl:item.imageurl,
                            inspectGameLink:item.inspectlink_done,
                            exterior:item.exterior,
                            amount:1,
                            type:item.type,
                            assetid:item.assetid,
                            instanceid:item.instanceid,
                            tradable:item.tradable,
                            stickersinfo:item.stickersinfo,
                            quant_stickers:item.nostickers,
                            floatvalue:item.floatvalue,
                            paint:item.paint,
                            weapon:item.weapon,
                            nametag:item.nametag
                        }
                        if (prod) {
                            for (let i = 0; i < prod.stickersinfo.length; i++) {
                                if (prod.stickersinfo[i].path_img && prod.stickersinfo[i].path_img.length > 0) {
                                    let dir = path.resolve(prod.stickersinfo[i].path_img);
                                    console.log("dir 5: ",dir);
                                    await fs.promises.unlink(dir);
                                    prod.stickersinfo[i].path_img = null;
                                }
                            }
                            if (prod.imagepath && prod.imagepath.length > 0) {
                                let dir = path.resolve(prod.imagepath);
                                console.log("dir 6: ",dir);
                                await fs.promises.unlink(dir);
                                prod.imagepath = null;
                            }
                            console.log(index + ' - item '+prod.name+' atualizado: ');
                            prod.id_owner=item.id_owner;
                            prod.class_id=item.classid;
                            prod.name=item.market_name;
                            prod.name_store=item.market_name;
                            prod.describe=item.description;
                            prod.price = 50;
                            prod.price_real = 50/1500;
                            prod.imageurl=item.imageurl;
                            prod.inspectGameLink=item.inspectlink_done;
                            prod.exterior=item.exterior;
                            prod.amount=1;
                            prod.type=item.type;
                            prod.assetid = item.assetid;
                            prod.instanceid = item.instanceid;
                            prod.tradable = item.tradable;
                            prod.stickersinfo = item.stickersinfo;
                            prod.quant_stickers = item.nostickers;
                            prod.floatvalue = item.floatvalue;
                            prod.paint = item.paint;
                            prod.weapon = item.weapon;
                            prod.nametag = item.nametag;
                            await prod.save();
                            info_register.update = info_register.update+1;
                        }else{
                            console.log('cadastrando product: ',product.name);
                            product.date_create = new Date();
                            await Products.create(product);
                            console.log(index + ' - item - criado: ');
                            info_register.create = info_register.create+1;
                        }

                        if (index == data.length - 1) {
                        }
                    }
                // });
                res.status(200).json({
                    message:'Atualizando produtos...',
                    info_register:info_register
                });
            }else{
                res.status(200).json({
                    message:'Sem itens na steam.'
                });
            }
            
        }else{
            res.status(500).json({
                message:'Erro ao carregar itens do CS 1',
            });
        }
    } catch (error) {
        res.status(500).json({
            message:"Erro ao carregar itens do CS 2",
            error:error
        });
    }
};

const setPromo = async (req, res) => {
    const { product_id, pricePromo, statusPromo } = req.body;
    console.log('query: ',req.body);
    try {
        let prod = await Products.findById(product_id);
        prod.pricePromo = statusPromo?pricePromo:0;
        prod.promo = statusPromo;
        let resp = await prod.save();
        res.status(200).json({
            message: statusPromo?'Promoção Criada':'Promoção Finalizada'
        });
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
    deleteProduct
}