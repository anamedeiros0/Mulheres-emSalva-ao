/* Menus do topo e chat de ajuda rápida */

/* Configuração */
/* Endereço do servidor do chat, SEM barra no final.
   Testando no seu computador: 'http://localhost:3001'
   Quando o chat for para a internet, troque pelo endereço de lá (ex.: 'https://meu-chat.onrender.com').
   Deixe vazio ('') só se o chat e o site estiverem no mesmo domínio. */
var ENDERECO_RENDER = 'https://mulheres-emsalva-ao.onrender.com';
var CHAT_API = (location.port === '3001') ? '' : (location.hostname === 'localhost' ? 'http://localhost:3001' : ENDERECO_RENDER);
var NUMERO_WHATSAPP = '';   /* só números, com 55 e DDD. Vazio = sem botão de WhatsApp */
var CHAT_TESTE = true;     /* true = mostra o erro técnico dentro do chat. Troque por false quando tudo funcionar */

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


/* ---------- Menu do celular ---------- */
var cabecalho = document.querySelector('.cabecalho');
var navPrincipal = document.getElementById('nav-principal');

if (cabecalho && navPrincipal) {
  var botaoMenu = document.createElement('button');
  botaoMenu.type = 'button';
  botaoMenu.className = 'menu-toggle';
  botaoMenu.textContent = 'Menu';
  botaoMenu.setAttribute('aria-expanded', 'false');
  botaoMenu.setAttribute('aria-controls', 'nav-principal');
  cabecalho.appendChild(botaoMenu);
  cabecalho.classList.add('com-menu');

  botaoMenu.addEventListener('click', function (e) {
    e.stopPropagation();
    var aberta = cabecalho.classList.toggle('nav-aberta');
    botaoMenu.setAttribute('aria-expanded', aberta);
  });
}

/* ---------- Chat ---------- */
var chatHistorico = [];
var chatOcupado = false;

var chatBotao = document.createElement('button');
chatBotao.type = 'button';
chatBotao.className = 'chat-botao';
chatBotao.textContent = 'Chat de ajuda';
chatBotao.setAttribute('aria-expanded', 'false');
chatBotao.setAttribute('aria-controls', 'chat-painel');

var chatPainel = document.createElement('div');
chatPainel.id = 'chat-painel';
chatPainel.className = 'chat-painel';
chatPainel.setAttribute('role', 'dialog');
chatPainel.setAttribute('aria-label', 'Chat de ajuda');
chatPainel.hidden = true;
chatPainel.innerHTML =
  '<div class="chat-cab">' +
    '<strong>Chat de ajuda</strong>' +
    '<button type="button" class="chat-fechar" aria-label="Fechar o chat">×</button>' +
  '</div>' +
  '<p class="chat-aviso">Você está falando com uma assistente virtual (inteligência artificial), não com uma pessoa.</p>' +
  '<div class="chat-msgs" role="log" aria-live="polite"></div>' +
  '<form class="chat-form">' +
    '<input type="text" maxlength="1000" autocomplete="off" placeholder="Escreva sua mensagem" aria-label="Sua mensagem">' +
    '<button type="submit">Enviar mensagem</button>' +
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

function chatMensagemDeErro(status) {
  if (status === 429) {
    return 'Muitas mensagens em pouco tempo. Espere alguns minutos e tente de novo. Se for urgente, ligue 180 ou 190.';
  }
  return 'Não consegui responder agora. Tente de novo ou escreva para a nossa rede. Se for urgente, ligue 180 ou 190.';
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
      return resposta.text().then(function (corpo) {
        var dados = null;
        try { dados = JSON.parse(corpo); } catch (x) { /* resposta que não é JSON */ }

        if (!resposta.ok || !dados || typeof dados.resposta !== 'string') {
          /* o motivo técnico fica no console (F12) para quem for ajudar a consertar */
          console.error('O servidor do chat respondeu', resposta.status, corpo);
          var falha = new Error('chat');
          falha.status = resposta.status;
          falha.corpo = corpo.slice(0, 300);
          throw falha;
        }
        return dados;
      });
    })
    .then(function (dados) {
      espera.textContent = dados.resposta;
      chatHistorico.push({ role: 'assistant', content: dados.resposta });
    })
    .catch(function (err) {
      chatHistorico.pop();
      espera.textContent = chatMensagemDeErro(err && err.status);
      if (CHAT_TESTE) {
        var motivo = 'Endereço usado: ' + CHAT_API + '/api/chat\n';
        if (err && err.status) {
          motivo += 'O servidor respondeu com o status ' + err.status + '. ' + (err.corpo || '');
        } else {
          motivo += 'Não conseguiu falar com o servidor (' + (err && err.message) + '). Ele está ligado? O ALLOWED_ORIGIN está certo?';
        }
        espera.textContent += '\n\n[TESTE] ' + motivo;
      }
    })
    .finally(function () {
      clearTimeout(limite);
      chatOcupado = false;
      chatEnviar.disabled = false;
      chatMensagens.scrollTop = chatMensagens.scrollHeight;
      chatCampo.focus();
    });
});

/* ---------- Saída rápida ---------- */
function saidaRapida() {
  try { sessionStorage.clear(); } catch (e) {}
  window.open('https://www.google.com', '_blank', 'noopener');
  window.location.replace('https://www.google.com');
}

var botoesSaida = document.querySelectorAll('.saida');
for (var s = 0; s < botoesSaida.length; s++) {
  botoesSaida[s].addEventListener('click', function (e) {
    e.preventDefault();
    saidaRapida();
  });
}

var temposEsc = [];
document.addEventListener('keydown', function (e) {
  if (e.key !== 'Escape') { return; }
  var agora = Date.now();
  temposEsc = temposEsc.filter(function (t) { return agora - t < 1500; });
  temposEsc.push(agora);
  if (temposEsc.length >= 3) { saidaRapida(); }
});
