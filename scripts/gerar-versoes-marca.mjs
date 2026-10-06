/**
 * Gera 3 propostas de favicon/ícones e imagens de compartilhamento para comparação.
 * Uso: node scripts/gerar-versoes-marca.mjs <pasta-de-saida>
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { chromium } from 'playwright';

const { svgBrasao, CORES_BRASAO } = await import('../src/lib/brasao.ts');
const { ilustracoes } = await import('../src/data/ilustracoes.ts');
const { imagensSecoes } = await import('../src/data/compartilhamento.ts');

const raiz = path.resolve(fileURLToPath(import.meta.url), '../..');
const saida = path.resolve(process.argv[2] ?? path.join(raiz, 'versoes-marca'));
const ORIGEM = 'http://marca.local';
const VERDE = CORES_BRASAO.verde;
const VERDE_900 = '#052a13';
const OURO = CORES_BRASAO.ouro;
const CREME = '#f6f1e3';

const tipos = { '.js': 'text/javascript', '.woff2': 'font/woff2', '.glb': 'model/gltf-binary' };
const fontes = [600, 700, 800, 900]
  .map(
    (p) =>
      `@font-face{font-family:'Barlow Condensed';font-weight:${p};src:url(/node_modules/@fontsource/barlow-condensed/files/barlow-condensed-latin-${p}-normal.woff2) format('woff2')}`,
  )
  .join('');

const navegador = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});

async function capturar({ html, largura, altura, arquivo, transparente = false, jpeg = false, qualidade = 86 }) {
  const pagina = await navegador.newPage({ viewport: { width: largura, height: altura } });
  await pagina.route(`${ORIGEM}/**`, async (rota) => {
    const caminho = decodeURIComponent(new URL(rota.request().url()).pathname);
    if (caminho === '/pagina.html') return rota.fulfill({ body: html, contentType: 'text/html' });
    try {
      const corpo = await readFile(path.join(raiz, caminho));
      await rota.fulfill({ body: corpo, contentType: tipos[path.extname(caminho)] ?? 'application/octet-stream' });
    } catch {
      await rota.fulfill({ status: 404, body: '' });
    }
  });
  await pagina.goto(`${ORIGEM}/pagina.html`);
  await pagina.waitForFunction(() => document.title === 'pronto', null, { timeout: 60_000 });
  const img = await pagina.screenshot(
    jpeg ? { type: 'jpeg', quality: qualidade } : { omitBackground: transparente, type: 'png' },
  );
  await pagina.close();
  if (arquivo) {
    await mkdir(path.dirname(arquivo), { recursive: true });
    await writeFile(arquivo, img);
  }
  return img;
}

const pagina = (corpo, estilo = '') => `<!doctype html><html><head><meta charset="utf-8"><style>
${fontes}
*{margin:0;box-sizing:border-box}
html,body{width:100%;height:100%;background:transparent}
${estilo}
</style></head><body>${corpo}
<script>document.fonts.ready.then(()=>requestAnimationFrame(()=>document.title='pronto'))</script></body></html>`;

function estrela(cx, cy, r) {
  const p = [];
  for (let i = 0; i < 10; i++) {
    const raio = i % 2 === 0 ? r : r * 0.42;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    p.push(`${(cx + raio * Math.cos(a)).toFixed(2)},${(cy + raio * Math.sin(a)).toFixed(2)}`);
  }
  return `M${p.join('L')}Z`;
}

function svgIlustracao(nome, cor, espessura = 3, destaque = OURO) {
  const d = ilustracoes[nome];
  const preenche = (d.preenchimentos ?? [])
    .map((p) => `<path d="${p.d}" fill="${p.cor === 'traco' ? cor : destaque}"/>`)
    .join('');
  const tracos = d.tracos.map((t) => `<path d="${t}" stroke="${cor}"/>`).join('');
  const destaques = (d.destaques ?? []).map((t) => `<path d="${t}" stroke="${destaque}"/>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${d.viewBox}" fill="none" stroke-width="${espessura}" stroke-linecap="round" stroke-linejoin="round">${preenche}${tracos}${destaques}</svg>`;
}

// Cruzeiro do Sul do brasão, em coordenadas relativas ao centro (raio do brasão = 98).
const CRUZEIRO = [
  [-14.4, -45, 8],
  [-44, -10.3, 8],
  [30, -20.6, 7.5],
  [25.8, 22.2, 7.5],
  [-19.6, 42.3, 6],
];

// ---------- Favicons (SVG 64×64, sem texto para não depender de fonte) ----------

/** V1: o brasão redondo com aro dourado. */
const faviconV1 = (fundo = null) => {
  const s = 64 / 200;
  const estrelas = CRUZEIRO.map(([x, y, r]) => estrela(32 + x * 0.86 * s, 32 + y * 0.86 * s, r * 1.7 * s)).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">${fundo ?? ''}<circle cx="32" cy="32" r="31.5" fill="${OURO}"/><circle cx="32" cy="32" r="28.5" fill="${VERDE}"/><circle cx="32" cy="32" r="19.5" fill="#fff"/><path fill="${VERDE}" d="${estrelas}"/></svg>`;
};

