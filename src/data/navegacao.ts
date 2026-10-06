export interface ItemMenu {
  rotulo: string;
  href: string;
}

/** Menu principal: organizado pelos quatro pilares (Clube, Comunidade, Apoie, Loja). */
export const menuPrincipal: ItemMenu[] = [
  { rotulo: 'História', href: '/historia' },
  { rotulo: 'Projetos', href: '/projetos' },
  { rotulo: 'Notícias', href: '/noticias' },
  { rotulo: 'Loja', href: '/loja' },
  { rotulo: 'Contato', href: '/contato' },
];

/** Botão de destaque no cabeçalho. */
export const menuDestaque: ItemMenu = { rotulo: 'Apoie', href: '/apoie' };

export const menuRodape: { titulo: string; itens: ItemMenu[] }[] = [
  {
    titulo: 'Clube',
    itens: [
      { rotulo: 'História', href: '/historia' },
      { rotulo: 'Diretoria', href: '/diretoria' },
      { rotulo: 'Notícias', href: '/noticias' },
    ],
  },
  {
    titulo: 'Comunidade',
    itens: [{ rotulo: 'Projetos sociais', href: '/projetos' }],
  },
  {
    titulo: 'Apoie',
    itens: [
      { rotulo: 'Como apoiar', href: '/apoie' },
      { rotulo: 'Campanhas', href: '/campanhas' },
      { rotulo: 'Patrocinadores', href: '/patrocinadores' },
      { rotulo: 'Transparência', href: '/transparencia' },
    ],
  },
  {
    titulo: 'Loja',
    itens: [
      { rotulo: 'Produtos oficiais', href: '/loja' },
      { rotulo: 'Contato', href: '/contato' },
    ],
  },
];
