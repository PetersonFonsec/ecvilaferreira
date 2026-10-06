/**
 * Gera as imagens ilustrativas do conteúdo de demonstração (scripts/conteudo-exemplo/imagens/).
 * São capas desenhadas com as ilustrações do site, produtos em arte chapada e logos de empresas
 * fictícias. As imagens já estão versionadas: rode de novo só se quiser mudar alguma.
 *
 * Uso (o Playwright não é dependência do projeto, por isso é instalado só para rodar o script):
 *   npm i --no-save playwright && npx playwright install chromium
 *   node scripts/gerar-imagens-exemplo.mjs
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const { chromium } = await import('playwright').catch(() => {
  console.error('Playwright não encontrado. Rode: npm i --no-save playwright && npx playwright install chromium');
  process.exit(1);
});
const { svgBrasao, CORES_BRASAO } = await import('../src/lib/brasao.ts');
const { ilustracoes } = await import('../src/data/ilustracoes.ts');

const raiz = path.resolve(fileURLToPath(import.meta.url), '../..');
const destino = path.join(raiz, 'scripts/conteudo-exemplo/imagens');

const VERDE = CORES_BRASAO.verde;
const VERDE_900 = '#052a13';
const VERDE_950 = '#031a0b';
const OURO = CORES_BRASAO.ouro;
const CREME = '#f6f1e3';

const fonte = await readFile(
  path.join(raiz, 'node_modules/@fontsource/barlow-condensed/files/barlow-condensed-latin-800-normal.woff2'),
);
const fontes = `@font-face{font-family:'Barlow Condensed';font-weight:800;src:url(data:font/woff2;base64,${fonte.toString('base64')}) format('woff2')}`;

const navegador = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH });

async function capturar(corpo, largura, altura, arquivo) {
  const pagina = await navegador.newPage({ viewport: { width: largura, height: altura } });
  await pagina.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>${fontes}
    *{margin:0;box-sizing:border-box}html,body{width:${largura}px;height:${altura}px;background:transparent;overflow:hidden}
    body{font-family:'Barlow Condensed',sans-serif}</style></head><body>${corpo}</body></html>`);
  await pagina.evaluate(() => document.fonts.ready);
  const png = arquivo.endsWith('.png');
  // Logos: recorta só o desenho, sem sobra transparente, para alinhar certo no site.
  const imagem = png
    ? await pagina.locator('body > :first-child').screenshot({ type: 'png', omitBackground: true })
    : await pagina.screenshot({ type: 'jpeg', quality: 82 });
  await pagina.close();
  await writeFile(path.join(destino, arquivo), imagem);
  console.log('✓', arquivo);
}

function svgIlustracao(nome, cor, destaque, espessura = 3) {
  const d = ilustracoes[nome];
  const preenche = (d.preenchimentos ?? [])
    .map((p) => `<path d="${p.d}" fill="${p.cor === 'traco' ? cor : destaque}"/>`)
    .join('');
  const tracos = d.tracos.map((t) => `<path d="${t}" stroke="${cor}"/>`).join('');
  const destaques = (d.destaques ?? []).map((t) => `<path d="${t}" stroke="${destaque}"/>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${d.viewBox}" fill="none" stroke-width="${espessura}" stroke-linecap="round" stroke-linejoin="round">${preenche}${tracos}${destaques}</svg>`;
}

const temas = {
  verde: { fundo: `radial-gradient(ellipse 70% 80% at 50% 45%, #118033, ${VERDE} 45%, ${VERDE_900})`, traco: '#fff', destaque: OURO, linhas: 'rgba(255,255,255,.12)', rotulo: 'rgba(255,255,255,.7)' },
  creme: { fundo: `radial-gradient(ellipse 60% 70% at 50% 45%, #fffaf0, ${CREME} 60%, #ebe2c8)`, traco: VERDE, destaque: '#d4a514', linhas: 'rgba(11,100,39,.12)', rotulo: 'rgba(5,42,19,.55)' },
  ouro: { fundo: `radial-gradient(ellipse 70% 80% at 50% 45%, #f8e08a, ${OURO} 50%, #d4a514)`, traco: VERDE_900, destaque: '#fff', linhas: 'rgba(5,42,19,.14)', rotulo: 'rgba(5,42,19,.65)' },
};

/**
 * Capa 1600×1000 com uma ilustração grande no centro e outra menor ao lado.
 * O desenho fica no meio para sobreviver aos recortes do site (16:10, 4:3 e 4:5).
 */
