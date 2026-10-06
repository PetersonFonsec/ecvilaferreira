/**
 * Gera favicon, ícones do app e imagens de compartilhamento (Open Graph) a partir do brasão.
 * O resultado vai para public/ e é versionado; rode de novo só quando o brasão ou os textos mudarem.
 *
 * Uso (o Playwright não é dependência do projeto, por isso é instalado só para rodar o script):
 *   npm i --no-save playwright && npx playwright install chromium
 *   node scripts/gerar-imagens.mjs
 *
 * O brasão vem de src/lib/brasao.ts, as ilustrações de src/data/ilustracoes.ts e os textos de cada
 * imagem de src/data/compartilhamento.ts. O brasão 3D é renderizado com three.js a partir de public/3d.
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const { chromium } = await import('playwright').catch(() => {
  console.error('Playwright não encontrado. Rode: npm i --no-save playwright && npx playwright install chromium');
  process.exit(1);
});
const { svgBrasao, CORES_BRASAO } = await import('../src/lib/brasao.ts');
const { ilustracoes } = await import('../src/data/ilustracoes.ts');
const { imagensSecoes } = await import('../src/data/compartilhamento.ts');

const raiz = path.resolve(fileURLToPath(import.meta.url), '../..');
const publico = path.join(raiz, 'public');
const ORIGEM = 'http://marca.local';

const VERDE = CORES_BRASAO.verde;
const VERDE_900 = '#052a13';
const OURO = CORES_BRASAO.ouro;
const CREME = '#f6f1e3';

const tipos = { '.js': 'text/javascript', '.woff2': 'font/woff2', '.glb': 'model/gltf-binary', '.html': 'text/html' };

const fontes = [600, 700, 800, 900]
  .map(
    (peso) =>
      `@font-face{font-family:'Barlow Condensed';font-weight:${peso};src:url(/node_modules/@fontsource/barlow-condensed/files/barlow-condensed-latin-${peso}-normal.woff2) format('woff2')}`,
  )
  .join('');

const navegador = await chromium.launch({
  // Permite apontar para um Chromium já instalado (ex.: CHROMIUM_PATH=/opt/pw-browsers/...).
  executablePath: process.env.CHROMIUM_PATH,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});

async function novaPagina(largura, altura, escala = 1) {
  const pagina = await navegador.newPage({ viewport: { width: largura, height: altura }, deviceScaleFactor: escala });
  // Serve arquivos do projeto (fontes, three.js, modelo 3D) numa origem falsa.
  await pagina.route(`${ORIGEM}/**`, async (rota) => {
    const caminho = decodeURIComponent(new URL(rota.request().url()).pathname);
    try {
      const corpo = await readFile(path.join(raiz, caminho));
      await rota.fulfill({ body: corpo, contentType: tipos[path.extname(caminho)] ?? 'application/octet-stream' });
    } catch {
      await rota.fulfill({ status: 404, body: '' });
    }
  });
  return pagina;
}

async function capturar({ html, largura, altura, escala = 1, arquivo, transparente = false, jpeg = false }) {
  const pagina = await novaPagina(largura, altura, escala);
  await pagina.route(`${ORIGEM}/pagina.html`, (rota) => rota.fulfill({ body: html, contentType: 'text/html' }));
  await pagina.goto(`${ORIGEM}/pagina.html`);
  await pagina.waitForFunction(() => document.title === 'pronto', null, { timeout: 60_000 });
  await pagina.evaluate(() => document.fonts.ready);
  const png = await pagina.screenshot(
    jpeg ? { type: 'jpeg', quality: 86 } : { omitBackground: transparente, type: 'png' },
  );
  await pagina.close();
  if (arquivo) {
    await mkdir(path.dirname(arquivo), { recursive: true });
    await writeFile(arquivo, png);
    console.log('✓', path.relative(raiz, arquivo));
  }
  return png;
}

const paginaSimples = (corpo, estilo = '') => `<!doctype html><html><head><meta charset="utf-8"><style>
${fontes}
*{margin:0;box-sizing:border-box}
html,body{width:100%;height:100%;background:transparent}
${estilo}
</style></head><body>${corpo}
<script>document.fonts.ready.then(()=>requestAnimationFrame(()=>document.title='pronto'))</script></body></html>`;

/** Brasão 3D renderizado com three.js, quase de frente. */
async function brasao3D() {
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
const pivo = new THREE.Group(); pivo.add(m); pivo.rotation.set(0.06, 0.22, 0.02); cena.add(pivo);
r.render(cena, cam); document.title = 'pronto';
</script></body></html>`;
  const png = await capturar({ html, largura: 900, altura: 1000, transparente: true });
  return `data:image/png;base64,${png.toString('base64')}`;
}

function svgIlustracao(nome, cor = '#fff', espessura = 3, destaque = OURO) {
  const d = ilustracoes[nome];
  const preenche = (d.preenchimentos ?? [])
    .map((p) => `<path d="${p.d}" fill="${p.cor === 'traco' ? cor : destaque}"/>`)
    .join('');
  const tracos = d.tracos.map((t) => `<path d="${t}" stroke="${cor}"/>`).join('');
  const destaques = (d.destaques ?? []).map((t) => `<path d="${t}" stroke="${destaque}"/>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${d.viewBox}" fill="none" stroke-width="${espessura}" stroke-linecap="round" stroke-linejoin="round">${preenche}${tracos}${destaques}</svg>`;
}

