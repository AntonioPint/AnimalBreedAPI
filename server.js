const express = require("express")
const axios = require("axios");
const fs = require("fs");

let app = express();
app.use(express.static(__dirname + '/public'));
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({extended: false}));

let breeds = JSON.parse(fs.readFileSync("data/breeds.json","utf-8"));
let animaltypes = JSON.parse(fs.readFileSync("data/animaltypes.json","utf-8"));
let yummybreedsUrl = "https://api.yummypets.com/breeds";
let yummytypesUrl = "https://api.yummypets.com/pets/types";
let counter = parseInt(fs.readFileSync("data/counter.txt","utf8"));

app.use("/api", (req, res, next)=>{
    counter = parseInt(fs.readFileSync("data/counter.txt","utf8"));
    fs.writeFileSync("data/counter.txt", "" + ++counter);
    next();
})

app.get("/", (req, res) =>{
    res.sendFile(__dirname + "/index.html");
});

app.get("/api/types", (req, res) =>{
    res.send("ola2");
});

app.get("/api/breeds", (req, res) =>{
    res.send("ola");
});

function updateData(){
    axios(yummybreedsUrl).
    then((res) => {
        try { // api.yummipets could be not available
            if(breeds.extras.num_found < res.data.extras.num_found){ //new data to be added
                fs.writeFileSync("data.json", JSON.stringify(res), err => {
                    fs.appendFileSync("logs.txt", `An error ocurred writing to file breeds.json at ${new Date(Date.now()).toUTCString()}. ${err}\n`)
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
                fs.writeFileSync("data.json", JSON.stringify(res), err => {
                    fs.appendFileSync("logs.txt", `An error ocurred writing to file animaltypes.json at ${new Date(Date.now()).toUTCString()}. ${err}\n`)
                })
            }
        }catch(err){
            fs.appendFileSync("logs.txt", `An error ocurred accessing data from yummipets' API at ${new Date(Date.now()).toUTCString()}. ${err}\n`)
        }
    })
}



updateData();
setInterval(updateData, 399900099); //runs every 4,6 days 

app.listen(8080, console.log("Server running..."));