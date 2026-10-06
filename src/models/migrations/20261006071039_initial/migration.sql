-- CreateEnum
CREATE TYPE "PageType" AS ENUM ('Masters', 'Transactions', 'Reports', 'AdminAccess');

-- CreateEnum
CREATE TYPE "PrefixCategory" AS ENUM ('Default', 'Specific');

-- CreateEnum
CREATE TYPE "BloodGroup" AS ENUM ('AP', 'BP', 'AN', 'BN', 'ABP', 'ABN', 'OP', 'ON');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "MaritalStatus" AS ENUM ('SINGLE', 'MARRIED', 'SEPARATED');

-- CreateEnum
CREATE TYPE "StockInOrOut" AS ENUM ('In', 'Out');

-- CreateEnum
CREATE TYPE "LedgerEntryType" AS ENUM ('Purchase_Bill', 'Process_Bill', 'Sales', 'My_Payment', 'Customer_Payment', 'Credit_Note', 'Debit_Note', 'Opening_Balance', 'Printing_Job_Work');

-- CreateEnum
CREATE TYPE "LedgerType" AS ENUM ('Supplier', 'Customer');

-- CreateEnum
CREATE TYPE "Credit_Debit" AS ENUM ('Credit', 'Debit');

-- CreateTable
CREATE TABLE "Page" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "link" TEXT,
    "type" "PageType" NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "pageGroupId" INTEGER,
    "order" INTEGER,

    CONSTRAINT "Page_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" SERIAL NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "gstNo" TEXT,
    "panNo" TEXT,
    "contactName" TEXT,
    "contactMobile" BIGINT NOT NULL,
    "contactEmail" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "logo" TEXT,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "validFrom" TIMESTAMP(3) NOT NULL,
    "expireAt" TIMESTAMP(3) NOT NULL,
    "code" TEXT NOT NULL,
    "maxUsers" INTEGER NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Branch" (
    "id" SERIAL NOT NULL,
    "branchName" TEXT NOT NULL,
    "branchCode" TEXT,
    "contactName" TEXT,
    "contactMobile" BIGINT NOT NULL,
    "contactEmail" TEXT,
    "address" TEXT DEFAULT '',
    "companyId" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "idPrefix" TEXT,
    "idSequence" TEXT,
    "tempPrefix" TEXT,
    "tempSequence" TEXT,
    "logo" TEXT,
    "prefixCategory" "PrefixCategory",

    CONSTRAINT "Branch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserOnBranch" (
    "id" SERIAL NOT NULL,
    "branchId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "UserOnBranch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "companyId" INTEGER NOT NULL,
    "type" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "defaultRole" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoleOnPage" (
    "id" SERIAL NOT NULL,
    "roleId" INTEGER NOT NULL,
    "pageId" INTEGER NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "create" BOOLEAN NOT NULL DEFAULT false,
    "edit" BOOLEAN NOT NULL DEFAULT false,
    "delete" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "RoleOnPage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT,
    "password" TEXT NOT NULL,
    "roleId" INTEGER,
    "otp" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "employeeId" INTEGER,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Employee" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "regNo" TEXT,
    "chamberNo" TEXT,
    "departmentId" INTEGER,
    "joiningDate" TIMESTAMP(3),
    "fatherName" TEXT,
    "dob" TIMESTAMP(3),
    "gender" "Gender",
    "maritalStatus" "MaritalStatus",
    "bloodGroup" "BloodGroup",
    "panNo" TEXT,
    "consultFee" TEXT,
    "salaryPerMonth" TEXT,
    "commissionCharges" TEXT,
    "mobile" BIGINT,
    "accountNo" TEXT,
    "ifscNo" TEXT,
    "branchName" TEXT,
    "bankName" TEXT,
    "degree" TEXT,
    "specialization" TEXT,
    "localAddress" TEXT,
    "localCityId" INTEGER,
    "localPincode" INTEGER,
    "permAddress" TEXT,
    "permCityId" INTEGER,
    "permPincode" INTEGER,
    "active" BOOLEAN DEFAULT true,
    "image" BYTEA,
    "branchId" INTEGER,
    "employeeCategoryId" INTEGER,
    "permanent" BOOLEAN DEFAULT false,
    "leavingReason" TEXT,
    "leavingDate" TIMESTAMP(3),
    "canRejoin" BOOLEAN DEFAULT true,
    "rejoinReason" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "employeeId" TEXT,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinYear" (
    "id" SERIAL NOT NULL,
    "from" TIMESTAMP(3) NOT NULL,
    "to" TIMESTAMP(3) NOT NULL,
    "companyId" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "FinYear_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeCategory" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "branchId" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "defaultCategory" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "EmployeeCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Country" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "companyId" INTEGER NOT NULL,

    CONSTRAINT "Country_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "State" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "gstNo" TEXT NOT NULL,
    "countryId" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "State_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "City" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "stateId" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "City_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Department" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "companyId" INTEGER NOT NULL,
    "isTaken" BOOLEAN,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PageGroup" (
    "id" SERIAL NOT NULL,
    "type" "PageType" NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "PageGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartyCategory" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "companyId" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "PartyCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Party" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "aliasName" TEXT,
    "displayName" TEXT,
    "address" TEXT,
    "cityId" INTEGER,
    "pincode" INTEGER,
    "panNo" TEXT,
    "tinNo" TEXT,
    "cstNo" TEXT,
    "cstDate" DATE,
    "cinNo" TEXT,
    "faxNo" TEXT,
    "email" TEXT,
    "website" TEXT,
    "contactPersonName" TEXT,
    "gstNo" TEXT,
    "aadharNo" TEXT,
    "costCode" TEXT,
    "active" BOOLEAN DEFAULT true,
    "contactMobile" BIGINT DEFAULT 0,
    "companyId" INTEGER,
    "yarn" BOOLEAN DEFAULT false,
    "fabric" BOOLEAN DEFAULT false,
    "accessoryGroup" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "createdById" INTEGER,
    "updatedById" INTEGER,
    "isSupplier" BOOLEAN DEFAULT false,
    "isCustomer" BOOLEAN DEFAULT false,
    "isBranch" BOOLEAN DEFAULT false,
    "landMark" TEXT,
    "contact" TEXT,
    "designation" TEXT,
    "department" TEXT,
    "contactPersonEmail" TEXT,
    "contactNumber" TEXT,
    "alterContactNumber" TEXT,
    "bankname" TEXT,
    "bankBranchName" TEXT,
    "accountNumber" TEXT,
    "ifscCode" TEXT,
    "coa" BIGINT,
    "soa" BIGINT,
    "msmeNo" TEXT,
    "companyAlterNumber" TEXT,
    "partyCode" TEXT,
    "parentId" TEXT,
    "branchTypeId" INTEGER,

    CONSTRAINT "Party_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartyBranch" (
    "id" SERIAL NOT NULL,
    "partyId" INTEGER,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "aliasName" TEXT,
    "displayName" TEXT,
    "address" TEXT,
    "cityId" INTEGER,
    "pincode" INTEGER,
    "panNo" TEXT,
    "tinNo" TEXT,
    "cstNo" TEXT,
    "cstDate" DATE,
    "cinNo" TEXT,
    "faxNo" TEXT,
    "email" TEXT,
    "website" TEXT,
    "contactPersonName" TEXT,
    "gstNo" TEXT,
    "costCode" TEXT,
    "active" BOOLEAN DEFAULT true,
    "contactMobile" BIGINT DEFAULT 0,
    "companyId" INTEGER,
    "yarn" BOOLEAN DEFAULT false,
    "fabric" BOOLEAN DEFAULT false,
    "accessoryGroup" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "createdById" INTEGER,
    "updatedById" INTEGER,
    "isSupplier" BOOLEAN DEFAULT false,
    "isCustomer" BOOLEAN DEFAULT false,
    "landMark" TEXT,
    "contact" TEXT,
    "designation" TEXT,
    "department" TEXT,
    "contactPersonEmail" TEXT,
    "contactNumber" TEXT,
    "alterContactNumber" TEXT,
    "bankname" TEXT,
    "bankBranchName" TEXT,
    "accountNumber" TEXT,
    "ifscCode" TEXT,
    "coa" BIGINT,
    "soa" BIGINT,
    "msmeNo" TEXT,
    "companyAlterNumber" TEXT,
    "partyCode" TEXT,

    CONSTRAINT "PartyBranch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attachments" (
    "id" SERIAL NOT NULL,
    "partyId" INTEGER,
    "date" TIMESTAMP(3),
    "name" TEXT,
    "fileName" TEXT,
    "filePath" TEXT,
    "purchaseInwardId" INTEGER,
    "orderEntryId" INTEGER,

    CONSTRAINT "attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Branchattachments" (
    "id" SERIAL NOT NULL,
    "partyBranchId" INTEGER,
    "date" TIMESTAMP(3),
    "name" TEXT,
    "fileName" TEXT,
    "filePath" TEXT,

    CONSTRAINT "Branchattachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductBrand" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "code" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "companyId" INTEGER,

    CONSTRAINT "ProductBrand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductCategory" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "companyId" INTEGER,

    CONSTRAINT "ProductCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Uom" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "companyId" INTEGER,

    CONSTRAINT "Uom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductUomPriceDetails" (
    "id" SERIAL NOT NULL,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "uomId" INTEGER,
    "productId" INTEGER NOT NULL,
    "poBillItemsId" INTEGER,
    "poReturnItemsId" INTEGER,

    CONSTRAINT "ProductUomPriceDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "code" TEXT,
    "productBrandId" INTEGER,
    "productCategoryId" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "companyId" INTEGER,
    "price" DOUBLE PRECISION DEFAULT 0,
    "uomId" INTEGER,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseBill" (
    "id" SERIAL NOT NULL,
    "supplierId" INTEGER,
    "supplierDcNo" TEXT,
    "branchId" INTEGER,
    "address" TEXT,
    "place" TEXT,
    "docId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" DATE NOT NULL,
    "selectedDate" DATE,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "companyId" INTEGER,
    "netBillValue" DOUBLE PRECISION,
    "icePrice" DOUBLE PRECISION,
    "packingCharge" DOUBLE PRECISION,
    "labourCharge" DOUBLE PRECISION,
    "tollgate" DOUBLE PRECISION,
    "transport" DOUBLE PRECISION,
    "ourPrice" DOUBLE PRECISION,

    CONSTRAINT "PurchaseBill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PoBillItems" (
    "id" SERIAL NOT NULL,
    "purchaseBillId" INTEGER,
    "box" DOUBLE PRECISION,
    "productId" INTEGER NOT NULL,
    "qty" DOUBLE PRECISION,
    "price" DOUBLE PRECISION,
    "stockQty" DOUBLE PRECISION,
    "productBrandId" INTEGER,
    "productCategoryId" INTEGER,

    CONSTRAINT "PoBillItems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseReturn" (
    "id" SERIAL NOT NULL,
    "supplierId" INTEGER,
    "branchId" INTEGER,
    "address" TEXT,
    "place" TEXT,
    "docId" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "dueDate" DATE,
    "active" BOOLEAN DEFAULT true,
    "companyId" INTEGER,
    "purchaseBillId" INTEGER NOT NULL,

    CONSTRAINT "PurchaseReturn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PoReturnItems" (
    "id" SERIAL NOT NULL,
    "purchaseReturnId" INTEGER,
    "productId" INTEGER,
    "purchaseBillItemsId" INTEGER,
    "qty" DOUBLE PRECISION,
    "stockQty" DOUBLE PRECISION,
    "poQty" DOUBLE PRECISION,
    "uomId" INTEGER,

    CONSTRAINT "PoReturnItems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stock" (
    "id" SERIAL NOT NULL,
    "inOrOut" "StockInOrOut",
    "productId" INTEGER,
    "qty" DOUBLE PRECISION,
    "poBillItemsId" INTEGER,
    "branchId" INTEGER,
    "salesBillItemsId" INTEGER,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "poReturnItemsId" INTEGER,
    "salesReturnItemsId" INTEGER,
    "OpeningStockItemsId" INTEGER,
    "inwardItemsId" INTEGER,
    "uomId" INTEGER,
    "styleItemId" INTEGER,
    "hsnId" INTEGER,
    "inwardType" TEXT,
    "updatedAt" TIMESTAMP(3),
    "createdById" INTEGER,
    "updatedById" INTEGER,
    "processName" TEXT,
    "storeId" INTEGER,
    "invNo" TEXT,
    "batchNo" TEXT,
    "purchaseReturnItemsId" INTEGER,
    "itemGroupId" INTEGER,
    "sizeId" INTEGER,
    "colorId" INTEGER,
    "gsmId" INTEGER,
    "jobCardId" INTEGER,
    "styleId" INTEGER,
    "orderId" INTEGER,
    "packingId" INTEGER,
    "salesDeliveryId" INTEGER,
    "salesReturnId" INTEGER,

    CONSTRAINT "Stock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesBill" (
    "id" SERIAL NOT NULL,
    "supplierId" INTEGER,
    "branchId" INTEGER,
    "address" TEXT,
    "place" TEXT,
    "docId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" DATE,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "companyId" INTEGER,
    "contactMobile" BIGINT,
    "name" TEXT,
    "isOn" BOOLEAN NOT NULL DEFAULT false,
    "price" DOUBLE PRECISION,
    "netBillValue" INTEGER,
    "selectedDate" DATE,

    CONSTRAINT "SalesBill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesBillItems" (
    "id" SERIAL NOT NULL,
    "salesBillId" INTEGER,
    "productBrandId" INTEGER,
    "productCategoryId" INTEGER,
    "productId" INTEGER NOT NULL,
    "qty" DOUBLE PRECISION,
    "price" DOUBLE PRECISION,
    "stockQty" DOUBLE PRECISION,
    "uomId" INTEGER,

    CONSTRAINT "SalesBillItems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesReturn" (
    "id" SERIAL NOT NULL,
    "docId" TEXT,
    "docDate" DATE,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" INTEGER,
    "updatedById" INTEGER,
    "branchId" INTEGER,
    "customerId" INTEGER,
    "salesDeliveryId" INTEGER,
    "dcNo" TEXT,
    "vehicleNo" TEXT,
    "deliveryType" TEXT,
    "remarks" TEXT,
    "discountType" TEXT,
    "discountValue" DOUBLE PRECISION,
    "taxTemplateId" INTEGER,
    "termsAndCondition" TEXT,
    "termsId" INTEGER,
    "payTermId" INTEGER,
    "conversionType" TEXT,
    "weightInKg" DOUBLE PRECISION,
    "carriageCharge" DOUBLE PRECISION,
    "currencyId" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "companyId" INTEGER,

    CONSTRAINT "SalesReturn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesReturnItems" (
    "id" SERIAL NOT NULL,
    "salesReturnId" INTEGER,
    "styleItemId" INTEGER,
    "itemGroupId" INTEGER,
    "itemSubGroupId" INTEGER,
    "deliveryQty" DOUBLE PRECISION,
    "price" DOUBLE PRECISION,
    "amount" DOUBLE PRECISION,
    "discountType" TEXT,
    "discountValue" DOUBLE PRECISION,
    "taxPercent" DOUBLE PRECISION,
    "uomId" INTEGER,
    "gsmId" INTEGER,
    "hsnId" INTEGER,
    "trackingType" TEXT,
    "labelWidth" TEXT,
    "dozen" DOUBLE PRECISION,
    "orderQty" TEXT,

    CONSTRAINT "SalesReturnItems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesReturnStyleBreakup" (
    "id" SERIAL NOT NULL,
    "salesReturnItemsId" INTEGER NOT NULL,
    "styleId" INTEGER,

    CONSTRAINT "SalesReturnStyleBreakup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesReturnSizeBreakup" (
    "id" SERIAL NOT NULL,
    "salesReturnStyleBreakupId" INTEGER,
    "sizeId" INTEGER,
    "qty" TEXT,
    "returnQty" TEXT,
    "salesSizeBreakupId" INTEGER,

    CONSTRAINT "SalesReturnSizeBreakup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpeningStock" (
    "id" SERIAL NOT NULL,
    "branchId" INTEGER,
    "address" TEXT,
    "place" TEXT,
    "docId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" DATE NOT NULL,
    "companyId" INTEGER,

    CONSTRAINT "OpeningStock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpeningStockItems" (
    "id" SERIAL NOT NULL,
    "OpeningStockId" INTEGER,
    "box" DOUBLE PRECISION,
    "productId" INTEGER,
    "qty" DOUBLE PRECISION,
    "price" DOUBLE PRECISION,
    "stockQty" DOUBLE PRECISION,
    "stockId" INTEGER,

    CONSTRAINT "OpeningStockItems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" SERIAL NOT NULL,
    "docId" TEXT NOT NULL,
    "partyId" INTEGER NOT NULL,
    "isTaxBill" BOOLEAN NOT NULL DEFAULT false,
    "branchId" INTEGER,
    "createdById" INTEGER NOT NULL,
    "updatedById" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "paymentMode" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "cvv" TIMESTAMP(3) NOT NULL,
    "paidAmount" INTEGER DEFAULT 0,
    "paymentType" TEXT NOT NULL,
    "totalBillAmount" INTEGER,
    "discount" INTEGER DEFAULT 0,
    "paymentRefNo" TEXT,
    "totalAmount" INTEGER,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Style" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "aliasName" TEXT,
    "code" TEXT,
    "active" BOOLEAN DEFAULT false,
    "sizeTemplateId" INTEGER,
    "itemGroupId" INTEGER,
    "uomId" INTEGER,
    "gsmId" INTEGER,

    CONSTRAINT "Style_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StyleItem" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "aliasName" TEXT,
    "code" TEXT,
    "active" BOOLEAN DEFAULT false,
    "sizeTemplateId" INTEGER,
    "itemGroupId" INTEGER,
    "itemSubGroupId" INTEGER,
    "uomId" INTEGER,
    "gsmId" INTEGER,
    "hsnId" INTEGER,

    CONSTRAINT "StyleItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeliveryChallan" (
    "id" SERIAL NOT NULL,
    "docId" TEXT,
    "active" BOOLEAN DEFAULT false,
    "supplierId" INTEGER,
    "branchId" INTEGER,
    "deliveryType" TEXT,
    "deliveryPartyId" INTEGER,
    "createdById" INTEGER,
    "updatedById" INTEGER,
    "isDeleted" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "dcNo" TEXT,
    "dcDate" TIMESTAMP(3),
    "remarks" TEXT,
    "vechineNo" TEXT,
    "deliveryTo" INTEGER,
    "finYearId" INTEGER,

    CONSTRAINT "DeliveryChallan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeliveryChallanItems" (
    "id" SERIAL NOT NULL,
    "deliveryChallanId" INTEGER,
    "styleId" INTEGER,
    "styleItemId" INTEGER,
    "noOfBox" TEXT,
    "uomId" INTEGER,
    "colorId" INTEGER,
    "hsnId" INTEGER,
    "qty" DOUBLE PRECISION,
    "active" BOOLEAN DEFAULT false,
    "isInvoice" BOOLEAN DEFAULT false,

    CONSTRAINT "DeliveryChallanItems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Color" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "active" BOOLEAN DEFAULT true,

    CONSTRAINT "Color_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeliveryInvoice" (
    "id" SERIAL NOT NULL,
    "docId" TEXT,
    "supplierId" INTEGER,
    "branchId" INTEGER,
    "finYearId" INTEGER,
    "deliveryType" TEXT,
    "createdById" INTEGER,
    "updatedById" INTEGER,
    "isDeleted" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "dcNo" TEXT,
    "dcDate" TIMESTAMP(3),
    "transportMode" TEXT,
    "transporter" TEXT,
    "vehicleNo" TEXT,
    "remarks" TEXT,
    "termsandcondtions" TEXT,
    "discountType" TEXT,
    "discountValue" DOUBLE PRECISION,
    "taxPercent" DOUBLE PRECISION,

    CONSTRAINT "DeliveryInvoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeliveryInvoiceItems" (
    "id" SERIAL NOT NULL,
    "deliveryInvoiceId" INTEGER,
    "styleId" INTEGER,
    "styleItemId" INTEGER,
    "noOfBox" TEXT,
    "uomId" INTEGER,
    "colorId" INTEGER,
    "qty" DOUBLE PRECISION,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "deliveryChallanItemsId" INTEGER,
    "price" DOUBLE PRECISION,
    "deliveryChallanId" INTEGER,
    "invoiceQty" DOUBLE PRECISION,
    "hsnId" INTEGER,

    CONSTRAINT "DeliveryInvoiceItems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ledger" (
    "id" SERIAL NOT NULL,
    "EntryType" "LedgerEntryType",
    "LedgerType" "LedgerType",
    "creditOrDebit" "Credit_Debit",
    "deliveryInvoiceId" INTEGER,
    "partyId" INTEGER,
    "amount" DOUBLE PRECISION,
    "dcNo" TEXT,
    "dcDate" TIMESTAMP(3),
    "partyBillDate" DATE,
    "partyBillNo" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "salesDeliveryId" INTEGER,
    "salesReturnId" INTEGER,
    "salesBillEntryId" INTEGER,
    "currencyId" INTEGER,
    "paymentId" INTEGER,

    CONSTRAINT "Ledger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxTerm" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "isPoWise" BOOLEAN NOT NULL DEFAULT false,
    "companyId" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "TaxTerm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxTemplate" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "companyId" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "TaxTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxTemplateDetails" (
    "id" SERIAL NOT NULL,
    "taxTemplateId" INTEGER NOT NULL,
    "taxTermId" INTEGER NOT NULL,
    "displayName" TEXT NOT NULL,
    "value" TEXT,
    "amount" TEXT,

    CONSTRAINT "TaxTemplateDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Hsn" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "tax" TEXT,

    CONSTRAINT "Hsn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BranchType" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "active" BOOLEAN DEFAULT false,
    "aliasName" TEXT,

    CONSTRAINT "BranchType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpeningBalance" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "companyId" INTEGER,
    "branchId" INTEGER,
    "createdById" INTEGER,
    "updatedById" INTEGER,
    "finYearId" INTEGER,
    "docId" TEXT,
    "date" TIMESTAMP(3),
    "partCategory" TEXT,
    "partyId" INTEGER NOT NULL,
    "amount" INTEGER,

    CONSTRAINT "OpeningBalance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Po" (
    "id" SERIAL NOT NULL,
    "docId" TEXT,
    "docDate" TIMESTAMP(3),
    "dueDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" INTEGER,
    "updatedById" INTEGER,
    "finYearId" INTEGER,
    "orderEntryId" INTEGER,
    "poType" TEXT,
    "taxTemplateId" INTEGER,
    "active" BOOLEAN DEFAULT true,
    "deliveryType" TEXT,
    "deliveryToId" INTEGER,
    "deliveryBranchId" INTEGER,
    "termsAndCondtion" TEXT,
    "termsId" INTEGER,
    "remarks" TEXT,
    "branchId" INTEGER,
    "supplierId" INTEGER,
    "discountType" TEXT,
    "discountValue" DOUBLE PRECISION,
    "taxPercent" DOUBLE PRECISION,
    "quoteVersion" INTEGER NOT NULL DEFAULT 1,
    "payTermId" INTEGER,

    CONSTRAINT "Po_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuoteVersion" (
    "id" SERIAL NOT NULL,
    "poId" INTEGER,
    "quoteVersion" INTEGER,

    CONSTRAINT "QuoteVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PoItems" (
    "id" SERIAL NOT NULL,
    "poId" INTEGER,
    "uomId" INTEGER,
    "styleItemId" INTEGER,
    "hsnId" INTEGER,
    "qty" DOUBLE PRECISION,
    "price" DOUBLE PRECISION,
    "discountType" TEXT,
    "discountValue" DOUBLE PRECISION,
    "taxPercent" DOUBLE PRECISION,
    "quoteVersion" INTEGER NOT NULL DEFAULT 1,
    "itemGroupId" INTEGER,
    "sizeId" INTEGER,
    "colorId" INTEGER,
    "gsmId" INTEGER,
    "sheetsPerPacket" INTEGER,
    "weightPerPacket" DOUBLE PRECISION,
    "totalPackets" INTEGER,
    "pricePerKg" INTEGER,

    CONSTRAINT "PoItems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TermsAndConditions" (
    "id" SERIAL NOT NULL,
    "description" TEXT,
    "name" TEXT,
    "active" BOOLEAN DEFAULT true,
    "companyId" INTEGER,

    CONSTRAINT "TermsAndConditions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayTerm" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "days" INTEGER,
    "years" INTEGER,
    "months" INTEGER,
    "companyId" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "aliasName" TEXT,

    CONSTRAINT "PayTerm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseInward" (
    "id" SERIAL NOT NULL,
    "docId" TEXT NOT NULL,
    "docDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" INTEGER,
    "updatedById" INTEGER,
    "branchId" INTEGER,
    "finYearId" INTEGER,
    "orderEntryId" INTEGER,
    "dcNo" TEXT,
    "dcDate" DATE,
    "supplierId" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "vehicleNo" TEXT,
    "remarks" TEXT,
    "inwardType" TEXT,
    "storeId" INTEGER,
    "locationId" INTEGER,
    "invNo" TEXT,
    "netBillValue" DOUBLE PRECISION,
    "taxTemplateId" INTEGER,
    "discountType" TEXT,
    "discountValue" DOUBLE PRECISION,
    "receiptType" TEXT,

    CONSTRAINT "PurchaseInward_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InwardItems" (
    "id" SERIAL NOT NULL,
    "purchaseInwardId" INTEGER,
    "uomId" INTEGER,
    "styleItemId" INTEGER,
    "hsnId" INTEGER,
    "poQty" DOUBLE PRECISION,
    "inwardQty" DOUBLE PRECISION,
    "inwardType" TEXT,
    "poId" INTEGER,
    "batchNo" TEXT,
    "invNo" TEXT,
    "dcNo" TEXT,
    "price" DOUBLE PRECISION,
    "itemGroupId" INTEGER,
    "sizeId" INTEGER,
    "colorId" INTEGER,
    "discountType" TEXT,
    "discountValue" DOUBLE PRECISION,
    "taxPercent" DOUBLE PRECISION,
    "gsmId" INTEGER,
    "orderEntryId" INTEGER,

    CONSTRAINT "InwardItems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" SERIAL NOT NULL,
    "storeName" TEXT NOT NULL,
    "locationId" INTEGER NOT NULL,
    "isFabric" BOOLEAN NOT NULL DEFAULT true,
    "isYarn" BOOLEAN NOT NULL DEFAULT true,
    "isAccessory" BOOLEAN NOT NULL DEFAULT true,
    "isGarments" BOOLEAN NOT NULL DEFAULT true,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "companyId" INTEGER NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseInwardReturn" (
    "id" SERIAL NOT NULL,
    "docId" TEXT NOT NULL,
    "docDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" INTEGER,
    "updatedById" INTEGER,
    "branchId" INTEGER,
    "finYearId" INTEGER,
    "orderEntryId" INTEGER,
    "dcNo" TEXT,
    "dcDate" DATE,
    "supplierId" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "termsAndCondition" TEXT,
    "termsId" INTEGER,
    "remarks" TEXT,
    "returnType" TEXT,
    "storeId" INTEGER,
    "locationId" INTEGER,
    "invNo" TEXT,

    CONSTRAINT "PurchaseInwardReturn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseReturnItems" (
    "id" SERIAL NOT NULL,
    "purchaseInwardReturnId" INTEGER,
    "uomId" INTEGER,
    "styleItemId" INTEGER,
    "hsnId" INTEGER,
    "poQty" DOUBLE PRECISION,
    "returnQty" DOUBLE PRECISION,
    "returnType" TEXT,
    "purchaseInwardId" INTEGER,
    "batchNo" TEXT,
    "invNo" TEXT,
    "itemGroupId" INTEGER,
    "sizeId" INTEGER,
    "colorId" INTEGER,
    "gsmId" INTEGER,
    "poId" INTEGER,

    CONSTRAINT "PurchaseReturnItems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseCancel" (
    "id" SERIAL NOT NULL,
    "docId" TEXT NOT NULL,
    "docDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" INTEGER,
    "updatedById" INTEGER,
    "branchId" INTEGER,
    "finYearId" INTEGER,
    "orderEntryId" INTEGER,
    "supplierId" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "termsAndCondition" TEXT,
    "termsId" INTEGER,
    "remarks" TEXT,
    "poType" TEXT,
    "storeId" INTEGER,
    "locationId" INTEGER,
    "invNo" TEXT,

    CONSTRAINT "PurchaseCancel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseCancelItems" (
    "id" SERIAL NOT NULL,
    "purchaseCancelId" INTEGER,
    "uomId" INTEGER,
    "styleItemId" INTEGER,
    "hsnId" INTEGER,
    "cancelQty" DOUBLE PRECISION,
    "poType" TEXT,
    "poId" INTEGER,
    "batchNo" TEXT,
    "invNo" TEXT,
    "poDocId" TEXT,
    "itemGroupId" INTEGER,
    "sizeId" INTEGER,
    "colorId" INTEGER,
    "gsmId" INTEGER,

    CONSTRAINT "PurchaseCancelItems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseBillEntry" (
    "id" SERIAL NOT NULL,
    "docId" TEXT NOT NULL,
    "docDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" INTEGER,
    "updatedById" INTEGER,
    "branchId" INTEGER,
    "finYearId" INTEGER,
    "supplierId" INTEGER,
    "companyId" INTEGER,
    "remarks" TEXT,
    "userId" INTEGER,
    "netBillValue" DOUBLE PRECISION,
    "billType" TEXT,
    "taxTemplateId" INTEGER,
    "discountType" TEXT,
    "discountValue" DOUBLE PRECISION,

    CONSTRAINT "PurchaseBillEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseBillEntryItems" (
    "id" SERIAL NOT NULL,
    "purchaseBillEntryId" INTEGER,
    "purchaseInwardId" INTEGER,
    "uomId" INTEGER,
    "styleItemId" INTEGER,
    "hsnId" INTEGER,
    "inwardQty" DOUBLE PRECISION,
    "invNo" TEXT,
    "dcNo" TEXT,
    "docId" TEXT,
    "docDate" TEXT,
    "price" DOUBLE PRECISION,
    "itemGroupId" INTEGER,
    "sizeId" INTEGER,
    "colorId" INTEGER,
    "discountType" TEXT,
    "discountValue" DOUBLE PRECISION,
    "taxPercent" DOUBLE PRECISION,
    "gsmId" INTEGER,
    "poId" INTEGER,

    CONSTRAINT "PurchaseBillEntryItems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseLedger" (
    "id" SERIAL NOT NULL,
    "purchaseBillEntryId" INTEGER,
    "purchaseInwardId" INTEGER,
    "netBillValue" DOUBLE PRECISION,
    "supplierId" INTEGER,
    "docId" TEXT,
    "docDate" TIMESTAMP(3),
    "remarks" TEXT,

    CONSTRAINT "PurchaseLedger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Size" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "companyId" INTEGER,

    CONSTRAINT "Size_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Gsm" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "companyId" INTEGER,

    CONSTRAINT "Gsm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemGroup" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "companyId" INTEGER,

    CONSTRAINT "ItemGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SizeTemplate" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "companyId" INTEGER,
    "active" BOOLEAN DEFAULT true,

    CONSTRAINT "SizeTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SizeTemplateList" (
    "id" SERIAL NOT NULL,
    "sizeTemplateId" INTEGER,
    "sizeId" INTEGER,

    CONSTRAINT "SizeTemplateList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApprovalRuleModule" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ApprovalRuleModule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApprovalRuleField" (
    "id" SERIAL NOT NULL,
    "moduleId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'number',
    "parentRelation" TEXT,
    "fieldPath" TEXT,
    "aggregation" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ApprovalRuleField_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApprovalRuleOperator" (
    "id" SERIAL NOT NULL,
    "operator" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ApprovalRuleOperator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApprovalConfigCondition" (
    "id" SERIAL NOT NULL,
    "approvalConfigId" INTEGER NOT NULL,
    "fieldId" INTEGER NOT NULL,
    "operatorId" INTEGER NOT NULL,
    "valueType" TEXT NOT NULL DEFAULT 'STATIC',
    "value" TEXT,
    "compareFieldId" INTEGER,

    CONSTRAINT "ApprovalConfigCondition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApprovalConfig" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "branchId" INTEGER NOT NULL,
    "moduleId" INTEGER NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "isAlwaysApproved" BOOLEAN NOT NULL DEFAULT false,
    "approverType" TEXT,
    "approverRoleId" INTEGER,
    "approverUserId" INTEGER,
    "ruleLogicalOperator" TEXT NOT NULL DEFAULT 'AND',

    CONSTRAINT "ApprovalConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApprovalLevel" (
    "id" SERIAL NOT NULL,
    "approvalConfigId" INTEGER,
    "levelNo" INTEGER,
    "approveType" TEXT NOT NULL DEFAULT 'OR',

    CONSTRAINT "ApprovalLevel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApprovalLevelUser" (
    "id" SERIAL NOT NULL,
    "approvalLevelId" INTEGER,
    "userId" INTEGER,

    CONSTRAINT "ApprovalLevelUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApprovalLog" (
    "id" SERIAL NOT NULL,
    "approvalConfigId" INTEGER,
    "referenceId" INTEGER NOT NULL,
    "referencePage" TEXT NOT NULL,
    "referenceDocId" TEXT,
    "status" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "approvedById" INTEGER,
    "approvedAt" TIMESTAMP(3),
    "currentLevel" INTEGER NOT NULL DEFAULT 1,
    "rejectedById" INTEGER,
    "rejectedAt" TIMESTAMP(3),
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "raisedById" INTEGER,

    CONSTRAINT "ApprovalLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApprovalLevelLog" (
    "id" SERIAL NOT NULL,
    "approvalLogId" INTEGER,
    "approvalLevelId" INTEGER,
    "levelNo" INTEGER,
    "userId" INTEGER,
    "action" TEXT,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApprovalLevelLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderEntry" (
    "id" SERIAL NOT NULL,
    "docId" TEXT NOT NULL,
    "docDate" TIMESTAMP(3),
    "deliveryDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" INTEGER,
    "updatedById" INTEGER,
    "branchId" INTEGER,
    "customerId" INTEGER,
    "orderType" TEXT,
    "productionType" TEXT,
    "orderQty" INTEGER,
    "qrCode" TEXT,
    "requirements" TEXT,
    "remarks" TEXT,
    "termsAndCondition" TEXT,
    "termsId" INTEGER,
    "proFormaId" INTEGER,
    "refNo" TEXT,
    "isRepeatedPI" BOOLEAN DEFAULT false,
    "validDays" INTEGER,
    "validTo" TIMESTAMP(3),
    "taxTemplateId" INTEGER,
    "discountType" TEXT,
    "discountValue" DOUBLE PRECISION,
    "conversionType" TEXT,
    "payTermId" INTEGER,
    "bankId" INTEGER,
    "currencyId" INTEGER,
    "weightInKg" DOUBLE PRECISION,
    "carriageCharge" DOUBLE PRECISION,
    "carriageTax" DOUBLE PRECISION,
    "loadingId" INTEGER,
    "deliveryId" INTEGER,
    "isSaleOrderTaken" BOOLEAN DEFAULT false,

    CONSTRAINT "OrderEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Process" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "active" BOOLEAN DEFAULT true,
    "companyId" INTEGER,
    "isOutsideJob" BOOLEAN DEFAULT false,
    "departmentId" INTEGER,

    CONSTRAINT "Process_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcessGroup" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "companyId" INTEGER,
    "active" BOOLEAN DEFAULT true,

    CONSTRAINT "ProcessGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcessGroupList" (
    "id" SERIAL NOT NULL,
    "processGroupId" INTEGER,
    "processId" INTEGER,

    CONSTRAINT "ProcessGroupList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Board" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "active" BOOLEAN DEFAULT true,
    "companyId" INTEGER,

    CONSTRAINT "Board_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plate" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "active" BOOLEAN DEFAULT true,
    "companyId" INTEGER,

    CONSTRAINT "Plate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Die" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "active" BOOLEAN DEFAULT true,
    "companyId" INTEGER,

    CONSTRAINT "Die_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobCard" (
    "id" SERIAL NOT NULL,
    "docId" TEXT NOT NULL,
    "docDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" INTEGER,
    "updatedById" INTEGER,
    "branchId" INTEGER,
    "orderEntryId" INTEGER,
    "orderType" TEXT,
    "orderQty" INTEGER,
    "customerId" INTEGER,
    "gsmId" INTEGER,
    "boardId" INTEGER,
    "otherBoardId" INTEGER,
    "fullBoard" INTEGER,
    "noOfPockets" INTEGER,
    "cuttingSize" TEXT,
    "runningQty" INTEGER,
    "isFourColor" BOOLEAN DEFAULT false,
    "isCutColor" BOOLEAN DEFAULT false,
    "isFront" BOOLEAN DEFAULT false,
    "isFrontAndBack" BOOLEAN DEFAULT false,
    "isCMYK" BOOLEAN DEFAULT false,
    "isCutColMachine" BOOLEAN DEFAULT false,
    "isFrontMachine" BOOLEAN DEFAULT false,
    "isFrontBackMachine" BOOLEAN DEFAULT false,
    "plateId" INTEGER,
    "dieId" INTEGER,
    "totalPlateSet" INTEGER,
    "dieMethod" TEXT,
    "dieDescription" TEXT,
    "remarks" TEXT,
    "designerId" INTEGER,
    "followUpId" INTEGER,
    "tagCardUps" TEXT,
    "totalPlatesets" TEXT,
    "jobRunTime" TEXT,
    "productionType" TEXT,
    "fullBoardId" INTEGER,
    "cuttingSizeId" INTEGER,
    "labelSizeId" INTEGER,
    "itemGroupId" INTEGER,
    "itemType" TEXT,
    "styleItemId" INTEGER,
    "trackingType" TEXT,
    "labelQty" INTEGER,
    "rollQty" DOUBLE PRECISION,
    "cutAndSeal" TEXT,
    "labelQuality" TEXT,
    "labelItemId" INTEGER,
    "block" TEXT,
    "orderItemId" INTEGER,
    "totalMeter" INTEGER,
    "blockDate" TIMESTAMP(3),
    "isRepeatedJobCard" BOOLEAN DEFAULT false,
    "refJobCardId" INTEGER,
    "storeId" INTEGER,
    "splitType" TEXT,
    "colorId" INTEGER,
    "plateSupplierId" INTEGER,
    "isHold" BOOLEAN DEFAULT false,
    "isCancelled" BOOLEAN DEFAULT false,
    "lenght" INTEGER,
    "width" INTEGER,
    "meter" INTEGER,
    "isPackingComplted" TEXT,
    "isOldPlate" BOOLEAN DEFAULT false,
    "isNewPlate" BOOLEAN DEFAULT false,

    CONSTRAINT "JobCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BoardQuality" (
    "id" SERIAL NOT NULL,
    "jobCardId" INTEGER,
    "boardId" INTEGER,
    "processId" INTEGER,
    "gsmId" INTEGER,
    "fullBoardId" INTEGER,
    "noOfSheets" INTEGER,

    CONSTRAINT "BoardQuality_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinishingProcess" (
    "id" SERIAL NOT NULL,
    "jobCardId" INTEGER,
    "processId" INTEGER,

    CONSTRAINT "FinishingProcess_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LabelPrintingDetails" (
    "id" SERIAL NOT NULL,
    "jobCardId" INTEGER,
    "processId" INTEGER,

    CONSTRAINT "LabelPrintingDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrintingDetails" (
    "id" SERIAL NOT NULL,
    "jobCardId" INTEGER,
    "processId" INTEGER,
    "isFrontAndBack" BOOLEAN DEFAULT false,
    "isFront" BOOLEAN DEFAULT false,

    CONSTRAINT "PrintingDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlateDetails" (
    "id" SERIAL NOT NULL,
    "jobCardId" INTEGER,
    "plateId" INTEGER,
    "machineId" INTEGER,
    "plateName" TEXT,
    "description" TEXT,
    "qty" INTEGER,

    CONSTRAINT "PlateDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcessDetails" (
    "id" SERIAL NOT NULL,
    "jobCardId" INTEGER,
    "processId" INTEGER,

    CONSTRAINT "ProcessDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LaminationDetails" (
    "id" SERIAL NOT NULL,
    "jobCardId" INTEGER,
    "laminationId" INTEGER,
    "isFrontAndBack" BOOLEAN DEFAULT false,
    "isFront" BOOLEAN DEFAULT false,

    CONSTRAINT "LaminationDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VarnishDetails" (
    "id" SERIAL NOT NULL,
    "jobCardId" INTEGER,
    "varnishId" INTEGER,
    "isFrontAndBack" BOOLEAN DEFAULT false,
    "isFront" BOOLEAN DEFAULT false,

    CONSTRAINT "VarnishDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MachineDetails" (
    "id" SERIAL NOT NULL,
    "jobCardId" INTEGER,
    "machineId" INTEGER,
    "macId" INTEGER,

    CONSTRAINT "MachineDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItems" (
    "id" SERIAL NOT NULL,
    "orderEntryId" INTEGER,
    "styleItemId" INTEGER,
    "orderQty" INTEGER,
    "sizeId" INTEGER,
    "uomId" INTEGER,
    "gsmId" INTEGER,
    "itemGroupId" INTEGER,
    "hsnId" INTEGER,
    "sizeTemplateId" INTEGER,
    "trackingType" TEXT,
    "itemSubGroupId" INTEGER,
    "labelWidth" TEXT,
    "price" DOUBLE PRECISION,
    "amount" DOUBLE PRECISION,
    "dozen" DOUBLE PRECISION,
    "taxPercent" DOUBLE PRECISION,
    "discountType" TEXT,
    "discountValue" DOUBLE PRECISION,

    CONSTRAINT "OrderItems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderStyleBreakup" (
    "id" SERIAL NOT NULL,
    "orderItemId" INTEGER,
    "styleId" INTEGER,

    CONSTRAINT "OrderStyleBreakup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderSizeBreakup" (
    "id" SERIAL NOT NULL,
    "orderStyleBreakupId" INTEGER,
    "sizeId" INTEGER,
    "qty" INTEGER,
    "barcodeFrom" TEXT,
    "barcodeTo" TEXT,

    CONSTRAINT "OrderSizeBreakup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobCardSizeBreakup" (
    "id" SERIAL NOT NULL,
    "jobCardId" INTEGER NOT NULL,
    "sizeId" INTEGER,
    "qty" INTEGER,
    "barcodeFrom" TEXT,
    "barcodeTo" TEXT,

    CONSTRAINT "JobCardSizeBreakup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcessRoute" (
    "id" SERIAL NOT NULL,
    "jobCardId" INTEGER,
    "processId" INTEGER,
    "type" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "isFront" BOOLEAN NOT NULL DEFAULT false,
    "isFrontAndBack" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT,
    "completedQty" INTEGER,
    "actualQty" INTEGER,
    "pendingQty" INTEGER,
    "wastageQty" INTEGER,
    "reworkSetId" TEXT,
    "sendQty" INTEGER,

    CONSTRAINT "ProcessRoute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "productionempPunch" (
    "id" SERIAL NOT NULL,
    "jobCardId" INTEGER,
    "processRouteId" INTEGER,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "startTime" TIME(0),
    "endTime" TIME(0),
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Userid" INTEGER NOT NULL,
    "departmentid" INTEGER NOT NULL,
    "Machineid" INTEGER NOT NULL,

    CONSTRAINT "productionempPunch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "splitSizes" (
    "id" SERIAL NOT NULL,
    "pushLogId" INTEGER NOT NULL,
    "jobCardSizeId" INTEGER,
    "qty" INTEGER,

    CONSTRAINT "splitSizes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "takenmachines" (
    "id" SERIAL NOT NULL,
    "Userid" INTEGER NOT NULL,
    "jobCardId" INTEGER,
    "processRouteId" INTEGER,
    "stDatetime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "edDatetime" TIMESTAMP(3),
    "departmentid" INTEGER NOT NULL,
    "Machineid" INTEGER NOT NULL,
    "isAvailable" BOOLEAN,

    CONSTRAINT "takenmachines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pushLogs" (
    "id" SERIAL NOT NULL,
    "Userid" INTEGER NOT NULL,
    "pauseReason" TEXT,
    "pushtime" TIMESTAMP(3),
    "resumetime" TIMESTAMP(3),
    "productionlog" INTEGER NOT NULL,
    "completedQty" INTEGER DEFAULT 0,
    "wastageQty" INTEGER DEFAULT 0,
    "remarks" TEXT,
    "pauseQty" INTEGER DEFAULT 0,

    CONSTRAINT "pushLogs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProformaInvoice" (
    "id" SERIAL NOT NULL,
    "docId" TEXT NOT NULL,
    "docDate" TIMESTAMP(3),
    "userDate" TIMESTAMP(3),
    "deliveryDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" INTEGER,
    "updatedById" INTEGER,
    "branchId" INTEGER,
    "companyId" INTEGER,
    "customerId" INTEGER,
    "finYearId" INTEGER,
    "remarks" TEXT,
    "termsAndCondition" TEXT,
    "termsId" INTEGER,
    "taxTemplateId" INTEGER,
    "quoteVersion" INTEGER NOT NULL DEFAULT 1,
    "discountType" TEXT,
    "discountValue" DOUBLE PRECISION,
    "payTermId" INTEGER,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "approvalStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "validityTo" TIMESTAMP(3),
    "currencyId" INTEGER,
    "weightInKg" DOUBLE PRECISION,
    "loadingId" INTEGER,
    "deliveryId" INTEGER,
    "carriageCharge" DOUBLE PRECISION,
    "carriageTax" DOUBLE PRECISION,
    "bankId" INTEGER,
    "conversionType" TEXT,

    CONSTRAINT "ProformaInvoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProformaInvoiceItem" (
    "id" SERIAL NOT NULL,
    "proformaInvoiceId" INTEGER NOT NULL,
    "itemGroupId" INTEGER,
    "itemSubGroupId" INTEGER,
    "styleItemId" INTEGER,
    "qty" DOUBLE PRECISION,
    "price" DOUBLE PRECISION,
    "taxPercent" DOUBLE PRECISION,
    "discountType" TEXT,
    "discountValue" DOUBLE PRECISION,
    "amount" DOUBLE PRECISION,
    "sizeId" INTEGER,
    "uomId" INTEGER,
    "gsmId" INTEGER,
    "hsnId" INTEGER,
    "quoteVersion" INTEGER NOT NULL DEFAULT 1,
    "dozen" DOUBLE PRECISION,
    "labelWidth" TEXT,

    CONSTRAINT "ProformaInvoiceItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PIStyleBreakup" (
    "id" SERIAL NOT NULL,
    "ProformaInvoiceItemId" INTEGER NOT NULL,
    "styleId" INTEGER,

    CONSTRAINT "PIStyleBreakup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PISizeBreakup" (
    "id" SERIAL NOT NULL,
    "PIStyleBreakupId" INTEGER,
    "sizeId" INTEGER,
    "qty" INTEGER,

    CONSTRAINT "PISizeBreakup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProformaAttachments" (
    "id" SERIAL NOT NULL,
    "proformaInvoiceId" INTEGER,
    "date" TIMESTAMP(3),
    "name" TEXT,
    "fileName" TEXT,
    "filePath" TEXT,

    CONSTRAINT "ProformaAttachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Currency" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "symbol" TEXT,
    "isBaseCurrency" BOOLEAN NOT NULL DEFAULT false,
    "exchangeRate" DOUBLE PRECISION,
    "companyId" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Currency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bank" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER,
    "name" TEXT,
    "accNo" TEXT,
    "ifsc" TEXT,
    "swiftCode" TEXT,
    "branchId" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "bankHolderName" TEXT,

    CONSTRAINT "Bank_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductionAllocation" (
    "id" SERIAL NOT NULL,
    "docId" TEXT NOT NULL,
    "docDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" INTEGER,
    "updatedById" INTEGER,
    "jobCardId" INTEGER NOT NULL,
    "remarks" TEXT,
    "styleItemId" INTEGER,
    "branchId" INTEGER,
    "priority" TEXT,

    CONSTRAINT "ProductionAllocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductionAllocationDtl" (
    "id" SERIAL NOT NULL,
    "productionAllocationId" INTEGER NOT NULL,
    "isInHouse" BOOLEAN NOT NULL DEFAULT false,
    "isOutSide" BOOLEAN NOT NULL DEFAULT false,
    "processId" INTEGER,
    "type" TEXT,
    "sequence" INTEGER,
    "supplierId" INTEGER,
    "processRouteId" INTEGER,
    "isFront" BOOLEAN NOT NULL DEFAULT false,
    "isFrontAndBack" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ProductionAllocationDtl_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Machine" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "active" BOOLEAN DEFAULT true,
    "companyId" INTEGER,
    "sizeId" INTEGER,
    "departmentId" INTEGER,
    "isDefault" BOOLEAN DEFAULT false,

    CONSTRAINT "Machine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT,
    "userId" INTEGER,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "referenceId" INTEGER,
    "referencePage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductionOutward" (
    "id" SERIAL NOT NULL,
    "docId" TEXT NOT NULL,
    "docDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" INTEGER,
    "updatedById" INTEGER,
    "jobCardId" INTEGER NOT NULL,
    "productionAllocationId" INTEGER,
    "supplierId" INTEGER,
    "remarks" TEXT,
    "branchId" INTEGER,
    "dcNo" TEXT,
    "vehicleNo" TEXT,

    CONSTRAINT "ProductionOutward_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductionOutwardDtl" (
    "id" SERIAL NOT NULL,
    "productionOutwardId" INTEGER NOT NULL,
    "processId" INTEGER,
    "sentQty" DOUBLE PRECISION,
    "sequence" INTEGER,
    "prevProcessId" INTEGER,
    "productionAllocationDtlId" INTEGER,

    CONSTRAINT "ProductionOutwardDtl_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductionInward" (
    "id" SERIAL NOT NULL,
    "docId" TEXT NOT NULL,
    "docDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" INTEGER,
    "updatedById" INTEGER,
    "productionOutwardId" INTEGER,
    "supplierId" INTEGER,
    "remarks" TEXT,
    "branchId" INTEGER,
    "jobCardId" INTEGER,
    "inwardType" TEXT,
    "dcNo" TEXT,
    "dcDate" TIMESTAMP(3),
    "vehicleNo" TEXT,
    "receiptType" TEXT,
    "invNo" TEXT,
    "netBillValue" DOUBLE PRECISION,
    "discountType" TEXT,
    "discountValue" DOUBLE PRECISION,
    "taxTemplateId" INTEGER,

    CONSTRAINT "ProductionInward_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductionInwardDtl" (
    "id" SERIAL NOT NULL,
    "productionInwardId" INTEGER NOT NULL,
    "outwardDetailId" INTEGER,
    "receivedQty" DOUBLE PRECISION,
    "wastageQty" DOUBLE PRECISION,
    "acceptedQty" DOUBLE PRECISION,
    "processId" INTEGER,
    "price" DOUBLE PRECISION,
    "discountType" TEXT,
    "discountValue" DOUBLE PRECISION,
    "taxPercent" DOUBLE PRECISION,
    "jobCardId" INTEGER,
    "productionOutwardId" INTEGER,

    CONSTRAINT "ProductionInwardDtl_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InwardProcessDtl" (
    "id" SERIAL NOT NULL,
    "productionInwardDtlId" INTEGER NOT NULL,
    "processId" INTEGER,

    CONSTRAINT "InwardProcessDtl_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcessBill" (
    "id" SERIAL NOT NULL,
    "docId" TEXT NOT NULL,
    "docDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" INTEGER,
    "updatedById" INTEGER,
    "supplierId" INTEGER,
    "remarks" TEXT,
    "branchId" INTEGER,
    "netBillValue" DOUBLE PRECISION,
    "discountType" TEXT,
    "discountValue" DOUBLE PRECISION,
    "taxTemplateId" INTEGER,

    CONSTRAINT "ProcessBill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcessBillDtl" (
    "id" SERIAL NOT NULL,
    "processBilldId" INTEGER NOT NULL,
    "acceptedQty" DOUBLE PRECISION,
    "billedQty" DOUBLE PRECISION,
    "price" DOUBLE PRECISION,
    "discountType" TEXT,
    "discountValue" DOUBLE PRECISION,
    "taxPercent" DOUBLE PRECISION,
    "jobCardId" INTEGER,
    "productionInwardId" INTEGER,

    CONSTRAINT "ProcessBillDtl_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillingProcess" (
    "id" SERIAL NOT NULL,
    "processBillDtlId" INTEGER NOT NULL,
    "processId" INTEGER,

    CONSTRAINT "BillingProcess_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesDelivery" (
    "id" SERIAL NOT NULL,
    "docId" TEXT NOT NULL,
    "docDate" TIMESTAMP(3),
    "deliveryDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" INTEGER,
    "updatedById" INTEGER,
    "branchId" INTEGER,
    "finYearId" INTEGER,
    "customerId" INTEGER,
    "deliveryTo" INTEGER,
    "orderEntryId" INTEGER,
    "salesOrderId" INTEGER,
    "dcNo" TEXT,
    "vehicleNo" TEXT,
    "deliveryType" TEXT,
    "remarks" TEXT,
    "discountType" TEXT,
    "discountValue" DOUBLE PRECISION,
    "validityTo" TIMESTAMP(3),
    "taxTemplateId" INTEGER,
    "termsAndCondition" TEXT,
    "termsId" INTEGER,
    "payTermId" INTEGER,
    "bankId" INTEGER,
    "conversionType" TEXT,
    "weightInKg" DOUBLE PRECISION,
    "carriageCharge" DOUBLE PRECISION,
    "currencyId" INTEGER,
    "isDeliveryTaxInclusive" BOOLEAN DEFAULT false,
    "deliveryTaxType" TEXT,
    "deliveryTaxValue" DOUBLE PRECISION,
    "loadingId" INTEGER,
    "deliveryId" INTEGER,
    "carriageTax" DOUBLE PRECISION,
    "netAmount" TEXT,
    "dispatchThrough" TEXT,

    CONSTRAINT "SalesDelivery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesDeliveryItems" (
    "id" SERIAL NOT NULL,
    "salesDeliveryId" INTEGER NOT NULL,
    "styleItemId" INTEGER,
    "itemGroupId" INTEGER,
    "itemSubGroupId" INTEGER,
    "qty" DOUBLE PRECISION,
    "price" DOUBLE PRECISION,
    "amount" DOUBLE PRECISION,
    "discountType" TEXT,
    "discountValue" DOUBLE PRECISION,
    "taxPercent" DOUBLE PRECISION,
    "uomId" INTEGER,
    "hsnId" INTEGER,
    "gsmId" INTEGER,
    "trackingType" TEXT,
    "labelWidth" TEXT,
    "dozen" DOUBLE PRECISION,
    "orderQty" TEXT,

    CONSTRAINT "SalesDeliveryItems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesStyleBreakup" (
    "id" SERIAL NOT NULL,
    "salesDeliveryItemId" INTEGER NOT NULL,
    "styleId" INTEGER,

    CONSTRAINT "SalesStyleBreakup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesSizeBreakup" (
    "id" SERIAL NOT NULL,
    "salesStyleBreakupId" INTEGER,
    "salesOrderSizeBreakupId" INTEGER,
    "sizeId" INTEGER,
    "qty" TEXT,
    "deliveryQty" TEXT,

    CONSTRAINT "SalesSizeBreakup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesDeliveryPacking" (
    "id" SERIAL NOT NULL,
    "salesSizeBreakupId" INTEGER NOT NULL,
    "qty" INTEGER,
    "bundle" INTEGER,

    CONSTRAINT "SalesDeliveryPacking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemSubGroup" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "companyId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" INTEGER,
    "updatedById" INTEGER,
    "itemGroupId" INTEGER NOT NULL,

    CONSTRAINT "ItemSubGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesOrder" (
    "id" SERIAL NOT NULL,
    "docId" TEXT NOT NULL,
    "docDate" TIMESTAMP(3),
    "deliveryDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" INTEGER,
    "updatedById" INTEGER,
    "branchId" INTEGER,
    "customerId" INTEGER,
    "deliveryTo" INTEGER,
    "finYearId" INTEGER,
    "remarks" TEXT,
    "orderId" INTEGER,
    "orderType" TEXT,
    "orderQty" INTEGER,
    "termsAndCondition" TEXT,
    "termsId" INTEGER,
    "refNo" TEXT,
    "validDays" INTEGER,
    "validTo" TIMESTAMP(3),
    "taxTemplateId" INTEGER,
    "discountType" TEXT,
    "discountValue" DOUBLE PRECISION,
    "payTermId" INTEGER,
    "deliveryCharge" INTEGER,
    "isDeliveryTaxInclusive" BOOLEAN DEFAULT false,
    "deliveryTaxType" TEXT,
    "deliveryTaxValue" DOUBLE PRECISION,
    "currencyId" INTEGER,
    "weightInKg" DOUBLE PRECISION,
    "loadingId" INTEGER,
    "deliveryId" INTEGER,
    "carriageCharge" DOUBLE PRECISION,
    "carriageTax" DOUBLE PRECISION,
    "bankId" INTEGER,
    "conversionType" TEXT,
    "dispatchThrough" TEXT,

    CONSTRAINT "SalesOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesOrderItems" (
    "id" SERIAL NOT NULL,
    "saleOrderId" INTEGER,
    "styleItemId" INTEGER,
    "orderQty" INTEGER,
    "sizeId" INTEGER,
    "uomId" INTEGER,
    "gsmId" INTEGER,
    "itemGroupId" INTEGER,
    "hsnId" INTEGER,
    "trackingType" TEXT,
    "itemSubGroupId" INTEGER,
    "labelWidth" TEXT,
    "price" DOUBLE PRECISION,
    "amount" DOUBLE PRECISION,
    "dozen" DOUBLE PRECISION,
    "taxPercent" DOUBLE PRECISION,
    "discountType" TEXT,
    "discountValue" DOUBLE PRECISION,

    CONSTRAINT "SalesOrderItems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SaleOrderStyleBreakup" (
    "id" SERIAL NOT NULL,
    "salesItemId" INTEGER NOT NULL,
    "styleId" INTEGER,

    CONSTRAINT "SaleOrderStyleBreakup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SaleOrderSizeBreakup" (
    "id" SERIAL NOT NULL,
    "saleStyleBreakupId" INTEGER NOT NULL,
    "sizeId" INTEGER,
    "qty" INTEGER,

    CONSTRAINT "SaleOrderSizeBreakup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesOrderPacking" (
    "id" SERIAL NOT NULL,
    "saleOrderSizeBreakupId" INTEGER NOT NULL,
    "qty" INTEGER,
    "bundle" INTEGER,

    CONSTRAINT "SalesOrderPacking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Packing" (
    "id" SERIAL NOT NULL,
    "docId" TEXT NOT NULL,
    "docDate" TIMESTAMP(3),
    "deliveryDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" INTEGER,
    "updatedById" INTEGER,
    "branchId" INTEGER,
    "orderId" INTEGER,
    "jobCardId" INTEGER,
    "orderType" TEXT,
    "finYearId" INTEGER,
    "orderQty" INTEGER,
    "remarks" TEXT,
    "refNo" TEXT,
    "validDays" INTEGER,
    "validTo" TIMESTAMP(3),
    "productionQty" TEXT,
    "completedQty" TEXT,
    "pendingQty" TEXT,
    "alreadyPackedQty" TEXT,

    CONSTRAINT "Packing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PackingItems" (
    "id" SERIAL NOT NULL,
    "packingId" INTEGER,
    "styleItemId" INTEGER,
    "orderQty" INTEGER,
    "uomId" INTEGER,
    "gsmId" INTEGER,
    "itemGroupId" INTEGER,
    "hsnId" INTEGER,
    "trackingType" TEXT,
    "itemSubGroupId" INTEGER,
    "labelWidth" TEXT,
    "price" DOUBLE PRECISION,
    "amount" DOUBLE PRECISION,
    "dozen" DOUBLE PRECISION,
    "taxPercent" DOUBLE PRECISION,
    "discountType" TEXT,
    "discountValue" DOUBLE PRECISION,

    CONSTRAINT "PackingItems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PackingStyleBreakup" (
    "id" SERIAL NOT NULL,
    "PackingItemsId" INTEGER NOT NULL,
    "styleId" INTEGER,

    CONSTRAINT "PackingStyleBreakup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PackingSizeBreakup" (
    "id" SERIAL NOT NULL,
    "PackingStyleBreakupId" INTEGER NOT NULL,
    "orderSizeBreakupId" INTEGER,
    "sizeId" INTEGER,
    "qty" INTEGER,
    "packingQty" INTEGER,
    "netWeight" TEXT,
    "grossWeight" TEXT,
    "dimensions" TEXT,

    CONSTRAINT "PackingSizeBreakup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PackingBreakup" (
    "id" SERIAL NOT NULL,
    "PackingSizeBreakupId" INTEGER NOT NULL,
    "packingUomId" INTEGER,
    "qty" TEXT,
    "noOfunits" TEXT,

    CONSTRAINT "PackingBreakup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReworkLog" (
    "id" SERIAL NOT NULL,
    "uniqueId" TEXT NOT NULL,
    "jobCardId" INTEGER,
    "processRouteId" INTEGER,
    "actualQty" INTEGER,
    "completedQty" INTEGER,
    "wastageQty" INTEGER,
    "pendingQty" INTEGER,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Userid" INTEGER,

    CONSTRAINT "ReworkLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReworkBatchTracker" (
    "id" SERIAL NOT NULL,
    "uniqueId" TEXT NOT NULL,
    "jobCardId" INTEGER NOT NULL,
    "processRouteId" INTEGER NOT NULL,
    "userId" INTEGER,
    "isExpired" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReworkBatchTracker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IncomingQty" (
    "id" SERIAL NOT NULL,
    "uniqueId" TEXT NOT NULL,
    "jobCardId" INTEGER NOT NULL,
    "processRouteId" INTEGER NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "qty" INTEGER NOT NULL,
    "pendingQty" INTEGER,
    "completedQty" INTEGER,
    "wastageQty" INTEGER,
    "sendRoute" INTEGER NOT NULL,
    "outwardId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IncomingQty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PackingControlPanel" (
    "id" SERIAL NOT NULL,
    "packingPercentage" TEXT,
    "deliveryPercentage" TEXT,
    "branchId" INTEGER,

    CONSTRAINT "PackingControlPanel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesBillEntry" (
    "id" SERIAL NOT NULL,
    "docId" TEXT NOT NULL,
    "docDate" TIMESTAMP(3),
    "deliveryDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" INTEGER,
    "updatedById" INTEGER,
    "branchId" INTEGER,
    "customerId" INTEGER,
    "deliveryTo" INTEGER,
    "orderId" INTEGER,
    "salesDeliveryId" INTEGER,
    "orderType" TEXT,
    "orderQty" INTEGER,
    "remarks" TEXT,
    "termsAndCondition" TEXT,
    "refNo" TEXT,
    "validDays" INTEGER,
    "validTo" TIMESTAMP(3),
    "taxTemplateId" INTEGER,
    "discountType" TEXT,
    "discountValue" DOUBLE PRECISION,
    "conversionType" TEXT,
    "payTermId" INTEGER,
    "currencyId" INTEGER,
    "deliveryCharge" INTEGER,
    "isDeliveryTaxInclusive" BOOLEAN DEFAULT false,
    "deliveryTaxType" TEXT,
    "deliveryTaxValue" DOUBLE PRECISION,
    "weightInKg" DOUBLE PRECISION,
    "loadingId" INTEGER,
    "deliveryId" INTEGER,
    "carriageCharge" DOUBLE PRECISION,
    "carriageTax" DOUBLE PRECISION,
    "bankId" INTEGER,
    "netAmount" TEXT,

    CONSTRAINT "SalesBillEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesBillEntryItems" (
    "id" SERIAL NOT NULL,
    "salesBillEntryId" INTEGER,
    "styleItemId" INTEGER,
    "orderQty" INTEGER,
    "sizeId" INTEGER,
    "uomId" INTEGER,
    "gsmId" INTEGER,
    "itemGroupId" INTEGER,
    "hsnId" INTEGER,
    "trackingType" TEXT,
    "itemSubGroupId" INTEGER,
    "labelWidth" TEXT,
    "price" DOUBLE PRECISION,
    "amount" DOUBLE PRECISION,
    "dozen" DOUBLE PRECISION,
    "taxPercent" DOUBLE PRECISION,
    "discountType" TEXT,
    "discountValue" DOUBLE PRECISION,
    "deliveryQty" INTEGER,

    CONSTRAINT "SalesBillEntryItems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SaleBillEntryStyleBreakup" (
    "id" SERIAL NOT NULL,
    "salesBillEntryItemsId" INTEGER NOT NULL,
    "styleId" INTEGER,

    CONSTRAINT "SaleBillEntryStyleBreakup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SaleBillEntrySizeBreakup" (
    "id" SERIAL NOT NULL,
    "saleBillEntryStyleBreakupId" INTEGER NOT NULL,
    "sizeId" INTEGER,
    "billQty" INTEGER,
    "deliveryQty" INTEGER,
    "SalesSizeBreakupId" INTEGER,

    CONSTRAINT "SaleBillEntrySizeBreakup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MobileNotification" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER,
    "roleId" INTEGER,
    "createdAt" TIMESTAMP(3),
    "isViewed" BOOLEAN,
    "machineId" INTEGER,

    CONSTRAINT "MobileNotification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ApprovalRuleFieldToApprovalRuleOperator" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ApprovalRuleFieldToApprovalRuleOperator_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_SalesOrderToattachments" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_SalesOrderToattachments_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Company_companyId_key" ON "Company"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "Role_companyId_name_key" ON "Role"("companyId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "RoleOnPage_roleId_pageId_key" ON "RoleOnPage"("roleId", "pageId");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_regNo_key" ON "Employee"("regNo");

-- CreateIndex
CREATE UNIQUE INDEX "ProductBrand_name_key" ON "ProductBrand"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ProductCategory_name_key" ON "ProductCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Uom_name_key" ON "Uom"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Product_name_key" ON "Product"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Stock_poBillItemsId_key" ON "Stock"("poBillItemsId");

-- CreateIndex
CREATE UNIQUE INDEX "Stock_salesBillItemsId_key" ON "Stock"("salesBillItemsId");

-- CreateIndex
CREATE UNIQUE INDEX "Stock_poReturnItemsId_key" ON "Stock"("poReturnItemsId");

-- CreateIndex
CREATE UNIQUE INDEX "Stock_salesReturnItemsId_key" ON "Stock"("salesReturnItemsId");

-- CreateIndex
CREATE UNIQUE INDEX "Stock_OpeningStockItemsId_key" ON "Stock"("OpeningStockItemsId");

-- CreateIndex
CREATE UNIQUE INDEX "Ledger_deliveryInvoiceId_key" ON "Ledger"("deliveryInvoiceId");

-- CreateIndex
CREATE UNIQUE INDEX "ApprovalRuleModule_name_key" ON "ApprovalRuleModule"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ApprovalRuleOperator_operator_key" ON "ApprovalRuleOperator"("operator");

-- CreateIndex
CREATE UNIQUE INDEX "ApprovalLevel_approvalConfigId_levelNo_key" ON "ApprovalLevel"("approvalConfigId", "levelNo");

-- CreateIndex
CREATE UNIQUE INDEX "ApprovalLevelUser_approvalLevelId_userId_key" ON "ApprovalLevelUser"("approvalLevelId", "userId");

-- CreateIndex
CREATE INDEX "ApprovalLog_referenceId_referencePage_idx" ON "ApprovalLog"("referenceId", "referencePage");

-- CreateIndex
CREATE UNIQUE INDEX "ProformaInvoice_docId_key" ON "ProformaInvoice"("docId");

-- CreateIndex
CREATE UNIQUE INDEX "ReworkBatchTracker_uniqueId_key" ON "ReworkBatchTracker"("uniqueId");

-- CreateIndex
CREATE UNIQUE INDEX "IncomingQty_uniqueId_key" ON "IncomingQty"("uniqueId");

-- CreateIndex
CREATE INDEX "_ApprovalRuleFieldToApprovalRuleOperator_B_index" ON "_ApprovalRuleFieldToApprovalRuleOperator"("B");

-- CreateIndex
CREATE INDEX "_SalesOrderToattachments_B_index" ON "_SalesOrderToattachments"("B");

-- AddForeignKey
ALTER TABLE "Page" ADD CONSTRAINT "Page_pageGroupId_fkey" FOREIGN KEY ("pageGroupId") REFERENCES "PageGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Branch" ADD CONSTRAINT "Branch_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserOnBranch" ADD CONSTRAINT "UserOnBranch_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserOnBranch" ADD CONSTRAINT "UserOnBranch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Role" ADD CONSTRAINT "Role_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoleOnPage" ADD CONSTRAINT "RoleOnPage_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoleOnPage" ADD CONSTRAINT "RoleOnPage_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_localCityId_fkey" FOREIGN KEY ("localCityId") REFERENCES "City"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_permCityId_fkey" FOREIGN KEY ("permCityId") REFERENCES "City"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_employeeCategoryId_fkey" FOREIGN KEY ("employeeCategoryId") REFERENCES "EmployeeCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinYear" ADD CONSTRAINT "FinYear_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeCategory" ADD CONSTRAINT "EmployeeCategory_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Country" ADD CONSTRAINT "Country_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "State" ADD CONSTRAINT "State_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "City" ADD CONSTRAINT "City_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "State"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Department" ADD CONSTRAINT "Department_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartyCategory" ADD CONSTRAINT "PartyCategory_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Party" ADD CONSTRAINT "Party_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Party" ADD CONSTRAINT "Party_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Party" ADD CONSTRAINT "Party_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Party" ADD CONSTRAINT "Party_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Party" ADD CONSTRAINT "Party_branchTypeId_fkey" FOREIGN KEY ("branchTypeId") REFERENCES "BranchType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartyBranch" ADD CONSTRAINT "PartyBranch_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "Party"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartyBranch" ADD CONSTRAINT "PartyBranch_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartyBranch" ADD CONSTRAINT "PartyBranch_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartyBranch" ADD CONSTRAINT "PartyBranch_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartyBranch" ADD CONSTRAINT "PartyBranch_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "Party"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_purchaseInwardId_fkey" FOREIGN KEY ("purchaseInwardId") REFERENCES "PurchaseInward"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_orderEntryId_fkey" FOREIGN KEY ("orderEntryId") REFERENCES "OrderEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Branchattachments" ADD CONSTRAINT "Branchattachments_partyBranchId_fkey" FOREIGN KEY ("partyBranchId") REFERENCES "PartyBranch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductBrand" ADD CONSTRAINT "ProductBrand_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductCategory" ADD CONSTRAINT "ProductCategory_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Uom" ADD CONSTRAINT "Uom_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductUomPriceDetails" ADD CONSTRAINT "ProductUomPriceDetails_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductUomPriceDetails" ADD CONSTRAINT "ProductUomPriceDetails_uomId_fkey" FOREIGN KEY ("uomId") REFERENCES "Uom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductUomPriceDetails" ADD CONSTRAINT "ProductUomPriceDetails_poBillItemsId_fkey" FOREIGN KEY ("poBillItemsId") REFERENCES "PoBillItems"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_productBrandId_fkey" FOREIGN KEY ("productBrandId") REFERENCES "ProductBrand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_productCategoryId_fkey" FOREIGN KEY ("productCategoryId") REFERENCES "ProductCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_uomId_fkey" FOREIGN KEY ("uomId") REFERENCES "Uom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseBill" ADD CONSTRAINT "PurchaseBill_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Party"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseBill" ADD CONSTRAINT "PurchaseBill_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseBill" ADD CONSTRAINT "PurchaseBill_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoBillItems" ADD CONSTRAINT "PoBillItems_purchaseBillId_fkey" FOREIGN KEY ("purchaseBillId") REFERENCES "PurchaseBill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoBillItems" ADD CONSTRAINT "PoBillItems_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoBillItems" ADD CONSTRAINT "PoBillItems_productBrandId_fkey" FOREIGN KEY ("productBrandId") REFERENCES "ProductBrand"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoBillItems" ADD CONSTRAINT "PoBillItems_productCategoryId_fkey" FOREIGN KEY ("productCategoryId") REFERENCES "ProductCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseReturn" ADD CONSTRAINT "PurchaseReturn_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Party"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseReturn" ADD CONSTRAINT "PurchaseReturn_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseReturn" ADD CONSTRAINT "PurchaseReturn_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseReturn" ADD CONSTRAINT "PurchaseReturn_purchaseBillId_fkey" FOREIGN KEY ("purchaseBillId") REFERENCES "PurchaseBill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoReturnItems" ADD CONSTRAINT "PoReturnItems_purchaseReturnId_fkey" FOREIGN KEY ("purchaseReturnId") REFERENCES "PurchaseReturn"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoReturnItems" ADD CONSTRAINT "PoReturnItems_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoReturnItems" ADD CONSTRAINT "PoReturnItems_purchaseBillItemsId_fkey" FOREIGN KEY ("purchaseBillItemsId") REFERENCES "PoBillItems"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoReturnItems" ADD CONSTRAINT "PoReturnItems_uomId_fkey" FOREIGN KEY ("uomId") REFERENCES "Uom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_poBillItemsId_fkey" FOREIGN KEY ("poBillItemsId") REFERENCES "PoBillItems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_salesBillItemsId_fkey" FOREIGN KEY ("salesBillItemsId") REFERENCES "SalesBillItems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_poReturnItemsId_fkey" FOREIGN KEY ("poReturnItemsId") REFERENCES "PoReturnItems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_salesReturnItemsId_fkey" FOREIGN KEY ("salesReturnItemsId") REFERENCES "SalesReturnItems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_OpeningStockItemsId_fkey" FOREIGN KEY ("OpeningStockItemsId") REFERENCES "OpeningStockItems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_inwardItemsId_fkey" FOREIGN KEY ("inwardItemsId") REFERENCES "InwardItems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_uomId_fkey" FOREIGN KEY ("uomId") REFERENCES "Uom"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_styleItemId_fkey" FOREIGN KEY ("styleItemId") REFERENCES "StyleItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_hsnId_fkey" FOREIGN KEY ("hsnId") REFERENCES "Hsn"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_purchaseReturnItemsId_fkey" FOREIGN KEY ("purchaseReturnItemsId") REFERENCES "PurchaseReturnItems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_itemGroupId_fkey" FOREIGN KEY ("itemGroupId") REFERENCES "ItemGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_sizeId_fkey" FOREIGN KEY ("sizeId") REFERENCES "Size"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_colorId_fkey" FOREIGN KEY ("colorId") REFERENCES "Color"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_gsmId_fkey" FOREIGN KEY ("gsmId") REFERENCES "Gsm"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_jobCardId_fkey" FOREIGN KEY ("jobCardId") REFERENCES "JobCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_styleId_fkey" FOREIGN KEY ("styleId") REFERENCES "Style"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "OrderEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_packingId_fkey" FOREIGN KEY ("packingId") REFERENCES "Packing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_salesDeliveryId_fkey" FOREIGN KEY ("salesDeliveryId") REFERENCES "SalesDelivery"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_salesReturnId_fkey" FOREIGN KEY ("salesReturnId") REFERENCES "SalesReturn"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesBill" ADD CONSTRAINT "SalesBill_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Party"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesBill" ADD CONSTRAINT "SalesBill_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesBill" ADD CONSTRAINT "SalesBill_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesBillItems" ADD CONSTRAINT "SalesBillItems_salesBillId_fkey" FOREIGN KEY ("salesBillId") REFERENCES "SalesBill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesBillItems" ADD CONSTRAINT "SalesBillItems_productBrandId_fkey" FOREIGN KEY ("productBrandId") REFERENCES "ProductBrand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesBillItems" ADD CONSTRAINT "SalesBillItems_productCategoryId_fkey" FOREIGN KEY ("productCategoryId") REFERENCES "ProductCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesBillItems" ADD CONSTRAINT "SalesBillItems_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesBillItems" ADD CONSTRAINT "SalesBillItems_uomId_fkey" FOREIGN KEY ("uomId") REFERENCES "Uom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesReturn" ADD CONSTRAINT "SalesReturn_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesReturn" ADD CONSTRAINT "SalesReturn_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesReturn" ADD CONSTRAINT "SalesReturn_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesReturn" ADD CONSTRAINT "SalesReturn_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Party"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesReturn" ADD CONSTRAINT "SalesReturn_salesDeliveryId_fkey" FOREIGN KEY ("salesDeliveryId") REFERENCES "SalesDelivery"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesReturn" ADD CONSTRAINT "SalesReturn_taxTemplateId_fkey" FOREIGN KEY ("taxTemplateId") REFERENCES "TaxTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesReturn" ADD CONSTRAINT "SalesReturn_termsId_fkey" FOREIGN KEY ("termsId") REFERENCES "TermsAndConditions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesReturn" ADD CONSTRAINT "SalesReturn_payTermId_fkey" FOREIGN KEY ("payTermId") REFERENCES "PayTerm"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesReturn" ADD CONSTRAINT "SalesReturn_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "Currency"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesReturn" ADD CONSTRAINT "SalesReturn_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesReturnItems" ADD CONSTRAINT "SalesReturnItems_salesReturnId_fkey" FOREIGN KEY ("salesReturnId") REFERENCES "SalesReturn"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesReturnItems" ADD CONSTRAINT "SalesReturnItems_styleItemId_fkey" FOREIGN KEY ("styleItemId") REFERENCES "StyleItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesReturnItems" ADD CONSTRAINT "SalesReturnItems_itemGroupId_fkey" FOREIGN KEY ("itemGroupId") REFERENCES "ItemGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesReturnItems" ADD CONSTRAINT "SalesReturnItems_itemSubGroupId_fkey" FOREIGN KEY ("itemSubGroupId") REFERENCES "ItemSubGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesReturnItems" ADD CONSTRAINT "SalesReturnItems_uomId_fkey" FOREIGN KEY ("uomId") REFERENCES "Uom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesReturnItems" ADD CONSTRAINT "SalesReturnItems_gsmId_fkey" FOREIGN KEY ("gsmId") REFERENCES "Gsm"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesReturnItems" ADD CONSTRAINT "SalesReturnItems_hsnId_fkey" FOREIGN KEY ("hsnId") REFERENCES "Hsn"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesReturnStyleBreakup" ADD CONSTRAINT "SalesReturnStyleBreakup_salesReturnItemsId_fkey" FOREIGN KEY ("salesReturnItemsId") REFERENCES "SalesReturnItems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesReturnStyleBreakup" ADD CONSTRAINT "SalesReturnStyleBreakup_styleId_fkey" FOREIGN KEY ("styleId") REFERENCES "Style"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesReturnSizeBreakup" ADD CONSTRAINT "SalesReturnSizeBreakup_salesReturnStyleBreakupId_fkey" FOREIGN KEY ("salesReturnStyleBreakupId") REFERENCES "SalesReturnStyleBreakup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesReturnSizeBreakup" ADD CONSTRAINT "SalesReturnSizeBreakup_sizeId_fkey" FOREIGN KEY ("sizeId") REFERENCES "Size"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesReturnSizeBreakup" ADD CONSTRAINT "SalesReturnSizeBreakup_salesSizeBreakupId_fkey" FOREIGN KEY ("salesSizeBreakupId") REFERENCES "SalesSizeBreakup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpeningStock" ADD CONSTRAINT "OpeningStock_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpeningStock" ADD CONSTRAINT "OpeningStock_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpeningStockItems" ADD CONSTRAINT "OpeningStockItems_OpeningStockId_fkey" FOREIGN KEY ("OpeningStockId") REFERENCES "OpeningStock"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpeningStockItems" ADD CONSTRAINT "OpeningStockItems_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "Party"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Style" ADD CONSTRAINT "Style_sizeTemplateId_fkey" FOREIGN KEY ("sizeTemplateId") REFERENCES "SizeTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Style" ADD CONSTRAINT "Style_itemGroupId_fkey" FOREIGN KEY ("itemGroupId") REFERENCES "ItemGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Style" ADD CONSTRAINT "Style_uomId_fkey" FOREIGN KEY ("uomId") REFERENCES "Uom"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Style" ADD CONSTRAINT "Style_gsmId_fkey" FOREIGN KEY ("gsmId") REFERENCES "Gsm"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StyleItem" ADD CONSTRAINT "StyleItem_sizeTemplateId_fkey" FOREIGN KEY ("sizeTemplateId") REFERENCES "SizeTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StyleItem" ADD CONSTRAINT "StyleItem_itemGroupId_fkey" FOREIGN KEY ("itemGroupId") REFERENCES "ItemGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StyleItem" ADD CONSTRAINT "StyleItem_itemSubGroupId_fkey" FOREIGN KEY ("itemSubGroupId") REFERENCES "ItemSubGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StyleItem" ADD CONSTRAINT "StyleItem_uomId_fkey" FOREIGN KEY ("uomId") REFERENCES "Uom"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StyleItem" ADD CONSTRAINT "StyleItem_gsmId_fkey" FOREIGN KEY ("gsmId") REFERENCES "Gsm"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StyleItem" ADD CONSTRAINT "StyleItem_hsnId_fkey" FOREIGN KEY ("hsnId") REFERENCES "Hsn"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryChallan" ADD CONSTRAINT "DeliveryChallan_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Party"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryChallan" ADD CONSTRAINT "DeliveryChallan_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryChallan" ADD CONSTRAINT "DeliveryChallan_deliveryPartyId_fkey" FOREIGN KEY ("deliveryPartyId") REFERENCES "Party"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryChallan" ADD CONSTRAINT "DeliveryChallan_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryChallan" ADD CONSTRAINT "DeliveryChallan_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryChallan" ADD CONSTRAINT "DeliveryChallan_finYearId_fkey" FOREIGN KEY ("finYearId") REFERENCES "FinYear"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryChallanItems" ADD CONSTRAINT "DeliveryChallanItems_deliveryChallanId_fkey" FOREIGN KEY ("deliveryChallanId") REFERENCES "DeliveryChallan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryChallanItems" ADD CONSTRAINT "DeliveryChallanItems_styleId_fkey" FOREIGN KEY ("styleId") REFERENCES "Style"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryChallanItems" ADD CONSTRAINT "DeliveryChallanItems_styleItemId_fkey" FOREIGN KEY ("styleItemId") REFERENCES "StyleItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryChallanItems" ADD CONSTRAINT "DeliveryChallanItems_uomId_fkey" FOREIGN KEY ("uomId") REFERENCES "Uom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryChallanItems" ADD CONSTRAINT "DeliveryChallanItems_colorId_fkey" FOREIGN KEY ("colorId") REFERENCES "Color"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryChallanItems" ADD CONSTRAINT "DeliveryChallanItems_hsnId_fkey" FOREIGN KEY ("hsnId") REFERENCES "Hsn"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryInvoice" ADD CONSTRAINT "DeliveryInvoice_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Party"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryInvoice" ADD CONSTRAINT "DeliveryInvoice_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryInvoice" ADD CONSTRAINT "DeliveryInvoice_finYearId_fkey" FOREIGN KEY ("finYearId") REFERENCES "FinYear"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryInvoice" ADD CONSTRAINT "DeliveryInvoice_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryInvoice" ADD CONSTRAINT "DeliveryInvoice_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryInvoiceItems" ADD CONSTRAINT "DeliveryInvoiceItems_deliveryInvoiceId_fkey" FOREIGN KEY ("deliveryInvoiceId") REFERENCES "DeliveryInvoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryInvoiceItems" ADD CONSTRAINT "DeliveryInvoiceItems_styleId_fkey" FOREIGN KEY ("styleId") REFERENCES "Style"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryInvoiceItems" ADD CONSTRAINT "DeliveryInvoiceItems_styleItemId_fkey" FOREIGN KEY ("styleItemId") REFERENCES "StyleItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryInvoiceItems" ADD CONSTRAINT "DeliveryInvoiceItems_uomId_fkey" FOREIGN KEY ("uomId") REFERENCES "Uom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryInvoiceItems" ADD CONSTRAINT "DeliveryInvoiceItems_colorId_fkey" FOREIGN KEY ("colorId") REFERENCES "Color"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryInvoiceItems" ADD CONSTRAINT "DeliveryInvoiceItems_deliveryChallanItemsId_fkey" FOREIGN KEY ("deliveryChallanItemsId") REFERENCES "DeliveryChallanItems"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryInvoiceItems" ADD CONSTRAINT "DeliveryInvoiceItems_deliveryChallanId_fkey" FOREIGN KEY ("deliveryChallanId") REFERENCES "DeliveryChallan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryInvoiceItems" ADD CONSTRAINT "DeliveryInvoiceItems_hsnId_fkey" FOREIGN KEY ("hsnId") REFERENCES "Hsn"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ledger" ADD CONSTRAINT "Ledger_deliveryInvoiceId_fkey" FOREIGN KEY ("deliveryInvoiceId") REFERENCES "DeliveryInvoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ledger" ADD CONSTRAINT "Ledger_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "Party"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ledger" ADD CONSTRAINT "Ledger_salesDeliveryId_fkey" FOREIGN KEY ("salesDeliveryId") REFERENCES "SalesDelivery"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ledger" ADD CONSTRAINT "Ledger_salesReturnId_fkey" FOREIGN KEY ("salesReturnId") REFERENCES "SalesReturn"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ledger" ADD CONSTRAINT "Ledger_salesBillEntryId_fkey" FOREIGN KEY ("salesBillEntryId") REFERENCES "SalesBillEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ledger" ADD CONSTRAINT "Ledger_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "Currency"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ledger" ADD CONSTRAINT "Ledger_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxTerm" ADD CONSTRAINT "TaxTerm_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxTemplate" ADD CONSTRAINT "TaxTemplate_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxTemplateDetails" ADD CONSTRAINT "TaxTemplateDetails_taxTemplateId_fkey" FOREIGN KEY ("taxTemplateId") REFERENCES "TaxTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxTemplateDetails" ADD CONSTRAINT "TaxTemplateDetails_taxTermId_fkey" FOREIGN KEY ("taxTermId") REFERENCES "TaxTerm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpeningBalance" ADD CONSTRAINT "OpeningBalance_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpeningBalance" ADD CONSTRAINT "OpeningBalance_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpeningBalance" ADD CONSTRAINT "OpeningBalance_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpeningBalance" ADD CONSTRAINT "OpeningBalance_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpeningBalance" ADD CONSTRAINT "OpeningBalance_finYearId_fkey" FOREIGN KEY ("finYearId") REFERENCES "FinYear"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpeningBalance" ADD CONSTRAINT "OpeningBalance_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "Party"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Po" ADD CONSTRAINT "Po_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Po" ADD CONSTRAINT "Po_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Po" ADD CONSTRAINT "Po_finYearId_fkey" FOREIGN KEY ("finYearId") REFERENCES "FinYear"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Po" ADD CONSTRAINT "Po_orderEntryId_fkey" FOREIGN KEY ("orderEntryId") REFERENCES "OrderEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Po" ADD CONSTRAINT "Po_taxTemplateId_fkey" FOREIGN KEY ("taxTemplateId") REFERENCES "TaxTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Po" ADD CONSTRAINT "Po_deliveryToId_fkey" FOREIGN KEY ("deliveryToId") REFERENCES "Party"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Po" ADD CONSTRAINT "Po_deliveryBranchId_fkey" FOREIGN KEY ("deliveryBranchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Po" ADD CONSTRAINT "Po_termsId_fkey" FOREIGN KEY ("termsId") REFERENCES "TermsAndConditions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Po" ADD CONSTRAINT "Po_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Po" ADD CONSTRAINT "Po_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Party"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Po" ADD CONSTRAINT "Po_payTermId_fkey" FOREIGN KEY ("payTermId") REFERENCES "PayTerm"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuoteVersion" ADD CONSTRAINT "QuoteVersion_poId_fkey" FOREIGN KEY ("poId") REFERENCES "Po"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoItems" ADD CONSTRAINT "PoItems_poId_fkey" FOREIGN KEY ("poId") REFERENCES "Po"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoItems" ADD CONSTRAINT "PoItems_uomId_fkey" FOREIGN KEY ("uomId") REFERENCES "Uom"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoItems" ADD CONSTRAINT "PoItems_styleItemId_fkey" FOREIGN KEY ("styleItemId") REFERENCES "StyleItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoItems" ADD CONSTRAINT "PoItems_hsnId_fkey" FOREIGN KEY ("hsnId") REFERENCES "Hsn"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoItems" ADD CONSTRAINT "PoItems_itemGroupId_fkey" FOREIGN KEY ("itemGroupId") REFERENCES "ItemGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoItems" ADD CONSTRAINT "PoItems_sizeId_fkey" FOREIGN KEY ("sizeId") REFERENCES "Size"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoItems" ADD CONSTRAINT "PoItems_colorId_fkey" FOREIGN KEY ("colorId") REFERENCES "Color"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoItems" ADD CONSTRAINT "PoItems_gsmId_fkey" FOREIGN KEY ("gsmId") REFERENCES "Gsm"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TermsAndConditions" ADD CONSTRAINT "TermsAndConditions_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayTerm" ADD CONSTRAINT "PayTerm_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseInward" ADD CONSTRAINT "PurchaseInward_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseInward" ADD CONSTRAINT "PurchaseInward_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseInward" ADD CONSTRAINT "PurchaseInward_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseInward" ADD CONSTRAINT "PurchaseInward_finYearId_fkey" FOREIGN KEY ("finYearId") REFERENCES "FinYear"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseInward" ADD CONSTRAINT "PurchaseInward_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Party"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseInward" ADD CONSTRAINT "PurchaseInward_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseInward" ADD CONSTRAINT "PurchaseInward_taxTemplateId_fkey" FOREIGN KEY ("taxTemplateId") REFERENCES "TaxTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InwardItems" ADD CONSTRAINT "InwardItems_purchaseInwardId_fkey" FOREIGN KEY ("purchaseInwardId") REFERENCES "PurchaseInward"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InwardItems" ADD CONSTRAINT "InwardItems_uomId_fkey" FOREIGN KEY ("uomId") REFERENCES "Uom"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InwardItems" ADD CONSTRAINT "InwardItems_styleItemId_fkey" FOREIGN KEY ("styleItemId") REFERENCES "StyleItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InwardItems" ADD CONSTRAINT "InwardItems_hsnId_fkey" FOREIGN KEY ("hsnId") REFERENCES "Hsn"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InwardItems" ADD CONSTRAINT "InwardItems_poId_fkey" FOREIGN KEY ("poId") REFERENCES "Po"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InwardItems" ADD CONSTRAINT "InwardItems_itemGroupId_fkey" FOREIGN KEY ("itemGroupId") REFERENCES "ItemGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InwardItems" ADD CONSTRAINT "InwardItems_sizeId_fkey" FOREIGN KEY ("sizeId") REFERENCES "Size"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InwardItems" ADD CONSTRAINT "InwardItems_colorId_fkey" FOREIGN KEY ("colorId") REFERENCES "Color"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InwardItems" ADD CONSTRAINT "InwardItems_gsmId_fkey" FOREIGN KEY ("gsmId") REFERENCES "Gsm"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InwardItems" ADD CONSTRAINT "InwardItems_orderEntryId_fkey" FOREIGN KEY ("orderEntryId") REFERENCES "OrderEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseInwardReturn" ADD CONSTRAINT "PurchaseInwardReturn_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseInwardReturn" ADD CONSTRAINT "PurchaseInwardReturn_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseInwardReturn" ADD CONSTRAINT "PurchaseInwardReturn_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseInwardReturn" ADD CONSTRAINT "PurchaseInwardReturn_finYearId_fkey" FOREIGN KEY ("finYearId") REFERENCES "FinYear"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseInwardReturn" ADD CONSTRAINT "PurchaseInwardReturn_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Party"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseInwardReturn" ADD CONSTRAINT "PurchaseInwardReturn_termsId_fkey" FOREIGN KEY ("termsId") REFERENCES "TermsAndConditions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseInwardReturn" ADD CONSTRAINT "PurchaseInwardReturn_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseReturnItems" ADD CONSTRAINT "PurchaseReturnItems_purchaseInwardReturnId_fkey" FOREIGN KEY ("purchaseInwardReturnId") REFERENCES "PurchaseInwardReturn"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseReturnItems" ADD CONSTRAINT "PurchaseReturnItems_uomId_fkey" FOREIGN KEY ("uomId") REFERENCES "Uom"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseReturnItems" ADD CONSTRAINT "PurchaseReturnItems_styleItemId_fkey" FOREIGN KEY ("styleItemId") REFERENCES "StyleItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseReturnItems" ADD CONSTRAINT "PurchaseReturnItems_hsnId_fkey" FOREIGN KEY ("hsnId") REFERENCES "Hsn"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseReturnItems" ADD CONSTRAINT "PurchaseReturnItems_purchaseInwardId_fkey" FOREIGN KEY ("purchaseInwardId") REFERENCES "PurchaseInward"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseReturnItems" ADD CONSTRAINT "PurchaseReturnItems_itemGroupId_fkey" FOREIGN KEY ("itemGroupId") REFERENCES "ItemGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseReturnItems" ADD CONSTRAINT "PurchaseReturnItems_sizeId_fkey" FOREIGN KEY ("sizeId") REFERENCES "Size"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseReturnItems" ADD CONSTRAINT "PurchaseReturnItems_colorId_fkey" FOREIGN KEY ("colorId") REFERENCES "Color"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseReturnItems" ADD CONSTRAINT "PurchaseReturnItems_gsmId_fkey" FOREIGN KEY ("gsmId") REFERENCES "Gsm"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseReturnItems" ADD CONSTRAINT "PurchaseReturnItems_poId_fkey" FOREIGN KEY ("poId") REFERENCES "Po"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseCancel" ADD CONSTRAINT "PurchaseCancel_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseCancel" ADD CONSTRAINT "PurchaseCancel_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseCancel" ADD CONSTRAINT "PurchaseCancel_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseCancel" ADD CONSTRAINT "PurchaseCancel_finYearId_fkey" FOREIGN KEY ("finYearId") REFERENCES "FinYear"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseCancel" ADD CONSTRAINT "PurchaseCancel_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Party"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseCancel" ADD CONSTRAINT "PurchaseCancel_termsId_fkey" FOREIGN KEY ("termsId") REFERENCES "TermsAndConditions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseCancel" ADD CONSTRAINT "PurchaseCancel_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseCancelItems" ADD CONSTRAINT "PurchaseCancelItems_purchaseCancelId_fkey" FOREIGN KEY ("purchaseCancelId") REFERENCES "PurchaseCancel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseCancelItems" ADD CONSTRAINT "PurchaseCancelItems_uomId_fkey" FOREIGN KEY ("uomId") REFERENCES "Uom"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseCancelItems" ADD CONSTRAINT "PurchaseCancelItems_styleItemId_fkey" FOREIGN KEY ("styleItemId") REFERENCES "StyleItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseCancelItems" ADD CONSTRAINT "PurchaseCancelItems_hsnId_fkey" FOREIGN KEY ("hsnId") REFERENCES "Hsn"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseCancelItems" ADD CONSTRAINT "PurchaseCancelItems_poId_fkey" FOREIGN KEY ("poId") REFERENCES "Po"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseCancelItems" ADD CONSTRAINT "PurchaseCancelItems_itemGroupId_fkey" FOREIGN KEY ("itemGroupId") REFERENCES "ItemGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseCancelItems" ADD CONSTRAINT "PurchaseCancelItems_sizeId_fkey" FOREIGN KEY ("sizeId") REFERENCES "Size"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseCancelItems" ADD CONSTRAINT "PurchaseCancelItems_colorId_fkey" FOREIGN KEY ("colorId") REFERENCES "Color"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseCancelItems" ADD CONSTRAINT "PurchaseCancelItems_gsmId_fkey" FOREIGN KEY ("gsmId") REFERENCES "Gsm"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseBillEntry" ADD CONSTRAINT "PurchaseBillEntry_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseBillEntry" ADD CONSTRAINT "PurchaseBillEntry_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseBillEntry" ADD CONSTRAINT "PurchaseBillEntry_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseBillEntry" ADD CONSTRAINT "PurchaseBillEntry_finYearId_fkey" FOREIGN KEY ("finYearId") REFERENCES "FinYear"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseBillEntry" ADD CONSTRAINT "PurchaseBillEntry_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Party"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseBillEntry" ADD CONSTRAINT "PurchaseBillEntry_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseBillEntry" ADD CONSTRAINT "PurchaseBillEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseBillEntry" ADD CONSTRAINT "PurchaseBillEntry_taxTemplateId_fkey" FOREIGN KEY ("taxTemplateId") REFERENCES "TaxTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseBillEntryItems" ADD CONSTRAINT "PurchaseBillEntryItems_purchaseBillEntryId_fkey" FOREIGN KEY ("purchaseBillEntryId") REFERENCES "PurchaseBillEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseBillEntryItems" ADD CONSTRAINT "PurchaseBillEntryItems_purchaseInwardId_fkey" FOREIGN KEY ("purchaseInwardId") REFERENCES "PurchaseInward"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseBillEntryItems" ADD CONSTRAINT "PurchaseBillEntryItems_uomId_fkey" FOREIGN KEY ("uomId") REFERENCES "Uom"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseBillEntryItems" ADD CONSTRAINT "PurchaseBillEntryItems_styleItemId_fkey" FOREIGN KEY ("styleItemId") REFERENCES "StyleItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseBillEntryItems" ADD CONSTRAINT "PurchaseBillEntryItems_hsnId_fkey" FOREIGN KEY ("hsnId") REFERENCES "Hsn"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseBillEntryItems" ADD CONSTRAINT "PurchaseBillEntryItems_itemGroupId_fkey" FOREIGN KEY ("itemGroupId") REFERENCES "ItemGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseBillEntryItems" ADD CONSTRAINT "PurchaseBillEntryItems_sizeId_fkey" FOREIGN KEY ("sizeId") REFERENCES "Size"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseBillEntryItems" ADD CONSTRAINT "PurchaseBillEntryItems_colorId_fkey" FOREIGN KEY ("colorId") REFERENCES "Color"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseBillEntryItems" ADD CONSTRAINT "PurchaseBillEntryItems_gsmId_fkey" FOREIGN KEY ("gsmId") REFERENCES "Gsm"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseBillEntryItems" ADD CONSTRAINT "PurchaseBillEntryItems_poId_fkey" FOREIGN KEY ("poId") REFERENCES "Po"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseLedger" ADD CONSTRAINT "PurchaseLedger_purchaseBillEntryId_fkey" FOREIGN KEY ("purchaseBillEntryId") REFERENCES "PurchaseBillEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseLedger" ADD CONSTRAINT "PurchaseLedger_purchaseInwardId_fkey" FOREIGN KEY ("purchaseInwardId") REFERENCES "PurchaseInward"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseLedger" ADD CONSTRAINT "PurchaseLedger_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Party"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Size" ADD CONSTRAINT "Size_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gsm" ADD CONSTRAINT "Gsm_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemGroup" ADD CONSTRAINT "ItemGroup_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SizeTemplate" ADD CONSTRAINT "SizeTemplate_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SizeTemplateList" ADD CONSTRAINT "SizeTemplateList_sizeTemplateId_fkey" FOREIGN KEY ("sizeTemplateId") REFERENCES "SizeTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SizeTemplateList" ADD CONSTRAINT "SizeTemplateList_sizeId_fkey" FOREIGN KEY ("sizeId") REFERENCES "Size"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalRuleField" ADD CONSTRAINT "ApprovalRuleField_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "ApprovalRuleModule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalConfigCondition" ADD CONSTRAINT "ApprovalConfigCondition_approvalConfigId_fkey" FOREIGN KEY ("approvalConfigId") REFERENCES "ApprovalConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalConfigCondition" ADD CONSTRAINT "ApprovalConfigCondition_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "ApprovalRuleField"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalConfigCondition" ADD CONSTRAINT "ApprovalConfigCondition_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "ApprovalRuleOperator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalConfigCondition" ADD CONSTRAINT "ApprovalConfigCondition_compareFieldId_fkey" FOREIGN KEY ("compareFieldId") REFERENCES "ApprovalRuleField"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalConfig" ADD CONSTRAINT "ApprovalConfig_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalConfig" ADD CONSTRAINT "ApprovalConfig_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "ApprovalRuleModule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalConfig" ADD CONSTRAINT "ApprovalConfig_approverRoleId_fkey" FOREIGN KEY ("approverRoleId") REFERENCES "Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalConfig" ADD CONSTRAINT "ApprovalConfig_approverUserId_fkey" FOREIGN KEY ("approverUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalLevel" ADD CONSTRAINT "ApprovalLevel_approvalConfigId_fkey" FOREIGN KEY ("approvalConfigId") REFERENCES "ApprovalConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalLevelUser" ADD CONSTRAINT "ApprovalLevelUser_approvalLevelId_fkey" FOREIGN KEY ("approvalLevelId") REFERENCES "ApprovalLevel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalLevelUser" ADD CONSTRAINT "ApprovalLevelUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalLog" ADD CONSTRAINT "ApprovalLog_approvalConfigId_fkey" FOREIGN KEY ("approvalConfigId") REFERENCES "ApprovalConfig"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalLog" ADD CONSTRAINT "ApprovalLog_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalLog" ADD CONSTRAINT "ApprovalLog_rejectedById_fkey" FOREIGN KEY ("rejectedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalLog" ADD CONSTRAINT "ApprovalLog_raisedById_fkey" FOREIGN KEY ("raisedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalLevelLog" ADD CONSTRAINT "ApprovalLevelLog_approvalLogId_fkey" FOREIGN KEY ("approvalLogId") REFERENCES "ApprovalLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalLevelLog" ADD CONSTRAINT "ApprovalLevelLog_approvalLevelId_fkey" FOREIGN KEY ("approvalLevelId") REFERENCES "ApprovalLevel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalLevelLog" ADD CONSTRAINT "ApprovalLevelLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderEntry" ADD CONSTRAINT "OrderEntry_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderEntry" ADD CONSTRAINT "OrderEntry_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderEntry" ADD CONSTRAINT "OrderEntry_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderEntry" ADD CONSTRAINT "OrderEntry_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Party"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderEntry" ADD CONSTRAINT "OrderEntry_termsId_fkey" FOREIGN KEY ("termsId") REFERENCES "TermsAndConditions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderEntry" ADD CONSTRAINT "OrderEntry_proFormaId_fkey" FOREIGN KEY ("proFormaId") REFERENCES "ProformaInvoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderEntry" ADD CONSTRAINT "OrderEntry_taxTemplateId_fkey" FOREIGN KEY ("taxTemplateId") REFERENCES "TaxTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderEntry" ADD CONSTRAINT "OrderEntry_payTermId_fkey" FOREIGN KEY ("payTermId") REFERENCES "PayTerm"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderEntry" ADD CONSTRAINT "OrderEntry_bankId_fkey" FOREIGN KEY ("bankId") REFERENCES "Bank"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderEntry" ADD CONSTRAINT "OrderEntry_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "Currency"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderEntry" ADD CONSTRAINT "OrderEntry_loadingId_fkey" FOREIGN KEY ("loadingId") REFERENCES "City"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderEntry" ADD CONSTRAINT "OrderEntry_deliveryId_fkey" FOREIGN KEY ("deliveryId") REFERENCES "City"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Process" ADD CONSTRAINT "Process_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Process" ADD CONSTRAINT "Process_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcessGroup" ADD CONSTRAINT "ProcessGroup_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcessGroupList" ADD CONSTRAINT "ProcessGroupList_processGroupId_fkey" FOREIGN KEY ("processGroupId") REFERENCES "ProcessGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcessGroupList" ADD CONSTRAINT "ProcessGroupList_processId_fkey" FOREIGN KEY ("processId") REFERENCES "Process"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Board" ADD CONSTRAINT "Board_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Plate" ADD CONSTRAINT "Plate_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Die" ADD CONSTRAINT "Die_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobCard" ADD CONSTRAINT "JobCard_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobCard" ADD CONSTRAINT "JobCard_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobCard" ADD CONSTRAINT "JobCard_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobCard" ADD CONSTRAINT "JobCard_orderEntryId_fkey" FOREIGN KEY ("orderEntryId") REFERENCES "OrderEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobCard" ADD CONSTRAINT "JobCard_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Party"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobCard" ADD CONSTRAINT "JobCard_gsmId_fkey" FOREIGN KEY ("gsmId") REFERENCES "Gsm"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobCard" ADD CONSTRAINT "JobCard_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Board"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobCard" ADD CONSTRAINT "JobCard_otherBoardId_fkey" FOREIGN KEY ("otherBoardId") REFERENCES "Process"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobCard" ADD CONSTRAINT "JobCard_plateId_fkey" FOREIGN KEY ("plateId") REFERENCES "Plate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobCard" ADD CONSTRAINT "JobCard_dieId_fkey" FOREIGN KEY ("dieId") REFERENCES "Die"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobCard" ADD CONSTRAINT "JobCard_designerId_fkey" FOREIGN KEY ("designerId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobCard" ADD CONSTRAINT "JobCard_followUpId_fkey" FOREIGN KEY ("followUpId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobCard" ADD CONSTRAINT "JobCard_fullBoardId_fkey" FOREIGN KEY ("fullBoardId") REFERENCES "Size"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobCard" ADD CONSTRAINT "JobCard_cuttingSizeId_fkey" FOREIGN KEY ("cuttingSizeId") REFERENCES "Size"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobCard" ADD CONSTRAINT "JobCard_labelSizeId_fkey" FOREIGN KEY ("labelSizeId") REFERENCES "Size"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobCard" ADD CONSTRAINT "JobCard_itemGroupId_fkey" FOREIGN KEY ("itemGroupId") REFERENCES "ItemGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobCard" ADD CONSTRAINT "JobCard_styleItemId_fkey" FOREIGN KEY ("styleItemId") REFERENCES "StyleItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobCard" ADD CONSTRAINT "JobCard_labelItemId_fkey" FOREIGN KEY ("labelItemId") REFERENCES "StyleItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobCard" ADD CONSTRAINT "JobCard_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItems"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobCard" ADD CONSTRAINT "JobCard_refJobCardId_fkey" FOREIGN KEY ("refJobCardId") REFERENCES "JobCard"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobCard" ADD CONSTRAINT "JobCard_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobCard" ADD CONSTRAINT "JobCard_colorId_fkey" FOREIGN KEY ("colorId") REFERENCES "Color"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobCard" ADD CONSTRAINT "JobCard_plateSupplierId_fkey" FOREIGN KEY ("plateSupplierId") REFERENCES "Party"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoardQuality" ADD CONSTRAINT "BoardQuality_jobCardId_fkey" FOREIGN KEY ("jobCardId") REFERENCES "JobCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoardQuality" ADD CONSTRAINT "BoardQuality_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Board"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoardQuality" ADD CONSTRAINT "BoardQuality_processId_fkey" FOREIGN KEY ("processId") REFERENCES "Process"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoardQuality" ADD CONSTRAINT "BoardQuality_gsmId_fkey" FOREIGN KEY ("gsmId") REFERENCES "Gsm"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoardQuality" ADD CONSTRAINT "BoardQuality_fullBoardId_fkey" FOREIGN KEY ("fullBoardId") REFERENCES "Size"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinishingProcess" ADD CONSTRAINT "FinishingProcess_jobCardId_fkey" FOREIGN KEY ("jobCardId") REFERENCES "JobCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinishingProcess" ADD CONSTRAINT "FinishingProcess_processId_fkey" FOREIGN KEY ("processId") REFERENCES "Process"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabelPrintingDetails" ADD CONSTRAINT "LabelPrintingDetails_jobCardId_fkey" FOREIGN KEY ("jobCardId") REFERENCES "JobCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabelPrintingDetails" ADD CONSTRAINT "LabelPrintingDetails_processId_fkey" FOREIGN KEY ("processId") REFERENCES "Process"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrintingDetails" ADD CONSTRAINT "PrintingDetails_jobCardId_fkey" FOREIGN KEY ("jobCardId") REFERENCES "JobCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrintingDetails" ADD CONSTRAINT "PrintingDetails_processId_fkey" FOREIGN KEY ("processId") REFERENCES "Process"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlateDetails" ADD CONSTRAINT "PlateDetails_jobCardId_fkey" FOREIGN KEY ("jobCardId") REFERENCES "JobCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlateDetails" ADD CONSTRAINT "PlateDetails_plateId_fkey" FOREIGN KEY ("plateId") REFERENCES "Plate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlateDetails" ADD CONSTRAINT "PlateDetails_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "Machine"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcessDetails" ADD CONSTRAINT "ProcessDetails_jobCardId_fkey" FOREIGN KEY ("jobCardId") REFERENCES "JobCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcessDetails" ADD CONSTRAINT "ProcessDetails_processId_fkey" FOREIGN KEY ("processId") REFERENCES "Process"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LaminationDetails" ADD CONSTRAINT "LaminationDetails_jobCardId_fkey" FOREIGN KEY ("jobCardId") REFERENCES "JobCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LaminationDetails" ADD CONSTRAINT "LaminationDetails_laminationId_fkey" FOREIGN KEY ("laminationId") REFERENCES "Process"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VarnishDetails" ADD CONSTRAINT "VarnishDetails_jobCardId_fkey" FOREIGN KEY ("jobCardId") REFERENCES "JobCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VarnishDetails" ADD CONSTRAINT "VarnishDetails_varnishId_fkey" FOREIGN KEY ("varnishId") REFERENCES "Process"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MachineDetails" ADD CONSTRAINT "MachineDetails_jobCardId_fkey" FOREIGN KEY ("jobCardId") REFERENCES "JobCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MachineDetails" ADD CONSTRAINT "MachineDetails_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "Process"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MachineDetails" ADD CONSTRAINT "MachineDetails_macId_fkey" FOREIGN KEY ("macId") REFERENCES "Machine"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItems" ADD CONSTRAINT "OrderItems_orderEntryId_fkey" FOREIGN KEY ("orderEntryId") REFERENCES "OrderEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItems" ADD CONSTRAINT "OrderItems_styleItemId_fkey" FOREIGN KEY ("styleItemId") REFERENCES "StyleItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItems" ADD CONSTRAINT "OrderItems_sizeId_fkey" FOREIGN KEY ("sizeId") REFERENCES "Size"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItems" ADD CONSTRAINT "OrderItems_uomId_fkey" FOREIGN KEY ("uomId") REFERENCES "Uom"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItems" ADD CONSTRAINT "OrderItems_gsmId_fkey" FOREIGN KEY ("gsmId") REFERENCES "Gsm"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItems" ADD CONSTRAINT "OrderItems_itemGroupId_fkey" FOREIGN KEY ("itemGroupId") REFERENCES "ItemGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItems" ADD CONSTRAINT "OrderItems_hsnId_fkey" FOREIGN KEY ("hsnId") REFERENCES "Hsn"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItems" ADD CONSTRAINT "OrderItems_sizeTemplateId_fkey" FOREIGN KEY ("sizeTemplateId") REFERENCES "SizeTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItems" ADD CONSTRAINT "OrderItems_itemSubGroupId_fkey" FOREIGN KEY ("itemSubGroupId") REFERENCES "ItemSubGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderStyleBreakup" ADD CONSTRAINT "OrderStyleBreakup_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderStyleBreakup" ADD CONSTRAINT "OrderStyleBreakup_styleId_fkey" FOREIGN KEY ("styleId") REFERENCES "Style"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderSizeBreakup" ADD CONSTRAINT "OrderSizeBreakup_orderStyleBreakupId_fkey" FOREIGN KEY ("orderStyleBreakupId") REFERENCES "OrderStyleBreakup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderSizeBreakup" ADD CONSTRAINT "OrderSizeBreakup_sizeId_fkey" FOREIGN KEY ("sizeId") REFERENCES "Size"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobCardSizeBreakup" ADD CONSTRAINT "JobCardSizeBreakup_jobCardId_fkey" FOREIGN KEY ("jobCardId") REFERENCES "JobCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobCardSizeBreakup" ADD CONSTRAINT "JobCardSizeBreakup_sizeId_fkey" FOREIGN KEY ("sizeId") REFERENCES "Size"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcessRoute" ADD CONSTRAINT "ProcessRoute_jobCardId_fkey" FOREIGN KEY ("jobCardId") REFERENCES "JobCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcessRoute" ADD CONSTRAINT "ProcessRoute_processId_fkey" FOREIGN KEY ("processId") REFERENCES "Process"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productionempPunch" ADD CONSTRAINT "productionempPunch_jobCardId_fkey" FOREIGN KEY ("jobCardId") REFERENCES "JobCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productionempPunch" ADD CONSTRAINT "productionempPunch_processRouteId_fkey" FOREIGN KEY ("processRouteId") REFERENCES "ProcessRoute"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productionempPunch" ADD CONSTRAINT "productionempPunch_Userid_fkey" FOREIGN KEY ("Userid") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productionempPunch" ADD CONSTRAINT "productionempPunch_departmentid_fkey" FOREIGN KEY ("departmentid") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productionempPunch" ADD CONSTRAINT "productionempPunch_Machineid_fkey" FOREIGN KEY ("Machineid") REFERENCES "Machine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "splitSizes" ADD CONSTRAINT "splitSizes_pushLogId_fkey" FOREIGN KEY ("pushLogId") REFERENCES "pushLogs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "splitSizes" ADD CONSTRAINT "splitSizes_jobCardSizeId_fkey" FOREIGN KEY ("jobCardSizeId") REFERENCES "JobCardSizeBreakup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "takenmachines" ADD CONSTRAINT "takenmachines_Userid_fkey" FOREIGN KEY ("Userid") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "takenmachines" ADD CONSTRAINT "takenmachines_jobCardId_fkey" FOREIGN KEY ("jobCardId") REFERENCES "JobCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "takenmachines" ADD CONSTRAINT "takenmachines_processRouteId_fkey" FOREIGN KEY ("processRouteId") REFERENCES "ProcessRoute"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "takenmachines" ADD CONSTRAINT "takenmachines_departmentid_fkey" FOREIGN KEY ("departmentid") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "takenmachines" ADD CONSTRAINT "takenmachines_Machineid_fkey" FOREIGN KEY ("Machineid") REFERENCES "Machine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pushLogs" ADD CONSTRAINT "pushLogs_Userid_fkey" FOREIGN KEY ("Userid") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pushLogs" ADD CONSTRAINT "pushLogs_productionlog_fkey" FOREIGN KEY ("productionlog") REFERENCES "productionempPunch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProformaInvoice" ADD CONSTRAINT "ProformaInvoice_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProformaInvoice" ADD CONSTRAINT "ProformaInvoice_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProformaInvoice" ADD CONSTRAINT "ProformaInvoice_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProformaInvoice" ADD CONSTRAINT "ProformaInvoice_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProformaInvoice" ADD CONSTRAINT "ProformaInvoice_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Party"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProformaInvoice" ADD CONSTRAINT "ProformaInvoice_finYearId_fkey" FOREIGN KEY ("finYearId") REFERENCES "FinYear"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProformaInvoice" ADD CONSTRAINT "ProformaInvoice_termsId_fkey" FOREIGN KEY ("termsId") REFERENCES "TermsAndConditions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProformaInvoice" ADD CONSTRAINT "ProformaInvoice_taxTemplateId_fkey" FOREIGN KEY ("taxTemplateId") REFERENCES "TaxTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProformaInvoice" ADD CONSTRAINT "ProformaInvoice_payTermId_fkey" FOREIGN KEY ("payTermId") REFERENCES "PayTerm"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProformaInvoice" ADD CONSTRAINT "ProformaInvoice_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "Currency"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProformaInvoice" ADD CONSTRAINT "ProformaInvoice_loadingId_fkey" FOREIGN KEY ("loadingId") REFERENCES "City"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProformaInvoice" ADD CONSTRAINT "ProformaInvoice_deliveryId_fkey" FOREIGN KEY ("deliveryId") REFERENCES "City"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProformaInvoice" ADD CONSTRAINT "ProformaInvoice_bankId_fkey" FOREIGN KEY ("bankId") REFERENCES "Bank"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProformaInvoiceItem" ADD CONSTRAINT "ProformaInvoiceItem_proformaInvoiceId_fkey" FOREIGN KEY ("proformaInvoiceId") REFERENCES "ProformaInvoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProformaInvoiceItem" ADD CONSTRAINT "ProformaInvoiceItem_itemGroupId_fkey" FOREIGN KEY ("itemGroupId") REFERENCES "ItemGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProformaInvoiceItem" ADD CONSTRAINT "ProformaInvoiceItem_itemSubGroupId_fkey" FOREIGN KEY ("itemSubGroupId") REFERENCES "ItemSubGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProformaInvoiceItem" ADD CONSTRAINT "ProformaInvoiceItem_styleItemId_fkey" FOREIGN KEY ("styleItemId") REFERENCES "StyleItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProformaInvoiceItem" ADD CONSTRAINT "ProformaInvoiceItem_sizeId_fkey" FOREIGN KEY ("sizeId") REFERENCES "Size"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProformaInvoiceItem" ADD CONSTRAINT "ProformaInvoiceItem_uomId_fkey" FOREIGN KEY ("uomId") REFERENCES "Uom"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProformaInvoiceItem" ADD CONSTRAINT "ProformaInvoiceItem_gsmId_fkey" FOREIGN KEY ("gsmId") REFERENCES "Gsm"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProformaInvoiceItem" ADD CONSTRAINT "ProformaInvoiceItem_hsnId_fkey" FOREIGN KEY ("hsnId") REFERENCES "Hsn"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PIStyleBreakup" ADD CONSTRAINT "PIStyleBreakup_ProformaInvoiceItemId_fkey" FOREIGN KEY ("ProformaInvoiceItemId") REFERENCES "ProformaInvoiceItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PIStyleBreakup" ADD CONSTRAINT "PIStyleBreakup_styleId_fkey" FOREIGN KEY ("styleId") REFERENCES "Style"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PISizeBreakup" ADD CONSTRAINT "PISizeBreakup_PIStyleBreakupId_fkey" FOREIGN KEY ("PIStyleBreakupId") REFERENCES "PIStyleBreakup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PISizeBreakup" ADD CONSTRAINT "PISizeBreakup_sizeId_fkey" FOREIGN KEY ("sizeId") REFERENCES "Size"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProformaAttachments" ADD CONSTRAINT "ProformaAttachments_proformaInvoiceId_fkey" FOREIGN KEY ("proformaInvoiceId") REFERENCES "ProformaInvoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Currency" ADD CONSTRAINT "Currency_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bank" ADD CONSTRAINT "Bank_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bank" ADD CONSTRAINT "Bank_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "City"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionAllocation" ADD CONSTRAINT "ProductionAllocation_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionAllocation" ADD CONSTRAINT "ProductionAllocation_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionAllocation" ADD CONSTRAINT "ProductionAllocation_jobCardId_fkey" FOREIGN KEY ("jobCardId") REFERENCES "JobCard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionAllocation" ADD CONSTRAINT "ProductionAllocation_styleItemId_fkey" FOREIGN KEY ("styleItemId") REFERENCES "StyleItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionAllocation" ADD CONSTRAINT "ProductionAllocation_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionAllocationDtl" ADD CONSTRAINT "ProductionAllocationDtl_productionAllocationId_fkey" FOREIGN KEY ("productionAllocationId") REFERENCES "ProductionAllocation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionAllocationDtl" ADD CONSTRAINT "ProductionAllocationDtl_processId_fkey" FOREIGN KEY ("processId") REFERENCES "Process"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionAllocationDtl" ADD CONSTRAINT "ProductionAllocationDtl_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Party"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionAllocationDtl" ADD CONSTRAINT "ProductionAllocationDtl_processRouteId_fkey" FOREIGN KEY ("processRouteId") REFERENCES "ProcessRoute"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Machine" ADD CONSTRAINT "Machine_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Machine" ADD CONSTRAINT "Machine_sizeId_fkey" FOREIGN KEY ("sizeId") REFERENCES "Size"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Machine" ADD CONSTRAINT "Machine_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionOutward" ADD CONSTRAINT "ProductionOutward_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionOutward" ADD CONSTRAINT "ProductionOutward_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionOutward" ADD CONSTRAINT "ProductionOutward_jobCardId_fkey" FOREIGN KEY ("jobCardId") REFERENCES "JobCard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionOutward" ADD CONSTRAINT "ProductionOutward_productionAllocationId_fkey" FOREIGN KEY ("productionAllocationId") REFERENCES "ProductionAllocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionOutward" ADD CONSTRAINT "ProductionOutward_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Party"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionOutward" ADD CONSTRAINT "ProductionOutward_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionOutwardDtl" ADD CONSTRAINT "ProductionOutwardDtl_productionOutwardId_fkey" FOREIGN KEY ("productionOutwardId") REFERENCES "ProductionOutward"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionOutwardDtl" ADD CONSTRAINT "ProductionOutwardDtl_processId_fkey" FOREIGN KEY ("processId") REFERENCES "Process"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionOutwardDtl" ADD CONSTRAINT "ProductionOutwardDtl_prevProcessId_fkey" FOREIGN KEY ("prevProcessId") REFERENCES "Process"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionOutwardDtl" ADD CONSTRAINT "ProductionOutwardDtl_productionAllocationDtlId_fkey" FOREIGN KEY ("productionAllocationDtlId") REFERENCES "ProductionAllocationDtl"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionInward" ADD CONSTRAINT "ProductionInward_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionInward" ADD CONSTRAINT "ProductionInward_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionInward" ADD CONSTRAINT "ProductionInward_productionOutwardId_fkey" FOREIGN KEY ("productionOutwardId") REFERENCES "ProductionOutward"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionInward" ADD CONSTRAINT "ProductionInward_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Party"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionInward" ADD CONSTRAINT "ProductionInward_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionInward" ADD CONSTRAINT "ProductionInward_jobCardId_fkey" FOREIGN KEY ("jobCardId") REFERENCES "JobCard"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionInward" ADD CONSTRAINT "ProductionInward_taxTemplateId_fkey" FOREIGN KEY ("taxTemplateId") REFERENCES "TaxTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionInwardDtl" ADD CONSTRAINT "ProductionInwardDtl_productionInwardId_fkey" FOREIGN KEY ("productionInwardId") REFERENCES "ProductionInward"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionInwardDtl" ADD CONSTRAINT "ProductionInwardDtl_outwardDetailId_fkey" FOREIGN KEY ("outwardDetailId") REFERENCES "ProductionOutwardDtl"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionInwardDtl" ADD CONSTRAINT "ProductionInwardDtl_processId_fkey" FOREIGN KEY ("processId") REFERENCES "Process"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionInwardDtl" ADD CONSTRAINT "ProductionInwardDtl_jobCardId_fkey" FOREIGN KEY ("jobCardId") REFERENCES "JobCard"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionInwardDtl" ADD CONSTRAINT "ProductionInwardDtl_productionOutwardId_fkey" FOREIGN KEY ("productionOutwardId") REFERENCES "ProductionOutward"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InwardProcessDtl" ADD CONSTRAINT "InwardProcessDtl_productionInwardDtlId_fkey" FOREIGN KEY ("productionInwardDtlId") REFERENCES "ProductionInwardDtl"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InwardProcessDtl" ADD CONSTRAINT "InwardProcessDtl_processId_fkey" FOREIGN KEY ("processId") REFERENCES "Process"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcessBill" ADD CONSTRAINT "ProcessBill_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcessBill" ADD CONSTRAINT "ProcessBill_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcessBill" ADD CONSTRAINT "ProcessBill_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Party"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcessBill" ADD CONSTRAINT "ProcessBill_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcessBill" ADD CONSTRAINT "ProcessBill_taxTemplateId_fkey" FOREIGN KEY ("taxTemplateId") REFERENCES "TaxTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcessBillDtl" ADD CONSTRAINT "ProcessBillDtl_processBilldId_fkey" FOREIGN KEY ("processBilldId") REFERENCES "ProcessBill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcessBillDtl" ADD CONSTRAINT "ProcessBillDtl_jobCardId_fkey" FOREIGN KEY ("jobCardId") REFERENCES "JobCard"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcessBillDtl" ADD CONSTRAINT "ProcessBillDtl_productionInwardId_fkey" FOREIGN KEY ("productionInwardId") REFERENCES "ProductionInward"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingProcess" ADD CONSTRAINT "BillingProcess_processBillDtlId_fkey" FOREIGN KEY ("processBillDtlId") REFERENCES "ProcessBillDtl"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingProcess" ADD CONSTRAINT "BillingProcess_processId_fkey" FOREIGN KEY ("processId") REFERENCES "Process"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesDelivery" ADD CONSTRAINT "SalesDelivery_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesDelivery" ADD CONSTRAINT "SalesDelivery_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesDelivery" ADD CONSTRAINT "SalesDelivery_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesDelivery" ADD CONSTRAINT "SalesDelivery_finYearId_fkey" FOREIGN KEY ("finYearId") REFERENCES "FinYear"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesDelivery" ADD CONSTRAINT "SalesDelivery_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Party"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesDelivery" ADD CONSTRAINT "SalesDelivery_deliveryTo_fkey" FOREIGN KEY ("deliveryTo") REFERENCES "Party"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesDelivery" ADD CONSTRAINT "SalesDelivery_orderEntryId_fkey" FOREIGN KEY ("orderEntryId") REFERENCES "OrderEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesDelivery" ADD CONSTRAINT "SalesDelivery_salesOrderId_fkey" FOREIGN KEY ("salesOrderId") REFERENCES "SalesOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesDelivery" ADD CONSTRAINT "SalesDelivery_taxTemplateId_fkey" FOREIGN KEY ("taxTemplateId") REFERENCES "TaxTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesDelivery" ADD CONSTRAINT "SalesDelivery_termsId_fkey" FOREIGN KEY ("termsId") REFERENCES "TermsAndConditions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesDelivery" ADD CONSTRAINT "SalesDelivery_payTermId_fkey" FOREIGN KEY ("payTermId") REFERENCES "PayTerm"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesDelivery" ADD CONSTRAINT "SalesDelivery_bankId_fkey" FOREIGN KEY ("bankId") REFERENCES "Bank"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesDelivery" ADD CONSTRAINT "SalesDelivery_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "Currency"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesDelivery" ADD CONSTRAINT "SalesDelivery_loadingId_fkey" FOREIGN KEY ("loadingId") REFERENCES "City"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesDelivery" ADD CONSTRAINT "SalesDelivery_deliveryId_fkey" FOREIGN KEY ("deliveryId") REFERENCES "City"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesDeliveryItems" ADD CONSTRAINT "SalesDeliveryItems_salesDeliveryId_fkey" FOREIGN KEY ("salesDeliveryId") REFERENCES "SalesDelivery"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesDeliveryItems" ADD CONSTRAINT "SalesDeliveryItems_styleItemId_fkey" FOREIGN KEY ("styleItemId") REFERENCES "StyleItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesDeliveryItems" ADD CONSTRAINT "SalesDeliveryItems_itemGroupId_fkey" FOREIGN KEY ("itemGroupId") REFERENCES "ItemGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesDeliveryItems" ADD CONSTRAINT "SalesDeliveryItems_itemSubGroupId_fkey" FOREIGN KEY ("itemSubGroupId") REFERENCES "ItemSubGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesDeliveryItems" ADD CONSTRAINT "SalesDeliveryItems_uomId_fkey" FOREIGN KEY ("uomId") REFERENCES "Uom"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesDeliveryItems" ADD CONSTRAINT "SalesDeliveryItems_gsmId_fkey" FOREIGN KEY ("gsmId") REFERENCES "Gsm"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesDeliveryItems" ADD CONSTRAINT "SalesDeliveryItems_hsnId_fkey" FOREIGN KEY ("hsnId") REFERENCES "Hsn"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesStyleBreakup" ADD CONSTRAINT "SalesStyleBreakup_salesDeliveryItemId_fkey" FOREIGN KEY ("salesDeliveryItemId") REFERENCES "SalesDeliveryItems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesStyleBreakup" ADD CONSTRAINT "SalesStyleBreakup_styleId_fkey" FOREIGN KEY ("styleId") REFERENCES "Style"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesSizeBreakup" ADD CONSTRAINT "SalesSizeBreakup_salesStyleBreakupId_fkey" FOREIGN KEY ("salesStyleBreakupId") REFERENCES "SalesStyleBreakup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesSizeBreakup" ADD CONSTRAINT "SalesSizeBreakup_salesOrderSizeBreakupId_fkey" FOREIGN KEY ("salesOrderSizeBreakupId") REFERENCES "SaleOrderSizeBreakup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesSizeBreakup" ADD CONSTRAINT "SalesSizeBreakup_sizeId_fkey" FOREIGN KEY ("sizeId") REFERENCES "Size"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesDeliveryPacking" ADD CONSTRAINT "SalesDeliveryPacking_salesSizeBreakupId_fkey" FOREIGN KEY ("salesSizeBreakupId") REFERENCES "SalesSizeBreakup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemSubGroup" ADD CONSTRAINT "ItemSubGroup_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemSubGroup" ADD CONSTRAINT "ItemSubGroup_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemSubGroup" ADD CONSTRAINT "ItemSubGroup_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemSubGroup" ADD CONSTRAINT "ItemSubGroup_itemGroupId_fkey" FOREIGN KEY ("itemGroupId") REFERENCES "ItemGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesOrder" ADD CONSTRAINT "SalesOrder_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesOrder" ADD CONSTRAINT "SalesOrder_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesOrder" ADD CONSTRAINT "SalesOrder_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesOrder" ADD CONSTRAINT "SalesOrder_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Party"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesOrder" ADD CONSTRAINT "SalesOrder_deliveryTo_fkey" FOREIGN KEY ("deliveryTo") REFERENCES "Party"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesOrder" ADD CONSTRAINT "SalesOrder_finYearId_fkey" FOREIGN KEY ("finYearId") REFERENCES "FinYear"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesOrder" ADD CONSTRAINT "SalesOrder_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "OrderEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesOrder" ADD CONSTRAINT "SalesOrder_termsId_fkey" FOREIGN KEY ("termsId") REFERENCES "TermsAndConditions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesOrder" ADD CONSTRAINT "SalesOrder_taxTemplateId_fkey" FOREIGN KEY ("taxTemplateId") REFERENCES "TaxTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesOrder" ADD CONSTRAINT "SalesOrder_payTermId_fkey" FOREIGN KEY ("payTermId") REFERENCES "PayTerm"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesOrder" ADD CONSTRAINT "SalesOrder_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "Currency"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesOrder" ADD CONSTRAINT "SalesOrder_loadingId_fkey" FOREIGN KEY ("loadingId") REFERENCES "City"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesOrder" ADD CONSTRAINT "SalesOrder_deliveryId_fkey" FOREIGN KEY ("deliveryId") REFERENCES "City"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesOrder" ADD CONSTRAINT "SalesOrder_bankId_fkey" FOREIGN KEY ("bankId") REFERENCES "Bank"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesOrderItems" ADD CONSTRAINT "SalesOrderItems_saleOrderId_fkey" FOREIGN KEY ("saleOrderId") REFERENCES "SalesOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesOrderItems" ADD CONSTRAINT "SalesOrderItems_styleItemId_fkey" FOREIGN KEY ("styleItemId") REFERENCES "StyleItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesOrderItems" ADD CONSTRAINT "SalesOrderItems_sizeId_fkey" FOREIGN KEY ("sizeId") REFERENCES "Size"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesOrderItems" ADD CONSTRAINT "SalesOrderItems_uomId_fkey" FOREIGN KEY ("uomId") REFERENCES "Uom"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesOrderItems" ADD CONSTRAINT "SalesOrderItems_gsmId_fkey" FOREIGN KEY ("gsmId") REFERENCES "Gsm"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesOrderItems" ADD CONSTRAINT "SalesOrderItems_itemGroupId_fkey" FOREIGN KEY ("itemGroupId") REFERENCES "ItemGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesOrderItems" ADD CONSTRAINT "SalesOrderItems_hsnId_fkey" FOREIGN KEY ("hsnId") REFERENCES "Hsn"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesOrderItems" ADD CONSTRAINT "SalesOrderItems_itemSubGroupId_fkey" FOREIGN KEY ("itemSubGroupId") REFERENCES "ItemSubGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleOrderStyleBreakup" ADD CONSTRAINT "SaleOrderStyleBreakup_salesItemId_fkey" FOREIGN KEY ("salesItemId") REFERENCES "SalesOrderItems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleOrderStyleBreakup" ADD CONSTRAINT "SaleOrderStyleBreakup_styleId_fkey" FOREIGN KEY ("styleId") REFERENCES "Style"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleOrderSizeBreakup" ADD CONSTRAINT "SaleOrderSizeBreakup_saleStyleBreakupId_fkey" FOREIGN KEY ("saleStyleBreakupId") REFERENCES "SaleOrderStyleBreakup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleOrderSizeBreakup" ADD CONSTRAINT "SaleOrderSizeBreakup_sizeId_fkey" FOREIGN KEY ("sizeId") REFERENCES "Size"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesOrderPacking" ADD CONSTRAINT "SalesOrderPacking_saleOrderSizeBreakupId_fkey" FOREIGN KEY ("saleOrderSizeBreakupId") REFERENCES "SaleOrderSizeBreakup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Packing" ADD CONSTRAINT "Packing_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Packing" ADD CONSTRAINT "Packing_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Packing" ADD CONSTRAINT "Packing_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Packing" ADD CONSTRAINT "Packing_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "OrderEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Packing" ADD CONSTRAINT "Packing_jobCardId_fkey" FOREIGN KEY ("jobCardId") REFERENCES "JobCard"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Packing" ADD CONSTRAINT "Packing_finYearId_fkey" FOREIGN KEY ("finYearId") REFERENCES "FinYear"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackingItems" ADD CONSTRAINT "PackingItems_packingId_fkey" FOREIGN KEY ("packingId") REFERENCES "Packing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackingItems" ADD CONSTRAINT "PackingItems_styleItemId_fkey" FOREIGN KEY ("styleItemId") REFERENCES "StyleItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackingItems" ADD CONSTRAINT "PackingItems_uomId_fkey" FOREIGN KEY ("uomId") REFERENCES "Uom"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackingItems" ADD CONSTRAINT "PackingItems_gsmId_fkey" FOREIGN KEY ("gsmId") REFERENCES "Gsm"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackingItems" ADD CONSTRAINT "PackingItems_itemGroupId_fkey" FOREIGN KEY ("itemGroupId") REFERENCES "ItemGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackingItems" ADD CONSTRAINT "PackingItems_hsnId_fkey" FOREIGN KEY ("hsnId") REFERENCES "Hsn"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackingItems" ADD CONSTRAINT "PackingItems_itemSubGroupId_fkey" FOREIGN KEY ("itemSubGroupId") REFERENCES "ItemSubGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackingStyleBreakup" ADD CONSTRAINT "PackingStyleBreakup_PackingItemsId_fkey" FOREIGN KEY ("PackingItemsId") REFERENCES "PackingItems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackingStyleBreakup" ADD CONSTRAINT "PackingStyleBreakup_styleId_fkey" FOREIGN KEY ("styleId") REFERENCES "Style"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackingSizeBreakup" ADD CONSTRAINT "PackingSizeBreakup_PackingStyleBreakupId_fkey" FOREIGN KEY ("PackingStyleBreakupId") REFERENCES "PackingStyleBreakup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackingSizeBreakup" ADD CONSTRAINT "PackingSizeBreakup_orderSizeBreakupId_fkey" FOREIGN KEY ("orderSizeBreakupId") REFERENCES "OrderSizeBreakup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackingSizeBreakup" ADD CONSTRAINT "PackingSizeBreakup_sizeId_fkey" FOREIGN KEY ("sizeId") REFERENCES "Size"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackingBreakup" ADD CONSTRAINT "PackingBreakup_PackingSizeBreakupId_fkey" FOREIGN KEY ("PackingSizeBreakupId") REFERENCES "PackingSizeBreakup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackingBreakup" ADD CONSTRAINT "PackingBreakup_packingUomId_fkey" FOREIGN KEY ("packingUomId") REFERENCES "Uom"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReworkLog" ADD CONSTRAINT "ReworkLog_jobCardId_fkey" FOREIGN KEY ("jobCardId") REFERENCES "JobCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReworkLog" ADD CONSTRAINT "ReworkLog_processRouteId_fkey" FOREIGN KEY ("processRouteId") REFERENCES "ProcessRoute"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReworkLog" ADD CONSTRAINT "ReworkLog_Userid_fkey" FOREIGN KEY ("Userid") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReworkBatchTracker" ADD CONSTRAINT "ReworkBatchTracker_jobCardId_fkey" FOREIGN KEY ("jobCardId") REFERENCES "JobCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReworkBatchTracker" ADD CONSTRAINT "ReworkBatchTracker_processRouteId_fkey" FOREIGN KEY ("processRouteId") REFERENCES "ProcessRoute"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReworkBatchTracker" ADD CONSTRAINT "ReworkBatchTracker_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IncomingQty" ADD CONSTRAINT "IncomingQty_jobCardId_fkey" FOREIGN KEY ("jobCardId") REFERENCES "JobCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IncomingQty" ADD CONSTRAINT "IncomingQty_processRouteId_fkey" FOREIGN KEY ("processRouteId") REFERENCES "ProcessRoute"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IncomingQty" ADD CONSTRAINT "IncomingQty_sendRoute_fkey" FOREIGN KEY ("sendRoute") REFERENCES "ProcessRoute"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IncomingQty" ADD CONSTRAINT "IncomingQty_outwardId_fkey" FOREIGN KEY ("outwardId") REFERENCES "ProductionOutward"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackingControlPanel" ADD CONSTRAINT "PackingControlPanel_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesBillEntry" ADD CONSTRAINT "SalesBillEntry_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesBillEntry" ADD CONSTRAINT "SalesBillEntry_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesBillEntry" ADD CONSTRAINT "SalesBillEntry_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesBillEntry" ADD CONSTRAINT "SalesBillEntry_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Party"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesBillEntry" ADD CONSTRAINT "SalesBillEntry_deliveryTo_fkey" FOREIGN KEY ("deliveryTo") REFERENCES "Party"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesBillEntry" ADD CONSTRAINT "SalesBillEntry_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "OrderEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesBillEntry" ADD CONSTRAINT "SalesBillEntry_salesDeliveryId_fkey" FOREIGN KEY ("salesDeliveryId") REFERENCES "SalesDelivery"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesBillEntry" ADD CONSTRAINT "SalesBillEntry_taxTemplateId_fkey" FOREIGN KEY ("taxTemplateId") REFERENCES "TaxTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesBillEntry" ADD CONSTRAINT "SalesBillEntry_payTermId_fkey" FOREIGN KEY ("payTermId") REFERENCES "PayTerm"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesBillEntry" ADD CONSTRAINT "SalesBillEntry_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "Currency"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesBillEntry" ADD CONSTRAINT "SalesBillEntry_loadingId_fkey" FOREIGN KEY ("loadingId") REFERENCES "City"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesBillEntry" ADD CONSTRAINT "SalesBillEntry_deliveryId_fkey" FOREIGN KEY ("deliveryId") REFERENCES "City"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesBillEntry" ADD CONSTRAINT "SalesBillEntry_bankId_fkey" FOREIGN KEY ("bankId") REFERENCES "Bank"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesBillEntryItems" ADD CONSTRAINT "SalesBillEntryItems_salesBillEntryId_fkey" FOREIGN KEY ("salesBillEntryId") REFERENCES "SalesBillEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesBillEntryItems" ADD CONSTRAINT "SalesBillEntryItems_styleItemId_fkey" FOREIGN KEY ("styleItemId") REFERENCES "StyleItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesBillEntryItems" ADD CONSTRAINT "SalesBillEntryItems_sizeId_fkey" FOREIGN KEY ("sizeId") REFERENCES "Size"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesBillEntryItems" ADD CONSTRAINT "SalesBillEntryItems_uomId_fkey" FOREIGN KEY ("uomId") REFERENCES "Uom"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesBillEntryItems" ADD CONSTRAINT "SalesBillEntryItems_gsmId_fkey" FOREIGN KEY ("gsmId") REFERENCES "Gsm"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesBillEntryItems" ADD CONSTRAINT "SalesBillEntryItems_itemGroupId_fkey" FOREIGN KEY ("itemGroupId") REFERENCES "ItemGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesBillEntryItems" ADD CONSTRAINT "SalesBillEntryItems_hsnId_fkey" FOREIGN KEY ("hsnId") REFERENCES "Hsn"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesBillEntryItems" ADD CONSTRAINT "SalesBillEntryItems_itemSubGroupId_fkey" FOREIGN KEY ("itemSubGroupId") REFERENCES "ItemSubGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleBillEntryStyleBreakup" ADD CONSTRAINT "SaleBillEntryStyleBreakup_salesBillEntryItemsId_fkey" FOREIGN KEY ("salesBillEntryItemsId") REFERENCES "SalesBillEntryItems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleBillEntryStyleBreakup" ADD CONSTRAINT "SaleBillEntryStyleBreakup_styleId_fkey" FOREIGN KEY ("styleId") REFERENCES "Style"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleBillEntrySizeBreakup" ADD CONSTRAINT "SaleBillEntrySizeBreakup_saleBillEntryStyleBreakupId_fkey" FOREIGN KEY ("saleBillEntryStyleBreakupId") REFERENCES "SaleBillEntryStyleBreakup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleBillEntrySizeBreakup" ADD CONSTRAINT "SaleBillEntrySizeBreakup_sizeId_fkey" FOREIGN KEY ("sizeId") REFERENCES "Size"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleBillEntrySizeBreakup" ADD CONSTRAINT "SaleBillEntrySizeBreakup_SalesSizeBreakupId_fkey" FOREIGN KEY ("SalesSizeBreakupId") REFERENCES "SalesSizeBreakup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MobileNotification" ADD CONSTRAINT "MobileNotification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MobileNotification" ADD CONSTRAINT "MobileNotification_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MobileNotification" ADD CONSTRAINT "MobileNotification_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "Machine"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ApprovalRuleFieldToApprovalRuleOperator" ADD CONSTRAINT "_ApprovalRuleFieldToApprovalRuleOperator_A_fkey" FOREIGN KEY ("A") REFERENCES "ApprovalRuleField"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ApprovalRuleFieldToApprovalRuleOperator" ADD CONSTRAINT "_ApprovalRuleFieldToApprovalRuleOperator_B_fkey" FOREIGN KEY ("B") REFERENCES "ApprovalRuleOperator"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SalesOrderToattachments" ADD CONSTRAINT "_SalesOrderToattachments_A_fkey" FOREIGN KEY ("A") REFERENCES "SalesOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SalesOrderToattachments" ADD CONSTRAINT "_SalesOrderToattachments_B_fkey" FOREIGN KEY ("B") REFERENCES "attachments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
