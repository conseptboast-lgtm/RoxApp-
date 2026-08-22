// ============================================================
// ===== SUPABASE CONFIGURATION =====
// ============================================================
const SUPABASE_URL = 'https://knksfzlpkgnmhboxiczq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_VWt0y4dI2dc5F9l3TAP0pw_MDr9_hd8';

// ============================================================
// ===== ADMIN CONFIGURATION =====
// ============================================================
const ADMIN_WHATSAPP = '7045836445';
const ADMIN_BANK = '3083245519';
const ADMIN_BANK_NAME = 'First bank';
const ADMIN_ACCOUNT_NAME = 'Doris Isawode';

// ============================================================
// ===== HELPER FUNCTIONS =====
// ============================================================
function getUserId() {
    return localStorage.getItem('userId');
}

function setUserId(userId) {
    localStorage.setItem('userId', userId);
}

function redirectTo(page) {
    window.location.href = page;
}

function getToday() {
    return new Date().toISOString().split('T')[0];
}

function getYesterday() {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    return date.toISOString().split('T')[0];
}

function getThisMonth() {
    const date = new Date();
    return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0');
}

// ============================================================
// ===== CHECK LOGIN =====
// ============================================================
function checkLogin() {
    const userId = getUserId();
    if (!userId) {
        redirectTo('login.html');
        return false;
    }
    return true;
}

// ============================================================
// ===== LOGIN =====
// ============================================================
async function loginUser() {
    const userId = document.getElementById('loginUserId').value.trim();
    if (!userId) {
        alert('Please enter your User ID');
        return;
    }
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/Users?userId=eq.${userId}`, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            }
        });
        const data = await response.json();
        if (data.length === 0) {
            alert('❌ User not found. Please register first.');
            return;
        }
        setUserId(userId);
        redirectTo('index.html');
    } catch (error) {
        alert('❌ Network error. Please check your connection.');
    }
}

// ============================================================
// ===== REGISTER =====
// ============================================================
async function registerUser() {
    const fullName = document.getElementById('regFullName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const phone = document.getElementById('regPhone').value.trim();
    const userId = document.getElementById('regUserId').value.trim();
    const referralCode = document.getElementById('regReferralCode').value.trim().toUpperCase();
    
    if (!fullName || !email || !phone || !userId) {
        alert('Please fill all fields');
        return;
    }
    
    // Generate unique referral code
    const userReferralCode = userId.toUpperCase().substring(0, 6) + '-' + Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    
    // Check if referral code exists
    let referredBy = null;
    if (referralCode) {
        try {
            const checkResponse = await fetch(`${SUPABASE_URL}/rest/v1/Users?referralCode=eq.${referralCode}`, {
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
                }
            });
            const checkData = await checkResponse.json();
            if (checkData.length > 0) {
                referredBy = checkData[0].userId;
            } else {
                alert('⚠️ Invalid referral code. You can still register without it.');
            }
        } catch (e) {
            console.log('Referral check failed, continuing...');
        }
    }
    
    const userData = {
        userId: userId,
        fullName: fullName,
        email: email,
        phone: phone,
        currentLevel: 'Rox 0',
        balance: 0,
        totalEarned: 0,
        registrationDate: getToday(),
        lastTaskDate: getToday(),
        tasksCompletedToday: 0,
        isActive: true,
        isAdmin: false,
        referralCode: userReferralCode,
        referredBy: referredBy,
        referralEarnings: 0,
        referralCount: 0
    };
    
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/Users`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });
        
        if (response.ok) {
            // If referred, create referral record and give bonus
            if (referredBy) {
                try {
                    await fetch(`${SUPABASE_URL}/rest/v1/Referrals`, {
                        method: 'POST',
                        headers: {
                            'apikey': SUPABASE_ANON_KEY,
                            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            referrerId: referredBy,
                            referredId: userId,
                            referralCode: referralCode,
                            status: 'Pending',
                            date: getToday(),
                            rewardAmount: 0
                        })
                    });
                    
                    // Update referrer's count
                    await fetch(`${SUPABASE_URL}/rest/v1/Users?userId=eq.${referredBy}`, {
                        method: 'PATCH',
                        headers: {
                            'apikey': SUPABASE_ANON_KEY,
                            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            referralCount: { increment: 1 }
                        })
                    });
                    
                    // Give new user ₦200 bonus
                    await fetch(`${SUPABASE_URL}/rest/v1/Users?userId=eq.${userId}`, {
                        method: 'PATCH',
                        headers: {
                            'apikey': SUPABASE_ANON_KEY,
                            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            balance: 200,
                            totalEarned: 200
                        })
                    });
                    
                    alert('🎉 You were referred! You got ₦200 bonus!');
                } catch (e) {
                    console.log('Referral bonus failed, continuing...');
                }
            }
            
            alert('✅ Registration successful! You are on Rox 0.');
            setUserId(userId);
            redirectTo('index.html');
        } else {
            const error = await response.text();
            alert('❌ Registration failed: ' + error);
        }
    } catch (error) {
        alert('❌ Network error. Please check your connection.');
    }
}

