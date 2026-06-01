import { Fragment, useCallback, useContext, useState } from "react";
import { FastField, Form, Formik, ErrorMessage, Field } from "formik";
import * as Yup from "yup";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import "../Auth.scss";
import { Navigate, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import {
  LoginAccountService,
  GoogleLoginService,
} from "../../../services/AuthService";
import { toast } from "react-toastify";
import { authContext } from "../../../context/AuthContext";
import PulseLoader from "react-spinners/PulseLoader";
import { GoogleLogin } from "@react-oauth/google";
const Login = () => {
  const { dispatch, token } = useContext(authContext);
  const navigate = useNavigate();
  //! Props

  //! State
  const [isEye, setIsEye] = useState(false);
  const mutateLogin = useMutation({
    mutationFn: (data) => LoginAccountService(data),
  });
  const mutateGoogleLogin = useMutation({
    mutationFn: (credential) => GoogleLoginService(credential),
  });

  //! Function
  const handleGoogleSuccess = useCallback(
    async (credentialResponse) => {
      try {
        const response = await mutateGoogleLogin.mutateAsync(
          credentialResponse.credential
        );
        const { success, message } = response;
        if (!success) throw new Error(message);
        dispatch({
          type: "LOGIN_SUCCESS",
          payload: { user: response?.user, token: response?.accessToken },
        });
        toast.success(message);
        navigate("/", { replace: true });
      } catch (error) {
        toast.error(error.message || "Google login failed");
      }
    },
    [dispatch, mutateGoogleLogin, navigate]
  );

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
          <section className = "bg-login">
            <div className="wrap-login-container-content">
              <Formik
                initialValues={{
                  email: "",
                  password: "",
                  phone: "",
                }}
                enableReinitialize
                validationSchema={Yup.object({
                  email: Yup.string()
                    .required("Email is required")
                    .trim()
                    .lowercase()
                    .matches(
                      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/,
                      "Invalid email format!"
                    ),
                  password: Yup.string()
                    .required("Require!")
                    .min(6, "Invalid password!")
                    .matches(
                      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                      "Password must include at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character!"
                    )
                    .trim(),
                  phone: Yup.string()
                    .required("Phone is required")
                    .matches(
                      /^(84|0[35789])[0-9]{8}$/,
                      "Invalid phone number!"
                    )
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
                        <FastField
                          type="text"
                          name="phone"
                          id="phone"
                          placeholder="Phone number"
                          className={
                            helperFormik.errors.phone && "border-err"
                          }
                        />
                        <span className="err-text">
                          <ErrorMessage name="phone" />
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
                        <span className="err-text">
                          <ErrorMessage name="password" />
                        </span>
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
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          margin: "8px 0",
                        }}
                      >
                        <hr style={{ flex: 1, borderColor: "#e8e8e8" }} />
                        <span style={{ color: "#999", fontSize: "12px" }}>
                          or
                        </span>
                        <hr style={{ flex: 1, borderColor: "#e8e8e8" }} />
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          marginBottom: "1rem",
                        }}
                      >
                        <GoogleLogin
                          onSuccess={handleGoogleSuccess}
                          onError={() => toast.error("Google login failed!")}
                          useOneTap={false}
                          text="signin_with"
                          shape="rectangular"
                          width="100%"
                          locale="en"
                        />
                      </div>
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
