console.log('Script loaded');

const API_BASE = 'https://coin.schlen.top';
let apiKey = localStorage.getItem('brcoin_api_key');
let currentUser = localStorage.getItem('brcoin_user');

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded');
    
    // ===== 加入国籍弹窗 =====
    const joinBtn = document.getElementById('join-nation-btn');
    const modal = document.getElementById('join-modal');
    
    if (joinBtn && modal) {
        joinBtn.addEventListener('click', function(e) {
            e.preventDefault();
            modal.classList.add('active');
        });
        
        const closeBtn = modal.querySelector('.close-btn');
        const cancelBtn = document.getElementById('cancel-join');
        const confirmBtn = document.getElementById('confirm-join');
        
        if (closeBtn) closeBtn.addEventListener('click', () => modal.classList.remove('active'));
        if (cancelBtn) cancelBtn.addEventListener('click', () => modal.classList.remove('active'));
        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
                window.location.href = 'mailto:joinschlen@shundebo.top?subject=Schlen联邦共和国入籍申请';
                modal.classList.remove('active');
            });
        }
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.remove('active');
        });
    }
    
    // 页面内的加入按钮
    document.querySelectorAll('#join-nation-btn-cta').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            if (modal) modal.classList.add('active');
        });
    });
    
    // ===== BR-coin 钱包 =====
    const walletContainer = document.querySelector('.wallet-container');
    if (!walletContainer) {
        console.log('Wallet not on this page');
        return;
    }
    
    console.log('Wallet found, initializing...');
    
    // 标签切换
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            document.getElementById(btn.dataset.tab + '-tab').classList.add('active');
        });
    });
    
    // 检查登录状态
    if (apiKey && currentUser) {
        showWalletPanel();
        updateBalance();
    }
    
    // 注册
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log('Register submitted');
            
            const username = document.getElementById('register-username').value;
            const password = document.getElementById('register-password').value;
            
            if (password.length < 6) {
                showMessage('密码至少需要6位', 'error');
                return;
            }
            
            showMessage('正在注册...', 'info');
            
            try {
                const response = await fetch(`${API_BASE}/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });
                
                console.log('Register response:', response.status);
                const data = await response.json().catch(() => ({}));
                
                if (response.ok) {
                    showMessage('注册成功！请登录', 'success');
                    document.getElementById('register-username').value = '';
                    document.getElementById('register-password').value = '';
                    setTimeout(() => document.querySelector('[data-tab="login"]').click(), 1000);
                } else {
                    showMessage(data.message || `注册失败 (${response.status})`, 'error');
                }
            } catch (err) {
                console.error('Register error:', err);
                showMessage('网络错误，请检查控制台', 'error');
            }
        });
    }
    
    // 登录
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log('Login submitted');
            
            const username = document.getElementById('login-username').value;
            const password = document.getElementById('login-password').value;
            
            showMessage('正在登录...', 'info');
            
            try {
                const response = await fetch(`${API_BASE}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });
                
                console.log('Login response:', response.status);
                const data = await response.json().catch(() => ({}));
                
                if (response.ok && data.token) {
                    apiKey = data.token;
                    currentUser = username;
                    localStorage.setItem('brcoin_api_key', apiKey);
                    localStorage.setItem('brcoin_user', currentUser);
                    showWalletPanel();
                    updateBalance();
                    showMessage('登录成功！', 'success');
                } else {
                    showMessage(data.message || '用户名或密码错误', 'error');
                }
            } catch (err) {
                console.error('Login error:', err);
                showMessage('网络错误，请检查控制台', 'error');
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
            
            showMessage('正在转账...', 'info');
            
            try {
                const response = await fetch(`${API_BASE}/transfer`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-API-Key': apiKey
                    },
                    body: JSON.stringify({ from: currentUser, to, amount })
                });
                
                const data = await response.json().catch(() => ({}));
                
                if (response.ok) {
                    showMessage('转账成功！', 'success');
                    updateBalance();
                    transferForm.reset();
                } else {
                    showMessage(data.message || '转账失败', 'error');
                }
            } catch (err) {
                showMessage('网络错误', 'error');
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
            
            document.getElementById('query-result').textContent = '查询中...';
            
            try {
                const response = await fetch(`${API_BASE}/balance?user=${encodeURIComponent(username)}`);
                const data = await response.json();
                
                if (response.ok) {
                    document.getElementById('query-result').textContent = `${username}: ${data.balance} BR`;
                } else {
                    document.getElementById('query-result').textContent = '查询失败';
                }
            } catch (err) {
                document.getElementById('query-result').textContent = '查询失败';
            }
        });
    }
    
    // 退出
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            apiKey = null;
            currentUser = null;
            localStorage.removeItem('brcoin_api_key');
            localStorage.removeItem('brcoin_user');
            hideWalletPanel();
            showMessage('已退出', 'info');
        });
    }
});

function showWalletPanel() {
    const status = document.getElementById('wallet-status');
    const tabs = document.querySelector('.wallet-tabs');
    const panel = document.getElementById('wallet-panel');
    
    if (status) status.style.display = 'none';
    if (tabs) tabs.style.display = 'none';
    if (panel) panel.style.display = 'block';
    
    const usernameEl = document.getElementById('wallet-username');
    if (usernameEl) usernameEl.textContent = `用户: ${currentUser}`;
}

function hideWalletPanel() {
    const status = document.getElementById('wallet-status');
    const tabs = document.querySelector('.wallet-tabs');
    const panel = document.getElementById('wallet-panel');
    
    if (status) status.style.display = 'block';
    if (tabs) tabs.style.display = 'flex';
    if (panel) panel.style.display = 'none';
}

async function updateBalance() {
    if (!currentUser) return;
    
    try {
        const response = await fetch(`${API_BASE}/balance?user=${encodeURIComponent(currentUser)}`);
        const data = await response.json();
        
        if (response.ok) {
            const el = document.getElementById('balance-amount');
            if (el) el.textContent = `${data.balance} BR`;
        }
    } catch (err) {
        console.error('Balance error:', err);
    }
}

function showMessage(msg, type) {
    const el = document.getElementById('wallet-message');
    if (!el) return;
    
    el.textContent = msg;
    el.className = `wallet-message ${type}`;
    el.style.display = 'block';
    
    setTimeout(() => {
        el.className = 'wallet-message';
        el.textContent = '';
        el.style.display = 'none';
    }, 3000);
}