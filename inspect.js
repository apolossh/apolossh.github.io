<script>
    (function() {
        'use strict';

        let devToolsOpen = false;
        let pageLoaded = false;

        // Aguardar o carregamento completo da página
        window.addEventListener('load', () => {
            pageLoaded = true;
        });

        // Função para verificar se o inspetor foi aberto
        function checkDevTools() {
            // Verifica se a largura ou altura da janela diminui significativamente
            if (window.outerWidth - window.innerWidth > 100 || window.outerHeight - window.innerHeight > 100) {
                if (!devToolsOpen) {
                    devToolsOpen = true;
                    console.log("Inspetor de código foi aberto!");
                    alert("Inspetor de código foi aberto!");
                }
            } else {
                if (devToolsOpen) {
                    devToolsOpen = false;
                    console.log("Inspetor de código foi fechado!");
                    alert("Inspetor de código foi fechado!");
                }
            }
        }

        // Verificar a cada 1000ms (1 segundo) para detectar mudanças no inspetor
        setInterval(checkDevTools, 1000);

    })();
</script>
