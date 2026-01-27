
const { getConciergePromptAndMock } = require('./lib/concierge-prompts');

try {
    const { prompt } = getConciergePromptAndMock(
        'HOTEL',
        { price: 'moderate', style: 'Modern', amenities: 'Pool' },
        'Melbourne, VIC',
        ''
    );

    console.log("=== GENERATED PROMPT PREVIEW ===");
    console.log(prompt.substring(prompt.indexOf('- Style:'), prompt.indexOf('⚠️ CRITICAL OUTPUT RULES:')));
} catch (err) {
    console.error(err);
}
