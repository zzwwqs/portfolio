(function () {
  const reduce =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function parseStops(str) {
    const raw = String(str || "").trim();
    if (!raw) return null;
    const parts = raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (parts.length < 3) return null;
    return parts.slice(0, 3);
  }

  function initAurora() {
    const host = document.querySelector("[data-aurora]");
    if (!host) return;
    if (!window.ogl) return;
    if (reduce) return;

    const { Renderer, Program, Mesh, Color, Triangle } = window.ogl;

    const VERT = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

    const FRAG = `#version 300 es
precision highp float;

uniform float uTime;
uniform float uAmplitude;
uniform vec3 uColorStops[3];
uniform vec2 uResolution;
uniform float uBlend;

out vec4 fragColor;

vec3 permute(vec3 x) {
  return mod(((x * 34.0) + 1.0) * x, 289.0);
}

float snoise(vec2 v){
  const vec4 C = vec4(
      0.211324865405187, 0.366025403784439,
      -0.577350269189626, 0.024390243902439
  );
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);

  vec3 p = permute(
      permute(i.y + vec3(0.0, i1.y, 1.0))
    + i.x + vec3(0.0, i1.x, 1.0)
  );

  vec3 m = max(
      0.5 - vec3(
          dot(x0, x0),
          dot(x12.xy, x12.xy),
          dot(x12.zw, x12.zw)
      ),
      0.0
  );
  m = m * m;
  m = m * m;

  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);

  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

struct ColorStop {
  vec3 color;
  float position;
};

#define COLOR_RAMP(colors, factor, finalColor) {              \
  int index = 0;                                            \
  for (int i = 0; i < 2; i++) {                               \
     ColorStop currentColor = colors[i];                    \
     bool isInBetween = currentColor.position <= factor;    \
     index = int(mix(float(index), float(i), float(isInBetween))); \
  }                                                         \
  ColorStop currentColor = colors[index];                   \
  ColorStop nextColor = colors[index + 1];                  \
  float range = nextColor.position - currentColor.position; \
  float lerpFactor = (factor - currentColor.position) / range; \
  finalColor = mix(currentColor.color, nextColor.color, lerpFactor); \
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;

  ColorStop colors[3];
  colors[0] = ColorStop(uColorStops[0], 0.0);
  colors[1] = ColorStop(uColorStops[1], 0.5);
  colors[2] = ColorStop(uColorStops[2], 1.0);

  vec3 rampColor;
  COLOR_RAMP(colors, uv.x, rampColor);

  float height = snoise(vec2(uv.x * 2.0 + uTime * 0.1, uTime * 0.25)) * 0.5 * uAmplitude;
  height = exp(height);
  height = (uv.y * 2.0 - height + 0.2);
  float intensity = 0.6 * height;

  float midPoint = 0.20;
  float auroraAlpha = smoothstep(midPoint - uBlend * 0.5, midPoint + uBlend * 0.5, intensity);

  vec3 auroraColor = intensity * rampColor;

  fragColor = vec4(auroraColor * auroraAlpha, auroraAlpha);
}
`;

    const renderer = new Renderer({
      alpha: true,
      premultipliedAlpha: true,
      antialias: true,
    });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    host.appendChild(gl.canvas);
    gl.canvas.style.backgroundColor = "transparent";
    gl.canvas.style.width = "100%";
    gl.canvas.style.height = "100%";
    gl.canvas.style.display = "block";

    const geometry = new Triangle(gl);
    if (geometry.attributes.uv) delete geometry.attributes.uv;

    const initialStops =
      parseStops(host.getAttribute("data-color-stops")) || [
        "#7cff67",
        "#B19EEF",
        "#5227FF",
      ];
    const stopsVec = initialStops.map((hex) => {
      const c = new Color(hex);
      return [c.r, c.g, c.b];
    });

    const initialBlend = Number(host.getAttribute("data-blend") || "0.75");
    const initialAmp = Number(host.getAttribute("data-amplitude") || "1.2");

    const program = new Program(gl, {
      vertex: VERT,
      fragment: FRAG,
      uniforms: {
        uTime: { value: 0 },
        uAmplitude: { value: initialAmp },
        uColorStops: { value: stopsVec },
        uResolution: { value: [1, 1] },
        uBlend: { value: initialBlend },
      },
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });

    const mesh = new Mesh(gl, { geometry, program });

    let resizeTimer = 0;
    const resize = () => {
      const w = host.clientWidth || 1;
      const h = host.clientHeight || 1;
      renderer.setSize(w, h);
      program.uniforms.uResolution.value = [w, h];
    };
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(resize, 120);
    };
    resize();
    window.addEventListener("resize", onResize, { passive: true });

    let raf = 0;

    const update = (t) => {
      raf = requestAnimationFrame(update);

      // Match reference behavior:
      // default time = t * 0.01; uTime = time * speed * 0.1 => t * 0.001 * speed
      const speed = Number(host.getAttribute("data-speed") || "1");
      program.uniforms.uTime.value = t * 0.001 * speed;

      const amp = Number(host.getAttribute("data-amplitude") || "1.0");
      const blend = Number(host.getAttribute("data-blend") || "0.5");
      program.uniforms.uAmplitude.value = Number.isFinite(amp) ? amp : 1.0;
      program.uniforms.uBlend.value = Number.isFinite(blend) ? blend : 0.5;

      const stops = parseStops(host.getAttribute("data-color-stops")) || initialStops;
      program.uniforms.uColorStops.value = stops.map((hex) => {
        const c = new Color(hex);
        return [c.r, c.g, c.b];
      });

      renderer.render({ scene: mesh });
    };
    raf = requestAnimationFrame(update);

    // Pause when offscreen
    let visible = true;
    let obs = null;
    if ("IntersectionObserver" in window) {
      obs = new IntersectionObserver(
        (entries) => {
          visible = Boolean(entries[0] && entries[0].isIntersecting);
          if (!visible) {
            cancelAnimationFrame(raf);
            raf = 0;
          } else if (!raf) {
            raf = requestAnimationFrame(update);
          }
        },
        { threshold: 0.05 }
      );
      obs.observe(host);
    }

    // cleanup on navigation (best-effort)
    window.addEventListener(
      "beforeunload",
      () => {
        cancelAnimationFrame(raf);
        window.removeEventListener("resize", onResize);
        obs && obs.disconnect();
      },
      { passive: true }
    );
  }

  // Wait for CDN + DOM
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAurora, { once: true });
  } else {
    initAurora();
  }
})();

