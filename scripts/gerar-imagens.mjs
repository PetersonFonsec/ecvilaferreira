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

const VERDE_900 = '#052a13';
const OURO = CORES_BRASAO.ouro;

const tipos = { '.js': 'text/javascript', '.woff2': 'font/woff2', '.glb': 'model/gltf-binary', '.html': 'text/html' };

const fontes = [600, 700, 800]
  .map(
    (peso) =>
      `@font-face{font-family:'Barlow Condensed';font-weight:${peso};src:url(/node_modules/@fontsource/barlow-condensed/files/barlow-condensed-latin-${peso}-normal.woff2) format('woff2')}`,
  )
  .join('');

const navegador = await chromium.launch({
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

/** Brasão 3D renderizado com three.js, de frente e levemente girado. */
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
const pivo = new THREE.Group(); pivo.add(m); pivo.rotation.set(0.06, -0.38, 0.02); cena.add(pivo);
r.render(cena, cam); document.title = 'pronto';
</script></body></html>`;
  const png = await capturar({ html, largura: 900, altura: 1000, transparente: true });
  return `data:image/png;base64,${png.toString('base64')}`;
}

function svgIlustracao(nome, cor = '#fff', espessura = 3) {
  const d = ilustracoes[nome];
  const preenche = (d.preenchimentos ?? [])
    .map((p) => `<path d="${p.d}" fill="${p.cor === 'traco' ? cor : OURO}"/>`)
    .join('');
  const tracos = d.tracos.map((t) => `<path d="${t}" stroke="${cor}"/>`).join('');
  const destaques = (d.destaques ?? []).map((t) => `<path d="${t}" stroke="${OURO}"/>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${d.viewBox}" fill="none" stroke-width="${espessura}" stroke-linecap="round" stroke-linejoin="round">${preenche}${tracos}${destaques}</svg>`;
}

// ---------- Ícones ----------
const brasaoFixo = (opcoes) => svgBrasao({ cores: 'fixas', id: 'b', ...opcoes });

// favicon.svg: versão simples (sem letras e sem as estrelas de cima), legível em 16 px.
await writeFile(path.join(publico, 'favicon.svg'), brasaoFixo({ tamanho: 64, simples: true, estrelas: false }) + '\n');
console.log('✓ public/favicon.svg');

// favicon.ico com 16, 32 e 48 px (PNG dentro do ICO, aceito por todos os navegadores atuais).
const tamanhosIco = [16, 32, 48];
const pngsIco = [];
for (const t of tamanhosIco) {
  pngsIco.push(
    await capturar({
      html: paginaSimples(brasaoFixo({ tamanho: t, simples: true, estrelas: false }), 'svg{display:block}'),
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

/** Ícone quadrado com fundo verde e o brasão completo centralizado. `ocupacao` é a fração da altura. */
const icone = (lado, ocupacao) =>
  paginaSimples(
    `<div class="i">${brasaoFixo({ tamanho: 200, estrelas: true })}</div>`,
    `.i{width:${lado}px;height:${lado}px;display:grid;place-items:center;
      background:radial-gradient(circle at 50% 55%, #118033 0%, ${VERDE_900} 70%)}
     .i svg{height:${Math.round(lado * ocupacao)}px;width:auto}`,
  );

await capturar({ html: icone(180, 0.84), largura: 180, altura: 180, arquivo: path.join(publico, 'apple-touch-icon.png') });
await capturar({ html: icone(192, 0.84), largura: 192, altura: 192, arquivo: path.join(publico, 'icones/icone-192.png') });
await capturar({ html: icone(512, 0.84), largura: 512, altura: 512, arquivo: path.join(publico, 'icones/icone-512.png') });
// Maskable: o sistema pode recortar em círculo, então o brasão ocupa só a zona segura (~60%).
await capturar({ html: icone(512, 0.6), largura: 512, altura: 512, arquivo: path.join(publico, 'icones/icone-mascara-512.png') });

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

const og = (secao) =>
  paginaSimples(
    `<div class="og">
      <div class="campo">${svgIlustracao('campo', 'rgba(255,255,255,.08)', 2)}</div>
      <div class="brilho"></div>
      <img class="brasao" src="${imagem3D}" alt="">
      <div class="texto">
        <p class="chapeu">${secao.chapeu}</p>
        <h1>${secao.titulo}</h1>
        <p class="sub">${secao.subtitulo}</p>
      </div>
      ${secao.ilustracao !== 'campo' ? `<div class="ilu">${svgIlustracao(secao.ilustracao, 'rgba(255,255,255,.9)', 3)}</div>` : ''}
      <div class="rodape"><span>Esporte Clube Vila Ferreira</span><span>ecvilaferreira.com.br</span></div>
    </div>`,
    `.og{position:relative;width:1200px;height:630px;overflow:hidden;color:#fff;font-family:'Barlow Condensed',sans-serif;
        background:radial-gradient(ellipse 60% 80% at 22% 50%, rgba(17,128,51,.75), transparent 70%),
          repeating-linear-gradient(90deg, rgba(255,255,255,.035) 0 70px, transparent 70px 140px), ${VERDE_900}}
     .og::after{content:'';position:absolute;inset:auto 0 0;height:8px;background:${OURO}}
     .campo{position:absolute;inset:-40px -60px auto -60px;transform:perspective(900px) rotateX(50deg);transform-origin:50% 0;opacity:.9}
     .campo svg{width:100%}
     .brilho{position:absolute;left:40px;top:90px;width:440px;height:440px;border-radius:50%;
        background:radial-gradient(circle, rgba(242,203,44,.35), transparent 65%);filter:blur(10px)}
     .brasao{position:absolute;left:-10px;top:10px;height:610px;filter:drop-shadow(0 30px 40px rgba(0,0,0,.45))}
     .texto{position:absolute;left:520px;right:60px;top:0;bottom:70px;display:flex;flex-direction:column;justify-content:center;gap:14px}
     .chapeu{display:flex;align-items:center;gap:14px;font-weight:700;font-size:26px;letter-spacing:.2em;text-transform:uppercase;color:${OURO}}
     .chapeu::before{content:'';width:48px;height:3px;background:${OURO}}
     h1{font-weight:800;font-size:${secao.titulo.length > 18 ? 96 : 118}px;line-height:.9;text-transform:uppercase;letter-spacing:-.005em}
     .sub{font-weight:600;font-size:34px;line-height:1.1;color:#e6f4ea;max-width:560px}
     .ilu{position:absolute;right:40px;top:40px;width:130px;opacity:.95}
     .ilu svg{width:100%}
     .rodape{position:absolute;left:520px;right:60px;bottom:34px;display:flex;justify-content:space-between;
        font-weight:700;font-size:22px;letter-spacing:.14em;text-transform:uppercase;color:rgba(255,255,255,.75)}`,
  );

for (const secao of imagensSecoes) {
  await capturar({ html: og(secao), largura: 1200, altura: 630, jpeg: true, arquivo: path.join(publico, secao.arquivo) });
}

await navegador.close();
