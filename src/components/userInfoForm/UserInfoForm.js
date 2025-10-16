import styles from "./UserInfoForm.module.scss";
import React from "react";

const UserInfoForm = ({ formData, handleChange, handleSubmit, message }) => {
  // Ensure formData has default values to avoid uncontrolled to controlled input warning
  const defaultFormData = {
    name: "",
    email: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    postcode: "",
    country: "",
    ...formData,
  };

  return (
    <div className={styles.userInfo}>
      <form className="form" onSubmit={handleSubmit}>
        <div className="formRow">
          <input
            name="name"
            placeholder="Full Name"
            value={defaultFormData.name}
            onChange={handleChange}
            className="formInput"
          />
        </div>

        <div className="formRow">
          <input
            name="email"
            placeholder="Email"
            type="email"
            value={defaultFormData.email}
            onChange={handleChange}
            className="formInput"
          />
        </div>

        <div className="formRow">
          <input
            name="phone"
            placeholder="Phone"
            value={defaultFormData.phone}
            onChange={handleChange}
            className="formInput"
          />
        </div>

        <div className="formRow">
          <input
            name="addressLine1"
            placeholder="Address Line 1"
            value={defaultFormData.addressLine1}
            onChange={handleChange}
            className="formInput"
          />
        </div>

        <div className="formRow">
          <input
            name="addressLine2"
            placeholder="Address Line 2 (Optional)"
            value={defaultFormData.addressLine2}
            onChange={handleChange}
            className="formInput"
          />
        </div>

        <div className="formRow">
          <input
            name="city"
            placeholder="City"
            value={defaultFormData.city}
            onChange={handleChange}
            className="formInput"
          />
        </div>

        <div className="formRow">
          <input
            name="postcode"
            placeholder="Postal Code"
            value={defaultFormData.postcode}
            onChange={handleChange}
            className="formInput"
          />
        </div>

        <div className="formRow">
          <input
            name="country"
            placeholder="Country"
            value={defaultFormData.country}
            onChange={handleChange}
            className="formInput"
          />
        </div>

        <button className="form-submit" type="submit">
          Update
        </button>

        {message && <p>{message}</p>}
      </form>
    </div>
  );
};

export default UserInfoForm;
