import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import axiosCliente from "../../services/axiosCliente";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem("TOKEN");

    if (!token) {
      setUser(null);
      setCompany(null);
      setAuthError(null);
      setLoading(false);

      return null;
    }

    try {
      setAuthError(null);

      const response = await axiosCliente.get("/me");

      const currentUser = response.data?.user ?? null;
      const currentCompany = response.data?.company ?? null;

      setUser(currentUser);
      setCompany(currentCompany);

      return currentUser;
    } catch (error) {
      setUser(null);
      setCompany(null);

      if (error.response?.status !== 401) {
        setAuthError(
          error.response?.data?.message ||
            "No fue posible obtener la información del usuario.",
        );
      }

      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const cargarUsuario = async () => {
      try {
        await refreshUser();
      } catch (error) {
        // El interceptor de axiosCliente ya gestiona los errores 401.
      }
    };

    cargarUsuario();
  }, [refreshUser]);

  const logout = useCallback(async () => {
    try {
      const token = localStorage.getItem("TOKEN");

      if (token) {
        await axiosCliente.post("/logout");
      }
    } catch (error) {
      // Aunque el backend no responda, limpiamos la sesión local.
    } finally {
      localStorage.removeItem("TOKEN");

      // Temporal durante la migración.
      // Más adelante eliminaremos por completo el uso de USUARIO.
      localStorage.removeItem("USUARIO");

      setUser(null);
      setCompany(null);
      setAuthError(null);
    }
  }, []);

  const switchCompany = useCallback(
    async (companyUserId) => {
      if (!companyUserId) {
        throw new Error("La empresa seleccionada no es válida.");
      }

      const response = await axiosCliente.post("/auth/switch-company", {
        company_user_id: Number(companyUserId),
      });

      const data = response.data;

      if (!data?.token) {
        throw new Error(data?.message || "No fue posible cambiar de empresa.");
      }

      /*
       * Sustituimos el token actual por el token
       * ligado a la nueva relación company_user.
       */
      localStorage.setItem("TOKEN", data.token);

      try {
        await refreshUser();
      } catch (error) {
        localStorage.removeItem("TOKEN");
        throw error;
      }

      return data;
    },
    [refreshUser],
  );

const value = useMemo(
  () => ({
    user,
    company,
    loading,
    authError,
    isAuthenticated: Boolean(user),
    refreshUser,
    switchCompany,
    logout,
  }),
  [
    user,
    company,
    loading,
    authError,
    refreshUser,
    switchCompany,
    logout,
  ],

  );

  return <AuthContext.Provider value={value}>
    {children}
  </AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth debe utilizarse dentro de AuthProvider.");
  }

  return context;
}
