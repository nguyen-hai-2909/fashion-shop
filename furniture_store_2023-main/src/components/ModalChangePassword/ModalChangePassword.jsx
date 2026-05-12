/* eslint-disable react/prop-types */
import { Fragment, useCallback, useContext, useState } from "react";
import "./ModalChangePassword.scss";
import {
  AiOutlineClose,
  AiOutlineEye,
  AiOutlineEyeInvisible,
} from "react-icons/ai";
import { ErrorMessage, Field, Form, Formik } from "formik";
import * as Yup from "yup";
import { useMutation } from "@tanstack/react-query";
import { ChangePasswordAccountService } from "../../services/AccountService";
import { toast } from "react-toastify";
import PulseLoader from "react-spinners/PulseLoader";
import { authContext } from "../../context/AuthContext";
const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
const PASSWORD_RULE_MESSAGE =
  "Password must be at least 8 characters and include uppercase, lowercase, number, and special character.";

const ModalChangePassword = (props) => {
  const { token } = useContext(authContext);
  //! Props
  const { setIsActiveModal } = props;
  //! State
  const [isEye, setIsEye] = useState(false);
  const mutateChangePassword = useMutation({
    mutationFn: (password) => ChangePasswordAccountService(password, token),
  });
  //! Function
  const handleSubmit = useCallback(async (values) => {
    try {
      const response = await mutateChangePassword.mutateAsync({
        newPassword: values.password,
      });
      const { success, message } = response;
      if (!success) {
        throw new Error(message);
      }
      toast.success(message);
      setIsActiveModal(false);
    } catch (error) {
      console.log("error", error);
      toast.error(error.message);
    }
  }, []);
  //! Effect

  //! Render
  return (
    <Fragment>
      <div className="wrap-form">
        <div className="wrap-form-container">
          <div className="wrap-form-container-content">
            <AiOutlineClose
              className="close-icon"
              onClick={() => setIsActiveModal((prev) => !prev)}
            />
            <Formik
              initialValues={{ password: "" }}
              enableReinitialize
              validationSchema={Yup.object({
                password: Yup.string()
                  .required("Require!")
                  .matches(STRONG_PASSWORD_REGEX, PASSWORD_RULE_MESSAGE)
                  .trim(),
              })}
              validateOnBlur={false}
              validateOnChange={false}
              validateOnMount={false}
              onSubmit={handleSubmit}
            >
              {(helperFormik) => {
                return (
                  <Form className="wrap-form-container-content-form">
                    <h3 className="wrap-form-container-content-form-title">
                      Change password
                    </h3>
                    <div className="wrap-login-container-content-form-item">
                      <div className="relative">
                        <Field
                          name="password"
                          type={`${isEye ? "text" : "password"}`}
                          id="password"
                          placeholder="At least 8 chars, upper/lower, number, special"
                          className={
                            helperFormik.errors.password && "border-err"
                          }
                        />
                        <span
                          id="eyePass"
                          className="wrap-form-container-content-form-item-icon"
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
                      className="wrap-form-container-content-form-btn"
                      disabled={mutateChangePassword.isLoading}
                    >
                      {mutateChangePassword?.isLoading ? (
                        <PulseLoader size={12} color="#48647f" />
                      ) : (
                        "Change"
                      )}
                    </button>
                  </Form>
                );
              }}
            </Formik>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default ModalChangePassword;
