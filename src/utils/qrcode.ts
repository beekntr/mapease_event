import QRCode from "qrcode";
import { QRCodeData } from "../types";

export const generateQRCode = async (data: QRCodeData): Promise<string> => {
  try {
    const qrData = JSON.stringify(data);
    const qrCodeDataURL = await QRCode.toDataURL(qrData, {
      width: 256,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    });
    return qrCodeDataURL;
  } catch (error) {
    console.error("Error generating QR code:", error);
    throw new Error("Failed to generate QR code");
  }
};

export const parseQRCode = (qrData: string): QRCodeData | null => {
  try {
    const parsed = JSON.parse(qrData);
    if (
      typeof parsed.registrationId === "string" &&
      typeof parsed.eventId === "string" &&
      typeof parsed.userId === "string" &&
      typeof parsed.timestamp === "number"
    ) {
      return parsed as QRCodeData;
    }
    return null;
  } catch (error) {
    console.error("Error parsing QR code:", error);
    return null;
  }
};

export const isQRCodeValid = (qrData: QRCodeData): boolean => {
  // Check if QR code is not expired (valid for 24 hours)
  const expirationTime = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  const currentTime = Date.now();
  return currentTime - qrData.timestamp < expirationTime;
};
