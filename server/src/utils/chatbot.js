const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

async function askQuestion(question) {
    try {
        const userQuestion = question?.toString().trim() || 'Xin chào, hãy giới thiệu về cửa hàng nội thất.';

        const prompt = `Bạn là trợ lý ảo chuyên bán nội thất. Hãy trả lời tự nhiên, thân thiện. Khách hàng hỏi: "${userQuestion}"`;

        const result = await model.generateContent(prompt);

        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('Chatbot error:', error.message);

        return 'Hiện tại tôi đang gặp sự cố kết nối, bạn vui lòng thử lại sau nhé.';
    }
}

module.exports = { askQuestion };
