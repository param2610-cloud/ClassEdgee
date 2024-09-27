import React, { useState } from 'react';
import '../../style/login.css';
import { useNavigate } from 'react-router-dom';
import { domain } from '@/lib/constant';
import axios from 'axios';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [Userid, setUserid] = useState<string>(''); 
  const [password, setPassword] = useState<string>(''); 
  const [role, setRole] = useState<'principal' | 'admin' | 'student'>('student'); 
  const [message, setMessage] = useState<string>("");

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!Userid || !password) {
      alert("User ID and password are required");
      return; 
    }

    try {
      if (role === "admin") {
        const response = await axios.post(`${domain}/api/v1/supreme/login`, {
          userid: Userid,
          password: password,
        });

        console.log(response);

        if (response.status === 200) {
          console.log(`Logging in as: ${response.data}`);
          navigate("/dashboard");
        }
      }
    } catch (error: any) {
      if (error.response) {
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.response.headers);

        if (error.response.status === 401) {
          setMessage("User ID or password is incorrect");
        } else {
          setMessage("An error occurred. Please try again later.");
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.log(error.request);
        setMessage("No response from server. Please try again later.");
      } else {
        // Something happened in setting up the request that triggered an error
        console.log("Error", error.message);
        setMessage("An error occurred. Please try again.");
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
            value={Userid}
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
          <button type="submit">Login</button>
          {message && <p className='text-red-500 font-normal p-1'>{message}</p>}
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
