/* ===== 后端入口 =====
   znine.fun（GitHub Pages）上的页面直接通过 HTTPS 调用本机隧道后端；
   本地直接打开（18080）时保持原来的相对路径。
   后端连不上时，各模块自动回退到仓库里的静态 data/*.json。 */
(function () {
    var host = (location.hostname || '').toLowerCase();
    var remote = (host === 'znine.fun' || host === 'www.znine.fun' || host === 'ksny2025.github.io');
    window.__API_BASE = remote ? 'https://api.znine.fun:54037' : '';
    if (!window.__API_BASE) return;
    window.__apiUrl = function (u) {
        if (typeof u !== 'string' || !u) return u;
        if (u.charAt(0) === '/' && u.charAt(1) !== '/') return window.__API_BASE + u;
        return u;
    };
    var origFetch = window.fetch;
    if (!origFetch) return;
    window.fetch = function (input, init) {
        if (typeof input === 'string') input = window.__apiUrl(input);
        return origFetch.call(this, input, init);
    };
    // 后端图片加载失败时回退到 GitHub 静态图（捕获阶段委托，动态渲染的卡片也生效）
    document.addEventListener('error', function (e) {
        var t = e.target;
        if (!t || t.tagName !== 'IMG' || !t.getAttribute) return;
        if (t.getAttribute('data-fb')) {
            var fb = t.getAttribute('data-fb');
            t.removeAttribute('data-fb');
            t.src = fb;
        } else {
            // 没有备用图时直接隐藏破图，避免 alt 文字撑坏卡片布局
            t.style.display = 'none';
        }
    }, true);
})();

/* ===== 后端在线状态探测 =====
   直链下载优先走后端隧道（境内更快），隧道连不上时自动回退到 GitHub 仓库里的同名静态文件，
   保证离线（后端掉线）时下载依然可用。 */
(function () {
    window.__backendOnline = !window.__API_BASE; // 本地直接访问（18080）时本身就是后端
    window.__backendChecked = !window.__API_BASE;
    var cbs = [];
    window.__onBackendStatus = function (cb) {
        if (typeof cb !== 'function') return;
        if (window.__backendChecked) { cb(window.__backendOnline); return; }
        cbs.push(cb);
    };
    if (!window.__API_BASE) return;

    function finish(ok) {
        if (window.__backendChecked) return;
        window.__backendChecked = true;
        window.__backendOnline = ok;
        cbs.forEach(function (cb) { try { cb(ok); } catch (e) {} });
        cbs.length = 0;
    }
    var timer = setTimeout(function () { finish(false); }, 3000);
    var opt = { cache: 'no-store', credentials: 'omit' };
    if (window.AbortController) {
        var ac = new AbortController();
        opt.signal = ac.signal;
        setTimeout(function () { try { ac.abort(); } catch (e) {} }, 3000);
    }
    fetch(window.__API_BASE + '/api/config', opt).then(function (r) {
        clearTimeout(timer);
        finish(!!(r && r.ok));
    }).catch(function () {
        clearTimeout(timer);
        finish(false);
    });
})();

(function() {
    var bgLayer = document.createElement('div');
    bgLayer.className = 'aurora-bg';
    bgLayer.innerHTML =
        '<div class="aurora-orb orb-1"></div>' +
        '<div class="aurora-orb orb-2"></div>' +
        '<div class="aurora-orb orb-3"></div>';
    document.body.appendChild(bgLayer);

    var gridLayer = document.createElement('div');
    gridLayer.className = 'grid-overlay';
    document.body.appendChild(gridLayer);

    var isTouch = window.matchMedia('(hover: none)').matches;

    var navItems = document.querySelectorAll('.nav-item');
    var slider = document.getElementById('navSlider');
    var pages = {
        home: document.getElementById('home-page'),
        download: document.getElementById('download-page'),
        announcement: document.getElementById('announcement-page'),
        chat: document.getElementById('chat-page'),
        profile: document.getElementById('profile-page'),
        about: document.getElementById('about-page')
    };

    function updateSliderPosition(activeBtn) {
        if (!slider || !activeBtn) return;
        slider.style.left = (activeBtn.offsetLeft - 5) + 'px';
        slider.style.width = (activeBtn.offsetWidth + 10) + 'px';
    }

    function revealInPage(pageEl) {
        if (!pageEl) return;
        var items = pageEl.querySelectorAll('.reveal');
        items.forEach(function(el, i) {
            el.classList.remove('in-view');
        });
        requestAnimationFrame(function() {
            items.forEach(function(el, i) {
                setTimeout(function() {
                    el.classList.add('in-view');
                }, 60 + i * 55);
            });
        });
    }

    function switchPage(pageId, clickedBtn) {
        if (pageId !== 'profile' && typeof closeProfileManage === 'function') closeProfileManage();
        for (var key in pages) {
            if (pages[key]) pages[key].classList.remove('active-page');
        }
        var targetPage = pages[pageId];
        if (targetPage) {
            targetPage.style.animation = 'none';
            targetPage.offsetHeight;
            targetPage.classList.add('active-page');
            revealInPage(targetPage);
        }
        navItems.forEach(function(btn) {
            btn.classList.remove('active');
        });
        if (clickedBtn) clickedBtn.classList.add('active');
        updateSliderPosition(clickedBtn);
        var main = document.querySelector('.main-content');
        if (main) main.scrollTo({ top: 0, behavior: 'smooth' });
    }

    navItems.forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            var pageTarget = btn.getAttribute('data-page');
            if (pageTarget && pages[pageTarget]) {
                switchPage(pageTarget, btn);
            }
        });
    });

    var initialActive = document.querySelector('.nav-item.active');
    if (initialActive) updateSliderPosition(initialActive);
    window.addEventListener('resize', function() {
        var currentActive = document.querySelector('.nav-item.active');
        if (currentActive) updateSliderPosition(currentActive);
    });

    var subElem = document.querySelector('#home-page .home-sub');
    if (subElem) {
        var originalSub = subElem.innerText;
        var _T = function(s) { return window.T ? window.T(s) : s; };
        setTimeout(function() {
            subElem.innerText = _T('长途旅行小助手（他能为你的长途旅行添加模组！）');
            subElem.classList.add('fade-in');
            setTimeout(function() { subElem.classList.remove('fade-in'); }, 700);
        }, 600);
        setTimeout(function() {
            subElem.innerText = _T(originalSub);
            subElem.classList.add('fade-in');
            setTimeout(function() { subElem.classList.remove('fade-in'); }, 700);
        }, 6200);
        setTimeout(function() {
            subElem.innerText = _T('模组加载 | 助手工具 ');
            subElem.classList.add('fade-in');
            setTimeout(function() { subElem.classList.remove('fade-in'); }, 700);
        }, 9800);
    }

    // 软件卡片图片：点开大图（事件委托，兼容动态渲染的卡片）
    document.addEventListener('click', function(e) {
        var container = e.target.closest('.software-img');
        if (!container) return;
        if (container.closest('.tld-mod')) return; // 模组卡片点图片=打开详情页，不弹大图
        var imgElement = container.querySelector('img');
        if (imgElement && imgElement.src) {
            window.open(imgElement.src, '_blank');
        } else {
            var fallbackSrc = container.getAttribute('data-img-src');
            if (fallbackSrc) window.open(fallbackSrc, '_blank');
        }
    });

    var announcementItems = document.querySelectorAll('.announcement-item');
    announcementItems.forEach(function(item, idx) {
        item.classList.add('reveal');
        item.style.transitionDelay = idx * 70 + 'ms';
    });

    if (typeof IntersectionObserver !== 'undefined') {
        var io = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    entry.target.style.transitionDelay = '';
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, root: document.querySelector('.main-content') });
        document.querySelectorAll('.reveal').forEach(function(el) {
            io.observe(el);
        });
    } else {
        document.querySelectorAll('.reveal').forEach(function(el) {
            el.classList.add('in-view');
        });
    }

    // 卡片动效（倾斜+浮现），供下载页动态渲染后重新绑定
    function bindTilt(card) {
        var img = card.querySelector('.software-img');
        card.addEventListener('mousemove', function(e) {
            var rect = card.getBoundingClientRect();
            var x = e.clientX - rect.left;
            var y = e.clientY - rect.top;
            var px = x / rect.width;
            var py = y / rect.height;
            var rx = (py - 0.5) * -8;
            var ry = (px - 0.5) * 10;
            card.style.transform =
                'translateY(-6px) perspective(900px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg)';
            if (img) {
                img.style.setProperty('--mx', (px * 100) + '%');
                img.style.setProperty('--my', (py * 100) + '%');
            }
            card.style.setProperty('--mx', (px * 100) + '%');
            card.style.setProperty('--my', (py * 100) + '%');
        });
        card.addEventListener('mouseleave', function() {
            card.style.transform = '';
        });
    }

    window.__bindCardFx = function(scope) {
        var root = scope || document;
        var allCards = root.querySelectorAll('.software-card');
        if (typeof IntersectionObserver !== 'undefined') {
            if (!window.__cardObserver) {
                window.__cardObserver = new IntersectionObserver(function(entries) {
                    entries.forEach(function(entry) {
                        if (entry.isIntersecting) {
                            entry.target.style.transform = '';
                            entry.target.classList.remove('rising');
                            entry.target.offsetHeight;
                            entry.target.classList.add('rising');
                        } else {
                            entry.target.style.transform = '';
                            entry.target.classList.remove('rising');
                        }
                    });
                }, { threshold: 0.15, root: document.querySelector('.main-content') });
            }
            allCards.forEach(function(card) {
                if (card.dataset.fxBound) return;
                card.dataset.fxBound = '1';
                window.__cardObserver.observe(card);
                if (!isTouch) bindTilt(card);
            });
        } else {
            allCards.forEach(function(card) {
                if (!card.classList.contains('rising')) card.classList.add('rising');
            });
        }
    };

    window.__bindCardFx(document);

    var homeBtns = document.querySelectorAll('#home-page .social-btn, #about-page .group-btn');
    homeBtns.forEach(function(btn) {
        btn.addEventListener('mousemove', function(e) {
            var rect = btn.getBoundingClientRect();
            var x = e.clientX - rect.left - rect.width / 2;
            var y = e.clientY - rect.top - rect.height / 2;
            btn.style.transform = 'translate(' + (x * 0.15) + 'px, ' + (y * 0.25 - 2) + 'px)';
        });
        btn.addEventListener('mouseleave', function() {
            btn.style.transform = '';
        });
    });

    var initialPage = document.querySelector('.page-view.active-page');
    if (initialPage) revealInPage(initialPage);
})();

