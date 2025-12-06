"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAddAssignmentMutation } from "@/redux/features/assignment/assignment.api";
import { toast } from "react-hot-toast";

// Define the form schema using Zod
const assignmentSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be less than 100 characters"),
  question: z
    .string()
    .min(1, "Question is required")
    .min(10, "Question must be at least 10 characters")
    .max(500, "Question must be less than 500 characters")
    .optional(),
  instructions: z
    .string()
    .min(1, "Instructions are required")
    .min(10, "Instructions must be at least 10 characters")
    .max(1000, "Instructions must be less than 1000 characters"),
  type: z.enum(["drive_link", "text"]),
});

type AssignmentFormData = z.infer<typeof assignmentSchema>;

export default function AddAssignmentPage() {
  const [addAssignment, { isLoading }] = useAddAssignmentMutation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<AssignmentFormData>({
    resolver: zodResolver(assignmentSchema),
  });

  const selectedType = watch("type");

  const onSubmit = async (data: AssignmentFormData) => {
    try {
      console.log("Sending assignment data:", data);

      const res = await addAssignment(data).unwrap();
      if (res.success) {
        console.log(res);
        toast.success("Assignment created successfully");
        reset();
      }
    } catch (error) {
      console.error("Error creating assignment:", error);
      toast.error("Failed to create assignment. Please try again.");
    }
  };

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Add New Assignment</h1>
          <p className="text-muted-foreground mt-2">
            Create a new assignment by filling out the form below.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Assignment Title</Label>
            <Input
              id="title"
              type="text"
              placeholder="Enter assignment title (e.g., 'Build a Todo App')"
              {...register("title")}
              aria-invalid={errors.title ? "true" : "false"}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="question">Assignment Question (Optional)</Label>
            <Textarea
              id="question"
              placeholder="Enter the main assignment question or prompt"
              rows={3}
              {...register("question")}
              aria-invalid={errors.question ? "true" : "false"}
            />
            {errors.question && (
              <p className="text-sm text-destructive">{errors.question.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="instructions">Instructions</Label>
            <Textarea
              id="instructions"
              placeholder="Provide detailed instructions for completing this assignment"
              rows={6}
              {...register("instructions")}
              aria-invalid={errors.instructions ? "true" : "false"}
            />
            {errors.instructions && (
              <p className="text-sm text-destructive">
                {errors.instructions.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Assignment Type</Label>
            <Select onValueChange={(value) => setValue("type", value as "drive_link" | "text")}>
              <SelectTrigger>
                <SelectValue placeholder="Select assignment type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="drive_link">Google Drive Link Submission</SelectItem>
                <SelectItem value="text">Text Answer Submission</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-destructive">{errors.type.message}</p>
            )}
          </div>

          {selectedType && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Assignment Type Info:</h3>
              {selectedType === "drive_link" ? (
                <p className="text-blue-800 text-sm">
                  Students will submit their work by providing a Google Drive link to their files.
                  Make sure to specify file format requirements in the instructions.
                </p>
              ) : (
                <p className="text-blue-800 text-sm">
                  Students will submit their work as text directly in the platform.
                  This is suitable for written assignments, code snippets, or short answers.
                </p>
              )}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="flex-1"
            >
              {isSubmitting || isLoading
                ? "Creating Assignment..."
                : "Create Assignment"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => reset()}
              disabled={isSubmitting || isLoading}
            >
              Reset
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
