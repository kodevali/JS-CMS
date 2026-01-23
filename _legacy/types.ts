
export type Department = 'HR' | 'IT' | 'Communications';
export type Role = 'Viewer' | 'Admin' | 'IT Content Manager' | 'Communications Content Manager' | 'HR Content Manager';

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  summary: string;
  department: Department;
  author: string;
  createdAt: string;
  isFeatured: boolean;
  imageUrl?: string;
  thumbnailUrl?: string;
}

export interface FileItem {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
  department: Department;
  previewUrl?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  department: Department;
  avatar: string;
}

export interface AuditLog {
  timestamp: string;
  user: string;
  action: string;
  details: string;
  status: 'SUCCESS' | 'FAILURE';
}

export interface DashboardStats {
  totalNews: number;
  totalFiles: number;
  newsByDept: Record<Department, number>;
}
