import { useEffect, useState } from "react";
import axiosCliente from "../../../services/axiosCliente";

import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import AttachFileIcon from "@mui/icons-material/AttachFile";

function NuevoTicketModal({ open, onClose, onCreated }) {
  const [formulario, setFormulario] = useState({
    titulo: "",
    descripcion: "",
    system_id: "",
    category_id: "",
    priority_id: "",
  });

  const [archivo, setArchivo] = useState(null);
  const [sistemas, setSistemas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [prioridades, setPrioridades] = useState([]);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const normalizar = (res) => res?.data?.data || res?.data || [];

  useEffect(() => {
    if (open) cargarCatalogos();
  }, [open]);

  const cargarCatalogos = async () => {
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
          .sort((a, b) => Number(a.orden || 999) - Number(b.orden || 999))
      );

      setCategorias(
        normalizar(resC).filter((categoria) => Number(categoria.estado) === 1)
      );

      setPrioridades(normalizar(resP));
    } catch (error) {
      console.log("ERROR CATÁLOGOS:", error.response?.data || error);
      setError("No se pudieron cargar los catálogos.");
    }
  };

  const categoriasFiltradas = categorias.filter(
    (categoria) => String(categoria.system_id) === String(formulario.system_id)
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
    });

    setArchivo(null);
    setError("");
    onClose();
  };

  const crearTicket = async (e) => {
    e.preventDefault();

    setCargando(true);
    setError("");

    try {
      const formData = new FormData();

      formData.append("titulo", formulario.titulo);
      formData.append("descripcion", formulario.descripcion);
      formData.append("system_id", formulario.system_id);
      formData.append("category_id", formulario.category_id);
      formData.append("priority_id", formulario.priority_id);

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
    <Dialog open={open} onClose={cerrar} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography fontWeight={800}>Crear ticket</Typography>

        <Typography variant="body2" color="text.secondary">
          Completa la información para registrar un nuevo ticket de soporte.
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={crearTicket}>
          <Stack spacing={2}>
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

            <TextField
              select
              fullWidth
              label="Sección"
              name="category_id"
              value={formulario.category_id}
              onChange={cambiarValor}
              disabled={!formulario.system_id}
              required
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
              label="Prioridad"
              name="priority_id"
              value={formulario.priority_id}
              onChange={cambiarValor}
              required
            >
              {prioridades.map((prioridad) => (
                <MenuItem key={prioridad.id} value={prioridad.id}>
                  {prioridad.nombre}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              label="Asunto"
              name="titulo"
              value={formulario.titulo}
              onChange={cambiarValor}
              required
            />

            <TextField
              fullWidth
              multiline
              rows={5}
              label="Descripción"
              name="descripcion"
              value={formulario.descripcion}
              onChange={cambiarValor}
              required
            />

            <Box>
              <Typography fontWeight={700} mb={1}>
                Archivo
              </Typography>

              <Button
                component="label"
                variant="outlined"
                startIcon={<AttachFileIcon />}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 700,
                }}
              >
                Adjuntar archivo
                <input
                  hidden
                  type="file"
                  accept="image/*,video/*,.jfif,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
                  onChange={(e) => setArchivo(e.target.files?.[0] || null)}
                />
              </Button>

              {archivo && (
                <Typography variant="body2" color="text.secondary" mt={1}>
                  Archivo seleccionado: {archivo.name}
                </Typography>
              )}
            </Box>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              justifyContent="flex-end"
              pt={1}
            >
              <Button
                variant="outlined"
                onClick={cerrar}
                disabled={cargando}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 700,
                }}
              >
                Cancelar
              </Button>

              <Button
                type="submit"
                variant="contained"
                disabled={cargando}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 700,
                }}
              >
                {cargando ? "Creando..." : "Crear ticket"}
              </Button>
            </Stack>
          </Stack>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

export default NuevoTicketModal;