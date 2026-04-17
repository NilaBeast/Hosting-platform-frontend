import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ProductAPI } from "../api/api";
import { useCheckout } from "../context/CheckoutContext";
import { useNavigate } from "react-router-dom";

const ProductPage = () => {
  const { groupSlug, productSlug } = useParams();
  const [product, setProduct] = useState(null);

  const { setCheckout } = useCheckout();
  const navigate = useNavigate();

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const res = await ProductAPI.getBySlug(groupSlug, productSlug);
    setProduct(res.data);

    // 🔥 AUTO START FLOW
    setCheckout({
      type: "hosting",
      plan: res.data,
    });

    navigate("/checkout/domain"); // 🔥 DIRECT DOMAIN STEP
  };

  return <div className="text-white p-10">Loading...</div>;
};

export default ProductPage;