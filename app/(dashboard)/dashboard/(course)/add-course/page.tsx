"use client";

import React, { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAddCourseMutation } from "@/redux/features/course/course.api";
import { useGetAllQuizzesQuery } from "@/redux/features/quiz/quiz.api";
import { useGetAllAssignmentsQuery } from "@/redux/features/assignment/assignment.api";
import { toast } from "react-hot-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";

// Define the form schema using Zod
const courseSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be less than 100 characters"),
  description: z
    .string()
    .min(1, "Description is required")
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description must be less than 500 characters"),
  category: z.string().min(1, "Category is required"),
  tags: z.string().min(1, "Tags are required").optional(),
  price: z
    .string()
    .min(1, "Price is required")
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: "Price must be a valid positive number",
    }),
  instructors: z.string().min(1, "Instructors are required").optional(),
  // Removed batches as they're no longer part of the backend structure
  modules: z
    .array(
      z.object({
        title: z.string().min(1, "Module name is required"),
        lessons: z.array(
          z.object({
            lessonNumber: z.number().min(1, "Lesson number is required"),
            title: z.string().min(1, "Lesson title is required"),
            videoUrl: z.string().min(1, "Lesson video URL is required"),
            duration: z.number().min(1, "Lesson duration is required"),
          })
        ),
        quizIds: z.array(z.string()).optional(), // Array of quiz IDs
        assignmentId: z.string().optional(), // Single assignment ID
      })
    )
    .optional(),
});

type CourseFormData = z.infer<typeof courseSchema>;

