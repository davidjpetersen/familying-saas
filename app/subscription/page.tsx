import { PricingTable } from "@clerk/nextjs";

const SubscriptionPage = () => {
  return (
    <main>
      <div className="max-w-4xl mx-auto py-12">
        <PricingTable forOrganizations />
      </div>
    </main>
  );
};

export default SubscriptionPage;
