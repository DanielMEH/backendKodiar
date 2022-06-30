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
const cors = require("cors");
const app = express()
const port = 3000;
const db = new sqlite3.Database("./db/kodiar.db")
// ? Settings
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.set("view engine","ejs")
app.set('views',path.join(__dirname,'views'))
app.use(express.static(path.join(__dirname, "/public")))
app.use(cors())
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
    
    db.all(`SELECT  * FROM producto
    WHERE producto.idUsuario=$idemail`,{
      $idemail:session.userid
     },(error,rows)=>{
      if (error) {
        
        return res.status(501).send("<script>alert('Hubo un error'); window.location = '/'</script>")
        
      }else{
        return res.status(200).render("inventario",{data:rows})
      }
    })

  
  }else{

    return res.status(501).send("<script>alert('No hay una cuenta iniciada'); window.location = '/login'</script>")

   
  }
});


app.get("/",(req,res)=>{

  res.render("home")

})
app.get("/buscador",(req,res)=>{
  session = req.session;
  if (session.userid) {


    db.all("SELECT * FROM producto WHERE idUsuario=$user",{
      $user: session.userid
    },(err,rows)=>{
      
      if (err) {
        return  res.status(500).redirect("/")
      }

      
      return res.json({"data":rows})
    })
  
   

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

    db.all(`SELECT * FROM  categoria  WHERE idusuario =$email`,{
      $email:session.userid
    },(error, rows)=>{
     
      if(error){
        console.log(error)
    
        return res.status(501).send("<script>alert('Hubo un error al cargar los datos'); window.location = '/'</script>")

        
      }
      return res.render("product", {data:rows})
      
    })
    
  }else{

    
    res.redirect("/")
  }

})

app.post("/compra/:id",(req,res)=>{

   const { id } = req.params;
  //  const {searchName,searchcode, cantidad, totalPagar, pagoTotal, cabioPagar} = req.body;
  //  console.log(searchName,parseInt(searchcode), parseInt(cantidad), parseInt(totalPagar), parseInt(pagoTotal), parseInt(cabioPagar) )
  
  
  db.get("SELECT * FROM producto WHERE id =$id",{
    $id:req.body.searchcode
    

  },(error,rows)=>{

   if (!error) {
    let unidad = req.body.cantidad;
    let conUnidad = parseInt(unidad)
    let rowUnidades = rows.unidades;

    let restarUnidad = rowUnidades - conUnidad
   

    if (rowUnidades < unidad) {
      return res.status(500).send("<script>alert('No hay suficienes unidades'); window.location = '/dasboard'</script>")
    }
    
    // db.run(`INSERT INTO RegistroCompra(nombre, precio,codigo, categoria, iduser, data) VALUES(?, ?, ?, ?, ?, ?)`,
    // [req])

    db.run(`UPDATE producto SET unidades = ?  WHERE id = ?`,[restarUnidad,req.body.searchcode],
    (error)=>{
      if(error){
       
        console.log(error)
        return res.send("Hubo un error al cargar los datos")
        
      }
      return res.status(200).send("<script>alert('Los datos se actualizaron'); window.location = '/dasboard'</script>")
     
    })
   }else{
    return res.status(200).send("<script>alert('error en los datos'); window.location = '/dasboard'</script>")
   }

  })



})

