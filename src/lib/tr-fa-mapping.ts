// Central TR ↔ FA mapping for categories and product keywords
// All keys/values should be lowercase for robust matching

export type Language = "tr" | "fa";

export interface TermMapping {
  tr: string[]; // Turkish synonyms
  fa: string[]; // Persian synonyms
}

// Top-level category mapping (Turkish → Persian)
// Note: include common spelling variants
export const trToFaTopCategories: Record<string, string> = {
  moda: "مد و پوشاک",
  giyim: "مد و پوشاک",
  kiyafet: "مد و پوشاک", // without diacritics
  kıyafet: "مد و پوشاک",

  kozmetik: "لوازم آرایشی و بهداشتی",
  guzellik: "لوازم آرایشی و بهداشتی",
  güzellik: "لوازم آرایشی و بهداشتی",

  elektronik: "الکترونیک",
  elektronık: "الکترونیک", // common misspelling with dotless ı

  spor: "لوازم ورزشی",

  petshop: "حیوانات خانگی",
  "evcil hayvan": "حیوانات خانگی",
  pet: "حیوانات خانگی",

  vitaminler: "ویتامین و دارو",
  vitamin: "ویتامین و دارو",
  saglik: "ویتامین و دارو",
  sağlık: "ویتامین و دارو",
  takviye: "ویتامین و دارو",
  ilac: "ویتامین و دارو",
  ilaç: "ویتامین و دارو",

  aksesuar: "اکسسوری",
};

// Reverse mapping (Persian → Turkish synonyms)
// Values are arrays to be appended into search queries
export const faToTrTopCategories: Record<string, string[]> = {
  "مد و پوشاک": ["moda", "giyim", "kıyafet"],
  "مد و لباس": ["moda", "giyim", "kıyafet"],
  "لوازم آرایشی و بهداشتی": ["kozmetik", "güzellik"],
  "آرایشی و بهداشتی": ["kozmetik", "güzellik"],
  الکترونیک: ["elektronik"],
  ورزشی: ["spor"],
  "لوازم ورزشی": ["spor"],
  "حیوانات خانگی": ["petshop", "evcil hayvan", "pet"],
  "ویتامین و دارو": ["vitaminler", "takviye", "sağlık"],
  "ویتامین و مکمل": ["vitaminler", "takviye", "sağlık"],
  اکسسوری: ["aksesuar"],
};

