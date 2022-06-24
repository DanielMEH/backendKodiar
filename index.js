const express = require("express");
const bodyParser = require('body-parser')
const sqlite3 = require("sqlite3")
const path = require("path")
const nodemailer = require("nodemailer")  
const bcrypt = require("bcrypt");
const { render } = require("ejs");
const { error, Console } = require("console");
const cookieParser = require("cookie-parser");
const sessions = require('express-session');
const app = express()
const port = 3000;
const db = new sqlite3.Database("./db/kodiar.db")
// ? Settigs
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.set("view engine","ejs")
app.set('views',path.join(__dirname,'views'))
app.use(express.static(path.join(__dirname, "/public")))
const timeEXp = 1000 * 60 * 60 * 24;
app.use(sessions({
  secret: "rfghf66a76ythggi87au7td",
  saveUninitialized:true,
  cookie: { maxAge: timeEXp },
  resave: false 
}));
app.use(cookieParser())
app.get("/dasboard",(req,res)=>{

  session = req.session;

  
  if (session.userid) {


    db.get("SELECT * FROM usuario WHERE correo =$correo",{
      $correo: session.userid
      
    },(err,rows)=>{
      
      if (err) {
        return  res.status(500).redirect("/")
      }

      
      return res.status(200).render("dasboard",{userUser: rows})
    })
  
   

  }else{

    
    res.redirect("/")
  }


});
app.get('/inventario', (req, res) => {

  session = req.session;

  if (session.userid) {
    
    db.all(`SELECT producto.namep, producto.unidades, producto.precioc, producto.preciov, producto.fechaven, producto.descripcion, producto.id_categoria,
     producto.idUsuario, producto.id, categoria.id_categoria, categoria.nombre, categoria.imagen FROM producto INNER JOIN categoria ON producto.id = categoria.id_categoria
     WHERE producto.idUsuario=$idemail`,{
      $idemail:session.userid
     },(error,rows)=>{
      if (error) {
        
        return res.status(501).send("hubo un error")
        
      }else{
        return res.status(200).render("inventario",{data:rows})
      }
    })

  
  }else{

    
   
  }
});


app.get("/",(req,res)=>{

  res.render("home")

})
app.get("/buscador",(req,res)=>{
  session = req.session;
  if (session.userid) {


    db.all("SELECT * FROM producto",(err,rows)=>{
      
      if (err) {
        return  res.status(500).redirect("/")
      }

      
      return res.json({ data: rows})
    })
  
   

  }else{

    
    res.redirect("/")
  }

})
app.get('/inventario', (req, res) => {

  session = req.session;

  if (session.userid) {

    res.render('inventario');

  }else{

    
    res.redirect("/")
  }
})
app.get('/registro', (req, res) => {
  res.render('registro');
})
app.get('/login', (req, res) => {
  res.render('login');
})
app.get("/producto", (req,res)=>{
  
  session = req.session;
 
  if (session.userid) {

    db.all(`SELECT * FROM  categoria WHERE idusuario =$email`,{
      $email:session.userid
    },(error, rows)=>{
     
      if(error){
        console.log(error)
        
        return res.send("Hubo un error al cargar los datos",error)
        
      }
      return res.render("product", {data:rows})
      
    })
    
  }else{

    
    res.redirect("/")
  }

})

app.get("/categoria",(req,res)=>{

  session = req.session;
  db.all(`SELECT * FROM categoria WHERE idusuario=$email`,{
    $email:session.userid
  },(error, rows)=>{
    
    res.render("categorias",{data:rows})
    
  })

})

app.get("/cuenta",(req,res)=>{

  res.render("cuenta")
})


// RUTAS PRODUCTO
app.post("/producto",(req,res)=>{
  session = req.session;
  
  console.log(req.body)
  const {codeProduct,name,unidades,
    precioCompra,precioVenta,fechaVencimiento,mensaje,id_categoria} = req.body;
  console.log(req.body)

  db.run(`INSERT INTO producto(id,namep,unidades,
    precioc,preciov,fechaven,descripcion,id_categoria,idUsuario) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,[
      codeProduct,name,unidades,
      precioCompra,precioVenta,fechaVencimiento,mensaje,id_categoria,session.userid],(error,rows)=>{
      if (error) {
        console.log("Se produjo un error",error);
       return res.json({messaje:"error al guardar los datos"})
        
      }
     return  res.redirect("/producto")
      
    })
})

//RUTA DE QUIENES SOMOS
app.get("/nosotros" , (req,res)=>{
  res.render("somos")
})


app.post("/register",(req,res)=>{
     let documento = req.body.documento
     let nombre= req.body.nombre
     let correo = req.body.correo
     let password = req.body.password
     const saltRounds = 10;
     const encriptar =  bcrypt.genSaltSync(saltRounds);
     const hash = bcrypt.hashSync(password, encriptar);
      db.run(`INSERT INTO usuario(documento,nombre,correo,password) VALUES(?, ?, ?, ?)`,
      [documento,nombre,correo,hash], async(error, rows)=>{
        if(error){
          console.log("se produjo un error al guardar sus datos",error)
        }

        const transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 587,
          auth: {
              user: 'kodiarenterprese@gmail.com',
              pass: 'xbpuhsbnccyfspgk'
          }
        });
        
        // send email
        await  transporter.sendMail({
          from: 'kodiarenterprese@gmail.com',
          to: correo,
          subject: 'Test Email Subject',
          html: 'hola bienbenido',
        }).then((res) =>{
          console.log(res)
        }).catch((err) =>{console.log("Error",err)});
    
  
       res.redirect("/login")
          

        })
})

console.log(db)
app.post('/login',(req,res) =>{

  const{ correo, password} =req.body;
  db.get("SELECT password FROM usuario WHERE correo=$correo",{
   $correo:correo  
  }, (error, rows)=>{
    if(error){
      res.send("Hubo un error")
    } 
    
    if(rows){

      const passDB = rows.password
    if (bcrypt.compareSync(password, passDB)){
         session = req.session;
         session.userid = correo;
         

     return res.redirect("/dasboard")
    }
    }

     return res.send("la contraseña o correo in correca")
    


  })

})

app.post("/categoria", (req,res) =>{
  session = req.session;
  
  const {nombre, imagen} = req.body;
  console.log(nombre, imagen)
  
  db.run(`INSERT INTO categoria(nombre,imagen,idusuario) VALUES (?, ?, ?)`,
  [nombre, imagen,session.userid],(error,rows)=>{
    if (error) {
       res.send("error")
      console.log("error",error)  
    }else{
      console.log("save data")
      res.redirect("/categoria")
    }

  })
  

})

app.get("/logout",(req,res)=>{

  session = req.session;
  if(session.userid){

    req.session.destroy();
    res.redirect("/")

  }else{

    res.redirect("/")
  }
})

app.listen(port, (req,res) => {
     console.log("Listening on port",port)
})
