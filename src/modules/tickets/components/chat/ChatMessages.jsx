import { Box, Stack } from "@mui/material";
import ChatBubble from "./ChatBubble";
import SystemMessage from "./SystemMessage";

export default function ChatMessages({
  messages,
  chatRef,
  esMensajeSistema,
  esMio,
  inicial,
  abrirArchivo,
  puedeEliminarMensaje,
  eliminarMensaje,
}) {
  return (
    <Stack spacing={2}>
      {(messages ?? []).map((msg) => {
        const sistema = esMensajeSistema(msg);

        return (
          <Box
            key={msg.id}
            sx={{
              display: "flex",
              justifyContent: sistema
                ? "center"
                : esMio(msg)
                  ? "flex-end"
                  : "flex-start",
              mb: 1,
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
                puedeEliminarMensaje={puedeEliminarMensaje}
                eliminarMensaje={eliminarMensaje}
              />
            )}
          </Box>
        );
      })}

      <div ref={chatRef} />
    </Stack>
  );
}