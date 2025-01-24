import { convertDateString } from "@/utils/paylabs";
import { clsx } from "clsx";
import React, { useEffect, useState } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCancel: () => void;
  qrUrl?: string;
  virtualAccountNo?: string;
  paymentExpired: string;
  customerNo: string;
  paymentId: string;
  totalAmount: string;
  orderId: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onCancel,
  qrUrl,
  virtualAccountNo,
  customerNo,
  paymentExpired,
  paymentId,
  totalAmount,
  orderId,
}) => {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (isOpen) {
      let expirationDate: Date;
      if (paymentExpired.length === 14) {
        expirationDate = convertDateString(paymentExpired);
      } else {
        expirationDate = new Date(paymentExpired);
      }
      const now = new Date();
      const difference = expirationDate.getTime() - now.getTime();
      setTimeLeft(Math.max(0, Math.floor(difference / 1000))); // Set time left in seconds

      const timer = setInterval(() => {
        setTimeLeft((prev) => Math.max(0, prev - 1));
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isOpen, paymentExpired]);

  if (!isOpen) return null;

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${String(hours).padStart(2, "0")} : ${String(minutes).padStart(2, "0")} : ${String(secs).padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-11/12 max-w-md rounded-lg bg-white p-6 shadow-lg">
        <div className="mb-4 text-center text-lg">
          - Berlaku {timeLeft > 0 ? formatTime(timeLeft) : "00 : 00 : 00"} -
        </div>
        {virtualAccountNo ? (
          <div
            className={clsx(
              "mb-4 text-center",
              timeLeft > 0 ? "visible" : "hidden",
            )}
          >
            <h3 className="mb-4 text-center text-2xl font-semibold">
              Kode Pembayaran
            </h3>
            <div className="mb-4 text-center text-3xl font-bold">
              {virtualAccountNo}
            </div>
          </div>
        ) : (
          <div
            className={clsx(
              "mb-4 text-center",
              timeLeft > 0 ? "visible" : "hidden",
            )}
          >
            <img src={qrUrl} alt="QR Code" className="mx-auto h-48 w-48" />
          </div>
        )}

        <div className="mb-4 text-left">
          <table>
            <tbody>
              <tr>
                <td> Total Pembayaran</td>
                <td></td>
                <td>
                  <strong>
                    {" "}
                    IDR {parseFloat(totalAmount).toLocaleString()}
                  </strong>
                </td>
              </tr>
              <tr>
                <td> Order Id</td>
                <td></td>
                <td>
                  <strong>{orderId}</strong>
                </td>
              </tr>
              <tr>
                <td> Payment Id</td>
                <td></td>
                <td>
                  <strong>{paymentId}</strong>
                </td>
              </tr>
              {customerNo && (
                <>
                  <tr>
                    <td> Customer Number</td>
                    <td></td>
                    <td>
                      <strong>{customerNo}</strong>
                    </td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
        {/* <button
          className="mt-4 w-full rounded-lg bg-blue-500 py-2 font-bold text-white transition-colors hover:bg-blue-600"
          onClick={onClose}
        >
          Close
        </button> */}
        <button
          className="mt-4 w-full rounded-lg bg-red-500 py-2 font-bold text-white transition-colors hover:bg-red-600"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default Modal;