// ---------- Ícones ----------
const brasaoFixo = (opcoes) => svgBrasao({ cores: 'fixas', id: 'b', ...opcoes });

function estrela(cx, cy, r) {
  const p = [];
  for (let i = 0; i < 10; i++) {
    const raio = i % 2 === 0 ? r : r * 0.42;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    p.push(`${(cx + raio * Math.cos(a)).toFixed(2)},${(cy + raio * Math.sin(a)).toFixed(2)}`);
  }
  return `M${p.join('L')}Z`;
}

/**
 * Favicon: o brasão redondo simplificado (sem textos), com aro dourado e o Cruzeiro do Sul
 * em estrelas grandes para continuar legível em 16 px. Desenhado num quadro de 64×64.
 */
const CRUZEIRO = [
  [-14.4, -45, 8],
  [-44, -10.3, 8],
  [30, -20.6, 7.5],
  [25.8, 22.2, 7.5],
  [-19.6, 42.3, 6],
];
const svgFavicon = (lado = 64) => {
  const s = 64 / 200;
  const estrelas = CRUZEIRO.map(([x, y, r]) => estrela(32 + x * 0.86 * s, 32 + y * 0.86 * s, r * 1.7 * s)).join('');
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${lado}" height="${lado}" viewBox="0 0 64 64">` +
    `<circle cx="32" cy="32" r="31.5" fill="${OURO}"/><circle cx="32" cy="32" r="28.5" fill="${VERDE}"/>` +
    `<circle cx="32" cy="32" r="19.5" fill="#fff"/><path fill="${VERDE}" d="${estrelas}"/></svg>`
  );
};

await writeFile(path.join(publico, 'favicon.svg'), svgFavicon() + '\n');
console.log('✓ public/favicon.svg');

// favicon.ico com 16, 32 e 48 px (PNG dentro do ICO, aceito por todos os navegadores atuais).
const tamanhosIco = [16, 32, 48];
const pngsIco = [];
for (const t of tamanhosIco) {
  pngsIco.push(
    await capturar({
      html: paginaSimples(svgFavicon(t), 'svg{display:block}'),
      largura: t,
      altura: t,
      transparente: true,
    }),
  );
}
{
  const cabecalho = Buffer.alloc(6 + 16 * pngsIco.length);
  cabecalho.writeUInt16LE(0, 0);
  cabecalho.writeUInt16LE(1, 2);
  cabecalho.writeUInt16LE(pngsIco.length, 4);
  let deslocamento = cabecalho.length;
  pngsIco.forEach((png, i) => {
    const t = tamanhosIco[i];
    const base = 6 + 16 * i;
    cabecalho.writeUInt8(t, base);
    cabecalho.writeUInt8(t, base + 1);
    cabecalho.writeUInt16LE(1, base + 4);
    cabecalho.writeUInt16LE(32, base + 6);
    cabecalho.writeUInt32LE(png.length, base + 8);
    cabecalho.writeUInt32LE(deslocamento, base + 12);
    deslocamento += png.length;
  });
  await writeFile(path.join(publico, 'favicon.ico'), Buffer.concat([cabecalho, ...pngsIco]));
  console.log('✓ public/favicon.ico');
}

