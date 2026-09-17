import { useEffect, useState } from "react";

import Login from "./pages/Login";
import Register from "./pages/Register";
import TodoList from "./components/TodoList";

const API_URL = "http://localhost:5000/api";

function App() {
  const [user, setUser] = useState(null);
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(
          `${API_URL}/auth/me`,
          {
            credentials: "include",
          }
        );

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error(
          "Authentication check failed:",
          error
        );
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return isLogin ? (
      <Login
        setUser={setUser}
        switchToRegister={() => setIsLogin(false)}
        API_URL={API_URL}
      />
    ) : (
      <Register
        switchToLogin={() => setIsLogin(true)}
        API_URL={API_URL}
      />
    );
  }

  return (
    <TodoList
      user={user}
      setUser={setUser}
      API_URL={API_URL}
    />
  );
}

export default App;