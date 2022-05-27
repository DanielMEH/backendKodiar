import {Router} from 'express';
import {registerUsuario,getDatos} from "./contollers.js"

const router = Router();

router.get('/',getDatos)
router.post("/registrar",registerUsuario)

//? get-<obtiene datos  post->inserta datos put->updating date delete 

export default router;

