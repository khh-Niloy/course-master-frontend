"use client";

import React from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useAddQuizMutation } from "@/redux/features/quiz/quiz.api";
import { toast } from "react-hot-toast";
import { Trash2, Plus } from "lucide-react";

// Define the form schema using Zod
const quizSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be less than 100 characters"),
  questions: z
    .array(
      z.object({
        question: z
          .string()
          .min(1, "Question is required")
          .min(5, "Question must be at least 5 characters"),
        options: z
          .array(
            z.object({
              text: z.string().min(1, "Option text is required"),
              isCorrect: z.boolean(),
            })
          )
          .min(2, "At least 2 options are required")
          .max(6, "Maximum 6 options allowed")
          .refine(
            (options) => options.some((option) => option.isCorrect),
            { message: "At least one option must be correct" }
          ),
      })
    )
    .min(1, "At least one question is required"),
});

type QuizFormData = z.infer<typeof quizSchema>;

export default function AddQuizPage() {
  const [addQuiz, { isLoading }] = useAddQuizMutation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    control,
  } = useForm<QuizFormData>({
    resolver: zodResolver(quizSchema),
    defaultValues: {
      title: "",
      questions: [
        {
          question: "",
          options: [
            { text: "", isCorrect: false },
            { text: "", isCorrect: false },
          ],
        },
      ],
    },
  });

  const {
    fields: questionFields,
    append: appendQuestion,
    remove: removeQuestion,
  } = useFieldArray({
    control,
    name: "questions",
  });

  const onSubmit = async (data: QuizFormData) => {
    try {
      console.log("Form submitted with data:", JSON.stringify(data, null, 2));
      
      // Check if at least one option is marked as correct for each question
      const validationErrors = [];
      data.questions.forEach((question, qIndex) => {
        const hasCorrectAnswer = question.options.some(option => option.isCorrect);
        if (!hasCorrectAnswer) {
          validationErrors.push(`Question ${qIndex + 1} must have at least one correct answer`);
        }
      });
      
      if (validationErrors.length > 0) {
        validationErrors.forEach(error => toast.error(error));
        return;
      }

      console.log("Sending quiz data to API:", data);
      const res = await addQuiz(data).unwrap();
      if (res.success) {
        console.log("Quiz created successfully:", res);
        toast.success("Quiz created successfully");
        reset();
      }
    } catch (error) {
      console.error("Error creating quiz:", error);
      toast.error("Failed to create quiz. Please try again.");
    }
  };

  const addNewQuestion = () => {
    appendQuestion({
      question: "",
      options: [
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
      ],
    });
  };

  return (
    <div className="container mx-auto max-w-5xl py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Add New Quiz</h1>
          <p className="text-muted-foreground mt-2">
            Create a new quiz by filling out the form below.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Quiz Title</Label>
            <Input
              id="title"
              type="text"
              placeholder="Enter quiz title (e.g., 'JavaScript Fundamentals Quiz')"
              {...register("title")}
              aria-invalid={errors.title ? "true" : "false"}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* Questions Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-semibold">Quiz Questions</Label>
              <Button
                type="button"
                variant="outline"
                onClick={addNewQuestion}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Question
              </Button>
            </div>

            {questionFields.map((question, questionIndex) => {
              const QuestionOptions = () => {
                const {
                  fields: optionFields,
                  append: appendOption,
                  remove: removeOption,
                } = useFieldArray({
                  control,
                  name: `questions.${questionIndex}.options`,
                });

                return (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="font-medium">Options</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => appendOption({ text: "", isCorrect: false })}
                        disabled={optionFields.length >= 6}
                      >
                        Add Option
                      </Button>
                    </div>

                    {optionFields.map((option, optionIndex) => (
                      <div
                        key={option.id}
                        className="flex items-center gap-3 p-3 border rounded bg-gray-50"
                      >
                        <div className="flex items-center space-x-2">
                          <Controller
                            name={`questions.${questionIndex}.options.${optionIndex}.isCorrect`}
                            control={control}
                            render={({ field }) => (
                              <Checkbox
                                id={`questions.${questionIndex}.options.${optionIndex}.isCorrect`}
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            )}
                          />
                          <Label
                            htmlFor={`questions.${questionIndex}.options.${optionIndex}.isCorrect`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Correct
                          </Label>
                        </div>
                        
                        <Input
                          placeholder={`Option ${optionIndex + 1}`}
                          {...register(`questions.${questionIndex}.options.${optionIndex}.text`)}
                          className="flex-1"
                        />
                        
                        {optionFields.length > 2 && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeOption(optionIndex)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}

                    {errors.questions?.[questionIndex]?.options && (
                      <p className="text-sm text-destructive">
                        {errors.questions[questionIndex]?.options?.message}
                      </p>
                    )}
                  </div>
                );
              };

              return (
                <div
                  key={question.id}
                  className="border rounded-lg p-6 space-y-4 bg-white"
                >
                  <div className="flex items-center justify-between">
                    <Label className="text-lg font-medium">
                      Question {questionIndex + 1}
                    </Label>
                    {questionFields.length > 1 && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeQuestion(questionIndex)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove Question
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`questions.${questionIndex}.question`}>
                      Question Text
                    </Label>
                    <Textarea
                      id={`questions.${questionIndex}.question`}
                      placeholder="Enter your question here"
                      rows={3}
                      {...register(`questions.${questionIndex}.question`)}
                      aria-invalid={
                        errors.questions?.[questionIndex]?.question
                          ? "true"
                          : "false"
                      }
                    />
                    {errors.questions?.[questionIndex]?.question && (
                      <p className="text-sm text-destructive">
                        {errors.questions[questionIndex]?.question?.message}
                      </p>
                    )}
                  </div>

                  <QuestionOptions />
                </div>
              );
            })}

            {errors.questions && (
              <p className="text-sm text-destructive">
                {errors.questions.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="flex-1"
            >
              {isSubmitting || isLoading ? "Creating Quiz..." : "Create Quiz"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => reset()}
              disabled={isSubmitting || isLoading}
            >
              Reset
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
