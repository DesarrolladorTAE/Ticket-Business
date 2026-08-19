import { useEffect, useState } from "react";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import BusinessIcon from "@mui/icons-material/Business";
import AddBusinessIcon from "@mui/icons-material/AddBusiness";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import CloseIcon from "@mui/icons-material/Close";

import axiosCliente from "../../../services/axiosCliente";

export default function MiEmpresa() {
  const [empresa, setEmpresa] = useState(null);

  const [formulario, setFormulario] = useState({
    nombre: "",
    razon_social: "",
    correo: "",
    telefono: "",
  });

  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  /*
   * Nueva empresa
   */
  const [modalNuevaEmpresa, setModalNuevaEmpresa] =
    useState(false);

  const [creandoEmpresa, setCreandoEmpresa] =
    useState(false);

  const [errorNuevaEmpresa, setErrorNuevaEmpresa] =
    useState("");

  const [formularioNuevaEmpresa, setFormularioNuevaEmpresa] =
    useState({
      nombre: "",
      razon_social: "",
      correo: "",
      telefono: "",
    });

  useEffect(() => {
    cargarEmpresa();
  }, []);

  /*
   * Cargar empresa activa
   */
  const cargarEmpresa = async () => {
    setLoading(true);
    setError("");

    try {
      const response =
        await axiosCliente.get("/companies");

      const data = response.data?.data;

      const empresaActual = Array.isArray(data)
        ? data[0] || null
        : data || null;

      if (!empresaActual) {
        setError(
          "No se encontró la empresa activa.",
        );

        setEmpresa(null);
        return;
      }

      setEmpresa(empresaActual);

      setFormulario({
        nombre:
          empresaActual.nombre || "",

        razon_social:
          empresaActual.razon_social || "",

        correo:
          empresaActual.correo || "",

        telefono:
          empresaActual.telefono || "",
      });
    } catch (error) {
      console.log(
        "ERROR CARGAR EMPRESA:",
        error.response?.data || error,
      );

      setError(
        error.response?.data?.message ||
          "No fue posible cargar los datos de la empresa.",
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * Cambiar datos de empresa activa
   */
  const cambiarValor = (event) => {
    const { name, value } =
      event.target;

    setFormulario((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setOk("");
  };

  /*
   * Guardar empresa activa
   */
  const guardarEmpresa = async (event) => {
    event.preventDefault();

    if (
      !empresa?.id ||
      guardando
    ) {
      return;
    }

    const nombre =
      formulario.nombre.trim();

    if (!nombre) {
      setError(
        "El nombre de la empresa es obligatorio.",
      );

      return;
    }

    setGuardando(true);
    setError("");
    setOk("");

    try {
      const response =
        await axiosCliente.put(
          `/companies/${empresa.id}`,
          {
            nombre,

            razon_social:
              formulario.razon_social.trim() ||
              null,

            correo:
              formulario.correo.trim() ||
              null,

            telefono:
              formulario.telefono.trim() ||
              null,
          },
        );

      const empresaActualizada =
        response.data?.data ||
        empresa;

      setEmpresa(
        empresaActualizada,
      );

      setFormulario({
        nombre:
          empresaActualizada.nombre ||
          "",

        razon_social:
          empresaActualizada.razon_social ||
          "",

        correo:
          empresaActualizada.correo ||
          "",

        telefono:
          empresaActualizada.telefono ||
          "",
      });

      setOk(
        response.data?.message ||
          "Empresa actualizada correctamente.",
      );
    } catch (error) {
      console.log(
        "ERROR ACTUALIZAR EMPRESA:",
        error.response?.data ||
          error,
      );

      const errores =
        error.response?.data?.errors;

      if (errores) {
        setError(
          Object.values(errores)
            .flat()
            .join(" "),
        );
      } else {
        setError(
          error.response?.data?.message ||
            "No fue posible actualizar la empresa.",
        );
      }
    } finally {
      setGuardando(false);
    }
  };

  /*
   * Abrir modal Nueva empresa
   */
  const abrirNuevaEmpresa = () => {
    setFormularioNuevaEmpresa({
      nombre: "",
      razon_social: "",
      correo: "",
      telefono: "",
    });

    setErrorNuevaEmpresa("");
    setOk("");
    setModalNuevaEmpresa(true);
  };

  /*
   * Cerrar modal Nueva empresa
   */
  const cerrarNuevaEmpresa = () => {
    if (creandoEmpresa) {
      return;
    }

    setModalNuevaEmpresa(false);
    setErrorNuevaEmpresa("");

    setFormularioNuevaEmpresa({
      nombre: "",
      razon_social: "",
      correo: "",
      telefono: "",
    });
  };

  /*
   * Cambiar datos de Nueva empresa
   */
  const cambiarValorNuevaEmpresa = (
    event,
  ) => {
    const { name, value } =
      event.target;

    setFormularioNuevaEmpresa(
      (prev) => ({
        ...prev,
        [name]: value,
      }),
    );

    setErrorNuevaEmpresa("");
  };

  /*
   * Crear nueva empresa
   */
  const crearNuevaEmpresa = async (
    event,
  ) => {
    event.preventDefault();

    if (creandoEmpresa) {
      return;
    }

    const nombre =
      formularioNuevaEmpresa.nombre.trim();

    if (!nombre) {
      setErrorNuevaEmpresa(
        "El nombre de la empresa es obligatorio.",
      );

      return;
    }

    setCreandoEmpresa(true);
    setErrorNuevaEmpresa("");
    setError("");
    setOk("");

    try {
      const response =
        await axiosCliente.post(
          "/companies",
          {
            nombre,

            razon_social:
              formularioNuevaEmpresa.razon_social.trim() ||
              null,

            correo:
              formularioNuevaEmpresa.correo.trim() ||
              null,

            telefono:
              formularioNuevaEmpresa.telefono.trim() ||
              null,
          },
        );

      const nuevaEmpresa =
        response.data?.data;

      setModalNuevaEmpresa(false);

      setFormularioNuevaEmpresa({
        nombre: "",
        razon_social: "",
        correo: "",
        telefono: "",
      });

      setOk(
        nuevaEmpresa?.nombre
          ? `La empresa "${nuevaEmpresa.nombre}" fue creada correctamente. Ya puedes seleccionarla desde el apartado Empresa actual.`
          : response.data?.message ||
              "Empresa creada correctamente.",
      );
    } catch (error) {
      console.log(
        "ERROR CREAR EMPRESA:",
        error.response?.data ||
          error,
      );

      const errores =
        error.response?.data?.errors;

      if (errores) {
        setErrorNuevaEmpresa(
          Object.values(errores)
            .flat()
            .join(" "),
        );
      } else {
        setErrorNuevaEmpresa(
          error.response?.data?.message ||
            "No fue posible crear la empresa.",
        );
      }
    } finally {
      setCreandoEmpresa(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: 320,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* ENCABEZADO */}
      <Stack
        direction={{
          xs: "column",
          sm: "row",
        }}
        justifyContent="space-between"
        alignItems={{
          xs: "stretch",
          sm: "center",
        }}
        spacing={2}
        sx={{
          mb: 3,
        }}
      >
        <Box>
          <Typography
            variant="h5"
            fontWeight={900}
            sx={{
              fontSize: {
                xs: 22,
                md: 26,
              },
            }}
          >
            Mi empresa
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.4,
            }}
          >
            Administra la información
            general de la empresa activa.
          </Typography>
        </Box>

        <Stack
          direction={{
            xs: "column",
            sm: "row",
          }}
          spacing={1}
          alignItems={{
            xs: "stretch",
            sm: "center",
          }}
        >
          {/* EMPRESA ACTUAL */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: {
                xs: "center",
                sm: "flex-start",
              },
              gap: 1,
              px: 1.5,
              py: 0.9,
              minHeight: 40,
              borderRadius: 2,
              bgcolor: "#eff6ff",
              border:
                "1px solid #bfdbfe",
              color: "#1d4ed8",
              maxWidth: "100%",
            }}
          >
            <BusinessIcon
              sx={{
                fontSize: 19,
                flexShrink: 0,
              }}
            />

            <Typography
              fontWeight={800}
              noWrap
              title={
                empresa?.nombre || ""
              }
              sx={{
                fontSize: 13,
                minWidth: 0,
              }}
            >
              {empresa?.nombre ||
                "Empresa"}
            </Typography>
          </Box>

          {/* NUEVA EMPRESA */}
          <Button
            variant="contained"
            onClick={
              abrirNuevaEmpresa
            }
            startIcon={<AddBusinessIcon />}

            sx={{
              minHeight: 40,
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 900,
              boxShadow: "none",
              whiteSpace: "nowrap",
              px: 2,
            }}
          >
            Nueva empresa
          </Button>
        </Stack>
      </Stack>

      {/* MENSAJES */}
      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 2.5,
          }}
        >
          {error}
        </Alert>
      )}

      {ok && (
        <Alert
          severity="success"
          sx={{
            mb: 2.5,
          }}
        >
          {ok}
        </Alert>
      )}

      {/* FORMULARIO EMPRESA ACTUAL */}
      <Paper
        sx={{
          borderRadius: 3,
          border:
            "1px solid #e5e7eb",
          boxShadow: "none",
          overflow: "hidden",
          bgcolor: "#ffffff",
        }}
      >
        <Box
          sx={{
            px: {
              xs: 2,
              sm: 3,
            },
            py: 2.2,
          }}
        >
          <Typography
            fontWeight={900}
            sx={{
              fontSize: {
                xs: 17,
                md: 19,
              },
            }}
          >
            Datos generales
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.3,
            }}
          >
            Estos datos identifican a la
            empresa dentro del sistema.
          </Typography>
        </Box>

        <Divider />

        <Box
          component="form"
          onSubmit={
            guardarEmpresa
          }
          sx={{
            p: {
              xs: 2,
              sm: 3,
            },
          }}
        >
          <Stack spacing={2.2}>
            <TextField
              fullWidth
              required
              size="small"
              label="Nombre de la empresa"
              name="nombre"
              value={
                formulario.nombre
              }
              onChange={
                cambiarValor
              }
              disabled={
                guardando
              }
            />

            <TextField
              fullWidth
              size="small"
              label="Razón social"
              name="razon_social"
              value={
                formulario.razon_social
              }
              onChange={
                cambiarValor
              }
              disabled={
                guardando
              }
            />

            <Stack
              direction={{
                xs: "column",
                md: "row",
              }}
              spacing={2}
            >
              <TextField
                fullWidth
                type="email"
                size="small"
                label="Correo"
                name="correo"
                value={
                  formulario.correo
                }
                onChange={
                  cambiarValor
                }
                disabled={
                  guardando
                }
              />

              <TextField
                fullWidth
                size="small"
                label="Teléfono"
                name="telefono"
                value={
                  formulario.telefono
                }
                onChange={
                  cambiarValor
                }
                disabled={
                  guardando
                }
                inputProps={{
                  maxLength: 20,
                }}
              />
            </Stack>

            <Divider />

            <Box
              sx={{
                display: "flex",
                justifyContent: {
                  xs: "stretch",
                  sm: "flex-end",
                },
              }}
            >
              <Button
                type="submit"
                variant="contained"
                startIcon={
                  guardando
                    ? null
                    : (
                      <SaveOutlinedIcon />
                    )
                }
                disabled={
                  guardando
                }
                fullWidth
                sx={{
                  maxWidth: {
                    xs: "100%",
                    sm: 190,
                  },
                  minHeight: 42,
                  borderRadius: 2,
                  textTransform:
                    "none",
                  fontWeight: 900,
                  boxShadow: "none",
                }}
              >
                {guardando
                  ? "Guardando..."
                  : "Guardar cambios"}
              </Button>
            </Box>
          </Stack>
        </Box>
      </Paper>

      {/* MODAL NUEVA EMPRESA */}
      <Dialog
        open={modalNuevaEmpresa}
        onClose={cerrarNuevaEmpresa}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 3,
          },
        }}
      >
        <Box
          component="form"
          onSubmit={
            crearNuevaEmpresa
          }
        >
          <DialogTitle
            sx={{
              px: {
                xs: 2,
                sm: 3,
              },
              py: 2,
              borderBottom:
                "1px solid #e5e7eb",
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
                    fontSize: 20,
                    fontWeight: 900,
                    color: "#0f172a",
                  }}
                >
                  Nueva empresa
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mt: 0.25,
                  }}
                >
                  Registra una nueva empresa
                  dentro de tu cuenta.
                </Typography>
              </Box>

              <IconButton
                onClick={
                  cerrarNuevaEmpresa
                }
                disabled={
                  creandoEmpresa
                }
                size="small"
              >
                <CloseIcon />
              </IconButton>
            </Stack>
          </DialogTitle>

          <DialogContent
            sx={{
              px: {
                xs: 2,
                sm: 3,
              },
              py:
                "26px !important",
            }}
          >
            {errorNuevaEmpresa && (
              <Alert
                severity="error"
                sx={{
                  mb: 2,
                }}
              >
                {errorNuevaEmpresa}
              </Alert>
            )}

            <Stack spacing={2}>
              <TextField
                fullWidth
                required
                autoFocus
                size="small"
                label="Nombre de la empresa"
                name="nombre"
                value={
                  formularioNuevaEmpresa.nombre
                }
                onChange={
                  cambiarValorNuevaEmpresa
                }
                disabled={
                  creandoEmpresa
                }
              />

              <TextField
                fullWidth
                size="small"
                label="Razón social"
                name="razon_social"
                value={
                  formularioNuevaEmpresa.razon_social
                }
                onChange={
                  cambiarValorNuevaEmpresa
                }
                disabled={
                  creandoEmpresa
                }
              />

              <TextField
                fullWidth
                type="email"
                size="small"
                label="Correo"
                name="correo"
                value={
                  formularioNuevaEmpresa.correo
                }
                onChange={
                  cambiarValorNuevaEmpresa
                }
                disabled={
                  creandoEmpresa
                }
              />

              <TextField
                fullWidth
                size="small"
                label="Teléfono"
                name="telefono"
                value={
                  formularioNuevaEmpresa.telefono
                }
                onChange={
                  cambiarValorNuevaEmpresa
                }
                disabled={
                  creandoEmpresa
                }
                inputProps={{
                  maxLength: 20,
                }}
              />
            </Stack>
          </DialogContent>

          <Divider />

          <DialogActions
            sx={{
              px: {
                xs: 2,
                sm: 3,
              },
              py: 2,
              gap: 1,
            }}
          >
            <Button
              type="button"
              color="inherit"
              onClick={
                cerrarNuevaEmpresa
              }
              disabled={
                creandoEmpresa
              }
              sx={{
                borderRadius: 2,
                textTransform:
                  "none",
                fontWeight: 800,
              }}
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              variant="contained"
              disabled={
                creandoEmpresa
              }
              sx={{
                minWidth: 150,
                borderRadius: 2,
                textTransform:
                  "none",
                fontWeight: 900,
                boxShadow: "none",
              }}
            >
              {creandoEmpresa
                ? "Creando..."
                : "Crear empresa"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}