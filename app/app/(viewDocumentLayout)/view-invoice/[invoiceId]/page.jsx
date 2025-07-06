"use client";
import renderInvoiceHtmlFromXml from "@/functions/util/invoice";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function InvoiceView() {
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const filename = params.invoiceId;

  useEffect(() => {
    fetch(`/api/invoice/view-invoice?filename=${filename}.xml`)
      .then((res) => res.text())
      .then((xml) => {
        renderInvoiceHtmlFromXml(xml);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fatura yüklenemedi", err);
      });
  }, [filename]);

  return (
    <div className="flex  overflow-scroll items-center justify-center p-20">
      {loading && <p>Yükleniyor...</p>}
      <div id="invoice-view" />
    </div>
  );
}
