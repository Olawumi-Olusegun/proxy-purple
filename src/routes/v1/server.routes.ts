import express from "express";
import * as servers from "./../../controllers/server.controller";
import { isAuthenticated, authorize } from "../../middlewares/auth.middleware";
const router = express.Router();

router.use(isAuthenticated, authorize("admin", "user"));
router.get("/", servers.getServers);
router.get("/:serverName", servers.getServerByName);

export default router;
