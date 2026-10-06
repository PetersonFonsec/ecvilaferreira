/**
 * Modelos de conteúdo usados pelas páginas.
 * São independentes do Prismic: src/lib/content.ts converte os documentos do CMS
 * (ou o conteúdo de exemplo) para estes formatos.
 */

export interface Imagem {
  url: string;
  alt: string;
  width?: number;
  height?: number;
}

export interface ItemGaleria {
  imagem: Imagem;
  legenda?: string;
}

/** HTML já renderizado de um campo Rich Text. */
export type RichHTML = string;

export interface Configuracoes {
  nome: string;
  slogan: string;
  descricao: string;
  fundacao: number;
  cidade: string;
  endereco?: string;
  email?: string;
  /** Número com DDI e DDD, apenas dígitos. Ex.: 5511999999999 */
  whatsapp: string;
  instagram?: string;
  facebook?: string;
  youtube?: string;
  pix: {
    chave: string;
    /** Nome do recebedor (até 25 caracteres no QR Code). */
    recebedor: string;
    /** Cidade do recebedor (até 15 caracteres no QR Code). */
    cidade: string;
  };
  ogImage?: Imagem;
}

export type StatusProjeto = 'Em andamento' | 'Concluído' | 'Recorrente';

export interface ProjetoSocial {
  slug: string;
  titulo: string;
  resumo: string;
  imagem?: Imagem;
  status: StatusProjeto;
  data?: string;
  conteudo: RichHTML;
  galeria: ItemGaleria[];
}

export type StatusCampanha = 'Ativa' | 'Em breve' | 'Encerrada';

export interface Campanha {
  slug: string;
  titulo: string;
  resumo: string;
  descricao: RichHTML;
  imagem?: Imagem;
  meta: number;
  arrecadado: number;
  dataInicio?: string;
  dataFim?: string;
  status: StatusCampanha;
  /** Chave PIX própria da campanha. Se vazia, usa a chave geral do clube. */
  chavePix?: string;
  /** QR Code enviado no Prismic. Se vazio, o QR Code é gerado no build. */
  qrCode?: Imagem;
  galeria: ItemGaleria[];
  resultado: RichHTML;
}

export interface Noticia {
  slug: string;
  titulo: string;
  resumo: string;
  imagem?: Imagem;
  data: string;
  categoria: string;
  conteudo: RichHTML;
}

export interface MembroDiretoria {
  nome: string;
  cargo: string;
  foto?: Imagem;
  bio?: string;
  mandato?: string;
  ordem: number;
}

export type NivelPatrocinio = 'Master' | 'Ouro' | 'Prata' | 'Apoiador';

export interface Patrocinador {
  nome: string;
  logo?: Imagem;
  site?: string;
  nivel: NivelPatrocinio;
  descricao?: string;
}

export interface Produto {
  slug: string;
  nome: string;
  descricao: RichHTML;
  resumo: string;
  preco?: number;
  imagens: Imagem[];
  tamanhos: string[];
  categoria: string;
  disponivel: boolean;
}

export type TipoEventoHistorico = 'Fundação' | 'Conquista' | 'Marco';

export interface EventoHistorico {
  ano: number;
  titulo: string;
  descricao: string;
  imagem?: Imagem;
  tipo: TipoEventoHistorico;
}
