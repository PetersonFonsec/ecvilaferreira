# Esporte Clube Vila Ferreira

Site oficial do Esporte Clube Vila Ferreira, time de futebol de várzea de São Bernardo do Campo fundado em 1984.

Astro + TypeScript + CSS próprio, conteúdo no Prismic, gerado como site estático e hospedado na Vercel.
A arquitetura, os modelos de conteúdo e o plano de etapas estão em [docs/ARQUITETURA.md](docs/ARQUITETURA.md).

## Rodando localmente

Requer Node 22.12 ou mais recente.

```sh
npm install
npm run dev       # http://localhost:4321
npm run build     # verifica tipos e gera dist/
npm run preview   # serve o build
```

Sem configurar nada, o site usa o conteúdo de exemplo de `src/data/fallback.ts`.

## Conectando ao Prismic

1. Crie um repositório no [Prismic](https://prismic.io).
2. Crie os tipos de conteúdo a partir dos JSON em `customtypes/` (no editor de Custom Types, use o modo JSON, ou use o Slice Machine).
3. Copie `.env.example` para `.env` e preencha `PRISMIC_REPOSITORY` (e `PRISMIC_ACCESS_TOKEN` se a API for privada).

## Deploy na Vercel

1. Importe o repositório na Vercel (o framework Astro é detectado automaticamente).
2. Em Environment Variables, defina `PRISMIC_REPOSITORY` e `SITE_URL`.
3. Em Settings → Git → Deploy Hooks, crie um hook e cole a URL em Prismic → Settings → Webhooks. Assim, cada publicação no Prismic gera um novo build.
