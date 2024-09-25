// home.js

// URL da página principal
const mainPageUrl = 'https://apolossh.github.io/';

// Cria um contêiner para segurar o texto e a imagem
var container = document.createElement('div');
container.style.position = 'fixed';
container.style.top = '5px'; // Mover mais para cima
container.style.right = '10px';
container.style.zIndex = '9999';
container.style.display = 'flex';
container.style.alignItems = 'center';
container.style.backgroundColor = 'transparent'; // Fundo transparente
container.style.padding = '5px';
container.style.cursor = 'pointer'; // Muda o cursor para indicar que é clicável

// Cria o elemento de imagem com o novo link
var image = document.createElement('img');
image.src = 'https://apolossh.github.io/img/logo.png'; // Novo link da imagem
image.style.width = '40px';
image.style.height = '40px';
image.style.marginRight = '10px';

// Cria o elemento de texto
var text = document.createElement('span');
text.textContent = document.title || 'Apolo SSH';
text.style.fontSize = '16px';
text.style.fontWeight = 'bold';
text.style.color = '#FFFFFF'; // Nome em branco

// Adiciona um evento de clique ao contêiner
container.onclick = function() {
    window.location.href = mainPageUrl; // Redireciona para a página principal
};

// Adiciona a imagem e o texto ao contêiner
container.appendChild(image);
container.appendChild(text);

// Adiciona o contêiner ao corpo da página
document.body.appendChild(container);