import { useMutation } from "@tanstack/react-query";
import { Fragment, useCallback, useState } from "react";
import { Link } from "react-router-dom";
import PulseLoader from "react-spinners/PulseLoader";
import { SubmitContactService } from "../../services/ContactService";
import { showToast } from "../../utils/showToast";
import "./ContactPage.scss";

const ContactPage = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const mutateContact = useMutation({
    mutationFn: (data) => SubmitContactService(data),
  });

  const handleChange = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      try {
        const res = await mutateContact.mutateAsync(form);
        if (!res?.success) {
          throw new Error(res?.message || "Could not send message");
        }
        setForm({ name: "", email: "", message: "" });
        showToast.success("Message sent");
      } catch (err) {
        showToast.error(err.message || "Could not send message");
      }
    },
    [form, mutateContact]
  );

  return (
    <Fragment>
      <section className="title-section">
        <div className="section-center">
          <h3>
            <Link to="/">Home</Link> / contact
          </h3>
        </div>
      </section>

      <section className="page section section-center contact-page">
        <div className="contact-page__inner">
          <h2 className="contact-page__title">Get in touch</h2>
          <hr className="contact-page__divider" />
          <p className="contact-page__intro">
            If you have any questions, send us a message and we will get back to
            you as soon as possible.
          </p>

          <form className="contact-page__form" onSubmit={handleSubmit}>
            <div className="contact-page__field">
              <label htmlFor="contact-name" className="sr-only">
                Name
              </label>
              <input
                id="contact-name"
                type="text"
                required
                placeholder="Your name"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                autoComplete="name"
              />
            </div>
            <div className="contact-page__field">
              <label htmlFor="contact-email" className="sr-only">
                Email
              </label>
              <input
                id="contact-email"
                type="email"
                required
                placeholder="Your email"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                autoComplete="email"
              />
            </div>
            <div className="contact-page__field">
              <label htmlFor="contact-message" className="sr-only">
                Message
              </label>
              <textarea
                id="contact-message"
                required
                rows={6}
                placeholder="Your message"
                value={form.message}
                onChange={(e) => handleChange("message", e.target.value)}
              />
            </div>
            <button type="submit" className="btn contact-page__submit">
              {mutateContact.isLoading ? (
                <PulseLoader size={12} color="#f1f5f8" />
              ) : (
                "Send message"
              )}
            </button>
          </form>
        </div>
      </section>
    </Fragment>
  );
};

export default ContactPage;
