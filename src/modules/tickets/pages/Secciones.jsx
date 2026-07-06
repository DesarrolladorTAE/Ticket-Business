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
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

const headCell = {
  fontWeight: 800,
  color: "#334155",
};

function Secciones() {
  const [sistemas, setSistemas] = useState([]);
  const [secciones, setSecciones] = useState([]);

  const [formulario, setFormulario] = useState({
    nombre: "",
    system_id: "",
  });

  const [modoEdicion, setModoEdicion] = useState(false);
  const [seccionEditandoId, setSeccionEditandoId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  useEffect(() => {
    obtenerDatos();
  }, []);

  const normalizar = (res) => res?.data?.data || res?.data || [];

  const obtenerDatos = async () => {
    try {
      setLoading(true);
      setError("");

      const [resSistemas, resSecciones] = await Promise.all([
        axiosCliente.get("/systems"),
        axiosCliente.get("/ticket-categories"),
      ]);

      const sistemasActivos = normalizar(resSistemas)
        .filter((sistema) => Number(sistema.estado) === 1)
        .sort((a, b) => Number(a.orden || 999) - Number(b.orden || 999));

      setSistemas(sistemasActivos);

      setSecciones(
        normalizar(resSecciones)
          .filter((seccion) => Number(seccion.estado) === 1)
          .filter((seccion) =>
            sistemasActivos.some(
              (sistema) => String(sistema.id) === String(seccion.system_id),
            ),
          ),
      );
    } catch (err) {
      console.error("ERROR SECCIONES:", err.response?.data || err);
      setError("No se pudieron cargar las secciones.");
    } finally {
      setLoading(false);
    }
  };

  const cambiarValor = (e) => {
    setFormulario((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const limpiarFormulario = () => {
    setFormulario({
      nombre: "",
      system_id: "",
    });

    setModoEdicion(false);
    setSeccionEditandoId(null);
    setError("");
    setOk("");
  };

  const guardarSeccion = async (e) => {
    e.preventDefault();

    setError("");
    setOk("");
    setCargando(true);

    try {
      const payload = {
        nombre: formulario.nombre.trim(),
        system_id: formulario.system_id,
        estado: 1,
      };

      if (modoEdicion && seccionEditandoId) {
        await axiosCliente.put(`/ticket-categories/${seccionEditandoId}`, payload);

        setOk("Sección actualizada correctamente.");
      } else {
        await axiosCliente.post("/ticket-categories", payload);

        setOk("Sección creada correctamente.");
      }

      limpiarFormulario();
      obtenerDatos();
    } catch (err) {
      console.error("ERROR GUARDAR SECCIÓN:", err.response?.data || err);

      const errores = err.response?.data?.errors;

      if (errores) {
        setError(Object.values(errores).flat().join(" "));
      } else {
        setError(
          err.response?.data?.message ||
            "No se pudo guardar la sección.",
        );
      }
    } finally {
      setCargando(false);
    }
  };

  const prepararEdicion = (seccion) => {
    setModoEdicion(true);
    setSeccionEditandoId(seccion.id);
    setError("");
    setOk("");

    setFormulario({
      nombre: seccion.nombre || "",
      system_id: seccion.system_id || "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const eliminarSeccion = async (id) => {
    const confirmar = window.confirm(
      "¿Seguro que deseas eliminar esta sección?",
    );

    if (!confirmar) return;

    try {
      setError("");
      setOk("");

      await axiosCliente.delete(`/ticket-categories/${id}`);

      setOk("Sección eliminada correctamente.");
      obtenerDatos();
    } catch (err) {
      console.error("ERROR ELIMINAR SECCIÓN:", err.response?.data || err);

      setError(
        err.response?.data?.message ||
          "No se pudo eliminar la sección.",
      );
    }
  };

  const obtenerNombreSistema = (systemId) => {
    const sistema = sistemas.find(
      (item) => String(item.id) === String(systemId),
    );

    return sistema?.nombre ?? "Sin sistema";
  };

  const obtenerPrefijoSistema = (systemId) => {
    const sistema = sistemas.find(
      (item) => String(item.id) === String(systemId),
    );

    return sistema?.prefijo ?? "TCK";
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
          Secciones
        </Typography>

        <Typography variant="body2" color="text.secondary">
          Administra las secciones disponibles para cada sistema.
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
          {modoEdicion ? "Editar sección" : "Crear sección"}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {ok && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {ok}
          </Alert>
        )}

        <Box component="form" onSubmit={guardarSeccion}>
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
                disabled={cargando}
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
                label="Nombre de la sección"
                name="nombre"
                value={formulario.nombre}
                onChange={cambiarValor}
                required
                disabled={cargando}
              />
            </Grid>
          </Grid>

          <Box
            mt={3}
            display="flex"
            justifyContent="flex-end"
            gap={1}
            flexWrap="wrap"
          >
            {modoEdicion && (
              <Button
                type="button"
                variant="outlined"
                onClick={limpiarFormulario}
                disabled={cargando}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 700,
                  px: 3,
                }}
              >
                Cancelar edición
              </Button>
            )}

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
              {cargando
                ? modoEdicion
                  ? "Guardando..."
                  : "Creando..."
                : modoEdicion
                  ? "Guardar cambios"
                  : "Crear sección"}
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
          <Typography fontWeight={800}>Secciones registradas</Typography>

          <Typography variant="body2" color="text.secondary">
            Listado de secciones disponibles por sistema.
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
            <TableHead sx={{ bgcolor: "#f8fafc" }}>
              <TableRow>
                <TableCell sx={headCell}>Sistema</TableCell>
                <TableCell sx={headCell}>Sección</TableCell>
                <TableCell sx={headCell}>Prefijo</TableCell>
                <TableCell sx={headCell}>Estado</TableCell>
                <TableCell sx={headCell} align="right">
                  Acciones
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {secciones.map((seccion) => (
                <TableRow key={seccion.id} hover>
                  <TableCell>
                    {obtenerNombreSistema(seccion.system_id)}
                  </TableCell>

                  <TableCell>
                    <Typography fontWeight={700}>
                      {seccion.nombre}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Chip
                      size="small"
                      label={obtenerPrefijoSistema(seccion.system_id)}
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
                        Number(seccion.estado) === 1 ? "Activo" : "Inactivo"
                      }
                      color={
                        Number(seccion.estado) === 1 ? "success" : "default"
                      }
                    />
                  </TableCell>

                  <TableCell align="right">
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={1}
                      justifyContent="flex-end"
                    >
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => prepararEdicion(seccion)}
                        sx={{
                          borderRadius: 2,
                          textTransform: "none",
                          fontWeight: 700,
                        }}
                      >
                        Editar
                      </Button>

                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => eliminarSeccion(seccion.id)}
                        sx={{
                          borderRadius: 2,
                          textTransform: "none",
                          fontWeight: 700,
                        }}
                      >
                        Eliminar
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}

              {secciones.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Box
                      sx={{
                        py: 4,
                        textAlign: "center",
                        color: "text.secondary",
                      }}
                    >
                      No hay secciones registradas.
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}

export default Secciones;