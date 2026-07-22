const asyncHandler = require('express-async-handler');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fetch = require('node-fetch');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// @desc    Get book recommendations from AI
// @route   POST /api/recommendations
// @access  Private
const getRecommendations = asyncHandler(async (req, res) => {
  const { tags } = req.body;

  if (!tags || tags.length === 0) {
    res.status(400);
    throw new Error('No tags provided');
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-pro-latest' });

  const prompt = `Given this list of topics and adjectives from a user's comic book pull list: ${tags.join(
    ', '
  )}. What recommendations would you suggest for other comic books that match this list? Please provide a dozen real comic books as suggestions. For each suggestion, provide the series title, the publisher, and a brief reason why it's a good recommendation. Return the response as a JSON array of objects, where each object has "seriesTitle", "publisher", and "reason" as keys. For example: [{"seriesTitle": "Saga", "publisher": "Image Comics", "reason": "It's a great space opera with mature themes."}]`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Clean the response to ensure it's valid JSON
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    const recommendations = JSON.parse(text);
    res.json(recommendations);
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    res.status(500).json({ message: 'Failed to get recommendations from AI.' });
  }
});

module.exports = {
  getRecommendations,
};