const crypto = require('crypto');
const jwt = require('jsonwebtoken');
require("dotenv").config();

module.exports = function (app,db){
    
    app.get("/", (req, res) => {
        res.sendFile(__dirname + "/index.html");
    });
    
    app.use("/api", (req, res, next) => {
        console.log("Im here")
        if(req.method != "GET"){
            console.log("Im here1")
            authenticateToken(req, res, next);
        }else{
            console.log("Im here2")
            next()
        }   
    })
    
    app.post("/api/aaa", (req, res) =>{
        res.send("hey tenisha");
    });
    
    app.get("/api/breeds/:id?", (req, res) => {
        let sqlquery = "SELECT b.id , b.breed , t.type FROM ANIMAL_BREED b inner join ANIMAL_TYPE t on t.id = b.type where ";
        let begin_date = Date.now();
    
        let values = []
    
        if (req.params.id) {
            sqlquery += `b.id = ? and `;
            values.push(req.params.id)
        }
        if (req.body.breed) {
            sqlquery += `b.breed = ? and `
            values.push(req.body.breed)
        }
        if (req.body.type) {
            sqlquery += `t.type = ? and `
            values.push(req.body.type)
        }
        sqlquery += "1 "; // to finish the "and" in the final
    
        let orderBy = !!req.body.orderBy ? req.body.orderBy.toLowerCase() : "id"
        if (orderBy == "breed" || orderBy == "type" || orderBy == "id") {
            sqlquery += `order by ${orderBy} `
    
            let orderDirection = !!req.body.orderDirection ? req.body.orderDirection.toLowerCase() : "asc"
            if (orderDirection == "desc" || orderDirection == "asc") {
                sqlquery += `${orderDirection} `
            }
        }
    
        if (req.body.limit > 0) {
            sqlquery += `limit ${req.body.limit} `
            if (req.body.page > 0) {
                let offset = (req.body.page - 1) * req.body.limit
                sqlquery += `offset ${offset} `
            }
        }
    
        db.query(sqlquery, values, (err, results) => {
            if (err) throw err;
            res.send(prettyfyJSON({ response: results, responseTime: Date.now() - begin_date }));
        });
    
    });
    
    app.get("/api/types/:id?", (req, res) => {
        let sqlquery = "SELECT id , type FROM ANIMAL_TYPE where ";
        let begin_date = Date.now();
        let values = []
    
        if (req.params.id) {
            sqlquery += `id = ? and `
            values.push(req.params.id)
        }
        if (req.body.type) {
            sqlquery += `type = ? and `
            values.push(req.body.type)
        }
        sqlquery += "1 "; // to finish the "and" in the final
    
        let orderBy = !!req.body.orderBy ? req.body.orderBy.toLowerCase() : "id"
        if (orderBy == "type" || orderBy == "id") {
            sqlquery += `order by ${orderBy} `
            let orderDirection = !!req.body.orderDirection ? req.body.orderDirection.toLowerCase() : "asc"
            if (orderDirection == "desc" || orderDirection == "asc") {
                sqlquery += `${orderDirection} `
            }
        }
    
        if (req.body.limit > 0) {
            sqlquery += `limit ${req.body.limit} `
            if (req.body.page > 0) {
                let offset = (req.body.page - 1) * req.body.limit
                sqlquery += `offset ${offset} `
            }
        }
    
        db.query(sqlquery, values, (err, results) => {
            if (err) throw err;
            res.send(prettyfyJSON({ response: results, responseTime: Date.now() - begin_date }));
        });
    });
    
    //TODO: add a better search functionality
    
    app.get("/lastDataUpdate", (req, res) => {
        db.query("SELECT DATE from DATABASE_LOG where ACTION = 'INSERT' or ACTION = 'UPDATE' or ACTION = 'DELETE' order by date desc limit 1", (err, results) => {
            return res.send(prettyfyJSON({ "response": results[0].DATE }))
        });
    });
    app.get("/login", (req, res) => {
        res.send(prettyfyJSON({error: "Did you mean to do that endpoint with POST instead of GET?"}))
    });
    app.post("/login", (req, res) => {
        let name = req.body.name;
        let password = hash("" + req.body.password);
        db.query("select ID from USER where NAME = ? and PASSWORD = ?", [name, password], (err, results) => {
            if (results.length > 0) {
                const token = jwt.sign({ name, password }, process.env.APP_SECRET, { expiresIn: 20 * 60 }); //20 minutes
                return res.json({ auth: true, token: token });
            }
            res.status(500).json({ auth: false, message: "Invalid Login" });
        });
    });
    
    app.post("/register", (req, res) => {
        let name = req.body.name;
        let password = hash(req.body.password);
    
        if (!name) {
            return res.send(prettyfyJSON({ error: "Username is mandatory" }));
        }
        if (!password) {
            return res.send(prettyfyJSON({ error: "Password is mandatory" }));
        }
    
        db.query("select ID from USER where NAME = ?", name, (err, results) => {
            if (results.length > 0) {
                return res.send(prettyfyJSON({ error: "There is already an account with that Username" }));
            }
            db.query("insert into USER(NAME, PASSWORD) values(?,?)", [name, password], (err, results) => {
                res.send(prettyfyJSON({ response: "You have sucessfully registered" }))
            });
        });
    });
}

function authenticateToken(req, res, next) {
    const authtoken = req.headers["x-access-token"];
    if (!authtoken) return res.status(401).send(prettyfyJSON({ error: "No authentication Provided" }));
    jwt.verify(authtoken, process.env.APP_SECRET, (err, decoded) => {
        if (err) return res.status(403).send(prettyfyJSON({ error: "Access Denied - Invalid token received" }));
        req.user = { name: decoded.name, password: decoded.password };
        next();
    });
}

function hash(text) {
    return crypto.createHash('sha512').update(text).digest('hex');
}

function prettyfyJSON(obj) {
    if (obj.response) {
        return {
            "response": obj.response,
            "res_size": obj.response ? obj.response.length : 0,
            "res_time": obj.responseTime ? obj.responseTime + "ms" : 0 + "ms",
        }
    } else {
        return {
            "error": obj.error
        }
    }
}