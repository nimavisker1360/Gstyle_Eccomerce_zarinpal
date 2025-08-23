import { NextRequest, NextResponse } from "next/server";
import { getJson } from "serpapi";

// Turkish brand mapping with search keywords
const turkishBrands: { [key: string]: string[] } = {
  "LC Waikiki": ["LC Waikiki", "LCW", "lcwaikiki"],
  Koton: ["Koton", "koton"],
  Mavi: ["Mavi", "mavi"],
  DeFacto: ["DeFacto", "defacto"],
  Beymen: ["Beymen", "beymen"],
  Trendyol: ["Trendyol", "trendyol"],
  Derimod: ["Derimod", "derimod"],
  Hepsiburada: ["Hepsiburada", "hepsiburada"],
  Kiğılı: ["Kiğılı", "kiğılı", "kigili"],
  Altınyıldız: ["Altınyıldız", "altınyıldız", "altinyildiz"],
  Yargıcı: ["Yargıcı", "yargıcı", "yargici"],
  Gant: ["Gant", "gant"],
  "Pierre Cardin": ["Pierre Cardin", "pierre cardin"],
  Colins: ["Colins", "colins"],
  "Jack & Jones": ["Jack & Jones", "jack & jones", "jack and jones"],
};

// Function to extract and validate product links from SERP API
function extractProductLink(product: any): string | null {
  // List of valid store domains we want to accept
  const validStoreDomains = [
    "hepsiburada.com",
    "trendyol.com",
    "n11.com",
    "gittigidiyor.com",
    "amazon.com.tr",
    "amazon.com",
    "amazon.de",
    "amazon.co.uk",
    "ebay.com",
    "ebay.de",
    "ebay.co.uk",
    "etsy.com",
    "asos.com",
    "zara.com",
    "hm.com",
    "mango.com",
    "pullandbear.com",
    "bershka.com",
    "stradivarius.com",
    "massimodutti.com",
    "oysho.com",
    "zara.com.tr",
    "hm.com.tr",
    "mango.com.tr",
    "sephora.com",
    "sephora.com.tr",
    "douglas.com",
    "douglas.com.tr",
    "flormar.com.tr",
    "goldenrose.com.tr",
    "lorealparis.com.tr",
    "maybelline.com.tr",
    "nyxcosmetics.com.tr",
    "mac.com.tr",
    "benefitcosmetics.com.tr",
    "clinique.com.tr",
    "esteelauder.com.tr",
    "lancome.com.tr",
    "dior.com",
    "chanel.com",
    "ysl.com",
    "gucci.com",
    "prada.com",
    "louisvuitton.com",
    "hermes.com",
    "cartier.com",
    "tiffany.com",
    "swarovski.com",
    "pandora.com",
    "cartier.com.tr",
    "tiffany.com.tr",
    "swarovski.com.tr",
    "pandora.com.tr",
    "lcwaikiki.com",
    "lcwaikiki.com.tr",
    "koton.com",
    "koton.com.tr",
    "mavi.com",
    "mavi.com.tr",
    "defacto.com",
    "defacto.com.tr",
    "beymen.com",
    "beymen.com.tr",
    "vakko.com",
    "vakko.com.tr",
    "derimod.com",
    "derimod.com.tr",
    "sarar.com",
    "sarar.com.tr",
    "kigili.com",
    "kigili.com.tr",
    "altinyildiz.com",
    "altinyildiz.com.tr",
    "yargici.com",
    "yargici.com.tr",
    "gant.com",
    "gant.com.tr",
    "pierrecardin.com",
    "pierrecardin.com.tr",
    "colins.com",
    "colins.com.tr",
    "jackandjones.com",
    "jackandjones.com.tr",
  ];

  // Function to check if URL is from a valid store
  function isValidStoreUrl(url: string): boolean {
    if (!url || typeof url !== "string") return false;

    // Exclude Google Shopping links
    if (
      url.includes("google.com/shopping") ||
      url.includes("google.com.tr/shopping") ||
      url.includes("google.com/search?tbm=shop")
    ) {
      return false;
    }

    // Check if URL contains any valid store domain
    return validStoreDomains.some((domain) => url.includes(domain));
  }

  // Priority order for extracting product links
  const linkSources = [
    product.merchant?.link,
    product.merchant?.url,
    product.source_link,
    product.product_link,
    product.offers?.link,
    product.offers?.url,
    product.link,
  ];

  // Try each link source
  for (const link of linkSources) {
    if (link && isValidStoreUrl(link)) {
      return link;
    }
  }

  return null;
}

