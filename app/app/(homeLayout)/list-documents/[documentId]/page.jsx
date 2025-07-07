"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

export default function ListInvoicesPage() {
  const params = useParams();
  const router = useRouter();
  const [invoices, setInvoices] = useState([]);
  const [mukellef, setMukellef] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [order, setOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [totalInvoices, setTotalInvoices] = useState(0);
  const ITEMS_PER_PAGE = 10;

  const search = useDebounce(searchInput, 400);

  const getInvoicesAsync = async () => {
    setLoading(true);
    try {
      const urlParams = new URLSearchParams();
      urlParams.append("documentId", params.documentId);
      if (search) urlParams.append("search", search);
      if (typeFilter) urlParams.append("type", typeFilter);
      if (order) urlParams.append("order", order);
      urlParams.append("page", page.toString());
      urlParams.append("limit", ITEMS_PER_PAGE.toString());

      const invoicesJSON = await fetch(
        `/api/invoice/get-invoices?${urlParams.toString()}`
      );
      const response = await invoicesJSON.json();

      setInvoices(response.invoices || []);
      setMukellef(response.mukellef);
      setTotalPages(response.totalPages || 0);
      setTotalInvoices(response.totalInvoices || 0);
    } catch (error) {
      console.error("Error fetching invoices:", error);
    } finally {
      setLoading(false);
    }
  };

  // herhangi bi filtre değiştiğinde yeniden fetchle
  useEffect(() => {
    getInvoicesAsync();
  }, [search, typeFilter, order, page]);

  // unique fatura tiplerini çek // api'den de çekilebilir,daha iyi olur.
  const invoiceTypes = useMemo(() => {
    const types = invoices.map((invoice) => invoice.invoiceTypeCode);
    return Array.from(new Set(types));
  }, [invoices]);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">
        Faturalar - Belge {params.documentId}
      </h1>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
        {/* Search */}
        <input
          type="text"
          placeholder="Ara: Fatura No, Satıcı, Alıcı..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 w-full md:w-64"
        />
        {/* Filters */}
        <div className="flex gap-2 items-center justify-end">
          {/* Fatura Türü Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border border-gray-300 rounded px-2 py-2"
          >
            <option value="">Tüm Türler</option>
            {invoiceTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {/* Sırala */}
          <select
            value={order}
            onChange={(e) => setOrder(e.target.value)}
            className="border border-gray-300 rounded px-2 py-2"
          >
            <option value="desc">İmza Tarihi (Yeni → Eski)</option>
            <option value="asc">İmza Tarihi (Eski → Yeni)</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-500">Yükleniyor...</p>
        </div>
      )}

      {/* Results Count */}
      {!loading && (
        <div className="mb-4 text-sm text-gray-600">
          Toplam {totalInvoices} fatura bulundu
        </div>
      )}

      {!loading && invoices.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Bu belgeye dair Hiç Fatura Yüklenmemiş.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300 shadow-sm rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Alış/Satış
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Fatura No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  İmza Tarihi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Fatura Tür Kodu
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Satıcı Adı
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Satıcı VKN
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Alıcı Adı
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Alıcı VKN
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Toplam Tutar
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Toplam Vergi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Toplam İskonto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Vergi Dahil Tutar
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Ödenecek Tutar
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Para Birimi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoices.map((invoice) => (
                <tr
                  onClick={() => router.push(`/view-invoice/${invoice.id}`)}
                  key={invoice.id}
                  className="hover:bg-gray-50 cursor-pointer"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                    {invoice.supplierTaxNumber == mukellef?.vkn
                      ? "Alış"
                      : "Satış"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {invoice.invoiceNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {invoice.issueDate}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {invoice.invoiceTypeCode}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {invoice.supplierName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {invoice.supplierTaxNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {invoice.customerName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {invoice.customerTaxNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {invoice.taxExclusiveAmount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {invoice.taxTotal}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {invoice.discountAmount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {invoice.taxInclusiveAmount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {invoice.payableAmount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {invoice.currency}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Önceki
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setPage(i + 1)}
              className={`px-3 py-1 border rounded ${
                page === i + 1 ? "bg-blue-500 text-white" : ""
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Sonraki
          </button>
        </div>
      )}
    </div>
  );
}

const SandClockSVG = () => {
  return (
    <svg
      height="200px"
      width="200px"
      version="1.1"
      id="Layer_1"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      fill="#000000"
    >
      <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
      <g
        id="SVGRepo_tracerCarrier"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></g>
      <g id="SVGRepo_iconCarrier">
        <path
          style={{ fill: "#DBE9FD" }}
          d="M406.261,122.435V16.696C406.261,7.473,398.782,0,389.565,0h-267.13 c-9.217,0-16.696,7.473-16.696,16.696v105.739c0,3.401,0.287,6.731,0.51,10.076H405.75 C405.974,129.165,406.261,125.836,406.261,122.435z"
        ></path>
        <path
          style={{ fill: "#C5DCFD" }}
          d="M389.565,0H256v132.511h149.751c0.224-3.346,0.51-6.675,0.51-10.076V16.696 C406.261,7.473,398.782,0,389.565,0z"
        ></path>
        <path
          style={{ fill: "#DBE9FD" }}
          d="M389.565,512h-267.13c-9.217,0-16.696-7.473-16.696-16.696V389.565 c0-82.853,67.403-150.261,150.261-150.261s150.261,67.408,150.261,150.261v105.739C406.261,504.527,398.782,512,389.565,512z"
        ></path>
        <path
          style={{ fill: "#C5DCFD" }}
          d="M389.565,512c9.217,0,16.696-7.473,16.696-16.696V389.565c0-82.853-67.403-150.261-150.261-150.261 V512H389.565z"
        ></path>
        <g>
          <path
            style={{ fill: "#EFBE44" }}
            d="M256,311.652c-9.217,0-16.696-7.473-16.696-16.696v-33.391c0-9.223,7.479-16.696,16.696-16.696 s16.696,7.473,16.696,16.696v33.391C272.696,304.179,265.217,311.652,256,311.652z"
          ></path>
          <path
            style={{ fill: "#EFBE44" }}
            d="M256,411.826c-9.217,0-16.696-7.473-16.696-16.696v-33.391c0-9.223,7.479-16.696,16.696-16.696 s16.696,7.473,16.696,16.696v33.391C272.696,404.353,265.217,411.826,256,411.826z"
          ></path>
        </g>
        <path
          style={{ fill: "#E4A738" }}
          d="M272.696,395.13v-33.391c0-9.223-7.479-16.696-16.696-16.696v66.783 C265.217,411.826,272.696,404.353,272.696,395.13z"
        ></path>
        <path
          style={{ fill: "#EFBE44" }}
          d="M389.565,512h-267.13c-7.032,0-13.304-4.402-15.696-11.011c-2.392-6.609-0.392-14.011,5.011-18.511 l112.185-93.489l0,0c18.587-15.478,45.544-15.478,64.13,0l112.186,93.49c5.403,4.5,7.402,11.902,5.011,18.511 C402.871,507.599,396.597,512,389.565,512z"
        ></path>
        <path
          style={{ fill: "#E4A738" }}
          d="M389.565,512c7.032,0,13.304-4.402,15.696-11.011c2.392-6.609,0.392-14.011-5.011-18.511 l-112.185-93.489c-9.294-7.739-20.679-11.609-32.066-11.609V512H389.565z"
        ></path>
        <path
          style={{ fill: "#6E6057" }}
          d="M422.957,512H89.043c-9.217,0-16.696-7.473-16.696-16.696s7.479-16.696,16.696-16.696h333.913 c9.217,0,16.696,7.473,16.696,16.696S432.174,512,422.957,512z"
        ></path>
        <path
          style={{ fill: "#615349" }}
          d="M422.957,478.609H256V512h166.957c9.217,0,16.696-7.473,16.696-16.696 S432.174,478.609,422.957,478.609z"
        ></path>
        <path
          style={{ fill: "#EFBE44" }}
          d="M106.249,132.511C111.6,212.548,178.195,272.696,256,272.696 c77.899,0,144.406-60.254,149.751-140.184H106.249z"
        ></path>
        <path
          style={{ fill: "#E4A738" }}
          d="M256,272.696c77.899,0,144.406-60.252,149.751-140.184H256V272.696z"
        ></path>
        <path
          style={{ fill: "#6E6057" }}
          d="M422.957,33.391H89.043c-9.217,0-16.696-7.473-16.696-16.696S79.826,0,89.043,0h333.913 c9.217,0,16.696,7.473,16.696,16.696S432.174,33.391,422.957,33.391z"
        ></path>
        <path
          style={{ fill: "#615349" }}
          d="M422.957,0H256v33.391h166.957c9.217,0,16.696-7.473,16.696-16.696S432.174,0,422.957,0z"
        ></path>
        <path
          style={{ fill: "#E4A738" }}
          d="M272.696,294.957v-33.391c0-9.223-7.479-16.696-16.696-16.696v66.783 C265.217,311.652,272.696,304.179,272.696,294.957z"
        ></path>
      </g>
    </svg>
  );
};
