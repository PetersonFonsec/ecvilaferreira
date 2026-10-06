/**
 * Ilustrações em traço, desenhadas à mão em SVG para o site.
 * Cada desenho é uma lista de traços (que se desenham ao aparecer na tela) e de preenchimentos
 * (detalhes em dourado ou na cor do traço que surgem no fim).
 */

export interface Preenchimento {
  d: string;
  /** 'ouro' (padrão) ou 'traco' (mesma cor das linhas). */
  cor?: 'ouro' | 'traco';
}

export interface Desenho {
  viewBox: string;
  /** Linhas principais, na cor do texto. */
  tracos: string[];
  /** Linhas de destaque, em dourado. */
  destaques?: string[];
  preenchimentos?: Preenchimento[];
}

const circulo = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy}a${r},${r} 0 1 0 ${2 * r},0a${r},${r} 0 1 0 ${-2 * r},0`;

const estrela = (cx: number, cy: number, r: number, interno = 0.42) => {
  const pontos: string[] = [];
  for (let i = 0; i < 10; i++) {
    const raio = i % 2 === 0 ? r : r * interno;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    pontos.push(`${(cx + raio * Math.cos(a)).toFixed(1)},${(cy + raio * Math.sin(a)).toFixed(1)}`);
  }
  return `M${pontos.join('L')}Z`;
};

/** Brilho de quatro pontas. */
const brilho = (x: number, y: number, r: number) =>
  `M${x},${y - r}Q${x},${y} ${x + r},${y}Q${x},${y} ${x},${y + r}Q${x},${y} ${x - r},${y}Q${x},${y} ${x},${y - r}Z`;

const pentagono = (cx: number, cy: number, r: number, giro = -90) => {
  const p = Array.from({ length: 5 }, (_, k) => {
    const a = ((giro + 72 * k) * Math.PI) / 180;
    return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
  });
  return `M${p.join('L')}Z`;
};

/** Bola de futebol: pentágono central e costuras até a borda. */
function bola(cx: number, cy: number, r: number) {
  const costuras: string[] = [];
  for (let k = 0; k < 5; k++) {
    const a = ((-90 + 72 * k) * Math.PI) / 180;
    const v = [cx + r * 0.34 * Math.cos(a), cy + r * 0.34 * Math.sin(a)];
    const o = [cx + r * 0.66 * Math.cos(a), cy + r * 0.66 * Math.sin(a)];
    costuras.push(`M${v[0].toFixed(1)},${v[1].toFixed(1)}L${o[0].toFixed(1)},${o[1].toFixed(1)}`);
    for (const lado of [-1, 1]) {
      const b = a + lado * 0.42;
      costuras.push(
        `M${o[0].toFixed(1)},${o[1].toFixed(1)}L${(cx + r * Math.cos(b)).toFixed(1)},${(cy + r * Math.sin(b)).toFixed(1)}`,
      );
    }
  }
  return { contorno: circulo(cx, cy, r), costuras: costuras.join(''), centro: pentagono(cx, cy, r * 0.34) };
}

const bolaGrande = bola(140, 120, 76);
const bolaPequena = bola(150, 170, 15);
const bolaCoracao = bola(120, 112, 24);
const bolaBandeira = bola(176, 196, 16);

export const ilustracoes = {
  campo: {
    viewBox: '0 0 600 380',
    tracos: [
      'M20,20H580V360H20Z',
      'M300,20V360',
      circulo(300, 190, 54),
      'M20,100H110V280H20',
      'M20,150H50V230H20',
      'M110,160A50,50 0 0 1 110,220',
      'M580,100H490V280H580',
      'M580,150H550V230H580',
      'M490,160A50,50 0 0 0 490,220',
      'M20,32A12,12 0 0 0 32,20M568,20A12,12 0 0 0 580,32M580,348A12,12 0 0 0 568,360M32,360A12,12 0 0 0 20,348',
    ],
    preenchimentos: [
      { d: circulo(300, 190, 4), cor: 'traco' },
      { d: circulo(80, 190, 3), cor: 'traco' },
      { d: circulo(520, 190, 3), cor: 'traco' },
    ],
  },

  bola: {
    viewBox: '0 0 240 240',
    tracos: [bolaGrande.contorno, bolaGrande.costuras],
    destaques: ['M12,92H44', 'M4,120H38', 'M14,148H46'],
    preenchimentos: [
      { d: bolaGrande.centro, cor: 'traco' },
      { d: brilho(214, 40, 12) },
      { d: brilho(30, 200, 8) },
    ],
  },

  trave: {
    viewBox: '0 0 240 240',
    tracos: [
      'M20,200H220',
      'M50,200V70H190V200',
      'M50,70L72,96H168L190,70M72,96V188H168V96M50,200L72,188M190,200L168,188',
      'M84,96V188M96,96V188M108,96V188M120,96V188M132,96V188M144,96V188M156,96V188M72,108H168M72,120H168M72,132H168M72,144H168M72,156H168M72,168H168M72,180H168',
      bolaPequena.contorno,
    ],
    preenchimentos: [{ d: bolaPequena.centro, cor: 'traco' }, { d: brilho(206, 46, 10) }],
  },

  bairro: {
    viewBox: '0 0 320 200',
    tracos: [
      'M10,180H310',
      'M30,180V110H90V180M24,112L60,82L96,112M44,128h14v14h-14ZM66,180V148H80V180',
      'M100,180V80H160V180M100,128H160M112,92h14v14h-14ZM136,92h14v14h-14ZM112,142h14v14h-14ZM138,180V146H152V180M118,80V64H142V80',
      'M170,180V122H230V180M166,122H234M186,136h28v16h-28ZM196,180V162H206V180',
      'M266,180V40M250,40H282V18H250ZM258,18V40M266,18V40M274,18V40M250,29H282M258,180L266,150L274,180',
    ],
    destaques: ['M252,44L222,96', 'M280,44L306,90', 'M100,62C120,74 140,74 160,62M110,68l-3,8M124,72l-1,8M138,72l1,8M150,67l3,8'],
    preenchimentos: [{ d: circulo(36, 40, 12) }, { d: brilho(200, 50, 7) }],
  },

  camisa: {
    viewBox: '0 0 240 240',
    tracos: [
      'M84,40L56,52L24,92L52,114L68,98V206H172V98L188,114L216,92L184,52L156,40C150,58 136,66 120,66C104,66 90,58 84,40Z',
      'M104,60L120,82L136,60',
      'M30,86L56,106M210,86L184,106',
      'M68,194H172',
      circulo(146, 108, 13),
      'M92,138H148M96,150H144',
    ],
    preenchimentos: [{ d: estrela(146, 108, 7) }, { d: estrela(136, 86, 4) }, { d: estrela(156, 86, 4) }],
  },

  coracao: {
    viewBox: '0 0 240 240',
    tracos: [
      'M120,200C60,160 30,120 30,88C30,58 54,40 78,40C98,40 112,52 120,66C128,52 142,40 162,40C186,40 210,58 210,88C210,120 180,160 120,200Z',
      bolaCoracao.contorno,
      bolaCoracao.costuras,
    ],
    preenchimentos: [
      { d: bolaCoracao.centro, cor: 'traco' },
      { d: brilho(212, 34, 12) },
      { d: brilho(30, 186, 9) },
      { d: brilho(196, 176, 6) },
    ],
  },

  trofeu: {
    viewBox: '0 0 240 240',
    tracos: [
      'M70,50H170V80C170,125 145,150 120,150C95,150 70,125 70,80Z',
      'M70,62C40,62 38,105 78,112M170,62C200,62 202,105 162,112',
      'M110,150V172M130,150V172',
      'M92,172H148V188H92ZM82,188H158V200H82Z',
      'M50,212H190',
    ],
    preenchimentos: [{ d: estrela(120, 96, 16) }, { d: brilho(46, 40, 10) }, { d: brilho(196, 34, 13) }],
  },

  apito: {
    viewBox: '0 0 240 240',
    tracos: [
      'M40,110H120C150,110 170,130 170,152C170,176 150,194 126,194C102,194 84,176 84,154H40Z',
      'M98,110V96H114V110',
      'M48,110C36,62 112,26 168,38C210,46 214,92 188,104',
    ],
    destaques: ['M184,124L208,110', 'M190,148L218,146', 'M184,172L206,186'],
    preenchimentos: [{ d: circulo(128, 152, 13) }],
  },

  prancheta: {
    viewBox: '0 0 240 240',
    tracos: [
      'M50,40H190V214H50Z',
      'M96,28H144V52H96Z',
      'M66,64H174V198H66ZM66,131H174',
      circulo(120, 131, 16),
      'M80,82l12,12m0,-12l-12,12M152,160l12,12m0,-12l-12,12',
      circulo(150, 88, 7) + circulo(94, 172, 7),
    ],
    destaques: ['M92,100C108,120 128,108 138,150', 'M130,145L138,151L141,141'],
  },

  cofrinho: {
    viewBox: '0 0 240 240',
    tracos: [
      'M40,130a78,58 0 1 0 156,0a78,58 0 1 0 -156,0',
      'M194,114h14v30h-14',
      'M80,82L92,56L112,76',
      'M74,180V200H92V186M140,186V200H158V180',
      'M41,124C24,120 22,102 34,102C46,102 40,118 28,118',
      'M100,76H136',
      circulo(118, 34, 16),
    ],
    preenchimentos: [{ d: circulo(168, 112, 4), cor: 'traco' }, { d: estrela(118, 34, 9) }, { d: brilho(204, 64, 9) }],
  },

  megafone: {
    viewBox: '0 0 240 240',
    tracos: [
      'M60,100L170,50V190L60,140Z',
      'M170,50C186,50 192,90 192,120C192,150 186,190 170,190',
      'M40,100H60V140H40Z',
      'M92,138L100,176H118L112,130',
    ],
    destaques: ['M206,92C214,106 214,134 206,148', 'M222,74C236,98 236,142 222,166'],
    preenchimentos: [{ d: brilho(30, 60, 9) }],
  },

  chuteira: {
    viewBox: '0 0 260 200',
    tracos: [
      'M30,140C30,120 40,104 60,100L104,92C112,70 122,52 138,50L170,48C176,62 180,80 196,92C214,104 234,112 236,132C238,144 230,150 216,150H44C36,150 30,146 30,140Z',
      'M60,150v10h12v-10M100,150v10h12v-10M168,150v10h12v-10M204,150v10h12v-10',
      'M126,60L154,74M120,70L150,84M114,80L146,94M108,90L142,104',
      'M60,100C54,112 52,126 56,140',
    ],
    destaques: ['M150,128C176,124 200,116 222,118', 'M4,110H24M10,128H26'],
    preenchimentos: [{ d: estrela(84, 124, 8) }],
  },

  bandeirinha: {
    viewBox: '0 0 240 240',
    tracos: ['M80,216V36', 'M80,40L176,68L80,96', 'M80,216H230', 'M120,216A40,40 0 0 0 80,176', bolaBandeira.contorno],
    preenchimentos: [
      { d: 'M80,40L176,68L80,96Z' },
      { d: bolaBandeira.centro, cor: 'traco' },
      { d: brilho(200, 40, 10) },
    ],
  },
} satisfies Record<string, Desenho>;

export type NomeIlustracao = keyof typeof ilustracoes;
