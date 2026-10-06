/**
 * Envia os modelos de customtypes/ para o repositório Prismic, criando ou atualizando cada tipo.
 *
 * Uso (o token fica só na sua máquina):
 *   PRISMIC_REPOSITORY=nome-do-repo PRISMIC_WRITE_TOKEN=token npm run prismic:modelos
 *
 * O token é gerado em Prismic → Settings → API & Security → Write APIs ("Custom Types API").
 */
import { readdir, readFile } from 'node:fs/promises';

const repositorio = process.env.PRISMIC_REPOSITORY;
const token = process.env.PRISMIC_WRITE_TOKEN;

if (!repositorio || !token) {
  console.error('Defina PRISMIC_REPOSITORY e PRISMIC_WRITE_TOKEN. Veja o comentário no topo de scripts/enviar-modelos.mjs.');
  process.exit(1);
}

const api = 'https://customtypes.prismic.io/customtypes';
const headers = { repository: repositorio, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
const pasta = new URL('../customtypes/', import.meta.url);

let falhas = 0;
for (const id of (await readdir(pasta)).sort()) {
  const modelo = await readFile(new URL(`${id}/index.json`, pasta), 'utf8');

  let resposta = await fetch(`${api}/insert`, { method: 'POST', headers, body: modelo });
  let acao = 'criado';
  if (resposta.status === 409) {
    resposta = await fetch(`${api}/update`, { method: 'POST', headers, body: modelo });
    acao = 'atualizado';
  }

  if (resposta.ok) {
    console.log(`✓ ${id} ${acao}`);
  } else {
    falhas++;
    console.error(`✗ ${id}: ${resposta.status} ${await resposta.text()}`);
  }
}

process.exit(falhas ? 1 : 0);
