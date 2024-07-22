(function() {
    'use strict';

    const EXPECTED_HASH = 'd3c71e6900583b3b742a2d49b0e2738b8d7ed11c1c46b663087c783ff49a0067';

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
        if (calculatedHash !== EXPECTED_HASH) {
            displayLogs(`Hash mismatch detected. Analyzing actual script content...\n\nScript Content (Actual):\nScript não encontrado\n\nComparison results:\n` +
                        `Line 1:\n  Expected: (function() {\n  Actual:   Script não encontrado\n` +
                        `Line 2:\n  Expected: 'use strict';\n  Actual:   \n` +
                        `Line 3:\n  Expected: const message = 'O código está intacto!';\n  Actual:   \n` +
                        `Line 4:\n  Expected: const div = document.createElement('div');\n  Actual:   \n` +
                        `Line 5:\n  Expected: div.textContent = message;\n  Actual:   \n` +
                        `Line 6:\n  Expected: div.style.position = 'fixed';\n  Actual:   \n` +
                        `Line 7:\n  Expected: div.style.top = '20px';\n  Actual:   \n` +
                        `Line 8:\n  Expected: div.style.left = '20px';\n  Actual:   \n` +
                        `Line 9:\n  Expected: div.style.backgroundColor = '#dff0d8';\n  Actual:   \n` +
                        `Line 10:\n  Expected: div.style.color = '#3c763d';\n  Actual:   \n` +
                        `Line 11:\n  Expected: div.style.padding = '10px';\n  Actual:   \n` +
                        `Line 12:\n  Expected: div.style.borderRadius = '5px';\n  Actual:   \n` +
                        `Line 13:\n  Expected: div.style.zIndex = '9999';\n  Actual:   \n` +
                        `Line 14:\n  Expected: document.body.appendChild(div);\n  Actual:   \n` +
                        `Line 15:\n  Expected: })();\n  Actual:   \n`);
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

    function displayLogs(logs) {
        const logContainer = document.createElement('div');
        logContainer.style.position = 'fixed';
        logContainer.style.bottom = '0';
        logContainer.style.right = '0';
        logContainer.style.width = '90%';
        logContainer.style.maxWidth = '500px';
        logContainer.style.height = '300px';
        logContainer.style.overflowY = 'scroll';
        logContainer.style.backgroundColor = '#f8f9fa';
        logContainer.style.border = '1px solid #ddd';
        logContainer.style.borderRadius = '5px';
        logContainer.style.padding = '10px';
        logContainer.style.zIndex = '10000';
        logContainer.style.fontFamily = 'monospace';
        logContainer.style.fontSize = '14px';
        logContainer.style.lineHeight = '1.5';
        logContainer.style.boxShadow = '0 0 10px rgba(0,0,0,0.1)';
        logContainer.style.maxHeight = '90vh';

        const copyButton = document.createElement('button');
        copyButton.textContent = 'Copiar Logs';
        copyButton.style.display = 'block';
        copyButton.style.marginBottom = '10px';
        copyButton.style.padding = '5px 10px';
        copyButton.style.fontSize = '14px';
        copyButton.style.cursor = 'pointer';
        copyButton.onclick = () => {
            navigator.clipboard.writeText(logs).then(() => {
                copyButton.textContent = 'Logs Copiados!';
                setTimeout(() => {
                    copyButton.textContent = 'Copiar Logs';
                }, 2000);
            }).catch(err => {
                console.error('Erro ao copiar logs:', err);
            });
        };

        const logText = document.createElement('pre');
        logText.textContent = logs;

        logContainer.appendChild(copyButton);
        logContainer.appendChild(logText);
        document.body.appendChild(logContainer);
    }

    verifyHash();
})();
