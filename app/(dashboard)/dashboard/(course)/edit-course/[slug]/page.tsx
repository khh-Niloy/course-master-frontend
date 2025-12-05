"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePatchCourseMutation, useGetCourseByIdQuery } from "@/redux/features/course/course.api";
import { toast } from "react-hot-toast";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

const coursePatchSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  description: z.string().min(1, "Description is required").optional(),
  category: z.string().optional(),
  tags: z.string().optional(),
  price: z.string().optional(),
  instructors: z.string().optional(),
});

type CoursePatchData = z.infer<typeof coursePatchSchema>;

export default function EditCoursePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  
  const { data: courseData, isLoading: courseLoading } = useGetCourseByIdQuery(slug);
  const [patchCourse, { isLoading: isPatching }] = usePatchCourseMutation();

  const {
    register,
    handleSubmit,
    formState: { errors, dirtyFields, isDirty },
    reset,
  } = useForm<CoursePatchData>({
    resolver: zodResolver(coursePatchSchema),
  });

  useEffect(() => {
    if (courseData?.data) {
      const course = courseData.data;
      reset({
        title: course.title || "",
        description: course.description || "",
        category: course.category || "",
        tags: course.tags?.join(", ") || "",
        price: course.price?.toString() || "",
        instructors: course.instructor?.join(", ") || "",
      });
    }
  }, [courseData, reset]);

  const onSubmit = async (data: CoursePatchData) => {
    try {
      const patchData: any = {};
      
      if (dirtyFields.title && data.title) patchData.title = data.title;
      if (dirtyFields.description && data.description) patchData.description = data.description;
      if (dirtyFields.category && data.category) patchData.category = data.category;
      if (dirtyFields.tags && data.tags) {
        patchData.tags = data.tags.split(",").map((t) => t.trim()).filter(Boolean);
      }
      if (dirtyFields.price && data.price) patchData.price = Number(data.price);
      if (dirtyFields.instructors && data.instructors) {
        patchData.instructor = data.instructors.split(",").map((i) => i.trim()).filter(Boolean);
      }

      if (Object.keys(patchData).length === 0) {
        toast.error("No changes detected");
        return;
      }

      const res = await patchCourse({ slug, data: patchData }).unwrap();
      if (res.success) {
        toast.success("Course updated successfully");
        router.push("/dashboard/all-courses");
      }
    } catch (error: any) {
      console.error("Error updating course:", error);
      toast.error(error?.data?.message || "Failed to update course. Please try again.");
    }
  };

  if (courseLoading) {
    return (
      <div className="container mx-auto max-w-4xl py-8">
        <div className="text-center">Loading course...</div>
      </div>
    );
  }

  if (!courseData?.data) {
    return (
      <div className="container mx-auto max-w-4xl py-8">
        <div className="text-center">
          <p className="text-destructive">Course not found</p>
          <Link href="/dashboard/all-courses">
            <Button variant="outline" className="mt-4">Back to Courses</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Edit Course</h1>
          <p className="text-muted-foreground mt-2">
            Update course information. Leave fields empty to keep current values.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Course Title</Label>
            <Input
              id="title"
              type="text"
              placeholder="Enter course title"
              {...register("title")}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Course Description</Label>
            <textarea
              id="description"
              placeholder="Enter course description"
              rows={4}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              {...register("description")}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                type="text"
                placeholder="Enter category"
                {...register("category")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input
                id="tags"
                type="text"
                placeholder="e.g. tag1, tag2, tag3"
                {...register("tags")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              {...register("price")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="instructors">Instructors (comma separated)</Label>
            <Input
              id="instructors"
              type="text"
              placeholder="e.g. instructor1, instructor2"
              {...register("instructors")}
            />
          </div>

          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={isPatching || !isDirty}
              className="flex-1"
            >
              {isPatching ? "Updating..." : "Update Course"}
            </Button>
            <Link href="/dashboard/all-courses">
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
