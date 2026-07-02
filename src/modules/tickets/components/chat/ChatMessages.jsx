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

    const fechaA = new Date(a.created_at).toDateString();
    const fechaB = new Date(b.created_at).toDateString();

    return fechaA === fechaB;
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
    <Stack spacing={1.2}>
      {lista.map((msg, index) => {
        const sistema = esMensajeSistema(msg);
        const propio = esMio(msg);

        const mensajeAnterior = lista[index - 1];
        const mostrarFecha = !mismaFecha(mensajeAnterior, msg);

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
                    bgcolor: "rgba(255,255,255,0.85)",
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
                mb: 0.8,
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