/** V2: monograma VF em bloco, com faixa dourada. Letras desenhadas como polígonos. */
const faviconV2 = ({ cantos = 14 } = {}) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" rx="${cantos}" fill="${VERDE}"/>` +
  `<path fill="#fff" d="M8,12H17.5L21.5,36L25.5,12H35L27,47H16ZM37,12H57V20H46V26.5H55V34H46V47H37Z"/>` +
  `<rect x="8" y="51" width="49" height="5" rx="1" fill="${OURO}"/></svg>`;

/** V3: só o Cruzeiro do Sul, dourado sobre verde, com as linhas da constelação. */
const faviconV3 = ({ cantos = 32 } = {}) => {
  const s = 0.36;
  const pts = CRUZEIRO.map(([x, y, r]) => [32 + x * 0.98 * s * 1.5, 32 + y * 0.98 * s * 1.5, r * s * 2.6]);
  const linhas = `M${pts[0][0]},${pts[0][1]}L${pts[4][0]},${pts[4][1]}M${pts[1][0]},${pts[1][1]}L${pts[2][0]},${pts[2][1]}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" rx="${cantos}" fill="${VERDE}"/><path d="${linhas}" stroke="${OURO}" stroke-opacity=".45" stroke-width="1.6"/><path fill="${OURO}" d="${pts.map(([x, y, r]) => estrela(x, y, r)).join('')}"/></svg>`;
};

/** Ícones quadrados (apple/manifest): conteúdo em `ocupacao` do lado, sobre fundo cheio. */
const iconeHtml = (lado, svg, fundo, ocupacao) =>
  pagina(
    `<div class="i">${svg}</div>`,
    `.i{width:${lado}px;height:${lado}px;display:grid;place-items:center;background:${fundo}}
     .i svg{width:${Math.round(lado * ocupacao)}px;height:${Math.round(lado * ocupacao)}px}`,
  );

const versoes = {
  'v1-brasao': {
    nome: 'Brasão dourado (claro)',
    favicon: faviconV1(),
    icone: { svg: faviconV1(), fundo: `radial-gradient(circle at 50% 45%, #fffaf0, ${CREME})`, ocupacao: 0.8 },
  },
  'v2-monograma': {
    nome: 'Monograma VF (estádio)',
    favicon: faviconV2(),
    icone: { svg: faviconV2({ cantos: 0 }), fundo: VERDE, ocupacao: 1 },
  },
  'v3-cruzeiro': {
    nome: 'Cruzeiro do Sul (pôster)',
    favicon: faviconV3(),
    icone: { svg: faviconV3({ cantos: 0 }), fundo: VERDE, ocupacao: 1 },
  },
};

