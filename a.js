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

    // Prevenção de execução de eval
    Object.defineProperty(window, 'eval', {
        configurable: false,
        writable: false,
        value: () => {}
    });

    // Prevenir o acesso ao console
    Object.defineProperty(window, 'console', {
        get: function() {
            return {
                log: () => {},
                info: () => {},
                warn: () => {},
                error: () => {}
            };
        }
    });

    // Impedir manipulação do código com JavaScript
    Object.freeze(window);

    // Detecta a abertura do DevTools a cada 500ms
    let detectionInterval = setInterval(() => {
        detectDevTools();
        if (devtoolsOpen) {
            // Limpa o conteúdo da página, mas sem mostrar nada
            document.body.innerHTML = '';
            clearInterval(detectionInterval);  // Parar a detecção
        }
    }, 500);
})();
