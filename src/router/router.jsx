import { createBrowserRouter, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import Loader from "../components/UI/Loader/Loader";
import ProtectRoute from "../components/protect/ProtectRoute";
import GuestRoute from "../components/protect/GuestRoute";

const Login               = lazy(() => import("../pages/Login/Login"));
const Management          = lazy(() => import("../pages/management/Management"));
const NotFound            = lazy(() => import("../pages/NotFound/NotFound"));
const MainLayout          = lazy(() => import("../layout/MainLayout"));
const Courses             = lazy(() => import("../pages/management/Courses/Courses"));
const ArchiveCourses      = lazy(() => import("../pages/management/Courses/ArchiveCourses"));
const Rooms               = lazy(() => import("../pages/management/Rooms/Rooms"));
const ArchiveRooms        = lazy(() => import("../pages/management/Rooms/ArchiveRooms"));
const Staff               = lazy(() => import("../pages/management/Staff/Staff"));
const Teachers            = lazy(() => import("../pages/Teachers/Teachers"));
const ArchiveTeachers     = lazy(() => import("../pages/Teachers/ArchiveTeachers"));
const Students            = lazy(() => import("../pages/Students/Students"));
const ArchiveStudents     = lazy(() => import("../pages/Students/ArchiveStudents"));
const Groups              = lazy(() => import("../pages/Groups/Groups"));
const ArchiveGroups       = lazy(() => import("../pages/Groups/ArchiveGroups"));
const GroupDetail         = lazy(() => import("../pages/Groups/GroupDetail/GroupDetail"));
const LessonDetail        = lazy(() => import("../pages/Groups/LessonDetail/LessonDetail"));
const CreateHomework      = lazy(() => import("../pages/Groups/CreateHomework/CreateHomework"));
const HomeworkResults     = lazy(() => import("../pages/Groups/HomeworkResults/HomeworkResults"));
const StudentHomeworkDetail = lazy(() => import("../pages/Groups/HomeworkResults/StudentHomeworkDetail"));
const Gifts               = lazy(() => import("../pages/Gifts/Gifts"));
const Default             = lazy(() => import("../pages/management/default/Default"));
const Dashboard           = lazy(() => import("../pages/dashboard/Dashboard"));

const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/login" replace /> },
  {
    path: '/login',
    element: (
      <GuestRoute>
        <Suspense fallback={<Loader />}><Login /></Suspense>
      </GuestRoute>
    )
  },
  {
    element: (
      <ProtectRoute>
        <Suspense fallback={<Loader />}><MainLayout /></Suspense>
      </ProtectRoute>
    ),
    children: [
      { path: '/dashboard',                     element: <Dashboard /> },
      { path: '/dashboard/teachers',            element: <Teachers /> },
      { path: '/dashboard/teachers/archive',    element: <ArchiveTeachers /> },
      { path: '/dashboard/students',            element: <Students /> },
      { path: '/dashboard/students/archive',    element: <ArchiveStudents /> },
      { path: '/dashboard/groups',              element: <Groups /> },
      { path: '/dashboard/groups/archive',      element: <ArchiveGroups /> },
      { path: '/dashboard/groups/:id',          element: <GroupDetail /> },
      { path: '/dashboard/groups/:id/lesson/:date', element: <LessonDetail /> },
      { path: '/dashboard/groups/:id/homework/create', element: <CreateHomework /> },
      { path: '/dashboard/groups/:id/homework/:homeworkId/results', element: <HomeworkResults /> },
      { path: '/dashboard/groups/:id/homework/:homeworkId/results/:resultId', element: <StudentHomeworkDetail /> },
      { path: '/dashboard/gifts',               element: <Gifts /> },
      {
        path: '/management',
        element: <Management />,
        children: [
          { path: 'courses',          element: <Courses /> },
          { path: 'courses/archive',  element: <ArchiveCourses /> },
          { path: 'rooms',            element: <Rooms /> },
          { path: 'rooms/archive',    element: <ArchiveRooms /> },
          { path: 'staff',            element: <Staff /> },
          { index: true,              element: <Default /> },
        ]
      },
    ]
  },
  {
    path: '*',
    element: <Suspense fallback={<Loader />}><NotFound /></Suspense>
  }
]);

export default router;
