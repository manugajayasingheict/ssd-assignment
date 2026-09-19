import React, { useState, useEffect } from "react";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from "./firebase";

export default function PhoneAuth() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");

  // ✅ Initialize RecaptchaVerifier only once
  useEffect(() => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "normal",
          callback: (response) => {
            console.log("reCAPTCHA solved", response);
          },
          "expired-callback": () => {
            alert("reCAPTCHA expired, please try again!");
          },
        }
      );
      window.recaptchaVerifier.render().then((widgetId) => {
        window.recaptchaWidgetId = widgetId;
      });
    }
  }, []);

  // ✅ Send OTP
  const sendOTP = async () => {
    if (!phoneNumber.startsWith("+94")) {
      alert("Please enter your number with country code, e.g. +94771234567");
      return;
    }

    try {
      const appVerifier = window.recaptchaVerifier;
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        phoneNumber,
        appVerifier
      );
      window.confirmationResult = confirmationResult;
      alert("✅ OTP sent successfully!");
    } catch (error) {
      console.error("Error sending OTP:", error);
      alert("❌ Error sending OTP: " + error.message);
    }
  };

  // ✅ Verify OTP
  const verifyOTP = async () => {
    try {
      const confirmationResult = window.confirmationResult;
      if (!confirmationResult) {
        alert("Please request OTP first!");
        return;
      }
      const result = await confirmationResult.confirm(otp);
      alert("✅ Verified! Logged in as: " + result.user.phoneNumber);
    } catch (error) {
      console.error(error);
      alert("❌ Invalid OTP or expired!");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h3>📱 Phone Authentication</h3>

      <div id="recaptcha-container" style={{ marginBottom: "20px" }}></div>

      <input
        type="text"
        placeholder="+94771234567"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
        style={{
          padding: "8px",
          fontSize: "16px",
          width: "250px",
          borderRadius: "8px",
        }}
      />
      <br />
      <button
        onClick={sendOTP}
        style={{
          marginTop: "10px",
          padding: "8px 16px",
          fontSize: "16px",
          cursor: "pointer",
          borderRadius: "8px",
        }}
      >
        Send OTP
      </button>

      <br />
      <br />
      <input
        type="text"
        placeholder="Enter OTP"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        style={{
          padding: "8px",
          fontSize: "16px",
          width: "250px",
          borderRadius: "8px",
        }}
      />
      <br />
      <button
        onClick={verifyOTP}
        style={{
          marginTop: "10px",
          padding: "8px 16px",
          fontSize: "16px",
          cursor: "pointer",
          borderRadius: "8px",
        }}
      >
        Verify OTP
      </button>
    </div>
  );
}
