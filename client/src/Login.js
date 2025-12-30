import React, { useState } from 'react';
import axios from 'axios';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // פונקציית התחברות
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/login', { username, password });
      const token = response.data.token;
      localStorage.setItem('token', token);
      onLogin(token);
    } catch (error) {
      alert('שם משתמש או סיסמה שגויים');
    }
  };

  // פונקציית הרשמה (חדש!)
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/register', { username, password });
      alert('נרשמת בהצלחה! עכשיו אפשר להתחבר');
    } catch (error) {
      alert('שגיאה בהרשמה: ייתכן ושם המשתמש כבר תפוס');
    }
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center', maxWidth: '300px', margin: 'auto' }}>
      <h2>ניהול משימות - כניסה</h2>
      <form>
        <input 
          type="text" 
          placeholder="שם משתמש" 
          value={username}
          onChange={e => setUsername(e.target.value)} 
          style={{ marginBottom: '10px', padding: '5px', width: '100%' }}
        /><br/>
        <input 
          type="password" 
          placeholder="סיסמה" 
          value={password}
          onChange={e => setPassword(e.target.value)} 
          style={{ marginBottom: '10px', padding: '5px', width: '100%' }}
        /><br/>
        
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button onClick={handleLogin} type="button" style={{ backgroundColor: '#4CAF50', color: 'white', border: 'none', padding: '10px', cursor: 'pointer' }}>
            התחבר
          </button>
          <button onClick={handleRegister} type="button" style={{ backgroundColor: '#2196F3', color: 'white', border: 'none', padding: '10px', cursor: 'pointer' }}>
            הרשם כמשתמש חדש
          </button>
        </div>
      </form>
    </div>
  );
};

export default Login;