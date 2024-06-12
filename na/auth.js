// auth.js
function verificarAcesso() {
    // Verifica se está na página de login para evitar o loop de recarregamento
    if (window.location.pathname !== '/login.html' && !sessionStorage.getItem('usuarioAutenticado')) {
        window.location.href = 'login.html';
    } else if (window.location.pathname !== '/login.html') {
        // Se estiver autenticado, exibe o conteúdo principal
        document.getElementById('conteudo-principal').style.display = 'block';
    }
}

// Chama a função verificarAcesso apenas se não estiver na página de login
if (window.location.pathname !== '/login.html') {
    window.onload = verificarAcesso;
}
