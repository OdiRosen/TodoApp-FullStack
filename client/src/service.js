import axios from 'axios';

const apiUrl = "https://todo-api-server-o7s4.onrender.com";
axios.defaults.baseURL = apiUrl;
// --- Axios Interceptors (אתגר ה-JWT) ---

// 1. הזרקת הטוקן לכל בקשה שיוצאת לשרת
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

// 2. טיפול בשגיאת 401 (Unauthorized) - העברה אוטומטית ללוגין
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = "/login"; // ניקוי והפניה
    }
    console.error('API Error:', error.response ? error.response.data : error.message);
    return Promise.reject(error);
  }
);

export default {
  // הרשמת משתמש חדש
  register: async (username, password) => {
    const result = await axios.post(`/register`, { username, password });
    return result.data;
  },

  // התחברות ושמירת הטוקן ב-LocalStorage
  login: async (username, password) => {
    const result = await axios.post(`/login`, { username, password });
    if (result.data && result.data.token) {
      localStorage.setItem('token', result.data.token);
    }
    return result.data;
  },

  getTasks: async () => {
    const result = await axios.get(`/items`);
    return result.data;
  },

  addTask: async (name) => {
    const result = await axios.post(`/items`, { name: name, isComplete: false });
    return result.data;
  },

  setCompleted: async (id, name, isComplete) => {
    // שליחת אובייקט מלא לצורך ה-Binding ב-Minimal API
    const result = await axios.put(`/items/${id}`, { 
      id: id, 
      name: name, 
      isComplete: isComplete 
    });
    return result.data;
  },

  deleteTask: async (id) => {
    const result = await axios.delete(`/items/${id}`);
    return result.data;
  }
};
