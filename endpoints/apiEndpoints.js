require("dotenv").config();

module.exports = function (app, db) {
    const serverFunctions = require("../serverFunctions")(db);
    const prettyfyJSON = serverFunctions.prettyfyJSON;
    const {authenticateToken, authenticateApiKey} = require("./authEndpoints")(app, db);

    app.use("/api", (req, res, next) => {
        Object.entries(req.body).map((element) => {
            //Trims the body values. Ex. Limit 10_
            if(typeof(element[1] == "string")){
                req.body[element[0]] = element[1].trim()
            }
        });
        
        if (req.method != "GET") {
            authenticateToken(req, res, next);
        } else {
            authenticateApiKey(req,res,next);
            db.query("INSERT INTO `USER_LOG`(`USER_ID`, `DATE`) VALUES (7,now())")
        }
    })

    //TODO:  Upgrade the breed and type search

    app.get("/api/breeds/:id?", (req, res) => {
        let sqlquery = "SELECT b.id , b.breed , t.type FROM ANIMAL_BREED b inner join ANIMAL_TYPE t on t.id = b.type where ";
        let values = []

        if (req.params.id) {
            sqlquery += `b.id = ? and `;
            values.push(req.params.id)
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

            //after query gets returned, filter results based on type
            if(req.body.type){
                let filter = req.body.type.toUpperCase();
                results = results
                .filter((result) => {
                    return result.type.toUpperCase().indexOf(filter) > -1
                })
                .map(x => x);
            }

            //after query gets returned, filter results based on breed
            if(req.body.breed){
                let filter = req.body.breed.toUpperCase();

                results = results
                .filter((result) => {
                    return result.breed.toUpperCase().indexOf(filter) > -1
                })
                .map(x => x);
            }

            res.send(prettyfyJSON({ response: results, requestDate: req.requestDate }));
        });

    });

    app.get("/api/types/:id?", (req, res) => {
        let sqlquery = "SELECT id , type FROM ANIMAL_TYPE where ";
        let values = []

        if (req.params.id) {
            sqlquery += `id = ? and `
            values.push(req.params.id)
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

            //after query gets returned, filter results based on type
            if(req.body.type){
                let filter = req.body.type.toUpperCase();

                results = results
                .filter((result) => {
                    return result.type.toUpperCase().indexOf(filter) > -1
                })
                .map(x => x);
            }

            res.send(prettyfyJSON({ response: results, requestDate: req.requestDate }));
        });
    });

    app.get("/lastDataUpdate", async (req, res) => {
        let results = await serverFunctions.getLastTimeDataChanged()
        return res.send(prettyfyJSON({ "response": await results[0].DATE }))
    });

}
