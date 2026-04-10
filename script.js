// 平滑滚动（仅在首页生效）
if (document.querySelector('.hero-section')) {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId !== '#' && targetId.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(targetId);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });
}

// 加入国籍功能
document.addEventListener('DOMContentLoaded', function() {
    const joinBtn = document.getElementById('join-nation-btn');
    const modal = document.getElementById('join-modal');
    const closeBtn = document.querySelector('.close-btn');
    const confirmBtn = document.getElementById('confirm-join');
    const cancelBtn = document.getElementById('cancel-join');

    if (joinBtn) {
        joinBtn.addEventListener('click', function(e) {
            e.preventDefault();
            modal.classList.add('active');
        });
    }

    // 页面内的加入按钮（公民页面、政府页面等）
    document.querySelectorAll('#join-nation-btn-cta').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            modal.classList.add('active');
        });
    });

    function closeModal() {
        modal.classList.remove('active');
    }

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) closeModal();
        });
    }

    if (confirmBtn) {
        confirmBtn.addEventListener('click', function() {
            window.location.href = 'mailto:joinschlen@shundebo.top?subject=Schlen联邦共和国入籍申请';
            closeModal();
    });
    }
});

// BR-coin 钱包功能
const API_BASE = 'https://coin.schlen.top';
let apiKey = localStorage.getItem('brcoin_api_key');
let currentUser = localStorage.getItem('brcoin_user');

document.addEventListener('DOMContentLoaded', function() {
    // 标签切换
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(btn.dataset.tab + '-tab').classList.add('active');
        });
    });

    // 检查登录状态
    if (apiKey && currentUser) {
        showWalletPanel();
        updateBalance();
    }

    // 辅助函数：处理 API 响应
    async function handleResponse(response) {
        const text = await response.text();
        try {
            return { data: JSON.parse(text), ok: response.ok, status: response.status };
        } catch (e) {
            return { data: { message: text }, ok: response.ok, status: response.status };
        }
    }

    // 注册表单
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('register-username').value;
            const password = document.getElementById('register-password').value;

            if (password.length < 6) {
                showMessage('密码至少需要6位', 'error');
                return;
            }

            try {
                showMessage('正在注册...', 'info');
                const response = await fetch(`${API_BASE}/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });

                const result = await handleResponse(response);
                
                if (result.ok) {
                    showMessage('注册成功！请登录', 'success');
                    document.getElementById('register-username').value = '';
                    document.getElementById('register-password').value = '';
                    setTimeout(() => {
                        document.querySelector('[data-tab="login"]').click();
                    }, 1000);
                } else {
                    showMessage(result.data.message || `注册失败 (HTTP ${result.status})`, 'error');
                }
            } catch (error) {
                console.error('注册错误:', error);
                showMessage('网络错误: ' + error.message, 'error');
            }
        });
    }

    // 登录表单
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('login-username').value;
            const password = document.getElementById('login-password').value;

            try {
                showMessage('正在登录...', 'info');
                const response = await fetch(`${API_BASE}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });

                const result = await handleResponse(response);
                
                if (result.ok && result.data.token) {
                    apiKey = result.data.token;
                    currentUser = username;
                    localStorage.setItem('brcoin_api_key', apiKey);
                    localStorage.setItem('brcoin_user', currentUser);
                    showWalletPanel();
                    updateBalance();
                    showMessage('登录成功！', 'success');
                } else {
                    showMessage(result.data.message || `登录失败 (HTTP ${result.status})`, 'error');
                }
            } catch (error) {
                console.error('登录错误:', error);
                showMessage('网络错误: ' + error.message, 'error');
            }
        });
    }

    // 转账
    const transferForm = document.getElementById('transfer-form');
    if (transferForm) {
        transferForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const to = document.getElementById('transfer-to').value;
            const amount = parseFloat(document.getElementById('transfer-amount').value);

            if (!apiKey) {
                showMessage('请先登录', 'error');
                return;
            }

            try {
                showMessage('正在转账...', 'info');
                const response = await fetch(`${API_BASE}/transfer`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-API-Key': apiKey
                    },
                    body: JSON.stringify({ from: currentUser, to, amount })
                });

                const result = await handleResponse(response);
                
                if (result.ok) {
                    showMessage('转账成功！', 'success');
                    updateBalance();
                    transferForm.reset();
                } else {
                    showMessage(result.data.message || `转账失败 (HTTP ${result.status})`, 'error');
                }
            } catch (error) {
                console.error('转账错误:', error);
                showMessage('网络错误: ' + error.message, 'error');
            }
        });
    }

    // 查询余额
    const queryBtn = document.getElementById('query-btn');
    if (queryBtn) {
        queryBtn.addEventListener('click', async () => {
            const username = document.getElementById('query-username').value;
            if (!username) {
                showMessage('请输入用户名', 'error');
                return;
            }

            try {
                document.getElementById('query-result').textContent = '查询中...';
                const response = await fetch(`${API_BASE}/balance?user=${encodeURIComponent(username)}`);
                const result = await handleResponse(response);
                
                if (result.ok) {
                    document.getElementById('query-result').textContent = 
                        `${username} 的余额: ${result.data.balance} BR`;
                } else {
                    document.getElementById('query-result').textContent = '查询失败';
                    showMessage(result.data.message || '查询失败', 'error');
                }
            } catch (error) {
                console.error('查询错误:', error);
                document.getElementById('query-result').textContent = '查询失败';
                showMessage('网络错误: ' + error.message, 'error');
            }
        });
    }

    // 退出登录
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            apiKey = null;
            currentUser = null;
            localStorage.removeItem('brcoin_api_key');
            localStorage.removeItem('brcoin_user');
            hideWalletPanel();
            showMessage('已退出登录', 'info');
        });
    }
});

