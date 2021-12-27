const express = require("express")
const axios = require("axios");
const fs = require("fs");

let app = express();
app.use(express.static(__dirname + '/public'));
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({extended: false}));

let breeds = JSON.parse(fs.readFileSync("breeds.json","utf-8"));
let animaltypes = JSON.parse(fs.readFileSync("animaltypes.json","utf-8"));
let yummybreedsUrl = "https://api.yummypets.com/breeds";
let yummytypesUrl = "https://api.yummypets.com/pets/types";

app.use("/", (req, res, next)=>{
    counter = parseInt(fs.readFileSync("mynewfile1.txt","utf8"));
    fs.writeFileSync("mynewfile1.txt", "" + ++counter);
    next();
})
app.get("/", (req, res) =>{
    res.sendFile(__dirname + "/index.html");
});
app.get("/animals", (req, res) =>{
    res.send("ola");
});
app.get("/breeds", (req, res) =>{
    res.send("ola");
});

function updateData(){
    axios(yummybreedsUrl).
    then((res) => {
        try { // api.yummipets could be not available
            if(breeds.extras.num_found < res.data.extras.num_found){ //new data to be added
                fs.writeFileSync("data.json", JSON.stringify(res), err => {
                    fs.appendFileSync("logs.txt", `An error ocurred writing to file data.json at ${new Date(Date.now()).toUTCString()}. ${err}\n`)
                })
            }
        }catch(err){
            fs.appendFileSync("logs.txt", `An error ocurred accessing data from yummipets' API at ${new Date(Date.now()).toUTCString()}. ${err}\n`)
        }
    });
    axios(yummytypesUrl).
    then((res) => {
        try { // api.yummipets could be not available
            if(animaltypes.collection.lenght < res.data.extras.num_found){ //new data to be added
                fs.writeFileSync("data.json", JSON.stringify(res), err => {
                    fs.appendFileSync("logs.txt", `An error ocurred writing to file data.json at ${new Date(Date.now()).toUTCString()}. ${err}\n`)
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