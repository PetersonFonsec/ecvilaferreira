/**
 * Camada de conteúdo. As páginas só falam com este arquivo.
 *
 * Com PRISMIC_REPOSITORY definido, os conteúdos vêm do Prismic durante o build.
 * Sem ele, usamos o conteúdo de exemplo de src/data/fallback.ts.
 *
 * Os nomes dos tipos e campos abaixo seguem os modelos em /customtypes.
 */
import * as prismic from '@prismicio/client';
import * as fallback from '@/data/fallback';
import type {
  Campanha,
  Configuracoes,
  EventoHistorico,
  Imagem,
  ItemGaleria,
  MembroDiretoria,
  NivelPatrocinio,
  Noticia,
  Patrocinador,
  Produto,
  ProjetoSocial,
  StatusCampanha,
  StatusProjeto,
  TipoEventoHistorico,
} from '@/lib/types';

const repositorio = import.meta.env.PRISMIC_REPOSITORY;

export const usandoPrismic = Boolean(repositorio);

const client = repositorio
  ? prismic.createClient(repositorio, { accessToken: import.meta.env.PRISMIC_ACCESS_TOKEN || undefined })
  : undefined;

// O build chama as mesmas consultas em várias páginas; guardamos o resultado.
const cache = new Map<string, Promise<unknown>>();
function memo<T>(chave: string, carregar: () => Promise<T>): Promise<T> {
  if (!cache.has(chave)) cache.set(chave, carregar());
  return cache.get(chave) as Promise<T>;
}

type Dados = Record<string, any>;

async function todos(tipo: string, ordenarPor?: { campo: string; direcao?: 'asc' | 'desc' }) {
  if (!client) return [];
  return client.getAllByType(tipo, {
    orderings: ordenarPor
      ? [{ field: `my.${tipo}.${ordenarPor.campo}`, direction: ordenarPor.direcao ?? 'desc' }]
      : undefined,
  });
}

/* ---------- conversões de campos ---------- */

function imagem(campo: unknown): Imagem | undefined {
  const field = campo as prismic.ImageField;
  if (!prismic.isFilled.image(field)) return undefined;
  return {
    url: field.url,
    alt: field.alt ?? '',
    width: field.dimensions.width,
    height: field.dimensions.height,
  };
}

function galeria(grupo: unknown): ItemGaleria[] {
  if (!Array.isArray(grupo)) return [];
  return grupo.flatMap((item: Dados) => {
    const img = imagem(item.imagem);
    return img ? [{ imagem: img, legenda: item.legenda ?? undefined }] : [];
  });
}

const html = (campo: unknown) => prismic.asHTML(campo as prismic.RichTextField) ?? '';
const texto = (campo: unknown) => (typeof campo === 'string' ? campo : '');
const numero = (campo: unknown) => (typeof campo === 'number' ? campo : 0);
const data = (campo: unknown) => (typeof campo === 'string' ? campo : undefined);
const link = (campo: unknown) => prismic.asLink(campo as prismic.LinkField) ?? undefined;

/* ---------- configurações ---------- */

export function getConfiguracoes(): Promise<Configuracoes> {
  return memo('configuracoes', async () => {
    if (!client) return fallback.configuracoes;
    const doc = await client.getSingle('configuracoes').catch(() => undefined);
    if (!doc) return fallback.configuracoes;
    const d: Dados = doc.data;
    const base = fallback.configuracoes;
    return {
      nome: texto(d.nome) || base.nome,
      slogan: texto(d.slogan) || base.slogan,
      descricao: texto(d.descricao) || base.descricao,
      fundacao: numero(d.fundacao) || base.fundacao,
      cidade: texto(d.cidade) || base.cidade,
      endereco: texto(d.endereco) || undefined,
      email: texto(d.email) || undefined,
      whatsapp: texto(d.whatsapp).replace(/\D/g, '') || base.whatsapp,
      instagram: link(d.instagram),
      facebook: link(d.facebook),
      youtube: link(d.youtube),
      pix: {
        chave: texto(d.pix_chave) || base.pix.chave,
        recebedor: texto(d.pix_recebedor) || base.pix.recebedor,
        cidade: texto(d.pix_cidade) || base.pix.cidade,
      },
      ogImage: imagem(d.imagem_compartilhamento),
    };
  });
}

/* ---------- projetos sociais ---------- */

export function getProjetos(): Promise<ProjetoSocial[]> {
  return memo('projetos', async () => {
    if (!client) return fallback.projetos;
    const docs = await todos('projeto_social', { campo: 'data' });
    return docs.map((doc) => {
      const d: Dados = doc.data;
      return {
        slug: doc.uid!,
        titulo: texto(d.titulo),
        resumo: texto(d.resumo),
        imagem: imagem(d.imagem),
        status: (texto(d.status) || 'Em andamento') as StatusProjeto,
        data: data(d.data),
        conteudo: html(d.conteudo),
        galeria: galeria(d.galeria),
      };
    });
  });
}

