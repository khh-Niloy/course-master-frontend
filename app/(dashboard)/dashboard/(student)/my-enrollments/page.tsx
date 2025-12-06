"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetEnrollmentsByStudentQuery } from "@/redux/features/enrollment/enrollment.api";
import { useGetMeQuery } from "@/redux/features/auth/auth.api";
import { 
  BookOpenIcon, 
  CalendarIcon, 
  PlayIcon, 
  ClockIcon, 
  ArrowRightIcon,
  GraduationCapIcon,
  SparklesIcon
} from "lucide-react";
import Link from "next/link";

export default function MyEnrollmentsPage() {
  const { data: meData } = useGetMeQuery(undefined);
  const user = meData as any;
  const { data: enrollmentsData, isLoading } = useGetEnrollmentsByStudentQuery(
    user?._id,
    { skip: !user?._id }
  );

  const enrollments = enrollmentsData?.data || [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getBatchStatus = (startDate: string) => {
    const today = new Date();
    const start = new Date(startDate);
    
    if (start > today) {
      return { status: "Upcoming", variant: "secondary" as const, color: "text-blue-600", bgColor: "bg-blue-50", borderColor: "border-blue-200" };
    } else {
      return { status: "Active", variant: "default" as const, color: "text-[#1FB67A]", bgColor: "bg-[#1FB67A]/10", borderColor: "border-[#1FB67A]/20" };
    }
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="container mx-auto max-w-7xl py-8 px-4">
        <div className="space-y-8">
          {/* Header Skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-6 w-96" />
          </div>

          {/* Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="flex justify-between items-start mb-4">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-6 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </CardHeader>
                <CardContent className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-2 w-full" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-10 w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-7xl py-8 px-4">
        <div className="space-y-8">
          {/* Header Section */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1FB67A]/10 text-[#1FB67A] mb-2 border border-[#1FB67A]/20">
                  <GraduationCapIcon className="h-4 w-4" />
                  <span className="text-sm font-medium">My Learning</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                  My <span className="text-[#1FB67A]">Enrollments</span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl">
                  Access your enrolled courses, track your progress, and continue your learning journey
                </p>
              </div>
              <Link href="/all-courses">
                <Button 
                  size="lg" 
                  className="bg-[#1FB67A] hover:bg-[#1dd489] text-white transition-colors"
                >
                  Browse More Courses
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Enrollments Grid */}
          {enrollments.length === 0 ? (
            <Card className="border-2 border-dashed">
              <CardContent className="py-16">
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#1FB67A]/10 border border-[#1FB67A]/20 mb-4">
                    <BookOpenIcon className="h-10 w-10 text-[#1FB67A]" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">No Enrollments Yet</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    You haven't enrolled in any courses yet. Start your learning journey today and unlock new skills!
                  </p>
                  <div className="pt-4">
                    <Link href="/all-courses">
                      <Button 
                        size="lg" 
                        className="bg-[#1FB67A] hover:bg-[#1dd489] text-white"
                      >
                        <SparklesIcon className="mr-2 h-5 w-5" />
                        Explore Courses
                        <ArrowRightIcon className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrollments.map((enrollment: any) => {
                const { status, variant, color, bgColor, borderColor } = getBatchStatus(enrollment.batchId.startDate);
                
                return (
                  <Card 
                    key={enrollment._id} 
                    className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-[#1FB67A]/30 overflow-hidden"
                  >
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start mb-3">
                        <Badge 
                          variant={variant} 
                          className={`${bgColor} ${borderColor} border text-xs font-semibold`}
                        >
                          {status}
                        </Badge>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground font-medium">
                            Enrolled {formatDate(enrollment.enrollmentDate)}
                          </p>
                        </div>
                      </div>
                      <CardTitle className="text-xl mb-2 group-hover:text-[#1FB67A] transition-colors line-clamp-2">
                        {enrollment.courseId.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-2 text-sm">
                        {enrollment.courseId.description}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="p-1.5 rounded-md bg-[#1FB67A]/10">
                          <BookOpenIcon className="h-4 w-4 text-[#1FB67A]" />
                        </div>
                        <span className="font-medium">{enrollment.courseId.category}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="p-1.5 rounded-md bg-blue-50">
                          <CalendarIcon className="h-4 w-4 text-blue-600" />
                        </div>
                        <span className="font-medium">
                          {enrollment.batchId.name || `Batch ${enrollment.batchId.batchNumber}`}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <div className="p-1.5 rounded-md bg-orange-50">
                          <ClockIcon className={`h-4 w-4 ${color}`} />
                        </div>
                        <span className={`font-medium ${color}`}>
                          Starts: {formatDate(enrollment.batchId.startDate)}
                        </span>
                      </div>
                      
                      {/* Progress Section */}
                      {enrollment.progress && (
                        <div className="space-y-2 pt-2 border-t">
                          <div className="flex justify-between items-center text-sm">
                            <span className="font-semibold text-foreground">Progress</span>
                            <span className="font-bold text-[#1FB67A]">
                              {enrollment.progress.progressPercentage}%
                            </span>
                          </div>
                          <Progress 
                            value={enrollment.progress.progressPercentage} 
                            className="h-2.5"
                          />
                          <div className="text-xs text-muted-foreground">
                            {enrollment.progress.completedLessons} of {enrollment.progress.totalLessons} lessons completed
                          </div>
                        </div>
                      )}
                    </CardContent>
                    
                    <CardFooter className="pt-4">
                      {status === "Upcoming" ? (
                        <Button 
                          className="w-full" 
                          disabled
                          variant="outline"
                        >
                          <ClockIcon className="h-4 w-4 mr-2" />
                          Starts Soon
                        </Button>
                      ) : (
                        <Link href={`/dashboard/learn/${enrollment.courseId.slug}`} className="w-full">
                          <Button 
                            className="w-full bg-[#1FB67A] hover:bg-[#1dd489] text-white transition-colors"
                          >
                            <PlayIcon className="h-4 w-4 mr-2" />
                            Continue Learning
                          </Button>
                        </Link>
                      )}
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

