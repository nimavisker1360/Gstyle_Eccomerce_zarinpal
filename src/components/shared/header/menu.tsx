import CartButton from "./cart-button";
import UserButtonClient from "./user-button-client";

export default function Menu() {
  return (
    <div className="flex items-center gap-6">
      <UserButtonClient />
      <CartButton />
    </div>
  );
}