// ---------- Brasão 3D (reaproveitado nas versões 1 e 2) ----------
async function brasao3D(rotY = -0.38) {
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;background:transparent}</style>
<script type="importmap">{"imports":{"three":"/node_modules/three/build/three.module.js","three/addons/":"/node_modules/three/examples/jsm/"}}</script></head><body>
<script type="module">
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
const r = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
r.setPixelRatio(1); r.setSize(innerWidth, innerHeight);
r.outputColorSpace = THREE.SRGBColorSpace; r.toneMapping = THREE.NeutralToneMapping;
document.body.appendChild(r.domElement);
const cena = new THREE.Scene();
const pm = new THREE.PMREMGenerator(r); cena.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
const luz = new THREE.DirectionalLight(0xfff4dd, 2.2); luz.position.set(2.5, 3, 4); cena.add(luz);
const contra = new THREE.DirectionalLight(0xf2cb2c, 1.4); contra.position.set(-3, -1, -2); cena.add(contra);
const cam = new THREE.PerspectiveCamera(30, innerWidth / innerHeight, 0.1, 100); cam.position.set(0, 0, 6.6);
const loader = new GLTFLoader(); loader.setMeshoptDecoder(MeshoptDecoder);
const g = await loader.loadAsync('/public/3d/vila-ferreira.glb');
const m = g.scene; m.position.sub(new THREE.Box3().setFromObject(m).getCenter(new THREE.Vector3()));
m.traverse((o) => { if (o.isMesh && /estrelas/i.test(o.name)) { o.material.color = new THREE.Color('#f6c40a'); o.material.metalness = 0.55; o.material.roughness = 0.3; o.material.emissive = new THREE.Color('#7a5600'); o.material.emissiveIntensity = 0.5; } });
const pivo = new THREE.Group(); pivo.add(m); pivo.rotation.set(0.06, ${rotY}, 0.02); cena.add(pivo);
r.render(cena, cam); document.title = 'pronto';
</script></body></html>`;
  const png = await capturar({ html, largura: 900, altura: 1000, transparente: true });
  return `data:image/png;base64,${png.toString('base64')}`;
}

const tamanhoTitulo = (t, grande, medio, pequeno) => {
  // Palavras longas (ex.: PATROCINADORES) não quebram, então o tamanho cai para caber na coluna.
  const maiorPalavra = Math.max(...t.split(' ').map((p) => p.length));
  if (maiorPalavra >= 13) return Math.round(pequeno * 0.86);
  return t.length > 18 ? pequeno : t.length > 12 ? medio : grande;
};

// ---------- Imagens de compartilhamento ----------
function ogV1(secao, img3D) {
  return pagina(
    `<div class="og">
      <div class="campo">${svgIlustracao('campo', 'rgba(11,100,39,.09)', 2, 'rgba(11,100,39,.09)')}</div>
      <img class="brasao" src="${img3D}" alt="">
      <div class="texto">
        <div class="ilu">${svgIlustracao(secao.ilustracao === 'campo' ? 'bola' : secao.ilustracao, VERDE, 3.2)}</div>
        <p class="chapeu">${secao.chapeu}</p>
        <h1>${secao.titulo}</h1>
        <p class="sub">${secao.subtitulo}</p>
      </div>
      <div class="rodape"><span>Esporte Clube Vila Ferreira</span><span>ecvilaferreira.com.br</span></div>
    </div>`,
    `.og{position:relative;width:1200px;height:630px;overflow:hidden;color:${VERDE_900};font-family:'Barlow Condensed',sans-serif;
        background:radial-gradient(ellipse 50% 70% at 82% 50%, rgba(242,203,44,.35), transparent 70%), ${CREME}}
     .og::before{content:'';position:absolute;inset:auto 0 0;height:14px;background:linear-gradient(${OURO} 0 6px, ${VERDE} 6px)}
     .campo{position:absolute;inset:-30px -80px auto -80px;transform:perspective(900px) rotateX(52deg);transform-origin:50% 0}
     .campo svg{width:100%}
     .brasao{position:absolute;right:-40px;top:-10px;height:650px;filter:drop-shadow(0 30px 34px rgba(5,42,19,.35))}
     .texto{position:absolute;left:70px;width:620px;top:0;bottom:80px;display:flex;flex-direction:column;justify-content:center;gap:14px}
     .ilu{width:84px;margin-bottom:6px}.ilu svg{width:100%;display:block}
     .chapeu{display:flex;align-items:center;gap:14px;font-weight:700;font-size:26px;letter-spacing:.2em;text-transform:uppercase;color:${VERDE}}
     .chapeu::before{content:'';width:48px;height:4px;background:${OURO}}
     h1{font-weight:900;font-size:${tamanhoTitulo(secao.titulo, 124, 112, 96)}px;line-height:.88;text-transform:uppercase;color:${VERDE}}
     .sub{font-weight:600;font-size:34px;line-height:1.1;color:#2b4a35;max-width:560px}
     .rodape{position:absolute;left:70px;width:620px;bottom:40px;display:flex;justify-content:space-between;
        font-weight:700;font-size:21px;letter-spacing:.14em;text-transform:uppercase;color:rgba(5,42,19,.6)}`,
  );
}

function ogV2(secao, img3D) {
  return pagina(
    `<div class="og">
      <div class="gigante">VILA FERREIRA · VILA FERREIRA</div>
      <div class="faixa"><span>EC Vila Ferreira · 1984</span><span>ecvilaferreira.com.br</span></div>
      <img class="brasao" src="${img3D}" alt="">
      <div class="texto">
        <p class="chapeu">${secao.chapeu}</p>
        <h1>${secao.titulo}</h1>
        <p class="sub">${secao.subtitulo}</p>
      </div>
      ${secao.ilustracao !== 'campo' ? `<div class="ilu">${svgIlustracao(secao.ilustracao, OURO, 3.4, '#fff')}</div>` : ''}
    </div>`,
    `.og{position:relative;width:1200px;height:630px;overflow:hidden;color:#fff;font-family:'Barlow Condensed',sans-serif;
        background:repeating-linear-gradient(90deg, ${VERDE} 0 80px, #0d6f2c 80px 160px)}
     .og::after{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 70% 90% at 75% 50%, transparent 30%, rgba(5,42,19,.75))}
     .gigante{position:absolute;left:-40px;top:300px;white-space:nowrap;font-weight:900;font-size:300px;line-height:1;
        color:transparent;-webkit-text-stroke:2px rgba(255,255,255,.14);transform:rotate(-8deg);transform-origin:0 0;z-index:1}
     .faixa{position:absolute;left:-100px;right:-100px;top:560px;height:76px;background:${OURO};transform:rotate(-8deg);z-index:1;
        box-shadow:0 -10px 0 #fff;display:flex;align-items:center;justify-content:space-between;padding:0 170px 0 150px;
        font-weight:800;font-size:24px;letter-spacing:.16em;text-transform:uppercase;color:${VERDE_900}}
     .brasao{position:absolute;right:30px;top:-20px;height:620px;z-index:2;filter:drop-shadow(0 30px 40px rgba(0,0,0,.5))}
     .texto{position:absolute;left:64px;width:640px;top:40px;bottom:150px;display:flex;flex-direction:column;justify-content:center;gap:16px;z-index:3}
     .chapeu{align-self:flex-start;background:${OURO};color:${VERDE_900};font-weight:800;font-size:24px;letter-spacing:.16em;text-transform:uppercase;padding:6px 14px}
     h1{font-weight:900;font-size:${tamanhoTitulo(secao.titulo, 128, 114, 98)}px;line-height:.86;text-transform:uppercase;text-shadow:0 6px 0 rgba(5,42,19,.55)}
     .sub{font-weight:600;font-size:32px;line-height:1.1;color:#e8f5ec;max-width:560px}
     .ilu{position:absolute;right:430px;top:40px;width:96px;z-index:3;opacity:.95}.ilu svg{width:100%}
`,
  );
}

function ogV3(secao) {
  const constelacao = () => {
    const s = 2.4;
    const pts = CRUZEIRO.map(([x, y, r]) => [200 + x * s, 200 + y * s, r * s * 1.1]);
    const linhas = `M${pts[0][0]},${pts[0][1]}L${pts[4][0]},${pts[4][1]}M${pts[1][0]},${pts[1][1]}L${pts[2][0]},${pts[2][1]}`;
    return `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg"><circle cx="200" cy="200" r="190" fill="none" stroke="${VERDE}" stroke-width="3" stroke-dasharray="2 12" stroke-linecap="round"/><path d="${linhas}" stroke="${VERDE}" stroke-width="3"/><path fill="${VERDE}" d="${pts.map(([x, y, r]) => estrela(x, y, r)).join('')}"/></svg>`;
  };
  const arte = secao.ilustracao === 'campo' ? constelacao() : svgIlustracao(secao.ilustracao, VERDE, 3.6, '#fff');
  return pagina(
    `<div class="og">
      <div class="topo">${svgBrasao({ cores: 'fixas', id: 'p', tamanho: 64, estrelas: true })}<span>Esporte Clube<br>Vila Ferreira</span></div>
      <div class="arte">${arte}</div>
      <div class="texto">
        <p class="chapeu">${secao.chapeu}</p>
        <h1>${secao.titulo}</h1>
        <p class="sub">${secao.subtitulo}</p>
      </div>
      <div class="lateral">ecvilaferreira.com.br</div>
    </div>`,
    `.og{position:relative;width:1200px;height:630px;overflow:hidden;color:${VERDE_900};font-family:'Barlow Condensed',sans-serif;
        background:radial-gradient(circle at 80% 40%, #f8dc62, ${OURO} 60%)}
     .og::before{content:'';position:absolute;left:0;top:0;bottom:0;width:22px;background:${VERDE}}
     .topo{position:absolute;left:70px;top:46px;display:flex;align-items:center;gap:16px;font-weight:800;font-size:24px;line-height:1;letter-spacing:.12em;text-transform:uppercase;color:${VERDE}}
     .arte{position:absolute;right:70px;top:60px;width:400px;height:400px;display:grid;place-items:center}
     .arte svg{width:100%;height:100%}
     .texto{position:absolute;left:70px;right:70px;bottom:56px;display:flex;flex-direction:column;gap:12px}
     .chapeu{font-weight:800;font-size:26px;letter-spacing:.22em;text-transform:uppercase;color:${VERDE}}
     h1{font-weight:900;font-size:${tamanhoTitulo(secao.titulo, 140, 116, 108)}px;line-height:.84;text-transform:uppercase;color:${VERDE};max-width:650px}
     .sub{font-weight:700;font-size:32px;line-height:1.1;max-width:640px}
     .lateral{position:absolute;right:30px;bottom:60px;writing-mode:vertical-rl;transform:rotate(180deg);font-weight:800;font-size:20px;letter-spacing:.2em;text-transform:uppercase;color:rgba(5,42,19,.55)}`,
  );
}

// ---------- Gera tudo ----------
function ico(pngs, tamanhos) {
  const cab = Buffer.alloc(6 + 16 * pngs.length);
  cab.writeUInt16LE(1, 2);
  cab.writeUInt16LE(pngs.length, 4);
  let desl = cab.length;
  pngs.forEach((png, i) => {
    const b = 6 + 16 * i;
    cab.writeUInt8(tamanhos[i], b);
    cab.writeUInt8(tamanhos[i], b + 1);
    cab.writeUInt16LE(1, b + 4);
    cab.writeUInt16LE(32, b + 6);
    cab.writeUInt32LE(png.length, b + 8);
    cab.writeUInt32LE(desl, b + 12);
    desl += png.length;
  });
  return Buffer.concat([cab, ...pngs]);
}

const img3DPadrao = await brasao3D(-0.38);
const img3DFrente = await brasao3D(0.22);
const geradoresOg = {
  'v1-brasao': (s) => ogV1(s, img3DFrente),
  'v2-monograma': (s) => ogV2(s, img3DPadrao),
  'v3-cruzeiro': (s) => ogV3(s),
};

for (const [pasta, v] of Object.entries(versoes)) {
  const dir = path.join(saida, pasta);
  await mkdir(path.join(dir, 'icones'), { recursive: true });
  await writeFile(path.join(dir, 'favicon.svg'), v.favicon + '\n');
  const pngs = [];
  for (const t of [16, 32, 48]) {
    pngs.push(
      await capturar({ html: pagina(v.favicon.replace('width="64" height="64"', `width="${t}" height="${t}"`), 'svg{display:block}'), largura: t, altura: t, transparente: true }),
    );
  }
  await writeFile(path.join(dir, 'favicon.ico'), ico(pngs, [16, 32, 48]));
  const { svg, fundo, ocupacao } = v.icone;
  await capturar({ html: iconeHtml(180, svg, fundo, ocupacao), largura: 180, altura: 180, arquivo: path.join(dir, 'apple-touch-icon.png') });
  await capturar({ html: iconeHtml(192, svg, fundo, ocupacao), largura: 192, altura: 192, arquivo: path.join(dir, 'icones/icone-192.png') });
  await capturar({ html: iconeHtml(512, svg, fundo, ocupacao), largura: 512, altura: 512, arquivo: path.join(dir, 'icones/icone-512.png') });
  await capturar({ html: iconeHtml(512, svg, fundo, ocupacao * 0.72), largura: 512, altura: 512, arquivo: path.join(dir, 'icones/icone-mascara-512.png') });
  for (const secao of imagensSecoes) {
    await capturar({ html: geradoresOg[pasta](secao), largura: 1200, altura: 630, jpeg: true, arquivo: path.join(dir, secao.arquivo.slice(1)) });
  }
  console.log('✓', pasta);
}

await navegador.close();
