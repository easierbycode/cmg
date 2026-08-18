// Demo Title Scene Script (TypeScript)
export default {
  onStart(ctx: any) {
    console.log("[DemoTitleScene] title scene started");
    const logo = ctx.find("logo");
    if (logo && ctx.scene && ctx.scene.tweens) {
      ctx.scene.tweens.add({
        targets: logo,
        angle: 360,
        duration: 1500,
        ease: "Power2",
      });
    }
  },
  create(ctx: any) {
    const { scene } = ctx;
    const w = scene.scale.width;
    const h = scene.scale.height;
    scene.add
      .text(w / 2, h / 2, "DEMO TITLE SCENE", {
        fontSize: "32px",
        color: "#ffe81f",
        fontFamily: "monospace",
      })
      .setOrigin(0.5);
    scene.add
      .text(w / 2, h / 2 + 50, "Click anywhere to start", {
        fontSize: "18px",
        color: "#ffffff",
        fontFamily: "monospace",
      })
      .setOrigin(0.5);
    scene.input.once("pointerdown", () => ctx.next());
  },
};
