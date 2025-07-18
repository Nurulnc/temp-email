// app.js
let currentEmail = "";

async function generateNewEmail() {
    // 1secMail API ব্যবহার করে র‍্যান্ডম ইমেইল জেনারেট করা
    const response = await fetch('https://www.1secmail.com/api/v1/?action=genRandomMailbox&count=1');
    const emails = await response.json();
    currentEmail = emails[0];
    document.getElementById('email-address').textContent = currentEmail;
    document.getElementById('email-count').textContent = '(0)';
    document.getElementById('messages').innerHTML = '';
    alert(`নতুন ইমেইল তৈরি হয়েছে: ${currentEmail}`);
}

async function checkInbox() {
    if (!currentEmail) {
        alert("প্রথমে একটি ইমেইল তৈরি করুন");
        return;
    }

    const [username, domain] = currentEmail.split('@');
    const response = await fetch(`https://www.1secmail.com/api/v1/?action=getMessages&login=${username}&domain=${domain}`);
    const messages = await response.json();
    
    document.getElementById('email-count').textContent = `(${messages.length})`;
    
    const messagesDiv = document.getElementById('messages');
    messagesDiv.innerHTML = '';
    
    if (messages.length === 0) {
        messagesDiv.innerHTML = '<p>কোন নতুন মেইল নেই</p>';
        return;
    }

    messages.forEach(msg => {
        const messageElement = document.createElement('div');
        messageElement.innerHTML = `
            <div style="border-bottom: 1px solid #eee; padding: 10px 0;">
                <strong>প্রেরক:</strong> ${msg.from}<br>
                <strong>বিষয়:</strong> ${msg.subject}<br>
                <button onclick="viewMessage(${msg.id})">মেসেজ দেখুন</button>
            </div>
        `;
        messagesDiv.appendChild(messageElement);
    });
}

async function viewMessage(id) {
    const [username, domain] = currentEmail.split('@');
    const response = await fetch(`https://www.1secmail.com/api/v1/?action=readMessage&login=${username}&domain=${domain}&id=${id}`);
    const message = await response.json();
    
    alert(`বিষয়: ${message.subject}\n\nমেসেজ:\n${message.textBody || message.htmlBody}`);
}

// পেজ লোড হলে স্বয়ংক্রিয়ভাবে একটি ইমেইল তৈরি করুন
window.onload = generateNewEmail;
