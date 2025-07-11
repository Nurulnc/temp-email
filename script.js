const baseUrl = "https://api.mail.tm";
let token = "";
let email = "";
let password = "Test123456";

// 1. Fetch available domain
async function getDomain() {
  const res = await fetch(`${baseUrl}/domains`);
  const data = await res.json();
  const domains = data["hydra:member"];
  if (!domains || domains.length === 0) throw new Error("No domains available");
  return domains[0].domain;
}

// 2. Create account
async function createAccount() {
  try {
    const domain = await getDomain();
    email = `user${Date.now()}@${domain}`;
    const res = await fetch(`${baseUrl}/accounts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address: email, password })
    });
    const data = await res.json();
    if (res.ok) {
      document.getElementById("email").innerHTML = `📧 Temp Email: <b>${email}</b>`;
      return true;
    } else {
      throw new Error(data["hydra:description"] || JSON.stringify(data));
    }
  } catch (err) {
    document.getElementById("email").innerText = `❌ Create account failed: ${err.message}`;
    console.error("Create account error:", err);
    return false;
  }
}

// 3. Login
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
      return true;
    } else {
      throw new Error(JSON.stringify(data));
    }
  } catch (err) {
    document.getElementById("otp").innerText = `❌ Login failed: ${err.message}`;
    console.error("Login error:", err);
    return false;
  }
}

// 4. Check messages
async function checkEmails() {
  if (!token) return;
  try {
    const res = await fetch(`${baseUrl}/messages`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    if (data["hydra:member"].length) {
      const msgId = data["hydra:member"][0].id;
      const msg = await (await fetch(`${baseUrl}/messages/${msgId}`, { headers: { Authorization: `Bearer ${token}` } })).json();
      const otpMatch = msg.text?.match(/\b\d{4,8}\b/);
      document.getElementById("otp").innerHTML = otpMatch ? `🔐 OTP: <b>${otpMatch[0]}</b>` : `📭 Mail arrived, OTP not found.`;
    } else {
      document.getElementById("otp").innerText = "📭 No emails yet.";
    }
  } catch (err) {
    console.error("Check emails error:", err);
  }
}

// 5. Main flow
(async () => {
  const created = await createAccount();
  if (!created) return;

  const loggedIn = await login();
  if (!loggedIn) return;

  setInterval(checkEmails, 7000);
})();
