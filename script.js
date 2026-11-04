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
        if (t && t.tagName === 'IMG' && t.getAttribute && t.getAttribute('data-fb')) {
            var fb = t.getAttribute('data-fb');
            t.removeAttribute('data-fb');
            t.src = fb;
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
    var accountInfo = document.getElementById('accountInfo');
    var logoutBtn = document.getElementById('logoutBtn');
    var forgotLink = document.getElementById('forgotLink');
    var backToLogin = document.getElementById('backToLogin');
    var regCodeRow = document.getElementById('regCodeRow');
    var regCodeBtn = document.getElementById('regCodeBtn');
    var resetCodeBtn = document.getElementById('resetCodeBtn');
    var changePwdBtn = document.getElementById('changePwdBtn');
    var changePwdForm = document.getElementById('changePwdForm');
    var pwdError = document.getElementById('pwdError');

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

    changePwdBtn.addEventListener('click', function() {
        var showing = changePwdForm.style.display !== 'none';
        changePwdForm.style.display = showing ? 'none' : 'flex';
        pwdError.textContent = '';
    });

    changePwdForm.addEventListener('submit', function(e) {
        e.preventDefault();
        pwdError.textContent = '';
        apiPost('/api/change_password', {
            token: getToken(),
            old_password: document.getElementById('oldPwd').value,
            new_password: document.getElementById('newPwd').value
        }).then(function(res) {
            if (res.ok) {
                changePwdForm.style.display = 'none';
                changePwdForm.reset();
            } else {
                pwdError.textContent = res.error || '修改失败';
            }
        }).catch(function() {
            pwdError.textContent = '无法连接服务器';
        });
    });

    logoutBtn.addEventListener('click', function() {
        apiPost('/api/logout', { token: getToken() });
        localStorage.removeItem('chat_token');
        localStorage.removeItem('chat_username');
        localStorage.removeItem('chat_admin');
        setAuthVisible(true);
    });

    function enterChat(username) {
        accountInfo.textContent = T('当前账号：') + username + (isAdmin() ? T('（管理员）') : '');
        setAuthVisible(false);
        lastId = 0;
        chatMessages.innerHTML = '';
        loadMessages();
        loadProfile();
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
    var avatarInput = document.getElementById('avatarInput');
    var avatarMsg = document.getElementById('avatarMsg');
    var accountStats = document.getElementById('accountStats');
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
                loadProfile();
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

    function setMyAvatar(url) {
        var el = document.getElementById('myAvatar');
        if (!el) return;
        var name = localStorage.getItem('chat_username') || '?';
        if (url) {
            el.outerHTML = '<img class="avatar avatar-lg" id="myAvatar" src="' + url + '?t=' + Date.now() + '" alt="">';
        } else {
            el.textContent = name.charAt(0).toUpperCase();
        }
    }

    function loadProfile() {
        fetch('/api/me', { headers: authHeaders() }).then(function(res) { return res.json(); }).then(function(res) {
            if (!res.ok) return;
            setMyAvatar(res.avatar);
            accountStats.textContent = T('关注 ') + res.following + T(' · 粉丝 ') + res.followers + T(' · 发帖 ') + res.posts;
        }).catch(function() {});
    }

    avatarInput.addEventListener('change', function() {
        var file = avatarInput.files[0];
        avatarInput.value = '';
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            avatarMsg.textContent = '图片太大（最大5MB）';
            return;
        }
        var reader = new FileReader();
        reader.onload = function() {
            apiPost('/api/avatar', { token: getToken(), image: reader.result }).then(function(res) {
                if (res.ok) {
                    setMyAvatar(res.avatar);
                    avatarMsg.style.color = '#7be3a8';
                    avatarMsg.textContent = '头像已更新';
                    setTimeout(function() { avatarMsg.textContent = ''; avatarMsg.style.color = ''; }, 3000);
                } else {
                    avatarMsg.textContent = res.error || '上传失败';
                }
            }).catch(function() {
                avatarMsg.textContent = '无法连接服务器';
            });
        };
        reader.readAsDataURL(file);
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
        if (getToken()) {
            loadPosts();
            var name = localStorage.getItem('chat_username') || '';
            if (name) accountInfo.textContent = T('当前账号：') + name + (isAdmin() ? T('（管理员）') : '');
        }
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

    function cardHtml(s, withTools) {
        var im = imgSrc(s);
        var h = '<div class="software-card" data-id="' + esc(s.id) + '" data-name="' + esc(s.name) + '">';
        h += '<div class="software-img"' + (im ? ' data-img-src="' + esc(im.src) + '"' : '') + '>';
        if (im) {
            h += '<img src="' + esc(im.src) + '" alt="' + esc(s.name) + '"'
               + (im.fb ? ' data-fb="' + esc(im.fb) + '"' : '') + '>';
        }
        h += '</div><div class="software-info">';
        h += '<div class="software-name">' + esc(s.name) + '</div>';
        h += '<div class="software-desc">' + esc(s.desc) + '</div>';
        h += '<div class="version-meta">版本 ' + esc(s.version || '-')
           + ' | 日期 ' + esc(s.date || '-')
           + ' | 大小 ' + esc(s.size || '-')
           + ' | 作者 ' + esc(s.author || '-');
        if (s.uploader) h += ' | 上传 ' + esc(s.uploader);
        h += '<span class="dl-count" data-soft="' + esc(s.name) + '">' + T(' · 下载 ')
           + (downloads[s.name] || 0) + T(' 次') + '</span></div>';
        if (mirrors(s).length) {
            h += '<button type="button" class="download-btn" data-id="' + esc(s.id) + '">' + T('下载') + '</button>';
        }
        if (withTools && canManage(s)) {
            h += '<div class="dl-tools">'
               + '<button type="button" class="f-btn dl-edit">' + T('编辑') + '</button>'
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

    function render() {
        var filtered = sorted(list.filter(matches));
        grid.innerHTML = filtered.map(function(s) { return cardHtml(s, true); }).join('');
        if (homeFeatured) {
            var featured = list.slice().sort(function(a, b) {
                return String(b.date || '').localeCompare(String(a.date || ''));
            }).slice(0, 4);
            homeFeatured.innerHTML = featured.map(function(s) { return cardHtml(s, false); }).join('');
        }
        if (emptyBox) emptyBox.style.display = filtered.length ? 'none' : '';
        if (emptyReset) emptyReset.style.display = query ? '' : 'none';
        if (totalLabel) {
            totalLabel.textContent = query
                ? '找到 ' + filtered.length + ' 个（共 ' + list.length + ' 个资源）'
                : '共 ' + list.length + ' 个资源';
        }
        if (statResources) statResources.textContent = String(list.length);
        if (searchClear) searchClear.style.display = query ? '' : 'none';
        syncAuthUI();
        if (window.__bindCardFx) { window.__bindCardFx(grid); if (homeFeatured) window.__bindCardFx(homeFeatured); }
        if (window.__applyLangText) { window.__applyLangText(grid); if (homeFeatured) window.__applyLangText(homeFeatured); }
    }

    function applyQuery(q) {
        query = String(q == null ? '' : q).trim();
        if (searchInput) searchInput.value = query;
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
        choiceName.textContent = s.name + (s.version ? ' · ' + s.version : '');
        choiceList.innerHTML = ms.map(function(m) {
            return '<button type="button" class="f-btn dl-choice-btn' + (m.kind === 'direct' ? ' primary' : '')
                 + '" data-url="' + esc(m.url) + '">' + esc(m.label)
                 + '<em>' + esc(m.sub) + '</em></button>';
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
        var swFileEl = document.getElementById('swFile');
        if (swFileEl) swFileEl.value = '';
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
        if (fileField) fileField.style.display = isAdmin() ? 'none' : '';
        modal.style.display = 'flex';
    }

    function closeModal() { modal.style.display = 'none'; }

    if (uploadBtn) uploadBtn.addEventListener('click', function() {
        if (!uploadAllowed()) { toast(T('上传功能已关闭，请联系管理员开启')); return; }
        if (!getToken()) { goLogin(); return; }
        openModal(null);
    });

    if (uploadToggle) uploadToggle.addEventListener('change', function() {
        var want = !!uploadToggle.checked;
        apiPost('/api/admin/settings', { upload_open: want }).then(function(res) {
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
            image: image
        };
        if (isAdmin()) {
            payload.url = document.getElementById('swUrl').value;
            payload.pan = document.getElementById('swPan').value;
            payload.quark = document.getElementById('swQuark').value;
            payload.pan123 = document.getElementById('swPan123').value;
            payload.baidu = document.getElementById('swBaidu').value;
            submitResource(payload);
            return;
        }
        var file = document.getElementById('swFile').files[0] || null;
        if (!file && !editingId) { saveBtn.disabled = false; swError.textContent = '请选择要上传的文件'; return; }
        if (!file) { submitResource(payload); return; }
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
    });

    function submitResource(payload) {
        apiPost('/api/software_save', payload).then(function(res) {
            saveBtn.disabled = false;
            saveBtn.textContent = T(editingId ? '保存修改' : '上传资源');
            if (res.ok) {
                var wasEdit = !!editingId;
                closeModal();
                toast(wasEdit ? '资源已更新' : '上传成功，感谢分享！');
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
        var up = e.target.closest('.dl-up');
        var down = e.target.closest('.dl-down');
        if ((up || down) && isAdmin()) {
            apiPost('/api/software_move', { token: getToken(), id: id, dir: up ? 'up' : 'down' }).then(function(res) {
                if (res.ok) load();
            }).catch(function() {});
        }
    }
    grid.addEventListener('click', handleAreaClick);
    if (homeFeatured) homeFeatured.addEventListener('click', handleAreaClick);

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
        heroInput.placeholder = mobileQuery.matches
            ? '搜索资源名称或作者…'
            : '搜索资源：模组加载器、小助手、工具…';
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
    document.querySelectorAll('.hero-tag').forEach(function(tag) {
        tag.addEventListener('click', function() {
            applyQuery(tag.getAttribute('data-q') || '');
            goLibrary();
        });
    });
    if (viewAllBtn) {
        viewAllBtn.addEventListener('click', function() { applyQuery(''); goLibrary(); });
    }

    document.querySelectorAll('.nav-item').forEach(function(btn) {
        btn.addEventListener('click', function() {
            if (btn.getAttribute('data-page') === 'download') load();
        });
    });

    window.addEventListener('langchange', function() { render(); syncAuthUI(); });

    // ---- 加载数据 ----
    function load() {
        function applyList(arr) { list = arr || []; render(); }
        fetch('/api/software').then(function(res) { return res.json(); }).then(function(res) {
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

    var tabSite = document.getElementById('dlTabSite');
    var tabMods = document.getElementById('dlTabMods');
    var tabLoader = document.getElementById('dlTabLoader');
    var viewSite = document.getElementById('siteResView');
    var viewMods = document.getElementById('tldModsView');
    var viewLoader = document.getElementById('tldLoaderView');
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
                esc(c) + ' <span>' + n + '</span></button>';
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
        a.href = '/api/tldfile?u=' + encodeURIComponent(m.Link);
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
        var toMods = which === 'mods';
        var toLoader = which === 'loader';
        tabSite.classList.toggle('active', !toMods && !toLoader);
        tabMods.classList.toggle('active', toMods);
        tabLoader.classList.toggle('active', toLoader);
        tabSite.setAttribute('aria-selected', String(!toMods && !toLoader));
        tabMods.setAttribute('aria-selected', String(toMods));
        tabLoader.setAttribute('aria-selected', String(toLoader));
        viewSite.style.display = (!toMods && !toLoader) ? '' : 'none';
        siteTip.style.display = (!toMods && !toLoader) ? '' : 'none';
        viewMods.style.display = toMods ? '' : 'none';
        viewLoader.style.display = toLoader ? '' : 'none';
        if (toMods && !loaded) loadMods();
        if (toLoader && window.__loaderInit) window.__loaderInit();
    }
    tabSite.addEventListener('click', function() { switchTab('site'); });
    tabMods.addEventListener('click', function() { switchTab('mods'); });
    if (tabLoader) tabLoader.addEventListener('click', function() { switchTab('loader'); });

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
                        srcSelect.innerHTML = res.sources.map(function(s) {
                            return '<option value="' + escAttr(s.id) + '">' + esc(s.label) + '</option>';
                        }).join('');
                        srcSelect.value = res.source || modSource;
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
        if (loaded) { renderChips(); renderGrid(); }
    });
})();

// ==================== 模组加载器（TLDLoader 安装 / 卸载） ====================
(function() {
    var fsOk = !!(window.showDirectoryPicker && window.isSecureContext);
    var gameDir = null;
    var docsDir = null;
    var info = null;
    var variant = 'new';

    var el = {
        pickGame: document.getElementById('loaderPickGame'),
        pickGameModify: document.getElementById('loaderPickGameModify'),
        refreshState: document.getElementById('loaderRefreshState'),
        scanSteam: document.getElementById('loaderScanSteam'),
        pickDocs: document.getElementById('loaderPickDocs'),
        installNew: document.getElementById('loaderInstallNew'),
        installOld: document.getElementById('loaderInstallOld'),
        update: document.getElementById('loaderUpdate'),
        installBtn: document.getElementById('loaderInstallBtn'),
        uninstall: document.getElementById('loaderUninstall'),
        exportPack: document.getElementById('loaderExportPack'),
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
        el.state.textContent = text;
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
        el.docsPath.textContent = text;
    }
    function updateDocsText() {
        setDocsPath(docsDir ? '已记住：' + docsDir.name : '未选择（点右侧按钮，打开的窗口已定位到「文档」，直接确认即可）');
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
        el.installNew.classList.toggle('selected', v === 'new');
        el.installOld.classList.toggle('selected', v === 'old');
        el.note.textContent = v === 'old'
            ? '说明：当前选择「旧版」，点下方「安装模组加载器」开始安装；兼容老版本游戏。'
            : '说明：当前选择「新版」，点下方「安装模组加载器」开始安装；「在线更新」只重新拉取最新 TLDLoader.dll。';
    }

    function showAbout() {
        logLine('长途旅行模组加载器（网页版）　By: BENBAIJIE');
        logLine('功能：一键安装/卸载 TLDLoader、0Harmony 与资源包；支持旧版/新版/在线更新；可导出离线整合包。');
        logLine('安装位置：游戏目录\\TheLongDrive_Data\\Managed 与 文档\\TheLongDrive\\Mods\\Assets');
        logLine('官网：https://znine.fun');
    }

    function exportPack() {
        logLine('开始导出整合包（含 TLDLoader / Harmony / 资源包 / 原版备份）…');
        var a = document.createElement('a');
        a.href = '/api/loader/pack';
        a.download = 'TLD-Mod-Loader.zip';
        document.body.appendChild(a);
        a.click();
        a.remove();
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
    el.installNew.addEventListener('click', function() { setVariant('new'); });
    el.installOld.addEventListener('click', function() { setVariant('old'); });
    el.installBtn.addEventListener('click', function() { install(); });
    if (el.update) el.update.addEventListener('click', onlineUpdate);
    el.uninstall.addEventListener('click', uninstall);
    if (el.exportPack) el.exportPack.addEventListener('click', exportPack);
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
        '欢迎来到长途旅行下载站！': 'Welcome to the TLD download site!',
        '长途旅行小助手（他能为你的长途旅行添加模组！）': 'TLD Helper (adds mods to your game!)',
        '模组加载 | 助手工具 ': 'Mod Loader | Helper Tools ',
        '主播B站': 'Bilibili', '主播酷安': 'Coolapk', '主播抖音': 'Douyin',
        '软件下载': 'Downloads',
        '资源库': 'Library', '搜索资源': 'Search', '最近更新': 'Recently Updated',
        '浏览全部资源 →': 'Browse all →', '资源总数': 'Resources',
        '＋ 上传资源': '+ Upload', '＋ 上传资源（需登录）': '+ Upload (login required)',
        '上传资源': 'Upload Resource', '编辑资源': 'Edit Resource', '保存修改': 'Save Changes',
        '模组加载器': 'Mod Loaders', '小助手': 'Helpers', '游戏本体': 'Game Files', '工具': 'Tools',
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
        '获取验证码': 'Get Code', '账号管理': 'Account', '退出登录': 'Logout',
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
        '网盘链接或本地文件名': 'Download link or local file'
    };
    var TEXT_SEL = '.nav-item, .page-title, .social-btn, .software-name, .software-desc, .download-btn, .tip-warning, .home-sub, .group-btn, .auth-tab, .auth-submit, .code-btn, .chat-send, .auth-link, .field-hint, #newPostBtn, #cancelPostBtn, .compose-btns .f-btn, #changePwdBtn, #logoutBtn, .featured-title, .hero-tag, .dl-upload-btn, .dl-empty-title, #dlEmptyReset, #viewAllBtn, .dl-empty-sub';

    window.T = function(s) {
        if ((localStorage.getItem(STORE_KEY) || 'zh') !== 'en') return s;
        return DICT[s] || s;
    };

    function applyLang(lang) {
        localStorage.setItem(STORE_KEY, lang);
        document.documentElement.lang = lang === 'en' ? 'en' : 'zh-CN';
        var toEn = lang === 'en';
        document.querySelectorAll(TEXT_SEL).forEach(function(el) {
            if (!el.dataset.zh) el.dataset.zh = el.textContent;
            var zh = el.dataset.zh;
            el.textContent = toEn ? (DICT[zh] || zh) : zh;
        });
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
        window.dispatchEvent(new Event('langchange'));
    }

    // 供动态渲染的区域（如下载页卡片）做局部翻译
    window.__applyLangText = function(root) {
        if (!root) return;
        var toEn = (localStorage.getItem(STORE_KEY) || 'zh') === 'en';
        root.querySelectorAll(TEXT_SEL).forEach(function(el) {
            if (!el.dataset.zh) el.dataset.zh = el.textContent;
            var zh = el.dataset.zh;
            el.textContent = toEn ? (DICT[zh] || zh) : zh;
        });
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
