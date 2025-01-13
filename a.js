(function() {
    let devtoolsOpen = false;
    const threshold = 160;

    // Função para detectar se o DevTools foi aberto
    const detectDevTools = () => {
        if (window.outerWidth - window.innerWidth > threshold || 
            window.outerHeight - window.innerHeight > threshold) {
            devtoolsOpen = true;
        } else {
            devtoolsOpen = false;
        }
    };

    // Prevenção de execução de eval (comum em userscripts)
    Object.defineProperty(window, 'eval', {
        configurable: false,
        writable: false,
        value: () => {
            throw "Eval bloqueado!";
        }
    });

    // Prevenir o acesso ao console
    Object.defineProperty(window, 'console', {
        get: function() {
            throw "Console bloqueado!";
        }
    });

    // Impedir manipulação do código com JavaScript
    Object.freeze(window);

    // Detecta a abertura do DevTools a cada 500ms
    let detectionInterval = setInterval(() => {
        detectDevTools();
        if (devtoolsOpen) {
            // Bloqueia a página ao detectar DevTools
            document.body.innerHTML = '';  // Limpar conteúdo da página
            document.body.style.backgroundColor = '#121212';
            document.body.style.color = 'white';
            document.body.style.display = 'flex';
            document.body.style.alignItems = 'center';
            document.body.style.justifyContent = 'center';
            document.body.style.height = '100vh';
            document.body.style.textAlign = 'center';

            // Exibir um aviso de bloqueio visual na página
            document.body.innerHTML = `
                <h1>Acesso Bloqueado</h1>
                <p>Você tentou manipular esta página. O acesso foi bloqueado.</p>
            `;
            clearInterval(detectionInterval);  // Parar a detecção
        }
    }, 500);
})();
