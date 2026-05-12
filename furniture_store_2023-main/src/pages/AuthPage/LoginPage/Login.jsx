import { Fragment, useCallback, useContext, useState } from "react";
import { FastField, Form, Formik, ErrorMessage, Field } from "formik";
import * as Yup from "yup";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import "../Auth.scss";
import { Navigate, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { LoginAccountService } from "../../../services/AuthService";
import { toast } from "react-toastify";
import { authContext } from "../../../context/AuthContext";
import PulseLoader from "react-spinners/PulseLoader";
const Login = () => {
  const { dispatch, token } = useContext(authContext);
  const navigate = useNavigate();
  //! Props

  //! State
  const [isEye, setIsEye] = useState(false);
  const mutateLogin = useMutation({
    mutationFn: (data) => LoginAccountService(data),
  });
  //! Function
  const handleSubmit = useCallback(async (values) => {
    try {
      dispatch({
        type: "LOGIN_START",
      });
      const response = await mutateLogin.mutateAsync(values);
      const { success, message } = response;
      if (!success) {
        throw new Error(message);
      }
      dispatch({
        type: "LOGIN_SUCCESS",
        payload: {
          user: response?.user,
          token: response?.accessToken,
        },
      });
      toast.success(message);
      navigate("/", { replace: true });
    } catch (error) {
      console.log("error", error);
      toast.error(error.message);
    }
  }, []);
  //! Effect

  //! Render
  return (
    <Fragment>
      {token ? (
        <Navigate to="/user/me" replace={true} />
      ) : (
        <Fragment>
          <section className="title-section">
            <div className="section-center">
              <h3>
                <a href="/">Home</a> / login
              </h3>
            </div>
          </section>
          <section
            style={{
              height: "calc(80vh - 160px)",
              display: "flex",
              alignItems: "center",
            }}
          >
            <div className="wrap-login-container-content">
              <Formik
                initialValues={{
                  email: "",
                  password: "",
                }}
                enableReinitialize
                validationSchema={Yup.object({
                  email: Yup.string().required("Require!").email("Invalid email!").trim(),
                  password: Yup.string()
                    .required("Require!")
                    .min(6, "Invalid password!")
                    .trim(),
                })}
                validateOnBlur={false}
                validateOnChange={false}
                validateOnMount={false}
                onSubmit={handleSubmit}
              >
                {(helperFormik) => {
                  return (
                    <Form className="wrap-login-container-content-form">
                      <h3 className="wrap-login-container-content-form-title">
                        Hello <span className="text-primaryColor">Welcome</span>{" "}
                        Back 🎉
                      </h3>
                      <div className="wrap-login-container-content-form-item">
                        <FastField
                          type="text"
                          name="email"
                          id="email"
                          placeholder="Email"
                          className={
                            helperFormik.errors.email && "border-err"
                          }
                        />
                        <span className="err-text">
                          <ErrorMessage name="email" />
                        </span>
                      </div>
                      <div className="wrap-login-container-content-form-item">
                        <div className="relative">
                          <Field
                            name="password"
                            type={`${isEye ? "text" : "password"}`}
                            id="password"
                            placeholder="Password must be at least 6 characters!"
                            className={
                              helperFormik.errors.password && "border-err"
                            }
                          />
                          <span
                            id="eyePass"
                            className="wrap-login-container-content-form-item-icon"
                            onClick={() => setIsEye((prev) => !prev)}
                          >
                            {!isEye ? (
                              <AiOutlineEye />
                            ) : (
                              <AiOutlineEyeInvisible />
                            )}
                          </span>
                        </div>
                        {<ErrorMessage name="password" /> ? (
                          <span className="err-text">
                            <ErrorMessage name="password" />
                          </span>
                        ) : null}
                      </div>
                      <button
                        type="submit"
                        className="wrap-login-container-content-form-btn"
                        disabled={mutateLogin.isLoading}
                      >
                        {mutateLogin.isLoading ? (
                          <PulseLoader size={12} color="#f1f5f8" />
                        ) : (
                          "Login"
                        )}
                      </button>
                    </Form>
                  );
                }}
              </Formik>
              <div className="wrap-login-container-content-other-option">
                <span
                  onClick={() => {
                    navigate("/signup", { replace: true });
                  }}
                >
                  Sign up
                </span>
                <span
                  onClick={() => {
                    navigate("/forgot-password", { replace: true });
                  }}
                >
                  Forgot password
                </span>
              </div>
            </div>
          </section>
        </Fragment>
      )}
    </Fragment>
  );
};

export default Login;
