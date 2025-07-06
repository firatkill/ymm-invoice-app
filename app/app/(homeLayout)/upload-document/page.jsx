"use client";
import { useState } from "react";

const BELGE_TURU_LIST = [
  { value: "", label: "Belge Türü Seçin" },
  { value: "fatura", label: "Fatura" },
  { disabled: true, value: "irsaliye", label: "İrsaliye" },
];
const BELGE_YILI_LIST = [
  { value: "", label: "Yıl Seçin" },
  { value: "2024", label: "2024" },
  { value: "2023", label: "2023" },
  { value: "2022", label: "2022" },
  { value: "2021", label: "2021" },
  { value: "2020", label: "2020" },
  { value: "2019", label: "2019" },
  { value: "2018", label: "2018" },
  { value: "2017", label: "2017" },
  { value: "2016", label: "2016" },
  { value: "2015", label: "2015" },
  { value: "2014", label: "2014" },
  { value: "2013", label: "2013" },
];

export default function FaturaYuklePage() {
  const [form, setForm] = useState({
    mukellef: "",
    vkn: "",
    tckn: "",
    adSoyad: "",
    aciklama: "",
    belgeTuru: "",
    belgeYili: "",
    file: null,
  });
  const [dragActive, setDragActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setForm((prev) => ({ ...prev, file: e.dataTransfer.files[0] }));
    }
  };

  const validateForm = () => {
    if (!form.mukellef.trim()) {
      setError("Mükellef alanı zorunludur");
      return false;
    }
    if (!form.vkn.trim()) {
      setError("Mükellef VKN alanı zorunludur");
      return false;
    }
    if (!form.adSoyad.trim()) {
      setError("Mükellef Adı Soyadı alanı zorunludur");
      return false;
    }
    if (!form.belgeTuru) {
      setError("Belge Türü seçimi zorunludur");
      return false;
    }
    if (!form.belgeYili) {
      setError("Belge Yılı seçimi zorunludur");
      return false;
    }
    if (!form.file) {
      setError("Dosya yükleme zorunludur");
      return false;
    }
    if (form.file.size > 150 * 1024 * 1024) {
      // 150MB limit
      setError("Dosya boyutu 150MB'dan büyük olamaz");
      return false;
    }
    if (!form.file.name.toLowerCase().endsWith(".zip")) {
      setError("Sadece .zip dosyaları kabul edilir");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous messages
    setError("");
    setSuccess("");

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("mukellef", form.mukellef);
      formData.append("vkn", form.vkn);
      formData.append("tckn", form.tckn);
      formData.append("adSoyad", form.adSoyad);
      formData.append("aciklama", form.aciklama);
      formData.append("belgeTuru", form.belgeTuru);
      formData.append("belgeYili", form.belgeYili);
      formData.append("file", form.file);

      const response = await fetch("/api/document/create-document", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Bir hata oluştu");
      }

      setSuccess("Fatura başarıyla yüklendi!");
    } catch (err) {
      setError(err.message || "Fatura yüklenirken bir hata oluştu");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 sm:p-10 max-w-5xl mx-auto w-full">
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2 text-xl font-semibold text-indigo-700">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v16m8-8H4"
              />
            </svg>
            Belge Ekle
          </div>
          <button
            className="text-gray-400 hover:text-indigo-500 transition"
            title="Bilgi"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          </button>
        </div>

        {/* Error and Success Messages */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="mx-6 mt-4 p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
            {success}
          </div>
        )}

        <form
          className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6"
          autoComplete="off"
          onSubmit={handleSubmit}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mükellef
              </label>
              <input
                name="mukellef"
                value={form.mukellef}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                required
              />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mükellef VKN <span className="text-red-500">*</span>
                </label>
                <input
                  name="vkn"
                  value={form.vkn}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  required
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mükellef TCKN
                </label>
                <input
                  name="tckn"
                  value={form.tckn}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mükellef Adı Soyadı / Unvanı
                <span className="text-red-500">*</span>
              </label>
              <input
                name="adSoyad"
                value={form.adSoyad}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                required
              />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Belge Türü <span className="text-red-500">*</span>
                </label>
                <select
                  name="belgeTuru"
                  value={form.belgeTuru}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  required
                >
                  {BELGE_TURU_LIST.map((b) => (
                    <option key={b.value} disabled={b.disabled} value={b.value}>
                      {b.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Belge Yılı <span className="text-red-500">*</span>
                </label>
                <select
                  name="belgeYili"
                  value={form.belgeYili}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  required
                >
                  {BELGE_YILI_LIST.map((y) => (
                    <option key={y.value} value={y.value}>
                      {y.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Açıklama
              </label>
              <textarea
                name="aciklama"
                value={form.aciklama}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 min-h-[60px] focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>
          </div>
          <div className="space-y-4 flex flex-col justify-between">
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dosya Yükle
              </label>
              <div
                className={`border-2 border-dashed rounded px-4 py-6 flex flex-col items-center justify-center bg-gray-50 transition ${
                  dragActive
                    ? "border-indigo-400 bg-indigo-50"
                    : "border-gray-200"
                }`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  name="file"
                  accept=".zip"
                  onChange={handleChange}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer px-4 py-2 bg-white border border-gray-300 rounded shadow-sm hover:bg-indigo-50 transition"
                >
                  Dosya Seç
                </label>
                <span className="mt-2 text-gray-500 text-sm">
                  veya sürükle (".zip" maks. 150 mb)
                </span>
                {form.file && (
                  <span className="mt-2 text-indigo-600 text-sm font-medium">
                    {form.file.name}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="col-span-1 md:col-span-2 flex justify-end gap-3 mt-2">
            <button
              type="button"
              className="px-5 py-2 rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 transition"
              onClick={() => {
                setForm({
                  mukellef: "",
                  vkn: "",
                  tckn: "",
                  adSoyad: "",
                  aciklama: "",
                  belgeTuru: "",
                  belgeYili: "",
                  file: null,
                });
                setError("");
                setSuccess("");
              }}
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-2 rounded font-semibold transition ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#1796b6] text-white hover:bg-[#127a94]"
              }`}
            >
              {isSubmitting ? "Yükleniyor..." : "Kaydet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
