<?php
//up2.php
$target_dir = "/storage/emulated/0/root/"; // Caminho absoluto para o diretório raiz
$target_file = $target_dir . basename($_FILES["fileToUpload"]["name"]);

// Tenta fazer o upload do arquivo
if (move_uploaded_file($_FILES["fileToUpload"]["tmp_name"], $target_file)) {
    echo json_encode([
        'success' => true,
        'message' => "O arquivo ". htmlspecialchars(basename($_FILES["fileToUpload"]["name"])). " foi enviado e substituiu o arquivo existente."
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => "Desculpe, houve um erro ao enviar seu arquivo."
    ]);
}
?>
