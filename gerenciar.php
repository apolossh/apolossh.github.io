<!DOCTYPE html>
<html lang="pt">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Gerenciador de Arquivos</title>
<style>
// gerenciar.php
  /* Estilos básicos */
  body {
    font-family: 'Arial', sans-serif;
    background-color: #f4f4f4;
    margin: 0;
    padding: 0;
  }
  .container {
    width: 50%;
    margin: auto;
    overflow: hidden;
    background-color: #fff;
    padding: 20px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  }
  h1 {
    color: #333;
    text-align: center;
  }
  .file-item {
    border-bottom: 1px solid #eee;
    padding: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .file-item:last-child {
    border-bottom: none;
  }
  .file-upload {
    margin-bottom: 20px;
  }
  .file-upload input[type="file"] {
    margin-bottom: 10px;
  }
  /* Adicione mais estilos conforme necessário */
</style>
</head>
<body>
  <div class="container">
    <h1>Gerenciador de Arquivos</h1>
    <div class="file-upload">
      <form action="" method="post" enctype="multipart/form-data">
        <input type="file" name="fileToUpload" id="fileToUpload">
        <input type="submit" value="Upload" name="submit">
      </form>
    </div>
    <?php
    $diretorio = '/storage/emulated/0/root/';

    // Função para excluir diretórios e seus conteúdos
    function excluirDiretorio($dirPath) {
        if (!is_dir($dirPath)) {
            throw new InvalidArgumentException("$dirPath deve ser um diretório");
        }
        if (substr($dirPath, strlen($dirPath) - 1, 1) != '/') {
            $dirPath .= '/';
        }
        $files = glob($dirPath . '*', GLOB_MARK);
        foreach ($files as $file) {
            if (is_dir($file)) {
                excluirDiretorio($file);
            } else {
                unlink($file);
            }
        }
        rmdir($dirPath);
    }

    // Processar o upload de arquivos
    if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_FILES['fileToUpload'])) {
      $target_file = $diretorio . basename($_FILES['fileToUpload']['name']);
      if (move_uploaded_file($_FILES['fileToUpload']['tmp_name'], $target_file)) {
        echo "<p>Arquivo ". htmlspecialchars( basename( $_FILES['fileToUpload']['name'])). " foi enviado.</p>";
      } else {
        echo "<p>Desculpe, houve um erro ao enviar seu arquivo.</p>";
      }
    }

    // Processar a exclusão de arquivos e diretórios
    if (isset($_GET['delete'])) {
      $target = $diretorio . $_GET['delete'];
      if (is_dir($target)) {
        excluirDiretorio($target);
        echo "<p>Diretório $target excluído com sucesso!</p>";
      } elseif (is_file($target)) {
        unlink($target);
        echo "<p>Arquivo $target excluído com sucesso!</p>";
      } else {
        echo "<p>Erro: O item não foi encontrado.</p>";
      }
    }

    // Listar arquivos e diretórios
    $arquivos = scandir($diretorio);
    foreach ($arquivos as $arquivo) {
      if ($arquivo !== '.' && $arquivo !== '..') {
        echo "<div class='file-item'>$arquivo <a href='?delete=$arquivo'>Excluir</a></div>";
      }
    }
    ?>
  </div>
</body>
</html>
