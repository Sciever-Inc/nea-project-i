import { Box } from "@mui/material";

const Loader = () => {
  return (
    <Box
      height="calc(100vh - 100px)"
      maxHeight="100vh"
      width="100%"
      display="flex"
      justifyContent="center"
      alignItems="center"
      // border="1px solid red"
    >
      <div className="lds-ripple">
        <div></div>
        <div></div>
      </div>
    </Box>
  );
};

export default Loader;
