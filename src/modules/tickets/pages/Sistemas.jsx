import { Fragment, useEffect, useState } from "react";
import axiosCliente from "../../../services/axiosCliente";
import SystemPublicAccessPanel from "../components/SystemPublicAccessPanel";

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Paper,
  Stack,
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
import CloseIcon from "@mui/icons-material/Close";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ImageIcon from "@mui/icons-material/Image";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import DeleteIcon from "@mui/icons-material/Delete";

import Swal from "sweetalert2";

const API_ORIGIN = "https://api.thebusinessticket.com";

function Sistemas() {
  const [sistemas, setSistemas] = useState([]);

  const [formulario, setFormulario] = useState({
    nombre: "",
    descripcion: "",
    prefijo: "",
    logo: null,
  });

  const [previewLogo, setPreviewLogo] = useState(null);
  const [logoActualUrl, setLogoActualUrl] = useState(null);

  const [loading, setLoading] = useState(true);
  const [cargando, setCargando] = useState(false);
  const [eliminandoId, setEliminandoId] = useState(null);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoModal, setModoModal] = useState("crear");
  const [sistemaEditando, setSistemaEditando] = useState(null);

  const [categoriaExpandidaId, setCategoriaExpandidaId] = useState(null);

  const [error, setError] = useState("");
  const [errorModal, setErrorModal] = useState("");
  const [mensajeExito, setMensajeExito] = useState("");

  useEffect(() => {
    obtenerSistemas();
  }, []);

  const obtenerSistemas = async () => {
    try {
      setError("");

      const respuesta = await axiosCliente.get("/systems");

      setSistemas(
        (respuesta.data.data || respuesta.data || [])
          .filter((sistema) => Number(sistema.estado) === 1)
          .sort((a, b) => Number(a.orden || 999) - Number(b.orden || 999)),
      );
    } catch (error) {
      console.log("ERROR SISTEMAS:", error.response?.data || error);
      setError("No se pudieron cargar las categorías");
    } finally {
      setLoading(false);
    }
  };

  const obtenerLogoUrl = (logo) => {
    if (!logo) return null;

    if (logo.startsWith("http://") || logo.startsWith("https://")) {
      return logo;
    }

    if (logo.startsWith("storage/")) {
      return `${API_ORIGIN}/${logo}`;
    }

    if (logo.startsWith("systems/")) {
      return `${API_ORIGIN}/storage/${logo}`;
    }

    return `${API_ORIGIN}/${logo}`;
  };

  const liberarPreviewLocal = () => {
    if (previewLogo) {
      URL.revokeObjectURL(previewLogo);
    }
  };

  const limpiarFormulario = () => {
    liberarPreviewLocal();

    setFormulario({
      nombre: "",
      descripcion: "",
      prefijo: "",
      logo: null,
    });

    setPreviewLogo(null);
    setLogoActualUrl(null);
    setSistemaEditando(null);
    setErrorModal("");
  };

  const abrirModalCrear = () => {
    limpiarFormulario();

    setModoModal("crear");
    setModalAbierto(true);
    setMensajeExito("");
  };

  const abrirModalEditar = (sistema) => {
    limpiarFormulario();

    setModoModal("editar");
    setSistemaEditando(sistema);

    setFormulario({
      nombre: sistema.nombre || "",
      descripcion: sistema.descripcion || "",
      prefijo: sistema.prefijo || "",
      logo: null,
    });

    setLogoActualUrl(obtenerLogoUrl(sistema.logo_url || sistema.logo));
    setModalAbierto(true);
    setMensajeExito("");
  };

  const cerrarModal = () => {
    if (cargando) return;

    setModalAbierto(false);
    limpiarFormulario();
  };

  const cambiarValor = (e) => {
    setFormulario((actual) => ({
      ...actual,
      [e.target.name]: e.target.value,
    }));
  };

  const cambiarLogo = (e) => {
    const archivo = e.target.files?.[0];

    if (!archivo) return;

    liberarPreviewLocal();

    setFormulario((actual) => ({
      ...actual,
      logo: archivo,
    }));

    setPreviewLogo(URL.createObjectURL(archivo));

    e.target.value = "";
  };

  const quitarLogoSeleccionado = () => {
    liberarPreviewLocal();

    setFormulario((actual) => ({
      ...actual,
      logo: null,
    }));

    setPreviewLogo(null);
  };

  const obtenerErrores = (error, mensajePredeterminado) => {
    const errores = error.response?.data?.errors;

    if (errores) {
      return Object.values(errores).flat().join(" ");
    }

    return error.response?.data?.message || mensajePredeterminado;
  };

  const crearSistema = async () => {
    const formData = new FormData();

    formData.append("nombre", formulario.nombre);
    formData.append("descripcion", formulario.descripcion);
    formData.append("prefijo", formulario.prefijo.toUpperCase());
    formData.append("responsable_id", "");
    formData.append("estado", "1");

    if (formulario.logo) {
      formData.append("logo", formulario.logo);
    }

    await axiosCliente.post("/systems", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  };

  const actualizarSistema = async () => {
    if (!sistemaEditando?.id) {
      throw new Error("No se encontró la categoría que se desea editar.");
    }

    const formData = new FormData();

    formData.append("_method", "PUT");
    formData.append("nombre", formulario.nombre);
    formData.append("descripcion", formulario.descripcion);
    formData.append("prefijo", formulario.prefijo.toUpperCase());

    if (formulario.logo) {
      formData.append("logo", formulario.logo);
    }

    await axiosCliente.post(`/systems/${sistemaEditando.id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  };

  const guardarCategoria = async (e) => {
    e.preventDefault();

    if (cargando) return;

    setErrorModal("");
    setMensajeExito("");
    setCargando(true);

    try {
      if (modoModal === "editar") {
        await actualizarSistema();
      } else {
        await crearSistema();
      }

      const mensaje =
        modoModal === "editar"
          ? "Categoría actualizada correctamente."
          : "Categoría creada correctamente.";

      setModalAbierto(false);
      limpiarFormulario();

      await obtenerSistemas();

      setMensajeExito(mensaje);
    } catch (error) {
      console.log(
        modoModal === "editar"
          ? "ERROR ACTUALIZAR SISTEMA:"
          : "ERROR CREAR SISTEMA:",
        error.response?.data || error,
      );

      if (error instanceof Error && !error.response) {
        setErrorModal(
          error.message ||
            (modoModal === "editar"
              ? "No se pudo actualizar la categoría"
              : "No se pudo crear la categoría"),
        );
      } else {
        setErrorModal(
          obtenerErrores(
            error,
            modoModal === "editar"
              ? "No se pudo actualizar la categoría"
              : "No se pudo crear la categoría",
          ),
        );
      }
    } finally {
      setCargando(false);
    }
  };

  const eliminarCategoria = async (sistema) => {
    if (!sistema?.id || eliminandoId) return;

    const confirmacion = await Swal.fire({
      icon: "warning",
      title: "Eliminar categoría",
      html: `¿Seguro que deseas eliminar la categoría <strong>${sistema.nombre}</strong>?`,
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#dc2626",
      reverseButtons: true,
    });

    if (!confirmacion.isConfirmed) return;

    setEliminandoId(sistema.id);
    setError("");
    setMensajeExito("");

    try {
      const respuesta = await axiosCliente.delete(`/systems/${sistema.id}`);

      if (Number(categoriaExpandidaId) === Number(sistema.id)) {
        setCategoriaExpandidaId(null);
      }

      await obtenerSistemas();

      setMensajeExito(
        respuesta.data?.message || "Categoría eliminada correctamente.",
      );

      Swal.fire({
        icon: "success",
        title: "Categoría eliminada",
        text:
          respuesta.data?.message ||
          "La categoría fue eliminada correctamente.",
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (error) {
      console.log("ERROR ELIMINAR SISTEMA:", error.response?.data || error);

      const mensaje =
        error.response?.data?.message ||
        "No fue posible eliminar la categoría.";

      setError(mensaje);

      Swal.fire({
        icon: "error",
        title: "No se pudo eliminar",
        text: mensaje,
      });
    } finally {
      setEliminandoId(null);
    }
  };

  const toggleConfiguracion = (sistemaId) => {
    setCategoriaExpandidaId((actual) =>
      Number(actual) === Number(sistemaId) ? null : sistemaId,
    );
  };

  const imagenModal = previewLogo || logoActualUrl;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={6}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* ENCABEZADO */}
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
            Categorías
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Administra las categorías disponibles para clasificar tickets y
            configurar su portal público.
          </Typography>

          <Stack direction="row" spacing={1} mt={1.25}>
            <Chip
              label={`${sistemas.length} activas`}
              color="primary"
              variant="outlined"
              size="small"
              sx={{ fontWeight: 800 }}
            />
          </Stack>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={abrirModalCrear}
          sx={{
            minHeight: 42,
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 900,
            px: 2.25,
            boxShadow: "none",
            alignSelf: { xs: "stretch", sm: "center" },
          }}
        >
          Nueva categoría
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {mensajeExito && (
        <Alert
          severity="success"
          onClose={() => setMensajeExito("")}
          sx={{ mb: 2 }}
        >
          {mensajeExito}
        </Alert>
      )}

      {/* CATEGORÍAS REGISTRADAS */}
      <Box mb={2}>
        <Typography fontWeight={900} sx={{ fontSize: { xs: 18, md: 20 } }}>
          Categorías registradas
        </Typography>

        <Typography variant="body2" color="text.secondary">
          Consulta, edita, configura o elimina cada categoría.
        </Typography>
      </Box>

      {sistemas.length === 0 ? (
        <Paper
          sx={{
            p: 4,
            borderRadius: 3,
            border: "1px dashed #cbd5e1",
            textAlign: "center",
            bgcolor: "#f8fafc",
            boxShadow: "none",
          }}
        >
          <Typography fontWeight={800}>No hay categorías activas.</Typography>

          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Crea una categoría para comenzar.
          </Typography>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={abrirModalCrear}
            sx={{
              mt: 2,
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 900,
              boxShadow: "none",
            }}
          >
            Nueva categoría
          </Button>
        </Paper>
      ) : (
        <>
          {/* ESCRITORIO Y TABLET GRANDE: TABLA */}
          <Box sx={{ display: { xs: "none", md: "block" } }}>
            <TableContainer
              component={Paper}
              sx={{
                borderRadius: 3,
                border: "1px solid #e5e7eb",
                boxShadow: "none",
                overflowX: "auto",
              }}
            >
              <Table
                size="small"
                sx={{
                  minWidth: 900,
                  "& .MuiTableCell-root": {
                    borderColor: "#e5e7eb",
                  },
                }}
              >
                <TableHead>
                  <TableRow sx={{ bgcolor: "#f8fafc" }}>
                    <TableCell sx={{ fontWeight: 900, width: 78 }}>
                      Logo
                    </TableCell>

                    <TableCell sx={{ fontWeight: 900, minWidth: 180 }}>
                      Categoría
                    </TableCell>

                    <TableCell sx={{ fontWeight: 900, minWidth: 300 }}>
                      Descripción
                    </TableCell>

                    <TableCell sx={{ fontWeight: 900, width: 110 }}>
                      Prefijo
                    </TableCell>

                    <TableCell sx={{ fontWeight: 900, width: 110 }}>
                      Estado
                    </TableCell>

                    <TableCell
                      align="right"
                      sx={{ fontWeight: 900, width: 160 }}
                    >
                      Acciones
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {sistemas.map((sistema) => {
                    const logoUrl = obtenerLogoUrl(
                      sistema.logo_url || sistema.logo,
                    );

                    const expandida =
                      Number(categoriaExpandidaId) === Number(sistema.id);

                    const eliminando =
                      Number(eliminandoId) === Number(sistema.id);

                    return (
                      <Fragment key={`desktop-${sistema.id}`}>
                        <TableRow
                          hover
                          sx={{
                            "& > td": {
                              verticalAlign: "middle",
                            },
                          }}
                        >
                          <TableCell>
                            {logoUrl ? (
                              <Box
                                component="img"
                                src={logoUrl}
                                alt={sistema.nombre}
                                sx={{
                                  width: 42,
                                  height: 42,
                                  objectFit: "contain",
                                  borderRadius: 1.5,
                                  border: "1px solid #e5e7eb",
                                  bgcolor: "#ffffff",
                                  p: 0.4,
                                  display: "block",
                                }}
                              />
                            ) : (
                              <Box
                                sx={{
                                  width: 42,
                                  height: 42,
                                  borderRadius: 1.5,
                                  bgcolor: "#f1f5f9",
                                  border: "1px solid #e2e8f0",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <ImageIcon
                                  sx={{ color: "#64748b", fontSize: 20 }}
                                />
                              </Box>
                            )}
                          </TableCell>

                          <TableCell>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 900,
                                color: "#0f172a",
                              }}
                            >
                              {sistema.nombre}
                            </Typography>

                            <Typography
                              variant="caption"
                              color="text.secondary"
                              display="block"
                            >
                              ID: {sistema.id}
                            </Typography>
                          </TableCell>

                          <TableCell>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                lineHeight: 1.45,
                                maxWidth: 520,
                              }}
                            >
                              {sistema.descripcion || "Sin descripción"}
                            </Typography>
                          </TableCell>

                          <TableCell>
                            <Chip
                              label={sistema.prefijo || "TCK"}
                              size="small"
                              sx={{
                                fontWeight: 900,
                                borderRadius: 1.5,
                                bgcolor:
                                  sistema.color_secundario || "#eff6ff",
                                color: sistema.color || "#1d4ed8",
                              }}
                            />
                          </TableCell>

                          <TableCell>
                            <Chip
                              size="small"
                              label={
                                Number(sistema.estado) === 1
                                  ? "Activo"
                                  : "Inactivo"
                              }
                              color={
                                Number(sistema.estado) === 1
                                  ? "success"
                                  : "default"
                              }
                              sx={{ fontWeight: 800 }}
                            />
                          </TableCell>

                          <TableCell align="right">
                            <Stack
                              direction="row"
                              spacing={0.5}
                              justifyContent="flex-end"
                            >
                              <Tooltip title="Editar categoría" arrow>
                                <span>
                                  <IconButton
                                    size="small"
                                    onClick={() => abrirModalEditar(sistema)}
                                    disabled={eliminando}
                                    sx={{
                                      border: "1px solid #dbe2ea",
                                      borderRadius: 1.5,
                                      color: "#2563eb",
                                      bgcolor: "#ffffff",
                                      "&:hover": {
                                        bgcolor: "#eff6ff",
                                      },
                                    }}
                                  >
                                    <EditOutlinedIcon fontSize="small" />
                                  </IconButton>
                                </span>
                              </Tooltip>

                              <Tooltip
                                title={
                                  expandida
                                    ? "Ocultar configuración"
                                    : "Configurar acceso público"
                                }
                                arrow
                              >
                                <span>
                                  <IconButton
                                    size="small"
                                    onClick={() =>
                                      toggleConfiguracion(sistema.id)
                                    }
                                    disabled={eliminando}
                                    sx={{
                                      border: "1px solid #dbe2ea",
                                      borderRadius: 1.5,
                                      color: expandida ? "#ffffff" : "#475569",
                                      bgcolor: expandida
                                        ? "#2563eb"
                                        : "#ffffff",
                                      "&:hover": {
                                        bgcolor: expandida
                                          ? "#1d4ed8"
                                          : "#f8fafc",
                                      },
                                    }}
                                  >
                                    <SettingsOutlinedIcon fontSize="small" />
                                  </IconButton>
                                </span>
                              </Tooltip>

                              <Tooltip title="Eliminar categoría" arrow>
                                <span>
                                  <IconButton
                                    size="small"
                                    onClick={() => eliminarCategoria(sistema)}
                                    disabled={eliminando}
                                    sx={{
                                      border: "1px solid #fecaca",
                                      borderRadius: 1.5,
                                      color: "#dc2626",
                                      bgcolor: "#ffffff",
                                      "&:hover": {
                                        bgcolor: "#fef2f2",
                                      },
                                    }}
                                  >
                                    {eliminando ? (
                                      <CircularProgress size={18} />
                                    ) : (
                                      <DeleteIcon fontSize="small" />
                                    )}
                                  </IconButton>
                                </span>
                              </Tooltip>
                            </Stack>
                          </TableCell>
                        </TableRow>

                        <TableRow>
                          <TableCell
                            colSpan={6}
                            sx={{
                              p: 0,
                              borderBottom: expandida
                                ? "1px solid #e5e7eb"
                                : "none",
                              bgcolor: "#f8fafc",
                            }}
                          >
                            <Collapse
                              in={expandida}
                              timeout="auto"
                              unmountOnExit
                            >
                              <Box sx={{ p: 2.5 }}>
                                <Paper
                                  variant="outlined"
                                  sx={{
                                    borderRadius: 2.5,
                                    borderColor: "#dbe2ea",
                                    boxShadow: "none",
                                    overflow: "hidden",
                                  }}
                                >
                                  <Box
                                    sx={{
                                      px: 2,
                                      py: 1.4,
                                      bgcolor: "#ffffff",
                                      borderBottom: "1px solid #e5e7eb",
                                    }}
                                  >
                                    <Typography
                                      sx={{
                                        fontWeight: 900,
                                        color: "#0f172a",
                                      }}
                                    >
                                      Configuración de {sistema.nombre}
                                    </Typography>

                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                      sx={{ mt: 0.25 }}
                                    >
                                      Configura el acceso público, portada,
                                      color y enlace de esta categoría.
                                    </Typography>
                                  </Box>

                                  <Box
                                    sx={{
                                      p: 2,
                                      minWidth: 0,
                                      overflow: "hidden",
                                      "& *": {
                                        maxWidth: "100%",
                                        boxSizing: "border-box",
                                      },
                                    }}
                                  >
                                    <SystemPublicAccessPanel
                                      system={sistema}
                                    />
                                  </Box>
                                </Paper>
                              </Box>
                            </Collapse>
                          </TableCell>
                        </TableRow>
                      </Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {/* MÓVIL Y TABLET PEQUEÑA */}
          <Stack
            spacing={1.5}
            sx={{
              display: { xs: "flex", md: "none" },
            }}
          >
            {sistemas.map((sistema) => {
              const logoUrl = obtenerLogoUrl(
                sistema.logo_url || sistema.logo,
              );

              const expandida =
                Number(categoriaExpandidaId) === Number(sistema.id);

              const eliminando =
                Number(eliminandoId) === Number(sistema.id);

              return (
                <Paper
                  key={`mobile-${sistema.id}`}
                  sx={{
                    borderRadius: 2.5,
                    border: "1px solid #e2e8f0",
                    boxShadow: "none",
                    overflow: "hidden",
                    bgcolor: "#ffffff",
                  }}
                >
                  <Box sx={{ p: 1.5 }}>
                    <Stack
                      direction="row"
                      spacing={1.25}
                      alignItems="flex-start"
                    >
                      {logoUrl ? (
                        <Box
                          component="img"
                          src={logoUrl}
                          alt={sistema.nombre}
                          sx={{
                            width: 48,
                            height: 48,
                            objectFit: "contain",
                            borderRadius: 1.5,
                            border: "1px solid #e5e7eb",
                            bgcolor: "#ffffff",
                            p: 0.4,
                            flexShrink: 0,
                          }}
                        />
                      ) : (
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: 1.5,
                            bgcolor: "#f1f5f9",
                            border: "1px solid #e2e8f0",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <ImageIcon
                            sx={{ color: "#64748b", fontSize: 22 }}
                          />
                        </Box>
                      )}

                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography
                          sx={{
                            fontSize: 15,
                            fontWeight: 900,
                            color: "#0f172a",
                            lineHeight: 1.25,
                            wordBreak: "break-word",
                          }}
                        >
                          {sistema.nombre}
                        </Typography>

                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                          sx={{ mt: 0.25 }}
                        >
                          ID: {sistema.id}
                        </Typography>

                        <Stack
                          direction="row"
                          spacing={0.75}
                          mt={0.8}
                          flexWrap="wrap"
                          useFlexGap
                        >
                          <Chip
                            label={sistema.prefijo || "TCK"}
                            size="small"
                            sx={{
                              height: 24,
                              fontWeight: 900,
                              borderRadius: 1.25,
                              bgcolor:
                                sistema.color_secundario || "#eff6ff",
                              color: sistema.color || "#1d4ed8",
                            }}
                          />

                          <Chip
                            size="small"
                            label={
                              Number(sistema.estado) === 1
                                ? "Activo"
                                : "Inactivo"
                            }
                            color={
                              Number(sistema.estado) === 1
                                ? "success"
                                : "default"
                            }
                            sx={{
                              height: 24,
                              fontWeight: 800,
                            }}
                          />
                        </Stack>
                      </Box>

                      <Stack
                        direction="row"
                        spacing={0.5}
                        sx={{ flexShrink: 0 }}
                      >
                        <Tooltip title="Editar categoría" arrow>
                          <span>
                            <IconButton
                              size="small"
                              onClick={() => abrirModalEditar(sistema)}
                              disabled={eliminando}
                              sx={{
                                width: 34,
                                height: 34,
                                border: "1px solid #dbe2ea",
                                borderRadius: 1.5,
                                color: "#2563eb",
                                bgcolor: "#ffffff",
                              }}
                            >
                              <EditOutlinedIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>

                        <Tooltip
                          title={
                            expandida
                              ? "Ocultar configuración"
                              : "Configurar acceso público"
                          }
                          arrow
                        >
                          <span>
                            <IconButton
                              size="small"
                              onClick={() =>
                                toggleConfiguracion(sistema.id)
                              }
                              disabled={eliminando}
                              sx={{
                                width: 34,
                                height: 34,
                                border: "1px solid #dbe2ea",
                                borderRadius: 1.5,
                                color: expandida ? "#ffffff" : "#475569",
                                bgcolor: expandida ? "#2563eb" : "#ffffff",
                              }}
                            >
                              <SettingsOutlinedIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>

                        <Tooltip title="Eliminar categoría" arrow>
                          <span>
                            <IconButton
                              size="small"
                              onClick={() => eliminarCategoria(sistema)}
                              disabled={eliminando}
                              sx={{
                                width: 34,
                                height: 34,
                                border: "1px solid #fecaca",
                                borderRadius: 1.5,
                                color: "#dc2626",
                                bgcolor: "#ffffff",
                              }}
                            >
                              {eliminando ? (
                                <CircularProgress size={17} />
                              ) : (
                                <DeleteIcon fontSize="small" />
                              )}
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Stack>
                    </Stack>

                    <Divider sx={{ my: 1.25 }} />

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        fontSize: 13,
                        lineHeight: 1.5,
                        wordBreak: "break-word",
                      }}
                    >
                      {sistema.descripcion || "Sin descripción"}
                    </Typography>
                  </Box>

                  <Collapse in={expandida} timeout="auto" unmountOnExit>
                    <Divider />

                    <Box
                      sx={{
                        bgcolor: "#f8fafc",
                        p: 1.25,
                      }}
                    >
                      <Box sx={{ mb: 1.25 }}>
                        <Typography
                          sx={{
                            fontSize: 14,
                            fontWeight: 900,
                            color: "#0f172a",
                          }}
                        >
                          Configuración de {sistema.nombre}
                        </Typography>

                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ lineHeight: 1.4 }}
                        >
                          Acceso público, portada, color y enlace.
                        </Typography>
                      </Box>

                      <Paper
                        variant="outlined"
                        sx={{
                          borderRadius: 2,
                          borderColor: "#dbe2ea",
                          boxShadow: "none",
                          overflow: "hidden",
                          bgcolor: "#ffffff",
                        }}
                      >
                        <Box
                          sx={{
                            p: 1.25,
                            minWidth: 0,
                            overflowX: "hidden",
                            "& *": {
                              maxWidth: "100%",
                              boxSizing: "border-box",
                            },
                          }}
                        >
                          <SystemPublicAccessPanel system={sistema} />
                        </Box>
                      </Paper>
                    </Box>
                  </Collapse>
                </Paper>
              );
            })}
          </Stack>
        </>
      )}

      {/* MODAL CREAR / EDITAR CATEGORÍA */}
      <Dialog
        open={modalAbierto}
        onClose={cerrarModal}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: 3,
          },
        }}
      >
        <Box component="form" onSubmit={guardarCategoria}>
          <DialogTitle
            sx={{
              px: { xs: 2, sm: 3 },
              py: 2,
              borderBottom: "1px solid #e5e7eb",
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              spacing={2}
            >
              <Box>
                <Typography
                  component="div"
                  sx={{
                    fontSize: 20,
                    fontWeight: 900,
                    color: "#0f172a",
                  }}
                >
                  {modoModal === "editar"
                    ? "Editar categoría"
                    : "Nueva categoría"}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.25 }}
                >
                  {modoModal === "editar"
                    ? "Modifica los datos generales de la categoría."
                    : "Registra una nueva categoría para clasificar tickets."}
                </Typography>
              </Box>

              <IconButton
                onClick={cerrarModal}
                disabled={cargando}
                size="small"
              >
                <CloseIcon />
              </IconButton>
            </Stack>
          </DialogTitle>

          <DialogContent
            sx={{
              px: { xs: 2, sm: 3 },
              py: "24px !important",
            }}
          >
            {errorModal && (
              <Alert severity="error" sx={{ mb: 2.5 }}>
                {errorModal}
              </Alert>
            )}

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nombre de la categoría"
                  name="nombre"
                  value={formulario.nombre}
                  onChange={cambiarValor}
                  required
                  size="small"
                  disabled={cargando}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Prefijo"
                  name="prefijo"
                  value={formulario.prefijo}
                  onChange={cambiarValor}
                  required
                  size="small"
                  disabled={cargando}
                  inputProps={{
                    maxLength: 20,
                    style: { textTransform: "uppercase" },
                  }}
                  helperText="Ejemplo: WEB, ADM, INV"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Descripción"
                  name="descripcion"
                  value={formulario.descripcion}
                  onChange={cambiarValor}
                  required
                  size="small"
                  multiline
                  minRows={3}
                  disabled={cargando}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Button
                  variant="outlined"
                  component="label"
                  fullWidth
                  disabled={cargando}
                  sx={{
                    minHeight: 44,
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 800,
                  }}
                >
                  {modoModal === "editar"
                    ? "Cambiar logo"
                    : "Seleccionar logo"}

                  <input
                    type="file"
                    hidden
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    onChange={cambiarLogo}
                  />
                </Button>

                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    mt: 0.7,
                    display: "block",
                  }}
                >
                  Formatos permitidos: JPG, PNG o WEBP. Máximo 2 MB.
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box
                  sx={{
                    minHeight: 72,
                    border: "1px dashed #cbd5e1",
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 1.5,
                    px: 1.5,
                    py: 1,
                    bgcolor: "#f8fafc",
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={1.5}
                    alignItems="center"
                    sx={{ minWidth: 0 }}
                  >
                    {imagenModal ? (
                      <Box
                        component="img"
                        src={imagenModal}
                        alt="Vista previa"
                        sx={{
                          width: 50,
                          height: 50,
                          objectFit: "contain",
                          borderRadius: 2,
                          border: "1px solid #e5e7eb",
                          bgcolor: "#ffffff",
                          p: 0.5,
                          flexShrink: 0,
                        }}
                      />
                    ) : (
                      <Box
                        sx={{
                          width: 50,
                          height: 50,
                          borderRadius: 2,
                          bgcolor: "#e5e7eb",
                          border: "1px solid #d1d5db",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <ImageIcon color="action" />
                      </Box>
                    )}

                    <Box sx={{ minWidth: 0 }}>
                      <Typography fontWeight={800} variant="body2">
                        {previewLogo
                          ? "Nuevo logo seleccionado"
                          : modoModal === "editar" && logoActualUrl
                            ? "Logo actual"
                            : "Vista previa del logo"}
                      </Typography>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                        noWrap
                        display="block"
                      >
                        {formulario.logo?.name ||
                          (modoModal === "editar" && logoActualUrl
                            ? "Se conservará si no seleccionas otro."
                            : "Sin archivo seleccionado")}
                      </Typography>
                    </Box>
                  </Stack>

                  {previewLogo && (
                    <IconButton
                      size="small"
                      onClick={quitarLogoSeleccionado}
                      disabled={cargando}
                      sx={{ flexShrink: 0 }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
              </Grid>
            </Grid>
          </DialogContent>

          <Divider />

          <DialogActions
            sx={{
              px: { xs: 2, sm: 3 },
              py: 2,
              gap: 1,
            }}
          >
            <Button
              type="button"
              onClick={cerrarModal}
              disabled={cargando}
              color="inherit"
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 800,
              }}
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              variant="contained"
              disabled={cargando}
              sx={{
                minWidth: 160,
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 900,
                boxShadow: "none",
              }}
            >
              {cargando
                ? modoModal === "editar"
                  ? "Guardando..."
                  : "Creando..."
                : modoModal === "editar"
                  ? "Guardar cambios"
                  : "Crear categoría"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}

export default Sistemas;