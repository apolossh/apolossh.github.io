document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    var username = document.getElementById('username').value.trim();
    var password = document.getElementById('password').value.trim();

    // Verifica se o nome de usuário e a senha foram inseridos
    if (!username || !password) {
        alert('Por favor, insira o nome de usuário e a senha.');
        return;
    }

    // Define o nome e a extensão do arquivo de dados
    var nomeArquivoDados = 'aaa';
    var extensaoArquivo = '.json';
    var urlArquivoDados = nomeArquivoDados + extensaoArquivo;

    // Busca os dados de usuário e verifica as credenciais
    fetch(urlArquivoDados)
        .then(response => {
            if (!response.ok) {
                throw new Error('Problema ao carregar os dados de login');
            }
            return response.json();
        })
        .then(users => {
            const user = users.find(u => u.username === username && u.password === password);
            if(user) {
                // Define o item no sessionStorage para indicar que o usuário está autenticado
                sessionStorage.setItem('usuarioAutenticado', 'true');
                // Redireciona para a página principal
                window.location.href = 'index.html';
            } else {
                alert('Usuário ou senha incorretos!');
            }
        })
        .catch(error => {
            alert('Erro ao carregar os dados de login: ' + error.message);
        });
});
