import { useEffect, useState } from "react";
import axiosCliente from "../../../services/axiosCliente";

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Grid,
  MenuItem,
  Paper,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

function Problemas() {
  const [sistemas, setSistemas] = useState([]);
  const [problemas, setProblemas] = useState([]);

  const [formulario, setFormulario] = useState({
    nombre: "",
    system_id: "",
  });

  const [loading, setLoading] = useState(true);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    obtenerDatos();
  }, []);

  const normalizar = (res) => res?.data?.data || res?.data || [];

  const obtenerDatos = async () => {
    try {
      setError("");

      const [resSistemas, resProblemas] = await Promise.all([
        axiosCliente.get("/systems"),
        axiosCliente.get("/ticket-categories"),
      ]);

      const sistemasActivos = normalizar(resSistemas)
        .filter((sistema) => Number(sistema.estado) === 1)
        .sort((a, b) => Number(a.orden || 999) - Number(b.orden || 999));

      setSistemas(sistemasActivos);

      setProblemas(
        normalizar(resProblemas)
          .filter((problema) => Number(problema.estado) === 1)
          .filter((problema) =>
            sistemasActivos.some(
              (sistema) => String(sistema.id) === String(problema.system_id),
            ),
          ),
      );
    } catch (error) {
      console.log("ERROR PROBLEMAS:", error.response?.data || error);
      setError("No se pudieron cargar los tipos de problema");
    } finally {
      setLoading(false);
    }
  };

  const cambiarValor = (e) => {
    setFormulario({
      ...formulario,
      [e.target.name]: e.target.value,
    });
  };

  const crearProblema = async (e) => {
    e.preventDefault();

    setError("");
    setCargando(true);

    try {
      await axiosCliente.post("/ticket-categories", {
        nombre: formulario.nombre,
        system_id: formulario.system_id,
        estado: 1,
      });

      setFormulario({
        nombre: "",
        system_id: "",
      });

      obtenerDatos();
    } catch (error) {
      console.log("ERROR CREAR PROBLEMA:", error.response?.data || error);

      const errores = error.response?.data?.errors;

      if (errores) {
        setError(Object.values(errores).flat().join(" "));
      } else {
        setError(
          error.response?.data?.message ||
            "No se pudo crear el tipo de problema",
        );
      }
    } finally {
      setCargando(false);
    }
  };

  const eliminarProblema = async (id) => {
    const confirmar = window.confirm(
      "¿Seguro que deseas eliminar este tipo de problema?",
    );

    if (!confirmar) return;

    try {
      setError("");
      await axiosCliente.delete(`/ticket-categories/${id}`);
      obtenerDatos();
    } catch (error) {
      console.log("ERROR ELIMINAR PROBLEMA:", error.response?.data || error);
      setError(
        error.response?.data?.message ||
          "No se pudo eliminar el tipo de problema",
      );
    }
  };

  const obtenerNombreSistema = (systemId) => {
    const sistema = sistemas.find(
      (item) => String(item.id) === String(systemId),
    );

    return sistema?.nombre || `Sistema ID: ${systemId}`;
  };

  const obtenerPrefijoSistema = (systemId) => {
    const sistema = sistemas.find(
      (item) => String(item.id) === String(systemId),
    );

    return sistema?.prefijo || "TCK";
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={6}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box mb={3}>
        <Typography variant="h5" fontWeight={800}>
          Tipos de problema
        </Typography>

        <Typography variant="body2" color="text.secondary">
          Administra las categorías de incidencias relacionadas con cada
          sistema.
        </Typography>
      </Box>

      <Paper
        sx={{
          p: { xs: 2, md: 3 },
          borderRadius: 3,
          boxShadow: 1,
          border: "1px solid #e5e7eb",
          mb: 4,
        }}
      >
        <Typography fontWeight={800} mb={2}>
          Crear tipo de problema
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={crearProblema}>
          <Grid container spacing={2.5}>
            <Grid item xs={12} md={5}>
              <TextField
                select
                fullWidth
                label="Sistema"
                name="system_id"
                value={formulario.system_id}
                onChange={cambiarValor}
                required
              >
                {sistemas.map((sistema) => (
                  <MenuItem key={sistema.id} value={sistema.id}>
                    {sistema.nombre}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={7}>
              <TextField
                fullWidth
                label="Tipo de problema"
                name="nombre"
                value={formulario.nombre}
                onChange={cambiarValor}
                required
              />
            </Grid>
          </Grid>

          <Box mt={3} display="flex" justifyContent="flex-end">
            <Button
              type="submit"
              variant="contained"
              disabled={cargando}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 700,
                px: 3,
              }}
            >
              {cargando ? "Creando..." : "Crear problema"}
            </Button>
          </Box>
        </Box>
      </Paper>

      <Paper
        sx={{
          p: { xs: 2, md: 3 },
          borderRadius: 3,
          boxShadow: 1,
          border: "1px solid #e5e7eb",
        }}
      >
        <Box mb={2}>
          <Typography fontWeight={800}>Problemas registrados</Typography>

          <Typography variant="body2" color="text.secondary">
            Listado de categorías disponibles por sistema.
          </Typography>
        </Box>

        <TableContainer
          sx={{
            border: "1px solid #e5e7eb",
            borderRadius: 2,
            overflowX: "auto",
          }}
        >
          <Table size="small">
            <TableHead
              sx={{
                bgcolor: "#f8fafc",
              }}
            >
              <TableRow>
                <TableCell sx={headCell}>Sistema</TableCell>

                <TableCell sx={headCell}>Tipo de problema</TableCell>

                <TableCell sx={headCell}>Prefijo</TableCell>

                <TableCell sx={headCell}>Estado</TableCell>

                <TableCell sx={headCell} align="right">
                  Acción
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {problemas.map((problema) => (
                <TableRow key={problema.id} hover>
                  <TableCell>
                    {obtenerNombreSistema(problema.system_id)}
                  </TableCell>

                  <TableCell>
                    <Typography fontWeight={700}>{problema.nombre}</Typography>
                  </TableCell>

                  <TableCell>
                    <Chip
                      size="small"
                      label={obtenerPrefijoSistema(problema.system_id)}
                      sx={{
                        fontWeight: 800,
                        borderRadius: 2,
                        bgcolor: "#eff6ff",
                        color: "#1d4ed8",
                      }}
                    />
                  </TableCell>

                  <TableCell>
                    <Chip
                      size="small"
                      label={
                        Number(problema.estado) === 1 ? "Activo" : "Inactivo"
                      }
                      color={
                        Number(problema.estado) === 1 ? "success" : "default"
                      }
                    />
                  </TableCell>

                  <TableCell align="right">
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => eliminarProblema(problema.id)}
                      sx={{
                        borderRadius: 2,
                        textTransform: "none",
                        fontWeight: 700,
                      }}
                    >
                      Eliminar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
const headCell = {
  fontWeight: 800,
  color: "#334155",
};

export default Problemas;
