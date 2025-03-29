import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [formError, setFormError] = useState<string>('');
  const { login, error: authError, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Form validation
    if (!email.trim()) {
      setFormError('Email is required');
      return;
    }

    if (!password.trim()) {
      setFormError('Password is required');
      return;
    }

    try {
      await login({ email, password });
      navigate('/users');
    } catch (error) {
      // Error is handled in the auth context
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="card w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">EmployWise Login</h1>
        
        {(formError || authError) && (
          <Alert 
            type="error" 
            message={formError || authError || ''}
            onClose={() => setFormError('')}
          />
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="label">Email</label>
            <input
              id="email"
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="eve.holt@reqres.in"
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="password" className="label">Password</label>
            <input
              id="password"
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="cityslicka"
            />
          </div>
          
          <button 
            type="submit"
            className="btn btn-primary w-full"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
          
          <div className="mt-4 text-sm text-gray-600 text-center">
            <p>Use these credentials for testing:</p>
            <p>Email: eve.holt@reqres.in</p>
            <p>Password: cityslicka</p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;