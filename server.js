const express = require("express");
const fs = require("fs");
const PORT = process.env.PORT || 8080;

let {incrementCounter} = require("./counter");
let updtDt = require("./updatedata");
let app = express();
app.use(express.static(__dirname + '/public'));
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({extended: false}));
// try{
//     let breeds = JSON.parse(fs.readFileSync("data/breeds.json","utf-8"));
// }catch (err){

// }
// try{
//     let animaltypes = JSON.parse(fs.readFileSync("data/animaltypes.json","utf-8"));
// }catch (err){

// }
// let breeds = JSON.parse(fs.readFileSync("data/breeds.json","utf-8"));
// let animaltypes = JSON.parse(fs.readFileSync("data/animaltypes.json","utf-8"));



app.use("/api", (req, res, next)=>{
    incrementCounter();
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

updtDt.updateData();
setInterval(updtDt.updateData, 399900099); //runs every 4 ⅗ days 

app.listen(PORT, console.log(`Server running at port ${PORT}...`));