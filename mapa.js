/* Mapa de delegacias perto da pessoa */


var mapa = L.map('mapa').setView([-14.2, -51.9], 4);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; colaboradores do OpenStreetMap'
}).addTo(mapa);

var camadaLocais = L.layerGroup().addTo(mapa);
var textoAviso = document.getElementById('mapa-aviso');
var listaLocais = document.getElementById('lista-locais');
var linkGoogle = document.getElementById('link-google');
var campoCidade = document.getElementById('campo-cidade');

function mostrarAviso(texto) {
  textoAviso.textContent = texto;
}

/* distância em km entre dois pontos */
function calcularDistancia(lat1, lon1, lat2, lon2) {
  var raio = 6371;
  var dLat = (lat2 - lat1) * Math.PI / 180;
  var dLon = (lon2 - lon1) * Math.PI / 180;
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
          Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return raio * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function ehDelegaciaDaMulher(nome) {
  return /mulher|deam|\bdam\b/i.test(nome);
}

function buscarLocais(lat, lon) {
  mostrarAviso('Procurando delegacias perto de você...');
  camadaLocais.clearLayers();
  listaLocais.innerHTML = '';
  mapa.setView([lat, lon], 12);

  L.circleMarker([lat, lon], { radius: 8, color: '#e8174f', fillOpacity: 0.9 })
    .addTo(camadaLocais)
    .bindPopup('Você está aqui');

  linkGoogle.href = 'https://www.google.com/maps/search/delegacia+da+mulher/@' + lat + ',' + lon + ',13z';

  var consulta = '[out:json][timeout:25];(' +
    'node["amenity"="police"](around:25000,' + lat + ',' + lon + ');' +
    'way["amenity"="police"](around:25000,' + lat + ',' + lon + ');' +
    ');out center 60;';

  fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'data=' + encodeURIComponent(consulta)
  })
    .then(function (resposta) {
      if (!resposta.ok) { throw new Error('erro'); }
      return resposta.json();
    })
    .then(function (dados) {
      mostrarLocais(dados.elements, lat, lon);
    })
    .catch(function () {
      mostrarAviso('Não deu para carregar os locais agora. Tente de novo, use o link do Google Maps abaixo ou ligue 180.');
    });
}

function mostrarLocais(elementos, lat, lon) {
  var locais = [];

  for (var i = 0; i < elementos.length; i++) {
    var el = elementos[i];
    var latLocal = el.lat;
    var lonLocal = el.lon;
    if (el.center) {
      latLocal = el.center.lat;
      lonLocal = el.center.lon;
    }
    var tags = el.tags || {};
    var nome = tags.name || 'Delegacia ou posto policial';
    locais.push({
      nome: nome,
      lat: latLocal,
      lon: lonLocal,
      distancia: calcularDistancia(lat, lon, latLocal, lonLocal),
      mulher: ehDelegaciaDaMulher(nome),
      telefone: tags.phone || tags['contact:phone'] || '',
      rua: tags['addr:street'] || '',
      numero: tags['addr:housenumber'] || ''
    });
  }

  /* Delegacias da Mulher primeiro, depois as mais próximas */
  locais.sort(function (a, b) {
    if (a.mulher !== b.mulher) { return a.mulher ? -1 : 1; }
    return a.distancia - b.distancia;
  });
  locais = locais.slice(0, 10);

  if (locais.length === 0) {
    mostrarAviso('Não encontramos delegacias cadastradas aqui perto. Use o link do Google Maps abaixo ou ligue 180.');
    return;
  }

  var pontos = [[lat, lon]];
  var achouMulher = false;

  for (var j = 0; j < locais.length; j++) {
    var local = locais[j];
    if (local.mulher) { achouMulher = true; }
    pontos.push([local.lat, local.lon]);

    var balao = document.createElement('div');
    balao.textContent = local.nome;
    L.marker([local.lat, local.lon]).addTo(camadaLocais).bindPopup(balao);

    listaLocais.appendChild(criarItem(local));
  }

  mapa.fitBounds(pontos, { padding: [30, 30] });

  if (achouMulher) {
    mostrarAviso('Mostrando os ' + locais.length + ' locais mais próximos. Confirme o endereço e o horário antes de ir.');
  } else {
    mostrarAviso('Não achamos Delegacia da Mulher cadastrada no mapa aqui perto. Veja a lista abaixo e use o link do Google Maps ou o 180 para confirmar.');
  }
}

function criarItem(local) {
  var item = document.createElement('li');

  var titulo = document.createElement('strong');
  titulo.textContent = local.nome;
  item.appendChild(titulo);

  var detalhe = document.createElement('span');
  var texto = 'a ' + local.distancia.toFixed(1).replace('.', ',') + ' km';
  if (local.mulher) { texto = 'Delegacia da Mulher · ' + texto; }
  if (local.rua) { texto += ' · ' + local.rua + (local.numero ? ', ' + local.numero : ''); }
  if (local.telefone) { texto += ' · ' + local.telefone; }
  detalhe.textContent = texto;
  item.appendChild(detalhe);

  var rota = document.createElement('a');
  rota.href = 'https://www.google.com/maps/dir/?api=1&destination=' + local.lat + ',' + local.lon;
  rota.target = '_blank';
  rota.rel = 'noopener';
  rota.textContent = 'Como chegar';
  item.appendChild(rota);

  return item;
}

function usarLocalizacao() {
  if (!navigator.geolocation) {
    mostrarAviso('Seu navegador não permite pegar a localização. Digite sua cidade no campo ao lado.');
    return;
  }
  mostrarAviso('Pedindo a sua localização...');
  navigator.geolocation.getCurrentPosition(
    function (posicao) {
      buscarLocais(posicao.coords.latitude, posicao.coords.longitude);
    },
    function () {
      mostrarAviso('Não conseguimos pegar a sua localização. Digite sua cidade ou endereço no campo ao lado.');
    },
    { timeout: 15000 }
  );
}

function buscarCidade(evento) {
  evento.preventDefault();
  var texto = campoCidade.value.trim();
  if (texto === '') {
    mostrarAviso('Digite uma cidade ou endereço.');
    return;
  }
  mostrarAviso('Procurando "' + texto + '"...');

  fetch('https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=br&q=' + encodeURIComponent(texto))
    .then(function (resposta) { return resposta.json(); })
    .then(function (resultado) {
      if (resultado.length === 0) {
        mostrarAviso('Não encontramos esse lugar. Tente escrever a cidade e o estado.');
        return;
      }
      buscarLocais(parseFloat(resultado[0].lat), parseFloat(resultado[0].lon));
    })
    .catch(function () {
      mostrarAviso('Não deu para fazer a busca agora. Tente de novo em instantes.');
    });
}

document.getElementById('btn-local').addEventListener('click', usarLocalizacao);
document.getElementById('form-busca').addEventListener('submit', buscarCidade);