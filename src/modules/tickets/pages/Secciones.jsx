import { useEffect, useState } from "react";
import axiosCliente from "../../../services/axiosCliente";

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
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
  fontWeight: 900,
  color: "#334155",
  whiteSpace: "nowrap",
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
        await axiosCliente.put(
          `/ticket-categories/${seccionEditandoId}`,
          payload,
        );

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
          err.response?.data?.message || "No se pudo guardar la sección.",
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
        err.response?.data?.message || "No se pudo eliminar la sección.",
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

  const EstadoChip = ({ estado }) => (
    <Chip
      size="small"
      label={Number(estado) === 1 ? "Activo" : "Inactivo"}
      color={Number(estado) === 1 ? "success" : "default"}
      sx={{
        fontWeight: 800,
        borderRadius: 2,
      }}
    />
  );

  const PrefijoChip = ({ systemId }) => (
    <Chip
      size="small"
      label={obtenerPrefijoSistema(systemId)}
      sx={{
        fontWeight: 900,
        borderRadius: 2,
        bgcolor: "#eff6ff",
        color: "#1d4ed8",
      }}
    />
  );

  const AccionesSeccion = ({ seccion, mobile = false }) => (
    <Stack
      direction={mobile ? "column" : "row"}
      spacing={1}
      justifyContent="flex-end"
      alignItems={mobile ? "stretch" : "center"}
    >
      <Button
        variant="outlined"
        size="small"
        onClick={() => prepararEdicion(seccion)}
        fullWidth={mobile}
        sx={{
          borderRadius: 2,
          textTransform: "none",
          fontWeight: 800,
        }}
      >
        Editar
      </Button>

      <Button
        variant="outlined"
        color="error"
        size="small"
        onClick={() => eliminarSeccion(seccion.id)}
        fullWidth={mobile}
        sx={{
          borderRadius: 2,
          textTransform: "none",
          fontWeight: 800,
        }}
      >
        Eliminar
      </Button>
    </Stack>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={6}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box
        mb={3}
        display="flex"
        flexDirection={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "center" }}
        gap={1.5}
      >
        <Box>
          <Typography
            variant="h5"
            fontWeight={900}
            sx={{ fontSize: { xs: 22, md: 26 } }}
          >
            Secciones
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Administra las secciones disponibles para cada sistema.
          </Typography>
        </Box>

        <Chip
          label={`${secciones.length} secciones`}
          color="primary"
          variant="outlined"
          sx={{
            fontWeight: 800,
            width: { xs: "fit-content", sm: "auto" },
          }}
        />
      </Box>

      <Paper
        sx={{
          p: { xs: 1.5, sm: 2, md: 3 },
          borderRadius: 3,
          boxShadow: 1,
          border: "1px solid #e5e7eb",
          mb: 4,
        }}
      >
        <Box mb={2}>
          <Typography fontWeight={900} sx={{ fontSize: { xs: 18, md: 20 } }}>
            {modoEdicion ? "Editar sección" : "Crear sección"}
          </Typography>

          <Typography variant="body2" color="text.secondary">
            {modoEdicion
              ? "Modifica el sistema o nombre de la sección seleccionada."
              : "Agrega una nueva sección para clasificar los tickets de un sistema."}
          </Typography>
        </Box>

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
          <Grid container spacing={2}>
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
                size="small"
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
                size="small"
              />
            </Grid>
          </Grid>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            mt={3}
            justifyContent="flex-end"
            alignItems={{ xs: "stretch", sm: "center" }}
          >
            {modoEdicion && (
              <Button
                type="button"
                variant="outlined"
                onClick={limpiarFormulario}
                disabled={cargando}
                fullWidth
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 800,
                  px: 3,
                  maxWidth: { xs: "100%", sm: 180 },
                }}
              >
                Cancelar edición
              </Button>
            )}

            <Button
              type="submit"
              variant="contained"
              disabled={cargando}
              fullWidth
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 800,
                px: 3,
                maxWidth: { xs: "100%", sm: 190 },
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
          </Stack>
        </Box>
      </Paper>

      <Paper
        sx={{
          p: { xs: 1.5, sm: 2, md: 3 },
          borderRadius: 3,
          boxShadow: 1,
          border: "1px solid #e5e7eb",
        }}
      >
        <Box mb={2}>
          <Typography fontWeight={900} sx={{ fontSize: { xs: 18, md: 20 } }}>
            Secciones registradas
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Listado de secciones disponibles por sistema.
          </Typography>
        </Box>

        {secciones.length === 0 ? (
          <Box
            sx={{
              py: 5,
              textAlign: "center",
              border: "1px dashed #cbd5e1",
              borderRadius: 3,
              bgcolor: "#f8fafc",
              color: "text.secondary",
            }}
          >
            <Typography fontWeight={800}>No hay secciones registradas.</Typography>
            <Typography variant="body2" mt={0.5}>
              Crea una sección para comenzar.
            </Typography>
          </Box>
        ) : (
          <>
            {/* Escritorio */}
            <TableContainer
              sx={{
                display: { xs: "none", md: "block" },
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
                        <Typography fontWeight={700}>
                          {obtenerNombreSistema(seccion.system_id)}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography fontWeight={800}>
                          {seccion.nombre}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <PrefijoChip systemId={seccion.system_id} />
                      </TableCell>

                      <TableCell>
                        <EstadoChip estado={seccion.estado} />
                      </TableCell>

                      <TableCell align="right">
                        <AccionesSeccion seccion={seccion} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Móvil */}
            <Stack
              spacing={1.5}
              sx={{
                display: { xs: "flex", md: "none" },
              }}
            >
              {secciones.map((seccion) => (
                <Paper
                  key={seccion.id}
                  variant="outlined"
                  sx={{
                    p: 1.5,
                    borderRadius: 3,
                    borderColor: "#e5e7eb",
                    bgcolor: "#ffffff",
                  }}
                >
                  <Stack spacing={1.4}>
                    <Stack
                      direction="row"
                      spacing={1}
                      justifyContent="space-between"
                      alignItems="flex-start"
                    >
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          fontWeight={800}
                          display="block"
                        >
                          Sección
                        </Typography>

                        <Typography
                          fontWeight={900}
                          sx={{
                            fontSize: 16,
                            lineHeight: 1.3,
                            wordBreak: "break-word",
                          }}
                        >
                          {seccion.nombre}
                        </Typography>
                      </Box>

                      <EstadoChip estado={seccion.estado} />
                    </Stack>

                    <Divider />

                    <Grid container spacing={1.2}>
                      <Grid item xs={12}>
                        <InfoItem
                          label="Sistema"
                          value={obtenerNombreSistema(seccion.system_id)}
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          fontWeight={800}
                          display="block"
                        >
                          Prefijo
                        </Typography>

                        <Box mt={0.5}>
                          <PrefijoChip systemId={seccion.system_id} />
                        </Box>
                      </Grid>
                    </Grid>

                    <AccionesSeccion seccion={seccion} mobile />
                  </Stack>
                </Paper>
              ))}
            </Stack>
          </>
        )}
      </Paper>
    </Box>
  );
}

function InfoItem({ label, value }) {
  return (
    <Box>
      <Typography
        variant="caption"
        color="text.secondary"
        fontWeight={800}
        display="block"
      >
        {label}
      </Typography>

      <Typography
        variant="body2"
        fontWeight={800}
        sx={{
          wordBreak: "break-word",
          lineHeight: 1.35,
        }}
      >
        {value || "-"}
      </Typography>
    </Box>
  );
}

export default Secciones;