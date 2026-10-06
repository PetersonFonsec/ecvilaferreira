# Arquitetura do site do Vila Ferreira

> Mais que um time. Uma história construída no bairro.

## 1. Requisitos em resumo

| Pilar | O que o site precisa fazer | Onde fica |
| --- | --- | --- |
| Clube | História, fundadores, diretoria, futebol, conquistas, notícias | `/historia`, `/diretoria`, `/noticias` |
| Comunidade | Projetos sociais, eventos e ações no bairro | `/projetos` |
| Apoie | Doações via PIX, campanhas com meta, patrocínio, prestação de contas | `/apoie`, `/campanhas`, `/patrocinadores`, `/transparencia` |
| Loja | Vitrine de produtos com compra pelo WhatsApp | `/loja` |

Decisões que saem dos requisitos:

- **SSG puro** (`output: 'static'`). O Astro busca tudo no Prismic durante o build. Não há servidor, banco, API própria nem autenticação.
- **Conteúdo muda → novo build.** Um webhook do Prismic chama um Deploy Hook da Vercel ao publicar.
- **Efeitos como melhoria progressiva.** Todo o movimento (rolagem suave, cursor próprio, textos que se revelam, brasão 3D) é JavaScript que só enfeita: sem JS, ou com "reduzir movimento" ligado no sistema, todo o conteúdo aparece parado e funciona igual. Ver a seção "Movimento e interação".
- **PIX sem backend.** O código "copia e cola" (BR Code estático do Banco Central) e o QR Code em SVG são gerados no build (`src/lib/pix.ts`). Se a diretoria preferir, pode subir o QR Code do banco no Prismic, e ele tem prioridade.
- **Loja sem checkout.** O botão abre `wa.me` com mensagem pronta: nome, preço, tamanhos e link do produto.
- **Funciona sem Prismic.** Sem `PRISMIC_REPOSITORY`, o site usa o conteúdo de exemplo de `src/data/fallback.ts`. Isso permite desenvolver o layout antes de cadastrar conteúdo.

## 2. Pastas

```
customtypes/              Modelos do Prismic (formato Slice Machine), versionados no Git
docs/                     Este documento
public/                   favicon, ícones do app, brasão em PNG, imagens de compartilhamento (og/), modelo 3D (3d/)
scripts/gerar-imagens.mjs Gera favicon, ícones e imagens de compartilhamento a partir do brasão
src/
  components/
    layout/               Header, Navigation, Footer, SEO
    ui/                   Hero, Section, Botao, CTA, ProgressBar, Pix, Galeria, Midia, ResponsiveImage, Escudo, Ilustracao, Letreiro
    cards/                CampaignCard, ProjectCard, NewsCard, ProductCard, SponsorCard, DirectorCard
  data/
    navegacao.ts          Itens do menu e do rodapé
    fallback.ts           Conteúdo de exemplo (sem Prismic)
    ilustracoes.ts        Ilustrações em traço (bola, trave, troféu, camisa, bairro...)
    compartilhamento.ts   Imagem de compartilhamento de cada seção
  layouts/BaseLayout.astro
  lib/
    types.ts              Modelos de conteúdo usados pelas páginas
    content.ts            Única porta de entrada para conteúdo (Prismic → tipos acima)
    pix.ts                BR Code + QR Code
    whatsapp.ts           Links wa.me e mensagem de produto
    imagem.ts             srcset/recorte via imgix do Prismic, imagem de OG
    format.ts             Moeda, data, percentual
    brasao.ts             Brasão em SVG (usado pelo Escudo e pelo gerador de imagens)
  scripts/                Efeitos de movimento (ver seção "Movimento e interação")
  pages/                  Rotas (ver seção 4)
  styles/
    tokens.css            Cores, fontes, espaçamentos (ponto de partida para a identidade)
    reset.css, base.css   Reset e tipografia
    layout.css            .container, .grade, .pilha, utilitários
    components.css        Estrutura comum dos cards e etiquetas
    efeitos.css           Estados das animações, cursor, letreiro, grão, transição entre páginas
    global.css            Ordem das camadas (@layer)
```

As páginas nunca falam com o Prismic diretamente: chamam `getCampanhas()`, `getProjetos()` etc. em `src/lib/content.ts`. Trocar de CMS no futuro significa mexer só nesse arquivo.

### CSS

