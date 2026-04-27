import Phaser from "phaser";

export class DamageText {
  static spawn(scene: Phaser.Scene, x: number, y: number, value: number) {
    const txt = scene.add
      .text(x, y, `-${value}`, {
        fontFamily: "monospace",
        fontSize: "28px",
        color: "#fecaca",
        stroke: "#111827",
        strokeThickness: 4
      })
      .setOrigin(0.5)
      .setDepth(12);

    scene.tweens.add({
      targets: txt,
      y: y - 42,
      alpha: 0,
      scale: 1.1,
      duration: 600,
      onComplete: () => txt.destroy()
    });
  }
}
