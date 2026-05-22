/* eslint-disable react/prop-types */
import { Fragment, useCallback, useContext } from "react";
import "./Profile.scss";
import { Link, useNavigate } from "react-router-dom";
import { authContext } from "../../context/AuthContext";
const ProfilePage = ({ children }) => {
  const navigate = useNavigate();
  const { dispatch, user } = useContext(authContext);
  //! Props

  //! State
  //! Function
  const handleLogOutUser = useCallback(() => {
    dispatch({
      type: "LOG_OUT",
    });
  }, []);
  //! Effect
  //! Render
  return (
    <Fragment>
      <section
        className="screen-default account-page"
        style={{ maxWidth: "1300px", width: "100%", margin: "0 auto" }}
      >
        <div className="account-page-wrap">
          <div className="sidebar-account-wrap">
            <div className="sidebar-account">
              <h3 style={{ marginLeft: "1rem" }}>{user.name}</h3>
              <div className="option-account">
                <div
                  id="info"
                  className={`${
                    window.location.pathname === "/user/me"
                      ? "sidebar-account-item is-active"
                      : "sidebar-account-item"
                  }`}
                  onClick={() => {
                    navigate("/user/me", { replace: true });
                  }}
                >
                  Profile
                </div>
                <div
                  id="order"
                  className={`${
                    window.location.pathname.includes("/user/order")
                      ? "sidebar-account-item is-active"
                      : "sidebar-account-item"
                  }`}
                  onClick={() => {
                    navigate("/user/order", { replace: true });
                  }}
                >
                  Orders
                </div>
                <Link
                  to="/"
                  className="sidebar-account-item"
                  onClick={handleLogOutUser}
                >
                  Log out
                </Link>
              </div>
            </div>
          </div>
          <div className="content-account">
            {children}
            {/* {!isOrder && (
              <UserInfo
                name={name}
                phoneNumber={phoneNumber}
                email={email}
                address={address}
              />
            )}
            {}
            {isOrder && <Order />} */}
          </div>
        </div>
      </section>
    </Fragment>
  );
};

export default ProfilePage;
