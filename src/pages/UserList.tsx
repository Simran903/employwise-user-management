import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getUsers, deleteUser, getLocalUpdatedUsers } from '../services/api';
import { User, UsersResponse } from '../types';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';
import Pagination from '../components/Pagination';

const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);
  const { logout } = useAuth();

  const getDeletedUsers = (): number[] => {
    const deletedUsers = localStorage.getItem('deletedUsers');
    return deletedUsers ? JSON.parse(deletedUsers) : [];
  };

  const saveDeletedUser = (id: number): void => {
    const deletedUsers = getDeletedUsers();
    if (!deletedUsers.includes(id)) {
      deletedUsers.push(id);
      localStorage.setItem('deletedUsers', JSON.stringify(deletedUsers));
    }
  };

  const fetchUsers = async (page: number) => {
    try {
      setLoading(true);
      const response: UsersResponse = await getUsers(page);
      
      const updatedUsers = getLocalUpdatedUsers();
      const deletedUsers = getDeletedUsers();
      
      const mergedUsers = response.data
        .filter(user => !deletedUsers.includes(user.id))
        .map(user => {
          if (updatedUsers[user.id]) {
            return { ...user, ...updatedUsers[user.id] };
          }
          return user;
        });
      
      setUsers(mergedUsers);
      setTotalPages(response.total_pages);
      setCurrentPage(response.page);
    } catch (error) {
      setError('Failed to fetch users');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage]);

  useEffect(() => {
    const handleStorageChange = () => {
      fetchUsers(currentPage);
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleDeleteUser = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        setDeletingUserId(id);
        await deleteUser(id);
        
        setUsers(users.filter(user => user.id !== id));
        
        saveDeletedUser(id);
        
        window.dispatchEvent(new Event('storage'));
        
        setAlert({
          type: 'success',
          message: 'User deleted successfully'
        });
      } catch (error) {
        console.error(error);
        setAlert({
          type: 'error',
          message: 'Failed to delete user. Please try again.'
        });
      } finally {
        setDeletingUserId(null);
      }
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredUsers = users.filter(user =>
    user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        <button
          onClick={logout}
          className="btn bg-gray-500 hover:bg-gray-600 text-white"
        >
          Logout
        </button>
      </div>

      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name or email..."
          className="input max-w-md"
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>

      {loading && users.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-600">Loading users...</p>
        </div>
      ) : error ? (
        <div className="text-center py-10">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => fetchUsers(currentPage)}
            className="btn btn-primary mt-2"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map(user => (
              <div key={user.id} className="card">
                <div className="flex items-center mb-4">
                  <img
                    src={user.avatar}
                    alt={`${user.first_name} ${user.last_name}`}
                    className="w-16 h-16 rounded-full mr-4"
                  />
                  <div>
                    <h2 className="text-lg font-semibold">{`${user.first_name} ${user.last_name}`}</h2>
                    <p className="text-gray-600">{user.email}</p>
                  </div>
                </div>
                <div className="flex justify-between">
                  <Link
                    to={`/users/${user.id}/edit`}
                    className="btn bg-yellow-500 hover:bg-yellow-600 text-white"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="btn btn-danger"
                    disabled={deletingUserId === user.id}
                  >
                    {deletingUserId === user.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-10">
              <p className="text-gray-600">No users found matching your search.</p>
            </div>
          )}

          {filteredUsers.length > 0 && searchTerm === '' && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </div>
  );
};

export default UserList;