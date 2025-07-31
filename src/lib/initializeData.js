// import {
//   collection,
//   doc,
//   setDoc,
//   addDoc,
//   serverTimestamp,
//   writeBatch,
//   getDocs,
// } from "firebase/firestore";
// import {db} from "./firebase";

// // Initial data structure for AceMind learning platform
// export const initializeFirestoreData = async () => {
//   try {
//     const batch = writeBatch(db);

//     // 1. Create Categories Collection
//     const categories = [
//       {
//         id: "mathematics",
//         name: "Mathematics",
//         description: "Mathematical concepts and problem-solving",
//         icon: "🔢",
//         color: "#3B82F6",
//         subCategories: ["algebra", "calculus", "geometry", "statistics"],
//         isActive: true,
//         createdAt: serverTimestamp(),
//       },
//       {
//         id: "science",
//         name: "Science",
//         description: "Natural sciences and scientific methods",
//         icon: "🔬",
//         color: "#10B981",
//         subCategories: ["physics", "chemistry", "biology", "earth-science"],
//         isActive: true,
//         createdAt: serverTimestamp(),
//       },
//       {
//         id: "technology",
//         name: "Technology",
//         description: "Computer science and technology topics",
//         icon: "💻",
//         color: "#8B5CF6",
//         subCategories: [
//           "programming",
//           "web-development",
//           "ai-ml",
//           "cybersecurity",
//         ],
//         isActive: true,
//         createdAt: serverTimestamp(),
//       },
//       {
//         id: "languages",
//         name: "Languages",
//         description: "Language learning and communication",
//         icon: "🗣️",
//         color: "#F59E0B",
//         subCategories: [
//           "english",
//           "spanish",
//           "french",
//           "programming-languages",
//         ],
//         isActive: true,
//         createdAt: serverTimestamp(),
//       },
//       {
//         id: "business",
//         name: "Business",
//         description: "Business, finance, and entrepreneurship",
//         icon: "💼",
//         color: "#EF4444",
//         subCategories: [
//           "finance",
//           "marketing",
//           "management",
//           "entrepreneurship",
//         ],
//         isActive: true,
//         createdAt: serverTimestamp(),
//       },
//       {
//         id: "creative",
//         name: "Creative Arts",
//         description: "Art, design, music, and creative expression",
//         icon: "🎨",
//         color: "#EC4899",
//         subCategories: ["graphic-design", "music", "writing", "photography"],
//         isActive: true,
//         createdAt: serverTimestamp(),
//       },
//     ];

//     // Add categories to batch
//     categories.forEach((category) => {
//       const categoryRef = doc(db, "categories", category.id);
//       batch.set(categoryRef, category);
//     });

