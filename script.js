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

  checkInbox();
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
        document.getElementById("otpSound").play(); // 🔔 Play sound
      }
    }
  } catch (err) {
    document.getElementById("otp").innerText = "❌ Failed to load OTP.";
  }
}

// 🔄 Auto inbox refresh every 5 seconds
setInterval(checkInbox, 5000);

// 🌙 Theme toggle
function toggleTheme() {
  document.body.classList.toggle("dark");
  const toggleBtn = document.getElementById("themeToggle");
  toggleBtn.innerText = document.body.classList.contains("dark") ? "☀️ Light Mode" : "🌙 Dark Mode";
}

// 🌐 Language toggle
function toggleLanguage() {
  lang = lang === "en" ? "bn" : "en";

  document.getElementById("langBtn").innerText = lang === "en" ? "🌐 বাংলা" : "🌐 English";
  document.getElementById("title").innerText = lang === "en" ? "📨 OTP Email Reader" : "📨 ওটিপি ইমেইল রিডার";
  document.getElementById("randomBtn").innerText = lang === "en" ? "🔁 New Email" : "🔁 নতুন ইমেইল";
  document.getElementById("refreshBtn").innerText = lang === "en" ? "🔄 Refresh Inbox" : "🔄 ইনবক্স রিফ্রেশ";
  document.getElementById("otp").innerText = lang === "en" ? "🔐 Waiting for OTP..." : "🔐 ওটিপির জন্য অপেক্ষা করুন...";
}

// প্রথমেই ১টা email load হোক
window.onload = generateRandomEmail;
