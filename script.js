let email = '';
let emailId = '';
let domain = '';
let otp = '';

async function generateEmail() {
  try {
    const res = await fetch('https://api.tempmail.lol/domains');
    const domains = await res.json();
    domain = domains[0]; // Pick first available domain
    const user = Math.random().toString(36).substring(2, 10);
    email = `${user}@${domain}`;
    document.getElementById('email').innerHTML = `📧 Email: <b>${email}</b>`;
    document.getElementById('otp').innerText = '🔐 Waiting for OTP...';
    document.getElementById('copyBtn').style.display = 'none';
    emailId = btoa(email); // Base64 encode email for API
  } catch (err) {
    document.getElementById('email').innerText = '❌ Failed to generate email';
    console.error(err);
  }
}

async function fetchInbox() {
  if (!emailId) return;
  try {
    const res = await fetch(`https://api.tempmail.lol/mail/${emailId}`);
    const inbox = await res.json();

    if (inbox && inbox.length > 0) {
      const latest = inbox[0];
      const body = latest.text || latest.html || '';
      const otpMatch = body.match(/\d{4,8}/);
      if (otpMatch) {
        otp = otpMatch[0];
        document.getElementById('otp').innerHTML = `✅ OTP: <b>${otp}</b>`;
        document.getElementById('copyBtn').style.display = 'inline-block';
        document.getElementById('copyBtn').setAttribute('data-otp', otp);
        document.getElementById('otpSound').play();
      } else {
        document.getElementById('otp').innerText = '❌ OTP not found.';
        document.getElementById('copyBtn').style.display = 'none';
      }
    } else {
      document.getElementById('otp').innerText = '🔐 Waiting for OTP...';
    }
  } catch (err) {
    document.getElementById('otp').innerText = '❌ Failed to load inbox.';
    console.error(err);
  }
}

function copyOTP() {
  const val = document.getElementById('copyBtn').getAttribute('data-otp');
  if (!val) return;
  navigator.clipboard.writeText(val).then(() => {
    const btn = document.getElementById('copyBtn');
    btn.innerText = '✅ Copied!';
    setTimeout(() => (btn.innerText = '📋 Copy OTP'), 2000);
  });
}

window.onload = generateEmail;
