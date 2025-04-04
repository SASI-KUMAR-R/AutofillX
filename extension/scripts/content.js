function extractFormStructure() {
    const forms = document.querySelectorAll("form");
    if (forms.length === 0) return null;

    let formStructure = {
        url: window.location.href,
        fields: []
    };

    forms.forEach(form => {
        form.querySelectorAll("input, select, textarea").forEach(input => {
            if (input.type === "hidden") return;
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

    formStructure.fields = formStructure.fields.filter(field => 
        field.label || field.name || field.placeholder || field.value
    );

    return formStructure.fields.length > 0 ? formStructure : null;
}




async function fetchUserDetails(email) {
    const response = await fetch("http://localhost:5050/api/user/getDetails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
    });
    return response.json();
}






async function storeMissingDetails(email, updatedFields) {
    const response = await fetch("http://localhost:5050/api/user/updateDetails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, details: updatedFields })
    });
    return response.json();
}





function autofillForm(fields) {
    fields.forEach(field => {
        const input = document.querySelector(`[name="${field.name}"]`);
        if (input) {
            // Special handling for date input formats
            if (input.type === "date") {
                try {
                    input.value = new Date(field.value).toISOString().split('T')[0];
                } catch {
                    input.value = "";
                }
            } else {
                input.value = field.value;
            }
        }
    });
}




function sendFormDataToBackend(formData) {
    console.log(formData);
    if (!formData) {
        console.log("❌ No valid form data extracted.");
        return;
    }

    return fetch("http://localhost:5050/api/form/store", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
    }).then(response => response.json());
}






chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "extractForm" && message.email) {
        console.log("📩 Extract Form request received from popup.js");

        (async () => {
            const formData = extractFormStructure();
            if (!formData) return sendResponse({ status: "❌ No form found" });

            // 1️⃣ Store form structure in backend
            const storeResult = await sendFormDataToBackend(formData);
            console.log("✅ Form stored:", storeResult);

            // 2️⃣ Get user details from DB
            const userResult = await fetchUserDetails(message.email);
            const userData = userResult.success ? userResult.user.details : {};
            localStorage.setItem("userDetails", JSON.stringify(userData));

            // 3️⃣ Compare fields and prompt for missing data
            const updatedDetails = {};
            for (let field of formData.fields) {
                const key = field.label || field.name || field.placeholder;
                if (!key) continue;

                const matched = Object.keys(userData).find(k => k.toLowerCase() === key.toLowerCase());

                if (!matched) {
                    const userInput = prompt(`Enter value for: ${key}`);
                    if (userInput) {
                        updatedDetails[key] = userInput;
                        field.value = userInput;
                    }
                } else {
                    field.value = userData[matched];
                }
            }

            // 4️⃣ Save new values if needed
            if (Object.keys(updatedDetails).length > 0) {
                const updateResult = await storeMissingDetails(message.email, updatedDetails);
                console.log("📤 Updated user data:", updateResult);
            }

            // 5️⃣ Fill the form
            autofillForm(formData.fields);
            sendResponse({ status: "✅ Form filled successfully" });
        })().catch(err => {
            sendResponse({ status: "❌ Error", error: err.message });
        });

        return true; // keep the response channel open for async
    }
});