/* ---------- campanhas ---------- */

export function getCampanhas(): Promise<Campanha[]> {
  return memo('campanhas', async () => {
    const lista = client
      ? (await todos('campanha', { campo: 'data_inicio' })).map((doc): Campanha => {
          const d: Dados = doc.data;
          return {
            slug: doc.uid!,
            titulo: texto(d.titulo),
            resumo: texto(d.resumo),
            descricao: html(d.descricao),
            imagem: imagem(d.imagem),
            meta: numero(d.meta),
            arrecadado: numero(d.arrecadado),
            dataInicio: data(d.data_inicio),
            dataFim: data(d.data_fim),
            status: (texto(d.status) || 'Ativa') as StatusCampanha,
            chavePix: texto(d.chave_pix) || undefined,
            qrCode: imagem(d.qr_code),
            galeria: galeria(d.galeria),
            resultado: html(d.resultado),
          };
        })
      : fallback.campanhas;
    // Ativas primeiro, depois "Em breve", depois encerradas.
    const peso: Record<StatusCampanha, number> = { Ativa: 0, 'Em breve': 1, Encerrada: 2 };
    return [...lista].sort((a, b) => peso[a.status] - peso[b.status]);
  });
}

/* ---------- notícias ---------- */

export function getNoticias(): Promise<Noticia[]> {
  return memo('noticias', async () => {
    if (!client) return fallback.noticias;
    const docs = await todos('noticia', { campo: 'data_publicacao' });
    return docs.map((doc) => {
      const d: Dados = doc.data;
      return {
        slug: doc.uid!,
        titulo: texto(d.titulo),
        resumo: texto(d.resumo),
        imagem: imagem(d.imagem),
        data: data(d.data_publicacao) ?? doc.first_publication_date.slice(0, 10),
        categoria: texto(d.categoria) || 'Clube',
        conteudo: html(d.conteudo),
      };
    });
  });
}

/* ---------- diretoria ---------- */

export function getDiretoria(): Promise<MembroDiretoria[]> {
  return memo('diretoria', async () => {
    if (!client) return fallback.diretoria;
    const docs = await todos('membro_diretoria', { campo: 'ordem', direcao: 'asc' });
    return docs.map((doc) => {
      const d: Dados = doc.data;
      return {
        nome: texto(d.nome),
        cargo: texto(d.cargo),
        foto: imagem(d.foto),
        bio: texto(d.bio) || undefined,
        mandato: texto(d.mandato) || undefined,
        ordem: numero(d.ordem),
      };
    });
  });
}

/* ---------- patrocinadores ---------- */

const ordemNivel: NivelPatrocinio[] = ['Master', 'Ouro', 'Prata', 'Apoiador'];

export function getPatrocinadores(): Promise<Patrocinador[]> {
  return memo('patrocinadores', async () => {
    const lista = client
      ? (await todos('patrocinador'))
          .filter((doc) => (doc.data as Dados).ativo !== false)
          .map((doc): Patrocinador => {
            const d: Dados = doc.data;
            return {
              nome: texto(d.nome),
              logo: imagem(d.logo),
              site: link(d.site),
              nivel: (texto(d.nivel) || 'Apoiador') as NivelPatrocinio,
              descricao: texto(d.descricao) || undefined,
            };
          })
      : fallback.patrocinadores;
    return [...lista].sort((a, b) => ordemNivel.indexOf(a.nivel) - ordemNivel.indexOf(b.nivel));
  });
}

/* ---------- loja ---------- */

export function getProdutos(): Promise<Produto[]> {
  return memo('produtos', async () => {
    if (!client) return fallback.produtos;
    const docs = await todos('produto');
    return docs.map((doc) => {
      const d: Dados = doc.data;
      return {
        slug: doc.uid!,
        nome: texto(d.nome),
        resumo: texto(d.resumo),
        descricao: html(d.descricao),
        preco: typeof d.preco === 'number' ? d.preco : undefined,
        imagens: galeria(d.imagens).map((item) => item.imagem),
        tamanhos: texto(d.tamanhos)
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        categoria: texto(d.categoria) || 'Produtos',
        disponivel: d.disponivel !== false,
      };
    });
  });
}

/* ---------- história ---------- */

export function getHistoria(): Promise<EventoHistorico[]> {
  return memo('historia', async () => {
    const lista = client
      ? (await todos('evento_historico')).map((doc): EventoHistorico => {
          const d: Dados = doc.data;
          return {
            ano: numero(d.ano),
            titulo: texto(d.titulo),
            descricao: texto(d.descricao),
            imagem: imagem(d.imagem),
            tipo: (texto(d.tipo) || 'Marco') as TipoEventoHistorico,
          };
        })
      : fallback.historia;
    return [...lista].sort((a, b) => a.ano - b.ano);
  });
}
