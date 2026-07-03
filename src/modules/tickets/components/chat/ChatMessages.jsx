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
  const lista = messages ?? [];

  const mismaFecha = (a, b) => {
    if (!a || !b) return false;

    return (
      new Date(a.created_at).toDateString() ===
      new Date(b.created_at).toDateString()
    );
  };

  const mismoUsuario = (a, b) => {
    if (!a || !b) return false;
    if (esMensajeSistema(a) || esMensajeSistema(b)) return false;

    return String(a.user_id) === String(b.user_id);
  };

  const formatoFecha = (fecha) => {
    if (!fecha) return "";

    return new Date(fecha).toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <Stack spacing={0.4}>
      {lista.map((msg, index) => {
        const sistema = esMensajeSistema(msg);
        const propio = esMio(msg);

        const anterior = lista[index - 1];
        const siguiente = lista[index + 1];

        const mostrarFecha = !mismaFecha(anterior, msg);

        const esPrimeroGrupo = !mismoUsuario(anterior, msg);
        const esUltimoGrupo = !mismoUsuario(msg, siguiente);

        return (
          <Box key={msg.id}>
            {mostrarFecha && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  my: 2,
                }}
              >
                <Typography
                  sx={{
                    px: 2,
                    py: 0.6,
                    borderRadius: 999,
                    bgcolor: "rgba(255,255,255,0.88)",
                    color: "#475569",
                    fontSize: 12,
                    fontWeight: 800,
                    boxShadow: "0 1px 2px rgba(15,23,42,0.12)",
                  }}
                >
                  {formatoFecha(msg.created_at)}
                </Typography>
              </Box>
            )}

            <Box
              sx={{
                display: "flex",
                justifyContent: sistema
                  ? "center"
                  : propio
                    ? "flex-end"
                    : "flex-start",
                mb: esUltimoGrupo ? 1 : 0.25,
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