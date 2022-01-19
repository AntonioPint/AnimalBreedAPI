const mysql = require('mysql');
const express = require("express");
const jwt = require('jsonwebtoken');
const updtDt = require("./updatedata");
const PORT = process.env.PORT || 8080;
require("dotenv").config();

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

db.connect((err) => {
    if (err) throw err;
    console.log("Connected to the database")
});

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

app.use("/api", (req, res, next) => {
    if (!!req.headers.api_key || !!req.headers.API_KEY) {
        authenticateApiKey(req, res, next);
    } else if (!!req.headers.authorization_token) {
        //not for production yet
        //authenticateToken(req, res, next);
    } else {
        res.status(500).json("No API_KEY or authorization_token received")
    }
})

app.get("/api/breeds/:id?", (req, res) => {
    let sqlquery = "SELECT b.id , b.breed , t.type FROM ANIMAL_BREED b inner join ANIMAL_TYPE t on t.id = b.type where ";
    let begin_date = Date.now();

    //FIXME: SQL Injection 
    //10'; drop table ANIMAL_BREED; select * from ANIMAL_TYPE where type = 'ola

    let values = []

    if (req.params.id){
        sqlquery += `b.id = ? and `;
        values.push(req.params.id)
    } 
    if (req.body.breed){
        sqlquery += `b.breed = ? and `
        values.push(req.body.breed)
    } 
    if (req.body.type){
        sqlquery += `t.type = ? and `
        values.push(req.body.type)
    } 
    sqlquery += "1 "; // to finish the "and" in the final

    if (req.body.orderBy && (req.body.orderBy.toUpperCase() == "BREED" || req.body.orderBy.toUpperCase() == "TYPE" || req.body.orderBy.toUpperCase() == "ID")) {
        sqlquery += `order by ? `
        values.push(req.body.orderBy)
        if (req.body.orderDirection && (req.body.orderDirection.toUpperCase() == "DESC" || req.body.orderDirection.toUpperCase() == "ASC")){
            sqlquery += `? `
            values.push(req.body.orderDirection)
        } 
    }

    if (req.body.limit > 0) {
        sqlquery += `limit ? `
        values.push(req.body.limit)
        if (req.body.page > 0){
            let offset = (req.body.page - 1) * req.body.limit
            sqlquery += `offset ? `
            values.push(offset)
        } 
    }

    db.query(sqlquery, values, (err, results) => {
        if (err) throw err;
        console.log(sqlquery)
        res.send(prettyJSON(results, Date.now() - begin_date));
    });

});

app.get("/api/types/:id?", (req, res) => {
    let sqlquery = "SELECT id , type FROM ANIMAL_TYPE where ";
    let begin_date = Date.now();
    let values = []
    if (req.params.id){
        sqlquery += `id = ? and `
        values.push(req.params.id)
    } 
    if (req.body.type){
        sqlquery += `type = ? and `
        values.push(req.body.type)
    } 
    sqlquery += "1 "; // to finish the "and" in the final

    if (req.body.orderBy && ( req.body.orderBy.toUpperCase() == "TYPE" || req.body.orderBy.toUpperCase() == "ID")) {
        sqlquery += `order by ? `
        values.push(req.body.orderBy)
        if (req.body.orderDirection && (req.body.orderDirection.toUpperCase() == "DESC" || req.body.orderDirection.toUpperCase() == "ASC")){
            sqlquery += `? `
            values.push(req.body.orderDirection)
        } 
    }

    if (req.body.limit > 0) {
        sqlquery += `limit ? `
        values.push(req.body.limit)
        if (req.body.page > 0){
            let offset = (req.body.page - 1) * req.body.limit
            sqlquery += `offset ? `
            values.push(offset)
        } 
    }

    db.query(sqlquery, values, (err, results) => {
        if (err) throw err;
        res.send(prettyJSON(results, Date.now() - begin_date));
    });
});

app.post("/login",(req,res) =>{
    let name = req.body.name;
    let password = req.body.password;
    // if(name == "1234" && password == "1234"){
    //     const token = jwt.sign({name, password}, process.env.APP_TOKEN, {expiresIn: 1800});
    //     return res.json({auth: true, token: token});
    // }
    res.status(500).json({auth: false, message: "Invalid Login"});
});

function authenticateApiKey(req, res, next) {
    //API_KEY
    let api_key = req.headers.api_key || req.headers.API_KEY;
    if (!!api_key && process.env.API_KEY == api_key) {
        next();
    } else {
        return res.status(500).send("Access Denied - Invalid API_KEY received")
    }
}

function authenticateToken(req, res, next) {
    const authtoken = req.headers.authorization_token;
    if (authtoken != null) return res.sendStatus(401)
    jwt.verify(authtoken, process.env.APP_TOKEN, (err, decoded) => {
        if (err) return res.sendStatus(403)
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
//setInterval(() => { updtDt.updateData(db) }, 399900099); //runs every 4 ⅗ days  

app.listen(PORT, console.log(`Server running at port ${PORT} ...`));