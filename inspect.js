<script>
    (function() {
        'use strict';

        let codeSourceOpened = false;
        let pageLoaded = false;

        // Aguardar o carregamento completo da página
        window.addEventListener('load', () => {
            pageLoaded = true;
        });

        // Função para detectar quando o código-fonte é visualizado
        function checkCodeSource() {
            if (pageLoaded && !codeSourceOpened) {
                try {
                    const htmlContent = document.documentElement.outerHTML;
                    if (htmlContent.includes('<html>') && htmlContent.includes('</html>')) {
                        // Se detectar que o conteúdo está sendo visualizado
                        codeSourceOpened = true;
                        console.log("Você abriu o código-fonte da página!");
                        alert("Você abriu o código-fonte da página!");
                    }
                } catch (e) {
                    // Ignora erros caso não consiga acessar o conteúdo da página
                }
            }
        }

        // Verificar a cada 1000ms (1 segundo)
        setInterval(checkCodeSource, 1000);

    })();
</script>