function showWalletPanel() {
    const walletStatus = document.getElementById('wallet-status');
    const walletTabs = document.querySelector('.wallet-tabs');
    const walletPanel = document.getElementById('wallet-panel');
    const walletUsername = document.getElementById('wallet-username');
    
    if (walletStatus) walletStatus.style.display = 'none';
    if (walletTabs) walletTabs.style.display = 'none';
    
    const loginTab = document.getElementById('login-tab');
    const registerTab = document.getElementById('register-tab');
    if (loginTab) loginTab.classList.remove('active');
    if (registerTab) registerTab.classList.remove('active');
    
    if (walletPanel) walletPanel.style.display = 'block';
    if (walletUsername) walletUsername.textContent = `当前用户: ${currentUser}`;
}

function hideWalletPanel() {
    const walletStatus = document.getElementById('wallet-status');
    const walletTabs = document.querySelector('.wallet-tabs');
    const walletPanel = document.getElementById('wallet-panel');
    const loginTab = document.getElementById('login-tab');
    
    if (walletStatus) walletStatus.style.display = 'block';
    if (walletTabs) walletTabs.style.display = 'flex';
    if (walletPanel) walletPanel.style.display = 'none';
    if (loginTab) loginTab.classList.add('active');
}

async function updateBalance() {
    if (!currentUser) return;
    
    try {
        const response = await fetch(`${API_BASE}/balance?user=${encodeURIComponent(currentUser)}`);
        const result = await response.json();
        
        if (response.ok) {
            const balanceEl = document.getElementById('balance-amount');
            if (balanceEl) balanceEl.textContent = `${result.balance} BR`;
        }
    } catch (error) {
        console.error('获取余额失败:', error);
    }
}

function showMessage(message, type) {
    const msgEl = document.getElementById('wallet-message');
    if (!msgEl) return;
    
    msgEl.textContent = message;
    msgEl.className = `wallet-message ${type}`;
    msgEl.style.display = 'block';
    
    setTimeout(() => {
        msgEl.className = 'wallet-message';
        msgEl.textContent = '';
        msgEl.style.display = 'none';
    }, 3000);
}