//     // 2. Create Learning Paths Collection
//     const learningPaths = [
//       {
//         id: "web-dev-basics",
//         title: "Web Development Fundamentals",
//         description:
//           "Learn the basics of web development from HTML to modern frameworks",
//         category: "technology",
//         difficulty: "beginner",
//         estimatedHours: 40,
//         tags: ["html", "css", "javascript", "web"],
//         image: "/images/web-dev.jpg",
//         modules: [
//           {
//             id: "html-basics",
//             title: "HTML Fundamentals",
//             order: 1,
//             estimatedMinutes: 300,
//           },
//           {
//             id: "css-styling",
//             title: "CSS Styling",
//             order: 2,
//             estimatedMinutes: 400,
//           },
//           {
//             id: "javascript-intro",
//             title: "JavaScript Introduction",
//             order: 3,
//             estimatedMinutes: 500,
//           },
//           {
//             id: "responsive-design",
//             title: "Responsive Design",
//             order: 4,
//             estimatedMinutes: 300,
//           },
//         ],
//         prerequisites: [],
//         isPublished: true,
//         enrolledCount: 0,
//         rating: 0,
//         createdAt: serverTimestamp(),
//         updatedAt: serverTimestamp(),
//       },
//       {
//         id: "data-science-intro",
//         title: "Introduction to Data Science",
//         description:
//           "Explore data science fundamentals with Python and statistical analysis",
//         category: "science",
//         difficulty: "intermediate",
//         estimatedHours: 60,
//         tags: ["python", "statistics", "data-analysis", "machine-learning"],
//         image: "/images/data-science.jpg",
//         modules: [
//           {
//             id: "python-basics",
//             title: "Python Programming Basics",
//             order: 1,
//             estimatedMinutes: 480,
//           },
//           {
//             id: "data-manipulation",
//             title: "Data Manipulation with Pandas",
//             order: 2,
//             estimatedMinutes: 600,
//           },
//           {
//             id: "data-visualization",
//             title: "Data Visualization",
//             order: 3,
//             estimatedMinutes: 480,
//           },
//           {
//             id: "statistical-analysis",
//             title: "Statistical Analysis",
//             order: 4,
//             estimatedMinutes: 720,
//           },
//         ],
//         prerequisites: ["basic-mathematics"],
//         isPublished: true,
//         enrolledCount: 0,
//         rating: 0,
//         createdAt: serverTimestamp(),
//         updatedAt: serverTimestamp(),
//       },
//       {
//         id: "business-fundamentals",
//         title: "Business Fundamentals",
//         description:
//           "Essential business concepts for entrepreneurs and professionals",
//         category: "business",
//         difficulty: "beginner",
//         estimatedHours: 25,
//         tags: ["entrepreneurship", "finance", "marketing", "strategy"],
//         image: "/images/business.jpg",
//         modules: [
//           {
//             id: "business-planning",
//             title: "Business Planning",
//             order: 1,
//             estimatedMinutes: 360,
//           },
//           {
//             id: "financial-basics",
//             title: "Financial Management",
//             order: 2,
//             estimatedMinutes: 420,
//           },
//           {
//             id: "marketing-intro",
//             title: "Marketing Fundamentals",
//             order: 3,
//             estimatedMinutes: 360,
//           },
//           {
//             id: "leadership-skills",
//             title: "Leadership and Communication",
//             order: 4,
//             estimatedMinutes: 360,
//           },
//         ],
//         prerequisites: [],
//         isPublished: true,
//         enrolledCount: 0,
//         rating: 0,
//         createdAt: serverTimestamp(),
//         updatedAt: serverTimestamp(),
//       },
//     ];

//     // Add learning paths to batch
//     learningPaths.forEach((path) => {
//       const pathRef = doc(db, "learningPaths", path.id);
//       batch.set(pathRef, path);
//     });

//     // 3. Create Study Materials Collection
//     const studyMaterials = [
//       {
//         id: "html-guide",
//         title: "Complete HTML Reference Guide",
//         type: "document",
//         category: "technology",
//         subcategory: "web-development",
//         difficulty: "beginner",
//         content: {
//           description:
//             "Comprehensive guide to HTML elements and best practices",
//           url: "/materials/html-guide.pdf",
//           format: "pdf",
//           pages: 45,
//         },
//         tags: ["html", "web", "frontend", "beginner"],
//         author: "AceMind Team",
//         isPublic: true,
//         downloads: 0,
//         rating: 0,
//         createdAt: serverTimestamp(),
//         updatedAt: serverTimestamp(),
//       },
//       {
//         id: "python-cheatsheet",
//         title: "Python Quick Reference",
//         type: "cheatsheet",
//         category: "technology",
//         subcategory: "programming",
//         difficulty: "intermediate",
//         content: {
//           description: "Essential Python syntax and functions reference",
//           url: "/materials/python-cheatsheet.pdf",
//           format: "pdf",
//           pages: 8,
//         },
//         tags: ["python", "programming", "reference", "cheatsheet"],
//         author: "AceMind Team",
//         isPublic: true,
//         downloads: 0,
//         rating: 0,
//         createdAt: serverTimestamp(),
//         updatedAt: serverTimestamp(),
//       },
//       {
//         id: "business-plan-template",
//         title: "Business Plan Template",
//         type: "template",
//         category: "business",
//         subcategory: "entrepreneurship",
//         difficulty: "beginner",
//         content: {
//           description: "Step-by-step business plan template with examples",
//           url: "/materials/business-plan-template.docx",
//           format: "docx",
//           pages: 25,
//         },
//         tags: ["business", "planning", "template", "entrepreneurship"],
//         author: "AceMind Team",
//         isPublic: true,
//         downloads: 0,
//         rating: 0,
//         createdAt: serverTimestamp(),
//         updatedAt: serverTimestamp(),
//       },
//     ];

