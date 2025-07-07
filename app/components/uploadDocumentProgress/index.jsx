import Image from "next/image";
import { useEffect, useState } from "react";

export default function UploadDocumentProgress({ documentId }) {
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);
  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await fetch(`/api/document-progress/${documentId}`);
      const data = await res.json();
      if (data.success) {
        setProgress(data.percentage);
        if (data.percentage >= 100) clearInterval(interval);
      } else {
        if (data.uploadCompleted != null) {
          if (data.uploadCompleted) setCompleted(true);

          clearInterval(interval);
        }
      }
    }, 2000); // 2 saniyede bir güncelle

    return () => clearInterval(interval);
  }, [documentId]);

  return (
    <div>
      {!completed && (
        <>
          {" "}
          <p>{progress}% yüklendi</p>
          <progress value={progress} max="100" />
        </>
      )}
      {completed && (
        <>
          <Image
            src="/icons/tick.svg"
            height={24}
            width={24}
            alt="Tamamlandı"
          />
        </>
      )}
    </div>
  );
}
