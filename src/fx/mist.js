// Niebla de spray en WebGL detrás de toda la web: ruido fractal en ciruela y magenta, con una mancha de luz
// que sigue al puntero (o al dedo) y una deriva ligada al scroll.
// Se pausa fuera de pantalla o con la pestaña oculta. Con movimiento reducido pinta un solo fotograma.
const VERT = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;
const FRAG = `
precision mediump float;
uniform vec2 uRes; uniform float uTime; uniform vec2 uMouse; uniform float uInk; uniform float uScroll;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f*f*(3.0-2.0*f);
  return mix(mix(hash(i), hash(i+vec2(1,0)), u.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), u.x), u.y); }
float fbm(vec2 p){ float v = 0.0, a = 0.5; for (int i = 0; i < 5; i++){ v += a*noise(p); p *= 2.03; a *= 0.5; } return v; }
void main(){
  vec2 uv = gl_FragCoord.xy / uRes; vec2 q = uv; q.x *= uRes.x / uRes.y; q.y += uScroll;
  float t = uTime * 0.035;
  vec2 m = uMouse; m.x *= uRes.x / uRes.y; m.y += uScroll;
  float d = distance(q, m);
  vec2 warp = vec2(fbm(q*1.6 + t), fbm(q*1.6 - t + 4.0));
  float n = fbm(q*2.2 + warp*1.4 + vec2(t*0.6, -t));
  vec3 noche = vec3(0.075, 0.039, 0.086);
  vec3 magenta = vec3(0.43, 0.10, 0.36);
  vec3 cian = vec3(0.27, 0.84, 0.90);
  vec3 naranja = vec3(1.0, 0.36, 0.10);
  vec3 col = mix(noche, magenta, smoothstep(0.35, 0.95, n) * 0.85);
  col += cian * smoothstep(0.72, 1.0, fbm(q*3.0 - warp + t)) * 0.10;
  float glow = exp(-d*d*7.0) * uInk;
  col += mix(magenta*1.3, naranja, 0.35) * glow * (0.35 + 0.65*n);
  float grain = hash(gl_FragCoord.xy + fract(uTime)) * 0.05;
  col += grain - 0.025;
  float vig = smoothstep(1.25, 0.35, distance(uv, vec2(0.5)));
  gl_FragColor = vec4(col * (0.55 + 0.45*vig), 1.0);
}`;

export function createMist(canvas, { reduced }) {
  const gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' });
  if (!gl) return { destroy() {} }; // queda el degradado CSS de respaldo
  const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
  const prog = gl.createProgram();
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return { destroy() {} };
  gl.useProgram(prog);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const u = (n) => gl.getUniformLocation(prog, n);
  const uRes = u('uRes'), uTime = u('uTime'), uMouse = u('uMouse'), uInk = u('uInk'), uScroll = u('uScroll');

  const scale = 0.5; // media resolución: es niebla, no necesita más
  const mouse = { x: 0.5, y: 0.55, tx: 0.5, ty: 0.55, ink: 0.4, tink: 0.4 };
  let raf = 0, visible = true, t0 = performance.now(), sc = 0;

  const resize = () => {
    const r = canvas.getBoundingClientRect();
    canvas.width = Math.max(2, Math.round(r.width * scale));
    canvas.height = Math.max(2, Math.round(r.height * scale));
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(uRes, canvas.width, canvas.height);
    if (reduced) draw(8);
  };
  const draw = (time) => {
    mouse.x += (mouse.tx - mouse.x) * 0.06; mouse.y += (mouse.ty - mouse.y) * 0.06;
    mouse.ink += (mouse.tink - mouse.ink) * 0.05;
    gl.uniform1f(uTime, time);
    gl.uniform2f(uMouse, mouse.x, mouse.y);
    gl.uniform1f(uInk, mouse.ink);
    sc += (scrollY / innerHeight * 0.35 - sc) * 0.08;
    gl.uniform1f(uScroll, sc);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };
  const loop = (now) => { draw((now - t0) / 1000 * 1.0 + 8); raf = requestAnimationFrame(loop); };
  const start = () => { if (!raf && visible && !reduced && !document.hidden) raf = requestAnimationFrame(loop); };
  const stop = () => { cancelAnimationFrame(raf); raf = 0; };

  const onMove = (e) => {
    mouse.tx = e.clientX / innerWidth; mouse.ty = 1 - e.clientY / innerHeight;
    mouse.tink = e.type === 'pointerdown' ? 1.6 : 1;
    if (reduced) draw(8);
  };
  const onLeave = () => { mouse.tink = 0.4; };
  const host = window;
  host.addEventListener('pointermove', onMove, { passive: true });
  host.addEventListener('pointerdown', onMove, { passive: true });
  document.addEventListener('pointerleave', onLeave);
  const ro = new ResizeObserver(resize); ro.observe(canvas);
  const onVis = () => (document.hidden ? stop() : start());
  document.addEventListener('visibilitychange', onVis);
  resize(); start();
  return {
    destroy() {
      stop(); ro.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      host.removeEventListener('pointermove', onMove);
      host.removeEventListener('pointerdown', onMove);
      document.removeEventListener('pointerleave', onLeave);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    },
  };
}
