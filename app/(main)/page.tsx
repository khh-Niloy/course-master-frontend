"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useGetAllCoursesQuery } from "@/redux/features/course/course.api";
import { useGetAllBatchesQuery } from "@/redux/features/batch/batch.api";
import { useAddEnrollmentMutation } from "@/redux/features/enrollment/enrollment.api";
import { useGetMeQuery } from "@/redux/features/auth/auth.api";
import { BookOpenIcon, ClockIcon, UsersIcon, StarIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export default function Home() {
  const { data: coursesData, isLoading: coursesLoading } = useGetAllCoursesQuery({});
  const { data: batchesData } = useGetAllBatchesQuery({});
  const { data: meData } = useGetMeQuery(undefined);
  const [addEnrollment, { isLoading: enrollmentLoading }] = useAddEnrollmentMutation();
  const router = useRouter();

  const courses = coursesData?.data || [];
  const batches = batchesData?.data || [];
  const user = meData;
  console.log(user);

  const handleEnrollNow = async (courseId: string) => {
    if (!user) {
      router.push("/login");
      return;
    }

    // Find the latest batch for this course
    const courseBatches = batches.filter((batch: any) => batch.courseId._id === courseId);
    if (courseBatches.length === 0) {
      toast.error("No batches available for this course");
      return;
    }

    // Get the latest batch (or upcoming batch)
    const latestBatch = courseBatches.sort((a: any, b: any) => 
      new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    )[0];

    try {
      const enrollmentData = {
        studentId: user._id,
        courseId: courseId,
        batchId: latestBatch._id,
      };

      const res = await addEnrollment(enrollmentData).unwrap();
      if (res.success) {
        toast.success("Enrolled successfully! Check your dashboard.");
      }
    } catch (error: any) {
      console.error("Enrollment error:", error);
      toast.error(error.data?.message || "Failed to enroll. Please try again.");
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const getBatchInfo = (courseId: string) => {
    const courseBatches = batches.filter((batch: any) => batch.courseId._id === courseId);
    if (courseBatches.length === 0) return null;

    const upcomingBatches = courseBatches.filter((batch: any) => 
      new Date(batch.startDate) > new Date()
    );
    
    return {
      total: courseBatches.length,
      upcoming: upcomingBatches.length,
      nextStart: upcomingBatches.length > 0 ? upcomingBatches[0].startDate : null,
    };
  };

  if (coursesLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <p>Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Master New Skills with Expert-Led Courses
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Join thousands of students learning from industry professionals
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" variant="secondary">
              Browse Courses
            </Button>
            {!user && (
              <Link href="/login">
                <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-blue-600">
                  Get Started
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Courses</h2>
            <p className="text-lg text-gray-600">
              Discover our most popular courses and start your learning journey today
            </p>
          </div>

          {courses.length === 0 ? (
            <div className="text-center py-12">
              <BookOpenIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-xl text-gray-600">No courses available yet.</p>
              <p className="text-gray-500">Check back soon for new courses!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((course: any) => {
                const batchInfo = getBatchInfo(course._id);
                
                return (
                  <Card key={course._id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <Badge variant="secondary">{course.category}</Badge>
                        <div className="flex items-center gap-1">
                          <StarIcon className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm text-gray-600">4.8</span>
                        </div>
                      </div>
                      <CardTitle className="text-xl">{course.title}</CardTitle>
                      <CardDescription className="line-clamp-3">
                        {course.description}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <BookOpenIcon className="h-4 w-4" />
                          <span>{course.modules?.length || 0} modules</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <UsersIcon className="h-4 w-4" />
                          <span>{batchInfo?.total || 0} batches</span>
                        </div>
                      </div>
                      
                      {batchInfo?.nextStart && (
                        <div className="flex items-center gap-1 text-sm text-green-600">
                          <ClockIcon className="h-4 w-4" />
                          <span>Next batch: {new Date(batchInfo.nextStart).toLocaleDateString()}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Instructors:</span>
                        <div className="flex flex-wrap gap-1">
                          {course.instructor?.slice(0, 2).map((instructor: string, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {instructor}
                            </Badge>
                          ))}
                          {course.instructor?.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{course.instructor.length - 2} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                    
                    <CardFooter className="flex justify-between items-center">
                      <div className="text-2xl font-bold text-green-600">
                        {formatPrice(course.price)}
                      </div>
                      {user?.role === "STUDENT" ? (
                        <Button 
                          onClick={() => handleEnrollNow(course._id)}
                          disabled={enrollmentLoading || !batchInfo}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          {enrollmentLoading ? "Enrolling..." : "Enroll Now"}
                        </Button>
                      ) : user?.role === "ADMIN" ? (
                        <Link href="/dashboard">
                          <Button variant="outline">
                            Manage Course
                          </Button>
                        </Link>
                      ) : (
                        <Link href="/login">
                          <Button className="bg-blue-600 hover:bg-blue-700">
                            Login to Enroll
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
      </section>

      {/* CTA Section */}
      <section className="bg-gray-100 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Learning?</h2>
          <p className="text-lg text-gray-600 mb-8">
            Join our community of learners and advance your career with industry-relevant skills
          </p>
          {!user ? (
            <div className="flex justify-center gap-4">
              <Link href="/register">
                <Button size="lg">Create Account</Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline">Sign In</Button>
              </Link>
            </div>
          ) : (
            <Link href="/dashboard">
              <Button size="lg">Go to Dashboard</Button>
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}