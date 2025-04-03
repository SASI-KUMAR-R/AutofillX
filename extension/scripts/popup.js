document.addEventListener("DOMContentLoaded", () => {
    const signInBtn = document.getElementById("sign-in");
    const fillFormBtn = document.getElementById("fill-form");

    if (!signInBtn || !fillFormBtn) {
        console.error("❌ Buttons not found in popup.html.");
        return;
    }

    chrome.storage.local.get(["userEmail", "userDetails"], (data) => {
        if (data.userEmail) {
            signInBtn.style.display = "none";
            fillFormBtn.style.display = "block";
        } else {
            fillFormBtn.style.display = "none";
        }
    });

    signInBtn.addEventListener("click", () => {
        const email = prompt("Enter your email:");
        if (email) {
            fetch("http://localhost:5000/api/user/signin", {
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
                        fillFormBtn.style.display = "block";
                    });
                } else {
                    alert("Error: " + data.message);
                }
            })
            .catch(error => console.error("Fetch Error:", error));
        }
    });

    fillFormBtn.addEventListener("click", () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (!tabs.length) {
                console.error("❌ No active tab found.");
                return;
            }

            // Ensure content script is injected
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                files: ["scripts/content.js"]
            }, () => {
                console.log("✅ Content script injected, sending message...");
                
                chrome.tabs.sendMessage(tabs[0].id, { action: "extractForm" }, (response) => {
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
