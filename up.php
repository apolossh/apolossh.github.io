<?php
// up.php

$target_dir = "/storage/emulated/0/root/"; // Caminho absoluto para o diretório raiz

// Verifica se o texto de atualização foi enviado
if (isset($_POST['updateContent'])) {
    $conteudo = $_POST['updateContent'];
    
    // Expressão regular para buscar identificadores com as extensões .html, .php, .css, .js
    $regex = '/\\b[\\w-]+\\.html|[\\w-]+\\.php|[\\w-]+\\.css|[\\w-]+\\.js\\b/';
    
    // Busca por identificadores no conteúdo
    if (preg_match($regex, $conteudo, $matches)) {
        // Identificador encontrado, prosseguir com a atualização
        $identificador = $matches[0];
        $target_file = $target_dir . $identificador;

        // Substitui o conteúdo do arquivo especificado no servidor pelo conteúdo copiado
        if (file_put_contents($target_file, $conteudo)) {
            echo "O arquivo '$identificador' foi atualizado com sucesso.";
        } else {
            echo "Erro ao atualizar o arquivo '$identificador'.";
        }
    } else {
        echo "Nenhum identificador válido com as extensões .html, .php, .css, .js foi encontrado no conteúdo enviado.";
    }
} else {
    echo "Nenhum texto de atualização foi enviado.";
}
?>
