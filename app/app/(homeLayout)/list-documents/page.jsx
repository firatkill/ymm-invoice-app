"use client";
import UploadDocumentProgress from "@/components/uploadDocumentProgress";
import Image from "next/image";
import { useRouter } from "next/navigation";
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

export default function ListDocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [order, setOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [totalDocuments, setTotalDocuments] = useState(0);
  const router = useRouter();
  const ITEMS_PER_PAGE = 10;

  const search = useDebounce(searchInput, 400);

  const getDocumentsAsync = async () => {
    setLoading(true);
    try {
      // Build query parameters
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (typeFilter) params.append("type", typeFilter);
      if (order) params.append("order", order);
      params.append("page", page.toString());
      params.append("limit", ITEMS_PER_PAGE.toString());

      const documentsJSON = await fetch(
        `/api/document/get-documents?${params.toString()}`
      );
      const response = await documentsJSON.json();

      setDocuments(response.documents || []);
      setTotalPages(response.totalPages || 0);
      setTotalDocuments(response.totalDocuments || 0);
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setLoading(false);
    }
  };

  // herhangi bi filter değiştiğinde yeniden fetchle
  useEffect(() => {
    getDocumentsAsync();
  }, [search, typeFilter, order, page]);

  // her bir document içinde unique typeları set ile al // diğer page'lerde başka typelar olabilir, api'den çekilebilir bu
  const documentTypes = useMemo(() => {
    const types = documents.map((doc) => doc.type);
    return Array.from(new Set(types));
  }, [documents]);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Belgeler</h1>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
        {/* Search */}
        <input
          type="text"
          placeholder="Ara: Mükellef, Açıklama, Yıl..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 w-full md:w-64"
        />
        {/* Filters */}
        <div className="flex gap-2 items-center justify-end">
          {/* Belge Tipi Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border border-gray-300 rounded px-2 py-2"
          >
            <option value="">Tüm Tipler</option>
            {documentTypes.map((type) => (
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
            <option value="desc">Yükleme Tarihi (Yeni → Eski)</option>
            <option value="asc">Yükleme Tarihi (Eski → Yeni)</option>
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
          Toplam {totalDocuments} belge bulundu
        </div>
      )}

      {!loading && documents.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Henüz Belge Yüklenmemiş.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300 shadow-sm rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Durum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Mukellef
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Mükellef VKN
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Mükellef TCKN
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Belge Tipi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Belge Yılı
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Açıklama
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Yükleme Tarihi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {documents.map((document) => (
                <tr
                  onClick={() => router.push(`/list-documents/${document.id}`)}
                  key={document.id}
                  className="hover:bg-gray-50 cursor-pointer"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                    {document.uploadCompleted ? (
                      <Image
                        src="/icons/tick.svg"
                        height={24}
                        width={24}
                        alt="Tamamlandı"
                      />
                    ) : (
                      <UploadDocumentProgress documentId={document.id} />
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {document.mukellef.mukellef}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {document.mukellef.vkn}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {document.mukellef.tckn}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {document.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {document.year}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {document.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(document.createdAt).toLocaleDateString() +
                      " " +
                      new Date(document.createdAt).toLocaleTimeString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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
