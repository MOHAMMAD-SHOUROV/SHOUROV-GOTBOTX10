const axios = require("axios");

module.exports = async function isVerifyRecaptcha(token) {
  if (!token) return false;

  const secretKey = "6Le9HGosAAAAAIt9d8cnUDZYEPVyiuetGwb8SIVZ";

  try {
    const response = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify`,
      null,
      {
        params: {
          secret: secretKey,
          response: token
        }
      }
    );

    return response.data.success === true;

  } catch (err) {
    console.log("reCAPTCHA error:", err.message);
    return false;
  }
};