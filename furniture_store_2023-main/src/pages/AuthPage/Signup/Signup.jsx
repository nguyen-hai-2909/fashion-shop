import { Fragment, useCallback, useContext, useState } from "react";
import { Formik, Form, ErrorMessage, Field, FastField } from "formik";
import * as Yup from "yup";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import "../Auth.scss";
import { Navigate, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { SignupAccountService } from "../../../services/AuthService";
import { toast } from "react-toastify";
import PulseLoader from "react-spinners/PulseLoader";
import { authContext } from "../../../context/AuthContext";
const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
const PASSWORD_RULE_MESSAGE =
  "Password must be at least 8 characters and include uppercase, lowercase, number, and special character.";
const Signup = () => {
  const navigate = useNavigate();
  const { token } = useContext(authContext);
  //! Props

  //! State
  const [checkEye, setCheckEye] = useState({
    isEye: false,
    isEyeSecond: false,
  });
  const mutateSignup = useMutation({
    mutationFn: (data) => SignupAccountService(data),
  });
  //! Function
  const handleSubmit = useCallback(async (values) => {
    try {
      const response = await mutateSignup.mutateAsync(values);
      const { success, message } = response;
      if (!success) {
        throw new Error(message);
      }
      toast.success(message);
      navigate("/login", { replace: true });
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
        <Navigate to={"/user/me"} replace={true} />
      ) : (
        <Fragment>
          <section className="title-section">
            <div className="section-center">
              <h3>
                <a href="/">Home</a> / signup
              </h3>
            </div>
          </section>
          <section
            style={{
              minHeight: "calc(80vh - 160px)",
              display: "flex",
              alignItems: "center",
            }}
          >
            <div className="wrap-login-container-content">
              <Formik
                initialValues={{
                  name: "",
                  phoneNumber: "",
                  email: "",
                  password: "",
                  checkPassword: "",
                }}
                validationSchema={Yup.object({
                  name: Yup.string().required("Pls enter your name!").trim(),
                  phoneNumber: Yup.string()
                    .required("Pls enter your phone number!")
                    .max(10, "Invalid phone number!")
                    .min(10, "Invalid phone number!")
                    .trim(),
                  email: Yup.string()
                    .required("Pls enter your email!")
                    .email("Invalid email!")
                    .trim(),
                  password: Yup.string()
                    .required("Pls enter your password!")
                    .matches(STRONG_PASSWORD_REGEX, PASSWORD_RULE_MESSAGE)
                    .trim(),
                  checkPassword: Yup.string()
                    .required("Pls re-enter your password again!")
                    .trim()
                    // .when('password', (password, field) =>
                    // password ? field.required().oneOf([Yup.ref('password')]) : field)
                    .oneOf([Yup.ref("password")], "Passwords must match"),
                })}
                validateOnMount={false}
                validateOnBlur={false}
                validateOnChange={false}
                onSubmit={handleSubmit}
              >
                {(helperFormik) => {
                  return (
                    <Form className="wrap-login-container-content-form">
                      <h3 className="wrap-login-container-content-form-title">
                        Create an{" "}
                        <span className="text-primaryColor">account</span>
                      </h3>
                      <div className="wrap-login-container-content-form-item">
                        <FastField
                          name="phoneNumber"
                          type="text"
                          id="phoneNumber"
                          placeholder="You phone number"
                          className={
                            helperFormik.errors.phoneNumber && "border-err"
                          }
                        />
                        <span className="err-text">
                          <ErrorMessage name="phoneNumber" />
                        </span>
                      </div>
                      <div className="wrap-login-container-content-form-item">
                        <FastField
                          name="name"
                          type="text"
                          id="name"
                          placeholder="Your name"
                          className={helperFormik.errors.name && "border-err"}
                        />
                        <span className="err-text">
                          <ErrorMessage name="name" />
                        </span>
                      </div>
                      <div className="wrap-login-container-content-form-item">
                        <FastField
                          name="email"
                          type="text"
                          id="email"
                          placeholder="Your email"
                          className={helperFormik.errors.email && "border-err"}
                        />
                        <span id="errTextEmail" className="err-text">
                          <ErrorMessage name="email" />
                        </span>
                      </div>
                      <div className="wrap-login-container-content-form-item">
                        <div className="relative">
                          <Field
                            name="password"
                            type={`${checkEye.isEye ? "text" : "password"}`}
                            id="password"
                            placeholder="At least 8 chars, upper/lower, number, special"
                            className={
                              helperFormik.errors.password && "border-err"
                            }
                          />
                          <span
                            id="eyePass"
                            className="wrap-login-container-content-form-item-icon"
                            onClick={() =>
                              setCheckEye((prev) => {
                                return {
                                  ...prev,
                                  isEye: !checkEye.isEye,
                                };
                              })
                            }
                          >
                            {!checkEye.isEye ? (
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
                      <div className="wrap-login-container-content-form-item">
                        <div className="relative">
                          <Field
                            name="checkPassword"
                            type={`${
                              checkEye.isEyeSecond ? "text" : "password"
                            }`}
                            id="checkPassword"
                            placeholder="Confirm your password"
                            className={
                              helperFormik.errors.checkPassword && "border-err"
                            }
                          />
                          <span
                            id="eyeCheckPass"
                            className="wrap-login-container-content-form-item-icon"
                            onClick={() =>
                              setCheckEye((prev) => {
                                return {
                                  ...prev,
                                  isEyeSecond: !checkEye.isEyeSecond,
                                };
                              })
                            }
                          >
                            {!checkEye.isEyeSecond ? (
                              <AiOutlineEye />
                            ) : (
                              <AiOutlineEyeInvisible />
                            )}
                          </span>
                        </div>
                        <span className="err-text">
                          <ErrorMessage name="checkPassword" />
                        </span>
                      </div>
                      <button
                        type="submit"
                        className="wrap-login-container-content-form-btn"
                        disabled={mutateSignup?.isLoading}
                      >
                        {mutateSignup?.isLoading ? (
                          <PulseLoader size={12} color="#f1f5f8" />
                        ) : (
                          "Sign up"
                        )}
                      </button>
                    </Form>
                  );
                }}
              </Formik>
              <div
                className="wrap-login-container-content-other-option center"
                style={{ color: "#102A42" }}
              >
                Already have an account?
                <span
                  onClick={() => navigate("/login", { replace: true })}
                  className="text-primaryColor"
                  style={{ marginLeft: "4px" }}
                >
                  Login
                </span>
              </div>
            </div>
          </section>
        </Fragment>
      )}
    </Fragment>
  );
};

export default Signup;
