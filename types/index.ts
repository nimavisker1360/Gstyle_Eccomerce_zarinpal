import {
  CartSchema,
  OrderItemSchema,
  ProductInputSchema,
  ShippingAddressSchema,
  UserInputSchema,
  UserSignInSchema,
  UserSignUpSchema,
  OrderInputSchema,
  ReviewInputSchema,
  ReviewClientInputSchema,
} from "@/lib/validator";

import z from "zod";

// Import IProduct from the product model
export type { IProduct } from "@/lib/db/models/product.model";

// Import product types from the new product types file
export type {
  Product,
  BasicProductInfo,
  AdditionalProductInfo,
  ProductAPILinks,
  StoreInfo,
  SearchParams,
  SearchResponse,
  MongoDBProduct,
  ProductCategory,
  Currency,
  RatingDistribution,
  SearchEngine,
  DeviceType,
  SupportedCountry,
  SupportedLanguage,
  ProductStatus,
  SupportedStoreDomain,
  SUPPORTED_STORE_DOMAINS,
} from "./product.types";

export type IReviewInput = z.infer<typeof ReviewInputSchema>;
export type IReviewClientInput = z.infer<typeof ReviewClientInputSchema>;
export type OrderItem = z.infer<typeof OrderItemSchema>;
export type Cart = z.infer<typeof CartSchema>;
export type ShippingAddress = z.infer<typeof ShippingAddressSchema>;
export type IProductInput = z.infer<typeof ProductInputSchema>;
export type IOrderInput = z.infer<typeof OrderInputSchema>;

export type IReviewDetails = IReviewInput & {
  _id: string;
  createdAt: string;
  user: {
    name: string;
  };
};

export type Data = {
  users: IUserInput[];
  products: IProductInput[];
  reviews: {
    title: string;
    rating: number;
    comment: string;
  }[];
  headerMenus: {
    name: string;
    href: string;
  }[];
  carousels: {
    image: string;
    url: string;
    title: string;
    buttonCaption: string;
    isPublished: boolean;
  }[];
};

// user
export type IUserInput = z.infer<typeof UserInputSchema>;
export type IUserSignIn = z.infer<typeof UserSignInSchema>;
export type IUserSignUp = z.infer<typeof UserSignUpSchema>;
