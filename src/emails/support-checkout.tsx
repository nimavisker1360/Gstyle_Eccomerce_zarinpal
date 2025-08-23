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
import { convertTRYToToman, formatToman, formatDateTime } from "@/lib/utils";

type SupportCheckoutEmailProps = {
  payload: {
    items: Array<{
      name: string;
      image: string;
      quantity: number;
      price: number;
      color?: string;
      size?: string;
      note?: string;
    }>;
    itemsPrice: number;
    shippingPrice?: number;
    taxPrice?: number;
    totalPrice: number;
    paymentMethod?: string;
    shippingAddress?: {
      fullName?: string;
      phone?: string;
    };
    expectedDeliveryDate?: string | Date | null;
  };
};

const safeToman = (tryAmount?: number | null) => {
  if (
    tryAmount === undefined ||
    tryAmount === null ||
    Number.isNaN(tryAmount)
  ) {
    return formatToman(0);
  }
  return formatToman(convertTRYToToman(tryAmount));
};

export default function SupportCheckoutEmail({
  payload,
}: SupportCheckoutEmailProps) {
  const {
    items = [],
    itemsPrice = 0,
    shippingPrice,
    taxPrice,
    totalPrice = 0,
    paymentMethod,
    shippingAddress,
    expectedDeliveryDate,
  } = payload || ({} as any);

  return (
    <Html>
      <Preview>درخواست پشتیبانی سبد خرید مشتری</Preview>
      <Head>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;600;700&display=swap');
          * {
            font-family: 'Vazirmatn', sans-serif !important;
          }
        `}</style>
      </Head>
      <Body
        style={{
          fontFamily: "'Vazirmatn', sans-serif",
          backgroundColor: "#ffffff",
          direction: "rtl",
          textAlign: "right",
        }}
      >
        <Container
          style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}
        >
          <Heading
            style={{
              color: "#2563eb",
              textAlign: "center",
              fontSize: "24px",
              marginBottom: "20px",
            }}
          >
            درخواست پشتیبانی سبد خرید
          </Heading>

          <Section
            style={{
              marginBottom: "16px",
              padding: "16px",
              backgroundColor: "#f8fafc",
              borderRadius: "8px",
            }}
          >
            <Text style={{ margin: "0", fontSize: "14px", color: "#475569" }}>
              <strong>روش پرداخت:</strong> {paymentMethod || "انتخاب نشده"}
            </Text>
            {expectedDeliveryDate ? (
              <Text
                style={{
                  margin: "8px 0 0 0",
                  fontSize: "14px",
                  color: "#475569",
                }}
              >
                <strong>تاریخ تحویل مورد انتظار:</strong>{" "}
                {formatDateTime(new Date(expectedDeliveryDate as any)).dateOnly}
              </Text>
            ) : null}
          </Section>

          {shippingAddress ? (
            <Section
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                padding: "16px",
                marginBottom: "16px",
              }}
            >
              <Text
                style={{
                  fontWeight: "600",
                  fontSize: "16px",
                  color: "#1e293b",
                  margin: "0 0 8px 0",
                }}
              >
                اطلاعات تماس مشتری
              </Text>
              <Text style={{ margin: "0", fontSize: "14px", color: "#475569" }}>
                <strong>نام:</strong> {shippingAddress.fullName || "وارد نشده"}
              </Text>
              <Text
                style={{
                  margin: "4px 0 0 0",
                  fontSize: "14px",
                  color: "#475569",
                }}
              >
                <strong>تلفن:</strong> {shippingAddress.phone || "وارد نشده"}
              </Text>
            </Section>
          ) : null}

          <Section
            style={{
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              padding: "16px",
              marginBottom: "16px",
            }}
          >
            <Text
              style={{
                fontWeight: "600",
                fontSize: "16px",
                color: "#1e293b",
                margin: "0 0 16px 0",
              }}
            >
              آیتم‌های سبد خرید
            </Text>

            {items.map((item, i) => (
              <Row
                key={`${item.name}-${i}`}
                style={{
                  borderBottom:
                    i < items.length - 1 ? "1px solid #f1f5f9" : "none",
                  paddingBottom: "12px",
                  marginBottom: "12px",
                }}
              >
                <Column style={{ width: "80px", verticalAlign: "top" }}>
                  {item?.image ? (
                    <Img
                      width="64"
                      height="64"
                      alt={item.name}
                      style={{ borderRadius: "8px", objectFit: "cover" }}
                      src={item.image}
                    />
                  ) : (
                    <div
                      style={{
                        width: "64px",
                        height: "64px",
                        backgroundColor: "#f1f5f9",
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "12px",
                        color: "#64748b",
                      }}
                    >
                      بدون تصویر
                    </div>
                  )}
                </Column>
                <Column style={{ paddingLeft: "12px", verticalAlign: "top" }}>
                  <Text
                    style={{
                      margin: "0",
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#1e293b",
                    }}
                  >
                    {item.name}
                  </Text>
                  {(item.color || item.size) && (
                    <Text
                      style={{
                        margin: "4px 0 0 0",
                        fontSize: "12px",
                        color: "#64748b",
                      }}
                    >
                      {item.color ? `رنگ: ${item.color}` : ""}
                      {item.color && item.size ? " | " : ""}
                      {item.size ? `سایز: ${item.size}` : ""}
                    </Text>
                  )}
                  <Text
                    style={{
                      margin: "4px 0 0 0",
                      fontSize: "12px",
                      color: "#64748b",
                    }}
                  >
                    تعداد: {item.quantity}
                  </Text>
                  {item.note ? (
                    <Text
                      style={{
                        margin: "8px 0 0 0",
                        fontSize: "12px",
                        color: "#1e293b",
                        backgroundColor: "#fff7ed",
                        border: "1px solid #fdba74",
                        borderRadius: "6px",
                        padding: "8px",
                      }}
                    >
                      <strong>یادداشت مشتری:</strong>{" "}
                      {String(item.note).slice(0, 800)}
                    </Text>
                  ) : null}
                </Column>
                <Column
                  style={{
                    textAlign: "left",
                    verticalAlign: "top",
                    width: "100px",
                  }}
                >
                  <Text
                    style={{
                      margin: "0",
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#059669",
                    }}
                  >
                    {safeToman(item.price * item.quantity)}
                  </Text>
                  <Text
                    style={{
                      margin: "4px 0 0 0",
                      fontSize: "12px",
                      color: "#64748b",
                    }}
                  >
                    ({safeToman(item.price)} × {item.quantity})
                  </Text>
                </Column>
              </Row>
            ))}

            <div
              style={{
                borderTop: "2px solid #e2e8f0",
                marginTop: "16px",
                paddingTop: "16px",
              }}
            >
              {[
                { name: "مجموع محصولات", price: itemsPrice },
                { name: "مالیات", price: taxPrice },
                { name: "هزینه ارسال", price: shippingPrice },
              ].map(({ name, price }) => (
                <Row key={name} style={{ marginBottom: "8px" }}>
                  <Column style={{ textAlign: "right" }}>
                    <Text
                      style={{
                        margin: "0",
                        fontSize: "14px",
                        color: "#475569",
                      }}
                    >
                      {name}:
                    </Text>
                  </Column>
                  <Column style={{ textAlign: "left", width: "120px" }}>
                    <Text
                      style={{
                        margin: "0",
                        fontSize: "14px",
                        color: "#475569",
                      }}
                    >
                      {price === undefined
                        ? "--"
                        : price === 0 && name === "هزینه ارسال"
                          ? "رایگان"
                          : safeToman(price ?? 0)}
                    </Text>
                  </Column>
                </Row>
              ))}

              <Row
                style={{
                  backgroundColor: "#059669",
                  borderRadius: "8px",
                  padding: "12px",
                  marginTop: "12px",
                }}
              >
                <Column style={{ textAlign: "right" }}>
                  <Text
                    style={{
                      margin: "0",
                      fontSize: "16px",
                      fontWeight: "700",
                      color: "#ffffff",
                    }}
                  >
                    جمع کل سفارش:
                  </Text>
                </Column>
                <Column style={{ textAlign: "left", width: "120px" }}>
                  <Text
                    style={{
                      margin: "0",
                      fontSize: "16px",
                      fontWeight: "700",
                      color: "#ffffff",
                    }}
                  >
                    {safeToman(totalPrice)}
                  </Text>
                </Column>
              </Row>
            </div>
          </Section>

          <Section
            style={{
              backgroundColor: "#fef3c7",
              border: "1px solid #f59e0b",
              borderRadius: "8px",
              padding: "16px",
              marginTop: "20px",
            }}
          >
            <Text
              style={{
                margin: "0",
                fontSize: "14px",
                color: "#92400e",
                textAlign: "center",
              }}
            >
              <strong>توجه:</strong> این درخواست پشتیبانی از طرف مشتری ارسال شده
              است و نیاز به پیگیری دارد.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
