import Card from "../components/Card";

const Dashboard = () => {
  return (
    <div className="p-8 grid grid-cols-3 gap-6">
      <Card title="Websites" value="2" />
      <Card title="Disk Usage" value="1.2GB" />
      <Card title="Bandwidth" value="12GB" />
    </div>
  );
};

export default Dashboard;