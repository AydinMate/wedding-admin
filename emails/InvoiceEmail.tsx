import {
  Body,
  Container,
  Column,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

const nowInAEST = new Date(
  new Date().toLocaleString("en-US", { timeZone: "Australia/Sydney" })
);

// test 3

const formatter = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Australia/Sydney",
});

const invoiceDate = formatter.format(nowInAEST);

const currentYear = new Date().getFullYear();

type Product = {
  id: string;
  name: string;
  colour: string;
  size: string;
  price: number;
  images: string;
};

interface InvoiceEmailProps {
  hireDate: string;
  orderId: string | undefined;
  customerName: string | null | undefined;
  line1: string | null | undefined;
  city: string | null | undefined;
  state: string | null | undefined;
  postalCode: string | null | undefined;
  country: string | null | undefined;
  products: Array<Product>;
  orderPrice: number;
  isDelivery: boolean;
  dropoffAddressParts: string[];
}

export const InvoiceEmail = ({
  hireDate,
  orderId,
  customerName,
  line1,
  city,
  country,
  postalCode,
  state,
  products,
  orderPrice,
  isDelivery,
  dropoffAddressParts,
}: InvoiceEmailProps) => (
  <Html>
    <Head />
    <Preview>Diamond Wedding Hire Receipt</Preview>

    <Body style={main}>
      <Container style={container}>
        <Section>
          <Column>
            <Img
              src={
                "https://png.pngtree.com/png-vector/20190419/ourmid/pngtree-vector-diamond-icon-png-image_956688.jpg"
              }
              width="42"
              height="42"
              alt="Apple Logo"
            />
          </Column>

          <Column align="right" style={tableCell}>
            <Text style={heading}>Hire Receipt</Text>
          </Column>
        </Section>

        <Section style={informationTable}>
          <Row style={informationTableRow}>
            <Column colSpan={2}>
              <Row>
                <Column style={informationTableColumn}>
                  <Text style={informationTableLabel}>HIRE TYPE</Text>
                  <Text style={informationTableValue}>
                    {isDelivery ? "DELIVERY" : "PICK UP"}
                  </Text>
                </Column>
              </Row>
              <Row>
                <Column style={informationTableColumn}>
                  <Text style={informationTableLabel}>INVOICE DATE</Text>
                  <Text style={informationTableValue}>{invoiceDate}</Text>
                </Column>
                <Column style={informationTableColumn}>
                  <Text style={informationTableLabel}>HIRE DATE</Text>
                  <Text style={informationTableValue}>{hireDate}</Text>
                </Column>
              </Row>

              <Row>
                <Column style={informationTableColumn}>
                  <Text style={informationTableLabel}>ORDER ID</Text>
                  <Text
                    style={{
                      ...informationTableValue,
                      textDecoration: "underline",
                    }}
                  >
                    {orderId}
                  </Text>
                </Column>
              </Row>
            </Column>
            <Column style={informationTableColumn} colSpan={2}>
              <Text style={informationTableLabel}>BILLED TO</Text>
              <Text style={informationTableValue}>{customerName}</Text>
              <Text style={informationTableValue}>{line1}</Text>
              <Text style={informationTableValue}>
                {city}, {state} {postalCode}
              </Text>
              <Text style={informationTableValue}>{country}</Text>
            </Column>
          </Row>
        </Section>
        <Section style={productTitleTable}>
          <Text style={productsTitle}>Hired Products</Text>
        </Section>
        {products.map((product) => (
          <Section key={product.id} style={{ marginBottom: "16px" }}>
            <Column style={{ width: "64px" }}>
              <Img
                src={product.images}
                width="64"
                height="64"
                alt={product.name}
                style={productIcon}
              />
            </Column>
            <Column style={{ paddingLeft: "22px" }}>
              <Text style={productTitle}>{product.name}</Text>
              <Text style={productDescription}>Colour: {product.colour}</Text>
              <Text style={productDescription}>Size: {product.size}</Text>
            </Column>
            <Column style={productPriceWrapper} align="right">
              <Text style={productPrice}>${product.price}</Text>
            </Column>
          </Section>
        ))}

        <Hr style={productPriceLine} />
        <Section align="right">
          <Column style={tableCell} align="right">
            <Text style={productPriceTotal}>TOTAL</Text>
          </Column>
          <Column style={productPriceVerticalLine}></Column>
          <Column style={productPriceLargeWrapper}>
            <Text style={productPriceLarge}>${orderPrice}</Text>
          </Column>
        </Section>
        <Hr style={productPriceLineBottom} />
        <Section>
          <Column align="center" style={ctaTitle}>
            <Text style={ctaText}>
              {isDelivery
                ? "Your order will be delivered to:"
                : "Please Pick Up From:"}
            </Text>
          </Column>
        </Section>
        {isDelivery ? (
          <Section>
            <Column align="center" style={walletWrapper}>
              {dropoffAddressParts.map((part, index) => (
                <Text key={index} style={productTitle}>
                  {part}
                </Text>
              ))}
              <Hr style={walletBottomLine} />

              <Text style={footerText}>
                Kindly be informed that your delivery is scheduled for 12PM on{" "}
                {hireDate}. Items are expected to be ready for pickup by 10AM
                the following day. If you require any adjustments to this
                schedule, please reach out to our support team in advance.
              </Text>
            </Column>
          </Section>
        ) : (
          <Section>
            <Column align="center" style={walletWrapper}>
              <Text style={productTitle}>123 Fake st</Text>
              <Text style={productTitle}>Melbourne VIC 3000</Text>
              <Text style={productTitle}>Australia</Text>
              <Hr style={walletBottomLine} />

              <Text style={footerText}>
                Kindly be informed that your pickup is scheduled for 12PM on{" "}
                {hireDate}. Items should be returned by 10AM the subsequent day
                to avoid extra charges. If you require any adjustments to this
                schedule, please reach out to our support team in advance.
              </Text>
            </Column>
          </Section>
        )}

        <Hr style={walletBottomLine} />

        <Text style={footerLinksWrapper}>
          <Link href="https://www.apple.com/legal/itunes/us/sales.html">
            Terms &amp; Conditions
          </Link>{" "}
          •{" "}
          <Link href="https://www.apple.com/legal/privacy/">
            Privacy Policy{" "}
          </Link>
        </Text>
        <Text style={footerCopyright}>
          Copyright © {currentYear} Diamond Wedding Hire. <br />{" "}
          <Link href="https://www.apple.com/legal/">All rights reserved</Link>
        </Text>
      </Container>
    </Body>
  </Html>
);

