/**
 * Imagens de compartilhamento (Open Graph) de cada seção do site, geradas a partir do brasão
 * por scripts/gerar-imagens.mjs. Sem imports para o script conseguir ler este arquivo direto no Node.
 *
 * Ordem de prioridade no BaseLayout: imagem da própria página (ex.: foto da notícia) →
 * imagem da seção (abaixo) → imagem padrão cadastrada no Prismic → /og/inicio.jpg.
 * A home não tem imagem "de seção": usa a do Prismic, se houver, ou /og/inicio.jpg.
 */

export interface ImagemSecao {
  /** Rota da seção. Subpáginas (ex.: /noticias/algum-slug) herdam a imagem da seção. */
  rota: string;
  arquivo: string;
  chapeu: string;
  titulo: string;
  subtitulo: string;
  /** Nome de uma ilustração de src/data/ilustracoes.ts. */
  ilustracao: string;
}

export const imagensSecoes: ImagemSecao[] = [
  {
    rota: '/',
    arquivo: '/og/inicio.jpg',
    chapeu: 'Desde 1984 · São Bernardo do Campo',
    titulo: 'Mais que um time.',
    subtitulo: 'Uma história construída no bairro.',
    ilustracao: 'campo',
  },
  {
    rota: '/historia',
    arquivo: '/og/historia.jpg',
    chapeu: 'Clube',
    titulo: 'Nossa história',
    subtitulo: 'Fundadores, marcos e conquistas desde 1984.',
    ilustracao: 'trofeu',
  },
  {
    rota: '/diretoria',
    arquivo: '/og/diretoria.jpg',
    chapeu: 'Clube',
    titulo: 'Diretoria',
    subtitulo: 'Gente do bairro que mantém o clube vivo.',
    ilustracao: 'apito',
  },
  {
    rota: '/noticias',
    arquivo: '/og/noticias.jpg',
    chapeu: 'Clube',
    titulo: 'Notícias',
    subtitulo: 'O que acontece dentro e fora de campo.',
    ilustracao: 'megafone',
  },
  {
    rota: '/projetos',
    arquivo: '/og/projetos.jpg',
    chapeu: 'Comunidade',
    titulo: 'Projetos sociais',
    subtitulo: 'O Vila Ferreira joga dentro e fora de campo.',
    ilustracao: 'bairro',
  },
  {
    rota: '/apoie',
    arquivo: '/og/apoie.jpg',
    chapeu: 'Apoie',
    titulo: 'Apoie o clube',
    subtitulo: 'O clube é do bairro. E o bairro é quem sustenta o clube.',
    ilustracao: 'coracao',
  },
  {
    rota: '/campanhas',
    arquivo: '/og/campanhas.jpg',
    chapeu: 'Apoie',
    titulo: 'Campanhas',
    subtitulo: 'Cada real vira bola, uniforme, lanche e festa para o bairro.',
    ilustracao: 'cofrinho',
  },
  {
    rota: '/patrocinadores',
    arquivo: '/og/patrocinadores.jpg',
    chapeu: 'Apoie',
    titulo: 'Patrocinadores',
    subtitulo: 'Empresas que acreditam no futebol de várzea.',
    ilustracao: 'chuteira',
  },
  {
    rota: '/transparencia',
    arquivo: '/og/transparencia.jpg',
    chapeu: 'Apoie',
    titulo: 'Transparência',
    subtitulo: 'Para onde vai cada real doado ao clube.',
    ilustracao: 'prancheta',
  },
  {
    rota: '/loja',
    arquivo: '/og/loja.jpg',
    chapeu: 'Loja oficial',
    titulo: 'Vista as cores do bairro',
    subtitulo: 'Produtos oficiais com pedido pelo WhatsApp.',
    ilustracao: 'camisa',
  },
  {
    rota: '/contato',
    arquivo: '/og/contato.jpg',
    chapeu: 'Contato',
    titulo: 'Fale com a gente',
    subtitulo: 'WhatsApp, e-mail e redes sociais do clube.',
    ilustracao: 'bandeirinha',
  },
];

/** Imagem da seção a que a rota pertence, ou undefined se não houver uma específica. */
export function imagemDaSecao(pathname: string) {
  const rota = pathname.replace(/\/$/, '') || '/';
  if (rota === '/') return undefined;
  return imagensSecoes.find((s) => s.rota !== '/' && (rota === s.rota || rota.startsWith(`${s.rota}/`)))?.arquivo;
}
