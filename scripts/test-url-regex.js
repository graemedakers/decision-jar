
const renderTextWithLinks = (text) => {
    if (!text) return text;

    // Regex to match URLs (http, https) - capture everything, then clean trailing punctuation
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);

    return parts.map((part, idx) => {
        if (part.match(urlRegex)) {
            // Clean up any trailing punctuation (but not alphanumeric chars)
            let cleanUrl = part;
            let trailingPunctuation = '';

            // Only remove trailing punctuation characters (not letters/numbers/colons)
            // Exclude colon since it's part of https://
            while (cleanUrl.length > 0 && /[).,;!?]$/.test(cleanUrl)) {
                trailingPunctuation = cleanUrl.slice(-1) + trailingPunctuation;
                cleanUrl = cleanUrl.slice(0, -1);
            }

            return `LINK[${cleanUrl}]${trailingPunctuation}`;
        }
        return part;
    }).join('');
};

const testString = "**Lunch:** Quick Crêpes (Map: https://www.google.com/maps/search/?api=1&query=Crêpe+Stand+Pont+Saint-Michel+Paris)";

console.log("Input:", testString);
console.log("Output:", renderTextWithLinks(testString));

const testString2 = "(Map: https://www.google.com/maps/search/?api=1&query=Greek+Gyro+Stand+Rue+de+la+Harpe+Paris)";
console.log("Input 2:", testString2);
console.log("Output 2:", renderTextWithLinks(testString2));
