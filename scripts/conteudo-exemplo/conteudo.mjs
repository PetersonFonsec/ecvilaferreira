/**
 * Conteúdo de demonstração enviado ao Prismic por scripts/enviar-conteudo.mjs.
 *
 * Tudo aqui é EXEMPLO: nomes, números, datas e textos servem para mostrar o site completo.
 * Os documentos chegam ao Prismic com a tag "exemplo" e as imagens com a tag "exemplo",
 * para serem encontrados e trocados (ou arquivados) quando o conteúdo real chegar.
 *
 * Imagens: o nome em `imagem`, `foto`, `logo` e nas galerias aponta para um arquivo em
 * scripts/conteudo-exemplo/imagens/ (gerado por scripts/gerar-imagens-exemplo.mjs).
 * Rich Text: cada string vira um parágrafo; "## " vira título e "- " vira item de lista.
 */

export const configuracoes = {
  nome: 'Esporte Clube Vila Ferreira',
  slogan: 'Mais que um time. Uma história construída no bairro.',
  descricao:
    'Time tradicional do futebol de várzea de São Bernardo do Campo, fundado em 1984. Futebol, comunidade e projetos sociais no bairro Vila Ferreira.',
  fundacao: 1984,
  cidade: 'São Bernardo do Campo, SP',
  endereco: 'Vila Ferreira, São Bernardo do Campo – SP (endereço de exemplo)',
  // WhatsApp, e-mail, redes sociais e PIX ficam vazios de propósito: o site usa os valores de
  // exemplo de src/data/fallback.ts até o clube cadastrar os dados reais no Prismic.
};

export const projetos = [
  {
    uid: 'escolinha-de-futebol',
    titulo: 'Escolinha de Futebol',
    resumo: 'Treinos gratuitos para crianças e adolescentes de 6 a 15 anos, duas vezes por semana.',
    status: 'Recorrente',
    data: '2026-02-07',
    imagem: 'projeto-escolinha.jpg',
    conteudo: [
      'A Escolinha do Vila Ferreira nasceu da vontade de dar às crianças do bairro o mesmo campo onde os pais e avós jogaram. Os treinos são gratuitos e acontecem às terças e quintas, no fim da tarde.',
      '## Como funciona',
      '- Turmas de 6 a 9, 10 a 12 e 13 a 15 anos',
      '- Professores voluntários, ex-atletas do clube',
      '- Matrícula com um responsável e a declaração escolar',
      'Além do futebol, a escolinha acompanha a frequência na escola: quem falta às aulas não perde o treino, mas ganha uma conversa com o professor.',
      '## Como ajudar',
      'Precisamos de bolas, coletes, cones e lanche para depois do treino. Fale com a diretoria pelo WhatsApp.',
      '(Texto de exemplo.)',
    ],
    galeria: [
      { imagem: 'galeria-treino.jpg', legenda: 'Treino da turma de 10 a 12 anos (imagem de exemplo)' },
      { imagem: 'galeria-material.jpg', legenda: 'Material doado pelos apoiadores (imagem de exemplo)' },
      { imagem: 'galeria-campo.jpg', legenda: 'O campo do bairro (imagem de exemplo)' },
    ],
  },
  {
    uid: 'festa-das-criancas-2026',
    titulo: 'Festa das Crianças 2026',
    resumo: 'Um dia de brincadeiras, futebol, pipoca e brinquedos para a criançada do bairro.',
    status: 'Em andamento',
    data: '2026-10-12',
    imagem: 'projeto-festa.jpg',
    conteudo: [
      'Todo 12 de outubro o campo vira parque. São gincanas, torneio relâmpago, cama elástica, algodão-doce e um brinquedo para cada criança.',
      'Em 2025 recebemos mais de 300 crianças. Neste ano a meta é chegar a 400, e a campanha de arrecadação está aberta.',
      '## Programação',
      '- 9h: abertura e café da manhã',
      '- 10h: torneio relâmpago por idade',
      '- 12h: almoço comunitário',
      '- 14h: brinquedos, gincanas e entrega dos presentes',
      '(Texto de exemplo.)',
    ],
    galeria: [
      { imagem: 'galeria-festa.jpg', legenda: 'Festa das Crianças 2025 (imagem de exemplo)' },
      { imagem: 'galeria-trofeu.jpg', legenda: 'Premiação do torneio relâmpago (imagem de exemplo)' },
    ],
  },
  {
    uid: 'arrecadacao-de-agasalhos',
    titulo: 'Arrecadação de Agasalhos',
    resumo: 'Campanha de inverno que entregou 620 peças de roupa e 85 cobertores a famílias do bairro.',
    status: 'Concluído',
    data: '2026-06-20',
    imagem: 'projeto-agasalhos.jpg',
    conteudo: [
      'Durante os jogos de maio e junho, a sede e a lanchonete do campo viraram ponto de coleta. Jogadores, torcedores e comerciantes trouxeram roupas, cobertores e calçados.',
      'As doações foram separadas por voluntárias da comunidade e entregues com a ajuda da associação de moradores.',
      '## Resultado',
      '- 620 peças de roupa',
      '- 85 cobertores',
      '- 140 famílias atendidas',
      '(Texto de exemplo.)',
    ],
    galeria: [],
  },
  {
    uid: 'mutirao-do-campo',
    titulo: 'Mutirão do Campo',
    resumo: 'Sábados de trabalho voluntário para cuidar do gramado, das traves e do alambrado.',
    status: 'Recorrente',
    data: '2026-08-15',
    imagem: 'projeto-mutirao.jpg',
    conteudo: [
      'O campo é de todos, e quem cuida dele também. Uma vez por mês, jogadores, diretoria e vizinhos se juntam para pintar as traves, consertar o alambrado e recuperar o gramado.',
      'Quem participa ganha o café da manhã e o almoço por conta do clube.',
      '(Texto de exemplo.)',
    ],
    galeria: [{ imagem: 'galeria-campo.jpg', legenda: 'Campo depois do mutirão (imagem de exemplo)' }],
  },
];

