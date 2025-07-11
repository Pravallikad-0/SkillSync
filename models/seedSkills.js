const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.resolve(__dirname, '../.env') });
const Skill = require('./Skill');
const MONGODB_URI = YOUR_MONGODB_URL;
const seedSkills = [
  {
    name: 'Machine Learning',
    category: 'Technology',
    isPremium: true,
    description: 'Learn advanced machine learning algorithms and techniques',
    difficulty: 'Advanced',
    estimatedTime: '4-6 hours',
    popularity: 95
  },
  {
    name: 'Data Science',
    category: 'Technology',
    isPremium: true,
    description: 'Master data analysis, visualization, and statistical modeling',
    difficulty: 'Advanced',
    estimatedTime: '5-8 hours',
    popularity: 90
  },
  {
    name: 'AI',
    category: 'Technology',
    isPremium: true,
    description: 'Artificial Intelligence fundamentals and applications',
    difficulty: 'Advanced',
    estimatedTime: '6-10 hours',
    popularity: 88
  },
  {
    name: 'Blockchain',
    category: 'Technology',
    isPremium: true,
    description: 'Understand blockchain technology and cryptocurrency',
    difficulty: 'Advanced',
    estimatedTime: '3-5 hours',
    popularity: 75
  },
  {
    name: 'Cloud Computing',
    category: 'Technology',
    isPremium: true,
    description: 'AWS, Azure, and Google Cloud platform skills',
    difficulty: 'Intermediate',
    estimatedTime: '4-6 hours',
    popularity: 82
  },
  {
    name: 'DevOps',
    category: 'Technology',
    isPremium: true,
    description: 'CI/CD, containerization, and infrastructure automation',
    difficulty: 'Advanced',
    estimatedTime: '5-8 hours',
    popularity: 78
  },
  {
    name: 'Cybersecurity',
    category: 'Technology',
    isPremium: true,
    description: 'Network security, ethical hacking, and data protection',
    difficulty: 'Advanced',
    estimatedTime: '4-7 hours',
    popularity: 85
  },
  {
    name: 'Full-Stack Development',
    category: 'Technology',
    isPremium: true,
    description: 'Complete web development from frontend to backend',
    difficulty: 'Advanced',
    estimatedTime: '8-12 hours',
    popularity: 92
  },
  {
    name: 'HTML',
    category: 'Technology',
    isPremium: false,
    description: 'Basic web markup language',
    difficulty: 'Beginner',
    estimatedTime: '1-2 hours',
    popularity: 70
  },
  {
    name: 'CSS',
    category: 'Technology',
    isPremium: false,
    description: 'Styling and layout for web pages',
    difficulty: 'Beginner',
    estimatedTime: '2-3 hours',
    popularity: 68
  },
  {
    name: 'JavaScript',
    category: 'Technology',
    isPremium: false,
    description: 'Programming language for web development',
    difficulty: 'Intermediate',
    estimatedTime: '3-5 hours',
    popularity: 85
  },
  {
    name: 'Python',
    category: 'Technology',
    isPremium: false,
    description: 'Versatile programming language',
    difficulty: 'Beginner',
    estimatedTime: '2-4 hours',
    popularity: 80
  },
  {
    name: 'React',
    category: 'Technology',
    isPremium: false,
    description: 'Popular JavaScript library for building UIs',
    difficulty: 'Intermediate',
    estimatedTime: '3-5 hours',
    popularity: 75
  },
  {
    name: 'Graphic Design',
    category: 'Design',
    isPremium: false,
    description: 'Visual communication and design principles',
    difficulty: 'Beginner',
    estimatedTime: '2-4 hours',
    popularity: 65
  },
  {
    name: 'UI/UX Design',
    category: 'Design',
    isPremium: true,
    description: 'User interface and experience design',
    difficulty: 'Intermediate',
    estimatedTime: '4-6 hours',
    popularity: 72
  },
  {
    name: 'Adobe Photoshop',
    category: 'Design',
    isPremium: false,
    description: 'Photo editing and digital art',
    difficulty: 'Intermediate',
    estimatedTime: '2-3 hours',
    popularity: 60
  },
  {
    name: 'Digital Marketing',
    category: 'Business',
    isPremium: false,
    description: 'Online marketing strategies and tools',
    difficulty: 'Beginner',
    estimatedTime: '2-3 hours',
    popularity: 70
  },
  {
    name: 'Project Management',
    category: 'Business',
    isPremium: false,
    description: 'Planning, executing, and managing projects',
    difficulty: 'Intermediate',
    estimatedTime: '3-4 hours',
    popularity: 65
  },
  {
    name: 'Financial Planning',
    category: 'Business',
    isPremium: false,
    description: 'Personal and business financial management',
    difficulty: 'Intermediate',
    estimatedTime: '2-4 hours',
    popularity: 55
  },
  {
    name: 'Spanish',
    category: 'Language',
    isPremium: false,
    description: 'Learn conversational Spanish',
    difficulty: 'Beginner',
    estimatedTime: '1-2 hours',
    popularity: 60
  },
  {
    name: 'French',
    category: 'Language',
    isPremium: false,
    description: 'Basic French conversation and grammar',
    difficulty: 'Beginner',
    estimatedTime: '1-2 hours',
    popularity: 55
  },
  {
    name: 'Mandarin',
    category: 'Language',
    isPremium: false,
    description: 'Chinese language basics',
    difficulty: 'Intermediate',
    estimatedTime: '2-3 hours',
    popularity: 50
  },
  {
    name: 'Yoga',
    category: 'Health',
    isPremium: false,
    description: 'Basic yoga poses and breathing techniques',
    difficulty: 'Beginner',
    estimatedTime: '1-2 hours',
    popularity: 45
  },
  {
    name: 'Fitness Training',
    category: 'Health',
    isPremium: false,
    description: 'Exercise routines and fitness planning',
    difficulty: 'Beginner',
    estimatedTime: '1-2 hours',
    popularity: 50
  },
  {
    name: 'Nutrition',
    category: 'Health',
    isPremium: false,
    description: 'Healthy eating and meal planning',
    difficulty: 'Beginner',
    estimatedTime: '1-2 hours',
    popularity: 48
  },
  {
    name: 'Photography',
    category: 'Arts',
    isPremium: false,
    description: 'Basic photography techniques and composition',
    difficulty: 'Beginner',
    estimatedTime: '2-3 hours',
    popularity: 55
  },
  {
    name: 'Music Production',
    category: 'Arts',
    isPremium: false,
    description: 'Digital audio workstation and music creation',
    difficulty: 'Intermediate',
    estimatedTime: '3-5 hours',
    popularity: 40
  },
  {
    name: 'Cooking',
    category: 'Arts',
    isPremium: false,
    description: 'Basic cooking techniques and recipes',
    difficulty: 'Beginner',
    estimatedTime: '1-2 hours',
    popularity: 65
  }
];
mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    await Skill.deleteMany({});
    console.log('Old skills removed');
    await Skill.insertMany(seedSkills);
    console.log('Sample skills added');
    mongoose.disconnect();
  })
  .catch((err) => {
    console.error('Error seeding skills:', err);
    mongoose.disconnect();
  });
