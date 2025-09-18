import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { apiPost } from "@/lib/api";

interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: "admin" | "comercial" | "suprimentos" | "diretoria" | "cliente";
  is_active: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!user;

  useEffect(() => {
    // Check if user is already logged in on mount
    const token = localStorage.getItem("authToken");
    const userData = localStorage.getItem("userData");

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("authToken");
        localStorage.removeItem("userData");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (
    username: string,
    password: string
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      // Create FormData for OAuth2 password flow
      const formData = new FormData();
      formData.append("username", username);
      formData.append("password", password);

      console.log("FORM DATA:", username, password);
      const response = await fetch("http://localhost:8000/api/v1/auth/login", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Login failed");
      }

      const data = await response.json();
      const { access_token } = data;

      // Store token
      localStorage.setItem("authToken", access_token);

      // Get user data
      const userResponse = await fetch("http://localhost:8000/api/v1/auth/me", {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });

      if (!userResponse.ok) {
        throw new Error("Failed to get user data");
      }

      const userData = await userResponse.json();

      // Store user data
      localStorage.setItem("userData", JSON.stringify(userData));
      setUser(userData);

      setIsLoading(false);
      return true;
    } catch (error: any) {
      console.error("Login error:", error);
      setError(error.message || "Erro ao fazer login");
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    setUser(null);
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        login,
        logout,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
