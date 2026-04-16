# 🏥 LocalMed — Real-Time Doctor Availability Platform

A full-stack web application that enables patients to **instantly find, view, and book nearby available doctors** in real-time. Built with the **MERN stack** and **Socket.io**, LocalMed eliminates the need to call multiple clinics by providing live doctor availability at your fingertips.

---

## 🚀 Features

- **Real-Time Slot Broadcasting** — Doctor availability updates are pushed instantly to nearby patients via Socket.io, with no page refresh required.
- **Geo-Room Based Updates** — Socket.io rooms are partitioned by geographic area, ensuring patients only receive updates from doctors in their vicinity.
- **Location-Based Doctor Search** — MongoDB 2dsphere indexing with the `$near` geospatial operator for fast, proximity-based doctor discovery within a configurable radius.
- **Role-Based Access Control (RBAC)** — Separate dashboards and permissions for Patients, Doctors, and Administrators.
- **Secure Authentication** — JWT-based authentication with bcrypt password hashing for secure user registration and login.
- **CRUD Operations** — Full create, read, update, and delete functionality for doctor profiles, appointment slots, and patient booking records.
- **Responsive UI** — Clean, mobile-friendly interface built with React.js for seamless cross-device experience.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React.js, HTML5, CSS3 |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB, Mongoose ODM |
| **Real-Time** | Socket.io |
| **Authentication** | JWT (JSON Web Tokens), bcrypt |
| **Geospatial** | MongoDB 2dsphere Index, `$near` Operator |

---

## 📐 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Client (React.js)                    │
│                                                         │
│  Patient Dashboard │ Doctor Dashboard │ Admin Dashboard  │
└────────┬──────────────────────┬──────────────────────────┘
         │                      │
    REST APIs              WebSocket
         │                      │
┌────────▼──────────────────────▼──────────────────────────┐
│                 Server (Node.js + Express.js)            │
│                                                          │
│  ┌──────────┐  ┌──────────────┐  ┌────────────────────┐  │
│  │ JWT Auth │  │ CRUD Routes  │  │ Socket.io Server   │  │
│  │ + bcrypt │  │ (REST APIs)  │  │ (Geo-Room Rooms)   │  │
│  └──────────┘  └──────────────┘  └────────────────────┘  │
│                       │                                   │
│              ┌────────▼────────┐                          │
│              │    MongoDB      │                          │
│              │  (2dsphere idx) │                          │
│              └─────────────────┘                          │
└──────────────────────────────────────────────────────────┘
```

---

## 📂 Project Structure

```
localMed/
├── client/                     # React.js Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/              # Page-level components
│   │   │   ├── PatientDashboard.jsx
│   │   │   ├── DoctorDashboard.jsx
│   │   │   └── AdminDashboard.jsx
│   │   ├── context/            # React context for auth & state
│   │   ├── utils/              # Helper functions
│   │   ├── App.jsx
│   │   └── index.js
│   └── package.json
│
├── server/                     # Node.js + Express Backend
│   ├── config/
│   │   └── db.js               # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js   # Register, Login, JWT
│   │   ├── doctorController.js # Doctor CRUD operations
│   │   ├── slotController.js   # Slot management
│   │   └── bookingController.js
│   ├── middleware/
│   │   ├── authMiddleware.js   # JWT verification
│   │   └── roleMiddleware.js   # RBAC authorization
│   ├── models/
│   │   ├── User.js             # User schema (patient/doctor/admin)
│   │   ├── Slot.js             # Appointment slot schema
│   │   └── Booking.js          # Booking record schema
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── doctorRoutes.js
│   │   ├── slotRoutes.js
│   │   └── bookingRoutes.js
│   ├── socket/
│   │   └── socketHandler.js    # Socket.io geo-room logic
│   ├── server.js               # Entry point
│   └── package.json
│
├── .env                        # Environment variables
├── .gitignore
└── README.md
```

---

## ⚙️ Installation & Setup

### Prerequisites

- [Node.js](https://nodejs.org/) (v16+)
- [MongoDB](https://www.mongodb.com/) (local or MongoDB Atlas)
- npm or yarn

### 1. Clone the Repository

```bash
git clone https://github.com/Nishant-175/localMed.git
cd localMed
```

### 2. Setup Environment Variables

Create a `.env` file in the `server/` directory:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/localmed
JWT_SECRET=your_jwt_secret_key
```

