import PacmanLoader from "react-spinners/PacmanLoader";
const Loading = () => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
      }}
    >
      <PacmanLoader size={35} color="#ab7a5f" />
    </div>
  );
};

export default Loading;
