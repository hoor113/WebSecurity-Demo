const fs = require('fs');
const path = require('path');
const generateSecret = require('./generateSecretSession');

const setupEnv = () => {
    const envPath = path.join(__dirname, '../.env');
    const secretSession = generateSecret();

    let envContent = '';
    try {
        envContent = fs.readFileSync(envPath, 'utf8');
    } catch (error) {
        console.log(error)
    }

    if (envContent.includes('SECRET_SESSION=')) {
        envContent = envContent.replace(/SECRET_SESSION=.*/g, `SECRET_SESSION=${secretSession}`);
    } else {
        envContent += `\nSECRET_SESSION=${secretSession}`;
    }

    fs.writeFileSync(envPath, envContent);
    console.log('SECRET_SESSION has been updated in .env file');


    // const envPath1 = path.join(__dirname, '../.env');
    // const jwtSession = generateSecret();

    // let envContent1 = '';
    // try {
    //     envContent1 = fs.readFileSync(envPath1, 'utf8');
    // } catch (error) {
    //     console.log(error)
    // }

    // if (envContent1.includes('JWT_SECRET=')) {
    //     envContent1 = envContent1.replace(/JWT_SECRET=.*/g, `JWT_SECRET=${jwtSession}`);
    // } else {
    //     envContent1 += `\nJWT_SECRET=${jwtSession}`;
    // }

    // fs.writeFileSync(envPath1, envContent1);
    // console.log('JWT_SESSION has been updated in .env file');
};

module.exports = setupEnv;