function extractXsltFromXml(xmlString) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "application/xml");

  // doğru namespace'li öğeyi bul
  const embeddedXsltNode = xmlDoc.getElementsByTagName(
    "cbc:EmbeddedDocumentBinaryObject"
  )[0];
  if (!embeddedXsltNode) throw new Error("XSLT bulunamadı!");

  const base64Xslt = embeddedXsltNode.textContent;
  return base64Xslt;
}

function base64ToXsltDoc(base64Xslt) {
  const decodedXslt = atob(base64Xslt); // base64 çöz
  const parser = new DOMParser();
  const xsltDoc = parser.parseFromString(decodedXslt, "application/xml");
  return xsltDoc;
}

function parseXmlDocument(xmlString) {
  const parser = new DOMParser();
  return parser.parseFromString(xmlString, "application/xml");
}

function transformXmlWithXslt(xmlDoc, xsltDoc) {
  const processor = new XSLTProcessor();
  processor.importStylesheet(xsltDoc);
  const result = processor.transformToFragment(xmlDoc, document);
  return result;
}
export default function renderInvoiceHtmlFromXml(xmlString) {
  // 1. XML'den base64 XSLT'yi çıkar
  const base64Xslt = extractXsltFromXml(xmlString);

  // 2. Base64 çöz, XSLT belgesini oluştur
  const xsltDoc = base64ToXsltDoc(base64Xslt);

  // 3. XML belgesini oluştur
  const xmlDoc = parseXmlDocument(xmlString);

  // 4. Dönüştür
  const resultFragment = transformXmlWithXslt(xmlDoc, xsltDoc);

  // 5. Göster
  const container = document.getElementById("invoice-view");
  container.innerHTML = "";
  container.appendChild(resultFragment);
}