// ============================================================
// ===== LOAD USER DATA =====
// ============================================================
async function loadUserData() {
    const userId = getUserId();
    if (!userId) return;
    
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/Users?userId=eq.${userId}`, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            }
        });
        const users = await response.json();
        const user = users[0];
        if (!user) {
            localStorage.removeItem('userId');
            redirectTo('login.html');
            return;
        }
        
        // Get level
        let level = { levelName: 'Rox 0', dailyTasksRequired: 0, dailyEarn: 0, weeklyEarn: 0, monthlyEarn: 0, withdrawFee: 0, lockDays: 0, withdrawDay: 'Monday' };
        if (user.currentLevel && user.currentLevel !== 'Rox 0') {
            try {
                const levelResponse = await fetch(`${SUPABASE_URL}/rest/v1/VIP_Levels?levelName=eq.${user.currentLevel}`, {
                    headers: {
                        'apikey': SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
                    }
                });
                const levels = await levelResponse.json();
                if (levels.length > 0) {
                    level = levels[0];
                }
            } catch (e) {}
        }
        const canEarn = user.currentLevel !== 'Rox 0';
        
        // ---- Update UI ----
        document.querySelectorAll('.user-name').forEach(el => {
            if (el) el.textContent = user.fullName || userId;
        });
        const levelBadges = document.querySelectorAll('#userLevel, #currentLevelDisplay, #profileLevel');
        levelBadges.forEach(el => {
            if (el) el.textContent = user.currentLevel || 'Rox 0';
        });
        document.querySelectorAll('#userBalance, #profileBalance, #withdrawBalance').forEach(el => {
            if (el) el.textContent = `₦${(user.balance || 0).toFixed(2)}`;
        });
        document.querySelectorAll('#totalEarned, #profileTotalEarned').forEach(el => {
            if (el) el.textContent = `₦${(user.totalEarned || 0).toFixed(2)}`;
        });
        
        // Tasks
        const done = user.tasksCompletedToday || 0;
        const required = canEarn ? (level.dailyTasksRequired || 0) : 0;
        document.querySelectorAll('#taskCount').forEach(el => {
            if (el) el.textContent = `${done}/${required}`;
        });
        const progress = required > 0 ? (done / required) * 100 : 0;
        document.querySelectorAll('#progressFill').forEach(el => {
            if (el) el.style.width = Math.min(progress, 100) + '%';
        });
        
        // Level status
        const statusEl = document.getElementById('levelStatus');
        if (statusEl) {
            if (canEarn) {
                statusEl.textContent = '✅ Earning active!';
                statusEl.style.color = '#4CAF50';
            } else {
                statusEl.textContent = '⚠️ Deposit to unlock earning';
                statusEl.style.color = '#ff6b6b';
            }
        }
        
        // ---- Referral Data ----
        document.querySelectorAll('#myReferralCode').forEach(el => {
            if (el) el.textContent = user.referralCode || 'N/A';
        });
        document.querySelectorAll('#totalReferrals').forEach(el => {
            if (el) el.textContent = user.referralCount || 0;
        });
        document.querySelectorAll('#referralEarnings').forEach(el => {
            if (el) el.textContent = `₦${(user.referralEarnings || 0).toFixed(2)}`;
        });
        
        // ---- Referral History ----
        const historyContainer = document.getElementById('referralHistory');
        if (historyContainer) {
            try {
                const refResponse = await fetch(`${SUPABASE_URL}/rest/v1/Referrals?referrerId=eq.${userId}`, {
                    headers: {
                        'apikey': SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
                    }
                });
                const referrals = await refResponse.json();
                if (referrals && referrals.length > 0) {
                    historyContainer.innerHTML = referrals.map(r => `
                        <div class="history-item">
                            <span>👤 ${r.referredId || 'User'}</span>
                            <span>${r.status || 'Pending'}</span>
                            <span>📅 ${r.date || ''}</span>
                        </div>
                    `).join('');
                } else {
                    historyContainer.innerHTML = '<p style="color:#666; text-align:center;">No referrals yet</p>';
                }
            } catch (e) {
                historyContainer.innerHTML = '<p style="color:#666; text-align:center;">No referrals yet</p>';
            }
        }
        
        // ---- Quiz Section ----
        const quizSection = document.getElementById('quizSection');
        const levelWarning = document.getElementById('levelWarning');
        const submitBtn = document.getElementById('submitAnswerBtn');
        if (quizSection && levelWarning && submitBtn) {
            if (canEarn) {
                quizSection.style.display = 'block';
                levelWarning.style.display = 'none';
                submitBtn.disabled = false;
                submitBtn.style.opacity = '1';
                if (!currentQuestion) {
                    loadQuestion();
                }
            } else {
                quizSection.style.display = 'none';
                levelWarning.style.display = 'block';
                submitBtn.disabled = true;
                submitBtn.style.opacity = '0.5';
            }
        }
        
        // ---- Earnings ----
        document.querySelectorAll('#dailyEarn').forEach(el => {
            if (el) el.textContent = canEarn ? `₦${level.dailyEarn || 0}` : '₦0';
        });
        document.querySelectorAll('#weeklyEarn').forEach(el => {
            if (el) el.textContent = canEarn ? `₦${level.weeklyEarn || 0}` : '₦0';
        });
        document.querySelectorAll('#monthlyEarn').forEach(el => {
            if (el) el.textContent = canEarn ? `₦${level.monthlyEarn || 0}` : '₦0';
        });
        
        // ---- Withdraw ----
        document.querySelectorAll('#withdrawFee').forEach(el => {
            if (el) el.textContent = `${level.withdrawFee || 0}%`;
        });
        document.querySelectorAll('#lockDays').forEach(el => {
            if (el) el.textContent = `${level.lockDays || 0} days`;
        });
        document.querySelectorAll('#withdrawDay').forEach(el => {
            if (el) el.textContent = level.withdrawDay || 'Monday';
        });
        
        // ---- Profile ----
        document.querySelectorAll('#profileName').forEach(el => {
            if (el) el.textContent = user.fullName || '-';
        });
        document.querySelectorAll('#profileEmail').forEach(el => {
            if (el) el.textContent = user.email || '-';
        });
        document.querySelectorAll('#profilePhone').forEach(el => {
            if (el) el.textContent = user.phone || '-';
        });
        document.querySelectorAll('#profileUserId').forEach(el => {
            if (el) el.textContent = userId;
        });
        document.querySelectorAll('#profileJoinDate').forEach(el => {
            if (el) el.textContent = user.registrationDate || '-';
        });
        
        // ---- Earnings Breakdown ----
        await loadEarningsBreakdown(userId);
        
    } catch (error) {
        console.error('Error loading user data:', error);
    }
}

// ============================================================
// ===== LOAD EARNINGS BREAKDOWN =====
// ============================================================
async function loadEarningsBreakdown(userId) {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/Transactions?userId=eq.${userId}&type=eq.Daily Reward&select=amount,date`, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            }
        });
        const transactions = await response.json();
        const today = getToday();
        const yesterday = getYesterday();
        let todayTotal = 0, yesterdayTotal = 0, monthTotal = 0;
        transactions.forEach(t => {
            const amount = t.amount || 0;
            monthTotal += amount;
            if (t.date === today) todayTotal += amount;
            if (t.date === yesterday) yesterdayTotal += amount;
        });
        document.querySelectorAll('#earnedToday').forEach(el => {
            if (el) el.textContent = `₦${todayTotal.toFixed(2)}`;
        });
        document.querySelectorAll('#earnedYesterday').forEach(el => {
            if (el) el.textContent = `₦${yesterdayTotal.toFixed(2)}`;
        });
        document.querySelectorAll('#earnedMonth').forEach(el => {
            if (el) el.textContent = `₦${monthTotal.toFixed(2)}`;
        });
    } catch (error) {
        console.error('Error loading earnings breakdown:', error);
    }
}