function capa({ tema, principal, secundaria, numero }) {
  const t = temas[tema];
  const centro = numero
    ? `<div class="numero">${numero}</div>`
    : `<div class="principal">${svgIlustracao(principal, t.traco, t.destaque, 3.4)}</div>`;
  return `<div class="capa">
    <div class="campo">${svgIlustracao('campo', t.linhas, t.linhas, 2)}</div>
    ${centro}
    ${secundaria ? `<div class="secundaria">${svgIlustracao(secundaria, t.traco, t.destaque, 4)}</div>` : ''}
    <p class="rotulo">Imagem ilustrativa</p>
  </div>
  <style>
    .capa{position:relative;width:1600px;height:1000px;overflow:hidden;background:${t.fundo}}
    .capa::after{content:'';position:absolute;inset:auto 0 0;height:18px;background:linear-gradient(${OURO} 0 7px, ${VERDE_900} 7px)}
    .campo{position:absolute;inset:180px -260px auto;transform:perspective(1100px) rotateX(58deg);transform-origin:50% 0}
    .campo svg{width:100%;display:block}
    .principal{position:absolute;left:50%;top:47%;width:560px;transform:translate(-50%,-50%)}
    .principal svg,.secundaria svg{width:100%;display:block}
    .secundaria{position:absolute;left:calc(50% + 190px);top:56%;width:230px;transform:rotate(-8deg)}
    .numero{position:absolute;left:50%;top:46%;transform:translate(-50%,-50%);font-size:520px;font-weight:800;line-height:1;color:${t.traco};
      text-shadow:14px 14px 0 ${t.destaque}}
    .rotulo{position:absolute;left:0;right:0;bottom:46px;text-align:center;font-size:26px;font-weight:800;letter-spacing:.3em;text-transform:uppercase;color:${t.rotulo}}
  </style>`;
}

/* ---------- Produtos (1200×1200, arte chapada) ---------- */

const brasao = (tamanho) => svgBrasao({ tamanho, cores: 'fixas', estrelas: true, id: `b${tamanho}` });

const camisa = ({ corpo, manga, gola, detalhe, costas = false }) => `
  <svg viewBox="0 0 600 600" width="760" height="760" xmlns="http://www.w3.org/2000/svg">
    <path d="M210,70 L130,100 L40,190 L110,270 L160,230 L160,540 Q300,560 440,540 L440,230 L490,270 L560,190 L470,100 L390,70 Q300,120 210,70Z"
      fill="${corpo}" stroke="rgba(0,0,0,.18)" stroke-width="3" stroke-linejoin="round"/>
    <path d="M130,100 L40,190 L110,270 L160,230 L160,150Z M470,100 L560,190 L490,270 L440,230 L440,150Z" fill="${manga}"/>
    <path d="M40,190 L110,270 L100,282 L28,202Z M560,190 L490,270 L500,282 L572,202Z" fill="${detalhe}"/>
    <path d="M210,70 Q300,${costas ? 100 : 150} 390,70 Q300,${costas ? 86 : 122} 210,70Z" fill="${gola}" stroke="${gola}" stroke-width="10" stroke-linejoin="round"/>
    <path d="M160,520 Q300,540 440,520" stroke="${detalhe}" stroke-width="10" fill="none"/>
  </svg>`;

function produto(arte, extra = '') {
  return `<div class="produto">${arte}${extra}<p class="rotulo">Imagem ilustrativa</p></div>
  <style>
    .produto{position:relative;width:1200px;height:1200px;display:grid;place-items:center;
      background:radial-gradient(circle at 50% 45%, #fffaf0, ${CREME} 55%, #e9dfc2)}
    .produto>svg{filter:drop-shadow(0 40px 40px rgba(5,42,19,.25))}
    .escudo{position:absolute}
    .rotulo{position:absolute;left:0;right:0;bottom:50px;text-align:center;font-size:26px;font-weight:800;letter-spacing:.3em;text-transform:uppercase;color:rgba(5,42,19,.5)}
  </style>`;
}

