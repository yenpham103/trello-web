import { Box, keyframes } from "@mui/material";

const animation = keyframes`
  0% {
    transform: scale(0.5);
  }
  50% {
    transform: scale(1);
  }
  100% {
    transform: scale(0.5);
  }
`;
const loading = {
  width: "60px",
  height: "60px",
  borderRadius: "50%",
  backgroundColor: "#CD519D",
  boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px",
  animation: `${animation} 1s ease-in-out infinite`,
};
const Loading = () => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "20px",
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      }}
    >
      <Box
        sx={{
          ...loading,
          animationDelay: "0s",
        }}
      ></Box>
      <Box
        sx={{
          ...loading,
          animationDelay: "0.25s",
        }}
      ></Box>
      <Box
        sx={{
          ...loading,
          animationDelay: "0.5s",
        }}
      ></Box>
    </Box>
  );
};

export default Loading;
