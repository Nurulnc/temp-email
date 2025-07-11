let token = "";
let account = null;
let lang = "en";

async function generateAccount() {
  try {
    const domainRes = await fetch("https://api.mail.tm/domains");
    const domainData = await domainRes.json();
    const domain = domainData["hydra:member"][0].domain;
    const random = Math.random().toString(36).substring(2, 10);
    const email = `${random}@${domain}`;
    const password = "Temp123456!";

    await fetch("https://api.mail.tm/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address: email, password })
    });

    const tokenRes = await fetch("https://api.mail.tm/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address: email, password })
    });

    const tokenData = await tokenRes.json();
    token = tokenData.token;
    account = { email, password };

    document.getElementById("email").innerHTML = `📧 Email: <b>${email}</b>`;
    document.getElementById("otp").innerText = lang === "bn" ? "🔐 ওটিপির জন্য অপেক্ষা করুন..." : "🔐 Waiting for OTP...";
    document.getElementById("copyBtn").style.display = "none";
    checkInbox();
  } catch (err) {
    document.getElementById("email").innerText = "❌ Failed to load email";
    console.error(err);
  }
}

async function checkInbox() {
  if (!token) return;
  try {
    const res = await fetch("https://api.mail.tm/messages", {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();

    if (data["hydra:member"].length > 0) {
      const message = data["hydra:member"][0];
      const messageRes = await fetch(`https://api.mail.tm/messages/${message.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const fullMessage = await messageRes.json();
      const otpMatch = fullMessage.text.match(/\d{4,8}/);
      if (otpMatch) {
        const otp = otpMatch[0];
        document.getElementById("otp").innerHTML = `✅ OTP: <b>${otp}</b>`;
        document.getElementById("copyBtn").style.display = "inline-block";
        document.getElementById("copyBtn").setAttribute("data-otp", otp);
        document.getElementById("otpSound").play();
      }
    }
  } catch (err) {
    document.getElementById("otp").innerText = "❌ Failed to load OTP.";
    console.error(err);
  }
}

function copyOTP() {
  const otp = document.getElementById("copyBtn").getAttribute("data-otp");
  if (!otp) return;
  navigator.clipboard.writeText(otp).then(() => {
    const btn = document.getElementById("copyBtn");
    btn.innerText = "✅ Copied!";
    setTimeout(() => { btn.innerText = "📋 Copy OTP"; }, 2000);
  });
}

function toggleLanguage() {
  lang = lang === "en" ? "bn" : "en";
  document.getElementById("langBtn").innerText = lang === "en" ? "🌐 বাংলা" : "🌐 English";
  document.getElementById("title").innerText = lang === "en" ? "📨 OTP Email Reader" : "📨 ওটিপি ইমেইল রিডার";
  document.getElementById("randomBtn").innerText = lang === "en" ? "🔁 New Email" : "🔁 নতুন ইমেইল";
  document.getElementById("refreshBtn").innerText = lang === "en" ? "🔄 Refresh Inbox" : "🔄 ইনবক্স রিফ্রেশ";
  document.getElementById("otp").innerText = lang === "en" ? "🔐 Waiting for OTP..." : "🔐 ওটিপির জন্য অপেক্ষা করুন...";
}

function toggleTheme() {
  document.body.classList.toggle("dark");
  const btn = document.getElementById("themeToggle");
  btn.innerText = document.body.classList.contains("dark") ? "☀️ Light Mode" : "🌙 Dark Mode";
}

window.onload = generateAccount;
setInterval(checkInbox, 5000);
