function extractXsltFromXml(xmlString) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "application/xml");

  const embeddedXsltNode = xmlDoc.getElementsByTagName(
    "cbc:EmbeddedDocumentBinaryObject"
  )[0];
  if (!embeddedXsltNode) throw new Error("XSLT bulunamadı!");

  const base64Xslt = embeddedXsltNode.textContent.trim(); // trim önemli!
  return base64Xslt;
}

// UTF-8 destekli base64 decoder
function base64ToXsltDoc(base64Xslt) {
  const binaryString = atob(base64Xslt);
  const binaryLen = binaryString.length;
  const bytes = new Uint8Array(binaryLen);

  for (let i = 0; i < binaryLen; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const decoder = new TextDecoder("utf-8");
  const decodedString = decoder.decode(bytes);

  const parser = new DOMParser();
  const xsltDoc = parser.parseFromString(decodedString, "application/xml");
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
  const base64Xslt = extractXsltFromXml(xmlString);
  const xsltDoc = base64ToXsltDoc(base64Xslt);
  const xmlDoc = parseXmlDocument(xmlString);
  const resultFragment = transformXmlWithXslt(xmlDoc, xsltDoc);

  const container = document.getElementById("invoice-view");
  container.innerHTML = "";
  container.appendChild(resultFragment);
}