app.get("/categoria",(req,res)=>{

  session = req.session;

  db.all(`SELECT * FROM categoria  WHERE idusuario=$email`,{
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

      if (!error) {
        return res.send("<script>alert('Producto registrado exitosamente'); window.location = '/producto'</script>")
      }else{

        if(error.code == 'SQLITE_CONSTRAINT'){
          return res.send("<script>alert('El codigo del producto ya existe'); window.location = '/producto'</script>")
  
        }
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
  body('documento', 'El documento no es valido asegurate de que tenga mas de 8 numeros y no este vacio')
      .exists()
      .isLength({min:8}),
  body('correo', 'El correo no es valido asegurate de que no este vacio y este bien escrito')
      .exists()
      .isEmail(),
  body('password', 'la contraseña no es valida debe tener mas de 5 caracteres')
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
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            auth: {
                user: 'kodiardevelopers@gmail.com',
                pass: 'jwemqhzrqmekfksx'
            }
          });
          
          // send email
          await  transporter.sendMail({
            from: 'kodiardevelopers@gmail.com',
            to: correo,
            subject: 'Test Email Subject',
            html: ` <div class="container" style="width:480px;
            margin:auto;">
             <div style="border: 5px solid #1aa7f8;
             padding: 10px;
             border-radius: 3px;
             font-family: 'Roboto', sans-serif;
             display:flex;
             flex-direction: column;
             align-items: center;
             border-radius: 10px;
             ">
           <div class="logo">
             <img src="https://res.cloudinary.com/dkqp3wkbi/image/upload/v1656466485/kodiarLogo/logokodiar_bg3auh.png" alt="kodiar">
           </div>
           <div class="text">
             <h2 style="text-align:center ;">¡Hola, daniel Bienvenido a Kodiar</h2>
             <p style="text-align:center; display: block;">Kodiar es una aplicación de administración para el inventario de los productos de tu negocio , en la cual podras llevar un control permanente de todos ellos, necesidades de abastecimiento, reporte de vencimientos, rotación de productos y podras utilizarla para el manejo administrativo y financiero de tu negocio.</p>
           </div>
         
         </div>
         </div>
            </div>`,
          }).then((res) =>{
            console.log(res)
          }).catch((err) =>{console.log("Error",err)});
        return res.redirect("/login")
      }else{

        if(error.code == 'SQLITE_CONSTRAINT'){
          return res.send("<script>alert('Este usuario ya existe'); window.location = '/registro'</script>")
  
        }
      }

      })
    }
  
})

app.post('/login',(req,res) =>{

  const{ correo, password} =req.body;
  db.get("SELECT password FROM usuario  WHERE correo=$correo",{
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
        console.log(error);
        return  res.send("<script>alert('La categoria no se creo vuelva a intentarlo'); window.location = '/categoria'</script>")
       
      }else{
        
        res.send("<script>alert('Categoria creada exitosamente'); window.location = '/categoria'</script>")
      }
  
    })
  }
  

})

app.get("/delete/:id",(req,res)=>{

  db.run(`DELETE FROM producto WHERE id = ?`,[req.params.id],(error,rows)=>{
    if (error) {
      return  res.send("<script>alert('La categoria no se elimino vuelva a intentarlo'); window.location = '/inventario'</script>")
     
    }else{
      
      res.send("<script>alert('Producto eliminado exitosamente'); window.location = '/inventario'</script>")
    }

  })
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
app.get("/deletecategoria/:id",(req,res)=>{
   

  db.run("DELETE FROM categoria WHERE id_categoria = ?",[req.params.id],(error,rows)=>{
    if (!error) {
      res.send("<script>alert('Categoria eliminada exitosamente'); window.location = '/categoria'</script>")
      console.log(error);
      
    }else{
      return  res.send("<script>alert('La categoria no se elimino vuelva a intentarlo'); window.location = '/categoria'</script>")
      
    }

  })



})
app.get("/editProduct/:id",(req,res)=>{

  const {id} = req.params;
  db.get("SELECT * FROM producto WHERE id = ?",[id],(error,rows)=>{
    if(!error){

      res.render("editProduct",{data:rows})
    }else{
      return  res.send("<script>alert('Error vuelva a intentarlo'); window.location = '/inventario'</script>")

    }

})
})

app.post("/update/:id",(req,res)=>{

  const actualizar = req.body
  const {id}= req.params;
  const idNumber = parseInt(id)
  db.run(`UPDATE producto SET namep = ?, unidades = ?, precioc = ?, preciov = ?, fechaven = ?,
   descripcion = ? WHERE id = ?`,[req.body.nombre,req.body.unidades,req.body.pcompra,
    req.body.pventa,req.body.fechav,req.body.descripcion,idNumber],(error,rows)=>{
    if (!error) {
      res.send("<script>alert('Producto actualizado exitosamente'); window.location = '/inventario'</script>")
    }else{
      console.log(error);
      return  res.send("<script>alert('El producto no se actualizo'); window.location = '/inventario'</script>")
    }
      
    

  })
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

