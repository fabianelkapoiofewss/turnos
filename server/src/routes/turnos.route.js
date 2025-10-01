import { Router } from "express";
import {
    getTurnos,
    deleteTurnos,
    postTurnos,
    putTurnos,
    llamarSiguiente,
} from "../controllers/turnos.controller.js";

const TurnosRouter = Router();

TurnosRouter.get("/", getTurnos);
TurnosRouter.post("/", postTurnos);
TurnosRouter.put("/:id", putTurnos);
TurnosRouter.delete("/:id", deleteTurnos);
TurnosRouter.post("/llamar-siguiente", llamarSiguiente);

export default TurnosRouter;