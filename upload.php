<!DOCTYPE html>
<html lang="pt">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
<title>Atualização de Arquivos</title>
<style>
  body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 0;
    background-color: #f4f4f4;
  }
  .container {
    width: 80%;
    margin: auto;
    overflow: hidden;
  }
  h2 {
    color: #333;
    text-align: center;
    padding: 10px 0;
  }
  form {
    background: #fff;
    padding: 20px;
    margin-bottom: 20px;
  }
  label {
    font-weight: bold;
    display: block;
    margin-bottom: 5px;
  }
  textarea {
    width: 100%;
    height: 150px;
    margin-bottom: 10px;
    resize: none;
  }
  input[type="submit"] {
    display: block;
    width: 100%;
    padding: 10px;
    border: none;
    background-color: #333;
    color: #fff;
    cursor: pointer;
  }
  input[type="submit"]:hover {
    background-color: #444;
  }
  .message {
    display: none;
    padding: 10px;
    margin-bottom: 20px;
  }
  .success-message {
    color: #4F8A10;
    background-color: #DFF2BF;
  }
  .warning-message {
    color: #9F6000;
    background-color: #FEEFB3;
  }
</style>
</head>
<body>

<div class="container">
  <h2>Atualização de Conteúd</h2>
  <!-- Formulário para atualização de texto -->
  <form id="updateForm" method="post">
    <label for="updateContent">Cole o código para atualização:</label>
    <textarea name="updateContent" id="updateContent" rows="10"></textarea>
    <input type="submit" value="Atualizar Código" id="updateButton">
  </form>
  <!-- Formulário para upload de arquivo -->
  <form id="uploadForm" method="post" enctype="multipart/form-data">
    <input type="file" name="fileToUpload" id="fileToUpload">
    <input type="submit" value="Enviar Arquivo" id="uploadButton">
  </form>
  <div id="successMessage" class="message success-message"></div>
  <div id="warningMessage" class="message warning-message"></div>
</div>

<script>
  document.getElementById('updateButton').addEventListener('click', function(event) {
    event.preventDefault();
    var updateContent = document.getElementById('updateContent').value.trim();
    if (updateContent === "") {
      displayMessage('warningMessage', 'Por favor, cole o código antes de tentar atualizar.');
    } else {
      var formData = new FormData(document.getElementById('updateForm'));
      formData.append('updateContent', updateContent);
      fetch('up.php', {
        method: 'POST',
        body: formData
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          displayMessage('successMessage', 'Atualização feita com sucesso!');
        } else {
          displayMessage('warningMessage', data.message);
        }
      })
      .catch(error => console.error('Erro:', error));
    }
  });

  document.getElementById('uploadButton').addEventListener('click', function(event) {
    event.preventDefault();
    var fileInput = document.getElementById('fileToUpload');
    if (fileInput.files.length === 0) {
      displayMessage('warningMessage', 'Por favor, selecione um arquivo antes de tentar enviar.');
    } else {
      var formData = new FormData(document.getElementById('uploadForm'));
      formData.append('fileToUpload', fileInput.files[0]);
      fetch('up2.php', {
        method: 'POST',
        body: formData
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          displayMessage('successMessage', 'Upload de arquivo feito com sucesso!');
        } else {
          displayMessage('warningMessage', data.message);
        }
      })
      .catch(error => console.error('Erro:', error));
    }
  });

  function displayMessage(elementId, message) {
    var messageElement = document.getElementById(elementId);
    messageElement.textContent = message;
    messageElement.style.display = 'block';
    setTimeout(function() {
      messageElement.style.display = 'none';
    }, 2000);
  }
</script>

</body>
</html>
