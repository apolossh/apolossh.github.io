<script>
    (function() {
        'use strict';

        let devToolsOpen = false;
        let pageLoaded = false;

        // Aguardar o carregamento completo da página
        window.addEventListener('load', () => {
            pageLoaded = true;
        });

        // Função para detectar a abertura do inspetor de código ou ferramentas de desenvolvedor
        function detectDevTools() {
            // Verifica mudanças no tamanho da janela
            const widthChange = window.outerWidth - window.innerWidth;
            const heightChange = window.outerHeight - window.innerHeight;
            
            // Se a diferença no tamanho da janela for maior que 100px, pode indicar que o inspetor está aberto
            if (widthChange > 100 || heightChange > 100) {
                if (!devToolsOpen) {
                    devToolsOpen = true;
                    console.log("Inspetor de código foi aberto!");
                    alert("Inspetor de código foi aberto!");
                    reloadPage(); // Atualiza a página
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
                        reloadPage(); // Atualiza a página
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
                console.log("Depurador detectado! Atualizando página...");
                reloadPage(); // Atualiza a página
            }
        }

        // Função que pode ser chamada para atualizar a página
        function reloadPage() {
            location.reload(); // Recarrega a página
        }

        // Iniciar a verificação de ferramentas de desenvolvedor a cada 1 segundo
        setInterval(detectDevTools, 1000);

        // Começar a observar o DOM para possíveis mudanças
        detectDOMChanges();

        // Iniciar a verificação para detectar o uso do depurador
        setInterval(detectDebugger, 1000);

    })();
</script>
