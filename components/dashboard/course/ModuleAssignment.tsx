import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Assignment {
  id: number;
  title: string;
  description: string;
  type: "google_drive" | "text_answer";
  googleDriveLink: string;
  textAnswer: string;
}

interface ModuleAssignmentProps {
  moduleIndex: number;
  assignments: Assignment[];
  updateAssignment: (moduleIndex: number, assignmentId: number, field: string, value: any) => void;
  removeAssignment: (moduleIndex: number, assignmentId: number) => void;
}

export const ModuleAssignment: React.FC<ModuleAssignmentProps> = ({
  moduleIndex,
  assignments,
  updateAssignment,
  removeAssignment,
}) => {
  return (
    <div className="space-y-3 ml-4">
      {assignments.length > 0 && (
        <Label className="font-medium">Assignments</Label>
      )}
      {assignments.map((assignment) => (
        <div
          key={assignment.id}
          className="border rounded p-3 space-y-3 bg-blue-50"
        >
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Assignment</Label>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => removeAssignment(moduleIndex, assignment.id)}
            >
              Remove
            </Button>
          </div>

          <div className="space-y-3">
            <div>
              <Label>Assignment Question</Label>
              <textarea
                placeholder="What do you want students to do? (e.g., Create a login form with validation)"
                rows={2}
                className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={assignment.title}
                onChange={(e) => updateAssignment(moduleIndex, assignment.id, 'title', e.target.value)}
              />
            </div>

            <div>
              <Label>Instructions</Label>
              <textarea
                placeholder="Provide detailed instructions on how to complete this assignment..."
                rows={3}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={assignment.description}
                onChange={(e) => updateAssignment(moduleIndex, assignment.id, 'description', e.target.value)}
              />
            </div>

            <div>
              <Label>Submission Type</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={assignment.type}
                onChange={(e) => updateAssignment(moduleIndex, assignment.id, 'type', e.target.value)}
              >
                <option value="google_drive">Google Drive Link Submission</option>
                <option value="text_answer">Text Answer Submission</option>
              </select>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};