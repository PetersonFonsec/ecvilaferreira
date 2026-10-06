/**
 * Registra o service worker, que permite instalar o site na tela inicial do celular
 * e abrir offline as páginas já visitadas. Só em produção, para não atrapalhar o `astro dev`.
 */
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Sem service worker o site continua funcionando normalmente.
    });
  });
}
