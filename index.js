const express = require("express");
const bodyParser = require('body-parser')
const sqlite3 = require("sqlite3")
const path = require("path")
const app = express()
const port = 3000;
const db = new sqlite3.Database("./db/kodiar.db")


// ? Settigs
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.set("view engine","ejs")
app.use(express.static(path.join(__dirname, "/public")))
app.get("/",(req,res)=>{
     db.all("SELECT * FROM usuario", (error, rows) => {
          rows.forEach((row) => {
            console.log(row.name);
            console.log(row.correo);
            console.log(row.password);
          })
     
      })
      res.render("login")

     

})

// RUTAS PRODUCTO
app.get("/product",(req,res)=>{
  db.get("SELECT * FROM producto" ,(error, rows)=>{
    rows.forEach((row)=> {
      console.log(row.id_producto);
      console.log(row.nombre_producto);
      console.log(row.unidades_producto);
      console.log(row.precio_compra);
      console.log(row.precio_venta);
      console.log(row.fecha_vencimiento);
      console.log(row.descripcion_producto);
      console.log(row.id_categoria);
    })
  })
  res.render("product")
})

app.post("/product",(req,res)=>{
  
  const {id_producto,nombre_producto,unidades_producto,
    precio_compra,precio_venta,fecha_vencimiento,descripcion_producto,id_categoria
  } = req.body

  db.run(`INSERT INTO producto(id_producto,nombre_producto,unidades_producto,
    precio_compra,precio_venta,fecha_vencimiento,descripcion_producto,id_categoria) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,[
      
    id_producto,nombre_producto,unidades_producto,
    precio_compra,precio_venta,fecha_vencimiento,descripcion_producto,id_categoria

    ])
})


app.post("/register",(req,res)=>{
     let documento = req.body.documento
     let name= req.body.name
     let correo = req.body.correo
     let password = req.body.password
     let telefono = req.body.telefono
     let descripcion = req.body.descripcion
     let avatar = req.body.avatar
     db.run(`INSERT INTO usuario(documento,name,correo,password,telefono,descripcion,avatar) VALUES(?, ?, ?, ?, ?, ?, ?)`, 
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

app.get("/dasboard",(req,res)=>{

  res.render("dasboard")

})
app.get('/inventario', (req, res) => {
  res.render('inventario');
})


app.listen(port, (req,res) => {
     console.log("Listening on port",port)
})
