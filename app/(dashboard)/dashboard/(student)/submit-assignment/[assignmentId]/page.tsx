"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { 
  useGetAssignmentByIdQuery, 
  useSubmitAssignmentMutation,
  useGetAssignmentSubmissionQuery 
} from "@/redux/features/assignment/assignment.api";
import { ArrowLeftIcon, FileTextIcon, CheckCircleIcon, ClockIcon, XCircleIcon } from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";

export default function SubmitAssignmentPage() {
  const params = useParams();
  const router = useRouter();
  const assignmentId = params.assignmentId as string;
  
  const { data: assignmentData, isLoading: assignmentLoading, error: assignmentError } = useGetAssignmentByIdQuery(assignmentId);
  const { data: submissionData } = useGetAssignmentSubmissionQuery(assignmentId);
  const [submitAssignment, { isLoading: isSubmitting }] = useSubmitAssignmentMutation();
  
  const [submission, setSubmission] = useState("");
  
  const assignment = assignmentData?.data;
  const existingSubmission = submissionData?.data;
  
  React.useEffect(() => {
    if (existingSubmission?.submission) {
      setSubmission(existingSubmission.submission);
    }
  }, [existingSubmission]);
  
  const handleSubmit = async () => {
    if (!submission.trim()) {
      toast.error("Please provide your submission.");
      return;
    }
    
    try {
      await submitAssignment({
        assignmentId,
        submission: submission.trim(),
      }).unwrap();
      
      toast.success("Assignment submitted successfully!");
      router.push("/dashboard/my-enrollments");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to submit assignment. Please try again.");
    }
  };
  
  if (assignmentLoading) {
    return (
      <div className="container mx-auto max-w-4xl py-8">
        <div className="text-center">Loading assignment...</div>
      </div>
    );
  }
  
  if ((!assignment || assignmentError) && !submission) {
    return (
      <div className="container mx-auto max-w-4xl py-8">
        <div className="text-center">
          <p className="text-destructive">Assignment not found</p>
          <Link href="/dashboard/my-enrollments">
            <Button variant="outline" className="mt-4">Back to Enrollments</Button>
          </Link>
        </div>
      </div>
    );
  }
  
  // If assignment is not found but we have submission data, use assignment from submission
  const assignmentToUse = assignment || (submission as any)?.assignmentId;
  
  if (!assignmentToUse) {
    return (
      <div className="container mx-auto max-w-4xl py-8">
        <div className="text-center">
          <p className="text-destructive">Assignment not found</p>
          <Link href="/dashboard/my-enrollments">
            <Button variant="outline" className="mt-4">Back to Enrollments</Button>
          </Link>
        </div>
      </div>
    );
  }
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-green-100 text-green-700">
            <CheckCircleIcon className="h-4 w-4" />
            Approved
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-red-100 text-red-700">
            <XCircleIcon className="h-4 w-4" />
            Rejected
          </span>
        );
      case "REVIEWED":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700">
            <ClockIcon className="h-4 w-4" />
            Reviewed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-700">
            <ClockIcon className="h-4 w-4" />
            Pending Review
          </span>
        );
    }
  };
  
  return (
    <div className="container mx-auto max-w-4xl py-8">
      <div className="space-y-6">
        <Link href="/dashboard/my-enrollments">
          <Button variant="outline" size="sm">
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileTextIcon className="h-6 w-6 text-purple-500" />
                <div>
                  <CardTitle>{assignmentToUse.title}</CardTitle>
                  <CardDescription>
                    {assignmentToUse.type === "drive_link" ? "Drive Link" : "Text"} Assignment
                  </CardDescription>
                </div>
              </div>
              {existingSubmission && getStatusBadge(existingSubmission.status)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {assignmentToUse.question && (
                <div>
                  <Label className="text-base font-semibold">Question</Label>
                  <p className="mt-2 text-gray-700">{assignmentToUse.question}</p>
                </div>
              )}
              
              <div>
                <Label className="text-base font-semibold">Instructions</Label>
                <p className="mt-2 text-gray-700 whitespace-pre-wrap">{assignmentToUse.instructions}</p>
              </div>
              
              {existingSubmission?.feedback && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <Label className="text-base font-semibold text-blue-900">Feedback from Admin</Label>
                  <p className="mt-2 text-blue-800 whitespace-pre-wrap">{existingSubmission.feedback}</p>
                  {existingSubmission.reviewedAt && (
                    <p className="mt-2 text-sm text-blue-600">
                      Reviewed on: {new Date(existingSubmission.reviewedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}
              
              <div>
                <Label htmlFor="submission" className="text-base font-semibold">
                  Your Submission {existingSubmission && "(You can update your submission)"}
                </Label>
                {assignmentToUse.type === "drive_link" ? (
                  <Input
                    id="submission"
                    type="url"
                    placeholder="Enter Google Drive link"
                    value={submission}
                    onChange={(e) => setSubmission(e.target.value)}
                    className="mt-2"
                  />
                ) : (
                  <Textarea
                    id="submission"
                    placeholder="Enter your submission here..."
                    value={submission}
                    onChange={(e) => setSubmission(e.target.value)}
                    rows={10}
                    className="mt-2"
                  />
                )}
                <p className="mt-2 text-sm text-gray-500">
                  {assignmentToUse.type === "drive_link" 
                    ? "Please provide a shareable Google Drive link to your assignment file."
                    : "Write your assignment submission in the text area above."}
                </p>
              </div>
              
              <div className="flex justify-end gap-4">
                <Link href="/dashboard/my-enrollments">
                  <Button variant="outline">Cancel</Button>
                </Link>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !submission.trim()}
                  size="lg"
                >
                  {isSubmitting ? "Submitting..." : existingSubmission ? "Update Submission" : "Submit Assignment"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

