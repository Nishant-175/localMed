const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// System prompt for medical triage
const SYSTEM_PROMPT = `You are a medical triage assistant for the LocalMed platform. Based on the patient's described symptoms, recommend the most appropriate doctor specialization they should visit.

Rules:
1. Only recommend from these specializations: General Practitioner, Cardiologist, Dermatologist, Orthopedic, Neurologist, ENT, Ophthalmologist, Gynecologist, Pediatrician, Psychiatrist, Dentist, Urologist, Gastroenterologist, Pulmonologist, Endocrinologist
2. Always respond in this exact JSON format:
{
  "specialization": "the recommended specialization",
  "confidence": "high/medium/low",
  "reason": "brief 1-2 sentence explanation of why this specialization",
  "urgency": "routine/soon/urgent",
  "followUpQuestions": ["optional question 1", "optional question 2"]
}
3. If symptoms are vague, ask follow-up questions via the followUpQuestions field
4. Never diagnose. Only recommend which type of doctor to see.
5. If symptoms sound life-threatening, set urgency to "urgent" and advise visiting an emergency room.
6. Return ONLY valid JSON, no additional text.`;

/**
 * Analyze symptoms and recommend doctor specialization
 * POST /api/chatbot/analyze
 */
exports.analyzeSymptoms = async (req, res) => {
  try {
    const { message, conversationHistory } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!message || message.trim().length < 5) {
      return res.status(400).json({
        error: 'Please describe your symptoms in more detail (at least 5 characters)'
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY not configured');
      return res.status(500).json({
        error: 'Chatbot service is currently unavailable. Please try again later.'
      });
    }

    // Use the gemini-2.0-flash model for fast responses
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // Build conversation context from history
    let fullPrompt = SYSTEM_PROMPT;
    
    if (conversationHistory && conversationHistory.length > 0) {
      // Include last 5 messages for context
      const recentHistory = conversationHistory.slice(-10);
      fullPrompt += '\n\nPrevious conversation:\n';
      recentHistory.forEach(msg => {
        fullPrompt += `${msg.role === 'user' ? 'Patient' : 'Assistant'}: ${msg.content}\n`;
      });
    }

    fullPrompt += `\nPatient: ${message}\nAssistant:`;

    // Call Gemini API
    const result = await model.generateContent(fullPrompt);
    const responseText = result.response.text();

    // Parse JSON response
    let analysisResult;
    try {
      // Extract JSON from response (sometimes Gemini adds extra text)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON in response');
      }
      analysisResult = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', responseText);
      return res.status(500).json({
        error: 'Unable to process your symptoms. Please try again with a clearer description.'
      });
    }

    // Validate response structure
    if (!analysisResult.specialization || !analysisResult.urgency) {
      return res.status(500).json({
        error: 'Unable to analyze symptoms. Please try again.'
      });
    }

    // Return successful analysis
    res.json({
      success: true,
      analysis: analysisResult,
      messageId: Date.now()
    });

  } catch (error) {
    console.error('Chatbot error:', error);

    // Handle rate limiting
    if (error.message?.includes('429') || error.message?.includes('quota')) {
      return res.status(429).json({
        error: "I'm a bit busy right now. Please try again in a moment."
      });
    }

    // Handle network errors
    if (error.message?.includes('ERR_NETWORK') || error.message?.includes('ECONNREFUSED')) {
      return res.status(503).json({
        error: 'Unable to connect to AI service. Please check your internet and try again.'
      });
    }

    res.status(500).json({
      error: 'An error occurred while analyzing your symptoms. Please try again.'
    });
  }
};

/**
 * Health check for chatbot service
 * GET /api/chatbot/health
 */
exports.healthCheck = async (req, res) => {
  try {
    // Test Gemini API connectivity
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent('Say "OK"');
    
    res.json({
      status: 'ok',
      service: 'Gemini API',
      message: 'Chatbot service is operational'
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      service: 'Gemini API',
      message: 'Chatbot service is unavailable'
    });
  }
};
