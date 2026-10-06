/**
 * Conteúdo de exemplo usado enquanto o repositório Prismic não estiver configurado
 * (variável PRISMIC_REPOSITORY vazia). Serve para desenvolver o layout e validar o build.
 * Nenhum dado aqui é oficial: substitua tudo pelo conteúdo real no Prismic.
 */
import type {
  Campanha,
  Configuracoes,
  EventoHistorico,
  MembroDiretoria,
  Noticia,
  Patrocinador,
  Produto,
  ProjetoSocial,
} from '@/lib/types';

const p = (texto: string) => `<p>${texto}</p>`;

export const configuracoes: Configuracoes = {
  nome: 'Esporte Clube Vila Ferreira',
  slogan: 'Mais que um time. Uma história construída no bairro.',
  descricao:
    'Time tradicional do futebol de várzea de São Bernardo do Campo, fundado em 1984. Futebol, comunidade e projetos sociais no bairro Vila Ferreira.',
  fundacao: 1984,
  cidade: 'São Bernardo do Campo, SP',
  endereco: 'Endereço do clube (exemplo)',
  email: 'contato@exemplo.com.br',
  whatsapp: '5511900000000',
  instagram: 'https://www.instagram.com/',
  pix: {
    chave: 'contato@exemplo.com.br',
    recebedor: 'EC VILA FERREIRA',
    cidade: 'SAO BERNARDO',
  },
};

export const projetos: ProjetoSocial[] = [
  {
    slug: 'festa-das-criancas-2026',
    titulo: 'Festa das Crianças 2026',
    resumo: 'Um dia de brincadeiras, futebol e lanche para as crianças do bairro.',
    status: 'Em andamento',
    data: '2026-10-12',
    conteudo: p('Conteúdo de exemplo. Descreva aqui o projeto, quem participa e como ajudar.'),
    galeria: [],
  },
  {
    slug: 'escolinha-de-futebol',
    titulo: 'Escolinha de Futebol',
    resumo: 'Treinos gratuitos para crianças e adolescentes da comunidade.',
    status: 'Recorrente',
    conteudo: p('Conteúdo de exemplo sobre a escolinha.'),
    galeria: [],
  },
  {
    slug: 'arrecadacao-de-agasalhos',
    titulo: 'Arrecadação de Agasalhos',
    resumo: 'Campanha de inverno com doações entregues a famílias do bairro.',
    status: 'Concluído',
    data: '2026-06-20',
    conteudo: p('Conteúdo de exemplo sobre a arrecadação.'),
    galeria: [],
  },
];

export const campanhas: Campanha[] = [
  {
    slug: 'festa-das-criancas-2026',
    titulo: 'Festa das Crianças 2026',
    resumo: 'Ajude a garantir brinquedos, lanche e diversão para a criançada do bairro.',
    descricao: p('Conteúdo de exemplo. Explique o objetivo da campanha e como o dinheiro será usado.'),
    meta: 5000,
    arrecadado: 3150,
    dataInicio: '2026-09-01',
    dataFim: '2026-10-10',
    status: 'Ativa',
    galeria: [],
    resultado: '',
  },
  {
    slug: 'uniformes-base-2026',
    titulo: 'Uniformes para a base',
    resumo: 'Novos uniformes para as categorias de base do clube.',
    descricao: p('Conteúdo de exemplo.'),
    meta: 3000,
    arrecadado: 3000,
    dataInicio: '2026-03-01',
    dataFim: '2026-05-01',
    status: 'Encerrada',
    galeria: [],
    resultado: p('Exemplo de resultado: meta atingida e 40 uniformes entregues.'),
  },
];

export const noticias: Noticia[] = [
  {
    slug: 'vila-ferreira-estreia-na-copa-2026',
    titulo: 'Vila Ferreira estreia na copa da várzea',
    resumo: 'Notícia de exemplo para validar o layout da listagem.',
    data: '2026-09-20',
    categoria: 'Futebol',
    conteudo: p('Conteúdo de exemplo da notícia.'),
  },
  {
    slug: 'mutirao-no-campo',
    titulo: 'Mutirão de manutenção no campo',
    resumo: 'Notícia de exemplo sobre uma ação da comunidade.',
    data: '2026-08-15',
    categoria: 'Comunidade',
    conteudo: p('Conteúdo de exemplo da notícia.'),
  },
];

export const diretoria: MembroDiretoria[] = [
  { nome: 'Nome do Presidente', cargo: 'Presidente', ordem: 1, mandato: '2025–2027' },
  { nome: 'Nome do Vice', cargo: 'Vice-presidente', ordem: 2, mandato: '2025–2027' },
  { nome: 'Nome do Tesoureiro', cargo: 'Tesoureiro', ordem: 3, mandato: '2025–2027' },
  { nome: 'Nome do Diretor', cargo: 'Diretor de Futebol', ordem: 4, mandato: '2025–2027' },
];

export const patrocinadores: Patrocinador[] = [
  { nome: 'Patrocinador Master (exemplo)', nivel: 'Master', descricao: 'Empresa parceira do clube.' },
  { nome: 'Comércio do Bairro (exemplo)', nivel: 'Apoiador' },
];

export const produtos: Produto[] = [
  {
    slug: 'camisa-oficial-2026',
    nome: 'Camisa Oficial 2026',
    resumo: 'Camisa verde e branca do Vila Ferreira.',
    descricao: p('Produto de exemplo.'),
    preco: 120,
    imagens: [],
    tamanhos: ['P', 'M', 'G', 'GG'],
    categoria: 'Vestuário',
    disponivel: true,
  },
  {
    slug: 'caneca-vila-ferreira',
    nome: 'Caneca Vila Ferreira',
    resumo: 'Caneca com o escudo do clube.',
    descricao: p('Produto de exemplo.'),
    preco: 40,
    imagens: [],
    tamanhos: [],
    categoria: 'Acessórios',
    disponivel: true,
  },
];

export const historia: EventoHistorico[] = [
  {
    ano: 1984,
    titulo: 'Fundação do clube',
    descricao: 'Moradores do bairro fundam o Esporte Clube Vila Ferreira.',
    tipo: 'Fundação',
  },
  {
    ano: 2000,
    titulo: 'Marco de exemplo',
    descricao: 'Cadastre os fatos marcantes da história no Prismic.',
    tipo: 'Marco',
  },
  {
    ano: 2010,
    titulo: 'Conquista de exemplo',
    descricao: 'Cadastre títulos e conquistas no Prismic.',
    tipo: 'Conquista',
  },
];
