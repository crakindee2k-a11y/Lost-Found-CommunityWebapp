# FindX - Lost & Found Community Platform

A full-stack web application that connects people who have lost items with those who have found them. FindX provides a secure, community-driven platform for reporting and recovering lost belongings with real-time messaging, location tracking, and user verification.

## ✨ Features

### Core Functionality
- **Post Lost/Found Items** - Create detailed posts with images, descriptions, categories, and location data
- **Advanced Search & Filters** - Search by category, location, date range, and keywords
- **Real-time Messaging** - Direct communication between users to coordinate item returns
- **Interactive Maps** - Leaflet-powered location picker and display for precise item locations
- **User Verification System** - NID-based identity verification with admin approval workflow
- **Notifications** - Real-time alerts for messages, comments, and post updates

### Security & Moderation
- **JWT Authentication** - Secure token-based authentication with bcrypt password hashing
- **Role-based Access Control** - User and admin roles with protected routes
- **Report System** - Community reporting for inappropriate content
- **Admin Dashboard** - Comprehensive moderation tools for users, posts, reports, and verifications
- **Rate Limiting** - API protection against abuse (1000 requests per 15 minutes)
- **Security Headers** - Helmet.js integration for enhanced security

### User Experience
- **Responsive Design** - Mobile-first UI that works seamlessly across all devices
- **Avatar Upload** - Custom profile pictures with image optimization
- **Comment System** - Engage with posts through threaded comments
- **User Profiles** - Public profiles showing post history and statistics
- **Success Stories** - Showcase of successful item recoveries
- **Accessibility** - WCAG-compliant design with keyboard navigation support

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern UI library with hooks
- **React Router v7** - Client-side routing
- **Axios** - HTTP client with interceptors
- **Leaflet & React-Leaflet** - Interactive maps
- **CSS3** - Custom styling with responsive design

### Backend
- **Node.js & Express** - RESTful API server
- **MongoDB & Mongoose** - NoSQL database with ODM
- **JWT** - JSON Web Tokens for authentication
- **Multer** - File upload handling
- **bcryptjs** - Password hashing
- **Helmet** - Security middleware
- **Morgan** - HTTP request logging
- **CORS** - Cross-origin resource sharing

### DevOps
- **Docker** - Containerized deployment
- **MongoDB Memory Server** - Development fallback
- **Nodemon** - Development hot-reload

## 📁 Project Structure

```
FindX/
├── backend/                 # Express API server
│   ├── config/             # Database and app configuration
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Auth, upload, and validation middleware
│   ├── models/             # Mongoose schemas
│   ├── routes/             # API route definitions
│   ├── uploads/            # User-generated files (gitignored)
│   └── server.js           # Entry point
├── frontend/               # React application
│   ├── public/             # Static assets
│   └── src/
│       ├── components/     # Reusable UI components
│       ├── context/        # React Context (Auth)
│       ├── pages/          # Route pages
│       ├── services/       # API client
│       └── utils/          # Helper functions
├── Dockerfile              # Production container
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- MongoDB (local or Atlas)
- Git

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/crakindee2k-a11y/Lost-Found-CommunityWebapp.git
   cd Lost-Found-CommunityWebapp
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env and set your MongoDB URI and JWT secret
   npm run dev
   ```
   Backend runs on `http://localhost:5000`

3. **Frontend Setup** (in a new terminal)
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   # Edit .env if needed (defaults to localhost:5000)
   npm start
   ```
   Frontend runs on `http://localhost:3000`

### Environment Variables

#### Backend (`backend/.env`)
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/findx
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRE=7d
```

#### Frontend (`frontend/.env`)
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_APP_NAME=FindX
```

## 🐳 Docker Deployment

The included `Dockerfile` builds a production-ready container:

```bash
docker build -t findx .
docker run -p 5000:5000 \
  -e NODE_ENV=production \
  -e JWT_SECRET=your-secret \
  -e MONGODB_URI=your-mongo-uri \
  findx
```

The backend serves the built React frontend in production.

## ☁️ Cloud Deployment

### Railway

1. Push this repo to GitHub
2. Create a new Railway project from GitHub
3. Add a MongoDB plugin (provides `MONGO_URL` automatically)
4. Set environment variables:
   - `NODE_ENV=production`
   - `JWT_SECRET=<strong-random-string>`
5. Deploy (Railway auto-detects the Dockerfile)

### Vercel + MongoDB Atlas

**Backend** (Railway/Render/Heroku recommended for Node.js)
- Deploy backend separately
- Set `MONGODB_URI` to your Atlas connection string

**Frontend** (Vercel)
- Deploy `frontend/` folder
- Set `REACT_APP_API_URL` to your backend URL

### Docker Compose

```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:7
    volumes:
      - mongo-data:/data/db
  
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongodb:27017/findx
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - mongodb

volumes:
  mongo-data:
```

## 📝 API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Posts
- `GET /api/posts` - Get all posts (with filters)
- `GET /api/posts/:id` - Get single post
- `POST /api/posts` - Create post (auth required)
- `PUT /api/posts/:id` - Update post (auth required)
- `DELETE /api/posts/:id` - Delete post (auth required)

### Users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/profile` - Update profile (auth required)
- `POST /api/users/avatar` - Upload avatar (auth required)
- `POST /api/users/verification/submit` - Submit verification docs

### Messages
- `GET /api/messages/conversations` - Get conversations
- `GET /api/messages/user/:userId` - Get messages with user
- `POST /api/messages` - Send message

### Admin (admin role required)
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/verifications/pending` - Pending verifications
- `PUT /api/admin/verifications/:userId/approve` - Approve verification
- `GET /api/admin/users` - Manage users
- `GET /api/admin/reports` - View reports

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

**Deen** - [GitHub](https://github.com/crakindee2k-a11y)

## 🙏 Acknowledgments

- OpenStreetMap for map tiles and geocoding
- Leaflet for interactive maps
- MongoDB for flexible data storage
- The open-source community

## 📞 Support

For issues, questions, or suggestions, please open an issue on GitHub.

---

**Note:** User uploads are stored locally in `backend/uploads/` and are ephemeral on platforms like Railway. For production, consider integrating cloud storage (AWS S3, Cloudinary, etc.) for persistent file storage.
