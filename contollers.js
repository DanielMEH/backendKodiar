import sqlite3 from "sqlite3";
export const db = new sqlite3.Database("./db/users.db")
   
export const getDatos = (req,res)=>{
   
    db.all("SELECT * FROM usuarios", (error, rows) => {
        rows.forEach((row) => {
          console.log(row.name);
          console.log(row.email);
          console.log(row.password);
        })
        

    })
      
}

export const registerUsuario = (req,res)=>{

 
    const {documento,name,correo,password,telefono,descripcion,avatar} = req.body
    db.run(`INSERT INTO usuarios(documento,name,correo,password,telefono,descripcion,avatar) VALUES(?, ?, ?, ?, ?, ?, ?)`, 
    [documento,name,correo,password,telefono,descripcion,avatar],
    (error,row)=>{
      if (!error){

          console.log("Los datos se registraron con exito");
     
        }else{
          console.log("Los datos no se guardaron",error);
        }
    }

    // db.run(`INSERT INTO usuarios(documento,name,correo,password,telefono,descripcion,avatar) VALUES(?,?,?,?,?,?,?)`,
    // [1,documento,name,correo,password,telefono,descripcion,avatar],
    // function(error){
    //     if (!error){
    //       console.log("Insert OK");
    //       res.send("datos completos")
    //     }else{
    //       console.log("Insert error");
    //     }
    // }

)}
    
      
   


