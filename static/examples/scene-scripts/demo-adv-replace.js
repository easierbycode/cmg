// Demo Adv Scene Script (JavaScript - Replace mode)
export default {
  create(ctx) {
    const { scene } = ctx;
    const w = scene.scale.width;
    const h = scene.scale.height;
    scene.add
      .text(w / 2, h / 2, "DEMO ADV SCENE (REPLACED)", {
        fontSize: "28px",
        color: "#ff2255",
        fontFamily: "monospace",
      })
      .setOrigin(0.5);
    scene.add
      .text(w / 2, h / 2 + 40, "Click to continue", {
        fontSize: "16px",
        color: "#ffffff",
        fontFamily: "monospace",
      })
      .setOrigin(0.5);
    scene.input.once("pointerdown", () => ctx.next());
  },
};
