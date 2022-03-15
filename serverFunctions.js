const fs = require("fs");
const axios = require("axios");
const yummybreedsUrl = "https://api.yummypets.com/breeds";
const yummytypesUrl = "https://api.yummypets.com/pets/types";

module.exports = (db) => {

    function executeQueryAsync(mysqlQuery, values) {
        return new Promise((resolve, reject) => {
            db.query(mysqlQuery, values, (error, results) => {
                if (error) {
                    return reject(error);
                }
                return resolve(results);
            });
        });
    }

    function prettyfyJSON(obj) {
        let responseObj = {}

        if (obj.response) {
            responseObj.response = obj.response
            responseObj.res_time = obj.responseTime ? obj.responseTime + "ms" : null

            if (Array.isArray(obj.response)) {
                responseObj.res_size = obj.response ? obj.response.length : 0
            }

        } else {
            responseObj.error = obj.error
        }

        return responseObj
    }

    function updateData() {
        db.query(`Insert into DATABASE_LOG(ACTION, DESCRIPTION , DATE , USER_ID) values('CHECK', 'Checked for new data', now(), 1)`);
        // Update Types from yummy api
        let sizeTypes;
        db.query(`select count(*) from ANIMAL_TYPE `, (err, results) => {
            if (err) throw err;
            sizeTypes = results[0]["count(*)"]
        });

        axios(yummytypesUrl).then((res) => {
            try { // api.yummipets could be not available
                if (res.data.collection.length > sizeTypes) { //new data to be added
                    res.data.collection.forEach(element => {
                        db.query(`select count(*) from ANIMAL_TYPE where ID = ${element.resource.id} `, (err, results) => {
                            if (err) throw err;
                            if (results[0]["count(*)"] == 0) {
                                db.query(`INSERT INTO ANIMAL_TYPE (ID, TYPE) VALUES ("${element.resource.id}", "${element.resource.slug}"); `, (err, results) => {
                                    if (err) throw err;
                                    //TODO: add trigger
                                    db.query(`Insert into DATABASE_LOG(ACTION, DESCRIPTION , DATE , USER_ID) values('INSERT', 'Added new ANIMAL_TYPE', now(), 1)`);
                                });
                            }
                        });
                    });
                }
            } catch (err) {
                fs.appendFileSync("data/logs.txt", `An error ocurred accessing data from yummipets' API at ${new Date(Date.now()).toUTCString()}. ${err}\n`)
            }
        });

        // Update Breeds from yummy api
        let sizeBreeds;
        db.query(`select count(*) from ANIMAL_BREED `, (err, results) => {
            if (err) throw err;
            sizeBreeds = results[0]["count(*)"]
        });

        axios(yummybreedsUrl).then((res) => {
            try { // api.yummipets could be not available
                if (res.data.extras.num_found > sizeBreeds) { //new data to be added
                    res.data.collection.forEach(element => {
                        db.query(`select count(*) from ANIMAL_BREED where ID = ${element.resource.id} `, (err, results) => {
                            if (err) throw err;
                            if (results[0]["count(*)"] == 0) {
                                db.query(`INSERT INTO ANIMAL_BREED (ID, BREED, TYPE) VALUES ("${element.resource.id}", "${element.resource.lib}", "${element.resource.type.id}"); `, (err, results) => {
                                    if (err) throw err;
                                    //TODO: add trigger
                                    db.query(`Insert into DATABASE_LOG(ACTION, DESCRIPTION , DATE , USER_ID) values('INSERT', 'Added new ANIMAL_BREED', now(), 1)`);
                                });
                            }
                        });
                    });
                }
            } catch (err) {
                fs.appendFileSync("data/logs.txt", `An error ocurred accessing data from yummipets' API at ${new Date(Date.now()).toUTCString()}. ${err}\n`)
            }
        });
    }

    async function getLastTimeDataChanged() {
        let date = await executeQueryAsync("SELECT DATE from DATABASE_LOG where ACTION = 'INSERT' or ACTION = 'UPDATE' or ACTION = 'DELETE' or ACTION = 'CHECK' order by date desc limit 1")
        return date[0] ? date : [{DATE:'1970-01-01T19:30:00.000Z'}]
    }

    return {
        prettyfyJSON: prettyfyJSON,
        updateData: updateData,
        getLastTimeDataChanged: getLastTimeDataChanged,
        executeQueryAsync: executeQueryAsync
    }
}


