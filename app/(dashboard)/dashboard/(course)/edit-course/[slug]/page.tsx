"use client";

import React, { useEffect, useState, useRef } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePatchCourseMutation, useGetCourseByIdQuery } from "@/redux/features/course/course.api";
import { useGetAllQuizzesQuery } from "@/redux/features/quiz/quiz.api";
import { useGetAllAssignmentsQuery } from "@/redux/features/assignment/assignment.api";
import { toast } from "react-hot-toast";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const coursePatchSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  description: z.string().min(1, "Description is required").optional(),
  category: z.string().optional(),
  tags: z.string().optional(),
  price: z.string().optional(),
  instructors: z.string().optional(),
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
        quizIds: z.array(z.string()).optional(),
        assignmentId: z.string().optional(),
      })
    )
    .optional(),
});

type CoursePatchData = z.infer<typeof coursePatchSchema>;

export default function EditCoursePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  
  const { data: courseData, isLoading: courseLoading } = useGetCourseByIdQuery(slug);
  const [patchCourse, { isLoading: isPatching }] = usePatchCourseMutation();
  const { data: quizzesData } = useGetAllQuizzesQuery({});
  const { data: assignmentsData } = useGetAllAssignmentsQuery({});
  
  // State to track selected quizzes and assignments for each module
  const [moduleQuizIds, setModuleQuizIds] = useState<{[key: number]: string[]}>({});
  const [moduleAssignmentId, setModuleAssignmentId] = useState<{[key: number]: string}>({});
  
  // Track initial state to detect changes
  const [initialQuizIds, setInitialQuizIds] = useState<{[key: number]: string[]}>({});
  const [initialAssignmentIds, setInitialAssignmentIds] = useState<{[key: number]: string}>({});
  
  // Get quiz and assignment lists
  const quizzes = quizzesData?.data || [];
  const assignments = assignmentsData?.data || [];

  const {
    register,
    handleSubmit,
    formState: { errors, dirtyFields, isDirty },
    reset,
    control,
    setValue,
    getValues,
  } = useForm<CoursePatchData>({
    resolver: zodResolver(coursePatchSchema),
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

  // Track if form has been initialized to prevent sync during initial load
  const formInitialized = useRef(false);
  
  // Sync form values when quiz/assignment state changes (only after form is initialized)
  useEffect(() => {
    if (!formInitialized.current) {
      return;
    }
    
    const currentModules = getValues("modules");
    if (currentModules && currentModules.length > 0) {
      let hasChanges = false;
      const updatedModules = currentModules.map((module: any, index: number) => {
        const newQuizIds = moduleQuizIds[index] || [];
        const newAssignmentId = moduleAssignmentId[index] || undefined;
        
        // Check if there are actual changes
        const quizIdsChanged = JSON.stringify((module.quizIds || []).sort()) !== JSON.stringify(newQuizIds.sort());
        const assignmentIdChanged = (module.assignmentId || "") !== (newAssignmentId || "");
        
        if (quizIdsChanged || assignmentIdChanged) {
          hasChanges = true;
        }
        
        return {
          ...module,
          quizIds: newQuizIds,
          assignmentId: newAssignmentId,
        };
      });
      
      // Only update if there are actual changes to prevent infinite loops
      if (hasChanges) {
        setValue("modules", updatedModules, { shouldDirty: true, shouldValidate: false });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleQuizIds, moduleAssignmentId]);

  useEffect(() => {
    if (courseData?.data) {
      const course = courseData.data;
      
      // Initialize quiz and assignment state from existing modules
      const initialQuizIds: {[key: number]: string[]} = {};
      const initialAssignmentIds: {[key: number]: string} = {};
      
      if (course.modules) {
        course.modules.forEach((module: any, index: number) => {
          if (module.quizIds && module.quizIds.length > 0) {
            initialQuizIds[index] = module.quizIds;
          }
          if (module.assignmentId) {
            initialAssignmentIds[index] = module.assignmentId;
          }
        });
      }
      
      setModuleQuizIds(initialQuizIds);
      setModuleAssignmentId(initialAssignmentIds);
      setInitialQuizIds(initialQuizIds);
      setInitialAssignmentIds(initialAssignmentIds);
      
      // Transform modules to match form structure (remove _id from lessons)
      const transformedModules = course.modules?.map((module: any) => ({
        title: module.title || "",
        lessons: module.lessons?.map((lesson: any) => ({
          lessonNumber: lesson.lessonNumber || 1,
          title: lesson.title || "",
          videoUrl: lesson.videoUrl || "",
          duration: lesson.duration || 0,
        })) || [],
        quizIds: module.quizIds || [],
        assignmentId: module.assignmentId || undefined,
      })) || [];
      
      reset({
        title: course.title || "",
        description: course.description || "",
        category: course.category || "",
        tags: course.tags?.join(", ") || "",
        price: course.price?.toString() || "",
        instructors: course.instructor?.join(", ") || "",
        modules: transformedModules,
      });
      
      // Mark form as initialized
      formInitialized.current = true;
    }
  }, [courseData, reset]);

  // Check if quizzes or assignments have changed
  const hasQuizOrAssignmentChanges = () => {
    // Check if quizIds have changed
    const quizIdsChanged = Object.keys(moduleQuizIds).some(index => {
      const current = moduleQuizIds[Number(index)] || [];
      const initial = initialQuizIds[Number(index)] || [];
      return JSON.stringify(current.sort()) !== JSON.stringify(initial.sort());
    });
    
    // Check if assignmentIds have changed
    const assignmentIdsChanged = Object.keys(moduleAssignmentId).some(index => {
      const current = moduleAssignmentId[Number(index)] || "";
      const initial = initialAssignmentIds[Number(index)] || "";
      return current !== initial;
    });
    
    return quizIdsChanged || assignmentIdsChanged;
  };

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
      
      // Always include modules if they exist (dirtyFields doesn't work well with arrays)
      if (data.modules && data.modules.length > 0) {
        const modulesWithIds = data.modules.map((module, index) => ({
          ...module,
          quizIds: moduleQuizIds[index] || [],
          assignmentId: moduleAssignmentId[index] || undefined,
        }));
        patchData.modules = modulesWithIds;
      } else if (data.modules && data.modules.length === 0) {
        // If modules array is empty, send empty array to clear modules
        patchData.modules = [];
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
    <div className="container mx-auto max-w-5xl py-8">
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
                        value={moduleAssignmentId[moduleIndex] ? moduleAssignmentId[moduleIndex] : "none"} 
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
                            onClick={() => setAssignmentForModule(moduleIndex, "")}
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

          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={isPatching || (!isDirty && !hasQuizOrAssignmentChanges())}
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

