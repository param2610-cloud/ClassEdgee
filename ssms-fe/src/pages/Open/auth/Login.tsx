import React, { useEffect, useState } from 'react';
import '../../../style/login.css';
import { useNavigate } from 'react-router-dom';
import { domain } from '@/lib/constant';
import axios from 'axios';
import { useAtom } from 'jotai';
import { roleAtom } from '@/store/atom';
import { useAuth } from '@/services/AuthContext';

const LoginPage: React.FC = () => {
  const { user,isLoading} = useAuth()
  useEffect(() => {
    if(!isLoading && user){
      navigate("/dashboard");
    }
  },[user,isLoading])
  const navigate = useNavigate();
  const [userid, setUserid] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [role, setRole] = useState<'principal' | 'admin' | 'student'>('student');
  const [message, setMessage] = useState<string>('');
  const [, setRoleAtom] = useAtom(roleAtom);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!userid || !password) {
      setMessage("User ID and password are required");
      return;
    }

    try {
      const endpoint = role === 'admin' 
        ? `${domain}/api/v1/supreme/login`
        : role === 'principal'
          ? `${domain}/api/v1/principal/login`
          : `${domain}/api/v1/student/login`;

      const response = await axios.post(endpoint, {
        userid,
        password
      }, {
        withCredentials: true
      });

      if (response.status === 200) {
        setRoleAtom(role);
        console.log(response.data);
        
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        console.log(`Logging in as: ${response.data.user.role}`);
        navigate("/dashboard");
      }
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          console.error('Error response:', error.response.data);
          setMessage(error.response.data.message || "An error occurred. Please try again later.");
        } else if (error.request) {
          console.error('Error request:', error.request);
          setMessage("No response from server. Please try again later.");
        } else {
          console.error('Error:', error.message);
          setMessage("An error occurred. Please try again.");
        }
      } else {
        console.error('Unexpected error:', error);
        setMessage("An unexpected error occurred. Please try again.");
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Login</h2>
        <form className="login-form" onSubmit={handleLogin}>
          <select 
            value={role} 
            onChange={(e) => setRole(e.target.value as 'principal' | 'admin' | 'student')} 
            required
          >
            <option value="principal">Principal</option>
            <option value="admin">Admin</option>
            <option value="student">Student</option>
          </select>
          <input
            type="text"
            placeholder="User ID"
            value={userid}
            onChange={(e) => setUserid(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button disabled={isLoading} type="submit">Login</button>
          {message && <p className='text-red-500 font-normal p-1'>{message}</p>}
        </form>
      </div>
    </div>
  );
};

export default LoginPage;