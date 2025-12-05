"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGetAllCoursesQuery } from "@/redux/features/course/course.api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { BookOpenIcon, DollarSignIcon } from "lucide-react";

export default function AllCoursesPage() {
  const [searchTerm, setSearchTerm] = useState<string>("");

  const { data: coursesData, isLoading: coursesLoading } = useGetAllCoursesQuery({});

  const courses = coursesData?.data || [];

  const filteredCourses = courses.filter((course: any) => {
    const matchesSearch = !searchTerm || 
      course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  return (
    <div className="container mx-auto max-w-7xl py-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">All Courses</h1>
            <p className="text-muted-foreground mt-2">
              Manage and view all courses
            </p>
          </div>
          <Link href="/dashboard/add-course">
            <Button>Add New Course</Button>
          </Link>
        </div>

        {/* Search */}
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <Input
              placeholder="Search courses by title, category, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Courses Grid */}
        {coursesLoading ? (
          <div className="text-center py-8">
            <p>Loading courses...</p>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              {courses.length === 0 
                ? "No courses found. Create your first course!" 
                : "No courses match your search criteria."
              }
            </p>
            {courses.length === 0 && (
              <Link href="/dashboard/add-course">
                <Button className="mt-4">Create First Course</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course: any) => (
              <Card key={course._id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg line-clamp-2">
                      {course.title}
                    </CardTitle>
                    <Badge variant="secondary">{course.category}</Badge>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {course.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <DollarSignIcon className="h-4 w-4" />
                    <span>Price: ${course.price}</span>
                  </div>
                  
                  {course.tags && course.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {course.tags.slice(0, 3).map((tag: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {course.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{course.tags.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  {course.instructor && course.instructor.length > 0 && (
                    <div className="text-sm text-muted-foreground">
                      Instructors: {course.instructor.slice(0, 2).join(", ")}
                      {course.instructor.length > 2 && ` +${course.instructor.length - 2} more`}
                    </div>
                  )}
                  
                  <div className="pt-2 flex gap-2">
                    <Link href={`/dashboard/edit-course/${course.slug}`} className="flex-1">
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

        {/* Summary */}
        {courses.length > 0 && (
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium mb-2">Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Total Courses</p>
                <p className="font-semibold">{courses.length}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Showing</p>
                <p className="font-semibold">{filteredCourses.length}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
