const mysql = require('mysql');
const express = require("express");
require("dotenv").config();
const PORT = process.env.PORT || 8080;
const rateLimit = require('express-rate-limit')
const slowDown = require("express-slow-down");
const sout = require("./consoleColor");
const { lookup } = require('geoip-lite');

let app = express();
app.use(express.static(__dirname + '/public'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.enable("trust proxy");

//Express rate limit
app.use(rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
	max: 20, // Limit each IP to 20 requests per `window` (here, per 5 minutes)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
}));

//Express slow down
app.use(slowDown({
    windowMs: 5 * 60 * 1000, // 5 minutes
    delayAfter: 10, // allow 10 requests per 5 minutes, then...
    delayMs: 500 // begin adding 500ms of delay per request above 10:
}));

//database
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD
});

db.connect((err) => {
    if (err) {
        sout.me("Error:", { background: "red" }, " Couldn't connect to database: ", "Could be due to VPN", { colour: "green" })
    } else {
        sout.me("Connected", { bright: "yellow" }, " to the database")
    }
});

//Inicial Middleware
app.use("/", (req, res, next) =>{
    req.requestDate = new Date()
    db.query("INSERT INTO `USER_LOG`(`USER_ID`, `DATE`) VALUES (7,now())")
    next()
})

//Inicial page
app.get("/",  (req, res) => {
    res.sendFile(__dirname + "/index.html");
});


require("./endpoints/apiEndpoints")(app, db);
require("./endpoints/authEndpoints")(app, db);
const serverFunctions = require("./serverFunctions")(db);

function checkForNewDataFromAPI(){
    serverFunctions.getLastTimeDataChanged().then((response) => {
        let diffDays = parseInt((new Date() - new Date(response[0].DATE)) / (1000 * 60 * 60 * 24), 10); 
        if(diffDays >= 3){
            sout.me("Updating",{colour: "green"}," Data... ")
            serverFunctions.updateData()    
        }       
    });
}

//When server starts, searches for new information from API
checkForNewDataFromAPI()

//If the server does not restart, after 3 and a half days checks for new data
setInterval(checkForNewDataFromAPI, 3.5*24*60*60*1000)

app.listen(PORT, console.log(`Server running at port http://localhost:${PORT} ...`));