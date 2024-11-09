<script>
    (function() {
        'use strict';

        let devToolsOpen = false;
        let pageLoaded = false;
        let lastWidth = window.outerWidth;
        let lastHeight = window.outerHeight;

        // Aguardar o carregamento completo da página
        window.addEventListener('load', () => {
            pageLoaded = true;
        });

        // Função para detectar a abertura do inspetor de código ou ferramentas de desenvolvedor
        function detectDevTools() {
            // Verifica se o tamanho da janela foi reduzido, o que pode indicar que as ferramentas de desenvolvedor foram abertas
            if (window.outerWidth - window.innerWidth > 100 || window.outerHeight - window.innerHeight > 100) {
                if (!devToolsOpen) {
                    devToolsOpen = true;
                    console.log("Inspetor de código foi aberto!");
                    alert("Inspetor de código foi aberto!");
                    logoutUser(); // Função que desconecta o usuário
                }
            } else {
                if (devToolsOpen) {
                    devToolsOpen = false;
                    console.log("Inspetor de código foi fechado!");
                }
            }
        }

        // Função para detectar modificações no DOM que possam ser sinais de inspeção
        function detectDOMChanges() {
            const observer = new MutationObserver((mutationsList) => {
                for(const mutation of mutationsList) {
                    if (mutation.type === 'attributes' || mutation.type === 'childList') {
                        console.log('Mudança detectada no DOM!', mutation);
                        logoutUser(); // Desconecta o usuário
                    }
                }
            });
            
            // Iniciar a observação do DOM
            observer.observe(document.body, { attributes: true, childList: true, subtree: true });
        }

        // Função para detectar a pausa na execução de código (inspeção/debbuging)
        function detectDebugger() {
            const start = new Date().getTime();
            debugger;  // A instrução "debugger" faz o código parar caso o depurador esteja aberto
            const end = new Date().getTime();
            
            if (end - start > 100) {  // Se a execução foi pausada por mais de 100ms, provavelmente o depurador foi ativado
                console.log("Depurador detectado! Desconectando...");
                logoutUser(); // Função que desconecta o usuário
            }
        }

        // Função que pode ser chamada para desconectar o usuário ou realizar ações específicas
        function logoutUser() {
            console.log('Desconectando...');
            // Aqui você pode implementar a desconexão do usuário ou redirecionamento
            window.location.href = '/logout'; // Redireciona para a página de logout
            // Ou qualquer outro comportamento que você prefira, como fechar a sessão.
        }

        // Iniciar a verificação de ferramentas de desenvolvedor a cada 1 segundo
        setInterval(detectDevTools, 1000);

        // Começar a observar o DOM para possíveis mudanças
        detectDOMChanges();

        // Iniciar a verificação para detectar o uso do depurador
        setInterval(detectDebugger, 1000);

    })();
</script>