//     // Add study materials to batch
//     studyMaterials.forEach((material) => {
//       const materialRef = doc(db, "studyMaterials", material.id);
//       batch.set(materialRef, material);
//     });

//     // 4. Create Quiz Questions Collection
//     const quizQuestions = [
//       {
//         id: "html-basic-1",
//         question: "What does HTML stand for?",
//         type: "multiple-choice",
//         category: "technology",
//         subcategory: "web-development",
//         difficulty: "beginner",
//         options: [
//           "Hyper Text Markup Language",
//           "High Tech Modern Language",
//           "Home Tool Markup Language",
//           "Hyperlink and Text Markup Language",
//         ],
//         correctAnswer: 0,
//         explanation:
//           "HTML stands for Hyper Text Markup Language, which is the standard markup language for creating web pages.",
//         points: 10,
//         tags: ["html", "web", "basics"],
//         createdAt: serverTimestamp(),
//       },
//       {
//         id: "python-basic-1",
//         question:
//           "Which of the following is the correct way to declare a variable in Python?",
//         type: "multiple-choice",
//         category: "technology",
//         subcategory: "programming",
//         difficulty: "beginner",
//         options: ["var x = 5", "x = 5", "int x = 5", "declare x = 5"],
//         correctAnswer: 1,
//         explanation:
//           "In Python, variables are declared simply by assigning a value, like 'x = 5'. No explicit type declaration is needed.",
//         points: 10,
//         tags: ["python", "variables", "basics"],
//         createdAt: serverTimestamp(),
//       },
//       {
//         id: "business-basic-1",
//         question: "What is the primary purpose of a business plan?",
//         type: "multiple-choice",
//         category: "business",
//         subcategory: "planning",
//         difficulty: "beginner",
//         options: [
//           "To impress investors only",
//           "To outline business goals and strategies",
//           "To calculate exact profits",
//           "To register the business legally",
//         ],
//         correctAnswer: 1,
//         explanation:
//           "A business plan's primary purpose is to outline business goals, strategies, and how the business will operate and grow.",
//         points: 10,
//         tags: ["business", "planning", "strategy"],
//         createdAt: serverTimestamp(),
//       },
//     ];

//     // Add quiz questions to batch
//     quizQuestions.forEach((question) => {
//       const questionRef = doc(db, "quizQuestions", question.id);
//       batch.set(questionRef, question);
//     });

//     // 5. Create App Settings Collection
//     const appSettings = {
//       id: "global",
//       appName: "AceMind",
//       version: "1.0.0",
//       features: {
//         quizzes: true,
//         studyMaterials: true,
//         learningPaths: true,
//         progress: true,
//         leaderboard: true,
//         discussions: true,
//       },
//       limits: {
//         maxDailyQuizzes: 50,
//         maxFileUploadSize: 10485760, // 10MB
//         maxLearningPathsPerUser: 10,
//       },
//       maintenance: {
//         isEnabled: false,
//         message: "",
//         startTime: null,
//         endTime: null,
//       },
//       notifications: {
//         welcomeMessage:
//           "Welcome to AceMind! Start your learning journey today.",
//         dailyReminder: true,
//         achievementAlerts: true,
//       },
//       createdAt: serverTimestamp(),
//       updatedAt: serverTimestamp(),
//     };

