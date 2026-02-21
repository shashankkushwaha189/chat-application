# Modern Chat Application 🚀

A full-stack, real-time chat application with integrated multimedia support, group management, and a premium user interface.

## ✨ Features

- **Real-time Messaging**: Instant communication powered by Socket.io.
- **Multimedia Support**: Send and receive Images, Audio, Video, and Voice messages.
- **Advanced Group Chats**: 
  - Guided 2-step group creation process.
  - Admin management and clear member identification.
  - Distinct "Admin" badges for group creators.
- **Sleek Sidebar**: Categorized tabs for "Personal" and "Group" chats with visual icons.
- **Modern UI/UX**:
  - Polished, minimal design with glassmorphism effects.
  - Hidden scrollbars for a clean, app-like experience.
  - Real-time typing indicators.
- **Secure Authentication**: User registration and login with JWT-based sessions.
- **User Search**: Easily find and connect with other users.

## 🛠️ Tech Stack

- **Frontend**: React, Chakra UI, Framer Motion, Socket.io-client.
- **Backend**: Node.js, Express, Socket.io, Mongoose (MongoDB).
- **Authentication**: JSON Web Tokens (JWT) and BCrypt for password hashing.
- **Media Handling**: Multer for file uploads.

## ⚙️ Environment Setup

Create a `.env` file in the root directory and add the following variables:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key_for_jwt
CLIENT_URL=http://localhost:3000
```

| Variable | Description | Default |
| :--- | :--- | :--- |
| `PORT` | The port the backend server will run on. | `5000` |
| `MONGO_URI` | Your MongoDB connection string. | - |
| `JWT_SECRET` | Secret key used for signing JWT tokens. | - |
| `CLIENT_URL` | The URL of your local frontend for CORS. | `http://localhost:3000` |

## 🚀 Getting Started

### 1. Installation

Install all dependencies (root, backend, and frontend) using the unified build script:

```bash
npm run build
```

### 2. Running Locally

**Start Backend (Development):**
```bash
npm run server
```

**Start Frontend (Development):**
```bash
npm run frontend
```

**Start for Production:**
```bash
npm start
```

## 📦 Deployment Readiness

The application is configured to serve the frontend production build directly from the backend.
1. Build the frontend: `npm run build`
2. Set `NODE_ENV=production` on your host.
3. Run `npm start`.

## 🤝 Contributing

Feel free to fork this project and submit pull requests for any features or bug fixes!