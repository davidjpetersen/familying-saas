import { UserProfile } from "@clerk/nextjs";
import ThemeToggle from "@/components/ThemeToggle";

export default function AccountPage() {
  return (
    <UserProfile path="/account">
      <UserProfile.Page label="Appearance" url="appearance">
        <ThemeToggle />
      </UserProfile.Page>
    </UserProfile>
  );
}

