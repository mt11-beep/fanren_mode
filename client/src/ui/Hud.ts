import Phaser from "phaser";
import { GAME_BALANCE } from "@xuanfight/shared";
import type { CooldownState } from "../entities/Player";

interface HudCallbacks {
  onTogglePause: () => void;
  onResetArena: () => void;
}

export class Hud {
  private readonly healthBar: Phaser.GameObjects.Graphics;
  private readonly manaBar: Phaser.GameObjects.Graphics;
  private readonly cooldownText: Phaser.GameObjects.Text;
  private readonly killText: Phaser.GameObjects.Text;
  private readonly shieldStateText: Phaser.GameObjects.Text;
  private readonly comboText: Phaser.GameObjects.Text;
  private readonly logText: Phaser.GameObjects.Text;
  private readonly pauseBtn: Phaser.GameObjects.Text;
  private readonly resetBtn: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, callbacks: HudCallbacks) {
    this.healthBar = scene.add.graphics().setScrollFactor(0);
    this.manaBar = scene.add.graphics().setScrollFactor(0);
    this.cooldownText = scene.add
      .text(20, 104, "", { fontFamily: "monospace", fontSize: "18px", color: "#e5e7eb" })
      .setScrollFactor(0)
      .setDepth(20);
    this.killText = scene.add
      .text(20, 200, "斩灭假人: 0", { fontFamily: "sans-serif", fontSize: "22px", color: "#fde68a" })
      .setScrollFactor(0)
      .setDepth(20);
    this.shieldStateText = scene.add
      .text(20, 230, "", { fontFamily: "sans-serif", fontSize: "18px", color: "#93c5fd" })
      .setScrollFactor(0)
      .setDepth(20);
    this.comboText = scene.add
      .text(20, 258, "", { fontFamily: "monospace", fontSize: "20px", color: "#fca5a5" })
      .setScrollFactor(0)
      .setDepth(20);

    this.logText = scene.add
      .text(20, 290, "战斗日志:\n-", {
        fontFamily: "monospace",
        fontSize: "15px",
        color: "#d1d5db",
        lineSpacing: 4
      })
      .setScrollFactor(0)
      .setDepth(20);

    this.pauseBtn = scene.add
      .text(1080, 20, "暂停/继续", {
        fontFamily: "sans-serif",
        fontSize: "18px",
        color: "#fef3c7",
        backgroundColor: "#1f2937",
        padding: { x: 10, y: 6 }
      })
      .setInteractive({ useHandCursor: true })
      .setScrollFactor(0)
      .setDepth(21)
      .on("pointerdown", callbacks.onTogglePause);

    this.resetBtn = scene.add
      .text(1188, 20, "重置训练场", {
        fontFamily: "sans-serif",
        fontSize: "18px",
        color: "#bfdbfe",
        backgroundColor: "#1f2937",
        padding: { x: 10, y: 6 }
      })
      .setInteractive({ useHandCursor: true })
      .setScrollFactor(0)
      .setDepth(21)
      .on("pointerdown", callbacks.onResetArena);

    scene.add.text(310, 18, "气血", { fontFamily: "sans-serif", fontSize: "14px", color: "#f3f4f6" }).setScrollFactor(0).setDepth(20);
    scene.add.text(310, 46, "灵力", { fontFamily: "sans-serif", fontSize: "14px", color: "#f3f4f6" }).setScrollFactor(0).setDepth(20);
  }

  render(data: {
    health: number;
    mana: number;
    cooldowns: CooldownState;
    kills: number;
    shieldEndAt: number;
    comboCount: number;
    paused: boolean;
  }) {
    this.drawBar(this.healthBar, 20, 20, 280, 18, data.health / GAME_BALANCE.player.maxHealth, 0xef4444);
    this.drawBar(this.manaBar, 20, 48, 280, 18, data.mana / GAME_BALANCE.player.maxMana, 0x3b82f6);

    const now = performance.now();
    const sLeft = Math.max(0, data.cooldowns.sword - now);
    const qCd = Math.max(0, data.cooldowns.shield - now);
    const eLeft = Math.max(0, data.cooldowns.burst - now);
    const shieldActiveLeft = Math.max(0, data.shieldEndAt - now);

    this.cooldownText.setText([
      `飞剑(LMB): ${(sLeft / 1000).toFixed(1)}s`,
      `护体灵盾(Q) CD: ${(qCd / 1000).toFixed(1)}s`,
      `震荡术(E): ${(eLeft / 1000).toFixed(1)}s`
    ]);

    this.shieldStateText.setText(
      shieldActiveLeft > 0
        ? `护盾持续: ${(shieldActiveLeft / 1000).toFixed(1)}s`
        : "护盾状态: 未激活"
    );

    this.killText.setText(`斩灭假人: ${data.kills}`);
    this.comboText.setText(data.comboCount > 1 ? `连击 x${data.comboCount}` : "");
    this.pauseBtn.setText(data.paused ? "继续训练" : "暂停训练");
  }

  setCombatLogs(logs: string[]) {
    this.logText.setText(["战斗日志:", ...logs.map((v) => `- ${v}`)]);
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
