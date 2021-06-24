var axios = require('axios');
const jwt = require('jsonwebtoken');
const Products = require('../../schemas/products');
const id_owner = '76561198437724880';
const name_owenr = 'teamjokerzdudis';
const steamimgurl = 'https://steamcommunity-a.akamaihd.net/economy/image/';
// 76561198044858151
// teamjokerzdudis

// 76561198437724880
// teamjokerzskull

// 76561199002891521
// teamjokerznath

// 76561198399029270
// argerioaf,
async function organizeItens (data_descriptions, data_assets, i){
    return new Promise(async(resolve,reject)=>{
        try {
            let imageurl = data_descriptions.icon_url?steamimgurl + data_descriptions.icon_url:"";
            
            // Pegar o tradelink
            let inspectlink_done = null;
            // console.log("data_descriptions.actions: ",data_descriptions.actions?"existe":"nao existe");
            if (data_descriptions.actions && data_descriptions.actions[0] && data_descriptions.actions[0].link) {
                let tradelink_raw = data_descriptions.actions[0].link;
                let tradelink_steamid = tradelink_raw.replace('%owner_steamid%', id_owner);
                inspectlink_done = tradelink_steamid.replace('%assetid%', data_assets.assetid);
            }

            // Pegar os patches
            let imagelinkraw = '';
            let stickersinfo = '';
            let nostickers = '';
            for (let j = 0; j < data_descriptions.descriptions.length; j++) {
                if (data_descriptions.descriptions[j].value.includes('https://')) {
                    imagelinkraw = data_descriptions.descriptions[j].value;
                    stickersinfo = await stickersname(imagelinkraw);
                    nostickers = stickersinfo.length;
                }
            }
            
            //Pegar o float
            let floatvalue = "";
            let paint = "";
            let weapon = "";
            if (inspectlink_done) {
                console.log("carregando float...");
                let data_CSGOfloat = await getFloat(inspectlink_done);
                if (data_CSGOfloat) {
                    // console.log(i+" - data_CSGOfloat response:",data_CSGOfloat.data.iteminfo);
                    if (data_CSGOfloat.data.iteminfo) {
                        floatvalue = data_CSGOfloat.data.iteminfo?data_CSGOfloat.data.iteminfo.floatvalue?data_CSGOfloat.data.iteminfo.floatvalue:'null':'null';
                        floatvalue = String(floatvalue);
                        paint = data_CSGOfloat.data.iteminfo?data_CSGOfloat.data.iteminfo.item_name?data_CSGOfloat.data.iteminfo.item_name:'null':'null';
                        weapon = data_CSGOfloat.data.iteminfo?data_CSGOfloat.data.iteminfo.weapon_type?data_CSGOfloat.data.iteminfo.weapon_type:'null':'null';
                    } else {
                        console.log(i+" - data_CSGOfloat response error: ");
                        floatvalue = 'null';
                        paint = 'null';
                        weapon = 'null';
                    }
                } else {
                    console.log(i+" - data_CSGOfloat response error");
                    floatvalue = 'null';
                    paint = 'null';
                    weapon = 'null';
                }
            }
            
            //Pegar o valor
            let price = 0;
            if (data_descriptions.market_name) {
                console.log("carregando valor...");
                let price_steam = await getValue(data_descriptions.market_name);
                if (price_steam) {
                    if (price_steam.data && price_steam.data.lowest_price) {
                        console.log(i+" - price_steam desforamatada price_steam.data"+price_steam.data);
                        price = price_steam.data.lowest_price;
                        console.log(i+" - price_steam desforamatada response "+price);
                        price = price.length > 0?price.split(' '):['R$','0,00'];
                        price = parseFloat(price[1].replace(',','.'));
                        console.log(i+" - price_steam response "+price);
                    } else {
                        console.log(i+" - price_steam response error");
                        price = 0.00;
                    }
                } else {
                    console.log(i+" - price_steam response error");
                    price = 0.00;
                }
            }
            
            // Pegar o Type, Weapon e Exterior
            let type = '';
            let exterior = '';
            if (data_descriptions.tags) {
                for (let i = 0; i < data_descriptions.tags.length; i++) {
                    if (data_descriptions.tags[i].category === "Type") {
                        type = data_descriptions.tags[i].localized_tag_name
                    } else if (data_descriptions.tags[i].category === "Exterior") {
                        exterior = data_descriptions.tags[i].localized_tag_name
                    }
                }
            }
            
            // Pegar o nametag
            let nametagraw = data_descriptions.fraudwarnings?data_descriptions.fraudwarnings[0] : '';
            let nametag = nametagraw.replace("Name Tag: ''", "");
            nametag = nametag.replace("''", "");

            let description = data_descriptions.descriptions[2].value.length > 0 ?data_descriptions.descriptions[2].value:'sem descrição...';
            
            let product = {
                market_name:data_descriptions.market_name?data_descriptions.market_name:"",
                description:description?description:"",
                assetid:data_assets.assetid?data_assets.assetid:"",
                classid:data_assets.classid?data_assets.classid:"",
                instanceid:data_assets.instanceid?data_assets.instanceid:"",
                imageurl:imageurl?imageurl:"",
                tradable: data_descriptions.tradable == 0?false:true,
                inspectlink_done:inspectlink_done?inspectlink_done:"",
                stickersinfo:stickersinfo?stickersinfo:[],
                nostickers:nostickers?nostickers:0,
                floatvalue:floatvalue?floatvalue:"",
                paint:paint?paint:"",
                weapon:weapon?weapon:"",
                type:type?type:"",
                exterior:exterior?exterior:"",
                nametag:nametag?nametag:"",
                price:price?price:0
            }

            resolve(product);

        } catch (error) {
            reject({error:error,message:"erro ao organizar itens: organizeItens"});
        }
    });
}

