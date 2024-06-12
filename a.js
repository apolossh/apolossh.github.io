// Função para verificar se o fingerprint é permitido
function verificarFingerprintPermitido(fingerprint, callback) {
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status === 200) {
        var resposta = JSON.parse(xhr.responseText);
        callback(resposta.fingerprintPermitidos.includes(fingerprint));
      } else {
        callback(false);
      }
    }
  };
  xhr.open('GET', 'user.json', true);
  // Adiciona cabeçalho para evitar o cache
  xhr.setRequestHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  xhr.send();
}

// Função para carregar o conteúdo principal
function carregarConteudoPrincipal() {
  var conteudoPrincipal = document.getElementById('conteudoPrincipal');
  if (conteudoPrincipal) {
    conteudoPrincipal.style.display = 'block';
  }
}

// Evento para verificar o fingerprint quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
  var hashSalvo = localStorage.getItem('hashDoDispositivo');
  var usuarioAutenticado = sessionStorage.getItem('usuarioAutenticado');

  // Verificar se o usuário já foi autenticado na sessão atual
  if (usuarioAutenticado) {
    carregarConteudoPrincipal();
  } else {
    // Verificar se o hash está salvo e é válido
    verificarFingerprintPermitido(hashSalvo, function(permitido) {
      if (permitido) {
        // Se o hash for válido, marcar o usuário como autenticado e carregar o conteúdo principal
        sessionStorage.setItem('usuarioAutenticado', 'true');
        carregarConteudoPrincipal();
      } else {
        // Se o hash não for válido ou não estiver salvo, redirecionar para auth.html
        window.location.href = 'auth.html';
      }
    });
  }
});

// Verifica se a página foi carregada a partir do cache do navegador
window.onpageshow = function(event) {
  if (event.persisted) {
    window.location.reload();
  }
};

// Adiciona um ouvinte de evento para evitar que a página seja armazenada em cache
window.addEventListener('unload', function() {
  window.localStorage.removeItem('hashDoDispositivo');
});