// Keyword-level mapping for better precision (Persian → Turkish)
// Add as many as needed over time
export const faToTrKeywordMappings: TermMapping[] = [
  // Fashion / Clothing
  { fa: ["پیراهن", "بلوز"], tr: ["gömlek", "bluz"] },
  { fa: ["دامن"], tr: ["etek"] },
  { fa: ["شومیز"], tr: ["bluz"] },
  { fa: ["ژاکت", "کاردیگان"], tr: ["hırka"] },
  { fa: ["پلیور", "بافت"], tr: ["kazak", "triko"] },
  { fa: ["سویشرت"], tr: ["sweatshirt"] },
  { fa: ["تی شرت", "تیشرت"], tr: ["tişört"] },
  { fa: ["شلوار"], tr: ["pantolon"] },
  { fa: ["شلوارک"], tr: ["şort"] },
  { fa: ["جین"], tr: ["jean", "kot"] },
  { fa: ["کت"], tr: ["ceket"] },
  { fa: ["کت و شلوار"], tr: ["takım elbise"] },
  { fa: ["کاپشن"], tr: ["mont"] },
  { fa: ["پالتو"], tr: ["kaban"] },
  { fa: ["ژیله"], tr: ["yelek"] },
  { fa: ["هودی"], tr: ["hoodie"] },
  { fa: ["مایو"], tr: ["mayo"] },
  { fa: ["لباس زیر"], tr: ["iç giyim"] },
  { fa: ["پیژاما", "لباس خواب"], tr: ["pijama"] },
  { fa: ["جوراب"], tr: ["çorap"] },
  { fa: ["کفش"], tr: ["ayakkabı"] },
  { fa: ["کیف"], tr: ["çanta"] },
  { fa: ["اکسسوری"], tr: ["aksesuar"] },
  { fa: ["لباس ورزشی"], tr: ["spor giyim", "eşofman"] },

  // Beauty & Cosmetics
  { fa: ["آرایش", "لوازم آرایشی"], tr: ["makyaj"] },
  { fa: ["مراقبت از پوست", "محصولات پوستی"], tr: ["cilt bakımı"] },
  { fa: ["مراقبت از مو", "محصولات مو"], tr: ["saç bakımı"] },
  { fa: ["عطر"], tr: ["parfüm"] },
  { fa: ["ادکلن"], tr: ["kolonya", "parfüm"] },
  { fa: ["دئودرانت"], tr: ["deodorant"] },
  { fa: ["محصولات آفتاب"], tr: ["güneş ürünleri", "güneş kremi"] },
  { fa: ["شامپو"], tr: ["şampuan"] },
  { fa: ["نرم کننده مو"], tr: ["saç kremi"] },
  { fa: ["ماسک مو"], tr: ["saç maskesi"] },
  { fa: ["سرم مو"], tr: ["saç serumu"] },
  { fa: ["روغن مو"], tr: ["saç yağı"] },
  { fa: ["رنگ مو"], tr: ["saç boyası"] },
  { fa: ["لوسیون بدن"], tr: ["vücut losyonu"] },
  { fa: ["کرم دست"], tr: ["el kremi"] },

  // Electronics
  { fa: ["گوشی موبایل", "موبایل"], tr: ["cep telefonu", "telefon"] },
  { fa: ["لپ تاپ"], tr: ["laptop"] },
  { fa: ["تبلت"], tr: ["tablet"] },
  { fa: ["ساعت هوشمند"], tr: ["akıllı saat"] },
  { fa: ["هدفون"], tr: ["kulaklık"] },
  { fa: ["اسپیکر"], tr: ["hoparlör"] },
  { fa: ["دوربین"], tr: ["kamera"] },
  { fa: ["کنسول بازی"], tr: ["oyun konsolu"] },
  { fa: ["شارژر"], tr: ["şarj cihazı"] },
  { fa: ["کابل"], tr: ["kablo"] },
  { fa: ["پاوربانک"], tr: ["powerbank"] },

  // Sports
  { fa: ["کفش ورزشی"], tr: ["spor ayakkabı"] },
  { fa: ["لباس ورزشی"], tr: ["spor giyim", "eşofman"] },
  { fa: ["دویدن"], tr: ["koşu"] },
  { fa: ["فیتنس"], tr: ["fitness"] },
  { fa: ["یوگا"], tr: ["yoga"] },
  { fa: ["ترموس"], tr: ["termos"] },
  { fa: ["ساک ورزشی"], tr: ["spor çantası"] },
  { fa: ["دمبل", "وزنه"], tr: ["dambıl", "halter"] },

  // Pets
  { fa: ["غذای سگ"], tr: ["köpek maması"] },
  { fa: ["غذای گربه"], tr: ["kedi maması"] },
  { fa: ["تشویقی"], tr: ["ödül maması"] },
  { fa: ["قلاده"], tr: ["tasma"] },
  { fa: ["خاک گربه", "شن گربه"], tr: ["kedi kumu"] },
  { fa: ["اسباب بازی"], tr: ["oyuncak"] },

  // Vitamins & Supplements
  { fa: ["مولتی ویتامین"], tr: ["multivitamin"] },
  { fa: ["کلسیم"], tr: ["kalsiyum"] },
  { fa: ["ویتامین d", "ویتامین d3"], tr: ["d vitamini", "d3 vitamini"] },
  { fa: ["ملاتونین"], tr: ["melatonin"] },
  { fa: ["ویتامین c"], tr: ["c vitamini"] },
  { fa: ["پروبیوتیک"], tr: ["probiyotik"] },
  { fa: ["امگا 3"], tr: ["omega 3"] },
  { fa: ["آهن"], tr: ["demir"] },
  { fa: ["روی"], tr: ["çinko", "cinko"] },
  { fa: ["منیزیم"], tr: ["magnezyum"] },
  { fa: ["آنتی اکسیدان"], tr: ["antioksidan"] },
  { fa: ["داروهای گیاهی"], tr: ["bitkisel ilaçlar"] },
  { fa: ["چای"], tr: ["çay", "cay"] },
  { fa: ["دمنوش"], tr: ["bitki çayı", "bitki cayi"] },
];

