const express = require("express");
const bodyParser = require("express");
const fs = require("fs");
const PORT = process.env.PORT || 8080;

let {incrementCounter} = require("./counter");
let updtDt = require("./updatedata");
let app = express();
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

let breeds, animaltypes = null;

while(!breeds || !animaltypes){
    try{
        breeds = JSON.parse(fs.readFileSync("data/breeds.json","utf-8"));
        animaltypes = JSON.parse(fs.readFileSync("data/animaltypes.json","utf-8"));
    }catch(err){
        updtDt.updateData();
    }
}

app.get("/", (req, res) =>{
    res.sendFile(__dirname + "/index.html");
});

app.use("/api", (req, res, next)=>{
    incrementCounter();
    next();
})

app.get("/api/types/:id?", (req, res) =>{
    let response = [];
    let begin_date = Date.now(); 
    animaltypes.collection.forEach(element => {
        if(!req.params.id && !req.body.type){
            console.log(1);
            response.push({"id": element.resource.id, "type": element.resource.slug})
        }

        if(!!req.params.id && req.params.id == element.resource.id){
            console.log(2);
            response.push({"id": element.resource.id, "type": element.resource.slug})
        }

        if(!!req.body.type && req.body.type == element.resource.slug){
            console.log(3);
            response.push({"id": element.resource.id, "type": element.resource.slug})
        }
    });

    res.send(prettyJSON(response, Date.now() - begin_date));
});

app.get("/api/breeds", (req, res) =>{
    res.send("ola");
});

function prettyJSON(response, responseTime){
    return {
        "response": response,
        "res_size": response.length,
        "res_time": responseTime + "ms"
    }
}

updtDt.updateData();
setInterval(updtDt.updateData, 399900099); //runs every 4 ⅗ days 

app.listen(PORT, console.log(`Server running at port ${PORT}...`));