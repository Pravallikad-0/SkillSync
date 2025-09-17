const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const User = require('./User');

const MONGODB_URI = process.env.MONGODB_URI || <mongodb_url>;

const seedUsers = [
  {
    name: 'Alice Kumar',
    email: 'alice@example.com',
    phone: '+1-555-0101',
    password: 'hashedpassword1', 
    bio: 'Passionate about web development.',
    skillsToTeach: ['React', 'CSS', 'Machine Learning'],
    skillsToLearn: ['Node.js'],
    skillKarma: 120,
    averageRating: 4.8,
    totalRatings: 25,
    subscriptionPlan: 'yearly',
    subscriptionExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
  },
  {
    name: 'Bob Mehta',
    email: 'bob@example.com',
    phone: '+1-555-0102',
    password: 'hashedpassword2',
    bio: 'Loves backend systems.',
    skillsToTeach: ['Node.js', 'MongoDB'],
    skillsToLearn: ['React'],
    skillKarma: 95,
    averageRating: 4.6,
    totalRatings: 18,
    subscriptionPlan: 'free'
  },
  {
    name: 'Chitra Verma',
    email: 'chitra@example.com',
    phone: '+1-555-0103',
    password: 'hashedpassword3',
    bio: 'Machine Learning enthusiast.',
    skillsToTeach: ['Python', 'Machine Learning', 'Data Science'],
    skillsToLearn: ['Web Dev'],
    skillKarma: 150,
    averageRating: 4.9,
    totalRatings: 30,
    subscriptionPlan: 'monthly',
    subscriptionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  },
   {
    name: 'David Wilson',
    email: 'david@example.com',
    phone: '+1-555-0104',
    password: 'password123',
    bio: 'Financial analyst and investment advisor. Passionate about financial literacy and helping others achieve their goals.',
    skillsToTeach: ['Financial Planning', 'Excel', 'Data Analysis', 'Investment Strategy'],
    skillsToLearn: ['Coding', 'Machine Learning', 'Blockchain'],
    skillKarma: 67,
    averageRating: 4.4,
    totalRatings: 6,
    subscriptionPlan: 'free'
  },
  {
    name: 'Emma Brown',
    email: 'emma@example.com',
    phone: '+1-555-0105',
    password: 'password123',
    bio: 'Graphic designer and artist. Love creating beautiful designs and teaching others about visual communication.',
    skillsToTeach: ['Graphic Design', 'Adobe Photoshop', 'Illustrator', 'Canva', 'Branding'],
    skillsToLearn: ['Web Development', 'Animation', '3D Modeling', 'Video Production'],
    skillKarma: 78,
    averageRating: 4.7,
    totalRatings: 10,
    subscriptionPlan: 'yearly',
    subscriptionExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
  },
  {
    name: 'Frank Miller',
    email: 'frank@example.com',
    phone: '+1-555-0106',
    password: 'password123',
    bio: 'Professional chef and culinary instructor. Bringing the joy of cooking to everyone.',
    skillsToTeach: ['Cooking', 'Baking', 'Meal Planning', 'Food Photography'],
    skillsToLearn: ['Business Management', 'Marketing', 'Social Media', 'Accounting'],
    skillKarma: 54,
    averageRating: 4.3,
    totalRatings: 7,
    subscriptionPlan: 'free'
  },
  {
    name: 'Grace Lee',
    email: 'grace@example.com',
    phone: '+1-555-0107',
    password: 'password123',
    bio: 'Language teacher and polyglot. Fluent in 6 languages and passionate about cultural exchange.',
    skillsToTeach: ['Spanish', 'French', 'Mandarin', 'Language Learning', 'Translation'],
    skillsToLearn: ['Programming', 'Web Design', 'Digital Marketing', 'Photography'],
    skillKarma: 89,
    averageRating: 4.8,
    totalRatings: 14,
    subscriptionPlan: 'monthly',
    subscriptionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  },
  {
    name: 'Henry Taylor',
    email: 'henry@example.com',
    phone: '+1-555-0108',
    password: 'password123',
    bio: 'Music producer and sound engineer. 10+ years in the music industry.',
    skillsToTeach: ['Music Production', 'Audio Engineering', 'Guitar', 'Piano', 'Songwriting'],
    skillsToLearn: ['Video Editing', 'Live Streaming', 'Podcast Production', 'Marketing'],
    skillKarma: 63,
    averageRating: 4.5,
    totalRatings: 9,
    subscriptionPlan: 'free'
  },
  {
    name: 'Isabella Martinez',
    email: 'isabella@example.com',
    phone: '+1-555-0109',
    password: 'password123',
    bio: 'Data scientist and AI researcher. Passionate about using technology to solve real-world problems.',
    skillsToTeach: ['Python', 'Machine Learning', 'Data Science', 'Statistics', 'AI', 'Deep Learning'],
    skillsToLearn: ['Public Speaking', 'Business Strategy', 'Leadership', 'Communication'],
    skillKarma: 95,
    averageRating: 4.9,
    totalRatings: 18,
    subscriptionPlan: 'yearly',
    subscriptionExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
  },
  {
    name: 'Jack Anderson',
    email: 'jack@example.com',
    phone: '+1-555-0110',
    password: 'password123',
    bio: 'Fitness trainer and nutrition coach. Helping people achieve their health and fitness goals.',
    skillsToTeach: ['Fitness Training', 'Nutrition', 'Weight Loss', 'Muscle Building'],
    skillsToLearn: ['Business Development', 'App Development', 'Photography', 'Video Production'],
    skillKarma: 71,
    averageRating: 4.6,
    totalRatings: 11,
    subscriptionPlan: 'free'
  }
];

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    await User.deleteMany({});
    console.log('Old users removed');
    await User.insertMany(seedUsers);
    console.log('Sample users added');
    mongoose.disconnect();
  })
  .catch((err) => {
    console.error('Error seeding users:', err);
    mongoose.disconnect();
  });
