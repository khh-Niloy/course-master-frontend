const routes = {
  admin: [
    {
      title: "Course Management",
      url: "#",
      items: [
        {
          title: "All Courses",
          url: "#",
        },
        {
          title: "Add Course",
          url: "#",
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
          url: "#",
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
