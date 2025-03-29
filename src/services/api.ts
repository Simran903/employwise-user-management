import axios from 'axios';
import { LoginCredentials, LoginResponse, UpdateUserData, UsersResponse, User } from '../types';

const API_URL = 'https://reqres.in/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = async (credentials: LoginCredentials): Promise<string> => {
  try {
    const response = await api.post<LoginResponse>('/login', credentials);
    return response.data.token;
  } catch (error) {
    throw error;
  }
};

export const getUsers = async (page: number = 1): Promise<UsersResponse> => {
  try {
    const response = await api.get<UsersResponse>(`/users?page=${page}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getSingleUser = async (id: number): Promise<User> => {
  try {
    const deletedUsers = getDeletedUsers();
    if (deletedUsers.includes(id)) {
      throw new Error('User has been deleted');
    }
    
    const response = await api.get<{data: User}>(`/users/${id}`);
    
    const updatedUsers = getLocalUpdatedUsers();
    if (updatedUsers[id]) {
      return { ...response.data.data, ...updatedUsers[id] };
    }
    
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

export const updateUser = async (id: number, data: UpdateUserData): Promise<any> => {
  try {
    const deletedUsers = getDeletedUsers();
    if (deletedUsers.includes(id)) {
      throw new Error('Cannot update a deleted user');
    }
    
    const apiData = {
      name: `${data.first_name} ${data.last_name}`,
      job: data.email,
    };
    
    const response = await api.put(`/users/${id}`, apiData);
    
    const mergedResponse = {
      ...response.data,
      id: id,
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
    };
    
    const updatedUsers = getLocalUpdatedUsers();
    updatedUsers[id] = {
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email
    };
    saveLocalUpdatedUsers(updatedUsers);
    
    window.dispatchEvent(new Event('storage'));
    
    return mergedResponse;
  } catch (error) {
    console.error('API update error:', error);
    throw error;
  }
};

export const deleteUser = async (id: number): Promise<void> => {
  try {
    await api.delete(`/users/${id}`);
    
    const deletedUsers = getDeletedUsers();
    if (!deletedUsers.includes(id)) {
      deletedUsers.push(id);
      localStorage.setItem('deletedUsers', JSON.stringify(deletedUsers));
    }
    
    const updatedUsers = getLocalUpdatedUsers();
    delete updatedUsers[id];
    saveLocalUpdatedUsers(updatedUsers);
    
    window.dispatchEvent(new Event('storage'));
  } catch (error) {
    throw error;
  }
};

export const getLocalUpdatedUsers = (): Record<number, Partial<User>> => {
  const saved = localStorage.getItem('updatedUsers');
  return saved ? JSON.parse(saved) : {};
};

export const saveLocalUpdatedUsers = (data: Record<number, Partial<User>>): void => {
  localStorage.setItem('updatedUsers', JSON.stringify(data));
};

export const getDeletedUsers = (): number[] => {
  const deletedUsers = localStorage.getItem('deletedUsers');
  return deletedUsers ? JSON.parse(deletedUsers) : [];
};

export default api;