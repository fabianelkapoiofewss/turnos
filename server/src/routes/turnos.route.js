import { Router } from "express";
import {
    getTurnos,
    deleteTurnos,
    postTurnos,
    putTurnos,
    llamarSiguiente,
    llamarTurnoPorId,
    checkCambios,
} from "../controllers/turnos.controller.js";

const TurnosRouter = Router();

TurnosRouter.get("/", getTurnos);
TurnosRouter.get("/cambios", checkCambios);
TurnosRouter.post("/", postTurnos);
TurnosRouter.put("/:id", putTurnos);
TurnosRouter.delete("/:id", deleteTurnos);
TurnosRouter.post("/llamar-siguiente", llamarSiguiente);
TurnosRouter.post("/llamar/:id", llamarTurnoPorId);

export default TurnosRouter;