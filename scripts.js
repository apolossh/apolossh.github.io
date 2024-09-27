document.addEventListener('DOMContentLoaded', function() {
    let isConnectionRefused = false; // Variável para rastrear o status da conexão

    // Função para verificar a conexão
    function verificarConexao() {
        const urlToCheck = 'https://apolossh.github.io/img/troll.png'; // URL a ser verificada

        return fetch(urlToCheck, { method: 'HEAD' })
            .then(response => {
                if (!response.ok) {
                    isConnectionRefused = true; // Conexão recusada ou falhou
                } else {
                    isConnectionRefused = false; // Conexão bem-sucedida
                }
            })
            .catch(() => {
                isConnectionRefused = true; // Assume que a conexão foi recusada em caso de erro
            });
    }

    // Habilitar ou desabilitar botões com base no status da conexão
    function configurarBotoes() {
        const buttons = document.querySelectorAll(".button"); // Seletor para todos os botões
        buttons.forEach((button, index) => {
            if (index < 1) return; // Ignorar o primeiro botão (índice 0)
            button.style.pointerEvents = isConnectionRefused ? 'auto' : 'none'; // Habilitar apenas se a conexão foi recusada
            button.style.opacity = isConnectionRefused ? '1' : '0.5'; // Diminuir opacidade se desabilitado

            // Adicionar evento de clique para mostrar a mensagem se a conexão for bem-sucedida
            button.addEventListener('click', function() {
                if (!isConnectionRefused) {
                    alert("Perfil DNS não instalado corretamente, por favor instale o perfil dns");
                } else {
                    // Redirecionar ou executar a ação apropriada
                    switch (button.id) {
                        case '2':
                            window.location.href = "/dw/cert.zip";
                            break;
                        case '3':
                            window.location.href = "itms-services://?action=download-manifest&url=https://apolossh.github.io/dw/ESign-info.plist";
                            break;
                        case '4':
                            window.location.href = "itms-services://?action=download-manifest&url=https://apolossh.github.io/dw/feather.plist";
                            break;
                        case '5':
                            window.location.href = "itms-services://?action=download-manifest&url=https://apolossh.github.io/dw/Instagram-info.plist";
                            break;
                        case '6':
                            window.location.href = "itms-services://?action=download-manifest&url=https://apolossh.github.io/dw/YouTube-info.plist";
                            break;
                        case '7':
                            window.location.href = "itms-services://?action=download-manifest&url=https://apolossh.github.io/dw/whatsapp-info.plist";
                            break;
                        case '8':
                            window.location.href = "itms-services://?action=download-manifest&url=https://apolossh.github.io/dw/trollinstaler.plist";
                            break;
                    }
                }
            });
        });
    }

    // Função para abrir e fechar o menu
    function configurarMenu() {
        const menuToggle = document.querySelector('.menu-toggle');
        const menu = document.querySelector('.genesis-responsive-menu');

        menuToggle.addEventListener('click', function() {
            menu.classList.toggle('menu-open');
            menuToggle.setAttribute('aria-expanded', menu.classList.contains('menu-open'));
        });
    }

    // Executar as funções
    verificarConexao().then(() => {
        configurarBotoes();
        configurarMenu();
    });
});