const estrelasDouradas = (x, y) =>
  `<svg class="escudo" style="left:${x}px;top:${y}px" width="120" height="40" viewBox="0 0 120 40">
    ${[20, 60, 100].map((cx) => `<path fill="${OURO}" d="${estrela(cx, 20, 16)}"/>`).join('')}</svg>`;

function estrela(cx, cy, r) {
  const p = [];
  for (let i = 0; i < 10; i++) {
    const raio = i % 2 === 0 ? r : r * 0.42;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    p.push(`${(cx + raio * Math.cos(a)).toFixed(1)},${(cy + raio * Math.sin(a)).toFixed(1)}`);
  }
  return `M${p.join('L')}Z`;
}

const produtos = {
  'produto-camisa-oficial.jpg': produto(
    camisa({ corpo: VERDE, manga: VERDE, gola: '#fff', detalhe: '#fff' }),
    `<div class="escudo" style="left:640px;top:480px">${brasao(110)}</div>`,
  ),
  'produto-camisa-oficial-costas.jpg': produto(
    camisa({ corpo: VERDE, manga: VERDE, gola: '#fff', detalhe: '#fff', costas: true }),
    `<div class="escudo" style="left:0;right:0;top:410px;text-align:center;color:#fff;font-size:70px;font-weight:800;letter-spacing:.08em">VILA</div>
     <div class="escudo" style="left:0;right:0;top:470px;text-align:center;color:#fff;font-size:300px;font-weight:800;line-height:1;text-shadow:8px 8px 0 ${OURO}">10</div>`,
  ),
  'produto-camisa-treino.jpg': produto(
    camisa({ corpo: '#fbfbf7', manga: VERDE, gola: VERDE, detalhe: OURO }),
    `<div class="escudo" style="left:640px;top:480px">${brasao(110)}</div>`,
  ),
  'produto-bone.jpg': produto(
    `<svg viewBox="0 0 600 400" width="820" height="547">
      <path d="M90,280 Q90,80 300,70 Q510,80 510,280Z" fill="${VERDE}"/>
      <path d="M300,70 L300,280" stroke="rgba(0,0,0,.15)" stroke-width="4"/>
      <path d="M190,96 Q230,180 230,280 M410,96 Q370,180 370,280" stroke="rgba(0,0,0,.12)" stroke-width="4" fill="none"/>
      <circle cx="300" cy="72" r="14" fill="${VERDE_900}"/>
      <path d="M70,280 Q300,250 540,280 Q560,330 520,350 Q300,320 80,350 Q40,330 70,280Z" fill="${VERDE_900}"/>
      <path d="M80,300 Q300,272 530,300" stroke="${OURO}" stroke-width="5" fill="none"/>
    </svg>`,
    `<div class="escudo" style="left:532px;top:470px">${brasao(136)}</div>`,
  ),
  'produto-caneca.jpg': produto(
    `<svg viewBox="0 0 600 600" width="760" height="760">
      <path d="M440,200 Q560,200 560,320 Q560,440 430,440" stroke="#f1ede2" stroke-width="44" fill="none"/>
      <path d="M440,200 Q560,200 560,320 Q560,440 430,440" stroke="rgba(0,0,0,.08)" stroke-width="2" fill="none"/>
      <rect x="110" y="120" width="340" height="400" rx="34" fill="#fbfaf5" stroke="rgba(0,0,0,.1)" stroke-width="2"/>
      <ellipse cx="280" cy="124" rx="170" ry="26" fill="#e9e4d6"/>
      <rect x="110" y="460" width="340" height="24" fill="${VERDE}"/>
    </svg>`,
    `<div class="escudo" style="left:460px;top:430px">${brasao(170)}</div>
     <div class="escudo" style="left:403px;right:0;top:688px;width:290px;text-align:center;color:${VERDE};font-size:40px;font-weight:800;letter-spacing:.1em">DESDE 1984</div>`,
  ),
  'produto-bandeira.jpg': produto(
    `<svg viewBox="0 0 700 500" width="880" height="629">
      <rect x="40" y="30" width="16" height="460" rx="6" fill="#8a6700"/>
      <path d="M56,50 Q260,10 420,60 Q560,100 660,60 L660,380 Q560,420 420,380 Q260,330 56,370Z" fill="${VERDE}"/>
      <path d="M56,170 Q260,130 420,180 Q560,220 660,180 L660,260 Q560,300 420,260 Q260,210 56,250Z" fill="#fff"/>
    </svg>`,
    `<div class="escudo" style="left:520px;top:450px">${brasao(150)}</div>`,
  ),
};

