console.log('Script loaded');

const API_BASE = 'https://coin.schlen.top';
let apiKey = localStorage.getItem('brcoin_api_key');

// 带超时的 fetch
async function fetchWithTimeout(url, options, timeout = 5000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    
    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });
        clearTimeout(id);
        return response;
    } catch (error) {
        clearTimeout(id);
        if (error.name === 'AbortError') {
            throw new Error('请求超时');
        }
        throw error;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded');
    
    // ===== 加入国籍弹窗 =====
    const joinBtn = document.getElementById('join-nation-btn');
    const modal = document.getElementById('join-modal');
    
    // 绑定弹窗内部事件（只要有弹窗就绑定）
    if (modal) {
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
    
    // 导航栏加入按钮
    if (joinBtn && modal) {
        joinBtn.addEventListener('click', function(e) {
            e.preventDefault();
            modal.classList.add('active');
        });
    }
    
    // 页面内的加入按钮（公民专区等）
    document.querySelectorAll('#join-nation-btn-cta').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('CTA button clicked');
            if (modal) modal.classList.add('active');
        });
    });
    
    // ===== BR-coin 钱包 =====
    const apiKeyForm = document.getElementById('apikey-form');
    if (!apiKeyForm) {
        console.log('Wallet not on this page');
        return;
    }
    
    console.log('Wallet found, initializing...');
    
    // 检查是否已有密钥
    if (apiKey) {
        showWalletPanel();
        updateBalance();
    }
    
    // API Key 输入
    apiKeyForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = document.getElementById('api-key-input').value.trim();
        
        if (!input.startsWith('brkey_')) {
            showMessage('请输入正确的 API Key (以 brkey_ 开头)', 'error');
            return;
        }
        
        apiKey = input;
        localStorage.setItem('brcoin_api_key', apiKey);
        showWalletPanel();
        updateBalance();
        showMessage('钱包已连接！', 'success');
    });
    
    // 转账
    const transferForm = document.getElementById('transfer-form');
    if (transferForm) {
        transferForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const to = document.getElementById('transfer-to').value;
            const amount = parseFloat(document.getElementById('transfer-amount').value);
            
            if (!apiKey) {
                showMessage('请先输入 API Key', 'error');
                return;
            }
            
            showMessage('正在转账...', 'info');
            
            try {
                const response = await fetchWithTimeout(`${API_BASE}/transfer`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-API-Key': apiKey
                    },
                    body: JSON.stringify({ from: 'me', to, amount })
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
                showMessage(err.message || '网络错误', 'error');
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
                const response = await fetchWithTimeout(
                    `${API_BASE}/balance?user=${encodeURIComponent(username)}`,
                    {},
                    3000
                );
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
    
    // 断开连接
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            apiKey = null;
            localStorage.removeItem('brcoin_api_key');
            hideWalletPanel();
            showMessage('已断开连接', 'info');
        });
    }
});

function showWalletPanel() {
    const inputPanel = document.getElementById('apikey-input-panel');
    const panel = document.getElementById('wallet-panel');
    
    if (inputPanel) inputPanel.style.display = 'none';
    if (panel) panel.style.display = 'block';
}

function hideWalletPanel() {
    const inputPanel = document.getElementById('apikey-input-panel');
    const panel = document.getElementById('wallet-panel');
    const keyInput = document.getElementById('api-key-input');
    
    if (inputPanel) inputPanel.style.display = 'block';
    if (panel) panel.style.display = 'none';
    if (keyInput) keyInput.value = '';
}

async function updateBalance() {
    if (!apiKey) return;
    
    try {
        const response = await fetchWithTimeout(
            `${API_BASE}/balance?user=me`,
            { headers: { 'X-API-Key': apiKey } },
            3000
        );
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