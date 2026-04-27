import { Room, Client } from "colyseus";

interface JoinOptions {
  nickname?: string;
}

export class BattleRoom extends Room {
  maxClients = 16;

  onCreate() {
    this.setMetadata({ mode: "prototype" });
    this.onMessage("ping", (client, payload: { t: number }) => {
      client.send("pong", payload);
    });
  }

  onJoin(client: Client, options: JoinOptions) {
    const name = options.nickname ?? `Cultivator-${client.sessionId.slice(0, 4)}`;
    this.broadcast("system", `${name} entered the秘境.`);
  }

  onLeave(client: Client) {
    this.broadcast("system", `Cultivator ${client.sessionId.slice(0, 4)} left.`);
  }
}
