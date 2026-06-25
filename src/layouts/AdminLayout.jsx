import { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Box,
  Button,
  Divider,
  Chip,
  IconButton,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

const drawerWidth = 260;

function AdminLayout() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [mobileOpen, setMobileOpen] = useState(false);

  const usuario = JSON.parse(localStorage.getItem("USUARIO") || "null");
  const roles = usuario?.roles || [];

  const cerrarSesion = () => {
    localStorage.removeItem("TOKEN");
    localStorage.removeItem("USUARIO");
    navigate("/login");
  };

  const menuItems = [
    { label: "Dashboard", path: "/paneladministrador", roles: ["Administrador", "Agente", "Supervisor"] },
    { label: "Nuevo ticket", path: "/tickets/nuevo", roles: ["Administrador", "Agente", "Supervisor", "Cliente"] },
    { label: "Mis tickets", path: "/mis-tickets", roles: ["Administrador", "Agente", "Supervisor", "Cliente"] },
    { label: "Crear agente", path: "/agents/nuevo", roles: ["Administrador", "Supervisor"] },
    { label: "Sistemas", path: "/sistemas", roles: ["Administrador"] },
    { label: "Tipos de problema", path: "/problemas", roles: ["Administrador"] },
    { label: "Grupos de soporte", path: "/grupos-soporte", roles: ["Administrador"] },
  ];

  const menuVisible = menuItems.filter((item) =>
    item.roles.some((r) => roles.includes(r))
  );

  const drawerContent = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box sx={{ p: 2.5 }}>
        <Typography variant="h6" fontWeight={800} noWrap>
          Business Ticket
        </Typography>

        <Typography variant="caption" sx={{ color: "#94a3b8" }}>
          Panel de soporte
        </Typography>
      </Box>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.1)" }} />

      <Box sx={{ flex: 1, overflowY: "auto", py: 1 }}>
        <List sx={{ px: 1 }}>
          {menuVisible.map((item) => (
            <ListItemButton
              key={item.path}
              component={NavLink}
              to={item.path}
              onClick={() => isMobile && setMobileOpen(false)}
              sx={navStyle}
            >
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontSize: 14,
                  fontWeight: 600,
                }}
              />
            </ListItemButton>
          ))}
        </List>
      </Box>
    </Box>
  );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        bgcolor: "#f5f6fa",
      }}
    >
      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={isMobile ? mobileOpen : true}
        onClose={() => setMobileOpen(false)}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          width: isMobile ? 0 : drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            background: "linear-gradient(180deg, #0f172a, #111827)",
            color: "#fff",
            borderRight: "none",
          },
        }}
      >
        {drawerContent}
      </Drawer>

      <Box
        component="main"
        sx={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: "#ffffff",
            color: "#111827",
            borderBottom: "1px solid #e5e7eb",
            zIndex: theme.zIndex.drawer - 1,
          }}
        >
          <Toolbar
            sx={{
              minHeight: "64px !important",
              px: { xs: 2, md: 3 },
              display: "flex",
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
              {isMobile && (
                <IconButton onClick={() => setMobileOpen(true)} edge="start">
                  <MenuIcon />
                </IconButton>
              )}

              <Typography fontWeight={800} noWrap>
                The Business Ticket
              </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              {!isMobile && (
                <Box sx={{ textAlign: "right", maxWidth: 220 }}>
                  <Typography fontWeight={700} noWrap>
                    {usuario?.name || "Usuario"}
                  </Typography>

                  <Chip
                    label={roles?.[0] || "sin rol"}
                    size="small"
                    sx={{ mt: 0.5 }}
                  />
                </Box>
              )}

              <Button
                variant="contained"
                color="error"
                onClick={cerrarSesion}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 700,
                  px: 2,
                }}
              >
                Salir
              </Button>
            </Box>
          </Toolbar>
        </AppBar>

        <Box
          sx={{
            flex: 1,
            width: "100%",
            overflowX: "hidden",
            overflowY: "auto",
            px: { xs: 2, sm: 3, md: 4 },
            py: { xs: 2, sm: 3 },
          }}
        >
          <Box
            sx={{
              width: "100%",
              maxWidth: "1400px",
              mx: "auto",
            }}
          >
            <Outlet />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

const navStyle = {
  color: "#cbd5e1",
  borderRadius: 2,
  minHeight: 44,
  mb: 0.75,
  px: 2,
  "&.active": {
    backgroundColor: "#2563eb",
    color: "#fff",
  },
  "&:hover": {
    backgroundColor: "rgba(37,99,235,0.18)",
    color: "#fff",
  },
};

export default AdminLayout;