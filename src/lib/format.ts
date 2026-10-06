const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const dataLonga = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

export const formatarMoeda = (valor: number) => moeda.format(valor);

/** Recebe datas no formato do Prismic (AAAA-MM-DD). */
export const formatarData = (iso: string) => dataLonga.format(new Date(`${iso.slice(0, 10)}T00:00:00Z`));

/** Percentual de 0 a 100, arredondado para baixo. */
export const percentual = (atual: number, meta: number) =>
  meta > 0 ? Math.min(100, Math.floor((atual / meta) * 100)) : 0;
