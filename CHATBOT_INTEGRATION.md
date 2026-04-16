# 🤖 LocalMed AI Symptom Chatbot Integration Summary

## ✅ Implementation Complete

Your LocalMed project now includes a fully functional **AI-powered Symptom Chatbot** powered by Google Gemini API. This guide summarizes everything that was added.

---

## 📋 Files Created

### Backend

#### 1. **`backend/controllers/chatbotController.js`** (156 lines)
- Initializes Google Generative AI with `gemini-2.0-flash` model
- Implements `analyzeSymptoms()` endpoint that:
  - Takes patient symptom descriptions
  - Maintains conversation context from history
  - Returns structured JSON with doctor specialization recommendation
  - Includes confidence level, urgency, and follow-up questions
- Implements `healthCheck()` endpoint for service verification
- Comprehensive error handling for rate limits, network errors, and API failures
- Full inline documentation

#### 2. **`backend/routes/chatbotRoutes.js`** (42 lines)
- POST `/api/chatbot/analyze` — Protected endpoint with JWT auth + rate limiting
- GET `/api/chatbot/health` — Check chatbot service status
- Rate limiter: 10 requests per minute per user
- IPv6-safe IP detection for rate limiting
- Full middleware chain: JWT auth → Rate limit → Controller

### Frontend

#### 3. **`frontend/src/components/Chatbot/SymptomChatbot.jsx`** (280 lines)
- Floating chat button (bottom-right, pulsing animation, gradient colors)
- Full chat panel UI with smooth open/close animations
- Message rendering with:
  - User messages (right-aligned, purple gradient)
  - AI responses (left-aligned, white with border)
  - Typing indicator during API calls
  - Error messages (red background)
- Analysis display with:
  - Recommended specialization (clickable tag)
  - Confidence badge (high/medium/low with color coding)
  - Urgency badge (routine/soon/urgent with color coding)
  - Reason explanation
  - Follow-up questions list
- "Find [Specialization] Doctors Near Me" button with direct navigation
- Conversation history tracking (last 10 messages for context)
- Textarea input with Enter-to-send (Shift+Enter for new line)
- Disclaimer footer: "⚠️ This is not a medical diagnosis..."
- Error handling with user-friendly messages
- Loading state with skeleton animation

#### 4. **`frontend/src/components/Chatbot/SymptomChatbot.css`** (430 lines)
- **Floating Button**: Circular, gradient (purple-pink), pulsing animation, hover scale
- **Chat Panel**: Fixed bottom-right, 400px × 500px, smooth slide-in animation
- **Header**: Gradient background, close button
- **Messages**: Scrollable area, auto-scroll to latest
- **Message Bubbles**: User (right, blue gradient) vs AI (left, white with border)
- **Analysis Section**: Structured layout with sections for each recommendation detail
- **Badges**: Color-coded confidence (green/yellow/red) and urgency
- **Buttons**: Gradient styling with hover effects
- **Input Area**: Textarea + send button (disabled when empty/loading)
- **Typing Indicator**: 3-dot bouncing animation
- **Mobile Responsive**: Full-width on phones, optimized layout for small screens
- **Scrollbar Styling**: Custom WebKit scrollbar for better UX

### Configuration Files

#### 5. **`backend/.env.example`** (Updated)
- Added: `GEMINI_API_KEY=your-google-gemini-api-key`

---

## 📄 Files Modified

### 1. **`backend/server.js`**
**What Changed**: Registered chatbot routes
```javascript
app.use('/api/chatbot', require('./routes/chatbotRoutes'));
```

### 2. **`backend/package.json`**
**What Changed**: Added 2 new dependencies
- `@google/generative-ai` — Google Gemini SDK
- `express-rate-limit` — Rate limiting middleware

### 3. **`frontend/src/App.jsx`**
**What Changed**: Imported and integrated chatbot component
```javascript
import SymptomChatbot from './components/Chatbot/SymptomChatbot';
// Added <SymptomChatbot /> after routes, before Footer
```

### 4. **`frontend/src/pages/Search.jsx`**
**What Changed**: Added URL parameter handling for specialization filter
- Imported `useSearchParams` from React Router
- Added effect to detect `?specialization=` URL parameter
- When chatbot sends user to search, specialization is pre-filled

### 5. **`README.md`**
**What Changed**: Added comprehensive chatbot documentation section

---

## 🚀 Quick Start

### Step 1: Get Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with Google account
3. Click "Create API Key"
4. Copy the key

### Step 2: Configure Environment

Add to `backend/.env`:
```env
GEMINI_API_KEY=your-key-here
```

### Step 3: Install Dependencies

