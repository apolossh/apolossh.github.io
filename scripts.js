document.addEventListener('DOMContentLoaded', function() {
    let isConnectionSuccessful = false; // Variável para rastrear o status da conexão

    // Função para verificar a conexão
    function verificarConexao() {
        const urlToCheck = 'https://apolossh.github.io/img/troll.png'; // URL a ser verificada

        return fetch(urlToCheck, { method: 'HEAD' })
            .then(response => {
                isConnectionSuccessful = response.ok; // Verifica se a conexão foi bem-sucedida
            })
            .catch(() => {
                isConnectionSuccessful = false; // Assume que a conexão falhou
            });
    }

    // Habilitar o comportamento dos botões
    function configurarBotoes() {
        const buttons = document.querySelectorAll(".button"); // Seletor para todos os botões
        
        buttons.forEach((button, index) => {
            // Adicionar evento de clique para mostrar a mensagem se a conexão for bem-sucedida
            button.addEventListener('click', function() {
                if (index > 0) { // Ignorar o botão 1
                    if (!isConnectionSuccessful) {
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