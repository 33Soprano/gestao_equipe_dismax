/**
 * supabase-client.js — versão corrigida e segura contra sobrescrita parcial
 */
(function () {
    "use strict";

    /* ============================================================
       1. CONFIGURAÇÃO
       ============================================================ */
    var cfg = window.SUPABASE_CONFIG || window.dxConfig || window.supabaseConfig || window.CONFIG || {};
    var SB_URL = (cfg.url || cfg.SUPABASE_URL || cfg.supabaseUrl || window.SUPABASE_URL || "").replace(/\/+$/, "");
    var SB_KEY = cfg.anonKey || cfg.key || cfg.SUPABASE_ANON_KEY || cfg.anon_key || window.SUPABASE_ANON_KEY || window.supabaseKey || "";

    if (!SB_URL || !SB_KEY) {
        console.warn("[dxApi] ⚠️ SUPABASE_CONFIG.url/anonKey ausentes. Rodando em MODO LOCAL.");
        window.dxApi = makeOfflineApi("config ausente");
        return;
    }

    /* ============================================================
       2. CRIAÇÃO DO CLIENTE
       ============================================================ */
    var client = null;
    try {
        var sdk = window.supabase || (typeof supabase !== "undefined" ? supabase : null);
        if (!sdk || typeof sdk.createClient !== "function") {
            throw new Error("SDK @supabase/supabase-js não carregado");
        }
        var noop = {
            getItem: function () { return null; },
            setItem: function () { },
            removeItem: function () { }
        };
        client = sdk.createClient(SB_URL, SB_KEY, {
            auth: {
                persistSession: false,
                autoRefreshToken: false,
                detectSessionInUrl: false,
                storage: noop
            }
        });
        window.dxSupabase = client;
    } catch (e) {
        console.error("[dxApi] ❌ Falha ao criar cliente:", e && e.message);
        window.dxApi = makeOfflineApi("cliente: " + (e && e.message));
        return;
    }

    /* ============================================================
       3. HELPERS
       ============================================================ */
    function arr(v) { return Array.isArray(v) ? v : []; }
    function orNull(v) { return v === undefined || v === "" ? null : v; }
    function logWarn(msg) { console.warn("[dxApi]", msg); }
    function q(table) { return client.from(table); }

    function checkResult(op, table, r) {
        if (r && r.error) {
            logWarn(op + " " + table + ": " + r.error.message);
            var err = new Error(r.error.message);
            err.code = r.error.code;
            throw err;
        }
        return r;
    }

    function doUpsert(table, rows) {
        if (!rows || !rows.length) return Promise.resolve({ skipped: true });
        return q(table).upsert(rows, { onConflict: "id" })
            .then(function (r) { return checkResult("upsert", table, r); });
    }

    function doInsert(table, rows) {
        if (!rows || !rows.length) return Promise.resolve({ skipped: true });
        return q(table).insert(rows)
            .then(function (r) { return checkResult("insert", table, r); });
    }

    function doDeleteIn(table, column, values) {
        if (!values || !values.length) return Promise.resolve({ skipped: true });
        return q(table).delete().in(column, values)
            .then(function (r) { return checkResult("delete", table, r); });
    }

    function pruneOrphans(table, keepIds) {
        return q(table).select("id")
            .then(function (r) {
                checkResult("prune select", table, r);
                var existing = (r.data || []).map(function (x) { return x.id; });
                var orphans = existing.filter(function (id) { return keepIds.indexOf(id) < 0; });
                if (!orphans.length) return;
                return q(table).delete().in("id", orphans)
                    .then(function (r2) { return checkResult("prune delete", table, r2); });
            });
    }

    /* ============================================================
       4. PUBLISH
       ============================================================ */
    function publish(S, opts) {
        if (!S || !client) return Promise.resolve({ skipped: true, offline: !client });
        opts = opts || {};

        // Proteção contra envio de estado vazio não inicializado
        if (!arr(S.members).length && !arr(S.groups).length && !arr(S.tasks).length) {
            return Promise.resolve({ skipped: true, reason: "estado_vazio" });
        }

        var now = new Date().toISOString();
        var boardId = (S.board && S.board.id) || "00000000-0000-0000-0000-000000000001";

        var quadros = [{
            id: boardId,
            name: (S.board && S.board.name) || "Gestão de Equipe",
            description: (S.board && S.board.desc) || ""
        }];

        var membros = arr(S.members).map(function (m) {
            return {
                id: m.id,
                name: m.name || "",
                role: orNull(m.role),
                email: orNull(m.email),
                photo_url: orNull(m.photo),
                color: m.color || "#e2445c",
                departamento_id: orNull(m.departamentoId)
            };
        });

        var deps = arr(S.groups).map(function (g, i) {
            return {
                id: g.id,
                board_id: boardId,
                name: g.name || "",
                color: g.color || "#579bfc",
                collapsed: !!g.collapsed,
                order_index: i
            };
        });

        var tarefas = [], tarefasResps = [], subtarefas = [], atualizacoes = [];

        arr(S.tasks).forEach(function (t) {
            tarefas.push({
                id: t.id,
                group_id: t.groupId,
                creator_id: orNull(t.creator),
                title: t.title || "",
                description: orNull(t.desc),
                status: t.status || "nao",
                priority: t.priority || "media",
                start_date: orNull(t.start),
                due_date: orNull(t.due),
                done_at: orNull(t.doneAt)
            });

            arr(t.owners).forEach(function (oid) {
                if (oid) tarefasResps.push({ task_id: t.id, member_id: oid });
            });

            arr(t.subtasks).forEach(function (s, i) {
                subtarefas.push({
                    id: t.id + "::s" + i,
                    task_id: t.id,
                    title: s.t || "",
                    done: !!s.d,
                    order_index: i
                });
            });

            arr(t.updates).forEach(function (u, i) {
                if (!u.a) return;
                atualizacoes.push({
                    id: t.id + "::u" + i,
                    task_id: t.id,
                    author_id: u.a,
                    content: u.x || "",
                    created_at: u.at || now
                });
            });
        });

        var rotinas = [], execucoes = [];

        arr(S.routines).forEach(function (r) {
            var ownerId = r.owner || r.creator || (S.members && S.members[0] && S.members[0].id) || null;
            rotinas.push({
                id: r.id,
                group_id: r.groupId,
                owner_id: ownerId,
                creator_id: orNull(r.creator),
                title: r.title || "",
                frequency: r.freq || "uteis",
                days_of_week: r.days || null,
                day_of_month: r.dom || null,
                time: r.time || null,
                since: r.since || null
            });
            Object.keys(r.done || {}).forEach(function (iso) {
                if (r.done[iso]) {
                    execucoes.push({
                        id: r.id + "::" + iso,
                        routine_id: r.id,
                        execution_date: iso,
                        completed: true,
                        completed_at: now
                    });
                }
            });
        });

        var ideias = arr(S.ideas).map(function (x) {
            return {
                id: x.id,
                author_id: orNull(x.author),
                title: x.title || "",
                description: orNull(x.desc),
                votes: x.votes || 0,
                status: x.status || "nova",
                created_at: x.at || now.slice(0, 10)
            };
        });

        var taskIds = tarefas.map(function (t) { return t.id; });
        var routineIds = rotinas.map(function (r) { return r.id; });

        return Promise.resolve()
            .then(function () { return doUpsert("quadros", quadros); })
            .then(function () { return doUpsert("departamentos", deps); })
            .then(function () { return doUpsert("membros", membros); })
            .then(function () { return doUpsert("tarefas", tarefas); })
            .then(function () { return doUpsert("rotinas", rotinas); })
            .then(function () { return doUpsert("ideias", ideias); })
            .then(function () { return doDeleteIn("subtarefas", "task_id", taskIds); })
            .then(function () { return doDeleteIn("atualizacoes_tarefa", "task_id", taskIds); })
            .then(function () { return doDeleteIn("tarefas_responsaveis", "task_id", taskIds); })
            .then(function () { return doDeleteIn("execucoes_rotina", "routine_id", routineIds); })
            .then(function () { return doInsert("tarefas_responsaveis", tarefasResps); })
            .then(function () { return doInsert("subtarefas", subtarefas); })
            .then(function () { return doInsert("atualizacoes_tarefa", atualizacoes); })
            .then(function () { return doInsert("execucoes_rotina", execucoes); })
            .then(function () {
                // Apenas gerentes podem podar registros órfãos globais
                if (opts.isGerente) {
                    return Promise.resolve()
                        .then(function () { return pruneOrphans("tarefas", taskIds); })
                        .then(function () { return pruneOrphans("rotinas", routineIds); })
                        .then(function () { return pruneOrphans("departamentos", deps.map(function (d) { return d.id; })); })
                        .then(function () { return pruneOrphans("ideias", ideias.map(function (x) { return x.id; })); })
                        .then(function () {
                            if (opts.allowPruneMembers) {
                                return pruneOrphans("membros", membros.map(function (m) { return m.id; }));
                            }
                        });
                }
            })
            .then(function () { return { ok: true, at: now }; });
    }

    /* ============================================================
       5. LOAD
       ============================================================ */
    function load() {
        if (!client) return Promise.resolve(null);

        return Promise.all([
            q("quadros").select("*").limit(1).maybeSingle(),
            q("membros").select("*"),
            q("departamentos").select("*").order("order_index", { ascending: true }),
            q("tarefas").select("*"),
            q("tarefas_responsaveis").select("*"),
            q("subtarefas").select("*").order("order_index", { ascending: true }),
            q("atualizacoes_tarefa").select("*").order("created_at", { ascending: true }),
            q("rotinas").select("*"),
            q("execucoes_rotina").select("*"),
            q("ideias").select("*")
        ]).then(function (results) {
            results.forEach(function (res, idx) {
                if (res.error) throw res.error;
            });

            var board = results[0].data;
            var membros = results[1].data || [];
            var deps = results[2].data || [];
            var tarefas = results[3].data || [];
            var resps = results[4].data || [];
            var subs = results[5].data || [];
            var updates = results[6].data || [];
            var rotinas = results[7].data || [];
            var execs = results[8].data || [];
            var ideias = results[9].data || [];

            var ownersByTask = {};
            resps.forEach(function (r) { (ownersByTask[r.task_id] = ownersByTask[r.task_id] || []).push(r.member_id); });

            var subsByTask = {};
            subs.forEach(function (s) { (subsByTask[s.task_id] = subsByTask[s.task_id] || []).push({ t: s.title, d: !!s.done }); });

            var updatesByTask = {};
            updates.forEach(function (u) {
                (updatesByTask[u.task_id] = updatesByTask[u.task_id] || []).push({
                    a: u.author_id, x: u.content, at: u.created_at
                });
            });

            var doneByRoutine = {};
            execs.forEach(function (e) {
                if (e.completed) (doneByRoutine[e.routine_id] = doneByRoutine[e.routine_id] || {})[e.execution_date] = true;
            });

            return {
                board: board ? { id: board.id, name: board.name, desc: board.description || "" } : null,
                members: membros.map(function (m) {
                    return {
                        id: m.id,
                        name: m.name,
                        role: m.role,
                        email: m.email || "",
                        photo: m.photo_url || "",
                        color: m.color || "#0073ea",
                        departamentoId: m.departamento_id || ""
                    };
                }),
                groups: deps.map(function (g) {
                    return { id: g.id, name: g.name, color: g.color, collapsed: !!g.collapsed };
                }),
                tasks: tarefas.map(function (t) {
                    return {
                        id: t.id, groupId: t.group_id, creator: t.creator_id || "",
                        owners: ownersByTask[t.id] || [],
                        title: t.title, status: t.status, priority: t.priority,
                        start: t.start_date || "", due: t.due_date || "",
                        doneAt: t.done_at || "", desc: t.description || "",
                        subtasks: subsByTask[t.id] || [],
                        updates: updatesByTask[t.id] || []
                    };
                }),
                routines: rotinas.map(function (r) {
                    return {
                        id: r.id, groupId: r.group_id, owner: r.owner_id || "",
                        creator: r.creator_id || "", title: r.title,
                        freq: r.frequency, days: r.days_of_week || [],
                        dom: r.day_of_month || null, time: r.time || "",
                        since: r.since || "", done: doneByRoutine[r.id] || {}
                    };
                }),
                ideas: ideias.map(function (i) {
                    return {
                        id: i.id, author: i.author_id || "", title: i.title,
                        desc: i.description || "", votes: i.votes || 0,
                        status: i.status || "nova", at: i.created_at
                    };
                }),
                mm: { d: {}, t: {} },
                savedAt: Date.now()
            };
        }).catch(function (e) {
            logWarn("load falhou: " + (e && e.message));
            return null;
        });
    }

    /* ============================================================
       6. PING + SELF-TEST
       ============================================================ */
    function ping() {
        if (!client) return Promise.resolve(false);
        return q("membros").select("id").limit(1)
            .then(function (r) { return !r.error; })
            .catch(function () { return false; });
    }

    function selfTest() {
        if (!client) return Promise.resolve([]);
        var tables = [
            "quadros", "membros", "departamentos", "tarefas",
            "tarefas_responsaveis", "subtarefas", "atualizacoes_tarefa",
            "rotinas", "execucoes_rotina", "ideias"
        ];
        return Promise.all(tables.map(function (t) {
            return q(t).select("*").limit(1)
                .then(function (r) { return { table: t, ok: !r.error, error: r.error && r.error.message }; })
                .catch(function (e) { return { table: t, ok: false, error: e && e.message }; });
        })).then(function (r) { console.table(r); return r; });
    }

    /* ============================================================
       7. FALLBACK OFFLINE
       ============================================================ */
    function makeOfflineApi(reason) {
        return {
            publish: function () { return Promise.resolve({ offline: true, reason: reason }); },
            load: function () { return Promise.resolve(null); },
            ping: function () { return Promise.resolve(false); },
            selfTest: function () { return Promise.resolve([]); },
            client: null
        };
    }

    window.dxApi = {
        publish: publish,
        load: load,
        ping: ping,
        selfTest: selfTest,
        client: client
    };
})();