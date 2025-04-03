async function extractFormStructure() {
    const url = window.location.href;
    const inputs = document.querySelectorAll("input, textarea, select");
    const structure = [];

    inputs.forEach(input => {
        structure.push({
            label: input.labels?.[0]?.innerText || "",
            placeholder: input.placeholder,
            name: input.name,
            type: input.type
        });
    });

    // Check if form is already stored
    const response = await fetch(`http://localhost:5000/api/forms/get?url=${url}`);
    const existingForm = await response.json();

    if (!existingForm.url) {
        // Save form structure
        await fetch("http://localhost:5000/api/forms/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url, structure })
        });
    }
}

extractFormStructure();
