export function getCourseStatus(
  startDate: string,
  endDate: string,
): "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (now < start) {
    return "NOT_STARTED";
  } else if (now >= start && now <= end) {
    return "IN_PROGRESS";
  } else {
    return "COMPLETED";
  }
}

export function calculateCourseStats(courses: any[]) {
  const now = new Date();

  return {
    total: courses.length,
    notStarted: courses.filter((course) => {
      const start = new Date(course.startDate);
      return now < start;
    }).length,
    inProgress: courses.filter((course) => {
      const start = new Date(course.startDate);
      const end = new Date(course.endDate);
      return now >= start && now <= end;
    }).length,
    completed: courses.filter((course) => {
      const end = new Date(course.endDate);
      return now > end;
    }).length,
  };
}
