chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "autofill") {
        chrome.storage.local.get(["userDetails"], (result) => {
            const userDetails = result.userDetails || {};
            sendResponse(userDetails);
        });
        return true; 
    }
});
