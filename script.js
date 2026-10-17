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

    var svgLayer = document.createElement('div');
    svgLayer.innerHTML = '<svg width="0" height="0" style="position:absolute"><defs><filter id="liquidDrop" x="-30%" y="-30%" width="160%" height="160%"><feTurbulence type="fractalNoise" baseFrequency="0.011 0.017" numOctaves="2" seed="7" result="noise"/><feGaussianBlur in="noise" stdDeviation="1.6" result="softNoise"/><feDisplacementMap in="SourceGraphic" in2="softNoise" scale="90" xChannelSelector="R" yChannelSelector="G"/></filter></defs></svg>';
    document.body.appendChild(svgLayer);

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

    var sliderInitialized = false;
    function updateSliderPosition(activeBtn) {
        if (!slider || !activeBtn) return;
        slider.style.left = (activeBtn.offsetLeft - 5) + 'px';
        slider.style.width = (activeBtn.offsetWidth + 10) + 'px';
        if (sliderInitialized) {
            slider.classList.remove('morphing');
            slider.offsetHeight;
            slider.classList.add('morphing');
        }
        sliderInitialized = true;
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
        setTimeout(function() {
            subElem.innerText = T('长途旅行小助手（他能为你的长途旅行添加模组！）');
            subElem.classList.add('fade-in');
            setTimeout(function() { subElem.classList.remove('fade-in'); }, 700);
        }, 600);
        setTimeout(function() {
            subElem.innerText = T(originalSub);
            subElem.classList.add('fade-in');
            setTimeout(function() { subElem.classList.remove('fade-in'); }, 700);
        }, 6200);
        setTimeout(function() {
            subElem.innerText = T('模组加载 | 助手工具 ');
            subElem.classList.add('fade-in');
            setTimeout(function() { subElem.classList.remove('fade-in'); }, 700);
        }, 9800);
    }

    // 软件卡片图片：点开大图（事件委托，兼容动态渲染的卡片）
    document.addEventListener('click', function(e) {
        var container = e.target.closest('.software-img');
        if (!container) return;
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
        if (url) return '<img class="avatar" src="' + url + '" alt="">';
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
    // 下载页软件管理：动态渲染 + 管理员发布/编辑/删除/排序
    var grid = document.getElementById('downloadGrid');
    if (!grid) return;
    var adminBar = document.getElementById('dlAdminBar');
    var addBtn = document.getElementById('dlAddBtn');
    var modal = document.getElementById('dlModal');
    var modalTitle = document.getElementById('dlModalTitle');
    var swError = document.getElementById('swError');
    var imgInput = document.getElementById('swImage');
    var imgPreview = document.getElementById('swImgPreview');
    var imgThumb = document.getElementById('swImgThumb');
    var imgClear = document.getElementById('swImgClear');
    var list = [];
    var editingId = null;
    var pendingImage = null; // 'KEEP' 保持原图 | 'CLEAR' 移除 | 'DATA:...' 新图 base64 | null 无操作

    function isAdmin() { return localStorage.getItem('chat_admin') === '1'; }
    function getToken() { return localStorage.getItem('chat_token') || ''; }
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

    function render() {
        var admin = isAdmin();
        grid.innerHTML = list.map(function(s) {
            var h = '<div class="software-card" data-id="' + esc(s.id) + '" data-name="' + esc(s.name) + '">';
            h += '<div class="software-img"' + (s.image ? ' data-img-src="' + esc(s.image) + '"' : '') + '>';
            if (s.image) h += '<img src="' + esc(s.image) + '" alt="' + esc(s.name) + '">';
            h += '</div><div class="software-info">';
            h += '<div class="software-name">' + esc(s.name) + '</div>';
            h += '<div class="software-desc">' + esc(s.desc) + '</div>';
            h += '<div class="version-meta">版本 ' + esc(s.version) + ' | 日期 ' + esc(s.date) + ' | 大小 ' + esc(s.size) + ' | 作者 ' + esc(s.author);
            h += '<span class="dl-count" data-soft="' + esc(s.name) + '">' + T(' · 下载 ') + '0' + T(' 次') + '</span></div>';
            if (s.url) h += '<a href="' + esc(s.url) + '" class="download-btn" target="_blank" rel="noopener">下载</a>';
            if (admin) {
                h += '<div class="dl-tools">'
                  + '<button type="button" class="f-btn dl-edit">编辑</button>'
                  + '<button type="button" class="f-btn dl-del">删除</button>'
                  + '<button type="button" class="f-btn dl-up" title="上移">↑</button>'
                  + '<button type="button" class="f-btn dl-down" title="下移">↓</button>'
                  + '</div>';
            }
            h += '</div></div>';
            return h;
        }).join('');
        if (adminBar) adminBar.style.display = admin ? 'flex' : 'none';
        if (window.__bindCardFx) window.__bindCardFx(grid);
        if (window.__applyLangText) window.__applyLangText(grid);
    }

    function load() {
        function applyList(arr) { list = arr || []; render(); }
        fetch('/api/software').then(function(res) { return res.json(); }).then(function(res) {
            if (res && res.ok) { applyList(res.software); return; }
            throw new Error('no api');
        }).catch(function() {
            fetch('data/software.json').then(function(res) { return res.json(); }).then(function(arr) {
                applyList(arr);
            }).catch(function() {});
        });
    }

    // ---- 弹窗 ----
    function resetModal() {
        editingId = null;
        pendingImage = null;
        swError.textContent = '';
        imgInput.value = '';
        imgPreview.style.display = 'none';
        imgThumb.removeAttribute('src');
        modalTitle.textContent = T('发布软件');
        document.getElementById('swSaveBtn').textContent = T('发布');
        ['swName', 'swDesc', 'swVersion', 'swDate', 'swSize', 'swAuthor', 'swUrl'].forEach(function(id) {
            document.getElementById(id).value = '';
        });
    }

    function openModal(item) {
        resetModal();
        if (item) {
            editingId = item.id;
            document.getElementById('swName').value = item.name || '';
            document.getElementById('swDesc').value = item.desc || '';
            document.getElementById('swVersion').value = item.version || '';
            document.getElementById('swDate').value = item.date || '';
            document.getElementById('swSize').value = item.size || '';
            document.getElementById('swAuthor').value = item.author || '';
            document.getElementById('swUrl').value = item.url || '';
            modalTitle.textContent = T('编辑软件');
            document.getElementById('swSaveBtn').textContent = T('保存');
            if (item.image) {
                pendingImage = 'KEEP';
                imgThumb.src = item.image;
                imgPreview.style.display = 'flex';
            }
        }
        modal.style.display = 'flex';
    }

    function closeModal() { modal.style.display = 'none'; }

    addBtn.addEventListener('click', function() { openModal(null); });
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
        if (file.size > 5 * 1024 * 1024) {
            swError.textContent = '图片太大（最大5MB）';
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

    document.getElementById('swSaveBtn').addEventListener('click', function() {
        var name = document.getElementById('swName').value.trim();
        if (!name) { swError.textContent = '软件名不能为空'; return; }
        var image;
        if (pendingImage === 'KEEP') image = 'keep';
        else if (pendingImage === 'CLEAR') image = '';
        else if (pendingImage && pendingImage.indexOf('DATA:') === 0) image = pendingImage.slice(5);
        else image = editingId ? 'keep' : '';
        var btn = document.getElementById('swSaveBtn');
        btn.disabled = true;
        apiPost('/api/software_save', {
            token: getToken(),
            id: editingId || '',
            name: name,
            desc: document.getElementById('swDesc').value,
            version: document.getElementById('swVersion').value,
            date: document.getElementById('swDate').value,
            size: document.getElementById('swSize').value,
            author: document.getElementById('swAuthor').value,
            url: document.getElementById('swUrl').value,
            image: image
        }).then(function(res) {
            btn.disabled = false;
            if (res.ok) { closeModal(); load(); }
            else swError.textContent = res.error || '保存失败';
        }).catch(function() { btn.disabled = false; swError.textContent = '无法连接服务器'; });
    });

    grid.addEventListener('click', function(e) {
        var card = e.target.closest('.software-card');
        if (!card) return;
        var id = card.getAttribute('data-id');
        if (e.target.closest('.dl-edit')) {
            var item = list.find(function(s) { return s.id === id; });
            if (item) openModal(item);
            return;
        }
        if (e.target.closest('.dl-del')) {
            if (!confirm('确定删除「' + (card.getAttribute('data-name') || '') + '」吗？删除后无法恢复。')) return;
            apiPost('/api/software_delete', { token: getToken(), id: id }).then(function(res) {
                if (res.ok) load();
            }).catch(function() {});
            return;
        }
        var up = e.target.closest('.dl-up');
        var down = e.target.closest('.dl-down');
        if (up || down) {
            apiPost('/api/software_move', { token: getToken(), id: id, dir: up ? 'up' : 'down' }).then(function(res) {
                if (res.ok) load();
            }).catch(function() {});
        }
    });

    document.querySelectorAll('.nav-item').forEach(function(btn) {
        btn.addEventListener('click', function() {
            if (btn.getAttribute('data-page') === 'download') load();
        });
    });

    load();
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
    var TEXT_SEL = '.nav-item, .page-title, .social-btn, .software-name, .software-desc, .download-btn, .tip-warning, .home-sub, .group-btn, .auth-tab, .auth-submit, .code-btn, .chat-send, .auth-link, .field-hint, #newPostBtn, #cancelPostBtn, .compose-btns .f-btn, #changePwdBtn, #logoutBtn';

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
