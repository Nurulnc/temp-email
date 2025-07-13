// Mailinator API configuration
const API_KEY = 'YOUR_MAILINATOR_API_KEY'; // Get from https://www.mailinator.com/
const DOMAIN = 'mailinator.com';

// Generate a random email address
function generateEmail() {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let username = '';
    for (let i = 0; i < 12; i++) {
        username += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const email = `${username}@${DOMAIN}`;
    document.getElementById('temp-email').value = email;
    fetchEmails();
}

// Copy email to clipboard
function copyEmail() {
    const email = document.getElementById('temp-email');
    email.select();
    document.execCommand('copy');
    
    // Show copied notification
    const originalText = event.target.innerHTML;
    event.target.innerHTML = '<i class="fas fa-check"></i> Copied!';
    setTimeout(() => {
        event.target.innerHTML = originalText;
    }, 2000);
}

// Fetch emails from Mailinator API
async function fetchEmails() {
    const email = document.getElementById('temp-email').value;
    const inbox = email.split('@')[0];
    
    if (!inbox) {
        alert('Please generate an email first');
        return;
    }

    try {
        const response = await fetch(`https://api.mailinator.com/v2/domains/${DOMAIN}/inboxes/${inbox}`, {
            headers: {
                'Authorization': API_KEY
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch emails');
        }
        
        const data = await response.json();
        displayEmails(data.msgs);
        updateLastUpdated();
    } catch (error) {
        console.error('Error fetching emails:', error);
        document.getElementById('emails').innerHTML = '<div class="error">Failed to load emails. Please try again.</div>';
    }
}

// Display emails in the inbox
function displayEmails(emails) {
    const emailsContainer = document.getElementById('emails');
    
    if (!emails || emails.length === 0) {
        emailsContainer.innerHTML = '<div class="no-emails">No emails found in this inbox.</div>';
        return;
    }
    
    // Sort emails by date (newest first)
    emails.sort((a, b) => new Date(b.time) - new Date(a.time));
    
    let html = '';
    emails.forEach(email => {
        const date = new Date(email.time).toLocaleString();
        const isUnread = !email.read;
        
        html += `
            <div class="email-item ${isUnread ? 'unread' : ''}" onclick="viewEmail('${email.id}')">
                <div class="email-sender">${email.from}</div>
                <div class="email-subject" title="${email.subject}">${email.subject || '(No subject)'}</div>
                <div class="email-date">${date}</div>
            </div>
        `;
    });
    
    emailsContainer.innerHTML = html;
}

// View a specific email
async function viewEmail(emailId) {
    const email = document.getElementById('temp-email').value;
    const inbox = email.split('@')[0];
    
    try {
        const response = await fetch(`https://api.mailinator.com/v2/domains/${DOMAIN}/inboxes/${inbox}/messages/${emailId}`, {
            headers: {
                'Authorization': API_KEY
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch email');
        }
        
        const data = await response.json();
        displayEmail(data);
    } catch (error) {
        console.error('Error fetching email:', error);
        alert('Failed to load email. Please try again.');
    }
}

// Display the selected email
function displayEmail(email) {
    document.getElementById('email-subject').textContent = email.subject || '(No subject)';
    document.getElementById('email-from').textContent = email.from;
    document.getElementById('email-to').textContent = email.to;
    document.getElementById('email-date').textContent = new Date(email.time).toLocaleString();
    
    // Display email body (prefer HTML if available, otherwise text)
    const emailBody = document.getElementById('email-body');
    if (email.parts && email.parts.length > 0) {
        if (email.parts[0].body) {
            emailBody.innerHTML = email.parts[0].body;
        } else {
            emailBody.textContent = 'No message content available.';
        }
    } else {
        emailBody.textContent = 'No message content available.';
    }
    
    // Show the email viewer
    document.getElementById('email-viewer').style.display = 'block';
    
    // Scroll to the email viewer
    document.getElementById('email-viewer').scrollIntoView({ behavior: 'smooth' });
}

// Close the email viewer
function closeEmail() {
    document.getElementById('email-viewer').style.display = 'none';
}

// Update the last updated time
function updateLastUpdated() {
    const now = new Date();
    document.getElementById('last-updated').textContent = `Last updated: ${now.toLocaleTimeString()}`;
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    generateEmail();
    
    // Auto-refresh every 30 seconds
    setInterval(fetchEmails, 30000);
});
