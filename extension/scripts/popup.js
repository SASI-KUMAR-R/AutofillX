document.addEventListener("DOMContentLoaded", () => {
    const signInBtn = document.getElementById("sign-in");
    const fillFormBtn = document.getElementById("fill-form"); // Uncommented for use

    // Check if user is already signed in
    chrome.storage.local.get(["userEmail", "userDetails"], (data) => {
        if (data.userEmail) {
            signInBtn.style.display = "none";
            fillFormBtn.style.display = "block";
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
                return response.json(); // Direct JSON parsing
            })
            .then(data => {
                if (data.success) {
                    // Store user details in local storage
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
        chrome.storage.local.get("userDetails", (data) => {
            if (!data.userEmail) {
                alert("No saved details found! Please sign in first.");
                
                return;
            }
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                chrome.scripting.executeScript({
                    target: { tabId: tabs[0].id },
                    function: autofillForm,
                    args: [data.userDetails]
                });
            });
        });
    });
});

function autofillForm(userDetails) {
    document.querySelectorAll("input, textarea, select").forEach(input => {
        if (userDetails[input.name]) {
            input.value = userDetails[input.name];
        }
    });
}
