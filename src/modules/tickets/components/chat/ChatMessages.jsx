import { Box, Stack, Typography } from "@mui/material";
import ChatBubble from "./ChatBubble";
import SystemMessage from "./SystemMessage";

export default function ChatMessages({
  messages,
  chatRef,
  esMensajeSistema,
  esMio,
  inicial,
  abrirArchivo,
  getArchivoUrl,
  puedeEliminarMensaje,
  eliminarMensaje,
}) {
  const lista = Array.isArray(messages) ? messages : [];

  const mismaFecha = (a, b) => {
    if (!a?.created_at || !b?.created_at) return false;

    const fechaA = new Date(String(a.created_at).replace(" ", "T"));
    const fechaB = new Date(String(b.created_at).replace(" ", "T"));

    if (Number.isNaN(fechaA.getTime()) || Number.isNaN(fechaB.getTime())) {
      return false;
    }

    return fechaA.toDateString() === fechaB.toDateString();
  };

  const mismoUsuario = (a, b) => {
    if (!a || !b) return false;
    if (esMensajeSistema(a) || esMensajeSistema(b)) return false;

    return String(a.user_id) === String(b.user_id);
  };

  const formatoFecha = (fecha) => {
    if (!fecha) return "";

    const parsed = new Date(String(fecha).replace(" ", "T"));

    if (Number.isNaN(parsed.getTime())) {
      return fecha;
    }

    return parsed.toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  if (lista.length === 0) {
    return (
      <Stack spacing={1}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            py: { xs: 4, md: 6 },
            px: 2,
          }}
        >
          <Box
            sx={{
              maxWidth: 360,
              px: 2,
              py: 1.4,
              borderRadius: 3,
              bgcolor: "rgba(255,255,255,0.88)",
              border: "1px solid rgba(226,232,240,0.9)",
              boxShadow: "0 1px 2px rgba(15,23,42,0.10)",
              textAlign: "center",
            }}
          >
            <Typography
              fontWeight={900}
              sx={{
                fontSize: { xs: 13, md: 14 },
                color: "#334155",
              }}
            >
              Aún no hay mensajes
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 0.4,
                fontSize: { xs: 12, md: 13 },
                lineHeight: 1.4,
              }}
            >
              Escribe un mensaje para iniciar el seguimiento del ticket.
            </Typography>
          </Box>
        </Box>

        <div ref={chatRef} />
      </Stack>
    );
  }

  return (
    <Stack
      spacing={{ xs: 0.25, md: 0.4 }}
      sx={{
        width: "100%",
        minWidth: 0,
        pb: { xs: 1, md: 1.5 },
      }}
    >
      {lista.map((msg, index) => {
        const sistema = esMensajeSistema(msg);
        const propio = esMio(msg);

        const anterior = lista[index - 1];
        const siguiente = lista[index + 1];

        const mostrarFecha = !mismaFecha(anterior, msg);

        const esPrimeroGrupo = !mismoUsuario(anterior, msg);
        const esUltimoGrupo = !mismoUsuario(msg, siguiente);

        return (
          <Box
            key={msg.id || `${msg.created_at}-${index}`}
            sx={{
              width: "100%",
              minWidth: 0,
            }}
          >
            {mostrarFecha && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  my: { xs: 1.5, md: 2 },
                  px: 1,
                }}
              >
                <Typography
                  sx={{
                    maxWidth: "100%",
                    px: { xs: 1.4, md: 2 },
                    py: 0.6,
                    borderRadius: 999,
                    bgcolor: "rgba(255,255,255,0.9)",
                    color: "#475569",
                    fontSize: { xs: 11.5, md: 12 },
                    fontWeight: 900,
                    lineHeight: 1.2,
                    boxShadow: "0 1px 2px rgba(15,23,42,0.12)",
                    border: "1px solid rgba(226,232,240,0.75)",
                    textAlign: "center",
                  }}
                >
                  {formatoFecha(msg.created_at)}
                </Typography>
              </Box>
            )}

            <Box
              sx={{
                width: "100%",
                minWidth: 0,
                display: "flex",
                justifyContent: sistema
                  ? "center"
                  : propio
                    ? "flex-end"
                    : "flex-start",
                mb: esUltimoGrupo ? { xs: 0.9, md: 1 } : 0.25,
                px: { xs: 0.2, sm: 0.5, md: 0.8 },
              }}
            >
              {sistema ? (
                <SystemMessage message={msg} />
              ) : (
                <ChatBubble
                  msg={msg}
                  esMio={esMio}
                  inicial={inicial}
                  abrirArchivo={abrirArchivo}
                  getArchivoUrl={getArchivoUrl}
                  puedeEliminarMensaje={puedeEliminarMensaje}
                  eliminarMensaje={eliminarMensaje}
                  esPrimeroGrupo={esPrimeroGrupo}
                  esUltimoGrupo={esUltimoGrupo}
                />
              )}
            </Box>
          </Box>
        );
      })}

      <div ref={chatRef} />
    </Stack>
  );
}