/** Ícone quadrado com fundo creme e o favicon centralizado. `ocupacao` é a fração do lado. */
const icone = (lado, ocupacao) =>
  paginaSimples(
    `<div class="i">${svgFavicon(Math.round(lado * ocupacao))}</div>`,
    `.i{width:${lado}px;height:${lado}px;display:grid;place-items:center;
      background:radial-gradient(circle at 50% 45%, #fffaf0, ${CREME})}`,
  );

await capturar({ html: icone(180, 0.8), largura: 180, altura: 180, arquivo: path.join(publico, 'apple-touch-icon.png') });
await capturar({ html: icone(192, 0.8), largura: 192, altura: 192, arquivo: path.join(publico, 'icones/icone-192.png') });
await capturar({ html: icone(512, 0.8), largura: 512, altura: 512, arquivo: path.join(publico, 'icones/icone-512.png') });
// Maskable: o sistema pode recortar em círculo, então o brasão ocupa só a zona segura (~60%).
await capturar({ html: icone(512, 0.58), largura: 512, altura: 512, arquivo: path.join(publico, 'icones/icone-mascara-512.png') });

// Brasão em PNG transparente (logo no JSON-LD e para quem precisar da arte).
await capturar({
  html: paginaSimples(brasaoFixo({ tamanho: 1024, estrelas: true }), 'svg{display:block}'),
  largura: 1024,
  altura: Math.round((1024 * 244) / 200),
  transparente: true,
  arquivo: path.join(publico, 'brasao.png'),
});

// ---------- Imagens de compartilhamento (1200×630, JPEG para ficar abaixo de 300 KB, limite do WhatsApp) ----------
const imagem3D = await brasao3D();

/** Títulos longos diminuem; palavras longas (ex.: PATROCINADORES) não quebram, então diminuem mais. */
function tamanhoTitulo(titulo) {
  const maiorPalavra = Math.max(...titulo.split(' ').map((p) => p.length));
  if (maiorPalavra >= 13) return 83;
  return titulo.length > 18 ? 96 : titulo.length > 12 ? 112 : 124;
}

const og = (secao) =>
  paginaSimples(
    `<div class="og">
      <div class="campo">${svgIlustracao('campo', 'rgba(11,100,39,.09)', 2, 'rgba(11,100,39,.09)')}</div>
      <img class="brasao" src="${imagem3D}" alt="">
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
     .ilu{width:84px;margin-bottom:6px}
     .ilu svg{width:100%;display:block}
     .chapeu{display:flex;align-items:center;gap:14px;font-weight:700;font-size:26px;letter-spacing:.2em;text-transform:uppercase;color:${VERDE}}
     .chapeu::before{content:'';width:48px;height:4px;background:${OURO}}
     h1{font-weight:900;font-size:${tamanhoTitulo(secao.titulo)}px;line-height:.88;text-transform:uppercase;color:${VERDE}}
     .sub{font-weight:600;font-size:34px;line-height:1.1;color:#2b4a35;max-width:560px}
     .rodape{position:absolute;left:70px;width:620px;bottom:40px;display:flex;justify-content:space-between;
        font-weight:700;font-size:21px;letter-spacing:.14em;text-transform:uppercase;color:rgba(5,42,19,.6)}`,
  );

for (const secao of imagensSecoes) {
  await capturar({ html: og(secao), largura: 1200, altura: 630, jpeg: true, arquivo: path.join(publico, secao.arquivo) });
}

await navegador.close();