// ============================================================
// ===== LOAD VIP LEVELS =====
// ============================================================
async function loadVIPLevels() {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/VIP_Levels?select=*&order=levelOrder.asc`, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            }
        });
        const levels = await response.json();
        const container = document.getElementById('levelsList');
        if (container) {
            container.innerHTML = '';
            levels.forEach(level => {
                const div = document.createElement('div');
                div.className = 'level-item';
                div.innerHTML = `
                    <div class="name">${level.levelName}</div>
                    <div class="cost">Registration: ₦${level.registrationCost}</div>
                    <div class="rewards">
                        <span>Daily: ₦${level.dailyEarn}</span>
                        <span>Weekly: ₦${level.weeklyEarn}</span>
                        <span>Monthly: ₦${level.monthlyEarn}</span>
                    </div>
                    <button onclick="applyForLevel('${level.levelName}', ${level.registrationCost})" class="btn-apply">
                        Apply for ${level.levelName}
                    </button>
                `;
                container.appendChild(div);
            });
        }
    } catch (error) {
        console.error('Error loading VIP levels:', error);
    }
}

// ============================================================
// ===== APPLY FOR VIP LEVEL =====
// ============================================================
async function applyForLevel(levelName, cost) {
    const userId = getUserId();
    if (!userId) { redirectTo('login.html'); return; }
    if (confirm(`To upgrade to ${levelName}, you need to deposit ₦${cost.toLocaleString()}. Click OK to continue.`)) {
        alert(
            `💰 Deposit ${cost.toLocaleString()} to:\n\n` +
            `Bank: ${ADMIN_BANK_NAME}\n` +
            `Account: ${ADMIN_BANK}\n` +
            `Name: ${ADMIN_ACCOUNT_NAME}\n\n` +
            `Then send a message on WhatsApp with your User ID and amount.`
        );
        window.open(`https://wa.me/234${ADMIN_WHATSAPP}`, '_blank');
    }
}