- CSS próprio, sem frameworks. Estilos de cada componente ficam no `.astro` (escopados).
- `@layer reset, tokens, base, layout, components, utilities` define a precedência sem brigar com especificidade.
- **Tokens em dois níveis:** paleta crua (`--verde-700`, `--ouro-500`, `--cal`) e papéis (`--cor-marca`, `--cor-fundo`, `--cor-destaque`). Componentes usam só os papéis, então refinar a identidade é trocar valores em `tokens.css`.
- Tipografia fluida com `clamp()`, grades com `auto-fill/minmax` (quase sem media queries), mobile-first.
- Identidade tirada do brasão: verde, branco e dourado (o dourado das duas estrelas). Dourado escuro (`--ouro-800`) para texto sobre fundo claro, por contraste.
- Linguagem visual de várzea: faixas de gramado e linhas do campo no hero, ilustrações em traço que se desenham ao rolar, títulos condensados em caixa alta (Barlow Condensed, auto-hospedada), grão de filme sobre tudo.

## 3. Modelos no Prismic

Todos em `customtypes/<id>/index.json`.

| Tipo | id | Repetível | Página própria | Campos principais |
| --- | --- | --- | --- | --- |
| Configurações do site | `configuracoes` | não | — | nome, slogan, descrição, fundação, cidade, endereço, WhatsApp, e-mail, redes, chave PIX geral, recebedor, imagem de compartilhamento |
| Projeto Social | `projeto_social` | sim | `/projetos/[uid]` | título, resumo, imagem, status (Em andamento/Recorrente/Concluído), data, conteúdo, galeria |
| Campanha | `campanha` | sim | `/campanhas/[uid]` | título, resumo, descrição, imagem, status (Ativa/Em breve/Encerrada), início, término, meta, arrecadado, chave PIX própria, QR Code opcional, resultado, galeria |
| Notícia | `noticia` | sim | `/noticias/[uid]` | título, resumo, imagem, data, categoria, conteúdo |
| Membro da Diretoria | `membro_diretoria` | sim | — | nome, cargo, foto, bio, mandato, ordem |
| Patrocinador | `patrocinador` | sim | — | nome, logo, site, nível (Apoiador/Prata/Ouro/Master), descrição, ativo |
| Produto | `produto` | sim | `/loja/[uid]` | nome, resumo, descrição, preço, imagens, tamanhos, categoria, disponível |
| Evento Histórico | `evento_historico` | sim | — | ano, título, descrição, imagem, tipo (Marco/Conquista/Fundação) |

Escolhas para manter simples agora e evoluir depois:

- **Conquistas são eventos históricos** com tipo "Conquista", em vez de um tipo separado.
- **Transparência é calculada** a partir das campanhas (meta, arrecadado, status). Um tipo para documentos/balancetes pode vir depois.
- **Sem Slices por enquanto.** Os campos são fixos. Quando a diretoria quiser montar páginas livremente (ex.: home editável), adicionamos Slices a uma página `pagina`.
- **Valores das campanhas são manuais**, como pedido.

## 4. Rotas

| Rota | Conteúdo |
| --- | --- |
| `/` | Hero com slogan, quatro pilares, campanhas ativas, projetos, notícias, patrocinadores, chamada para a loja |
| `/historia` | Linha do tempo + sala de troféus |
| `/diretoria` | Membros da diretoria |
| `/projetos`, `/projetos/[slug]` | Projetos sociais |
| `/apoie` | Formas de apoiar, PIX geral, campanhas ativas |
| `/campanhas`, `/campanhas/[slug]` | Campanhas com progresso, PIX, QR Code, compartilhar no WhatsApp, resultado |
| `/patrocinadores` | Patrocinadores atuais + "Seja um patrocinador" |
| `/transparencia` | Tabela de campanhas e total arrecadado |
| `/noticias`, `/noticias/[slug]` | Notícias |
| `/loja`, `/loja/[slug]` | Produtos com compra via WhatsApp |
| `/contato` | WhatsApp, e-mail, endereço, redes |
| `/404`, `/robots.txt`, `/sitemap-index.xml` | Apoio |

## 5. SEO e compartilhamento

- `src/components/layout/SEO.astro`: title, description, canonical, Open Graph, Twitter Card, `noindex` opcional, JSON-LD.
- Imagem de compartilhamento: a da página, recortada em 1200×630 JPEG pelo imgix do Prismic; senão a imagem da seção em `public/og/` (definida em `src/data/compartilhamento.ts`); senão a imagem padrão do Prismic; senão `public/og/inicio.jpg`.
- Campanhas: a descrição do preview começa pelo progresso ("63% da meta: R$ 3.150,00 de R$ 5.000,00. …"), que é o que chama atenção no WhatsApp.
- JSON-LD: `SportsTeam` na home, `NewsArticle` nas notícias, `Product` na loja.
- Sitemap pelo `@astrojs/sitemap`; `robots.txt` aponta para ele.

## 6. Componentes reutilizáveis

