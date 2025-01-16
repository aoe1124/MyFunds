// 导航组件
const Navigation = {
    init() {
        const nav = document.createElement('nav');
        nav.className = 'main-nav';
        
        nav.innerHTML = `
            <div class="nav-container">
                <div class="nav-brand">MyFunds</div>
                <div class="nav-links">
                    <a href="index.html" class="nav-link">资产总览</a>
                    <a href="management.html" class="nav-link">数据管理</a>
                    <a href="history.html" class="nav-link">账户历史</a>
                </div>
            </div>
        `;

        // 根据当前页面设置活动链接
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const links = nav.querySelectorAll('.nav-link');
        links.forEach(link => {
            if (link.getAttribute('href') === currentPage) {
                link.classList.add('active');
            }
        });

        // 插入到页面顶部
        document.body.insertBefore(nav, document.body.firstChild);
    }
}; 