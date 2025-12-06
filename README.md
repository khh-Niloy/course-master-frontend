# Course Master

A modern Learning Management System (LMS) frontend for managing courses, batches, assignments, and quizzes.

## Problem Solved

Course Master addresses the need for educational institutions and instructors to efficiently manage their online learning programs. It streamlines course delivery, student enrollment, assignment submission, and quiz administration in a single platform.

## Key Features

- **Course Management** - Create, edit, and organize courses with modules
- **Batch Management** - Organize students into batches for structured learning
- **Assignment System** - Create assignments, review submissions, and track progress
- **Quiz Management** - Build quizzes and track student performance
- **Enrollment System** - Manage student enrollments and course access
- **Student Learning Interface** - Interactive learning experience with progress tracking
- **Role-Based Access** - Separate dashboards for students, instructors, and administrators

## Technologies

- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Redux Toolkit** - State management
- **Tailwind CSS** - Styling
- **Radix UI** - Accessible component primitives
- **React Hook Form** - Form handling
- **Axios** - HTTP client
- **Zod** - Schema validation

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd course-master-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory with your API configuration:
```env
NEXT_PUBLIC_API_URL=your-api-url
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```
