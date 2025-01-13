(function() {
    Object.defineProperty(window, 'eval', {
        configurable: false,
        writable: false,
        value: () => {
            throw "Eval bloqueado!";
        }
    });

    Object.defineProperty(window, 'console', {
        get: function() {
            throw "Console bloqueado!";
        }
    });

    Object.freeze(window);
})();
