// Auth removed: this script is now a no-op. It only sets a benign flag to indicate public mode.
(function () {
    try {
        window.EZ_PUBLIC_MODE = true;
        if (!localStorage.getItem('currentUser')) {
            localStorage.setItem('currentUser', JSON.stringify({ username: 'public', is_admin: false }));
        }
    } catch (e) { }
})();
