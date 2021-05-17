const Products = require('../../schemas/products');
const products_steam = require('../../services/products_steam');

const listProducts = async (req, res) => {
    const { page = 1, limit = 12 } = req.query;
    try {
      let products = await Products.find()
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();
        const count = await Products.countDocuments();
        let totalPages = Math.ceil(count / limit)
        res.status(200).json({
          data:products,
          totalPages: totalPages,
          currentPage: page,
          total_itens: limit * totalPages
        });
    } catch (error) {
          res.status(400).send({
              message:'ERRO ao listar products',
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

const findProductById = async (req, res) => {
    // const id = parseInt(req.params.id)
    // Canal.selectCanalById(id).then((data) => {
    //   res.status(200).json({
    //     canal:data[0]
    //   });
    // }).catch((err) => {
    //   res.status(400).send(['Erro ao procurar canal']);
    // });
};
  
const registerProduct = async (req, res) => {
  
//   const { name } = req.body;
//     let data = {
//         name:name,
//     }
//   try {
//       let resp = await Channel.create(data);
//       res.status(201).json({
//           message:'Canal cirada com sucesso!',
//           data:resp
//       });
//   } catch (error) {
//       res.status(400).json({
//           message:'Erro ao criar cadastro de canal',
//           err:error
//       });
//   }
};

const registerProductsCs = async (req, res) => {
    try {
        const itens_cs = await products_steam.getItensCs();
        // let data = itens_cs.data.rgDescriptions;
        let data = await products_steam.organizarArrayItens(itens_cs.data);
        // console.log('data: ',data);
        // await Products.deleteMany({});
        if (data) {
            Object.values(data).map(async(item)=>{
                let class_id = item.classid+'_'+item.instanceid;
                let prod = await Products.findOne({id_item:item.id_item});
                let product = {
                    id_owner:item.id_owner,
                    id_item:item.id_item,
                    class_id:class_id,
                    name:item.name,
                    name_store:item.market_name,
                    describe:item.descriptions[2].value.length > 0 ?item.descriptions[2].value:'sem descrição...',
                    price:50,
                    imageurl:item.icon_url,
                    inspectGameLink:item.actions?(item.actions[0]?item.actions[0].link:''):'',
                    exterior:item.descriptions[0].value,
                    amount:1,
                    type:item.type
                }
                if (prod) {
                    console.log('item '+prod.name+' atualizado: ');
                    prod.id_owner=item.id_owner;
                    prod.id_item=item.id_item;
                    prod.class_id=class_id;
                    prod.name=item.name;
                    prod.name_store=item.market_name;
                    prod.describe=item.descriptions[2].value.length > 0 ?item.descriptions[2].value:'sem descrição...';
                    prod.price=50;
                    prod.imageurl=item.icon_url;
                    prod.inspectGameLink=item.actions?(item.actions[0]?item.actions[0].link:''):'';
                    prod.exterior=item.descriptions[0].value;
                    prod.amount=1;
                    prod.type=item.type;
                    prod.save();
                }else{
                    // console.log('cadastrando product: ',product.name);
                    console.log('item '+product.id_item+' criado: ');
                    Products.create(product);
                    console.log('item '+product.name+' criado: ');
                }
            });
            
            res.status(200).json({
                message:'Atualizando produtos...'
            });
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
    setPromo
}