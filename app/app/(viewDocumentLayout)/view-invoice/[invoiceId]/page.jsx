"use client";
import renderInvoiceHtmlFromXml from "@/functions/util/invoice";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { usePDF } from "react-to-pdf/dist";

export default function InvoiceView() {
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const filename = params.invoiceId;
  const { toPDF, targetRef } = usePDF({ filename: "fatura.pdf" });

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
    <div className="flex flex-col items-center justify-center p-10">
      {loading && <p>Yükleniyor...</p>}

      {/* PDF İndir Butonu */}
      {!loading && (
        <div className="mb-4">
          <button
            className=" bg-amber-500 text-white px-10 py-5 rounded-xl text-xl cursor-pointer"
            onClick={() => toPDF()}
          >
            PDF Olarak İndir
          </button>
        </div>
      )}

      {/* Fatura Görünümü */}
      <div id="invoice-view" ref={targetRef} className=" border p-6   " />
    </div>
  );
}
