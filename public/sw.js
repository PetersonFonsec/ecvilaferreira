/*
 * Service worker do site do Vila Ferreira.
 * - Páginas: busca na rede primeiro e guarda uma cópia; sem internet, usa a cópia ou a página /offline.
 * - Arquivos do build (/_astro/*, com hash no nome): cache primeiro, nunca mudam.
 * - Imagens, fontes e o modelo 3D: usa o que tem guardado e atualiza em segundo plano.
 */
const VERSAO = 'v1';
const CACHE_FIXO = `vf-fixo-${VERSAO}`;
const CACHE_PAGINAS = `vf-paginas-${VERSAO}`;
const CACHE_ARQUIVOS = `vf-arquivos-${VERSAO}`;
const CACHES_ATUAIS = [CACHE_FIXO, CACHE_PAGINAS, CACHE_ARQUIVOS];

const PAGINA_OFFLINE = '/offline';
const PRE_CACHE = [PAGINA_OFFLINE, '/favicon.svg', '/icones/icone-192.png'];

const LIMITE_PAGINAS = 40;
const LIMITE_ARQUIVOS = 120;

// Imagens do Prismic vêm de outro domínio; também valem a pena guardar.
const ORIGENS_DE_IMAGEM = ['https://images.prismic.io'];

self.addEventListener('install', (evento) => {
  evento.waitUntil(
    caches
      .open(CACHE_FIXO)
      .then((cache) => Promise.all(PRE_CACHE.map((url) => buscarSemRedirecionamento(url).then((r) => cache.put(url, r)))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    Promise.resolve(self.registration.navigationPreload?.enable())
      .then(() => caches.keys())
      .then((nomes) => Promise.all(nomes.filter((n) => n.startsWith('vf-') && !CACHES_ATUAIS.includes(n)).map((n) => caches.delete(n))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (evento) => {
  const { request } = evento;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  const mesmaOrigem = url.origin === self.location.origin;

  if (request.mode === 'navigate') {
    evento.respondWith(pagina(evento));
    return;
  }

  if (mesmaOrigem && url.pathname.startsWith('/_astro/')) {
    evento.respondWith(cachePrimeiro(request));
    return;
  }

  const ehArquivo = ['image', 'font', 'style', 'script'].includes(request.destination) || url.pathname.endsWith('.glb');
  if (ehArquivo && (mesmaOrigem || ORIGENS_DE_IMAGEM.includes(url.origin))) {
    evento.respondWith(guardadoEAtualiza(evento));
  }
});

/** Rede primeiro; sem conexão, a cópia guardada da página ou a página offline. */
async function pagina(evento) {
  const { request } = evento;
  try {
    const preCarregada = await evento.preloadResponse;
    const resposta = preCarregada || (await fetch(request));
    if (resposta.ok) {
      const copia = resposta.clone();
      evento.waitUntil(guardar(CACHE_PAGINAS, request, copia, LIMITE_PAGINAS));
    }
    return resposta;
  } catch {
    const guardada = await caches.match(request, { ignoreSearch: true });
    if (guardada) return guardada;
    return (await caches.match(PAGINA_OFFLINE)) || Response.error();
  }
}

async function cachePrimeiro(request) {
  const guardada = await caches.match(request);
  if (guardada) return guardada;
  const resposta = await fetch(request);
  if (resposta.ok) await guardar(CACHE_ARQUIVOS, request, resposta.clone(), LIMITE_ARQUIVOS);
  return resposta;
}

async function guardadoEAtualiza(evento) {
  const { request } = evento;
  const guardada = await caches.match(request);
  const daRede = fetch(request)
    .then(async (resposta) => {
      if (resposta.ok || resposta.type === 'opaque') await guardar(CACHE_ARQUIVOS, request, resposta.clone(), LIMITE_ARQUIVOS);
      return resposta;
    })
    .catch(() => undefined);

  if (guardada) {
    evento.waitUntil(daRede);
    return guardada;
  }
  return (await daRede) || Response.error();
}

async function guardar(nomeCache, request, resposta, limite) {
  const cache = await caches.open(nomeCache);
  await cache.put(request, resposta);
  const chaves = await cache.keys();
  // Remove as entradas mais antigas quando passa do limite.
  await Promise.all(chaves.slice(0, Math.max(0, chaves.length - limite)).map((chave) => cache.delete(chave)));
}

/** Respostas redirecionadas não podem responder navegações; recria a resposta sem o redirecionamento. */
async function buscarSemRedirecionamento(url) {
  const resposta = await fetch(url, { cache: 'reload' });
  if (!resposta.ok) throw new Error(`Falha ao guardar ${url}`);
  if (!resposta.redirected) return resposta;
  return new Response(await resposta.blob(), { status: resposta.status, headers: resposta.headers });
}