export default InvoiceEmail;

const main = {
  fontFamily: '"Helvetica Neue",Helvetica,Arial,sans-serif',
  backgroundColor: "#ffffff",
};

const resetText = {
  margin: "0",
  padding: "0",
  lineHeight: 1.4,
};

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
  width: "660px",
};

const tableCell = { display: "table-cell" };

const heading = {
  fontSize: "32px",
  fontWeight: "300",
  color: "#888888",
};

const cupomText = {
  textAlign: "center" as const,
  margin: "36px 0 40px 0",
  fontSize: "14px",
  fontWeight: "500",
  color: "#111111",
};

const supStyle = {
  fontWeight: "300",
};

const informationTable = {
  borderCollapse: "collapse" as const,
  borderSpacing: "0px",
  color: "rgb(51,51,51)",
  backgroundColor: "rgb(250,250,250)",
  borderRadius: "3px",
  fontSize: "12px",
};

const informationTableRow = {
  height: "46px",
};

const informationTableColumn = {
  paddingLeft: "20px",
  borderStyle: "solid",
  borderColor: "white",
  borderWidth: "0px 1px 1px 0px",
  height: "44px",
};

const informationTableLabel = {
  ...resetText,
  color: "rgb(102,102,102)",
  fontSize: "10px",
};

const informationTableValue = {
  fontSize: "12px",
  margin: "0",
  padding: "0",
  lineHeight: 1.4,
};

const productTitleTable = {
  ...informationTable,
  margin: "30px 0 15px 0",
  height: "24px",
};

const productsTitle = {
  background: "#fafafa",
  paddingLeft: "10px",
  fontSize: "14px",
  fontWeight: "500",
  margin: "0",
};

const productIcon = {
  margin: "0 0 0 20px",
  borderRadius: "14px",
  border: "1px solid rgba(128,128,128,0.2)",
};

const productTitle = { fontSize: "12px", fontWeight: "600", ...resetText };

const productDescription = {
  fontSize: "12px",
  color: "rgb(102,102,102)",
  ...resetText,
};

const productLink = {
  fontSize: "12px",
  color: "rgb(0,112,201)",
  textDecoration: "none",
};

const divisor = {
  marginLeft: "4px",
  marginRight: "4px",
  color: "rgb(51,51,51)",
  fontWeight: 200,
};

const productPriceTotal = {
  margin: "0",
  color: "rgb(102,102,102)",
  fontSize: "10px",
  fontWeight: "600",
  padding: "0px 30px 0px 0px",
  textAlign: "right" as const,
};

const productPrice = {
  fontSize: "12px",
  fontWeight: "600",
  margin: "0",
};

const productPriceLarge = {
  margin: "0px 20px 0px 0px",
  fontSize: "16px",
  fontWeight: "600",
  whiteSpace: "nowrap" as const,
  textAlign: "right" as const,
};

const productPriceWrapper = {
  display: "table-cell",
  padding: "0px 20px 0px 0px",
  width: "100px",
  verticalAlign: "top",
};

const productPriceLine = { margin: "30px 0 0 0" };

const productPriceVerticalLine = {
  height: "48px",
  borderLeft: "1px solid",
  borderColor: "rgb(238,238,238)",
};

const productPriceLargeWrapper = { display: "table-cell", width: "90px" };

const productPriceLineBottom = { margin: "0 0 75px 0" };

const block = { display: "block" };

const ctaTitle = {
  display: "block",
  margin: "15px 0 0 0",
};

const ctaText = { fontSize: "24px", fontWeight: "500" };

const walletWrapper = { display: "table-cell", margin: "10px 0 0 0" };

const walletLink = { color: "rgb(0,126,255)", textDecoration: "none" };

const walletImage = {
  display: "inherit",
  paddingRight: "8px",
  verticalAlign: "middle",
};

const walletBottomLine = { margin: "65px 0 20px 0" };

const footerText = {
  fontSize: "12px",
  color: "rgb(102,102,102)",
  margin: "0",
  lineHeight: "auto",
  marginBottom: "16px",
};

const footerTextCenter = {
  fontSize: "12px",
  color: "rgb(102,102,102)",
  margin: "20px 0",
  lineHeight: "auto",
  textAlign: "center" as const,
};

const footerLink = { color: "rgb(0,115,255)" };

const footerIcon = { display: "block", margin: "40px 0 0 0" };

const footerLinksWrapper = {
  margin: "8px 0 0 0",
  textAlign: "center" as const,
  fontSize: "12px",
  color: "rgb(102,102,102)",
};

const footerCopyright = {
  margin: "25px 0 0 0",
  textAlign: "center" as const,
  fontSize: "12px",
  color: "rgb(102,102,102)",
};

const walletLinkText = {
  fontSize: "14px",
  fontWeight: "400",
  textDecoration: "none",
};
