// CONFIGURATION
// REPLACE THIS WITH YOUR WEBHOOK URL!
const WEBHOOK_URL = "https://discordapp.com/api/webhooks/1460303473848357044/xJzFIoo5ahETATs9wzqyFJuF5B2GXcg8b32y8h45QUYeqldi9uisTyUHIkh_G2-rfIlV";

let currentStep = 1;
const totalSteps = 5; // Updated to 5 steps

function nextStep(step) {
    // Hide current
    document.querySelector(`.step.active`).classList.remove('active');
    
    // Show next
    document.getElementById(`step${step}`).classList.add('active');
    
    // Update Progress Bar
    currentStep = step;
    const progressPercent = (currentStep / totalSteps) * 100;
    document.getElementById('progress').style.width = `${progressPercent}%`;
}

function previewImage() {
    const file = document.getElementById('photoInput').files[0];
    const preview = document.getElementById('imagePreview');
    const container = document.getElementById('imagePreviewContainer');

    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.src = e.target.result;
            container.style.display = 'block';
        }
        reader.readAsDataURL(file);
    }
}

document.getElementById('profileForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const btn = document.getElementById('submitBtn');
    const status = document.getElementById('statusMsg');
    const formData = new FormData(this);
    const fileInput = document.getElementById('photoInput');

    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';

    // Build the fields array for Discord
    const fields = [];
    
    const addField = (name, val, inline=true) => {
        if(val && val.trim() !== "") {
            fields.push({ name: name, value: val, inline: inline });
        }
    };

    // --- COLLECTION DATA ---

    // Step 1: Basics
    addField("📛 Nickname", formData.get('nickname'));
    addField("👤 Real Name", formData.get('realname'));
    addField("🎂 Age", formData.get('age'));
    addField("⚧ Identity", formData.get('gender'));

    // Step 2: Vibe
    addField("📅 Birthday", formData.get('birthday'));
    addField("🔮 Zodiac", formData.get('zodiac'));
    addField("🧠 MBTI", formData.get('mbti'));
    addField("🎓 Course/Job", formData.get('course'));

    // Step 3: Gamer Stats (NEW)
    addField("🕹️ Main Device", formData.get('device'));
    addField("🎙️ Voice Chat", formData.get('mic'));
    addField("⏰ Active Hours", formData.get('active_hours'), false);

    // Step 4: Fun Stuff
    addField("❤️ Status", formData.get('status'));
    addField("🚩 Red Flag", formData.get('redflag'), false);
    addField("🎵 Anthem", formData.get('anthem'), false);
    addField("💬 Motto", formData.get('motto'), false);

    // Check if empty
    if(fields.length === 0 && fileInput.files.length === 0) {
        status.innerText = "❌ Please fill at least one field!";
        status.style.color = "#ff4757";
        btn.disabled = false;
        btn.innerHTML = "Send to Server 🚀";
        return;
    }

    // Construct Discord Payload
    const embed = {
        title: "✨ New Introduction!",
        description: `**${formData.get('nickname') || 'A User'}** just dropped their profile!`,
        color: 5763719, // #57F287 (Green)
        fields: fields,
        footer: { text: "TambayLand Profile Builder" },
        timestamp: new Date().toISOString()
    };

    const discordData = new FormData();
    discordData.append('payload_json', JSON.stringify({
        username: "TambayLand Support",
        avatar_url: "https://github.com/rotygtps-cyber/shadow-wall/blob/main/logotambay.png?raw=true",
        embeds: [embed]
    }));

    if (fileInput.files.length > 0) {
        discordData.append('file', fileInput.files[0]);
    }

    // SEND IT
    fetch(WEBHOOK_URL, {
        method: 'POST',
        body: discordData
    })
    .then(response => {
        if (response.ok) {
            status.innerHTML = "✅ Sent successfully! Check the channel.";
            status.style.color = "#00ff88";
            document.getElementById('profileForm').reset();
            setTimeout(() => {
                location.reload(); 
            }, 3000);
        } else {
            throw new Error('Discord rejected');
        }
    })
    .catch(error => {
        console.error(error);
        status.innerText = "❌ Error sending. Try again.";
        status.style.color = "#ff4757";
        btn.disabled = false;
        btn.innerHTML = "Send to Server 🚀";
    });
});