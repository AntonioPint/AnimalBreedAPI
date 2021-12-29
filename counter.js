const fs = require("fs");

module.exports.incrementCounter = function (){
    let counter = 0;
    try{
        counter = parseInt(fs.readFileSync("data/counter.txt","utf8"));
    }catch(err){
        fs.appendFileSync("data/counter.txt", "0");
        fs.appendFileSync("data/logs.txt", `An error ocurred writing to file breeds.json at ${new Date(Date.now()).toUTCString()}. ${err}\n`)
    }
    
    if(isNaN(counter)){
        counter = 0;
    }
    fs.writeFileSync("data/counter.txt", "" + ++counter);
}