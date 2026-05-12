import { useMutation } from "@tanstack/react-query";
import { ErrorMessage, FastField, Field, Formik, Form } from "formik";
import { Fragment, useCallback, useContext, useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import * as Yup from "yup";
import { adminContext } from "../../../context/AdminContext";
import { LoginAdminService } from "../../../services/AdminService";
import HashLoader from "react-spinners/HashLoader";

const LoginAdmin = () => {
  const navigate = useNavigate();
  const { dispatch, tokenAdmin } = useContext(adminContext);
  //! Props

  //! State
  const [isEye, setIsEye] = useState(false);
  const mutateLogin = useMutation({
    mutationFn: (data) => LoginAdminService(data),
  });
  //! Function
  const handleSubmit = useCallback(async (values) => {
    try {
      dispatch({ type: "LOGIN_START" });
      const response = await mutateLogin.mutateAsync({
        email: values.email,
        password: values.password,
      });
      const { success, message } = response;
      if (!success) {
        throw new Error(message);
      }
      toast.success(message);
      dispatch({
        type: "LOGIN_SUCCESS",
        payload: {
          admin: response.admin,
          tokenAdmin: response.token,
        },
      });
      navigate("/admin/dashboard", { replace: true });
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  }, []);
  //! Effect

  //! Render
  return (
    <Fragment>
      {tokenAdmin ? (
        <Navigate to={"/admin/dashboard"} replace={true} />
      ) : (
        <div className="bg-admin-login">
          <div className="wrap-login-container-content" style={{ margin: "0" }}>
            <Formik
              initialValues={{
                email: "",
                password: "",
              }}
              enableReinitialize
              validationSchema={Yup.object({
                email: Yup.string()
                  .required("Require!")
                  .email("Invalid email!")
                  .trim(),
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
                      Admin{" "}
                      <span className="text-primaryColor">sign in</span>
                    </h3>
                    <div className="wrap-login-container-content-form-item">
                      <FastField
                        type="email"
                        name="email"
                        id="email"
                        placeholder="Admin email"
                        className={helperFormik.errors.email && "border-err"}
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
                          placeholder="Password (min. 6 characters)"
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
                    >
                      {mutateLogin.isLoading ? (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <HashLoader size={28} color="#f1f5f8" />
                        </div>
                      ) : (
                        "Sign in"
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

export default LoginAdmin;
