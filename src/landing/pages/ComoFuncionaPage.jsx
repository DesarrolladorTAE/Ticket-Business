import { Box } from "@mui/material";

import LandingHeader from "../components/LandingHeader";
import LandingComoFunciona from "../components/LandingComoFunciona";
import LandingCta from "../components/LandingCta";
import LandingFooter from "../components/LandingFooter";

function ComoFuncionaPage() {
  return (
    <Box
      sx={{
        minHeight: "100dvh",
        bgcolor: "#ffffff",
        overflowX: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <LandingHeader />

      <Box
        component="main"
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          pt: {
            xs: "70px",
            md: "80px",
          },
        }}
      >
        <LandingComoFunciona />
        <LandingCta />
      </Box>

      <LandingFooter />
    </Box>
  );
}

export default ComoFuncionaPage;