// ============================================================
// ===== SUBMIT DEPOSIT REQUEST =====
// ============================================================
async function submitDepositRequest() {
    const userId = getUserId();
    if (!userId) {
        alert('Please login first');
        redirectTo('login.html');
        return;
    }
    
    const amount = document.getElementById('depositAmount').value;
    const level = document.getElementById('depositLevel').value;
    
    if (!amount || amount <= 0) {
        document.getElementById('depositMessage').textContent = '❌ Please enter a valid amount';
        document.getElementById('depositMessage').style.color = '#ff6b6b';
        return;
    }
    
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/DepositRequests`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: userId,
                amount: parseInt(amount),
                levelRequested: level,
                status: 'Pending',
                requestDate: getToday()
            })
        });
        
        if (response.ok) {
            document.getElementById('depositMessage').textContent = '✅ Deposit request submitted! Contact admin on WhatsApp.';
            document.getElementById('depositMessage').style.color = '#4CAF50';
        } else {
            const error = await response.text();
            document.getElementById('depositMessage').textContent = '❌ Failed: ' + error;
            document.getElementById('depositMessage').style.color = '#ff6b6b';
        }
    } catch (error) {
        document.getElementById('depositMessage').textContent = '❌ Network error: ' + error.message;
        document.getElementById('depositMessage').style.color = '#ff6b6b';
    }
}

// ============================================================
// ===== SEND SUPPORT MESSAGE =====
// ============================================================
async function sendSupportMessage() {
    const userId = document.getElementById('supportUserId').value.trim();
    const fullName = document.getElementById('supportFullName').value.trim();
    const email = document.getElementById('supportEmail').value.trim();
    const subject = document.getElementById('supportSubject').value;
    const message = document.getElementById('supportMessage').value.trim();
    
    if (!message) {
        document.getElementById('supportResponse').textContent = '❌ Please enter a message';
        document.getElementById('supportResponse').style.color = '#ff6b6b';
        return;
    }
    
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/SupportMessages`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: userId || 'Guest',
                fullName: fullName || 'Anonymous',
                email: email || 'N/A',
                subject: subject || 'General',
                message: message,
                status: 'Unread',
                date: getToday()
            })
        });
        
        if (response.ok) {
            document.getElementById('supportResponse').textContent = '✅ Message sent! We\'ll respond within 24 hours.';
            document.getElementById('supportResponse').style.color = '#4CAF50';
            document.getElementById('supportUserId').value = '';
            document.getElementById('supportFullName').value = '';
            document.getElementById('supportEmail').value = '';
            document.getElementById('supportMessage').value = '';
        } else {
            document.getElementById('supportResponse').textContent = '❌ Failed to send message';
            document.getElementById('supportResponse').style.color = '#ff6b6b';
        }
    } catch (error) {
        document.getElementById('supportResponse').textContent = '❌ Network error: ' + error.message;
        document.getElementById('supportResponse').style.color = '#ff6b6b';
    }
}