export const campanhas = [
  {
    uid: 'festa-das-criancas-2026',
    titulo: 'Festa das Crianças 2026',
    resumo: 'Ajude a garantir brinquedos, lanche e diversão para 400 crianças do bairro.',
    imagem: 'campanha-festa.jpg',
    status: 'Ativa',
    data_inicio: '2026-09-01',
    data_fim: '2026-10-11',
    meta: 6000,
    arrecadado: 4180,
    descricao: [
      'Cada R$ 15 garante um brinquedo novo. Cada R$ 5 paga o lanche de uma criança. Toda doação, de qualquer valor, faz diferença.',
      '## Para onde vai o dinheiro',
      '- 60% em brinquedos',
      '- 25% em lanche e almoço',
      '- 15% em brinquedos infláveis e som',
      'A prestação de contas sai na página de Transparência depois da festa.',
      '(Campanha de exemplo.)',
    ],
    galeria: [{ imagem: 'galeria-festa.jpg', legenda: 'Festa das Crianças 2025 (imagem de exemplo)' }],
  },
  {
    uid: 'reforma-do-vestiario',
    titulo: 'Reforma do Vestiário',
    resumo: 'Chuveiros, bancos novos e pintura para o vestiário que recebe a base e o time principal.',
    imagem: 'campanha-vestiario.jpg',
    status: 'Ativa',
    data_inicio: '2026-08-10',
    data_fim: '2026-12-15',
    meta: 12000,
    arrecadado: 3650,
    descricao: [
      'O vestiário do campo recebe mais de 150 atletas por semana, entre a escolinha, a base e o time principal. Os chuveiros estão quebrados e os bancos não dão conta.',
      '## O que vamos fazer',
      '- Trocar os 8 chuveiros e a fiação',
      '- Instalar bancos e ganchos novos',
      '- Pintar e impermeabilizar as paredes',
      '(Campanha de exemplo.)',
    ],
    galeria: [],
  },
  {
    uid: 'uniformes-base-2026',
    titulo: 'Uniformes para a Base',
    resumo: 'Novos uniformes completos para as categorias de base do clube.',
    imagem: 'campanha-uniformes.jpg',
    status: 'Encerrada',
    data_inicio: '2026-03-01',
    data_fim: '2026-05-01',
    meta: 3000,
    arrecadado: 3240,
    descricao: [
      'As categorias sub-11, sub-13 e sub-15 jogavam com uniformes emprestados. A campanha comprou jogos completos para os três times.',
      '(Campanha de exemplo.)',
    ],
    resultado: [
      'Meta batida com 108% do valor. Foram entregues 60 uniformes completos (camisa, calção e meião) e o que sobrou comprou 10 bolas oficiais.',
      'Obrigado a todos que doaram! (Resultado de exemplo.)',
    ],
    galeria: [{ imagem: 'galeria-uniformes.jpg', legenda: 'Entrega dos uniformes (imagem de exemplo)' }],
  },
];

