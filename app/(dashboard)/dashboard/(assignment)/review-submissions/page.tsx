"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  useGetAllSubmissionsQuery,
  useReviewAssignmentMutation 
} from "@/redux/features/assignment/assignment.api";
import { 
  FileTextIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon,
  UserIcon,
  CalendarIcon
} from "lucide-react";
import { toast } from "react-hot-toast";

export default function ReviewSubmissionsPage() {
  const [selectedAssignment, setSelectedAssignment] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{[key: string]: string}>({});
  const [reviewStatus, setReviewStatus] = useState<{[key: string]: string}>({});
  
  const { data: submissionsData, isLoading, refetch } = useGetAllSubmissionsQuery({
    assignmentId: selectedAssignment !== "all" ? selectedAssignment : undefined,
  });
  const [reviewAssignment, { isLoading: isReviewing }] = useReviewAssignmentMutation();
  
  const submissions = submissionsData?.data || [];
  
  const filteredSubmissions = submissions.filter((sub: any) => {
    if (statusFilter === "all") return true;
    return sub.status === statusFilter;
  });
  
  const handleReview = async (submissionId: string) => {
    if (!reviewStatus[submissionId]) {
      toast.error("Please select a review status.");
      return;
    }
    
    try {
      await reviewAssignment({
        submissionId,
        data: {
          status: reviewStatus[submissionId],
          feedback: feedback[submissionId] || "",
        },
      }).unwrap();
      
      toast.success("Assignment reviewed successfully!");
      setReviewingId(null);
      setFeedback(prev => {
        const newFeedback = { ...prev };
        delete newFeedback[submissionId];
        return newFeedback;
      });
      setReviewStatus(prev => {
        const newStatus = { ...prev };
        delete newStatus[submissionId];
        return newStatus;
      });
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to review assignment. Please try again.");
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <Badge className="bg-green-100 text-green-700">Approved</Badge>;
      case "REJECTED":
        return <Badge className="bg-red-100 text-red-700">Rejected</Badge>;
      case "REVIEWED":
        return <Badge className="bg-blue-100 text-blue-700">Reviewed</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>;
    }
  };
  
  // Get unique assignments from submissions
  const assignments = Array.from(
    new Set(submissions.map((sub: any) => sub.assignmentId?._id))
  ).map((id: any) => {
    const sub = submissions.find((s: any) => s.assignmentId?._id === id);
    return sub?.assignmentId;
  }).filter(Boolean);
  
  if (isLoading) {
    return (
      <div className="container mx-auto max-w-7xl py-8">
        <div className="text-center">Loading submissions...</div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto max-w-7xl py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Review Assignment Submissions</h1>
          <p className="text-muted-foreground mt-2">
            Review and provide feedback on student assignment submissions.
          </p>
        </div>
        
        <div className="flex gap-4">
          <div className="flex-1">
            <Label>Filter by Assignment</Label>
            <Select value={selectedAssignment} onValueChange={setSelectedAssignment}>
              <SelectTrigger>
                <SelectValue placeholder="All Assignments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Assignments</SelectItem>
                {assignments.map((assignment: any) => (
                  <SelectItem key={assignment._id} value={assignment._id}>
                    {assignment.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex-1">
            <Label>Filter by Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="REVIEWED">Reviewed</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="space-y-4">
          {filteredSubmissions.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                No submissions found.
              </CardContent>
            </Card>
          ) : (
            filteredSubmissions.map((submission: any) => (
              <Card key={submission._id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileTextIcon className="h-6 w-6 text-purple-500" />
                      <div>
                        <CardTitle className="text-lg">
                          {submission.assignmentId?.title || "Unknown Assignment"}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <UserIcon className="h-4 w-4" />
                          {submission.studentId?.name || submission.studentId?.email || "Unknown Student"}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(submission.status)}
                      {submission.reviewedAt && (
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <CalendarIcon className="h-4 w-4" />
                          {new Date(submission.reviewedAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-semibold">Assignment Instructions</Label>
                      <p className="mt-1 text-sm text-gray-600">
                        {submission.assignmentId?.instructions || "N/A"}
                      </p>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-semibold">Student Submission</Label>
                      <div className="mt-2 p-4 bg-gray-50 rounded-lg border">
                        {submission.assignmentId?.type === "drive_link" ? (
                          <a
                            href={submission.submission}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline break-all"
                          >
                            {submission.submission}
                          </a>
                        ) : (
                          <p className="whitespace-pre-wrap text-sm">{submission.submission}</p>
                        )}
                      </div>
                    </div>
                    
                    {submission.feedback && (
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <Label className="text-sm font-semibold text-blue-900">Previous Feedback</Label>
                        <p className="mt-1 text-sm text-blue-800 whitespace-pre-wrap">
                          {submission.feedback}
                        </p>
                      </div>
                    )}
                    
                    {reviewingId === submission._id ? (
                      <div className="space-y-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div>
                          <Label>Review Status</Label>
                          <Select
                            value={reviewStatus[submission._id] || ""}
                            onValueChange={(value) =>
                              setReviewStatus(prev => ({ ...prev, [submission._id]: value }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="APPROVED">Approved</SelectItem>
                              <SelectItem value="REJECTED">Rejected</SelectItem>
                              <SelectItem value="REVIEWED">Reviewed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label>Feedback</Label>
                          <Textarea
                            placeholder="Provide feedback to the student..."
                            value={feedback[submission._id] || ""}
                            onChange={(e) =>
                              setFeedback(prev => ({ ...prev, [submission._id]: e.target.value }))
                            }
                            rows={4}
                          />
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleReview(submission._id)}
                            disabled={isReviewing}
                          >
                            {isReviewing ? "Submitting..." : "Submit Review"}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setReviewingId(null);
                              setFeedback(prev => {
                                const newFeedback = { ...prev };
                                delete newFeedback[submission._id];
                                return newFeedback;
                              });
                              setReviewStatus(prev => {
                                const newStatus = { ...prev };
                                delete newStatus[submission._id];
                                return newStatus;
                              });
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() => setReviewingId(submission._id)}
                      >
                        {submission.status === "PENDING" ? "Review Submission" : "Update Review"}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

