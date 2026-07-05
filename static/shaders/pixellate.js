// OpenEmu's default "Pixellate" shader for the CMG EmulatorJS players.
//
// The GLSL below is a RetroArch-GLSL port of OpenEmu's bundled slang shader
// (OpenEmu.app/Contents/Resources/Shaders/Pixellate/pixellate/shaders/
// pixellate.slang) — an anti-aliased nearest-neighbour scaler that area-
// averages the source texels covered by each output pixel, so pixel edges
// stay crisp at any window size without shimmer:
//
//    Pixellate Shader
//    Copyright (c) 2011, 2012 Fes
//    Permission to use, copy, modify, and/or distribute this software for any
//    purpose with or without fee is hereby granted, provided that the above
//    copyright notice and this permission notice appear in all copies.
//    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
//    WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
//    MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
//    ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
//    WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
//    ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
//    OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
//    (Fes gave their permission to have this shader distributed under this
//    licence in this forum post:
//        http://board.byuu.org/viewtopic.php?p=57295#p57295)
//
// Each EmulatorJS play.html includes this file and calls
// CMGPixellate.configure() inside boot(), after the other EJS_* globals are
// set and before loader.js is appended. configure():
//   - registers the shader with EmulatorJS (EJS_shaders), which also lists it
//     in the EJS Settings → Graphics → Shaders menu,
//   - turns it on by default (EJS_defaultOptions.shader) unless the player
//     switched it off (localStorage, shared by all EmulatorJS systems),
//   - advertises a "Pixellate Shader" toggle to the Dashboard OSD over the
//     cmg-plugins protocol and applies cmg-plugin-set toggles live.
(function () {
  "use strict";

  const root = globalThis;

  const GLSLP =
    "shaders = 1\n\nshader0 = pixellate.glsl\nfilter_linear0 = false\n";

  // Differences from the slang original, both required by the RetroArch GLSL
  // shader spec (which EmulatorJS's libretro cores consume):
  //   - texcoords span the *padded* texture, so the output-pixel footprint
  //     (`range`) carries an InputSize/TextureSize factor — in slang the
  //     equivalent SourceSize terms cancel to 1/OutputSize;
  //   - round() is unavailable in GLSL ES 1.00 (WebGL1 / -legacy cores), so
  //     the border snap uses floor(x + 0.5).
  const GLSL = [
    "// Pixellate Shader",
    "// Copyright (c) 2011, 2012 Fes — see /shaders/pixellate.js for the licence.",
    "",
    '#pragma parameter INTERPOLATE_IN_LINEAR_GAMMA "Linear Gamma Weight" 1.0 0.0 1.0 1.0',
    "",
    "#if defined(VERTEX)",
    "",
    "#if __VERSION__ >= 130",
    "#define COMPAT_VARYING out",
    "#define COMPAT_ATTRIBUTE in",
    "#define COMPAT_TEXTURE texture",
    "#else",
    "#define COMPAT_VARYING varying",
    "#define COMPAT_ATTRIBUTE attribute",
    "#define COMPAT_TEXTURE texture2D",
    "#endif",
    "",
    "#ifdef GL_ES",
    "#define COMPAT_PRECISION mediump",
    "#else",
    "#define COMPAT_PRECISION",
    "#endif",
    "",
    "COMPAT_ATTRIBUTE vec4 VertexCoord;",
    "COMPAT_ATTRIBUTE vec4 TexCoord;",
    "COMPAT_VARYING vec4 TEX0;",
    "",
    "uniform mat4 MVPMatrix;",
    "uniform COMPAT_PRECISION int FrameDirection;",
    "uniform COMPAT_PRECISION int FrameCount;",
    "uniform COMPAT_PRECISION vec2 OutputSize;",
    "uniform COMPAT_PRECISION vec2 TextureSize;",
    "uniform COMPAT_PRECISION vec2 InputSize;",
    "",
    "void main()",
    "{",
    "    gl_Position = MVPMatrix * VertexCoord;",
    "    TEX0.xy = TexCoord.xy;",
    "}",
    "",
    "#elif defined(FRAGMENT)",
    "",
    "// default float precision must precede the out declaration on GLSL ES 3",
    "#ifdef GL_ES",
    "#ifdef GL_FRAGMENT_PRECISION_HIGH",
    "precision highp float;",
    "#else",
    "precision mediump float;",
    "#endif",
    "#define COMPAT_PRECISION mediump",
    "#else",
    "#define COMPAT_PRECISION",
    "#endif",
    "",
    "#if __VERSION__ >= 130",
    "#define COMPAT_VARYING in",
    "#define COMPAT_TEXTURE texture",
    "out vec4 FragColor;",
    "#else",
    "#define COMPAT_VARYING varying",
    "#define FragColor gl_FragColor",
    "#define COMPAT_TEXTURE texture2D",
    "#endif",
    "",
    "uniform COMPAT_PRECISION int FrameDirection;",
    "uniform COMPAT_PRECISION int FrameCount;",
    "uniform COMPAT_PRECISION vec2 OutputSize;",
    "uniform COMPAT_PRECISION vec2 TextureSize;",
    "uniform COMPAT_PRECISION vec2 InputSize;",
    "uniform sampler2D Texture;",
    "COMPAT_VARYING vec4 TEX0;",
    "",
    "#define Source Texture",
    "#define vTexCoord TEX0.xy",
    "",
    "#ifdef PARAMETER_UNIFORM",
    "uniform COMPAT_PRECISION float INTERPOLATE_IN_LINEAR_GAMMA;",
    "#else",
    "#define INTERPOLATE_IN_LINEAR_GAMMA 1.0",
    "#endif",
    "",
    "void main()",
    "{",
    "   vec2 texelSize = 1.0 / TextureSize;",
    "",
    "   // Half of one output pixel, in (padded-)texture coordinate units.",
    "   vec2 range = vec2(abs(InputSize.x / (OutputSize.x * TextureSize.x)), abs(InputSize.y / (OutputSize.y * TextureSize.y)));",
    "   range = range / 2.0 * 0.999;",
    "",
    "   float left   = vTexCoord.x - range.x;",
    "   float top    = vTexCoord.y + range.y;",
    "   float right  = vTexCoord.x + range.x;",
    "   float bottom = vTexCoord.y - range.y;",
    "",
    "   vec3 topLeftColor;",
    "   vec3 bottomRightColor;",
    "   vec3 bottomLeftColor;",
    "   vec3 topRightColor;",
    "",
    "   if (INTERPOLATE_IN_LINEAR_GAMMA > 0.5) {",
    "   topLeftColor     = pow(COMPAT_TEXTURE(Source, (floor(vec2(left, top)     / texelSize) + 0.5) * texelSize).rgb, vec3(2.2));",
    "   bottomRightColor = pow(COMPAT_TEXTURE(Source, (floor(vec2(right, bottom) / texelSize) + 0.5) * texelSize).rgb, vec3(2.2));",
    "   bottomLeftColor  = pow(COMPAT_TEXTURE(Source, (floor(vec2(left, bottom)  / texelSize) + 0.5) * texelSize).rgb, vec3(2.2));",
    "   topRightColor    = pow(COMPAT_TEXTURE(Source, (floor(vec2(right, top)    / texelSize) + 0.5) * texelSize).rgb, vec3(2.2));",
    "   } else {",
    "   topLeftColor     = COMPAT_TEXTURE(Source, (floor(vec2(left, top)     / texelSize) + 0.5) * texelSize).rgb;",
    "   bottomRightColor = COMPAT_TEXTURE(Source, (floor(vec2(right, bottom) / texelSize) + 0.5) * texelSize).rgb;",
    "   bottomLeftColor  = COMPAT_TEXTURE(Source, (floor(vec2(left, bottom)  / texelSize) + 0.5) * texelSize).rgb;",
    "   topRightColor    = COMPAT_TEXTURE(Source, (floor(vec2(right, top)    / texelSize) + 0.5) * texelSize).rgb;",
    "   }",
    "",
    "   vec2 border = clamp(floor(vTexCoord / texelSize + 0.5) * texelSize, vec2(left, bottom), vec2(right, top));",
    "",
    "   float totalArea = 4.0 * range.x * range.y;",
    "",
    "   vec3 averageColor;",
    "   averageColor  = ((border.x - left)  * (top - border.y)    / totalArea) * topLeftColor;",
    "   averageColor += ((right - border.x) * (border.y - bottom) / totalArea) * bottomRightColor;",
    "   averageColor += ((border.x - left)  * (border.y - bottom) / totalArea) * bottomLeftColor;",
    "   averageColor += ((right - border.x) * (top - border.y)    / totalArea) * topRightColor;",
    "",
    "   FragColor = (INTERPOLATE_IN_LINEAR_GAMMA > 0.5) ? vec4(pow(averageColor, vec3(1.0 / 2.2)), 1.0) : vec4(averageColor, 1.0);",
    "}",
    "#endif",
    "",
  ].join("\n");

  // EJS_shaders key — shown as-is in the EJS Shaders menu and stored as the
  // "shader" setting value.
  const KEY = "Pixellate";
  // localStorage: "0" = off, anything else (including unset) = on. One key for
  // all EmulatorJS systems so the choice follows the player across consoles.
  const STORE = "cmg-pixellate";

  function enabled() {
    try {
      return root.localStorage.getItem(STORE) !== "0";
    } catch (_) {
      return true;
    }
  }

  function apply(on) {
    const e = root.EJS_emulator;
    if (!e || typeof e.enableShader !== "function") return;
    try {
      e.enableShader(on ? KEY : "disabled");
    } catch (_) { /* core not ready yet — the start hook re-applies */ }
  }

  function advertise() {
    try {
      root.parent.postMessage({
        type: "cmg-plugins",
        plugins: [
          { id: "pixellate", label: "Pixellate Shader", value: enabled() },
        ],
      }, root.location.origin);
    } catch (_) { /* no parent to advertise to */ }
  }

  root.CMGPixellate = {
    configure: function () {
      const entry = {};
      entry[KEY] = {
        shader: { type: "text", value: GLSLP },
        resources: [{ name: "pixellate.glsl", type: "text", value: GLSL }],
      };
      root.EJS_shaders = Object.assign({}, root.EJS_shaders, entry);
      root.EJS_defaultOptions = Object.assign(
        {},
        root.EJS_defaultOptions,
        { shader: enabled() ? KEY : "disabled" },
      );

      // Re-assert our state a beat after start: EmulatorJS restores its own
      // per-core saved settings around the start event, and the OSD toggle
      // (not the EJS menu) is the source of truth for this shader.
      const prevStart = root.EJS_onGameStart;
      root.EJS_onGameStart = function () {
        if (typeof prevStart === "function") {
          try {
            prevStart.apply(this, arguments);
          } catch (_) { /* keep our hook alive if theirs throws */ }
        }
        setTimeout(function () {
          apply(enabled());
          advertise();
        }, 50);
      };

      // OSD toggle. The Dashboard posts cmg-plugin-set with targetOrigin '*'
      // (cross-origin demos need that) — trust only our own same-origin parent.
      addEventListener("message", function (e) {
        if (e.origin && e.origin !== root.location.origin) return;
        if (e.source !== root.parent) return;
        const d = e.data || {};
        if (d.type !== "cmg-plugin-set" || d.id !== "pixellate") return;
        try {
          root.localStorage.setItem(STORE, d.value ? "1" : "0");
        } catch (_) { /* private browsing — session-only toggle */ }
        apply(!!d.value);
      });
    },
  };
})();
