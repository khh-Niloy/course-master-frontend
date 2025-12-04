import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Quiz {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

interface ModuleQuizProps {
  moduleIndex: number;
  quizzes: Quiz[];
  updateQuiz: (moduleIndex: number, quizId: number, field: string, value: any) => void;
  removeQuiz: (moduleIndex: number, quizId: number) => void;
}

export const ModuleQuiz: React.FC<ModuleQuizProps> = ({
  moduleIndex,
  quizzes,
  updateQuiz,
  removeQuiz,
}) => {
  return (
    <div className="space-y-3 ml-4">
      {quizzes.length > 0 && (
        <Label className="font-medium">Quizzes</Label>
      )}
      {quizzes.map((quiz) => (
        <div
          key={quiz.id}
          className="border rounded p-3 space-y-3 bg-green-50"
        >
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Quiz Question</Label>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => removeQuiz(moduleIndex, quiz.id)}
            >
              Remove
            </Button>
          </div>

          <div className="space-y-3">
            <div>
              <Label>Question</Label>
              <textarea
                placeholder="Enter quiz question"
                rows={2}
                className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={quiz.question}
                onChange={(e) => updateQuiz(moduleIndex, quiz.id, 'question', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {quiz.options.map((option: string, optionIndex: number) => (
                <div key={optionIndex}>
                  <Label>Option {optionIndex + 1}</Label>
                  <Input
                    placeholder={`Enter option ${optionIndex + 1}`}
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...quiz.options];
                      newOptions[optionIndex] = e.target.value;
                      updateQuiz(moduleIndex, quiz.id, 'options', newOptions);
                    }}
                  />
                </div>
              ))}
            </div>

            <div>
              <Label>Correct Answer</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={quiz.correctAnswer}
                onChange={(e) => updateQuiz(moduleIndex, quiz.id, 'correctAnswer', parseInt(e.target.value))}
              >
                <option value={0}>Option 1</option>
                <option value={1}>Option 2</option>
                <option value={2}>Option 3</option>
                <option value={3}>Option 4</option>
              </select>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};