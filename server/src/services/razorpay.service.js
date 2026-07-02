import crypto from "crypto";
import axios from "axios";

const RAZORPAY_API_URL = "https://api.razorpay.com/v1";

export const getRazorpayConfig = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error("RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are required.");
  }

  return { keyId, keySecret };
};

export const createRazorpayOrderRequest = async (payload) => {
  const { keyId, keySecret } = getRazorpayConfig();

  const response = await axios.post(`${RAZORPAY_API_URL}/orders`, payload, {
    auth: {
      username: keyId,
      password: keySecret,
    },
  });

  return response.data;
};

export const verifyRazorpayPaymentSignature = ({ orderId, paymentId, signature }) => {
  const { keySecret } = getRazorpayConfig();
  const expectedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  return expectedSignature === signature;
};
