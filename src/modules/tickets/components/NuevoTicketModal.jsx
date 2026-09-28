import { useEffect, useState } from "react";
import axiosCliente from "../../../services/axiosCliente";
import { useAuth } from "../../../auth/context/AuthContext";

import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import AttachFileIcon from "@mui/icons-material/AttachFile";
import CloseIcon from "@mui/icons-material/Close";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import ConfirmationNumberOutlinedIcon from "@mui/icons-material/ConfirmationNumberOutlined";
import PersonOutlineIcon from "@mui/icons-material/Person2Outlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";

const formatearFechaInput = (fecha) => {
  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, "0");
  const day = String(fecha.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const obtenerFechaHoy = () => {
  return formatearFechaInput(new Date());
};

const obtenerFechaVigenciaDefault = () => {
  const fecha = new Date();

  // 15 días naturales contando hoy como día 1.
  fecha.setDate(fecha.getDate() + 14);

  return formatearFechaInput(fecha);
};

const normalizarRol = (rol) => {
  const valor = String(rol || "")
    .trim()
    .toLowerCase();

  if (["admin", "administrador"].includes(valor)) return "admin";
  if (valor === "supervisor") return "supervisor";
  if (["agent", "agente"].includes(valor)) return "agent";
  if (["client", "cliente"].includes(valor)) return "client";

  return valor;
};

const nombreCompletoCliente = (cliente) => {
  const nombre = [
    cliente?.name,
    cliente?.apellido_paterno,
    cliente?.apellido_materno,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return nombre || cliente?.email || `Cliente #${cliente?.id || ""}`;
};

const etiquetaCliente = (cliente) => {
  const nombre = nombreCompletoCliente(cliente);
  const email = String(cliente?.email || "").trim();

  return email ? `${nombre} — ${email}` : nombre;
};

const fechaVigenciaInput = (ticket) => {
  // due_date representa un día de calendario, no un instante UTC.
  const fecha = String(ticket.due_date || "").trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return fecha;
  const partes = fecha.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (partes) return `${partes[3]}-${partes[2]}-${partes[1]}`;
  if (!ticket.due_at) return "";
  const instante = new Date(ticket.due_at);
  if (Number.isNaN(instante.getTime())) return "";
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Mexico_City", year: "numeric", month: "2-digit", day: "2-digit",
  }).format(instante);
};

const datosEdicion = (ticket) => ({
  titulo: ticket.titulo || "", descripcion: ticket.descripcion || "",
  system_id: String(ticket.system_id ?? ticket.system?.id ?? ticket.sistema?.id ?? ""),
  category_id: String(ticket.category_id ?? ticket.category?.id ?? ticket.categoria?.id ?? ""),
  priority_id: String(ticket.priority_id ?? ticket.priority?.id ?? ticket.prioridad?.id ?? ""),
  due_date: fechaVigenciaInput(ticket),
});

