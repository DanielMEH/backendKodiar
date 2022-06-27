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
const { body,  validationResult  } = require("express-validator")
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
app.post("/producto",[
  body("codeProduct","Ingresa el codigo del producto")
  .exists()
  .isLength({min: 1}),
  body("name","El nombre debe ser obligatorio")
  .exists()
  .isLength({min: 1}),
  body("unidades","debes ingresar el numero de unidades")
  .exists()
  .isLength({min: 1}),
  body("precioCompra", "Ingresa el precio de compra")
  .exists()
  .isLength({min: 1}),
  body("precioVenta", "Ingresa el precio de venta")
  .exists()
  .isLength({min: 1}),
  body("fechaVencimiento", "Ingresa la fecha de vencimiento")
  .exists()
  .isLength({min: 1}),
  body("id_categoria", "Debes elegir en que categoria se va a guardar el producto")
  .exists()
  .isLength({min: 1}),

],(req,res)=>{
  
  const errorProductDate = validationResult(req)
  if (!errorProductDate.isEmpty()) {
    
    const valores = req.body;
    const productError = errorProductDate.array()
    
      return res.render("Errors",{productError:productError})

  } else {
    
    session = req.session;
    const {codeProduct,name,unidades,
      precioCompra,precioVenta,fechaVencimiento,mensaje,id_categoria} = req.body;
   
  
    db.run(`INSERT INTO producto(id,namep,unidades,
      precioc,preciov,fechaven,descripcion,id_categoria,idUsuario) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,[
        codeProduct,name,unidades,
        precioCompra,precioVenta,fechaVencimiento,mensaje,id_categoria,session.userid],(error,rows)=>{
        if (error.code == "SQLITE_CONSTRAINT") {
          console.log("Se produjo un error",error);

         return res.send("<script>alert('Hubo un error al guardar el producto'); window.location = '/producto'</script>")
          
        }else{

          return res.send("<script>alert('Producto registrado exitosamente'); window.location = '/producto'</script>")
        }

        
      })
  }
})

//RUTA DE QUIENES SOMOS
app.get("/nosotros" , (req,res)=>{
  res.render("somos")
})


app.post("/register",[
  body('nombre', 'El nombre no es valido asegurate de que no tenga caracteres especiales y no este vacio')
      .exists()
      .isLength({min:5}),
  body('documento', 'El documento no es valido asegurate de que tenga mas de 10 numeros y no este vacio')
      .exists()
      .isLength({min:8}),
  body('correo', 'El correo no es valido asegurate de que no este vacio y este bien escrito')
      .exists()
      .isEmail(),
  body('password', 'la contraseña no es valida')
      .exists()
      .isLength({min:5})
],(req,res)=>{

  const errors = validationResult(req)
  if(!errors.isEmpty()){
    
    const valores = req.body;
    const validacion = errors.array()
    return res.render("registro",{validacion:validacion, valores:valores})
  }else{ 
    let documento = req.body.documento
    let nombre= req.body.nombre
    let correo = req.body.correo
    let password = req.body.password
   const saltRounds = 10;
   const encriptar =  bcrypt.genSaltSync(saltRounds);
   const hash = bcrypt.hashSync(password, encriptar);
    db.run(`INSERT INTO usuario(documento,nombre,correo,password) VALUES(?, ?, ?, ?)`,
    [documento,nombre,correo,hash], async(error, rows)=>{

      if (!error) {
        console.log("datos insertados")
        return res.redirect("/login")
      }else{

        if( error.code == 'SQLITE_CONSTRAINT'){
          return res.send("<script>alert('Este usuario ya existe'); window.location = '/registro'</script>")
  
        }
      }
      
       

     

      // const transporter = nodemailer.createTransport({
      //   host: 'smtp.gmail.com',
      //   port: 587,
      //   auth: {
      //       user: 'kodiarenterprese@gmail.com',
      //       pass: 'xbpuhsbnccyfspgk'
      //   }
      // });
      
      // // send email
      // await  transporter.sendMail({
      //   from: 'kodiarenterprese@gmail.com',
      //   to: correo,
      //   subject: 'Test Email Subject',
      //   html: 'hola bienbenido',
      // }).then((res) =>{
      //   console.log(res)
      // }).catch((err) =>{console.log("Error",err)});

      })
    }
  
})

console.log(db)
app.post('/login',(req,res) =>{

  const{ correo, password} =req.body;
  db.get("SELECT password FROM usuario WHERE correo=$correo",{
   $correo:correo  
  }, (error, rows)=>{
    if(error){
      res.send("<script>alert('El correo o contraseña no existe') window.location = '/login' </script>")
    } 
    
    if(rows){

      const passDB = rows.password
    if (bcrypt.compareSync(password, passDB)){
         session = req.session;
         session.userid = correo;
         

     return res.redirect("/dasboard")
    }
   
    }

    res.send("<script>alert('El correo o contraseña no existe'); window.location = '/login' </script>")
    


  })

})

app.post("/categoria", [

  body("nombre", "El campo no puede estar vacio")
  .exists()
  .isLength({min:4})
], (req,res) =>{
  
  const errorCategoria = validationResult(req)
  if (!errorCategoria.isEmpty()) {
    
    const valores = req.body;
    const validacion = errorCategoria.array()
    return res.render("ErrorCategoria",{validacion:validacion, valores:valores})
   
    
  }else{

    session = req.session;
    const {nombre, imagen} = req.body;
  
    db.run(`INSERT INTO categoria(nombre,imagen,idusuario) VALUES (?, ?, ?)`,
    [nombre, imagen,session.userid],(error,rows)=>{
      if (error) {
        return  res.send("error")
       
      }else{
        
        res.send("<script>alert('Categoria registrada exitosamente'); window.location = '/categoria'</script>")
      }
  
    })
  }
  

})

app.get("ErrorCategoria.ejs",(req,res)=>{

  res.render("ErrorCategoria")
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

app.get("/contactanos",(req,res)=>{

  res.render("contactanos")
})
app.get("/ayuda",(req,res)=>{

  res.render("ayuda")
})
app.get("/error",(req,res)=>{

  res.render("Errors")
})
app.listen(port, (req,res) => {
     console.log("Listening on port",port)
})
