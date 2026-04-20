# Quiz Management System - Feature Implementation Guide

## Overview
A complete quiz management system has been added to ExamGen AI, enabling admins to create quizzes from exam sets and students to attempt them using unique codes.

---

## For ADMINS

### 1. Create a Quiz
**Navigate to:** `Admin Panel → Manage Quizzes → Create Quiz`

**Steps:**
1. Enter quiz title and optional description
2. Select an exam set you created
3. Configure settings:
   - **Marks Per Question**: Points for each correct answer
   - **Time Limit** (optional): Minutes to complete quiz
4. Select which questions to include from the exam set
5. Click "Create Quiz"
6. **A unique 8-character code will be generated** (e.g., ABC12345)

### 2. Share Quiz Code
- Copy the unique code from the quiz card
- Share with students via email, messaging, or classroom platform
- Students will use this code to join and attempt the quiz

### 3. View Student Results
**Navigate to:** `Admin Panel → Manage Quizzes → Quiz Name → Attempts`

**Features:**
- List of all students who attempted the quiz
- Individual scores for each student
- Submission date and time
- Time taken to complete the quiz
- **Export as CSV** for further analysis

---

## For USERS/STUDENTS

### 1. Join a Quiz
**Navigate to:** `Main Dashboard → Join Quiz`

**Steps:**
1. Enter the 8-character quiz code (provided by your instructor)
2. Click "Search"
3. Quiz details will appear:
   - Quiz title and description
   - Number of questions
   - Total marks
   - Time limit (if set)
4. Click "Start Quiz"

### 2. Attempt the Quiz
**Quiz Interface Features:**
- **Question Display**: Full question with 4 multiple choice options (A, B, C, D)
- **Progress Bar**: Visual indication of progress through the quiz
- **Timer**: Shows remaining time (if time limit is set)
- **Question Navigator**: Quick jump to specific questions
- **Status Indicator**: Shows which questions are answered

**Navigation:**
- **Previous/Next Buttons**: Move between questions
- **Number Buttons**: Click any question number to jump to it
- **Answered Count**: Displays how many questions you've answered

### 3. Submit Quiz
- Click "Submit Quiz" on the last question
- Your answers will be immediately graded
- Results will be displayed instantly

### 4. View Your Results
**After Submission, You'll See:**
- Your score (e.g., 45 / 100)
- Percentage achieved
- Status badge (Passed/Failed)
- Option to return home

---

## Technical Architecture

### Database Schema

#### Quiz Table
```
- id: UUID (primary)
- title: String
- description: String (optional)
- adminId: UUID (foreign key to User)
- examSetId: UUID (foreign key to ExamSet)
- selectedQuestions: JSON Array of question indices
- marksPerQuestion: Integer
- timeLimit: Integer (minutes, optional)
- uniqueCode: String (unique, 8 characters)
- createdAt: Timestamp
```

#### QuizAttempt Table
```
- id: UUID (primary)
- quizId: UUID (foreign key to Quiz)
- userId: UUID (foreign key to User)
- answers: JSON Array of {questionIndex, selectedAnswer}
- score: Integer
- submittedAt: Timestamp
- timeTaken: Integer (seconds, optional)
- Unique constraint: (quizId, userId) - one attempt per user per quiz
```

### API Endpoints

#### Admin Endpoints (Require ADMIN role)
```
POST   /api/quizzes                    - Create new quiz
GET    /api/quizzes/admin/list         - List all quizzes created by admin
GET    /api/quizzes/:id/attempts       - View all attempts for a quiz
```

#### User Endpoints
```
GET    /api/quizzes/code/:code         - Get quiz by unique code (public)
POST   /api/quizzes/submit             - Submit quiz answers
GET    /api/quizzes/:id/my-attempt     - Get user's attempt
```

---

## Frontend Routes

### Admin Routes
- `/app/quiz` - Quiz management dashboard
- `/app/quiz/create` - Create new quiz
- `/app/quiz/:id/results` - View student attempts

### User Routes
- `/app/quiz/join` - Join quiz by code
- `/app/quiz/attempt/:id` - Attempt quiz
- (Results displayed inline after submission)

---

## Features Implemented

### Smart Question Parsing
- Automatically extracts questions from exam set content
- Parses question stem, options (A, B, C, D), and correct answers
- Validates selected questions before creating quiz

### Scoring System
- Automatically calculates marks based on:
  - Correct answer matches
  - Marks per question setting
- Score = (Number of correct answers) × Marks per question

### Timer Management
- Optional time limit configuration
- Real-time countdown during quiz
- Auto-submission when time expires
- Tracks time taken for each attempt

### Unique Code Generation
- 8-character alphanumeric codes
- Guaranteed unique per quiz
- Easy to share and remember
- Used to join quiz without authentication

### Data Validation
- Question index validation
- Unique code collision prevention
- Attempt deduplication (one attempt per user per quiz)

---

## Usage Scenarios

### Scenario 1: Create and Distribute Quiz (Admin)
1. Create exam set with AI generator (with 20 questions)
2. Go to "Manage Quizzes"
3. Create new quiz, select 10 questions
4. Set 1 mark per question, 30 minute limit
5. Copy unique code: `ABC12345`
6. Share code with students

### Scenario 2: Student Takes Quiz (User)
1. Receive code: `ABC12345`
2. Navigate to "Join Quiz"
3. Enter code and see quiz details
4. Start quiz and answer 10 questions
5. Submit and see results (e.g., 8/10 = 80%)

### Scenario 3: Review Results (Admin)
1. Go to quiz "Manage Quizzes"
2. Click on specific quiz
3. View all student attempts with scores
4. Export as CSV for reporting

---

## Security & Validation

✅ Admin role verification for quiz creation and results viewing
✅ User authentication for quiz submission
✅ Question index validation
✅ Answer format validation (A-D only)
✅ Unique code validation
✅ Attempt deduplication (prevents re-submission)
✅ CORS protection
✅ Error handling with proper HTTP status codes

---

## Future Enhancements

Potential features for future versions:
- Question shuffling option
- Option shuffling
- Negative marking
- Partial grading
- Question bank management
- Quiz scheduling
- Email notifications
- Quiz analytics dashboard
- Student performance reports
- Randomized questions per attempt
- Review answers after submission

---

## Testing the Feature

### Quick Start
1. **Login as Admin**
2. Create an exam set with questions
3. Go to "Manage Quizzes" → "Create Quiz"
4. Configure quiz with 5-10 questions
5. **Copy the unique code**
6. **Logout and login as different user** (or use incognito)
7. Go to "Join Quiz"
8. Enter the code and attempt
9. Submit and verify results
10. **Login as admin again**
11. View attempts in quiz results

---

## Important Notes

- Each user can only have ONE attempt per quiz (later submissions overwrite)
- Timer auto-submits if time expires
- Questions are shown in the order selected by admin
- Score = 0 for unanswered questions
- All data is persisted in PostgreSQL database

---

**Implementation Date**: April 20, 2026
**Status**: ✅ Complete and Tested
