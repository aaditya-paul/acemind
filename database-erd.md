# AceMind Database Entity Relationship Diagram

```mermaid
erDiagram
    USERS ||--o{ CHATS : creates
    CHATS ||--o{ SUBTOPIC_DATA : contains
    CHATS ||--o{ DOUBT_MESSAGES : contains
    CHATS ||--o{ QUIZ_RESULTS : contains
    CHATS ||--o{ EXPANDED_SUBTOPICS : contains
    CHATS ||--o{ MINDMAP_STATE : has

    USERS {
        string uid PK "Firebase Auth UID"
        string email UK "User email"
        string firstName "First name"
        string lastName "Last name"
        string displayName "Display name"
        string photoURL "Profile photo URL"
        timestamp createdAt "Account creation date"
        timestamp lastLoginAt "Last login timestamp"
        string authProvider "email or google"
        object preferences "Theme, notifications, language"
        object profile "Bio, interests, learning goals"
        object stats "Study sessions, time, topics, streak"
        object quizStats "Quiz performance statistics"
        array chats "Array of chat references"
    }

    CHATS {
        string chatId PK "Generated chat ID"
        string userId FK "Reference to USERS.uid"
        string topic "Main study topic"
        string syllabus "Uploaded syllabus content"
        string syllabusContext "Context from PDF"
        object aiResponse "Course structure with units"
        timestamp timestamp "Creation timestamp"
        timestamp updatedAt "Last update timestamp"
        object mindmapState "Saved mindmap state"
        object subtopicData "Cached subtopic content"
        array doubtMessages "Q&A messages"
        array quizResults "Quiz attempts"
        object expandedSubtopics "Hierarchical expanded topics"
        number totalQuizzesTaken "Total quiz count"
        timestamp lastQuizTakenAt "Last quiz timestamp"
        timestamp lastDoubtMessageAt "Last doubt message timestamp"
    }

    SUBTOPIC_DATA {
        string hierarchyKey PK "Format: unitIndex-subTopicIndex or hierarchy path"
        string chatId FK "Reference to CHATS.chatId"
        number unitIndex "Parent unit index"
        number subTopicIndex "Subtopic index"
        array hierarchyPath "Full hierarchy path"
        object content "Subtopic detailed content"
        string dataType "regular_subtopic or hierarchical_subtopic"
        string version "Data version"
        timestamp savedAt "Cache timestamp"
    }

    DOUBT_MESSAGES {
        string id PK "Generated message ID"
        string chatId FK "Reference to CHATS.chatId"
        string role "user or assistant"
        string content "Message text"
        timestamp timestamp "Message timestamp"
    }

    QUIZ_RESULTS {
        string id PK "Generated quiz ID"
        string chatId FK "Reference to CHATS.chatId"
        number totalQuestions "Total questions"
        number correctAnswers "Correct answer count"
        number score "Percentage score"
        number timeTaken "Time in seconds"
        string difficulty "easy, medium, hard"
        array questions "Quiz question details"
        timestamp timestamp "Quiz completion time"
    }

    EXPANDED_SUBTOPICS {
        string hierarchyKey PK "Format: unitIndex-subTopicIndex or full path"
        string chatId FK "Reference to CHATS.chatId"
        string parentTitle "Parent subtopic title"
        array expandedTopics "Generated subtopics"
        number level "Expansion depth level"
        array hierarchyPath "Full hierarchy array"
        timestamp expandedAt "Expansion timestamp"
    }

    MINDMAP_STATE {
        string chatId PK,FK "Reference to CHATS.chatId"
        array expandedUnits "Set of expanded unit IDs"
        object viewport "Current viewport position"
        object nodePositions "Node position coordinates"
        timestamp savedAt "State save timestamp"
    }

    USERS ||--o{ QUIZ_STATS : has

    QUIZ_STATS {
        string uid PK,FK "Reference to USERS.uid"
        number totalQuizzes "Total quizzes taken"
        number totalQuestions "Total questions answered"
        number totalCorrect "Total correct answers"
        number totalTime "Total time spent"
        number averageScore "Average score percentage"
        number highestScore "Highest score achieved"
        number streakCount "Current daily streak"
        timestamp lastQuizDate "Last quiz date"
        number level "User level (calculated)"
        number xp "Experience points"
    }

    USERS ||--o{ PREFERENCES : has

    PREFERENCES {
        string uid PK,FK "Reference to USERS.uid"
        string theme "dark or light"
        boolean notifications "Notification preference"
        string language "Language code (en, etc.)"
    }

    USERS ||--o{ PROFILE : has

    PROFILE {
        string uid PK,FK "Reference to USERS.uid"
        string bio "User biography"
        array interests "Topics of interest"
        array learningGoals "Learning objectives"
    }

    USERS ||--o{ USER_STATS : has

    USER_STATS {
        string uid PK,FK "Reference to USERS.uid"
        number studySessions "Total study sessions"
        number totalStudyTime "Total time in minutes"
        number topicsStudied "Number of topics"
        number streakDays "Study streak"
    }
```

## Collections Overview

### Primary Collections

1. **users** - User accounts and profiles
2. **chats** - Learning sessions with course content

### Embedded Sub-Collections (within chats)

3. **subtopicData** - Cached subtopic content (keyed by hierarchy)
4. **doubtMessages** - Q&A conversation history
5. **quizResults** - Quiz attempt records
6. **expandedSubtopics** - Hierarchically expanded topics
7. **mindmapState** - Saved mindmap visualization state

### Embedded Objects (within users)

8. **quizStats** - Quiz performance tracking
9. **preferences** - User settings
10. **profile** - User bio and interests
11. **stats** - Study activity metrics

## Key Relationships

- **Users to Chats**: One-to-Many (One user creates multiple learning sessions)
- **Chats to Subtopic Data**: One-to-Many (One chat contains multiple cached subtopics)
- **Chats to Doubt Messages**: One-to-Many (One chat has multiple Q&A messages)
- **Chats to Quiz Results**: One-to-Many (One chat tracks multiple quiz attempts)
- **Chats to Expanded Subtopics**: One-to-Many (One chat has multiple expansion levels)
- **Chats to Mindmap State**: One-to-One (One chat has one mindmap state)
- **Users to Quiz Stats**: One-to-One (Aggregated quiz performance)

## Data Sanitization

The system includes special handling for nested arrays in Firebase:

- **sanitizeForFirebase()**: Converts nested arrays to objects before storage
- **restoreFromFirebase()**: Restores objects back to arrays after retrieval
- This prevents Firebase nested array limitations

## Authentication Providers

- Email/Password authentication
- Google OAuth authentication
- Password reset functionality

## Cache Management

- Subtopic content is cached with hierarchy keys
- Cache statistics tracking (size, age, type)
- Selective or full cache clearing capabilities
