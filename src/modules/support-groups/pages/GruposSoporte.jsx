import { useEffect, useMemo, useState } from "react";
import axiosCliente from "../../../services/axiosCliente";
import { useAuth } from "../../../auth/context/AuthContext";

import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TablePagination,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import CloseIcon from "@mui/icons-material/Close";

const normalizarRol = (rol) => {
  return String(rol || "")
    .trim()
    .toLowerCase();
};

const normalizarTexto = (valor) => {
  return String(valor || "")
    .trim()
    .toLowerCase();
};

function GruposSoporte() {
  const { user } = useAuth();

  const rolesBase = Array.isArray(user?.roles) ? user.roles : [];
  const rolEmpresa = user?.company_role || user?.role || null;

  const rolesNormalizados = rolEmpresa
    ? [normalizarRol(rolEmpresa)]
    : rolesBase.map((rol) => normalizarRol(rol));

  const isAdmin =
    rolesNormalizados.includes("administrador") ||
    rolesNormalizados.includes("admin");

  const isSupervisor = rolesNormalizados.includes("supervisor");
  const puedeGestionar = isAdmin || isSupervisor;

  const [grupos, setGrupos] = useState([]);
  const [agentes, setAgentes] = useState([]);
  const [categoriasDisponibles, setCategoriasDisponibles] = useState([]);
  const [categoriasActivas, setCategoriasActivas] = useState([]);

  const [formulario, setFormulario] = useState({
    nombre: "",
    descripcion: "",
    system_ids: [],
  });

  const [agenteSeleccionado, setAgenteSeleccionado] = useState({});
  const [busqueda, setBusqueda] = useState("");

  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  const [grupoEditando, setGrupoEditando] = useState(null);

  const [formularioEdicion, setFormularioEdicion] = useState({
    nombre: "",
    descripcion: "",
    system_ids: [],
  });

  const [guardandoEdicion, setGuardandoEdicion] = useState(false);
  const [errorEdicion, setErrorEdicion] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(6);

  const [loading, setLoading] = useState(true);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [warning, setWarning] = useState("");

  /*
   * En la edición se muestran todas las categorías activas
   * de la empresa. Las que ya pertenecen al grupo actual
   * aparecen seleccionadas y las demás pueden reasignarse
   * al guardar los cambios.
   */
  const categoriasParaEdicion = useMemo(() => {
    if (!grupoEditando) {
      return [];
    }

    return categoriasActivas;
  }, [grupoEditando, categoriasActivas]);

  useEffect(() => {
    obtenerDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setPage(0);
  }, [busqueda, rowsPerPage, grupos.length]);

  const normalizarRespuesta = (res) => {
    return res?.data?.data || res?.data || [];
  };

  const obtenerGrupos = async () => {
    const resGrupos = await axiosCliente.get("/support-groups");
    setGrupos(normalizarRespuesta(resGrupos));
  };

  const obtenerAgentes = async () => {
    try {
      const resAgentes = await axiosCliente.get("/agents");
      setAgentes(normalizarRespuesta(resAgentes));
      setWarning("");
    } catch (error) {
      console.log("ERROR AGENTES:", error.response?.data || error);
      setAgentes([]);

      if (puedeGestionar) {
        setWarning(
          "Los grupos se cargaron correctamente, pero no se pudo cargar la lista de agentes disponibles.",
        );
      }
    }
  };

  const obtenerCategoriasDisponibles = async () => {
    try {
      const res = await axiosCliente.get("/systems");
      const categorias = normalizarRespuesta(res);

      const activas = categorias.filter(
        (categoria) => Number(categoria.estado) === 1,
      );

      setCategoriasActivas(activas);

      setCategoriasDisponibles(
        activas.filter((categoria) => !categoria.support_group_id),
      );
    } catch (error) {
      console.log("ERROR CATEGORIAS:", error.response?.data || error);
      setCategoriasActivas([]);
      setCategoriasDisponibles([]);
    }
  };

  const obtenerDatos = async () => {
    setLoading(true);
    setError("");
    setWarning("");

    try {
      await obtenerGrupos();

      if (puedeGestionar) {
        await obtenerAgentes();
        await obtenerCategoriasDisponibles();
      }
    } catch (error) {
      console.log("ERROR GRUPOS:", error.response?.data || error);
      setError(
        error.response?.data?.message ||
          "No se pudieron cargar los grupos de soporte.",
      );
    } finally {
      setLoading(false);
    }
  };

  const cambiarValor = (e) => {
    const { name, value } = e.target;

    setFormulario((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const cambiarCategorias = (e) => {
    const value = e.target.value;

    const valores = Array.isArray(value)
      ? value
      : String(value || "").split(",");

    const ids = valores
      .map((id) => Number(id))
      .filter((id) => Number.isInteger(id) && id > 0);

    setFormulario((prev) => ({
      ...prev,
      system_ids: ids,
    }));

    setError("");
  };

  const crearGrupo = async (e) => {
    e.preventDefault();

    if (!puedeGestionar) {
      setError("No tienes permiso para crear grupos de soporte.");
      setOk("");
      return;
    }

    if (!formulario.system_ids.length) {
      setError("Selecciona al menos una categoría.");
      setOk("");
      return;
    }

    setError("");
    setOk("");
    setCargando(true);

    try {
      await axiosCliente.post("/support-groups", formulario);

      setFormulario({
        nombre: "",
        descripcion: "",
        system_ids: [],
      });

      setOk("Grupo creado correctamente.");
      await obtenerDatos();
    } catch (error) {
      console.log("ERROR CREAR GRUPO:", error.response?.data || error);

      const errores = error.response?.data?.errors;

      if (errores) {
        setError(Object.values(errores).flat().join(" "));
      } else {
        setError(error.response?.data?.message || "No se pudo crear el grupo");
      }
    } finally {
      setCargando(false);
    }
  };

  /*
   * Abre el modal de edición y carga las categorías que
   * actualmente pertenecen al grupo.
   */
  const abrirEditarGrupo = (grupo) => {
    if (!puedeGestionar) return;

    const systemIds = Array.isArray(grupo.systems)
      ? grupo.systems
          .map((categoria) => Number(categoria.id))
          .filter((id) => Number.isInteger(id) && id > 0)
      : [];

    setGrupoEditando(grupo);

    setFormularioEdicion({
      nombre: grupo.nombre || "",
      descripcion: grupo.descripcion || "",
      system_ids: systemIds,
    });

    setErrorEdicion("");
    setModalEditarAbierto(true);
  };

  const cerrarEditarGrupo = () => {
    if (guardandoEdicion) return;

    setModalEditarAbierto(false);
    setGrupoEditando(null);
    setErrorEdicion("");

    setFormularioEdicion({
      nombre: "",
      descripcion: "",
      system_ids: [],
    });
  };

  const cambiarValorEdicion = (e) => {
    const { name, value } = e.target;

    setFormularioEdicion((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /*
   * Agrega o quita una categoría sin reemplazar las demás
   * que ya estaban seleccionadas en el grupo.
   */
  const alternarCategoriaEdicion = (categoriaId) => {
    const id = Number(categoriaId);

    if (!Number.isInteger(id) || id <= 0) return;

    setFormularioEdicion((prev) => {
      const actuales = Array.isArray(prev.system_ids)
        ? prev.system_ids.map((valor) => Number(valor))
        : [];

      const seleccionada = actuales.includes(id);

      return {
        ...prev,
        system_ids: seleccionada
          ? actuales.filter((valor) => valor !== id)
          : [...actuales, id],
      };
    });

    setErrorEdicion("");
  };

  const guardarEdicionGrupo = async (e) => {
    e.preventDefault();

    if (!grupoEditando?.id || guardandoEdicion) return;

    const nombre = formularioEdicion.nombre.trim();

    if (!nombre) {
      setErrorEdicion("El nombre del grupo es obligatorio.");
      return;
    }

    if (!formularioEdicion.system_ids.length) {
      setErrorEdicion("Selecciona al menos una categoría.");
      return;
    }

    setGuardandoEdicion(true);
    setErrorEdicion("");
    setError("");
    setOk("");

    try {
      const respuesta = await axiosCliente.put(
        `/support-groups/${grupoEditando.id}`,
        {
          nombre,
          descripcion: formularioEdicion.descripcion.trim(),
          system_ids: formularioEdicion.system_ids,
        },
      );

      setOk(
        respuesta.data?.message ||
          "Grupo y categorías actualizados correctamente.",
      );

      setModalEditarAbierto(false);
      setGrupoEditando(null);
      setErrorEdicion("");

      setFormularioEdicion({
        nombre: "",
        descripcion: "",
        system_ids: [],
      });

      /*
       * Se vuelven a cargar todos los datos porque las categorías
       * disponibles pudieron cambiar después de la edición.
       */
      await obtenerDatos();
    } catch (error) {
      console.log("ERROR EDITAR GRUPO:", error.response?.data || error);

      const errores = error.response?.data?.errors;

      if (errores) {
        setErrorEdicion(Object.values(errores).flat().join(" "));
      } else {
        setErrorEdicion(
          error.response?.data?.message ||
            "No fue posible actualizar el grupo.",
        );
      }
    } finally {
      setGuardandoEdicion(false);
    }
  };

  const cambiarAgenteGrupo = (grupoId, userId) => {
    setAgenteSeleccionado((prev) => ({
      ...prev,
      [grupoId]: userId,
    }));
  };

  const agregarAgente = async (grupoId) => {
    if (!puedeGestionar) {
      setError("No tienes permiso para agregar agentes a grupos.");
      setOk("");
      return;
    }

    const userId = agenteSeleccionado[grupoId];

    if (!userId) {
      setError("Selecciona un agente.");
      setOk("");
      return;
    }

    try {
      setError("");
      setOk("");

      await axiosCliente.post(`/support-groups/${grupoId}/agents`, {
        user_id: userId,
      });

      setAgenteSeleccionado((prev) => ({
        ...prev,
        [grupoId]: "",
      }));

      setOk("Agente agregado correctamente.");
      await obtenerDatos();
    } catch (error) {
      console.log("ERROR AGREGAR AGENTE:", error.response?.data || error);
      setError(error.response?.data?.message || "No se pudo agregar el agente");
    }
  };

  const quitarAgente = async (grupoId, userId) => {
    if (!puedeGestionar) {
      setError("No tienes permiso para quitar agentes de grupos.");
      setOk("");
      return;
    }

    const confirmar = window.confirm(
      "¿Seguro que deseas quitar este agente del grupo?",
    );

    if (!confirmar) return;

    try {
      setError("");
      setOk("");

      await axiosCliente.delete(`/support-groups/${grupoId}/agents/${userId}`);

      setOk("Agente quitado correctamente.");
      await obtenerDatos();
    } catch (error) {
      console.log("ERROR QUITAR AGENTE:", error.response?.data || error);
      setError(error.response?.data?.message || "No se pudo quitar el agente");
    }
  };

  const nombreAgente = (agente) =>
    `${agente.name || ""} ${agente.apellido_paterno || ""} ${
      agente.apellido_materno || ""
    }`.trim();

  const inicialAgente = (agente) => {
    const nombre = nombreAgente(agente);
    return nombre ? nombre.charAt(0).toUpperCase() : "A";
  };

  const gruposFiltrados = useMemo(() => {
    const texto = normalizarTexto(busqueda);

    if (!texto) return grupos;

    return grupos.filter((grupo) => {
      const agentesGrupo = (grupo.agents || [])
        .map((agente) => `${nombreAgente(agente)} ${agente.email || ""}`)
        .join(" ");

      const categoriasGrupo = (grupo.systems || [])
        .map(
          (categoria) => `${categoria.nombre || ""} ${categoria.prefijo || ""}`,
        )
        .join(" ");

      const baseBusqueda = [
        grupo.nombre,
        grupo.descripcion,
        agentesGrupo,
        categoriasGrupo,
      ]
        .join(" ")
        .toLowerCase();

      return baseBusqueda.includes(texto);
    });
  }, [grupos, busqueda]);

  const gruposPaginados = useMemo(() => {
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;

    return gruposFiltrados.slice(start, end);
  }, [gruposFiltrados, page, rowsPerPage]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(Number(event.target.value));
    setPage(0);
  };

  const PaginacionGrupos = () => (
    <TablePagination
      component="div"
      count={gruposFiltrados.length}
      page={page}
      rowsPerPage={rowsPerPage}
      onPageChange={handleChangePage}
      onRowsPerPageChange={handleChangeRowsPerPage}
      rowsPerPageOptions={[4, 6, 10, 25]}
      labelRowsPerPage="Grupos por página"
      labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
      sx={{
        borderTop: "1px solid #e5e7eb",
        bgcolor: "#ffffff",
        ".MuiTablePagination-toolbar": {
          flexWrap: { xs: "wrap", sm: "nowrap" },
          justifyContent: { xs: "center", sm: "flex-end" },
          rowGap: 1,
        },
      }}
    />
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
            Grupos de soporte
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Consulta grupos de atención, categorías asociadas y agentes
            responsables por área o especialidad.
          </Typography>
        </Box>

        <Chip
          label={`${grupos.length} grupos`}
          color="primary"
          variant="outlined"
          sx={{
            fontWeight: 800,
            width: { xs: "fit-content", sm: "auto" },
          }}
        />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {warning && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {warning}
        </Alert>
      )}

      {ok && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {ok}
        </Alert>
      )}

      {puedeGestionar && (
        <Paper
          sx={{
            p: { xs: 1.5, sm: 2, md: 3 },
            borderRadius: 3,
            boxShadow: 1,
            mb: 4,
            border: "1px solid #e5e7eb",
          }}
        >
          <Box mb={2}>
            <Typography fontWeight={900} sx={{ fontSize: { xs: 18, md: 20 } }}>
              Crear grupo
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Crea un grupo para organizar a los agentes que atenderán tickets
              por área o especialidad.
            </Typography>
          </Box>

          <Box component="form" onSubmit={crearGrupo}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 5 }}>
                <TextField
                  fullWidth
                  label="Nombre del grupo"
                  name="nombre"
                  value={formulario.nombre}
                  onChange={cambiarValor}
                  required
                  disabled={cargando}
                  size="small"
                />
              </Grid>

              <Grid size={{ xs: 12, md: 7 }}>
                <TextField
                  fullWidth
                  label="Descripción del grupo"
                  name="descripcion"
                  value={formulario.descripcion}
                  onChange={cambiarValor}
                  disabled={cargando}
                  size="small"
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Categorías que atenderá este grupo"
                  value={
                    Array.isArray(formulario.system_ids)
                      ? formulario.system_ids
                      : []
                  }
                  onChange={cambiarCategorias}
                  disabled={cargando || categoriasDisponibles.length === 0}
                  SelectProps={{
                    multiple: true,
                    renderValue: (seleccionadas) => {
                      const ids = (
                        Array.isArray(seleccionadas)
                          ? seleccionadas
                          : [seleccionadas]
                      ).map((id) => Number(id));

                      return categoriasDisponibles
                        .filter((categoria) =>
                          ids.includes(Number(categoria.id)),
                        )
                        .map((categoria) => categoria.nombre)
                        .join(", ");
                    },
                  }}
                  helperText={
                    categoriasDisponibles.length
                      ? "Selecciona una o varias categorías que serán atendidas por este grupo."
                      : "Todas las categorías activas ya tienen un grupo de soporte asignado."
                  }
                >
                  {categoriasDisponibles.map((categoria) => (
                    <MenuItem key={categoria.id} value={Number(categoria.id)}>
                      {categoria.nombre}
                      {categoria.prefijo ? ` (${categoria.prefijo})` : ""}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>

            <Box
              mt={3}
              display="flex"
              justifyContent={{ xs: "stretch", sm: "flex-start" }}
            >
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
                  py: 1,
                  maxWidth: { xs: "100%", sm: 180 },
                }}
              >
                {cargando ? "Creando..." : "Crear grupo"}
              </Button>
            </Box>
          </Box>
        </Paper>
      )}

      {grupos.length === 0 ? (
        <Paper
          sx={{
            p: 4,
            borderRadius: 3,
            border: "1px dashed #cbd5e1",
            bgcolor: "#f8fafc",
            textAlign: "center",
          }}
        >
          <Typography fontWeight={900}>No hay grupos registrados.</Typography>

          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Aún no existen grupos de soporte para esta empresa.
          </Typography>
        </Paper>
      ) : (
        <Paper
          sx={{
            p: { xs: 1.5, sm: 2, md: 3 },
            borderRadius: 3,
            boxShadow: 1,
            border: "1px solid #e5e7eb",
          }}
        >
          <Stack spacing={2}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "stretch", md: "center" }}
              spacing={1.5}
            >
              <Box>
                <Typography
                  fontWeight={900}
                  sx={{ fontSize: { xs: 18, md: 20 } }}
                >
                  Grupos registrados
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  Mostrando {gruposFiltrados.length} resultado(s).
                </Typography>
              </Box>

              <Chip
                label={`${gruposFiltrados.length} grupo(s)`}
                color="primary"
                variant="outlined"
                sx={{
                  fontWeight: 800,
                  alignSelf: { xs: "flex-start", md: "center" },
                }}
              />
            </Stack>

            <TextField
              fullWidth
              size="small"
              label="Buscar grupo"
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
              placeholder="Nombre, descripción, categoría, agente o correo"
            />

            {gruposFiltrados.length === 0 ? (
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
                <Typography fontWeight={800}>
                  No hay grupos que coincidan con la búsqueda.
                </Typography>

                <Typography variant="body2" mt={0.5}>
                  Limpia el buscador para ver todos los grupos.
                </Typography>
              </Box>
            ) : (
              <>
                <Grid container spacing={{ xs: 2, md: 3 }} alignItems="stretch">
                  {gruposPaginados.map((grupo) => (
                    <Grid size={{ xs: 12, lg: 6 }} key={grupo.id}>
                      <Paper
                        sx={{
                          height: "100%",
                          p: { xs: 1.5, sm: 2, md: 2.5 },
                          borderRadius: 3,
                          boxShadow: "none",
                          border: "1px solid #e5e7eb",
                          display: "flex",
                          flexDirection: "column",
                          gap: 2,
                          overflow: "hidden",
                          bgcolor: "#ffffff",
                        }}
                      >
                        <Box>
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="flex-start"
                            spacing={1.5}
                            mb={1}
                          >
                            <Box sx={{ minWidth: 0, flex: 1 }}>
                              <Stack
                                direction="row"
                                spacing={0.8}
                                alignItems="center"
                              >
                                <Typography
                                  fontWeight={900}
                                  sx={{
                                    minWidth: 0,
                                    fontSize: { xs: 17, md: 18 },
                                    lineHeight: 1.25,
                                    wordBreak: "break-word",
                                  }}
                                >
                                  {grupo.nombre}
                                </Typography>

                                {puedeGestionar && (
                                  <Tooltip title="Editar grupo" arrow>
                                    <IconButton
                                      size="small"
                                      onClick={() => abrirEditarGrupo(grupo)}
                                      sx={{
                                        width: 30,
                                        height: 30,
                                        flexShrink: 0,
                                        border: "1px solid #dbe2ea",
                                        borderRadius: 1.5,
                                        color: "#2563eb",
                                        bgcolor: "#ffffff",
                                        "&:hover": {
                                          bgcolor: "#eff6ff",
                                        },
                                      }}
                                    >
                                      <EditOutlinedIcon sx={{ fontSize: 17 }} />
                                    </IconButton>
                                  </Tooltip>
                                )}
                              </Stack>
                            </Box>

                            <Stack
                              direction="row"
                              spacing={0.8}
                              sx={{
                                flexShrink: 0,
                                flexWrap: "wrap",
                                justifyContent: "flex-end",
                                rowGap: 0.8,
                              }}
                            >
                              <Chip
                                size="small"
                                label={`${grupo.systems?.length || 0} categoría(s)`}
                                variant="outlined"
                                color="secondary"
                                sx={{ fontWeight: 800 }}
                              />

                              <Chip
                                size="small"
                                label={`${grupo.agents?.length || 0} agentes`}
                                color="primary"
                                sx={{ fontWeight: 800 }}
                              />
                            </Stack>
                          </Stack>

                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              lineHeight: 1.55,
                              display: "-webkit-box",
                              WebkitLineClamp: { xs: 2, md: 3 },
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }}
                          >
                            {grupo.descripcion || "Sin descripción"}
                          </Typography>
                        </Box>

                        <Divider />

                        <Box>
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                            spacing={1}
                            sx={{ mb: 1 }}
                          >
                            <Typography fontWeight={900} sx={{ fontSize: 14 }}>
                              Categorías asignadas
                            </Typography>

                            <Chip
                              size="small"
                              label={`${grupo.systems?.length || 0} categoría(s)`}
                              variant="outlined"
                              color={
                                grupo.systems?.length > 0
                                  ? "secondary"
                                  : "default"
                              }
                              sx={{
                                fontWeight: 800,
                                flexShrink: 0,
                              }}
                            />
                          </Stack>

                          {grupo.systems && grupo.systems.length > 0 ? (
                            <Stack
                              direction="row"
                              spacing={1}
                              sx={{
                                flexWrap: "wrap",
                                rowGap: 1,
                              }}
                            >
                              {grupo.systems.map((categoria) => (
                                <Chip
                                  key={categoria.id}
                                  label={
                                    categoria.nombre || "Categoría sin nombre"
                                  }
                                  size="small"
                                  variant="outlined"
                                  sx={{
                                    fontWeight: 700,
                                    maxWidth: "100%",
                                  }}
                                />
                              ))}
                            </Stack>
                          ) : (
                            <Box
                              sx={{
                                border: "1px dashed #cbd5e1",
                                borderRadius: 2.5,
                                bgcolor: "#f8fafc",
                                p: 1.5,
                                textAlign: "center",
                              }}
                            >
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Este grupo no tiene categorías asignadas.
                              </Typography>
                            </Box>
                          )}
                        </Box>

                        <Divider />

                        {puedeGestionar && (
                          <>
                            <Box>
                              <Typography
                                fontWeight={900}
                                mb={1.2}
                                sx={{ fontSize: 14 }}
                              >
                                Agregar agente
                              </Typography>

                              <Grid container spacing={1.5} alignItems="center">
                                <Grid size={{ xs: 12, md: 8 }}>
                                  <TextField
                                    select
                                    fullWidth
                                    size="small"
                                    label="Selecciona un agente"
                                    value={agenteSeleccionado[grupo.id] || ""}
                                    onChange={(e) =>
                                      cambiarAgenteGrupo(
                                        grupo.id,
                                        e.target.value,
                                      )
                                    }
                                    disabled={agentes.length === 0}
                                  >
                                    <MenuItem value="">
                                      Selecciona un agente
                                    </MenuItem>

                                    {agentes.map((agente) => (
                                      <MenuItem
                                        key={agente.id}
                                        value={agente.id}
                                      >
                                        {nombreAgente(agente)}
                                      </MenuItem>
                                    ))}
                                  </TextField>
                                </Grid>

                                <Grid size={{ xs: 12, md: 4 }}>
                                  <Button
                                    fullWidth
                                    variant="outlined"
                                    onClick={() => agregarAgente(grupo.id)}
                                    disabled={agentes.length === 0}
                                    sx={{
                                      borderRadius: 2,
                                      textTransform: "none",
                                      fontWeight: 800,
                                      minHeight: 40,
                                    }}
                                  >
                                    Agregar
                                  </Button>
                                </Grid>
                              </Grid>
                            </Box>

                            <Divider />
                          </>
                        )}

                        <Box sx={{ flex: 1, minHeight: 0 }}>
                          <Typography
                            fontWeight={900}
                            mb={1}
                            sx={{ fontSize: 14 }}
                          >
                            Agentes del grupo
                          </Typography>

                          {grupo.agents && grupo.agents.length > 0 ? (
                            <Stack
                              spacing={1}
                              sx={{
                                maxHeight: { xs: 260, md: 310 },
                                overflowY: "auto",
                                pr: 0.3,
                              }}
                            >
                              {grupo.agents.map((agente) => (
                                <Box
                                  key={agente.id}
                                  sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    gap: 1.2,
                                    border: "1px solid #e5e7eb",
                                    borderRadius: 2.5,
                                    p: 1.2,
                                    bgcolor: "#f8fafc",
                                  }}
                                >
                                  <Stack
                                    direction="row"
                                    spacing={1.2}
                                    alignItems="center"
                                    sx={{ minWidth: 0, flex: 1 }}
                                  >
                                    <Box
                                      sx={{
                                        width: 34,
                                        height: 34,
                                        borderRadius: "50%",
                                        bgcolor: "#dbeafe",
                                        color: "#1d4ed8",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontWeight: 900,
                                        flexShrink: 0,
                                      }}
                                    >
                                      {inicialAgente(agente)}
                                    </Box>

                                    <Box sx={{ minWidth: 0 }}>
                                      <Typography
                                        variant="body2"
                                        fontWeight={800}
                                        sx={{
                                          wordBreak: "break-word",
                                          lineHeight: 1.3,
                                        }}
                                      >
                                        {nombreAgente(agente)}
                                      </Typography>

                                      {agente.email && (
                                        <Typography
                                          variant="caption"
                                          color="text.secondary"
                                          noWrap
                                          display="block"
                                        >
                                          {agente.email}
                                        </Typography>
                                      )}
                                    </Box>
                                  </Stack>

                                  {puedeGestionar && (
                                    <Tooltip title="Quitar agente" arrow>
                                      <IconButton
                                        size="small"
                                        color="error"
                                        onClick={() =>
                                          quitarAgente(grupo.id, agente.id)
                                        }
                                        sx={{
                                          width: 36,
                                          height: 36,
                                          border: "1px solid #fecaca",
                                          bgcolor: "#fef2f2",
                                          flexShrink: 0,
                                          "&:hover": {
                                            bgcolor: "#fee2e2",
                                          },
                                        }}
                                      >
                                        <DeleteIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  )}
                                </Box>
                              ))}
                            </Stack>
                          ) : (
                            <Box
                              sx={{
                                border: "1px dashed #cbd5e1",
                                borderRadius: 2.5,
                                bgcolor: "#f8fafc",
                                p: 2,
                                textAlign: "center",
                              }}
                            >
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Este grupo no tiene agentes asignados.
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>

                <Paper
                  sx={{
                    borderRadius: 2,
                    border: "1px solid #e5e7eb",
                    overflow: "hidden",
                    boxShadow: "none",
                  }}
                >
                  <PaginacionGrupos />
                </Paper>
              </>
            )}
          </Stack>
        </Paper>
      )}

      <Dialog
        open={modalEditarAbierto}
        onClose={cerrarEditarGrupo}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 3,
          },
        }}
      >
        <Box component="form" onSubmit={guardarEdicionGrupo}>
          <DialogTitle
            sx={{
              px: { xs: 2, sm: 3 },
              py: 2,
              borderBottom: "1px solid #e5e7eb",
            }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              spacing={2}
            >
              <Box>
                <Typography
                  component="div"
                  sx={{
                    color: "#0f172a",
                    fontSize: 20,
                    fontWeight: 900,
                  }}
                >
                  Editar grupo de soporte
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.25 }}
                >
                  Modifica el nombre, descripción o categorías asignadas al
                  grupo.
                </Typography>
              </Box>

              <IconButton
                onClick={cerrarEditarGrupo}
                disabled={guardandoEdicion}
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
            {errorEdicion && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errorEdicion}
              </Alert>
            )}

            <Stack spacing={2}>
              <TextField
                fullWidth
                required
                size="small"
                label="Nombre del grupo"
                name="nombre"
                value={formularioEdicion.nombre}
                onChange={cambiarValorEdicion}
                disabled={guardandoEdicion}
              />

              <TextField
                fullWidth
                multiline
                minRows={3}
                size="small"
                label="Descripción"
                name="descripcion"
                value={formularioEdicion.descripcion}
                onChange={cambiarValorEdicion}
                disabled={guardandoEdicion}
              />

              <TextField
                select
                fullWidth
                size="small"
                label="Categorías asignadas"
                value={
                  Array.isArray(formularioEdicion.system_ids)
                    ? formularioEdicion.system_ids
                    : []
                }
                onChange={() => {}}
                disabled={
                  guardandoEdicion || categoriasParaEdicion.length === 0
                }
                SelectProps={{
                  multiple: true,
                  renderValue: (seleccionadas) => {
                    const ids = (
                      Array.isArray(seleccionadas)
                        ? seleccionadas
                        : [seleccionadas]
                    ).map((id) => Number(id));

                    return categoriasParaEdicion
                      .filter((categoria) => ids.includes(Number(categoria.id)))
                      .map((categoria) => categoria.nombre)
                      .join(", ");
                  },
                }}
                helperText="Puedes conservar, agregar o quitar categorías asignadas a este grupo."
              >
                {categoriasParaEdicion.map((categoria) => {
                  const categoriaId = Number(categoria.id);
                  const seleccionada = formularioEdicion.system_ids
                    .map((id) => Number(id))
                    .includes(categoriaId);

                  return (
                    <MenuItem
                      key={categoria.id}
                      value={categoriaId}
                      onClick={(event) => {
                        event.preventDefault();
                        alternarCategoriaEdicion(categoriaId);
                      }}
                    >
                      <Checkbox
                        size="small"
                        checked={seleccionada}
                        tabIndex={-1}
                        disableRipple
                        sx={{ mr: 1 }}
                      />

                      {categoria.nombre}
                      {categoria.prefijo ? ` (${categoria.prefijo})` : ""}
                    </MenuItem>
                  );
                })}
              </TextField>
            </Stack>
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
              color="inherit"
              onClick={cerrarEditarGrupo}
              disabled={guardandoEdicion}
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
              disabled={guardandoEdicion}
              sx={{
                minWidth: 150,
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 900,
                boxShadow: "none",
              }}
            >
              {guardandoEdicion ? "Guardando..." : "Guardar cambios"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}

export default GruposSoporte;