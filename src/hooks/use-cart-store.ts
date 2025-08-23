import { create } from "zustand";
import { persist } from "zustand/middleware";

import { Cart, OrderItem, ShippingAddress } from "@/types";
import { calcDeliveryDateAndPrice } from "@/lib/actions/order.actions";

const initialState: Cart = {
  items: [],
  itemsPrice: 0,
  taxPrice: undefined,
  shippingPrice: undefined,
  totalPrice: 0,
  paymentMethod: undefined,
  shippingAddress: undefined,
  deliveryDateIndex: undefined,
};

interface CartState {
  cart: Cart;
  addItem: (item: OrderItem, quantity: number) => Promise<string>;
  updateItem: (item: OrderItem, quantity: number) => void;
  updateItemNote: (clientItemId: string, note: string) => void;
  removeItem: (item: OrderItem) => void;
  clearCart: () => void;
  replaceCart: (cart: Cart) => void;
  saveCart: () => Promise<void>;

  setShippingAddress: (shippingAddress: ShippingAddress) => void;
  setPaymentMethod: (paymentMethod: string) => void;
  setDeliveryDateIndex: (index: number) => void;
}

// Lightweight client-side saver to sync cart to server when authenticated.
let saveTimer: any | null = null;
const persistCartToServer = (cart: Cart) => {
  try {
    if (typeof window === "undefined") return;
    if (!cart.items || cart.items.length === 0) return; // never overwrite with empty
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      fetch("/api/cart", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cart),
      }).catch(() => {});
    }, 300);
  } catch {}
};

const useCartStore = create(
  persist<CartState>(
    (set, get) => ({
      cart: initialState,

      addItem: async (item: OrderItem, quantity: number) => {
        const { items, shippingAddress } = get().cart;
        const existItem = items.find(
          (x) =>
            x.product === item.product &&
            x.color === item.color &&
            x.size === item.size
        );

        if (existItem) {
          if (existItem.countInStock < quantity + existItem.quantity) {
            throw new Error("Not enough items in stock");
          }
        } else {
          if (item.countInStock < item.quantity) {
            throw new Error("Not enough items in stock");
          }
        }

        const updatedCartItems = existItem
          ? items.map((x) =>
              x.product === item.product &&
              x.color === item.color &&
              x.size === item.size
                ? { ...existItem, quantity: existItem.quantity + quantity }
                : x
            )
          : [...items, { ...item, quantity }];

        set({
          cart: {
            ...get().cart,
            items: updatedCartItems,
            ...calcDeliveryDateAndPrice({
              items: updatedCartItems,
              shippingAddress,
            }),
          },
        });
        persistCartToServer(get().cart);
        const foundItem = updatedCartItems.find(
          (x) =>
            x.product === item.product &&
            x.color === item.color &&
            x.size === item.size
        );
        if (!foundItem) {
          throw new Error("Item not found in cart");
        }
        return foundItem.clientId;
      },
      updateItem: (item: OrderItem, quantity: number) => {
        const { items, shippingAddress } = get().cart;
        const exist = items.find(
          (x) =>
            x.product === item.product &&
            x.color === item.color &&
            x.size === item.size
        );
        if (!exist) return;
        const updatedCartItems = items.map((x) =>
          x.product === item.product &&
          x.color === item.color &&
          x.size === item.size
            ? { ...exist, quantity: quantity }
            : x
        );
        set({
          cart: {
            ...get().cart,
            items: updatedCartItems,
            ...calcDeliveryDateAndPrice({
              items: updatedCartItems,
              shippingAddress,
            }),
          },
        });
        persistCartToServer(get().cart);
      },
      updateItemNote: (clientItemId: string, note: string) => {
        const { items, shippingAddress } = get().cart;
        const updatedCartItems = items.map((x) =>
          x.clientId === clientItemId ? { ...x, note } : x
        );
        set({
          cart: {
            ...get().cart,
            items: updatedCartItems,
            ...calcDeliveryDateAndPrice({
              items: updatedCartItems,
              shippingAddress,
            }),
          },
        });
        persistCartToServer(get().cart);
      },
      removeItem: (item: OrderItem) => {
        const { items, shippingAddress } = get().cart;
        const updatedCartItems = items.filter(
          (x) =>
            x.product !== item.product ||
            x.color !== item.color ||
            x.size !== item.size
        );
        set({
          cart: {
            ...get().cart,
            items: updatedCartItems,
            ...calcDeliveryDateAndPrice({
              items: updatedCartItems,
              shippingAddress,
            }),
          },
        });
        persistCartToServer(get().cart);
      },
      setShippingAddress: (shippingAddress: ShippingAddress) => {
        const { items } = get().cart;
        set({
          cart: {
            ...get().cart,
            shippingAddress,
            ...calcDeliveryDateAndPrice({
              items,
              shippingAddress,
            }),
          },
        });
        persistCartToServer(get().cart);
      },
      setPaymentMethod: (paymentMethod: string) => {
        set({
          cart: {
            ...get().cart,
            paymentMethod,
          },
        });
        persistCartToServer(get().cart);
      },
      setDeliveryDateIndex: (index: number) => {
        const { items, shippingAddress } = get().cart;

        set({
          cart: {
            ...get().cart,
            ...calcDeliveryDateAndPrice({
              items,
              shippingAddress,
              deliveryDateIndex: index,
            }),
          },
        });
        persistCartToServer(get().cart);
      },
      clearCart: () => {
        // Reset the entire cart back to its initial state
        set({
          cart: initialState,
        });
      },
      replaceCart: (cart: Cart) => {
        set({
          cart,
        });
      },
      saveCart: async () => {
        try {
          const cart = get().cart;
          if (!cart.items || cart.items.length === 0) return;
          await fetch("/api/cart", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(cart),
          });
        } catch {}
      },
      init: () => set({ cart: initialState }),
    }),

    {
      name: "cart-store",
    }
  )
);
export default useCartStore;
