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

function GruposSoporte() {
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

  useEffect(() => {
    obtenerDatos();
  }, []);

  const normalizar = (res) => res?.data?.data || res?.data || [];

  const obtenerDatos = async () => {
    try {
      setError("");

      const [resGrupos, resAgentes] = await Promise.all([
        axiosCliente.get("/support-groups"),
        axiosCliente.get("/agents"),
      ]);

      setGrupos(normalizar(resGrupos));
      setAgentes(normalizar(resAgentes));
    } catch (error) {
      console.log("ERROR GRUPOS:", error.response?.data || error);
      setError("No se pudieron cargar los grupos de soporte");
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

    setError("");
    setCargando(true);

    try {
      await axiosCliente.post("/support-groups", formulario);

      setFormulario({
        nombre: "",
        descripcion: "",
      });

      obtenerDatos();
    } catch (error) {
      console.log("ERROR CREAR GRUPO:", error.response?.data || error);
      setError(error.response?.data?.message || "No se pudo crear el grupo");
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
    const userId = agenteSeleccionado[grupoId];

    if (!userId) {
      setError("Selecciona un agente");
      return;
    }

    try {
      setError("");

      await axiosCliente.post(`/support-groups/${grupoId}/agents`, {
        user_id: userId,
      });

      setAgenteSeleccionado({
        ...agenteSeleccionado,
        [grupoId]: "",
      });

      obtenerDatos();
    } catch (error) {
      console.log("ERROR AGREGAR AGENTE:", error.response?.data || error);
      setError(error.response?.data?.message || "No se pudo agregar el agente");
    }
  };

  const quitarAgente = async (grupoId, userId) => {
    const confirmar = window.confirm(
      "¿Seguro que deseas quitar este agente del grupo?"
    );

    if (!confirmar) return;

    try {
      setError("");

      await axiosCliente.delete(`/support-groups/${grupoId}/agents/${userId}`);
      obtenerDatos();
    } catch (error) {
      console.log("ERROR QUITAR AGENTE:", error.response?.data || error);
      setError(error.response?.data?.message || "No se pudo quitar el agente");
    }
  };

  const nombreAgente = (agente) =>
    `${agente.name || ""} ${agente.apellido_paterno || ""} ${
      agente.apellido_materno || ""
    }`.trim();

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
        <Typography variant="h5" fontWeight="bold">
          Grupos de soporte
        </Typography>

        <Typography variant="body2" color="text.secondary">
          Administra grupos de atención y asigna agentes responsables.
        </Typography>
      </Box>

      <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 1, mb: 3, maxWidth: 900 }}>
        <Typography fontWeight="bold" mb={2}>
          Crear grupo
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

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
              />
            </Grid>

            <Grid item xs={12} md={7}>
              <TextField
                fullWidth
                label="Descripción del grupo"
                name="descripcion"
                value={formulario.descripcion}
                onChange={cambiarValor}
              />
            </Grid>
          </Grid>

          <Box mt={3}>
            <Button type="submit" variant="contained" disabled={cargando}>
              {cargando ? "Creando..." : "Crear grupo"}
            </Button>
          </Box>
        </Box>
      </Paper>

      <Grid container spacing={2}>
        {grupos.map((grupo) => (
          <Grid item xs={12} md={6} key={grupo.id}>
            <Paper sx={{ p: 2.5, borderRadius: 3, boxShadow: 1 }}>
              <Box display="flex" justifyContent="space-between" gap={2} mb={1}>
                <Typography fontWeight="bold">{grupo.nombre}</Typography>

                <Chip
                  size="small"
                  label={`${grupo.agents?.length || 0} agentes`}
                  color="primary"
                />
              </Box>

              <Typography variant="body2" color="text.secondary" mb={2}>
                {grupo.descripcion || "Sin descripción"}
              </Typography>

              <Grid container spacing={1.5} alignItems="center">
                <Grid item xs={12} md={8}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Agregar agente"
                    value={agenteSeleccionado[grupo.id] || ""}
                    onChange={(e) =>
                      cambiarAgenteGrupo(grupo.id, e.target.value)
                    }
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
                  >
                    Agregar
                  </Button>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Typography variant="body2" fontWeight="bold" mb={1}>
                Agentes del grupo
              </Typography>

              {grupo.agents && grupo.agents.length > 0 ? (
                <Stack spacing={1}>
                  {grupo.agents.map((agente) => (
                    <Box
                      key={agente.id}
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      gap={2}
                      sx={{
                        border: "1px solid #e5e7eb",
                        borderRadius: 2,
                        p: 1.2,
                      }}
                    >
                      <Typography variant="body2">
                        {nombreAgente(agente)}
                      </Typography>

                      <Button
                        size="small"
                        color="error"
                        variant="text"
                        onClick={() => quitarAgente(grupo.id, agente.id)}
                      >
                        Quitar
                      </Button>
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Este grupo no tiene agentes asignados.
                </Typography>
              )}
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default GruposSoporte;