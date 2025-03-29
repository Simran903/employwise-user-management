export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  avatar: string;
}

export interface UsersResponse {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
  data: User[];
}

export interface UpdateUserData {
  first_name: string;
  last_name: string;
  email: string;
}

export interface ReqresUpdateData {
  name: string;
  job: string;
}

export interface UpdateResponse {
  name: string;
  job: string;
  updatedAt: string;
}