
const testPayload = {
    currentCode: "export default function Test() { return <div>Test</div> }",
    instruction: "Change text to Hello World"
};

async function test() {
    try {
        console.log("Testing /api/iterate...");
        const res = await fetch('http://localhost:3000/api/iterate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testPayload)
        });

        if (!res.ok) {
            console.error(`Status: ${res.status}`);
            console.error(await res.text());
            process.exit(1);
        }

        const data = await res.json();
        console.log("Success! Received code length:", data.code.length);
        console.log("Preview:", data.code.substring(0, 50));
    } catch (err) {
        console.error("Fetch failed:", err);
        process.exit(1);
    }
}

test();
