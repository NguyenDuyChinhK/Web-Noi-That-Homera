const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

async function askQuestion(question) {
    try {
        // Nếu question là chuỗi rỗng/null thì mặc định một câu hỏi placeholder
        const userQuestion =
            question && question.toString().trim()
                ? question.toString().trim()
                : 'Xin chào, hãy giới thiệu về cửa hàng nội thất.';

        const prompt = `
Bạn là trợ lý ảo chuyên bán nội thất.
Hãy trả lời tự nhiên, thân thiện và dễ hiểu.
Khách hàng hỏi: "${userQuestion}"
        `;

        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        console.log('Chatbot error:', error.message);
        throw error;
    }
}

module.exports = { askQuestion };
