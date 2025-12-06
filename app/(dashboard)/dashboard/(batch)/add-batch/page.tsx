"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAddBatchMutation } from "@/redux/features/batch/batch.api";
import { useGetAllCoursesQuery } from "@/redux/features/course/course.api";
import { toast } from "react-hot-toast";

// Define the form schema using Zod
const batchSchema = z.object({
  name: z.string().optional(),
  courseId: z.string({ message: "Course selection is required" }),
  startDate: z.string({ message: "Start date is required" }),
  batchNumber: z.number().min(1).optional(),
});

type BatchFormData = z.infer<typeof batchSchema>;

export default function AddBatchPage() {
  const [addBatch, { isLoading }] = useAddBatchMutation();
  const { data: coursesData } = useGetAllCoursesQuery({});

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<BatchFormData>({
    resolver: zodResolver(batchSchema),
  });

  const courses = coursesData?.data || [];
  const selectedCourseId = watch("courseId");

  const onSubmit = async (data: BatchFormData) => {
    try {
      console.log("Sending batch data:", data);

      const res = await addBatch(data).unwrap();
      if (res.success) {
        console.log(res);
        toast.success("Batch created successfully");
        reset();
      }
    } catch (error) {
      console.error("Error creating batch:", error);
      toast.error("Failed to create batch. Please try again.");
    }
  };

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Add New Batch</h1>
          <p className="text-muted-foreground mt-2">
            Create a new batch for a course by filling out the form below.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="courseId">Select Course *</Label>
            <Select onValueChange={(value) => setValue("courseId", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a course for this batch" />
              </SelectTrigger>
              <SelectContent>
                {courses.length > 0 ? (
                  courses.map((course: { _id: string; title: string }) => (
                    <SelectItem key={course._id} value={course._id}>
                      {course.title}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-courses" disabled>
                    No courses available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {errors.courseId && (
              <p className="text-sm text-destructive">{errors.courseId.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Batch Name (Optional)</Label>
            <Input
              id="name"
              type="text"
              placeholder="e.g., Winter 2024, Morning Batch, etc."
              {...register("name")}
              aria-invalid={errors.name ? "true" : "false"}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
            <p className="text-sm text-muted-foreground">
              If not provided, the batch will be named automatically (e.g., "Batch 1", "Batch 2")
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date *</Label>
            <Input
              id="startDate"
              type="date"
              {...register("startDate")}
              aria-invalid={errors.startDate ? "true" : "false"}
            />
            {errors.startDate && (
              <p className="text-sm text-destructive">{errors.startDate.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="batchNumber">Batch Number (Optional)</Label>
            <Input
              id="batchNumber"
              type="number"
              min="1"
              placeholder="Leave empty for auto-generation"
              {...register("batchNumber", { valueAsNumber: true })}
              aria-invalid={errors.batchNumber ? "true" : "false"}
            />
            {errors.batchNumber && (
              <p className="text-sm text-destructive">{errors.batchNumber.message}</p>
            )}
            <p className="text-sm text-muted-foreground">
              If not provided, the batch number will be auto-generated based on existing batches for the selected course
            </p>
          </div>

          {selectedCourseId && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Selected Course Info:</h3>
              <p className="text-blue-800 text-sm">
                Course: {courses.find((c: { _id: string; title: string }) => c._id === selectedCourseId)?.title}
              </p>
              <p className="text-blue-800 text-sm">
                This batch will be created for the selected course and students can enroll in this specific batch.
              </p>
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
                ? "Creating Batch..."
                : "Create Batch"}
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