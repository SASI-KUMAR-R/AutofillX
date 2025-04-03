function extractFormStructure() {
    const forms = document.querySelectorAll("form");
    if (forms.length === 0) return null;

    let formStructure = {
        url: window.location.href,
        fields: []
    };

    forms.forEach(form => {
        form.querySelectorAll("input, select, textarea").forEach(input => {
            formStructure.fields.push({
                label: input.labels?.[0]?.innerText || "",
                type: input.type || "text",
                name: input.name || "",
                placeholder: input.placeholder || "",
                value: input.value || "",
                required: input.required
            });
        });
    });

    return formStructure;
}

function sendFormDataToBackend() {
    const formData = extractFormStructure();
    if (!formData || formData.fields.length === 0) {
        console.log("No form data extracted.");
        return;
    }

    fetch("http://localhost:5000/api/form/store", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => console.log("✅ Form stored successfully:", data))
    .catch(error => console.error("❌ Error storing form:", error));
}

// ✅ Listen for messages from popup.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "extractForm") {
        console.log("📩 Extract Form request received from popup.js");

        try {
            const result = sendFormDataToBackend();
            if (result instanceof Promise) {
                result.then(() => sendResponse({ status: "✅ Form extraction completed" }))
                      .catch(error => sendResponse({ status: "❌ Error extracting form", error: error.message }));
                return true; // Keeps the sendResponse function open for async execution
            } else {
                sendResponse({ status: "✅ Form extraction completed" });
            }
        } catch (error) {
            sendResponse({ status: "❌ Error extracting form", error: error.message });
        }
    }
});
