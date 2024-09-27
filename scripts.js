let isConnectionRefused = false; // Variável global para rastrear o status da conexão

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
        .catch(error => {
            isConnectionRefused = true; // Assume que a conexão foi recusada em caso de erro
        });
}

// Habilitar ou desabilitar botões com base no status da conexão
function configurarBotoes() {
    const buttons = document.querySelectorAll(".button"); // Seletor para todos os botões
    buttons.forEach((button, index) => {
        if (index < 1) return; // Ignorar o primeiro botão (índice 0)
        button.disabled = !isConnectionRefused; // Habilitar apenas se a conexão foi recusada

        // Adicionar evento de clique para mostrar a mensagem se a conexão for bem-sucedida
        button.addEventListener("click", function(event) {
            if (!isConnectionRefused) {
                alert("Perfil DNS não instalado corretamente, por favor instale o perfil dns");
                event.preventDefault(); // Previne o comportamento padrão
            } else {
                // Se a conexão foi recusada, redireciona para o URL
                handleButtonClick(button.id);
            }
        });
    });
}

// Função para gerenciar o clique dos botões
function handleButtonClick(buttonId) {
    switch (buttonId) {
        case "2":
            window.location.href = "/dw/cert.zip";
            break;
        case "3":
            window.location.href = "itms-services://?action=download-manifest&url=https://apolossh.github.io/dw/ESign-info.plist";
            break;
        case "4":
            window.location.href = "itms-services://?action=download-manifest&url=https://apolossh.github.io/dw/feather.plist";
            break;
        case "5":
            window.location.href = "itms-services://?action=download-manifest&url=https://apolossh.github.io/dw/Instagram-info.plist";
            break;
        case "6":
            window.location.href = "itms-services://?action=download-manifest&url=https://apolossh.github.io/dw/YouTube-info.plist";
            break;
        case "7":
            window.location.href = "itms-services://?action=download-manifest&url=https://apolossh.github.io/dw/whatsapp-info.plist";
            break;
        case "8":
            window.location.href = "itms-services://?action=download-manifest&url=https://apolossh.github.io/dw/trollinstaler.plist";
            break;
        default:
            break;
    }
}

// Aguardar o DOM ser totalmente carregado
document.addEventListener('DOMContentLoaded', function() {
    // Verificar o status da conexão
    verificarConexao().then(() => {
        configurarBotoes(); // Configurar os botões após a verificação da conexão

        // Adicionar ouvintes de eventos ao primeiro botão
        document.getElementById("1").addEventListener("click", function() {
            window.location.href = "/dw/dns.mobileconfig";
        });

        document.getElementById("1").addEventListener("contextmenu", function(event) {
            event.preventDefault();
        });
    });
});