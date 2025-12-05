"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGetMeQuery } from "@/redux/features/auth/auth.api";

export default function DashboardPage() {
  const router = useRouter();
  const { data: meData, isLoading } = useGetMeQuery(undefined);
  const user = meData as any;

  useEffect(() => {
    if (!isLoading && user) {
      if (user.role === "STUDENT") {
        router.replace("/dashboard/my-enrollments");
      } else if (user.role === "ADMIN") {
        // Admin can stay on dashboard or redirect to a default admin page
        // For now, we'll redirect to all-courses
        router.replace("/dashboard/all-courses");
      }
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="text-center">
        <p>Redirecting...</p>
      </div>
    </div>
  );
}