### 3. Install Dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 4. Run the Application

```bash
# Terminal 1 — Start the backend server
cd server
npm run dev

# Terminal 2 — Start the React frontend
cd client
npm start
```

The app will be available at `http://localhost:3000` and the API at `http://localhost:5000`.

---

## 🔑 API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user (patient/doctor) |
| POST | `/api/auth/login` | Login and receive JWT token |

### Doctors

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/doctors/nearby?lat=...&lng=...&radius=...` | Find doctors near a location |
| GET | `/api/doctors/:id` | Get doctor profile |
| PUT | `/api/doctors/:id` | Update doctor profile (Doctor only) |

### Slots

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/slots` | Create a new slot (Doctor only) |
| GET | `/api/slots/doctor/:doctorId` | Get all slots for a doctor |
| PUT | `/api/slots/:id` | Update slot status |
| DELETE | `/api/slots/:id` | Delete a slot (Doctor only) |

### Bookings

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/bookings` | Book a slot (Patient only) |
| GET | `/api/bookings/my` | Get logged-in user's bookings |

---

## 🌐 Real-Time Events (Socket.io)

| Event | Direction | Description |
|-------|-----------|-------------|
| `join-geo-room` | Client → Server | Patient joins a geo-room based on location |
| `slot-opened` | Doctor → Server | Doctor creates/opens a new time slot |
| `new-slot` | Server → Geo-Room | Broadcasts new slot to patients in the area |
| `book-slot` | Patient → Server | Patient books an available slot |
| `slot-booked` | Server → Geo-Room | Notifies all users in the room that the slot is taken |
| `booking-confirmed` | Server → Patient | Confirms booking to the specific patient |
| `slot-cancelled` | Server → Geo-Room | Broadcasts when a doctor cancels a slot |

---

## 🔒 Authentication Flow

```
1. User registers → password hashed with bcrypt → stored in MongoDB
2. User logs in → credentials verified → server returns JWT token
3. Client stores JWT in localStorage
4. Every API request includes JWT in Authorization header:
   Authorization: Bearer <token>
5. Server middleware verifies JWT → extracts user role
6. Role middleware checks permissions (patient/doctor/admin)
```

---

## 🗺️ Geospatial Search — How It Works

The `User` (Doctor) model stores location as a GeoJSON point:

```javascript
// models/User.js
location: {
  type: {
    type: String,
    enum: ["Point"],
    default: "Point"
  },
  coordinates: {
    type: [Number],  // [longitude, latitude]
    required: true
  }
}

// Create 2dsphere index for geospatial queries
UserSchema.index({ location: "2dsphere" });
```

Finding nearby doctors:

```javascript
// controllers/doctorController.js
const nearbyDoctors = await User.find({
  role: "doctor",
  location: {
    $near: {
      $geometry: {
        type: "Point",
        coordinates: [lng, lat]
      },
      $maxDistance: radius * 1000  // radius in meters
    }
  }
});
```

---

## 👥 User Roles

| Role | Permissions |
|------|------------|
| **Patient** | Search nearby doctors, view available slots, book appointments, view booking history |
| **Doctor** | Manage profile, create/update/delete time slots, view patient bookings |
| **Admin** | Manage all users, view platform analytics, moderate listings |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 🤖 AI-Powered Symptom Chatbot

LocalMed includes an **intelligent symptom analysis chatbot** powered by **Google Gemini API** that helps patients describe their health concerns and recommends the optimal doctor specialization to visit.

### Features

- **Conversational Interface** — Chat-style UI accessible via floating button (bottom-right corner)
- **Symptom Analysis** — Uses Google Gemini 2.0 Flash to understand patient symptoms
- **Doctor Specialization Recommendation** — Recommends the most appropriate doctor type to consult
- **Urgency Assessment** — Classifies symptoms as `routine`, `soon`, or `urgent`
- **Conversation Memory** — Maintains context across multiple messages for coherent conversations
- **Intelligent Follow-ups** — Asks clarifying questions when symptoms are vague
- **Direct Doctor Search Integration** — "Find [Specialization] Doctors Near Me" button redirects to doctor search with specialization pre-filtered
- **Rate Limiting** — Protects API from abuse (10 requests per minute per user)
- **Mobile Responsive** — Works seamlessly on desktop and mobile devices

### How It Works

1. **Patient Input** — User clicks the floating chat button and describes their symptoms
2. **Backend Processing** — Request is sent to `/api/chatbot/analyze` endpoint with JWT authentication
3. **Gemini Analysis** — Google Gemini 2.0 Flash analyzes symptoms against a medical triage system prompt
4. **Recommendation** — AI returns JSON response with:
   - Recommended doctor specialization
   - Confidence level (high/medium/low)
   - Reason for recommendation
   - Urgency level
   - Optional follow-up questions
5. **User Action** — Patient can immediately search for nearby doctors of recommended specialization

### File Structure

```
backend/
├── controllers/
│   └── chatbotController.js        # Gemini API integration
├── routes/
│   └── chatbotRoutes.js            # Chatbot endpoints + rate limiting
└── .env                            # GEMINI_API_KEY environment variable

