const express = require("express");
const bodyParser = require('body-parser')
const sqlite3 = require("sqlite3")
const path = require("path")
const nodemailer = require("nodemailer")
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
     let nombre= req.body.nombre
     let correo = req.body.correo
     let password = req.body.password
     let telefono = req.body.telefono
     let descripcion = req.body.descripcion
     let avatar = req.body.avatar
    console.log(documento,nombre,correo,password)

      db.run(`INSERT INTO usuario(documento,nombre,correo,password) VALUES(?, ?, ?, ?)`,
      [documento,nombre,correo,password], async(error, rows)=>{
        if(error){
          console.log("data save",error)
          
        }
        const transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 587,
          auth: {
              user: 'kodiarEnterpres@gmail.com',
              pass: 'nqcmsukadpvctxhs'
          }
        });
        
        // send email
        await  transporter.sendMail({
          from: 'kodiarEnterpres@gmail.com',
          to: 'angaritagerman@hotmail.com',
          subject: 'Test Email Subject',
          html: '<h1 style="color: red;">hola profe SOY KODIAR</h1> <img src="https://3con14.biz/js">'
        }).then((res) =>{
          console.log(res)
        }).catch((err) =>{console.log(err)});
    
  
       res.redirect("/login")
          

        })
})

console.log(db)

app.get("/dasboard",(req,res)=>{

  res.render("dasboard")

})
app.get('/inventario', (req, res) => {
  res.render('inventario');
})
app.get('/registro', (req, res) => {
  res.render('registro');
})


app.listen(port, (req,res) => {
     console.log("Listening on port",port)
})
