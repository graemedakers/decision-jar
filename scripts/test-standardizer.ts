
import { suggestIdeaType } from '../lib/idea-standardizer';

const testCases = [
    {
        name: "At Home Spa Day (Should be Activity)",
        input: {
            title: "Spa Day",
            category: "SPA",
            address: "At Home",
            details: "Prep time 30 mins, relax for 1 hour."
        },
        expected: 'activity'
    },
    {
        name: "Board Game Night (Should be Game)",
        input: {
            title: "Monopoly",
            category: "BOARD_GAME",
            address: "At Home",
            description: "Play a game with friends."
        },
        expected: 'game'
    },
    {
        name: "Home Dinner (Should be Recipe)",
        input: {
            title: "Spaghetti",
            category: "DINNER",
            address: "At Home",
            details: "Cook pasta for 10 mins."
        },
        expected: 'recipe'
    },
    {
        name: "Yoga Session (Should be Activity)",
        input: {
            title: "Morning Yoga",
            category: "YOGA",
            address: "At Home",
            details: "Stretch for 20 mins."
        },
        expected: 'activity'
    }
];

console.log("Running Idea Standardizer Verification...");

let passed = 0;
testCases.forEach(test => {
    const result = suggestIdeaType(test.input);
    const isPass = result === test.expected;
    console.log(`[${isPass ? 'PASS' : 'FAIL'}] ${test.name}`);
    console.log(`   Expected: ${test.expected}, Got: ${result}`);
    if (isPass) passed++;
});

console.log(`\nPassed ${passed}/${testCases.length}`);

if (passed === testCases.length) {
    console.log("SUCCESS: All logic checks passed.");
    process.exit(0);
} else {
    console.log("FAILURE: Some checks failed.");
    process.exit(1);
}
