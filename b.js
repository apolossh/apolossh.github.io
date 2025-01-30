// protecao.js
// Função para verificar se o Eruda está carregado
function checkForEruda() {
  if (window.eruda) {
    window.eruda.destroy();  // Remove Eruda se estiver ativo
    alert('Eruda foi desativado.');
  }
}

// Ofuscar o uso do console
const originalConsole = console;
console = new Proxy(console, {
  get(target, prop) {
    if (prop === 'log' || prop === 'debug' || prop === 'warn') {
      alert('Você tentou acessar o console!');
    }
    return target[prop];
  }
});

// Impedir abrir o DevTools (debugger)
setInterval(function() {
  debugger; // Se o debugger for ativado, ele vai interromper a execução
}, 1000);

// Detectar modificações no DOM (tentativas de inspeção)
const originalAppendChild = Node.prototype.appendChild;
Node.prototype.appendChild = function() {
  window.location.replace('about:blank');  // Redireciona para uma página em branco
  return originalAppendChild.apply(this, arguments);
};

// Detectar se o console foi acessado
document.addEventListener("keydown", function(event) {
  if (event.key === "F12" || (event.ctrlKey && event.shiftKey && event.key === "I")) {
    alert("Você pressionou uma tecla de inspeção de código!");
  }
});

// Verificar a presença do Eruda a cada 2 segundos
setInterval(checkForEruda, 2000);
