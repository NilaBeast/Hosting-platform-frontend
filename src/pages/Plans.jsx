import API from "../api/api";
import toast from "react-hot-toast";

const Plans = () => {
  const buyPlan = async (plan) => {
    await API.post("/hosting/create", {
      domain: "example.com",
      packageName: plan,
    });

    toast.success("Hosting Created");
  };

  return (
    <div className="p-8 grid grid-cols-3 gap-6">
      <div className="bg-[#020617] p-6 rounded">
        <h2>Starter</h2>
        <button onClick={() => buyPlan("starter")}>Buy</button>
      </div>

      <div className="bg-[#020617] p-6 rounded">
        <h2>Pro</h2>
        <button onClick={() => buyPlan("pro")}>Buy</button>
      </div>
    </div>
  );
};

export default Plans;