export default function AddCoursePage() {
  const [addCourse, { isLoading }] = useAddCourseMutation();
  const { data: quizzesData } = useGetAllQuizzesQuery({});
  const { data: assignmentsData } = useGetAllAssignmentsQuery({});
  
  // State to track selected quizzes and assignments for each module
  const [moduleQuizIds, setModuleQuizIds] = useState<{[key: number]: string[]}>({});
  const [moduleAssignmentId, setModuleAssignmentId] = useState<{[key: number]: string}>({});
  
  // Get quiz and assignment lists
  const quizzes = quizzesData?.data || [];
  const assignments = assignmentsData?.data || [];

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    control,
  } = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
  });

  const {
    fields: moduleFields,
    append: appendModule,
    remove: removeModule,
  } = useFieldArray({
    control,
    name: "modules",
  });

  // Functions to handle quiz and assignment selection
  const addQuizToModule = (moduleIndex: number, quizId: string) => {
    setModuleQuizIds(prev => ({
      ...prev,
      [moduleIndex]: [...(prev[moduleIndex] || []), quizId]
    }));
  };

  const removeQuizFromModule = (moduleIndex: number, quizId: string) => {
    setModuleQuizIds(prev => ({
      ...prev,
      [moduleIndex]: prev[moduleIndex]?.filter(id => id !== quizId) || []
    }));
  };

  const setAssignmentForModule = (moduleIndex: number, assignmentId: string) => {
    setModuleAssignmentId(prev => ({
      ...prev,
      [moduleIndex]: assignmentId
    }));
  };

  const onSubmit = async (data: CourseFormData) => {
    try {
      // Add quiz IDs and assignment ID to modules
      const modulesWithIds = data.modules?.map((module, index) => ({
        ...module,
        quizIds: moduleQuizIds[index] || [],
        assignmentId: moduleAssignmentId[index] || undefined,
      })) || [];

      const transformedData = {
        ...data,
        price: Number(data.price),
        tags: data.tags ? data.tags.split(",").map((tag) => tag.trim()) : [],
        instructor: data.instructors
          ? data.instructors.split(",").map((instructor) => instructor.trim())
          : [],
        modules: modulesWithIds,
        status: "PUBLISHED" as const,
      };

      console.log("Sending course data:", transformedData);

      const res = await addCourse(transformedData).unwrap();
      if (res.success) {
        console.log(res);
        toast.success("Course created successfully");
        // Reset the state as well
        setModuleQuizIds({});
        setModuleAssignmentId({});
        reset();
      }

    } catch (error) {
      console.error("Error creating course:", error);
      toast.error("Failed to create course. Please try again.");
    }
  };

  return (
    <div className="container mx-auto max-w-5xl py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Add New Course</h1>
          <p className="text-muted-foreground mt-2">
            Create a new course by filling out the form below.
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
              aria-invalid={errors.title ? "true" : "false"}
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
              aria-invalid={errors.description ? "true" : "false"}
            />
            {errors.description && (
              <p className="text-sm text-destructive">
                {errors.description.message}
              </p>
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
                aria-invalid={errors.category ? "true" : "false"}
              />
              {errors.category && (
                <p className="text-sm text-destructive">
                  {errors.category.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input
                id="tags"
                type="text"
                placeholder="e.g. tag1, tag2, tag3"
                {...register("tags")}
                aria-invalid={errors.tags ? "true" : "false"}
              />
              {errors.tags && (
                <p className="text-sm text-destructive">
                  {errors.tags.message}
                </p>
              )}
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
              aria-invalid={errors.price ? "true" : "false"}
            />
            {errors.price && (
              <p className="text-sm text-destructive">{errors.price.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="instructors">Instructors (comma separated)</Label>
            <Input
              id="instructors"
              type="text"
              placeholder="e.g. instructor1, instructor2, instructor3"
              {...register("instructors")}
            />
          </div>

          {/* Note: Batches are now managed separately in Batch Management */}
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm">
              After creating this course, you can create batches for it in the{" "}
              <Link href="/dashboard/add-batch" className="underline font-medium">
                Batch Management
              </Link>{" "}
              section. Each batch can have different start dates and student enrollments.
            </p>
          </div>

          {/* Modules Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-semibold">Course Modules</Label>
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  appendModule({
                    title: "",
                    lessons: [],
                  })
                }
              >
                Add Module
              </Button>
            </div>

            {moduleFields.map((module, moduleIndex) => {
              const ModuleLessons = () => {
                const {
                  fields: lessonFields,
                  append: appendLesson,
                  remove: removeLesson,
                } = useFieldArray({
                  control,
                  name: `modules.${moduleIndex}.lessons`,
                });

                return (
                  <div className="space-y-3 ml-4">
                    <div className="flex items-center justify-between">
                      <Label className="font-medium">Lessons</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          appendLesson({
                            lessonNumber: lessonFields.length + 1,
                            title: "",
                            videoUrl: "",
                            duration: 0,
                          })
                        }
                      >
                        Add Lesson
                      </Button>
                    </div>

                    {lessonFields.map((lesson, lessonIndex) => (
                      <div
                        key={lesson.id}
                        className="border rounded p-3 space-y-3 bg-gray-50"
                      >
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium">
                            Lesson {lessonIndex + 1}
                          </Label>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeLesson(lessonIndex)}
                          >
                            Remove
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                          <div>
                            <Label
                              htmlFor={`modules.${moduleIndex}.lessons.${lessonIndex}.lessonNumber`}
                            >
                              Lesson #
                            </Label>
                            <Input
                              id={`modules.${moduleIndex}.lessons.${lessonIndex}.lessonNumber`}
                              type="number"
                              placeholder="1"
                              {...register(
                                `modules.${moduleIndex}.lessons.${lessonIndex}.lessonNumber`,
                                {
                                  valueAsNumber: true,
                                }
                              )}
                              aria-invalid={
                                errors.modules?.[moduleIndex]?.lessons?.[
                                  lessonIndex
                                ]?.lessonNumber
                                  ? "true"
                                  : "false"
                              }
                            />
                            {errors.modules?.[moduleIndex]?.lessons?.[
                              lessonIndex
                            ]?.lessonNumber && (
                              <p className="text-sm text-destructive mt-1">
                                {
                                  errors.modules[moduleIndex].lessons[
                                    lessonIndex
                                  ].lessonNumber.message
                                }
                              </p>
                            )}
                          </div>

                          <div>
                            <Label
                              htmlFor={`modules.${moduleIndex}.lessons.${lessonIndex}.title`}
                            >
                              Title
                            </Label>
                            <Input
                              id={`modules.${moduleIndex}.lessons.${lessonIndex}.title`}
                              placeholder="Lesson title"
                              {...register(
                                `modules.${moduleIndex}.lessons.${lessonIndex}.title`
                              )}
                              aria-invalid={
                                errors.modules?.[moduleIndex]?.lessons?.[
                                  lessonIndex
                                ]?.title
                                  ? "true"
                                  : "false"
                              }
                            />
                            {errors.modules?.[moduleIndex]?.lessons?.[
                              lessonIndex
                            ]?.title && (
                              <p className="text-sm text-destructive mt-1">
                                {
                                  errors.modules[moduleIndex].lessons[
                                    lessonIndex
                                  ].title.message
                                }
                              </p>
                            )}
                          </div>

                          <div>
                            <Label
                              htmlFor={`modules.${moduleIndex}.lessons.${lessonIndex}.videoUrl`}
                            >
                              Video URL
                            </Label>
                            <Input
                              id={`modules.${moduleIndex}.lessons.${lessonIndex}.videoUrl`}
                              placeholder="https://..."
                              {...register(
                                `modules.${moduleIndex}.lessons.${lessonIndex}.videoUrl`
                              )}
                              aria-invalid={
                                errors.modules?.[moduleIndex]?.lessons?.[
                                  lessonIndex
                                ]?.videoUrl
                                  ? "true"
                                  : "false"
                              }
                            />
                            {errors.modules?.[moduleIndex]?.lessons?.[
                              lessonIndex
                            ]?.videoUrl && (
                              <p className="text-sm text-destructive mt-1">
                                {
                                  errors.modules[moduleIndex].lessons[
                                    lessonIndex
                                  ].videoUrl.message
                                }
                              </p>
                            )}
                          </div>

                          <div>
                            <Label
                              htmlFor={`modules.${moduleIndex}.lessons.${lessonIndex}.duration`}
                            >
                              Duration (minutes)
                            </Label>
                            <Input
                              id={`modules.${moduleIndex}.lessons.${lessonIndex}.duration`}
                              type="number"
                              placeholder="30"
                              {...register(
                                `modules.${moduleIndex}.lessons.${lessonIndex}.duration`,
                                {
                                  valueAsNumber: true,
                                }
                              )}
                              aria-invalid={
                                errors.modules?.[moduleIndex]?.lessons?.[
                                  lessonIndex
                                ]?.duration
                                  ? "true"
                                  : "false"
                              }
                            />
                            {errors.modules?.[moduleIndex]?.lessons?.[
                              lessonIndex
                            ]?.duration && (
                              <p className="text-sm text-destructive mt-1">
                                {
                                  errors.modules[moduleIndex].lessons[
                                    lessonIndex
                                  ].duration.message
                                }
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              };


              return (
                <div
                  key={module.id}
                  className="border rounded-lg p-4 space-y-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Label htmlFor={`modules.${moduleIndex}.title`}>
                        Module Title
                      </Label>
                      <Input
                        id={`modules.${moduleIndex}.title`}
                        placeholder="Enter module title"
                        {...register(`modules.${moduleIndex}.title`)}
                        aria-invalid={
                          errors.modules?.[moduleIndex]?.title
                            ? "true"
                            : "false"
                        }
                      />
                      {errors.modules?.[moduleIndex]?.title && (
                        <p className="text-sm text-destructive mt-1">
                          {errors.modules[moduleIndex].title.message}
                        </p>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeModule(moduleIndex)}
                    >
                      Remove Module
                    </Button>
                  </div>

                  <ModuleLessons />

                  {/* Quiz Selection */}
                  <div className="space-y-3">
                    <Label className="font-medium">Quizzes (Optional)</Label>
                    <div className="text-sm text-muted-foreground">
                      Create quizzes separately in Quiz Management, then select them here.
                    </div>
                    
                    <div className="flex gap-2">
                      <Select onValueChange={(value) => addQuizToModule(moduleIndex, value)}>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select a quiz to add" />
                        </SelectTrigger>
                        <SelectContent>
                          {quizzes.length > 0 ? (
                            quizzes
                              .filter((quiz: { _id: string; title: string }) => !moduleQuizIds[moduleIndex]?.includes(quiz._id))
                              .map((quiz: { _id: string; title: string }) => (
                                <SelectItem key={quiz._id} value={quiz._id}>
                                  {quiz.title}
                                </SelectItem>
                              ))
                          ) : (
                            <SelectItem value="no-quizzes" disabled>
                              No quizzes available
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => window.open('/dashboard/add-quiz', '_blank')}
                        className="bg-green-50 border-green-200 hover:bg-green-100"
                      >
                        Create New Quiz
                      </Button>
                    </div>
                    
                    {moduleQuizIds[moduleIndex]?.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-sm">Selected Quizzes:</Label>
                        {moduleQuizIds[moduleIndex].map((quizId) => {
                          const quiz = quizzes.find((q: { _id: string; title: string }) => q._id === quizId);
                          return (
                            <div key={quizId} className="flex items-center gap-2 p-2 bg-green-50 rounded">
                              <span className="flex-1 text-sm">
                                {quiz?.title || `Quiz ID: ${quizId}`}
                              </span>
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => removeQuizFromModule(moduleIndex, quizId)}
                              >
                                Remove
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Assignment Selection */}
                  <div className="space-y-3">
                    <Label className="font-medium">Assignment (Optional)</Label>
                    <div className="text-sm text-muted-foreground">
                      Create assignments separately in Assignment Management, then select one here.
                    </div>
                    
                    <div className="flex gap-2">
                      <Select 
                        value={moduleAssignmentId[moduleIndex] || "none"} 
                        onValueChange={(value) => setAssignmentForModule(moduleIndex, value === "none" ? "" : value)}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select an assignment" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No assignment</SelectItem>
                          {assignments.length > 0 ? (
                            assignments.map((assignment: { _id: string; title: string; type: string }) => (
                              <SelectItem key={assignment._id} value={assignment._id}>
                                {assignment.title} ({assignment.type})
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no-assignments" disabled>
                              No assignments available
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => window.open('/dashboard/add-assignment', '_blank')}
                        className="bg-blue-50 border-blue-200 hover:bg-blue-100"
                      >
                        Create New Assignment
                      </Button>
                    </div>
                    
                    {moduleAssignmentId[moduleIndex] && (
                      <div className="space-y-2">
                        <Label className="text-sm">Selected Assignment:</Label>
                        <div className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                          <span className="flex-1 text-sm">
                            {assignments.find((a: { _id: string; title: string; type: string }) => a._id === moduleAssignmentId[moduleIndex])?.title || 
                             `Assignment ID: ${moduleAssignmentId[moduleIndex]}`}
                          </span>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => setModuleAssignmentId(prev => ({
                              ...prev,
                              [moduleIndex]: ""
                            }))}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="flex-1"
            >
              {isSubmitting || isLoading
                ? "Creating Course..."
                : "Create Course"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                setModuleQuizIds({});
                setModuleAssignmentId({});
              }}
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
