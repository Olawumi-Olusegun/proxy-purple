import express from "express";
import * as servers from "./../../controllers/server.controller";
const router = express.Router();

router.get("/", servers.getServers);
router.get("/:serverName", servers.getServerByName);

export default router;
