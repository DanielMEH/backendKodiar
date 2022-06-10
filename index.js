const express = require("express");
const bodyParser = require('body-parser')
const sqlite3 = require("sqlite3")
const path = require("path")
const nodemailer = require("nodemailer")
const bcrypt = require("bcrypt");
const { render } = require("ejs");
const { error } = require("console");
const app = express()
const port = 3000;
const db = new sqlite3.Database("./db/kodiar.db")


// ? Settigs
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.set("view engine","ejs")
app.set('views',path.join(__dirname,'views'))
app.use(express.static(path.join(__dirname, "/public")))

app.get("/dasboard",(req,res)=>{

  res.render("dasboard")

})
app.get('/inventario', (req, res) => {
  res.render('inventario');
})
app.get('/registro', (req, res) => {
  res.render('registro');
})
app.get('/', (req, res) => {
  res.render('login');
})
app.get("/producto",(req,res)=>{
  res.render("product")

})
app.get("/categoria",(req,res)=>{

  db.all("SELECT * FROM categoria",(error, rows)=>{
    
    res.render("categorias",{data:rows})
    
  })

})

app.get("/cuenta",(req,res)=>{

  res.render("cuenta")
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
    precio_compra,precio_venta,fecha_vencimiento,
    descripcion_producto,id_categoria],(error,rows)=>{
      if (error) {
        console.log("Se produjo un error",error);
        res.json({messaje:"error al guardar los datos"})
        
      }
      res.redirect("/product")
      
    })
})


app.post("/register",(req,res)=>{
     let documento = req.body.documento
     let nombre= req.body.nombre
     let correo = req.body.correo
     let password = req.body.password
     let telefono = req.body.telefono
     let descripcion = req.body.descripcion
     let avatar = req.body.avatar
     const saltRounds = 10;
     const encriptar =  bcrypt.genSaltSync(saltRounds);
     const hash = bcrypt.hashSync(password, encriptar);
     console.log("encriptado",hash)

      db.run(`INSERT INTO usuario(documento,nombre,correo,password) VALUES(?, ?, ?, ?)`,
      [documento,nombre,correo,hash], async(error, rows)=>{
        if(error){
          console.log("se produjo un error al guardar sus datos",error)
        }
         console.log("data save",rows)
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
app.post('/login', async(req,res) =>{

  const{ correo, password} =req.body;
  db.get("SELECT password FROM usuario WHERE correo=$correo",{
   $correo:correo  
  }, (error, rows)=>{

    if(error){
      return res.send("error",rows.correo)
    }
    if (rows) {
      const passDB = rows.password
      if (bcrypt.compareSync(password, passDB)){
       
        res.redirect("/dasboard")
  
      }
        return res.send("los datos no se guardaron")
  
      
    }
    return res.send("los datos no se guardaron")
  
  
    

  })

})

app.post("/categoria", (req,res) =>{
  const {nombre, imagen} = req.body;
  console.log(nombre, imagen)
  
  db.run(`INSERT INTO categoria(nombre,imagen) VALUES (?, ?)`,
  [nombre, imagen],(error,rows)=>{
    if (error) {
       res.send("error")
      console.log("error",error)  
    }else{
      console.log("save data")
      res.redirect("/categoria")
    }

  })
  

})


app.listen(port, (req,res) => {
     console.log("Listening on port",port)
})
