/* eslint-disable react/prop-types */
import { Flex, Input } from "antd";
import { Fragment } from "react";
const { TextArea } = Input;
const InputCommon = (props) => {
  //! Props
  const { field, form, title, placeholder, style, type, isTextArea, prefix } =
    props;
  //! State
  const name = field?.name;
  const valueInput = field?.value;
  const error = form?.errors?.[name];
  const touched = form?.touched?.[name];
  //! Function
  const handleChange = (e) => {
    form && form.setFieldValue(name, e.target.value);
  };
  //! Effect

  //! Render
  if (isTextArea) {
    return (
      <Fragment>
        <Flex vertical>
          {title && (
            <span
              style={{ marginBottom: "8px", fontWeight: 500, display: "block" }}
            >
              {title}
            </span>
          )}
          <TextArea
            value={valueInput}
            style={style}
            status={error && touched ? "error" : null}
            onChange={handleChange}
            placeholder={placeholder}
            rows={4}
          />
          {error && <span className="err-text">{error}</span>}
        </Flex>
      </Fragment>
    );
  }
  return (
    <Fragment>
      <Flex vertical>
        {title && (
          <span
            style={{ marginBottom: "8px", fontWeight: 500, display: "block" }}
          >
            {title}
          </span>
        )}
        <Input
          title={title}
          type={type || "text"}
          placeholder={placeholder}
          style={{ ...style }}
          value={valueInput}
          status={error && touched ? "error" : null}
          onChange={handleChange}
          prefix={prefix ?? null}
        />
        {error && <span className="err-text">{error}</span>}
      </Flex>
    </Fragment>
  );
};

export default InputCommon;
