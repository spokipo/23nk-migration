/**
 * Auto-generated entity types
 * Contains all CMS collection interfaces in a single file 
 */

/**
 * Collection ID: collections
 * Interface for Collections
 */
export interface Collections {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  name?: string;
  /** @wixFieldType image - Contains image URL, render with <Image> component, NOT as text */
  image?: string;
  /** @wixFieldType text */
  description?: string;
  /** @wixFieldType text */
  slug?: string;
  /** @wixFieldType number */
  displayOrder?: number;
  /** @wixFieldType multi_reference */
  products_Collections?: Products[];
}


/**
 * Collection ID: contactformsubmissions
 * Interface for ContactFormSubmissions
 */
export interface ContactFormSubmissions {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  fullName?: string;
  /** @wixFieldType text */
  selectedCorset?: string;
  /** @wixFieldType text */
  country?: string;
  /** @wixFieldType text */
  preferredContactMethod?: string;
  /** @wixFieldType text */
  contactDetails?: string;
  /** @wixFieldType text */
  message?: string;
}


/**
 * Collection ID: instock
 * Interface for InStock
 */
export interface InStock {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  itemName?: string;
  /** @wixFieldType number */
  itemPrice?: number;
  /** @wixFieldType image - Contains image URL, render with <Image> component, NOT as text */
  itemImage?: string;
  /** @wixFieldType text */
  itemDescription?: string;
  /** @wixFieldType number */
  itemQuantity?: number;
}


/**
 * Collection ID: products
 * Interface for Products
 */
export interface Products {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType boolean */
  inStock?: boolean;
  /** @wixFieldType text */
  name?: string;
  /** @wixFieldType text */
  shortDescription?: string;
  /** @wixFieldType text */
  fullDescription?: string;
  /** @wixFieldType number */
  price?: number;
  /** @wixFieldType text */
  materials?: string;
  /** @wixFieldType image - Contains image URL, render with <Image> component, NOT as text */
  mainImage?: string;
  /** @wixFieldType image - Contains image URL, render with <Image> component, NOT as text */
  additionalImage1?: string;
  /** @wixFieldType image - Contains image URL, render with <Image> component, NOT as text */
  additionalImage2?: string;
  /** @wixFieldType boolean */
  isFeatured?: boolean;
  /** @wixFieldType multi_reference */
  Collections?: Collections[];
}


/**
 * Collection ID: reviews
 * Interface for Reviews
 */
export interface Reviews {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType image - Contains image URL, render with <Image> component, NOT as text */
  reviewImage?: string;
  /** @wixFieldType text */
  reviewTitle?: string;
  /** @wixFieldType text */
  shortDescription?: string;
  /** @wixFieldType text */
  reviewerName?: string;
  /** @wixFieldType datetime */
  submissionDate?: Date | string;
}
