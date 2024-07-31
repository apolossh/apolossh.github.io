document.addEventListener('DOMContentLoaded', function() {
    function verificarDominio(url) {
        console.log(`Verificando acesso ao domínio: ${url}`);
        return fetch(url, { method: 'HEAD' }) // Faz uma requisição HEAD para o domínio
            .then(response => {
                console.log(`Resposta para ${url}: ${response.status}`);
                return response.ok; // Verifica se a resposta é bem-sucedida
            })
            .catch(error => {
                console.error(`Erro ao verificar domínio ${url}:`, error);
                return false; // Retorna false se ocorrer um erro
            });
    }

    function redirecionarComVerificacao(url) {
        verificarDominio('https://xnxx.com')
            .then(acessivel => {
                if (acessivel) {
                    alert("Por favor, instale primeiro o perfil DNS.");
                } else {
                    window.location.href = url;
                }
            })
            .catch(error => {
                console.error("Erro ao verificar domínio:", error);
                // Permitir redirecionamento se ocorrer erro na verificação
                window.location.href = url;
            });
    }

    // Evento para o botão 1 (sem verificação)
    document.getElementById("1").addEventListener("click", function() {
        window.location.href = "/dw/dns.mobileconfig";
    });

    document.getElementById("1").addEventListener("contextmenu", function(event) {
        event.preventDefault();
    });

    // Eventos para os demais botões (com verificação)
    document.getElementById("2").addEventListener("click", function() {
        redirecionarComVerificacao("/dw/cert.esigncert");
    });

    document.getElementById("2").addEventListener("contextmenu", function(event) {
        event.preventDefault();
    });

    document.getElementById("3").addEventListener("click", function() {
        redirecionarComVerificacao("itms-services://?action=download-manifest&url=https://apolossh.github.io/dw/ESign-info.plist");
    });

    document.getElementById("3").addEventListener("contextmenu", function(event) {
        event.preventDefault();
    });

    document.getElementById("4").addEventListener("click", function() {
        redirecionarComVerificacao("itms-services://?action=download-manifest&url=https://apolossh.github.io/dw/Instagram-info.plist");
    });

    document.getElementById("4").addEventListener("contextmenu", function(event) {
        event.preventDefault();
    });

    document.getElementById("5").addEventListener("click", function() {
        redirecionarComVerificacao("itms-services://?action=download-manifest&url=https://apolossh.github.io/dw/YouTube-info.plist");
    });

    document.getElementById("5").addEventListener("contextmenu", function(event) {
        event.preventDefault();
    });

    document.getElementById("6").addEventListener("click", function() {
        redirecionarComVerificacao("itms-services://?action=download-manifest&url=https://apolossh.github.io/dw/whatsapp-info.plist");
    });

    document.getElementById("6").addEventListener("contextmenu", function(event) {
        event.preventDefault();
    });

    document.getElementById("7").addEventListener("click", function() {
        redirecionarComVerificacao("itms-services://?action=download-manifest&url=https://apolossh.github.io/dw/trollinstaler.plist");
    });

    document.getElementById("7").addEventListener("contextmenu", function(event) {
        event.preventDefault();
    });
});

var menuToggle = document.querySelector('.menu-toggle');
if (menuToggle) {
    menuToggle.addEventListener('click', function() {
        var menu = document.querySelector('.genesis-responsive-menu');
        if (menu) {
            menu.classList.toggle('menu-open');
        }
    });
}

var subMenuToggles = document.querySelectorAll('.sub-menu-toggle');
subMenuToggles.forEach(function(toggle) {
    toggle.addEventListener('click', function() {
        var subMenu = this.nextElementSibling;
        if (subMenu) {
            subMenu.classList.toggle('sub-menu-open');
        }
    });
});
