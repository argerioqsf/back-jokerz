var axios = require('axios');
const jwt = require('jsonwebtoken');
const id_owner = '76561198044858151';
const name_owenr = 'teamjokerzdudis';
const steamimgurl = 'https://steamcommunity-a.akamaihd.net/economy/image/';
// 76561198044858151
// teamjokerzdudis

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
                let data_CSGOfloat = await getFloat(inspectlink_done);
                console.log(i+" - data_CSGOfloat response");
                floatvalue = data_CSGOfloat.data.iteminfo.floatvalue;
                floatvalue = String(floatvalue);
                paint = data_CSGOfloat.data.iteminfo.item_name;
                weapon = data_CSGOfloat.data.iteminfo.weapon_type;
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
                nametag:nametag?nametag:""
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
    return axios.get(`https://api.csgofloat.com/?url=${tradelink}`); 
}
function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
      currentDate = Date.now();
    } while (currentDate - date < milliseconds);
}

module.exports = {
    getItensCs: async ()=>{
        let url = `http://steamcommunity.com/inventory/${id_owner}/730/2`;
        return axios.get(url);
    },
    scrapsteam: async (response)=>{
        return new Promise(async (resolve, reject) => {
            try {
                let itens = [];
                for (let i = 0; i < response.data.assets.length; i++) {
                    for (let u = 0; u < response.data.descriptions.length; u++) {
                        if (response.data.assets[i].classid === response.data.descriptions[u].classid 
                            && response.data.assets[i].instanceid === response.data.descriptions[u].instanceid 
                            && response.data.descriptions[u].marketable === 1){
    
                                let data_descriptions = response.data.descriptions[u];
                                let data_assets = response.data.assets[i];
                                sleep(5000);
                                let itens_organizados = await organizeItens(data_descriptions,data_assets,i);
                                itens_organizados.id_owner = id_owner;
                                itens.push(itens_organizados);

                        }
                    }
                }
                resolve(itens);
            } catch (error) {
                reject({error:error,message:"erro ao organizar itens: scrapsteam"});
            }
        });
    }
}