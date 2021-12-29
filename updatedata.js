const fs = require("fs");
const axios = require("axios");

let yummybreedsUrl = "https://api.yummypets.com/breeds";
let yummytypesUrl = "https://api.yummypets.com/pets/types";

let breeds = JSON.parse(fs.readFileSync("data/breeds.json","utf-8"));
let animaltypes = JSON.parse(fs.readFileSync("data/animaltypes.json","utf-8"));

module.exports.updateData = function (){
    axios(yummybreedsUrl).
    then((res) => {
        try { // api.yummipets could be not available
            if(breeds.extras.num_found < res.data.extras.num_found){ //new data to be added
                fs.writeFileSync("data/breeds.json", JSON.stringify(res), err => {
                    fs.appendFileSync("data/logs.txt", `An error ocurred writing to file breeds.json at ${new Date(Date.now()).toUTCString()}. ${err}\n`)
                })
            }
        }catch(err){
            fs.appendFileSync("logs.txt", `An error ocurred accessing data from yummipets' API at ${new Date(Date.now()).toUTCString()}. ${err}\n`)
        }
    });
    axios(yummytypesUrl).
    then((res) => {
        try { // api.yummipets could be not available
            if(animaltypes.collection.length < res.data.collection.length){ //new data to be added
                fs.writeFileSync("data/animaltypes.json", JSON.stringify(res), err => {
                    fs.appendFileSync("data/logs.txt", `An error ocurred writing to file animaltypes.json at ${new Date(Date.now()).toUTCString()}. ${err}\n`)
                })
            }
        }catch(err){
            fs.appendFileSync("data/logs.txt", `An error ocurred accessing data from yummipets' API at ${new Date(Date.now()).toUTCString()}. ${err}\n`)
        }
    })
}