export const noticias = [
  {
    uid: 'vila-ferreira-vence-classico-do-bairro',
    titulo: 'Vila Ferreira vence o clássico do bairro por 3 a 1',
    resumo: 'Com dois gols no segundo tempo, o time garantiu a liderança do grupo na copa da várzea.',
    data_publicacao: '2026-10-04',
    categoria: 'Futebol',
    imagem: 'noticia-classico.jpg',
    conteudo: [
      'Campo cheio, sol forte e muita torcida. O Vila Ferreira saiu atrás no placar, empatou ainda no primeiro tempo e virou com dois gols nos últimos 20 minutos.',
      'Com o resultado, o time chega a 10 pontos e lidera o grupo B. O próximo jogo é no domingo, às 10h, fora de casa.',
      '(Notícia de exemplo.)',
    ],
  },
  {
    uid: 'inscricoes-abertas-escolinha',
    titulo: 'Inscrições abertas para a escolinha',
    resumo: 'Vagas gratuitas para crianças de 6 a 15 anos. Basta comparecer com um responsável.',
    data_publicacao: '2026-09-22',
    categoria: 'Comunidade',
    imagem: 'noticia-escolinha.jpg',
    conteudo: [
      'A Escolinha do Vila Ferreira abriu 40 novas vagas para o segundo semestre. As inscrições são feitas no campo, às terças e quintas, das 17h às 19h.',
      '## O que levar',
      '- Documento da criança',
      '- Declaração de matrícula escolar',
      '- Um responsável maior de idade',
      '(Notícia de exemplo.)',
    ],
  },
  {
    uid: 'campanha-festa-das-criancas',
    titulo: 'Festa das Crianças: faltam R$ 1.820 para a meta',
    resumo: 'A campanha já garantiu brinquedos para 280 crianças. Ajude a completar a lista.',
    data_publicacao: '2026-09-15',
    categoria: 'Campanhas',
    imagem: 'noticia-campanha.jpg',
    conteudo: [
      'Em duas semanas de campanha, a comunidade já doou quase 70% da meta. Cada R$ 15 garante um brinquedo novo para uma criança do bairro.',
      'A doação é feita por PIX, direto na página da campanha.',
      '(Notícia de exemplo.)',
    ],
  },
  {
    uid: 'mutirao-recupera-gramado',
    titulo: 'Mutirão recupera o gramado e pinta as traves',
    resumo: 'Mais de 40 voluntários passaram o sábado cuidando do campo.',
    data_publicacao: '2026-08-16',
    categoria: 'Comunidade',
    imagem: 'noticia-mutirao.jpg',
    conteudo: [
      'Jogadores, diretoria e vizinhos se juntaram para replantar o gramado da grande área, pintar as traves e consertar o alambrado do lado da rua.',
      '(Notícia de exemplo.)',
    ],
  },
  {
    uid: 'clube-apresenta-nova-camisa',
    titulo: 'Clube apresenta a nova camisa oficial',
    resumo: 'O verde e branco de sempre, agora com as estrelas douradas do Cruzeiro do Sul.',
    data_publicacao: '2026-07-30',
    categoria: 'Clube',
    imagem: 'noticia-camisa.jpg',
    conteudo: [
      'A nova camisa mantém o verde tradicional e traz detalhes dourados inspirados nas estrelas do brasão. A venda é feita pelo site, com pedido pelo WhatsApp.',
      'Parte do valor de cada camisa vai para os projetos sociais do clube.',
      '(Notícia de exemplo.)',
    ],
  },
];

export const diretoria = [
  { nome: 'Carlos Alberto Souza', cargo: 'Presidente', ordem: 1, mandato: '2025–2027', bio: 'No clube desde os anos 90, primeiro como lateral, depois como técnico da base. (Perfil de exemplo.)' },
  { nome: 'Márcia Regina Lima', cargo: 'Vice-presidente', ordem: 2, mandato: '2025–2027', bio: 'Coordena os projetos sociais e a Festa das Crianças. (Perfil de exemplo.)' },
  { nome: 'José Roberto Santos', cargo: 'Tesoureiro', ordem: 3, mandato: '2025–2027', bio: 'Responsável pelas contas e pela prestação de contas das campanhas. (Perfil de exemplo.)' },
  { nome: 'Ana Paula Ferreira', cargo: 'Secretária', ordem: 4, mandato: '2025–2027', bio: 'Cuida das inscrições da escolinha e da comunicação do clube. (Perfil de exemplo.)' },
  { nome: 'Antônio Carlos Oliveira', cargo: 'Diretor de Futebol', ordem: 5, mandato: '2025–2027', bio: 'Monta o elenco principal e organiza os jogos da copa da várzea. (Perfil de exemplo.)' },
  { nome: 'Luiz Fernando Costa', cargo: 'Diretor de Patrimônio', ordem: 6, mandato: '2025–2027', bio: 'Organiza os mutirões e a manutenção do campo e do vestiário. (Perfil de exemplo.)' },
];

