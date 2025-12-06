"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useGetQuizByIdQuery, useSubmitQuizResultMutation, useGetQuizResultQuery } from "@/redux/features/quiz/quiz.api";
import { CheckCircleIcon, XCircleIcon, ArrowLeftIcon, TrophyIcon } from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";

export default function TakeQuizPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = params.quizId as string;
  
  const [answers, setAnswers] = useState<{[key: string]: number[]}>({});
  const [quizResult, setQuizResult] = useState<any>(null);
  
  const { data: quizData, isLoading: quizLoading, error: quizError } = useGetQuizByIdQuery(quizId);
  const { data: resultData } = useGetQuizResultQuery(quizId, { skip: false });
  const [submitQuiz, { isLoading: isSubmitting }] = useSubmitQuizResultMutation();
  
  const quiz = quizData?.data;
  const existingResult = resultData?.data;
  
  const handleAnswerChange = (questionId: string, optionIndex: number, isMultiple: boolean) => {
    setAnswers(prev => {
      const current = prev[questionId] || [];
      if (isMultiple) {
        // Toggle option for multiple choice
        const newAnswers = current.includes(optionIndex)
          ? current.filter(idx => idx !== optionIndex)
          : [...current, optionIndex];
        return { ...prev, [questionId]: newAnswers };
      } else {
        // Single choice - replace
        return { ...prev, [questionId]: [optionIndex] };
      }
    });
  };
  
  const handleSubmit = async () => {
    if (!quiz) return;
    
    // Check if all questions are answered
    const unansweredQuestions = quiz.questions.filter(
      (q: any) => !answers[q._id] || answers[q._id].length === 0
    );
    
    if (unansweredQuestions.length > 0) {
      toast.error(`Please answer all questions. ${unansweredQuestions.length} question(s) remaining.`);
      return;
    }
    
    try {
      const submissionData = {
        quizId,
        answers: quiz.questions.map((q: any) => ({
          questionId: q._id,
          selectedOptions: answers[q._id] || [],
        })),
      };
      
      const result = await submitQuiz(submissionData).unwrap();
      setQuizResult(result.data);
      toast.success("Quiz submitted successfully!");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to submit quiz. Please try again.");
    }
  };
  
  if (quizLoading) {
    return (
      <div className="container mx-auto max-w-4xl py-8">
        <div className="text-center">Loading quiz...</div>
      </div>
    );
  }
  
  // Show result if available (either newly submitted or existing)
  const resultToShow = quizResult || existingResult;
  
  if ((!quiz || quizError) && !resultToShow) {
    return (
      <div className="container mx-auto max-w-4xl py-8">
        <div className="text-center">
          <p className="text-destructive">Quiz not found</p>
          <Link href="/dashboard/my-enrollments">
            <Button variant="outline" className="mt-4">Back to Enrollments</Button>
          </Link>
        </div>
      </div>
    );
  }
  
  // If showing results but no quiz data, we still need it to show question review
  // The quiz should already be loaded before submission
  
  if (resultToShow && !quiz) {
    // If we have a result but no quiz data (e.g., after submission), show simple result
    return (
      <div className="container mx-auto max-w-4xl py-8">
        <div className="space-y-6">
          <Link href="/dashboard/my-enrollments">
            <Button variant="outline" size="sm">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrophyIcon className="h-6 w-6 text-yellow-500" />
                Quiz Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center py-8">
                  <div className="text-6xl font-bold text-blue-600 mb-2">
                    {resultToShow.score}%
                  </div>
                  <p className="text-lg text-gray-600">
                    {quizResult ? `You got ${quizResult.correctAnswers} out of ${quizResult.totalQuestions} questions correct` : `You scored ${resultToShow.score} out of 100`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
  if (resultToShow && quiz) {
    // Show result with quiz title
    return (
      <div className="container mx-auto max-w-4xl py-8">
        <div className="space-y-6">
          <Link href="/dashboard/my-enrollments">
            <Button variant="outline" size="sm">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrophyIcon className="h-6 w-6 text-yellow-500" />
                Quiz Results
              </CardTitle>
              <CardDescription>{quiz.title}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center py-8">
                  <div className="text-6xl font-bold text-blue-600 mb-2">
                    {resultToShow.score}%
                  </div>
                  <p className="text-lg text-gray-600">
                    {quizResult ? `You got ${quizResult.correctAnswers} out of ${quizResult.totalQuestions} questions correct` : `You scored ${resultToShow.score} out of 100`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto max-w-4xl py-8">
      <div className="space-y-6">
        <Link href="/dashboard/my-enrollments">
          <Button variant="outline" size="sm">
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        
        <Card>
          <CardHeader>
            <CardTitle>{quiz.title}</CardTitle>
            <CardDescription>
              Answer all questions. You can select multiple options if applicable.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {quiz.questions.map((question: any, qIndex: number) => {
                const hasMultipleCorrect = question.options.filter((opt: any) => opt.isCorrect).length > 1;
                
                return (
                  <Card key={question._id}>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-lg font-medium">
                            Question {qIndex + 1}: {question.question}
                          </h3>
                          {hasMultipleCorrect && (
                            <p className="text-sm text-gray-500 mt-1">
                              (Select all correct answers)
                            </p>
                          )}
                        </div>
                        
                        <div className="space-y-3">
                          {question.options.map((option: any, optIndex: number) => (
                            <div key={optIndex} className="flex items-center space-x-2">
                              {hasMultipleCorrect ? (
                                <input
                                  type="checkbox"
                                  id={`q${qIndex}-opt${optIndex}`}
                                  checked={answers[question._id]?.includes(optIndex) || false}
                                  onChange={() => handleAnswerChange(question._id, optIndex, true)}
                                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                              ) : (
                                <input
                                  type="radio"
                                  id={`q${qIndex}-opt${optIndex}`}
                                  name={`question-${question._id}`}
                                  value={optIndex.toString()}
                                  checked={answers[question._id]?.[0] === optIndex}
                                  onChange={() => handleAnswerChange(question._id, optIndex, false)}
                                  className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                              )}
                              <Label
                                htmlFor={`q${qIndex}-opt${optIndex}`}
                                className="flex-1 cursor-pointer font-normal"
                              >
                                {option.text}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              
              <div className="flex justify-end pt-4">
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  size="lg"
                >
                  {isSubmitting ? "Submitting..." : "Submit Quiz"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

