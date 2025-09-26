import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { getApiConfig } from "@/config/api";

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
  login: (email: string, password: string) => Promise<boolean>;
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
  const apiConfig = getApiConfig();

  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem("authToken");
      const userData = localStorage.getItem("userData");

      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData);

          const response = await fetch(`${apiConfig.BASE_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (response.ok) {
            const validUser = await response.json();
            setUser(validUser);
            localStorage.setItem("userData", JSON.stringify(validUser));
          } else {
            localStorage.removeItem("authToken");
            localStorage.removeItem("userData");
            setUser(null);
          }
        } catch (err) {
          console.error("Erro ao validar token:", err);
          localStorage.removeItem("authToken");
          localStorage.removeItem("userData");
          setUser(null);
        }
      }

      setIsLoading(false);
    };

    validateToken();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("username", email); // backend espera username, usamos email
      formData.append("password", password);

      const response = await fetch(`${apiConfig.BASE_URL}/auth/login`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Email ou senha incorretos");
      }

      const data = await response.json();
      const { access_token } = data;

      localStorage.setItem("authToken", access_token);

      const userResponse = await fetch(`${apiConfig.BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      if (!userResponse.ok) {
        throw new Error("Falha ao obter dados do usuário");
      }

      const userData = await userResponse.json();
      localStorage.setItem("userData", JSON.stringify(userData));
      setUser(userData);

      setIsLoading(false);
      return true;
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Erro ao fazer login");
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
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};
