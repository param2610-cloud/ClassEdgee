import React, { useEffect, useState } from 'react';
import '../../../style/login.css';
import { useNavigate } from 'react-router-dom';
import { domain } from '@/lib/constant';
import axios from 'axios';
import { useAtom } from 'jotai';
import { roleAtom } from '@/store/atom';
import { enhancedLocalStorage, useAuth } from '@/services/AuthContext';
import { roleType } from '@/interface/general';

const LoginPage: React.FC = () => {
  const { user,isLoading} = useAuth()
  const navigate = useNavigate();
  useEffect(() => {
    console.log("LoginPage - User:", user);
    if(!isLoading && user){
      navigate("/p/", { replace: true });
    }
  },[user,isLoading,navigate])
  const [college_uid, setcollege_uid] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [role, setRole] = useState<roleType>('student');
  const [message, setMessage] = useState<string>('');
  const [, setRoleAtom] = useAtom(roleAtom);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!college_uid || !password) {
      setMessage("User ID and password are required");
      return;
    }

    try {
      const endpoint =`${domain}/api/v1/${role}/login` ;

      const response = await axios.post(endpoint, {
        college_uid: college_uid,
        password
      }, {
        withCredentials: true
      });

      if (response.status === 200) {
        setRoleAtom(role);
        console.log(response.data);
        
        enhancedLocalStorage.setItem('accessToken', response.data.accessToken);
        enhancedLocalStorage.setItem('refreshToken', response.data.refreshToken);
        // console.log(`Logging in as: ${response.data.user.role}`);
        navigate("/p/");
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
    <div className="login-container ">
      <div className="login-box">
        <h2>Login</h2>
        <form className="login-form" onSubmit={handleLogin}>
          <select 
            value={role} 
            onChange={(e) => setRole(e.target.value as roleType)} 
            required
          >
            <option value="principal">Principal</option>
            <option value="admin">Admin</option>
            <option value="student">Student</option>
            <option value="coordinator">Co-ordinator</option>
          </select>
          <input
            type="text"
            placeholder="college_uid"
            value={college_uid}
            onChange={(e) => setcollege_uid(e.target.value)}
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