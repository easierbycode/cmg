<script>
  let { ctx } = $props();
  let objects = $state(ctx && ctx.gameObjects ? ctx.gameObjects.length : 0);
</script>

<div class="wrap">
  <h1>DEMO ADV SCENE</h1>
  <p>{objects} GameObjects in {ctx && ctx.scene && ctx.scene.scene ? ctx.scene.scene.key : 'AdvScene'}</p>
  <button onclick={() => ctx.next()}>START ▶</button>
</div>

<style>
  .wrap {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    pointer-events: auto;
    background: rgba(0, 0, 0, 0.85);
    color: #fff;
    font-family: monospace;
    text-align: center;
  }
  h1 {
    color: #ffe81f;
    margin: 0;
  }
  button {
    background: #ff2255;
    color: #fff;
    border: 0;
    padding: 10px 24px;
    font: bold 16px monospace;
    cursor: pointer;
  }
</style>
