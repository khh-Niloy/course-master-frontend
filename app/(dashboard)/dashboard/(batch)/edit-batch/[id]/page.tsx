"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePatchBatchMutation, useGetAllBatchesQuery } from "@/redux/features/batch/batch.api";
import { useGetAllCoursesQuery } from "@/redux/features/course/course.api";
import { toast } from "react-hot-toast";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

const batchPatchSchema = z.object({
  name: z.string().optional(),
  courseId: z.string().optional(),
  startDate: z.string().optional(),
  batchNumber: z.number().optional(),
});

type BatchPatchData = z.infer<typeof batchPatchSchema>;

export default function EditBatchPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const { data: batchesData } = useGetAllBatchesQuery({});
  const { data: coursesData } = useGetAllCoursesQuery({});
  const [patchBatch, { isLoading: isPatching }] = usePatchBatchMutation();

  const batch = batchesData?.data?.find((b: any) => b._id === id);
  const courses = coursesData?.data || [];

  const {
    register,
    handleSubmit,
    formState: { errors, dirtyFields, isDirty },
    reset,
    setValue,
    watch,
  } = useForm<BatchPatchData>({
    resolver: zodResolver(batchPatchSchema),
  });

  const selectedCourseId = watch("courseId");

  useEffect(() => {
    if (batch) {
      reset({
        name: batch.name || "",
        courseId: batch.courseId?._id || "",
        startDate: batch.startDate ? new Date(batch.startDate).toISOString().split('T')[0] : "",
        batchNumber: batch.batchNumber || undefined,
      });
    }
  }, [batch, reset]);

  const onSubmit = async (data: BatchPatchData) => {
    try {
      const patchData: any = {};
      if (dirtyFields.name && data.name !== undefined) patchData.name = data.name;
      if (dirtyFields.courseId && data.courseId) patchData.courseId = data.courseId;
      if (dirtyFields.startDate && data.startDate) patchData.startDate = data.startDate;
      if (dirtyFields.batchNumber && data.batchNumber !== undefined) patchData.batchNumber = data.batchNumber;

      if (Object.keys(patchData).length === 0) {
        toast.error("No changes detected");
        return;
      }

      const res = await patchBatch({ id, data: patchData }).unwrap();
      if (res.success) {
        toast.success("Batch updated successfully");
        router.push("/dashboard/all-batches");
      }
    } catch (error: any) {
      console.error("Error updating batch:", error);
      toast.error(error?.data?.message || "Failed to update batch. Please try again.");
    }
  };

  if (!batch) {
    return (
      <div className="container mx-auto max-w-4xl py-8">
        <div className="text-center">
          <p className="text-destructive">Batch not found</p>
          <Link href="/dashboard/all-batches">
            <Button variant="outline" className="mt-4">Back to Batches</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Edit Batch</h1>
          <p className="text-muted-foreground mt-2">
            Update batch information. Leave fields empty to keep current values.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="courseId">Course</Label>
            <Select 
              value={selectedCourseId || ""} 
              onValueChange={(value) => setValue("courseId", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course: any) => (
                  <SelectItem key={course._id} value={course._id}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Batch Name (Optional)</Label>
            <Input
              id="name"
              type="text"
              placeholder="e.g., Winter 2024"
              {...register("name")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              {...register("startDate")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="batchNumber">Batch Number</Label>
            <Input
              id="batchNumber"
              type="number"
              min="1"
              {...register("batchNumber", { valueAsNumber: true })}
            />
          </div>

          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={isPatching || !isDirty}
              className="flex-1"
            >
              {isPatching ? "Updating..." : "Update Batch"}
            </Button>
            <Link href="/dashboard/all-batches">
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

