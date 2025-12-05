"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGetAllAssignmentsQuery } from "@/redux/features/assignment/assignment.api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { FileTextIcon, CalendarIcon, HelpCircleIcon } from "lucide-react";

export default function AllAssignmentsPage() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const { data: assignmentsData, isLoading: assignmentsLoading } = useGetAllAssignmentsQuery({});

  const assignments = assignmentsData?.data || [];

  const filteredAssignments = assignments.filter((assignment: any) => {
    const matchesSearch = !searchTerm || 
      assignment.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.question?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.instructions?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === "all" || assignment.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTypeBadgeVariant = (type: string) => {
    return type === "drive_link" ? "default" : "secondary";
  };

  const getTypeLabel = (type: string) => {
    return type === "drive_link" ? "Drive Link" : "Text";
  };

  return (
    <div className="container mx-auto max-w-7xl py-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">All Assignments</h1>
            <p className="text-muted-foreground mt-2">
              Manage and view all assignments
            </p>
          </div>
          <Link href="/dashboard/add-assignment">
            <Button>Add New Assignment</Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <Input
              placeholder="Search assignments by title, question, or instructions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="min-w-[180px]">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="all">All Types</option>
              <option value="drive_link">Drive Link</option>
              <option value="text">Text</option>
            </select>
          </div>
        </div>

        {/* Assignments Grid */}
        {assignmentsLoading ? (
          <div className="text-center py-8">
            <p>Loading assignments...</p>
          </div>
        ) : filteredAssignments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              {assignments.length === 0 
                ? "No assignments found. Create your first assignment!" 
                : "No assignments match your search criteria."
              }
            </p>
            {assignments.length === 0 && (
              <Link href="/dashboard/add-assignment">
                <Button className="mt-4">Create First Assignment</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAssignments.map((assignment: any) => (
              <Card key={assignment._id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg line-clamp-2">
                      {assignment.title}
                    </CardTitle>
                    <Badge variant={getTypeBadgeVariant(assignment.type)}>
                      {getTypeLabel(assignment.type)}
                    </Badge>
                  </div>
                  {assignment.question && (
                    <CardDescription className="line-clamp-2">
                      {assignment.question}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  {assignment.instructions && (
                    <div className="text-sm text-muted-foreground line-clamp-3">
                      <strong>Instructions:</strong> {assignment.instructions}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarIcon className="h-4 w-4" />
                    <span>Created: {formatDate(assignment.createdAt)}</span>
                  </div>
                  
                  {assignment.question && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <HelpCircleIcon className="h-4 w-4" />
                      <span className="line-clamp-1">{assignment.question}</span>
                    </div>
                  )}
                  
                  <div className="pt-2 flex gap-2">
                    <Link href={`/dashboard/edit-assignment/${assignment._id}`} className="flex-1">
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
        {assignments.length > 0 && (
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium mb-2">Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Total Assignments</p>
                <p className="font-semibold">{assignments.length}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Showing</p>
                <p className="font-semibold">{filteredAssignments.length}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Drive Link</p>
                <p className="font-semibold">
                  {assignments.filter((a: any) => a.type === "drive_link").length}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Text</p>
                <p className="font-semibold">
                  {assignments.filter((a: any) => a.type === "text").length}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
