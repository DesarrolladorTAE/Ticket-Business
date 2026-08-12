import { useEffect, useMemo, useState } from "react";

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  IconButton,
  Paper,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";

import axiosCliente from "../../../services/axiosCliente";

function Etiquetas() {
  const [etiquetas, setEtiquetas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [actualizandoId, setActualizandoId] = useState(null);
  const [eliminandoId, setEliminandoId] = useState(null);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const [openModal, setOpenModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [etiquetaSeleccionada, setEtiquetaSeleccionada] = useState(null);
  const [nombre, setNombre] = useState("");
  const [estado, setEstado] = useState(true);

  const [openEliminar, setOpenEliminar] = useState(false);
  const [etiquetaAEliminar, setEtiquetaAEliminar] = useState(null);

  useEffect(() => {
    cargarEtiquetas();
  }, []);

  const cargarEtiquetas = async () => {
    setLoading(true);

    try {
      setError("");
      const { data } = await axiosCliente.get("/ticket-tags");
      setEtiquetas(data?.data || []);
    } catch (error) {
      console.error("ERROR CARGAR ETIQUETAS:", error.response?.data || error);
      setError(
        error.response?.data?.message || "No se pudieron cargar las etiquetas.",
      );
    } finally {
      setLoading(false);
    }
  };

  const etiquetasOrdenadas = useMemo(() => {
    return [...etiquetas].sort((a, b) =>
      String(a.nombre || "").localeCompare(String(b.nombre || ""), "es"),
    );
  }, [etiquetas]);

  const abrirCrear = () => {
    setModoEdicion(false);
    setEtiquetaSeleccionada(null);
    setNombre("");
    setEstado(true);
    setError("");
    setMensaje("");
    setOpenModal(true);
  };

  const abrirEditar = (etiqueta) => {
    setModoEdicion(true);
    setEtiquetaSeleccionada(etiqueta);
    setNombre(etiqueta?.nombre || "");
    setEstado(Boolean(etiqueta?.estado));
    setError("");
    setMensaje("");
    setOpenModal(true);
  };

  const cerrarModal = () => {
    if (guardando) return;

    setOpenModal(false);
    setModoEdicion(false);
    setEtiquetaSeleccionada(null);
    setNombre("");
    setEstado(true);
    setError("");
  };

  const obtenerMensajeError = (error) => {
    const errores = error.response?.data?.errors;

    if (errores?.nombre?.length) {
      const primerMensaje = String(errores.nombre[0] || "");

      if (primerMensaje.toLowerCase().includes("already been taken")) {
        return "Ya existe una etiqueta con ese nombre.";
      }

      return primerMensaje;
    }

    return error.response?.data?.message || "No se pudo guardar la etiqueta.";
  };

  const guardarEtiqueta = async () => {
    const nombreLimpio = nombre.trim();

    if (!nombreLimpio) {
      setError("Escribe el nombre de la etiqueta.");
      return;
    }

    setGuardando(true);
    setError("");
    setMensaje("");

    try {
      if (modoEdicion && etiquetaSeleccionada?.id) {
        await axiosCliente.put(`/ticket-tags/${etiquetaSeleccionada.id}`, {
          nombre: nombreLimpio,
          estado,
        });

        setMensaje("Etiqueta actualizada correctamente.");
      } else {
        await axiosCliente.post("/ticket-tags", {
          nombre: nombreLimpio,
          estado,
        });

        setMensaje("Etiqueta creada correctamente.");
      }

      setOpenModal(false);
      setModoEdicion(false);
      setEtiquetaSeleccionada(null);
      setNombre("");
      setEstado(true);

      await cargarEtiquetas();
    } catch (error) {
      console.error("ERROR GUARDAR ETIQUETA:", error.response?.data || error);
      setError(obtenerMensajeError(error));
    } finally {
      setGuardando(false);
    }
  };

  const abrirEliminar = (etiqueta) => {
    if (!etiqueta?.id) return;

    setEtiquetaAEliminar(etiqueta);
    setError("");
    setMensaje("");
    setOpenEliminar(true);
  };

  const cerrarEliminar = () => {
    if (eliminandoId) return;

    setOpenEliminar(false);
    setEtiquetaAEliminar(null);
    setError("");
  };

  const eliminarEtiqueta = async () => {
    if (!etiquetaAEliminar?.id || eliminandoId) return;

    setEliminandoId(etiquetaAEliminar.id);
    setError("");
    setMensaje("");

    try {
      const { data } = await axiosCliente.delete(
        `/ticket-tags/${etiquetaAEliminar.id}`,
      );

      const asociacionesEliminadas = Number(
        data?.data?.deleted_assignments || 0,
      );

      setMensaje(
        asociacionesEliminadas > 0
          ? `Etiqueta eliminada correctamente. Se retiró de ${asociacionesEliminadas} ticket${
              asociacionesEliminadas === 1 ? "" : "s"
            }.`
          : "Etiqueta eliminada correctamente.",
      );

      setOpenEliminar(false);
      setEtiquetaAEliminar(null);

      await cargarEtiquetas();
    } catch (error) {
      console.error(
        "ERROR ELIMINAR ETIQUETA:",
        error.response?.data || error,
      );

      setError(
        error.response?.data?.message ||
          "No se pudo eliminar la etiqueta.",
      );
    } finally {
      setEliminandoId(null);
    }
  };

  const cambiarEstado = async (etiqueta) => {
    if (!etiqueta?.id || actualizandoId === etiqueta.id) return;

    setActualizandoId(etiqueta.id);
    setError("");
    setMensaje("");

    try {
      await axiosCliente.put(`/ticket-tags/${etiqueta.id}`, {
        estado: !Boolean(etiqueta.estado),
      });

      setMensaje(
        etiqueta.estado
          ? "Etiqueta desactivada correctamente."
          : "Etiqueta activada correctamente.",
      );

      await cargarEtiquetas();
    } catch (error) {
      console.error(
        "ERROR CAMBIAR ESTADO ETIQUETA:",
        error.response?.data || error,
      );

      setError(
        error.response?.data?.message ||
          "No se pudo cambiar el estado de la etiqueta.",
      );
    } finally {
      setActualizandoId(null);
    }
  };

  return (
    <Box>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "center" }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <LocalOfferIcon color="primary" />

            <Typography
              variant="h5"
              fontWeight={900}
              sx={{ fontSize: { xs: 22, md: 26 } }}
            >
              Etiquetas
            </Typography>
          </Stack>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Crea y administra las etiquetas disponibles para clasificar tickets.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={abrirCrear}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 800,
            width: { xs: "100%", sm: "auto" },
          }}
        >
          Nueva etiqueta
        </Button>
      </Stack>

      {error && !openModal && !openEliminar && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {mensaje && !openModal && !openEliminar && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMensaje("")}>
          {mensaje}
        </Alert>
      )}

      <Paper
        sx={{
          borderRadius: 3,
          border: "1px solid #e5e7eb",
          boxShadow: 1,
          overflow: "hidden",
        }}
      >
        <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
          <Typography fontWeight={900}>Etiquetas registradas</Typography>

          <Typography variant="body2" color="text.secondary">
            Puedes desactivar una etiqueta para conservarla o eliminarla definitivamente.
          </Typography>
        </Box>

        <Divider />

        {loading ? (
          <Box
            sx={{
              minHeight: 220,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CircularProgress />
          </Box>
        ) : etiquetasOrdenadas.length === 0 ? (
          <Box
            sx={{
              minHeight: 220,
              px: 2,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              bgcolor: "#f8fafc",
            }}
          >
            <LocalOfferIcon sx={{ fontSize: 42, color: "text.disabled", mb: 1 }} />

            <Typography fontWeight={900}>Todavía no hay etiquetas</Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Crea la primera etiqueta para comenzar a clasificar tickets.
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer sx={{ display: { xs: "none", md: "block" } }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={headCell}>Nombre</TableCell>
                    <TableCell sx={{ ...headCell, width: 150 }}>Estado</TableCell>
                    <TableCell align="right" sx={{ ...headCell, width: 190 }}>
                      Acciones
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {etiquetasOrdenadas.map((etiqueta) => (
                    <TableRow key={etiqueta.id} hover>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <LocalOfferIcon
                            fontSize="small"
                            color={etiqueta.estado ? "primary" : "disabled"}
                          />

                          <Typography fontWeight={800}>{etiqueta.nombre}</Typography>
                        </Stack>
                      </TableCell>

                      <TableCell>
                        <Chip
                          size="small"
                          label={etiqueta.estado ? "Activa" : "Inactiva"}
                          color={etiqueta.estado ? "success" : "default"}
                          sx={{ fontWeight: 800 }}
                        />
                      </TableCell>

                      <TableCell align="right">
                        <Stack
                          direction="row"
                          spacing={0.5}
                          justifyContent="flex-end"
                          alignItems="center"
                        >
                          <Tooltip title="Editar etiqueta">
                            <IconButton
                              size="small"
                              onClick={() => abrirEditar(etiqueta)}
                              disabled={eliminandoId === etiqueta.id}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Eliminar etiqueta">
                            <span>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => abrirEliminar(etiqueta)}
                                disabled={
                                  actualizandoId === etiqueta.id ||
                                  eliminandoId === etiqueta.id
                                }
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>

                          <Tooltip
                            title={
                              etiqueta.estado
                                ? "Desactivar etiqueta"
                                : "Activar etiqueta"
                            }
                          >
                            <span>
                              <Switch
                                size="small"
                                checked={Boolean(etiqueta.estado)}
                                disabled={
                                  actualizandoId === etiqueta.id ||
                                  eliminandoId === etiqueta.id
                                }
                                onChange={() => cambiarEstado(etiqueta)}
                              />
                            </span>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Stack
              spacing={1.2}
              sx={{
                display: { xs: "flex", md: "none" },
                p: 1.5,
                bgcolor: "#f8fafc",
              }}
            >
              {etiquetasOrdenadas.map((etiqueta) => (
                <Paper
                  key={etiqueta.id}
                  variant="outlined"
                  sx={{ p: 1.5, borderRadius: 2.5, bgcolor: "#ffffff" }}
                >
                  <Stack spacing={1.2}>
                    <Stack
                      direction="row"
                      alignItems="flex-start"
                      justifyContent="space-between"
                      spacing={1}
                    >
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        sx={{ minWidth: 0 }}
                      >
                        <LocalOfferIcon
                          fontSize="small"
                          color={etiqueta.estado ? "primary" : "disabled"}
                        />

                        <Typography fontWeight={900} sx={{ wordBreak: "break-word" }}>
                          {etiqueta.nombre}
                        </Typography>
                      </Stack>

                      <Chip
                        size="small"
                        label={etiqueta.estado ? "Activa" : "Inactiva"}
                        color={etiqueta.estado ? "success" : "default"}
                        sx={{ fontWeight: 800, flexShrink: 0 }}
                      />
                    </Stack>

                    <Divider />

                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      justifyContent="space-between"
                      alignItems={{ xs: "stretch", sm: "center" }}
                      spacing={1}
                    >
                      <Stack direction="row" spacing={0.5}>
                        <Button
                          size="small"
                          startIcon={<EditIcon />}
                          onClick={() => abrirEditar(etiqueta)}
                          disabled={eliminandoId === etiqueta.id}
                          sx={{ textTransform: "none", fontWeight: 800 }}
                        >
                          Editar
                        </Button>

                        <Button
                          size="small"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={() => abrirEliminar(etiqueta)}
                          disabled={
                            actualizandoId === etiqueta.id ||
                            eliminandoId === etiqueta.id
                          }
                          sx={{ textTransform: "none", fontWeight: 800 }}
                        >
                          Eliminar
                        </Button>
                      </Stack>

                      <FormControlLabel
                        control={
                          <Switch
                            checked={Boolean(etiqueta.estado)}
                            disabled={
                              actualizandoId === etiqueta.id ||
                              eliminandoId === etiqueta.id
                            }
                            onChange={() => cambiarEstado(etiqueta)}
                          />
                        }
                        label={etiqueta.estado ? "Activa" : "Inactiva"}
                        sx={{
                          m: 0,
                          "& .MuiFormControlLabel-label": {
                            fontSize: 13,
                            fontWeight: 700,
                          },
                        }}
                      />
                    </Stack>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          </>
        )}
      </Paper>

      <Dialog
        open={openModal}
        onClose={cerrarModal}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 900 }}>
          {modoEdicion ? "Editar etiqueta" : "Nueva etiqueta"}
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}

            <TextField
              autoFocus
              fullWidth
              label="Nombre"
              value={nombre}
              onChange={(event) => setNombre(event.target.value)}
              inputProps={{ maxLength: 100 }}
              helperText={`${nombre.length}/100`}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={estado}
                  onChange={(event) => setEstado(event.target.checked)}
                />
              }
              label={estado ? "Etiqueta activa" : "Etiqueta inactiva"}
            />

            <Typography variant="caption" color="text.secondary">
              Las etiquetas inactivas no estarán disponibles para nuevas
              asignaciones, pero se conservan en los tickets donde ya se hayan
              utilizado.
            </Typography>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            onClick={cerrarModal}
            disabled={guardando}
            sx={{ textTransform: "none", fontWeight: 800 }}
          >
            Cancelar
          </Button>

          <Button
            variant="contained"
            onClick={guardarEtiqueta}
            disabled={guardando || !nombre.trim()}
            sx={{ textTransform: "none", fontWeight: 800 }}
          >
            {guardando
              ? "Guardando..."
              : modoEdicion
                ? "Guardar cambios"
                : "Crear etiqueta"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openEliminar}
        onClose={cerrarEliminar}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 900 }}>
          Eliminar etiqueta
        </DialogTitle>

        <DialogContent>
          <Stack spacing={1.5} sx={{ pt: 0.5 }}>
            {error && <Alert severity="error">{error}</Alert>}

            <Typography>
              ¿Seguro que deseas eliminar la etiqueta{" "}
              <strong>{etiquetaAEliminar?.nombre || ""}</strong>?
            </Typography>

            <Alert severity="warning">
              La etiqueta se eliminará definitivamente. Si está asignada a
              tickets, únicamente se retirará de esos tickets; los tickets no
              serán eliminados.
            </Alert>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            onClick={cerrarEliminar}
            disabled={Boolean(eliminandoId)}
            sx={{ textTransform: "none", fontWeight: 800 }}
          >
            Cancelar
          </Button>

          <Button
            variant="contained"
            color="error"
            onClick={eliminarEtiqueta}
            disabled={Boolean(eliminandoId)}
            startIcon={<DeleteIcon />}
            sx={{ textTransform: "none", fontWeight: 800 }}
          >
            {eliminandoId ? "Eliminando..." : "Eliminar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

const headCell = {
  bgcolor: "#f8fafc",
  color: "#334155",
  fontWeight: 900,
  borderBottom: "1px solid #e5e7eb",
};

export default Etiquetas;