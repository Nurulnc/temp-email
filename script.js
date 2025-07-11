const baseUrl = "https://api.mail.tm";
let token = "";
let email = "";
let password = "Test123456";
let currentInterval = null;

async function getDomain() {
  const res = await fetch(`${baseUrl}/domains`);
  const data = await res.json();
  const domains = data["hydra:member"];
  if (!domains || domains.length === 0) throw new Error("No domains found");
  return domains[0].domain;
}

async function createAccount(name = null) {
  try {
    const domain = await getDomain();
    const localPart = name ? name : `user${Date.now()}`;
    email = `${localPart}@${domain}`;

    const res = await fetch(`${baseUrl}/accounts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address: email, password })
    });

    const text = await res.text();
    let data = {};
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error("Invalid response from server (not JSON)");
    }

    if (res.ok) {
      document.getElementById("email").innerHTML = `📧 Email: <b>${email}</b>`;
      return await login();
    } else {
      throw new Error(data["hydra:description"] || JSON.stringify(data));
    }
  } catch (err) {
    document.getElementById("email").innerText = `❌ Failed: ${err.message}`;
    console.error("Create account error:", err);
  }
}

async function login() {
  try {
    const res = await fetch(`${baseUrl}/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address: email, password })
    });

    const data = await res.json();
    if (data.token) {
      token = data.token;
      startInboxChecking();
      return true;
    } else {
      throw new Error("Login failed");
    }
  } catch (err) {
    document.getElementById("otp").innerText = `❌ Login error: ${err.message}`;
    console.error("Login error:", err);
    return false;
  }
}

function startInboxChecking() {
  if (currentInterval) clearInterval(currentInterval);
  currentInterval = setInterval(checkEmails, 7000);
  document.getElementById("otp").innerText = "🔐 Waiting for OTP...";
}

async function checkEmails() {
  try {
    const res = await fetch(`${baseUrl}/messages`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (data["hydra:member"].length > 0) {
      const msgId = data["hydra:member"][0].id;
      const msg = await (await fetch(`${baseUrl}/messages/${msgId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })).json();

      const otpMatch = msg.text?.match(/\b\d{4,8}\b/);
      document.getElementById("otp").innerHTML = otpMatch
        ? `🔐 OTP Found
