const fs = require("fs");
const axios = require("axios");
const mysql = require('mysql');

let yummybreedsUrl = "https://api.yummypets.com/breeds";
let yummytypesUrl = "https://api.yummypets.com/pets/types";

function updateData(db, date) {
    date = new Date();
    console.log("Searching and updating database with new data");
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
                    db.query(`select * from ANIMAL_TYPE where ID = ${element.resource.id} `, (err, results) => {
                        if (err) throw err;
                        if (results.length == 0) {
                            db.query(`INSERT INTO ANIMAL_TYPE (ID, TYPE) VALUES ("${element.resource.id}", "${element.resource.slug}"); `, (err, results) => {
                                if (err) throw err;
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
                    db.query(`select * from ANIMAL_BREED where ID = ${element.resource.id} `, (err, results) => {
                        if (err) throw err;
                        if (results.length == 0) {
                            db.query(`INSERT INTO ANIMAL_BREED (ID, BREED, TYPE) VALUES ("${element.resource.id}", "${element.resource.lib}", "${element.resource.type.id}"); `, (err, results) => {
                                if (err) throw err;
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

module.exports.updateData = updateData;
