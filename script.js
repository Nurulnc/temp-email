let email = "";
let domain = "";
let login = "";

const baseUrl = "https://www.1secmail.com/api/v1/";

const banglaNames = ["nahid", "rifat", "sabbir", "tahsin", "rafi", "robin", "emran", "ratul", "imran", "jubayer", "sohan", "rashed", "farhan", "nafis", "hridoy", "tamim", "tanjim", "hossain", "shahin", "sajid", "sumona", "mim", "rima", "jannat", "tania", "shanta", "sadia", "faria", "mahi", "brishti"];
const englishWords = ["wave", "cloud", "star", "light", "dream", "rain", "sky", "fire", "moon", "code", "wind", "stone", "sun", "leaf", "river", "dust", "path", "storm", "snow", "spark"];
const allowedDomains = ["wwjmp.com", "xojxe.com", "yoggm.com"];

let login = "", domain = "", email = "", lang = "en";

function generateRandomEmail() {
  const name = banglaNames[Math.floor(Math.random() * banglaNames.length)];
  const word = englishWords[Math.floor(Math.random() * englishWords.length)];
  const number = Math.floor(Math.random() * 100);
  const localPart = name + word + number;
  const randomDomain = allowedDomains[Math.floor(Math.random() * allowedDomains.length)];

  login = localPart;
  domain = randomDomain;
  email = `${login}@${domain}`;
  
  document.getElementById("email").innerHTML = `📧 Email: <b>${email}</b>`;
  document.getElementById("otp").innerText = lang === "bn" ? "🔐 ওটিপির জন্য অপেক্ষা করুন..." : "🔐 Waiting for OTP...";
}

async function checkInbox() {
  if (!login || !domain) return;

  try {
    const res = await fetch(`https://www.1secmail.com/api/v1/?action=getMessages&login=${login}&domain=${domain}`);
    const data = await res.json();

    if (data.length > 0) {
      const id = data[0].id;
      const msgRes = await fetch(`https://www.1secmail.com/api/v1/?action=readMessage&login=${login}&domain=${domain}&id=${id}`);
      const msg = await msgRes.json();

      const otpMatch = msg.body.match(/\d{4,8}/);
      if (otpMatch) {
        document.getElementById("otp").innerHTML = `✅ OTP: <b>${otpMatch[0]}</b>`;

        // 🔊 Play sound
        document.getElementById("otpSound").play();
      }
    }
  } catch (err) {
    document.getElementById("otp").innerText = "❌ Failed to load OTP.";
  }
}

// 🔄 Auto inbox check every 5 seconds
setInterval(checkInbox, 5000);

// 🌙 Theme toggle
function toggleTheme() {
  document.body.classList.toggle("dark");
  const toggleBtn = document.getElementById("themeToggle");
  toggleBtn.innerText = document.body.classList.contains("dark") ? "☀️ Light Mode" : "🌙 Dark Mode";
}

// 🌐 Language Switch (EN ⇄ BN)
function toggleLanguage() {
  lang = lang === "en" ? "bn" : "en";

  document.getElementById("langBtn").innerText = lang === "en" ? "🌐 বাংলা" : "🌐 English";
  document.getElementById("title").innerText = lang === "en" ? "📨 OTP Email Reader" : "📨 ওটিপি ইমেইল রিডার";
  document.getElementById("randomBtn").innerText = lang === "en" ? "🔁 New Email" : "🔁 নতুন ইমেইল";
  document.getElementById("refreshBtn").innerText = lang === "en" ? "🔄 Refresh Inbox" : "🔄 ইনবক্স রিফ্রেশ";

  document.getElementById("otp").innerText = lang === "en" ? "🔐 Waiting for OTP..." : "🔐 ওটিপির জন্য অপেক্ষা করুন...";
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

function checkEnter(e) {
  if (e.key === "Enter") {
    generateCustomEmail();
  }
}
