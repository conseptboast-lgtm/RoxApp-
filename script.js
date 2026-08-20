// ===== SUPABASE CONFIGURATION =====
const SUPABASE_URL = const SUPABASE_URL = 'https://knksfzlpkgnmhboxiczq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_VWt0y4dI2dc5F9l3TAP0pw_MDr9_hd8';

// ===== ADMIN CONFIGURATION =====
const ADMIN_WHATSAPP = '8100811884';
const ADMIN_BANK = '3083245519';
const ADMIN_BANK_NAME = 'GTBank';
const ADMIN_ACCOUNT_NAME = 'Doris Isawode';

// ===== HELPER FUNCTIONS =====
function getUserId() {
    return localStorage.getItem('userId');
}

function setUserId(userId) {
    localStorage.setItem('userId', userId);
}

function redirectTo(page) {
    window.location.href = page;
}

function copyText(text) {
    navigator.clipboard.writeText(text);
    alert('✅ Copied: ' + text);
}

function openWhatsApp() {
    window.open(`https://wa.me/234${ADMIN_WHATSAPP}`, '_blank');
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

// ===== QUESTIONS DATABASE =====
const questions = [
    // Math
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
    { question: "Rox 4 + Rox 5 + Rox 1 = ?", answer: "10" },
    { question: "Rox 3 × Rox 3 = ?", answer: "9" },
    // General Knowledge
    { question: "Who is the President of Nigeria?", answer: "Bola Tinubu" },
    { question: "What is the capital of Nigeria?", answer: "Abuja" },
    { question: "What is the largest country in Africa?", answer: "Algeria" },
    { question: "What is the currency of Nigeria?", answer: "Naira" },
    { question: "How many states are in Nigeria?", answer: "36" },
    { question: "What year did Nigeria gain independence?", answer: "1960" },
    { question: "Who was Nigeria's first president?", answer: "Nnamdi Azikiwe" },
    { question: "What is the longest river in Nigeria?", answer: "River Niger" },
    { question: "Which country is the most populated in Africa?", answer: "Nigeria" },
    { question: "What is the official language of Nigeria?", answer: "English" },
    // VIP Knowledge
    { question: "What is the cost of Rox 1?", answer: "300" },
    { question: "What is the daily earn for Rox 1?", answer: "30" },
    { question: "What is the cost of Rox 3?", answer: "1000" },
    { question: "What is the daily earn for Rox 2?", answer: "60" },
    { question: "What is the cost of Rox 5?", answer: "6000" },
    { question: "What is the daily earn for DC 01?", answer: "10000" },
    { question: "What is the cost of DC 100?", answer: "5000000" },
    { question: "What is the withdraw fee for Rox 1?", answer: "5" },
    { question: "What level gives ₦2000 daily?", answer: "Rox 10" },
    { question: "How much is Rox 14 registration?", answer: "200000" },
];

// ===== QUIZ STATE =====
let currentQuestion = null;
let questionAttempts = 0;

// ===== CHECK LOGIN =====
function checkLogin() {
    const userId = getUserId();
    if (!userId) {
        redirectTo('login.html');
        return false;
    }
    return true;
}

// ===== LOGIN =====
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

// ===== REGISTER =====
async function registerUser() {
    const fullName = document.getElementById('regFullName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const phone = document.getElementById('regPhone').value.trim();
    const userId = document.getElementById('regUserId').value.trim();
    if (!fullName || !email || !phone || !userId) {
        alert('Please fill all fields');
        return;
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
        isAdmin: false
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

// ===== LOAD A RANDOM QUESTION =====
function loadQuestion() {
    if (questions.length === 0) {
        document.getElementById('questionText').textContent = "No questions available!";
        return;
    }
    const randomIndex = Math.floor(Math.random() * questions.length);
    currentQuestion = questions[randomIndex];
    document.getElementById('questionText').textContent = currentQuestion.question;
    document.getElementById('answerInput').value = '';
    document.getElementById('answerMessage').textContent = '';
    document.getElementById('answerMessage').style.color = '#aaa';
    questionAttempts = 0;
}

// ===== CHECK ANSWER =====
async function checkAnswer() {
    const userId = getUserId();
    if (!userId) { redirectTo('login.html'); return; }
    
    const user = await getCurrentUser(userId);
    if (!user || user.currentLevel === 'Rox 0') {
        document.getElementById('answerMessage').textContent = '⚠️ You need a VIP level to earn!';
        document.getElementById('answerMessage').style.color = '#ff6b6b';
        return;
    }
    
    const userAnswer = document.getElementById('answerInput').value.trim();
    if (!userAnswer) {
        document.getElementById('answerMessage').textContent = '❌ Please type your answer!';
        document.getElementById('answerMessage').style.color = '#ff6b6b';
        return;
    }
    
    const isCorrect = userAnswer.toLowerCase() === currentQuestion.answer.toLowerCase();
    
    if (isCorrect) {
        document.getElementById('answerMessage').textContent = '✅ Correct! 🎉 Task completed!';
        document.getElementById('answerMessage').style.color = '#4CAF50';
        await completeTask();
        setTimeout(() => {
            loadQuestion();
            loadUserData();
        }, 1500);
    } else {
        questionAttempts++;
        const remaining = 3 - questionAttempts;
        document.getElementById('answerMessage').textContent = `❌ Wrong answer. ${remaining} attempt(s) left.`;
        document.getElementById('answerMessage').style.color = '#ff6b6b';
        if (questionAttempts >= 3) {
            document.getElementById('answerMessage').textContent = '❌ All attempts used! New question...';
            document.getElementById('answerMessage').style.color = '#ffd700';
            setTimeout(() => {
                loadQuestion();
            }, 2000);
        }
    }
}

// ===== GET CURRENT USER =====
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

// ===== LOAD USER DATA =====
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
        }
        const canEarn = user.currentLevel !== 'Rox 0';
        
        // Update UI
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
        
        // Quiz section
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
        
        // Earnings
        document.querySelectorAll('#dailyEarn').forEach(el => {
            if (el) el.textContent = canEarn ? `₦${level.dailyEarn || 0}` : '₦0';
        });
        document.querySelectorAll('#weeklyEarn').forEach(el => {
            if (el) el.textContent = canEarn ? `₦${level.weeklyEarn || 0}` : '₦0';
        });
        document.querySelectorAll('#monthlyEarn').forEach(el => {
            if (el) el.textContent = canEarn ? `₦${level.monthlyEarn || 0}` : '₦0';
        });
        
        // Withdraw
        document.querySelectorAll('#withdrawFee').forEach(el => {
            if (el) el.textContent = `${level.withdrawFee || 0}%`;
        });
        document.querySelectorAll('#lockDays').forEach(el => {
            if (el) el.textContent = `${level.lockDays || 0} days`;
        });
        document.querySelectorAll('#withdrawDay').forEach(el => {
            if (el) el.textContent = level.withdrawDay || 'Monday';
        });
        
        // Profile
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
        
        await loadEarningsBreakdown(userId);
    } catch (error) {
        console.error('Error loading user data:', error);
    }
}

// ===== LOAD EARNINGS BREAKDOWN =====
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
        const thisMonth = getThisMonth();
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

// ===== LOAD VIP LEVELS =====
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

// ===== APPLY FOR VIP LEVEL =====
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
        openWhatsApp();
    }
}

