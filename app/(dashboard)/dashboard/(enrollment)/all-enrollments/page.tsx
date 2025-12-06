"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useGetAllEnrollmentsQuery } from "@/redux/features/enrollment/enrollment.api";
import Link from "next/link";

export default function AllEnrollmentsPage() {
  const { data: enrollmentsData, isLoading: enrollmentsLoading } = useGetAllEnrollmentsQuery({});

  const enrollments = enrollmentsData?.data || [];

  // Group enrollments by course
  const groupedEnrollments = enrollments.reduce((acc: any, enrollment: any) => {
    const courseId = enrollment.courseId._id;
    if (!acc[courseId]) {
      acc[courseId] = {
        course: enrollment.courseId,
        enrollments: []
      };
    }
    acc[courseId].enrollments.push(enrollment);
    return acc;
  }, {});

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
    <div className="container mx-auto max-w-7xl px-4 py-6">
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

        {/* Enrollments Table */}
        {enrollmentsLoading ? (
          <div className="text-center py-8">
            <p>Loading enrollments...</p>
          </div>
        ) : enrollments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              No enrollments found.
            </p>
            <Link href="/dashboard/add-enrollment">
              <Button className="mt-4">Create First Enrollment</Button>
            </Link>
          </div>
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-4 font-semibold">Student</th>
                    <th className="text-left p-4 font-semibold">Email</th>
                    <th className="text-left p-4 font-semibold">Batch</th>
                    <th className="text-left p-4 font-semibold">Batch Start Date</th>
                    <th className="text-left p-4 font-semibold">Enrollment Date</th>
                    <th className="text-left p-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.values(groupedEnrollments).map((group: any) => (
                    <React.Fragment key={group.course._id}>
                      {/* Course Header Row */}
                      <tr className="bg-muted/70 border-b-2 border-primary/20">
                        <td colSpan={6} className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-lg font-bold">{group.course.title}</h3>
                              {group.course.description && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {group.course.description}
                                </p>
                              )}
                            </div>
                            <Badge variant="outline" className="ml-4">
                              {group.enrollments.length} {group.enrollments.length === 1 ? 'Enrollment' : 'Enrollments'}
                            </Badge>
                          </div>
                        </td>
                      </tr>
                      {/* Enrollments for this course */}
                      {group.enrollments.map((enrollment: any) => {
                        const { status, variant } = getBatchStatus(enrollment.batchId.startDate);
                        
                        return (
                          <tr 
                            key={enrollment._id} 
                            className="border-b hover:bg-muted/30 transition-colors"
                          >
                            <td className="p-4">
                              <div className="font-medium">{enrollment.studentId.name || "N/A"}</div>
                            </td>
                            <td className="p-4">
                              <div className="text-sm text-muted-foreground">
                                {enrollment.studentId.email || "N/A"}
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="text-sm">
                                {enrollment.batchId.name || `Batch ${enrollment.batchId.batchNumber}`}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                #{enrollment.batchId.batchNumber}
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="text-sm">{formatDate(enrollment.batchId.startDate)}</div>
                            </td>
                            <td className="p-4">
                              <div className="text-sm">{formatDate(enrollment.enrollmentDate)}</div>
                            </td>
                            <td className="p-4">
                              <Badge variant={variant}>{status}</Badge>
                            </td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Summary Stats */}
        {enrollments.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
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

