// ==UserScript==
// @name         Baixar Imagens e Vídeos e Compactar em Zip com Nome do Criador
// @namespace    http://tampermonkey.net/
// @version      1.21
// @description  Baixa imagens e vídeos de páginas e compacta em .zip, organizando em pastas separadas com o nome do criador como nome do arquivo zip
// @author       @apolossh
// @match        https://onlyfans.com/*
// @grant        https://apolossh.github.io/BaixarDoOnlyFans.js
// @run-at       document-end
// @require      https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js
// ==/UserScript==

(function () {
    'use strict';

    const imagensSet = new Set();
    const videosSet = new Set();
    let emProcessamento = false;

    async function baixarArquivo(url) {
        try {
            const resposta = await fetch(url);
            if (!resposta.ok) throw new Error(`Erro ao baixar arquivo: ${resposta.statusText}`);
            const blob = await resposta.blob();
            return blob;
        } catch {
            return null;
        }
    }

    async function adicionarArquivosNoZip(imagens, videos, zip, nomeCriador, atualizarProgresso) {
        let i = 0;
        let totalArquivos = imagens.length + videos.length;
        let arquivosBaixados = 0;

        for (let url of imagens) {
            const extensao = url.split('.').pop().split('?')[0];
            const nomeArquivo = `imagem_${i + 1}.${extensao}`;
            const imagemBlob = await baixarArquivo(url);
            if (imagemBlob) {
                zip.folder(`${nomeCriador}/imagens`).file(nomeArquivo, imagemBlob);
                arquivosBaixados++;
                atualizarProgresso(arquivosBaixados, totalArquivos);
            }
            i++;
        }

        i = 0;
        for (let url of videos) {
            const extensao = url.split('.').pop().split('?')[0];
            const nomeArquivo = `video_${i + 1}.${extensao}`;
            const videoBlob = await baixarArquivo(url);
            if (videoBlob) {
                zip.folder(`${nomeCriador}/videos`).file(nomeArquivo, videoBlob);
                arquivosBaixados++;
                atualizarProgresso(arquivosBaixados, totalArquivos);
            }
            i++;
        }
    }

    async function gerarZip(nomeCriador) {
        if (emProcessamento) return;
        emProcessamento = true;
        if (imagensSet.size === 0 && videosSet.size === 0) {
            alert(getIdioma() === 'pt' ? 'Nenhum arquivo encontrado para baixar.' : 'No files found to download.');
            emProcessamento = false;
            return;
        }
        const zip = new JSZip();
        const imagensArray = Array.from(imagensSet);
        const videosArray = Array.from(videosSet);
        const botao = document.getElementById('botao-baixar-arquivos');
        botao.style.backgroundColor = '#dc3545';
        botao.textContent = getIdioma() === 'pt' ? 'Aguarde...' : 'Please wait...';
        botao.disabled = true;

        const barraProgresso = document.createElement('div');
        barraProgresso.style.position = 'fixed';
        barraProgresso.style.top = '70px';
        barraProgresso.style.left = '50%';
        barraProgresso.style.transform = 'translateX(-50%)';
        barraProgresso.style.width = '80%';
        barraProgresso.style.height = '20px';
        barraProgresso.style.backgroundColor = '#f3f3f3';
        barraProgresso.style.borderRadius = '10px';
        barraProgresso.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
        document.body.appendChild(barraProgresso);

        const progresso = document.createElement('div');
        progresso.style.height = '100%';
        progresso.style.backgroundColor = '#28a745';
        progresso.style.borderRadius = '10px';
        barraProgresso.appendChild(progresso);

        const atualizarProgresso = (arquivosBaixados, totalArquivos) => {
            progresso.style.width = `${(arquivosBaixados / totalArquivos) * 100}%`;
        };

        await adicionarArquivosNoZip(imagensArray, videosArray, zip, nomeCriador, atualizarProgresso);
        
        zip.generateAsync({ type: 'blob' }).then(function (conteudoZip) {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(conteudoZip);
            link.download = nomeCriador + '.zip';
            link.click();
            
            barraProgresso.remove();
            botao.style.backgroundColor = '#28a745';
            botao.textContent = getIdioma() === 'pt' ? 'Baixar Todos os Arquivos' : 'Download All Files';
            botao.disabled = false;
            emProcessamento = false;
        });
    }

    function atualizarListaDeArquivos() {
        if (emProcessamento) return;

        document.querySelectorAll('.b-post__media__item-inner.m-photo.m-black-bg').forEach(elemento => {
            const bgElemento = elemento.querySelector('.b-post__media-bg');
            if (bgElemento && bgElemento.style.backgroundImage) {
                const url = bgElemento.style.backgroundImage.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
                imagensSet.add(url);
            }
            const imgElemento = elemento.querySelector('img.img-responsive.m-object-contain');
            if (imgElemento && imgElemento.src) {
                imagensSet.add(imgElemento.src);
            }
        });
        document.querySelectorAll('.pswp__zoom-wrap img').forEach(imgElemento => {
            if (imgElemento && imgElemento.src) {
                imagensSet.add(imgElemento.src);
            }
        });
        document.querySelectorAll('.video-js video').forEach(videoElemento => {
            if (videoElemento && videoElemento.src) {
                videosSet.add(videoElemento.src);
            }
        });
    }

    function criarBotaoDownload() {
        const botaoId = 'botao-baixar-arquivos';
        if (document.getElementById(botaoId)) return;
        const botao = document.createElement('button');
        botao.id = botaoId;
        botao.textContent = getIdioma() === 'pt' ? 'Baixar Todos os Arquivos' : 'Download All Files';
        botao.style.position = 'fixed';
        botao.style.top = '1px';
        botao.style.left = '1px';
        botao.style.padding = '10px 16px';
        botao.style.fontSize = '14px';
        botao.style.backgroundColor = '#28a745';
        botao.style.color = 'white';
        botao.style.border = 'none';
        botao.style.borderRadius = '5px';
        botao.style.cursor = 'pointer';
        botao.style.zIndex = '2147483647';
        botao.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
        botao.style.pointerEvents = 'auto';
        botao.style.display = 'none';
        botao.addEventListener('click', () => {
            const urlPagina = new URL(window.location.href);
            const nomeCriador = urlPagina.pathname.split('/')[1];
            gerarZip(nomeCriador);
        });
        document.body.appendChild(botao);

        if (localStorage.getItem('avisoMostrado') === 'true') {
            botao.style.display = 'block';
        }
    }

    function getIdioma() {
        const idioma = navigator.language || navigator.userLanguage;
        return idioma.startsWith('pt') ? 'pt' : 'en';
    }

    function exibirMensagemAviso() {
        if (localStorage.getItem('avisoMostrado') === 'true') return;

        const mensagem = getIdioma() === 'pt' ? 'Aviso: Desça a página para carregar todo o conteúdo. Reproduza os vídeos para capturá-los. Depois clique no botão "Baixar Todos os Arquivos".' : 'Notice: Scroll down the page to load all content. Play the videos to capture them. Then click the "Download All Files" button.';
        const caixaMensagem = document.createElement('div');
        caixaMensagem.style.position = 'fixed';
        caixaMensagem.style.top = '20px';
        caixaMensagem.style.left = '50%';
        caixaMensagem.style.transform = 'translateX(-50%)';
        caixaMensagem.style.padding = '20px';
        caixaMensagem.style.backgroundColor = '#f8d7da';
        caixaMensagem.style.border = '1px solid #f5c6cb';
        caixaMensagem.style.borderRadius = '5px';
        caixaMensagem.style.zIndex = '9999999';
        caixaMensagem.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
        caixaMensagem.style.textAlign = 'center';

        const texto = document.createElement('span');
        texto.textContent = mensagem;
        caixaMensagem.appendChild(texto);

        const botaoConfirmar = document.createElement('button');
        botaoConfirmar.textContent = getIdioma() === 'pt' ? 'Entendido' : 'Understood';
        botaoConfirmar.style.marginTop = '10px';
        botaoConfirmar.style.backgroundColor = '#28a745';
        botaoConfirmar.style.color = 'white';
        botaoConfirmar.style.border = 'none';
        botaoConfirmar.style.padding = '8px 16px';
        botaoConfirmar.style.borderRadius = '5px';
        botaoConfirmar.style.cursor = 'pointer';
        botaoConfirmar.addEventListener('click', () => {
            localStorage.setItem('avisoMostrado', 'true');
            caixaMensagem.remove();
            document.getElementById('botao-baixar-arquivos').style.display = 'block';
        });
        caixaMensagem.appendChild(document.createElement('br'));
        caixaMensagem.appendChild(botaoConfirmar);
        document.body.appendChild(caixaMensagem);
    }

    criarBotaoDownload();
    exibirMensagemAviso();
    setInterval(atualizarListaDeArquivos, 500);
})();