// ===== SUBMIT DEPOSIT REQUEST =====
async function submitDepositRequest() {
    const userId = getUserId();
    if (!userId) { redirectTo('login.html'); return; }
    const amount = parseInt(document.getElementById('depositAmount').value);
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
                amount: amount,
                levelRequested: level,
                status: 'Pending',
                requestDate: getToday()
            })
        });
        if (response.ok) {
            document.getElementById('depositMessage').textContent = '✅ Deposit request submitted! Contact admin on WhatsApp.';
            document.getElementById('depositMessage').style.color = '#4CAF50';
        } else {
            document.getElementById('depositMessage').textContent = '❌ Failed to submit request';
            document.getElementById('depositMessage').style.color = '#ff6b6b';
        }
    } catch (error) {
        document.getElementById('depositMessage').textContent = '❌ Network error';
        document.getElementById('depositMessage').style.color = '#ff6b6b';
    }
}

// ===== COMPLETE TASK (FIXED - Adds Money!) =====
async function completeTask() {
    const userId = getUserId();
    if (!userId) { redirectTo('login.html'); return; }
    
    try {
        // Get user
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
        
        // Check level
        if (user.currentLevel === 'Rox 0') {
            document.getElementById('answerMessage').textContent = '⚠️ Deposit to unlock earning!';
            document.getElementById('answerMessage').style.color = '#ff6b6b';
            return;
        }
        
        // Get level details
        const levelResponse = await fetch(`${SUPABASE_URL}/rest/v1/VIP_Levels?levelName=eq.${user.currentLevel}`, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            }
        });
        const levels = await levelResponse.json();
        const level = levels[0];
        const dailyTasksRequired = level ? (level.dailyTasksRequired || 0) : 0;
        const dailyEarn = level ? (level.dailyEarn || 0) : 0;
        
        // Today
        const today = getToday();
        let tasksCompleted = user.tasksCompletedToday || 0;
        if (user.lastTaskDate !== today) {
            tasksCompleted = 0;
        }
        
        // Already all done?
        if (tasksCompleted >= dailyTasksRequired) {
            document.getElementById('answerMessage').textContent = '✅ Already completed all tasks today!';
            document.getElementById('answerMessage').style.color = '#ffd700';
            return;
        }
        
        // Increment
        tasksCompleted += 1;
        
        // Update tasks count
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
        
        // If all tasks done => ADD MONEY!
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
            
            document.getElementById('answerMessage').textContent = `🎉 Earned ₦${dailyEarn}! All tasks done!`;
            document.getElementById('answerMessage').style.color = '#4CAF50';
            loadUserData();
        } else {
            document.getElementById('answerMessage').textContent = `✅ Task ${tasksCompleted}/${dailyTasksRequired} done! Keep going!`;
            document.getElementById('answerMessage').style.color = '#4CAF50';
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('answerMessage').textContent = '❌ Network error: ' + error.message;
        document.getElementById('answerMessage').style.color = '#ff6b6b';
    }
}

