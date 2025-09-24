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
      console.log("Iniciando login para:", username);

      // Create FormData for OAuth2 password flow
      const formData = new FormData();
      formData.append("username", username);
      formData.append("password", password);

      // Use axios API but with FormData directly for OAuth2
      const response = await fetch("http://localhost:8000/api/v1/auth/login", {
        method: "POST",
        body: formData,
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Login error response:", errorData);
        throw new Error(errorData.detail || "Login failed");
      }

      const data = await response.json();
      console.log("Login success:", data);
      const { access_token } = data;

      // Store token
      localStorage.setItem("authToken", access_token);

      // Get user data
      const userResponse = await fetch("http://localhost:8000/api/v1/auth/me", {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });

      console.log("User data response status:", userResponse.status);

      if (!userResponse.ok) {
        const errorData = await userResponse.json();
        console.error("User data error:", errorData);
        throw new Error("Failed to get user data");
      }

      const userData = await userResponse.json();
      console.log("User data received:", userData);

      // Store user data
      localStorage.setItem("userData", JSON.stringify(userData));
      setUser(userData);

      setIsLoading(false);
      return true;
    } catch (error: any) {
      console.error("Login error:", error);

      // Verificar tipos específicos de erro
      let errorMessage = "Erro ao fazer login";

      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage = "Erro de conexão - Verifique se o backend está rodando";
      } else if (error.message.includes('CORS')) {
        errorMessage = "Erro de CORS - Problema de configuração do servidor";
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
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
