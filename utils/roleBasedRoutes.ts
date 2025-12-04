const routes = {
  admin: [
    {
      title: "Course Management",
      url: "#",
      items: [
        {
          title: "All Courses",
          url: "/dashboard/all-courses",
        },
        {
          title: "Add Course",
          url: "/dashboard/add-course",
        },
      ],
    },
    {
      title: "Enrollment Management",
      url: "#",
      items: [
        {
          title: "All Enrollments",
          url: "#",
        },
      ],
    },
    {
      title: "Assignment Management",
      url: "#",
      items: [
        {
          title: "All Assignments",
          url: "/dashboard/all-assignments",
        },
        {
          title: "Add Assignment",
          url: "/dashboard/add-assignment",
        },
      ],
    },
    {
      title: "Quiz Management",
      url: "#",
      items: [
        {
          title: "All Quizzes",
          url: "/dashboard/all-quizzes",
        },
        {
          title: "Add Quiz",
          url: "/dashboard/add-quiz",
        },
      ],
    },
    {
      title: "Batch Management",
      url: "#",
      items: [
        {
          title: "All Batches",
          url: "/dashboard/all-batches",
        },
        {
          title: "Add Batch",
          url: "/dashboard/add-batch",
        },
      ],
    },
  ],
  student: [
    {
      title: "My Courses",
      url: "#",
      items: [
        {
          title: "Courses",
          url: "#",
        },
      ],
    },
  ],
};

export const roleBasedRoutes = ({ role }: { role: string }) => {
    console.log(role)
    return routes[role as keyof typeof routes] || [];
};
