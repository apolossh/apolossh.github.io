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
            displayMessage('O código foi alterado! O script não será executado.');
            throw new Error('Código alterado');
        }
        displayMessage('O código está intacto!');
    }

    function displayMessage(message) {
        const div = document.createElement('div');
        div.textContent = message;
        div.style.position = 'fixed';
        div.style.top = '20px';
        div.style.left = '20px';
        div.style.backgroundColor = message.includes('alterado') ? '#f8d7da' : '#d4edda';
        div.style.color = message.includes('alterado') ? '#721c24' : '#155724';
        div.style.padding = '10px';
        div.style.borderRadius = '5px';
        div.style.zIndex = '9999';
        div.style.fontSize = '16px';
        div.style.fontFamily = 'Arial, sans-serif';
        div.style.boxShadow = '0 0 10px rgba(0,0,0,0.1)';
        document.body.appendChild(div);
    }

    verifyHash();
})();