/* ---------- Logos de empresas fictícias (PNG transparente) ---------- */

function logo(sigla, nome, cor) {
  return `<div class="logo"><span class="sigla">${sigla}</span><span class="nome">${nome}</span></div>
  <style>
    .logo{display:inline-flex;height:240px;align-items:center;gap:28px;padding:0 8px;color:${VERDE_950}}
    .sigla{flex:none;width:170px;height:170px;border-radius:38px;display:grid;place-items:center;background:${cor};color:#fff;font-size:92px;font-weight:800}
    .nome{font-size:72px;font-weight:800;line-height:.92;text-transform:uppercase;letter-spacing:.01em}
  </style>`;
}

const logos = {
  'logo-auto-pecas.png': logo('AP', 'Auto Peças<br>Ferreira', '#b3261e'),
  'logo-padaria.png': logo('PV', 'Padaria<br>Pão da Vila', '#a5620d'),
  'logo-mercado.png': logo('BP', 'Mercado<br>Bom Preço', '#1f5fae'),
  'logo-academia.png': logo('PF', 'Academia<br>Ponto Forte', '#222'),
  'logo-farmacia.png': logo('SB', 'Farmácia<br>Saúde do Bairro', '#0e8a7a'),
};

/* ---------- Capas ---------- */

const capas = {
  'projeto-escolinha.jpg': { tema: 'verde', principal: 'apito', secundaria: 'bola' },
  'projeto-festa.jpg': { tema: 'ouro', principal: 'coracao', secundaria: 'bola' },
  'projeto-agasalhos.jpg': { tema: 'creme', principal: 'coracao', secundaria: 'bairro' },
  'projeto-mutirao.jpg': { tema: 'verde', principal: 'trave', secundaria: 'bandeirinha' },
  'campanha-festa.jpg': { tema: 'ouro', principal: 'cofrinho', secundaria: 'coracao' },
  'campanha-vestiario.jpg': { tema: 'creme', principal: 'camisa', secundaria: 'chuteira' },
  'campanha-uniformes.jpg': { tema: 'verde', principal: 'camisa', secundaria: 'trofeu' },
  'noticia-classico.jpg': { tema: 'verde', principal: 'trave', secundaria: 'bola' },
  'noticia-escolinha.jpg': { tema: 'creme', principal: 'prancheta', secundaria: 'apito' },
  'noticia-campanha.jpg': { tema: 'ouro', principal: 'megafone', secundaria: 'cofrinho' },
  'noticia-mutirao.jpg': { tema: 'creme', principal: 'bandeirinha', secundaria: 'trave' },
  'noticia-camisa.jpg': { tema: 'verde', principal: 'camisa' },
  'galeria-treino.jpg': { tema: 'creme', principal: 'chuteira', secundaria: 'bola' },
  'galeria-material.jpg': { tema: 'ouro', principal: 'bola' },
  'galeria-campo.jpg': { tema: 'verde', principal: 'bandeirinha' },
  'galeria-festa.jpg': { tema: 'ouro', principal: 'coracao' },
  'galeria-trofeu.jpg': { tema: 'verde', principal: 'trofeu' },
  'galeria-uniformes.jpg': { tema: 'creme', principal: 'camisa', secundaria: 'bola' },
  'historia-fundacao.jpg': { tema: 'creme', principal: 'bairro' },
  'historia-titulo.jpg': { tema: 'verde', principal: 'trofeu' },
  'historia-40-anos.jpg': { tema: 'ouro', numero: '40', secundaria: 'trofeu' },
};

await mkdir(destino, { recursive: true });
const apenas = process.argv.slice(2);
const deve = (nome) => !apenas.length || apenas.some((a) => nome.includes(a));

for (const [nome, opcoes] of Object.entries(capas)) if (deve(nome)) await capturar(capa(opcoes), 1600, 1000, nome);
for (const [nome, html] of Object.entries(produtos)) if (deve(nome)) await capturar(html, 1200, 1200, nome);
for (const [nome, html] of Object.entries(logos)) if (deve(nome)) await capturar(html, 720, 240, nome);

await navegador.close();