// ============================================================
// ===== OPEN LIVE CHAT =====
// ============================================================
function openLiveChat() {
    // Try Tawk.to first
    if (typeof Tawk_API !== 'undefined' && Tawk_API) {
        Tawk_API.toggle();
        Tawk_API.maximize();
    } else {
        // Fallback: Open WhatsApp
        if (confirm('Chat not loading? Open WhatsApp instead?')) {
            window.open(`https://wa.me/234${ADMIN_WHATSAPP}`, '_blank');
        }
    }
}

// ============================================================
// ===== REFERRAL FUNCTIONS =====
// ============================================================
function copyReferralCode() {
    const codeEl = document.getElementById('myReferralCode');
    if (codeEl && codeEl.textContent !== 'LOADING...' && codeEl.textContent !== 'N/A') {
        navigator.clipboard.writeText(codeEl.textContent);
        alert('✅ Referral code copied: ' + codeEl.textContent);
    } else {
        alert('❌ No referral code found. Please login again.');
    }
}

function shareReferral() {
    const codeEl = document.getElementById('myReferralCode');
    if (codeEl && codeEl.textContent !== 'LOADING...' && codeEl.textContent !== 'N/A') {
        const url = `${window.location.origin}/register.html?ref=${codeEl.textContent}`;
        if (navigator.share) {
            navigator.share({
                title: 'Join VIP Task Earn!',
                text: `🎉 Use my referral code ${codeEl.textContent} and get ₦200 bonus!`,
                url: url
            });
        } else {
            navigator.clipboard.writeText(url);
            alert('✅ Link copied: ' + url);
        }
    } else {
        alert('❌ No referral code found. Please login again.');
    }
}

// ============================================================
// ===== QUESTIONS DATABASE =====
// ============================================================
const questions = [
    { question: "Rox 1 + 1 = ?", answer: "2" },
    { question: "Rox 2 × 3 = ?", answer: "6" },
    { question: "Rox 5 - 2 = ?", answer: "3" },
    { question: "Rox 10 ÷ 2 = ?", answer: "5" },
    { question: "Rox 3 + Rox 4 = ?", answer: "7" },
    { question: "Rox 7 + Rox 8 = ?", answer: "15" },
    { question: "Rox 6 × Rox 2 = ?", answer: "12" },
    { question: "Rox 9 - Rox 4 = ?", answer: "5" },
    { question: "Rox 1 + Rox 9 = ?", answer: "10" },
    { question: "Rox 8 ÷ Rox 2 = ?", answer: "4" },
    { question: "Who is the President of Nigeria?", answer: "Bola Tinubu" },
    { question: "What is the capital of Nigeria?", answer: "Abuja" },
    { question: "What is the currency of Nigeria?", answer: "Naira" },
    { question: "How many states are in Nigeria?", answer: "36" },
    { question: "What year did Nigeria gain independence?", answer: "1960" },
    { question: "What is the cost of Rox 1?", answer: "300" },
    { question: "What is the daily earn for Rox 1?", answer: "30" },
    { question: "What is the cost of Rox 3?", answer: "1000" },
    { question: "What is the daily earn for DC 01?", answer: "10000" },
    { question: "What is the withdraw fee for Rox 1?", answer: "5" },
];

