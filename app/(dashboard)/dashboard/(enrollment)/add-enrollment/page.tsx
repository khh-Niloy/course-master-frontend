"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAddEnrollmentMutation } from "@/redux/features/enrollment/enrollment.api";
import { useGetAllCoursesQuery } from "@/redux/features/course/course.api";
import { useGetAllBatchesQuery } from "@/redux/features/batch/batch.api";
import { toast } from "react-hot-toast";

// Define the form schema using Zod
const enrollmentSchema = z.object({
  studentId: z.string({ message: "Student ID is required" }),
  courseId: z.string({ message: "Course selection is required" }),
  batchId: z.string({ message: "Batch selection is required" }),
  enrollmentDate: z.string().optional(),
});

type EnrollmentFormData = z.infer<typeof enrollmentSchema>;

export default function AddEnrollmentPage() {
  const [addEnrollment, { isLoading }] = useAddEnrollmentMutation();
  const { data: coursesData } = useGetAllCoursesQuery({});
  const { data: batchesData } = useGetAllBatchesQuery({});

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<EnrollmentFormData>({
    resolver: zodResolver(enrollmentSchema),
  });

  const courses = coursesData?.data || [];
  const batches = batchesData?.data || [];
  const selectedCourseId = watch("courseId");

  // Filter batches based on selected course
  const availableBatches = selectedCourseId 
    ? batches.filter((batch: any) => batch.courseId._id === selectedCourseId)
    : [];

  const onSubmit = async (data: EnrollmentFormData) => {
    try {
      console.log("Sending enrollment data:", data);

      const res = await addEnrollment(data).unwrap();
      if (res.success) {
        console.log(res);
        toast.success("Enrollment created successfully");
        reset();
      }
    } catch (error: any) {
      console.error("Error creating enrollment:", error);
      toast.error(error.data?.message || "Failed to create enrollment. Please try again.");
    }
  };

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Add New Enrollment</h1>
          <p className="text-muted-foreground mt-2">
            Enroll a student in a specific course batch.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="studentId">Student ID *</Label>
            <Input
              id="studentId"
              type="text"
              placeholder="Enter student's user ID"
              {...register("studentId")}
              aria-invalid={errors.studentId ? "true" : "false"}
            />
            {errors.studentId && (
              <p className="text-sm text-destructive">{errors.studentId.message}</p>
            )}
            <p className="text-sm text-muted-foreground">
              You can find the student ID in the Users section or ask the student for their user ID.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="courseId">Select Course *</Label>
            <Select onValueChange={(value) => {
              setValue("courseId", value);
              setValue("batchId", ""); // Reset batch selection when course changes
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Select a course" />
              </SelectTrigger>
              <SelectContent>
                {courses.length > 0 ? (
                  courses.map((course: any) => (
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
            <Label htmlFor="batchId">Select Batch *</Label>
            <Select 
              onValueChange={(value) => setValue("batchId", value)}
              disabled={!selectedCourseId}
            >
              <SelectTrigger>
                <SelectValue placeholder={selectedCourseId ? "Select a batch" : "Select a course first"} />
              </SelectTrigger>
              <SelectContent>
                {availableBatches.length > 0 ? (
                  availableBatches.map((batch: any) => (
                    <SelectItem key={batch._id} value={batch._id}>
                      {batch.name || `Batch ${batch.batchNumber}`} - Starts {new Date(batch.startDate).toLocaleDateString()}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-batches" disabled>
                    {selectedCourseId ? "No batches available for this course" : "Select a course first"}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {errors.batchId && (
              <p className="text-sm text-destructive">{errors.batchId.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="enrollmentDate">Enrollment Date (Optional)</Label>
            <Input
              id="enrollmentDate"
              type="date"
              {...register("enrollmentDate")}
              aria-invalid={errors.enrollmentDate ? "true" : "false"}
            />
            {errors.enrollmentDate && (
              <p className="text-sm text-destructive">{errors.enrollmentDate.message}</p>
            )}
            <p className="text-sm text-muted-foreground">
              Leave empty to use current date and time
            </p>
          </div>

          {selectedCourseId && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Selected Course Info:</h3>
              <div className="text-blue-800 text-sm space-y-1">
                <p><strong>Course:</strong> {courses.find((c: any) => c._id === selectedCourseId)?.title}</p>
                <p><strong>Available Batches:</strong> {availableBatches.length}</p>
                {availableBatches.length > 0 && (
                  <p><strong>Next Start Date:</strong> {
                    new Date(Math.min(...availableBatches
                      .filter((b: any) => new Date(b.startDate) > new Date())
                      .map((b: any) => new Date(b.startDate).getTime())
                    )).toLocaleDateString() || "No upcoming batches"
                  }</p>
                )}
              </div>
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
                ? "Creating Enrollment..."
                : "Create Enrollment"}
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

