/* Menus do topo e chat de ajuda rápida */

/* Configuração */
var CHAT_API = '';          /* endereço do servidor do chat. Vazio = mesmo domínio do site */
var NUMERO_WHATSAPP = '';   /* só números, com 55 e DDD. Vazio = sem botão de WhatsApp */

/* ---------- Menus ---------- */
var listaMenus = document.querySelectorAll('.menu-suspenso');

function fecharMenus(exceto) {
  for (var i = 0; i < listaMenus.length; i++) {
    if (listaMenus[i] !== exceto) {
      listaMenus[i].classList.remove('aberto');
      listaMenus[i].querySelector('.menu-botao').setAttribute('aria-expanded', 'false');
    }
  }
}

function ligarMenu(menu) {
  var botao = menu.querySelector('.menu-botao');

  botao.addEventListener('click', function (e) {
    e.stopPropagation();
    fecharMenus(menu);
    var aberto = menu.classList.toggle('aberto');
    botao.setAttribute('aria-expanded', aberto);
  });

  menu.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      fecharMenus();
      botao.focus();
    }
  });
}

for (var m = 0; m < listaMenus.length; m++) {
  ligarMenu(listaMenus[m]);
}
document.addEventListener('click', function () { fecharMenus(); });

/* ---------- Chat ---------- */
var chatHistorico = [];
var chatOcupado = false;

var chatBotao = document.createElement('button');
chatBotao.type = 'button';
chatBotao.className = 'chat-botao';
chatBotao.textContent = 'Ajuda rápida';
chatBotao.setAttribute('aria-expanded', 'false');
chatBotao.setAttribute('aria-controls', 'chat-painel');

var chatPainel = document.createElement('div');
chatPainel.id = 'chat-painel';
chatPainel.className = 'chat-painel';
chatPainel.setAttribute('role', 'dialog');
chatPainel.setAttribute('aria-label', 'Chat de ajuda rápida');
chatPainel.hidden = true;
chatPainel.innerHTML =
  '<div class="chat-cab">' +
    '<strong>Ajuda rápida</strong>' +
    '<button type="button" class="chat-fechar" aria-label="Fechar o chat">×</button>' +
  '</div>' +
  '<p class="chat-aviso">Você está falando com uma assistente virtual (inteligência artificial), não com uma pessoa. Em perigo agora, ligue 190. Para orientação, ligue 180.</p>' +
  '<div class="chat-msgs" role="log" aria-live="polite"></div>' +
  '<form class="chat-form">' +
    '<input type="text" maxlength="1000" autocomplete="off" placeholder="Escreva aqui" aria-label="Sua mensagem">' +
    '<button type="submit">Enviar</button>' +
  '</form>' +
  '<div class="chat-rodape"><a href="fale-com-a-rede.html">Falar com uma pessoa</a></div>';

document.body.appendChild(chatBotao);
document.body.appendChild(chatPainel);

var chatFechar = chatPainel.querySelector('.chat-fechar');
var chatMensagens = chatPainel.querySelector('.chat-msgs');
var chatForm = chatPainel.querySelector('.chat-form');
var chatCampo = chatForm.querySelector('input');
var chatEnviar = chatForm.querySelector('button');
var chatRodape = chatPainel.querySelector('.chat-rodape');

if (NUMERO_WHATSAPP !== '') {
  var linkWhats = document.createElement('a');
  linkWhats.href = 'https://wa.me/' + NUMERO_WHATSAPP + '?text=' + encodeURIComponent('Oi, preciso de ajuda.');
  linkWhats.target = '_blank';
  linkWhats.rel = 'noopener';
  linkWhats.textContent = 'Continuar no WhatsApp';
  chatRodape.appendChild(linkWhats);

  var notaWhats = document.createElement('p');
  notaWhats.className = 'chat-nota';
  notaWhats.textContent = 'No WhatsApp a conversa fica no seu celular. Se alguém olha seu aparelho, apague depois.';
  chatRodape.appendChild(notaWhats);
}

function chatMostrar(texto, quem) {
  var div = document.createElement('div');
  div.className = 'chat-msg ' + quem;
  div.textContent = texto;
  chatMensagens.appendChild(div);
  chatMensagens.scrollTop = chatMensagens.scrollHeight;
  return div;
}

chatMostrar('Oi! Posso explicar como funciona o acolhimento e indicar serviços. Como posso ajudar?', 'ia');

function abrirChat() {
  chatPainel.hidden = false;
  chatBotao.setAttribute('aria-expanded', 'true');
  chatCampo.focus();
}

function fecharChat() {
  chatPainel.hidden = true;
  chatBotao.setAttribute('aria-expanded', 'false');
}

chatBotao.addEventListener('click', function (e) {
  e.stopPropagation();
  if (chatPainel.hidden) { abrirChat(); } else { fecharChat(); }
});

chatFechar.addEventListener('click', function () {
  fecharChat();
  chatBotao.focus();
});

chatPainel.addEventListener('click', function (e) { e.stopPropagation(); });

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && !chatPainel.hidden) {
    fecharChat();
    chatBotao.focus();
  }
});

/* O link "Chat" do menu abre o painel em vez de trocar de página */
var linksChat = document.querySelectorAll('[data-abrir-chat]');
for (var c = 0; c < linksChat.length; c++) {
  linksChat[c].addEventListener('click', function (e) {
    e.preventDefault();
    e.stopPropagation();
    fecharMenus();
    abrirChat();
  });
}

chatForm.addEventListener('submit', function (e) {
  e.preventDefault();
  var texto = chatCampo.value.trim();
  if (texto === '' || chatOcupado) { return; }

  chatCampo.value = '';
  chatMostrar(texto, 'eu');
  chatHistorico.push({ role: 'user', content: texto });
  chatOcupado = true;
  chatEnviar.disabled = true;
  var espera = chatMostrar('Digitando…', 'ia');

  var controle = new AbortController();
  var limite = setTimeout(function () { controle.abort(); }, 120000);

  fetch(CHAT_API + '/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mensagens: chatHistorico.slice(-12) }),
    signal: controle.signal
  })
    .then(function (resposta) {
      if (!resposta.ok) { throw new Error('erro'); }
      return resposta.json();
    })
    .then(function (dados) {
      espera.textContent = dados.resposta;
      chatHistorico.push({ role: 'assistant', content: dados.resposta });
    })
    .catch(function () {
      chatHistorico.pop();
      espera.textContent = 'Não consegui responder agora. Se precisar de ajuda, ligue 180 (orientação) ou 190 (perigo agora), ou escreva para a nossa rede.';
    })
    .finally(function () {
      clearTimeout(limite);
      chatOcupado = false;
      chatEnviar.disabled = false;
      chatMensagens.scrollTop = chatMensagens.scrollHeight;
      chatCampo.focus();
    });
});