// ============================================================
// ===== QUIZ STATE =====
// ============================================================
let currentQuestion = null;
let questionAttempts = 0;

// ============================================================
// ===== LOAD QUESTION =====
// ============================================================
function loadQuestion() {
    if (questions.length === 0) {
        document.getElementById('questionText').textContent = "No questions available!";
        return;
    }
    const randomIndex = Math.floor(Math.random() * questions.length);
    currentQuestion = questions[randomIndex];
    const qText = document.getElementById('questionText');
    if (qText) qText.textContent = currentQuestion.question;
    const answerInput = document.getElementById('answerInput');
    if (answerInput) answerInput.value = '';
    const msg = document.getElementById('answerMessage');
    if (msg) {
        msg.textContent = '';
        msg.style.color = '#aaa';
    }
    questionAttempts = 0;
}

// ============================================================
// ===== CHECK ANSWER =====
// ============================================================
async function checkAnswer() {
    const userId = getUserId();
    if (!userId) { redirectTo('login.html'); return; }
    
    const user = await getCurrentUser(userId);
    if (!user || user.currentLevel === 'Rox 0') {
        const msg = document.getElementById('answerMessage');
        if (msg) {
            msg.textContent = '⚠️ You need a VIP level to earn!';
            msg.style.color = '#ff6b6b';
        }
        return;
    }
    
    const userAnswer = document.getElementById('answerInput').value.trim();
    if (!userAnswer) {
        const msg = document.getElementById('answerMessage');
        if (msg) {
            msg.textContent = '❌ Please type your answer!';
            msg.style.color = '#ff6b6b';
        }
        return;
    }
    
    const isCorrect = userAnswer.toLowerCase() === currentQuestion.answer.toLowerCase();
    const msg = document.getElementById('answerMessage');
    
    if (isCorrect) {
        if (msg) {
            msg.textContent = '✅ Correct! 🎉 Task completed!';
            msg.style.color = '#4CAF50';
        }
        await completeTask();
        setTimeout(() => {
            loadQuestion();
            loadUserData();
        }, 1500);
    } else {
        questionAttempts++;
        const remaining = 3 - questionAttempts;
        if (msg) {
            msg.textContent = `❌ Wrong answer. ${remaining} attempt(s) left.`;
            msg.style.color = '#ff6b6b';
        }
        if (questionAttempts >= 3) {
            if (msg) {
                msg.textContent = '❌ All attempts used! New question...';
                msg.style.color = '#ffd700';
            }
            setTimeout(() => {
                loadQuestion();
            }, 2000);
        }
    }
}