```bash
cd backend
npm install @google/generative-ai express-rate-limit
```

### Step 4: Start Servers

```bash
npm run dev  # from root directory
```

Both frontend (http://localhost:3000) and backend (http://localhost:5001) will start.

---

## 🧪 Testing the Chatbot

### Test Inputs

| Symptom | Expected Doctor |
|---------|-----------------|
| "I have a severe headache and blurry vision" | Neurologist |
| "My knee hurts when I climb stairs" | Orthopedic |
| "I have a rash on my arm that won't go away" | Dermatologist |
| "I feel very anxious and can't sleep" | Psychiatrist |
| "My child has a high fever and cough" | Pediatrician |
| "Chest pain and shortness of breath" | Cardiologist |

### How to Test

1. Open http://localhost:3000
2. Register as a patient (or login if already registered)
3. Look for **floating chat button** (bottom-right corner with 💬 emoji)
4. Click to open chat panel
5. Type a symptom description
6. Click send or press Enter
7. Watch AI analyze and respond with recommendation
8. Click "Find [Doctor Type] Near Me" to navigate to doctor search

---

## 🔐 Security Features

✅ **API Key Protection**: Gemini key stored only in backend `.env`, never exposed to frontend
✅ **JWT Authentication**: Only logged-in users can access chatbot
✅ **Rate Limiting**: 10 requests/minute per user prevents abuse
✅ **Input Validation**: Minimum 5 characters required for symptoms
✅ **Error Handling**: Graceful error messages without exposing internals
✅ **CORS**: Configured for secure cross-origin requests

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│          Frontend (React)                │
│  SymptomChatbot.jsx + CSS               │
│  - Floating button                      │
│  - Chat UI                              │
│  - Analysis display                     │
└────────────────┬────────────────────────┘
                 │
          POST /api/chatbot/analyze
          + JWT Auth + Rate Limit
                 │
┌────────────────▼────────────────────────┐
│       Backend (Express.js)               │
│  chatbotController.js + chatbotRoutes.js│
│  - Validate input                       │
│  - Call Gemini API                      │
│  - Parse JSON response                  │
│  - Return recommendation                │
└────────────────┬────────────────────────┘
                 │
         ┌───────▼────────┐
         │  Google Gemini │
         │   2.0 Flash    │
         │   API          │
         └────────────────┘
```

---

## 🤖 Gemini API System Prompt

The chatbot uses this system prompt to guide recommendations:

```
You are a medical triage assistant for the LocalMed platform. Based on the 
patient's described symptoms, recommend the most appropriate doctor specialization.

Rules:
1. Only recommend: General Practitioner, Cardiologist, Dermatologist, Orthopedic, 
   Neurologist, ENT, Ophthalmologist, Gynecologist, Pediatrician, Psychiatrist, 
   Dentist, Urologist, Gastroenterologist, Pulmonologist, Endocrinologist

2. Always return valid JSON with:
   - specialization
   - confidence (high/medium/low)
   - reason (1-2 sentences)
   - urgency (routine/soon/urgent)
   - followUpQuestions (array of optional clarifying questions)

3. Never diagnose. Only recommend doctor type.
4. For life-threatening symptoms, set urgency to "urgent" and suggest ER.
```

---

## 📊 Response Format

**Success:**
```json
{
  "success": true,
  "analysis": {
    "specialization": "Neurologist",
    "confidence": "high",
    "reason": "Headache with blurry vision suggests neurological concern requiring specialist evaluation.",
    "urgency": "soon",
    "followUpQuestions": ["Duration of symptoms?", "Any recent head injury?"]
  },
  "messageId": 1712742894123
}
```

**Error (Rate Limited):**
```json
{
  "error": "I'm a bit busy right now. Please try again in a moment."
}
```

---

## 🎨 UI/UX Highlights

### Floating Button
- **Position**: Fixed bottom-right (24px margin)
- **Size**: 56px diameter
- **Animation**: Pulsing glow effect
- **Colors**: Purple-pink gradient
- **Interaction**: Click to toggle chat panel

### Chat Panel
- **Dimensions**: 400px × 500px (responsive on mobile)
- **Position**: Fixed bottom-right, above floating button
- **Animation**: Smooth slide-in from bottom
- **Scrollable**: Auto-scroll to latest messages

### Message Bubbles
- **User**: Right-aligned, blue gradient, rounded corners
- **AI**: Left-aligned, white with subtle border, rounded corners
- **Typing Indicator**: 3 bouncing dots animation

### Analysis Display
- **Specialization Tag**: Purple gradient pill, clickable
- **Confidence Badge**: Color-coded (green/yellow/red)
- **Urgency Badge**: Color-coded with clear labels
- **Follow-ups**: Bulleted list of clarifying questions

### Call-to-Action Button
- **Text**: "🔍 Find [Specialization] Near Me"
- **Action**: Navigate to `/search?specialization=[recommended]`
- **Style**: Gradient with hover lift effect

---

## ⚙️ API Endpoints

### POST `/api/chatbot/analyze`
**Purpose**: Analyze symptoms and get doctor recommendation

**Headers**:
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request**:
```json
{
  "message": "I have severe headache and blurry vision",
  "conversationHistory": [
    {
      "role": "user",
      "content": "I'm experiencing some symptoms"
    },
    {
      "role": "assistant",
      "content": "I can help. Please describe what you're experiencing."
    }
  ]
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "analysis": { ... },
  "messageId": 1712742894123
}
```

**Errors**:
- `400` — Symptoms too short (< 5 chars)
- `401` — Unauthorized (no JWT token)
- `429` — Rate limited (> 10 requests/min)
- `503` — API unavailable

### GET `/api/chatbot/health`
**Purpose**: Check if chatbot service is operational

**Response**:
```json
{
  "status": "ok",
  "service": "Gemini API",
  "message": "Chatbot service is operational"
}
```

---

## 🐛 Error Handling

### User-Friendly Error Messages

| Error Condition | Message Shown |
|-----------------|---------------|
| Empty/short symptoms | "Please describe your symptoms in more detail (at least 5 characters)" |
| Rate limit exceeded | "I'm a bit busy right now. Please try again in a moment." |
| Network error | "Unable to connect. Please check your internet." |
| Invalid JSON response | "Unable to process your symptoms. Please try again with a clearer description." |
| Missing API key | "Chatbot service is currently unavailable. Please try again later." |

### Console Logging
- Detailed error logs in backend for debugging
- Response parsing errors logged with full context
- No sensitive information exposed to frontend

---

## 📱 Mobile Responsiveness

- **Mobile Screens** (< 480px):
  - Chat panel: Full width minus 32px margin
  - Height: 70vh for accessibility
  - All interactive elements remain accessible

- **Small Screens** (< 360px):
  - Reduced font sizes for titles and content
  - Adjusted badge styling
  - Maintained usability

---

## 🔄 Conversation Flow

1. **Welcome** → "Hi! I'm your medical assistant..."
2. **User Input** → Patient describes symptoms
3. **API Call** → Backend calls Gemini with conversation history
4. **Recommendation** → AI returns structured JSON response
5. **Display** → Frontend shows formatted recommendation
6. **Action** → User clicks "Find Doctors" or continues conversation

---

## 🚨 Important Notes

⚠️ **Never commit `.env` file with actual API key**
- Use `.env.example` as template
- Add `.env` to `.gitignore` (already done)

⚠️ **Free Tier Limits**
- Google Gemini free tier: 60 requests/minute globally
- Our rate limit: 10 requests/minute per user

⚠️ **Production Deployment**
- Use environment variables for API key
- Consider implementing API key rotation
- Monitor rate limit headers for quota management

---

## 📈 Next Steps

### Optional Enhancements

1. **Add Symptom Severity Slider**
   - Visual 1-5 scale for symptom severity
   - Include in Gemini context

2. **Conversation Persistence**
   - Save conversation history to DB
   - Allow users to review past conversations

3. **Multi-Language Support**
   - Add language selector
   - Translate prompts for different languages

4. **Analytics Dashboard**
   - Track most common symptoms
   - Track most recommended doctors
   - Identify gaps in doctor availability

5. **Specialist Follow-ups**
   - "What's the typical cost?" button
   - "What tests will they do?" button
   - Integration with test booking

6. **Emergency Detection**
   - Detect life-threatening symptoms
   - Immediately show "Call Emergency" button
   - Pre-fill emergency contact form

---

## 💡 Resume Bullet

Add this to your resume under LocalMed project:

```
Built an AI-powered symptom analysis chatbot using Google Gemini 2.0 Flash API 
that intelligently maps patient-described symptoms to optimal doctor 
specializations with confidence levels and contextual follow-up questions, 
improving doctor-patient matching accuracy by enabling informed specialty selection.
```

---

## 🎉 You're All Set!

The chatbot is fully integrated and ready to use. Simply:

1. ✅ Add `GEMINI_API_KEY` to `.env`
2. ✅ Run `npm run dev`
3. ✅ Login as patient
4. ✅ Click floating chat button
5. ✅ Start describing symptoms!

Enjoy your new AI healthcare assistant! 🚀

---

**Questions or issues?** Check the backend logs at `npm run dev` output or inspect the chatbot network requests in browser DevTools.
