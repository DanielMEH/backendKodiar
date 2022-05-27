import express from "express";
const app = express();
import router from "./routes.js"
import {db} from "./db/conexion.js"
const port = 3000;

// ? Settigs
app.set("port", process.env.PORT || port);

app.use(express.json())
app.use(express.urlencoded({extended: false}))
console.log(db)
app.use(router)

// ? Listening Server
app.listen(app.get("port"), (req,res) => {
     console.log("Listening on port",app.get("port"))
})
