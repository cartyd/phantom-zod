/**
 * Message key paths for type-safe message access
 */
export type MessageKeyPath = 
  | `common.${keyof import('./message.types').CommonMessages}`
  | `string.${keyof import('./message.types').StringMessages}`
  | `email.${keyof import('./message.types').EmailMessages}`
  | `phone.${keyof import('./message.types').PhoneMessages}`
  | `phone.examples.${keyof import('./message.types').PhoneMessages['examples']}`
  | `uuid.${keyof import('./message.types').UuidMessages}`
  | `url.${keyof import('./message.types').UrlMessages}`
  | `number.${keyof import('./message.types').NumberMessages}`
  | `boolean.${keyof import('./message.types').BooleanMessages}`
  | `array.${keyof import('./message.types').ArrayMessages}`
  | `enum.${keyof import('./message.types').EnumMessages}`
  | `date.${keyof import('./message.types').DateMessages}`
  | `date.examples.${keyof import('./message.types').DateMessages['examples']}`
  | `money.${keyof import('./message.types').MoneyMessages}`
  | `postalCode.${keyof import('./message.types').PostalCodeMessages}`
  | `postalCode.examples.${keyof import('./message.types').PostalCodeMessages['examples']}`
  | `fileUpload.${keyof import('./message.types').FileUploadMessages}`
  | `fileUpload.examples.${keyof import('./message.types').FileUploadMessages['examples']}`
  | `pagination.${keyof import('./message.types').PaginationMessages}`
  | `address.${keyof import('./message.types').AddressMessages}`
  | `network.${keyof import('./message.types').NetworkMessages}`
  | `network.examples.${keyof import('./message.types').NetworkMessages['examples']}`
  | `user.${keyof import('./message.types').UserMessages}`;
