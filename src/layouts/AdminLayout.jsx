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
  Stack,
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import AppsIcon from "@mui/icons-material/Apps";
import CategoryIcon from "@mui/icons-material/Category";
import GroupsIcon from "@mui/icons-material/Groups";
import LogoutIcon from "@mui/icons-material/Logout";

import { NavLink, Outlet, useNavigate } from "react-router-dom";

const drawerWidth = 270;

function AdminLayout() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(true);

  const usuario = JSON.parse(localStorage.getItem("USUARIO") || "null");
  const roles = usuario?.roles || [];

  const cerrarSesion = () => {
    localStorage.removeItem("TOKEN");
    localStorage.removeItem("USUARIO");
    navigate("/login");
  };

  const toggleSidebar = () => {
    if (isMobile) {
      setMobileOpen(true);
      return;
    }

    setDesktopOpen((prev) => !prev);
  };

  const cerrarSidebarMobile = () => {
    setMobileOpen(false);
  };

  const menuItems = [
    {
      label: "Dashboard",
      path: "/paneladministrador",
      roles: ["Administrador", "Agente", "Supervisor"],
      icon: <DashboardIcon fontSize="small" />,
    },
    {
      label: "Mis tickets",
      path: "/mis-tickets",
      roles: ["Administrador", "Agente", "Supervisor", "Cliente"],
      icon: <ConfirmationNumberIcon fontSize="small" />,
    },
    {
      label: "Crear agente",
      path: "/agents/nuevo",
      roles: ["Administrador", "Supervisor"],
      icon: <PersonAddIcon fontSize="small" />,
    },
    {
      label: "Sistemas",
      path: "/sistemas",
      roles: ["Administrador"],
      icon: <AppsIcon fontSize="small" />,
    },
    {
      label: "Secciones",
      path: "/secciones",
      roles: ["Administrador"],
      icon: <CategoryIcon fontSize="small" />,
    },
    {
      label: "Grupos de soporte",
      path: "/grupos-soporte",
      roles: ["Administrador"],
      icon: <GroupsIcon fontSize="small" />,
    },
  ];

  const menuVisible = menuItems.filter((item) =>
    item.roles.some((r) => roles.includes(r)),
  );

  const drawerContent = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          p: 2.5,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 1,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h6" fontWeight={900} noWrap>
            Business Ticket
          </Typography>

          <Typography variant="caption" sx={{ color: "#94a3b8" }}>
            Panel de soporte
          </Typography>
        </Box>

        {isMobile && (
          <IconButton
            onClick={cerrarSidebarMobile}
            size="small"
            sx={{
              color: "#ffffff",
              border: "1px solid rgba(255,255,255,0.15)",
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.1)" }} />

      {isMobile && (
        <>
          <Box sx={{ px: 2, py: 2 }}>
            <Typography fontWeight={800} noWrap>
              {usuario?.name || "Usuario"}
            </Typography>

            <Chip
              label={roles?.[0] || "sin rol"}
              size="small"
              sx={{
                mt: 1,
                bgcolor: "rgba(255,255,255,0.12)",
                color: "#ffffff",
                fontWeight: 700,
              }}
            />
          </Box>

          <Divider sx={{ borderColor: "rgba(255,255,255,0.1)" }} />
        </>
      )}

      <Box sx={{ flex: 1, overflowY: "auto", py: 1 }}>
        <List sx={{ px: 1.2 }}>
          {menuVisible.map((item) => (
            <ListItemButton
              key={item.path}
              component={NavLink}
              to={item.path}
              onClick={() => {
                if (isMobile) cerrarSidebarMobile();
              }}
              sx={navStyle}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.3,
                  minWidth: 0,
                  width: "100%",
                }}
              >
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {item.icon}
                </Box>

                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: 14,
                    fontWeight: 700,
                    noWrap: true,
                  }}
                />
              </Box>
            </ListItemButton>
          ))}
        </List>
      </Box>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.1)" }} />

      <Box sx={{ p: 2 }}>
        <Button
          fullWidth
          variant="contained"
          color="error"
          onClick={cerrarSesion}
          startIcon={<LogoutIcon />}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 800,
          }}
        >
          Cerrar sesión
        </Button>
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
        overflow: "hidden",
      }}
    >
      {/* Sidebar escritorio */}
      {!isMobile && desktopOpen && (
        <Drawer
          variant="permanent"
          open
          sx={{
            width: drawerWidth,
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
      )}

      {/* Sidebar móvil */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={cerrarSidebarMobile}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            maxWidth: "86vw",
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
          height: "100vh",
          overflow: "hidden",
        }}
      >
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: "#ffffff",
            color: "#111827",
            borderBottom: "1px solid #e5e7eb",
            zIndex: theme.zIndex.appBar,
          }}
        >
          <Toolbar
            sx={{
              minHeight: { xs: "58px !important", md: "64px !important" },
              px: { xs: 1.5, sm: 2, md: 3 },
              display: "flex",
              justifyContent: "space-between",
              gap: 1.5,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.2,
                minWidth: 0,
              }}
            >
              <IconButton
                onClick={toggleSidebar}
                edge="start"
                sx={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 2,
                  bgcolor: "#f8fafc",
                  "&:hover": {
                    bgcolor: "#eef2ff",
                  },
                }}
              >
                <MenuIcon />
              </IconButton>

              <Box sx={{ minWidth: 0 }}>
                <Typography
                  fontWeight={900}
                  noWrap
                  sx={{
                    fontSize: { xs: 15, sm: 16, md: 18 },
                  }}
                >
                  The Business Ticket
                </Typography>

                {isMobile && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    noWrap
                    display="block"
                  >
                    {roles?.[0] || "sin rol"}
                  </Typography>
                )}
              </Box>
            </Box>

            <Stack direction="row" alignItems="center" spacing={1.5}>
              {!isMobile && (
                <Box sx={{ textAlign: "right", maxWidth: 240 }}>
                  <Typography fontWeight={800} noWrap>
                    {usuario?.name || "Usuario"}
                  </Typography>

                  <Chip
                    label={roles?.[0] || "sin rol"}
                    size="small"
                    sx={{ mt: 0.5, fontWeight: 700 }}
                  />
                </Box>
              )}

              {!isMobile && (
                <Button
                  variant="contained"
                  color="error"
                  onClick={cerrarSesion}
                  startIcon={<LogoutIcon />}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 800,
                    px: 2,
                  }}
                >
                  Salir
                </Button>
              )}
            </Stack>
          </Toolbar>
        </AppBar>

        <Box
          sx={{
            flex: 1,
            width: "100%",
            overflowX: "hidden",
            overflowY: "auto",
            px: { xs: 1.5, sm: 2.5, md: 4 },
            py: { xs: 1.5, sm: 2.5, md: 3 },
            boxSizing: "border-box",
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
  borderRadius: 2.2,
  minHeight: 46,
  mb: 0.75,
  px: 1.5,
  transition: "all 0.18s ease",
  "&.active": {
    backgroundColor: "#2563eb",
    color: "#fff",
    boxShadow: "0 10px 22px rgba(37,99,235,0.25)",
  },
  "&:hover": {
    backgroundColor: "rgba(37,99,235,0.18)",
    color: "#fff",
  },
};

export default AdminLayout;