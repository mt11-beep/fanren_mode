import http from "node:http";
import express from "express";
import cors from "cors";
import { Server } from "colyseus";
import { BattleRoom } from "./rooms/BattleRoom.js";

const PORT = Number(process.env.PORT ?? 2567);

const app = express();
app.use(cors());
app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "xuanfight-server" });
});

const server = http.createServer(app);
const gameServer = new Server({ server });

gameServer.define("battle", BattleRoom);

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`[server] Colyseus listening on http://localhost:${PORT}`);
});
