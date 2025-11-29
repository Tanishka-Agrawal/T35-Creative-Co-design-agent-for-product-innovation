console.log("Hindi Voice Assistant Loaded ✔");

/* --------------------------------------------------------
    BASE SPEAK FUNCTION
-------------------------------------------------------- */

// Global speak function
/* --------------------------------------------------------
    BASE SPEAK FUNCTION — FIXED VERSION
-------------------------------------------------------- */
export function speak(text) {

    // Cancel any queued speech
    window.speechSynthesis.cancel();

    const speakNow = () => {
        const msg = new SpeechSynthesisUtterance(text);
        msg.lang = "hi-IN";
        msg.rate = 1;
        msg.pitch = 1;
        msg.volume = 1;

        if (!localStorage.getItem("voiceMuted")) {
            window.speechSynthesis.speak(msg);
        }
    };

    // If voices not loaded yet → wait for them
    if (speechSynthesis.getVoices().length === 0) {
        window.speechSynthesis.onvoiceschanged = speakNow;
    } else {
        speakNow();
    }
}


/* --------------------------------------------------------
    NAME-BASED SPEAKING
-------------------------------------------------------- */

export function speakName(name) {
    if (!name) return;
    speak(`${name} जी, कृपया आगे की जानकारी भरें।`);
}

export function speakLoginName(name) {
    if (!name) return;
    speak(`${name} जी, आपका ओ टी पी सत्यापित कर दिया गया है।`);
}

/* --------------------------------------------------------
    PAGE INSTRUCTIONS
-------------------------------------------------------- */

// LOGIN PAGE INSTRUCTION
export function loginPageVoice() {
    speak("कृपया अपना ईमेल दर्ज करें और ओ टी पी प्राप्त करने के लिए सेंड ओ टी पी बटन दबाएँ।");
}

// SIGNUP PAGE INSTRUCTION
export function signupPageVoice() {
    speak("कृपया अपनी जानकारी भरें। पूरा नाम, ईमेल, फोन नंबर, पता और एरिया दर्ज करें। फिर ओ टी पी भेजें।");
}

// AFTER OTP SENT
export function otpSentVoice() {
    speak("ओ टी पी भेज दिया गया है। कृपया अपना ईमेल चेक करें और ओ टी पी दर्ज करें।");
}

// AFTER OTP VERIFIED
export function otpVerifiedVoice() {
    speak("ओ टी पी सही है। पंजीकरण सफल हुआ।");
}

// HOME PAGE WELCOME
export function welcomeVoice() {
    if (!localStorage.getItem("welcomePlayed")) {
        speak("स्वागत है किसान भाई। आप सफलतापूर्वक लॉगिन हो चुके हैं। अब अपने खेत की जानकारी भरकर खाद की सलाह प्राप्त करें।");
        localStorage.setItem("welcomePlayed", "yes");
    }
}

// FEEDBACK PAGE INSTRUCTION
export function feedbackVoice() {
    speak("कृपया अपनी मिट्टी का प्रकार, फसल और फीडबैक दर्ज करें। फिर सबमिट बटन दबाएँ।");
}

/* --------------------------------------------------------
    FIELD-SPECIFIC VOICE
-------------------------------------------------------- */

// LOGIN PAGE FIELD INSTRUCTIONS
export function loginFieldInstructions() {
    const email = document.getElementById("loginEmail");
    const otp = document.getElementById("loginOtp");

    email?.addEventListener("focus", () => speak("कृपया यहाँ अपना ईमेल लिखें।"));
    otp?.addEventListener("focus", () => speak("कृपया यहाँ ओ टी पी दर्ज करें।"));
}

// SIGNUP PAGE FIELD INSTRUCTIONS
export function signupFieldInstructions() {
    const name = document.getElementById("fullname");
    const email = document.getElementById("email");
    const phone = document.getElementById("phone");
    const address = document.getElementById("address");
    const area = document.getElementById("area");
    const otp = document.getElementById("signupOtp");

    name?.addEventListener("focus", () => speak("कृपया यहाँ पूरा नाम लिखें।"));
    email?.addEventListener("focus", () => speak("कृपया यहाँ अपना ईमेल लिखें।"));
    phone?.addEventListener("focus", () => speak("कृपया यहाँ अपना फोन नंबर लिखें।"));
    address?.addEventListener("focus", () => speak("कृपया यहाँ पूरा पता लिखें।"));
    area?.addEventListener("focus", () => speak("कृपया यहाँ अपना क्षेत्र या शहर लिखें।"));
    otp?.addEventListener("focus", () => speak("कृपया यहाँ ओ टी पी लिखें।"));
}

/* --------------------------------------------------------
    MUTE / UNMUTE BUTTON
-------------------------------------------------------- */

export function toggleVoice() {
    if (localStorage.getItem("voiceMuted")) {
        localStorage.removeItem("voiceMuted");
        speak("आवाज़ चालू कर दी गई है।");
    } else {
        localStorage.setItem("voiceMuted", "yes");
        window.speechSynthesis.cancel();
        alert("Voice Assistant Muted");
    }
}
