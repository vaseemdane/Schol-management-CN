import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear()
      window.location.href = '/'
    }
    return Promise.reject(error)
  }
)

export default api

// Auth
export const authApi = {
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  getForgotPasswordQuestion: (mobile) => api.get('/auth/forgot-password/question', { params: { mobile } }),
  resetPassword: (data) => api.post('/auth/forgot-password/reset', data),
  updateUsername: (data) => api.put('/auth/settings/username', data),
  updatePassword: (data) => api.put('/auth/settings/password', data),
  updateSecurityQuestion: (data) => api.put('/auth/settings/security-question', data),
}

// Students
export const studentsApi = {
  list: (params) => api.get('/students', { params }),
  get: (id) => api.get(`/students/${id}`),
  getMe: () => api.get('/students/me'),
  create: (data) => api.post('/students', data),
  update: (id, data) => api.put(`/students/${id}`, data),
  delete: (id) => api.delete(`/students/${id}`),
}

// Teachers
export const teachersApi = {
  list: (params) => api.get('/teachers', { params }),
  get: (id) => api.get(`/teachers/${id}`),
  getMe: () => api.get('/teachers/me'),
  create: (data) => api.post('/teachers', data),
  update: (id, data) => api.put(`/teachers/${id}`, data),
  delete: (id) => api.delete(`/teachers/${id}`),
}

// Classes
export const classesApi = {
  list: (params) => api.get('/classes', { params }),
  create: (data) => api.post('/classes', data),
  delete: (id) => api.delete(`/classes/${id}`),
}

// Subjects
export const subjectsApi = {
  list: (classId) => api.get('/subjects', { params: { class_id: classId } }),
  create: (data) => api.post('/subjects', data),
  delete: (id) => api.delete(`/subjects/${id}`),
}

// Attendance
export const attendanceApi = {
  list: (params) => api.get('/attendance', { params }),
  mark: (data) => api.post('/attendance', data),
  bulkMark: (data) => api.post('/attendance/bulk', data),
  update: (id, data) => api.put(`/attendance/${id}`, data),
  studentSummary: (studentId) => api.get(`/attendance/student/${studentId}/summary`),
}

// Exams & Marks
export const examsApi = {
  list: (params) => api.get('/exams', { params }),
  create: (data) => api.post('/exams', data),
}

export const marksApi = {
  list: (params) => api.get('/marks', { params }),
  add: (data) => api.post('/marks', data),
  update: (id, data) => api.put(`/marks/${id}`, data),
  delete: (id) => api.delete(`/marks/${id}`),
  studentPerformance: (studentId) => api.get(`/marks/student/${studentId}/performance`),
}

// Fees
export const feesApi = {
  list: () => api.get('/fees'),
  getByStudent: (studentId) => api.get(`/fees/student/${studentId}`),
  create: (data) => api.post('/fees', data),
  addPayment: (data) => api.post('/fees/payment', data),
}

// Salary
export const salaryApi = {
  list: () => api.get('/salary'),
  getByTeacher: (teacherId) => api.get(`/salary/teacher/${teacherId}`),
  create: (data) => api.post('/salary', data),
  addPayment: (data) => api.post('/salary/payment', data),
}

// Certificates
export const certificatesApi = {
  list: () => api.get('/certificates'),
  generate: (data) => api.post('/certificates', data),
}

// Notifications
export const notificationsApi = {
  list: () => api.get('/notifications'),
  create: (data) => api.post('/notifications', data),
  delete: (id) => api.delete(`/notifications/${id}`),
}

// Analytics
export const analyticsApi = {
  dashboard: (params) => api.get('/analytics/dashboard', { params }),
  students: (params) => api.get('/analytics/students', { params }),
  financial: (params) => api.get('/analytics/financial', { params }),
  attendanceOverview: (params) => api.get('/analytics/attendance-overview', { params }),
}