(function() {
    var authPane = document.getElementById('authPane');
    var chatPane = document.getElementById('chatPane');
    if (!authPane || !chatPane) return;

    var loginTab = document.getElementById('loginTab');
    var registerTab = document.getElementById('registerTab');
    var loginForm = document.getElementById('loginForm');
    var registerForm = document.getElementById('registerForm');
    var resetForm = document.getElementById('resetForm');
    var authError = document.getElementById('authError');
    var chatMessages = document.getElementById('chatMessages');
    var chatForm = document.getElementById('chatForm');
    var chatInput = document.getElementById('chatInput');
    var logoutBtn = document.getElementById('logoutBtn');
    var forgotLink = document.getElementById('forgotLink');
    var backToLogin = document.getElementById('backToLogin');
    var regCodeRow = document.getElementById('regCodeRow');
    var regCodeBtn = document.getElementById('regCodeBtn');
    var resetCodeBtn = document.getElementById('resetCodeBtn');

    var lastId = 0;
    var pollTimer = null;

    function getToken() {
        return localStorage.getItem('chat_token') || '';
    }

    function isAdmin() {
        return localStorage.getItem('chat_admin') === '1';
    }

    function setAuthVisible(showAuth) {
        authPane.style.display = showAuth ? '' : 'none';
        chatPane.style.display = showAuth ? 'none' : 'flex';
        annForm.style.display = (!showAuth && isAdmin()) ? 'flex' : 'none';
        if (!showAuth) {
            startPolling();
        } else {
            stopPolling();
        }
    }

    function showError(msg) {
        authError.textContent = msg || '';
    }

    function apiPost(path, data) {
        return fetch(path, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).then(function(res) { return res.json(); });
    }

    fetch('/api/config').then(function(res) { return res.json(); }).then(function(res) {
        if (res.ok && res.email_enabled) {
            regCodeRow.style.display = '';
            forgotLink.style.display = '';
        } else {
            regCodeRow.style.display = 'none';
            forgotLink.style.display = 'none';
        }
    }).catch(function() {});

    function showLoginForm() {
        loginForm.style.display = '';
        registerForm.style.display = 'none';
        resetForm.style.display = 'none';
        loginTab.classList.add('active');
        registerTab.classList.remove('active');
        showError('');
    }

    loginTab.addEventListener('click', showLoginForm);

    registerTab.addEventListener('click', function() {
        registerTab.classList.add('active');
        loginTab.classList.remove('active');
        registerForm.style.display = '';
        loginForm.style.display = 'none';
        resetForm.style.display = 'none';
        showError('');
    });

    forgotLink.addEventListener('click', function() {
        resetForm.style.display = '';
        loginForm.style.display = 'none';
        registerForm.style.display = 'none';
        showError('');
    });

    backToLogin.addEventListener('click', showLoginForm);

    function bindCodeBtn(btn, emailInputId, purpose) {
        btn.addEventListener('click', function() {
            var email = document.getElementById(emailInputId).value.trim();
            if (!email) {
                showError('请先填写邮箱');
                return;
            }
            showError('');
            btn.disabled = true;
            apiPost('/api/send_code', { email: email, purpose: purpose }).then(function(res) {
                if (res.ok) {
                    var n = 60;
                    btn.textContent = n + '秒后重发';
                    var timer = setInterval(function() {
                        n--;
                        if (n <= 0) {
                            clearInterval(timer);
                            btn.disabled = false;
                            btn.textContent = '获取验证码';
                        } else {
                            btn.textContent = n + '秒后重发';
                        }
                    }, 1000);
                } else {
                    btn.disabled = false;
                    showError(res.error || '发送失败');
                }
            }).catch(function() {
                btn.disabled = false;
                showError('无法连接服务器');
            });
        });
    }

    bindCodeBtn(regCodeBtn, 'regEmail', 'register');
    bindCodeBtn(resetCodeBtn, 'resetEmail', 'reset');

    function bindEmailCheck(inputId, hintId, allow) {
        var input = document.getElementById(inputId);
        var hint = document.getElementById(hintId);
        if (!input || !hint) return;
        input.addEventListener('input', function() {
            var v = input.value.trim();
            var bad = v.length > 0 && !(allow && allow.indexOf(v) !== -1) && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v);
            hint.classList.toggle('show', bad);
            input.classList.toggle('input-error', bad);
        });
    }

    bindEmailCheck('loginEmail', 'loginEmailHint', ['BENBAIJIE']);
    bindEmailCheck('regEmail', 'regEmailHint');
    bindEmailCheck('resetEmail', 'resetEmailHint');

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        showError('');
        apiPost('/api/login', {
            email: document.getElementById('loginEmail').value,
            password: document.getElementById('loginPassword').value
        }).then(function(res) {
            if (res.ok) {
                localStorage.setItem('chat_token', res.token);
                localStorage.setItem('chat_username', res.username);
                localStorage.setItem('chat_admin', res.is_admin ? '1' : '0');
                enterChat(res.username);
            } else {
                showError(res.error || '登录失败');
            }
        }).catch(function() {
            showError('无法连接服务器');
        });
    });

    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        showError('');
        apiPost('/api/register', {
            username: document.getElementById('regUsername').value,
            email: document.getElementById('regEmail').value,
            password: document.getElementById('regPassword').value,
            code: document.getElementById('regCode').value
        }).then(function(res) {
            if (res.ok) {
                localStorage.setItem('chat_token', res.token);
                localStorage.setItem('chat_username', res.username);
                localStorage.setItem('chat_admin', res.is_admin ? '1' : '0');
                enterChat(res.username);
            } else {
                showError(res.error || '注册失败');
            }
        }).catch(function() {
            showError('无法连接服务器');
        });
    });

    resetForm.addEventListener('submit', function(e) {
        e.preventDefault();
        showError('');
        apiPost('/api/reset_password', {
            email: document.getElementById('resetEmail').value,
            code: document.getElementById('resetCode').value,
            password: document.getElementById('resetPassword').value
        }).then(function(res) {
            if (res.ok) {
                showLoginForm();
                authError.style.color = '#7be3a8';
                showError('密码已重置，请用新密码登录');
                setTimeout(function() { authError.style.color = ''; }, 3000);
            } else {
                showError(res.error || '重置失败');
            }
        }).catch(function() {
            showError('无法连接服务器');
        });
    });

    logoutBtn.addEventListener('click', function() {
        apiPost('/api/logout', { token: getToken() });
        localStorage.removeItem('chat_token');
        localStorage.removeItem('chat_username');
        localStorage.removeItem('chat_admin');
        setAuthVisible(true);
        window.dispatchEvent(new Event('authchange'));
    });

    function enterChat(username) {
        window.dispatchEvent(new Event('authchange'));
        setAuthVisible(false);
        lastId = 0;
        chatMessages.innerHTML = '';
        loadMessages();
    }

    function escapeHtml(str) {
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    function avatarHtml(url, name) {
        if (url) return '<img class="avatar" src="' + (window.__apiUrl ? window.__apiUrl(url) : url) + '" alt="">';
        return '<span class="avatar avatar-letter">' + escapeHtml((name || '?').charAt(0).toUpperCase()) + '</span>';
    }

    function formatTime(ts) {
        var d = new Date(ts * 1000);
        function pad(n) { return n < 10 ? '0' + n : '' + n; }
        return pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
    }

    function isNearBottom() {
        return chatMessages.scrollHeight - chatMessages.scrollTop - chatMessages.clientHeight < 80;
    }

    function renderMessages(list) {
        var myName = localStorage.getItem('chat_username') || '';
        var stick = isNearBottom() || lastId === 0;
        var empty = chatMessages.querySelector('.chat-empty');
        if (empty) empty.remove();
        list.forEach(function(m) {
            if (chatMessages.querySelector('[data-id="' + m.id + '"]')) {
                lastId = Math.max(lastId, m.id);
                return;
            }
            var item = document.createElement('div');
            item.className = 'chat-msg' + (m.username === myName ? ' mine' : '');
            item.setAttribute('data-id', m.id);
            var meta = '<div class="chat-msg-meta">' + avatarHtml(m.avatar, m.username) + '<span class="chat-msg-name">' + escapeHtml(m.username) + '</span>';
            if (m.admin) meta += '<span class="admin-badge">管理员</span>';
            meta += ' · ' + formatTime(m.time);
            if (isAdmin()) meta += ' <button type="button" class="chat-del" data-del="' + m.id + '" title="删除">✕</button>';
            meta += '</div>';
            item.innerHTML = meta + '<div class="chat-msg-bubble">' + escapeHtml(m.content) + '</div>';
            chatMessages.appendChild(item);
            lastId = Math.max(lastId, m.id);
        });
        if (stick) chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    chatMessages.addEventListener('click', function(e) {
        var btn = e.target.closest('.chat-del');
        if (!btn) return;
        var id = btn.getAttribute('data-del');
        apiPost('/api/delete_message', { token: getToken(), id: id }).then(function(res) {
            if (res.ok) {
                var item = chatMessages.querySelector('[data-id="' + id + '"]');
                if (item) item.remove();
            }
        }).catch(function() {});
    });

    function loadMessages() {
        fetch('/api/messages?after=' + lastId)
            .then(function(res) { return res.json(); })
            .then(function(res) {
                if (res.ok) {
                    if (lastId === 0 && res.messages.length === 0) {
                        chatMessages.innerHTML = '<div class="chat-empty">还没有消息，来发第一条吧！</div>';
                    } else {
                        renderMessages(res.messages);
                    }
                }
            })
            .catch(function() {});
    }

    function startPolling() {
        stopPolling();
        pollTimer = setInterval(function() {
            if (document.getElementById('chat-page').classList.contains('active-page')) {
                loadMessages();
            }
        }, 3000);
    }

    function stopPolling() {
        if (pollTimer) {
            clearInterval(pollTimer);
            pollTimer = null;
        }
    }

    chatForm.addEventListener('submit', function(e) {
        e.preventDefault();
        var content = chatInput.value.trim();
        if (!content) return;
        chatInput.value = '';
        apiPost('/api/messages', { token: getToken(), content: content })
            .then(function(res) {
                if (res.ok && res.message) {
                    renderMessages([res.message]);
                } else if (!res.ok && res.error) {
                    localStorage.removeItem('chat_token');
                    localStorage.removeItem('chat_username');
                    localStorage.removeItem('chat_admin');
                    setAuthVisible(true);
                    showError(res.error);
                }
            })
            .catch(function() {});
        chatInput.focus();
    });

    function authHeaders() {
        return { 'Authorization': 'Bearer ' + getToken() };
    }

    var tabChat = document.getElementById('tabChat');
    var tabForum = document.getElementById('tabForum');
    var chatView = document.getElementById('chatView');
    var forumView = document.getElementById('forumView');
    var forumList = document.getElementById('forumList');
    var forumSearch = document.getElementById('forumSearch');
    var postForm = document.getElementById('postForm');
    var postDetail = document.getElementById('postDetail');
    var newPostBtn = document.getElementById('newPostBtn');
    var postsCache = [];

    newPostBtn.addEventListener('click', function() {
        postForm.style.display = postForm.style.display === 'none' ? 'flex' : 'none';
    });

    document.getElementById('cancelPostBtn').addEventListener('click', function() {
        postForm.style.display = 'none';
    });

    tabChat.addEventListener('click', function() {
        tabChat.classList.add('active');
        tabForum.classList.remove('active');
        chatView.style.display = '';
        forumView.style.display = 'none';
    });

    tabForum.addEventListener('click', function() {
        tabForum.classList.add('active');
        tabChat.classList.remove('active');
        forumView.style.display = '';
        chatView.style.display = 'none';
        backToList();
        loadPosts();
    });

    var searchTimer = null;
    forumSearch.addEventListener('input', function() {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(loadPosts, 400);
    });

    function loadPosts(reopenId) {
        var q = forumSearch.value.trim();
        fetch('/api/posts?q=' + encodeURIComponent(q), { headers: authHeaders() })
            .then(function(res) { return res.json(); })
            .then(function(res) {
                if (res.ok) {
                    postsCache = res.posts;
                    renderPosts(res.posts);
                    if (reopenId) openPost(reopenId);
                }
            }).catch(function() {});
    }

    function renderPosts(posts) {
        if (!posts.length) {
            forumList.innerHTML = '<div class="forum-empty">' + T('没有找到相关帖子') + '</div>';
            return;
        }
        forumList.innerHTML = posts.map(function(p) {
            var t = tagsHtml(p.tags);
            return '<div class="post-row" data-id="' + p.id + '">' +
                '<span class="post-row-icon">📄</span>' +
                '<span class="post-row-title">' + escapeHtml(p.title) + '</span>' +
                '<span class="post-row-tags">' + t + '</span>' +
                '<span class="post-row-counts">❤ ' + p.likes + T(' · 回复 ') + p.replies.length + '</span>' +
                '<span class="post-row-meta">' + formatTime(p.time) + ' · ' + escapeHtml(p.username) + '</span>' +
                '</div>';
        }).join('');
        forumList.querySelectorAll('.tag-chip').forEach(function(el) { el.addEventListener('click', tagClick); });
    }

    function openPost(id) {
        var p = postsCache.find(function(x) { return x.id === id; });
        if (!p) return;
        var h = '<button type="button" class="f-btn f-back" id="backToList">' + T('← 返回列表') + '</button>';
        h += '<div class="post" data-id="' + p.id + '">';
        h += '<div class="post-head">' + avatarHtml(p.avatar, p.username) + '<span class="post-name">' + escapeHtml(p.username) + '</span>';
        h += '<span class="post-followers">' + p.followers + T(' 粉丝') + '</span>';
        if (!p.is_own) h += '<button type="button" class="f-btn f-follow' + (p.following ? ' following' : '') + '" data-user="' + escapeHtml(p.username) + '">' + (p.following ? T('已关注') : T('+ 关注')) + '</button>';
        h += '<span class="post-time">' + formatTime(p.time) + '</span></div>';
        h += '<div class="post-title">' + escapeHtml(p.title) + '</div>';
        if (p.tags && p.tags.length) h += '<div class="post-tags">' + tagsHtml(p.tags) + '</div>';
        h += '<div class="post-content">' + escapeHtml(p.content) + '</div>';
        h += '<div class="post-actions">';
        h += '<button type="button" class="f-btn f-like' + (p.liked ? ' liked' : '') + '">' + (p.liked ? '❤' : '♡') + ' ' + p.likes + '</button>';
        h += '<span class="post-followers">' + p.replies.length + T(' 条回复') + '</span>';
        if (p.can_del) h += '<button type="button" class="f-btn f-del">' + T('删除') + '</button>';
        h += '</div>';
        h += '<div class="post-replies">';
        p.replies.forEach(function(r) {
            h += '<div class="reply"><div class="reply-head">' + avatarHtml(r.avatar, r.username) + '<span class="reply-name">' + escapeHtml(r.username) + '</span><span>' + formatTime(r.time) + '</span></div><div class="reply-content">' + escapeHtml(r.content) + '</div></div>';
        });
        h += '<form class="reply-form"><input type="text" placeholder="' + T('写下你的回复...') + '" maxlength="500" required><button type="submit" class="f-btn">' + T('回复') + '</button></form>';
        h += '</div></div>';
        forumList.style.display = 'none';
        postForm.style.display = 'none';
        postDetail.innerHTML = h;
        postDetail.style.display = '';
        postDetail.querySelectorAll('.tag-chip').forEach(function(el) { el.addEventListener('click', tagClick); });
    }

    function backToList() {
        postDetail.style.display = 'none';
        postDetail.innerHTML = '';
        forumList.style.display = '';
    }

    function tagsHtml(tags) {
        if (!tags || !tags.length) return '';
        return tags.map(function(t) {
            return '<span class="tag-chip" data-tag="' + escapeHtml(t) + '">#' + escapeHtml(t) + '</span>';
        }).join('');
    }

    function tagClick(e) {
        var chip = e.target.closest('.tag-chip');
        if (!chip) return;
        e.stopPropagation();
        forumSearch.value = chip.getAttribute('data-tag');
        backToList();
        loadPosts();
    }

    postForm.addEventListener('submit', function(e) {
        e.preventDefault();
        apiPost('/api/posts', {
            token: getToken(),
            title: document.getElementById('postTitle').value,
            content: document.getElementById('postContent').value,
            tags: document.getElementById('postTags').value
        }).then(function(res) {
            if (res.ok) {
                postForm.reset();
                postForm.style.display = 'none';
                loadPosts();
            }
        }).catch(function() {});
    });

    forumView.addEventListener('click', function(e) {
        if (e.target.closest('#backToList')) {
            backToList();
            return;
        }
        var postEl = e.target.closest('.post');
        if (postEl) {
            var id = postEl.getAttribute('data-id');
            var likeBtn = e.target.closest('.f-like');
            if (likeBtn) {
                apiPost('/api/post_like', { token: getToken(), id: id }).then(function(res) {
                    if (res.ok) {
                        likeBtn.classList.toggle('liked', res.liked);
                        likeBtn.textContent = (res.liked ? '❤ ' : '♡ ') + res.likes;
                    }
                }).catch(function() {});
                return;
            }
            var followBtn = e.target.closest('.f-follow');
            if (followBtn) {
                apiPost('/api/follow', { token: getToken(), username: followBtn.getAttribute('data-user') }).then(function(res) {
                    if (res.ok) {
                        followBtn.classList.toggle('following', res.following);
                        followBtn.textContent = res.following ? '已关注' : '+ 关注';
                        var f = postEl.querySelector('.post-followers');
                        if (f) f.textContent = res.followers + ' 粉丝';
                    }
                }).catch(function() {});
                return;
            }
            var delBtn = e.target.closest('.f-del');
            if (delBtn) {
                apiPost('/api/post_delete', { token: getToken(), id: id }).then(function(res) {
                    if (res.ok) {
                        backToList();
                        loadPosts();
                    }
                }).catch(function() {});
                return;
            }
            return;
        }
        var row = e.target.closest('.post-row');
        if (row) openPost(row.getAttribute('data-id'));
    });

    forumView.addEventListener('submit', function(e) {
        var form = e.target.closest('.reply-form');
        if (!form) return;
        e.preventDefault();
        var postEl = form.closest('.post');
        var input = form.querySelector('input');
        var content = input.value.trim();
        if (!content) return;
        var pid = postEl.getAttribute('data-id');
        apiPost('/api/post_reply', { token: getToken(), id: pid, content: content }).then(function(res) {
            if (res.ok) loadPosts(pid);
        }).catch(function() {});
    });

    var annList = document.getElementById('annList');
    var annForm = document.getElementById('annForm');
    var annError = document.getElementById('annError');

    function formatDate(ts) {
        var d = new Date(ts * 1000);
        return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    }

    var annsCache = [];
    var editingAnnId = null;

    function loadAnnouncements() {
        if (!annList) return;
        function renderAnns(announcements) {
            annsCache = announcements;
            annList.innerHTML = announcements.map(function(a) {
                var h = '<div class="announcement-item">';
                h += '<div class="announcement-title">' + escapeHtml(a.title) + '</div>';
                h += '<div class="announcement-meta"><span>' + T('日期 ') + formatDate(a.time) + '</span><span>' + T('作者 ') + escapeHtml(a.author) + '</span></div>';
                h += '<div class="announcement-content">' + escapeHtml(a.content) + '</div>';
                if (isAdmin()) h += '<div class="compose-btns ann-btns"><button type="button" class="f-btn ann-edit" data-id="' + a.id + '">' + T('编辑') + '</button><button type="button" class="f-btn ann-del" data-id="' + a.id + '">' + T('删除') + '</button></div>';
                return h + '</div>';
            }).join('');
        }
        fetch('/api/announcements').then(function(res) { return res.json(); }).then(function(res) {
            if (res && res.ok) { renderAnns(res.announcements); return; }
            throw new Error('no api');
        }).catch(function() {
            fetch('data/announcements.json').then(function(res) { return res.json(); }).then(function(arr) {
                renderAnns(arr);
            }).catch(function() {});
        });
    }

    annForm.addEventListener('submit', function(e) {
        e.preventDefault();
        annError.textContent = '';
        var payload = {
            token: getToken(),
            title: document.getElementById('annTitle').value,
            content: document.getElementById('annContent').value
        };
        var url = '/api/announcement';
        if (editingAnnId) {
            url = '/api/announcement_edit';
            payload.id = editingAnnId;
        }
        apiPost(url, payload).then(function(res) {
            if (res.ok) {
                annForm.reset();
                editingAnnId = null;
                annForm.querySelector('.f-btn.primary').textContent = T('发布公告');
                loadAnnouncements();
            } else {
                annError.textContent = res.error || '发布失败';
            }
        }).catch(function() { annError.textContent = '无法连接服务器'; });
    });

    annList.addEventListener('click', function(e) {
        var edit = e.target.closest('.ann-edit');
        if (edit) {
            var a = annsCache.find(function(x) { return x.id === edit.getAttribute('data-id'); });
            if (a) {
                editingAnnId = a.id;
                document.getElementById('annTitle').value = a.title;
                document.getElementById('annContent').value = a.content;
                annForm.querySelector('.f-btn.primary').textContent = T('保存修改');
                annForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }
        var del = e.target.closest('.ann-del');
        if (!del) return;
        apiPost('/api/announcement_delete', { token: getToken(), id: del.getAttribute('data-id') }).then(function(res) {
            if (res.ok) loadAnnouncements();
        }).catch(function() {});
    });

    document.querySelectorAll('.nav-item').forEach(function(btn) {
        btn.addEventListener('click', function() {
            if (btn.getAttribute('data-page') === 'announcement') loadAnnouncements();
        });
    });

    window.addEventListener('langchange', function() {
        loadAnnouncements();
        if (getToken()) loadPosts();
    });

    loadAnnouncements();

    var savedToken = getToken();
    if (savedToken) {
        fetch('/api/me', { headers: { 'Authorization': 'Bearer ' + savedToken } })
            .then(function(res) { return res.json(); })
            .then(function(res) {
                if (res.ok) {
                    localStorage.setItem('chat_username', res.username);
                    localStorage.setItem('chat_admin', res.is_admin ? '1' : '0');
                    enterChat(res.username);
                } else {
                    localStorage.removeItem('chat_token');
                    localStorage.removeItem('chat_username');
                    localStorage.removeItem('chat_admin');
                    window.dispatchEvent(new Event('authchange'));
                }
            })
            .catch(function() {});
    }
})();

(function() {
    // 资源库：搜索 / 排序 / 多渠道下载 / 登录后上传资源
    var grid = document.getElementById('downloadGrid');
    if (!grid) return;
    var homeFeatured = document.getElementById('homeFeatured');
    var searchInput = document.getElementById('dlSearchInput');
    var searchClear = document.getElementById('dlSearchClear');
    var sortSelect = document.getElementById('dlSort');
    var uploadBtn = document.getElementById('dlUploadBtn');
    var uploadAdminWrap = document.getElementById('dlUploadAdmin');
    var uploadToggle = document.getElementById('dlUploadToggle');
    var uploadOpen = false;
    var loginHint = document.getElementById('dlLoginHint');
    var loginLink = document.getElementById('dlLoginLink');
    var emptyBox = document.getElementById('dlEmpty');
    var emptyReset = document.getElementById('dlEmptyReset');
    var totalLabel = document.getElementById('dlTotal');
    var statResources = document.getElementById('statResources');
    var viewAllBtn = document.getElementById('viewAllBtn');

    // 我的（个人中心）：收藏 / 点赞 / 上传 / 回复
    var profilePage = document.getElementById('profile-page');
    var profileCard = document.getElementById('profileCard');
    var profileManagePane = document.getElementById('profileManagePane');
    var profileListCard = document.getElementById('profileListCard');
    var profileTabs = document.getElementById('profileTabs');
    var profileGrid = document.getElementById('profileGrid');
    var profileEmpty = document.getElementById('profileEmpty');
    var profileEmptyTitle = document.getElementById('profileEmptyTitle');
    var profileEmptySub = document.getElementById('profileEmptySub');
    var profileGoLibrary = document.getElementById('profileGoLibrary');
    var profileTab = 'fav';
    var profileMe = null;
    var pmAvatar = document.getElementById('pmAvatar');
    var pmAvatarInput = document.getElementById('pmAvatarInput');
    var pmAvatarMsg = document.getElementById('pmAvatarMsg');
    var pmAccountStats = document.getElementById('pmAccountStats');
    var pmChangePwdForm = document.getElementById('pmChangePwdForm');
    var pmPwdError = document.getElementById('pmPwdError');

    var modal = document.getElementById('dlModal');
    var modalTitle = document.getElementById('dlModalTitle');
    var swError = document.getElementById('swError');
    var imgInput = document.getElementById('swImage');
    var imgPreview = document.getElementById('swImgPreview');
    var imgThumb = document.getElementById('swImgThumb');
    var imgClear = document.getElementById('swImgClear');
    var saveBtn = document.getElementById('swSaveBtn');

    var list = [];
    var downloads = {};
    var query = '';
    var sortMode = 'default';
    var editingId = null;
    var pendingImage = null; // 'KEEP' 保持原图 | 'CLEAR' 移除 | 'DATA:...' 新图 | null 无操作
    var activeCat = '全部';
    var CATS = ['工具', '游戏', 'apk', '文件', '软件'];
    var TLD_SUBS = ['模组', '存档'];
    var viewedIds = {};

    function num(v) { return typeof v === 'number' ? v : ((v && v.length) || 0); }
    function heat(s) {
        return (downloads[s.name] || 0) * 3 + num(s.likes) * 5 + num(s.favs) * 4 + num(s.views) + ((s.replies || []).length) * 2;
    }

    function isAdmin() { return localStorage.getItem('chat_admin') === '1'; }
    function getToken() { return localStorage.getItem('chat_token') || ''; }
    function getUsername() { return localStorage.getItem('chat_username') || ''; }
    function T(s) { return window.T ? window.T(s) : s; }
    function esc(s) {
        return String(s == null ? '' : s).replace(/[&<>"']/g, function(c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }
    function apiPost(path, data) {
        return fetch(path, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).then(function(res) { return res.json(); });
    }
    function canManage(s) {
        return isAdmin() || (!!s.uploader && !!getUsername() && s.uploader === getUsername());
    }

    // 解析下载地址：url=直链，其余为各个网盘镜像（兼容老数据把网盘链接填在 url 里）
    function ways(s) {
        var direct = String(s.url == null ? '' : s.url).trim();
        var pan = String(s.pan == null ? '' : s.pan).trim();
        if (/feijipan\.com/i.test(direct)) {
            if (!pan) pan = direct;
            direct = '';
        }
        if (direct && !/^https?:/i.test(direct)) {
            var rel = direct.replace(/^\/+/, '');
            // 后端在线时直链走隧道，离线回退到仓库内的同名文件
            direct = (window.__API_BASE && window.__backendOnline) ? window.__API_BASE + '/' + rel : rel;
        }
        return {
            direct: direct,
            pan: pan,
            quark: String(s.quark == null ? '' : s.quark).trim(),
            pan123: String(s.pan123 == null ? '' : s.pan123).trim(),
            baidu: String(s.baidu == null ? '' : s.baidu).trim()
        };
    }

    function mirrors(s) {
        var w = ways(s);
        var out = [];
        if (w.direct) out.push({ kind: 'direct', label: '直链下载', sub: '速度快，推荐', url: w.direct });
        if (w.pan) out.push({ kind: 'pan', label: '小飞机网盘', sub: '不限速，无需登录', url: w.pan });
        if (w.quark) out.push({ kind: 'quark', label: '夸克网盘', sub: '整合全部资源', url: w.quark });
        if (w.pan123) out.push({ kind: 'pan123', label: '123 网盘', sub: '整合全部资源', url: w.pan123 });
        if (w.baidu) out.push({ kind: 'baidu', label: '百度网盘', sub: '需登录百度账号', url: w.baidu });
        return out;
    }

    // ---- 搜索 / 排序 ----
    function matches(s) {
        if (activeCat !== '全部' && (s.category || '其他') !== activeCat) return false;
        if (!query) return true;
        var hay = [s.name, s.desc, s.author, s.version, s.uploader].join(' ').toLowerCase();
        return query.toLowerCase().split(/\s+/).filter(Boolean).every(function(term) {
            return hay.indexOf(term) !== -1;
        });
    }

    function sorted(arr) {
        var out = arr.slice();
        if (sortMode === 'name') {
            out.sort(function(a, b) { return String(a.name).localeCompare(String(b.name), 'zh-CN'); });
        } else if (sortMode === 'new') {
            out.sort(function(a, b) { return String(b.date || '').localeCompare(String(a.date || '')); });
        } else if (sortMode === 'hot') {
            out.sort(function(a, b) { return heat(b) - heat(a); });
        } else if (sortMode === 'dl') {
            out.sort(function(a, b) { return (downloads[b.name] || 0) - (downloads[a.name] || 0); });
        }
        return out;
    }

    // ---- 渲染 ----
    function imgSrc(s) {
        var raw = s.image ? String(s.image) : '';
        if (!raw) return null;
        if (window.__API_BASE && !/^https?:/i.test(raw)) {
            return { src: window.__API_BASE + '/' + raw.replace(/^\/+/, ''), fb: raw };
        }
        return { src: raw, fb: '' };
    }

    function cardHtml(s, withTools, isHot) {
        var im = imgSrc(s);
        var h = '<div class="software-card" data-id="' + esc(s.id) + '" data-name="' + esc(s.name) + '">';
        h += '<div class="software-img"' + (im ? ' data-img-src="' + esc(im.src) + '"' : '') + '>';
        if (im) {
            h += '<img src="' + esc(im.src) + '" alt="' + esc(s.name) + '"'
               + (im.fb ? ' data-fb="' + esc(im.fb) + '"' : '') + '>';
        }
        h += '<span class="dl-cat-badge">' + esc(T(s.category || '其他')) + '</span>';
        if (s.category === '长途旅行' && s.sub) h += '<span class="dl-sub-badge">' + esc(T(s.sub)) + '</span>';
        if (s.status === 'pending') h += '<span class="dl-pending-badge">' + T('待审核') + '</span>';
        if (isHot) h += '<span class="dl-hot-badge">' + T('热门') + '</span>';
        h += '</div><div class="software-info">';
        h += '<div class="software-name">' + esc(s.name) + '</div>';
        h += '<div class="software-desc">' + esc(s.desc) + '</div>';
        h += '<div class="version-meta">版本 ' + esc(s.version || '-')
           + ' | 日期 ' + esc(s.date || '-')
           + ' | 大小 ' + esc(s.size || '-')
           + ' | 作者 ' + esc(s.author || '-');
        if (s.uploader && !s.uploader_admin) h += ' | 上传 ' + esc(s.uploader);
        h += '<span class="dl-count" data-soft="' + esc(s.name) + '">' + T(' · 下载 ')
           + (downloads[s.name] || 0) + T(' 次') + '</span></div>';
        h += '<div class="dl-mini-stats">'
           + '<span>' + T('点赞') + ' ' + num(s.likes) + '</span>'
           + '<span>' + T('收藏') + ' ' + num(s.favs) + '</span>'
           + '<span>' + T('回复') + ' ' + (s.replies || []).length + '</span>'
           + '<span>' + T('浏览') + ' ' + num(s.views) + '</span>'
           + '</div>';
        if (mirrors(s).length) {
            h += '<button type="button" class="download-btn" data-id="' + esc(s.id) + '">' + T('下载') + '</button>';
        }
        if (withTools && canManage(s)) {
            h += '<div class="dl-tools">';
            if (isAdmin() && s.status === 'pending') {
                h += '<button type="button" class="f-btn dl-approve">' + T('通过') + '</button>'
                   + '<button type="button" class="f-btn dl-reject">' + T('拒绝') + '</button>';
            }
            h += '<button type="button" class="f-btn dl-edit">' + T('编辑') + '</button>'
               + '<button type="button" class="f-btn dl-del">' + T('删除') + '</button>';
            if (isAdmin()) {
                h += '<button type="button" class="f-btn dl-up" title="上移">↑</button>'
                   + '<button type="button" class="f-btn dl-down" title="下移">↓</button>';
            }
            h += '</div>';
        }
        h += '</div></div>';
        return h;
    }

    function uploadAllowed() {
        return isAdmin() || uploadOpen;
    }

    function homeCompactHtml(s) {
        var im = imgSrc(s);
        var h = '<div class="software-card home-card-item" data-id="' + esc(s.id) + '" data-name="' + esc(s.name) + '">';
        h += '<div class="software-img"' + (im ? ' data-img-src="' + esc(im.src) + '"' : '') + '>';
        h += '<span class="hc-fallback">' + esc(String(s.name || '?').charAt(0)) + '</span>';
        if (im) {
            h += '<img src="' + esc(im.src) + '" alt="' + esc(s.name) + '"'
               + (im.fb ? ' data-fb="' + esc(im.fb) + '"' : '') + '>';
        }
        h += '</div><div class="hc-body">';
        h += '<div class="hc-name">' + esc(s.name) + '</div>';
        h += '<div class="hc-desc">' + esc(s.desc) + '</div>';
        var hcVer = String(s.version || '-').replace(/^v\s*/i, '');
        h += '<div class="hc-meta">v' + esc(hcVer)
           + ' · ' + esc(s.size || '-')
           + ' · ' + esc(T('下载')) + ' ' + (downloads[s.name] || 0) + '</div>';
        h += '</div>';
        if (mirrors(s).length) {
            h += '<button type="button" class="download-btn hc-dl" data-id="' + esc(s.id) + '">' + T('下载') + '</button>';
        }
        h += '</div>';
        return h;
    }

    function hotRowHtml(s, index) {
        return '<button type="button" class="hot-row" data-id="' + esc(s.id) + '">'
             + '<span class="hot-rank">' + (index + 1) + '</span>'
             + '<span class="hot-name">' + esc(s.name) + '</span>'
             + '<span class="hot-meta">↓ ' + (downloads[s.name] || 0) + '</span>'
             + '</button>';
    }


    function syncAuthUI() {
        var logged = !!getToken();
        if (uploadAdminWrap) uploadAdminWrap.style.display = isAdmin() ? '' : 'none';
        if (uploadToggle) uploadToggle.checked = uploadOpen;
        if (uploadBtn) {
            var allowed = uploadAllowed();
            uploadBtn.textContent = allowed
                ? (logged ? T('＋ 上传资源') : T('＋ 上传资源（需登录）'))
                : T('上传功能已关闭');
            uploadBtn.disabled = !allowed;
            uploadBtn.classList.toggle('is-off', !allowed);
        }
        if (loginHint) loginHint.style.display = (logged || !uploadOpen) ? 'none' : '';
    }

    function loadSettings() {
        fetch('/api/settings').then(function(res) { return res.json(); }).then(function(res) {
            if (res && res.ok) {
                uploadOpen = !!res.upload_open;
                syncAuthUI();
            }
        }).catch(function() {});
    }

    var chipsBox = document.getElementById('dlChips');

    // 网站资源榜单排除「长途旅行」（那部分归到「玩家分享」标签）
    function siteItems() {
        return list.filter(function(s) { return (s.category || '') !== '长途旅行'; });
    }

    function renderChips() {
        if (!chipsBox) return;
        var items = siteItems();
        var counts = {};
        items.forEach(function(s) {
            var c = s.category || '其他';
            counts[c] = (counts[c] || 0) + 1;
        });
        var cats = ['全部'].concat(CATS);
        chipsBox.innerHTML = cats.map(function(c) {
            var n = (c === '全部') ? items.length : (counts[c] || 0);
            return '<button type="button" class="tld-chip' + (activeCat === c ? ' active' : '')
                 + '" data-cat="' + esc(c) + '">' + esc(T(c)) + ' <span>' + n + '</span></button>';
        }).join('');
    }

    if (chipsBox) {
        chipsBox.addEventListener('click', function(e) {
            var chip = e.target.closest('.tld-chip');
            if (!chip) return;
            activeCat = chip.getAttribute('data-cat') || '全部';
            render();
        });
    }

    // ---- 玩家分享（长途旅行 · 模组 / 存档）----
    var shareGrid = document.getElementById('shareGrid');
    var shareChips = document.getElementById('shareChips');
    var shareEmpty = document.getElementById('shareEmpty');
    var shareTotal = document.getElementById('shareTotal');
    var shareSearchInput = document.getElementById('shareSearchInput');
    var shareSearchClear = document.getElementById('shareSearchClear');
    var shareQuery = '';
    var shareSub = '全部';

    function shareItems() {
        return list.filter(function(s) { return (s.category || '') === '长途旅行'; });
    }

    function renderShare() {
        if (!shareGrid) return;
        var items = shareItems();
        var counts = { '模组': 0, '存档': 0 };
        items.forEach(function(s) { if (s.sub && counts[s.sub] !== undefined) counts[s.sub]++; });
        if (shareChips) {
            shareChips.innerHTML = ['全部'].concat(TLD_SUBS).map(function(sb) {
                var n = (sb === '全部') ? items.length : (counts[sb] || 0);
                return '<button type="button" class="tld-chip' + (shareSub === sb ? ' active' : '')
                     + '" data-sub="' + esc(sb) + '">' + esc(T(sb)) + ' <span>' + n + '</span></button>';
            }).join('');
        }
        var q = shareQuery.toLowerCase();
        var out = items.filter(function(s) {
            if (shareSub !== '全部' && (s.sub || '') !== shareSub) return false;
            if (!q) return true;
            return [s.name, s.desc, s.author, s.uploader].join(' ').toLowerCase().indexOf(q) !== -1;
        }).sort(function(a, b) { return String(b.date || '').localeCompare(String(a.date || '')); });
        shareGrid.innerHTML = out.map(function(s) { return cardHtml(s, true, false); }).join('');
        if (shareEmpty) shareEmpty.style.display = out.length ? 'none' : '';
        if (shareTotal) shareTotal.textContent = T('共 ') + items.length + T(' 个分享');
        if (window.__bindCardFx) window.__bindCardFx(shareGrid);
        if (window.__applyLangText) window.__applyLangText(shareGrid);
    }

    if (shareChips) {
        shareChips.addEventListener('click', function(e) {
            var chip = e.target.closest('.tld-chip');
            if (!chip) return;
            shareSub = chip.getAttribute('data-sub') || '全部';
            renderShare();
        });
    }
    if (shareSearchInput) {
        shareSearchInput.addEventListener('input', function() {
            shareQuery = shareSearchInput.value.trim();
            if (shareSearchClear) shareSearchClear.style.display = shareQuery ? 'block' : 'none';
            renderShare();
        });
    }
    if (shareSearchClear) {
        shareSearchClear.addEventListener('click', function() {
            shareSearchInput.value = '';
            shareQuery = '';
            shareSearchClear.style.display = 'none';
            renderShare();
        });
    }

    var hotOffset = 0;

    function render() {
        renderChips();
        var siteList = siteItems();
        var filtered = sorted(siteList.filter(matches));
        var hotIds = {};
        siteList.slice().sort(function(a, b) { return heat(b) - heat(a); })
            .filter(function(s) { return heat(s) > 0; }).slice(0, 3)
            .forEach(function(s) { hotIds[s.id] = 1; });
        grid.innerHTML = filtered.map(function(s) { return cardHtml(s, true, !!hotIds[s.id]); }).join('');
        if (homeFeatured) {
            var featured = siteList.slice().sort(function(a, b) {
                return String(b.date || '').localeCompare(String(a.date || ''));
            }).slice(0, 4);
            homeFeatured.innerHTML = featured.map(function(s) { return homeCompactHtml(s); }).join('');
        }

        var homeCats = document.getElementById('homeCatList');
        var homeCatTotal = document.getElementById('homeCatTotal');
        var homeHot = document.getElementById('homeHotList');
        if (homeCats) {
            homeCats.innerHTML = '<button type="button" class="portal-cat" data-cat="">'
                + '<span>' + T('全部') + '</span><b>' + siteList.length + '</b></button>'
                + CATS.map(function(c) {
                    var n = list.filter(function(s) { return (s.category || '') === c; }).length;
                    return '<button type="button" class="portal-cat" data-cat="' + esc(c) + '">'
                         + '<span>' + esc(T(c)) + '</span><b>' + n + '</b></button>';
                }).join('');
        }
        if (homeCatTotal) homeCatTotal.textContent = String(siteList.length);
        if (homeHot) {
            var hotSorted = siteList.slice().sort(function(a, b) {
                return (heat(b) - heat(a)) || (num(b.views) - num(a.views));
            });
            var hotList = hotSorted;
            if (hotOffset && hotSorted.length > 1) {
                hotList = hotSorted.slice(hotOffset).concat(hotSorted.slice(0, hotOffset));
            }
            hotList = hotList.slice(0, 6);
            homeHot.innerHTML = hotList.length
                ? hotList.map(function(s, i) { return hotRowHtml(s, i); }).join('')
                : '<div class="home-hot-empty">' + T('暂无资源') + '</div>';
        }

        if (emptyBox) emptyBox.style.display = filtered.length ? 'none' : '';
        if (emptyReset) emptyReset.style.display = query ? '' : 'none';
        if (totalLabel) {
            totalLabel.textContent = query
                ? T('找到 ') + filtered.length + T(' 个（共 ') + siteList.length + T(' 个资源）')
                : T('共 ') + siteList.length + T(' 个资源');
        }
        if (statResources) statResources.textContent = String(siteList.length);
        if (searchClear) searchClear.style.display = query ? '' : 'none';
        renderShare();
        syncAuthUI();
        if (window.__bindCardFx) { window.__bindCardFx(grid); if (homeFeatured) window.__bindCardFx(homeFeatured); }
        if (window.__applyLangText) { window.__applyLangText(grid); if (homeFeatured) window.__applyLangText(homeFeatured); }
        if (profileActive()) renderProfile();
    }

    // ---- 我的（个人中心）----
    function profileActive() {
        return !!(profilePage && profilePage.classList.contains('active-page'));
    }

    function myResources(kind) {
        var uname = getUsername();
        var arr;
        if (kind === 'like') {
            arr = list.filter(function(s) { return !!s.liked; });
        } else if (kind === 'mine') {
            arr = uname ? list.filter(function(s) { return s.uploader === uname; }) : [];
        } else if (kind === 'reply') {
            arr = list.filter(function(s) {
                return (s.replies || []).some(function(r) { return !!r.mine; });
            });
        } else {
            arr = list.filter(function(s) { return !!s.fav; });
        }
        return arr.slice().sort(function(a, b) {
            return String(b.date || '').localeCompare(String(a.date || ''));
        });
    }

    function profileCounts() {
        var uname = getUsername();
        return {
            fav: myResources('fav').length,
            like: myResources('like').length,
            mine: myResources('mine').length,
            reply: myResources('reply').length,
            uploader: uname
        };
    }

    function renderProfile() {
        if (!profilePage || !profileCard) return;
        var logged = !!getToken();
        if (!logged) {
            profileCard.innerHTML = '<div class="profile-guest">' +
                '<div class="profile-guest-icon">👤</div>' +
                '<div class="profile-guest-title">' + T('登录后查看你的收藏、点赞和上传') + '</div>' +
                '<div class="profile-guest-sub">' + T('收藏的资源会集中显示在这里，方便下次快速找到。') + '</div>' +
                '<button type="button" class="f-btn primary" data-pact="login">' + T('登录 / 注册') + '</button>' +
                '</div>';
            if (profileListCard) profileListCard.style.display = 'none';
            return;
        }
        if (profileListCard) profileListCard.style.display = '';
        var name = (profileMe && profileMe.username) || getUsername() || '?';
        var avatar = '';
        if (profileMe && profileMe.avatar) {
            var av = window.__apiUrl ? window.__apiUrl(profileMe.avatar) : profileMe.avatar;
            avatar = '<img class="avatar avatar-lg" src="' + esc(av) + '" alt="">';
        } else {
            avatar = '<span class="avatar avatar-lg avatar-letter">' + esc(name.charAt(0).toUpperCase()) + '</span>';
        }
        var sub = [];
        if (profileMe && profileMe.email) sub.push(esc(profileMe.email));
        if (profileMe && profileMe.is_admin) sub.push(T('管理员'));
        profileCard.innerHTML = '<div class="profile-head">' +
            '<div class="profile-avatar">' + avatar + '</div>' +
            '<div class="profile-id"><div class="profile-name">' + esc(name) + '</div>' +
            '<div class="profile-sub">' + (sub.length ? sub.join(' · ') : T('BENBAIJIE 资源站用户')) + '</div></div>' +
            '<div class="profile-actions">' +
            '<button type="button" class="f-btn" data-pact="account">' + T('账号管理') + '</button>' +
            '<button type="button" class="f-btn" data-pact="logout">' + T('退出登录') + '</button>' +
            '</div></div>' +
            '<div class="profile-stats">' +
            '<div class="profile-stat"><b>' + profileCounts().fav + '</b><span>' + T('我的收藏') + '</span></div>' +
            '<div class="profile-stat"><b>' + profileCounts().like + '</b><span>' + T('我的点赞') + '</span></div>' +
            '<div class="profile-stat"><b>' + profileCounts().mine + '</b><span>' + T('我上传的') + '</span></div>' +
            '<div class="profile-stat"><b>' + profileCounts().reply + '</b><span>' + T('我回复的') + '</span></div>' +
            '</div>';
        var counts = profileCounts();
        var tabs = [
            ['fav', '我的收藏'],
            ['like', '我的点赞'],
            ['mine', '我上传的'],
            ['reply', '我回复的']
        ];
        if (profileTabs) {
            profileTabs.innerHTML = tabs.map(function(t) {
                return '<button type="button" class="dl-tab' + (profileTab === t[0] ? ' active' : '') + '" data-ptab="' + t[0] + '">' +
                    T(t[1]) + ' <span>' + counts[t[0]] + '</span></button>';
            }).join('');
        }
        var items = myResources(profileTab);
        if (profileGrid) {
            profileGrid.innerHTML = items.map(function(s) {
                return cardHtml(s, profileTab === 'mine' && canManage(s), false);
            }).join('');
            if (window.__bindCardFx) window.__bindCardFx(profileGrid);
            if (window.__applyLangText) window.__applyLangText(profileGrid);
        }
        if (profileEmpty) {
            profileEmpty.style.display = items.length ? 'none' : '';
            if (!items.length) {
                var msg = profileTab === 'like'
                    ? ['还没有点赞任何资源', '喜欢的资源点个赞，下次好找回来']
                    : profileTab === 'mine'
                        ? ['还没有上传过资源', '点击资源库的「上传资源」分享你的作品']
                        : profileTab === 'reply'
                            ? ['还没有回复过资源', '在资源详情里参与讨论，回复会显示在这里']
                            : ['还没有收藏任何资源', '在资源详情点「收藏」，资源就会出现在这里'];
                profileEmptyTitle.textContent = T(msg[0]);
                profileEmptySub.textContent = T(msg[1]);
            }
        }
    }

    function loadProfileMe() {
        var tk = getToken();
        if (!tk) {
            profileMe = null;
            if (profileManagePane && profileManagePane.style.display !== 'none') closeProfileManage();
            if (profileActive()) renderProfile();
            return;
        }
        fetch('/api/me', { headers: { 'Authorization': 'Bearer ' + tk } }).then(function(res) {
            return res.json();
        }).then(function(res) {
            if (res && res.ok) {
                profileMe = res;
                // 同步账号管理面板的头像 / 关注等统计
                setPmAvatar(res.avatar);
                if (pmAccountStats) {
                    pmAccountStats.textContent = T('关注 ') + res.following + T(' · 粉丝 ') + res.followers + T(' · 发帖 ') + res.posts;
                }
                if (profileActive()) renderProfile();
            }
        }).catch(function() {});
    }

    function applyQuery(q) {
        query = String(q == null ? '' : q).trim();
        if (searchInput) searchInput.value = query;
        render();
    }

    function applyCat(c) {
        activeCat = CATS.indexOf(c) !== -1 ? c : '全部';
        query = '';
        if (searchInput) searchInput.value = '';
        render();
    }

    function goLibrary() {
        var nav = document.querySelector('.nav-item[data-page="download"]');
        if (nav) nav.click();
        setTimeout(function() { if (searchInput) searchInput.focus(); }, 320);
    }

    function goLogin() {
        var nav = document.querySelector('.nav-item[data-page="chat"]');
        if (nav) nav.click();
        var email = document.getElementById('loginEmail');
        if (email) setTimeout(function() { try { email.focus(); } catch (e) {} }, 380);
    }

    // ---- 下载方式选择弹窗 ----
    var choiceMask = document.createElement('div');
    choiceMask.className = 'dl-mask';
    choiceMask.id = 'dlChoice';
    choiceMask.style.display = 'none';
    choiceMask.innerHTML =
        '<div class="dl-modal dl-choice">' +
            '<h3>选择下载方式</h3>' +
            '<div class="dl-choice-name"></div>' +
            '<div class="dl-choice-list"></div>' +
            '<div class="compose-btns"><button type="button" class="f-btn" data-cancel="1">取消</button></div>' +
        '</div>';
    document.body.appendChild(choiceMask);

    var choiceName = choiceMask.querySelector('.dl-choice-name');
    var choiceList = choiceMask.querySelector('.dl-choice-list');

    function closeChoice() { choiceMask.style.display = 'none'; }

    function goDownload(url) {
        closeChoice();
        if (!url) return;
        var a = document.createElement('a');
        a.href = url;
        a.target = '_blank';
        a.rel = 'noopener';
        document.body.appendChild(a);
        a.click();
        a.remove();
    }

    function openChoice(s) {
        var ms = mirrors(s);
        if (!ms.length) return;
        var h3 = choiceMask.querySelector('h3');
        if (h3) h3.textContent = T('选择下载方式');
        var cancel = choiceMask.querySelector('[data-cancel]');
        if (cancel) cancel.textContent = T('取消');
        choiceName.textContent = s.name + (s.version ? ' · ' + s.version : '');
        choiceList.innerHTML = ms.map(function(m) {
            return '<button type="button" class="f-btn dl-choice-btn' + (m.kind === 'direct' ? ' primary' : '')
                 + '" data-url="' + esc(m.url) + '">' + esc(T(m.label))
                 + '<em>' + esc(T(m.sub)) + '</em></button>';
        }).join('');
        choiceMask.style.display = 'flex';
    }

    choiceMask.addEventListener('click', function(e) {
        if (e.target === choiceMask) { closeChoice(); return; }
        if (e.target.closest('[data-cancel]')) { closeChoice(); return; }
        var btn = e.target.closest('[data-url]');
        if (btn) goDownload(btn.getAttribute('data-url'));
    });

    // 后端在线状态确定后重绘一次，确保直链地址按在线/离线正确解析
    if (window.__onBackendStatus) {
        window.__onBackendStatus(function() { if (list.length) render(); });
    }

    // ---- 上传 / 编辑弹窗 ----
    var FIELD_IDS = ['swName', 'swDesc', 'swVersion', 'swDate', 'swSize', 'swAuthor',
                     'swUrl', 'swPan', 'swQuark', 'swPan123', 'swBaidu'];

    function todayStr() {
        var d = new Date();
        var m = String(d.getMonth() + 1);
        var day = String(d.getDate());
        return d.getFullYear() + '-' + (m.length < 2 ? '0' + m : m) + '-' + (day.length < 2 ? '0' + day : day);
    }

    function resetModal() {
        editingId = null;
        pendingImage = null;
        swError.textContent = '';
        imgInput.value = '';
        imgPreview.style.display = 'none';
        imgThumb.removeAttribute('src');
        var agree = document.getElementById('swAgree');
        if (agree) agree.checked = false;
        modalTitle.textContent = T('上传资源');
        saveBtn.textContent = T('上传资源');
        FIELD_IDS.forEach(function(id) {
            var el = document.getElementById(id);
            if (el) el.value = '';
        });
        var catReset = document.getElementById('swCat');
        if (catReset) catReset.value = CATS[0];
        var subReset = document.getElementById('swSub');
        if (subReset) subReset.value = TLD_SUBS[0];
        syncSwSubField();
        var swFileEl = document.getElementById('swFile');
        if (swFileEl) swFileEl.value = '';
        pendingDropFile = null;
        var swDropReset = document.getElementById('swDrop');
        if (swDropReset) {
            swDropReset.classList.remove('has-file');
            document.getElementById('swDropText').textContent = T('点击选择文件，或直接把文件拖到这里');
        }
    }

    function openModal(item) {
        resetModal();
        if (item) {
            editingId = item.id;
            ['swName', 'swDesc', 'swVersion', 'swDate', 'swSize', 'swAuthor',
             'swUrl', 'swPan', 'swQuark', 'swPan123', 'swBaidu'].forEach(function(id, i) {
                document.getElementById(id).value = item[['name', 'desc', 'version', 'date', 'size', 'author',
                                                            'url', 'pan', 'quark', 'pan123', 'baidu'][i]] || '';
            });
            modalTitle.textContent = T('编辑资源');
            saveBtn.textContent = T('保存修改');
            var catEl = document.getElementById('swCat');
            if (catEl) catEl.value = CATS.indexOf(item.category) !== -1 ? item.category : CATS[0];
            var subEl = document.getElementById('swSub');
            if (subEl) subEl.value = TLD_SUBS.indexOf(item.sub) !== -1 ? item.sub : TLD_SUBS[0];
            syncSwSubField();
            if (item.image) {
                pendingImage = 'KEEP';
                var im = imgSrc(item);
                imgThumb.src = im ? im.src : item.image;
                imgPreview.style.display = 'flex';
            }
        } else {
            document.getElementById('swAuthor').value = isAdmin() ? 'BENBAIJIE' : getUsername();
            document.getElementById('swDate').value = todayStr();
        }
        var linkFields = document.getElementById('swLinkFields');
        var fileField = document.getElementById('swFileField');
        if (linkFields) linkFields.style.display = isAdmin() ? '' : 'none';
        if (fileField) fileField.style.display = '';
        modal.style.display = 'flex';
    }

    function closeModal() { modal.style.display = 'none'; }

    if (uploadBtn) uploadBtn.addEventListener('click', function() {
        if (!uploadAllowed()) { toast(T('上传功能已关闭，请联系管理员开启')); return; }
        if (!getToken()) { goLogin(); return; }
        openModal(null);
    });

    // 玩家分享：上传模组 / 存档（默认选中「长途旅行」分区）
    var shareUploadBtn = document.getElementById('shareUploadBtn');
    if (shareUploadBtn) shareUploadBtn.addEventListener('click', function() {
        if (!uploadAllowed()) { toast(T('上传功能已关闭，请联系管理员开启')); return; }
        if (!getToken()) { goLogin(); return; }
        openModal(null);
        var catEl = document.getElementById('swCat');
        if (catEl) {
            catEl.value = '长途旅行';
            syncSwSubField();
        }
    });

    if (uploadToggle) uploadToggle.addEventListener('change', function() {
        var want = !!uploadToggle.checked;
        apiPost('/api/admin/settings', { token: getToken(), upload_open: want }).then(function(res) {
            if (res && res.ok) {
                uploadOpen = !!res.upload_open;
                toast(uploadOpen ? T('已开启用户上传资源') : T('已关闭用户上传资源'));
            } else {
                uploadToggle.checked = !want;
                toast((res && res.error) || T('操作失败'));
            }
            syncAuthUI();
        }).catch(function() {
            uploadToggle.checked = !want;
            toast(T('操作失败'));
        });
    });
    if (loginLink) loginLink.addEventListener('click', goLogin);
    // 分区为「长途旅行」时显示 模组/存档 子类型
    var swCatEl = document.getElementById('swCat');
    function syncSwSubField() {
        var f = document.getElementById('swSubField');
        if (f) f.style.display = (swCatEl && swCatEl.value === '长途旅行') ? '' : 'none';
    }
    if (swCatEl) swCatEl.addEventListener('change', syncSwSubField);
    document.getElementById('swCancelBtn').addEventListener('click', closeModal);
    modal.addEventListener('click', function(e) { if (e.target === modal) closeModal(); });

    imgInput.addEventListener('change', function() {
        var file = imgInput.files && imgInput.files[0];
        if (!file) {
            if (pendingImage && pendingImage.indexOf('DATA:') === 0) pendingImage = null;
            imgPreview.style.display = (pendingImage === 'KEEP') ? 'flex' : 'none';
            if (pendingImage !== 'KEEP') imgThumb.removeAttribute('src');
            return;
        }
        if (!isAdmin() && file.size > 10 * 1024 * 1024) {
            swError.textContent = '图片太大（最大10MB）';
            imgInput.value = '';
            return;
        }
        swError.textContent = '';
        var reader = new FileReader();
        reader.onload = function() {
            pendingImage = 'DATA:' + reader.result;
            imgThumb.src = reader.result;
            imgPreview.style.display = 'flex';
        };
        reader.readAsDataURL(file);
    });

    imgClear.addEventListener('click', function() {
        pendingImage = 'CLEAR';
        imgInput.value = '';
        imgPreview.style.display = 'none';
        imgThumb.removeAttribute('src');
    });

    // ---- 文件拖拽：拖进来 = 选择文件 ----
    var swFileInput = document.getElementById('swFile');
    var swDrop = document.getElementById('swDrop');
    var swDropText = document.getElementById('swDropText');
    var pendingDropFile = null;

    function fmtFileSize(b) {
        var mb = b / 1048576;
        return mb >= 1 ? mb.toFixed(2) + ' MB' : Math.max(1, Math.round(b / 1024)) + ' KB';
    }

    function setSwFile(f) {
        if (!f || !swFileInput) return;
        try {
            var dt = new DataTransfer();
            dt.items.add(f);
            swFileInput.files = dt.files;
            pendingDropFile = null;
        } catch (e) { pendingDropFile = f; }
        swDropText.textContent = f.name + '（' + fmtFileSize(f.size) + '）';
        swDrop.classList.add('has-file');
        var nameEl = document.getElementById('swName');
        if (nameEl && !nameEl.value.trim()) nameEl.value = f.name.replace(/\.[^.]+$/, '');
        var sizeEl = document.getElementById('swSize');
        if (sizeEl && !sizeEl.value.trim()) sizeEl.value = fmtFileSize(f.size);
    }

    if (swFileInput && swDrop) {
        swFileInput.addEventListener('change', function() {
            if (swFileInput.files && swFileInput.files[0]) setSwFile(swFileInput.files[0]);
        });
        ['dragenter', 'dragover'].forEach(function(ev) {
            swDrop.addEventListener(ev, function(e) { e.preventDefault(); swDrop.classList.add('dragover'); });
        });
        ['dragleave', 'drop'].forEach(function(ev) {
            swDrop.addEventListener(ev, function(e) { e.preventDefault(); swDrop.classList.remove('dragover'); });
        });
        swDrop.addEventListener('drop', function(e) {
            var f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
            if (f) setSwFile(f);
        });
        // 拖到弹窗任意位置也算
        var dlModalBox = document.querySelector('#dlModal .dl-modal');
        if (dlModalBox) {
            dlModalBox.addEventListener('dragover', function(e) { e.preventDefault(); });
            dlModalBox.addEventListener('drop', function(e) {
                e.preventDefault();
                var f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
                if (f) setSwFile(f);
            });
        }
    }

    // 把文件拖到页面任意处：直接打开上传弹窗并选中该文件（同时防止浏览器把文件打开）
    document.addEventListener('dragover', function(e) { e.preventDefault(); });
    document.addEventListener('drop', function(e) {
        e.preventDefault();
        if (modal.style.display === 'flex') return; // 弹窗开着，交给弹窗自己的处理
        var f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
        if (!f) return;
        if (!uploadAllowed()) { toast(T('上传功能已关闭，请联系管理员开启')); return; }
        if (!getToken()) { toast(T('请先登录后再上传资源')); goLogin(); return; }
        openModal(null);
        setSwFile(f);
    });

    function toast(msg) {
        var el = document.createElement('div');
        el.className = 'site-toast';
        el.textContent = msg;
        document.body.appendChild(el);
        setTimeout(function() { el.classList.add('out'); }, 2200);
        setTimeout(function() { if (el.parentNode) el.remove(); }, 2800);
    }

    saveBtn.addEventListener('click', function() {
        var agreeBox = document.getElementById('swAgree');
        if (agreeBox && !agreeBox.checked) {
            swError.textContent = '请先勾选并确认遵守上传内容须知（禁止色情、暴力、血腥恶心等违规内容）';
            return;
        }
        var name = document.getElementById('swName').value.trim();
        if (!name) { swError.textContent = '资源名称不能为空'; return; }
        if (!getToken()) { goLogin(); return; }
        if (!uploadAllowed()) { swError.textContent = '上传功能已关闭，请联系管理员开启'; return; }
        var image;
        if (pendingImage === 'KEEP') image = 'keep';
        else if (pendingImage === 'CLEAR') image = '';
        else if (pendingImage && pendingImage.indexOf('DATA:') === 0) image = pendingImage.slice(5);
        else image = editingId ? 'keep' : '';
        saveBtn.disabled = true;
        var payload = {
            token: getToken(),
            id: editingId || '',
            name: name,
            desc: document.getElementById('swDesc').value,
            version: document.getElementById('swVersion').value,
            date: document.getElementById('swDate').value,
            size: document.getElementById('swSize').value,
            author: document.getElementById('swAuthor').value,
            url: '',
            pan: '',
            quark: '',
            pan123: '',
            baidu: '',
            category: (document.getElementById('swCat') || {}).value || CATS[0],
            sub: ((document.getElementById('swCat') || {}).value === '长途旅行') ? ((document.getElementById('swSub') || {}).value || TLD_SUBS[0]) : '',
            image: image
        };
        if (isAdmin()) {
            payload.url = document.getElementById('swUrl').value;
            payload.pan = document.getElementById('swPan').value;
            payload.quark = document.getElementById('swQuark').value;
            payload.pan123 = document.getElementById('swPan123').value;
            payload.baidu = document.getElementById('swBaidu').value;
            var aFile = document.getElementById('swFile').files[0] || pendingDropFile || null;
            if (aFile) { uploadAndSubmit(aFile, payload); return; }
            submitResource(payload);
            return;
        }
        var file = document.getElementById('swFile').files[0] || pendingDropFile || null;
        if (!file && !editingId) { saveBtn.disabled = false; swError.textContent = '请选择要上传的文件'; return; }
        if (!file) { submitResource(payload); return; }
        uploadAndSubmit(file, payload);
    });

    // 先把文件传到 /api/upload_file，拿到本站直链后再提交资源
    function uploadAndSubmit(file, payload) {
        saveBtn.textContent = T('上传中…');
        fetch('/api/upload_file', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + getToken(),
                'X-File-Name': encodeURIComponent(file.name)
            },
            body: file
        }).then(function(r) {
            return r.json().then(function(j) {
                if (!r.ok || !j.ok) throw new Error(j.error || '文件上传失败');
                return j;
            });
        }).then(function(j) {
            payload.url = j.url;
            if (!document.getElementById('swSize').value) {
                document.getElementById('swSize').value = (j.size / 1048576).toFixed(2) + ' MB';
                payload.size = document.getElementById('swSize').value;
            }
            submitResource(payload);
        }).catch(function(err) {
            saveBtn.disabled = false;
            saveBtn.textContent = T(editingId ? '保存修改' : '上传资源');
            swError.textContent = err.message || '文件上传失败';
        });
    }

    function submitResource(payload) {
        apiPost('/api/software_save', payload).then(function(res) {
            saveBtn.disabled = false;
            saveBtn.textContent = T(editingId ? '保存修改' : '上传资源');
            if (res.ok) {
                var wasEdit = !!editingId;
                closeModal();
                if (res.status === 'pending') toast('已提交，审核通过后显示');
                else toast(wasEdit ? '资源已更新' : '上传成功，感谢分享！');
                load();
            } else {
                if (res.error && res.error.indexOf('登录') !== -1) {
                    localStorage.removeItem('chat_token');
                    syncAuthUI();
                }
                swError.textContent = res.error || '保存失败';
            }
        }).catch(function() {
            saveBtn.disabled = false;
            saveBtn.textContent = T(editingId ? '保存修改' : '上传资源');
            swError.textContent = '无法连接服务器';
        });
    }

    // ---- 资源详情（帖子样式：点赞 / 收藏 / 回复 / 浏览量）----
    var swDetail = document.createElement('div');
    swDetail.className = 'tld-detail-mask';
    swDetail.id = 'swDetailMask';
    swDetail.style.display = 'none';
    swDetail.innerHTML =
        '<div class="tld-detail sw-detail" role="dialog" aria-modal="true">' +
            '<div class="tld-detail-cover" id="swDetailCover">' +
                '<button type="button" class="tld-detail-close" id="swDetailClose">✕</button>' +
            '</div>' +
            '<div class="tld-detail-body">' +
                '<div class="tld-detail-name" id="swDetailName"></div>' +
                '<div class="tld-detail-meta" id="swDetailMeta"></div>' +
                '<div class="sw-stat-row" id="swDetailStats"></div>' +
                '<div class="tld-detail-desc" id="swDetailDesc"></div>' +
                '<div class="tld-detail-actions">' +
                    '<button type="button" class="f-btn primary" id="swDetailDl"></button>' +
                    '<button type="button" class="f-btn sw-react" id="swLikeBtn"></button>' +
                    '<button type="button" class="f-btn sw-react" id="swFavBtn"></button>' +
                '</div>' +
                '<div class="sw-reply-sec">' +
                    '<div class="sw-reply-head" id="swReplyHead"></div>' +
                    '<div class="sw-reply-list" id="swReplyList"></div>' +
                    '<div class="sw-reply-box" id="swReplyBox">' +
                        '<textarea id="swReplyInput" maxlength="500" rows="2"></textarea>' +
                        '<button type="button" class="f-btn primary" id="swReplySend"></button>' +
                    '</div>' +
                    '<div class="sw-reply-login" id="swReplyLogin"></div>' +
                '</div>' +
            '</div>' +
        '</div>';
    document.body.appendChild(swDetail);

    var detailItem = null;

    function closeSwDetail() {
        swDetail.style.display = 'none';
        detailItem = null;
    }

    function fmtTime(ts) {
        if (!ts) return '';
        var d = new Date(ts * 1000);
        function p(n) { return (n < 10 ? '0' : '') + n; }
        return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
    }

    function updateReactBtns() {
        if (!detailItem) return;
        var likeBtn = swDetail.querySelector('#swLikeBtn');
        var favBtn = swDetail.querySelector('#swFavBtn');
        likeBtn.innerHTML = (detailItem.liked ? T('已点赞') : T('点赞')) + ' <b>' + num(detailItem.likes) + '</b>';
        likeBtn.classList.toggle('on', !!detailItem.liked);
        favBtn.innerHTML = (detailItem.fav ? T('已收藏') : T('收藏')) + ' <b>' + num(detailItem.favs) + '</b>';
        favBtn.classList.toggle('on', !!detailItem.fav);
    }

    function updateDetailStats() {
        if (!detailItem) return;
        swDetail.querySelector('#swDetailStats').innerHTML =
            '<span>' + T('下载') + ' ' + (downloads[detailItem.name] || 0) + '</span>' +
            '<span>' + T('浏览') + ' ' + num(detailItem.views) + '</span>' +
            '<span>' + T('点赞') + ' ' + num(detailItem.likes) + '</span>' +
            '<span>' + T('收藏') + ' ' + num(detailItem.favs) + '</span>';
    }

    function renderReplies() {
        var arr = (detailItem && detailItem.replies) || [];
        swDetail.querySelector('#swReplyHead').textContent = T('回复') + '（' + arr.length + '）';
        var listEl = swDetail.querySelector('#swReplyList');
        if (!arr.length) {
            listEl.innerHTML = '<div class="sw-reply-empty">' + T('暂无回复，来说两句吧') + '</div>';
            return;
        }
        listEl.innerHTML = arr.map(function(r) {
            var can = isAdmin() || r.mine;
            return '<div class="sw-reply-item" data-rid="' + esc(r.id) + '">' +
                '<div class="sw-reply-top">' +
                    '<span class="sw-reply-user">' + esc(r.username || '?') + '</span>' +
                    '<span class="sw-reply-time">' + esc(fmtTime(r.time)) + '</span>' +
                    (can ? '<button type="button" class="sw-reply-del">' + T('删除') + '</button>' : '') +
                '</div>' +
                '<div class="sw-reply-text">' + esc(r.text) + '</div>' +
            '</div>';
        }).join('');
        listEl.scrollTop = listEl.scrollHeight;
    }

    function refreshSwDetail() {
        var s = detailItem;
        if (!s) return;
        var cover = swDetail.querySelector('#swDetailCover');
        var oldImg = cover.querySelector('img');
        if (oldImg) oldImg.remove();
        var im = imgSrc(s);
        cover.className = 'tld-detail-cover' + (im ? '' : ' noimg');
        if (im) {
            var img = document.createElement('img');
            img.alt = s.name || '';
            if (im.fb) img.setAttribute('data-fb', im.fb);
            img.src = im.src;
            cover.appendChild(img);
        }
        swDetail.querySelector('#swDetailName').innerHTML = esc(s.name)
            + ' <span class="dl-cat-badge sw-detail-cat">' + esc(T(s.category || '其他')) + '</span>';
        var meta = [];
        if (s.version) meta.push('<span>' + T('版本') + ' <b>' + esc(s.version) + '</b></span>');
        if (s.date) meta.push('<span>' + T('日期') + ' <b>' + esc(s.date) + '</b></span>');
        if (s.size) meta.push('<span>' + T('大小') + ' <b>' + esc(s.size) + '</b></span>');
        if (s.author) meta.push('<span>' + T('作者') + ' <b>' + esc(s.author) + '</b></span>');
        if (s.uploader && !s.uploader_admin) meta.push('<span>' + T('上传') + ' <b>' + esc(s.uploader) + '</b></span>');
        swDetail.querySelector('#swDetailMeta').innerHTML = meta.join('');
        updateDetailStats();
        swDetail.querySelector('#swDetailDesc').textContent = s.desc || T('（暂无简介）');
        var dlBtn = swDetail.querySelector('#swDetailDl');
        dlBtn.textContent = T('下载');
        dlBtn.style.display = mirrors(s).length ? '' : 'none';
        updateReactBtns();
        var logged = !!getToken();
        swDetail.querySelector('#swReplyBox').style.display = logged ? '' : 'none';
        var loginEl = swDetail.querySelector('#swReplyLogin');
        loginEl.style.display = logged ? 'none' : '';
        loginEl.innerHTML = T('登录后即可点赞、收藏和回复，')
            + '<button type="button" id="swReplyLoginLink">' + T('点此登录') + '</button>';
        swDetail.querySelector('#swReplyInput').setAttribute('placeholder', T('写下你的回复...'));
        swDetail.querySelector('#swReplySend').textContent = T('发表回复');
        renderReplies();
    }

    function openSwDetail(item) {
        detailItem = item;
        refreshSwDetail();
        swDetail.style.display = 'flex';
        swDetail.querySelector('.tld-detail').scrollTop = 0;
        if (!viewedIds[item.id]) {
            viewedIds[item.id] = true;
            apiPost('/api/resource_view', { id: item.id }).then(function(res) {
                if (res && res.ok) {
                    item.views = res.views;
                    if (detailItem === item) updateDetailStats();
                    render();
                }
            }).catch(function() {});
        }
    }

    function doReact(action) {
        if (!detailItem) return;
        if (!getToken()) { goLogin(); return; }
        apiPost('/api/resource_react', { token: getToken(), id: detailItem.id, action: action }).then(function(res) {
            if (res && res.ok) {
                detailItem.likes = res.likes;
                detailItem.favs = res.favs;
                detailItem.liked = res.liked;
                detailItem.fav = res.fav;
                updateReactBtns();
                updateDetailStats();
                render();
            } else if (res && res.error && res.error.indexOf('登录') !== -1) {
                localStorage.removeItem('chat_token');
                goLogin();
            } else {
                toast((res && res.error) || T('操作失败'));
            }
        }).catch(function() { toast(T('无法连接服务器')); });
    }

    swDetail.querySelector('#swDetailClose').addEventListener('click', closeSwDetail);
    swDetail.addEventListener('click', function(e) { if (e.target === swDetail) closeSwDetail(); });
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && swDetail.style.display === 'flex') closeSwDetail();
    });
    swDetail.querySelector('#swDetailDl').addEventListener('click', function() {
        var s = detailItem;
        if (!s) return;
        closeSwDetail();
        openChoice(s);
    });
    swDetail.querySelector('#swLikeBtn').addEventListener('click', function() { doReact('like'); });
    swDetail.querySelector('#swFavBtn').addEventListener('click', function() { doReact('fav'); });
    swDetail.querySelector('#swReplySend').addEventListener('click', function() {
        if (!detailItem) return;
        if (!getToken()) { goLogin(); return; }
        var input = swDetail.querySelector('#swReplyInput');
        var text = input.value.trim();
        if (!text) { toast(T('回复内容不能为空')); return; }
        var btn = swDetail.querySelector('#swReplySend');
        btn.disabled = true;
        apiPost('/api/resource_reply', { token: getToken(), id: detailItem.id, text: text }).then(function(res) {
            btn.disabled = false;
            if (res && res.ok) {
                detailItem.replies = res.replies || [];
                input.value = '';
                renderReplies();
                render();
            } else {
                toast((res && res.error) || T('回复失败'));
            }
        }).catch(function() { btn.disabled = false; toast(T('无法连接服务器')); });
    });
    swDetail.querySelector('#swReplyLogin').addEventListener('click', function(e) {
        if (e.target.closest('#swReplyLoginLink')) goLogin();
    });
    // 手机端键盘弹出时，把回复输入框滚到可视区域，避免被键盘 / 浏览器工具栏挡住
    swDetail.querySelector('#swReplyInput').addEventListener('focus', function() {
        var input = this;
        setTimeout(function() {
            if (input.scrollIntoView) input.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }, 300);
    });
    swDetail.querySelector('#swReplyList').addEventListener('click', function(e) {
        var del = e.target.closest('.sw-reply-del');
        if (!del || !detailItem) return;
        var rid = del.closest('.sw-reply-item').getAttribute('data-rid');
        if (!confirm(T('确定删除这条回复吗？'))) return;
        apiPost('/api/resource_reply_del', { token: getToken(), id: detailItem.id, rid: rid }).then(function(res) {
            if (res && res.ok) {
                detailItem.replies = res.replies || [];
                renderReplies();
                render();
            } else {
                toast((res && res.error) || T('删除失败'));
            }
        }).catch(function() {});
    });

    // ---- 卡片操作 ----
    function handleAreaClick(e) {
        var card = e.target.closest('.software-card');
        if (!card) return;
        var id = card.getAttribute('data-id');
        var item = list.find(function(s) { return s.id === id; });
        if (e.target.closest('.download-btn')) {
            if (item) openChoice(item);
            return;
        }
        if (!item) return;
        if (e.target.closest('.dl-edit')) {
            if (canManage(item)) openModal(item);
            return;
        }
        if (e.target.closest('.dl-del')) {
            if (!canManage(item)) return;
            if (!confirm('确定删除「' + (item.name || '') + '」吗？删除后无法恢复。')) return;
            apiPost('/api/software_delete', { token: getToken(), id: id }).then(function(res) {
                if (res.ok) { toast('已删除'); load(); }
                else toast(res.error || '删除失败');
            }).catch(function() {});
            return;
        }
        var approveBtn = e.target.closest('.dl-approve');
        var rejectBtn = e.target.closest('.dl-reject');
        if (approveBtn || rejectBtn) {
            if (!isAdmin()) return;
            var act = rejectBtn ? 'reject' : 'approve';
            if (rejectBtn && !confirm('拒绝将删除「' + (item.name || '') + '」及其文件，确定？')) return;
            apiPost('/api/software_approve', { token: getToken(), id: id, action: act }).then(function(res) {
                if (res.ok) { toast(act === 'approve' ? '已通过审核' : '已拒绝并删除'); load(); }
                else toast(res.error || '操作失败');
            }).catch(function() {});
            return;
        }
        var up = e.target.closest('.dl-up');
        var down = e.target.closest('.dl-down');
        if (up || down) {
            if (isAdmin()) {
                apiPost('/api/software_move', { token: getToken(), id: id, dir: up ? 'up' : 'down' }).then(function(res) {
                    if (res.ok) load();
                }).catch(function() {});
            }
            return;
        }
        if (e.target.closest('.software-img')) return; // 点图片 = 看大图
        openSwDetail(item);
    }
    grid.addEventListener('click', handleAreaClick);
    if (shareGrid) shareGrid.addEventListener('click', handleAreaClick);
    if (homeFeatured) homeFeatured.addEventListener('click', handleAreaClick);
    if (profileGrid) profileGrid.addEventListener('click', handleAreaClick);

    // ---- 我的：页面交互 ----
    function openProfileManage() {
        if (!profileManagePane) return;
        profileManagePane.style.display = '';
        loadProfileMe();
        if (profileListCard) {
            profileListCard.style.display = 'none';
            // 记住：关掉账号管理时要还原列表
            profileManagePane._restoreList = true;
        }
    }
    function closeProfileManage() {
        if (!profileManagePane) return;
        profileManagePane.style.display = 'none';
        if (profileManagePane._restoreList && profileListCard) {
            profileListCard.style.display = '';
            profileManagePane._restoreList = false;
        }
    }
    if (profileCard) {
        profileCard.addEventListener('click', function(e) {
            var btn = e.target.closest('[data-pact]');
            if (!btn) return;
            var act = btn.getAttribute('data-pact');
            if (act === 'login') { goLogin(); return; }
            if (act === 'account') { openProfileManage(); return; }
            if (act === 'logout') {
                var out = document.getElementById('logoutBtn');
                if (out) out.click();
            }
        });
    }
    if (profileManagePane) {
        profileManagePane.addEventListener('click', function(e) {
            var btn = e.target.closest('[data-pact]');
            if (btn && btn.getAttribute('data-pact') === 'manage-close') closeProfileManage();
        });
    }
    if (profileTabs) {
        profileTabs.addEventListener('click', function(e) {
            var tab = e.target.closest('.dl-tab');
            if (!tab) return;
            profileTab = tab.getAttribute('data-ptab') || 'fav';
            renderProfile();
        });
    }
    if (profileGoLibrary) profileGoLibrary.addEventListener('click', goLibrary);

    // ---- 我的：账号管理（头像上传 + 修改密码）----
    function setPmAvatar(url) {
        if (!pmAvatar) return;
        var name = (profileMe && profileMe.username) || getUsername() || '?';
        if (url) {
            pmAvatar.outerHTML = '<img class="avatar avatar-lg" id="pmAvatar" src="' + url + '?t=' + Date.now() + '" alt="">';
        } else {
            pmAvatar.textContent = name.charAt(0).toUpperCase();
        }
    }
    if (pmAvatarInput) {
        pmAvatarInput.addEventListener('change', function() {
            var file = pmAvatarInput.files[0];
            pmAvatarInput.value = '';
            if (!file) return;
            if (file.size > 5 * 1024 * 1024) {
                pmAvatarMsg.textContent = '图片太大（最大5MB）';
                return;
            }
            var reader = new FileReader();
            reader.onload = function() {
                apiPost('/api/avatar', { token: getToken(), image: reader.result }).then(function(res) {
                    if (res.ok) {
                        setPmAvatar(res.avatar);
                        if (pmAvatarMsg) {
                            pmAvatarMsg.style.color = '#7be3a8';
                            pmAvatarMsg.textContent = '头像已更新';
                            setTimeout(function() { pmAvatarMsg.textContent = ''; pmAvatarMsg.style.color = ''; }, 3000);
                        }
                        loadProfileMe();
                    } else {
                        pmAvatarMsg.textContent = res.error || '上传失败';
                    }
                }).catch(function() {
                    pmAvatarMsg.textContent = '无法连接服务器';
                });
            };
            reader.readAsDataURL(file);
        });
    }
    if (pmChangePwdForm) {
        pmChangePwdForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (pmPwdError) pmPwdError.textContent = '';
            apiPost('/api/change_password', {
                token: getToken(),
                old_password: document.getElementById('pmOldPwd').value,
                new_password: document.getElementById('pmNewPwd').value
            }).then(function(res) {
                if (res.ok) {
                    pmChangePwdForm.reset();
                    if (pmPwdError) { pmPwdError.style.color = '#7be3a8'; pmPwdError.textContent = '密码修改成功'; }
                    setTimeout(function() { if (pmPwdError) { pmPwdError.textContent = ''; pmPwdError.style.color = ''; } }, 3000);
                } else {
                    if (pmPwdError) pmPwdError.textContent = res.error || '修改失败';
                }
            }).catch(function() {
                if (pmPwdError) pmPwdError.textContent = '无法连接服务器';
            });
        });
    }

    // ---- 搜索框 / 排序 ----
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            query = searchInput.value.trim();
            render();
        });
        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') { e.preventDefault(); query = searchInput.value.trim(); render(); }
        });
    }
    if (searchClear) {
        searchClear.addEventListener('click', function() {
            applyQuery('');
            if (searchInput) searchInput.focus();
        });
    }
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            sortMode = sortSelect.value;
            render();
        });
    }
    if (emptyReset) {
        emptyReset.addEventListener('click', function() { applyQuery(''); if (searchInput) searchInput.focus(); });
    }
    var heroForm = document.getElementById('heroSearchForm');
    var heroInput = document.getElementById('heroSearchInput');
    var mobileQuery = window.matchMedia('(max-width: 640px)');
    function syncHeroPlaceholder() {
        if (!heroInput) return;
        heroInput.placeholder = T(mobileQuery.matches
            ? '搜索资源名称或作者…'
            : '搜索资源：工具、游戏、apk、软件…');
    }
    syncHeroPlaceholder();
    if (mobileQuery.addEventListener) mobileQuery.addEventListener('change', syncHeroPlaceholder);
    if (heroForm) {
        heroForm.addEventListener('submit', function(e) {
            e.preventDefault();
            applyQuery(heroInput ? heroInput.value : '');
            goLibrary();
        });
    }
    document.querySelectorAll('.hero-tag, .portal-icon').forEach(function(tag) {
        tag.addEventListener('click', function() {
            var c = tag.getAttribute('data-cat');
            if (c !== null && c !== '') { applyCat(c); }
            else { applyQuery(tag.getAttribute('data-q') || ''); }
            goLibrary();
        });
    });
    var homeCatListEl = document.getElementById('homeCatList');
    if (homeCatListEl) {
        homeCatListEl.addEventListener('click', function(e) {
            var btn = e.target.closest('.portal-cat');
            if (!btn) return;
            applyCat(btn.getAttribute('data-cat') || '');
            goLibrary();
        });
    }
    var homeHotListEl = document.getElementById('homeHotList');
    if (homeHotListEl) {
        homeHotListEl.addEventListener('click', function(e) {
            var row = e.target.closest('.hot-row');
            if (!row) return;
            var id = row.getAttribute('data-id');
            for (var i = 0; i < list.length; i++) {
                if (String(list[i].id) === String(id)) {
                    openSwDetail(list[i]);
                    return;
                }
            }
        });
    }
    var hotShuffleEl = document.getElementById('hotShuffle');
    if (hotShuffleEl) {
        hotShuffleEl.addEventListener('click', function() {
            hotOffset = (hotOffset + 6) % Math.max(1, list.length);
            render();
        });
    }
    if (viewAllBtn) {
        viewAllBtn.addEventListener('click', function() { applyQuery(''); goLibrary(); });
    }

    document.querySelectorAll('.nav-item').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var page = btn.getAttribute('data-page');
            if (page === 'download') load();
            if (page === 'profile') {
                renderProfile();
                loadProfileMe();
                load();
            }
        });
    });

    window.addEventListener('langchange', function() { render(); syncAuthUI(); if (detailItem) refreshSwDetail(); });

    // 登录 / 退出后同步「我的」与收藏状态
    window.addEventListener('authchange', function() {
        profileMe = null;
        loadProfileMe();
        load();
        if (profileActive()) renderProfile();
    });

    // ---- 加载数据 ----
    function load() {
        function applyList(arr) { list = arr || []; render(); }
        var tk = getToken();
        fetch('/api/software' + (tk ? '?token=' + encodeURIComponent(tk) : '')).then(function(res) { return res.json(); }).then(function(res) {
            if (res && res.ok) { applyList(res.software); return; }
            throw new Error('no api');
        }).catch(function() {
            fetch('data/software.json').then(function(res) { return res.json(); }).then(function(arr) {
                applyList(arr);
            }).catch(function() {
                // 兜底：仓库根目录的 software.json
                fetch('software.json').then(function(res) { return res.json(); }).then(function(arr) {
                    applyList(arr);
                }).catch(function() {});
            });
        });
    }

    fetch('/api/downloads').then(function(res) { return res.json(); }).then(function(res) {
        if (res && res.ok) { downloads = res.downloads || {}; if (list.length) render(); }
    }).catch(function() {});

    loadSettings();
    load();
})();

