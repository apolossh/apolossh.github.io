// scripts.js

(function() {
    'use strict';

    let devToolsOpen = false;
    const threshold = 160; // Limiar de largura para detectar alterações devido ao DevTools

    // Função para detectar se o DevTools foi aberto
    const detectDevTools = () => {
        // Verifica se a largura externa da janela é maior que a interna
        if (window.outerWidth - window.innerWidth > threshold) {
            if (!devToolsOpen) {
                devToolsOpen = true;
                alert('DevTools foi aberto!');
            }
        } else {
            devToolsOpen = false;
        }
    };

    // Verificar periodicamente a cada 1 segundo
    setInterval(detectDevTools, 1000);

    // Detecção de console do navegador
    const detectConsole = () => {
        const devTools = /./;
        devTools.toString = function() {
            alert('DevTools foi aberto! (detecção de console)');
        };
        console.log('%c ', devTools); // Aciona o método .toString()
    };

    // Tenta detectar o DevTools via console
    detectConsole();
})();

// aaa
document.addEventListener('DOMContentLoaded', function() {
    

document.getElementById("1").addEventListener("click", function() {
        window.location.href = "/dw/dns.mobileconfig";
    });

    document.getElementById("1").addEventListener("contextmenu", function(event) {
        event.preventDefault();
    });

    document.getElementById("2").addEventListener("click", function() {
        window.location.href = "/dw/cert.zip";
    });

    document.getElementById("2").addEventListener("contextmenu", function(event) {
        event.preventDefault();
    });

    document.getElementById("3").addEventListener("click", function() {
        window.location.href = "itms-services://?action=download-manifest&url=https://apolossh.github.io/dw/ESign-info.plist";
    });

    document.getElementById("3").addEventListener("contextmenu", function(event) {
        event.preventDefault();
    });

document.getElementById("4").addEventListener("click", function() {
        window.location.href = "itms-services://?action=download-manifest&url=https://apolossh.github.io/dw/feather.plist";
    });

    document.getElementById("4").addEventListener("contextmenu", function(event) {
        event.preventDefault();
    });
    document.getElementById("5").addEventListener("click", function() {
        window.location.href = "itms-services://?action=download-manifest&url=https://apolossh.github.io/dw/Instagram-info.plist";
    });

    document.getElementById("5").addEventListener("contextmenu", function(event) {
        event.preventDefault();
    });

    document.getElementById("6").addEventListener("click", function() {
        window.location.href = "itms-services://?action=download-manifest&url=https://apolossh.github.io/dw/YouTube-info.plist";
    });

    document.getElementById("6").addEventListener("contextmenu", function(event) {
        event.preventDefault();
    });

document.getElementById("7").addEventListener("click", function() {
        window.location.href = "itms-services://?action=download-manifest&url=https://apolossh.github.io/dw/whatsapp-info.plist";
    });

    document.getElementById("7").addEventListener("contextmenu", function(event) {
        event.preventDefault();
    });

document.getElementById("8").addEventListener("click", function() {
        window.location.href = "itms-services://?action=download-manifest&url=https://apolossh.github.io/dw/trollinstaler.plist";
    });

    document.getElementById("8").addEventListener("contextmenu", function(event) {
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
