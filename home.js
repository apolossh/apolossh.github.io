// home.js

const mainPageUrl = 'https://apolossh.github.io/';

var container = document.createElement('div');
container.style.position = 'absolute';
container.style.top = '10px';
container.style.right = '10px';
container.style.zIndex = '9999';
container.style.display = 'flex';
container.style.alignItems = 'center';
container.style.backgroundColor = 'transparent';
container.style.padding = '5px';
container.style.cursor = 'pointer';

var image = document.createElement('img');
image.src = 'https://apolossh.github.io/img/logo.png';
image.style.width = '40px';
image.style.height = '40px';
image.style.marginRight = '10px';

var text = document.createElement('span');
text.textContent = document.title || 'Apolo SSH';
text.style.fontSize = '16px';
text.style.fontWeight = 'bold';
text.style.color = '#FFFFFF';

container.onclick = function() {
    window.location.href = mainPageUrl;
};

container.appendChild(image);
container.appendChild(text);
document.body.appendChild(container);
