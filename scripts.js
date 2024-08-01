document.addEventListener('DOMContentLoaded', function() {
    document.getElementById("1").addEventListener("click", function() {
        // Redireciona para o arquivo mobileconfig
        window.location.href = "/dw/dns.mobileconfig";
        
        // Executa a URL de preferências no iOS usando um iframe
        setTimeout(function() {
            var iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = "prefs:root=General&path=ManagedConfigurationList/PurgatoryInstallRequested";
            document.body.appendChild(iframe);
        }, 500); // Adiciona um pequeno atraso para garantir que o primeiro redirecionamento seja processado
    });

    document.getElementById("1").addEventListener("contextmenu", function(event) {
        event.preventDefault();
    });

    document.getElementById("2").addEventListener("click", function() {
        window.location.href = "/dw/cert.esigncert";
    });

    document.getElementById("2").addEventListener("contextmenu", function(event) {
        event.preventDefault();
    });

    document.getElementById("3").addEventListener("click", function() {
        window.location.href = "itms-services://?action=download-manifest&url=https://apolossh.online/dw/ESign-info.plist";
    });

    document.getElementById("3").addEventListener("contextmenu", function(event) {
        event.preventDefault();
    });

    document.getElementById("4").addEventListener("click", function() {
        window.location.href = "itms-services://?action=download-manifest&url=https://apolossh.online/dw/Instagram-info.plist";
    });

    document.getElementById("4").addEventListener("contextmenu", function(event) {
        event.preventDefault();
    });

    document.getElementById("5").addEventListener("click", function() {
        window.location.href = "itms-services://?action=download-manifest&url=https://apolossh.online/dw/YouTube-info.plist";
    });

    document.getElementById("5").addEventListener("contextmenu", function(event) {
        event.preventDefault();
    });

    document.getElementById("6").addEventListener("click", function() {
        window.location.href = "itms-services://?action=download-manifest&url=https://apolossh.online/dw/whatsapp-info.plist";
    });

    document.getElementById("6").addEventListener("contextmenu", function(event) {
        event.preventDefault();
    });

    document.getElementById("7").addEventListener("click", function() {
        window.location.href = "itms-services://?action=download-manifest&url=https://apolossh.online/dw/trollinstaler.plist";
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
