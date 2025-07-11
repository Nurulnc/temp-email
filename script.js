let email = "";
let lang = "en";

async function generateEmail() {
  try {
    const res = await fetch("https://api.tempmail.lol/temp");
    const data = await res.json();
    email = data.address;
    document.getElementById("email").innerHTML = `📧 Email: <b>${email}</b>`;
    document.getElementById("otp").innerText = lang === "bn" ? "🔐 ওটিপির জন্য অপেক্ষা করুন..." : "🔐 Waiting for OTP...";
    document.getElementById("copyBtn").style.display = "none";
    checkInbox();
  } catch (err) {
    document.getElementById("email").innerText = "❌ Failed to load email";
  }
}

async function checkInbox() {
  if (!email) return;
  try {
    const res = await fetch(`https://api.tempmail.lol/mailbox/${email}`);
    const data = await res.json();

    if (data && data.length > 0) {
      const latest = data[0];
      const otpMatch = latest.text_body.match(/\d{4,8}/);
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
  }
}

function copyOTP() {
  const otp = document.getElementById("copyBtn").getAttribute("data-otp");
  if (!otp) return;
  navigator.clipboard.writeText(otp).then(() => {
    const btn = document.getElementById("copyBtn");
    btn.innerText = "✅ Copied!";
    setTimeout(() => {
      btn.innerText = "📋 Copy OTP";
    }, 2000);
  });
}

// Auto refresh inbox
setInterval(checkInbox, 5000);

// Language toggle
function toggleLanguage() {
  lang = lang === "en" ? "bn" : "en";
  document.getElementById("langBtn").innerText = lang === "en" ? "🌐 বাংলা" : "🌐 English";
  document.getElementById("title").innerText = lang === "en" ? "📨 OTP Email Reader" : "📨 ওটিপি ইমেইল রিডার";
  document.getElementById("randomBtn").innerText = lang === "en" ? "🔁 New Email" : "🔁 নতুন ইমেইল";
  document.getElementById("refreshBtn").innerText = lang === "en" ? "🔄 Refresh Inbox" : "🔄 ইনবক্স রিফ্রেশ";
  document.getElementById("otp").innerText = lang === "en" ? "🔐 Waiting for OTP..." : "🔐 ওটিপির জন্য অপেক্ষা করুন...";
}

// Dark mode toggle
function toggleTheme() {
  document.body.classList.toggle("dark");
  const btn = document.getElementById("themeToggle");
  btn.innerText = document.body.classList.contains("dark") ? "☀️ Light Mode" : "🌙 Dark Mode";
}

// Initial load
window.onload = generateEmail;
