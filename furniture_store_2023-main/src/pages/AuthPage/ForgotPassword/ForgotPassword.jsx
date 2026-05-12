import { ErrorMessage, FastField, Form, Formik } from "formik";
import { Fragment, useCallback, useContext, useState } from "react";
import * as Yup from "yup";
import "../Auth.scss";
import { Navigate, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { ForgotPasswordAccountService } from "../../../services/AccountService";
import { toast } from "react-toastify";
import PulseLoader from "react-spinners/PulseLoader";
import { authContext } from "../../../context/AuthContext";
const ForgotPassword = () => {
  const navigate = useNavigate();
  const { token } = useContext(authContext);
  //! Props

  //! State
  const [isSuccess, setIsSuccess] = useState(false);
  const mutateForgotPassword = useMutation({
    mutationFn: (data) => ForgotPasswordAccountService(data),
  });
  //! Function
  const handleSubmit = useCallback(async (values) => {
    try {
      const response = await mutateForgotPassword.mutateAsync({
        email: values?.email,
      });
      const { success, message } = response;
      if (!success) {
        throw new Error(message);
      }
      toast.success(message);
      setIsSuccess(true);
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
                <a href="/">Home</a> / forgot password
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
                }}
                enableReinitialize
                validationSchema={Yup.object({
                  email: Yup.string()
                    .required("Required!")
                    .trim()
                    .email("Invalid email!"),
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
                        Get <span className="text-primaryColor">account</span>{" "}
                        back
                      </h3>
                      {!isSuccess ? (
                        <Fragment>
                          <div className="wrap-login-container-content-form-item">
                            <FastField
                              type="email"
                              name="email"
                              id="email"
                              placeholder="Your email"
                              className={
                                helperFormik.errors.email && "border-err"
                              }
                            />
                            <span className="err-text">
                              <ErrorMessage name="email" />
                            </span>
                          </div>
                          <button
                            type="submit"
                            className="wrap-login-container-content-form-btn"
                            disabled={mutateForgotPassword.isLoading}
                          >
                            {mutateForgotPassword.isLoading ? (
                              <PulseLoader size={12} color="#48647f" />
                            ) : (
                              "Check"
                            )}
                          </button>
                        </Fragment>
                      ) : (
                        <Fragment>
                          <h5
                            className="wrap-login-container-content-form-title"
                            style={{ textAlign: "center" }}
                          >
                            Check your{" "}
                            <span className="text-primaryColor">Email</span>{" "}
                            🎉🎉🎉
                          </h5>
                        </Fragment>
                      )}
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

export default ForgotPassword;
