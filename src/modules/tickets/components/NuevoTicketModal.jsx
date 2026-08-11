import { useEffect, useState } from "react";
import axiosCliente from "../../../services/axiosCliente";

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
} from "@mui/material";

import AttachFileIcon from "@mui/icons-material/AttachFile";
import CloseIcon from "@mui/icons-material/Close";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";

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

const obtenerRolesUsuario = () => {
  try {
    const usuario = JSON.parse(localStorage.getItem("USUARIO") || "{}");

    const roles = [];

    if (Array.isArray(usuario?.roles)) {
      usuario.roles.forEach((rol) => {
        if (typeof rol === "string") {
          roles.push(rol);
        } else if (rol?.name) {
          roles.push(rol.name);
        }
      });
    }

    if (usuario?.role) {
      roles.push(usuario.role);
    }

    if (usuario?.company_role) {
      roles.push(usuario.company_role);
    }

    return [...new Set(roles.map(normalizarRol).filter(Boolean))];
  } catch {
    return [];
  }
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

function NuevoTicketModal({ open, onClose, onCreated }) {
  const rolesUsuario = obtenerRolesUsuario();
  const esCliente = rolesUsuario.includes("client");
  const puedeAsignar = !esCliente;

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

  const [archivo, setArchivo] = useState(null);
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
        due_date: prev.due_date || obtenerFechaVigenciaDefault(),
      }));

      cargarCatalogos();
    }
  }, [open]);

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
          .filter((sistema) => Number(sistema.estado) === 1)
          .sort((a, b) => Number(a.orden || 999) - Number(b.orden || 999)),
      );

      setCategorias(
        normalizar(resC).filter((categoria) => Number(categoria.estado) === 1),
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
            String(a.nombre || "").localeCompare(
              String(b.nombre || ""),
              "es",
              { sensitivity: "base" },
            ),
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

    setArchivo(null);
    setError("");
    onClose();
  };

  const seleccionarArchivo = (e) => {
    const file = e.target.files?.[0] || null;

    setArchivo(file);

    e.target.value = "";
  };

  const quitarArchivo = () => {
    setArchivo(null);
  };

  const formatoPeso = (bytes) => {
    if (!bytes) return "0 KB";

    const kb = bytes / 1024;

    if (kb < 1024) {
      return `${kb.toFixed(1)} KB`;
    }

    return `${(kb / 1024).toFixed(1)} MB`;
  };

  const crearTicket = async (e) => {
    e.preventDefault();

    setError("");

    if (puedeAsignar && !formulario.client_id) {
      setError("Selecciona el cliente al que va dirigido el ticket.");
      return;
    }

    if (!formulario.due_date) {
      setError("Selecciona la fecha de vigencia del ticket.");
      return;
    }

    if (formulario.due_date < obtenerFechaHoy()) {
      setError("La fecha de vigencia no puede ser anterior a hoy.");
      return;
    }

    setCargando(true);

    try {
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

      if (archivo) {
        formData.append("archivos[]", archivo);
      }

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
        setError(error.response?.data?.message || "No se pudo crear el ticket.");
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={cargando ? undefined : cerrar}
      maxWidth="sm"
      fullWidth
      fullScreen={false}
      PaperProps={{
        sx: {
          width: "100%",
          maxWidth: { xs: "calc(100% - 24px)", sm: 620 },
          m: { xs: 1.5, sm: 3 },
          borderRadius: { xs: 3, sm: 4 },
          overflow: "hidden",
        },
      }}
    >
      <DialogTitle
        sx={{
          px: { xs: 2, sm: 3 },
          py: { xs: 1.6, sm: 2.2 },
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <Stack direction="row" justifyContent="space-between" spacing={1.5}>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              fontWeight={900}
              sx={{
                fontSize: { xs: 19, sm: 22 },
                lineHeight: 1.2,
              }}
            >
              Crear ticket
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
              Completa la información para registrar un nuevo ticket de soporte.
            </Typography>
          </Box>

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

      <Box component="form" onSubmit={crearTicket}>
        <DialogContent
          dividers={false}
          sx={{
            px: { xs: 2, sm: 3 },
            py: { xs: 2, sm: 2.5 },
            maxHeight: { xs: "calc(100dvh - 190px)", sm: "70vh" },
            overflowY: "auto",
          }}
        >
          <Stack spacing={2}>
            {error && <Alert severity="error">{error}</Alert>}

            {puedeAsignar && (
              <Paper
                variant="outlined"
                sx={{
                  p: { xs: 1.5, sm: 2 },
                  borderRadius: 3,
                  borderColor: "#e5e7eb",
                  bgcolor: "#ffffff",
                }}
              >
                <Stack spacing={2}>
                  <Box>
                    <Typography fontWeight={900} sx={{ fontSize: 15 }}>
                      Asignación
                    </Typography>

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
                            sx={{ fontWeight: 700 }}
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
                borderColor: "#e5e7eb",
                bgcolor: "#ffffff",
              }}
            >
              <Stack spacing={2}>
                <Box>
                  <Typography fontWeight={900} sx={{ fontSize: 15 }}>
                    Clasificación
                  </Typography>

                  <Typography variant="caption" color="text.secondary">
                    Selecciona la categoría, sección, prioridad y vigencia del ticket.
                  </Typography>
                </Box>

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
                    required
                    disabled={cargando || cargandoCatalogos}
                    helperText="Por defecto: 15 días naturales contando hoy como día 1."
                    slotProps={{
                      htmlInput: {
                        min: obtenerFechaHoy(),
                      },
                    }}
                  />
                </Box>
              </Stack>
            </Paper>

            <Paper
              variant="outlined"
              sx={{
                p: { xs: 1.5, sm: 2 },
                borderRadius: 3,
                borderColor: "#e5e7eb",
                bgcolor: "#ffffff",
              }}
            >
              <Stack spacing={2}>
                <Box>
                  <Typography fontWeight={900} sx={{ fontSize: 15 }}>
                    Detalle del problema
                  </Typography>

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
                  maxRows={7}
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

            <Paper
              variant="outlined"
              sx={{
                p: { xs: 1.5, sm: 2 },
                borderRadius: 3,
                borderColor: "#e5e7eb",
                bgcolor: "#ffffff",
              }}
            >
              <Stack spacing={1.4}>
                <Box>
                  <Typography fontWeight={900} sx={{ fontSize: 15 }}>
                    Archivo adjunto
                  </Typography>

                  <Typography variant="caption" color="text.secondary">
                    Puedes adjuntar una captura, documento o archivo relacionado.
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
                  Adjuntar archivo
                  <input
                    hidden
                    type="file"
                    accept="image/*,video/*,.jfif,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
                    onChange={seleccionarArchivo}
                  />
                </Button>

                {archivo && (
                  <Box
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
                      onClick={quitarArchivo}
                      disabled={cargando || cargandoCatalogos}
                      sx={{ flexShrink: 0 }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Box>
                )}
              </Stack>
            </Paper>
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
            {cargando ? "Creando..." : "Crear ticket"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

export default NuevoTicketModal;