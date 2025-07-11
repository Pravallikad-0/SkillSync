SkillSync – Micro-Skill Swapping Network
SkillSync is a micro-skill exchange platform built for peer-to-peer learning. Users can offer and request small, focused skills (like learning Excel, Java, or Photoshop), rate each other, and build their reputation with a Skill Karma score.

Layer	Technology Used
Frontend	HTML, CSS, JavaScript
Backend	Node.js, Express.js
Database	MongoDB
Auth	Custom middleware

User Features
1.User Profile
•	Register with name, email, phone number, password.
•	Add skills you can teach and skills you want to learn.
•	View other users' skills and profiles.
2. Skill Discovery & Filtering
•	Filter users by skill (e.g., show only Java experts).
•	Real-time skill search from frontend to MongoDB.
3. Request a Skill
•	Request to learn a skill from another user.
•	Teachers can accept/reject the request.
•	Optional: Teachers don’t have to request back in return.
4. Rating & Karma System
•	Learners can rate the teaching session.
•	Teachers earn Skill Karma (trust score) and average ratings.
•	System promotes top contributors.


5. Premium Subscriptions 
•	Some high-demand skills (like Data Science, AI, etc.) are premium locked.
•	Subscribed users can:
o	Access exclusive mentors
o	Get priority matching
________________________________________
⚙️ Installation
1. Clone the repo
git clone https://github.com/yourusername/SkillSync.git
cd SkillSync
2. Install dependencies
npm install
3. Set up .env
Create a .env file with the following variables:
PORT=3000
MONGO_URI=your_mongodb_connection_string
4. Seed initial skills (optional)
node models/seedSkills.js
node models/seedData.js
5. Run the app
node server.js
Visit http://localhost:3000 in your browser.
________________________________________



