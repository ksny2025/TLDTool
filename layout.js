/* ===== 共享顶栏（所有独立页面共用） =====
   - 根据自身脚本地址推导站点根目录，根目录页与 soft/ 子目录页都能正确跳转
   - 当前导航项由 <body data-nav="home|library|chat|profile"> 决定 */
(function () {
    var self = document.currentScript;
    var base = self && self.src ? self.src.replace(/[?#].*$/, '').replace(/[^/]*$/, '') : '';
    window.__SITE_ROOT = base;

    var aside = document.querySelector('.sidebar');
    if (!aside) return;

    var active = (document.body && document.body.getAttribute('data-nav')) || '';
    var hasApp = document.body && document.body.hasAttribute('data-has-app');

    function navItem(page, label, file) {
        return '<a class="nav-item' + (active === page ? ' active' : '') + '" data-page="' + page +
            '" href="' + base + file + '">' + label + '</a>';
    }

    // 导航下拉：资源分类（点一下展开/再点收起）
    var navCats = ['全部', '工具', '游戏', 'apk', '文件', '软件'];
    var curCat = '';
    try {
        curCat = new URLSearchParams(location.search).get('cat') || '';
    } catch (e) {}
    function dropLink(cat, label) {
        var href = base + 'library.html' + (cat === '全部' ? '' : '?cat=' + encodeURIComponent(cat));
        var on = (cat === '全部' ? (!curCat || curCat === '全部') : curCat === cat);
        return '<a href="' + href + '" role="menuitem"' + (on ? ' class="on"' : '') + '>' + label + '</a>';
    }
    var dropHtml = '<div class="nav-drop-wrap">' +
        '<a class="nav-item nav-drop-trigger' + (active === 'library' ? ' active' : '') + '" data-page="library"' +
            ' href="' + base + 'library.html" aria-haspopup="true" aria-expanded="false">资源库' +
            '<svg class="nav-drop-arrow" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>' +
        '</a>' +
        '<div class="nav-dropdown" id="navDropdown" role="menu" aria-label="资源分类">' +
            dropLink('全部', '全部资源') +
            dropLink('工具', '工具') +
            dropLink('游戏', '游戏') +
            dropLink('apk', 'apk') +
            dropLink('文件', '文件') +
            dropLink('软件', '软件') +
        '</div>' +
    '</div>';

    aside.innerHTML =
        '<div class="topbar">' +
            '<a class="logo-area" href="' + base + 'index.html" aria-label="BENBAIJIE 资源下载站首页">' +
                '<span class="brand-mark"><img src="' + base + 'logo.webp" alt="BENBAIJIE"></span>' +
                '<span class="brand-text">' +
                    '<b class="brand-name">BENBAIJIE</b>' +
                    '<span class="brand-sub">资源下载站</span>' +
                '</span>' +
            '</a>' +
            '<form class="hero-search top-search" id="heroSearchForm" role="search" autocomplete="off">' +
                '<span class="hero-search-icon">⌕</span>' +
                '<input type="search" id="heroSearchInput" placeholder="搜索资源：模组加载器、小助手、工具…" aria-label="搜索资源">' +
                '<button type="submit" class="hero-search-btn" id="heroSearchBtn">搜索</button>' +
            '</form>' +
            '<div class="topbar-actions">' +
                '<div class="music-player" id="musicPlayer">' +
                    '<button type="button" class="music-disc" id="musicDisc" aria-label="打开音乐播放器">' +
                        '<span class="music-ring"></span>' +
                        '<img class="music-disc-img" id="musicDiscImg" alt="" style="display:none;">' +
                        '<span class="music-note" id="musicNote">' +
                            '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M12 3v10.6a3 3 0 1 0 2 2.7V7h4V3h-6z"/></svg>' +
                        '</span>' +
                    '</button>' +
                    '<div class="music-panel" id="musicPanel">' +
                        '<div class="music-now">' +
                            '<div class="music-cover" id="musicCover"></div>' +
                            '<div class="music-now-text">' +
                                '<div class="music-title" id="musicTitle">暂无播放</div>' +
                                '<div class="music-artist" id="musicArtist">—</div>' +
                            '</div>' +
                            '<button type="button" class="music-x" id="musicClose" aria-label="收起播放器">✕</button>' +
                        '</div>' +
                        '<div class="music-ctrl">' +
                            '<button type="button" class="m-btn" id="musicPrev" aria-label="上一首">' +
                                '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M7 6h2v12H7zm3 6 9 6V6z"/></svg>' +
                            '</button>' +
                            '<button type="button" class="m-btn m-play" id="musicPlay" aria-label="播放">' +
                                '<svg class="m-ic-play" viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>' +
                                '<svg class="m-ic-pause" viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M7 5h4v14H7zM14 5h4v14h-4z"/></svg>' +
                            '</button>' +
                            '<button type="button" class="m-btn" id="musicNext" aria-label="下一首">' +
                                '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M15 6h2v12h-2zM5 6v12l9-6z"/></svg>' +
                            '</button>' +
                        '</div>' +
                        '<div class="music-list-head">歌单</div>' +
                        '<ul class="music-list" id="musicList"></ul>' +
                    '</div>' +
                '</div>' +
                '<button class="theme-btn" id="themeToggle" type="button" aria-label="切换深浅色"></button>' +
                '<a class="top-login" id="topLoginBtn" href="' + base + 'login.html">登录</a>' +
                '<button class="lang-btn top-lang" id="langBtn" type="button">EN</button>' +
            '</div>' +
        '</div>' +
        '<div class="nav-links">' +
            navItem('home', '主页', 'index.html') +
            dropHtml +
            navItem('chat', '聊天', 'chat.html') +
            navItem('profile', '我的', 'profile.html') +
            '<div class="nav-slider" id="navSlider"></div>' +
        '</div>';

    if (!document.getElementById('topLoginStyle')) {
        var st = document.createElement('style');
        st.id = 'topLoginStyle';
        st.textContent = '.top-login{display:inline-flex;align-items:center;height:34px;padding:0 16px;border-radius:999px;font-size:13px;font-weight:600;letter-spacing:.3px;color:#0f1216;background:linear-gradient(120deg,#7a94b0,#7ea09c);text-decoration:none;white-space:nowrap;transition:filter .18s,transform .18s;flex:none}' +
            '.top-login:hover{filter:brightness(1.08);transform:translateY(-1px)}' +
            '.top-login:active{transform:translateY(0)}' +
            '@media (max-width:560px){.top-login{height:31px;padding:0 12px;font-size:12px}}';
        document.head.appendChild(st);
    }

    var slider = aside.querySelector('#navSlider');
    var act = aside.querySelector('.nav-item.active');
    function placeSlider() {
        if (!slider || !act) return;
        slider.style.left = (act.offsetLeft - 5) + 'px';
        slider.style.width = (act.offsetWidth + 10) + 'px';
    }
    placeSlider();
    window.addEventListener('resize', placeSlider);

    // 资源库下拉菜单：点一下展开，再点收起（带伸缩动画）
    (function bindNavDropdown() {
        var trigger = aside.querySelector('.nav-drop-trigger');
        var drop = aside.querySelector('#navDropdown');
        if (!trigger || !drop) return;
        var isOpen = false;
        function place() {
            var r = trigger.getBoundingClientRect();
            var w = Math.max(160, r.width + 28);
            drop.style.width = w + 'px';
            var left = Math.min(r.left, window.innerWidth - w - 12);
            drop.style.left = Math.max(12, left) + 'px';
            drop.style.top = (r.bottom + 8) + 'px';
        }
        function setOpen(v) {
            isOpen = v;
            if (v) place();
            trigger.classList.toggle('open', v);
            drop.classList.toggle('open', v);
            trigger.setAttribute('aria-expanded', v ? 'true' : 'false');
        }
        trigger.addEventListener('click', function (e) {
            if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
            e.preventDefault();
            setOpen(!isOpen);
        });
        document.addEventListener('click', function (e) {
            if (!isOpen) return;
            if (!drop.contains(e.target) && !trigger.contains(e.target)) setOpen(false);
        }, true);
        document.addEventListener('keydown', function (e) {
            if (isOpen && (e.key === 'Escape' || e.key === 'Esc')) setOpen(false);
        });
        window.addEventListener('resize', function () { if (isOpen) place(); });
        window.addEventListener('scroll', function () { if (isOpen) place(); }, true);
        drop.addEventListener('click', function () { setOpen(false); });
    })();

    // 深浅色切换 + 顶栏高度同步（避免固定顶栏遮住内容）
    var rootEl = document.documentElement;
    var themeBtn = aside.querySelector('#themeToggle');
    function currentTheme() {
        return rootEl.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    }
    function paintTheme() {
        if (!themeBtn) return;
        if (currentTheme() === 'light') {
            themeBtn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.2 14.6A8.4 8.4 0 1 1 9.4 3.8a6.8 6.8 0 0 0 10.8 10.8z"/></svg>';
            themeBtn.title = '切换到深色';
        } else {
            themeBtn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3.6"/><path d="M12 5.4V2.6M12 18.6v2.8M5.4 12H2.6M18.6 12h2.8M7.3 7.3 5.4 5.4M16.7 7.3 18.6 5.4M16.7 16.7 18.6 18.6M7.3 16.7 5.4 18.6"/></svg>';
            themeBtn.title = '切换到浅色';
        }
    }
    function syncTopbarHeight() {
        rootEl.style.setProperty('--topbar-h', aside.offsetHeight + 'px');
    }
    paintTheme();
    syncTopbarHeight();
    window.addEventListener('resize', syncTopbarHeight);
    window.addEventListener('load', syncTopbarHeight);
    if (themeBtn) {
        themeBtn.addEventListener('click', function () {
            var next = currentTheme() === 'light' ? 'dark' : 'light';
            rootEl.setAttribute('data-theme', next);
            try { localStorage.setItem('site_theme_v3', next); } catch (e) {}
            paintTheme();
            syncTopbarHeight();
        });
    }

    // 详情页没有加载 script.js，这里补上搜索跳转与语言按钮的最小逻辑
    if (!hasApp) {
        var form = aside.querySelector('#heroSearchForm');
        var input = aside.querySelector('#heroSearchInput');
        if (form) {
            form.addEventListener('submit', function (e) {
                e.preventDefault();
                var q = input ? input.value.trim() : '';
                location.href = base + 'library.html' + (q ? '?q=' + encodeURIComponent(q) : '');
            });
        }
        var langBtn = aside.querySelector('#langBtn');
        if (langBtn) {
            var en = (localStorage.getItem('site_lang') || 'zh') === 'en';
            langBtn.textContent = en ? '中文' : 'EN';
            langBtn.addEventListener('click', function () {
                localStorage.setItem('site_lang', en ? 'zh' : 'en');
                location.reload();
            });
        }
    }
})();

/* 多文件选择面板：资源包含多个文件时，先列出文件再选择下载 */
(function () {
    if (window.zninePickFile) return;

    function fmtSize(n) {
        n = Number(n) || 0;
        if (n <= 0) return '';
        var u = ['B', 'KB', 'MB', 'GB'];
        var i = 0;
        while (n >= 1024 && i < u.length - 1) { n /= 1024; i++; }
        return (i === 0 ? n : n.toFixed(n >= 100 ? 0 : 1)) + ' ' + u[i];
    }

    window.zninePickFile = function (files, base, title) {
        if (!files || !files.length) return false;
        var old = document.getElementById('znine-pick-mask');
        if (old && old.parentNode) old.parentNode.removeChild(old);

        var wide = window.innerWidth > 560;
        var mask = document.createElement('div');
        mask.id = 'znine-pick-mask';
        mask.style.cssText = 'position:fixed;left:0;top:0;right:0;bottom:0;z-index:99999;'
            + 'background:rgba(0,0,0,.55);display:flex;padding:0 0 env(safe-area-inset-bottom,0);'
            + 'box-sizing:border-box;align-items:' + (wide ? 'center' : 'flex-end') + ';'
            + 'justify-content:center;overflow:auto;';

        var card = document.createElement('div');
        card.style.cssText = 'width:100%;max-width:480px;background:#fff;box-sizing:border-box;'
            + 'padding:18px 16px 20px;max-height:78vh;overflow:auto;'
            + 'border-radius:' + (wide ? '16px' : '18px 18px 0 0') + ';';

        var h = document.createElement('div');
        h.textContent = title || '选择要下载的文件';
        h.style.cssText = 'font:600 16px/1.4 system-ui,-apple-system,"Microsoft YaHei",sans-serif;'
            + 'color:#141821;margin:0 0 14px;';
        card.appendChild(h);

        files.forEach(function (f) {
            f = f || {};
            var stored = String(f.stored || '').replace(/^\/+/, '');
            var name = String(f.name || stored);
            if (!stored) return;
            var a = document.createElement('a');
            a.href = (base || 'https://v6.znine.fun:18081') + '/files/'
                + encodeURIComponent(stored) + '/' + encodeURIComponent(name);
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            a.style.cssText = 'display:block;padding:13px 14px;margin-bottom:10px;'
                + 'border:1px solid #e5e8ef;border-radius:12px;background:#fafbfd;'
                + 'text-decoration:none;color:#141821;-webkit-tap-highlight-color:transparent;';

            var nm = document.createElement('div');
            nm.textContent = name;
            nm.style.cssText = 'font:500 14px/1.45 system-ui,-apple-system,"Microsoft YaHei",sans-serif;'
                + 'word-break:break-all;';
            a.appendChild(nm);

            var sz = fmtSize(f.size);
            if (sz) {
                var sm = document.createElement('div');
                sm.textContent = sz;
                sm.style.cssText = 'font:400 12px/1.4 system-ui,sans-serif;color:#78819a;margin-top:3px;';
                a.appendChild(sm);
            }
            card.appendChild(a);
        });

        var btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = '取消';
        btn.style.cssText = 'width:100%;padding:13px;margin-top:2px;border:0;border-radius:12px;'
            + 'background:#eef1f6;color:#333;font:500 14px system-ui,-apple-system,sans-serif;'
            + '-webkit-tap-highlight-color:transparent;';
        btn.onclick = function () { if (mask.parentNode) mask.parentNode.removeChild(mask); };
        card.appendChild(btn);

        mask.appendChild(card);
        mask.addEventListener('click', function (e) {
            if (e.target === mask && mask.parentNode) mask.parentNode.removeChild(mask);
        });
        document.body.appendChild(mask);
        return true;
    };
})();