// Subcategory-level mappings (Persian subcategory/label → Turkish synonyms)
// These are exact UI labels used across dropdowns/APIs to maximize recall
export const faToTrSubcategoryMappings: Record<string, string[]> = {
  // Fashion - Men
  پولوشرت: ["polo tişört"],
  "هودی و سویشرت": ["hoodie", "sweatshirt"],
  لین: ["keten"],
  بلیزر: ["blazer"],
  "کاپشن و بارانی": ["mont", "yağmurluk"],

  // Fashion - Kids
  "دختر 1.5 تا 6 سال": ["kız çocuk 1.5-6 yaş", "kız çocuk"],
  "دختر 6 تا 14 سال": ["kız çocuk 6-14 yaş", "kız çocuk"],
  "پسر 1.5 تا 6 سال": ["erkek çocuk 1.5-6 yaş", "erkek çocuk"],
  "پسر 6 تا 14 سال": ["erkek çocuk 6-14 yaş", "erkek çocuk"],
  "نوزاد 0 تا 18 ماه": ["bebek", "yenidoğan"],

  // Beauty - Skin care
  "محصولات مراقبت از پوست": ["cilt bakımı ürünleri"],
  "ست مراقبت پوستی": ["cilt bakım seti"],
  "محصولات ضد پیری": ["anti-aging ürünleri", "yaşlanma karşıtı"],
  "کرم مرطوب کننده": ["nemlendirici krem"],
  "سرم صورت": ["yüz serumu"],
  "پاک کننده پوست": ["yüz temizleyici"],
  "تونر و ماسک": ["tonik", "yüz maskesi"],

  // Beauty - Hair care
  "محصولات حالت دهی": ["şekillendirici"],
  "شانه و برس": ["tarak", "fırça"],

  // Beauty - Perfume & Body
  "بادی اسپلش": ["body splash"],
  "محصولات ضد تعریق": ["ter önleyici", "antiperspirant"],
  "کرم دست و پا": ["el ve ayak kremi"],

  // Beauty - Health & Nutrition
  "انواع ویتامین ها": ["vitamin çeşitleri"],
  "مکملهای ورزشی": ["spor takviyeleri"],
  "انواع دمنوش": ["bitki çayları"],
  "شربت و داروهای گیاهی": ["bitkisel şurup", "bitkisel ilaçlar"],
  "محصولات تقویتی": ["takviye ürünleri"],
  "چای و قهوه": ["çay", "kahve"],

  // Electronics
  "لوازم جانبی": ["aksesuar"],
  "کیف و کاور": ["kılıf", "kapak", "çanta"],
  "کارت حافظه": ["hafıza kartı"],

  // Sports - Shoes
  "کفش ورزشی": ["spor ayakkabı"],
  "کفش دویدن": ["koşu ayakkabısı"],
  "کفش پیاده‌روی": ["yürüyüş ayakkabısı"],
  "کفش بسکتبال": ["basketbol ayakkabısı"],
  "کفش فوتبال": ["futbol ayakkabısı", "krampon"],
  "کفش تنیس": ["tenis ayakkabısı"],
  "کفش ورزشی مردانه": ["erkek spor ayakkabı"],

  // Sports - Apparel
  "لباس ورزشی": ["spor giyim", "eşofman"],
  "لباس فیتنس": ["fitness giyim"],
  "لباس یوگا": ["yoga kıyafeti"],
  "لباس دویدن": ["koşu kıyafeti"],
  "تیشرت ورزشی": ["spor tişört"],
  "شلوار ورزشی": ["eşofman altı"],

  // Sports - Gear
  "ساک ورزشی": ["spor çantası"],
  "قمقمه ورزشی": ["spor matarası"],
  "ترموس ورزشی": ["spor termosu"],
  "دستکش ورزشی": ["spor eldiveni"],
  "تاپ ورزشی": ["spor atlet"],
  "ساعت ورزشی": ["spor saati"],
  "ماشین تناسب اندام": ["fitness aleti"],

  // Pets
  "غذای سگ و گربه": ["köpek maması", "kedi maması"],
  "تشویقی سگ و گربه": ["ödül maması"],
  "لباس و لوازم جانبی": ["giysi", "aksesuar"],
  ویتامین: ["vitamin"],
  "محصولات بهداشتی": ["hijyen ürünleri"],
  "محصولات نظافت": ["temizlik ürünleri"],
  "محصولات درمانی": ["tedavi ürünleri"],
  "محصولات آموزش": ["eğitim ürünleri"],
  "محصولات مسافرت": ["seyahat ürünleri"],
  "غذای پرنده": ["kuş yemi"],
  "غذای ماهی": ["balık yemi"],
  "غذای همستر": ["hamster yemi"],

  // Vitamins subcategories
  "پوست، مو، ناخن": ["cilt saç tırnak"],
  سایر: ["diğer"],
};

// Utility: Given a Persian text, return unique Turkish keywords to append
export function getTurkishKeywordsForPersianQuery(queryFa: string): string[] {
  const q = (queryFa || "").toLowerCase();
  const results = new Set<string>();

  // Top-level categories
  Object.entries(faToTrTopCategories).forEach(([faName, trList]) => {
    if (q.includes(faName)) {
      trList.forEach((t) => results.add(t));
    }
  });

  // Keyword mappings
  for (const mapping of faToTrKeywordMappings) {
    const hasFa = mapping.fa.some((w) => q.includes(w));
    if (hasFa) {
      mapping.tr.forEach((t) => results.add(t));
    }
  }

  // Subcategory label mappings
  Object.entries(faToTrSubcategoryMappings).forEach(([faLabel, trList]) => {
    if (q.includes(faLabel)) {
      trList.forEach((t) => results.add(t));
    }
  });

  return Array.from(results);
}
