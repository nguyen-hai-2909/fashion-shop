/* eslint-disable react/prop-types */

import { ConfigProvider } from "antd";

const Paper = ({ children, style, isFix }) => {
  return (
    <ConfigProvider
      key={"paper"}
      theme={{
        token: {
          colorBgContainer: "#ffffff",
          colorPrimary: "#617d98",
        },
      }}
    >
      <div
        style={{
          height: isFix && "calc(100vh - 184px)",
          overflowY: isFix && "auto", 
          padding: 24,
          background: "rgb(255, 255, 255)",
          ...style
        }}
      >
        {children}
      </div>
    </ConfigProvider>
  );
};

export default Paper;
