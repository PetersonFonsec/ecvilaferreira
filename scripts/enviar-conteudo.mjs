/**
 * Envia o conteúdo de demonstração (scripts/conteudo-exemplo/) para o repositório Prismic,
 * com imagens, usando a Migration API. Os documentos chegam numa release chamada "Migration
 * release", que você revisa e publica no Prismic (ou publica direto com --publicar).
 *
 * Uso (o token fica só na sua máquina; é o mesmo de `npm run prismic:modelos`):
 *   PRISMIC_REPOSITORY=nome-do-repo PRISMIC_WRITE_TOKEN=token npm run prismic:conteudo
 *   PRISMIC_REPOSITORY=nome-do-repo PRISMIC_WRITE_TOKEN=token npm run prismic:conteudo -- --publicar
 *
 * O token é gerado em Prismic → Settings → API & Security → Write APIs.
 * Se a API de leitura do repositório for privada, defina também PRISMIC_ACCESS_TOKEN.
 *
 * Documentos que já existem publicados (mesmo UID, ou mesmo nome/ano nos tipos sem UID) são
 * pulados, para não sobrescrever conteúdo real. Os da release ainda não publicada não são vistos:
 * rode uma vez só, ou apague a release no Prismic antes de rodar de novo.
 * Tudo recebe a tag "exemplo" para ser encontrado e substituído depois.
 */
import { readFile } from 'node:fs/promises';
import * as prismic from '@prismicio/client';
import * as conteudo from './conteudo-exemplo/conteudo.mjs';

const repositorio = process.env.PRISMIC_REPOSITORY;
const writeToken = process.env.PRISMIC_WRITE_TOKEN;
const publicar = process.argv.includes('--publicar');

if (!repositorio || !writeToken) {
  console.error('Defina PRISMIC_REPOSITORY e PRISMIC_WRITE_TOKEN. Veja o comentário no topo de scripts/enviar-conteudo.mjs.');
  process.exit(1);
}

const client = prismic.createWriteClient(repositorio, {
  writeToken,
  accessToken: process.env.PRISMIC_ACCESS_TOKEN || undefined,
});
const migration = prismic.createMigration();
const TAG = 'exemplo';

const lang = (await client.getRepository()).languages[0].id;
const existentes = await client.dangerouslyGetAll();
const jaExiste = (tipo, chave) =>
  existentes.some((doc) => doc.type === tipo && (chave === undefined || chave(doc)));

/* ---------- campos ---------- */

const pastaImagens = new URL('./conteudo-exemplo/imagens/', import.meta.url);
const assets = new Map();

/** Imagem local → asset do Prismic (cada arquivo sobe uma vez só, mesmo usado em vários lugares). */
async function imagem(arquivo, alt) {
  if (!arquivo) return undefined;
  if (!assets.has(arquivo)) {
    const dados = await readFile(new URL(arquivo, pastaImagens));
    assets.set(arquivo, migration.createAsset(dados, arquivo, { alt, tags: [TAG] }));
  }
  return assets.get(arquivo);
}

/** Lista de strings → Rich Text. "## " vira título, "- " vira item de lista. */
const richText = (linhas = []) =>
  linhas.map((linha) => {
    if (linha.startsWith('## ')) return { type: 'heading2', text: linha.slice(3), spans: [] };
    if (linha.startsWith('- ')) return { type: 'list-item', text: linha.slice(2), spans: [] };
    return { type: 'paragraph', text: linha, spans: [] };
  });

const galeria = async (itens = []) =>
  Promise.all(itens.map(async (item) => ({ imagem: await imagem(item.imagem, item.legenda), legenda: item.legenda })));

let pulados = 0;
function criar(tipo, titulo, documento, chave) {
  if (jaExiste(tipo, chave)) {
    pulados++;
    console.log(`· ${tipo} "${titulo}" já existe, pulado`);
    return;
  }
  migration.createDocument({ type: tipo, lang, tags: [TAG], ...documento }, titulo);
}

const porUid = (uid) => (doc) => doc.uid === uid;

