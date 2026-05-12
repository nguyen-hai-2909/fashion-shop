import { ErrorMessage, Field, Form, Formik } from "formik";
import { Fragment, useCallback, useContext, useState } from "react";
import "./ForgotPassword.scss";
import * as Yup from "yup";
import PulseLoader from "react-spinners/PulseLoader";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { useMutation } from "@tanstack/react-query";
import { ResetPasswordService } from "../../services/AccountService";
import { toast } from "react-toastify";
import { message } from "antd";
import { Navigate, useNavigate } from "react-router-dom";
import { authContext } from "../../context/AuthContext";
const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
const PASSWORD_RULE_MESSAGE =
  "Password must be at least 8 characters and include uppercase, lowercase, number, and special character.";
const ForgotPasswordPage = () => {
  const searchParams = new URLSearchParams(document.location.search);
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const { token: tokenAuth } = useContext(authContext);
  //! Props

  //! State
  const [checkEye, setCheckEye] = useState({
    isEye: false,
    isEyeSecond: false,
  });
  const mutateResetPassword = useMutation({
    mutationFn: (data) => ResetPasswordService(data, token),
  });
  //! Function
  const handleSubmit = useCallback(async (values) => {
    try {
      const response = await mutateResetPassword.mutateAsync({
        password: values.password,
      });
      const { success, message } = response;
      if (!success) {
        throw new Error(message);
      }
      toast.success(message);
      navigate("/login", { replace: true });
    } catch (error) {
      console.log(error);
      toast.error(message.error);
    }
  }, []);
  //! Effect

  //! Render
  return (
    <Fragment>
      {tokenAuth ? (
        <Navigate to={"/user/me"} replace={true} />
      ) : (
        <div className="Wrap-form-reset-password">
          <div className="wrap-login-container-content">
            <Formik
              initialValues={{
                password: "",
                checkPassword: "",
              }}
              enableReinitialize
              validationSchema={Yup.object({
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
              validateOnBlur={false}
              validateOnChange={false}
              validateOnMount={false}
              onSubmit={handleSubmit}
            >
              {(helperFormik) => {
                return (
                  <Form className="wrap-login-container-content-form">
                    <h3 className="wrap-login-container-content-form-title">
                      Reset your{" "}
                      <span className="text-primaryColor">Password</span>
                    </h3>
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
                          type={`${checkEye.isEyeSecond ? "text" : "password"}`}
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
                      disabled={mutateResetPassword.isLoading}
                    >
                      {mutateResetPassword.isLoading ? (
                        <PulseLoader size={12} color="#f1f5f8" />
                      ) : (
                        "Reset password"
                      )}
                    </button>
                  </Form>
                );
              }}
            </Formik>
          </div>
        </div>
      )}
    </Fragment>
  );
};

export default ForgotPasswordPage;
