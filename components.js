// ===== Schlen 联邦共和国 - 共享组件 =====

const NAV_ITEMS = [
  { id: 'index', label: '首页', href: 'index.html' },
  { id: 'about', label: '关于Schlen', href: 'about.html' },
  { id: 'islands', label: '七座浮岛', href: 'islands.html' },
  { id: 'culture', label: '文化', href: 'culture.html' },
  { id: 'government', label: '政体', href: 'government.html' },
  { id: 'citizens', label: '公民专区', href: 'citizens.html' },
  { id: 'news', label: '动态', href: 'news.html' },
  { id: 'constitution', label: '宪法', href: 'constitution.html' },
  { id: 'laws', label: '法律', href: 'laws.html' },
  { id: 'down', label: '下载', href: 'down.html' },
  { id: 'support', label: '支持', href: 'support.html' },
  { id: 'x', label: 'X', href: 'x.html' },
  { id: 'wallet', label: 'BR-coin', href: 'wallet.html' },
  { id: 'shop', label: '🛒 官方商店', href: 'https://shop.schlen.top', external: true },
  { id: 'schlenix', label: '💻 Schlenix', href: 'https://ix.schlen.top', external: true },
];

function renderHeader(activePage) {
  const navLinks = NAV_ITEMS.map(item => {
    const active = item.id === activePage ? ' class="active"' : '';
    const target = item.external ? ' target="_blank"' : '';
    return `<li><a href="${item.href}"${active}${target}>${item.label}</a></li>`;
  }).join('');

  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const themeIcon = isDark ? '☀️' : '🌙';

  const html = `
    <header class="main-header">
      <nav class="navbar">
        <h1 class="logo"><a href="index.html">Schlen喵~</a></h1>
        <div class="nav-right">
          <ul class="nav-links">
            ${navLinks}
            <li><a href="#" id="join-nation-btn" class="btn-join">加入国籍</a></li>
          </ul>
          <button id="theme-toggle" class="theme-toggle" title="切换主题">${themeIcon}</button>
        </div>
      </nav>
    </header>
  `;

  document.getElementById('header-root').innerHTML = html;
}

function renderFooter() {
  const footerLinks = NAV_ITEMS
    .filter(item => !item.external)
    .map(item => `<a href="${item.href}">${item.label}</a>`)
    .join('');

  const html = `
    <footer class="main-footer">
      <div class="footer-content">
        <div class="footer-section">
          <h4>Schlen联邦共和国</h4>
          <p>拥护真实性，共建美好未来喵~</p>
        </div>
        <div class="footer-links">
          ${footerLinks}
          <a href="https://shop.schlen.top" target="_blank">🛒 官方商店</a>
          <a href="https://ix.schlen.top" target="_blank">💻 Schlenix</a>
        </div>
      </div>
      <p class="copyright">&copy; 2026 Schlen联邦共和国. 保留所有权利喵~</p>
      <p class="footer-disclaimer">⚠️ 本网站所述"Schlen联邦共和国"为虚构的互联网微国家，仅供娱乐与创意交流，非真实主权国家。但我们认真对待每一份创意与梦想喵~</p>
    </footer>
  `;

  document.getElementById('footer-root').innerHTML = html;
}

function renderJoinModal() {
  const html = `
    <div id="join-modal" class="modal">
      <div class="modal-content">
        <span class="close-btn">&times;</span>
        <h3>加入Schlen联邦共和国</h3>
        <p>您确定要申请加入Schlen联邦共和国吗？</p>
        <p class="modal-desc">作为世界最新颖的液态民主国家，我们期待您的加入！</p>
        <div class="modal-actions">
          <button id="confirm-join" class="btn btn-primary">确认申请</button>
          <button id="cancel-join" class="btn btn-secondary">取消</button>
        </div>
      </div>
    </div>
  `;

  document.getElementById('modal-root').innerHTML = html;
}

// 暗色模式切换
function initThemeToggle() {
  const stored = localStorage.getItem('schlen_theme');
  if (stored === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  }

  document.addEventListener('click', function(e) {
    const toggle = e.target.closest('#theme-toggle');
    if (!toggle) return;

    const html = document.documentElement;
    if (html.getAttribute('data-theme') === 'dark') {
      html.removeAttribute('data-theme');
      localStorage.setItem('schlen_theme', 'light');
    } else {
      html.setAttribute('data-theme', 'dark');
      localStorage.setItem('schlen_theme', 'dark');
    }
  });
}

// 加入国籍弹窗
function initJoinModal() {
  document.addEventListener('click', function(e) {
    // 打开弹窗
    const joinBtn = e.target.closest('#join-nation-btn, #join-nation-btn-cta');
    if (joinBtn) {
      e.preventDefault();
      const modal = document.getElementById('join-modal');
      if (modal) modal.classList.add('active');
      return;
    }

    // 关闭弹窗
    const closeBtn = e.target.closest('.close-btn');
    if (closeBtn) {
      const modal = document.getElementById('join-modal');
      if (modal) modal.classList.remove('active');
      return;
    }

    if (e.target.closest('#cancel-join')) {
      const modal = document.getElementById('join-modal');
      if (modal) modal.classList.remove('active');
      return;
    }

    if (e.target.closest('#confirm-join')) {
      const subject = encodeURIComponent('Schlen联邦共和国入籍申请');
      const body = encodeURIComponent(
`称呼/昵称:
联系方式(邮箱):
所在地时区:

申请理由:
[请简单说明您为何想要加入Schlen联邦共和国]

自我介绍:
[请简单介绍一下自己]

对Schlen的理解:
[请描述您对液态民主和BR-coin的了解]

期待与愿景:
[您希望为Schlen贡献什么?]`);
      window.location.href = `mailto:join@schlen.top?subject=${subject}&body=${body}`;
      const modal = document.getElementById('join-modal');
      if (modal) modal.classList.remove('active');
      return;
    }

    // 点击外部关闭
    const modal = document.getElementById('join-modal');
    if (modal && e.target === modal && modal.classList.contains('active')) {
      modal.classList.remove('active');
    }
  });
}

// 页面初始化
function initPage(activePage) {
  renderHeader(activePage);
  renderFooter();
  renderJoinModal();
  initThemeToggle();
  initJoinModal();
}
