document.addEventListener("DOMContentLoaded", () => {
    const signInBtn = document.getElementById("sign-in");
    const fillFormBtn = document.getElementById("fill-form");
    const emailContainer = document.getElementById("email-container");
    const emailInput = document.getElementById("email-input");

    if (!signInBtn || !fillFormBtn || !emailContainer || !emailInput) {
        console.error("❌ Required elements not found in popup.html.");
        return;
    }

    chrome.storage.local.get(["userEmail", "userDetails"], (data) => {
        if (data.userEmail) {
            signInBtn.style.display = "none";
            emailContainer.style.display = "none";
            fillFormBtn.style.display = "block";
        } else {
            emailContainer.style.display = "none";
            fillFormBtn.style.display = "none";
        }
    });

    let emailInputShown = false;

    signInBtn.addEventListener("click", () => {
        if (!emailInputShown) {
            emailContainer.style.display = "block";
            emailInput.focus();
            emailInputShown = true;
            return;
        }

        const email = emailInput.value.trim();
        if (email) {
            fetch("http://localhost:5050/api/user/signin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email })
            })
            .then(response => {
                if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    chrome.storage.local.set({ userEmail: email, userDetails: data.user.details }, () => {
                        signInBtn.style.display = "none";
                        emailContainer.style.display = "none";
                        fillFormBtn.style.display = "block";
                    });
                } else {
                    alert("Error: " + data.message);
                }
            })
            .catch(error => console.error("Fetch Error:", error));
        } else {
            alert("Please enter a valid email.");
        }
    });

    fillFormBtn.addEventListener("click", () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (!tabs.length) {
                console.error("❌ No active tab found.");
                return;
            }

            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                files: ["scripts/content.js"]
            }, () => {
                console.log("✅ Content script injected, sending message...");

                chrome.storage.local.get("userEmail", (data) => {
                    if (!data.userEmail) {
                        console.error("❌ No user email found in storage.");
                        return;
                    }

                    chrome.tabs.sendMessage(tabs[0].id, {
                        action: "extractForm",
                        email: data.userEmail
                    }, (response) => {
                        if (chrome.runtime.lastError) {
                            console.error("❌ Error sending message:", chrome.runtime.lastError.message);
                        } else {
                            console.log("📩 Message sent to content.js", response);
                        }
                    });
                });
            });
        });
    });
});