async function stickersname(imagelinkraw){
    let stickers_temp = imagelinkraw.split('src="');
    let stickersinfo = [];
    for (let i = 0; i < stickers_temp.length; i++) {
        if (i != 0) {
            let sticker = stickers_temp[i].split('">');
            stickersinfo.push({link_img:sticker[0],slot:i,path_img:null});
        }
        if (i == stickers_temp.length - 1) {
            let stickernametemp = stickers_temp[i].split(': ');
            let stickernametemp2 = stickernametemp[1].split('</center>');
            let stickername = stickernametemp2[0].split(', ');
            for (let j = 0; j < stickername.length; j++) {
                stickersinfo[j].name = stickername[j];
            }  
        }
    }
    return stickersinfo;
}

async function getFloat(tradelink){
    return new Promise(async(resolve,reject)=>{
        try {
            let resp = await axios.get(`https://api.csgofloat.com/?url=${tradelink}`); 
            return resolve(resp);
        } catch (error) {
            console.log("erro getFloat message: "+error.message);
            // console.log("erro getFloat error.status: "+error.status);
                // console.log("erro getFloat:",error); 
            return resolve(false);
        }
    });
}

async function getValue(nomedoitem){
    return new Promise(async(resolve,reject)=>{
        try {
            let url = encodeURI(`http://steamcommunity.com/market/priceoverview/?appid=730&currency=7&market_hash_name=${nomedoitem}`);
            console.log("url: ",url);
            let resp = await axios.get(url); 
            return resolve(resp);
        } catch (error) {
            console.log("erro getValue message: "+error.message);
            // console.log("erro getValue error.status: "+error.status);
                // console.log("erro getValue:",error);
            return resolve(false);
        }
    });
}

function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
      currentDate = Date.now();
    } while (currentDate - date < milliseconds);
}

exports.getItensCs = async ()=>{
        let url = `http://steamcommunity.com/inventory/${id_owner}/730/2`;
        return axios.get(url);
}

exports.scrapsteam = async (response)=>{
        return new Promise(async (resolve, reject) => {
            try {
                let info_register = {
                    update:0,
                    create:0
                }
                let itens = [];
                for (let i = 0; i < response.data.assets.length; i++) {
                    for (let u = 0; u < response.data.descriptions.length; u++) {
                        if (response.data.assets[i].classid === response.data.descriptions[u].classid 
                            && response.data.assets[i].instanceid === response.data.descriptions[u].instanceid 
                            && response.data.descriptions[u].marketable === 1){
    
                                let data_descriptions = response.data.descriptions[u];
                                let data_assets = response.data.assets[i];
                                sleep(11000);
                                let itens_organizados = await organizeItens(data_descriptions,data_assets,i);
                                itens_organizados.id_owner = id_owner;
                                // itens.push(itens_organizados); 

                                let item = itens_organizados;
                                let prod = await Products.findOne({
                                    name:item.market_name,
                                    class_id:item.classid,
                                    assetid:item.assetid 
                                });
        
                                let product = {
                                    id_owner_steam:item.id_owner,
                                    id_owner:response.id_user,
                                    class_id:item.classid,
                                    name:item.market_name,
                                    name_store:item.market_name,
                                    describe:item.description,
                                    price:parseInt(item.price*1500),
                                    price_real:item.price,
                                    imageurl:item.imageurl,
                                    inspectGameLink:item.inspectlink_done,
                                    exterior:item.exterior && item.exterior != "-"?item.exterior:'',
                                    amount:1,
                                    type:item.type,
                                    assetid:item.assetid,
                                    instanceid:item.instanceid,
                                    tradable:item.tradable,
                                    stickersinfo:item.stickersinfo,
                                    quant_stickers:item.nostickers,
                                    floatvalue:item.floatvalue,
                                    paint:item.paint && item.paint != "-"?item.paint:'',
                                    weapon:item.weapon && item.weapon != "-"?item.weapon:'',
                                    nametag:item.nametag && item.nametag != "-"?item.nametag:''
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
                                    prod.id_owner_steam=item.id_owner;
                                    // prod.id_owner=id_user;
                                    prod.class_id=item.classid;
                                    // prod.name=item.market_name;
                                    // prod.name_store=item.market_name;
                                    // prod.describe=item.description;
                                    if (item.price > 0) {
                                        prod.price = parseInt(item.price*1500);
                                        prod.price_real = item.price;
                                    }
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
                                    if (item.floatvalue != 'null') {
                                        prod.floatvalue = item.floatvalue;
                                        prod.paint = item.paint && item.paint != "-"?item.paint:'';
                                        prod.weapon = item.weapon && item.weapon != "-"?item.weapon:'';
                                    }
                                    prod.nametag = item.nametag && item.nametag != "-"?item.nametag:'';
                                    await prod.save();
                                    console.log(i + ' - item '+prod.name+' atualizado: ');
                                    info_register.update = info_register.update+1;
                                }else{
                                    console.log('cadastrando product: ',product.name);
                                    product.date_create = new Date();
                                    await Products.create(product);
                                    console.log(i + ' - item - criado: ');
                                    info_register.create = info_register.create+1;
                                }
        
                        }
                    }
                }
                resolve(info_register);
            } catch (error) {
                reject({error:error,message:"erro ao organizar itens: scrapsteam"});
            }
        });
}