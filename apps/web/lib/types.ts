export interface SubjectSummary {
  id: string;
  slug: string;
  title: string;
  lessonCount: number;
}

export interface LessonSummary {
  id: string;
  title: string;
  readingMinutes: number;
  version: number;
}

export interface SubjectLessonsResponse {
  subject: { id: string; slug: string; title: string };
  lessons: LessonSummary[];
}

export interface LessonDetail {
  id: string;
  title: string;
  contentMd: string;
  readingMinutes: number;
  version: number;
  subjectId: string;
  subjectSlug: string;
  subjectTitle: string;
}

export interface PublicQuiz {
  id: string;
  lessonId: string;
  questionCount: number;
  questions: Array<{ prompt: string; options: string[] }>;
}

export interface AttemptResult {
  attemptId: string;
  submittedAt: string;
  lessonId: string;
  score: number;
  total: number;
  results: Array<{
    questionIndex: number;
    selectedIndex: number;
    correctIndex: number;
    isCorrect: boolean;
    explanation: string;
  }>;
}

export interface AttemptSummary {
  id: string;
  lessonId: string;
  lessonTitle: string;
  subjectSlug: string;
  subjectTitle: string;
  score: number;
  submittedAt: string;
}

export interface CompletedLesson {
  lessonId: string;
  lessonTitle: string;
  subjectSlug: string;
  subjectTitle: string;
  bestScore: number;
  attempts: number;
  lastSubmittedAt: string;
}

export interface ProgressData {
  totalAttempts: number;
  attempts: AttemptSummary[];
  completedLessons: CompletedLesson[];
}
