import { NextRequest, NextResponse } from "next/server";
import { getJson } from "serpapi";

// Function to convert Persian query to Turkish keywords
function convertToTurkishKeywords(query: string): string {
  const keywordMap: { [key: string]: string } = {
    کیبورد: "klavye",
    موس: "mouse",
    هدست: "kulaklık",
    شارژر: "şarj",
    کابل: "kablo",
    قاب: "kılıf",
    آداپتور: "adaptör",
    اسپیکر: "hoparlör",
    میکروفون: "mikrofon",
    "وب کم": "web kamera",
    پاوربانک: "power bank",
    "کابل usb": "usb kablo",
    "کابل hdmi": "hdmi kablo",
    مودم: "modem",
    روتر: "router",
    سوییچ: "switch",
    "هارد دیسک": "hard disk",
    رم: "ram",
    "اس اس دی": "ssd",
    "کارت حافظه": "bellek kartı",
    فلش: "flash bellek",
    "کابل برق": "güç kablosu",
    "کابل شبکه": "ağ kablosu",
    "کابل صوتی": "ses kablosu",
    "کابل تصویری": "video kablosu",
    "کابل vga": "vga kablo",
    "کابل dvi": "dvi kablo",
    "کابل displayport": "displayport kablo",
    "کابل ethernet": "ethernet kablo",
    "کابل coaxial": "koaksiyel kablo",
    "کابل optical": "optik kablo",
    "کابل rca": "rca kablo",
    "کابل xlr": "xlr kablo",
    "کابل trs": "trs kablo",
    "کابل ts": "ts kablo",
    "کابل balanced": "dengeli kablo",
    "کابل unbalanced": "dengesiz kablo",
    "کابل shielded": "korumalı kablo",
    "کابل unshielded": "korumasız kablo",
    "کابل cat5": "cat5 kablo",
    "کابل cat6": "cat6 kablo",
    "کابل cat7": "cat7 kablo",
    "کابل cat8": "cat8 kablo",
    "کابل fiber": "fiber kablo",
    "کابل copper": "bakır kablo",
    "کابل aluminum": "alüminyum kablo",
    "کابل gold": "altın kablo",
    "کابل silver": "gümüş kablo",
    "کابل platinum": "platin kablo",
    "کابل rhodium": "rodyum kablo",
    "کابل palladium": "paladyum kablo",
    "کابل iridium": "iridyum kablo",
    "کابل osmium": "osmiyum kablo",
    "کابل ruthenium": "rutenyum kablo",
    "کابل rhenium": "renyum kablo",
    "کابل tungsten": "tungsten kablo",
    "کابل molybdenum": "molibden kablo",
    "کابل niobium": "niyobyum kablo",
    "کابل tantalum": "tantal kablo",
    "کابل vanadium": "vanadyum kablo",
    "کابل chromium": "krom kablo",
    "کابل manganese": "manganez kablo",
    "کابل iron": "demir kablo",
    "کابل cobalt": "kobalt kablo",
    "کابل nickel": "nikel kablo",
    "کابل zinc": "çinko kablo",
    "کابل cadmium": "kadmiyum kablo",
    "کابل mercury": "cıva kablo",
    "کابل lead": "kurşun kablo",
    "کابل bismuth": "bizmut kablo",
    "کابل polonium": "polonyum kablo",
    "کابل astatine": "astatin kablo",
    "کابل radon": "radon kablo",
    "کابل francium": "fransiyum kablo",
    "کابل radium": "radyum kablo",
    "کابل actinium": "aktinyum kablo",
    "کابل thorium": "toryum kablo",
    "کابل protactinium": "protaktinyum kablo",
    "کابل uranium": "uranyum kablo",
    "کابل neptunium": "neptünyum kablo",
    "کابل plutonium": "plütonyum kablo",
    "کابل americium": "amerikyum kablo",
    "کابل curium": "küriyum kablo",
    "کابل berkelium": "berkelyum kablo",
    "کابل californium": "kaliforniyum kablo",
    "کابل einsteinium": "aynştaynyum kablo",
    "کابل fermium": "fermiyum kablo",
    "کابل mendelevium": "mendelevyum kablo",
    "کابل nobelium": "nobelyum kablo",
    "کابل lawrencium": "lorensiyum kablo",
    "کابل rutherfordium": "rutherfordyum kablo",
    "کابل dubnium": "dubniyum kablo",
    "کابل seaborgium": "seaborgyum kablo",
    "کابل bohrium": "bohriyum kablo",
    "کابل hassium": "hassiyum kablo",
    "کابل meitnerium": "meitneriyum kablo",
    "کابل darmstadtium": "darmstadtiyum kablo",
    "کابل roentgenium": "röntgenyum kablo",
    "کابل copernicium": "kopernikyum kablo",
    "کابل nihonium": "nihonyum kablo",
    "کابل flerovium": "flerovyum kablo",
    "کابل moscovium": "moskovyum kablo",
    "کابل livermorium": "livermoryum kablo",
    "کابل tennessine": "tennessin kablo",
    "کابل oganesson": "oganesson kablo",
  };

  let turkishQuery = query;

  // Replace Persian keywords with Turkish equivalents
  for (const [persian, turkish] of Object.entries(keywordMap)) {
    turkishQuery = turkishQuery.replace(new RegExp(persian, "gi"), turkish);
  }

  // Add common Turkish accessory keywords
  const commonKeywords = [
    "klavye",
    "mouse",
    "kulaklık",
    "şarj",
    "kılıf",
    "adaptör",
    "kablo",
    "hoparlör",
    "mikrofon",
    "web kamera",
    "power bank",
    "usb",
    "hdmi",
    "vga",
    "dvi",
    "displayport",
    "ethernet",
    "modem",
    "router",
    "switch",
    "hard disk",
    "ram",
    "ssd",
    "bellek kartı",
    "flash bellek",
    "güç kablosu",
    "ağ kablosu",
    "ses kablosu",
    "video kablosu",
    "koaksiyel",
    "optik",
    "rca",
    "xlr",
    "trs",
    "ts",
    "dengeli",
    "dengesiz",
    "korumalı",
    "korumasız",
  ];

  // Add common keywords if they're not already in the query
  const missingKeywords = commonKeywords.filter(
    (keyword) => !turkishQuery.toLowerCase().includes(keyword.toLowerCase())
  );

  if (missingKeywords.length > 0) {
    turkishQuery += " " + missingKeywords.slice(0, 5).join(" ");
  }

  return turkishQuery;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json(
        { error: "Query parameter is required" },
        { status: 400 }
      );
    }

    console.log(`🔍 Turkish search for query: "${query}"`);

    // Check if API keys are available
    if (!process.env.SERPAPI_KEY) {
      console.error("❌ SERPAPI_KEY is not configured");
      return NextResponse.json(
        { error: "Search service is not configured" },
        { status: 500 }
      );
    }

    // Convert to Turkish keywords
    const turkishQuery = convertToTurkishKeywords(query);
    console.log(`🔧 Converted query: "${query}" -> "${turkishQuery}"`);

    const serpApiParams = {
      engine: "google_shopping",
      q: turkishQuery,
      gl: "tr", // ترکیه
      hl: "tr", // زبان ترکی
      num: 30,
      device: "desktop",
      api_key: process.env.SERPAPI_KEY,
    };

    console.log("🔍 Search parameters:", serpApiParams);

    const shoppingResults = await getJson(serpApiParams);

    console.log("🔍 Raw search results:", {
      hasResults: !!shoppingResults.shopping_results,
      resultCount: shoppingResults.shopping_results?.length || 0,
      searchInfo: shoppingResults.search_information,
      error: shoppingResults.error,
    });

    // Process results with translation
    const processedProducts = await Promise.all(
      (shoppingResults.shopping_results || []).map(
        async (product: any, index: number) => {
          // Clean and validate text first
          let title = product.title || "";
          let description = product.description || "";

          // Clean text to remove JSON-like structures
          if (title) {
            title = title
              .replace(
                /\{[\s]*"title"[\s]*:[\s]*"[^"]*"[\s]*,[\s]*"description"[\s]*:[\s]*"[^"]*"[\s]*\}/g,
                ""
              )
              .replace(/\{[\s]*"description"[\s]*:[\s]*"[^"]*"[\s]*\}/g, "")
              .replace(/\{[\s]*"title"[\s]*:[\s]*"[^"]*"[\s]*\}/g, "")
              .replace(/"title"[\s]*:[\s]*"[^"]*"/g, "")
              .replace(/"description"[\s]*:[\s]*"[^"]*"/g, "")
              .replace(/title[\s]*:[\s]*"[^"]*"/g, "")
              .replace(/description[\s]*:[\s]*"[^"]*"/g, "")
              .replace(/["'""]/g, "")
              .trim();
          }

          if (description) {
            description = description
              .replace(
                /\{[\s]*"title"[\s]*:[\s]*"[^"]*"[\s]*,[\s]*"description"[\s]*:[\s]*"[^"]*"[\s]*\}/g,
                ""
              )
              .replace(/\{[\s]*"description"[\s]*:[\s]*"[^"]*"[\s]*\}/g, "")
              .replace(/\{[\s]*"title"[\s]*:[\s]*"[^"]*"[\s]*\}/g, "")
              .replace(/"title"[\s]*:[\s]*"[^"]*"/g, "")
              .replace(/"description"[\s]*:[\s]*"[^"]*"/g, "")
              .replace(/title[\s]*:[\s]*"[^"]*"/g, "")
              .replace(/description[\s]*:[\s]*"[^"]*"/g, "")
              .replace(/["'""]/g, "")
              .trim();
          }

          // If description still contains JSON-like content, use title
          if (
            description &&
            (description.includes('"title"') ||
              description.includes('"description"') ||
              description.includes("title:") ||
              description.includes("description:"))
          ) {
            description = title || "توضیحات محصول";
          }

          // If description is empty, use title
          if (!description && title) {
            description = title;
          }

          return {
            id: product.product_id || `product-${Date.now()}-${index}`,
            title: title,
            originalTitle: product.title || "",
            price:
              parseFloat(
                product.price?.replace(/[^\d.,]/g, "").replace(",", ".")
              ) || 0,
            originalPrice: product.original_price
              ? parseFloat(
                  product.original_price
                    .replace(/[^\d.,]/g, "")
                    .replace(",", ".")
                )
              : null,
            currency: product.price?.replace(/[\d.,]/g, "").trim() || "TL",
            image: product.thumbnail || "",
            description: description,
            originalDescription: product.description || "",
            link: product.link || "",
            googleShoppingLink: product.link || "",
            source: product.merchant?.name || "Unknown",
            rating: parseFloat(product.rating) || 0,
            reviews: parseInt(product.reviews) || 0,
            delivery: product.delivery || "اطلاعات ارسال موجود نیست",
          };
        }
      )
    );

    return NextResponse.json({
      products: processedProducts,
      message: `${processedProducts.length} محصول یافت شد`,
      search_query: query,
      turkish_query: turkishQuery,
      raw_results: shoppingResults,
    });
  } catch (error) {
    console.error("❌ Turkish search error:", error);
    return NextResponse.json(
      { error: "خطا در جستجو. لطفاً دوباره تلاش کنید." },
      { status: 500 }
    );
  }
}
