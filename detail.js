/* ===== 资源详情独立页交互（soft/<id>.html） =====
   页面里的资源信息已由构建脚本静态写入 window.__RESOURCE，
   这里负责浏览计数、点赞/收藏、评论与下载计数。 */
(function () {
    var RES = window.__RESOURCE;
    if (!RES) return;

    var host = (location.hostname || '').toLowerCase();
    var REMOTE = (host === 'znine.fun' || host === 'www.znine.fun' || host === 'ksny2025.github.io');
    var API = REMOTE ? 'https://api.znine.fun:54037' : '';
    var ROOT = window.__SITE_ROOT || '../';
    var backendOnline = !REMOTE;

    var current = RES;
    var els = {
        views: document.getElementById('dtViews'),
        likes: document.getElementById('dtLikes'),
        favs: document.getElementById('dtFavs'),
        dls: document.getElementById('dtDownloads'),
        likeBtn: document.getElementById('dtLikeBtn'),
        favBtn: document.getElementById('dtFavBtn'),
        replyList: document.getElementById('dtReplies'),
        replyCount: document.getElementById('dtReplyCount'),
        replyBox: document.getElementById('dtReplyBox'),
        replyHint: document.getElementById('dtReplyHint'),
        replyInput: document.getElementById('dtReplyInput'),
        replySend: document.getElementById('dtReplySend'),
        dlCount: document.getElementById('dtDlCount')
    };

    function token() { return localStorage.getItem('chat_token') || ''; }
    function username() { return localStorage.getItem('chat_username') || ''; }
    function num(v) { return Array.isArray(v) ? v.length : (Number(v) || 0); }
    function esc(s) {
        return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }
    function apiUrl(u) { return API ? API + u : u; }
    function apiGet(u) { return fetch(apiUrl(u)).then(function (r) { return r.json(); }); }
    function apiPost(u, body) {
        return fetch(apiUrl(u), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body || {})
        }).then(function (r) { return r.json(); });
    }
    function toast(msg) {
        var t = document.querySelector('.detail-toast');
        if (!t) {
            t = document.createElement('div');
            t.className = 'detail-toast';
            document.body.appendChild(t);
        }
        t.textContent = msg;
        clearTimeout(t._timer);
        t._timer = setTimeout(function () { t.remove(); }, 2200);
    }
    function loginHref() { return ROOT + 'chat.html'; }

    function renderStats() {
        if (els.views) els.views.textContent = num(current.views);
        if (els.likes) els.likes.textContent = num(current.likes);
        if (els.favs) els.favs.textContent = num(current.favs);
        if (els.likeBtn) {
            els.likeBtn.className = 'detail-btn' + (current.liked ? ' on' : '');
            els.likeBtn.innerHTML = (current.liked ? '已点赞' : '点赞') + ' <b>' + num(current.likes) + '</b>';
        }
        if (els.favBtn) {
            els.favBtn.className = 'detail-btn' + (current.fav ? ' on' : '');
            els.favBtn.innerHTML = (current.fav ? '已收藏' : '收藏') + ' <b>' + num(current.favs) + '</b>';
        }
    }

    function renderReplies() {
        var list = current.replies || [];
        if (els.replyCount) els.replyCount.textContent = '（' + list.length + '）';
        if (!els.replyList) return;
        if (!list.length) {
            els.replyList.innerHTML = '<div class="detail-empty">还没有评论，来抢沙发吧</div>';
            return;
        }
        els.replyList.innerHTML = list.map(function (r) {
            var mine = r.mine || (!!username() && r.username === username());
            return '<div class="detail-comment-item" data-rid="' + esc(r.id) + '">' +
                '<div class="detail-comment-head">' +
                    '<span class="detail-comment-name">' + esc(r.username || '匿名') + '</span>' +
                    '<span class="detail-comment-time">' + esc(r.time || '') +
                        (mine ? ' <button type="button" class="detail-comment-del" data-del="' + esc(r.id) + '">删除</button>' : '') +
                    '</span>' +
                '</div>' +
                '<div class="detail-comment-text">' + esc(r.text) + '</div>' +
            '</div>';
        }).join('');
    }

    function renderAuth() {
        var logged = !!token();
        if (els.replyBox) els.replyBox.style.display = logged ? '' : 'none';
        if (els.replyHint) {
            els.replyHint.style.display = logged ? 'none' : '';
            els.replyHint.innerHTML = '登录后即可点赞、收藏和评论，<a href="' + loginHref() + '">点此登录</a>';
        }
    }

    function renderDownloads() {
        if (!els.dls) return;
        apiGet('/api/downloads').then(function (res) {
            if (res && res.ok && res.downloads) {
                var n = res.downloads[current.name] || 0;
                els.dls.textContent = n;
                if (els.dlCount) els.dlCount.textContent = n;
            }
        }).catch(function () {});
    }

    function refresh() {
        if (!backendOnline) { renderStats(); renderReplies(); renderAuth(); return; }
        apiGet('/api/software').then(function (res) {
            if (res && res.ok && Array.isArray(res.software)) {
                for (var i = 0; i < res.software.length; i++) {
                    if (String(res.software[i].id) === String(RES.id)) {
                        current = res.software[i];
                        break;
                    }
                }
            }
            renderStats();
            renderReplies();
            renderAuth();
            renderDownloads();
        }).catch(function () {
            renderStats();
            renderReplies();
            renderAuth();
        });
    }

    // 直链：后端在线走隧道，否则回退到仓库同名文件
    function directHref(u) {
        var raw = String(u == null ? '' : u).trim();
        if (!raw) return '';
        if (/^https?:/i.test(raw)) return raw;
        var rel = raw.replace(/^\/+/, '');
        return (API && backendOnline) ? API + '/' + rel : ROOT + rel;
    }

    // IPv6 直连下载：只走 v6.znine.fun（仅有 AAAA 记录），IPv6 网络下绕开隧道
    var IPV6_BASE = 'https://v6.znine.fun:18081';
    var v6Probed = false;
    var v6Ok = false;
    var v6Waiters = [];

    function checkIpv6(cb) {
        if (!window.fetch) { cb(false); return; }
        var ac = null;
        try { ac = window.AbortController ? new AbortController() : null; } catch (e) { ac = null; }
        var timer = setTimeout(function () { if (ac) { try { ac.abort(); } catch (e) {} } }, 4000);
        fetch(IPV6_BASE + '/healthz?t=' + Date.now(), { cache: 'no-store', signal: ac ? ac.signal : undefined })
            .then(function (r) { return !!r.ok; })
            .catch(function () { return false; })
            .then(function (ok) { clearTimeout(timer); v6Ok = ok; cb(ok); });
    }

    function probeIpv6() {
        if (v6Probed || !REMOTE || !window.fetch) return;
        v6Probed = true;
        checkIpv6(function (ok) {
            if (ok) { finish(true); return; }
            // 首次失败后再试一次，避免网络刚就绪时误判
            setTimeout(function () { checkIpv6(finish); }, 800);
        });
        function finish(ok) {
            v6Ok = ok;
            v6Waiters.forEach(function (fn) { fn(ok); });
            v6Waiters = [];
        }
    }

    // 给相对 /files/ 直链补一个 IPv6 选项：默认展示，连不上时点击给出提示
    function addIpv6Option(a) {
        var raw = String(a.getAttribute('data-direct') || '').trim();
        if (!raw || /^https?:/i.test(raw)) return;
        var rel = raw.replace(/^\/+/, '');
        if (rel.indexOf('files/') !== 0) return;

        var res = window.__RESOURCE || {};
        var files = Array.isArray(res.files) ? res.files : [];
        var multi = files.length > 1;
        var href = IPV6_BASE + '/' + rel;
        if (files.length === 1 && files[0] && files[0].stored) {
            href = IPV6_BASE + '/files/' + encodeURIComponent(String(files[0].stored))
                + '/' + encodeURIComponent(String(files[0].name || files[0].stored));
        }

        var b = document.createElement('a');
        b.className = a.className;
        b.setAttribute('href', multi ? '#' : href);
        b.setAttribute('target', '_blank');
        b.setAttribute('rel', 'noopener noreferrer');
        b.setAttribute('data-ipv6', '1');
        b.innerHTML = '<b>IPv6 直链</b><small>'
            + (multi ? '共 ' + files.length + ' 个文件，点击选择' : 'IPv6 网络下更快')
            + '</small>';

        var hint = b.querySelector('small');
        var show = function (ok) {
            if (!ok && hint) hint.textContent = multi ? '需 IPv6 网络，点击仍可尝试' : '需 IPv6 网络，连不上会提示';
        };
        if (v6Probed) { show(v6Ok); } else { v6Waiters.push(show); }

        b.addEventListener('click', function (e) {
            var name = a.getAttribute('data-file') || '';
            if (name) apiPost('/api/download', { name: name }).catch(function () {});
            var openIt = function () {
                if (multi && window.zninePickFile) window.zninePickFile(files, IPV6_BASE);
                else window.open(href, '_blank', 'noopener');
            };
            if (multi) e.preventDefault();
            if (v6Ok) { if (multi) openIt(); return; }
            e.preventDefault();
            checkIpv6(function (ok) {
                if (ok) { openIt(); return; }
                if (window.confirm('当前网络连接不上 IPv6 服务器（可能没有 IPv6）。\n强制尝试下载可能失败，仍要继续吗？')) openIt();
            });
        });
        a.parentNode.insertBefore(b, a.nextSibling);
    }

    function initLinks() {
        document.querySelectorAll('[data-direct]').forEach(function (a) {
            a.setAttribute('href', directHref(a.getAttribute('data-direct')));
            a.setAttribute('target', '_blank');
            a.setAttribute('rel', 'noopener noreferrer');
            a.addEventListener('click', function () {
                var name = a.getAttribute('data-file') || '';
                if (!name) return;
                apiPost('/api/download', { name: name }).catch(function () {});
            });
            addIpv6Option(a);
        });
    }

    function initReact() {
        if (els.likeBtn) {
            els.likeBtn.addEventListener('click', function () {
                if (!token()) { location.href = loginHref(); return; }
                apiPost('/api/resource_react', { token: token(), id: current.id, action: 'like' }).then(function (res) {
                    if (res && res.ok) {
                        current.likes = res.likes;
                        current.favs = res.favs;
                        current.liked = res.liked;
                        current.fav = res.fav;
                        renderStats();
                    } else if (res && res.error) {
                        if (res.error.indexOf('登录') !== -1) { localStorage.removeItem('chat_token'); location.href = loginHref(); }
                        else toast(res.error);
                    }
                }).catch(function () { toast('无法连接服务器'); });
            });
        }
        if (els.favBtn) {
            els.favBtn.addEventListener('click', function () {
                if (!token()) { location.href = loginHref(); return; }
                apiPost('/api/resource_react', { token: token(), id: current.id, action: 'fav' }).then(function (res) {
                    if (res && res.ok) {
                        current.likes = res.likes;
                        current.favs = res.favs;
                        current.liked = res.liked;
                        current.fav = res.fav;
                        renderStats();
                    } else if (res && res.error) {
                        if (res.error.indexOf('登录') !== -1) { localStorage.removeItem('chat_token'); location.href = loginHref(); }
                        else toast(res.error);
                    }
                }).catch(function () { toast('无法连接服务器'); });
            });
        }
    }

    function initReplies() {
        if (els.replySend) {
            els.replySend.addEventListener('click', function () {
                if (!token()) { location.href = loginHref(); return; }
                var text = els.replyInput ? els.replyInput.value.trim() : '';
                if (!text) { toast('评论内容不能为空'); return; }
                els.replySend.disabled = true;
                apiPost('/api/resource_reply', { token: token(), id: current.id, text: text }).then(function (res) {
                    els.replySend.disabled = false;
                    if (res && res.ok) {
                        current.replies = res.replies || [];
                        if (els.replyInput) els.replyInput.value = '';
                        renderReplies();
                    } else {
                        toast((res && res.error) || '评论失败');
                    }
                }).catch(function () { els.replySend.disabled = false; toast('无法连接服务器'); });
            });
        }
        if (els.replyList) {
            els.replyList.addEventListener('click', function (e) {
                var btn = e.target.closest('[data-del]');
                if (!btn) return;
                if (!confirm('确定删除这条评论吗？')) return;
                apiPost('/api/resource_reply_del', { token: token(), id: current.id, rid: btn.getAttribute('data-del') }).then(function (res) {
                    if (res && res.ok) {
                        current.replies = res.replies || [];
                        renderReplies();
                    } else {
                        toast((res && res.error) || '删除失败');
                    }
                }).catch(function () {});
            });
        }
    }

    function countView() {
        var key = 'viewed_' + RES.id;
        if (sessionStorage.getItem(key)) return;
        sessionStorage.setItem(key, '1');
        apiPost('/api/resource_view', { id: current.id }).then(function (res) {
            if (res && res.ok) {
                current.views = res.views;
                renderStats();
            }
        }).catch(function () {});
    }

    // 后端在线状态探测
    function probe() {
        if (!API) { initLinks(); return; }
        probeIpv6();
        fetch(API + '/api/config').then(function (r) { return r.json(); }).then(function () {
            backendOnline = true;
        }).catch(function () {
            backendOnline = false;
        }).then(function () {
            initLinks();
        });
    }

    // 服务器上传的封面（/dlimg/...）在静态站不存在，远端时改走 API
    if (API) {
        document.querySelectorAll('img[data-api-img]').forEach(function (img) {
            var raw = img.getAttribute('data-api-img');
            if (!raw) return;
            img.setAttribute('data-fallback', img.getAttribute('src') || '');
            img.src = API + '/' + raw.replace(/^\/+/, '');
        });
    }

    renderStats();
    renderReplies();
    renderAuth();
    initReact();
    initReplies();
    probe();
    countView();
    if (API) renderDownloads();

    // 图片加载失败时回退到仓库内图片
    var coverImg = document.getElementById('dtCoverImg');
    if (coverImg) {
        coverImg.addEventListener('error', function () {
            var fb = coverImg.getAttribute('data-fallback');
            if (fb && coverImg.src.indexOf(fb) === -1) coverImg.src = fb;
        });
    }
})();
