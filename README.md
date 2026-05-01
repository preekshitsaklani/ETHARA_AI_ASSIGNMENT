# Team Task Manager
A full-stack web application designed to help teams create projects, assign tasks, and track progress with role-based access control. 


## 🚀 Live Demo
- **Live URL (Railway):** https://etharaaiassignment-production-9c10.up.railway.app/
- **Demo Video:** https://www.loom.com/share/2ee0c4e3f67a460e99d45774258fac69


## ✨ Key Features
- **Authentication & Authorization:** Secure signup and login using JWT and bcrypt.
- **Role-Based Access Control:** 
  - **Admins:** Can create projects, assign tasks to members, and view all tasks across the system.
  - **Members:** Can view their assigned tasks and mark them as completed.
- **Project & Task Management:** Create projects, set task due dates, and track statuses (Pending, Completed, Overdue).
- **Interactive Dashboard:** Dynamic frontend that adapts based on the logged-in user's role.


## 🛠️ Tech Stack
- **Frontend:** HTML5, CSS3, Vanilla JavaScript (DOM manipulation and Fetch API)
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose ODMs)
- **Security:** JSON Web Tokens (JWT) for session management, bcryptjs for password hashing


## ⚙️ Local Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/preekshitsaklani/ETHARA_AI_ASSIGNMENT.git
   cd ETHARA_AI_ASSIGNMENT
   ```

2. **Install dependencies**
  ```bash
  npm install
  ```

3. **Configure Environment Variables**
  ```bash
  PORT=3000
  MONGO_URI=your_mongodb_connection_string
  JWT_SECRET=your_super_secret_key
  ```

4. **Run the application**
  ```bash
  node server.js
  ```


# 📦 Deployment
This application is fully containerized/configured and deployed via Railway.
