"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useGetAllEnrollmentsQuery } from "@/redux/features/enrollment/enrollment.api";
import { useGetAllCoursesQuery } from "@/redux/features/course/course.api";
import { BookOpenIcon, CalendarIcon, UserIcon, ClockIcon } from "lucide-react";
import Link from "next/link";

export default function AllEnrollmentsPage() {
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const { data: enrollmentsData, isLoading: enrollmentsLoading } = useGetAllEnrollmentsQuery({});
  const { data: coursesData } = useGetAllCoursesQuery({});

  const enrollments = enrollmentsData?.data || [];
  const courses = coursesData?.data || [];

  // Filter enrollments based on selected course and search term
  const filteredEnrollments = enrollments.filter((enrollment: any) => {
    const matchesCourse = selectedCourse === "all" || enrollment.courseId._id === selectedCourse;
    const matchesSearch = !searchTerm || 
      enrollment.studentId.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enrollment.studentId.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enrollment.courseId.title?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCourse && matchesSearch;
  });

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
      return { status: "Upcoming", variant: "secondary" as const };
    } else {
      return { status: "Active", variant: "default" as const };
    }
  };

  return (
    <div className="container mx-auto max-w-7xl py-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">All Enrollments</h1>
            <p className="text-muted-foreground mt-2">
              Manage and view all student enrollments
            </p>
          </div>
          <Link href="/dashboard/add-enrollment">
            <Button>Add New Enrollment</Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <Label htmlFor="search">Search Enrollments</Label>
            <Input
              id="search"
              placeholder="Search by student name, email, or course title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="min-w-[200px]">
            <Label htmlFor="course-filter">Filter by Course</Label>
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger>
                <SelectValue placeholder="All courses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All courses</SelectItem>
                {courses.map((course: any) => (
                  <SelectItem key={course._id} value={course._id}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Enrollments Grid */}
        {enrollmentsLoading ? (
          <div className="text-center py-8">
            <p>Loading enrollments...</p>
          </div>
        ) : filteredEnrollments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              {enrollments.length === 0 
                ? "No enrollments found." 
                : "No enrollments match your search criteria."
              }
            </p>
            {enrollments.length === 0 && (
              <Link href="/dashboard/add-enrollment">
                <Button className="mt-4">Create First Enrollment</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEnrollments.map((enrollment: any) => {
              const { status, variant } = getBatchStatus(enrollment.batchId.startDate);
              
              return (
                <Card key={enrollment._id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge variant={variant}>{status}</Badge>
                      <span className="text-xs text-gray-500">
                        #{enrollment.batchId.batchNumber}
                      </span>
                    </div>
                    <CardTitle className="text-lg">
                      {enrollment.courseId.title}
                    </CardTitle>
                    <CardDescription>
                      {enrollment.batchId.name || `Batch ${enrollment.batchId.batchNumber}`}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <UserIcon className="h-4 w-4" />
                      <div>
                        <p className="font-medium">{enrollment.studentId.name}</p>
                        <p className="text-xs text-gray-500">{enrollment.studentId.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CalendarIcon className="h-4 w-4" />
                      <span>Starts: {formatDate(enrollment.batchId.startDate)}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <ClockIcon className="h-4 w-4" />
                      <span>Enrolled: {formatDate(enrollment.enrollmentDate)}</span>
                    </div>
                  </CardContent>
                  
                  <CardFooter>
                    <div className="w-full text-center text-xs text-gray-500">
                      Enrollment ID: {enrollment._id}
                    </div>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}

        {/* Summary Stats */}
        {enrollments.length > 0 && (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
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
                <p className="text-sm text-gray-600">Active Enrollments</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {enrollments.filter((e: any) => new Date(e.batchId.startDate) > new Date()).length}
                </div>
                <p className="text-sm text-gray-600">Upcoming Enrollments</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {new Set(enrollments.map((e: any) => e.studentId._id)).size}
                </div>
                <p className="text-sm text-gray-600">Unique Students</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

