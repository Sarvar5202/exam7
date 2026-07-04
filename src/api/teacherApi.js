import { api } from './api';

export const getTeacherGroups = () => {
  return api.get('/teachers/my/groups');
};

export const getGroupStudents = (groupId) => {
  return api.get(`/groups/one/students/${groupId}`);
};

export const getGroupLessons = (groupId) => {
  return api.get(`/lessons/my/group/${groupId}`);
};

export const getGroupHomeworks = (groupId) => {
  return api.get(`/homework/${groupId}`);
};

export const getHomeworkResults = (groupId, homeworkId, status) => {
  let url = `/group/${groupId}/homework/${homeworkId}/results`;
  if (status) {
    url += `?status=${status}`;
  }
  return api.get(url);
};

export const getAllAttendance = () => {
  return api.get('/attendance/all');
};
