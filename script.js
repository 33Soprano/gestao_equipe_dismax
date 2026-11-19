(function () {
    "use strict";

    /* ============================================================
       ESTADO INICIAL
       ============================================================ */
    var INITIAL_STATE = {
        savedAt: 0,
        board: {
            id: "00000000-0000-0000-0000-000000000001",
            name: "Gestão de Equipe",
            desc: "Acompanhamento de tarefas, prazos e entregas da equipe."
        },
        members: [], groups: [], tasks: [], ideas: [], routines: [],
        mm: { d: {}, t: {} }
    };

    /* ============================================================
       CONSTANTES
       ============================================================ */
    var STATUS = [
        { k: "nao", l: "Não iniciado", c: "#c4c4c4" },
        { k: "andamento", l: "Em andamento", c: "#fdab3d" },
        { k: "aguardando", l: "Em aprovação", c: "#a25ddc" },
        { k: "travado", l: "Travado", c: "#e2445c" },
        { k: "feito", l: "Concluído", c: "#00c875" }
    ];
    var PRIO = [
        { k: "critica", l: "Crítica", c: "#333333", n: 5 },
        { k: "alta", l: "Alta", c: "#401694", n: 4 },
        { k: "media", l: "Média", c: "#5559df", n: 3 },
        { k: "baixa", l: "Baixa", c: "#579bfc", n: 2 },
        { k: "minima", l: "Mínima", c: "#9aadbd", n: 1 }
    ];
    var IDEA_ST = [
        { k: "nova", l: "Nova", c: "#579bfc" },
        { k: "analise", l: "Em análise", c: "#fdab3d" },
        { k: "aprovada", l: "Aprovada", c: "#a25ddc" },
        { k: "implementada", l: "Implementada", c: "#00c875" },
        { k: "descartada", l: "Descartada", c: "#c4c4c4" }
    ];
    var CARGOS = [
        { l: "Gerente", tipo: "gerente" },
        { l: "Coordenador", tipo: "gerente" },
        { l: "Supervisor", tipo: "analista" },
        { l: "Analista de Trade", tipo: "analista" },
        { l: "Promotor", tipo: "analista" }
    ];
    var COLORS = ["#0073ea", "#00c875", "#fdab3d", "#e2445c", "#a25ddc", "#ff642e", "#037f4c", "#bb3354", "#579bfc", "#ff158a", "#9d50dd", "#175a63"];
    var MES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
    var MESL = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
    var WD = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
    var WDL = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
    var VIEWS = [
        { k: "tabela", l: "Tabela principal" },
        { k: "rotinas", l: "Rotinas diárias" },
        { k: "kanban", l: "Kanban" },
        { k: "mapa", l: "Mapa mental" },
        { k: "painel", l: "Painel e atrasos" },
        { k: "sugestoes", l: "Sugestões de melhoria" },
        { k: "equipe", l: "Equipe" }
    ];
    var VIEW_ICONS = { tabela: "table", rotinas: "repeat", kanban: "kanban", mapa: "mind", painel: "chart", sugestoes: "bulb", equipe: "team" };
    var ICONS = {
        user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>',
        chev: '<path d="M6 9l6 6 6-6"/>', chevr: '<path d="M9 6l6 6-6 6"/>',
        open: '<path d="M14 3h7v7"/><path d="M10 14L21 3"/><path d="M21 14v7H3V3h7"/>',
        chat: '<path d="M21 12a8 8 0 0 1-12 7l-6 2 2-5a8 8 0 1 1 16-4z"/>',
        alert: '<circle cx="12" cy="12" r="9"/><path d="M12 7v6"/><path d="M12 16.5v.5"/>',
        plus: '<path d="M12 5v14M5 12h14"/>', x: '<path d="M6 6l12 12M18 6L6 18"/>',
        up: '<path d="M6 15l6-6 6 6"/>',
        copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>',
        table: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M9 10v10"/>',
        kanban: '<rect x="3" y="4" width="5" height="16" rx="1"/><rect x="10" y="4" width="5" height="10" rx="1"/><rect x="17" y="4" width="4" height="13" rx="1"/>',
        chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
        bulb: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0 0 12 3z"/>',
        team: '<circle cx="9" cy="8" r="3.5"/><path d="M2 20c0-3.5 3-5.5 7-5.5s7 2 7 5.5"/><circle cx="17" cy="7" r="2.8"/><path d="M17 13c3 0 5 1.6 5 4.5"/>',
        check: '<path d="M5 12l5 5L20 7"/>',
        search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
        mind: '<circle cx="12" cy="12" r="3"/><circle cx="4" cy="5" r="2"/><circle cx="20" cy="5" r="2"/><circle cx="4" cy="19" r="2"/><circle cx="20" cy="19" r="2"/><path d="M6 6l3.5 4M18 6l-3.5 4M6 18l3.5-4M18 18l-3.5-4"/>',
        repeat: '<path d="M17 2l4 4-4 4"/><path d="M3 11V9a3 3 0 0 1 3-3h15"/><path d="M7 22l-4-4 4-4"/><path d="M21 13v2a3 3 0 0 1-3 3H3"/>',
        flag: '<path d="M5 21V4h11l-2 4 2 4H5"/>',
        sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
        moon: '<path d="M21 13a9 9 0 1 1-10-10 7 7 0 0 0 10 10z"/>',
        expand: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
        shrink: '<path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/>'
    };

    /* ============================================================
       UTILITÁRIOS
       ============================================================ */
    function $(s, r) { return (r || document).querySelector(s); }
    function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
    function uid() {
        if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c === "x" ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    function pd(s) { if (!s) return null; var a = s.split("-"); return new Date(+a[0], +a[1] - 1, +a[2]); }
    function today0() { var d = new Date(); d.setHours(0, 0, 0, 0); return d; }
    function dd(s) { var d = pd(s); return d ? Math.round((d - today0()) / 864e5) : null; }
    function fmt(s) { var d = pd(s); return d ? String(d.getDate()).padStart(2, "0") + " " + MES[d.getMonth()] : "—"; }
    function fmtBR(s) { var d = pd(s); return d ? String(d.getDate()).padStart(2, "0") + "/" + String(d.getMonth() + 1).padStart(2, "0") : "—"; }
    function isoToday() { var d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
    function isoOf(d) { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
    function addDays(s, n) { var d = pd(s); d.setDate(d.getDate() + n); return isoOf(d); }
    function isLate(t) { var d = dd(t.due); return t.status !== "feito" && d !== null && d < 0; }
    function st(k) { return STATUS.find(function (x) { return x.k === k; }) || STATUS[0]; }
    function pr(k) { return PRIO.find(function (x) { return x.k === k; }) || PRIO[2]; }
    function ist(k) { return IDEA_ST.find(function (x) { return x.k === k; }) || IDEA_ST[0]; }
    function tipoDe(m) {
        if (!m) return "analista";
        var c = CARGOS.find(function (x) { return x.l === m.role; });
        return c ? c.tipo : "analista";
    }
    function mem(id) { return S.members.find(function (m) { return m.id === id; }); }
    function grp(id) { return S.groups.find(function (g) { return g.id === id; }); }
    function task(id) { return S.tasks.find(function (t) { return t.id === id; }); }
    function ownersOf(t) { return (t && t.owners) || []; }
    function canEditTask(t) {
        if (!t) return false;
        if (U.tipo === "gerente") return true;
        return t.creator === U.me || ownersOf(t).indexOf(U.me) >= 0;
    }
    function first(n) { return String(n || "").split(" ")[0]; }
    function initials(n) { var p = String(n || "?").trim().split(/\s+/); return ((p[0] || "")[0] || "").toUpperCase() + ((p.length > 1 ? p[p.length - 1][0] : "") || "").toUpperCase(); }
    function timeline(t) { if (!t.due) return null; var s0 = t.start && t.start <= t.due ? t.start : addDays(t.due, -7); var a = pd(s0), b = pd(t.due); var f = t.status === "feito" ? 1 : Math.min(1, Math.max(0, (today0() - a) / Math.max(864e5, (b - a)))); return { s: s0, f: f }; }
    function progress(t) { if (t.status === "feito") return 100; if (t.subtasks && t.subtasks.length) return Math.round(100 * t.subtasks.filter(function (s) { return s.d; }).length / t.subtasks.length); return { nao: 0, andamento: 40, aguardando: 80, travado: 20 }[t.status] || 0; }
    function av(m, size) { size = size || 30; var fs = Math.round(size * .4); if (!m) return '<span class="av av-empty" style="width:' + size + 'px;height:' + size + 'px;font-size:' + fs + 'px" title="Sem responsável">' + ic("user", Math.round(size * .55)) + '</span>'; if (m.photo) return '<img class="av" src="' + m.photo + '" alt="' + esc(m.name) + '" title="' + esc(m.name) + '" style="width:' + size + 'px;height:' + size + 'px">'; return '<span class="av" style="width:' + size + 'px;height:' + size + 'px;font-size:' + fs + 'px;background:' + m.color + '" title="' + esc(m.name) + '">' + esc(initials(m.name)) + '</span>'; }
    function ic(n, s) { s = s || 16; var p = ICONS[n] || ""; return '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + p + '</svg>'; }
    function stars(t) { var n = pr(t.priority).n; var h = '<div class="stars" role="group" aria-label="Prioridade: ' + pr(t.priority).l + '">'; for (var i = 1; i <= 5; i++) h += '<button class="' + (i <= n ? "on" : "") + '" data-act="star" data-id="' + t.id + '" data-n="' + i + '" aria-label="' + i + ' estrela' + (i > 1 ? "s" : "") + '" title="' + PRIO.find(function (p) { return p.n === i; }).l + '"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3 6.1 20.6l1.3-6.6L2.5 9.4l6.6-.8z"/></svg></button>'; return h + '</div>'; }
    function dueTag(t) { var d = dd(t.due); if (t.status === "feito") { var late = t.doneAt && t.due && t.doneAt > t.due; return '<span class="tag ' + (late ? "soon" : "done") + '">' + (late ? "Entregue com atraso" : "Concluída") + '</span>'; } if (d === null) return '<span class="tag none">Sem prazo</span>'; if (d < 0) return '<span class="tag late">' + (-d) + 'd atraso</span>'; if (d === 0) return '<span class="tag today">Vence hoje</span>'; if (d === 1) return '<span class="tag soon">Amanhã</span>'; if (d <= 3) return '<span class="tag soon">' + d + ' dias</span>'; return ""; }
    function toast(msg) { var el = $("#toast"); if (!el) return; el.textContent = msg; el.classList.add("show"); clearTimeout(toast.t); toast.t = setTimeout(function () { el.classList.remove("show"); }, 2600); }

    /* ============================================================
       ESTADO (S e U)
       ============================================================ */
    var S = JSON.parse(JSON.stringify(INITIAL_STATE));

    function normalizeState(stObj) {
        if (!stObj) return;
        if (!stObj.board) stObj.board = JSON.parse(JSON.stringify(INITIAL_STATE.board));
        if (!Array.isArray(stObj.members)) stObj.members = [];
        if (!Array.isArray(stObj.groups)) stObj.groups = [];
        if (!Array.isArray(stObj.tasks)) stObj.tasks = [];
        if (!Array.isArray(stObj.ideas)) stObj.ideas = [];
        if (!Array.isArray(stObj.routines)) stObj.routines = [];
        if (!stObj.mm) stObj.mm = { d: {}, t: {} };

        stObj.tasks.forEach(function (t) {
            if (t.start === undefined) t.start = "";
            if (!t.owners) t.owners = t.owner ? [t.owner] : [];
            if (t.owner !== undefined) delete t.owner;
            if (!t.creator) t.creator = "";
            if (!t.subtasks) t.subtasks = [];
            if (!t.updates) t.updates = [];
        });
        stObj.routines.forEach(function (r) {
            if (!r.done) r.done = {};
            if (!r.creator) r.creator = r.owner || "";
        });
        stObj.members.forEach(function (m) {
            if (m.email === undefined) m.email = "";
            if (m.departamentoId === undefined) m.departamentoId = m.departamento_id || "";
            if (m.photo === undefined && m.photo_url !== undefined) m.photo = m.photo_url || "";
        });
    }

    try {
        var ls = JSON.parse(localStorage.getItem("dx_board_v1") || "null");
        if (ls && ls.savedAt >= S.savedAt) S = ls;
    } catch (e) { }
    normalizeState(S);

    var U = {
        view: "tabela", q: "", dept: null, person: null, lateOnly: false,
        openTask: null, me: "", tipo: "analista", readonly: false,
        rday: null, editR: null, mmZoom: null, mmHideDone: false, mmFull: false,
        updateDraft: {}, subDraft: {},
        popState: null, allowPruneMembers: false
    };
    try { var su = JSON.parse(sessionStorage.getItem("dx_ui") || "null"); if (su) { U.person = su.person; U.lateOnly = su.lateOnly; U.openTask = su.openTask; U.q = su.q || ""; U.dept = su.dept || null; } } catch (e) { }
    var h = (location.hash || "").replace("#", "");
    if (VIEWS.some(function (v) { return v.k === h; })) U.view = h;

    /* ============================================================
       TEMA
       ============================================================ */
    var MODE = "";
    try { MODE = localStorage.getItem("dx_mode") || ""; } catch (e) { }
    function applyMode() { if (MODE) document.documentElement.setAttribute("data-mode", MODE); else document.documentElement.removeAttribute("data-mode"); }
    applyMode();
    function setMode(v) { MODE = v || ""; try { localStorage.setItem("dx_mode", MODE); } catch (e) { } applyMode(); }
    function effMode() { if (MODE) return MODE; var t = document.documentElement.getAttribute("data-theme"); if (t) return t; return (window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches) ? "dark" : "light"; }

    /* ============================================================
       PERSISTÊNCIA E SINCRONIZAÇÃO
       ============================================================ */
    var api = window.dxApi || null;
    var saveT = null;
    function setBadge(s) { var b = $("#saveBadge"); if (b) b.textContent = s; }
    function localSave() {
        try { localStorage.setItem("dx_board_v1", JSON.stringify(S)); }
        catch (e) { console.warn("Falha ao salvar no localStorage:", e); toast("Aviso: limite de armazenamento local atingido."); }
    }
    function scheduleSave() {
        S.savedAt = Date.now();
        localSave();
        setBadge("Salvando…");
        clearTimeout(saveT);
        saveT = setTimeout(doSave, 1200);
    }
    function doSave() {
        var currentApi = window.dxApi || api;
        if (currentApi && !U.readonly && typeof currentApi.publish === "function") {
            var opts = {
                isGerente: U.tipo === "gerente",
                allowPruneMembers: !!U.allowPruneMembers
            };
            currentApi.publish(S, opts).then(function (res) {
                U.allowPruneMembers = false;
                if (res && res.offline) {
                    setBadge("Salvo neste navegador");
                } else {
                    setBadge("Salvo no Supabase");
                }
            }).catch(function (e) {
                var c = String((e && (e.code || e.name || e.message)) || e);
                if (/not_writer|not_granted/.test(c)) {
                    U.readonly = true;
                    var ro = $("#ro"); if (ro) ro.classList.add("show");
                    setBadge("Salvo só neste navegador");
                } else if (/42501|row-level security/i.test(c)) {
                    setBadge("Erro RLS no Supabase");
                    toast("Sem permissão de escrita no banco (RLS).");
                } else {
                    setBadge("Salvo neste navegador");
                }
            });
        } else {
            setBadge("Salvo neste navegador");
        }
    }
    function saveUI() { try { sessionStorage.setItem("dx_ui", JSON.stringify({ dept: U.dept, person: U.person, lateOnly: U.lateOnly, openTask: U.openTask, q: U.q })); } catch (e) { } }
    function commit() { scheduleSave(); saveUI(); renderAll(); }

    function syncFromRemote() {
        var currentApi = window.dxApi || api;
        if (!currentApi || typeof currentApi.load !== "function") return Promise.resolve(false);
        return currentApi.load().then(function (remote) {
            if (!remote) return false;
            var prevMm = (S && S.mm) || { d: {}, t: {} };
            if (!remote.board) remote.board = S.board;
            remote.mm = prevMm;
            normalizeState(remote);
            S = remote;
            localSave();
            return true;
        });
    }

    /* ============================================================
       SHELL
       ============================================================ */
    function shell() {
        var me = mem(U.me);
        var isGer = U.tipo === "gerente";
        $("#root").innerHTML =
            '<div class="app" id="appShell"><aside class="side" aria-label="Navegação">' +
            '<div class="ws"><div class="ws-mark">D</div><div><div class="ws-name">Dismax</div><div class="ws-sub">Trade Marketing & B.I</div></div></div>' +
            '<div><div class="s-search">' + ic("search", 15) + '<input type="search" id="sideSearch" placeholder="Pesquisar tarefas" value="' + esc(U.q) + '" aria-label="Pesquisar tarefas" autocomplete="off"></div><div id="sideRes"></div></div>' +
            '<div><div class="side-h">Visualizações</div><nav class="side-nav" id="sideViews"></nav></div>' +
            '<div><div class="side-h">Departamentos' + (isGer ? '<button data-act="add-group" title="Novo departamento" aria-label="Novo departamento">' + ic("plus", 14) + '</button>' : '') + '</div><nav class="side-nav" id="sideDepts"></nav></div>' +
            '<div class="side-foot" id="sideFoot"></div>' +
            '</aside><div class="main">' +
            '<header class="head"><div class="head-row"><input class="board-title" id="boardName" data-bind="board:name" value="' + esc(S.board.name) + '"' + (isGer ? '' : ' readonly') + ' aria-label="Nome do quadro"><span class="avatars-stack" id="headAv"></span></div>' +
            '<p class="board-desc">' + esc(S.board.desc) + '</p>' +
            '<div class="tab-row"><nav class="tabs" id="tabs"></nav><div class="tools">' +
            '<span class="user-area" title="' + esc(me ? me.name : "") + '">' +
            av(me, 24) +
            '<span class="user-name">' + esc(me ? first(me.name) : "") + '</span>' +
            '<span class="badge-role ' + (isGer ? "gerente" : "") + '">' + (isGer ? "Gerente" : "Analista") + '</span>' +
            '<button class="icon-btn" data-act="logout" title="Sair" aria-label="Sair">' + ic("x", 14) + '</button>' +
            '</span>' +
            '<span class="badge-save" id="saveBadge">Salvo</span>' +
            '<div class="seg" role="group" aria-label="Aparência" id="modeSeg"></div>' +
            '<button class="icon-btn" data-act="fullscreen" id="fsBtn" title="Tela cheia" aria-label="Tela cheia"></button></div></div></header>' +
            '<div class="ro" id="ro">Você está com acesso de leitura: suas alterações ficam salvas só neste navegador.</div>' +
            '<div class="toolbar" id="toolbar"></div><div class="content" id="content"></div>' +
            '</div></div>' +
            '<div class="scrim" id="scrim" data-act="drawer-close"></div><aside class="drawer" id="drawer" aria-label="Detalhes da tarefa"></aside>' +
            '<div class="pop" id="pop"></div><div class="toast" id="toast" role="status"></div>';
    }

    /* ============================================================
       FILTROS / VISIBILIDADE
       ============================================================ */
    function scoped() {
        return S.tasks.filter(function (t) {
            if (U.dept && t.groupId !== U.dept) return false;
            if (U.tipo === "analista") {
                var isCreator = t.creator === U.me;
                var isOwner = ownersOf(t).indexOf(U.me) >= 0;
                if (!isCreator && !isOwner) return false;
            }
            return true;
        });
    }
    function filtered() {
        var q = U.q.trim().toLowerCase();
        return scoped().filter(function (t) {
            if (q) {
                var matchTitle = t.title.toLowerCase().indexOf(q) >= 0;
                var matchOwner = ownersOf(t).some(function (id) {
                    var m = mem(id); return m && m.name.toLowerCase().indexOf(q) >= 0;
                });
                if (!matchTitle && !matchOwner) return false;
            }
            if (U.person && ownersOf(t).indexOf(U.person) < 0) return false;
            if (U.lateOnly && !isLate(t)) return false;
            return true;
        });
    }

    /* ============================================================
       RENDER: BUSCA NA SIDEBAR
       ============================================================ */
    function renderSearch() {
        var box = $("#sideRes"); if (!box) return;
        var q = U.q.trim().toLowerCase();
        var g = U.dept && grp(U.dept);
        if (!q) { box.innerHTML = g ? '<div class="s-scope">Pesquisando em <b>' + esc(g.name) + '</b></div>' : ""; return; }
        var base = scoped();
        var res = base.filter(function (t) {
            return t.title.toLowerCase().indexOf(q) >= 0 ||
                ownersOf(t).some(function (id) { var m = mem(id); return m && m.name.toLowerCase().indexOf(q) >= 0; }) ||
                (t.desc || "").toLowerCase().indexOf(q) >= 0;
        });
        box.innerHTML = '<div class="s-scope">' + res.length + ' resultado' + (res.length === 1 ? "" : "s") + (g ? ' em <b>' + esc(g.name) + '</b>' : ' em todos os departamentos') + '</div>' +
            (res.length ? '<div class="s-res">' + res.slice(0, 8).map(function (t) { var ms = ownersOf(t).map(mem).filter(Boolean), gg = grp(t.groupId) || {}; return '<button data-act="open" data-id="' + t.id + '"><span class="sd" style="background:' + st(t.status).c + '"></span><span style="min-width:0"><span class="rt">' + esc(t.title) + '</span><span class="rm">' + esc(ms.length ? ms.map(function (m) { return first(m.name); }).join(", ") : "Sem responsável") + ' · ' + fmt(t.due) + (isLate(t) ? ' <span class="tag late">atrasada</span>' : "") + (U.dept ? "" : ' · ' + esc(gg.name || "")) + '</span></span></button>'; }).join("") + (res.length > 8 ? '<div class="s-empty">Mais ' + (res.length - 8) + ' na tabela ao lado.</div>' : "") + '</div>' : '<div class="s-empty">Nenhuma tarefa encontrada.</div>');
    }

    /* ============================================================
       RENDER: NAV
       ============================================================ */
    var FS = false;
    function isFs() { return !!(document.fullscreenElement || document.webkitFullscreenElement) || FS; }
    function renderNav() {
        var visible = filtered();
        var late = visible.filter(isLate).length;
        $("#tabs").innerHTML = VIEWS.map(function (v) { return '<button class="' + (U.view === v.k ? "on" : "") + '" data-act="view" data-v="' + v.k + '">' + ic(VIEW_ICONS[v.k], 17) + esc(v.l) + (v.k === "painel" && late ? '<span class="g-late">' + late + '</span>' : "") + '</button>'; }).join("");
        $("#headAv").innerHTML = S.members.slice(0, 6).map(function (m) { return av(m, 30); }).join("") + (S.members.length > 6 ? '<span class="av" style="width:30px;height:30px;font-size:11px;background:var(--muted)">+' + (S.members.length - 6) + '</span>' : "");
        var rPend = routinesOn(isoToday()).filter(function (r) { return !r.done[isoToday()]; }).length;
        $("#sideViews").innerHTML = VIEWS.map(function (v) { return '<button class="' + (U.view === v.k ? "on" : "") + '" data-act="view" data-v="' + v.k + '">' + ic(VIEW_ICONS[v.k], 17) + '<span class="lbl">' + esc(v.l) + '</span>' + (v.k === "painel" && late ? '<span class="cnt">' + late + '</span>' : "") + (v.k === "rotinas" && rPend ? '<span class="n">' + rPend + ' pend.</span>' : "") + '</button>'; }).join("");
        var openFn = function (gid) { return visible.filter(function (t) { return t.status !== "feito" && (!gid || t.groupId === gid); }); };
        $("#sideDepts").innerHTML = '<button class="' + (!U.dept ? "on" : "") + '" data-act="dept" data-id="">' + ic("table", 16) + '<span class="lbl">Todos os departamentos</span><span class="n">' + openFn().length + '</span></button>' +
            S.groups.map(function (g) { var o = openFn(g.id), l = o.filter(isLate).length; return '<button class="' + (U.dept === g.id ? "on" : "") + '" data-act="dept" data-id="' + g.id + '" title="' + esc(g.name) + '"><span class="dot" style="background:' + g.color + '"></span><span class="lbl">' + esc(g.name) + '</span>' + (l ? '<span class="cnt" title="Em atraso">' + l + '</span>' : "") + '<span class="n">' + o.length + '</span></button>'; }).join("");
        $("#sideFoot").innerHTML = S.members.length + " pessoas · " + openFn().length + " tarefas abertas";
        renderSearch();
        var m = effMode();
        $("#modeSeg").innerHTML = '<button class="' + (m === "light" ? "on" : "") + '" data-act="mode" data-v="light" aria-pressed="' + (m === "light") + '">' + ic("sun", 14) + 'Clean</button><button class="' + (m === "dark" ? "on" : "") + '" data-act="mode" data-v="dark" aria-pressed="' + (m === "dark") + '">' + ic("moon", 14) + 'Dark</button>';
        var fs = isFs();
        $("#appShell").classList.toggle("fs", fs);
        $("#fsBtn").innerHTML = ic(fs ? "shrink" : "expand", 16);
        $("#fsBtn").title = fs ? "Sair da tela cheia" : "Tela cheia";
        $("#fsBtn").setAttribute("aria-label", $("#fsBtn").title);
    }

    /* ============================================================
       RENDER: TOOLBAR
       ============================================================ */
    function renderToolbar() {
        var tb = $("#toolbar");
        if (U.view !== "tabela" && U.view !== "kanban" && U.view !== "mapa") { tb.innerHTML = ""; tb.style.display = "none"; return; }
        tb.style.display = "";
        var people = '<div class="pfilter" role="group" aria-label="Filtrar por responsável">' + S.members.map(function (m) { return '<button class="' + (U.person === m.id ? "on" : "") + '" data-act="person" data-id="' + m.id + '" aria-pressed="' + (U.person === m.id) + '">' + av(m, 28) + '</button>'; }).join("") + '</div>';
        var late = scoped().filter(isLate).length;
        var g = U.dept && grp(U.dept);
        tb.innerHTML = '<button class="btn primary" data-act="new-task">' + ic("plus", 15) + 'Nova tarefa</button>' +
            (g ? '<button class="chip dept-chip" data-act="dept" data-id="" title="Mostrar todos os departamentos"><span class="dot" style="background:' + g.color + '"></span>' + esc(g.name) + ' ' + ic("x", 13) + '</button>' : "") +
            (U.q ? '<button class="chip dept-chip" data-act="clear-q">Busca: "' + esc(U.q) + '" ' + ic("x", 13) + '</button>' : "") + people +
            '<button class="chip ' + (U.lateOnly ? "on" : "") + '" data-act="late-only">' + ic("alert", 14) + 'Atrasadas (' + late + ')</button>' +
            ((U.person || U.lateOnly || U.q || U.dept) ? '<button class="chip" data-act="clear">Limpar filtros</button>' : "");
    }

    /* ============================================================
       RENDER: TABELA
       ============================================================ */
    function battery(list) {
        if (!list.length) return '<div class="battery"></div>';
        return '<div class="battery" title="Distribuição de status">' + STATUS.map(function (s) { var n = list.filter(function (t) { return t.status === s.k; }).length; return n ? '<i style="width:' + (100 * n / list.length) + '%;background:' + s.c + '" title="' + s.l + ': ' + n + '"></i>' : ""; }).join("") + '</div>';
    }
    function ownersCell(t) {
        var owners = ownersOf(t).map(mem).filter(Boolean);
        if (!owners.length) return av(null, 36);
        if (owners.length === 1) return av(owners[0], 36);
        return '<span class="owner-stack">' + owners.slice(0, 3).map(function (m) { return av(m, 28); }).join("") + (owners.length > 3 ? '<span class="av-plus">+' + (owners.length - 3) + '</span>' : "") + '</span>';
    }
    function rowHTML(t, g) {
        var s = st(t.status), late = isLate(t), tl = timeline(t), d = dd(t.due), pg = progress(t);
        var dueCls = late ? "late" : (t.due ? "" : "nodue");
        var dueTxt = t.due ? fmt(t.due) : "Definir";
        var extra = late ? '<span class="tag late">' + (-d) + 'd</span>' : (t.status !== "feito" && d === 0 ? '<span class="tag today">hoje</span>' : "");
        var owners = ownersOf(t).map(mem).filter(Boolean);
        var ownersTitle = owners.map(function (m) { return m.name; }).join(", ") || "Atribuir responsáveis";
        return '<div class="grid row" data-id="' + t.id + '" style="--gc:' + g.color + '">' +
            '<div class="c title"><input class="t-in" data-bind="task:' + t.id + ':title" value="' + esc(t.title) + '" aria-label="Título da tarefa">' +
            (t.updates && t.updates.length ? '<span class="upd" title="Atualizações">' + ic("chat", 14) + t.updates.length + '</span>' : "") +
            '<button class="open-btn" data-act="open" data-id="' + t.id + '">' + ic("open", 12) + 'Abrir</button></div>' +
            '<div class="c owner" data-act="pick-owner" data-id="' + t.id + '" role="button" tabindex="0" title="' + esc(ownersTitle) + '">' + ownersCell(t) + '</div>' +
            '<div class="c fill" style="--fillc:' + s.c + '" data-act="pick-status" data-id="' + t.id + '" role="button" tabindex="0">' + s.l + '</div>' +
            '<div class="c">' + (tl ? '<div class="tl" title="' + fmt(tl.s) + ' – ' + fmt(t.due) + ' · ' + Math.round(tl.f * 100) + '% do prazo · ' + pg + '% concluído"><i style="width:' + Math.round(tl.f * 100) + '%"></i><span>' + fmt(tl.s) + ' – ' + fmt(t.due) + '</span></div>' : '<div class="tl none" title="Sem prazo"></div>') + '</div>' +
            '<div class="c"><button class="due-btn ' + dueCls + '" data-act="pick-due" data-id="' + t.id + '">' + (late ? ic("alert", 15) : "") + dueTxt + extra + '</button></div>' +
            '<div class="c">' + stars(t) + '</div>' +
            '</div>';
    }
    function renderTable() {
        var list = filtered(), out = '<div class="tbl-wrap">';
        var isGer = U.tipo === "gerente";
        S.groups.forEach(function (g) {
            var ts = list.filter(function (t) { return t.groupId === g.id; });
            if (U.dept && g.id !== U.dept) return;
            if ((U.person || U.lateOnly || U.q) && !ts.length) return;
            var lateN = ts.filter(isLate).length;
            out += '<section class="group" style="--gc:' + g.color + '"><div class="grid ghead"><div class="gtitle">' +
                '<button class="g-toggle" data-act="toggle-group" data-id="' + g.id + '" aria-label="' + (g.collapsed ? "Expandir" : "Recolher") + '" style="color:' + g.color + '">' + ic(g.collapsed ? "chevr" : "chev", 18) + '</button>' +
                '<input class="g-name" data-bind="group:' + g.id + ':name" value="' + esc(g.name) + '" style="color:' + g.color + '"' + (isGer ? '' : ' readonly') + ' aria-label="Nome do departamento">' +
                (lateN ? '<span class="g-late">' + lateN + ' em atraso</span>' : "") + '</div>' +
                (g.collapsed ? '<div class="col-h" style="grid-column:2/-1;text-align:left;color:var(--muted);font-size:13px">' + ts.length + ' tarefas</div>' : '<div class="col-h">Resp.</div><div class="col-h">Status</div><div class="col-h">Timeline</div><div class="col-h">Prazo</div><div class="col-h">Prioridade</div>') + '</div>';
            if (!g.collapsed) {
                out += ts.map(function (t) { return rowHTML(t, g); }).join("");
                out += '<div class="grid row add-row"><div class="c title"><input class="add-in" data-addrow="' + g.id + '" placeholder="+ Adicionar tarefa" aria-label="Adicionar tarefa em ' + esc(g.name) + '"></div></div>';
                out += '<div class="grid sum-row"><div class="c"></div><div class="c"></div><div class="c">' + battery(ts) + '</div><div class="c"></div><div class="c sum-txt">' + (lateN ? '<span style="color:var(--crit);font-weight:600">' + lateN + ' em atraso</span>' : "Sem atrasos") + '</div><div class="c"></div></div>';
            }
            out += '</section>';
        });
        out += '</div>';
        if (!S.groups.length) out += '<div class="empty">Nenhum departamento cadastrado.' + (isGer ? ' Comece adicionando um departamento abaixo.' : '') + '</div>';
        else if (!list.length) out += '<div class="empty">' + (U.tipo === "analista" ? "Você ainda não tem tarefas designadas ou criadas." : "Nenhuma tarefa com esses filtros.") + '</div>';
        if (isGer) out += '<button class="btn add-group" data-act="add-group">' + ic("plus", 15) + 'Adicionar departamento</button>';
        $("#content").innerHTML = out;
    }

    /* ============================================================
       RENDER: ROTINAS
       ============================================================ */
    function rApplies(r, iso) { if (r.since && iso < r.since) return false; var d = pd(iso), wd = d.getDay(); if (r.freq === "todos") return true; if (r.freq === "uteis") return wd >= 1 && wd <= 5; if (r.freq === "semanal") return (r.days || []).indexOf(wd) >= 0; if (r.freq === "mensal") { var last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate(); return d.getDate() === Math.min(+r.dom || 1, last); } return false; }
    function routinesOn(iso) {
        return S.routines.filter(function (r) {
            if (U.dept && r.groupId !== U.dept) return false;
            if (!rApplies(r, iso)) return false;
            if (U.tipo === "analista" && r.creator !== U.me && r.owner !== U.me) return false;
            return true;
        });
    }
    function freqLabel(r) { if (r.freq === "uteis") return "Diária · seg a sex"; if (r.freq === "todos") return "Diária · todos os dias"; if (r.freq === "semanal") return "Semanal · " + ((r.days || []).slice().sort().map(function (i) { return WD[i]; }).join(", ") || "sem dia"); return "Mensal · dia " + (r.dom || 1); }
    function rStats(r, days) { var ok = 0, n = 0, d = today0(); for (var i = 1; i <= days; i++) { d.setDate(d.getDate() - 1); var iso = isoOf(d); if (rApplies(r, iso)) { n++; if (r.done[iso]) ok++; } } return { ok: ok, n: n, p: n ? Math.round(100 * ok / n) : null }; }
    function rLate(r, iso) { if (iso !== isoToday() || r.done[iso]) return false; var now = new Date(); var hm = String(now.getHours()).padStart(2, "0") + ":" + String(now.getMinutes()).padStart(2, "0"); return !!r.time && hm > r.time; }
    function rSquares(r) { var h = '<div class="sqs">', d = today0(); d.setDate(d.getDate() - 6); for (var i = 0; i < 7; i++) { var iso = isoOf(d), cls = "sq"; if (rApplies(r, iso)) { if (r.done[iso]) cls += " ok"; else if (iso < isoToday()) cls += " miss"; } if (iso === isoToday()) cls += " today"; h += '<span class="' + cls + '" title="' + WD[d.getDay()] + " " + fmt(iso) + (rApplies(r, iso) ? (r.done[iso] ? ": feita" : (iso < isoToday() ? ": não feita" : ": pendente")) : ": não se aplica") + '"></span>'; d.setDate(d.getDate() + 1); } return h + '</div>'; }
    function rForm(r) {
        var e = r || { title: "", owner: U.me, groupId: U.dept || (S.groups[0] || {}).id, freq: "uteis", days: [1], dom: 1, time: "09:00" };
        var ownerOpts = S.members.map(function (m) { return '<option value="' + m.id + '"' + (m.id === e.owner ? " selected" : "") + '>' + esc(m.name) + '</option>'; }).join("");
        if (e.owner && !S.members.some(function (m) { return m.id === e.owner; })) ownerOpts = '<option value="' + e.owner + '" selected>(removido)</option>' + ownerOpts;
        return '<form class="card" id="rForm" data-id="' + (r ? r.id : "") + '" style="margin-bottom:16px"><h3 style="margin-bottom:12px">' + (r ? "Editar rotina" : "Nova rotina") + '</h3><div class="r-form">' +
            '<div class="fld"><label for="rTitle">Rotina</label><input id="rTitle" required value="' + esc(e.title) + '" placeholder="Ex.: Atualizar base de vendas"></div>' +
            '<div class="fld"><label for="rOwner">Responsável</label><select id="rOwner">' + ownerOpts + '</select></div>' +
            '<div class="fld"><label for="rGroup">Departamento</label><select id="rGroup">' + S.groups.map(function (g) { return '<option value="' + g.id + '"' + (g.id === e.groupId ? " selected" : "") + '>' + esc(g.name) + '</option>'; }).join("") + '</select></div>' +
            '<div class="fld"><label for="rFreq">Frequência</label><select id="rFreq"><option value="uteis"' + (e.freq === "uteis" ? " selected" : "") + '>Diária (seg a sex)</option><option value="todos"' + (e.freq === "todos" ? " selected" : "") + '>Diária (todos os dias)</option><option value="semanal"' + (e.freq === "semanal" ? " selected" : "") + '>Semanal</option><option value="mensal"' + (e.freq === "mensal" ? " selected" : "") + '>Mensal</option></select></div>' +
            '<div class="fld"><label for="rTime">Horário</label><input id="rTime" type="time" value="' + esc(e.time) + '"></div>' +
            '<div class="fld" id="rDaysF" style="grid-column:1/3;' + (e.freq === "semanal" ? "" : "display:none") + '"><label>Dias da semana</label><div class="wd">' + [1, 2, 3, 4, 5, 6, 0].map(function (i) { return '<label><input type="checkbox" name="rDay" value="' + i + '"' + ((e.days || []).indexOf(i) >= 0 ? " checked" : "") + '><span>' + WD[i].charAt(0).toUpperCase() + WD[i].slice(1, 3) + '</span></label>'; }).join("") + '</div></div>' +
            '<div class="fld" id="rDomF" style="' + (e.freq === "mensal" ? "" : "display:none") + '"><label for="rDom">Dia do mês</label><input id="rDom" type="number" min="1" max="31" value="' + (e.dom || 1) + '"></div>' +
            '</div><div style="display:flex;gap:8px;margin-top:12px"><button class="btn primary" type="submit">' + (r ? "Salvar alterações" : "Criar rotina") + '</button><button class="btn" type="button" data-act="r-cancel">Cancelar</button></div></form>';
    }
    function rPendText() {
        var iso = isoToday(), list = routinesOn(iso).filter(function (r) { return !r.done[iso]; }), by = {};
        list.forEach(function (r) { (by[r.owner] = by[r.owner] || []).push(r); });
        var t = "*Rotinas pendentes – " + fmtBR(iso) + "*\n";
        if (!list.length) return t + "\nTodas as rotinas de hoje foram concluídas.";
        Object.keys(by).forEach(function (k) { var m = mem(k); t += "\n*" + (m ? m.name : "Sem responsável") + "*\n"; by[k].sort(function (a, b) { return a.time < b.time ? -1 : 1; }).forEach(function (r) { t += "• " + r.time + " – " + r.title + (rLate(r, iso) ? " (atrasada)" : "") + "\n"; }); });
        return t + "\nFavor concluir e marcar no quadro.";
    }
    function renderRotinas() {
        var iso = U.rday || isoToday(), d = pd(iso), isToday = iso === isoToday(), future = iso > isoToday();
        var list = routinesOn(iso).sort(function (a, b) { return (a.time || "") < (b.time || "") ? -1 : 1; });
        var done = list.filter(function (r) { return r.done[iso]; }).length, late = list.filter(function (r) { return rLate(r, iso); }).length;
        var g = U.dept && grp(U.dept);
        var html = '<div class="r-top"><div class="r-nav"><button class="icon-btn" data-act="r-day" data-v="-1" aria-label="Dia anterior">' + ic("chevr", 16).replace('d="M9 6l6 6-6 6"', 'd="M15 6l-6 6 6 6"') + '</button><button class="icon-btn" data-act="r-day" data-v="1" aria-label="Próximo dia">' + ic("chevr", 16) + '</button></div>' +
            '<div class="r-date">' + WDL[d.getDay()] + ', ' + d.getDate() + ' de ' + MESL[d.getMonth()] + '</div>' + (isToday ? "" : '<button class="chip" data-act="r-day" data-v="0">Voltar para hoje</button>') +
            (g ? '<button class="chip dept-chip" data-act="dept" data-id=""><span class="dot" style="background:' + g.color + '"></span>' + esc(g.name) + ' ' + ic("x", 13) + '</button>' : "") +
            '<span style="flex:1"></span><button class="btn" data-act="copy-rot">' + ic("copy", 14) + 'Copiar pendências de hoje</button><button class="btn primary" data-act="r-new">' + ic("plus", 15) + 'Nova rotina</button></div>';
        if (U.editR === "new") html += rForm(null);
        html += '<div class="r-sum"><span class="big">' + done + '/' + list.length + '</span><span>rotinas concluídas ' + (isToday ? "hoje" : "no dia") + '</span><div class="r-bar"><i style="width:' + (list.length ? 100 * done / list.length : 0) + '%"></i></div>' + (late ? '<span class="tag late">' + late + ' atrasada' + (late > 1 ? "s" : "") + '</span>' : "") + (future ? '<span class="tag none">Dia futuro: marcação liberada no dia</span>' : "") + '</div>';
        if (!list.length) html += '<div class="empty">Nenhuma rotina programada para este dia' + (g ? " neste departamento" : "") + '.</div>';
        else {
            html += '<div class="r-wrap"><div class="r-grid r-h"><div class="c">Feito</div><div class="c">Horário</div><div class="c" style="justify-content:flex-start">Rotina</div><div class="c">Resp.</div><div class="c">Frequência</div><div class="c">Últimos 7 dias</div><div class="c">30 dias</div><div class="c"></div></div>';
            list.forEach(function (r) {
                var gg = grp(r.groupId) || { color: "#c4c4c4", name: "" }, m = mem(r.owner), stt = rStats(r, 30), ok = !!r.done[iso];
                if (U.editR === r.id) { html += '</div>' + rForm(r) + '<div class="r-wrap">'; return; }
                html += '<div class="r-grid r-row' + (ok ? " done" : "") + '" style="--gc:' + gg.color + '">' +
                    '<div class="c"><button class="chk' + (ok ? " on" : "") + '" data-act="r-check" data-id="' + r.id + '"' + (future ? " disabled" : "") + ' aria-pressed="' + ok + '" aria-label="Marcar como feita">' + (ok ? ic("check", 16) : "") + '</button></div>' +
                    '<div class="c r-time">' + esc(r.time || "—") + '</div>' +
                    '<div class="c title" title="' + esc(gg.name) + '"><span class="r-t">' + esc(r.title) + '</span>' + (rLate(r, iso) ? '<span class="tag late">Atrasada</span>' : "") + '</div>' +
                    '<div class="c" title="' + esc(m ? m.name : "") + '">' + av(m, 32) + '</div>' +
                    '<div class="c r-freq">' + freqLabel(r) + '</div>' +
                    '<div class="c">' + rSquares(r) + '</div>' +
                    '<div class="c r-pct" style="color:' + (stt.p === null ? "var(--muted)" : stt.p >= 90 ? "var(--ok)" : stt.p >= 70 ? "var(--warn)" : "var(--crit)") + '" title="' + stt.ok + ' de ' + stt.n + ' nos últimos 30 dias">' + (stt.p === null ? "—" : stt.p + "%") + '</div>' +
                    '<div class="c r-acts"><button class="sub-del" data-act="r-edit" data-id="' + r.id + '">Editar</button><button class="sub-del" data-act="r-del" data-id="' + r.id + '">Excluir</button></div></div>';
            });
            html += '</div>';
        }
        html += '<p style="color:var(--muted);font-size:13px;margin-top:14px">Verde: feita · Vermelho: não feita · Cinza: não se aplica. A aderência considera os últimos 30 dias, sem contar hoje.</p>';
        $("#content").innerHTML = html;
    }

    /* ============================================================
       RENDER: KANBAN + DRAG & DROP
       ============================================================ */
    var kDragId = null;
    function renderKanban() {
        var list = filtered();
        $("#content").innerHTML = '<div class="kanban">' + STATUS.map(function (s) {
            var ts = list.filter(function (t) { return t.status === s.k; }).sort(function (a, b) { return (a.due || "9999") < (b.due || "9999") ? -1 : 1; });
            return '<div class="kcol" data-col="' + s.k + '"><div class="kcol-h" style="background:' + s.c + '"><span>' + s.l + '</span><span>' + ts.length + '</span></div><div class="kcol-b">' +
                ts.map(function (t) {
                    var g = grp(t.groupId) || { color: "#c4c4c4", name: "" }, p = pr(t.priority), sd = (t.subtasks || []).filter(function (x) { return x.d; }).length;
                    var owners = ownersOf(t).map(mem).filter(Boolean);
                    var ownersHtml = owners.length ? owners.slice(0, 2).map(function (m) { return av(m, 22); }).join("") + (owners.length > 2 ? '<span class="av-plus" style="width:22px;height:22px;font-size:9px">+' + (owners.length - 2) + '</span>' : "") : av(null, 26);
                    return '<div class="kcard' + (isLate(t) ? " late-card" : "") + '" style="--gc:' + g.color + '" draggable="true" data-drag="' + t.id + '" data-act="open" data-id="' + t.id + '" tabindex="0"><div class="kc-top"><span>' + esc(g.name) + '</span><span class="pill" style="background:' + p.c + '">' + p.l + '</span></div><div class="kc-title">' + esc(t.title) + '</div><div class="kc-meta"><span>' + ic("flag", 13) + fmt(t.due) + '</span>' + dueTag(t) + (t.subtasks.length ? '<span>' + ic("check", 13) + ' ' + sd + '/' + t.subtasks.length + '</span>' : "") + (t.updates.length ? '<span>' + ic("chat", 13) + ' ' + t.updates.length + '</span>' : "") + '<span class="kc-avs">' + ownersHtml + '</span></div></div>';
                }).join("") +
                '<button class="kadd" data-act="new-task" data-status="' + s.k + '">' + ic("plus", 14) + ' Adicionar</button></div></div>';
        }).join("") + '</div>';
    }

    document.addEventListener("dragstart", function (e) {
        var card = e.target.closest && e.target.closest("[data-drag]");
        if (!card) return;
        kDragId = card.dataset.drag;
        card.classList.add("dragging");
        if (e.dataTransfer) {
            e.dataTransfer.effectAllowed = "move";
            e.dataTransfer.setData("text/plain", kDragId);
        }
    });
    document.addEventListener("dragover", function (e) {
        var col = e.target.closest && e.target.closest(".kcol[data-col]");
        if (!col || !kDragId) return;
        e.preventDefault();
        document.querySelectorAll(".kcol.over").forEach(function (c) { if (c !== col) c.classList.remove("over"); });
        col.classList.add("over");
    });
    document.addEventListener("dragleave", function (e) {
        var col = e.target.closest && e.target.closest(".kcol[data-col]");
        if (col && (!e.relatedTarget || !col.contains(e.relatedTarget))) col.classList.remove("over");
    });
    document.addEventListener("drop", function (e) {
        var col = e.target.closest && e.target.closest(".kcol[data-col]");
        document.querySelectorAll(".kcol.over").forEach(function (c) { c.classList.remove("over"); });
        if (!col || !kDragId) return;
        e.preventDefault();
        var t = task(kDragId);
        var newSt = col.dataset.col;
        kDragId = null;
        if (t && t.status !== newSt) {
            t.status = newSt;
            t.doneAt = (newSt === "feito") ? isoToday() : "";
            commit();
        }
    });
    document.addEventListener("dragend", function () {
        kDragId = null;
        document.querySelectorAll(".kcard.dragging").forEach(function (c) { c.classList.remove("dragging"); });
        document.querySelectorAll(".kcol.over").forEach(function (c) { c.classList.remove("over"); });
    });

    /* ============================================================
       RENDER: MAPA MENTAL
       ============================================================ */
    var MM = null, mmSuppress = false, mmDrag = null;
    var MMC = { NW: 200, NH: 64, GAP: 12, R: 74, OFF: 64, ARC: 34 };
    function mmColor(t) { return t.status === "feito" ? "green" : (t.status === "nao" ? "red" : "yellow"); }
    function mmLayout(list, groups) {
        var C = MMC, ord = ["nao", "andamento", "aguardando", "travado", "feito"];
        var cl = groups.map(function (g) {
            var ts = list.filter(function (t) { return t.groupId === g.id; }).sort(function (a, b) { return ord.indexOf(a.status) - ord.indexOf(b.status); });
            var R0 = ts.filter(function (_, i) { return i % 2 === 0; }), L0 = ts.filter(function (_, i) { return i % 2 === 1; }), rows = Math.max(R0.length, L0.length);
            var h = Math.max(2 * C.R + 70, rows * (C.NH + C.GAP) - C.GAP + 30), w = 2 * (C.R + C.OFF + C.ARC + C.NW) + 40, def = {};
            [[R0, 1], [L0, -1]].forEach(function (p) { var arr = p[0], side = p[1], colH = arr.length * (C.NH + C.GAP) - C.GAP; arr.forEach(function (t, i) { var rel = arr.length > 1 ? (i / (arr.length - 1)) * 2 - 1 : 0, off = C.OFF + C.ARC * (1 - rel * rel); def[t.id] = { dx: side * (C.R + off + C.NW / 2), dy: -colH / 2 + i * (C.NH + C.GAP) + C.NH / 2 }; }); });
            return { g: g, ts: ts, w: w, h: h, def: def };
        });
        var cols = cl.length <= 1 ? 1 : (cl.length <= 4 ? 2 : 3), x = 0, y = 0, rowH = 0;
        cl.forEach(function (c, i) {
            if (i && i % cols === 0) { x = 0; y += rowH + 60; rowH = 0; }
            var sv = S.mm.d[c.g.id]; c.cx = sv ? sv.x : x + c.w / 2; c.cy = sv ? sv.y : y + c.h / 2;
            x += c.w + 40; rowH = Math.max(rowH, c.h);
            c.nodes = c.ts.map(function (t) { var o = S.mm.t[t.id]; if (!o || o.g !== c.g.id) o = c.def[t.id]; return { t: t, dx: o.dx, dy: o.dy }; });
        });
        return cl;
    }
    function mmBounds(cl) {
        var C = MMC, a = 1e9, b = 1e9, c2 = -1e9, d = -1e9;
        cl.forEach(function (c) {
            a = Math.min(a, c.cx - C.R - 20); c2 = Math.max(c2, c.cx + C.R + 20); b = Math.min(b, c.cy - C.R - 10); d = Math.max(d, c.cy + C.R + 44);
            c.nodes.forEach(function (n) { var x = c.cx + n.dx, y = c.cy + n.dy; a = Math.min(a, x - C.NW / 2); c2 = Math.max(c2, x + C.NW / 2); b = Math.min(b, y - C.NH / 2); d = Math.max(d, y + C.NH / 2); });
        });
        return { x: a - 40, y: b - 40, w: c2 - a + 80, h: d - b + 80 };
    }
    function mmPath(c, n) {
        var C = MMC, nx = c.cx + n.dx, ny = c.cy + n.dy, dx = n.dx, dy = n.dy, L = Math.max(1, Math.hypot(dx, dy)), sx = c.cx + C.R * dx / L, sy = c.cy + C.R * dy / L, ex, ey;
        if (Math.abs(dx) >= Math.abs(dy) * 1.1) { ex = nx - Math.sign(dx) * C.NW / 2; ey = ny; var mx = (sx + ex) / 2; return "M" + sx.toFixed(1) + " " + sy.toFixed(1) + " C" + mx.toFixed(1) + " " + sy.toFixed(1) + " " + mx.toFixed(1) + " " + ey.toFixed(1) + " " + ex.toFixed(1) + " " + ey.toFixed(1); }
        ex = nx; ey = ny - Math.sign(dy || 1) * C.NH / 2; var my = (sy + ey) / 2; return "M" + sx.toFixed(1) + " " + sy.toFixed(1) + " C" + sx.toFixed(1) + " " + my.toFixed(1) + " " + ex.toFixed(1) + " " + my.toFixed(1) + " " + ex.toFixed(1) + " " + ey.toFixed(1);
    }
    function mmLinks() { if (!MM) return; var sv = $("#mmSvg"); if (!sv) return; var o = MM.o, h = ""; MM.cl.forEach(function (c) { c.nodes.forEach(function (n) { var col = { red: "#e2445c", yellow: "#ffcb00", green: "#00c875" }[mmColor(n.t)]; h += '<path transform="translate(' + (-o.x) + ' ' + (-o.y) + ')" d="' + mmPath(c, n) + '" fill="none" stroke="' + col + '" stroke-width="3" stroke-linecap="round" opacity=".85"/>'; }); }); sv.innerHTML = h; }
    function mmPlace() { var C = MMC, o = MM.o; MM.cl.forEach(function (c) { var dEl = document.querySelector('.mm-dept[data-id="' + c.g.id + '"]'); if (dEl) { dEl.style.left = (c.cx - C.R - o.x) + "px"; dEl.style.top = (c.cy - C.R - o.y) + "px"; } var aEl = document.querySelector('.mm-add[data-id="' + c.g.id + '"]'); if (aEl) { aEl.style.left = (c.cx - o.x) + "px"; aEl.style.top = (c.cy + C.R + 10 - o.y) + "px"; } c.nodes.forEach(function (n) { var el = document.querySelector('.mm-node[data-id="' + n.t.id + '"]'); if (el) { el.style.left = (c.cx + n.dx - C.NW / 2 - o.x) + "px"; el.style.top = (c.cy + n.dy - C.NH / 2 - o.y) + "px"; } }); }); mmLinks(); }
    function mmFit() {
        if (!MM) return;
        var wrap = $("#mmWrap"); if (!wrap) return;
        if (!U.mmFull) { var top = wrap.getBoundingClientRect().top; wrap.style.height = Math.max(360, window.innerHeight - top - 20) + "px"; } else wrap.style.height = "";
        var aw = Math.max(200, wrap.clientWidth - 20), ah = Math.max(200, wrap.clientHeight - 20), z = U.mmZoom || Math.min(1.15, aw / MM.o.w, ah / MM.o.h);
        MM.z = z;
        var sz = $("#mmSizer"); sz.style.width = Math.ceil(MM.o.w * z) + "px"; sz.style.height = Math.ceil(MM.o.h * z) + "px"; sz.style.marginTop = Math.max(0, (ah - MM.o.h * z) / 2) + "px";
        $("#mmCanvas").style.transform = "scale(" + z + ")";
        var zl = $("#mmZl"); if (zl) zl.textContent = Math.round(z * 100) + "%";
    }
    function renderMapa() {
        if (!S.mm) S.mm = { d: {}, t: {} };
        var C = MMC, all = filtered(), list = U.mmHideDone ? all.filter(function (t) { return t.status !== "feito"; }) : all;
        var cR = all.filter(function (t) { return mmColor(t) === "red"; }).length, cY = all.filter(function (t) { return mmColor(t) === "yellow"; }).length, cG = all.filter(function (t) { return mmColor(t) === "green"; }).length;
        var filt = U.q || U.person || U.lateOnly;
        var groups = S.groups.filter(function (g) { return (!U.dept || g.id === U.dept) && (!filt || list.some(function (t) { return t.groupId === g.id; })); });
        var cl = mmLayout(list, groups), o = cl.length ? mmBounds(cl) : { x: 0, y: 0, w: 600, h: 400 };
        MM = { cl: cl, o: o, z: 1 };
        var nodes = "";
        cl.forEach(function (c) {
            var g = c.g, allG = all.filter(function (t) { return t.groupId === g.id; }), doneAll = allG.filter(function (t) { return t.status === "feito"; }).length, pct = allG.length ? Math.round(100 * doneAll / allG.length) : 0;
            nodes += '<div class="mm-dept" data-mmdrag="d" data-id="' + g.id + '" tabindex="0" role="group" aria-label="' + esc(g.name) + '" style="width:' + (2 * C.R) + 'px;height:' + (2 * C.R) + 'px;background:conic-gradient(#00c875 ' + pct + '%,rgba(127,127,127,.25) 0)"><span class="mm-in" style="background:' + g.color + '"><b>' + esc(g.name) + '</b><small>' + allG.length + ' demanda' + (allG.length === 1 ? "" : "s") + '</small><small>' + pct + '% concluído</small></span></div>' +
                '<button class="mm-add" data-act="mm-new" data-id="' + g.id + '">+ Nova demanda</button>';
            c.nodes.forEach(function (n) {
                var t = n.t, owners = ownersOf(t).map(mem).filter(Boolean), d = dd(t.due), late = isLate(t);
                var ownersHtml = owners.length
                    ? owners.slice(0, 2).map(function (m) { return av(m, 18); }).join("") + '<span>' + esc(owners.length === 1 ? first(owners[0].name) : first(owners[0].name) + " +" + (owners.length - 1)) + '</span>'
                    : av(null, 18) + '<span>Sem resp.</span>';
                var chip = t.status === "travado" ? '<span class="mm-chip">Travado</span>' : (t.status === "aguardando" ? '<span class="mm-chip">Em aprovação</span>' : "");
                nodes += '<button class="mm-node ' + mmColor(t) + '" data-mmdrag="t" data-act="open" data-id="' + t.id + '" style="width:' + C.NW + 'px;height:' + C.NH + 'px" title="' + esc(t.title) + ' · ' + st(t.status).l + '"><span class="mm-t">' + esc(t.title) + '</span><span class="mm-m">' + ownersHtml + '<span>' + (t.due ? fmt(t.due) : "sem prazo") + '</span>' + (late ? '<span class="mm-late">' + (-d) + 'd atraso</span>' : "") + chip + '</span></button>';
            });
        });
        var custom = Object.keys(S.mm.d).length + Object.keys(S.mm.t).length;
        var html = '<div class="mm-stage' + (U.mmFull ? " full" : "") + '" id="mmStage"><div class="mm-bar">' +
            '<span class="mm-leg"><i style="background:#e2445c"></i>Não iniciado <b>' + cR + '</b></span><span class="mm-leg"><i style="background:#ffcb00"></i>Em andamento <b>' + cY + '</b></span><span class="mm-leg"><i style="background:#00c875"></i>Concluída <b>' + cG + '</b></span>' +
            '<button class="chip' + (U.mmHideDone ? " on-p" : "") + '" data-act="mm-done" aria-pressed="' + !!U.mmHideDone + '">' + (U.mmHideDone ? "Mostrar concluídas" : "Ocultar concluídas") + '</button>' +
            (U.tipo === "gerente" ? '<button class="chip" data-act="mm-addgroup">' + ic("plus", 13) + 'Departamento</button>' : '') +
            (custom ? '<button class="chip" data-act="mm-reset" title="Volta os balões para a organização automática">Reorganizar</button>' : "") +
            '<span class="mm-zoom"><button class="icon-btn" data-act="mm-zoom" data-v="-" aria-label="Diminuir zoom">−</button><span id="mmZl">100%</span><button class="icon-btn" data-act="mm-zoom" data-v="+" aria-label="Aumentar zoom">+</button>' +
            '<button class="chip" data-act="mm-zoom" data-v="fit">Ver tudo</button><button class="btn sm' + (U.mmFull ? "" : " primary") + '" data-act="mm-full">' + ic(U.mmFull ? "shrink" : "expand", 14) + (U.mmFull ? "Sair da tela cheia" : "Tela cheia") + '</button></span></div>' +
            '<p class="mm-hint">Arraste os balões para organizar; a posição fica salva para toda a equipe. Clique na demanda para abrir os detalhes.</p>';
        if (!cl.length) html += '<div class="empty">' + (U.tipo === "analista" ? "Você ainda não tem demandas." : "Nenhuma demanda com esses filtros.") + '</div></div>';
        else html += '<div class="mm-wrap" id="mmWrap"><div class="mm-sizer" id="mmSizer"><div class="mm-canvas" id="mmCanvas" style="width:' + o.w + 'px;height:' + o.h + 'px"><svg id="mmSvg" width="' + o.w + '" height="' + o.h + '" aria-hidden="true"></svg>' + nodes + '</div></div></div></div>';
        $("#content").innerHTML = html;
        if (cl.length) { mmPlace(); mmFit(); }
    }
    document.addEventListener("pointerdown", function (e) {
        if (e.button !== 0 || !MM || U.view !== "mapa") return;
        var el = e.target.closest && e.target.closest("[data-mmdrag]"); if (!el) return;
        var id = el.dataset.id, kind = el.dataset.mmdrag, c = null, n = null;
        MM.cl.forEach(function (cc) { if (kind === "d" && cc.g.id === id) c = cc; cc.nodes.forEach(function (nn) { if (kind === "t" && nn.t.id === id) { c = cc; n = nn; } }); });
        if (!c) return;
        mmDrag = { el: el, kind: kind, c: c, n: n, sx: e.clientX, sy: e.clientY, bx: kind === "d" ? c.cx : n.dx, by: kind === "d" ? c.cy : n.dy, moved: false, target: null };
        try { el.setPointerCapture(e.pointerId); } catch (x) { }
    });
    document.addEventListener("pointermove", function (e) {
        var d = mmDrag; if (!d) return;
        var z = MM.z || 1, dx = (e.clientX - d.sx) / z, dy = (e.clientY - d.sy) / z;
        if (!d.moved) { if (Math.hypot(dx * z, dy * z) < 5) return; d.moved = true; d.el.classList.add("dragging"); }
        e.preventDefault();
        if (d.kind === "d") { d.c.cx = d.bx + dx; d.c.cy = d.by + dy; }
        else { d.n.dx = d.bx + dx; d.n.dy = d.by + dy; var nx = d.c.cx + d.n.dx, ny = d.c.cy + d.n.dy, tg = null; MM.cl.forEach(function (cc) { if (cc !== d.c && Math.hypot(nx - cc.cx, ny - cc.cy) < MMC.R + 40) tg = cc; }); document.querySelectorAll(".mm-dept.drop").forEach(function (x) { x.classList.remove("drop"); }); d.target = tg; if (tg) { var te = document.querySelector('.mm-dept[data-id="' + tg.g.id + '"]'); if (te) te.classList.add("drop"); } }
        mmPlace();
    });
    function mmEnd() {
        var d = mmDrag; if (!d) return;
        mmDrag = null; d.el.classList.remove("dragging"); document.querySelectorAll(".mm-dept.drop").forEach(function (x) { x.classList.remove("drop"); });
        if (!d.moved) return;
        mmSuppress = true; setTimeout(function () { mmSuppress = false; }, 300);
        if (d.kind === "d") { S.mm.d[d.c.g.id] = { x: Math.round(d.c.cx), y: Math.round(d.c.cy) }; }
        else if (d.target) { var t = d.n.t; t.groupId = d.target.g.id; delete S.mm.t[t.id]; toast("Demanda movida para " + d.target.g.name); }
        else { S.mm.t[d.n.t.id] = { g: d.c.g.id, dx: Math.round(d.n.dx), dy: Math.round(d.n.dy) }; }
        commit();
    }
    document.addEventListener("pointerup", mmEnd);
    document.addEventListener("pointercancel", mmEnd);

    /* ============================================================
       RENDER: PAINEL
       ============================================================ */
    function cobrancaText() {
        var late = scoped().filter(isLate), by = {};
        late.forEach(function (t) {
            var owners = ownersOf(t).length ? ownersOf(t) : [null];
            owners.forEach(function (ownerId) {
                var key = ownerId || "_";
                (by[key] = by[key] || []).push(t);
            });
        });
        var txt = "*Tarefas em atraso – " + fmtBR(isoToday()) + "/" + new Date().getFullYear() + "*\n";
        if (!late.length) return txt + "\nNenhuma tarefa em atraso.";
        Object.keys(by).sort(function (a, b) { return by[b].length - by[a].length; }).forEach(function (k) {
            var m = mem(k); txt += "\n*" + (m ? m.name : "Sem responsável") + "* (" + by[k].length + ")\n";
            by[k].sort(function (a, b) { return a.due < b.due ? -1 : 1; }).forEach(function (t) { txt += "• " + t.title + " – venceu " + fmtBR(t.due) + " (" + (-dd(t.due)) + " dias) – " + st(t.status).l + "\n"; });
        });
        return txt + "\nFavor atualizar o status e o novo prazo no quadro até o fim do dia.";
    }
    function renderPainel() {
        var all = scoped(), open = all.filter(function (t) { return t.status !== "feito"; }), late = all.filter(isLate);
        var week = open.filter(function (t) { var d = dd(t.due); return d !== null && d >= 0 && d <= 7; });
        var done = all.filter(function (t) { return t.status === "feito"; });
        var withDue = done.filter(function (t) { return t.due; }), onTime = withDue.filter(function (t) { return !t.doneAt || t.doneAt <= t.due; });
        var rate = withDue.length ? Math.round(100 * onTime.length / withDue.length) : null;
        var kp = function (l, v, s, c) { return '<div class="kpi" style="--kc:' + c + '"><div class="kpi-l">' + l + '</div><div class="kpi-v">' + v + '</div><div class="kpi-s">' + s + '</div></div>'; };
        var html = (U.dept && grp(U.dept) ? '<div style="display:flex;align-items:center;gap:8px;margin-top:12px"><span class="dot" style="background:' + grp(U.dept).color + '"></span><b>' + esc(grp(U.dept).name) + '</b><button class="chip" data-act="dept" data-id="">Ver todos os departamentos</button></div>' : "") +
            '<div class="kpis">' +
            kp("Tarefas abertas", open.length, "de " + all.length + " visíveis para você", "var(--primary)") +
            kp("Em atraso", late.length, open.length ? Math.round(100 * late.length / open.length) + "% das abertas" : "—", "var(--crit)") +
            kp("Vencem em 7 dias", week.length, "priorizar esta semana", "var(--warn)") +
            kp("Travadas", all.filter(function (t) { return t.status === "travado"; }).length, "precisam de desbloqueio", "#bb3354") +
            (function () { var rl = routinesOn(isoToday()), rd = rl.filter(function (r) { return r.done[isoToday()]; }).length; return kp("Rotinas de hoje", rd + "/" + rl.length, rl.length - rd ? (rl.length - rd) + " pendentes" : "todas concluídas", "#0086c0"); })() +
            kp("Entregas no prazo", rate === null ? "—" : rate + "%", onTime.length + " de " + withDue.length + " concluídas", "var(--ok)") +
            '</div>';

        if (U.tipo === "gerente") {
            var maxOpen = Math.max(1, Math.max.apply(null, S.members.map(function (m) {
                return open.filter(function (t) { return ownersOf(t).indexOf(m.id) >= 0; }).length;
            })));
            var rows = S.members.map(function (m) {
                var o = open.filter(function (t) { return ownersOf(t).indexOf(m.id) >= 0; });
                return { m: m, o: o, l: o.filter(isLate).length };
            }).filter(function (r) { return !U.dept || r.o.length; }).sort(function (a, b) { return b.l - a.l || b.o.length - a.o.length; });
            html += '<div class="cards2"><div class="card"><h3>Carga por responsável</h3><p class="sub">Tarefas abertas por status. Clique para ver as tarefas da pessoa.</p>' +
                rows.map(function (r) { return '<div class="load-row" data-act="go-person" data-id="' + r.m.id + '"><div class="load-who">' + av(r.m, 26) + '<span>' + esc(r.m.name) + '</span></div><div class="load-bar" style="width:' + Math.max(4, 100 * r.o.length / maxOpen) + '%">' + STATUS.filter(function (s) { return s.k !== "feito"; }).map(function (s) { var n = r.o.filter(function (t) { return t.status === s.k; }).length; return n ? '<i style="width:' + (100 * n / r.o.length) + '%;background:' + s.c + '" title="' + s.l + ': ' + n + '"></i>' : ""; }).join("") + '</div><span class="num">' + r.o.length + '</span><span class="num">' + (r.l ? '<span class="tag late">' + r.l + ' atras.</span>' : '<span style="color:var(--muted);font-size:12px">em dia</span>') + '</span></div>'; }).join("") +
                '<div class="legend">' + STATUS.filter(function (s) { return s.k !== "feito"; }).map(function (s) { return '<span><i style="background:' + s.c + '"></i>' + s.l + '</span>'; }).join("") + '</div></div>';
        } else {
            html += '<div class="cards2"><div></div>';
        }

        var lateSorted = late.slice().sort(function (a, b) { return a.due < b.due ? -1 : 1; });
        html += '<div class="card"><div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start"><div><h3>Tarefas atrasadas</h3><p class="sub">Ordenadas pelo maior atraso.</p></div><button class="btn sm" data-act="copy-cob">' + ic("copy", 14) + 'Copiar cobrança</button></div>' +
            (lateSorted.length ? '<div style="overflow-x:auto"><table class="lt"><thead><tr><th>Tarefa</th><th>Responsável</th><th>Prazo</th><th class="num">Atraso</th></tr></thead><tbody>' +
                lateSorted.map(function (t) { var owners = ownersOf(t).map(mem).filter(Boolean); var who = owners.length ? owners.map(function (m) { return first(m.name); }).join(", ") : "—"; return '<tr class="click" data-act="open" data-id="' + t.id + '"><td>' + esc(t.title) + '<div style="margin-top:3px"><span class="pill" style="background:' + st(t.status).c + '">' + st(t.status).l + '</span></div></td><td><span class="who">' + av(owners[0], 22) + esc(who) + '</span></td><td class="nw">' + fmt(t.due) + '</td><td class="num late-n">' + (-dd(t.due)) + 'd</td></tr>'; }).join("") + '</tbody></table></div>' : '<div class="empty" style="margin:0">Nenhuma tarefa em atraso.</div>') + '</div></div>';
        html += '<div class="card" style="margin-top:16px"><h3>Próximos 7 dias</h3><p class="sub">O que precisa sair nesta semana.</p>' +
            (week.length ? '<div style="overflow-x:auto"><table class="lt"><thead><tr><th>Tarefa</th><th>Responsável</th><th>Status</th><th>Prioridade</th><th>Prazo</th></tr></thead><tbody>' +
                week.sort(function (a, b) { return a.due < b.due ? -1 : 1; }).map(function (t) { var owners = ownersOf(t).map(mem).filter(Boolean); var who = owners.length ? owners.map(function (m) { return first(m.name); }).join(", ") : "—"; return '<tr class="click" data-act="open" data-id="' + t.id + '"><td>' + esc(t.title) + '</td><td><span class="who">' + av(owners[0], 22) + esc(who) + '</span></td><td><span class="pill" style="background:' + st(t.status).c + '">' + st(t.status).l + '</span></td><td><span class="pill" style="background:' + pr(t.priority).c + '">' + pr(t.priority).l + '</span></td><td>' + fmt(t.due) + ' ' + dueTag(t) + '</td></tr>'; }).join("") + '</tbody></table></div>' : '<div class="empty" style="margin:0">Nada vencendo nos próximos 7 dias.</div>') + '</div>';
        $("#content").innerHTML = html;
    }

    /* ============================================================
       RENDER: SUGESTÕES
       ============================================================ */
    function insights() {
        var visible = scoped();
        var out = [], open = visible.filter(function (t) { return t.status !== "feito"; });
        var load = S.members.map(function (m) {
            var o = open.filter(function (t) { return ownersOf(t).indexOf(m.id) >= 0; });
            return { m: m, o: o, l: o.filter(isLate) };
        });
        load.filter(function (x) { return x.l.length >= 2; }).sort(function (a, b) { return b.l.length - a.l.length; }).forEach(function (x) {
            var mx = Math.max.apply(null, x.l.map(function (t) { return -dd(t.due); }));
            out.push({ sev: "crit", t: first(x.m.name) + " acumula " + x.l.length + " tarefas atrasadas", x: "O maior atraso é de " + mx + " dias. Faça um 1:1 hoje para repactuar prazos e avaliar se parte das entregas deve ir para outra pessoa.", a: { l: "Ver tarefas atrasadas", act: "go-late", id: x.m.id } });
        });
        var one = load.filter(function (x) { return x.l.length === 1; });
        if (one.length) out.push({ sev: "warn", t: one.length + " pessoa" + (one.length > 1 ? "s" : "") + " com 1 tarefa atrasada", x: one.map(function (x) { return first(x.m.name) + " (" + x.l[0].title + ")"; }).join("; ") + ". Cobrar atualização de status e novo prazo.", a: { l: "Copiar cobrança", act: "copy-cob" } });
        var crit = open.filter(function (t) { var d = dd(t.due); return (t.priority === "critica" || t.priority === "alta") && t.status === "nao" && d !== null && d >= 0 && d <= 3; });
        if (crit.length) out.push({ sev: "crit", t: crit.length + " tarefa" + (crit.length > 1 ? "s" : "") + " de prioridade alta vence" + (crit.length > 1 ? "m" : "") + " em até 3 dias sem ter começado", x: crit.map(function (t) { return t.title; }).join("; ") + ".", a: { l: "Abrir a primeira", act: "open", id: crit[0].id } });
        var trav = open.filter(function (t) { return t.status === "travado"; });
        if (trav.length) out.push({ sev: "warn", t: trav.length + " tarefa" + (trav.length > 1 ? "s" : "") + " travada" + (trav.length > 1 ? "s" : ""), x: "Registre o motivo do bloqueio nas atualizações e marque uma conversa de 15 minutos com quem pode destravar: " + trav.map(function (t) { return t.title; }).join("; ") + ".", a: { l: "Ver no Kanban", act: "view", v: "kanban" } });
        if (open.length && S.members.length) {
            var avg = open.length / S.members.length, sorted = load.slice().sort(function (a, b) { return b.o.length - a.o.length; }), top = sorted[0], low = sorted[sorted.length - 1];
            if (top.o.length >= 3 && top.o.length >= avg * 1.5 && top.o.length - low.o.length >= 2) out.push({ sev: "warn", t: "Carga concentrada em " + first(top.m.name), x: top.o.length + " tarefas abertas contra média de " + avg.toFixed(1).replace(".", ",") + " por pessoa. Avaliar repassar tarefas de prioridade média ou baixa para " + first(low.m.name) + " (" + low.o.length + " abertas).", a: { l: "Abrir painel", act: "view", v: "painel" } });
        }
        var noOwner = open.filter(function (t) { return !ownersOf(t).length; });
        if (noOwner.length) out.push({ sev: "warn", t: noOwner.length + " tarefa" + (noOwner.length > 1 ? "s" : "") + " sem responsável", x: "Distribua essas tarefas: " + noOwner.slice(0, 3).map(function (t) { return t.title; }).join("; ") + (noOwner.length > 3 ? " (e mais " + (noOwner.length - 3) + ")" : "") + ".", a: { l: "Ver na tabela", act: "view", v: "tabela" } });
        var noDue = open.filter(function (t) { return !t.due; });
        if (noDue.length) out.push({ sev: "info", t: noDue.length + " tarefa" + (noDue.length > 1 ? "s" : "") + " sem prazo definido", x: "Defina prazos para acompanhar no painel: " + noDue.slice(0, 3).map(function (t) { return t.title; }).join("; ") + (noDue.length > 3 ? " (e mais " + (noDue.length - 3) + ")" : "") + ".", a: { l: "Ver na tabela", act: "view", v: "tabela" } });
        var iso = isoToday(), rList = routinesOn(iso), rPend = rList.filter(function (r) { return !r.done[iso]; });
        if (rPend.length) out.push({ sev: "warn", t: rPend.length + " rotina" + (rPend.length > 1 ? "s" : "") + " pendente" + (rPend.length > 1 ? "s" : "") + " hoje", x: "Cobrar conclusão das rotinas diárias.", a: { l: "Copiar pendências", act: "copy-rot" } });
        return out;
    }
    function renderSugestoes() {
        var ins = insights();
        var html = '<div class="sg-grid">';
        html += '<div class="card"><h3>Sugestões automáticas</h3><p class="sub">Baseadas nos dados atuais do quadro.</p>';
        if (!ins.length) html += '<div class="empty" style="margin:0">Nenhum ponto de atenção no momento.</div>';
        else ins.forEach(function (x) {
            var col = x.sev === "crit" ? "var(--crit)" : x.sev === "warn" ? "var(--warn)" : "var(--info)";
            var sevL = x.sev === "crit" ? "Crítico" : x.sev === "warn" ? "Atenção" : "Info";
            html += '<div class="sg" style="--sc:' + col + '"><div class="sg-dot"></div><div class="sg-b"><div class="sg-sev">' + sevL + '</div><div class="sg-t">' + esc(x.t) + '</div><div class="sg-x">' + esc(x.x) + '</div>' +
                (x.a ? '<button class="btn sm" data-act="' + x.a.act + '"' + (x.a.id ? ' data-id="' + x.a.id + '"' : '') + (x.a.v ? ' data-v="' + x.a.v + '"' : '') + '>' + esc(x.a.l) + '</button>' : "") +
                '</div></div>';
        });
        html += '</div>';
        html += '<div class="card"><h3>Ideias da equipe</h3><p class="sub">Vote nas melhores ideias.</p>' +
            '<form class="form" id="ideaForm"><input id="ideaTitle" placeholder="Título da ideia" required><textarea id="ideaDesc" placeholder="Descreva a ideia e o impacto esperado"></textarea><button class="btn primary" type="submit">Enviar ideia</button></form>';
        var ideas = S.ideas.slice().sort(function (a, b) { return b.votes - a.votes; });
        ideas.forEach(function (idea) {
            var s = ist(idea.status), au = mem(idea.author);
            html += '<div class="idea"><button class="vote" data-act="vote" data-id="' + idea.id + '">' + idea.votes + '<small style="font-size:10px;font-weight:400;color:var(--muted)">votos</small></button><div style="flex:1;min-width:0"><div class="idea-t">' + esc(idea.title) + '</div><div class="idea-x">' + esc(idea.desc) + '</div><div class="idea-m"><span class="pill" style="background:' + s.c + '">' + s.l + '</span>' + (au ? '<span>' + av(au, 18) + ' ' + esc(first(au.name)) + '</span>' : "") + '<span>· ' + fmt(idea.at) + '</span></div></div></div>';
        });
        html += '</div></div>';
        $("#content").innerHTML = html;
    }

    /* ============================================================
       RENDER: EQUIPE
       ============================================================ */
    function renderEquipe() {
        var open = scoped().filter(function (t) { return t.status !== "feito"; });
        var closed = scoped().filter(function (t) { return t.status === "feito"; });
        var isGer = U.tipo === "gerente";
        var html = '<div class="team">';
        S.members.forEach(function (m) {
            var abertas = open.filter(function (t) { return ownersOf(t).indexOf(m.id) >= 0; });
            var atrasadas = abertas.filter(isLate);
            var concluidas = closed.filter(function (t) { return ownersOf(t).indexOf(m.id) >= 0; });
            var isMe = m.id === U.me;
            var depto = grp(m.departamentoId);

            html += '<div class="mcard' + (isMe ? " me" : "") + '">' +
                '<label class="ph">' + av(m, 72) +
                (isMe || isGer ? '<span class="ph-ov">Trocar foto</span><input type="file" accept="image/*" data-photo="' + m.id + '">' : '') +
                '</label>' +

                (isGer
                    ? '<input class="m-name" data-bind="member:' + m.id + ':name" value="' + esc(m.name) + '" aria-label="Nome">'
                    : '<div class="m-name-ro">' + esc(m.name) + '</div>') +

                (isGer
                    ? '<select class="m-role" data-bind="member:' + m.id + ':role">' +
                    CARGOS.map(function (c) {
                        return '<option value="' + esc(c.l) + '"' + (c.l === m.role ? " selected" : "") + '>' + esc(c.l) + '</option>';
                    }).join("") + '</select>'
                    : '<div class="m-role-ro">' + esc(m.role || "—") + '</div>') +

                (isGer
                    ? '<select class="m-depto" data-bind="member:' + m.id + ':departamentoId" aria-label="Departamento">' +
                    '<option value="">— sem departamento —</option>' +
                    S.groups.map(function (g) {
                        return '<option value="' + g.id + '"' + (g.id === m.departamentoId ? " selected" : "") + '>' + esc(g.name) + '</option>';
                    }).join("") + '</select>'
                    : '<div class="m-depto-ro">' +
                    (depto ? '<span class="dot" style="background:' + depto.color + '"></span>' + esc(depto.name) : '—') +
                    '</div>') +

                (m.email
                    ? '<div class="m-email" title="' + esc(m.email) + '">' + esc(m.email) + '</div>'
                    : '<div class="m-email muted">sem e-mail</div>') +

                (isGer
                    ? '<div class="m-stats">' +
                    '<div><b>' + abertas.length + '</b><span>Abertas</span></div>' +
                    '<div><b style="color:var(--crit)">' + atrasadas.length + '</b><span>Atrasadas</span></div>' +
                    '<div><b style="color:var(--ok)">' + concluidas.length + '</b><span>Concluídas</span></div>' +
                    '</div>'
                    : '') +

                '<div class="m-acts">' +
                '<button class="btn sm" data-act="go-person" data-id="' + m.id + '">Ver tarefas</button>' +
                (isGer ? '<button class="btn sm danger" data-act="member-del" data-id="' + m.id + '">Excluir</button>' : '') +
                '</div></div>';
        });
        if (isGer) html += '<button class="mcard add" data-act="member-add">' + ic("plus", 32) + '<div>Adicionar pessoa</div></button>';
        html += '</div>';
        $("#content").innerHTML = html;
    }

    /* ============================================================
       DRAWER
       ============================================================ */
    function openDrawer(id) {
        U.openTask = id;
        var t = task(id);
        if (!t) { closeDrawer(); return; }
        var g = grp(t.groupId), isGer = U.tipo === "gerente";
        var drawer = $("#drawer");
        var active = document.activeElement;
        var wasInDrawer = active && drawer.contains(active);
        var focusBind = wasInDrawer && active.getAttribute ? active.getAttribute("data-bind") : null;
        var wasSubInput = wasInDrawer && active.hasAttribute("data-sub-add");
        var selS = null, selE = null;
        if (wasInDrawer && active.selectionStart !== undefined) { selS = active.selectionStart; selE = active.selectionEnd; }

        var ownersArr = ownersOf(t);
        var ownersHtml;
        if (isGer) {
            ownersHtml = '<div class="owner-chips">' + S.members.map(function (m) {
                var on = ownersArr.indexOf(m.id) >= 0;
                return '<label class="owner-chip' + (on ? " on" : "") + '"><input type="checkbox" data-owner-toggle="' + t.id + '" value="' + m.id + '"' + (on ? " checked" : "") + '>' + av(m, 22) + ' ' + esc(m.name) + '</label>';
            }).join("") + '</div>';
        } else {
            var chips = ownersArr.map(function (id2) { var m = mem(id2); return m ? '<span class="owner-chip on">' + av(m, 22) + ' ' + esc(m.name) + '</span>' : ''; }).join("");
            ownersHtml = '<div class="owner-chips ro">' + (chips || '<span style="color:var(--muted);font-size:13px;padding:4px">Sem responsável</span>') + '</div>';
        }

        var subs = (t.subtasks || []).map(function (s, i) {
            return '<div class="sub-item ' + (s.d ? "done" : "") + '"><input type="checkbox" ' + (s.d ? "checked" : "") + ' data-act="sub-toggle" data-id="' + t.id + '" data-i="' + i + '"><span>' + esc(s.t) + '</span><button class="sub-del" data-act="sub-del" data-id="' + t.id + '" data-i="' + i + '">×</button></div>';
        }).join("");

        var updates = (t.updates || []).map(function (u) {
            var au = mem(u.a);
            return '<div class="upd-item">' + av(au, 28) + '<div style="flex:1;min-width:0"><div><span class="upd-who">' + esc(au ? au.name : "—") + '</span><span class="upd-when">' + new Date(u.at).toLocaleString("pt-BR") + '</span></div><div class="upd-txt">' + esc(u.x) + '</div></div></div>';
        }).join("");

        drawer.innerHTML =
            '<div class="dr-h"><textarea class="dr-title" data-bind="task:' + t.id + ':title" rows="2">' + esc(t.title) + '</textarea><button class="x" data-act="drawer-close" aria-label="Fechar">' + ic("x", 18) + '</button></div>' +
            '<div class="dr-b">' +
            '<div class="fields">' +
            '<div class="fld" style="grid-column:1/-1"><label>Responsáveis' + (isGer ? '' : ' (somente gerente altera)') + '</label>' + ownersHtml + '</div>' +
            '<div class="fld"><label>Departamento</label><select data-bind="task:' + t.id + ':groupId">' + S.groups.map(function (x) { return '<option value="' + x.id + '"' + (x.id === t.groupId ? " selected" : "") + '>' + esc(x.name) + '</option>'; }).join("") + '</select></div>' +
            '<div class="fld"><label>Status</label><select data-bind="task:' + t.id + ':status">' + STATUS.map(function (s) { return '<option value="' + s.k + '"' + (s.k === t.status ? " selected" : "") + '>' + s.l + '</option>'; }).join("") + '</select></div>' +
            '<div class="fld"><label>Prioridade</label><select data-bind="task:' + t.id + ':priority">' + PRIO.map(function (p) { return '<option value="' + p.k + '"' + (p.k === t.priority ? " selected" : "") + '>' + p.l + '</option>'; }).join("") + '</select></div>' +
            '<div class="fld"><label>Início</label><input type="date" data-bind="task:' + t.id + ':start" value="' + (t.start || "") + '"></div>' +
            '<div class="fld"><label>Prazo</label><input type="date" data-bind="task:' + t.id + ':due" value="' + (t.due || "") + '"></div>' +
            '</div>' +
            '<div class="fld"><label>Descrição</label><textarea data-bind="task:' + t.id + ':desc" placeholder="Detalhes da tarefa…">' + esc(t.desc || "") + '</textarea></div>' +
            '<div><div class="sec-h">Subtarefas</div>' + (subs || '<div style="color:var(--muted);font-size:13px;padding:4px 0">Sem subtarefas.</div>') +
            '<input class="add-in" data-sub-add="' + t.id + '" value="' + esc((U.subDraft && U.subDraft[t.id]) || "") + '" placeholder="+ Nova subtarefa"></div>' +
            '<div><div class="sec-h">Atualizações</div>' + (updates || '<div style="color:var(--muted);font-size:13px;padding:4px 0">Nenhuma atualização ainda.</div>') +
            '<textarea data-upd-add="' + t.id + '" placeholder="Escreva uma atualização…" style="margin-top:8px;width:100%;min-height:70px;resize:vertical;border:1px solid var(--border);background:var(--surface);border-radius:6px;padding:7px 10px">' + esc((U.updateDraft && U.updateDraft[t.id]) || "") + '</textarea>' +
            '<button class="btn primary sm" data-act="update-add" data-id="' + t.id + '" style="margin-top:6px">Publicar atualização</button></div>' +
            '</div>' +
            '<div class="dr-f"><span>' + esc(g ? g.name : "") + '</span><button class="btn danger" data-act="task-del" data-id="' + t.id + '">Excluir tarefa</button></div>';

        drawer.classList.add("show");
        $("#scrim").classList.add("show");
        if (focusBind) {
            var newEl = drawer.querySelector('[data-bind="' + focusBind + '"]');
            if (newEl) { newEl.focus(); if (selS !== null && newEl.setSelectionRange) newEl.setSelectionRange(selS, selE); }
        } else if (wasSubInput) {
            var subEl = drawer.querySelector('[data-sub-add="' + t.id + '"]');
            if (subEl) subEl.focus();
        }
    }
    function closeDrawer() {
        var d = $("#drawer"), s = $("#scrim");
        if (d) d.classList.remove("show");
        if (s) s.classList.remove("show");
        U.openTask = null;
    }

    /* ============================================================
       POPOVER
       ============================================================ */
    function hidePopover() {
        var p = $("#pop");
        if (p) p.classList.remove("show");
        U.popState = null;
    }
    function positionPopover(el, pop) {
        if (!el || !document.body.contains(el)) return;
        var r = el.getBoundingClientRect(), pr = pop.getBoundingClientRect();
        var top = r.bottom + 6, left = r.left;
        if (left + pr.width > window.innerWidth - 8) left = window.innerWidth - pr.width - 8;
        if (top + pr.height > window.innerHeight - 8) top = r.top - pr.height - 6;
        if (left < 8) left = 8;
        if (top < 8) top = 8;
        pop.style.top = top + "px";
        pop.style.left = left + "px";
    }
    function showPopover(el, kind, id) {
        var pop = $("#pop"), t = task(id);
        if (!t || !pop) return;
        U.popState = { kind: kind, id: id };
        var html = "";
        if (kind === "status") {
            html = STATUS.map(function (s) {
                return '<button class="pop-sw" data-act="set-status" data-id="' + id + '" data-v="' + s.k + '" style="background:' + s.c + '">' + s.l + '</button>';
            }).join("");
        } else if (kind === "owner") {
            if (U.tipo !== "gerente") return;
            var tDepto = t.groupId;
            var ordered = S.members.slice().sort(function (a, b) {
                var aMatch = a.departamentoId === tDepto ? 0 : 1;
                var bMatch = b.departamentoId === tDepto ? 0 : 1;
                if (aMatch !== bMatch) return aMatch - bMatch;
                return (a.name || "").localeCompare(b.name || "");
            });

            var prevDepto = "__INIT__";
            html = ordered.map(function (m) {
                var on = ownersOf(t).indexOf(m.id) >= 0;
                var header = "";
                var dKey = m.departamentoId || "";
                if (dKey !== prevDepto) {
                    prevDepto = dKey;
                    var dName = dKey ? ((grp(dKey) || {}).name || "Departamento") : "Sem departamento";
                    header = '<div class="pop-section">' + esc(dName) + '</div>';
                }
                return header +
                    '<button class="pop-opt' + (on ? " on" : "") + '" data-act="toggle-owner" data-id="' + id + '" data-v="' + m.id + '">' +
                    '<span class="pop-check">' + (on ? ic("check", 14) : "") + '</span>' +
                    av(m, 24) + esc(m.name) + '</button>';
            }).join("");
        } else if (kind === "due") {
            html = '<div class="pop-row"><input type="date" id="popDue" data-task-id="' + id + '" value="' + (t.due || "") + '"></div>' +
                '<div class="pop-row" style="margin-top:6px">' +
                '<button class="btn sm" data-act="set-due" data-id="' + id + '" data-v="' + isoToday() + '">Hoje</button>' +
                '<button class="btn sm" data-act="set-due" data-id="' + id + '" data-v="' + addDays(isoToday(), 1) + '">Amanhã</button>' +
                '<button class="btn sm" data-act="set-due" data-id="' + id + '" data-v="' + addDays(isoToday(), 7) + '">+7d</button>' +
                '</div>' +
                '<button class="btn sm" data-act="set-due" data-id="' + id + '" data-v="" style="margin-top:6px;width:100%">Limpar prazo</button>';
        }
        pop.innerHTML = html;
        pop.classList.add("show");
        positionPopover(el, pop);
    }

    function resizeImage(file, maxW, maxH) {
        return new Promise(function (resolve, reject) {
            var reader = new FileReader();
            reader.onload = function (ev) {
                var img = new Image();
                img.onload = function () {
                    var w = img.width, h = img.height, scale = Math.min(1, maxW / w, maxH / h);
                    w = Math.round(w * scale); h = Math.round(h * scale);
                    var canvas = document.createElement("canvas");
                    canvas.width = w; canvas.height = h;
                    canvas.getContext("2d").drawImage(img, 0, 0, w, h);
                    resolve(canvas.toDataURL("image/jpeg", 0.75));
                };
                img.onerror = reject;
                img.src = ev.target.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    /* ============================================================
       RENDER ALL
       ============================================================ */
    function renderAll() {
        renderNav();
        renderToolbar();
        switch (U.view) {
            case "tabela": renderTable(); break;
            case "rotinas": renderRotinas(); break;
            case "kanban": renderKanban(); break;
            case "mapa": renderMapa(); break;
            case "painel": renderPainel(); break;
            case "sugestoes": renderSugestoes(); break;
            case "equipe": renderEquipe(); break;
        }
        if (U.openTask) openDrawer(U.openTask);
        else closeDrawer();

        // Mantém popover sincronizado se estiver aberto (ex: toggle-owner)
        if (U.popState && U.popState.kind === "owner") {
            var anchor = document.querySelector('.row[data-id="' + U.popState.id + '"] [data-act="pick-owner"]');
            if (anchor) showPopover(anchor, "owner", U.popState.id);
            else hidePopover();
        }
    }

    /* ============================================================
       EVENTOS
       ============================================================ */
    function onClick(e) {
        var pop = $("#pop");
        var inPop = pop && pop.contains(e.target);
        var isPick = e.target.closest && e.target.closest("[data-act^='pick-']");
        if (pop && pop.classList.contains("show") && !inPop && !isPick) hidePopover();

        var el = e.target.closest && e.target.closest("[data-act]");
        if (!el || el.hasAttribute("disabled")) return;
        var act = el.dataset.act, id = el.dataset.id;

        switch (act) {
            case "view": U.view = el.dataset.v; location.hash = U.view; saveUI(); renderAll(); break;
            case "dept": U.dept = el.dataset.id || null; saveUI(); renderAll(); break;
            case "person": U.person = U.person === id ? null : id; saveUI(); renderAll(); break;
            case "late-only": U.lateOnly = !U.lateOnly; saveUI(); renderAll(); break;
            case "clear": U.person = null; U.lateOnly = false; U.q = ""; U.dept = null; saveUI(); renderAll(); break;
            case "clear-q": U.q = ""; var si = $("#sideSearch"); if (si) si.value = ""; saveUI(); renderAll(); break;
            case "logout": if (confirm("Sair da conta?")) { if (window.dxAuth) window.dxAuth.logout(); } break;

            case "new-task": {
                if (!S.groups.length) {
                    if (U.tipo !== "gerente") { toast("Nenhum departamento disponível ainda."); break; }
                    var gname = prompt("Informe o nome do primeiro departamento:");
                    if (!gname || !gname.trim()) break;
                    var newG = { id: uid(), name: gname.trim(), color: COLORS[0], collapsed: false };
                    S.groups.push(newG);
                    U.dept = newG.id;
                }
                var gid = U.dept || S.groups[0].id;
                var nt = { id: uid(), groupId: gid, title: "Nova tarefa", creator: U.me, owners: [U.me], status: el.dataset.status || "nao", priority: "media", due: "", desc: "", subtasks: [], updates: [], doneAt: "", start: "" };
                S.tasks.push(nt); U.openTask = nt.id; commit();
                setTimeout(function () { var tEl = document.querySelector('#drawer [data-bind="task:' + nt.id + ':title"]'); if (tEl) { tEl.focus(); tEl.select(); } }, 0);
                break;
            }
            case "open": if (!mmSuppress) openDrawer(id); break;
            case "drawer-close": closeDrawer(); saveUI(); break;
            case "task-del": {
                var td = task(id);
                if (!canEditTask(td)) { toast("Sem permissão para excluir esta tarefa."); break; }
                if (confirm("Excluir esta tarefa?")) { S.tasks = S.tasks.filter(function (x) { return x.id !== id; }); closeDrawer(); commit(); }
                break;
            }
            case "sub-toggle": { var t = task(id); if (t && t.subtasks[+el.dataset.i]) { t.subtasks[+el.dataset.i].d = !t.subtasks[+el.dataset.i].d; commit(); } break; }
            case "sub-del": { var t2 = task(id); if (t2) { t2.subtasks.splice(+el.dataset.i, 1); commit(); } break; }
            case "update-add": {
                var t3 = task(id), ta = document.querySelector('[data-upd-add="' + id + '"]');
                if (t3 && ta && ta.value.trim()) { t3.updates.push({ a: U.me, x: ta.value.trim(), at: new Date().toISOString() }); if (U.updateDraft) delete U.updateDraft[id]; commit(); }
                break;
            }
            case "mode": setMode(el.dataset.v); renderNav(); break;
            case "fullscreen": toggleFullscreen(); break;

            case "add-group":
                if (U.tipo !== "gerente") { toast("Apenas gerentes podem criar departamentos."); break; }
                addGroup();
                break;

            case "toggle-group": { var g = grp(id); if (g) { g.collapsed = !g.collapsed; commit(); } break; }
            case "pick-owner": if (U.tipo === "gerente") showPopover(el, "owner", id); break;
            case "pick-status": showPopover(el, "status", id); break;
            case "pick-due": showPopover(el, "due", id); break;
            case "set-status": { var t5 = task(id); if (t5) { t5.status = el.dataset.v; t5.doneAt = (t5.status === "feito") ? isoToday() : ""; } hidePopover(); commit(); break; }
            case "set-due": { var t7 = task(id); if (t7) t7.due = el.dataset.v; hidePopover(); commit(); break; }
            case "toggle-owner": {
                if (U.tipo !== "gerente") { toast("Apenas gerentes podem alterar responsáveis."); break; }
                var t6 = task(id);
                if (t6) {
                    t6.owners = t6.owners || [];
                    var idx = t6.owners.indexOf(el.dataset.v);
                    if (idx >= 0) t6.owners.splice(idx, 1);
                    else t6.owners.push(el.dataset.v);
                    commit();
                }
                break;
            }
            case "star": { var t8 = task(id), p = PRIO.find(function (x) { return x.n === +el.dataset.n; }); if (t8 && p) { t8.priority = p.k; commit(); } break; }
            case "r-day": shiftDay(+el.dataset.v); break;
            case "r-new":
                if (!S.groups.length) { alert("Crie pelo menos um departamento antes de cadastrar uma rotina."); break; }
                U.editR = "new"; renderRotinas(); break;
            case "r-edit": U.editR = id; renderRotinas(); break;
            case "r-cancel": U.editR = null; renderRotinas(); break;
            case "r-check": { var r = S.routines.find(function (x) { return x.id === id; }); if (r) { var iso = U.rday || isoToday(); r.done[iso] = !r.done[iso]; commit(); } break; }
            case "r-del": if (confirm("Excluir esta rotina?")) { S.routines = S.routines.filter(function (x) { return x.id !== id; }); commit(); } break;
            case "copy-rot": copyToClipboard(rPendText()); break;
            case "copy-cob": copyToClipboard(cobrancaText()); break;
            case "go-person": U.person = id; U.view = "tabela"; saveUI(); renderAll(); break;
            case "go-late": U.person = id; U.lateOnly = true; U.view = "tabela"; saveUI(); renderAll(); break;
            case "mm-new": {
                var gid2 = id;
                var nt2 = { id: uid(), groupId: gid2, title: "Nova tarefa", creator: U.me, owners: [U.me], status: "nao", priority: "media", due: "", desc: "", subtasks: [], updates: [], doneAt: "", start: "" };
                S.tasks.push(nt2); U.openTask = nt2.id; commit();
                setTimeout(function () { var tEl = document.querySelector('#drawer [data-bind="task:' + nt2.id + ':title"]'); if (tEl) { tEl.focus(); tEl.select(); } }, 0);
                break;
            }
            case "mm-addgroup":
                if (U.tipo !== "gerente") { toast("Apenas gerentes podem criar departamentos."); break; }
                addGroup(); break;
            case "mm-reset": S.mm = { d: {}, t: {} }; commit(); break;
            case "mm-done": U.mmHideDone = !U.mmHideDone; renderMapa(); break;
            case "mm-zoom": mmZoom(el.dataset.v); break;
            case "mm-full": U.mmFull = !U.mmFull; renderMapa(); break;
            case "vote": { var idea = S.ideas.find(function (x) { return x.id === id; }); if (idea) { idea.votes++; commit(); } break; }

            case "member-add": {
                if (U.tipo !== "gerente") { toast("Apenas gerentes podem adicionar pessoas."); break; }
                var name = prompt("Nome da pessoa:");
                if (!name || !name.trim()) break;
                var email = prompt("E-mail corporativo (para login):");
                if (!email || !email.trim()) break;
                S.members.push({
                    id: uid(),
                    name: name.trim(),
                    role: CARGOS[3].l,
                    email: email.trim().toLowerCase(),
                    departamentoId: "",
                    photo: "",
                    color: COLORS[Math.floor(Math.random() * COLORS.length)]
                });
                commit();
                break;
            }
            case "member-del": {
                if (U.tipo !== "gerente") { toast("Apenas gerentes podem remover pessoas."); break; }
                if (id === U.me) { toast("Você não pode excluir seu próprio usuário."); break; }
                if (!confirm("Remover esta pessoa da equipe? Ela sairá de todas as tarefas.")) break;
                S.members = S.members.filter(function (m) { return m.id !== id; });
                S.tasks.forEach(function (t) { if (t.owners) t.owners = t.owners.filter(function (o) { return o !== id; }); });
                S.routines.forEach(function (r) { if (r.owner === id) r.owner = ""; });
                U.allowPruneMembers = true;
                commit();
                break;
            }
        }
    }

    function onChange(e) {
        if (e.target.id === "rFreq") {
            var v = e.target.value;
            var dF = document.getElementById("rDaysF"), mF = document.getElementById("rDomF");
            if (dF) dF.style.display = v === "semanal" ? "" : "none";
            if (mF) mF.style.display = v === "mensal" ? "" : "none";
            return;
        }
        if (e.target.id === "popDue") {
            var t0 = task(e.target.dataset.taskId);
            if (t0) { t0.due = e.target.value; hidePopover(); commit(); }
            return;
        }
        if (e.target.matches && e.target.matches("[data-owner-toggle]")) {
            if (U.tipo !== "gerente") return;
            var tt = task(e.target.dataset.ownerToggle);
            if (!tt) return;
            tt.owners = tt.owners || [];
            var idx = tt.owners.indexOf(e.target.value);
            if (idx >= 0) tt.owners.splice(idx, 1);
            else tt.owners.push(e.target.value);
            commit();
            return;
        }
        if (e.target.matches && e.target.matches("[data-photo]")) {
            var mid = e.target.dataset.photo, mm2 = mem(mid), file = e.target.files[0];
            if (mm2 && file && (mid === U.me || U.tipo === "gerente")) {
                resizeImage(file, 200, 200).then(function (url) { mm2.photo = url; commit(); });
            }
            e.target.value = "";
            return;
        }
        var el = e.target.closest && e.target.closest("[data-bind]");
        if (!el) return;
        var parts = el.dataset.bind.split(":");
        var scope = parts[0], id = parts[1], field = parts[2];
        if (scope === "member" && U.tipo !== "gerente") return;
        if (scope === "group" && U.tipo !== "gerente") return;
        if (scope === "board" && U.tipo !== "gerente") return;

        if (scope === "board") S.board.name = el.value;
        else if (scope === "group") { var g = S.groups.find(function (x) { return x.id === id; }); if (g) g[field] = el.value; }
        else if (scope === "member") { var m = S.members.find(function (x) { return x.id === id; }); if (m) m[field] = el.value; }
        else if (scope === "task") {
            var t = task(id);
            if (t && canEditTask(t)) {
                t[field] = el.value;
                if (field === "status") t.doneAt = (el.value === "feito") ? isoToday() : "";
            }
        }
        var active = document.activeElement;
        var focusBind = null, selS = null, selE = null;
        if (active === el) focusBind = el.dataset.bind;
        else if (active && active.matches && active.matches("[data-bind]")) {
            focusBind = active.dataset.bind;
            if (active.selectionStart !== undefined) { selS = active.selectionStart; selE = active.selectionEnd; }
        }
        commit();
        if (focusBind) {
            var newEl = document.querySelector('#drawer [data-bind="' + focusBind + '"]') || document.querySelector('[data-bind="' + focusBind + '"]');
            if (newEl) { newEl.focus(); if (selS !== null && newEl.setSelectionRange) newEl.setSelectionRange(selS, selE); }
        }
    }

    function onInput(e) {
        if (e.target.id === "sideSearch") {
            U.q = e.target.value;
            renderSearch();
            renderToolbar();
            if (U.view === "tabela") renderTable();
            else if (U.view === "kanban") renderKanban();
            else if (U.view === "mapa") renderMapa();
            return;
        }
        if (e.target.matches && e.target.matches("[data-upd-add]")) {
            U.updateDraft = U.updateDraft || {};
            U.updateDraft[e.target.dataset.updAdd] = e.target.value;
            return;
        }
        if (e.target.matches && e.target.matches("[data-sub-add]")) {
            U.subDraft = U.subDraft || {};
            U.subDraft[e.target.dataset.subAdd] = e.target.value;
            return;
        }
        var el = e.target.closest && e.target.closest("[data-bind]");
        if (!el) return;
        if (el.tagName === "TEXTAREA" || el.type === "text" || el.type === "search" || el.type === "date" || el.type === "time" || el.type === "number") {
            var parts = el.dataset.bind.split(":");
            var scope = parts[0], id = parts[1], field = parts[2];
            if (scope === "member" && U.tipo !== "gerente") return;
            if (scope === "group" && U.tipo !== "gerente") return;
            if (scope === "board" && U.tipo !== "gerente") return;
            if (scope === "board") S.board.name = el.value;
            else if (scope === "group") { var g = S.groups.find(function (x) { return x.id === id; }); if (g) g[field] = el.value; }
            else if (scope === "member") { var m = S.members.find(function (x) { return x.id === id; }); if (m) m[field] = el.value; }
            else if (scope === "task") { var t = task(id); if (t && canEditTask(t)) t[field] = el.value; }
            scheduleSave();
            saveUI();
        }
    }

    function onKey(e) {
        if (e.key === "Enter" && e.target.matches && e.target.matches(".dr-title, .t-in, .g-name, .m-name, .m-role, .board-title")) {
            e.preventDefault(); e.target.blur(); return;
        }
        if (e.key === "Enter" && e.target.matches && e.target.matches("[data-sub-add]")) {
            e.preventDefault();
            var tidSub = e.target.dataset.subAdd;
            var t = task(tidSub);
            if (t && e.target.value.trim()) {
                t.subtasks.push({ t: e.target.value.trim(), d: false });
                if (U.subDraft) delete U.subDraft[tidSub];
                commit();
            }
            return;
        }
        if (e.key === "Enter" && e.target.matches && e.target.matches("[data-addrow]")) {
            e.preventDefault();
            var gid = e.target.dataset.addrow;
            if (e.target.value.trim()) {
                var nt = { id: uid(), groupId: gid, title: e.target.value.trim(), creator: U.me, owners: [U.me], status: "nao", priority: "media", due: "", desc: "", subtasks: [], updates: [], doneAt: "", start: "" };
                S.tasks.push(nt); commit();
            }
            return;
        }
        if (e.key === "Enter" && (e.ctrlKey || e.metaKey) && e.target.matches && e.target.matches("[data-upd-add]")) {
            e.preventDefault();
            var tid = e.target.dataset.updAdd, t2 = task(tid);
            if (t2 && e.target.value.trim()) { t2.updates.push({ a: U.me, x: e.target.value.trim(), at: new Date().toISOString() }); if (U.updateDraft) delete U.updateDraft[tid]; commit(); }
            return;
        }
        if (e.key === "Escape") { hidePopover(); closeDrawer(); saveUI(); }
    }

    function onHash() {
        var hh = location.hash.replace("#", "");
        if (VIEWS.some(function (v) { return v.k === hh; })) { U.view = hh; saveUI(); renderAll(); }
    }

    function onSubmit(e) {
        if (e.target.id === "ideaForm") {
            e.preventDefault();
            var title = document.getElementById("ideaTitle").value.trim();
            var desc = document.getElementById("ideaDesc").value.trim();
            if (!title) return;
            S.ideas.push({ id: uid(), title: title, desc: desc, author: U.me, votes: 0, status: "nova", at: isoToday() });
            commit();
            return;
        }
        if (e.target.id === "rForm") {
            e.preventDefault();
            var form = e.target, id = form.dataset.id;
            var freq = form.querySelector("#rFreq").value;
            var days = freq === "semanal"
                ? Array.prototype.slice.call(form.querySelectorAll('input[name="rDay"]:checked')).map(function (c) { return +c.value; })
                : [];
            var dom = freq === "mensal" ? (+form.querySelector("#rDom").value || 1) : null;
            var data = {
                title: form.querySelector("#rTitle").value.trim(),
                owner: form.querySelector("#rOwner").value,
                groupId: form.querySelector("#rGroup").value,
                freq: freq,
                time: form.querySelector("#rTime").value,
                dom: dom,
                days: days
            };
            if (id) {
                var r = S.routines.find(function (x) { return x.id === id; });
                if (r) Object.assign(r, data);
            } else {
                S.routines.push(Object.assign({ id: uid(), creator: U.me, since: isoToday(), done: {} }, data));
            }
            U.editR = null;
            commit();
            return;
        }
    }

    function addGroup() {
        var name = prompt("Nome do departamento:");
        if (!name || !name.trim()) return;
        var g = { id: uid(), name: name.trim(), color: COLORS[S.groups.length % COLORS.length], collapsed: false };
        S.groups.push(g);
        commit();
    }

    function shiftDay(n) {
        if (n === 0) { U.rday = null; }
        else { var d = pd(U.rday || isoToday()); d.setDate(d.getDate() + n); U.rday = isoOf(d); }
        renderRotinas();
    }

    function copyToClipboard(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(function () { toast("Copiado!"); }).catch(function () { toast("Não foi possível copiar"); });
        } else {
            var ta = document.createElement("textarea");
            ta.value = text; ta.style.position = "fixed"; ta.style.left = "-9999px";
            document.body.appendChild(ta); ta.select();
            try { document.execCommand("copy"); toast("Copiado!"); } catch (e) { toast("Não foi possível copiar"); }
            document.body.removeChild(ta);
        }
    }

    function toggleFullscreen() {
        if (isFs()) {
            if (document.exitFullscreen) document.exitFullscreen();
            else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
            FS = false; renderNav();
        } else {
            var el = document.documentElement;
            if (el.requestFullscreen) el.requestFullscreen().catch(function () { FS = true; renderNav(); });
            else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
            else { FS = true; renderNav(); }
        }
    }

    function mmZoom(v) {
        if (!MM) return;
        if (v === "fit") U.mmZoom = null;
        else if (v === "+") U.mmZoom = Math.min(2, (MM.z || 1) + 0.1);
        else if (v === "-") U.mmZoom = Math.max(0.3, (MM.z || 1) - 0.1);
        mmFit();
    }

    /* ============================================================
       LOGIN + BOOTSTRAP
       ============================================================ */
    function showLogin(msg) {
        $("#root").innerHTML =
            '<div class="login"><div class="login-card">' +
            '<div class="ws-mark" style="width:48px;height:48px;font-size:22px;margin:0 auto 16px">D</div>' +
            '<h1>Gestão de Equipe Dismax</h1>' +
            '<p>Entre com seu e-mail corporativo.</p>' +
            '<form id="loginForm">' +
            '<input id="loginEmail" type="email" required placeholder="seu@email.com" autocomplete="email" autofocus>' +
            '<button class="btn primary" type="submit" id="loginBtn">Entrar</button>' +
            '</form>' +
            '<div id="loginErr" class="login-err">' + esc(msg || "") + '</div>' +
            '</div></div>';
    }

    function enterApp(member) {
        U.me = member.id;
        U.tipo = tipoDe(member);
        document.body.classList.add("logged");
        shell();
        renderAll();
    }

    function onLoginSubmit(e) {
        e.preventDefault();
        var email = ($("#loginEmail").value || "").trim().toLowerCase();
        var btn = $("#loginBtn"), err = $("#loginErr");
        if (!email) return;
        err.textContent = "";
        btn.disabled = true; btn.textContent = "Entrando…";

        syncFromRemote().then(function () {
            var found = S.members.find(function (m) { return (m.email || "").toLowerCase() === email; });
            if (found) {
                window.dxAuth.save(found);
                enterApp(found);
                return;
            }
            var sb = window.dxSupabase;
            if (!sb) throw new Error("E-mail não encontrado localmente e Supabase indisponível.");
            return sb.from("membros").select("*").ilike("email", email).maybeSingle().then(function (res) {
                if (res.error) throw res.error;
                if (!res.data) throw new Error("E-mail não cadastrado. Fale com o gerente.");
                var mapped = {
                    id: res.data.id,
                    name: res.data.name,
                    role: res.data.role,
                    email: res.data.email || "",
                    photo: res.data.photo_url || "",
                    color: res.data.color || "#0073ea",
                    departamentoId: res.data.departamento_id || ""
                };
                if (!S.members.some(function (m) { return m.id === mapped.id; })) S.members.push(mapped);
                localSave();
                window.dxAuth.save(mapped);
                enterApp(mapped);
            });
        }).catch(function (e2) {
            err.textContent = (e2 && e2.message) || "Erro ao entrar.";
            btn.disabled = false; btn.textContent = "Entrar";
        });
    }

    function bootstrap() {
        var saved = window.dxAuth ? window.dxAuth.load() : null;
        if (!saved || !saved.id) {
            syncFromRemote();
            showLogin();
            return;
        }

        // Renderiza rápido se já houver cache local e sincroniza em seguida
        var cachedMember = S.members.find(function (m) { return m.id === saved.id; });
        if (cachedMember) {
            enterApp(cachedMember);
            setBadge("Sincronizando…");
            syncFromRemote().then(function (synced) {
                if (!synced) { setBadge("Modo local"); return; }
                var fresh = S.members.find(function (m) { return m.id === saved.id; });
                if (!fresh) {
                    window.dxAuth.clear();
                    showLogin("Seu acesso foi removido. Fale com o gerente.");
                    return;
                }
                U.tipo = tipoDe(fresh);
                renderAll();
                setBadge("Sincronizado");
            });
            return;
        }

        // Sem cache local: aguarda carregamento remoto antes de abrir
        $("#root").innerHTML = '<div class="login"><div class="login-card"><p>Carregando quadro…</p></div></div>';
        syncFromRemote().then(function () {
            var member = S.members.find(function (m) { return m.id === saved.id; });
            if (member) {
                enterApp(member);
                setBadge("Sincronizado");
                return;
            }
            var sb = window.dxSupabase;
            if (!sb) { window.dxAuth.clear(); showLogin("Cliente Supabase indisponível."); return; }
            return sb.from("membros").select("*").eq("id", saved.id).maybeSingle().then(function (res) {
                if (res.data) {
                    var mapped = {
                        id: res.data.id,
                        name: res.data.name,
                        role: res.data.role,
                        email: res.data.email || "",
                        photo: res.data.photo_url || "",
                        color: res.data.color || "#0073ea",
                        departamentoId: res.data.departamento_id || ""
                    };
                    S.members.push(mapped);
                    localSave();
                    enterApp(mapped);
                } else {
                    window.dxAuth.clear();
                    showLogin("Sessão inválida. Entre novamente.");
                }
            });
        }).catch(function () {
            window.dxAuth.clear();
            showLogin("Erro ao validar sessão.");
        });
    }

    /* ============================================================
       LISTENERS
       ============================================================ */
    document.addEventListener("click", onClick);
    document.addEventListener("change", onChange);
    document.addEventListener("input", onInput);
    document.addEventListener("keydown", onKey);
    document.addEventListener("submit", function (e) {
        if (e.target.id === "loginForm") { onLoginSubmit(e); return; }
        onSubmit(e);
    });
    window.addEventListener("hashchange", onHash);
    document.addEventListener("fullscreenchange", function () { FS = false; if (U.view) renderNav(); });
    document.addEventListener("webkitfullscreenchange", function () { FS = false; if (U.view) renderNav(); });

    bootstrap();
})();