function NuevoTicketModal({ open, onClose, onCreated, ticket = null, onUpdated }) {
  const esEdicion = Boolean(ticket?.id);
  const { user } = useAuth();
  const theme = useTheme();
  const esMovil = useMediaQuery(theme.breakpoints.down("sm"));

  const rolesBase = Array.isArray(user?.roles) ? user.roles : [];

  const rolEmpresa = user?.company_role || user?.role || null;

  const rolesUsuario = rolEmpresa
    ? [normalizarRol(rolEmpresa)]
    : rolesBase
        .map((rol) =>
          typeof rol === "string"
            ? normalizarRol(rol)
            : normalizarRol(rol?.name),
        )
        .filter(Boolean);

  const esCliente = rolesUsuario.includes("client");
  const puedeAsignar = !esCliente && !esEdicion;
  const puedeEditar = rolesUsuario.some((rol) => ["admin", "supervisor"].includes(rol));

  const [formulario, setFormulario] = useState({
    titulo: "",
    descripcion: "",
    system_id: "",
    category_id: "",
    priority_id: "",
    client_id: "",
    tag_ids: [],
    due_date: obtenerFechaVigenciaDefault(),
  });

  const [archivos, setArchivos] = useState([]);
  const [sistemas, setSistemas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [prioridades, setPrioridades] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [etiquetas, setEtiquetas] = useState([]);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [cargandoCatalogos, setCargandoCatalogos] = useState(false);

  const normalizar = (res) => res?.data?.data || res?.data || [];

  useEffect(() => {
    if (open) {
      setFormulario((prev) => ({
        ...prev,
        ...(esEdicion ? datosEdicion(ticket) : { due_date: prev.due_date || obtenerFechaVigenciaDefault() }),
      }));

      cargarCatalogos();
    }
  }, [open, ticket]);

  const cargarCatalogos = async () => {
    setCargandoCatalogos(true);

    try {
      setError("");

      const [resS, resC, resP] = await Promise.all([
        axiosCliente.get("/systems"),
        axiosCliente.get("/ticket-categories"),
        axiosCliente.get("/ticket-priorities"),
      ]);

      setSistemas(
        normalizar(resS)
          .filter((sistema) => Number(sistema.estado) === 1 || (esEdicion && String(sistema.id) === datosEdicion(ticket).system_id))
          .sort((a, b) => Number(a.orden || 999) - Number(b.orden || 999)),
      );

      setCategorias(
        normalizar(resC).filter((categoria) => Number(categoria.estado) === 1 || (esEdicion && String(categoria.id) === datosEdicion(ticket).category_id)),
      );

      setPrioridades(normalizar(resP));

      if (puedeAsignar) {
        const [resClientes, resEtiquetas] = await Promise.all([
          axiosCliente.get("/clients/summary"),
          axiosCliente.get("/ticket-tags"),
        ]);

        const clientesActivos = (resClientes?.data?.data || [])
          .filter((cliente) => {
            const estadoEmpresa =
              cliente?.company_status ?? cliente?.status ?? 1;

            return Number(estadoEmpresa) === 1;
          })
          .sort((a, b) =>
            nombreCompletoCliente(a).localeCompare(
              nombreCompletoCliente(b),
              "es",
              { sensitivity: "base" },
            ),
          );

        const etiquetasActivas = normalizar(resEtiquetas)
          .filter((etiqueta) => Number(etiqueta.estado) === 1)
          .sort((a, b) =>
            String(a.nombre || "").localeCompare(String(b.nombre || ""), "es", {
              sensitivity: "base",
            }),
          );

        setClientes(clientesActivos);
        setEtiquetas(etiquetasActivas);
      } else {
        setClientes([]);
        setEtiquetas([]);
      }
    } catch (error) {
      console.log("ERROR CATÁLOGOS:", error.response?.data || error);
      setError(
        error.response?.data?.message ||
          "No se pudieron cargar los catálogos necesarios para crear el ticket.",
      );
    } finally {
      setCargandoCatalogos(false);
    }
  };

  const categoriasFiltradas = categorias.filter(
    (categoria) => String(categoria.system_id) === String(formulario.system_id),
  );

  const cambiarValor = (e) => {
    const { name, value } = e.target;

    setFormulario((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "system_id" ? { category_id: "" } : {}),
    }));
  };

  const cerrar = () => {
    setFormulario({
      titulo: "",
      descripcion: "",
      system_id: "",
      category_id: "",
      priority_id: "",
      client_id: "",
      tag_ids: [],
      due_date: obtenerFechaVigenciaDefault(),
    });

    setArchivos([]);
    setError("");
    onClose();
  };

  const seleccionarArchivo = (e) => {
    const nuevosArchivos = Array.from(e.target.files || []);

    setArchivos((actuales) => {
      const combinados = [...actuales, ...nuevosArchivos];

      return combinados.filter(
        (file, index, lista) =>
          index ===
          lista.findIndex(
            (otro) =>
              otro.name === file.name &&
              otro.size === file.size &&
              otro.lastModified === file.lastModified,
          ),
      );
    });

    e.target.value = "";
  };

  const quitarArchivo = (index) => {
    setArchivos((actuales) =>
      actuales.filter((_, posicion) => posicion !== index),
    );
  };

  const formatoPeso = (bytes) => {
    if (!bytes) return "0 KB";

    const kb = bytes / 1024;

    if (kb < 1024) {
      return `${kb.toFixed(1)} KB`;
    }

    return `${(kb / 1024).toFixed(1)} MB`;
  };

  const guardarTicket = async (e) => {
    e.preventDefault();

    setError("");

    if (cargando || cargandoCatalogos || (esEdicion && !puedeEditar)) return;

    if (puedeAsignar && !formulario.client_id) {
      setError("Selecciona el cliente al que va dirigido el ticket.");
      return;
    }

    if (!formulario.system_id) {
      setError("Selecciona la categoría del ticket.");
      return;
    }

    if (!formulario.category_id) {
      setError("Selecciona la sección del ticket.");
      return;
    }

    if (!formulario.priority_id) {
      setError("Selecciona la prioridad del ticket.");
      return;
    }

    if (!esEdicion && !formulario.due_date) {
      setError("Selecciona la fecha de vigencia del ticket.");
      return;
    }

    if (formulario.due_date && (!esEdicion || formulario.due_date !== datosEdicion(ticket).due_date) && formulario.due_date < obtenerFechaHoy()) {
      setError("La fecha de vigencia no puede ser anterior a hoy.");
      return;
    }

    if (!formulario.titulo.trim()) {
      setError("Escribe un asunto claro para el ticket.");
      return;
    }

    if (!formulario.descripcion.trim()) {
      setError("Describe el problema o solicitud antes de crear el ticket.");
      return;
    }

    if (formulario.titulo.length > 200) {
      setError("El asunto no puede superar los 200 caracteres."); return;
    }
    setCargando(true);
    try {
      if (esEdicion) {
        const originales = datosEdicion(ticket);
        const payload = Object.fromEntries(Object.keys(originales)
          .filter((campo) => formulario[campo] !== originales[campo])
          .map((campo) => [campo, campo === "due_date" ? formulario[campo] || null : formulario[campo]]));
        if (!Object.keys(payload).length) {
          setError("No hay cambios para guardar."); return;
        }
        await axiosCliente.patch(`/tickets/${ticket.id}`, payload);
        cerrar(); onUpdated?.(); return;
      }

      const formData = new FormData();

      formData.append("titulo", formulario.titulo);
      formData.append("descripcion", formulario.descripcion);
      formData.append("system_id", formulario.system_id);
      formData.append("category_id", formulario.category_id);
      formData.append("priority_id", formulario.priority_id);
      formData.append("due_date", formulario.due_date);

      if (puedeAsignar && formulario.client_id) {
        formData.append("client_id", formulario.client_id);
      }

      if (puedeAsignar) {
        formulario.tag_ids.forEach((tagId) => {
          formData.append("tag_ids[]", String(tagId));
        });
      }

      archivos.forEach((archivo) => formData.append("archivos[]", archivo));

      await axiosCliente.post("/tickets", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      cerrar();

      if (onCreated) {
        onCreated();
      }
    } catch (error) {
      console.log("ERROR CREAR TICKET:", error.response?.data || error);

      const errores = error.response?.data?.errors;

      if (errores) {
        setError(Object.values(errores).flat().join(" "));
      } else {
        setError(
          error.response?.data?.message || (esEdicion ? "No se pudo actualizar el ticket." : "No se pudo crear el ticket."),
        );
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={cargando ? undefined : cerrar}
      maxWidth="md"
      fullWidth
      fullScreen={esMovil}
      PaperProps={{
        sx: {
          width: "100%",
          maxWidth: { xs: "100%", sm: 760 },
          m: { xs: 0, sm: 3 },
          borderRadius: { xs: 0, sm: 4 },
          overflow: "hidden",
          boxShadow: "0 24px 70px rgba(15, 23, 42, 0.22)",
          maxHeight: { xs: "100dvh", sm: "calc(100dvh - 48px)" },
        },
      }}
    >
      <DialogTitle
        sx={{
          px: { xs: 2, sm: 3 },
          py: { xs: 1.6, sm: 2.2 },
          borderBottom: "1px solid #dbeafe",
          bgcolor: "#f8fbff",
          backgroundImage: "linear-gradient(120deg, #eff6ff 0%, #ffffff 75%)",
        }}
      >
        <Stack direction="row" justifyContent="space-between" spacing={1.5}>
          <Stack direction="row" spacing={1.4} alignItems="center" sx={{ minWidth: 0 }}>
            <Box sx={{ width: 44, height: 44, borderRadius: 2.5, bgcolor: "#2563eb", color: "#fff", display: "grid", placeItems: "center", flexShrink: 0 }}>
              <ConfirmationNumberOutlinedIcon />
            </Box>
            <Box sx={{ minWidth: 0 }}>
            <Typography
              fontWeight={900}
              sx={{
                fontSize: { xs: 19, sm: 22 },
                lineHeight: 1.2,
              }}
            >
              {esEdicion ? "Editar ticket" : "Crear ticket"}
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 0.5,
                fontSize: { xs: 12.5, sm: 14 },
                lineHeight: 1.35,
              }}
            >
              {esEdicion ? "Actualiza la información del ticket de soporte." : "Completa la información para registrar un nuevo ticket de soporte."}
            </Typography>
            </Box>
          </Stack>

          <IconButton
            onClick={cerrar}
            disabled={cargando}
            size="small"
            sx={{
              flexShrink: 0,
              border: "1px solid #e5e7eb",
              width: 34,
              height: 34,
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>
      </DialogTitle>

      {error && (
        <Alert
          severity="error"
          role="alert"
          sx={{
            mx: { xs: 2, sm: 3 },
            mt: 2,
            borderRadius: 2.5,
            alignItems: "flex-start",
            "& .MuiAlert-message": { fontWeight: 700, lineHeight: 1.45 },
          }}
        >
          {error}
        </Alert>
      )}

      <Box
        component="form"
        noValidate
        onSubmit={guardarTicket}
        onChange={() => error && setError("")}
        sx={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        <DialogContent
          dividers={false}
          sx={{
            px: { xs: 2, sm: 3 },
            py: { xs: 2, sm: 2.5 },
            flex: 1,
            minHeight: 0,
            maxHeight: "none",
            overflowY: "auto",
            overflowX: "hidden",
            bgcolor: "#f8fafc",
          }}
        >
          <Stack spacing={2}>
            {puedeAsignar && (
              <Paper
                variant="outlined"
                sx={{
                  p: { xs: 1.5, sm: 2 },
                  borderRadius: 3,
                  borderColor: "#dbeafe",
                  bgcolor: "#ffffff",
                  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
                }}
              >
                <Stack spacing={2}>
                  <Box>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <PersonOutlineIcon sx={{ color: "#2563eb" }} />
                    <Typography fontWeight={900} sx={{ fontSize: 15 }}>
                      Asignación
                    </Typography>
                    </Stack>

                    <Typography variant="caption" color="text.secondary">
                      Indica a qué cliente va dirigido el ticket y agrega las
                      etiquetas que ayuden a identificarlo.
                    </Typography>
                  </Box>

                  <Autocomplete
                    fullWidth
                    options={clientes}
                    value={
                      clientes.find(
                        (cliente) =>
                          String(cliente.id) === String(formulario.client_id),
                      ) || null
                    }
                    onChange={(_, cliente) => {
                      setFormulario((prev) => ({
                        ...prev,
                        client_id: cliente?.id || "",
                      }));
                    }}
                    getOptionLabel={etiquetaCliente}
                    isOptionEqualToValue={(option, value) =>
                      String(option.id) === String(value.id)
                    }
                    noOptionsText="No hay clientes activos disponibles"
                    disabled={cargando || cargandoCatalogos}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        size="small"
                        label="Dirigido a / Cliente"
                        required
                        helperText={
                          clientes.length === 0 && !cargandoCatalogos
                            ? "No hay clientes activos disponibles."
                            : "Selecciona el cliente que recibirá y dará seguimiento al ticket."
                        }
                      />
                    )}
                  />

                  <Autocomplete
                    multiple
                    limitTags={2}
                    fullWidth
                    options={etiquetas}
                    value={etiquetas.filter((etiqueta) =>
                      formulario.tag_ids
                        .map(String)
                        .includes(String(etiqueta.id)),
                    )}
                    onChange={(_, nuevasEtiquetas) => {
                      setFormulario((prev) => ({
                        ...prev,
                        tag_ids: nuevasEtiquetas.map((etiqueta) => etiqueta.id),
                      }));
                    }}
                    getOptionLabel={(etiqueta) => etiqueta?.nombre || ""}
                    isOptionEqualToValue={(option, value) =>
                      String(option.id) === String(value.id)
                    }
                    noOptionsText="No hay etiquetas activas disponibles"
                    disabled={cargando || cargandoCatalogos}
                    renderTags={(value, getTagProps) =>
                      value.map((etiqueta, index) => {
                        const { key, ...tagProps } = getTagProps({ index });

                        return (
                          <Chip
                            key={key || etiqueta.id}
                            {...tagProps}
                            size="small"
                            label={etiqueta.nombre}
                            sx={{
                              fontWeight: 700,
                              maxWidth: 180,
                              "& .MuiChip-label": {
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              },
                            }}
                          />
                        );
                      })
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        size="small"
                        label="Etiquetas"
                        placeholder={
                          formulario.tag_ids.length === 0
                            ? "Selecciona una o varias etiquetas"
                            : ""
                        }
                        helperText="Opcional. Puedes asignar más de una etiqueta."
                      />
                    )}
                  />
                </Stack>
              </Paper>
            )}

            <Paper
              variant="outlined"
              sx={{
                p: { xs: 1.5, sm: 2 },
                borderRadius: 3,
                borderColor: "#dbeafe",
                bgcolor: "#ffffff",
                boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
              }}
            >
              <Stack spacing={2}>
                <Box>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CategoryOutlinedIcon sx={{ color: "#2563eb" }} />
                  <Typography fontWeight={900} sx={{ fontSize: 15 }}>
                    Clasificación
                  </Typography>
                  </Stack>

                  <Typography variant="caption" color="text.secondary">
                    Selecciona la categoría, sección, prioridad y vigencia del
                    ticket.
                  </Typography>
                </Box>

                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" }, gap: 2 }}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Categoría"
                  name="system_id"
                  value={formulario.system_id}
                  onChange={cambiarValor}
                  required
                  disabled={cargando || cargandoCatalogos}
                >
                  {sistemas.map((sistema) => (
                    <MenuItem key={sistema.id} value={sistema.id}>
                      {sistema.nombre}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Sección"
                  name="category_id"
                  value={formulario.category_id}
                  onChange={cambiarValor}
                  disabled={!formulario.system_id || cargando}
                  required
                  helperText={
                    !formulario.system_id
                      ? "Primero selecciona una categoría"
                      : categoriasFiltradas.length === 0
                        ? "Esta categoría no tiene secciones disponibles"
                        : ""
                  }
                >
                  {categoriasFiltradas.map((categoria) => (
                    <MenuItem key={categoria.id} value={categoria.id}>
                      {categoria.nombre}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Prioridad"
                  name="priority_id"
                  value={formulario.priority_id}
                  onChange={cambiarValor}
                  required
                  disabled={cargando || cargandoCatalogos}
                >
                  {prioridades.map((prioridad) => (
                    <MenuItem key={prioridad.id} value={prioridad.id}>
                      {prioridad.nombre}
                    </MenuItem>
                  ))}
                </TextField>

                <Box
                  sx={{
                    position: "relative",
                    width: "100%",
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      position: "absolute",
                      top: -7,
                      left: 10,
                      zIndex: 1,
                      px: 0.5,
                      bgcolor: "#ffffff",
                      color: "text.secondary",
                      fontSize: 11,
                      lineHeight: 1,
                    }}
                  >
                    Vigencia
                  </Typography>

                  <TextField
                    fullWidth
                    size="small"
                    type="date"
                    name="due_date"
                    value={formulario.due_date}
                    onChange={cambiarValor}
                    required={!esEdicion}
                    disabled={cargando || cargandoCatalogos}
                    helperText={esEdicion ? "Deja la fecha vacía para quitar la vigencia." : "Por defecto: 15 días naturales contando hoy como día 1."}
                    slotProps={{
                      htmlInput: {
                        min: obtenerFechaHoy(),
                      },
                    }}
                  />
                </Box>
                </Box>
              </Stack>
            </Paper>

            <Paper
              variant="outlined"
              sx={{
                p: { xs: 1.5, sm: 2 },
                borderRadius: 3,
                borderColor: "#dbeafe",
                bgcolor: "#ffffff",
                boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
              }}
            >
              <Stack spacing={2}>
                <Box>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <DescriptionOutlinedIcon sx={{ color: "#2563eb" }} />
                  <Typography fontWeight={900} sx={{ fontSize: 15 }}>
                    Detalle del problema
                  </Typography>
                  </Stack>

                  <Typography variant="caption" color="text.secondary">
                    Describe el asunto y agrega información suficiente para
                    atenderlo.
                  </Typography>
                </Box>

                <TextField
                  fullWidth
                  size="small"
                  label="Asunto"
                  name="titulo"
                  value={formulario.titulo}
                  onChange={cambiarValor}
                  required
                  disabled={cargando || cargandoCatalogos}
                />

                <TextField
                  fullWidth
                  multiline
                  minRows={4}
                  size="small"
                  label="Descripción"
                  name="descripcion"
                  value={formulario.descripcion}
                  onChange={cambiarValor}
                  required
                  disabled={cargando || cargandoCatalogos}
                />
              </Stack>
            </Paper>

            {!esEdicion && <Paper
              variant="outlined"
              sx={{
                p: { xs: 1.5, sm: 2 },
                borderRadius: 3,
                borderColor: "#dbeafe",
                bgcolor: "#ffffff",
                boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
              }}
            >
              <Stack spacing={1.4}>
                <Box>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CloudUploadOutlinedIcon sx={{ color: "#2563eb" }} />
                  <Typography fontWeight={900} sx={{ fontSize: 15 }}>
                    Archivo adjunto
                  </Typography>
                  </Stack>

                  <Typography variant="caption" color="text.secondary">
                    Puedes seleccionar uno o varios archivos relacionados.
                  </Typography>
                </Box>

                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<AttachFileIcon />}
                  disabled={cargando || cargandoCatalogos}
                  fullWidth
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 800,
                    justifyContent: "center",
                    minHeight: 40,
                  }}
                >
                  {archivos.length > 0 ? "Agregar más archivos" : "Adjuntar archivos"}
                  <input
                    hidden
                    type="file"
                    multiple
                    accept="image/*,video/*,.jfif,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
                    onChange={seleccionarArchivo}
                  />
                </Button>

                {archivos.length > 0 && (
                  <Stack spacing={0.8}>
                    <Typography variant="caption" color="text.secondary" fontWeight={800}>
                      {archivos.length} {archivos.length === 1 ? "archivo seleccionado" : "archivos seleccionados"}
                    </Typography>
                  {archivos.map((archivo, index) => (
                  <Box
                    key={`${archivo.name}-${archivo.size}-${archivo.lastModified}`}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 1,
                      p: 1.2,
                      borderRadius: 2,
                      bgcolor: "#f8fafc",
                      border: "1px solid #e5e7eb",
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      sx={{ minWidth: 0 }}
                    >
                      <InsertDriveFileIcon color="action" />

                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          variant="body2"
                          fontWeight={800}
                          noWrap
                          sx={{
                            maxWidth: { xs: 220, sm: 420 },
                          }}
                        >
                          {archivo.name}
                        </Typography>

                        <Typography variant="caption" color="text.secondary">
                          {formatoPeso(archivo.size)}
                        </Typography>
                      </Box>
                    </Stack>

                    <IconButton
                      size="small"
                      onClick={() => quitarArchivo(index)}
                      aria-label={`Quitar ${archivo.name}`}
                      disabled={cargando || cargandoCatalogos}
                      sx={{ flexShrink: 0 }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  ))}
                  </Stack>
                )}
              </Stack>
            </Paper>}
          </Stack>
        </DialogContent>

        <Divider />

        <DialogActions
          sx={{
            px: { xs: 2, sm: 3 },
            py: { xs: 1.5, sm: 2 },
            display: "flex",
            flexDirection: { xs: "column-reverse", sm: "row" },
            alignItems: { xs: "stretch", sm: "center" },
            gap: 1,
          }}
        >
          <Button
            variant="outlined"
            onClick={cerrar}
            disabled={cargando}
            fullWidth
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 800,
              maxWidth: { xs: "100%", sm: 140 },
            }}
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            variant="contained"
            disabled={cargando || cargandoCatalogos}
            fullWidth
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 800,
              maxWidth: { xs: "100%", sm: 150 },
            }}
          >
            {cargando ? "Guardando..." : esEdicion ? "Guardar cambios" : "Crear ticket"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

export default NuevoTicketModal;
