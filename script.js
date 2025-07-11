const baseUrl = "https://api.mail.tm";
let token = "";
let email = "";
let password = "Test123456";

async function createAccount() {
  const res = await fetch(`${baseUrl}/accounts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      address: `user${Date.now()}@mail.tm`,
      password,
    }),
  });

  const data = await res.json();
  if (data.address) {
    email = data.address;
    document.getElementById("email").innerHTML = `📧 Your Temp Email: <b>${email}</b>`;
  } else {
    document.getElementById("email").innerText = `❌ Account creation failed`;
    console.error(data);
  }
}

async function login() {
  const res = await fetch(`${baseUrl}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address: email, password }),
  });

  const data = await res.json();
  if (data.token) {
    token = data.token;
  } else {
    console.error("Login failed", data);
    document.getElementById("otp").innerText = "❌ Login failed";
  }
}

async function checkEmails() {
  if (!token) return;

  const res = await fetch(`${baseUrl}/messages`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json();

  if (data["hydra:member"] && data["hydra:member"].length > 0) {
    const msgId = data["hydra:member"][0]["id"];
    const msgRes = await fetch(`${baseUrl}/messages/${msgId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const msg = await msgRes.json();

    const otp = msg.text ? msg.text.match(/\b\d{4,8}\b/) : null;

    document.getElementById("otp").innerHTML = otp
      ? `🔐 OTP Found: <b>${otp[0]}</b>`
      : `🔐 OTP Not found in the email.`;
  } else {
    document.getElementById("otp").innerText = "📭 No mails received yet.";
  }
}

(async () => {
  await createAccount();
  await login();
  setInterval(checkEmails, 5000);
})();
