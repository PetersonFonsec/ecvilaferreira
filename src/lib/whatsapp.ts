import type { Produto } from '@/lib/types';
import { formatarMoeda } from '@/lib/format';

/** Link wa.me com mensagem pré-preenchida. `numero` apenas com dígitos, incluindo DDI. */
export function linkWhatsApp(numero: string, mensagem?: string) {
  const base = `https://wa.me/${numero.replace(/\D/g, '')}`;
  return mensagem ? `${base}?text=${encodeURIComponent(mensagem)}` : base;
}

export function mensagemProduto(produto: Produto, urlProduto: string) {
  const linhas = [
    `Olá! Tenho interesse no produto *${produto.nome}* da loja do Vila Ferreira.`,
    produto.preco !== undefined ? `Preço: ${formatarMoeda(produto.preco)}` : undefined,
    produto.tamanhos.length ? `Tamanho: (${produto.tamanhos.join(' / ')})` : undefined,
    urlProduto,
  ];
  return linhas.filter(Boolean).join('\n');
}
