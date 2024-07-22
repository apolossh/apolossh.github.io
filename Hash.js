// ==UserScript==
// @name         Exemplo de Proteção com Hash
// @namespace    Example
// @version      1.0
// @description  Um exemplo de script com proteção contra alterações usando hash.
// @author       Você
// @match        *://*/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    const EXPECTED_HASH = 'd3c71e6900583b3b742a2d49b0e2738b8d7ed11c1c46b663087c783ff49a0067';

    function createLogPanel() {
        const logPanel = document.createElement('div');
        logPanel.id = 'logPanel';
        logPanel.style.position = 'fixed';
        logPanel.style.bottom = '0';
        logPanel.style.right = '0';
        logPanel.style.width = '90%';
        logPanel.style.maxWidth = '500px';
        logPanel.style.height = '300px';
        logPanel.style.overflowY = 'scroll';
        logPanel.style.backgroundColor = '#f8f9fa';
        logPanel.style.border = '1px solid #ddd';
        logPanel.style.borderRadius = '5px';
        logPanel.style.padding = '10px';
        logPanel.style.zIndex = '10000';
        logPanel.style.fontFamily = 'monospace';
        logPanel.style.fontSize = '14px';
        logPanel.style.lineHeight = '1.5';
        logPanel.style.boxShadow = '0 0 10px rgba(0,0,0,0.1)';
        logPanel.style.maxHeight = '90vh';

        const copyButton = document.createElement('button');
        copyButton.textContent = 'Copiar Logs';
        copyButton.style.display = 'block';
        copyButton.style.marginBottom = '10px';
        copyButton.style.padding = '5px 10px';
        copyButton.style.fontSize = '14px';
        copyButton.style.cursor = 'pointer';
        copyButton.addEventListener('click', () => {
            copyToClipboard();
        });

        logPanel.appendChild(copyButton);
        document.body.appendChild(logPanel);
    }

    function logMessage(message) {
        const logPanel = document.getElementById('logPanel');
        if (logPanel) {
            const logEntry = document.createElement('pre');
            logEntry.textContent = message;
            logPanel.appendChild(logEntry);
        }
    }

    async function sha256(str) {
        const encoder = new TextEncoder();
        const data = encoder.encode(str);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
        return hashHex;
    }

    async function verifyHash() {
        const scriptContent = `
            (function() {
                'use strict';

                const message = 'O código está intacto!';
                const div = document.createElement('div');
                div.textContent = message;
                div.style.position = 'fixed';
                div.style.top = '20px';
                div.style.left = '20px';
                div.style.backgroundColor = '#dff0d8';
                div.style.color = '#3c763d';
                div.style.padding = '10px';
                div.style.borderRadius = '5px';
                div.style.zIndex = '9999';
                document.body.appendChild(div);
            })();
        `;

        const calculatedHash = await sha256(scriptContent.trim());
        logMessage('Calculated Hash: ' + calculatedHash);
        logMessage('Expected Hash: ' + EXPECTED_HASH);

        if (calculatedHash !== EXPECTED_HASH) {
            logMessage('Hash mismatch detected. Analyzing actual script content...');
            const actualContent = await getActualScriptContent();
            logMessage('Script Content (Actual):');
            logMessage(actualContent);

            compareScripts(scriptContent, actualContent);

            alert('O código foi alterado! O script não será executado.');
            throw new Error('Código alterado');
        }
        startScript();
    }

    function startScript() {
        const message = 'O código está intacto!';
        const div = document.createElement('div');
        div.textContent = message;
        div.style.position = 'fixed';
        div.style.top = '20px';
        div.style.left = '20px';
        div.style.backgroundColor = '#dff0d8';
        div.style.color = '#3c763d';
        div.style.padding = '10px';
        div.style.borderRadius = '5px';
        div.style.zIndex = '9999';
        document.body.appendChild(div);
    }

    async function getActualScriptContent() {
        let content = 'Script não encontrado';
        const scripts = document.getElementsByTagName('script');

        for (let i = 0; i < scripts.length; i++) {
            const script = scripts[i];
            if (script.src.includes('Hash.js')) {
                content = script.textContent || 'Script vazio';
                logMessage('Encontrado script: ' + script.src);
                break;
            }
        }

        if (content === 'Script não encontrado') {
            logMessage('Scripts na página:');
            Array.from(scripts).forEach((script, index) => {
                logMessage(`Script ${index + 1}: ${script.src || 'Inline script'}`);
            });
        }

        return content;
    }

    function compareScripts(expected, actual) {
        const expectedLines = expected.split('\n').map(line => line.trim());
        const actualLines = actual.split('\n').map(line => line.trim());

        logMessage('Resultados da comparação:');
        for (let i = 0; i < Math.max(expectedLines.length, actualLines.length); i++) {
            const expectedLine = expectedLines[i] || '';
            const actualLine = actualLines[i] || '';

            if (expectedLine !== actualLine) {
                logMessage(`Linha ${i + 1}:`);
                logMessage(`  Esperado: ${expectedLine}`);
                logMessage(`  Atual:    ${actualLine}`);
            }
        }
    }

    function copyToClipboard() {
        const logPanel = document.getElementById('logPanel');
        if (logPanel) {
            const range = document.createRange();
            range.selectNode(logPanel);
            window.getSelection().removeAllRanges();
            window.getSelection().addRange(range);

            try {
                document.execCommand('copy');
                alert('Logs copiados para a área de transferência.');
            } catch (err) {
                alert('Falha ao copiar os logs.');
            }

            window.getSelection().removeAllRanges();
        }
    }

    createLogPanel();
    verifyHash();
})();