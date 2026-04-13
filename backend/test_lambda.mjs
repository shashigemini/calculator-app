import { handler } from './index.mjs';

async function test() {
    const mockEvent = {
        body: JSON.stringify({ expression: "2 + 2 x 3" })
    };

    console.log("Testing with expression: 2 + 2 x 3");
    const response = await handler(mockEvent);
    console.log("Response:", response);

    const body = JSON.parse(response.body);
    if (body.result === "8") {
        console.log("Test Passed!");
    } else {
        console.log("Test Failed. Expected 8, got " + body.result);
    }
}

test().catch(console.error);
