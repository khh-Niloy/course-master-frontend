"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useGetCourseByIdQuery } from "@/redux/features/course/course.api";
import { useGetEnrollmentsByStudentQuery } from "@/redux/features/enrollment/enrollment.api";
import { useGetMeQuery } from "@/redux/features/auth/auth.api";
import { useMarkLessonCompleteMutation, useMarkLessonIncompleteMutation, useGetEnrollmentProgressDetailsQuery } from "@/redux/features/progress/progress.api";
import { 
  BookOpenIcon, 
  PlayCircleIcon, 
  CheckCircleIcon, 
  ClockIcon,
  FileTextIcon,
  HelpCircleIcon,
  ArrowLeftIcon,
  LockIcon
} from "lucide-react";
import Link from "next/link";

export default function CourseLearnPage() {
  const params = useParams();
  const courseSlug = params.courseId as string; // This is actually a slug now
  const [selectedModule, setSelectedModule] = useState<number>(0);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());

  const { data: meData } = useGetMeQuery(undefined);
  const { data: courseData, isLoading: courseLoading } = useGetCourseByIdQuery(courseSlug);
  const { data: enrollmentsData } = useGetEnrollmentsByStudentQuery(
    meData?._id,
    { skip: !meData?._id }
  );

  const course = courseData?.data;
  const enrollments = enrollmentsData?.data || [];
  
  // Check if student is enrolled in this course and get enrollment data
  const currentEnrollment = enrollments.find((enrollment: any) => 
    enrollment.courseId.slug === courseSlug
  );
  const isEnrolled = !!currentEnrollment;
  
  // Get progress data for current enrollment
  const { data: progressData } = useGetEnrollmentProgressDetailsQuery(
    currentEnrollment?._id,
    { skip: !currentEnrollment }
  );
  
  // Progress mutations
  const [markComplete] = useMarkLessonCompleteMutation();
  const [markIncomplete] = useMarkLessonIncompleteMutation();

  // Get completed lessons from backend progress data
  const completedLessonIds = new Set(
    progressData?.data?.map((progress: any) => progress.lessonId) || []
  );

  const toggleLessonComplete = async (lessonId: string) => {
    try {
      if (completedLessonIds.has(lessonId)) {
        await markIncomplete(lessonId).unwrap();
      } else {
        await markComplete({ lessonId, timeSpent: 0 }).unwrap();
      }
    } catch (error) {
      console.error('Error updating lesson progress:', error);
    }
  };

  const calculateModuleProgress = (module: any) => {
    if (!module.lessons || module.lessons.length === 0) return 0;
    const completedCount = module.lessons.filter((lesson: any) => 
      completedLessonIds.has(lesson._id)
    ).length;
    return (completedCount / module.lessons.length) * 100;
  };

  const calculateOverallProgress = () => {
    if (!currentEnrollment?.progress) return 0;
    return currentEnrollment.progress.progressPercentage;
  };

  if (courseLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <p>Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <p>Course not found.</p>
          <Link href="/dashboard/my-enrollments">
            <Button className="mt-4">Back to My Enrollments</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!isEnrolled) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <LockIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            You need to be enrolled in this course to access the content.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/dashboard/my-enrollments">
              <Button variant="outline">My Enrollments</Button>
            </Link>
            <Link href="/">
              <Button>Browse Courses</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard/my-enrollments">
            <Button variant="outline" size="sm">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Enrollments
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{course.title}</h1>
            <p className="text-muted-foreground">{course.description}</p>
          </div>
          <Badge variant="secondary">{course.category}</Badge>
        </div>

        {/* Progress Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircleIcon className="h-5 w-5" />
              Your Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Overall Progress</span>
                  <span>{Math.round(calculateOverallProgress())}%</span>
                </div>
                <Progress value={calculateOverallProgress()} className="h-2" />
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {course.modules?.length || 0}
                  </div>
                  <p className="text-sm text-gray-600">Modules</p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {currentEnrollment?.progress?.completedLessons || 0}
                  </div>
                  <p className="text-sm text-gray-600">Completed</p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">
                    {currentEnrollment?.progress?.totalLessons || 0}
                  </div>
                  <p className="text-sm text-gray-600">Total Lessons</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Course Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Module Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Course Modules</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-1">
                  {course.modules?.map((module: any, index: number) => (
                    <button
                      key={module._id}
                      onClick={() => setSelectedModule(index)}
                      className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                        selectedModule === index ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{module.title}</h4>
                          <p className="text-xs text-gray-500 mt-1">
                            {module.lessons?.length || 0} lessons
                          </p>
                        </div>
                        <div className="ml-2">
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-xs font-medium">
                              {Math.round(calculateModuleProgress(module))}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Module Content */}
          <div className="lg:col-span-3">
            {course.modules && course.modules[selectedModule] && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{course.modules[selectedModule].title}</span>
                    <Badge variant="outline">
                      Module {selectedModule + 1}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    {course.modules[selectedModule].description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="lessons" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="lessons">Lessons</TabsTrigger>
                      <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
                      <TabsTrigger value="assignments">Assignments</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="lessons" className="space-y-4">
                      {course.modules[selectedModule].lessons?.length > 0 ? (
                        course.modules[selectedModule].lessons.map((lesson: any, lessonIndex: number) => (
                          <Card key={lesson._id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="flex-shrink-0">
                                    {completedLessonIds.has(lesson._id) ? (
                                      <CheckCircleIcon className="h-6 w-6 text-green-500" />
                                    ) : (
                                      <PlayCircleIcon className="h-6 w-6 text-gray-400" />
                                    )}
                                  </div>
                                  <div>
                                    <h4 className="font-medium">{lesson.title}</h4>
                                    <p className="text-sm text-gray-600">{lesson.content}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant={completedLessonIds.has(lesson._id) ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => toggleLessonComplete(lesson._id)}
                                  >
                                    {completedLessonIds.has(lesson._id) ? "Completed" : "Mark Complete"}
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <BookOpenIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                          <p>No lessons available in this module.</p>
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="quizzes" className="space-y-4">
                      {course.modules[selectedModule].quizIds?.length > 0 ? (
                        course.modules[selectedModule].quizIds.map((quizId: string, index: number) => (
                          <Card key={quizId} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <HelpCircleIcon className="h-6 w-6 text-blue-500" />
                                  <div>
                                    <h4 className="font-medium">Quiz {index + 1}</h4>
                                    <p className="text-sm text-gray-600">Test your knowledge</p>
                                  </div>
                                </div>
                                <Button variant="outline" size="sm">
                                  Take Quiz
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <HelpCircleIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                          <p>No quizzes available in this module.</p>
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="assignments" className="space-y-4">
                      {course.modules[selectedModule].assignmentId ? (
                        <Card className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <FileTextIcon className="h-6 w-6 text-purple-500" />
                                <div>
                                  <h4 className="font-medium">Module Assignment</h4>
                                  <p className="text-sm text-gray-600">Complete the assignment to progress</p>
                                </div>
                              </div>
                              <Button variant="outline" size="sm">
                                View Assignment
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <FileTextIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                          <p>No assignments available in this module.</p>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
