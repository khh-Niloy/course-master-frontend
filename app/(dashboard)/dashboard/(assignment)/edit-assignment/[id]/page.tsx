"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePatchAssignmentMutation, useGetAllAssignmentsQuery } from "@/redux/features/assignment/assignment.api";
import { toast } from "react-hot-toast";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

const assignmentPatchSchema = z.object({
  title: z.string().min(1).optional(),
  question: z.string().optional(),
  instructions: z.string().optional(),
  type: z.enum(["drive_link", "text"]).optional(),
});

type AssignmentPatchData = z.infer<typeof assignmentPatchSchema>;

export default function EditAssignmentPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const { data: assignmentsData } = useGetAllAssignmentsQuery({});
  const [patchAssignment, { isLoading: isPatching }] = usePatchAssignmentMutation();

  const assignment = assignmentsData?.data?.find((a: any) => a._id === id);

  const {
    register,
    handleSubmit,
    formState: { errors, dirtyFields, isDirty },
    reset,
    setValue,
    watch,
  } = useForm<AssignmentPatchData>({
    resolver: zodResolver(assignmentPatchSchema),
  });

  const selectedType = watch("type");

  useEffect(() => {
    if (assignment) {
      reset({
        title: assignment.title || "",
        question: assignment.question || "",
        instructions: assignment.instructions || "",
        type: assignment.type as "drive_link" | "text" | undefined,
      });
    }
  }, [assignment, reset]);

  const onSubmit = async (data: AssignmentPatchData) => {
    try {
      const patchData: any = {};
      if (dirtyFields.title && data.title) patchData.title = data.title;
      if (dirtyFields.question && data.question !== undefined) patchData.question = data.question;
      if (dirtyFields.instructions && data.instructions) patchData.instructions = data.instructions;
      if (dirtyFields.type && data.type) patchData.type = data.type;

      if (Object.keys(patchData).length === 0) {
        toast.error("No changes detected");
        return;
      }

      const res = await patchAssignment({ id, data: patchData }).unwrap();
      if (res.success) {
        toast.success("Assignment updated successfully");
        router.push("/dashboard");
      }
    } catch (error: any) {
      console.error("Error updating assignment:", error);
      toast.error(error?.data?.message || "Failed to update assignment. Please try again.");
    }
  };

  if (!assignment) {
    return (
      <div className="container mx-auto max-w-4xl py-8">
        <div className="text-center">
          <p className="text-destructive">Assignment not found</p>
          <Link href="/dashboard">
            <Button variant="outline" className="mt-4">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Edit Assignment</h1>
          <p className="text-muted-foreground mt-2">
            Update assignment information. Leave fields empty to keep current values.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Assignment Title</Label>
            <Input
              id="title"
              type="text"
              placeholder="Enter assignment title"
              {...register("title")}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="question">Assignment Question (Optional)</Label>
            <Textarea
              id="question"
              placeholder="Enter the main assignment question"
              rows={3}
              {...register("question")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="instructions">Instructions</Label>
            <Textarea
              id="instructions"
              placeholder="Provide detailed instructions"
              rows={6}
              {...register("instructions")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Assignment Type</Label>
            <Select 
              value={selectedType || ""} 
              onValueChange={(value) => setValue("type", value as "drive_link" | "text")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select assignment type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="drive_link">Google Drive Link Submission</SelectItem>
                <SelectItem value="text">Text Answer Submission</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedType && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Assignment Type Info:</h3>
              {selectedType === "drive_link" ? (
                <p className="text-blue-800 text-sm">
                  Students will submit their work by providing a Google Drive link.
                </p>
              ) : (
                <p className="text-blue-800 text-sm">
                  Students will submit their work as text directly in the platform.
                </p>
              )}
            </div>
          )}

          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={isPatching || !isDirty}
              className="flex-1"
            >
              {isPatching ? "Updating..." : "Update Assignment"}
            </Button>
            <Link href="/dashboard">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
