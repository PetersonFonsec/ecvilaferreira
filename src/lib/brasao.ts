/**
 * Brasão do Esporte Clube Vila Ferreira em SVG, redesenhado em vetor a partir da arte oficial.
 * Fica num módulo sem dependências para ser usado tanto pelo componente Escudo quanto pelo
 * script que gera favicon e imagens de compartilhamento (scripts/gerar-imagens.mjs).
 */

export interface OpcoesBrasao {
  /** Largura em px. A altura acompanha a proporção. */
  tamanho?: number;
  classe?: string;
  /** Sem os textos do anel (para tamanhos pequenos). */
  simples?: boolean;
  /** Mostra as duas estrelas douradas acima do círculo. */
  estrelas?: boolean;
  /** Texto alternativo. Sem ele, o brasão é decorativo. */
  rotulo?: string;
  /** Prefixo único dos ids internos (o mesmo brasão pode aparecer várias vezes na página). */
  id?: string;
  /**
   * 'tokens' usa as variáveis CSS do site (--escudo-verde etc.), com as cores oficiais como reserva.
   * 'fixas' grava as cores direto, para o SVG funcionar sozinho (favicon).
   */
  cores?: 'tokens' | 'fixas';
}

export const CORES_BRASAO = {
  verde: '#0b6427',
  branco: '#ffffff',
  ouro: '#f2cb2c',
  data: '#5b625e',
};

const FONTE = "'Barlow Condensed', 'Arial Narrow', Arial, sans-serif";

function estrela(cx: number, cy: number, r: number) {
  const pontos: string[] = [];
  for (let i = 0; i < 10; i++) {
    const raio = i % 2 === 0 ? r : r * 0.42;
    const angulo = (Math.PI / 5) * i - Math.PI / 2;
    pontos.push(`${(cx + raio * Math.cos(angulo)).toFixed(2)},${(cy + raio * Math.sin(angulo)).toFixed(2)}`);
  }
  return `M${pontos.join('L')}Z`;
}

const escapar = (texto: string) =>
  texto.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function svgBrasao(opcoes: OpcoesBrasao = {}) {
  const {
    tamanho = 40,
    classe,
    simples = false,
    estrelas = true,
    rotulo,
    id = `escudo-${Math.random().toString(36).slice(2, 8)}`,
    cores = 'tokens',
  } = opcoes;

  const cor = (nome: 'verde' | 'branco' | 'ouro') =>
    cores === 'fixas' ? CORES_BRASAO[nome] : `var(--escudo-${nome}, ${CORES_BRASAO[nome]})`;
  const preencher = (nome: 'verde' | 'branco' | 'ouro') => `style="fill:${cor(nome)}"`;

  // Centro do círculo, no sistema de coordenadas do viewBox (as estrelas ficam acima dele).
  const cx = 100;
  const cy = estrelas ? 144 : 100;
  const altura = estrelas ? 244 : 200;

  // Cruzeiro do Sul. Na versão simples as estrelas ficam maiores para continuarem visíveis em 16 px.
  const escalaPosicao = simples ? 0.86 : 1;
  const escalaEstrela = simples ? 1.6 : 1;
  const cruzeiro = [
    [-14.4, -45, 8],
    [-44, -10.3, 8],
    [30, -20.6, 7.5],
    [25.8, 22.2, 7.5],
    [-19.6, 42.3, 6],
  ]
    .map(([x, y, r]) => estrela(cx + x * escalaPosicao, cy + y * escalaPosicao, r * escalaEstrela))
    .join('');

  const partes: string[] = [];

  partes.push(
    `<defs><path id="${id}-cima" d="M${cx - 68.8},${cy} A68.8,68.8 0 0 1 ${cx + 68.8},${cy}"/>` +
      `<path id="${id}-baixo" d="M${cx - 86.4},${cy} A86.4,86.4 0 0 0 ${cx + 86.4},${cy}"/></defs>`,
  );

  if (estrelas) {
    partes.push(`<path ${preencher('ouro')} d="${estrela(cx - 53, cy - 119, 23)}${estrela(cx + 53, cy - 119, 23)}"/>`);
  }

  partes.push(
    `<circle cx="${cx}" cy="${cy}" r="98" ${preencher('verde')}/>`,
    `<circle cx="${cx}" cy="${cy}" r="${simples ? 90 : 93.6}" style="fill:none;stroke:${cor('branco')};stroke-width:${simples ? 6 : 2.8}"/>`,
    `<circle cx="${cx}" cy="${cy}" r="${simples ? 58 : 62}" ${preencher('branco')}/>`,
  );

  if (!simples) {
    partes.push(
      `<g ${preencher('branco')} font-family="${FONTE}" font-weight="700" font-size="25">` +
        `<text text-anchor="middle"><textPath href="#${id}-cima" startOffset="50%" textLength="196" lengthAdjust="spacing">ESPORTE CLUBE</textPath></text>` +
        `<text text-anchor="middle"><textPath href="#${id}-baixo" startOffset="50%" textLength="238" lengthAdjust="spacing">VILA FERREIRA</textPath></text>` +
        `<circle cx="${cx - 77}" cy="${cy}" r="3.4"/><circle cx="${cx + 77}" cy="${cy}" r="3.4"/></g>`,
    );
  }

  partes.push(`<path ${preencher('verde')} d="${cruzeiro}"/>`);

  if (!simples) {
    partes.push(
      `<text x="${cx}" y="${cy + 4.5}" text-anchor="middle" style="fill:${CORES_BRASAO.data}" font-family="${FONTE}" font-weight="600" font-size="13" textLength="66" lengthAdjust="spacing">06·09·1984</text>`,
    );
  }

  const acessibilidade = rotulo ? `role="img" aria-label="${escapar(rotulo)}"` : 'aria-hidden="true"';
  const altPx = Math.round((tamanho * altura) / 200);

  return (
    `<svg xmlns="http://www.w3.org/2000/svg"${classe ? ` class="${escapar(classe)}"` : ''} width="${tamanho}" height="${altPx}" ` +
    `viewBox="0 0 200 ${altura}" ${acessibilidade} focusable="false">` +
    (rotulo ? `<title>${escapar(rotulo)}</title>` : '') +
    partes.join('') +
    '</svg>'
  );
}
