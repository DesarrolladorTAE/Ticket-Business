import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import DownloadIcon from "@mui/icons-material/Download";
import ImageIcon from "@mui/icons-material/Image";
import MovieIcon from "@mui/icons-material/Movie";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";

export default function AttachmentPreview({
  previewOpen,
  previewFile,
  cerrarPreview,
  esImagenArchivo,
  esVideoArchivo,
  esPdfArchivo,
  getArchivoUrl,
  descargarArchivo,
}) {
  const theme = useTheme();
  const esMovil = useMediaQuery(theme.breakpoints.down("sm"));

  const nombreArchivo = previewFile?.nombre_archivo || "Vista previa";
  const urlArchivo = previewFile ? getArchivoUrl(previewFile) : "";

  const esImagen = previewFile && esImagenArchivo(previewFile);
  const esVideo = previewFile && esVideoArchivo(previewFile);
  const esPdf = previewFile && esPdfArchivo(previewFile);
  const tieneVistaPrevia = esImagen || esVideo || esPdf;

  const descargar = () => {
    if (!previewFile) return;
    descargarArchivo(previewFile);
  };

  return (
    <Dialog
      open={previewOpen}
      onClose={cerrarPreview}
      maxWidth="md"
      fullWidth
      fullScreen={esMovil}
      PaperProps={{
        sx: {
          borderRadius: { xs: 0, sm: 3 },
          overflow: "hidden",
        },
      }}
    >
      <DialogTitle
        sx={{
          px: { xs: 1.5, sm: 2.5 },
          py: { xs: 1.2, sm: 1.6 },
          borderBottom: "1px solid #e5e7eb",
          bgcolor: "#ffffff",
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={1.5}
        >
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{ minWidth: 0 }}
          >
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: 2,
                bgcolor: "#eff6ff",
                color: "#2563eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {esImagen ? (
                <ImageIcon fontSize="small" />
              ) : esVideo ? (
                <MovieIcon fontSize="small" />
              ) : esPdf ? (
                <PictureAsPdfIcon fontSize="small" />
              ) : (
                <InsertDriveFileIcon fontSize="small" />
              )}
            </Box>

            <Box sx={{ minWidth: 0 }}>
              <Typography
                fontWeight={900}
                noWrap
                sx={{
                  fontSize: { xs: 14, sm: 16 },
                  maxWidth: { xs: "calc(100vw - 145px)", sm: 560 },
                  lineHeight: 1.25,
                }}
              >
                {nombreArchivo}
              </Typography>

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display: "block",
                  fontWeight: 700,
                  mt: 0.2,
                }}
              >
                {tieneVistaPrevia ? "Vista previa del archivo" : "Archivo adjunto"}
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
            {previewFile && (
              <IconButton
                onClick={descargar}
                size="small"
                sx={{
                  border: "1px solid #e5e7eb",
                  bgcolor: "#ffffff",
                }}
              >
                <DownloadIcon fontSize="small" />
              </IconButton>
            )}

            <IconButton
              onClick={cerrarPreview}
              size="small"
              sx={{
                border: "1px solid #e5e7eb",
                bgcolor: "#ffffff",
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Stack>
      </DialogTitle>

      <DialogContent
        dividers={false}
        sx={{
          p: { xs: 1.2, sm: 2 },
          bgcolor: "#f8fafc",
          minHeight: { xs: "calc(100dvh - 125px)", sm: 420 },
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {previewFile && esImagen && (
          <Box
            sx={{
              width: "100%",
              height: { xs: "calc(100dvh - 165px)", sm: "70vh" },
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "#111827",
              borderRadius: { xs: 2, sm: 3 },
              overflow: "hidden",
            }}
          >
            <Box
              component="img"
              src={urlArchivo}
              alt={nombreArchivo}
              sx={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
                display: "block",
              }}
            />
          </Box>
        )}

        {previewFile && esVideo && (
          <Box
            component="video"
            src={urlArchivo}
            controls
            sx={{
              width: "100%",
              maxHeight: { xs: "calc(100dvh - 165px)", sm: "70vh" },
              borderRadius: { xs: 2, sm: 3 },
              bgcolor: "#000000",
              display: "block",
            }}
          />
        )}

        {previewFile && esPdf && (
          <Box
            component="iframe"
            src={urlArchivo}
            title={nombreArchivo}
            sx={{
              width: "100%",
              height: { xs: "calc(100dvh - 165px)", sm: "70vh" },
              border: "1px solid #e5e7eb",
              borderRadius: { xs: 2, sm: 3 },
              bgcolor: "#ffffff",
            }}
          />
        )}

        {previewFile && !tieneVistaPrevia && (
          <Box
            textAlign="center"
            sx={{
              width: "100%",
              maxWidth: 420,
              mx: "auto",
              py: { xs: 4, sm: 6 },
              px: 2,
              borderRadius: 3,
              bgcolor: "#ffffff",
              border: "1px dashed #cbd5e1",
            }}
          >
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: 4,
                bgcolor: "#eff6ff",
                color: "#2563eb",
                mx: "auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <InsertDriveFileIcon sx={{ fontSize: 42 }} />
            </Box>

            <Typography
              fontWeight={900}
              mt={2}
              sx={{
                fontSize: { xs: 16, sm: 18 },
              }}
            >
              Este archivo no tiene vista previa
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 0.8,
                wordBreak: "break-word",
              }}
            >
              {nombreArchivo}
            </Typography>

            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              sx={{
                mt: 2.5,
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 800,
              }}
              onClick={descargar}
            >
              Descargar archivo
            </Button>
          </Box>
        )}
      </DialogContent>

      {previewFile && tieneVistaPrevia && (
        <DialogActions
          sx={{
            px: { xs: 1.5, sm: 2.5 },
            py: { xs: 1.2, sm: 1.5 },
            borderTop: "1px solid #e5e7eb",
            bgcolor: "#ffffff",
            justifyContent: "space-between",
            gap: 1,
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              fontWeight: 700,
              minWidth: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {nombreArchivo}
          </Typography>

          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={descargar}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 800,
              flexShrink: 0,
            }}
          >
            Descargar
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
}