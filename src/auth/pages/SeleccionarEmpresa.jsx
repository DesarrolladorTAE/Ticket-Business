import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import axiosCliente from "../../services/axiosCliente";
import { useAuth } from "../context/AuthContext";
import SeleccionEmpresaView from "../components/SeleccionEmpresaView";

export default function SeleccionarEmpresa() {
  const navigate = useNavigate();

  const { company, switchCompany } = useAuth();

  const [cuentas, setCuentas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [seleccionando, setSeleccionando] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargarEmpresas = async () => {
      setCargando(true);
      setError("");

      try {
        const response = await axiosCliente.get("/auth/companies");

        const accounts = Array.isArray(response.data?.accounts)
          ? response.data.accounts
          : [];

        setCuentas(accounts);

        if (!accounts.length) {
          setError("No se encontraron empresas disponibles para tu cuenta.");
        }
      } catch (error) {
        setError(
          error.response?.data?.message ||
            "No fue posible consultar tus empresas.",
        );
      } finally {
        setCargando(false);
      }
    };

    cargarEmpresas();
  }, []);

  const seleccionarEmpresa = async (cuenta) => {
    if (!cuenta?.company_user_id) {
      return;
    }

    /*
     * Si selecciona la empresa donde ya está,
     * simplemente regresamos.
     */
    if (Number(company?.company_user_id) === Number(cuenta.company_user_id)) {
      navigate(-1);
      return;
    }

    setSeleccionando(cuenta.company_user_id);
    setError("");

    try {
      const data = await switchCompany(cuenta.company_user_id);

      const role = String(
        data?.company?.role ||
          data?.user?.company_role ||
          data?.user?.role ||
          "",
      )
        .trim()
        .toLowerCase();

      if (
        ["admin", "administrador", "supervisor", "agent", "agente"].includes(
          role,
        )
      ) {
        navigate("/paneladministrador", {
          replace: true,
        });

        return;
      }

      if (["client", "cliente"].includes(role)) {
        navigate("/tickets/nuevo", {
          replace: true,
        });

        return;
      }

      navigate("/mis-tickets", {
        replace: true,
      });
    } catch (error) {
      setError(
        error.response?.data?.message ||
          error.message ||
          "No fue posible cambiar de empresa.",
      );
    } finally {
      setSeleccionando(null);
    }
  };

  if (cargando) {
    return (
      <SeleccionEmpresaView
        cuentas={[]}
        seleccionando={null}
        error=""
        onSeleccionar={() => {}}
        onVolver={() => navigate(-1)}
        textoVolver="Volver al panel"
      />
    );
  }

  return (
    <SeleccionEmpresaView
      cuentas={cuentas}
      seleccionando={seleccionando}
      error={error}
      onSeleccionar={seleccionarEmpresa}
      onVolver={() => navigate(-1)}
      textoVolver="Volver al panel"
      currentCompanyUserId={company?.company_user_id}
    />
  );
}
