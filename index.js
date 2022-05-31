const express = require("express");
const path = require("path");
const app = express()
const port = 3000;
const sqlite3 = require("sqlite3")
const db = new sqlite3.Database("./db/users.db")

// ? Settigs

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(express.static(path.join(__dirname, "/public")))

app.set("view engine","pug")

app.get("/",(req,res)=>{

     res.render("register")

})

console.log(db)
// ? Listening Server3
app.listen(port, (req,res) => {
     console.log("Listening on port",port)
})
