"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useGetEnrollmentsByStudentQuery } from "@/redux/features/enrollment/enrollment.api";
import { useGetMeQuery } from "@/redux/features/auth/auth.api";
import { BookOpenIcon, CalendarIcon, PlayIcon, ClockIcon } from "lucide-react";
import Link from "next/link";

export default function MyEnrollmentsPage() {
  const { data: meData } = useGetMeQuery(undefined);
  const { data: enrollmentsData, isLoading } = useGetEnrollmentsByStudentQuery(
    meData?._id,
    { skip: !meData?._id }
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
      return { status: "Upcoming", variant: "secondary" as const, color: "text-blue-600" };
    } else {
      return { status: "Active", variant: "default" as const, color: "text-green-600" };
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <p>Loading your enrollments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl py-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Enrollments</h1>
            <p className="text-muted-foreground mt-2">
              Access your enrolled courses and track your progress
            </p>
          </div>
          <Link href="/">
            <Button variant="outline">Browse More Courses</Button>
          </Link>
        </div>

        {enrollments.length === 0 ? (
          <div className="text-center py-12">
            <BookOpenIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Enrollments Yet</h3>
            <p className="text-gray-600 mb-6">
              You haven't enrolled in any courses yet. Start your learning journey today!
            </p>
            <Link href="/">
              <Button size="lg">Explore Courses</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments.map((enrollment: any) => {
              const { status, variant, color } = getBatchStatus(enrollment.batchId.startDate);
              
              return (
                <Card key={enrollment._id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <Badge variant={variant}>{status}</Badge>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">
                          Enrolled: {formatDate(enrollment.enrollmentDate)}
                        </p>
                      </div>
                    </div>
                    <CardTitle className="text-lg">
                      {enrollment.courseId.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {enrollment.courseId.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <BookOpenIcon className="h-4 w-4" />
                      <span>Category: {enrollment.courseId.category}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CalendarIcon className="h-4 w-4" />
                      <span>
                        {enrollment.batchId.name || `Batch ${enrollment.batchId.batchNumber}`}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <ClockIcon className="h-4 w-4" />
                      <span className={color}>
                        Starts: {formatDate(enrollment.batchId.startDate)}
                      </span>
                    </div>
                    
                    {/* Progress Bar */}
                    {enrollment.progress && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{enrollment.progress.progressPercentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${enrollment.progress.progressPercentage}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {enrollment.progress.completedLessons} of {enrollment.progress.totalLessons} lessons completed
                        </div>
                      </div>
                    )}
                  </CardContent>
                  
                  <CardFooter>
                    {status === "Upcoming" ? (
                      <Button className="w-full" disabled>
                        <ClockIcon className="h-4 w-4 mr-2" />
                        Starts Soon
                      </Button>
                    ) : (
                      <Link href={`/dashboard/learn/${enrollment.courseId.slug}`} className="w-full">
                        <Button className="w-full">
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

        {/* Stats Summary */}
        {enrollments.length > 0 && (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {enrollments.length}
                </div>
                <p className="text-sm text-gray-600">Total Enrollments</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {enrollments.filter((e: any) => new Date(e.batchId.startDate) <= new Date()).length}
                </div>
                <p className="text-sm text-gray-600">Active Courses</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {enrollments.filter((e: any) => new Date(e.batchId.startDate) > new Date()).length}
                </div>
                <p className="text-sm text-gray-600">Upcoming Courses</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

