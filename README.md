Fullstack To-Do App

This project is a comprehensive task management system built to demonstrate advanced fullstack
capabilities, specifically focusing on secure user authentication and personalized data management.

  Core Features
- Secure Authentication: Implemented JWT (JSON Web Token) to ensure that only authorized users can access their tasks.
- Personalized Experience: Each user has their own secure account and can only view, add, or edit their specific to-do list.
- Full CRUD Operations: Users can create, read, update (mark as completed), and delete tasks.
- Database Integration: Persistent storage using MySQL with Entity Framework Core.

  Tech Stack
- Backend: .NET 8 Minimal API, C#, Entity Framework Core.
- Frontend: React (Vite/CRA), Axios for API communication.
- Security: JWT Bearer Authentication, Axios Interceptors (handling 401 Unauthorized errors).
- Database: MySQL.

  How it Works
1. Registration/Login: Users create an account or sign in to receive a secure token.
2. Authorization: The React app stores the token in localStorage and automatically attaches it to the header of every request using an Axios Interceptor.
3. Data Fetching: The API filters tasks based on the UserId extracted from the JWT token, ensuring total data privacy between users.
