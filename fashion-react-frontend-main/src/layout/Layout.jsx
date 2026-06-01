/* eslint-disable react/prop-types */
import { Fragment, useCallback, useState } from "react";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import Sidebar from "../components/Sidebar/Sidebar";
import MessengerCustomerChat from "react-messenger-customer-chat";
import BackToTopButton from "../components/BackToTopButton";
import SizeConsultant from "../components/SizeConsultant/SizeConsultant";

const Layout = ({ children, isLayout }) => {
  //! State
  const [isShowSidebar, setIsShowSidebar] = useState(false);
  //! Function
  const handleToggleShowSidebar = useCallback(
    () => setIsShowSidebar((active) => !active),
    []
  );
  //! Render
  return (
    <Fragment>
     <MessengerCustomerChat
        pageId="157771114084700"
        appId="1341663279776099"
      /> 
      {isLayout && (
        <Fragment>
          <Header handleToggleShowSidebar={handleToggleShowSidebar} />
          <Sidebar
            isShowSidebar={isShowSidebar}
            handleToggleShowSidebar={handleToggleShowSidebar}
          />
        </Fragment>
      )}
      <main>
        {/* <Routers /> */}
        {children}
      </main>
      {isLayout && (
        <Fragment>
          <Footer />
        </Fragment>
      )}
      <BackToTopButton />
      <SizeConsultant />
    </Fragment>
  );
};

export default Layout;
