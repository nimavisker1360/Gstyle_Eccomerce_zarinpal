import {
  Body,
  Column,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

import { convertTRYToToman, formatToman } from "@/lib/utils";
import { IOrder } from "@/lib/db/models/order.model";
import { SERVER_URL } from "@/lib/constants";

type OrderInformationProps = {
  order: IOrder;
};

PurchaseReceiptEmail.PreviewProps = {
  order: {
    _id: "123",
    isPaid: true,
    paidAt: new Date(),
    totalPrice: 100,
    itemsPrice: 100,
    taxPrice: 0,
    shippingPrice: 0,
    user: {
      name: "John Doe",
      email: "john.doe@example.com",
    },
    shippingAddress: {
      fullName: "John Doe",
      street: "123 Main St",
      city: "New York",
      postalCode: "12345",
      country: "USA",
      phone: "123-456-7890",
      province: "New York",
    },
    items: [
      {
        clientId: "123",
        name: "Product 1",
        image: "https://via.placeholder.com/150",
        price: 100,
        quantity: 1,
        product: "123",
        slug: "product-1",
        category: "Category 1",
        countInStock: 10,
      },
    ],
    paymentMethod: "PayPal",
    expectedDeliveryDate: new Date(),
    isDelivered: true,
  } as IOrder,
} satisfies OrderInformationProps;
const dateFormatter = new Intl.DateTimeFormat("en", { dateStyle: "medium" });

// Helper function to safely convert TRY → Toman and format in fa-IR
const safeFormatToman = (amount: number | undefined | null): string => {
  try {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return formatToman(0);
    }
    return formatToman(convertTRYToToman(amount));
  } catch {
    return formatToman(0);
  }
};

// Helper function to safely format date
const safeFormatDate = (date: any): string => {
  try {
    if (!date) return "N/A";
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return "N/A";
    return dateFormatter.format(dateObj);
  } catch {
    return "N/A";
  }
};

export default function PurchaseReceiptEmail({ order }: OrderInformationProps) {
  // Ensure order exists and has required properties
  if (!order) {
    return (
      <Html>
        <Body>
          <Text>Order information not available</Text>
        </Body>
      </Html>
    );
  }

  try {
    const orderId = order._id?.toString() || "N/A";
    const createdAt = safeFormatDate(order.createdAt);
    const totalPrice = order.totalPrice || 0;
    const items = Array.isArray(order.items) ? order.items : [];
    const itemsPrice = order.itemsPrice || 0;
    const taxPrice = order.taxPrice || 0;
    const shippingPrice = order.shippingPrice || 0;

    return (
      <Html>
        <Preview>View order receipt</Preview>
        <Tailwind>
          <Head />
          <Body className="font-sans bg-white">
            <Container className="max-w-xl">
              <Heading>Purchase Receipt</Heading>
              <Section>
                <Row>
                  <Column>
                    <Text className="mb-0 text-gray-500 whitespace-nowrap text-nowrap mr-4">
                      Order ID
                    </Text>
                    <Text className="mt-0 mr-4">{orderId}</Text>
                  </Column>
                  <Column>
                    <Text className="mb-0 text-gray-500 whitespace-nowrap text-nowrap mr-4">
                      Purchased On
                    </Text>
                    <Text className="mt-0 mr-4">{createdAt}</Text>
                  </Column>
                  <Column>
                    <Text className="mb-0 text-gray-500 whitespace-nowrap text-nowrap mr-4">
                      Price Paid
                    </Text>
                    <Text className="mt-0 mr-4">
                      {safeFormatToman(totalPrice)}
                    </Text>
                  </Column>
                </Row>
              </Section>
              <Section className="border border-solid border-gray-500 rounded-lg p-4 md:p-6 my-4">
                {items.map((item, index) => {
                  const itemName = item?.name || "Product";
                  const itemQuantity = item?.quantity || 1;
                  const itemPrice = item?.price || 0;
                  const itemImage =
                    item?.image || "https://via.placeholder.com/80";
                  const itemProduct = item?.product || index.toString();

                  return (
                    <Row key={itemProduct} className="mt-8">
                      <Column className="w-20">
                        <Img
                          width="80"
                          alt={itemName}
                          className="rounded"
                          src={
                            itemImage?.startsWith("/")
                              ? `${SERVER_URL}${itemImage}`
                              : itemImage
                          }
                        />
                      </Column>
                      <Column className="align-top">
                        <Text className="mx-2 my-0">
                          {itemName} x {itemQuantity}
                        </Text>
                      </Column>
                      <Column align="right" className="align-top">
                        <Text className="m-0 ">
                          {safeFormatToman(itemPrice)}
                        </Text>
                      </Column>
                    </Row>
                  );
                })}
                {[
                  { name: "Items", price: itemsPrice },
                  { name: "Tax", price: taxPrice },
                  { name: "Shipping", price: shippingPrice },
                  { name: "Total", price: totalPrice },
                ].map(({ name, price }) => (
                  <Row key={name} className="py-1">
                    <Column align="right">{name}:</Column>
                    <Column align="right" width={70} className="align-top">
                      <Text className="m-0">{safeFormatToman(price)}</Text>
                    </Column>
                  </Row>
                ))}
              </Section>
            </Container>
          </Body>
        </Tailwind>
      </Html>
    );
  } catch (error) {
    console.error("Error rendering email template:", error);
    return (
      <Html>
        <Body>
          <Text>Error rendering order receipt</Text>
        </Body>
      </Html>
    );
  }
}