/* ---------- documentos ---------- */

criar('configuracoes', 'Configurações do site', { data: conteudo.configuracoes });

for (const p of conteudo.projetos) {
  criar('projeto_social', p.titulo, {
    uid: p.uid,
    data: {
      titulo: p.titulo,
      resumo: p.resumo,
      status: p.status,
      data: p.data,
      imagem: await imagem(p.imagem, p.titulo),
      conteudo: richText(p.conteudo),
      galeria: await galeria(p.galeria),
    },
  }, porUid(p.uid));
}

for (const k of conteudo.campanhas) {
  criar('campanha', k.titulo, {
    uid: k.uid,
    data: {
      titulo: k.titulo,
      resumo: k.resumo,
      status: k.status,
      data_inicio: k.data_inicio,
      data_fim: k.data_fim,
      meta: k.meta,
      arrecadado: k.arrecadado,
      imagem: await imagem(k.imagem, k.titulo),
      descricao: richText(k.descricao),
      resultado: richText(k.resultado),
      galeria: await galeria(k.galeria),
    },
  }, porUid(k.uid));
}

for (const n of conteudo.noticias) {
  criar('noticia', n.titulo, {
    uid: n.uid,
    data: {
      titulo: n.titulo,
      resumo: n.resumo,
      data_publicacao: n.data_publicacao,
      categoria: n.categoria,
      imagem: await imagem(n.imagem, n.titulo),
      conteudo: richText(n.conteudo),
    },
  }, porUid(n.uid));
}

for (const m of conteudo.diretoria) {
  criar('membro_diretoria', `${m.cargo}: ${m.nome}`, { data: m }, (doc) => doc.data.nome === m.nome);
}

for (const s of conteudo.patrocinadores) {
  criar('patrocinador', s.nome, {
    data: {
      nome: s.nome,
      nivel: s.nivel,
      descricao: s.descricao,
      ativo: true,
      logo: await imagem(s.logo, s.nome),
    },
  }, (doc) => doc.data.nome === s.nome);
}

for (const p of conteudo.produtos) {
  criar('produto', p.nome, {
    uid: p.uid,
    data: {
      nome: p.nome,
      resumo: p.resumo,
      descricao: richText(p.descricao),
      preco: p.preco,
      tamanhos: p.tamanhos,
      categoria: p.categoria,
      disponivel: p.disponivel,
      imagens: await galeria(p.imagens.map((arquivo) => ({ imagem: arquivo, legenda: p.nome }))),
    },
  }, porUid(p.uid));
}

for (const h of conteudo.historia) {
  criar('evento_historico', `${h.ano}: ${h.titulo}`, {
    data: {
      ano: h.ano,
      titulo: h.titulo,
      descricao: h.descricao,
      tipo: h.tipo,
      imagem: await imagem(h.imagem, h.titulo),
    },
  }, (doc) => doc.data.ano === h.ano && doc.data.titulo === h.titulo);
}

/* ---------- envio ---------- */

if (!migration._documents.length) {
  console.log('Nada novo para enviar: todo o conteúdo de exemplo já está no Prismic.');
  process.exit(0);
}

await client.migrate(migration, {
  reporter: (evento) => {
    if (evento.type === 'start')
      console.log(`Enviando ${evento.data.pending.documents} documentos e ${evento.data.pending.assets} imagens…`);
    if (evento.type === 'assets:creating') console.log(`↑ imagem ${evento.data.current}/${evento.data.total}`);
    if (evento.type === 'documents:creating')
      console.log(`✓ ${evento.data.document.document.type} "${evento.data.document.title}"`);
  },
});

console.log(`\nPronto: ${migration._documents.length} documentos na release "Migration release" (${pulados} pulados).`);

if (publicar) {
  const { totalItems } = await client.publishMigrationRelease();
  console.log(`Release publicada (${totalItems} documentos). Faça um novo deploy na Vercel para o site buscar o conteúdo.`);
} else {
  console.log('Revise em Prismic → Releases e clique em "Publish", ou rode de novo com -- --publicar.');
}
