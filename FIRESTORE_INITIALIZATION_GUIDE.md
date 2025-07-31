# Firestore Data Initialization Guide

## Overview

This guide explains how to set up initial data in your AceMind Firestore database. The initialization system creates all the necessary collections and documents to get your learning platform up and running.

## What Gets Created

### 📚 Categories Collection

- **Mathematics** - Mathematical concepts and problem-solving
- **Science** - Natural sciences and scientific methods
- **Technology** - Computer science and technology topics
- **Languages** - Language learning and communication
- **Business** - Business, finance, and entrepreneurship
- **Creative Arts** - Art, design, music, and creative expression

### 🛤️ Learning Paths Collection

- **Web Development Fundamentals** (40 hours)

  - HTML Fundamentals
  - CSS Styling
  - JavaScript Introduction
  - Responsive Design

- **Introduction to Data Science** (60 hours)

  - Python Programming Basics
  - Data Manipulation with Pandas
  - Data Visualization
  - Statistical Analysis

- **Business Fundamentals** (25 hours)
  - Business Planning
  - Financial Management
  - Marketing Fundamentals
  - Leadership and Communication

### 📖 Study Materials Collection

- **HTML Reference Guide** - Complete HTML reference with best practices
- **Python Quick Reference** - Essential Python syntax cheatsheet
- **Business Plan Template** - Step-by-step business planning template

### ❓ Quiz Questions Collection

- Sample questions for HTML, Python, and Business topics
- Multiple-choice format with explanations
- Categorized by difficulty level

### ⚙️ App Settings Collection

- Global application configuration
- Feature toggles and limits
- Maintenance mode settings
- Notification preferences

### 👤 User Data Collections (Created per user)

- **User Progress** - Learning path enrollment and completion tracking
- **Quiz Results** - Performance analytics and scoring
- **User Preferences** - Settings and customization options

## How to Initialize Data

### Method 1: Using the Admin Panel (Recommended)

1. **Navigate to Admin Page**

   ```
   http://localhost:3001/admin/initialize
   ```

2. **Check Current Status**

   - Click "🔍 Check Data Status" to see what data already exists
   - Review the counts for categories and learning paths

3. **Initialize Data**
   - Click "🚀 Initialize Data" to create all collections
   - Wait for the success confirmation
   - Check status again to verify creation

### Method 2: Programmatic Initialization

```javascript
import {initializeFirestoreData} from "@/lib/initializeData";

// Initialize all collections
const result = await initializeFirestoreData();

if (result.success) {
  console.log("✅ Data initialized successfully!");
} else {
  console.error("❌ Initialization failed:", result.error);
}
```

### Method 3: Individual User Data

User-specific data is automatically created when:

- New users register with email/password
- Users sign in with Google for the first time

You can also manually create user data:

```javascript
import {createSampleUserData} from "@/lib/initializeData";

const result = await createSampleUserData(userId, userData);
```

## Data Structure Details

### Categories Schema

```javascript
{
  id: "mathematics",
  name: "Mathematics",
  description: "Mathematical concepts and problem-solving",
  icon: "🔢",
  color: "#3B82F6",
  subCategories: ["algebra", "calculus", "geometry", "statistics"],
  isActive: true,
  createdAt: serverTimestamp()
}
```

### Learning Paths Schema

```javascript
{
  id: "web-dev-basics",
  title: "Web Development Fundamentals",
  description: "Learn the basics of web development...",
  category: "technology",
  difficulty: "beginner",
  estimatedHours: 40,
  modules: [
    {
      id: "html-basics",
      title: "HTML Fundamentals",
      order: 1,
      estimatedMinutes: 300
    }
  ],
  isPublished: true,
  enrolledCount: 0,
  rating: 0
}
```

### User Progress Schema

```javascript
{
  userId: "user-uid",
  enrolledPaths: ["web-dev-basics"],
  completedModules: [],
  currentModule: "html-basics",
  totalStudyTime: 0,
  streakDays: 0,
  level: 1,
  experience: 0
}
```

## Safety Features

### ⚠️ Important Warnings

1. **Data Overwriting**: Initialization will overwrite existing data with the same IDs
2. **Backup First**: Always backup your Firestore data before initializing
3. **Production Use**: Be extra careful when running in production environments
4. **Permissions**: Ensure your Firebase project has proper write permissions

### 🔒 Safety Checks

- The system checks for existing data before initialization
- User data creation is non-destructive (won't overwrite existing user data)
- Batch operations ensure data consistency
- Error handling prevents partial data corruption

## Customization

### Adding New Categories

Edit `src/lib/initializeData.js` and add to the `categories` array:

```javascript
{
  id: "your-category",
  name: "Your Category",
  description: "Description here",
  icon: "🎯",
  color: "#F59E0B",
  subCategories: ["sub1", "sub2"],
  isActive: true,
  createdAt: serverTimestamp()
}
```

### Adding New Learning Paths

Add to the `learningPaths` array with proper module structure:

```javascript
{
  id: "your-path",
  title: "Your Learning Path",
  description: "Path description",
  category: "existing-category",
  difficulty: "beginner|intermediate|advanced",
  estimatedHours: 30,
  modules: [
    {
      id: "module-1",
      title: "Module Title",
      order: 1,
      estimatedMinutes: 240
    }
  ]
}
```

## Troubleshooting

### Common Issues

1. **Firebase Offline Error**

   ```
   FirebaseError: Failed to get document because the client is offline
   ```

   **Solution**: Check internet connection and Firebase project status

2. **Permission Denied**

   ```
   FirebaseError: Missing or insufficient permissions
   ```

   **Solution**: Update Firestore security rules to allow writes

3. **Initialization Fails Partially**
   **Solution**: Clear failed data and re-run initialization

### Firebase Security Rules

Ensure your Firestore rules allow data creation:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Allow all authenticated users to read public collections
    match /{collection}/{document} {
      allow read: if request.auth != null;
      allow write: if request.auth != null; // Adjust based on your needs
    }
  }
}
```

## Monitoring

### Check Data Status

Use the admin panel or programmatically check:

```javascript
import {checkInitialDataExists} from "@/lib/initializeData";

const status = await checkInitialDataExists();
console.log(`Categories: ${status.categoriesCount}`);
console.log(`Learning Paths: ${status.pathsCount}`);
```

### Verify User Data

Check if user has proper data structure:

```javascript
import {getUserData} from "@/lib/auth";

const result = await getUserData(userId);
if (result.success) {
  console.log("User data exists:", result.userData);
}
```

## Next Steps

After initialization:

1. **Test User Registration** - Create a test account to verify user data creation
2. **Verify Collections** - Check Firebase Console to confirm all collections exist
3. **Test Queries** - Ensure your app can read the initialized data
4. **Add Content** - Populate learning paths with actual content
5. **Configure Security** - Set up proper Firestore security rules

## Support

If you encounter issues:

1. Check the browser console for detailed error messages
2. Verify your Firebase configuration in `src/lib/firebase.js`
3. Ensure your Firebase project has Firestore enabled
4. Check your network connection and Firebase project status

---

**Remember**: This initialization creates the foundation for your learning platform. You'll need to add actual learning content, videos, documents, and detailed quiz questions to complete your platform.
