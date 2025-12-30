import React, { useEffect, useState } from 'react';
import service from './service.js';

function App() {
  const [newTodo, setNewTodo] = useState("");
  const [todos, setTodos] = useState([]);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // פונקציית עזר לטעינת משימות מהשרת
  async function getTodos() {
    try {
      const todos = await service.getTasks();
      setTodos(todos);
    } catch (error) {
      console.error("Failed to fetch todos", error);
    }
  }

  // --- לוגיקת אימות (Authentication) ---

  async function handleLogin(e) {
    if (e) e.preventDefault();
    try {
      await service.login(username, password);
      setToken(localStorage.getItem('token')); // טעינת הטוקן לסטייט כדי לרענן את ה-UI
    } catch (error) {
      alert("שם משתמש או סיסמה שגויים");
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    try {
      await service.register(username, password);
      alert("נרשמת בהצלחה! עכשיו אפשר להתחבר");
    } catch (error) {
      alert("שגיאה בהרשמה: ייתכן ששם המשתמש תפוס");
    }
  }

  function handleLogout() {
    localStorage.removeItem('token');
    setToken(null);
    setTodos([]);
  }

  // --- לוגיקת ניהול משימות ---

  async function createTodo(e) {
    e.preventDefault();
    if (!newTodo) return;
    await service.addTask(newTodo);
    setNewTodo("");
    await getTodos();
  }

  async function updateCompleted(todo, isComplete) {
    await service.setCompleted(todo.id, todo.name, isComplete);
    await getTodos();
  }

  async function deleteTodo(id) {
    await service.deleteTask(id);
    await getTodos();
  }

  // טעינת משימות רק אם קיים טוקן (משתמש מחובר)
  useEffect(() => {
    if (token) {
      getTodos();
    }
  }, [token]);

  // הצגת מסך לוגין/הרשמה במידה ואין טוקן
if (!token) {
  return (
    <section className="todoapp" style={{ marginTop: "100px" }}>
      <header className="header" style={{ textAlign: "center" }}>
        {/* שיניתי את ה-h1 שיהיה קטן יותר ולא יברח */}
        <h1 style={{ position: "static", fontSize: "40px", top: "0", color: "#4d4d4d", opacity: "1" }}>
          Welcome
        </h1>
        <div style={{ padding: "20px", background: "#fff", boxShadow: "0 2px 4px 0 rgba(0, 0, 0, 0.2)", margin: "0 20px" }}>
          <input 
            className="new-todo" 
            placeholder="Username" 
            style={{ position: "static", marginBottom: "10px", padding: "16px", border: "1px solid #ededed" }}
            onChange={(e) => setUsername(e.target.value)} 
          />
          <input 
            className="new-todo" 
            type="password" 
            placeholder="Password" 
            style={{ position: "static", border: "1px solid #ededed" }}
            onChange={(e) => setPassword(e.target.value)} 
          />
          <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
            <button onClick={handleLogin} type="button" style={{ padding: "10px", flex: 1, cursor: "pointer", backgroundColor: "#4CAF50", color: "white", border: "none", borderRadius: "4px" }}>
              Login
            </button>
            <button onClick={handleRegister} type="button" style={{ padding: "10px", flex: 1, cursor: "pointer", backgroundColor: "#2196F3", color: "white", border: "none", borderRadius: "4px" }}>
              Register
            </button>
          </div>
        </div>
      </header>
    </section>
  );
}

  // הצגת רשימת המטלות למשתמש מחובר
  return (
    <section className="todoapp">
      <header className="header">
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
        <h1>todos</h1>
        <form onSubmit={createTodo}>
          <input 
            className="new-todo" 
            placeholder="What needs to be done?" 
            value={newTodo} 
            onChange={(e) => setNewTodo(e.target.value)} 
          />
        </form>
      </header>
      <section className="main" style={{ display: "block" }}>
        <ul className="todo-list">
          {todos.map(todo => (
            <li className={todo.isComplete ? "completed" : ""} key={todo.id}>
              <div className="view">
                <input 
                  className="toggle" 
                  type="checkbox" 
                  checked={todo.isComplete} 
                  onChange={(e) => updateCompleted(todo, e.target.checked)} 
                />
                <label>{todo.name}</label>
                <button className="destroy" onClick={() => deleteTodo(todo.id)}></button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </section>
  );
}

export default App;