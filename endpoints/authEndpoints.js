const crypto = require('crypto');
const jwt = require('jsonwebtoken');


module.exports = function (app,db){
    const {prettyfyJSON} = require("../serverFunctions")(db)

    app.get("/login", (req, res) => {
        res.send(prettyfyJSON({error: "Did you mean to do that endpoint with POST instead of GET?"}))
    });

    app.post("/login", (req, res) => {
        let name = req.body.name;
        let password = req.body.password;
    
        if (!name) {
            return res.send(prettyfyJSON({ error: "Username is mandatory" }));
        }
        if (!password) {
            return res.send(prettyfyJSON({ error: "Password is mandatory" }));
        }
        password = hash(password);

        db.query("select ID from USER where NAME = ? and PASSWORD = ?", [name, password], (err, results) => {
            if (results.length > 0) {
                const token = jwt.sign({ name, password }, process.env.APP_SECRET, { expiresIn: 20 * 60 }); //20 minutes
                return res.json({ auth: true, token: token });
            }
            res.status(500).json({ auth: false, message: "Invalid Login" });
        });
    });

    app.get("/register", (req, res) => {
        res.send(prettyfyJSON({error: "Did you mean to do that endpoint with POST instead of GET?"}))
    });
    
    app.post("/register", (req, res) => {
        let name = req.body.name;
        let password = req.body.password;
    
        if (!name) {
            return res.send(prettyfyJSON({ error: "Username is mandatory" }));
        }
        if (!password) {
            return res.send(prettyfyJSON({ error: "Password is mandatory" }));
        }
        password = hash(password)
    
        db.query("select ID from USER where NAME = ?", name, (err, results) => {
            if (results.length > 0) {
                return res.send(prettyfyJSON({ error: "There is already an account with that Username" }));
            }
            db.query("insert into USER(NAME, PASSWORD) values(?,?)", [name, password], (err, results) => {
                res.send(prettyfyJSON({ response: "You have sucessfully registered" }))
            });
        });
    });

    function authenticateToken(req, res, next) {
        const authtoken = req.headers["x-access-token"];
        if (!authtoken) return res.status(401).send(prettyfyJSON({ error: "No authentication Provided" }));
        jwt.verify(authtoken, process.env.APP_SECRET, (err, decoded) => {
            if (err) return res.status(403).send(prettyfyJSON({ error: "Access Denied - Invalid token received" }));
            req.user = { name: decoded.name, password: decoded.password };
            next();
        });
    }

    function authenticateApiKey(req, res, next){
        let api_key_received = req.headers["API_KEY"] ? req.headers["API_KEY"] : req.headers["api_key"];
        return api_key_received == process.env.API_KEY ? next() : res.status(403).send(prettyfyJSON({ error: "Access Denied - Invalid token received" }));
    }
    
    function hash(text) {
        return crypto.createHash('sha512').update(text).digest('hex');
    }

    return {
        authenticateToken: authenticateToken,
        authenticateApiKey: authenticateApiKey
    }
}

