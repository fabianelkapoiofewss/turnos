import express from "express";
import { login, verificarToken, crearUsuario } from "../controllers/auth.controller.js";
import { authenticateToken, requireSuperAdmin } from "../middleware/auth.js";

const router = express.Router();

router.post("/login", login);
router.get("/verify", verificarToken);
router.post("/usuarios", authenticateToken, requireSuperAdmin, crearUsuario);

export default router;