//     const settingsRef = doc(db, "appSettings", "global");
//     batch.set(settingsRef, appSettings);

//     // Commit the batch
//     await batch.commit();

//     console.log("✅ Initial Firestore data has been successfully created!");
//     return {success: true, message: "Initial data setup completed"};
//   } catch (error) {
//     console.error("❌ Error initializing Firestore data:", error);
//     return {success: false, error: error.message};
//   }
// };

// // Function to create sample user data (call this after user registration)
// export const createSampleUserData = async (userId, userData) => {
//   try {
//     const batch = writeBatch(db);

//     // Create user progress for sample learning paths
//     const userProgress = {
//       userId,
//       enrolledPaths: ["web-dev-basics"],
//       completedModules: [],
//       currentModule: "html-basics",
//       totalStudyTime: 0,
//       streakDays: 0,
//       lastStudyDate: serverTimestamp(),
//       achievements: [],
//       level: 1,
//       experience: 0,
//       createdAt: serverTimestamp(),
//       updatedAt: serverTimestamp(),
//     };

//     const progressRef = doc(db, "userProgress", userId);
//     batch.set(progressRef, userProgress);

//     // Create sample user quiz results
//     const quizResults = {
//       userId,
//       totalQuizzesTaken: 0,
//       totalCorrectAnswers: 0,
//       averageScore: 0,
//       categoryScores: {
//         technology: {correct: 0, total: 0},
//         science: {correct: 0, total: 0},
//         business: {correct: 0, total: 0},
//         mathematics: {correct: 0, total: 0},
//         languages: {correct: 0, total: 0},
//         creative: {correct: 0, total: 0},
//       },
//       recentQuizzes: [],
//       createdAt: serverTimestamp(),
//       updatedAt: serverTimestamp(),
//     };

//     const quizResultsRef = doc(db, "userQuizResults", userId);
//     batch.set(quizResultsRef, quizResults);

//     // Create user preferences
//     const userPreferences = {
//       userId,
//       studyReminders: {
//         enabled: true,
//         time: "18:00",
//         frequency: "daily",
//       },
//       notifications: {
//         achievements: true,
//         progress: true,
//         social: true,
//         marketing: false,
//       },
//       display: {
//         theme: "dark",
//         language: "en",
//         timezone: "UTC",
//       },
//       privacy: {
//         profileVisibility: "public",
//         progressVisibility: "friends",
//         allowDataCollection: true,
//       },
//       createdAt: serverTimestamp(),
//       updatedAt: serverTimestamp(),
//     };

//     const preferencesRef = doc(db, "userPreferences", userId);
//     batch.set(preferencesRef, userPreferences);

//     await batch.commit();

//     console.log("✅ Sample user data created successfully!");
//     return {success: true, message: "Sample user data created"};
//   } catch (error) {
//     console.error("❌ Error creating sample user data:", error);
//     return {success: false, error: error.message};
//   }
// };

// // Function to check if initial data already exists
// export const checkInitialDataExists = async () => {
//   try {
//     const categoriesSnapshot = await getDocs(collection(db, "categories"));
//     const pathsSnapshot = await getDocs(collection(db, "learningPaths"));

//     return {
//       exists: !categoriesSnapshot.empty && !pathsSnapshot.empty,
//       categoriesCount: categoriesSnapshot.size,
//       pathsCount: pathsSnapshot.size,
//     };
//   } catch (error) {
//     console.error("Error checking initial data:", error);
//     return {exists: false, error: error.message};
//   }
// };

// // Export all functions
// const dataInitializer = {
//   initializeFirestoreData,
//   createSampleUserData,
//   checkInitialDataExists,
// };

// export default dataInitializer;
