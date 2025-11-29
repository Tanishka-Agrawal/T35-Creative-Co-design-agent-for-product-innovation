// --------------------------------------
// UPDATED form.js (Final Version)
// --------------------------------------

// ⚠️ Replace with your LIVE N8N Webhook URL
const WEBHOOK_URL = "http://localhost:5678/webhook/51bccd55-9e5c-4288-be13-0fba87bf8a61";

document.getElementById("dynamicForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const form = event.target;
    const resultsDisplay = document.getElementById("resultsDisplay");
    const submitBtn = document.getElementById("submitBtn");

    // ---------- Collect Form Data ----------
    const payload = {
        fullName: form.elements["Full Name"].value,
        soilType: form.elements["Soil Type"].value,
        cropType: form.elements["Crop Type"].value,
        feedback: form.elements["Feedback"].value,
        farmLocation: form.elements["Farm Location"].value
    };

    // ---------- UI: Loading State ----------
    submitBtn.disabled = true;
    resultsDisplay.innerHTML = `
        <div style="text-align:center; padding:15px;">
            <h3>⏳ Processing...</h3>
            <p>Please wait while the AI generates your fertilizer plan.</p>
        </div>
    `;
    resultsDisplay.classList.remove("error-message");

    try {
        // 🔥 SEND DATA TO N8N WEBHOOK
        const response = await fetch(WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`HTTP Error ${response.status}`);
        }

        const aiResult = await response.json();

        // ------ Validate Returned Data ------
        if (!aiResult || typeof aiResult !== "object") {
            throw new Error("Invalid response structure from AI agent.");
        }

        if (aiResult.error) {
            throw new Error(aiResult.error);
        }

        // Extract safely
        const solutions = aiResult.solutions || [];
        const plan = aiResult.fertilizer_plan || {
            recommended_fertilizers: [],
            eco_friendly_options: [],
            available_stock_match: []
        };

        // Build HTML Lists
        const solList = solutions.map(s => `<li>${s}</li>`).join("");
        const fertList = plan.recommended_fertilizers.map(f => `<li>${f}</li>`).join("");
        const ecoList = plan.eco_friendly_options.map(e => `<li>${e}</li>`).join("");
        const stockList = plan.available_stock_match.map(s => `<strong>${s}</strong>`).join(", ");

        // ---------- Display Final Output ----------
        resultsDisplay.innerHTML = `
            <h3 class="results-title">✅ Analysis Complete</h3>

            <p><strong>Summary:</strong> ${aiResult.feedback_analysis || "No summary available"}</p>
            <p><strong>Usefulness:</strong> ${aiResult.usefulness_score || "N/A"} / 5
               | <strong>Feasibility:</strong> ${aiResult.feasibility_score || "N/A"} / 5</p>

            <h4>🌱 Top Eco-Friendly Solutions</h4>
            <ul>${solList}</ul>

            <h4>🔬 Recommended Fertilizers</h4>
            <ul>${fertList}</ul>

            <h4>🍃 Eco-Friendly Alternatives</h4>
            <ul>${ecoList}</ul>

            <h4>📦 Stock Availability</h4>
            <p>${stockList || "No matching stock found"}</p>
        `;
    } catch (error) {
        console.error("AI Error:", error);
        resultsDisplay.innerHTML = `
            <p class="error-message">
                ❌ Unable to fetch AI plan: ${error.message}.
            </p>
        `;
        resultsDisplay.classList.add("error-message");
    } finally {
        submitBtn.disabled = false;
    }
});
