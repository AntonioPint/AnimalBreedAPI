const express = require("express");
const fs = require("fs");
require("dotenv").config();
const PORT = process.env.PORT || 8080;
const jwt = require('jsonwebtoken');
const mysql = require('mysql');
const { STRING } = require("mysql/lib/protocol/constants/types");
let updtDt = require("./updatedata");
let app = express();
app.use(express.static(__dirname + '/public'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//database
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD
});

db.connect((err)=>{
    if(err) throw err;
    console.log("Connected to the database")
});

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

app.use("/api", (req, res, next) => {
    if(!!req.headers.api_key || !!req.headers.API_KEY){
        authenticateApiKey(req, res, next);
    }else if(!!req.headers.authorization_token){
        //not for production yet
        //authenticateToken(req, res, next);
    }else{
        res.status(500).json("No API_KEY or authorization_token received")
    } 
})

app.get("/api/breeds/:id?", (req, res) => {
    let sqlquery = "SELECT b.id , b.breed , t.type FROM ANIMAL_BREED b inner join ANIMAL_TYPE t on t.id = b.type where " ;
    let begin_date = Date.now();
    
    if(req.params.id) sqlquery += `b.id = '${req.params.id}' and `
    if(req.body.breed) sqlquery += `b.breed = '${req.body.breed}' and `
    if(req.body.type) sqlquery += `t.type = '${req.body.type}' and `
    sqlquery += "1 "; // to finish the and in the final

    if(req.body.orderBy && (req.body.orderBy.toUpperCase() == "BREED" || req.body.orderBy.toUpperCase() == "TYPE" || req.body.orderBy.toUpperCase() == "ID") ) {
        sqlquery += `order by ${req.body.orderBy} `
        if(req.body.orderDirection && (req.body.orderDirection.toUpperCase() == "DESC" || req.body.orderDirection.toUpperCase() == "ASC")) sqlquery += `${req.body.orderDirection} `
    }

    if(req.body.limit){
        sqlquery += `limit ${req.body.limit} `
        if(req.body.page > 0) sqlquery += `offset ${(req.body.page - 1) * req.body.limit } `
    }

    db.query(sqlquery, (err, results) => {
        if (err) throw err;
        res.send(prettyJSON(results, Date.now() - begin_date));
    });
    
});

app.get("/api/types/:id?", (req, res) => {
    let sqlquery = "SELECT id , type FROM ANIMAL_TYPE where " ;
    let begin_date = Date.now();
    
    if(req.params.id) sqlquery += `id = '${req.params.id}' and `
    if(req.body.type) sqlquery += `type = '${req.body.type}' and `
    sqlquery += "1 "; // to finish the and in the final
    
    if(req.body.orderBy && (req.body.orderBy.toUpperCase() == "TYPE" || req.body.orderBy.toUpperCase() == "ID") ) {
        sqlquery += `order by ${req.body.orderBy} `
        if(req.body.orderDirection && (req.body.orderDirection.toUpperCase() == "DESC" || req.body.orderDirection.toUpperCase() == "ASC")) sqlquery += `${req.body.orderDirection} `
    }

    if(req.body.limit){
        sqlquery += `limit ${req.body.limit} `
        if(req.body.page > 0) sqlquery += `offset ${(req.body.page - 1) * req.body.limit } `
    }


    db.query(sqlquery, (err, results) => {
        if (err) throw err;
        res.send(prettyJSON(results, Date.now() - begin_date));
    });
});

function authenticateApiKey(req, res, next){
    //API_KEY
    let api_key = req.headers.api_key || req.headers.API_KEY;
    if(!!api_key && process.env.API_KEY == api_key){
        next();
    }else{
        return res.status(500).send("Access Denied - Invalid API_KEY received")
    }
}

function authenticateToken(req,res,next){
    const authtoken = req.headers.authorization_token;
    if(authtoken != null) return res.sendStatus(401)
    jwt.verify(authtoken, process.env.APP_TOKEN, (err, decoded) =>{
        if(err) return res.sendStatus(403)
        req.user = decoded.name;
        next();
    });
}

function prettyJSON(response, responseTime) {
    return {
        "response": response,
        "res_size": response.length,
        "res_time": responseTime + "ms"
    }
}

updtDt.updateData(db);
setInterval(()=>{updtDt.updateData(db)} , 399900099 ); //runs every 4 ⅗ days  

app.listen(PORT, console.log(`Server running at port ${PORT} ...`));