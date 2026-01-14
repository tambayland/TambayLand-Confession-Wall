// --- PASTE YOUR WEBHOOK URL HERE ---
const DISCORD_WEBHOOK_URL = 'YOUR_DISCORD_WEBHOOK_URL_HERE'; 
// -----------------------------------

let selectedHex = '#FF0055'; // Default

document.addEventListener('DOMContentLoaded', () => {
    setupColorPicker();
    loadHistory(); // Load your own previous posts
});

function setupColorPicker() {
    const buttons = document.querySelectorAll('.color-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedHex = btn.getAttribute('data-hex');
        });
    });
}

async function postNote() {
    const content = document.getElementById('noteInput').value;
    const tag = document.getElementById('tagInput').value;
    const btn = document.getElementById('postBtn');

    if (!content.trim()) return alert("Walang laman ang note mo!");

    btn.disabled = true;
    btn.innerText = "Sending...";

    // 1. CONFIG: Map Colors & Emojis
    // Discord requires Integer colors (Decimal)
    const colorMap = {
        '#FF0055': 16711765, // Pink
        '#00C9FF': 51695,    // Blue
        '#FDBB2D': 16628525, // Gold
        '#182848': 1584200,  // Midnight
        '#9D50BB': 10309819, // Purple (New)
        '#00F260': 62048,    // Green (New)
        '#FF512F': 16732463  // Orange (New)
    };

    const emojiMap = {
        "Chika": "🍵",
        "Confession": "🤫",
        "Love Letter": "💌",
        "Rant": "😤",
        "Meme": "🤡",
        "Shoutout": "📢", // New
        "Secret": "🔒",   // New
        "Advice": "🤝"    // New
    };

    const discordColor = colorMap[selectedHex] || 16711765;
    const emoji = emojiMap[tag] || "📝";

    // 2. PAYLOAD: Prepare data for Discord
    const payload = {
        username: "TambayLand Bot",
        avatar_url: "https://github.com/rotygtps-cyber/shadow-wall/blob/main/logotambay.png?raw=true",
        embeds: [{
            color: discordColor,
            author: { name: `${emoji}  ${tag.toUpperCase()}` },
            description: `### "${content}"`,
            footer: {
                text: "Sent via TambayLand Web",
                icon_url: "https://cdn-icons-png.flaticon.com/512/1077/1077035.png"
            },
            timestamp: new Date().toISOString()
        }]
    };

    try {
        // Send to Discord
        await fetch(DISCORD_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        // 3. SUCCESS: Save to Local History & UI
        saveToHistory({
            content,
            tag,
            color: selectedHex,
            timestamp: new Date().toISOString()
        });

        alert("Sent to Discord! Check the channel.");
        document.getElementById('noteInput').value = '';
        loadHistory(); // Refresh the list below

    } catch (err) {
        console.error(err);
        alert("Error sending message.");
    }

    btn.disabled = false;
    btn.innerHTML = 'Post sa Discord <i class="fa-brands fa-discord"></i>';
}

// --- LOCAL HISTORY FUNCTIONS ---

function saveToHistory(note) {
    // Get existing notes from browser memory
    let history = JSON.parse(localStorage.getItem('tambay_history')) || [];
    // Add new note to the front
    history.unshift(note);
    // Limit to last 20 posts to save space
    if(history.length > 20) history.pop();
    // Save back to memory
    localStorage.setItem('tambay_history', JSON.stringify(history));
}

function loadHistory() {
    const grid = document.getElementById('notesGrid');
    const history = JSON.parse(localStorage.getItem('tambay_history')) || [];

    grid.innerHTML = '';

    if (history.length === 0) {
        grid.innerHTML = '<p style="color:#555; width:100%; text-align:center;">You haven\'t posted anything yet.</p>';
        return;
    }

    history.forEach(note => {
        const card = document.createElement('div');
        card.className = 'note-card';
        // Apply the color background
        card.style.background = note.color;
        
        // Add a slight gradient effect if it's a solid color
        card.style.backgroundImage = 'linear-gradient(rgba(255,255,255,0.1), rgba(0,0,0,0.1))';

        const date = new Date(note.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        card.innerHTML = `
            <div class="note-header">
                <span><i class="fa-solid fa-tag"></i> ${note.tag}</span>
                <span>${date}</span>
            </div>
            <div class="note-content">${escapeHtml(note.content)}</div>
            <div class="note-footer">
                <span style="font-size: 0.8rem; opacity: 0.7;">
                    <i class="fa-solid fa-check-double"></i> Sent to Discord
                </span>
            </div>
        `;
        grid.appendChild(card);
    });
}

function escapeHtml(text) {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}