// ============================================================
// ===== GET CURRENT USER =====
// ============================================================
async function getCurrentUser(userId) {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/Users?userId=eq.${userId}`, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            }
        });
        const users = await response.json();
        return users[0];
    } catch (error) {
        return null;
    }
}

// ============================================================
// ===== COMPLETE TASK =====
// ============================================================
async function completeTask() {
    const userId = getUserId();
    if (!userId) { redirectTo('login.html'); return; }
    
    try {
        const userResponse = await fetch(`${SUPABASE_URL}/rest/v1/Users?userId=eq.${userId}`, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            }
        });
        const users = await userResponse.json();
        const user = users[0];
        if (!user) {
            alert('User not found');
            redirectTo('login.html');
            return;
        }
        
        if (user.currentLevel === 'Rox 0') {
            const msg = document.getElementById('answerMessage');
            if (msg) {
                msg.textContent = '⚠️ Deposit to unlock earning!';
                msg.style.color = '#ff6b6b';
            }
            return;
        }
        
        const levelResponse = await fetch(`${SUPABASE_URL}/rest/v1/VIP_Levels?levelName=eq.${user.currentLevel}`, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            }
        });
        const levels = await levelResponse.json();
        const level = levels[0] || { dailyTasksRequired: 1, dailyEarn: 0 };
        const dailyTasksRequired = level.dailyTasksRequired || 0;
        const dailyEarn = level.dailyEarn || 0;
        
        const today = getToday();
        let tasksCompleted = user.tasksCompletedToday || 0;
        if (user.lastTaskDate !== today) {
            tasksCompleted = 0;
        }
        
        if (tasksCompleted >= dailyTasksRequired) {
            const msg = document.getElementById('answerMessage');
            if (msg) {
                msg.textContent = '✅ Already completed all tasks today!';
                msg.style.color = '#ffd700';
            }
            return;
        }
        
        tasksCompleted += 1;
        await fetch(`${SUPABASE_URL}/rest/v1/Users?userId=eq.${userId}`, {
            method: 'PATCH',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                tasksCompletedToday: tasksCompleted,
                lastTaskDate: today
            })
        });
        
        if (tasksCompleted >= dailyTasksRequired) {
            const newBalance = (user.balance || 0) + dailyEarn;
            const newTotalEarned = (user.totalEarned || 0) + dailyEarn;
            
            await fetch(`${SUPABASE_URL}/rest/v1/Users?userId=eq.${userId}`, {
                method: 'PATCH',
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    balance: newBalance,
                    totalEarned: newTotalEarned
                })
            });
            
            await fetch(`${SUPABASE_URL}/rest/v1/Transactions`, {
                method: 'POST',
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: user.id,
                    type: 'Daily Reward',
                    amount: dailyEarn,
                    date: today,
                    status: 'Completed',
                    description: `Daily reward for ${dailyTasksRequired} tasks`
                })
            });
            
            const msg = document.getElementById('answerMessage');
            if (msg) {
                msg.textContent = `🎉 Earned ₦${dailyEarn}! All tasks done!`;
                msg.style.color = '#4CAF50';
            }
            loadUserData();
        } else {
            const msg = document.getElementById('answerMessage');
            if (msg) {
                msg.textContent = `✅ Task ${tasksCompleted}/${dailyTasksRequired} done! Keep going!`;
                msg.style.color = '#4CAF50';
            }
        }
    } catch (error) {
        console.error('Error:', error);
        const msg = document.getElementById('answerMessage');
        if (msg) {
            msg.textContent = '❌ Network error: ' + error.message;
            msg.style.color = '#ff6b6b';
        }
    }
}

// ============================================================
// ===== REQUEST WITHDRAWAL =====
// ============================================================
async function requestWithdrawal() {
    const userId = getUserId();
    if (!userId) { redirectTo('login.html'); return; }
    
    const bank = document.getElementById('withdrawBank').value.trim();
    const account = document.getElementById('withdrawAccount').value.trim();
    const accountName = document.getElementById('withdrawAccountName').value.trim();
    const amount = parseFloat(document.getElementById('withdrawAmount').value);
    
    if (!bank || !account || !accountName || !amount || amount <= 0) {
        const msg = document.getElementById('withdrawMessage');
        if (msg) {
            msg.textContent = '❌ Please fill all fields';
            msg.style.color = '#ff6b6b';
        }
        return;
    }
    
    const btn = document.querySelector('.btn-withdraw');
    if (btn) {
        btn.disabled = true;
        btn.textContent = '⏳ Processing...';
    }
    
    try {
        const userResponse = await fetch(`${SUPABASE_URL}/rest/v1/Users?userId=eq.${userId}`, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            }
        });
        const users = await userResponse.json();
        const user = users[0];
        if (!user) {
            alert('User not found');
            return;
        }
        if ((user.balance || 0) < amount) {
            const msg = document.getElementById('withdrawMessage');
            if (msg) {
                msg.textContent = '❌ Insufficient balance';
                msg.style.color = '#ff6b6b';
            }
            if (btn) { btn.disabled = false; btn.textContent = '💸 Request Withdrawal'; }
            return;
        }
        
        const levelResponse = await fetch(`${SUPABASE_URL}/rest/v1/VIP_Levels?levelName=eq.${user.currentLevel}`, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            }
        });
        const levels = await levelResponse.json();
        const level = levels[0] || { withdrawFee: 0 };
        const fee = (amount * level.withdrawFee) / 100;
        const netAmount = amount - fee;
        
        await fetch(`${SUPABASE_URL}/rest/v1/Withdrawals`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: user.id,
                amount: amount,
                fee: fee,
                netAmount: netAmount,
                bankName: bank,
                accountNumber: account,
                accountName: accountName,
                status: 'Pending',
                requestDate: getToday()
            })
        });
        
        await fetch(`${SUPABASE_URL}/rest/v1/Users?userId=eq.${userId}`, {
            method: 'PATCH',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                balance: (user.balance || 0) - amount
            })
        });
        
        const msg = document.getElementById('withdrawMessage');
        if (msg) {
            msg.textContent = `✅ Withdrawal requested! Net after ${level.withdrawFee}% fee: ₦${netAmount.toFixed(2)}`;
            msg.style.color = '#4CAF50';
        }
        loadUserData();
    } catch (error) {
        const msg = document.getElementById('withdrawMessage');
        if (msg) {
            msg.textContent = '❌ Network error: ' + error.message;
            msg.style.color = '#ff6b6b';
        }
    }
    if (btn) {
        btn.disabled = false;
        btn.textContent = '💸 Request Withdrawal';
    }
}

// ============================================================
// ===== LOGOUT =====
// ============================================================
function logoutUser() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('userId');
        redirectTo('login.html');
    }
}

// ============================================================
// ===== TEST SUPABASE CONNECTION =====
// ============================================================
async function testSupabaseConnection() {
    const userId = getUserId();
    if (!userId) {
        alert('❌ Not logged in!');
        return;
    }
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/Users?userId=eq.${userId}`, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            }
        });
        if (response.ok) {
            const data = await response.json();
            alert('✅ Connected!\nUser: ' + JSON.stringify(data));
        } else {
            alert('❌ Error: ' + response.status + ' ' + response.statusText);
        }
    } catch (error) {
        alert('❌ Network error: ' + error.message);
    }
}

