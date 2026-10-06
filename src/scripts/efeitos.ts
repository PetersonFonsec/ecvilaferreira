/**
 * Ponto de entrada dos efeitos de movimento. Tudo aqui é melhoria progressiva:
 * sem JavaScript, ou com "reduzir movimento" ativado no sistema, o conteúdo aparece normalmente.
 */
import { ponteiroFino, reduzMovimento } from './movimento';
import { iniciarBarraDeProgresso, iniciarRolagemSuave, pararRolagem } from './rolagem';
import { iniciarAbertura } from './abertura';
import { iniciarRevelar } from './revelar';
import { iniciarCursor } from './cursor';
import {
  iniciarAcender,
  iniciarContadores,
  iniciarHorizontal,
  iniciarInclinar,
  iniciarLetreiros,
  iniciarMagnetico,
  iniciarParallax,
  iniciarSeguirCursor,
} from './interacoes';

const animar = !reduzMovimento();
const raiz = document.documentElement;

const comAbertura = raiz.classList.contains('abertura');

iniciarBarraDeProgresso();

if (animar) {
  iniciarRolagemSuave();
  if (comAbertura) pararRolagem(true);
  iniciarParallax();
  iniciarContadores();
  iniciarLetreiros();
  iniciarAcender();
  iniciarHorizontal();

  if (ponteiroFino()) {
    iniciarCursor();
    iniciarMagnetico();
    iniciarInclinar();
    iniciarSeguirCursor();
  }
}

// O brasão 3D só é baixado quando há um palco para ele, o navegador tem WebGL e o usuário não pediu economia.
// Com a tela de abertura na frente, começa a baixar na hora (a abertura espera por ele).
const tarefas: Promise<unknown>[] = [document.fonts.ready];
if (document.readyState !== 'complete') tarefas.push(new Promise((ok) => addEventListener('load', ok, { once: true })));

const palco = document.querySelector<HTMLElement>('[data-escudo-3d]');
const economia = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
if (palco && animar && !economia) {
  const carregar = () => import('./escudo3d').then(({ montarEscudo3D }) => montarEscudo3D(palco)).catch(() => {});
  if (comAbertura) tarefas.push(carregar());
  else if ('requestIdleCallback' in window) requestIdleCallback(carregar, { timeout: 1500 });
  else setTimeout(carregar, 300);
}

// As animações de entrada da página só começam quando a abertura sai (ou na hora, se não houver abertura).
iniciarAbertura(tarefas).then(() => {
  pararRolagem(false);
  iniciarRevelar(animar);
});

raiz.classList.add('efeitos-ok');
