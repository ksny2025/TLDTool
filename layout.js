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
                '<button class="lang-btn top-lang" id="langBtn" type="button">EN</button>' +
            '</div>' +
        '</div>' +
        '<div class="nav-links">' +
            navItem('home', '主页', 'index.html') +
            navItem('library', '资源库', 'library.html') +
            navItem('chat', '聊天', 'chat.html') +
            navItem('profile', '我的', 'profile.html') +
            '<div class="nav-slider" id="navSlider"></div>' +
        '</div>';

    var slider = aside.querySelector('#navSlider');
    var act = aside.querySelector('.nav-item.active');
    function placeSlider() {
        if (!slider || !act) return;
        slider.style.left = (act.offsetLeft - 5) + 'px';
        slider.style.width = (act.offsetWidth + 10) + 'px';
    }
    placeSlider();
    window.addEventListener('resize', placeSlider);

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
            try { localStorage.setItem('site_theme', next); } catch (e) {}
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
