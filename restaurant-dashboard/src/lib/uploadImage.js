import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from "../config";

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

// Uploads a photo to Cloudinary and returns an optimized URL (auto format, 800px wide).
export async function uploadImage(file) {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    throw new Error(
      "Cloudinary n'est pas configuré : ajoute NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME et NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET dans .env.local."
    );
  }
  if (!file.type.startsWith("image/")) throw new Error("Le fichier doit être une image.");
  if (file.size > MAX_SIZE) throw new Error("L'image est trop lourde (5 Mo maximum).");

  const body = new FormData();
  body.append("file", file);
  body.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
    method: "POST",
    body,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Échec de l'envoi de la photo : ${data.error?.message || res.status}`);

  return data.secure_url.replace("/upload/", "/upload/f_auto,q_auto,w_800/");
}