// ==================== 长途旅行模组下载（WorkshopTLD 社区库） ====================
(function() {
    var PAGE_SIZE = 12;
    var mods = [];            // 全部模组
    var filtered = [];        // 搜索+分类过滤后
    var page = 1;             // 当前页
    var activeCat = '全部';
    var loaded = false;
    var imgSource = 'gitlab'; // 图片源：gitlab（默认）/ server（本站缓存）
    var modSource = 'workshop-tld';
    var sourceList = [];

    var tabSite = document.getElementById('dlTabSite');
    var tabMods = document.getElementById('dlTabMods');
    var tabLoader = document.getElementById('dlTabLoader');
    var tabShare = document.getElementById('dlTabShare');
    var viewSite = document.getElementById('siteResView');
    var viewMods = document.getElementById('tldModsView');
    var viewLoader = document.getElementById('tldLoaderView');
    var viewShare = document.getElementById('shareResView');
    var siteTip = document.getElementById('siteTip');
    var grid = document.getElementById('tldGrid');
    var chips = document.getElementById('tldChips');
    var totalEl = document.getElementById('tldTotal');
    var emptyEl = document.getElementById('tldEmpty');
    var searchInput = document.getElementById('tldSearchInput');
    var searchClear = document.getElementById('tldSearchClear');
    var pager = document.getElementById('tldPager');
    var imgSelect = document.getElementById('tldImgSelect');
    var srcSelect = document.getElementById('tldSourceSelect');
    if (!tabMods || !grid) return;

    function T(s) { return window.T ? window.T(s) : s; }

    function toast(msg) {
        var el = document.createElement('div');
        el.className = 'site-toast';
        el.textContent = msg;
        document.body.appendChild(el);
        setTimeout(function() { el.classList.add('out'); }, 2200);
        setTimeout(function() { if (el.parentNode) el.remove(); }, 2800);
    }

    function esc(s) {
        return String(s == null ? '' : s).replace(/[&<>"']/g, function(c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }

    function escAttr(s) { return esc(s); }

    function normDate(d) {
        // 源格式 DD/MM/YYYY → YYYY-MM-DD
        var m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(String(d || '').trim());
        if (m) return m[3] + '-' + m[2].padStart(2, '0') + '-' + m[1].padStart(2, '0');
        return String(d || '');
    }

    function coverUrl(m) {
        var u = m.PictureLink || '';
        if (!u) return '';
        if (imgSource === 'server') {
            return '/api/tldimg?u=' + encodeURIComponent(u);
        }
        return u;
    }

    function fillSources() {
        if (!srcSelect) return;
        srcSelect.innerHTML = sourceList.map(function(s) {
            return '<option value="' + escAttr(s.id) + '">' + esc(T(s.label)) + '</option>';
        }).join('');
        srcSelect.value = modSource;
    }

    function renderChips() {
        var counts = {};
        mods.forEach(function(m) {
            var c = String(m.Category || '').trim() || '未分类';
            counts[c] = (counts[c] || 0) + 1;
        });
        var names = Object.keys(counts).sort(function(a, b) { return counts[b] - counts[a]; });
        names.unshift('全部');
        chips.innerHTML = names.map(function(c) {
            var n = c === '全部' ? mods.length : counts[c];
            return '<button type="button" class="tld-chip' + (c === activeCat ? ' active' : '') + '" data-cat="' + escAttr(c) + '">' +
                esc(T(c)) + ' <span>' + n + '</span></button>';
        }).join('');
    }

    function applyFilter() {
        var q = (searchInput.value || '').trim().toLowerCase();
        filtered = mods.filter(function(m) {
            if (activeCat !== '全部') {
                var c = String(m.Category || '').trim() || '未分类';
                if (c !== activeCat) return false;
            }
            if (!q) return true;
            return (m.Name || '').toLowerCase().indexOf(q) !== -1 ||
                (m.Author || '').toLowerCase().indexOf(q) !== -1 ||
                (m.Description || '').toLowerCase().indexOf(q) !== -1 ||
                (m.FileName || '').toLowerCase().indexOf(q) !== -1;
        });
        page = 1;
        renderGrid();
    }

    function renderGrid() {
        var totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
        if (page > totalPages) page = totalPages;
        if (page < 1) page = 1;
        var start = (page - 1) * PAGE_SIZE;
        var slice = filtered.slice(start, start + PAGE_SIZE);
        totalEl.textContent = T('共 ') + filtered.length + T(' 个模组');
        if (!slice.length) {
            grid.innerHTML = '';
            emptyEl.style.display = 'flex';
            pager.innerHTML = '';
            return;
        }
        emptyEl.style.display = 'none';
        grid.innerHTML = slice.map(function(m, i) {
            var idx = start + i;
            var cat = esc(String(m.Category || '').trim() || '未分类');
            var img = coverUrl(m);
            var imgHtml = img
                ? '<img loading="lazy" src="' + escAttr(img) + '" data-fallback="' + escAttr(m.PictureLink || '') + '" alt="' + escAttr(m.Name) + '" onerror="var fb=this.getAttribute(\'data-fallback\');if(fb&&this.src.indexOf(\'/api/tldimg\')!==-1){this.src=fb;}else{this.style.display=\'none\';this.parentElement.classList.add(\'noimg\');}">'
                : '';
            var date = esc(normDate(m.Date));
            var ver = esc(m.Version || '');
            return '<div class="software-card tld-mod rising" data-tldopen="' + idx + '" style="animation-delay:' + Math.min(i, 12) * 40 + 'ms">' +
                '<div class="software-img tld-img">' + imgHtml +
                    (img ? '' : '<span class="tld-noimg-text">🚗</span>') +
                    '<span class="tld-cat">' + cat + '</span>' +
                '</div>' +
                '<div class="software-info">' +
                    '<div class="tld-name-row"><span class="software-name tld-name">' + esc(m.Name || '未命名模组') + '</span>' +
                    (ver ? '<span class="tld-ver">v' + esc(ver) + '</span>' : '') + '</div>' +
                    '<div class="tld-meta"><span>' + T('作者 ') + esc(m.Author || '未知') + '</span>' +
                    (date ? '<span>' + date + '</span>' : '') +
                    (m.Dependency ? '<span>' + T('依赖 ') + esc(m.Dependency) + '</span>' : '') + '</div>' +
                    '<div class="tld-desc">' + esc(m.Description || '') + '</div>' +
                    '<div class="tld-actions">' +
                        (m.Link ? '<button type="button" class="f-btn primary tld-dl" data-tlddl="' + idx + '">' + T('下载模组') + '</button>' : '') +
                        '<button type="button" class="f-btn tld-detail-btn" data-tldopen="' + idx + '">' + T('详情') + '</button>' +
                    '</div>' +
                '</div>' +
            '</div>';
        }).join('');
        renderPager(totalPages);
    }

    // ---- 分页控件 ----
    function renderPager(totalPages) {
        if (totalPages <= 1) { pager.innerHTML = ''; return; }
        var html = '';
        html += '<button type="button" class="tld-page-btn nav' + (page === 1 ? ' disabled' : '') + '" data-page="' + (page - 1) + '">' + T('上一页') + '</button>';
        var nums = [];
        var from = Math.max(1, page - 2);
        var to = Math.min(totalPages, from + 4);
        from = Math.max(1, to - 4);
        for (var n = from; n <= to; n++) nums.push(n);
        if (from > 1) {
            nums.unshift(1);
            if (from > 2) nums.splice(1, 0, 0);
        }
        if (to < totalPages) {
            if (to < totalPages - 1) nums.push(0);
            nums.push(totalPages);
        }
        nums.forEach(function(n) {
            if (n === 0) {
                html += '<span class="tld-page-gap">…</span>';
            } else {
                html += '<button type="button" class="tld-page-btn' + (n === page ? ' active' : '') + '" data-page="' + n + '">' + n + '</button>';
            }
        });
        html += '<button type="button" class="tld-page-btn nav' + (page === totalPages ? ' disabled' : '') + '" data-page="' + (page + 1) + '">' + T('下一页') + '</button>';
        pager.innerHTML = html;
    }

    if (pager) {
        pager.addEventListener('click', function(e) {
            var b = e.target.closest('.tld-page-btn');
            if (!b || b.classList.contains('disabled')) return;
            var p = parseInt(b.getAttribute('data-page'), 10);
            if (!p) return;
            page = p;
            renderGrid();
            var panel = document.getElementById('download-page');
            if (panel) panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    }

    // ---- 下载方式弹窗（保存到 Mods 文件夹 / 普通下载） ----
    var dlMask = document.createElement('div');
    dlMask.className = 'dl-mask';
    dlMask.id = 'tldDlMask';
    dlMask.style.display = 'none';
    dlMask.innerHTML =
        '<div class="dl-modal dl-choice">' +
            '<h3>' + T('选择下载方式') + '</h3>' +
            '<div class="dl-choice-name" id="tldDlName"></div>' +
            '<div class="dl-choice-list">' +
                '<button type="button" class="f-btn dl-choice-btn primary" id="tldSaveMods">💾 ' + T('保存到游戏 Mods 文件夹') + '<em>' + T('默认 文档\\TheLongDrive\\Mods，选择一次后自动记住') + '</em></button>' +
                '<button type="button" class="f-btn dl-choice-btn" id="tldSaveDl">⬇ ' + T('普通下载') + '<em>' + T('保存到浏览器下载目录') + '</em></button>' +
            '</div>' +
            '<div class="tld-dl-status" id="tldDlStatus"></div>' +
            '<div class="tld-dl-tip" id="tldDlTip"></div>' +
            '<div class="compose-btns"><button type="button" class="f-btn" id="tldDlCancel">' + T('取消') + '</button></div>' +
        '</div>';
    document.body.appendChild(dlMask);

    var dlName = dlMask.querySelector('#tldDlName');
    var dlStatus = dlMask.querySelector('#tldDlStatus');
    var dlTip = dlMask.querySelector('#tldDlTip');
    var saveModsBtn = dlMask.querySelector('#tldSaveMods');
    var saveDlBtn = dlMask.querySelector('#tldSaveDl');
    var currentMod = null;

    function closeTldDl() { dlMask.style.display = 'none'; }

    function openTldDl(m) {
        currentMod = m;
        var h3 = dlMask.querySelector('h3');
        if (h3) h3.textContent = T('选择下载方式');
        saveModsBtn.innerHTML = '💾 ' + T('保存到游戏 Mods 文件夹') + '<em>' + T('默认 文档\\TheLongDrive\\Mods，选择一次后自动记住') + '</em>';
        saveDlBtn.innerHTML = '⬇ ' + T('普通下载') + '<em>' + T('保存到浏览器下载目录') + '</em>';
        var cancel = dlMask.querySelector('#tldDlCancel');
        if (cancel) cancel.textContent = T('取消');
        dlName.textContent = (m.Name || '') + (m.Version ? ' · v' + m.Version : '') + (m.FileName ? '  →  ' + m.FileName : '');
        dlStatus.textContent = '';
        dlStatus.className = 'tld-dl-status';
        var fsOk = !!(window.showDirectoryPicker && window.isSecureContext);
        saveModsBtn.disabled = !fsOk;
        dlTip.textContent = fsOk
            ? T('提示：首次保存会请你选择 文档\\TheLongDrive\\Mods 文件夹，只选一次，之后所有模组自动写入')
            : T('当前浏览器不支持直接保存到文件夹（需 Chrome / Edge），可先用普通下载');
        dlMask.style.display = 'flex';
    }

    // IndexedDB 存目录句柄，记住用户选的 Mods 文件夹
    function idb() {
        return new Promise(function(resolve, reject) {
            var rq = indexedDB.open('tld-mods-db', 1);
            rq.onupgradeneeded = function() { rq.result.createObjectStore('kv'); };
            rq.onsuccess = function() { resolve(rq.result); };
            rq.onerror = function() { reject(rq.error); };
        });
    }
    function idbGet(key) {
        return idb().then(function(db) {
            return new Promise(function(resolve, reject) {
                var rq = db.transaction('kv', 'readonly').objectStore('kv').get(key);
                rq.onsuccess = function() { resolve(rq.result || null); };
                rq.onerror = function() { reject(rq.error); };
            });
        }).catch(function() { return null; });
    }
    function idbSet(key, val) {
        return idb().then(function(db) {
            return new Promise(function(resolve, reject) {
                var tx = db.transaction('kv', 'readwrite');
                tx.objectStore('kv').put(val, key);
                tx.oncomplete = function() { resolve(); };
                tx.onerror = function() { reject(tx.error); };
            });
        }).catch(function() {});
    }
    function idbDel(key) {
        return idb().then(function(db) {
            return new Promise(function(resolve) {
                var tx = db.transaction('kv', 'readwrite');
                tx.objectStore('kv')['delete'](key);
                tx.oncomplete = function() { resolve(); };
                tx.onerror = function() { resolve(); };
            });
        }).catch(function() {});
    }

    function saveToMods(m) {
        dlStatus.className = 'tld-dl-status';
        dlStatus.textContent = T('正在准备…');
        idbGet('modsDir').then(function(dir) {
            if (!dir) return null;
            // 已记住的目录：确认权限（浏览器可能要求重新授权）
            if (!dir.queryPermission) return dir;
            return Promise.resolve(dir.queryPermission({ mode: 'readwrite' })).then(function(p) {
                if (p === 'granted') return dir;
                return Promise.resolve(dir.requestPermission({ mode: 'readwrite' })).then(function(p2) {
                    if (p2 === 'granted') return dir;
                    return null;
                });
            });
        }).then(function(dir) {
            var pick;
            if (dir) {
                pick = Promise.resolve(dir);
            } else {
                pick = window.showDirectoryPicker({ id: 'tldModsDir', startIn: 'documents', mode: 'readwrite' })
                    .then(function(d) { idbSet('modsDir', d); return d; });
            }
            return pick.then(function(d) {
                dlStatus.textContent = T('正在下载 ') + (m.FileName || 'mod') + ' …';
                return fetch('/api/tldfile?u=' + encodeURIComponent(m.Link)).then(function(resp) {
                    if (!resp.ok) throw new Error('HTTP ' + resp.status);
                    return resp.blob();
                }).then(function(blob) {
                    return d.getFileHandle(m.FileName || 'mod.dll', { create: true }).then(function(fh) {
                        return fh.createWritable().then(function(w) {
                            return w.write(blob).then(function() { return w.close(); });
                        });
                    });
                });
            });
        }).then(function() {
            dlStatus.className = 'tld-dl-status ok';
            dlStatus.textContent = '✓ ' + T('已保存到所选文件夹，进游戏即可生效');
            setTimeout(closeTldDl, 1600);
        }).catch(function(err) {
            if (err && err.name === 'AbortError') { dlStatus.textContent = ''; return; } // 用户取消选目录
            dlStatus.className = 'tld-dl-status err';
            dlStatus.textContent = '✗ ' + ((err && err.message) || T('保存失败，可换普通下载'));
        });
    }

    function plainDownload(m) {
        var a = document.createElement('a');
        var fileUrl = '/api/tldfile?u=' + encodeURIComponent(m.Link);
        // 线上必须走后端隧道的绝对地址，否则会打到 GitHub Pages 静态站（404，浏览器提示「无法下载 - 没有文件」）
        a.href = window.__apiUrl ? window.__apiUrl(fileUrl) : fileUrl;
        a.download = m.FileName || 'mod.dll';
        document.body.appendChild(a);
        a.click();
        a.remove();
        closeTldDl();
        toast(T('已开始下载到浏览器下载目录'));
    }

    saveModsBtn.addEventListener('click', function() { if (currentMod) saveToMods(currentMod); });
    saveDlBtn.addEventListener('click', function() { if (currentMod) plainDownload(currentMod); });
    dlMask.querySelector('#tldDlCancel').addEventListener('click', closeTldDl);
    dlMask.addEventListener('click', function(e) { if (e.target === dlMask) closeTldDl(); });

    // ---- 模组详情页 ----
    var detail = document.createElement('div');
    detail.className = 'tld-detail-mask';
    detail.id = 'tldDetailMask';
    detail.style.display = 'none';
    detail.innerHTML =
        '<div class="tld-detail" role="dialog" aria-modal="true">' +
            '<div class="tld-detail-cover" id="tldDetailCover">' +
                '<button type="button" class="tld-detail-close" id="tldDetailClose">✕</button>' +
            '</div>' +
            '<div class="tld-detail-body">' +
                '<div class="tld-detail-name" id="tldDetailName"></div>' +
                '<div class="tld-detail-meta" id="tldDetailMeta"></div>' +
                '<div class="tld-detail-desc" id="tldDetailDesc"></div>' +
                '<div class="tld-detail-actions">' +
                    '<button type="button" class="f-btn primary" id="tldDetailDl">' + T('下载模组') + '</button>' +
                    '<button type="button" class="f-btn" id="tldDetailBack">' + T('返回列表') + '</button>' +
                '</div>' +
            '</div>' +
        '</div>';
    document.body.appendChild(detail);

    var detailCover = detail.querySelector('#tldDetailCover');
    var detailName = detail.querySelector('#tldDetailName');
    var detailMeta = detail.querySelector('#tldDetailMeta');
    var detailDesc = detail.querySelector('#tldDetailDesc');
    var detailDlBtn = detail.querySelector('#tldDetailDl');
    var detailMod = null;

    function closeTldDetail() {
        detail.style.display = 'none';
        detailMod = null;
    }

    function openTldDetail(m) {
        detailMod = m;
        detailDlBtn.textContent = T('下载模组');
        var backBtn = detail.querySelector('#tldDetailBack');
        if (backBtn) backBtn.textContent = T('返回列表');
        var ver = String(m.Version || '');
        detailName.textContent = (m.Name || '未命名模组');
        if (ver) {
            var vspan = document.createElement('span');
            vspan.className = 'tld-ver';
            vspan.textContent = 'v' + ver;
            detailName.appendChild(document.createTextNode(' '));
            detailName.appendChild(vspan);
        }
        var meta = [];
        meta.push('<span>' + T('作者 ') + '<b>' + esc(m.Author || '未知') + '</b></span>');
        var d = normDate(m.Date);
        if (d) meta.push('<span><b>' + esc(d) + '</b></span>');
        if (m.Dependency) meta.push('<span>' + T('依赖 ') + '<b>' + esc(m.Dependency) + '</b></span>');
        if (m.FileName) meta.push('<span>' + esc(m.FileName) + '</span>');
        detailMeta.innerHTML = meta.join('');
        detailDesc.textContent = m.Description || T('（暂无简介）');

        var oldImg = detailCover.querySelector('img');
        if (oldImg) oldImg.remove();
        var img = coverUrl(m);
        detailCover.className = 'tld-detail-cover' + (img ? '' : ' noimg');
        if (img) {
            var im = document.createElement('img');
            im.alt = m.Name || '';
            im.onerror = function() {
                if (m.PictureLink && im.src.indexOf('/api/tldimg') !== -1) { im.src = m.PictureLink; return; }
                im.style.display = 'none';
                detailCover.classList.add('noimg');
            };
            im.src = img;
            detailCover.appendChild(im);
        }
        detailDlBtn.style.display = m.Link ? '' : 'none';
        detail.style.display = 'flex';
        detail.querySelector('.tld-detail').scrollTop = 0;
    }

    detail.querySelector('#tldDetailClose').addEventListener('click', closeTldDetail);
    detail.querySelector('#tldDetailBack').addEventListener('click', closeTldDetail);
    detailDlBtn.addEventListener('click', function() {
        var m = detailMod;
        if (!m) return;
        closeTldDetail();
        openTldDl(m);
    });
    detail.addEventListener('click', function(e) { if (e.target === detail) closeTldDetail(); });
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && detail.style.display === 'flex') closeTldDetail();
    });

    grid.addEventListener('click', function(e) {
        var btn = e.target.closest('[data-tlddl]');
        if (btn) {
            var idx = parseInt(btn.getAttribute('data-tlddl'), 10);
            var m = filtered[idx];
            if (m && m.Link) openTldDl(m);
            return;
        }
        var openEl = e.target.closest('[data-tldopen]');
        if (openEl) {
            var oi = parseInt(openEl.getAttribute('data-tldopen'), 10);
            if (filtered[oi]) openTldDetail(filtered[oi]);
        }
    });

    // ---- Tab 切换 ----
    function switchTab(which) {
        var toSite = which === 'site';
        var toMods = which === 'mods';
        var toLoader = which === 'loader';
        var toShare = which === 'share';
        tabSite.classList.toggle('active', toSite);
        tabMods.classList.toggle('active', toMods);
        tabLoader.classList.toggle('active', toLoader);
        if (tabShare) tabShare.classList.toggle('active', toShare);
        tabSite.setAttribute('aria-selected', String(toSite));
        tabMods.setAttribute('aria-selected', String(toMods));
        tabLoader.setAttribute('aria-selected', String(toLoader));
        if (tabShare) tabShare.setAttribute('aria-selected', String(toShare));
        viewSite.style.display = toSite ? '' : 'none';
        siteTip.style.display = toSite ? '' : 'none';
        viewMods.style.display = toMods ? '' : 'none';
        viewLoader.style.display = toLoader ? '' : 'none';
        if (viewShare) viewShare.style.display = toShare ? '' : 'none';
        if (toMods && !loaded) loadMods();
        if (toLoader && window.__loaderInit) window.__loaderInit();
    }
    tabSite.addEventListener('click', function() { switchTab('site'); });
    tabMods.addEventListener('click', function() { switchTab('mods'); });
    if (tabLoader) tabLoader.addEventListener('click', function() { switchTab('loader'); });
    if (tabShare) tabShare.addEventListener('click', function() { switchTab('share'); });

    // ---- 搜索 ----
    var searchTimer = null;
    searchInput.addEventListener('input', function() {
        searchClear.style.display = searchInput.value ? 'block' : 'none';
        clearTimeout(searchTimer);
        searchTimer = setTimeout(applyFilter, 200);
    });
    searchClear.addEventListener('click', function() {
        searchInput.value = '';
        searchClear.style.display = 'none';
        applyFilter();
        searchInput.focus();
    });
    document.getElementById('tldEmptyReset').addEventListener('click', function() {
        searchInput.value = '';
        searchClear.style.display = 'none';
        activeCat = '全部';
        renderChips();
        applyFilter();
    });
    chips.addEventListener('click', function(e) {
        var b = e.target.closest('.tld-chip');
        if (!b) return;
        activeCat = b.getAttribute('data-cat') || '全部';
        renderChips();
        applyFilter();
    });

    // ---- 图片源 / 模组源 切换 ----
    if (imgSelect) {
        imgSelect.value = imgSource;
        imgSelect.addEventListener('change', function() {
            imgSource = imgSelect.value === 'server' ? 'server' : 'gitlab';
            if (loaded) renderGrid();
        });
    }
    if (srcSelect) {
        srcSelect.addEventListener('change', function() {
            modSource = srcSelect.value || 'workshop-tld';
            loaded = false;
            loadMods();
        });
    }

    // ---- 加载数据 ----
    function loadMods() {
        fetch('/api/tldmods?source=' + encodeURIComponent(modSource))
            .then(function(res) { return res.json(); })
            .then(function(res) {
                if (res && res.ok && res.mods && res.mods.length) {
                    mods = res.mods;
                    if (res.sources && srcSelect) {
                        sourceList = res.sources;
                        modSource = res.source || modSource;
                        fillSources();
                    }
                    ready();
                    return;
                }
                throw new Error('no api');
            })
            .catch(function() {
                // 静态站兜底：仓库内缓存文件
                fetch('data/tld_mods_cache.json').then(function(res) { return res.json(); }).then(function(c) {
                    mods = (c && (c.mods || c.Mods)) || [];
                    ready();
                }).catch(function() { ready(); });
            });
    }

    function ready() {
        loaded = true;
        renderChips();
        applyFilter();
    }

    window.addEventListener('langchange', function() {
        fillSources();
        if (loaded) { renderChips(); renderGrid(); }
    });
})();

// ==================== 模组加载器（TLDLoader 安装 / 卸载） ====================
(function() {
    var fsOk = !!(window.showDirectoryPicker && window.isSecureContext);
    var gameDir = null;
    var docsDir = null;
    var info = null;
    var variant = 'old';

    var el = {
        pickGame: document.getElementById('loaderPickGame'),
        pickGameModify: document.getElementById('loaderPickGameModify'),
        refreshState: document.getElementById('loaderRefreshState'),
        scanSteam: document.getElementById('loaderScanSteam'),
        pickDocs: document.getElementById('loaderPickDocs'),
        installOld: document.getElementById('loaderInstallOld'),
        update: document.getElementById('loaderUpdate'),
        installBtn: document.getElementById('loaderInstallBtn'),
        uninstall: document.getElementById('loaderUninstall'),
        about: document.getElementById('loaderAbout'),
        gamePath: document.getElementById('loaderGamePath'),
        docsPath: document.getElementById('loaderDocsPath'),
        state: document.getElementById('loaderState'),
        note: document.getElementById('loaderVariantNote'),
        log: document.getElementById('loaderLog')
    };
    if (!el.pickGame) return;

    function T(s) { return window.T ? window.T(s) : s; }

    function logLine(msg) {
        var stamp = new Date().toLocaleTimeString();
        if (el.log.textContent === '等待操作…') el.log.textContent = '';
        el.log.textContent += '[' + stamp + '] ' + msg + '\n';
        el.log.scrollTop = el.log.scrollHeight;
    }

    function setState(text, cls) {
        el.state.textContent = T(text);
        el.state.className = 'loader-state' + (cls ? ' ' + cls : '');
    }

    // ---- IndexedDB 记住目录句柄 ----
    function idb() {
        return new Promise(function(resolve, reject) {
            var rq = indexedDB.open('tld-mods-db', 1);
            rq.onupgradeneeded = function() { rq.result.createObjectStore('kv'); };
            rq.onsuccess = function() { resolve(rq.result); };
            rq.onerror = function() { reject(rq.error); };
        });
    }
    function idbGet(key) {
        return idb().then(function(db) {
            return new Promise(function(resolve) {
                var rq = db.transaction('kv', 'readonly').objectStore('kv').get(key);
                rq.onsuccess = function() { resolve(rq.result || null); };
                rq.onerror = function() { resolve(null); };
            });
        }).catch(function() { return null; });
    }
    function idbSet(key, val) {
        return idb().then(function(db) {
            return new Promise(function(resolve) {
                var tx = db.transaction('kv', 'readwrite');
                tx.objectStore('kv').put(val, key);
                tx.oncomplete = function() { resolve(); };
                tx.onerror = function() { resolve(); };
            });
        }).catch(function() {});
    }

    function askDir(id, startIn) {
        // 部分旧版 Chrome 不支持 id / startIn 参数，失败时退回最简调用
        return window.showDirectoryPicker({ id: id, startIn: startIn || 'documents', mode: 'readwrite' })
            .catch(function(err) {
                if (err && (err.name === 'TypeError' || err.name === 'NotSupportedError')) {
                    return window.showDirectoryPicker({ mode: 'readwrite' });
                }
                throw err;
            });
    }

    function ensurePermission(dir) {
        if (!dir || !dir.queryPermission) return Promise.resolve(dir);
        return Promise.resolve(dir.queryPermission({ mode: 'readwrite' })).then(function(p) {
            if (p === 'granted') return dir;
            return Promise.resolve(dir.requestPermission({ mode: 'readwrite' })).then(function(p2) {
                return p2 === 'granted' ? dir : null;
            });
        });
    }

    function hasManaged(dir) {
        // 校验目录里是否有 TheLongDrive_Data\Managed
        var names = ['TheLongDrive_Data', 'thelongdrive_data', 'TheLongdrive_Data'];
        var i = 0;
        function tryNext() {
            if (i >= names.length) return Promise.resolve(null);
            var n = names[i++];
            return dir.getDirectoryHandle(n).then(function(d) {
                return d.getDirectoryHandle('Managed').then(function(m) { return m; }).catch(function() {
                    var ml = ['managed', 'Managed'];
                    return ml.reduce(function(p, name) {
                        return p.catch(function() { return d.getDirectoryHandle(name); });
                    }, Promise.reject());
                });
            }).catch(tryNext);
        }
        return tryNext();
    }

    function fetchBlob(url) {
        return fetch(url).then(function(r) {
            if (!r.ok) throw new Error('下载失败 HTTP ' + r.status);
            return r.blob();
        });
    }

    function writeFile(dir, name, blob) {
        return dir.getFileHandle(name, { create: true }).then(function(fh) {
            return fh.createWritable().then(function(w) {
                return w.write(blob).then(function() { return w.close(); });
            });
        });
    }

    function writeFromUrl(dir, name, url, label) {
        return fetchBlob(url).then(function(blob) {
            return writeFile(dir, name, blob).then(function() {
                logLine('安装：' + (label || name) + '（' + Math.round(blob.size / 1024) + ' KB）');
            });
        });
    }

    function removeIfExists(dir, name) {
        if (!dir) return Promise.resolve();
        return dir.removeEntry(name).then(function() {
            logLine('删除：' + name);
        }).catch(function() {});
    }

    // ---- 选择目录（返回 Promise，便于安装流程自动串起来） ----
    function setGamePath(text) {
        if (el.gamePath.value !== undefined) el.gamePath.value = text;
        else el.gamePath.textContent = text;
    }
    function setDocsPath(text) {
        el.docsPath.textContent = T(text);
    }
    function updateDocsText() {
        setDocsPath(docsDir ? T('已记住：') + docsDir.name : '未选择（点右侧按钮，打开的窗口已定位到「文档」，直接确认即可）');
    }

    function chooseGameDir() {
        if (!fsOk) return Promise.reject(new Error('当前浏览器不支持目录写入（需 Chrome / Edge + https/localhost）'));
        return askDir('tldGameDir', 'desktop').then(function(dir) {
            return hasManaged(dir).then(function(managed) {
                if (!managed) throw new Error('该目录不含 TheLongDrive_Data\\Managed，请选择游戏根目录（含 TheLongDrive.exe 的那个）');
                gameDir = dir;
                idbSet('gameDir', dir);
                setGamePath(dir.name + '\\（TheLongDrive_Data\\Managed 已找到）');
                logLine('游戏目录已就绪：' + dir.name);
                checkState();
                return dir;
            });
        });
    }

    function chooseDocsDir() {
        if (!fsOk) return Promise.reject(new Error('当前浏览器不支持目录写入（需 Chrome / Edge + https/localhost）'));
        logLine('已打开系统窗口并定位到「文档」，直接点「选择文件夹」即可');
        return askDir('tldDocsDir', 'documents').then(function(dir) {
            docsDir = dir;
            idbSet('docsDir', dir);
            updateDocsText();
            logLine('文档目录已就绪：' + dir.name);
            return dir;
        });
    }

    // 安装时如果还没有目录，自动串联弹出选择框（用户只需点一次确认）
    function ensureGame() {
        if (gameDir) {
            return ensurePermission(gameDir).then(function(g) {
                gameDir = g || gameDir;
                return g ? g : chooseGameDir();
            });
        }
        return chooseGameDir();
    }

    function ensureDocs() {
        if (docsDir) {
            return ensurePermission(docsDir).then(function(d) {
                docsDir = d || docsDir;
                return d ? d : chooseDocsDir();
            });
        }
        return chooseDocsDir();
    }

    function pickGame() {
        chooseGameDir().catch(function(err) {
            if (err && err.name === 'AbortError') return;
            logLine('✗ ' + (err.message || err));
        });
    }

    function pickDocs() {
        chooseDocsDir().catch(function(err) {
            if (err && err.name === 'AbortError') return;
            logLine('✗ ' + (err.message || err));
        });
    }

    function scanSteam() {
        logLine('正在寻找游戏路径（扫描 Steam 库）…');
        fetch('/api/loader/steam').then(function(r) { return r.json(); }).then(function(res) {
            var paths = (res && res.paths) || [];
            if (!paths.length) {
                logLine('未在 Steam 标准目录找到 TheLongDrive，请点「手动寻找路径」选择游戏根目录。');
                return;
            }
            paths.forEach(function(p) { logLine('找到：' + p); });
            logLine('提示：浏览器不允许网页自行指定任意路径，请点「手动寻找路径」，在弹出的窗口里进入上面的目录。');
            setGamePath('Steam 中检测到：' + paths[0]);
        }).catch(function() { logLine('扫描失败：网站后端不可用'); });
    }

    // ---- 状态检测 ----
    function checkState() {
        if (!gameDir) { setState('未选择游戏目录', ''); return; }
        hasManaged(gameDir).then(function(managed) {
            if (!managed) { setState('目录无效', 'err'); return; }
            return managed.getFileHandle('TLDLoader.dll').then(function() {
                setState('已安装', 'ok');
            }).catch(function() {
                setState(gameDir ? '未安装' : '未检测', '');
            });
        });
    }

    // ---- 安装 ----
    function ensureDirs() {
        return ensureGame().then(function() { return ensureDocs(); });
    }

    function getInfo() {
        return fetch('/api/loader/info').then(function(r) { return r.json(); }).then(function(res) {
            var map = {};
            (res.files || []).forEach(function(f) { map[f.key] = f; });
            info = map;
            return map;
        });
    }

    function assetsStep(map) {
        var docsRoot = docsDir;
        var step = docsRoot.name === 'TheLongDrive'
            ? Promise.resolve(docsRoot)
            : docsRoot.getDirectoryHandle('TheLongDrive', { create: true });
        return step.then(function(tld) {
            return tld.getDirectoryHandle('Mods', { create: true });
        }).then(function(mods) {
            return mods.getDirectoryHandle('Assets', { create: true });
        }).then(function(assets) {
            return assets.getDirectoryHandle('TLDLoader_Core', { create: true }).then(function(core) {
                return writeFromUrl(core, 'core.unity3d', map.core.url, 'Assets\\TLDLoader_Core\\core.unity3d');
            }).then(function() {
                return assets.getDirectoryHandle('TLDLoader_Settings', { create: true });
            }).then(function(setDir) {
                return writeFromUrl(setDir, 'settingsui.unity3d', map.settingsui.url, 'Assets\\TLDLoader_Settings\\settingsui.unity3d');
            });
        });
    }

    function install(v) {
        v = v || variant;
        if (!fsOk) { logLine('当前浏览器不支持（需 Chrome / Edge + https/localhost）'); return; }
        logLine('开始安装' + (v === 'old' ? '旧版' : '新版') + '加载器…请先关闭游戏');
        ensureDirs()
            .then(function() { return getInfo(); })
            .then(function(map) {
                return hasManaged(gameDir).then(function(managed) {
                    if (!managed) throw new Error('未找到 TheLongDrive_Data\\Managed');
                    var loaderKey = v === 'old' ? 'loader_old' : 'loader_new';
                    return writeFromUrl(managed, '0Harmony.dll', map.harmony.url, '0Harmony.dll')
                        .then(function() { return writeFromUrl(managed, 'TLDLoader.dll', map[loaderKey].url, 'TLDLoader.dll'); })
                        .then(function() { return writeFromUrl(managed, 'Assembly-CSharp.dll', map.assembly_patched.url, 'Assembly-CSharp.dll'); })
                        .then(function() { return assetsStep(map); });
                });
            })
            .then(function() {
                logLine('✓ 加载器安装完毕，尽情添加模组吧！');
                setState('已安装', 'ok');
            })
            .catch(function(err) {
                if (err && err.name === 'AbortError') { logLine('已取消选择目录'); return; }
                logLine('✗ 安装失败：' + (err && err.message ? err.message : err) + '（若提示占用，请先退出游戏）');
            });
    }

    // ---- 在线更新：只重新拉取最新 TLDLoader.dll ----
    function onlineUpdate() {
        if (!fsOk) { logLine('当前浏览器不支持（需 Chrome / Edge + https/localhost）'); return; }
        logLine('在线更新：重新拉取最新 TLDLoader.dll…');
        ensureGame()
            .then(function() { return getInfo(); })
            .then(function(map) {
                return hasManaged(gameDir).then(function(managed) {
                    if (!managed) throw new Error('未找到 TheLongDrive_Data\\Managed');
                    return writeFromUrl(managed, 'TLDLoader.dll', map.loader_new.url, 'TLDLoader.dll（最新）');
                });
            })
            .then(function() {
                logLine('✓ 在线更新完成');
                setState('已安装', 'ok');
            })
            .catch(function(err) {
                if (err && err.name === 'AbortError') { logLine('已取消选择目录'); return; }
                logLine('✗ 更新失败：' + (err && err.message ? err.message : err));
            });
    }

    function setVariant(v) {
        variant = v;
        el.installOld.classList.toggle('selected', v === 'old');
        if (el.note) el.note.textContent = T(v === 'old'
            ? '说明：当前选择「旧版」，点下方「安装模组加载器」开始安装；兼容老版本游戏。'
            : '说明：当前选择「新版」，点下方「安装模组加载器」开始安装；「在线更新」只重新拉取最新 TLDLoader.dll。');
    }

    function showAbout() {
        logLine('长途旅行模组加载器（网页版）　By: BENBAIJIE');
        logLine('功能：一键安装/卸载 TLDLoader、0Harmony 与资源包；支持旧版/新版/在线更新；可导出离线整合包。');
        logLine('安装位置：游戏目录\\TheLongDrive_Data\\Managed 与 文档\\TheLongDrive\\Mods\\Assets');
        logLine('官网：https://znine.fun');
    }

    // ---- 卸载 ----
    function uninstall() {
        if (!fsOk) { logLine('当前浏览器不支持'); return; }
        if (!gameDir) { logLine('请先选择游戏目录'); return; }
        logLine('开始卸载加载器…');
        ensurePermission(gameDir).then(function(g) {
            if (!g) throw new Error('游戏目录权限被拒绝');
            gameDir = g;
            return hasManaged(g);
        }).then(function(managed) {
            if (!managed) throw new Error('未找到 TheLongDrive_Data\\Managed');
            return removeIfExists(managed, 'TLDLoader.dll')
                .then(function() { return removeIfExists(managed, '0Harmony.dll'); })
                .then(function() {
                    return fetchBlob('/loader/restore/Assembly-CSharp.dll').then(function(blob) {
                        return writeFile(managed, 'Assembly-CSharp.dll', blob).then(function() {
                            logLine('还原：Assembly-CSharp.dll（原版）');
                        });
                    });
                })
                .then(function() {
                    if (!docsDir) return;
                    var step = docsDir.name === 'TheLongDrive'
                        ? Promise.resolve(docsDir)
                        : docsDir.getDirectoryHandle('TheLongDrive', { create: false });
                    return step.then(function(tld) {
                        return tld.getDirectoryHandle('Mods', { create: false });
                    }).then(function(mods) {
                        return mods.getDirectoryHandle('Assets', { create: false });
                    }).then(function(assets) {
                        return assets.getDirectoryHandle('TLDLoader_Core', { create: false }).then(function(d) {
                            return removeIfExists(d, 'core.unity3d');
                        }).then(function() {
                            return assets.getDirectoryHandle('TLDLoader_Settings', { create: false });
                        }).then(function(d) {
                            return removeIfExists(d, 'settingsui.unity3d');
                        });
                    }).catch(function() {});
                });
        }).then(function() {
            logLine('✓ 已卸载，Assembly-CSharp.dll 已还原');
            setState('未安装', '');
        }).catch(function(err) {
            logLine('✗ 卸载失败：' + (err && err.message ? err.message : err) + '（若提示占用，请先退出游戏）');
        });
    }

    el.pickGame.addEventListener('click', pickGame);
    if (el.pickGameModify) el.pickGameModify.addEventListener('click', pickGame);
    el.pickDocs.addEventListener('click', pickDocs);
    el.scanSteam.addEventListener('click', scanSteam);
    el.installOld.addEventListener('click', function() { setVariant('old'); });
    el.installBtn.addEventListener('click', function() { install(); });
    if (el.update) el.update.addEventListener('click', onlineUpdate);
    el.uninstall.addEventListener('click', uninstall);

    if (el.about) el.about.addEventListener('click', showAbout);
    if (el.refreshState) el.refreshState.addEventListener('click', function() {
        logLine('刷新安装状态…');
        checkState();
    });

    var inited = false;
    window.__loaderInit = function() {
        if (inited) return;
        inited = true;
        if (!fsOk) {
            logLine('⚠ 当前环境不支持「写入文件夹」：请用 Chrome / Edge，并通过 https 或 localhost 访问');
        }
        getInfo().catch(function() {});
        setVariant('new');
        Promise.all([idbGet('gameDir'), idbGet('docsDir')]).then(function(res) {
            gameDir = res[0];
            docsDir = res[1];
            if (gameDir) {
                setGamePath('已记住：' + gameDir.name);
                checkState();
            }
            updateDocsText();
        });
    };
})();

(function() {
    var cid = localStorage.getItem('site_cid');
    if (!cid) {
        cid = 'c' + Math.random().toString(36).slice(2) + Date.now().toString(36);
        localStorage.setItem('site_cid', cid);
    }

    function post(path, data) {
        return fetch(path, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data || {})
        }).then(function(res) { return res.json(); });
    }

    var statTotal = document.getElementById('statTotal');
    var statToday = document.getElementById('statToday');
    var statOnline = document.getElementById('statOnline');

    function updateAll(res) {
        if (!res || !res.ok) return;
        if (statTotal) statTotal.textContent = res.total_pv;
        if (statToday) statToday.textContent = res.today_pv;
        if (statOnline) statOnline.textContent = res.online;
        var downloads = res.downloads || {};
        document.querySelectorAll('.dl-count').forEach(function(span) {
            var n = downloads[span.getAttribute('data-soft')] || 0;
            span.textContent = T(' · 下载 ') + n + T(' 次');
        });
    }

    function ping() {
        post('/api/ping', { cid: cid }).then(updateAll).catch(function() {});
    }

    post('/api/visit').then(ping).catch(function() {});
    ping();
    setInterval(ping, 5000);

    document.addEventListener('click', function(e) {
        var btn = e.target.closest('.download-btn');
        if (!btn) return;
        var card = btn.closest('.software-card');
        if (!card) return;
        var name = card.getAttribute('data-name') || '';
        if (!name) return;
        post('/api/download', { name: name }).then(function(res) {
            if (!res.ok) return;
            document.querySelectorAll('.dl-count').forEach(function(span) {
                if (span.getAttribute('data-soft') === name) {
                    span.textContent = T(' · 下载 ') + res.count + T(' 次');
                }
            });
        }).catch(function() {});
    });
})();

