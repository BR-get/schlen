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
                const response = await fetch(`${API_BASE}/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });

                const data = await response.json();
                if (response.ok) {
                    showMessage('注册成功！请登录', 'success');
                    document.querySelector('[data-tab="login"]').click();
                } else {
                    showMessage(data.message || '注册失败', 'error');
                }
            } catch (error) {
                showMessage('网络错误，请稍后重试', 'error');
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
                const response = await fetch(`${API_BASE}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });

                const data = await response.json();
                if (response.ok && data.token) {
                    apiKey = data.token;
                    currentUser = username;
                    localStorage.setItem('brcoin_api_key', apiKey);
                    localStorage.setItem('brcoin_user', currentUser);
                    showWalletPanel();
                    updateBalance();
                    showMessage('登录成功！', 'success');
                } else {
                    showMessage(data.message || '登录失败', 'error');
                }
            } catch (error) {
                showMessage('网络错误，请稍后重试', 'error');
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

            try {
                const response = await fetch(`${API_BASE}/transfer`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-API-Key': apiKey
                    },
                    body: JSON.stringify({ from: currentUser, to, amount })
                });

                const data = await response.json();
                if (response.ok) {
                    showMessage('转账成功！', 'success');
                    updateBalance();
                    transferForm.reset();
                } else {
                    showMessage(data.message || '转账失败', 'error');
                }
            } catch (error) {
                showMessage('网络错误，请稍后重试', 'error');
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
                const response = await fetch(`${API_BASE}/balance?user=${username}`);
                const data = await response.json();
                
                if (response.ok) {
                    document.getElementById('query-result').textContent = 
                        `${username} 的余额: ${data.balance} BR`;
                } else {
                    showMessage(data.message || '查询失败', 'error');
                }
            } catch (error) {
                showMessage('网络错误，请稍后重试', 'error');
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
    document.getElementById('wallet-status').style.display = 'none';
    document.querySelector('.wallet-tabs').style.display = 'none';
    document.getElementById('login-tab').classList.remove('active');
    document.getElementById('register-tab').classList.remove('active');
    document.getElementById('wallet-panel').style.display = 'block';
    document.getElementById('wallet-username').textContent = `当前用户: ${currentUser}`;
}

function hideWalletPanel() {
    document.getElementById('wallet-status').style.display = 'block';
    document.querySelector('.wallet-tabs').style.display = 'flex';
    document.getElementById('wallet-panel').style.display = 'none';
    document.getElementById('login-tab').classList.add('active');
}

async function updateBalance() {
    try {
        const response = await fetch(`${API_BASE}/balance?user=${currentUser}`);
        const data = await response.json();
        
        if (response.ok) {
            document.getElementById('balance-amount').textContent = `${data.balance} BR`;
        }
    } catch (error) {
        console.error('获取余额失败:', error);
    }
}

function showMessage(message, type) {
    const msgEl = document.getElementById('wallet-message');
    msgEl.textContent = message;
    msgEl.className = `wallet-message ${type}`;
    
    setTimeout(() => {
        msgEl.className = 'wallet-message';
        msgEl.textContent = '';
    }, 3000);
}
