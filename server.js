const mysql = require('mysql');
const express = require("express");
require("dotenv").config();
const PORT = process.env.PORT || 8080;
const updtDt = require("./updatedata");
const fs = require("fs");
const sout = require("./consoleColor");

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
    if (err) {
        fs.appendFileSync("data/logs.txt", `An error ocurred while connecting to the main database at ${new Date(Date.now()).toUTCString()}. ${err}\n`)
        sout.me("Error:", { background: "red" }, " Couldn't connect to database: ", "Could be due to VPN", { colour: "green" })
    } else {
        sout.me("Connected", { bright: "yellow" }, " to the database")
    }
});

require("./endpoints")(app, db)

//updtDt.updateData(db);
// setInterval(() => { updtDt.updateData(db, lastTimeUpdatedInfo); }, 399900099); //runs every 4 ⅗ days  

app.listen(PORT, console.log(`Server running at port http://localhost:${PORT} ...`));