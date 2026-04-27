import Phaser from "phaser";

export class DamageText {
  static spawn(scene: Phaser.Scene, x: number, y: number, value: number) {
    const txt = scene.add
      .text(x, y, `${value}`, {
        fontFamily: "monospace",
        fontSize: "24px",
        color: "#fca5a5",
        stroke: "#111827",
        strokeThickness: 3
      })
      .setOrigin(0.5)
      .setDepth(12);

    scene.tweens.add({
      targets: txt,
      y: y - 36,
      alpha: 0,
      duration: 550,
      onComplete: () => txt.destroy()
    });
  }
}
