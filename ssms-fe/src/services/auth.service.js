import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth/';

const register = (username, password, role) => {
  return axios.post(API_URL + 'register', { username, password, role });
};

const login = (username, password) => {
  return axios.post(API_URL + 'login', { username, password })
    .then((response) => {
      if (response.data.token) {
        localStorage.setItem('user', JSON.stringify(response.data));
      }
      return response.data;
    });
};

const logout = () => {
  localStorage.removeItem('user');
};

const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem('user'));
};

const AuthService = {
  register,
  login,
  logout,
  getCurrentUser,
};

export default AuthService;