| Componente | Usado em |
| --- | --- |
| Header, Navigation, Footer, SEO | Todas as páginas, via `BaseLayout` |
| Hero | Home (variante `inicio`) e cabeçalho de todas as páginas internas |
| Section | Blocos com título, chapéu e fundo alternado |
| Botao, CTA | Ações principais, chamadas no fim das páginas |
| ProgressBar | Cards e páginas de campanha |
| Pix | `/apoie` e páginas de campanha |
| Galeria, ResponsiveImage, Midia | Imagens do Prismic com srcset; placeholder com escudo quando não há imagem |
| CampaignCard, ProjectCard, NewsCard, ProductCard, SponsorCard, DirectorCard | Listagens |

Não criamos abstrações além disso: a linha do tempo, a tabela de transparência e a página de produto vivem nas próprias páginas, porque só são usadas uma vez.

## 7. Plano de implementação

1. **Fundação** (feito neste PR): projeto Astro + TypeScript, tokens e CSS base, layout, componentes, todas as rotas com conteúdo de exemplo, SEO, sitemap, PIX, WhatsApp, modelos do Prismic.
2. **Prismic e deploy:** criar o repositório no Prismic, enviar os modelos de `customtypes/` (Slice Machine ou colando o JSON no editor), configurar `PRISMIC_REPOSITORY` e `SITE_URL` na Vercel, ligar o webhook do Prismic a um Deploy Hook da Vercel.
3. **Conteúdo real e identidade:** escudo oficial em SVG, fotos, textos da história e da diretoria, chave PIX real; refinar cores e tipografia em `tokens.css`.
4. **Lançamento:** domínio próprio, teste de preview no WhatsApp com o Sharing Debugger da Meta, Lighthouse/Core Web Vitals, Google Search Console.

Depois do lançamento, se fizer sentido: preview de rascunhos do Prismic, paginação de notícias, Slices para páginas editáveis, calendário de jogos.

## Movimento e interação

Bibliotecas usadas (nenhuma é biblioteca de componentes visuais; todo o CSS continua escrito à mão):

- **Lenis** (`lenis`): rolagem suave. A posição continua sendo a do `window`, então âncoras, teclado e leitores de tela funcionam normalmente.
- **three.js** (`three`): brasão 3D da home (`public/3d/vila-ferreira.glb`, comprimido com meshopt). É baixado sob demanda, só na home, depois que a página carrega, e não é baixado com "reduzir movimento" ou "economia de dados". Enquanto isso, o SVG do brasão fica no lugar.

Efeitos próprios (TypeScript em `src/scripts/`, ligados por atributos no HTML):

| Atributo / classe | Efeito |
| --- | --- |
| `data-revelar` (`grupo`, `zoom`, `esquerda`, `mascara`) | Aparece subindo ao entrar na tela; `grupo` revela os filhos em sequência |
| `data-dividir` | Título que entra palavra por palavra |
| `.ilustracao` | Traços se desenham ao entrar na tela |
| `data-acender` | Parágrafo cujas palavras acendem conforme a rolagem |
| `data-parallax="0.2"` | Anda mais devagar (ou mais rápido, se negativo) que a rolagem |
| `data-magnetico` | Botão puxado pelo cursor |
| `data-inclinar` | Card inclina em 3D na direção do cursor, com brilho dourado |
| `data-cursor="Texto"` | O cursor vira um selo dourado com o texto |
| `data-seguir="20"` | Desliza levemente na direção do cursor |
| `data-contar` | Número conta de zero até o valor |
| `data-letreiro` | Faixa de texto infinita que acelera com a rolagem |
| `data-horizontal` | Seção trava e o conteúdo anda para o lado (só telas largas) |
| `data-escudo-3d` | Palco do brasão 3D |

Regras: um único `requestAnimationFrame` para tudo (`aCadaQuadro`), efeitos de cursor só com mouse, e `prefers-reduced-motion` desliga rolagem suave, cursor, parallax, 3D e animações de entrada. Os estados "escondidos" só valem com a classe `.js` no `<html>`; se os efeitos não carregarem em 4 s, a classe `.revelar-tudo` mostra tudo.

## Brasão, favicon e imagens de compartilhamento

O brasão foi redesenhado em vetor a partir da arte do clube e mora em `src/lib/brasao.ts`. Favicon (`favicon.svg` e `favicon.ico`), ícones do app (`apple-touch-icon.png`, `icones/`, `site.webmanifest`), `brasao.png` e as imagens de compartilhamento de cada seção (`og/*.jpg`, 1200×630) são gerados por:

```sh
npm i --no-save playwright && npx playwright install chromium
node scripts/gerar-imagens.mjs
```

Rode de novo quando mudar o brasão ou os textos de `src/data/compartilhamento.ts`.
