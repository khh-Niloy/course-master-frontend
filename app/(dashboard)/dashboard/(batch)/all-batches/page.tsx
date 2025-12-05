"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGetAllBatchesQuery } from "@/redux/features/batch/batch.api";
import { useGetAllCoursesQuery } from "@/redux/features/course/course.api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, BookOpenIcon, UsersIcon } from "lucide-react";
import Link from "next/link";

export default function AllBatchesPage() {
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const { data: batchesData, isLoading: batchesLoading } = useGetAllBatchesQuery({});
  const { data: coursesData } = useGetAllCoursesQuery({});

  const batches = batchesData?.data || [];
  const courses = coursesData?.data || [];

  // Filter batches based on selected course and search term
  const filteredBatches = batches.filter((batch: any) => {
    const matchesCourse = selectedCourse === "all" || batch.courseId._id === selectedCourse;
    const matchesSearch = !searchTerm || 
      batch.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      batch.courseId.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `batch ${batch.batchNumber}`.toLowerCase().includes(searchTerm.toLowerCase());
    
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
      return { status: "Ongoing", variant: "default" as const };
    }
  };

  return (
    <div className="container mx-auto max-w-7xl py-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">All Batches</h1>
            <p className="text-muted-foreground mt-2">
              Manage and view all course batches
            </p>
          </div>
          <Link href="/dashboard/add-batch">
            <Button>Add New Batch</Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <Label htmlFor="search">Search Batches</Label>
            <Input
              id="search"
              placeholder="Search by batch name, course title, or batch number..."
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

        {/* Batches Grid */}
        {batchesLoading ? (
          <div className="text-center py-8">
            <p>Loading batches...</p>
          </div>
        ) : filteredBatches.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              {batches.length === 0 
                ? "No batches found. Create your first batch!" 
                : "No batches match your search criteria."
              }
            </p>
            {batches.length === 0 && (
              <Link href="/dashboard/add-batch">
                <Button className="mt-4">Create First Batch</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBatches.map((batch: any) => {
              const { status, variant } = getBatchStatus(batch.startDate);
              
              return (
                <Card key={batch._id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        {batch.name || `Batch ${batch.batchNumber}`}
                      </CardTitle>
                      <Badge variant={variant}>{status}</Badge>
                    </div>
                    <CardDescription>
                      {batch.courseId.title}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <BookOpenIcon className="h-4 w-4" />
                      <span>Course: {batch.courseId.title}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CalendarIcon className="h-4 w-4" />
                      <span>Starts: {formatDate(batch.startDate)}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <UsersIcon className="h-4 w-4" />
                      <span>Batch #{batch.batchNumber}</span>
                    </div>
                    
                    <div className="pt-2">
                      <p className="text-xs text-muted-foreground">
                        Created: {formatDate(batch.createdAt)}
                      </p>
                    </div>
                    
                    <div className="pt-2 flex gap-2">
                      <Link href={`/dashboard/edit-batch/${batch._id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          Edit
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Summary */}
        {batches.length > 0 && (
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium mb-2">Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Total Batches</p>
                <p className="font-semibold">{batches.length}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Showing</p>
                <p className="font-semibold">{filteredBatches.length}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Upcoming</p>
                <p className="font-semibold">
                  {batches.filter((b: any) => new Date(b.startDate) > new Date()).length}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Ongoing</p>
                <p className="font-semibold">
                  {batches.filter((b: any) => new Date(b.startDate) <= new Date()).length}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}