export const patrocinadores = [
  { nome: 'Auto Peças Ferreira', nivel: 'Master', logo: 'logo-auto-pecas.png', descricao: 'Patrocinador master do time principal. (Empresa fictícia de exemplo.)' },
  { nome: 'Padaria Pão da Vila', nivel: 'Ouro', logo: 'logo-padaria.png', descricao: 'Garante o lanche da escolinha toda semana. (Empresa fictícia de exemplo.)' },
  { nome: 'Mercado Bom Preço', nivel: 'Prata', logo: 'logo-mercado.png', descricao: 'Apoio às campanhas de arrecadação. (Empresa fictícia de exemplo.)' },
  { nome: 'Academia Ponto Forte', nivel: 'Apoiador', logo: 'logo-academia.png', descricao: 'Preparação física do elenco. (Empresa fictícia de exemplo.)' },
  { nome: 'Farmácia Saúde do Bairro', nivel: 'Apoiador', logo: 'logo-farmacia.png', descricao: 'Kit de primeiros socorros dos jogos. (Empresa fictícia de exemplo.)' },
];

export const produtos = [
  {
    uid: 'camisa-oficial-2026',
    nome: 'Camisa Oficial 2026',
    resumo: 'Verde e branca, com as estrelas douradas do brasão.',
    descricao: [
      'A camisa de jogo do Vila Ferreira, em tecido leve e respirável. Parte do valor vai para os projetos sociais do clube.',
      '- Tamanhos do P ao GG',
      '- Escudo bordado',
      '(Produto de exemplo.)',
    ],
    preco: 120,
    imagens: ['produto-camisa-oficial.jpg', 'produto-camisa-oficial-costas.jpg'],
    tamanhos: 'P, M, G, GG',
    categoria: 'Vestuário',
    disponivel: true,
  },
  {
    uid: 'camisa-treino-2026',
    nome: 'Camisa de Treino',
    resumo: 'Branca com detalhes verdes, a mesma que o time usa nos treinos.',
    descricao: ['Camisa de treino em dry fit. (Produto de exemplo.)'],
    preco: 80,
    imagens: ['produto-camisa-treino.jpg'],
    tamanhos: 'P, M, G, GG',
    categoria: 'Vestuário',
    disponivel: true,
  },
  {
    uid: 'bone-vila-ferreira',
    nome: 'Boné Vila Ferreira',
    resumo: 'Boné verde com o escudo bordado na frente.',
    descricao: ['Ajuste traseiro, tamanho único. (Produto de exemplo.)'],
    preco: 50,
    imagens: ['produto-bone.jpg'],
    tamanhos: '',
    categoria: 'Acessórios',
    disponivel: true,
  },
  {
    uid: 'caneca-vila-ferreira',
    nome: 'Caneca do Clube',
    resumo: 'Caneca de porcelana com o escudo e o ano de fundação.',
    descricao: ['325 ml, pode ir ao micro-ondas. (Produto de exemplo.)'],
    preco: 40,
    imagens: ['produto-caneca.jpg'],
    tamanhos: '',
    categoria: 'Acessórios',
    disponivel: true,
  },
  {
    uid: 'bandeira-vila-ferreira',
    nome: 'Bandeira do Vila Ferreira',
    resumo: 'Bandeira de 1,30 m × 0,90 m para levar ao campo.',
    descricao: ['Tecido resistente, com ilhoses. Esgotada: nova remessa em breve. (Produto de exemplo.)'],
    preco: 70,
    imagens: ['produto-bandeira.jpg'],
    tamanhos: '',
    categoria: 'Torcida',
    disponivel: false,
  },
];

export const historia = [
  { ano: 1984, tipo: 'Fundação', titulo: 'Nasce o Vila Ferreira', descricao: 'Em 6 de setembro, moradores do bairro fundam o Esporte Clube Vila Ferreira num campo de terra batida. (Texto de exemplo.)', imagem: 'historia-fundacao.jpg' },
  { ano: 1992, tipo: 'Conquista', titulo: 'Primeiro título da várzea', descricao: 'O time vence o campeonato regional e leva o primeiro troféu para a sede. (Texto de exemplo.)', imagem: 'historia-titulo.jpg' },
  { ano: 2001, tipo: 'Marco', titulo: 'Começa a escolinha', descricao: 'Ex-jogadores passam a treinar as crianças do bairro de graça, duas vezes por semana. (Texto de exemplo.)' },
  { ano: 2009, tipo: 'Conquista', titulo: 'Bicampeão regional', descricao: 'Duas conquistas seguidas colocam o Vila Ferreira entre os grandes da várzea da cidade. (Texto de exemplo.)' },
  { ano: 2015, tipo: 'Marco', titulo: 'Primeira Festa das Crianças', descricao: 'O campo vira parque no Dia das Crianças, tradição que continua até hoje. (Texto de exemplo.)' },
  { ano: 2024, tipo: 'Marco', titulo: '40 anos de história', descricao: 'O clube celebra quatro décadas com jogo festivo, ex-atletas e toda a comunidade. (Texto de exemplo.)', imagem: 'historia-40-anos.jpg' },
];
