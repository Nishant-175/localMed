# LocalMed - Real-Time Doctor Availability Platform

LocalMed is a real-time healthcare platform that connects patients with nearby doctors. The core differentiator is the **live slot engine** — when a doctor marks themselves available, all nearby searching patients see it instantly without refreshing.

## Features

### For Patients
- 🔍 **Real-Time Search**: Find doctors by specialty with live availability status
- 📍 **Location-Based Discovery**: See nearby doctors on an interactive map
- 🚀 **Instant Booking**: Book appointments with available doctors immediately
- 💬 **Real-Time Notifications**: Get notified when doctors become available
- 📅 **Easy Appointment Management**: Track your upcoming and past appointments

### For Doctors
- ✅ **Quick Availability Toggle**: Go online/offline instantly
- 👥 **Appointment Management**: View and manage all your appointments
- 📊 **Doctor Profile**: Showcase your credentials, specialization, and clinic details
- 🔔 **Instant Alerts**: Real-time notifications when patients book with you
- 📍 **Clinic Location**: Set your clinic location for patients to find you

## Tech Stack

### Frontend
- **React 18**: UI library
- **React Router v6**: Navigation
- **Axios**: API calls
- **Socket.IO Client**: Real-time communication
- **Leaflet/React-Leaflet**: Map integration

### Backend
- **Express.js**: Web framework
- **Node.js**: Runtime
- **MongoDB**: Database
- **Socket.IO**: Real-time engine
- **JWT**: Authentication
- **Bcryptjs**: Password hashing
- **Twilio**: SMS notifications

## Project Structure

```
localmed/
├── client/                      # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/          # Navbar, Footer, Loader, ProtectedRoute
│   │   │   ├── patient/         # SearchBar, DoctorCard, BookingModal, MapView
│   │   │   └── doctor/          # SlotToggle, AppointmentList, ProfileForm
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Search.jsx       # Main patient search page
│   │   │   ├── DoctorDashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── context/             # AuthContext, SocketContext
│   │   ├── hooks/               # useSocket, useGeolocation, useSearch
│   │   └── services/            # api.js (axios instance), socket.js
│
├── server/                      # Express backend
│   ├── models/
│   │   ├── User.js
│   │   ├── Doctor.js
│   │   ├── Appointment.js
│   │   └── Slot.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── doctors.js
│   │   ├── appointments.js
│   │   └── slots.js
│   ├── controllers/
│   ├── middleware/
│   │   ├── auth.js              # JWT verify
│   │   └── roleCheck.js
│   ├── socket/
│   │   └── slotHandler.js       # Socket.io event handlers
│   ├── utils/
│   │   └── smsService.js        # Twilio wrapper
│   └── server.js
```

## Getting Started

### Prerequisites
- Node.js (v14+)
- npm or yarn
- MongoDB (local or Atlas)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd localmed
   ```

2. **Install dependencies for both client and server**
   ```bash
   npm run install-all
   ```

3. **Set up environment variables**

   **Server (.env)**
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/localmed
   JWT_SECRET=your-jwt-secret-key
   CLIENT_URL=http://localhost:3000
   TWILIO_ACCOUNT_SID=your-twilio-sid
   TWILIO_AUTH_TOKEN=your-twilio-token
   TWILIO_PHONE_NUMBER=+1234567890
   ```

   **Client (.env)**
   ```
   REACT_APP_API_URL=http://localhost:5000/api
   REACT_APP_SERVER_URL=http://localhost:5000
   ```

4. **Start the development servers**
   ```bash
   npm run dev
   ```

   This will start:
   - Frontend at `http://localhost:3000`
   - Backend at `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Doctors
- `GET /api/doctors/nearby` - Get nearby doctors
- `GET /api/doctors/specialty/:specialty` - Get doctors by specialty
- `GET /api/doctors/:id` - Get doctor profile
- `PUT /api/doctors/:id` - Update doctor profile

### Appointments
- `GET /api/appointments` - Get user's appointments
- `POST /api/appointments` - Create appointment
- `PUT /api/appointments/:id` - Update appointment

### Slots
- `GET /api/slots/doctor/:doctorId` - Get doctor's available slots
- `POST /api/slots` - Create slots (doctor only)
- `PUT /api/slots/toggle/:doctorId` - Toggle doctor availability

## Socket Events

### Doctor Events
- `doctor:online` - Doctor goes online
- `doctor:offline` - Doctor goes offline
- `doctor:available` - Doctor becomes available (broadcast to patients)
- `doctor:unavailable` - Doctor becomes unavailable (broadcast to patients)

### Appointment Events
- `appointment:created` - New appointment created
- `appointment:new` - New appointment notification to doctor
- `appointment:updated` - Appointment status updated

### Slot Events
- `slot:updated` - Slot status updated
- `slot:changed` - Slot changes broadcast

## Key Features Implementation

### Real-Time Availability
When a doctor toggles their availability status, Socket.IO broadcasts the change to all connected patients in real-time, ensuring they always see current availability without refreshing.

### Location-Based Search
Doctors can be searched by location using geospatial queries. The map component displays nearby doctors and allows patients to filter by distance.

### Instant Notifications
The Twilio SMS service sends notifications to patients when a doctor they're waiting for becomes available.

## Development Tips

1. **Hot Reloading**: Both client and server support hot reloading
2. **Database**: Start MongoDB locally or use MongoDB Atlas
3. **Testing**: Use Postman for API testing
4. **Socket Testing**: Use Socket.IO admin UI at `http://localhost:5000/admin`

## Future Enhancements

- [ ] Video consultation support
- [ ] Doctor ratings and reviews
- [ ] Insurance integration
- [ ] Prescription management
- [ ] Medical records storage
- [ ] Payment gateway integration
- [ ] Mobile app (React Native)
- [ ] Advanced scheduling
- [ ] Multi-language support

## License

ISC

## Support

For issues and support, please open an issue on the GitHub repository.
