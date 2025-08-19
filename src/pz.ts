// Barrel file to export all schemas under the `pz` namespace
import * as addressSchemas from "./schemas/address-schemas";
import * as arraySchemas from "./schemas/array-schemas";
import * as booleanSchemas from "./schemas/boolean-schemas";
import * as dateSchemas from "./schemas/date-schemas";
import * as emailSchemas from "./schemas/email-schemas";
import * as enumSchemas from "./schemas/enum-schemas";
import * as fileUploadSchemas from "./schemas/file-upload-schemas";
import * as idListSchemas from "./schemas/id-list-schemas";
import * as moneySchemas from "./schemas/money-schemas";
import * as networkSchemas from "./schemas/network-schemas";
import * as numberSchemas from "./schemas/number-schemas";
import * as paginationSchemas from "./schemas/pagination-schemas";
import * as phoneSchemas from "./schemas/phone-schemas";
import * as postalCodeSchemas from "./schemas/postal-code-schemas";
import * as recordSchemas from "./schemas/record-schemas";
import * as stringSchemas from "./schemas/string-schemas";
import * as urlSchemas from "./schemas/url-schemas";
import * as userSchemas from "./schemas/user-schemas";
import * as uuidSchemas from "./schemas/uuid-schemas";

export const pz = {
  ...addressSchemas,
  ...arraySchemas,
  ...booleanSchemas,
  ...dateSchemas,
  ...emailSchemas,
  ...enumSchemas,
  ...fileUploadSchemas,
  ...idListSchemas,
  ...moneySchemas,
  ...networkSchemas,
  ...numberSchemas,
  ...paginationSchemas,
  ...phoneSchemas,
  ...postalCodeSchemas,
  ...recordSchemas,
  ...stringSchemas,
  ...urlSchemas,
  ...userSchemas,
  ...uuidSchemas,
};