(function() {
    var STORE_KEY = 'site_lang';
    var DICT = {
        '主页': 'Home', '下载': 'Download', '公告🔥': 'News🔥', '聊天💬': 'Chat💬',
        '聊天': 'Chat', '公告': 'News', '上传功能已关闭': 'Uploads disabled', '允许用户上传资源': 'Allow user uploads',
        '欢迎来到长途旅行下载站！': 'Welcome to the TLD download site!',
        '长途旅行小助手（他能为你的长途旅行添加模组！）': 'TLD Helper (adds mods to your game!)',
        '模组加载 | 助手工具 ': 'Mod Loader | Helper Tools ',
        '主播B站': 'Bilibili', '主播酷安': 'Coolapk', '主播抖音': 'Douyin',
        '软件下载': 'Downloads',
        '资源库': 'Library', '搜索资源': 'Search', '最近更新': 'Recently Updated',
        '浏览全部资源 →': 'Browse all →', '资源总数': 'Resources',
        '＋ 上传资源': '+ Upload', '＋ 上传资源（需登录）': '+ Upload (login required)',
        '上传资源': 'Upload Resource', '编辑资源': 'Edit Resource', '保存修改': 'Save Changes',
        '点击选择文件，或直接把文件拖到这里': 'Click to choose a file, or drag it here',
        '请先登录后再上传资源': 'Please log in before uploading',
        '模组加载器': 'Mod Loaders', '小助手': 'Helpers', '游戏本体': 'Game Files', '工具': 'Tools',
        '游戏': 'Games', 'apk': 'APK', '文件': 'Files', '软件': 'Software',
        '长途旅行': 'The Long Drive', '模组': 'Mod', '存档': 'Save', '类型': 'Type',
        '玩家分享': 'Player Shares', '还没有玩家分享': 'No player shares yet',
        ' 个分享': ' shares',
        '待审核': 'Pending', '通过': 'Approve', '拒绝': 'Reject',
        '已提交，审核通过后显示': 'Submitted, visible after approval',
        '已通过审核': 'Approved', '已拒绝并删除': 'Rejected and deleted',
        '直链下载': 'Direct Download', '速度快，推荐': 'Fast, recommended',
        '小飞机网盘': 'Feijipan', '不限速，无需登录': 'No speed limit, no login',
        '夸克网盘': 'Quark Drive', '123 网盘': '123 Drive', '百度网盘': 'Baidu Drive',
        '整合全部资源': 'All resources', '需登录百度账号': 'Baidu account required',
        '选择下载方式': 'Choose download source', '没有找到相关资源': 'No resources found',
        '网站资源': 'Site Resources', '🚗 长途旅行模组下载': '🚗 TLD Mods',
        '共 ': 'Total: ', ' 个模组': ' mods', ' 个资源': ' resources',
        '搜索模组名称、简介、作者…': 'Search mods, authors, descriptions…',
        '没有找到相关模组': 'No mods found', '换个关键词或分类试试': 'Try another keyword or category',
        '清空筛选': 'Clear filters', '加载更多模组': 'Load more mods',
        '下载模组': 'Download Mod', '作者 ': 'Author: ', '依赖 ': 'Requires: ',
        '详情': 'Details', '返回列表': 'Back to list', '（暂无简介）': '(No description)',
        '保存到游戏 Mods 文件夹': 'Save to game Mods folder',
        '默认 文档\\TheLongDrive\\Mods，选择一次后自动记住': 'Defaults to Documents\\TheLongDrive\\Mods, remembered after first pick',
        '普通下载': 'Normal download', '保存到浏览器下载目录': 'Saves to browser Downloads folder',
        '提示：首次保存会请你选择 文档\\TheLongDrive\\Mods 文件夹，只选一次，之后所有模组自动写入': 'Tip: first save asks you to pick Documents\\TheLongDrive\\Mods — chosen once, reused afterwards',
        '当前浏览器不支持直接保存到文件夹（需 Chrome / Edge），可先用普通下载': 'This browser cannot save to folders (needs Chrome / Edge). Use normal download instead.',
        '正在准备…': 'Preparing…', '正在下载 ': 'Downloading ', ' …': ' …',
        '已保存到所选文件夹，进游戏即可生效': 'Saved to the selected folder — ready in game',
        '保存失败，可换普通下载': 'Save failed, try normal download', '取消': 'Cancel',
        '已开始下载到浏览器下载目录': 'Download started to browser Downloads folder',
        '提示：模组来源于 WorkshopTLD 社区库（GitLab），点击「下载模组」直达 DLL 文件；下载后放入游戏目录 Mods 文件夹，配合模组加载器使用。列表每 6 小时自动同步一次。': "Mods come from the WorkshopTLD community library (GitLab). Click \"Download Mod\" to get the DLL, put it into the game's Mods folder with a mod loader. The list syncs every 6 hours.",
        '换个关键词试试，或者清空搜索看看全部资源': 'Try another keyword or clear the search.',
        '清空搜索': 'Clear search', '资源名称不能为空': 'Resource name is required',
        '上传成功，感谢分享！': 'Uploaded successfully, thanks for sharing!',
        '提示：网盘是小飞机网盘支持不登录直链下载，并且还不限速，但是我还是建议进群下载，因为群内的消息绝对是最新的！': 'Tip: Feijipan supports direct downloads without login or speed limits, but joining the QQ group is recommended for the latest updates!',
        '最新公告': 'Announcements',
        '登录': 'Login', '注册': 'Register', '忘记密码？': 'Forgot password?', '返回上一步': 'Back',
        '获取验证码': 'Get Code', '账号管理': 'Account', '修改密码': 'Change Password', '退出登录': 'Logout',
        '发送': 'Send', '聊天室': 'Chat Room', '论坛': 'Forum', '＋ 发帖': '+ New Post',
        '取消': 'Cancel', '发布': 'Post', '发布公告': 'Publish', '保存修改': 'Save',
        '邮箱格式不正确': 'Invalid email format',
        '上传头像': 'Upload Avatar',
        '关于我们': 'About Us', '进入官方QQ群 (点击跳转)': 'Join official QQ group (click)',
        '网站开放时间: 2026.04.14': 'Online since: 2026.04.14',
        '总访问量': 'Total views', '今日访问': 'Today', '当前在线': 'Online',
        'BENBAIJIELoader注入器': 'BENBAIJIELoader Injector',
        '此软件是集合了多个游戏的加载器，比较实用建议下载这个！基于长途旅行模组加载器改过来的。': 'A loader for multiple games. Recommended! Based on the TLD mod loader.',
        '一键临时ROOT🔥': 'One-click Temp ROOT🔥',
        '该工具可以为iqoovivo手机进行临时ROOT': 'Temporary ROOT for iQOO/vivo phones.',
        '真正的异环': 'Real "Yihuan"',
        '修改异环的画质，使他变得一坨，实现低配电脑畅玩异环（仅此娱乐）': 'Degrades Yihuan graphics so low-end PCs can run it (just for fun).',
        '长途旅行本体🔥': 'The Long Drive (Game)🔥',
        '该版本并不是最新的，但是用来加模组是最好的一个版本。': 'Not the latest version, but the best one for adding mods.',
        '长途旅行小助手🔥': 'TLD Helper🔥',
        '兼容模组加载器、加模组功能、一些小功能，目前没啥好更新的了，已是完全版。': 'Works with the mod loader, adds mods and small features. Final version.',
        '长途旅行模组加载器🔥': 'TLD Mod Loader🔥',
        '用来给长途旅行加载模组的，注意这个软件并不能添加模组。': 'Loads mods for The Long Drive. Note: it cannot add mods by itself.',
        'Assets文件🔥': 'Assets Files🔥',
        'Assets是mod的前置文件，不安装的话将会导致长途旅行模组不完全！': 'Required prerequisite for mods; without it mods will be incomplete!',
        '后室模组加载器': 'Backrooms Mod Loader',
        '由于后室更新了，目前模组是加不了的。': 'Backrooms was updated, so mods cannot be loaded currently.',
        '植物大战僵尸杂交版辅助': 'PvZ Hybrid Helper',
        '自己学习制作的一个辅助，没啥功能。': 'A helper I made while learning; not many features.',
        '长途旅行车间工具': 'TLD Workshop Tool',
        '由熙洛汉化的车间工具，该工具与原版车间工具功能相同，只是汉化了而已。': 'Workshop tool translated by Xiluo; same features as the original, just localized.',
        '森林之子模组加载器': 'Sons of the Forest Mod Loader',
        'BENBAIJIE个人制作，现在东西很少，也是基于长途旅行模组加载器改过来的。': 'Made by BENBAIJIE, few contents yet, based on the TLD mod loader.',
        '森林科技加载': 'Forest Tech Loader',
        '他可以帮你辅助游戏，BENBAIJIE个人制作，基于长途旅行模组加载器改过来的。': 'A game assistant by BENBAIJIE, based on the TLD mod loader.',
        '邮箱': 'Email', '密码': 'Password', '用户名': 'Username', '验证码': 'Code',
        '当前密码': 'Current password', '新密码（至少6位）': 'New password (min 6)',
        '新密码': 'New password', '确认修改': 'Confirm',
        '说点什么...': 'Say something...', '帖子标题': 'Post title',
        '标签（用逗号分隔，最多5个）': 'Tags (comma separated, max 5)',
        '分享点什么...': 'Share something...', '公告标题': 'Title', '公告内容...': 'Content...',
        '搜索帖子标题、内容或作者...': 'Search title, content or author...',
        '写下你的回复...': 'Write a reply...',
        '已关注': 'Following', '+ 关注': '+ Follow', ' 粉丝': ' fans', ' 条回复': ' replies',
        '回复': 'Reply', '删除': 'Delete', '编辑': 'Edit', '← 返回列表': '← Back to list',
        '没有找到相关帖子': 'No posts found', '当前账号：': 'Account: ', '（管理员）': ' (Admin)',
        '日期 ': 'Date ', '作者 ': 'By ', '关注 ': 'Following ', ' · 粉丝 ': ' · Fans ', ' · 发帖 ': ' · Posts ',
        ' · 回复 ': ' · Replies ', ' · 下载 ': ' · ', ' 次': ' downloads',
        '+ 发布软件': '+ Publish', '发布软件': 'Publish Software', '编辑软件': 'Edit Software',
        '发布': 'Publish', '保存': 'Save', '移除图片': 'Remove Image',
        '软件名称': 'Software name', '软件简介...': 'Description...',
        '如 V1.0': 'e.g. V1.0', '如 2026-10-10': 'e.g. 2026-10-10', '如 3.75 MB': 'e.g. 3.75 MB',
        '网盘链接或本地文件名': 'Download link or local file',
        // 站点首页 / 资源库
        '资源下载站': 'Download Center',
        'BENBAIJIE · 官方资源站': 'BENBAIJIE · Official Site',
        '长途旅行 · 模组加载器 · 实用工具，所有资源一站直达': 'The Long Drive · Mod Loader · Utilities, all in one place',
        '搜索资源：工具、游戏、apk、软件…': 'Search: tools, games, APK, software…',
        '搜索资源名称或作者…': 'Search resource name or author…',
        '搜索资源名称、简介、作者…': 'Search name, description, author…',
        '搜索模组名称、简介、作者…': 'Search mod name, description, author…',
        '长途旅行模组下载': 'TLD Mods',
        '默认排序': 'Default order', '最新发布': 'Newest', '下载最多': 'Most downloaded', '按名称': 'By name',
        '找到 ': 'Found ', ' 个（共 ': ' (total ', ' 个资源）': ' resources)',
        '上传资源需要先登录，': 'Login is required to upload. ',
        '点此登录 / 注册': 'Login / Sign up',
        '模组源': 'Mod source', '图片源': 'Image source',
        'GitLab（默认）': 'GitLab (default)', '服务器（已缓存，更稳定）': 'Server (cached, more stable)',
        '提示：模组来源于汉化作者B站：“网飞NetFei”（GitLab），点击「下载模组」直达 DLL 文件；下载后放入游戏目录 Mods 文件夹，配合模组加载器使用。列表每 6 小时自动同步一次。': 'Tip: mods come from the WorkshopTLD library (GitLab, localized by NetFei). Click "Download Mod" to get the DLL, then put it into the game Mods folder and use it with the mod loader. The list syncs every 6 hours.',
        '提示：点「下载」可选择直链、小飞机网盘、夸克 / 123 / 百度网盘等镜像——直链速度快，网盘不限速；后端掉线时直链会自动切到静态站文件，仍可正常下载。登录后还可以上传自己的资源！': 'Tip: "Download" offers direct links plus Feijipan, Quark, 123 and Baidu mirrors. Direct links are fast; cloud drives have no speed limits. If the backend is offline, direct links fall back to static files. Log in to upload your own resources!',
        // 模组加载器
        '路径：': 'Path: ',
        '修改': 'Change',
        '模组加载器是否安装：': 'Loader installed: ',
        '未检测': 'Not checked', '刷新': 'Refresh',
        '模组加载器旧版': 'Mod Loader (Old)', '模组加载器新版': 'Mod Loader (New)',
        '在线更新加载器': 'Update Loader Online',
        '说明：当前选择「新版」，点下方「安装模组加载器」开始安装；「在线更新」只重新拉取最新 TLDLoader.dll。': 'Note: "New" is selected. Click "Install Mod Loader" below; "Update Loader Online" only re-downloads the latest TLDLoader.dll.',
        '说明：当前选择「旧版」，点下方「安装模组加载器」开始安装；兼容老版本游戏。': 'Note: "Old" is selected. Click "Install Mod Loader" below; compatible with older game versions.',
        '等待操作…': 'Waiting…',
        '寻找游戏路径': 'Find Game Path', '安装模组加载器': 'Install Mod Loader',
        '卸载模组加载器': 'Uninstall Mod Loader', '手动寻找路径': 'Choose Path Manually',
'关于软件': 'About',
        '文档目录：': 'Documents: ', '未选择': 'Not selected',
        '一键定位文档目录': 'Auto Locate Documents',
        '点击寻找，让你轻松完成模组一键安装': 'Click to find the game and install mods in one step',
        '点击进入官网': 'Visit official site',
        '作者：BENBAIJIE · 模组加载器网页版': 'By BENBAIJIE · Mod Loader Web Edition',
        '提示：安装前请先关闭游戏（Steam 里退出 TheLongDrive），否则 DLL 被占用会写入失败。卸载会把 Assembly-CSharp.dll 还原成原版。此功能需要 Chrome / Edge，并且网站要通过 https 或 localhost 访问。': 'Tip: close the game first (exit TheLongDrive in Steam), otherwise the DLL is locked and writing fails. Uninstall restores the original Assembly-CSharp.dll. Requires Chrome / Edge and https or localhost.',
        '已安装': 'Installed', '未安装': 'Not installed', '未选择': 'Not selected',
        '已记住：': 'Saved: ',
        '未选择（点右侧按钮，打开的窗口已定位到「文档」，直接确认即可）': 'Not selected (click the button; the dialog already opens at Documents)',
        // 上传资源弹窗
        '登录后即可上传资源，信息填写完成后即可发布；封面图片可选。': 'Log in to upload, fill in the details and publish. Cover image is optional.',
        '⚠ 上传内容须知（请务必阅读）': '⚠ Upload rules (please read)',
        '严禁发布色情、暴力、血腥恶心、赌博、诈骗及任何违法违规内容。': 'No pornographic, violent, gory, gambling, scam or illegal content.',
        '严禁上传带病毒、木马、恶意脚本的文件或链接。': 'No files or links containing viruses, trojans or malicious scripts.',
        '违规资源一经发现立即删除，违规账号将被封禁并拉黑邮箱。': 'Violating resources are removed immediately; offending accounts are banned and blacklisted.',
        '我已确认资源符合以上要求，并愿意承担上传责任': 'I confirm this resource meets the rules and I take upload responsibility',
        '资源名称': 'Resource name', '简介': 'Description',
        '版本': 'Version', '日期': 'Date', '大小': 'Size', '作者': 'Author',
        '小飞机网盘链接': 'Feijipan link', '夸克网盘链接': 'Quark link',
        '123网盘链接': '123 Drive link', '百度网盘链接': 'Baidu Drive link',
        '上传文件': 'Upload file', '封面图片': 'Cover image',
        '本地文件名或完整链接，留空则只显示网盘': 'Local file name or full URL; leave empty to show only cloud drives',
        '留空则不显示该项': 'Leave empty to hide this option', '留空则不显示': 'Leave empty to hide',
        'png/jpg/gif/webp，最大10MB，可留空': 'png/jpg/gif/webp, max 10MB, optional',
        '如：长途旅行模组加载器': 'e.g. TLD Mod Loader',
        '简单介绍这个资源的用途...': 'Briefly describe what this resource does...',
        '如 BENBAIJIELoaderV1.0.exe 或 https://...': 'e.g. BENBAIJIELoaderV1.0.exe or https://...',
        '尚未选择游戏目录': 'No game folder selected',
        '注册并登录': 'Sign up & login', '重置密码': 'Reset password', '返回登录': 'Back to login',
        '邮箱验证码': 'Email code', '密码（至少6位）': 'Password (min 6)',
        '注册时用的邮箱': 'Email used at sign-up',
        // 音乐播放器
        '歌单': 'Playlist', '暂无播放': 'Nothing playing', '未命名': 'Untitled',
        '待添加': 'TBA', '待添加音频文件': 'Audio file missing',
        '歌单还没有歌曲': 'No songs yet',
        '示例歌曲 1': 'Sample Song 1', '示例歌曲 2': 'Sample Song 2', '示例歌曲 3': 'Sample Song 3',
        // 下载方式 / 模组分类
        '直链下载': 'Direct link',
        '速度快，推荐': 'Fast, recommended', '不限速，无需登录': 'No speed limit, no login',
        '小飞机网盘': 'Feijipan', '夸克网盘': 'Quark Drive', '123 网盘': '123 Drive', '百度网盘': 'Baidu Drive',
        '上一页': 'Prev', '下一页': 'Next', '清空筛选': 'Clear filter',
        'WorkshopTLD 主库': 'WorkshopTLD (Main)',
        '全部': 'All', '未分类': 'Uncategorized',
        '物品': 'Items', '游戏玩法': 'Gameplay', '生活质量': 'Quality of Life',
        '车辆': 'Vehicles', '发动机': 'Engines', '武器': 'Weapons', '遗产': 'Legacy',
        '非玩家角色': 'NPCs', '图形': 'Graphics', '作弊': 'Cheats', '模组的模组': 'Mods of Mods',
        '建筑物': 'Buildings', '图形用户界面': 'GUI', '模组库': 'Mod Library',
        '性能': 'Performance', '美容': 'Cosmetics',
        // 资源分区 / 详情互动
        '分区': 'Category', '热门': 'Hot', '其他': 'Other', '模组': 'Mods',
        '点赞': 'Like', '已点赞': 'Liked', '收藏': 'Favorite', '已收藏': 'Favorited',
        '浏览': 'Views', '发表回复': 'Post reply', '上传': 'Uploaded by',
        '暂无回复，来说两句吧': 'No replies yet — say something',
        '登录后即可点赞、收藏和回复，': 'Log in to like, favorite and reply. ', '点此登录': 'Log in',
        '回复内容不能为空': 'Reply cannot be empty', '回复失败': 'Reply failed',
        '确定删除这条回复吗？': 'Delete this reply?', '删除失败': 'Delete failed',
        '操作失败': 'Operation failed',
        // 我的（个人中心）
        '我的': 'Me', '管理员': 'Admin', 'BENBAIJIE 资源站用户': 'BENBAIJIE user',
        '我的收藏': 'My Favorites', '我的点赞': 'My Likes', '我上传的': 'My Uploads', '我回复的': 'My Replies',
        '登录后查看你的收藏、点赞和上传': 'Log in to see your favorites, likes and uploads',
        '收藏的资源会集中显示在这里，方便下次快速找到。': 'Favorited resources are collected here so you can find them again quickly.',
        '登录 / 注册': 'Log in / Sign up',
        '还没有收藏任何资源': 'No favorites yet',
        '在资源详情点「收藏」，资源就会出现在这里': 'Tap "Favorite" in a resource detail and it will appear here.',
        '还没有点赞任何资源': 'No likes yet',
        '喜欢的资源点个赞，下次好找回来': 'Like a resource to find it again easily.',
        '还没有上传过资源': 'No uploads yet',
        '点击资源库的「上传资源」分享你的作品': 'Use "Upload Resource" in the library to share your work.',
        '还没有回复过资源': 'No replies yet',
        '在资源详情里参与讨论，回复会显示在这里': 'Join the discussion in a resource detail; your replies show up here.',
        '去资源库逛逛': 'Browse the library',
        // 模组加载器（步骤版）
        '选择游戏目录': 'Choose Game Folder', '加载器版本': 'Loader Version', '一键安装': 'One-Click Install',
        '自动寻找（Steam）': 'Auto Find (Steam)', '手动选择文件夹': 'Pick Folder Manually', '更换': 'Change',
        '旧版': 'Old', '兼容老版本游戏': 'For older game versions',
        '已装过？点这里在线更新到最新版': 'Already installed? Click to update online',
        '安装模组加载器': 'Install Mod Loader', '卸载': 'Uninstall', '刷新': 'Refresh',
        '定位文档目录': 'Locate Documents', '关于': 'About', '尚未选择游戏目录': 'No game folder selected',
        '等待操作…': 'Waiting…', '未检测': 'Not checked', '已安装': 'Installed', '未安装': 'Not installed'
    };
    var TEXT_SEL = '.nav-item, .page-title, .social-btn span, .software-name, .software-desc, .download-btn, .tip-warning, .home-sub, .home-title, .home-eyebrow, .hero-search-btn, .group-btn, .auth-tab, .auth-submit, .code-btn, .chat-send, .auth-link, .field-hint, #newPostBtn, #cancelPostBtn, .compose-btns .f-btn, #logoutBtn, .featured-title, .hero-tag, .dl-upload-btn, .dl-empty-title, #dlEmptyReset, #viewAllBtn, .dl-empty-sub, .dl-tab, .dl-login-link, .dl-upload-note, .dl-warn-title, .dl-content-warn li, .dl-img-hint, .dl-img-clear, .dl-sort option, .tld-opt option, #swCat option, .dl-admin-upload span, #tldEmptyReset, .loader-step-title, .loader-variant-btn b, .loader-variant-btn span, .loader-update-link, .loader-btn, .loader-mini-btn, .music-list-head, #profileGoLibrary, .pm-title, .pm-sub';
    var NODE_SEL = '.dl-field, .tld-opt, .dl-warn-agree, .dl-login-hint, .loader-docs-row';

    window.T = function(s) {
        if ((localStorage.getItem(STORE_KEY) || 'zh') !== 'en') return s;
        return DICT[s] || s;
    };

    function applyNodeText(root, toEn) {
        root.querySelectorAll(NODE_SEL).forEach(function(el) {
            el.childNodes.forEach(function(node) {
                if (node.nodeType !== 3) return;
                var key = node.nodeValue.trim();
                if (!key) return;
                if (!node._zh) node._zh = key;
                node.nodeValue = toEn ? (DICT[node._zh] || node._zh) : node._zh;
            });
        });
    }

    function applyLang(lang) {
        localStorage.setItem(STORE_KEY, lang);
        document.documentElement.lang = lang === 'en' ? 'en' : 'zh-CN';
        var toEn = lang === 'en';
        document.querySelectorAll(TEXT_SEL).forEach(function(el) {
            if (!el.dataset.zh) el.dataset.zh = el.textContent.trim();
            var zh = el.dataset.zh;
            el.textContent = toEn ? (DICT[zh] || zh) : zh;
        });
        applyNodeText(document, toEn);
        document.querySelectorAll('input[placeholder], textarea[placeholder]').forEach(function(el) {
            if (!el.dataset.zhPh) el.dataset.zhPh = el.getAttribute('placeholder');
            var zh = el.dataset.zhPh;
            el.setAttribute('placeholder', toEn ? (DICT[zh] || zh) : zh);
        });
        document.querySelectorAll('.stat-badge').forEach(function(el) {
            var node = el.firstChild;
            if (!node || node.nodeType !== 3) return;
            if (!el.dataset.zh) el.dataset.zh = node.nodeValue.trim();
            node.nodeValue = (toEn ? (DICT[el.dataset.zh] || el.dataset.zh) : el.dataset.zh) + ' ';
        });
        document.querySelectorAll('.version-meta').forEach(function(el) {
            el.childNodes.forEach(function(node) {
                if (node.nodeType !== 3) return;
                if (!node._zh) node._zh = node.nodeValue;
                node.nodeValue = toEn
                    ? node._zh.replace(/版本/g, 'Ver').replace(/日期/g, 'Date').replace(/大小/g, 'Size').replace(/作者/g, 'By')
                    : node._zh;
            });
        });
        var btn = document.getElementById('langBtn');
        if (btn) btn.textContent = toEn ? '中文' : 'EN';
        document.title = toEn ? 'BENBAIJIE Download Center' : 'BENBAIJIE 资源下载站';
        window.dispatchEvent(new Event('langchange'));
    }

    // 供动态渲染的区域（如下载页卡片）做局部翻译
    window.__applyLangText = function(root) {
        if (!root) return;
        var toEn = (localStorage.getItem(STORE_KEY) || 'zh') === 'en';
        root.querySelectorAll(TEXT_SEL).forEach(function(el) {
            if (!el.dataset.zh) el.dataset.zh = el.textContent.trim();
            var zh = el.dataset.zh;
            el.textContent = toEn ? (DICT[zh] || zh) : zh;
        });
        applyNodeText(root, toEn);
        root.querySelectorAll('.version-meta').forEach(function(el) {
            el.childNodes.forEach(function(node) {
                if (node.nodeType !== 3) return;
                if (!node._zh) node._zh = node.nodeValue;
                node.nodeValue = toEn
                    ? node._zh.replace(/版本/g, 'Ver').replace(/日期/g, 'Date').replace(/大小/g, 'Size').replace(/作者/g, 'By')
                    : node._zh;
            });
        });
    };

    var langBtn = document.getElementById('langBtn');
    if (langBtn) {
        langBtn.addEventListener('click', function() {
            applyLang((localStorage.getItem(STORE_KEY) || 'zh') === 'en' ? 'zh' : 'en');
        });
    }
    applyLang(localStorage.getItem(STORE_KEY) || 'zh');
})();

