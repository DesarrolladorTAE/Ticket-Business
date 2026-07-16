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
  TextField,
  Typography,
} from "@mui/material";

const normalizarRol = (rol) => {
  return String(rol || "")
    .trim()
    .toLowerCase();
};

const obtenerUsuarioActual = () => {
  try {
    return JSON.parse(localStorage.getItem("USUARIO") || "{}");
  } catch (error) {
    return {};
  }
};

function GruposSoporte() {
  const usuario = obtenerUsuarioActual();

  const rolesBase = Array.isArray(usuario?.roles) ? usuario.roles : [];

  const rolesNormalizados = [
    ...rolesBase,
    usuario?.role,
    usuario?.company_role,
  ]
    .filter(Boolean)
    .map((rol) => normalizarRol(rol));

  const isAdmin =
    rolesNormalizados.includes("administrador") ||
    rolesNormalizados.includes("admin");

  const isSupervisor = rolesNormalizados.includes("supervisor");

  const puedeGestionar = isAdmin || isSupervisor;

  const [grupos, setGrupos] = useState([]);
  const [agentes, setAgentes] = useState([]);

  const [formulario, setFormulario] = useState({
    nombre: "",
    descripcion: "",
  });

  const [agenteSeleccionado, setAgenteSeleccionado] = useState({});
  const [loading, setLoading] = useState(true);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [warning, setWarning] = useState("");

  useEffect(() => {
    obtenerDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const obtenerDatos = async () => {
    setLoading(true);
    setError("");
    setWarning("");

    try {
      await obtenerGrupos();

      if (puedeGestionar) {
        await obtenerAgentes();
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
    setFormulario({
      ...formulario,
      [e.target.name]: e.target.value,
    });
  };

  const crearGrupo = async (e) => {
    e.preventDefault();

    if (!puedeGestionar) {
      setError("No tienes permiso para crear grupos de soporte.");
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

  const cambiarAgenteGrupo = (grupoId, userId) => {
    setAgenteSeleccionado({
      ...agenteSeleccionado,
      [grupoId]: userId,
    });
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

      setAgenteSeleccionado({
        ...agenteSeleccionado,
        [grupoId]: "",
      });

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
            Consulta grupos de atención y agentes responsables por área o
            especialidad.
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
            maxWidth: 1000,
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
              <Grid item xs={12} md={5}>
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

              <Grid item xs={12} md={7}>
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
        <Grid container spacing={{ xs: 2, md: 3 }} alignItems="stretch">
          {grupos.map((grupo) => (
            <Grid item xs={12} lg={6} key={grupo.id}>
              <Paper
                sx={{
                  height: "100%",
                  p: { xs: 1.5, sm: 2, md: 2.5 },
                  borderRadius: 3,
                  boxShadow: 1,
                  border: "1px solid #e5e7eb",
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  overflow: "hidden",
                  transition: "0.2s ease",
                  "&:hover": {
                    boxShadow: { xs: 1, md: 4 },
                    transform: { xs: "none", md: "translateY(-2px)" },
                  },
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
                      <Typography
                        fontWeight={900}
                        sx={{
                          fontSize: { xs: 17, md: 18 },
                          lineHeight: 1.25,
                          wordBreak: "break-word",
                        }}
                      >
                        {grupo.nombre}
                      </Typography>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                        mt={0.4}
                      >
                        ID: {grupo.id}
                      </Typography>
                    </Box>

                    <Chip
                      size="small"
                      label={`${grupo.agents?.length || 0} agentes`}
                      color="primary"
                      sx={{
                        fontWeight: 800,
                        flexShrink: 0,
                      }}
                    />
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

                {puedeGestionar && (
                  <>
                    <Box>
                      <Typography fontWeight={900} mb={1} sx={{ fontSize: 14 }}>
                        Agregar agente
                      </Typography>

                      <Grid container spacing={1.5} alignItems="center">
                        <Grid item xs={12} md={8}>
                          <TextField
                            select
                            fullWidth
                            size="small"
                            label="Selecciona un agente"
                            value={agenteSeleccionado[grupo.id] || ""}
                            onChange={(e) =>
                              cambiarAgenteGrupo(grupo.id, e.target.value)
                            }
                            disabled={agentes.length === 0}
                          >
                            <MenuItem value="">Selecciona un agente</MenuItem>

                            {agentes.map((agente) => (
                              <MenuItem key={agente.id} value={agente.id}>
                                {nombreAgente(agente)}
                              </MenuItem>
                            ))}
                          </TextField>
                        </Grid>

                        <Grid item xs={12} md={4}>
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
                  <Typography fontWeight={900} mb={1} sx={{ fontSize: 14 }}>
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
                            flexDirection: { xs: "column", sm: "row" },
                            justifyContent: "space-between",
                            alignItems: { xs: "stretch", sm: "center" },
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
                            sx={{ minWidth: 0 }}
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
                            <Button
                              size="small"
                              color="error"
                              variant="outlined"
                              onClick={() =>
                                quitarAgente(grupo.id, agente.id)
                              }
                              fullWidth
                              sx={{
                                borderRadius: 2,
                                textTransform: "none",
                                fontWeight: 800,
                                maxWidth: { xs: "100%", sm: 100 },
                                flexShrink: 0,
                              }}
                            >
                              Quitar
                            </Button>
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
                      <Typography variant="body2" color="text.secondary">
                        Este grupo no tiene agentes asignados.
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}

export default GruposSoporte;