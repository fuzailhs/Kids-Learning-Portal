import { describe, expect, it } from "vitest";
import {
  QuizValidationError,
  scoreAnswers,
  toPublicQuiz,
  validateQuiz,
  type QuizQuestion,
} from "./quiz.js";
import { offlineQuizBank, seedLessons } from "../data/seed.js";

function question(index: number): QuizQuestion {
  return {
    prompt: `Which answer belongs to practice question number ${index}?`,
    options: ["First option", "Second option", "Third option", "Fourth option"],
    correctIndex: index % 4,
    explanation: `Explanation for practice question number ${index}.`,
  };
}

function validQuiz(): QuizQuestion[] {
  return [0, 1, 2, 3, 0].map(question);
}

describe("validateQuiz", () => {
  it("accepts exactly five well-formed questions", () => {
    const quiz = validateQuiz({ questions: validQuiz() });
    expect(quiz).toHaveLength(5);
    expect(quiz[0]?.prompt).toContain("question number 0");
  });

  it("rejects a quiz that does not have five questions", () => {
    expect(() => validateQuiz({ questions: validQuiz().slice(0, 4) })).toThrow(
      QuizValidationError,
    );
  });

  it("rejects duplicate options", () => {
    const questions = validQuiz();
    questions[0] = {
      ...questions[0]!,
      options: ["Same", "same", "Third", "Fourth"],
    };
    expect(() => validateQuiz({ questions })).toThrow(/distinct/i);
  });

  it("rejects a correct answer index outside 0-3", () => {
    const questions = validQuiz();
    questions[1] = { ...questions[1]!, correctIndex: 4 };
    expect(() => validateQuiz({ questions })).toThrow(QuizValidationError);
  });

  it("rejects unknown fields so injected data is not accepted", () => {
    expect(() =>
      validateQuiz({ questions: validQuiz(), childName: "not allowed" }),
    ).toThrow(QuizValidationError);
  });
});

describe("scoreAnswers", () => {
  it("scores the submitted answers on the server", () => {
    const questions = validQuiz();
    const result = scoreAnswers(questions, [0, 1, 2, 3, 1]);
    expect(result.score).toBe(4);
    expect(result.total).toBe(5);
    expect(result.results[4]).toMatchObject({
      questionIndex: 4,
      selectedIndex: 1,
      correctIndex: 0,
      isCorrect: false,
    });
    expect(result.results[4]?.explanation).toContain("Explanation");
  });

  it("rejects an early or incomplete submission", () => {
    expect(() => scoreAnswers(validQuiz(), [0, 1, 2, 3])).toThrow(
      /five answers/i,
    );
  });

  it("rejects out-of-range option indexes", () => {
    expect(() => scoreAnswers(validQuiz(), [0, 1, 2, 3, 9])).toThrow(/0 to 3/i);
    expect(() => scoreAnswers(validQuiz(), [0, 1, 2, 3, -1])).toThrow(/0 to 3/i);
  });
});

describe("toPublicQuiz", () => {
  it("never leaks correct answers or explanations before submission", () => {
    const publicQuiz = toPublicQuiz({
      id: "quiz-id",
      lessonId: "lesson-id",
      questions: validQuiz(),
    });

    expect(publicQuiz.questions).toHaveLength(5);
    for (const questionItem of publicQuiz.questions) {
      expect(questionItem).toEqual({
        prompt: expect.any(String),
        options: expect.any(Array),
      });
    }
    expect(JSON.stringify(publicQuiz)).not.toContain("correctIndex");
    expect(JSON.stringify(publicQuiz)).not.toContain("explanation");
  });
});

describe("offline sample bank", () => {
  it("covers every seeded lesson with a valid five-question quiz", () => {
    for (const lesson of seedLessons) {
      const bank = offlineQuizBank[lesson.id];
      expect(bank, `missing bank for ${lesson.title}`).toBeDefined();
      expect(validateQuiz({ questions: bank })).toHaveLength(5);
    }
  });
});