// ===== REQUEST WITHDRAWAL =====
async function requestWithdrawal() {
    const userId = getUserId();
    if (!userId) { redirectTo('login.html'); return; }
    const bank = document.getElementById('withdrawBank').value.trim();
    const account = document.getElementById('withdrawAccount').value.trim();
    const accountName = document.getElementById('withdrawAccountName').value.trim();
    const amount = parseFloat(document.getElementById('withdrawAmount').value);
    if (!bank || !account || !accountName || !amount || amount <= 0) {
        document.getElementById('withdrawMessage').textContent = '❌ Please fill all fields';
        document.getElementById('withdrawMessage').style.color = '#ff6b6b';
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
            document.getElementById('withdrawMessage').textContent = '❌ Insufficient balance';
            document.getElementById('withdrawMessage').style.color = '#ff6b6b';
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
        document.getElementById('withdrawMessage').textContent = `✅ Withdrawal requested! Net after ${level.withdrawFee}% fee: ₦${netAmount.toFixed(2)}`;
        document.getElementById('withdrawMessage').style.color = '#4CAF50';
        loadUserData();
    } catch (error) {
        document.getElementById('withdrawMessage').textContent = '❌ Network error';
        document.getElementById('withdrawMessage').style.color = '#ff6b6b';
    }
    if (btn) {
        btn.disabled = false;
        btn.textContent = '💸 Request Withdrawal';
    }
}

// ===== LOGOUT =====
function logoutUser() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('userId');
        redirectTo('login.html');
    }
}

// ===== PAGE LOAD HANDLER =====
document.addEventListener('DOMContentLoaded', function() {
    const page = window.location.pathname.split('/').pop();
    const protectedPages = ['index.html', 'tasks.html', 'vip.html', 'profile.html', 'withdraw.html', 'deposit.html'];
    if (protectedPages.includes(page)) {
        if (!checkLogin()) return;
        loadUserData();
        if (page === 'vip.html') loadVIPLevels();
    }
    if (page === 'login.html' && getUserId()) {
        redirectTo('index.html');
    }
});
