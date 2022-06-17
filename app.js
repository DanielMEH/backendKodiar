const express = require('express')
const bcrypt = require('bcrypt');
const app = express()
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
//le decimos a express que use el paquete cookie parser
//para trabajar con cookies
const cookieParser = require("cookie-parser");
app.use(cookieParser());
//configuramos las cookies que seran entregadas a los clientes
//usamos el paquete express session
const sessions = require('express-session');
//creamos el tiempo de expiracion en milisegundos
const timeEXp = 1000 * 60 * 60 * 24;
//le decimos a express que configure las sesiones con
//llave secreta 
app.use(sessions({
    secret: "rfghf66a76ythggi87au7td",
    saveUninitialized:true,
    cookie: { maxAge: timeEXp },
    resave: false 
}));
const port = 3000
app.set('view engine', 'ejs');

let model = {};

app.get('/', (req, res) => {
  //se pasa una variable sencilla a la vista
  res.render('index');
})

app.post('/registro', (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  let age = req.body.age;
  //HASHEADO
  const saltRounds = 10;
  const salt = bcrypt.genSaltSync(saltRounds);
  //CONVERTIMOS A HASH EL PASSWORD DEL USUARIO
  const hash = bcrypt.hashSync(password, salt);
  //GUARDA EN LA BASE DE DATOS LOS DATOS DEL Usuario
  //EL PASSWORD SE GUARDA HASHEADO
  model[email] = {password: hash}
  //se pasa una variable sencilla a la vista
  res.render('registrook', {email: email, password: hash, age: age});
})


app.post('/logicalogin', (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  //SE CONSULTA A LA BASE DE DATOS POR EL PASSWORD DEL USUARIO 
  //USANDO COMO FILTRO EL CORREO DEL USUARIO
  let passBaseDatos = model[email].password;
  //si la consulta arroja resultados el usuario existe..
  //lo que no quiere decir que se haya autenticado
  if(passBaseDatos){
      //comparamos las contraseñas, la plana y la hasheada de la base
      // de datos
      //si son iguales el usuairo esta logueado...
      if (bcrypt.compareSync(password, passBaseDatos)){
          //recogemos session de la solicitud del usuario
          session = req.session;
          //iniciamos sesion al usuario
          //en este caso la llamamos userid
          //y ella contiene el email del usuario encriptado
          session.userid = email;
          return res.send("Logueado exitosamente");
      }
      return res.send("Usuario o contraseña incorrecta");
    }
  
    return res.send("Usuario o contraseña incorrecta");


})


app.get('/login', (req, res) => {
  
  res.render('login');
})

app.get('/logout',(req,res) => {
  session = req.session;

  if(session.userid){
 
    req.session.destroy();
    return res.redirect('/');
  }
  return res.send('No tiene sesion para cerrar')
})

app.get('/comprar',(req,res) => {
  
  session = req.session;

  if(session.userid){
      res.send(`Compra realizada usuario ${session.userid} Cerrar sesion <a href=\'/logout'>Click</a>`);
  }else
  res.send('Por favor inicie sesión para comprar')
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
