const express = require("express");
const app = express()
const port = 3000;
const sqlite3 = require("sqlite3")
const bodyParser = require('body-parser')
const db = new sqlite3.Database("./db/users.db")


// ? Settigs

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.set("view engine","pug")

app.get("/",(req,res)=>{
     db.all("SELECT * FROM usuarios", (error, rows) => {
          rows.forEach((row) => {
            console.log(row.name);
            console.log(row.correo);
            console.log(row.password);
          })
     
      })
      res.render("register")

     

})

app.post("/register",(req,res)=>{
     let documento = req.body.documento
     let name= req.body.name
     let correo = req.body.correo
     let password = req.body.password
     let telefono = req.body.telefono
     let descripcion = req.body.descripcion
     let avatar = req.body.avatar
     db.run(`INSERT INTO usuarios(documento,name,correo,password,telefono,descripcion,avatar) VALUES(?, ?, ?, ?, ?, ?, ?)`, 
     [documento,name,correo,password,telefono,descripcion,avatar],
     (error,row)=>{
       if (!error){
 
           console.log("Los datos se registraron con exito",row);
           res.send(row)
      
         }else{
           console.log("Los datos no se guardaron",error);
         }
     })

})
console.log(db)
// ? Listening Server3
app.listen(port, (req,res) => {
     console.log("Listening on port",port)
})
