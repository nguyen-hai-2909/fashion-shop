import { Fragment, useCallback, useContext, useState } from "react";
import "./UserAccount.scss";
import { FastField, Form, Formik } from "formik";
import { authContext } from "../../context/AuthContext";
import { useMutation } from "@tanstack/react-query";
import { UpdateAccountService } from "../../services/AccountService";
import { toast } from "react-toastify";
import PulseLoader from "react-spinners/PulseLoader";
import ModalChangePassword from "../ModalChangePassword/ModalChangePassword";
const UserAccount = () => {
  const { user, dispatch, token } = useContext(authContext);
  //! Props

  //! State
  const [isActiveModal, setIsActiveModal] = useState(false);
  const mutateUpdate = useMutation({
    mutationFn: (data) => UpdateAccountService(data, token),
  });
  //! Function
  const handleSubmit = useCallback(async (values) => {
    try {
      const response = await mutateUpdate.mutateAsync({
        name: values?.name,
        address: values?.address,
      });
      const { success, message } = response;
      if (!success) {
        throw new Error(message);
      }
      dispatch({
        type: "UPDATE_USER",
        payload: {
          user: response?.user,
        },
      });
      toast.success(message);
    } catch (error) {
      console.log("error", error);
      toast.error(error.message);
    }
  }, []);
  //! Effect
  //! Render
  return (
    <Fragment>
      <Formik
        initialValues={{
          name: user.name ?? "",
          phoneNumber: user.phoneNumber ?? "",
          email: user.email ?? "",
          address: user.address ?? "",
        }}
        validateOnMount
        onSubmit={handleSubmit}
      >
        {() => {
          return (
            <Form>
              <div className="info-account">
                <h3>Profile account</h3>
                <div className="info-account-item">
                  <div className="title-info">Full name</div>
                  <div className="content-info">
                    <FastField
                      name="name"
                      placeholder="Your name"
                      disabled={false}
                    />
                  </div>
                </div>
                <div className="info-account-item">
                  <div className="title-info">Phone number</div>
                  <div className="content-info">
                    <FastField
                      type="text"
                      name="phoneNumber"
                      placeholder="Your phone"
                      disabled
                    />
                  </div>
                </div>
                <div className="info-account-item">
                  <div className="title-info">Email</div>
                  <div className="content-info">
                    <FastField
                      type="email"
                      name="email"
                      placeholder="Your email"
                      disabled
                    />
                  </div>
                </div>
                <div className="info-account-item">
                  <div className="title-info">Address</div>
                  <div className="content-info">
                    <FastField
                      type="text"
                      name="address"
                      placeholder="Your address"
                    />
                  </div>
                </div>
                <div className="option-user">
                  <div
                    className={`${"pass-toggle"}`}
                    onClick={() => setIsActiveModal(true)}
                  >
                    Change password
                  </div>
                </div>
                <div className={`info-account-btn end`}>
                  <button type="submit" disabled={mutateUpdate.isLoading}>
                    {mutateUpdate.isLoading ? (
                      <PulseLoader size={12} color="#decbc0" />
                    ) : (
                      "Update profile"
                    )}{" "}
                  </button>
                </div>
              </div>
            </Form>
          );
        }}
      </Formik>
      {isActiveModal && (
        <ModalChangePassword setIsActiveModal={setIsActiveModal} />
      )}
    </Fragment>
  );
};

export default UserAccount;
