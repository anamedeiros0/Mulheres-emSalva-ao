/* Acessibilidade: painel de leitura (tamanho, fonte, espaço, contraste) e VLibras */

var accHtml = document.documentElement;
var accTamanhos = [100, 115, 130, 150];
var accPrefs = { tamanho: 0, fonte: false, espaco: false, contraste: false };

/* As preferências ficam só nesta aba e somem ao fechar o navegador */
try {
  var accSalvo = JSON.parse(sessionStorage.getItem('acc-prefs'));
  if (accSalvo) {
    accPrefs.tamanho = accSalvo.tamanho || 0;
    accPrefs.fonte = !!accSalvo.fonte;
    accPrefs.espaco = !!accSalvo.espaco;
    accPrefs.contraste = !!accSalvo.contraste;
  }
} catch (erro) {}

/* Botão e painel */
var accBotao = document.createElement('button');
accBotao.type = 'button';
accBotao.className = 'acc-botao';
accBotao.setAttribute('aria-expanded', 'false');
accBotao.setAttribute('aria-controls', 'acc-painel');
accBotao.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="5" r="2"/><path d="M5 9h14M12 9v6m0 0l-3 6m3-6l3 6"/></svg><span>Acessibilidade</span>';

var accPainel = document.createElement('div');
accPainel.id = 'acc-painel';
accPainel.className = 'acc-painel';
accPainel.setAttribute('role', 'dialog');
accPainel.setAttribute('aria-label', 'Opções de acessibilidade');
accPainel.hidden = true;
accPainel.innerHTML =
  '<h2>Facilitar a leitura</h2>' +
  '<div class="acc-linha">' +
    '<button type="button" class="acc-opcao" id="acc-menos" aria-label="Diminuir o tamanho das letras">A−</button>' +
    '<button type="button" class="acc-opcao" id="acc-mais" aria-label="Aumentar o tamanho das letras">A+</button>' +
  '</div>' +
  '<div class="acc-linha"><button type="button" class="acc-opcao" id="acc-fonte">Fonte de leitura fácil</button></div>' +
  '<div class="acc-linha"><button type="button" class="acc-opcao" id="acc-espaco">Mais espaço entre letras e linhas</button></div>' +
  '<div class="acc-linha"><button type="button" class="acc-opcao" id="acc-contraste">Alto contraste</button></div>' +
  '<button type="button" class="acc-opcao acc-reset" id="acc-restaurar">Restaurar o padrão</button>' +
  '<p class="acc-dica">Para Libras, use o botão azul das mãos, na lateral da tela.</p>';

document.body.appendChild(accBotao);
document.body.appendChild(accPainel);

var accMenos = document.getElementById('acc-menos');
var accMais = document.getElementById('acc-mais');
var accFonte = document.getElementById('acc-fonte');
var accEspaco = document.getElementById('acc-espaco');
var accContraste = document.getElementById('acc-contraste');
var accRestaurar = document.getElementById('acc-restaurar');

function accAplicar() {
  accHtml.style.fontSize = accTamanhos[accPrefs.tamanho] + '%';
  accHtml.classList.toggle('acc-fonte', accPrefs.fonte);
  accHtml.classList.toggle('acc-espaco', accPrefs.espaco);
  accHtml.classList.toggle('acc-contraste', accPrefs.contraste);
  accFonte.setAttribute('aria-pressed', accPrefs.fonte);
  accEspaco.setAttribute('aria-pressed', accPrefs.espaco);
  accContraste.setAttribute('aria-pressed', accPrefs.contraste);
  try {
    sessionStorage.setItem('acc-prefs', JSON.stringify(accPrefs));
  } catch (erro) {}
}

function accFechar() {
  accPainel.hidden = true;
  accBotao.setAttribute('aria-expanded', 'false');
}

accBotao.addEventListener('click', function (e) {
  e.stopPropagation();
  if (accPainel.hidden) {
    accPainel.hidden = false;
    accBotao.setAttribute('aria-expanded', 'true');
    accMenos.focus();
  } else {
    accFechar();
  }
});

accPainel.addEventListener('click', function (e) { e.stopPropagation(); });
document.addEventListener('click', accFechar);
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && !accPainel.hidden) {
    accFechar();
    accBotao.focus();
  }
});

accMenos.addEventListener('click', function () {
  if (accPrefs.tamanho > 0) { accPrefs.tamanho = accPrefs.tamanho - 1; }
  accAplicar();
});
accMais.addEventListener('click', function () {
  if (accPrefs.tamanho < accTamanhos.length - 1) { accPrefs.tamanho = accPrefs.tamanho + 1; }
  accAplicar();
});
accFonte.addEventListener('click', function () {
  accPrefs.fonte = !accPrefs.fonte;
  accAplicar();
});
accEspaco.addEventListener('click', function () {
  accPrefs.espaco = !accPrefs.espaco;
  accAplicar();
});
accContraste.addEventListener('click', function () {
  accPrefs.contraste = !accPrefs.contraste;
  accAplicar();
});
accRestaurar.addEventListener('click', function () {
  accPrefs = { tamanho: 0, fonte: false, espaco: false, contraste: false };
  accAplicar();
});

accAplicar();

/* VLibras (tradutor para Libras do governo federal) */
var vlibras = document.createElement('div');
vlibras.setAttribute('vw', '');
vlibras.className = 'enabled';
vlibras.innerHTML =
  '<div vw-access-button class="active"></div>' +
  '<div vw-plugin-wrapper><div class="vw-plugin-top-wrapper"></div></div>';
document.body.appendChild(vlibras);

var vlibrasScript = document.createElement('script');
vlibrasScript.src = 'https://vlibras.gov.br/app/vlibras-plugin.js';
vlibrasScript.onload = function () {
  if (window.VLibras) {
    new window.VLibras.Widget('https://vlibras.gov.br/app');
  }
};
document.body.appendChild(vlibrasScript);