frontend/
├── components/Chatbot/
│   ├── SymptomChatbot.jsx         # Chat UI component
│   └── SymptomChatbot.css         # Styling with animations
└── pages/Search.jsx               # Updated with specialization filter
```

### Setup Instructions

#### Step 1: Get Google Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the API key

#### Step 2: Configure Environment Variables

Add to `.env` in the `backend/` directory:

```env
GEMINI_API_KEY=your-google-gemini-api-key-here
```

#### Step 3: Install Dependencies

```bash
cd backend
npm install @google/generative-ai express-rate-limit
```

#### Step 4: Start the Server

```bash
npm run dev
```

The chatbot will automatically be available in the frontend (bottom-right floating button).

### API Endpoint

**POST `/api/chatbot/analyze`**

**Authentication:** Requires JWT token in `Authorization: Bearer <token>` header

**Rate Limit:** 10 requests per minute per user

**Request Body:**
```json
{
  "message": "I have a severe headache and blurry vision",
  "conversationHistory": [
    {
      "role": "user",
      "content": "previous message"
    },
    {
      "role": "assistant",
      "content": "previous response"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "analysis": {
    "specialization": "Neurologist",
    "confidence": "high",
    "reason": "Headache combined with blurry vision suggests a neurological issue requiring specialist evaluation.",
    "urgency": "soon",
    "followUpQuestions": [
      "How long have you had these symptoms?",
      "Have you experienced similar episodes before?"
    ]
  },
  "messageId": 1712742894123
}
```

### Test Conversations

Try these symptom inputs to test the chatbot:

| Symptoms | Expected Specialization |
|----------|------------------------|
| "I have a severe headache and blurry vision" | Neurologist |
| "My knee hurts when I climb stairs" | Orthopedic |
| "I have a rash on my arm that won't go away" | Dermatologist |
| "I feel very anxious and can't sleep" | Psychiatrist |
| "My child has a high fever and cough" | Pediatrician |

### Error Handling

The chatbot gracefully handles errors:

- **Empty/Short Symptoms** → "Please describe your symptoms in more detail"
- **API Rate Limit** → "I'm a bit busy right now. Please try again in a moment"
- **Network Error** → "Unable to connect. Please check your internet"
- **Gemini API Failure** → "Unable to analyze symptoms. Please try again"

### Security

- ✅ API key is **never exposed** to the frontend
- ✅ All API calls go through Express backend with JWT authentication
- ✅ Rate limiting prevents abuse
- ✅ Only authenticated patients can access the chatbot

---

## 📄 License

This project is licensed under the MIT License.

---

## 📬 Contact

**Nishant Awasthi**
- 📧 [nishantawasthi175@gmail.com](mailto:nishantawasthi175@gmail.com)
- 💼 [LinkedIn](https://www.linkedin.com/in/nishant-awasthi-56557428a/)
- 🐙 [GitHub](https://github.com/Nishant-175)
