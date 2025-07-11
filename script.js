let email = "";
let domain = "";
let login = "";

const baseUrl = "https://www.1secmail.com/api/v1/";

function generateRandomEmail() {
  const name = "user" + Math.floor(Math.random() * 100000);
  setupEmail(name);
}

function generateCustomEmail() {
  const name = document.getElementById("customName").value.trim();
  if (!name) {
    alert("Please enter a custom name.");
    return;
  }
  setupEmail(name);
}

function setupEmail(name) {
  domain = "1secmail.com";
  login = name;
  email = `${login}@${domain}`;
  document.getElementById("email").innerHTML = `📧 Email: <b>${email}</b>`;
  document.getElementById("otp").innerText = "🔐 Waiting for OTP...";
}

async function checkInbox() {
  if (!login || !domain) {
    alert("Please generate an email first.");
    return;
  }

  const url = `${baseUrl}?action=getMessages&login=${login}&domain=${domain}`;
  try {
    const res = await fetch(url);
    const messages = await res.json();

    if (messages.length === 0) {
      document.getElementById("otp").innerText = "📭 No emails yet.";
      return;
    }

    const latest = messages[0];
    const messageId = latest.id;

    const msgUrl = `${baseUrl}?action=readMessage&login=${login}&domain=${domain}&id=${messageId}`;
    const msgRes = await fetch(msgUrl);
    const msgData = await msgRes.json();

    const body = msgData.textBody || msgData.htmlBody || "";
    const otpMatch = body.match(/\b\d{4,8}\b/);

    if (otpMatch) {
      document.getElementById("otp").innerHTML = `🔐 OTP Found: <b>${otpMatch[0]}</b>`;
    } else {
      document.getElementById("otp").innerText = "📧 Email received, OTP not found.";
    }
  } catch (err) {
    document.getElementById("otp").innerText = `❌ Error: ${err.message}`;
    console.error(err);
  }
}

// Load random email on page load
generateRandomEmail();
