import {
  Avatar,
  Box,
  Chip,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";
import AttachmentCard from "./AttachmentCard";

export default function ChatBubble({
  msg,
  esMio,
  inicial,
  abrirArchivo,
  getArchivoUrl,
  puedeEliminarMensaje,
  eliminarMensaje,
  esPrimeroGrupo = true,
  esUltimoGrupo = true,
}) {
  const propio = esMio(msg);
  const interno = msg.visibility === "private";

  const avatarUrl =
    msg.user?.avatar_url ||
    msg.user?.photo_url ||
    msg.user?.foto_url ||
    msg.user?.profile_photo_url ||
    null;

  const hora = msg.created_at
    ? new Date(String(msg.created_at).replace(" ", "T")).toLocaleTimeString(
        "es-MX",
        {
          hour: "2-digit",
          minute: "2-digit",
        },
      )
    : "";

  const bubbleColor = interno ? "#fff4bf" : propio ? "#d9fdd3" : "#ffffff";
  const userColor = propio ? "#075e54" : "#1d4ed8";

  return (
    <Box
      sx={{
        width: "100%",
        minWidth: 0,
        display: "flex",
        justifyContent: propio ? "flex-end" : "flex-start",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-end",
          gap: { xs: 0.6, md: 0.8 },
          flexDirection: propio ? "row-reverse" : "row",
          maxWidth: {
            xs: "96%",
            sm: "88%",
            md: "76%",
          },
          minWidth: 0,
        }}
      >
        {esUltimoGrupo ? (
          <Avatar
            src={avatarUrl || undefined}
            sx={{
              width: { xs: 28, md: 32 },
              height: { xs: 28, md: 32 },
              fontSize: { xs: 11, md: 12 },
              fontWeight: 900,
              bgcolor: propio ? "#128c7e" : "#64748b",
              color: "#ffffff",
              border: "2px solid rgba(255,255,255,0.95)",
              boxShadow: "0 1px 3px rgba(15,23,42,0.18)",
              flexShrink: 0,
            }}
          >
            {!avatarUrl ? inicial(msg) : null}
          </Avatar>
        ) : (
          <Box
            sx={{
              width: { xs: 28, md: 32 },
              flexShrink: 0,
            }}
          />
        )}

        <Box
          sx={{
            position: "relative",
            px: { xs: 1.25, md: 1.45 },
            py: { xs: 0.85, md: 0.95 },
            minWidth: { xs: 90, md: 120 },
            maxWidth: "100%",
            borderRadius: propio
              ? esUltimoGrupo
                ? "15px 15px 4px 15px"
                : "15px"
              : esUltimoGrupo
                ? "15px 15px 15px 4px"
                : "15px",
            bgcolor: bubbleColor,
            border: interno
              ? "1px solid #facc15"
              : "1px solid rgba(15,23,42,0.06)",
            boxShadow: "0 1px 1.5px rgba(15,23,42,0.14)",
            wordBreak: "break-word",
            overflowWrap: "anywhere",
            minWidth: 0,
            "&:before": esUltimoGrupo
              ? {
                  content: '""',
                  position: "absolute",
                  bottom: 0,
                  ...(propio
                    ? {
                        right: -6,
                        borderLeft: `8px solid ${bubbleColor}`,
                        borderTop: "8px solid transparent",
                      }
                    : {
                        left: -6,
                        borderRight: `8px solid ${bubbleColor}`,
                        borderTop: "8px solid transparent",
                      }),
                }
              : {},
            "&:hover .delete-btn": {
              opacity: 1,
            },
          }}
        >
          {esPrimeroGrupo && (
            <Stack
              direction="row"
              alignItems="center"
              spacing={0.8}
              sx={{
                mb: msg.message || msg.attachments?.length ? 0.45 : 0,
                pr: puedeEliminarMensaje(msg) && !propio ? 3 : 0,
                pl: puedeEliminarMensaje(msg) && propio ? 3 : 0,
                minWidth: 0,
              }}
            >
              <Typography
                noWrap
                sx={{
                  maxWidth: { xs: 180, sm: 260, md: 340 },
                  fontSize: { xs: 11, md: 11.5 },
                  fontWeight: 900,
                  color: userColor,
                  lineHeight: 1.2,
                }}
              >
                {msg.user?.name || "Usuario"}
              </Typography>

              {interno && (
                <Chip
                  label="Interna"
                  size="small"
                  sx={{
                    height: 17,
                    fontSize: 9.5,
                    fontWeight: 900,
                    bgcolor: "#fde68a",
                    color: "#92400e",
                    flexShrink: 0,
                    "& .MuiChip-label": {
                      px: 0.75,
                    },
                  }}
                />
              )}
            </Stack>
          )}

          {!esPrimeroGrupo && interno && (
            <Chip
              label="Interna"
              size="small"
              sx={{
                height: 17,
                fontSize: 9.5,
                fontWeight: 900,
                mb: 0.45,
                bgcolor: "#fde68a",
                color: "#92400e",
                "& .MuiChip-label": {
                  px: 0.75,
                },
              }}
            />
          )}

          {msg.message && (
            <Typography
              sx={{
                fontSize: { xs: 13.2, md: 14 },
                lineHeight: { xs: 1.45, md: 1.48 },
                color: "#111827",
                whiteSpace: "pre-line",
                wordBreak: "break-word",
                overflowWrap: "anywhere",
              }}
            >
              {msg.message}
            </Typography>
          )}

          {msg.attachments?.length > 0 && (
            <Stack
              spacing={0.75}
              sx={{
                mt: msg.message ? 0.8 : 0,
                maxWidth: "100%",
                minWidth: 0,
              }}
            >
              {msg.attachments.map((file) => (
                <AttachmentCard
                  key={file.id}
                  file={file}
                  abrirArchivo={abrirArchivo}
                  getArchivoUrl={getArchivoUrl}
                />
              ))}
            </Stack>
          )}

          <Typography
            sx={{
              mt: 0.35,
              fontSize: { xs: 9.8, md: 10 },
              color: "#667781",
              textAlign: "right",
              fontWeight: 700,
              lineHeight: 1.2,
            }}
          >
            {hora}
          </Typography>

          {puedeEliminarMensaje(msg) && (
            <IconButton
              className="delete-btn"
              size="small"
              color="error"
              onClick={() => eliminarMensaje(msg)}
              sx={{
                position: "absolute",
                top: 3,
                right: propio ? "auto" : 3,
                left: propio ? 3 : "auto",
                opacity: { xs: 1, md: 0 },
                transition: "0.15s ease",
                bgcolor: "rgba(255,255,255,0.94)",
                width: { xs: 24, md: 26 },
                height: { xs: 24, md: 26 },
                boxShadow: "0 1px 2px rgba(15,23,42,0.16)",
                "&:hover": {
                  bgcolor: "#fee2e2",
                },
              }}
            >
              <DeleteIcon sx={{ fontSize: { xs: 15, md: 16 } }} />
            </IconButton>
          )}
        </Box>
      </Box>
    </Box>
  );
}