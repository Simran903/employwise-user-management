import React, { useState, useEffect, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSingleUser, updateUser, getLocalUpdatedUsers } from '../services/api';
import { User } from '../types';
import Alert from '../components/Alert';

const EditUser: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [updateResponse, setUpdateResponse] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (!id) {
        setError('No user ID provided');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const userId = parseInt(id);
        let userData = await getSingleUser(userId);
        
        if (!userData) {
          throw new Error('No user data returned from API');
        }
        
        const localUpdates = getLocalUpdatedUsers();
        if (localUpdates[userId]) {
          userData = { ...userData, ...localUpdates[userId] };
        }
        
        setUser(userData);
        setFirstName(userData.first_name || '');
        setLastName(userData.last_name || '');
        setEmail(userData.email || '');
      } catch (error) {
        console.error('Error fetching user:', error);
        setError('Failed to fetch user data. The user may not exist.');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!id) {
      setAlert({ type: 'error', message: 'No user ID provided' });
      return;
    }
    
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setAlert({ type: 'error', message: 'All fields are required' });
      return;
    }
    
    try {
      setSaving(true);
      setAlert(null);
      
      const userId = parseInt(id);
      const userData = { 
        first_name: firstName, 
        last_name: lastName, 
        email: email 
      };
      
      console.log('Sending update with data:', userData);
      
      const updatedData = await updateUser(userId, userData);
      
      console.log('API response:', updatedData);
      
      if (!updatedData) {
        throw new Error('No data returned from update API');
      }
      
      setUser(prev => prev ? { ...prev, ...userData } : null);
      setUpdateResponse(updatedData);
      
      window.dispatchEvent(new Event('storage'));
      
      setAlert({ 
        type: 'success', 
        message: 'User updated successfully' 
      });
    } catch (error: any) {
      console.error('Error updating user:', error);
      setAlert({ 
        type: 'error', 
        message: `Failed to update user: ${error.message || 'Please try again'}` 
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-4 text-center py-10">
        <p className="text-gray-600">Loading user data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-4 text-center py-10">
        <Alert type="error" message={error} />
        <button 
          onClick={() => navigate('/users')} 
          className="btn btn-primary mt-4"
        >
          Back to Users
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Edit User</h1>
        <button 
          onClick={() => navigate('/users')} 
          className="btn bg-gray-500 hover:bg-gray-600 text-white"
        >
          Cancel
        </button>
      </div>

      {alert && (
        <Alert 
          type={alert.type} 
          message={alert.message} 
          onClose={() => setAlert(null)} 
        />
      )}

      {updateResponse && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
          <h3 className="text-lg font-medium text-green-800">Update Successful</h3>
          <div className="mt-2 text-sm text-green-700">
            <p>Name: {updateResponse.name}</p>
            <p>Job: {updateResponse.job}</p>
            <p>Updated at: {updateResponse.updatedAt}</p>
          </div>
        </div>
      )}

      {user && (
        <div className="card bg-white shadow rounded-lg p-6">
          <div className="flex items-center mb-6">
            <img 
              src={user.avatar} 
              alt={`${user.first_name} ${user.last_name}`} 
              className="w-20 h-20 rounded-full mr-4"
            />
            <div>
              <h2 className="text-xl font-semibold">Edit User Profile</h2>
              <p className="text-gray-600">ID: {user.id}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="firstName" className="label block text-sm font-medium text-gray-700">First Name</label>
              <input
                id="firstName"
                type="text"
                className="input mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="lastName" className="label block text-sm font-medium text-gray-700">Last Name</label>
              <input
                id="lastName"
                type="text"
                className="input mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="email" className="label block text-sm font-medium text-gray-700">Email</label>
              <input
                id="email"
                type="email"
                className="input mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="flex space-x-4">
              <button 
                type="submit"
                className="btn btn-primary flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              
              <button 
                type="button"
                className="btn bg-gray-500 hover:bg-gray-600 text-white flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium"
                onClick={() => navigate('/users')}
              >
                Cancel
              </button>
            </div>
          </form>
          
          {alert?.type === 'success' && (
            <div className="mt-4 text-center">
              <button 
                onClick={() => navigate('/users')} 
                className="btn bg-green-500 hover:bg-green-600 text-white py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium"
              >
                Back to Users List
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EditUser;