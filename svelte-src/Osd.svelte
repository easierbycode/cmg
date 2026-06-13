<script>
  // In-game OSD ("Guide") — the Tweaks-panel design from the Xbox Dashboard
  // handoff, re-skinned to the dashboard's green/Orbitron CRT aesthetic. It is a
  // dumb renderer: the Dashboard owns the item list, the selected index, and the
  // handlers (so gamepad/keyboard nav and touch/mouse share one source of truth).
  //
  // Item shape: { key, kind:'button'|'toggle'|'slider'|'color', label,
  //   section?, value?, options?(color), min?,max?,step?,unit?(slider) }
  let {
    open = false,
    items = [],
    sel = 0,
    onactivate = () => {},
    onsetvalue = () => {},
    onselect = () => {},
    onclose = () => {},
  } = $props();

  function rowClick(it, i) {
    onselect(i);
    // Buttons + toggles act on the row tap; slider/color have their own controls.
    if (it.kind === 'button' || it.kind === 'toggle') onactivate(i);
  }
</script>

{#if open}
  <div class="osd-scrim" aria-hidden="true" onpointerdown={onclose}></div>
  <div class="osd-panel" role="menu" aria-label="Guide">
    <div class="osd-hd">
      <span class="osd-title">GUIDE</span>
      <button type="button" class="osd-x" aria-label="Close" onclick={onclose}>✕</button>
    </div>
    <div class="osd-body">
      {#each items as it, i (it.key)}
        {#if it.section}<div class="osd-sect">{it.section}</div>{/if}
        <div
          class="osd-row kind-{it.kind} {i === sel ? 'sel' : ''}"
          role="menuitem"
          tabindex="-1"
          onpointerenter={() => onselect(i)}
          onclick={() => rowClick(it, i)}
        >
          <span class="osd-lbl">{it.label}</span>

          {#if it.kind === 'button'}
            <span class="osd-chev" aria-hidden="true">▸</span>
          {:else if it.kind === 'toggle'}
            <span class="osd-toggle" data-on={it.value ? '1' : '0'} aria-hidden="true"><i></i></span>
          {:else if it.kind === 'slider'}
            <span class="osd-ctl" onclick={(e) => e.stopPropagation()}>
              <span class="osd-val">{it.value}{it.unit ?? ''}</span>
              <!-- it.commit sliders (cheats, which reload the game on apply)
                   fire on change/drag-end only; live sliders (tweaks) on input. -->
              <input
                class="osd-slider"
                type="range"
                min={it.min} max={it.max} step={it.step}
                value={it.value}
                oninput={(e) => { if (!it.commit) onsetvalue(i, Number(e.currentTarget.value)); }}
                onchange={(e) => { if (it.commit) onsetvalue(i, Number(e.currentTarget.value)); }}
              />
            </span>
          {:else if it.kind === 'color'}
            <span class="osd-chips" onclick={(e) => e.stopPropagation()}>
              {#each it.options as opt (opt.hue)}
                <button
                  type="button"
                  class="osd-chip {opt.hue === it.value ? 'on' : ''}"
                  style="background: {opt.hex}"
                  aria-label={opt.hex}
                  onclick={() => { onselect(i); onsetvalue(i, opt.hue); }}
                ></button>
              {/each}
            </span>
          {/if}
        </div>
      {/each}
    </div>
    <div class="osd-foot">
      <span><b>A</b> Select</span>
      <span><b>B</b> Close</span>
      <span class="osd-foot-hint">SELECT + ↓ · two-corner tap</span>
    </div>
  </div>
{/if}

<style>
  /* Dim the game behind the panel; tap-out closes. */
  .osd-scrim { position: fixed; inset: 0; z-index: 102; background: rgba(0, 0, 0, .45); }

  .osd-panel {
    position: fixed; right: 2.4vmin; bottom: 2.4vmin; z-index: 103;
    width: min(340px, 88vw); max-height: min(76vh, 620px);
    display: flex; flex-direction: column; overflow: hidden;
    color: #dfffc4; font-family: 'Orbitron', sans-serif;
    background: linear-gradient(180deg, rgba(12, 40, 20, .94), rgba(6, 22, 11, .96));
    border: 1px solid var(--tile-edge, rgba(140, 255, 110, .55));
    border-radius: 12px;
    box-shadow: 0 0 38px rgba(80, 220, 100, .3), inset 0 0 0 1px rgba(140, 255, 110, .08);
    -webkit-backdrop-filter: blur(8px) saturate(140%);
    backdrop-filter: blur(8px) saturate(140%);
    animation: osdIn .16s ease-out;
  }
  @keyframes osdIn { from { opacity: 0; transform: translateY(8px) scale(.98); } to { opacity: 1; transform: none; } }

  .osd-hd {
    display: flex; align-items: center; justify-content: space-between;
    padding: 12px 12px 10px 16px; border-bottom: 1px solid rgba(140, 255, 110, .18);
  }
  .osd-title { font-weight: 800; letter-spacing: .28em; font-size: 14px; color: #eaffd2; text-shadow: 0 0 14px rgba(120, 255, 90, .5); }
  .osd-x {
    appearance: none; border: 0; background: transparent; color: rgba(220, 255, 180, .6);
    width: 26px; height: 26px; border-radius: 6px; cursor: pointer; font-size: 14px; line-height: 1;
  }
  .osd-x:hover { background: rgba(120, 255, 90, .12); color: #eaffd2; }

  .osd-body { display: flex; flex-direction: column; gap: 6px; padding: 10px 12px 12px; overflow-y: auto; scrollbar-width: thin; scrollbar-color: rgba(140, 255, 110, .3) transparent; }
  .osd-sect { font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: .22em; text-transform: uppercase; color: rgba(180, 255, 140, .5); padding: 8px 2px 2px; }
  .osd-sect:first-child { padding-top: 0; }

  .osd-row {
    display: flex; align-items: center; justify-content: space-between; gap: 12px;
    min-height: 40px; padding: 6px 12px; border-radius: 8px; cursor: pointer;
    border: 1px solid rgba(140, 255, 110, .18);
    background: linear-gradient(180deg, rgba(70, 180, 90, .08), rgba(20, 60, 30, .4));
    transition: background .15s ease, border-color .15s ease, box-shadow .15s ease, color .15s ease;
  }
  .osd-row.sel {
    color: #0e0e02; border-color: #fff36a;
    background: linear-gradient(180deg, #fffea1 0%, var(--yellow, #F6FF4A) 30%, #d8e640 70%, #a4b00b 100%);
    box-shadow: 0 0 22px rgba(255, 240, 90, .45);
  }
  .osd-lbl { font-weight: 600; font-size: 14px; letter-spacing: .06em; white-space: nowrap; }
  .osd-chev { color: rgba(220, 255, 180, .5); }
  .osd-row.sel .osd-chev { color: rgba(40, 30, 0, .6); }

  .osd-ctl { display: flex; align-items: center; gap: 8px; flex: 1; justify-content: flex-end; }
  .osd-val { font-family: 'Share Tech Mono', monospace; font-size: 12px; color: rgba(220, 255, 180, .7); min-width: 3em; text-align: right; }
  .osd-row.sel .osd-val { color: rgba(40, 30, 0, .7); }

  .osd-slider { appearance: none; -webkit-appearance: none; width: 100%; max-width: 150px; height: 4px; border-radius: 999px; background: rgba(140, 255, 110, .25); outline: none; }
  .osd-slider::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 14px; height: 14px; border-radius: 50%; background: #eaffd2; border: 1px solid rgba(80, 180, 90, .8); box-shadow: 0 0 8px rgba(120, 255, 90, .6); cursor: pointer; }
  .osd-slider::-moz-range-thumb { width: 14px; height: 14px; border-radius: 50%; background: #eaffd2; border: 1px solid rgba(80, 180, 90, .8); }

  .osd-chips { display: flex; gap: 6px; }
  .osd-chip { width: 24px; height: 24px; border-radius: 6px; border: 1px solid rgba(0, 0, 0, .35); cursor: pointer; padding: 0; box-shadow: inset 0 0 0 1px rgba(255, 255, 255, .15); transition: transform .12s ease; }
  .osd-chip:hover { transform: translateY(-1px); }
  .osd-chip.on { box-shadow: 0 0 0 2px #fff, 0 0 10px rgba(255, 255, 255, .6); }

  .osd-toggle { position: relative; width: 34px; height: 19px; border-radius: 999px; background: rgba(140, 255, 110, .22); transition: background .15s ease; flex-shrink: 0; }
  .osd-toggle[data-on="1"] { background: #4fd06a; }
  .osd-toggle i { position: absolute; top: 2px; left: 2px; width: 15px; height: 15px; border-radius: 50%; background: #eaffd2; box-shadow: 0 1px 2px rgba(0, 0, 0, .4); transition: transform .15s ease; }
  .osd-toggle[data-on="1"] i { transform: translateX(15px); }
  .osd-row.sel .osd-toggle { background: rgba(40, 30, 0, .25); }
  .osd-row.sel .osd-toggle[data-on="1"] { background: #2e7d3c; }

  .osd-foot { display: flex; align-items: center; gap: 12px; padding: 8px 14px; border-top: 1px solid rgba(140, 255, 110, .18); font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: .12em; color: rgba(220, 255, 180, .55); text-transform: uppercase; }
  .osd-foot b { color: #eaffd2; }
  .osd-foot-hint { margin-left: auto; opacity: .7; }
</style>
