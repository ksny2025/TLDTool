(function() {
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

    function switchPage(pageId, clickedBtn) {
        for (var key in pages) {
            if (pages[key]) pages[key].classList.remove('active-page');
        }
        var targetPage = pages[pageId];
        if (targetPage) {
            targetPage.style.animation = 'none';
            targetPage.offsetHeight;
            targetPage.classList.add('active-page');
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
})();