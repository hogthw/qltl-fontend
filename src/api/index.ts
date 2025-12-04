const API_BASE_URL = 'http://localhost:5000/api';

export const api = {
  // Auth endpoints
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  },

  register: async (data: { email: string; password: string; fullName: string; departmentId?: string }) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  getMe: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  updateProfile: async (data: { 
    fullName?: string; 
    email?: string; 
    department?: string;
    academicRank?: string;
    degree?: string;
    subject?: string;
    phone?: string;
  }) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        fullName: data.fullName,
        email: data.email,
        departmentId: data.department,
        academicRank: data.academicRank,
        degree: data.degree,
        subject: data.subject,
        phone: data.phone,
      }),
    });
    return response.json();
  },

  changePassword: async (data: { currentPassword: string; newPassword: string }) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // Public endpoints
  getOverview: async () => {
    const response = await fetch(`${API_BASE_URL}/public/overview`);
    return response.json();
  },

  // Admin endpoints
  getUsers: async (params?: { limit?: number; sort?: string; page?: number }) => {
    const token = localStorage.getItem('token');
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.sort) queryParams.append('sort', params.sort);
    if (params?.page) queryParams.append('page', params.page.toString());
    
    const response = await fetch(`${API_BASE_URL}/users?${queryParams}`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  createUser: async (data: { fullName: string; email: string; password: string; role: string; departmentId?: string }) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  updateUser: async (userId: string, data: { fullName?: string; email?: string; password?: string; role?: string; departmentId?: string; isActive?: boolean }) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  deleteUser: async (userId: string) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'DELETE',
      headers: { 
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  // Department endpoints
  getDepartments: async (params?: { limit?: number; sort?: string; page?: number }) => {
    const token = localStorage.getItem('token');
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.sort) queryParams.append('sort', params.sort);
    if (params?.page) queryParams.append('page', params.page.toString());
    
    const response = await fetch(`${API_BASE_URL}/departments?${queryParams}`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  createDepartment: async (data: { code: string; name: string; description?: string }) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/departments`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  updateDepartment: async (departmentId: string, data: { name?: string; description?: string; isActive?: boolean }) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/departments/${departmentId}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  deleteDepartment: async (departmentId: string) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/departments/${departmentId}`, {
      method: 'DELETE',
      headers: { 
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  // File endpoints
  getFiles: async (params?: { limit?: number; sort?: string; page?: number }) => {
    const token = localStorage.getItem('token');
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.sort) queryParams.append('sort', params.sort);
    if (params?.page) queryParams.append('page', params.page.toString());
    
    const response = await fetch(`${API_BASE_URL}/files?${queryParams}`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  uploadFiles: async (formData: FormData) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/files/upload`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    return response.json();
  },

  updateFile: async (fileId: string, data: { 
    tags?: string[]; 
    description?: string; 
    originalName?: string; 
    submissionStatus?: string;
    qaStandard?: string;
    courseCode?: string;
    courseName?: string;
    activityType?: string;
    academicYear?: string;
    semester?: string;
  }) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/files/${fileId}`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  approveFile: async (fileId: string, approved: boolean) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/files/${fileId}/approve`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ approved }),
    });
    return response.json();
  },

  deleteFile: async (fileId: string) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/files/${fileId}`, {
      method: 'DELETE',
      headers: { 
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  downloadFile: async (fileId: string, filename: string) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/files/${fileId}/stream`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) throw new Error('Download failed');
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  // Announcement endpoints
  getAnnouncements: async (params?: { limit?: number; sort?: string; page?: number; management?: boolean }) => {
    const token = localStorage.getItem('token');
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.sort) queryParams.append('sort', params.sort);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.management) queryParams.append('management', 'true');
    
    const response = await fetch(`${API_BASE_URL}/announcements?${queryParams}`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  createAnnouncement: async (data: { title: string; content: string; targets: { type: string; roles?: string[]; departments?: string[] } }) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/announcements`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  updateAnnouncement: async (announcementId: string, data: { title?: string; content?: string; targets?: { type: string; roles?: string[]; departments?: string[] }; isActive?: boolean }) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/announcements/${announcementId}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  deleteAnnouncement: async (announcementId: string) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/announcements/${announcementId}`, {
      method: 'DELETE',
      headers: { 
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  // Activity Log endpoints
  getLogs: async (params?: { limit?: number; sort?: string; page?: number; action?: string; status?: string }) => {
    const token = localStorage.getItem('token');
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.sort) queryParams.append('sort', params.sort);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.action) queryParams.append('action', params.action);
    if (params?.status) queryParams.append('status', params.status);
    
    const response = await fetch(`${API_BASE_URL}/logs?${queryParams}`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  getLogById: async (logId: string) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/logs/${logId}`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  // Department Head endpoints
  getDepartmentHeadFiles: async (params?: { academicYear?: string; semester?: string; submissionStatus?: string; limit?: number; page?: number }) => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const role = user?.roles?.[0] || user?.role;
    const endpoint = role === 'manager' ? 'manager' : 'department-head';
    
    const queryParams = new URLSearchParams();
    if (params?.academicYear) queryParams.append('academicYear', params.academicYear);
    if (params?.semester) queryParams.append('semester', params.semester);
    if (params?.submissionStatus) queryParams.append('submissionStatus', params.submissionStatus);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.page) queryParams.append('page', params.page.toString());
    
    const response = await fetch(`${API_BASE_URL}/${endpoint}/files?${queryParams}`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  reviewDepartmentFile: async (fileId: string, data: { submissionStatus: string; reviewNotes?: string }) => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const role = user?.roles?.[0] || user?.role;
    const endpoint = role === 'manager' ? 'manager' : 'department-head';
    
    const response = await fetch(`${API_BASE_URL}/${endpoint}/files/${fileId}/review`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  getDepartmentProgress: async (params?: { academicYear?: string; semester?: string }) => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const role = user?.roles?.[0] || user?.role;
    const endpoint = role === 'manager' ? 'manager' : 'department-head';
    
    const queryParams = new URLSearchParams();
    if (params?.academicYear) queryParams.append('academicYear', params.academicYear);
    if (params?.semester) queryParams.append('semester', params.semester);
    
    const response = await fetch(`${API_BASE_URL}/${endpoint}/statistics/progress?${queryParams}`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  getDepartmentQAOverview: async (params?: { academicYear?: string; semester?: string }) => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const role = user?.roles?.[0] || user?.role;
    const endpoint = role === 'manager' ? 'manager' : 'department-head';
    
    const queryParams = new URLSearchParams();
    if (params?.academicYear) queryParams.append('academicYear', params.academicYear);
    if (params?.semester) queryParams.append('semester', params.semester);
    
    const response = await fetch(`${API_BASE_URL}/${endpoint}/statistics/qa-overview?${queryParams}`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  getDepartmentTimeline: async (params?: { academicYear?: string; semester?: string }) => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const role = user?.roles?.[0] || user?.role;
    const endpoint = role === 'manager' ? 'manager' : 'department-head';
    
    const queryParams = new URLSearchParams();
    if (params?.academicYear) queryParams.append('academicYear', params.academicYear);
    if (params?.semester) queryParams.append('semester', params.semester);
    
    const response = await fetch(`${API_BASE_URL}/${endpoint}/statistics/timeline?${queryParams}`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  sendDepartmentAnnouncement: async (data: { title: string; content: string }) => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const role = user?.roles?.[0] || user?.role;
    const endpoint = role === 'manager' ? 'manager' : 'department-head';
    
    const response = await fetch(`${API_BASE_URL}/${endpoint}/announcements`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  getDepartmentApprovalHistory: async (params?: { limit?: number; page?: number }) => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const role = user?.roles?.[0] || user?.role;
    const endpoint = role === 'manager' ? 'manager' : 'department-head';
    
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.page) queryParams.append('page', params.page.toString());
    
    const response = await fetch(`${API_BASE_URL}/${endpoint}/history/approvals?${queryParams}`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  getDepartmentQAStandardsReport: async (params?: { academicYear?: string; semester?: string }) => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const role = user?.roles?.[0] || user?.role;
    const endpoint = role === 'manager' ? 'manager' : 'department-head';
    
    const queryParams = new URLSearchParams();
    if (params?.academicYear) queryParams.append('academicYear', params.academicYear);
    if (params?.semester) queryParams.append('semester', params.semester);
    
    const response = await fetch(`${API_BASE_URL}/${endpoint}/reports/qa-standards?${queryParams}`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  // New endpoints for enhanced department head features
  getDepartmentLecturers: async () => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const role = user?.roles?.[0] || user?.role;
    const endpoint = role === 'manager' ? 'manager' : 'department-head';
    
    const response = await fetch(`${API_BASE_URL}/${endpoint}/lecturers`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  getLecturerSubmissionStats: async (params?: { academicYear?: string; semester?: string }) => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const role = user?.roles?.[0] || user?.role;
    const endpoint = role === 'manager' ? 'manager' : 'department-head';
    
    const queryParams = new URLSearchParams();
    if (params?.academicYear) queryParams.append('academicYear', params.academicYear);
    if (params?.semester) queryParams.append('semester', params.semester);
    
    const response = await fetch(`${API_BASE_URL}/${endpoint}/statistics/lecturer-submissions?${queryParams}`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  sendReminderToLecturers: async (data: { reminderType?: string; lecturerIds?: string[]; message: string; dueDate?: string }) => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const role = user?.roles?.[0] || user?.role;
    const endpoint = role === 'manager' ? 'manager' : 'department-head';
    
    const response = await fetch(`${API_BASE_URL}/${endpoint}/reminders/send`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  getTeamsAndGroups: async () => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const role = user?.roles?.[0] || user?.role;
    const endpoint = role === 'manager' ? 'manager' : 'department-head';
    
    const response = await fetch(`${API_BASE_URL}/${endpoint}/teams`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  // System Config endpoints
  getSystemConfig: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/system/config`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  updateSystemConfig: async (config: any) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/system/config`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(config),
    });
    return response.json();
  },

  // Backup & Restore endpoints
  createBackup: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/backup/create`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  listBackups: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/backup/list`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  downloadBackup: async (filename: string) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/backup/download/${filename}`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
      },
    });
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  restoreBackup: async (filename: string) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/backup/restore`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ filename }),
    });
    return response.json();
  },

  uploadAndRestoreBackup: async (file: File) => {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_BASE_URL}/backup/upload-restore`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    return response.json();
  },

  deleteBackup: async (filename: string) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/backup/${filename}`, {
      method: 'DELETE',
      headers: { 
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  // Standards and Criteria endpoints
  getStandards: async (params?: { page?: number; pageSize?: number; search?: string; isActive?: boolean }) => {
    const token = localStorage.getItem('token');
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
    
    const response = await fetch(`${API_BASE_URL}/standards?${queryParams}`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  getStandardById: async (id: string) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/standards/${id}`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  createStandard: async (data: { code: string; name: string; description?: string; color?: string; icon?: string }) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/standards`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  updateStandard: async (id: string, data: { code?: string; name?: string; description?: string; color?: string; icon?: string; isActive?: boolean }) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/standards/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  deleteStandard: async (id: string) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/standards/${id}`, {
      method: 'DELETE',
      headers: { 
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  getCriteria: async (params?: { page?: number; pageSize?: number; isActive?: boolean }) => {
    const token = localStorage.getItem('token');
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
    
    const response = await fetch(`${API_BASE_URL}/standards/criteria?${queryParams}`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  getCriteriaByStandard: async (standardId: string, params?: { page?: number; pageSize?: number; isActive?: boolean }) => {
    const token = localStorage.getItem('token');
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
    
    const response = await fetch(`${API_BASE_URL}/standards/${standardId}/criteria?${queryParams}`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  createCriterion: async (data: { code: string; name: string; description?: string; standardId: string }) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/standards/criteria`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  updateCriterion: async (id: string, data: { code?: string; name?: string; description?: string; isActive?: boolean }) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/standards/criteria/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  deleteCriterion: async (id: string) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/standards/criteria/${id}`, {
      method: 'DELETE',
      headers: { 
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  // Evidence Code endpoints
  generateEvidenceCode: async (data: { departmentId: string; criterionId: string; description?: string }) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/evidence-codes/generate`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  getEvidenceCodes: async (params?: { 
    page?: number; 
    limit?: number; 
    departmentId?: string; 
    criterionId?: string; 
    year?: number; 
    month?: number;
    search?: string;
    isActive?: boolean;
  }) => {
    const token = localStorage.getItem('token');
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.departmentId) queryParams.append('departmentId', params.departmentId);
    if (params?.criterionId) queryParams.append('criterionId', params.criterionId);
    if (params?.year) queryParams.append('year', params.year.toString());
    if (params?.month) queryParams.append('month', params.month.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
    
    const response = await fetch(`${API_BASE_URL}/evidence-codes?${queryParams}`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  getEvidenceCodeById: async (id: string) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/evidence-codes/${id}`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  updateEvidenceCode: async (id: string, data: { description?: string; isActive?: boolean }) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/evidence-codes/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  deleteEvidenceCode: async (id: string) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/evidence-codes/${id}`, {
      method: 'DELETE',
      headers: { 
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  getEvidenceCodeStats: async (params?: { departmentId?: string; year?: number; month?: number }) => {
    const token = localStorage.getItem('token');
    const queryParams = new URLSearchParams();
    if (params?.departmentId) queryParams.append('departmentId', params.departmentId);
    if (params?.year) queryParams.append('year', params.year.toString());
    if (params?.month) queryParams.append('month', params.month.toString());
    
    const response = await fetch(`${API_BASE_URL}/evidence-codes/stats?${queryParams}`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  // Document Category endpoints
  getDocumentCategories: async (params?: { 
    page?: number; 
    limit?: number; 
    search?: string;
    parentCategory?: string | null;
    isActive?: boolean;
  }) => {
    const token = localStorage.getItem('token');
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    // Only add parentCategory if explicitly provided (not null/undefined)
    if (params?.parentCategory !== undefined && params?.parentCategory !== null) {
      queryParams.append('parentCategory', params.parentCategory);
    }
    if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
    
    const response = await fetch(`${API_BASE_URL}/document-categories?${queryParams}`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  getDocumentCategoryById: async (id: string) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/document-categories/${id}`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  createDocumentCategory: async (data: { 
    name: string; 
    description?: string;
    icon?: string;
    color?: string;
    backgroundColor?: string;
    parentCategory?: string | null;
    order?: number;
  }) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/document-categories`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  updateDocumentCategory: async (id: string, data: { 
    name?: string; 
    description?: string;
    icon?: string;
    color?: string;
    backgroundColor?: string;
    parentCategory?: string | null;
    order?: number;
    isActive?: boolean;
  }) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/document-categories/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  deleteDocumentCategory: async (id: string) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/document-categories/${id}`, {
      method: 'DELETE',
      headers: { 
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  getDocumentCategoryStats: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/document-categories/stats`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  // Admin Statistics APIs
  getAdminProgress: async (params?: { academicYear?: string; semester?: string }) => {
    const token = localStorage.getItem('token');
    const queryParams = new URLSearchParams();
    if (params?.academicYear) queryParams.append('academicYear', params.academicYear);
    if (params?.semester) queryParams.append('semester', params.semester);
    
    const response = await fetch(`${API_BASE_URL}/admin/statistics/progress?${queryParams}`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  getAdminQAOverview: async (params?: { academicYear?: string; semester?: string }) => {
    const token = localStorage.getItem('token');
    const queryParams = new URLSearchParams();
    if (params?.academicYear) queryParams.append('academicYear', params.academicYear);
    if (params?.semester) queryParams.append('semester', params.semester);
    
    const response = await fetch(`${API_BASE_URL}/admin/statistics/qa-overview?${queryParams}`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  getAdminTimeline: async (params?: { academicYear?: string; semester?: string }) => {
    const token = localStorage.getItem('token');
    const queryParams = new URLSearchParams();
    if (params?.academicYear) queryParams.append('academicYear', params.academicYear);
    if (params?.semester) queryParams.append('semester', params.semester);
    
    const response = await fetch(`${API_BASE_URL}/admin/statistics/timeline?${queryParams}`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  getAdminDepartmentStatistics: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/admin/statistics/departments`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  getAdminUserStatistics: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/admin/statistics/users`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },
};

export default api;
