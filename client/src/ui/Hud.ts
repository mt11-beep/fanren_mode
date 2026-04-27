import Phaser from "phaser";
import { GAME_BALANCE } from "@xuanfight/shared";

type Cooldowns = {
  sword: number;
  shield: number;
  burst: number;
};

export class Hud {
  private readonly healthBar: Phaser.GameObjects.Graphics;
  private readonly manaBar: Phaser.GameObjects.Graphics;
  private readonly cooldownText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    this.healthBar = scene.add.graphics().setScrollFactor(0);
    this.manaBar = scene.add.graphics().setScrollFactor(0);
    this.cooldownText = scene.add
      .text(20, 78, "", {
        fontFamily: "monospace",
        fontSize: "18px",
        color: "#e5e7eb"
      })
      .setScrollFactor(0);

    scene.add.text(310, 18, "气血", { fontFamily: "sans-serif", fontSize: "14px", color: "#f3f4f6" }).setScrollFactor(0);
    scene.add.text(310, 46, "灵力", { fontFamily: "sans-serif", fontSize: "14px", color: "#f3f4f6" }).setScrollFactor(0);
  }

  render(health: number, mana: number, cooldowns: Cooldowns) {
    this.drawBar(this.healthBar, 20, 20, 280, 18, health / GAME_BALANCE.player.maxHealth, 0xef4444);
    this.drawBar(this.manaBar, 20, 48, 280, 18, mana / GAME_BALANCE.player.maxMana, 0x3b82f6);

    const now = performance.now();
    const sLeft = Math.max(0, cooldowns.sword - now);
    const qLeft = Math.max(0, cooldowns.shield - now);
    const eLeft = Math.max(0, cooldowns.burst - now);

    this.cooldownText.setText([
      `飞剑(LMB): ${(sLeft / 1000).toFixed(1)}s`,
      `护体灵盾(Q): ${(qLeft / 1000).toFixed(1)}s`,
      `震荡术(E): ${(eLeft / 1000).toFixed(1)}s`
    ]);
  }

  private drawBar(
    g: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    width: number,
    height: number,
    ratio: number,
    color: number
  ) {
    const clamped = Phaser.Math.Clamp(ratio, 0, 1);
    g.clear();
    g.fillStyle(0x111827, 0.8);
    g.fillRect(x, y, width, height);
    g.fillStyle(color, 1);
    g.fillRect(x + 2, y + 2, (width - 4) * clamped, height - 4);
    g.lineStyle(1, 0xf9fafb, 0.7);
    g.strokeRect(x, y, width, height);
  }
}
