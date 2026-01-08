const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI('AIzaSyDCk3s5mSQx0bNCGYnFILb69gh_Z5mtWNo');
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

const modelProduct = require('../models/products.model');

async function askQuestion(question) {
    try {
        const products = await modelProduct.find({});
        const productData = products.map((product) => `Tên ${product.name}, Giá : ${product.price}`).join('\n');

        const prompt = `
        Bạn là một trợ lý bán nội thất chuyên nghiệp. 
        Đây là danh sách sản phẩm hiện có trong cửa hàng:

        ${productData}

        câu hỏi của khách hàng ${question}
        Hãy trả lời một cách tự nhiên và thân thiện
        `;

        const result = await model.generateContent(prompt);
        const answer = result.response.text();
        return answer;
    } catch (error) {
        console.log(error);
    }
}

module.exports = { askQuestion };
