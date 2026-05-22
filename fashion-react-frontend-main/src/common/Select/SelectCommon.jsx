/* eslint-disable react/prop-types */
import { Select } from "antd";
import { Fragment } from "react";

const SelectCommon = (props) => {
  //! Props
  const { field, form, style, title, placeholder, options } = props;
  //! State
  const name = field?.name;
  const value = field?.value;
  const error = form?.errors?.[name];
  const touched = form?.touched?.[name];
  //! Function
  const handleChange = (value) => {
    form && form?.setFieldValue(name, value);
  };
  //! Effect

  //! Render
  return (
    <Fragment>
      {title && (
        <span
          style={{ marginBottom: "8px", fontWeight: 500, display: "block" }}
        >
          {title}
        </span>
      )}
      <Select
        value={value}
        status={error && touched && "error"}
        options={options}
        placeholder={placeholder}
        onChange={handleChange}
        style={style}
      />
      {error && <span className="err-text">{error}</span>}
    </Fragment>
  );
};

export default SelectCommon;