/* ===== 左上角音乐播放器 ===== */
(function () {
    var MUSIC_TRACKS = [
        { title: '示例歌曲 1', artist: '待添加', src: 'music/1.mp3', cover: 'music/1.jpg' },
        { title: '示例歌曲 2', artist: '待添加', src: 'music/2.mp3', cover: 'music/2.jpg' },
        { title: '示例歌曲 3', artist: '待添加', src: 'music/3.mp3', cover: 'music/3.jpg' }
    ];

    var player = document.getElementById('musicPlayer');
    if (!player) return;

    var disc = document.getElementById('musicDisc');
    var discImg = document.getElementById('musicDiscImg');
    var note = document.getElementById('musicNote');
    var panel = document.getElementById('musicPanel');
    var coverEl = document.getElementById('musicCover');
    var titleEl = document.getElementById('musicTitle');
    var artistEl = document.getElementById('musicArtist');
    var listEl = document.getElementById('musicList');
    var playBtn = document.getElementById('musicPlay');
    var prevBtn = document.getElementById('musicPrev');
    var nextBtn = document.getElementById('musicNext');
    var closeBtn = document.getElementById('musicClose');

    var PREF_KEY = 'znine_music_paused';
    var audio = new Audio();
    audio.preload = 'metadata';
    var current = 0;
    var audioError = false;

    function pausedBefore() {
        try { return localStorage.getItem(PREF_KEY) === '1'; } catch (e) { return false; }
    }
    function rememberPaused() {
        try { localStorage.setItem(PREF_KEY, '1'); } catch (e) {}
    }
    function asset(p) {
        return window.__apiUrl ? window.__apiUrl('/' + p) : p;
    }

    function setPlayingUI(on) {
        disc.classList.toggle('playing', on);
        playBtn.classList.toggle('music-playing', on);
        playBtn.setAttribute('aria-label', on ? '暂停' : '播放');
    }

    function setCover(src) {
        discImg.onerror = function () {
            discImg.style.display = 'none';
            discImg.removeAttribute('src');
            note.style.display = '';
            coverEl.style.backgroundImage = '';
        };
        if (src) {
            discImg.src = src;
            discImg.style.display = 'block';
            note.style.display = 'none';
            coverEl.style.backgroundImage = 'url("' + src + '")';
        } else {
            discImg.removeAttribute('src');
            discImg.style.display = 'none';
            note.style.display = '';
            coverEl.style.backgroundImage = '';
        }
    }

    function renderList() {
        listEl.innerHTML = '';
        if (!MUSIC_TRACKS.length) {
            var empty = document.createElement('li');
            empty.className = 'music-list-empty';
            empty.textContent = T('歌单还没有歌曲');
            listEl.appendChild(empty);
            return;
        }
        MUSIC_TRACKS.forEach(function (t, i) {
            var li = document.createElement('li');
            li.className = 'music-item' + (i === current ? ' active' : '');
            li.setAttribute('data-mi', String(i));
            var idx = document.createElement('span');
            idx.className = 'mi-index';
            idx.textContent = String(i + 1);
            var tt = document.createElement('span');
            tt.className = 'mi-title';
            tt.textContent = T(t.title || '未命名');
            var dot = document.createElement('span');
            dot.className = 'mi-dot';
            li.appendChild(idx);
            li.appendChild(tt);
            li.appendChild(dot);
            listEl.appendChild(li);
        });
    }

    function load(i, autoPlay) {
        if (!MUSIC_TRACKS.length) return;
        current = (i + MUSIC_TRACKS.length) % MUSIC_TRACKS.length;
        var t = MUSIC_TRACKS[current];
        titleEl.textContent = T(t.title || '未命名');
        artistEl.textContent = T(t.artist || '');
        setCover(t.cover ? asset(t.cover) : '');
        audioError = false;
        audio.src = asset(t.src);
        renderList();
        if (autoPlay) play();
    }

    function play() {
        if (!MUSIC_TRACKS.length) return;
        var p = audio.play();
        if (p && p.catch) p.catch(function () { setPlayingUI(false); });
    }

    audio.addEventListener('playing', function () { setPlayingUI(true); });
    audio.addEventListener('pause', function () { setPlayingUI(false); });
    audio.addEventListener('ended', function () { load(current + 1, true); });
    audio.addEventListener('error', function () {
        audioError = true;
        setPlayingUI(false);
        if (MUSIC_TRACKS.length) artistEl.textContent = T('待添加音频文件');
    });

    function refreshMusicText() {
        if (MUSIC_TRACKS.length) {
            var t = MUSIC_TRACKS[current];
            titleEl.textContent = T(t.title || '未命名');
            artistEl.textContent = audioError ? T('待添加音频文件') : T(t.artist || '');
        }
        renderList();
    }
    window.addEventListener('langchange', refreshMusicText);

    playBtn.addEventListener('click', function () {
        if (audio.paused) {
            play();
        } else {
            audio.pause();
            rememberPaused();
        }
    });
    prevBtn.addEventListener('click', function () { load(current - 1, true); });
    nextBtn.addEventListener('click', function () { load(current + 1, true); });

    listEl.addEventListener('click', function (e) {
        var li = e.target.closest('[data-mi]');
        if (!li) return;
        load(parseInt(li.getAttribute('data-mi'), 10), true);
    });

    disc.addEventListener('click', function (e) {
        e.stopPropagation();
        panel.classList.toggle('open');
    });
    closeBtn.addEventListener('click', function () {
        panel.classList.remove('open');
    });
    document.addEventListener('click', function (e) {
        if (panel.classList.contains('open') && !player.contains(e.target)) {
            panel.classList.remove('open');
        }
    });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') panel.classList.remove('open');
    });

    renderList();
    if (MUSIC_TRACKS.length) {
        load(0, false);
        // 上次暂停过就不再自动播放；否则尝试自动播放（浏览器可能拦截，拦截后保持暂停）
        if (!pausedBefore()) play();
    }
})();
