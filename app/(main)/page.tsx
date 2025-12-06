"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useGetAllCoursesQuery } from "@/redux/features/course/course.api";
import { useGetAllBatchesQuery } from "@/redux/features/batch/batch.api";
import { useAddEnrollmentMutation, useGetEnrollmentsByStudentQuery } from "@/redux/features/enrollment/enrollment.api";
import { useGetMeQuery } from "@/redux/features/auth/auth.api";
import { 
  BookOpenIcon, 
  ClockIcon, 
  UsersIcon, 
  StarIcon, 
  TrendingUpIcon, 
  CheckCircle2Icon,
  ArrowRightIcon,
  ZapIcon
} from "lucide-react";
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
  
  // Fetch student enrollments if user is a student
  const { data: enrollmentsData } = useGetEnrollmentsByStudentQuery(
    (user as any)?._id,
    { skip: !(user as any)?._id || (user as any)?.role !== "STUDENT" }
  );
  const enrollments = enrollmentsData?.data || [];
  
  // Helper function to check if student is enrolled in a course
  const isEnrolledInCourse = (courseId: string) => {
    return enrollments.some((enrollment: any) => enrollment.courseId._id === courseId);
  };

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
        studentId: (user as any)._id,
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
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white py-24 md:py-32">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 border border-gray-200 mb-8">
              <TrendingUpIcon className="h-4 w-4 text-[#1FB67A]" />
              <span className="text-sm font-medium text-black">Trusted by thousands of learners</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-black leading-tight">
              Master New Skills with <span className="text-[#1FB67A]">Expert-Led Courses</span>
            </h1>
            <p className="text-base md:text-lg text-gray-700 mb-10 max-w-2xl mx-auto leading-relaxed">
              Join thousands of students learning from industry professionals. Transform your career with hands-on, practical courses designed for real-world success.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
              <Link href="/all-courses">
                <Button size="lg" style={{ backgroundColor: '#1FB67A', color: 'white' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1dd489'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1FB67A'}>
                  Browse Courses
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              {!user && (
                <Link href="/login">
                  <Button size="lg" variant="outline" style={{ borderColor: '#1FB67A', color: '#1FB67A' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#1FB67A'; e.currentTarget.style.color = 'white'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#1FB67A'; }}>
                    Get Started Free
                  </Button>
                </Link>
              )}
            </div>
            <div className="flex flex-wrap justify-center gap-8 text-sm text-black">
              <div className="flex items-center gap-2">
                <CheckCircle2Icon className="h-5 w-5 text-[#1FB67A]" />
                <span>Expert Instructors</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2Icon className="h-5 w-5 text-[#1FB67A]" />
                <span>Lifetime Access</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2Icon className="h-5 w-5 text-[#1FB67A]" />
                <span>Certificates</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-[#1FB67A] mb-2">
                {courses.length}+
              </div>
              <div className="text-black font-medium">Courses Available</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-[#1FB67A] mb-2">
                10K+
              </div>
              <div className="text-black font-medium">Active Students</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-[#1FB67A] mb-2">
                50+
              </div>
              <div className="text-black font-medium">Expert Instructors</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-[#1FB67A] mb-2">
                98%
              </div>
              <div className="text-black font-medium">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1FB67A]/10 text-[#1FB67A] mb-4 border border-[#1FB67A]/20">
              <ZapIcon className="h-4 w-4" />
              <span className="text-sm font-medium">All Courses</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">
              Start Your <span className="text-[#1FB67A]">Learning Journey</span>
            </h2>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              Discover our carefully curated courses and start building skills that matter
            </p>
          </div>

          {courses.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-6">
                <BookOpenIcon className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-2xl font-semibold text-black mb-2">No courses available yet</h3>
              <p className="text-gray-700">Check back soon for new courses!</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                {courses.slice(0, 2).map((course: any) => {
                const batchInfo = getBatchInfo(course._id);
                
                return (
                  <Card key={course._id} className="group hover:shadow-2xl transition-all duration-300 border-2 border-gray-200 overflow-hidden">
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start mb-3">
                        <Badge variant="secondary" className="bg-[#1FB67A]/10 text-[#1FB67A] hover:bg-[#1FB67A]/20 border border-[#1FB67A]/20">
                          {course.category}
                        </Badge>
                        <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full border border-yellow-200">
                          <StarIcon className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-semibold text-black">4.8</span>
                        </div>
                      </div>
                      <CardTitle className="text-2xl mb-3 group-hover:text-[#1FB67A] transition-colors text-black">
                        {course.title}
                      </CardTitle>
                      <CardDescription className="text-base line-clamp-2 text-gray-700">
                        {course.description}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-4 pb-4">
                      <div className="flex items-center gap-6 text-sm text-gray-700">
                        <div className="flex items-center gap-2">
                          <BookOpenIcon className="h-4 w-4 text-[#1FB67A]" />
                          <span className="font-medium">{course.modules?.length || 0} modules</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <UsersIcon className="h-4 w-4 text-[#1FB67A]" />
                          <span className="font-medium">{batchInfo?.total || 0} batches</span>
                        </div>
                      </div>
                      
                      {batchInfo?.nextStart && (
                        <div className="flex items-center gap-2 text-sm bg-[#1FB67A]/10 text-[#1FB67A] px-3 py-2 rounded-lg border border-[#1FB67A]/20">
                          <ClockIcon className="h-4 w-4" />
                          <span className="font-medium">Next batch: {new Date(batchInfo.nextStart).toLocaleDateString()}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                        <span className="text-sm text-gray-700 font-medium">Instructors:</span>
                        <div className="flex flex-wrap gap-1">
                          {course.instructor?.slice(0, 2).map((instructor: string, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs border-gray-300 text-black">
                              {instructor}
                            </Badge>
                          ))}
                          {course.instructor?.length > 2 && (
                            <Badge variant="outline" className="text-xs border-gray-300 text-black">
                              +{course.instructor.length - 2} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                    
                    <CardFooter className="flex justify-between items-center pt-4 border-t border-gray-200 bg-gray-50/50">
                      <div>
                        <div className="text-3xl font-bold text-[#1FB67A]">
                          {formatPrice(course.price)}
                        </div>
                        <div className="text-xs text-gray-600">One-time payment</div>
                      </div>
                      {(user as any)?.role === "STUDENT" ? (
                        isEnrolledInCourse(course._id) ? (
                          <Link href={`/dashboard/learn/${course.slug}`}>
                            <Button style={{ backgroundColor: '#1FB67A', color: 'white' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1dd489'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1FB67A'}>
                              View Course
                              <ArrowRightIcon className="ml-2 h-4 w-4" />
                            </Button>
                          </Link>
                        ) : (
                          <Button 
                            onClick={() => handleEnrollNow(course._id)}
                            disabled={enrollmentLoading || !batchInfo}
                            style={{ backgroundColor: '#1FB67A', color: 'white' }}
                            onMouseEnter={(e) => !enrollmentLoading && !batchInfo ? null : e.currentTarget.style.backgroundColor = '#1dd489'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1FB67A'}
                          >
                            {enrollmentLoading ? "Enrolling..." : "Enroll Now"}
                            {!enrollmentLoading && <ArrowRightIcon className="ml-2 h-4 w-4" />}
                          </Button>
                        )
                      ) : (user as any)?.role === "ADMIN" ? (
                        <Link href="/dashboard">
                          <Button variant="outline">
                            Manage Course
                          </Button>
                        </Link>
                      ) : (
                        <Link href="/login">
                          <Button style={{ backgroundColor: '#1FB67A', color: 'white' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1dd489'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1FB67A'}>
                            Login to Enroll
                            <ArrowRightIcon className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                      )}
                    </CardFooter>
                  </Card>
                );
                })}
              </div>
              <div className="text-center">
                <Link href="/all-courses">
                  <Button size="lg" style={{ backgroundColor: '#1FB67A', color: 'white' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1dd489'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1FB67A'}>
                    View All Courses
                    <ArrowRightIcon className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

    </div>
  );
}