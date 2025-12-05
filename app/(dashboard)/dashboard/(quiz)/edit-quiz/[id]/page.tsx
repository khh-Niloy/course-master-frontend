"use client";

import React, { useEffect } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { usePatchQuizMutation, useGetAllQuizzesQuery } from "@/redux/features/quiz/quiz.api";
import { toast } from "react-hot-toast";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Trash2, Plus } from "lucide-react";

const quizPatchSchema = z.object({
  title: z.string().min(1).optional(),
  questions: z.array(
    z.object({
      question: z.string().min(1),
      options: z.array(
        z.object({
          text: z.string().min(1),
          isCorrect: z.boolean(),
        })
      ).min(2).refine(
        (options) => options.some((option) => option.isCorrect),
        { message: "At least one option must be correct" }
      ),
    })
  ).optional(),
});

type QuizPatchData = z.infer<typeof quizPatchSchema>;

export default function EditQuizPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const { data: quizzesData } = useGetAllQuizzesQuery({});
  const [patchQuiz, { isLoading: isPatching }] = usePatchQuizMutation();

  const quiz = quizzesData?.data?.find((q: any) => q._id === id);

  const {
    register,
    handleSubmit,
    formState: { errors, dirtyFields, isDirty },
    reset,
    control,
  } = useForm<QuizPatchData>({
    resolver: zodResolver(quizPatchSchema),
  });

  const {
    fields: questionFields,
    append: appendQuestion,
    remove: removeQuestion,
  } = useFieldArray({
    control,
    name: "questions",
  });

  useEffect(() => {
    if (quiz) {
      reset({
        title: quiz.title || "",
        questions: quiz.questions || [],
      });
    }
  }, [quiz, reset]);

  const onSubmit = async (data: QuizPatchData) => {
    try {
      const patchData: any = {};
      if (dirtyFields.title && data.title) patchData.title = data.title;
      if (dirtyFields.questions && data.questions) patchData.questions = data.questions;

      if (Object.keys(patchData).length === 0) {
        toast.error("No changes detected");
        return;
      }

      const res = await patchQuiz({ id, data: patchData }).unwrap();
      if (res.success) {
        toast.success("Quiz updated successfully");
        router.push("/dashboard");
      }
    } catch (error: any) {
      console.error("Error updating quiz:", error);
      toast.error(error?.data?.message || "Failed to update quiz. Please try again.");
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

  if (!quiz) {
    return (
      <div className="container mx-auto max-w-5xl py-8">
        <div className="text-center">
          <p className="text-destructive">Quiz not found</p>
          <Link href="/dashboard">
            <Button variant="outline" className="mt-4">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Edit Quiz</h1>
          <p className="text-muted-foreground mt-2">
            Update quiz information. Leave fields empty to keep current values.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Quiz Title</Label>
            <Input
              id="title"
              type="text"
              placeholder="Enter quiz title"
              {...register("title")}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

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
                          <Label className="text-sm font-medium">Correct</Label>
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
                    />
                  </div>

                  <QuestionOptions />
                </div>
              );
            })}
          </div>

          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={isPatching || !isDirty}
              className="flex-1"
            >
              {isPatching ? "Updating..." : "Update Quiz"}
            </Button>
            <Link href="/dashboard">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

