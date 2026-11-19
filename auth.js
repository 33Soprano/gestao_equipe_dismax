(function () {
    "use strict";

    window.dxAuth = {
        KEY: "dx_me",

        save: function (member) {
            try {
                localStorage.setItem(this.KEY, JSON.stringify({ id: member.id, ts: Date.now() }));
            } catch (e) { }
        },

        load: function () {
            try { return JSON.parse(localStorage.getItem(this.KEY) || "null"); }
            catch (e) { return null; }
        },

        clear: function () {
            try { localStorage.removeItem(this.KEY); } catch (e) { }
        },

        logout: function () {
            this.clear();
            location.reload();
        }
    };
})();