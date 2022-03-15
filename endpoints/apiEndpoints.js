require("dotenv").config();

module.exports = function (app, db) {
    const serverFunctions = require("../serverFunctions")(db);
    const prettyfyJSON = serverFunctions.prettyfyJSON;
    const {authenticateToken} = require("./authEndpoints")(app, db);

    app.use("/api", (req, res, next) => {
        if (req.method != "GET") {
            authenticateToken(req, res, next);
        } else {
            next();
        }
    })
    app.post("/api/aaa", (req, res)=>{
        res.send("ola")
    })

    //TODO:  Upgrade the breed and type search

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

    app.get("/lastDataUpdate", async (req, res) => {
        let results = await serverFunctions.getLastTimeDataChanged()
        return res.send(prettyfyJSON({ "response": await results[0].DATE }))
    });

}
