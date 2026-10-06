/**
 * Gera o código PIX "copia e cola" (BR Code estático, padrão EMV do Banco Central)
 * e o QR Code correspondente em SVG. Tudo acontece no build: nenhum JS vai para o navegador.
 */
import QRCode from 'qrcode';

interface DadosPix {
  chave: string;
  recebedor: string;
  cidade: string;
  /** Texto curto exibido no app do banco (opcional). */
  descricao?: string;
  valor?: number;
}

const campo = (id: string, valor: string) => `${id}${String(valor.length).padStart(2, '0')}${valor}`;

// O padrão aceita apenas ASCII sem acentos nos campos de nome e cidade.
const limpar = (texto: string, max: number) =>
  texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^A-Za-z0-9 ]/g, '')
    .toUpperCase()
    .slice(0, max)
    .trim();

function crc16(payload: string) {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let bit = 0; bit < 8; bit++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

export function codigoPix({ chave, recebedor, cidade, descricao, valor }: DadosPix) {
  const conta = [
    campo('00', 'br.gov.bcb.pix'),
    campo('01', chave.trim()),
    descricao ? campo('02', limpar(descricao, 40)) : '',
  ].join('');

  const semCrc = [
    campo('00', '01'),
    campo('26', conta),
    campo('52', '0000'),
    campo('53', '986'),
    valor ? campo('54', valor.toFixed(2)) : '',
    campo('58', 'BR'),
    campo('59', limpar(recebedor, 25)),
    campo('60', limpar(cidade, 15)),
    campo('62', campo('05', '***')),
    '6304',
  ].join('');

  return semCrc + crc16(semCrc);
}

export function qrCodeSvg(codigo: string) {
  return QRCode.toString(codigo, { type: 'svg', margin: 1, errorCorrectionLevel: 'M' });
}
