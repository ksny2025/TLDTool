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
        about: document.getElementById('about-page')
    };

    function updateSliderPosition(activeBtn) {
        if (!slider || !activeBtn) return;
        slider.style.top = activeBtn.offsetTop + 'px';
        slider.style.height = activeBtn.offsetHeight + 'px';
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
            subElem.innerText = '长途旅行小助手（他能为你的长途旅行添加模组！）';
            subElem.classList.add('fade-in');
            setTimeout(function() { subElem.classList.remove('fade-in'); }, 700);
        }, 600);
        setTimeout(function() {
            subElem.innerText = originalSub;
            subElem.classList.add('fade-in');
            setTimeout(function() { subElem.classList.remove('fade-in'); }, 700);
        }, 6200);
        setTimeout(function() {
            subElem.innerText = '模组加载 | 助手工具 ';
            subElem.classList.add('fade-in');
            setTimeout(function() { subElem.classList.remove('fade-in'); }, 700);
        }, 9800);
    }

    var imgContainers = document.querySelectorAll('.software-img');
    imgContainers.forEach(function(container) {
        container.addEventListener('click', function(e) {
            e.stopPropagation();
            var imgElement = container.querySelector('img');
            if (imgElement && imgElement.src) {
                window.open(imgElement.src, '_blank');
            } else {
                var fallbackSrc = container.getAttribute('data-img-src');
                if (fallbackSrc) window.open(fallbackSrc, '_blank');
            }
        });
    });

    var announcementItems = document.querySelectorAll('.announcement-item');
    announcementItems.forEach(function(item, idx) {
        item.classList.add('reveal');
        item.style.transitionDelay = idx * 70 + 'ms';
    });

    var cards = document.querySelectorAll('.software-card');

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

        var cardObserver = new IntersectionObserver(function(entries) {
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
        document.querySelectorAll('.software-card').forEach(function(card) {
            cardObserver.observe(card);
        });
    } else {
        document.querySelectorAll('.reveal').forEach(function(el) {
            el.classList.add('in-view');
        });
        document.querySelectorAll('.software-card').forEach(function(card) {
            card.classList.add('rising');
        });
    }

    if (!isTouch) {
        cards.forEach(function(card) {
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
        });
    }

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
