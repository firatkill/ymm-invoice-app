import { parseStringPromise } from "xml2js";

function stripNamespaces(obj) {
  if (Array.isArray(obj)) {
    return obj.map(stripNamespaces);
  } else if (typeof obj === "object") {
    const newObj = {};
    for (let key in obj) {
      const newKey = key.includes(":") ? key.split(":")[1] : key;
      newObj[newKey] = stripNamespaces(obj[key]);
    }
    return newObj;
  } else {
    return obj;
  }
}

function getIDValue(idField) {
  if (!idField) return null;
  if (typeof idField === "string") return idField;
  if (typeof idField === "object" && "_" in idField) return idField._;
  return null;
}

export default async function extractFromXML(xmlString) {
  xmlString = xmlString.trim().replace(/^\uFEFF/, "");

  const parsed = await parseStringPromise(xmlString, { explicitArray: false });
  const xml = stripNamespaces(parsed);
  const inv = xml.Invoice;

  const invoice = {
    uuid: inv.UUID,
    invoiceNumber: inv.ID,
    issueDate: new Date(inv.IssueDate),
    invoiceTypeCode: inv.InvoiceTypeCode,
    currency: inv.DocumentCurrencyCode,
    supplierName: inv.AccountingSupplierParty?.Party?.PartyName?.Name,
    supplierTaxNumber: getIDValue(
      inv.AccountingSupplierParty?.Party?.PartyIdentification?.ID
    ),
    customerName: inv.AccountingCustomerParty?.Party?.PartyName?.Name,
    customerTaxNumber: getIDValue(
      inv.AccountingCustomerParty?.Party?.PartyIdentification?.ID
    ),
    taxExclusiveAmount: parseFloat(
      inv.LegalMonetaryTotal?.TaxExclusiveAmount?._
    ),
    payableAmount: parseFloat(inv.LegalMonetaryTotal?.PayableAmount?._),
    taxInclusiveAmount: parseFloat(
      inv.LegalMonetaryTotal?.TaxInclusiveAmount?._
    ),
    discountAmount: parseFloat(inv.LegalMonetaryTotal?.AllowanceTotalAmount?._),
    taxTotal: parseFloat(inv.TaxTotal?.TaxAmount?._),
  };

  return invoice;
}