// Function to get random products for a Turkish brand
async function getTurkishBrandProducts(brandName: string): Promise<any[]> {
  const brandKeywords = turkishBrands[brandName];
  if (!brandKeywords) {
    return [];
  }

  const allProducts: any[] = [];

  // Search for each keyword to get more variety
  for (const keyword of brandKeywords) {
    try {
      const searchQuery = `${keyword} ürünleri`;

      const response = await getJson({
        engine: "google_shopping",
        q: searchQuery,
        location: "Turkey",
        gl: "tr",
        hl: "tr",
        num: 100, // Get more results to have variety
        api_key: process.env.SERPAPI_API_KEY,
      });

      if (response.shopping_results) {
        const validProducts = response.shopping_results
          .map((product: any) => {
            const productLink = extractProductLink(product);
            if (!productLink) return null;

            return {
              id: Math.random().toString(36).substr(2, 9),
              title: product.title || "محصول ترکیه",
              price: product.price || "قیمت نامشخص",
              original_price: product.original_price || null,
              currency: product.currency || "TL",
              rating: product.rating || null,
              reviews: product.reviews || null,
              image: product.thumbnail || "/images/default-product.jpg",
              link: productLink,
              brand: brandName,
              source: product.source || "فروشگاه ترکیه",
              shipping: product.shipping || null,
              condition: product.condition || "جدید",
              availability: product.availability || "موجود",
              merchant: product.merchant?.name || "فروشنده ترکیه",
              category: "محصولات ترکیه",
              country: "Turkey",
              language: "tr",
            };
          })
          .filter(Boolean);

        allProducts.push(...validProducts);
      }
    } catch (error) {
      console.error(`Error fetching products for ${keyword}:`, error);
    }
  }

  // Remove duplicates based on title and link
  const uniqueProducts = allProducts.filter(
    (product, index, self) =>
      index ===
      self.findIndex(
        (p) => p.title === product.title && p.link === product.link
      )
  );

  // Shuffle and return 40 random products
  const shuffled = uniqueProducts.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 40);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const brand = searchParams.get("brand");
    const type = searchParams.get("type");

    if (!brand) {
      return NextResponse.json(
        { error: "برند مورد نظر مشخص نشده است" },
        { status: 400 }
      );
    }

    if (type !== "turkish") {
      return NextResponse.json(
        { error: "نوع فیلتر نامعتبر است" },
        { status: 400 }
      );
    }

    // Check if the brand is in our Turkish brands list
    if (!turkishBrands[brand]) {
      return NextResponse.json(
        { error: "برند ترکیه‌ای یافت نشد" },
        { status: 404 }
      );
    }

    console.log(`🔍 Searching for Turkish brand: ${brand}`);

    const products = await getTurkishBrandProducts(brand);

    if (products.length === 0) {
      return NextResponse.json(
        {
          error: "محصولی برای این برند یافت نشد",
          brand: brand,
          products: [],
        },
        { status: 404 }
      );
    }

    console.log(`✅ Found ${products.length} products for ${brand}`);

    return NextResponse.json({
      success: true,
      brand: brand,
      type: "turkish",
      total: products.length,
      products: products,
      message: `${products.length} محصول از برند ${brand} یافت شد`,
    });
  } catch (error) {
    console.error("Error in Turkish brands API:", error);
    return NextResponse.json(
      {
        error: "خطا در دریافت محصولات برند ترکیه",
        details: error instanceof Error ? error.message : "خطای نامشخص",
      },
      { status: 500 }
    );
  }
}
