const fs = require("fs");
const axios = require("axios");

let yummybreedsUrl = "https://api.yummypets.com/breeds";
let yummytypesUrl = "https://api.yummypets.com/pets/types";

let breeds = {"collection": [], "extras": {"num_found": 0}};
let animaltypes = {"collection":[]};

function createFiles(){
    try {
        breeds = JSON.parse(fs.readFileSync("data/breeds.json", "utf-8"));
    } catch (err){
        fs.appendFileSync("data/breeds.json", JSON.stringify(breeds));
    }

    try {
        animaltypes = JSON.parse(fs.readFileSync("data/animaltypes.json","utf-8"));
    } catch (err){
        fs.appendFileSync("data/animaltypes.json", JSON.stringify(animaltypes));
    }
}

function updateData(){
    createFiles();
    axios(yummybreedsUrl).
    then((res) => {
        try { // api.yummipets could be not available
            if(breeds.extras.num_found < res.data.extras.num_found){ //new data to be added
                fs.writeFileSync("data/breeds.json", JSON.stringify(res.data), err => {
                    fs.appendFileSync("data/logs.txt", `An error ocurred writing to file breeds.json at ${new Date(Date.now()).toUTCString()}. ${err}\n`)
                })
            }
        }catch(err){
            fs.appendFileSync("data/logs.txt", `An error ocurred accessing data from yummipets' API at ${new Date(Date.now()).toUTCString()}. ${err}\n`)
        }
    });
    axios(yummytypesUrl).
    then((res) => {
        try { // api.yummipets could be not available
            if(animaltypes.collection.length < res.data.collection.length){ //new data to be added
                fs.writeFileSync("data/animaltypes.json", JSON.stringify(res.data), err => {
                    fs.appendFileSync("data/logs.txt", `An error ocurred writing to file animaltypes.json at ${new Date(Date.now()).toUTCString()}. ${err}\n`)
                })
            }
        }catch(err){
            fs.appendFileSync("data/logs.txt", `An error ocurred accessing data from yummipets' API at ${new Date(Date.now()).toUTCString()}. ${err}\n`)
        }
    })
}

module.exports.updateData = updateData;
