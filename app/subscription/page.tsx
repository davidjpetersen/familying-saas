import { PricingTable } from "@clerk/nextjs";

const SubscriptionPage = () => {
  return (
    <main>
      <PricingTable forOrganizations />
    </main>
  );
};

export default SubscriptionPage;
