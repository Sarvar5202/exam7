import { createBrowserRouter, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import Loader from "../components/UI/Loader/Loader";
import ProtectRoute from "../components/protect/ProtectRoute";
import GuestRoute from "../components/protect/GuestRoute";
import StudentProtectRoute from "../components/protect/StudentProtectRoute";
import StudentGuestRoute from "../components/protect/StudentGuestRoute";
import TeacherProtectRoute from "../components/protect/TeacherProtectRoute";

const Login               = lazy(() => import("../pages/Login/Login"));
const ForgotPassword      = lazy(() => import("../pages/Login/ForgotPassword"));
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

const StudentLayout       = lazy(() => import("../layout/StudentLayout"));
const StudentLogin        = lazy(() => import("../pages/student/StudentLogin"));
const StudentDashboard    = lazy(() => import("../pages/student/StudentDashboard"));
const StudentGroups       = lazy(() => import("../pages/student/StudentGroups"));
const StudentPayments     = lazy(() => import("../pages/student/StudentPayments"));
const StudentStats        = lazy(() => import("../pages/student/StudentStats"));
const StudentRating       = lazy(() => import("../pages/student/StudentRating"));
const StudentShop         = lazy(() => import("../pages/student/StudentShop"));
const StudentExtraLessons = lazy(() => import("../pages/student/StudentExtraLessons"));
const StudentSettings     = lazy(() => import("../pages/student/StudentSettings"));
const StudentGroupDetail  = lazy(() => import("../pages/student/StudentGroupDetail"));
const StudentLessonDetail = lazy(() => import("../pages/student/StudentLessonDetail"));

// ── Teacher panel ──────────────────────────────────────────────────────────
const TeacherLayout           = lazy(() => import("../layout/TeacherLayout"));
const TeacherDashboard        = lazy(() => import("../pages/teacher/TeacherDashboard"));
const TeacherGroups           = lazy(() => import("../pages/teacher/TeacherGroups"));
const TeacherGroupDetail      = lazy(() => import("../pages/teacher/TeacherGroupDetail"));
const TeacherHomework         = lazy(() => import("../pages/teacher/TeacherHomework"));
const TeacherAttendance       = lazy(() => import("../pages/teacher/TeacherAttendance"));
const TeacherHomeworkCheck    = lazy(() => import("../pages/teacher/TeacherHomeworkCheck"));

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
    path: '/forgot-password',
    element: (
      <GuestRoute>
        <Suspense fallback={<Loader />}><ForgotPassword /></Suspense>
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
    path: '/student/login',
    element: (
      <StudentGuestRoute>
        <Suspense fallback={<Loader />}><StudentLogin /></Suspense>
      </StudentGuestRoute>
    )
  },

  {
    path: '/student',
    element: (
      <StudentProtectRoute>
        <Suspense fallback={<Loader />}><StudentLayout /></Suspense>
      </StudentProtectRoute>
    ),
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard', element: <StudentDashboard /> },
      { path: 'payments', element: <StudentPayments /> },
      { path: 'groups', element: <StudentGroups /> },
      { path: 'groups/:id', element: <StudentGroupDetail /> },
      { path: 'groups/:id/lesson/:lessonId', element: <StudentLessonDetail /> },
      { path: 'stats', element: <StudentStats /> },
      { path: 'rating', element: <StudentRating /> },
      { path: 'shop', element: <StudentShop /> },
      { path: 'extra-lessons', element: <StudentExtraLessons /> },
      { path: 'settings', element: <StudentSettings /> },
    ]
  },
  {
    path: '/teacher',
    element: (
      <TeacherProtectRoute>
        <Suspense fallback={<Loader />}><TeacherLayout /></Suspense>
      </TeacherProtectRoute>
    ),
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard',                                          element: <TeacherDashboard /> },
      { path: 'groups',                                             element: <TeacherGroups /> },
      { path: 'groups/:id',                                         element: <TeacherGroupDetail /> },
      { path: 'groups/:groupId/homework/:homeworkId/check',         element: <TeacherHomeworkCheck /> },
      { path: 'homework',                                           element: <TeacherHomework /> },
      { path: 'attendance',                                         element: <TeacherAttendance /> },
    ]
  },
  {
    path: '*',
    element: <Suspense fallback={<Loader />}><NotFound /></Suspense>
  }
]);

export default router;