// ============================================================
// ===== PAGE LOAD HANDLER =====
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
    const page = window.location.pathname.split('/').pop();
    const protectedPages = ['index.html', 'tasks.html', 'vip.html', 'profile.html', 'withdraw.html', 'deposit.html', 'referral.html', 'support.html'];
    if (protectedPages.includes(page)) {
        if (!checkLogin()) return;
        loadUserData();
        if (page === 'vip.html') loadVIPLevels();
        if (page === 'tasks.html') {
            // Load question if quiz section exists
            setTimeout(() => {
                if (document.getElementById('questionText')) {
                    loadQuestion();
                }
            }, 500);
        }
    }
    if (page === 'login.html' && getUserId()) {
        redirectTo('index.html');
    }
    if (page === 'register.html') {
        // Auto-fill referral code from URL
        const urlParams = new URLSearchParams(window.location.search);
        const refCode = urlParams.get('ref');
        if (refCode) {
            const input = document.getElementById('regReferralCode');
            if (input) {
                input.value = refCode;
                input.style.borderColor = '#4CAF50';
            }
        }
    }
});
// ============================================
// WHATSAPP POPUP
// ============================================

// Show popup (only once per day)
function showPopup() {
    const lastSeen = localStorage.getItem('whatsappPopup');
    const today = getToday();

    if (lastSeen !== today) {
        setTimeout(function() {
            const popup = document.getElementById('whatsappPopup');
            if (popup) popup.style.display = 'flex';
        }, 3000);
    }
}

// Close popup
function closePopup() {
    const popup = document.getElementById('whatsappPopup');
    if (popup) popup.style.display = 'none';
    localStorage.setItem('whatsappPopup', getToday());
}

// Join WhatsApp Group
function joinWhatsApp() {
    const link = 'https://chat.whatsapp.com/FV6rtPNGaag0e7C44T4BWb';
    window.open(link, '_blank');
    closePopup();
}
document.addEventListener('DOMContentLoaded', function() {
    const page = window.location.pathname.split('/').pop();

    // --- Show popup only on dashboard ---
    if (page === 'index.html' || page === '') {
        showPopup();
    }

    // --- Rest of your existing code ---
    // (your login check, loadUserData, etc.)
});