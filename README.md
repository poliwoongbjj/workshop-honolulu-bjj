# Workshop Honolulu BJJ Technique Library

A full-stack application that allows Workshop Honolulu's jiujitsu students to access a library of techniques instructed by Larry Hope.

## Features

- User authentication and membership management
- Technique library with filtering and search capabilities
- Video player with progress tracking
- User notes and favorites
- Admin dashboard for content management

## Tech Stack

- **Frontend**: React with Vite, React Router, Tailwind CSS
- **Backend**: Express.js, Node.js
- **Database**: MySQL with Sequelize ORM
- **Authentication**: JWT

## Installation

### Prerequisites

- Node.js (v14+)
- npm or yarn
- MySQL (v8+)

### Setup Steps

1. Clone the repository:
   ```
   git clone <your-repo-url>
   cd workshop-honolulu-bjj
   ```

2. Install dependencies:
   ```
   npm run install-all
   ```

3. Configure environment variables:
   - Copy `.env.example` to `.env` in the server directory
   - Update the database credentials and JWT secret

4. Create database:
   ```
   npm run db-setup
   ```

5. Start development servers:
   ```
   npm run dev
   ```

6. Access the application:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## Project Structure

- `/client` - React frontend application
- `/server` - Express backend API
- `/database` - Database setup and migration scripts

## License

[Your License Choice]

