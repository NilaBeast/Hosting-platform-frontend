import { createContext, useContext, useState, useEffect } from "react";

const CheckoutContext = createContext();

export const useCheckout = () => {
  return useContext(CheckoutContext);
};

export const CheckoutProvider = ({ children }) => {
  /* 🔥 LOAD FROM LOCALSTORAGE */
  const [checkout, setCheckout] = useState(() => {
    try {
      const saved = localStorage.getItem("checkout");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  /* 🔥 AUTO SAVE */
  useEffect(() => {
    if (checkout && Object.keys(checkout).length > 0) {
      localStorage.setItem("checkout", JSON.stringify(checkout));
    }
  }, [checkout]);

  /* 🔥 OPTIONAL: CLEAR AFTER SUCCESS */
  const clearCheckout = () => {
    setCheckout({});
    localStorage.removeItem("checkout");
  };

  return (
    <CheckoutContext.Provider
      value={{ checkout, setCheckout, clearCheckout }}
    >
      {children}
    </CheckoutContext.Provider>
  );
};