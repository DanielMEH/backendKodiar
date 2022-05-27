import sqlite3 from "sqlite3";


export const db = new sqlite3.Database("./users.db")
    if(db){

        console.log("estas conectado")
    }else{
        console.log("error")
    }
