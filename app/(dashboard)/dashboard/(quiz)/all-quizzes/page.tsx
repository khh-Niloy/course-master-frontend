"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { useGetAllQuizzesQuery } from "@/redux/features/quiz/quiz.api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { HelpCircleIcon, CalendarIcon, CheckCircleIcon } from "lucide-react";

export default function AllQuizzesPage() {
  const { data: quizzesData, isLoading: quizzesLoading } = useGetAllQuizzesQuery({});

  const quizzes = quizzesData?.data || [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTotalQuestions = (quiz: any) => {
    return quiz.questions?.length || 0;
  };

  const getTotalOptions = (quiz: any) => {
    return quiz.questions?.reduce((total: number, q: any) => {
      return total + (q.options?.length || 0);
    }, 0) || 0;
  };

  return (
    <div className="container mx-auto max-w-7xl py-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">All Quizzes</h1>
            <p className="text-muted-foreground mt-2">
              Manage and view all quizzes
            </p>
          </div>
          <Link href="/dashboard/add-quiz">
            <Button>Add New Quiz</Button>
          </Link>
        </div>

        {/* Quizzes Grid */}
        {quizzesLoading ? (
          <div className="text-center py-8">
            <p>Loading quizzes...</p>
          </div>
        ) : quizzes.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              No quizzes found. Create your first quiz!
            </p>
            <Link href="/dashboard/add-quiz">
              <Button className="mt-4">Create First Quiz</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz: any) => (
              <Card key={quiz._id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg line-clamp-2">
                    {quiz.title}
                  </CardTitle>
                  <CardDescription>
                    {getTotalQuestions(quiz)} question{getTotalQuestions(quiz) !== 1 ? 's' : ''}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <HelpCircleIcon className="h-4 w-4" />
                    <span>{getTotalQuestions(quiz)} Questions</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircleIcon className="h-4 w-4" />
                    <span>{getTotalOptions(quiz)} Total Options</span>
                  </div>
                  
                  {quiz.questions && quiz.questions.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">Sample Questions:</p>
                      {quiz.questions.slice(0, 2).map((q: any, idx: number) => (
                        <div key={idx} className="text-xs text-muted-foreground line-clamp-1 pl-2">
                          • {q.question}
                        </div>
                      ))}
                      {quiz.questions.length > 2 && (
                        <p className="text-xs text-muted-foreground pl-2">
                          +{quiz.questions.length - 2} more question{quiz.questions.length - 2 !== 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarIcon className="h-4 w-4" />
                    <span>Created: {formatDate(quiz.createdAt)}</span>
                  </div>
                  
                  <div className="pt-2 flex gap-2">
                    <Link href={`/dashboard/edit-quiz/${quiz._id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        Edit
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

