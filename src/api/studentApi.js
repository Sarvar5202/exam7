import axios from 'axios';

const endpoint = import.meta.env.VITE_API_URL || 'https://najot-edu.softwareengineer.uz/api/v1';

export const studentApi = axios.create({
  baseURL: endpoint,
  timeout: 10000,
});

// Request: studentToken ni qo'shish
studentApi.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('studentToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response: 401 bo'lsa student login ga yo'naltirish
studentApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      sessionStorage.removeItem('studentToken');
      sessionStorage.removeItem('studentUser');
      if (!window.location.pathname.startsWith('/student/login')) {
        window.location.replace('/student/login');
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth ─────────────────────────────────────────────────────────
export const loginStudent = (phone, password) =>
  studentApi.post('/auth/login', { phone, password });

export const changeStudentPassword = (phone, password) =>
  studentApi.put('/auth/change-password', { phone, password });

// ─── Student ──────────────────────────────────────────────────────
export const getMyGroups = () =>
  studentApi.get('/students/my/groups');

export const getGroupById = (groupId) =>
  studentApi.get(`/groups/${groupId}`);

export const submitHomeworkAnswer = (homeworkId, formData) =>
  studentApi.post(`/students/homeworkAnswer/${homeworkId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

// ─── Groups & Lessons ─────────────────────────────────────────────
export const getGroupLessons = (groupId) =>
  studentApi.get(`/groups/${groupId}/lessons`);

export const getAllGroupLessons = (groupId) =>
  studentApi.get(`/groups/${groupId}/lessons/all`);

export const getMyGroupLessons = (groupId) =>
  studentApi.get(`/lessons/my/group/${groupId}`);

export const getLessonVideos = (groupId, lessonId) =>
  studentApi.get(`/groups/${groupId}/lessons/${lessonId}/videos`);

export const getLessonHomeworks = (groupId, lessonId) =>
  studentApi.get(`/groups/${groupId}/lessons/${lessonId}/homeworks`);

export const getOwnHomework = (lessonId) =>
  studentApi.get(`/homework/own/${lessonId}`);

// ─── Other Student-related / Sub-endpoints ────────────────────────
export const getGroupStudents = (groupId) =>
  studentApi.get(`/groups/one/students/${groupId}`);

export const getFileBlob = (filename) =>
  studentApi.get(`/files/${filename}`, { responseType: 'blob' });

export const getUploadBlob = (filename) =>
  studentApi.get(`/uploads/${filename}`, { responseType: 'blob' });

