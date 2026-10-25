import { useEffect, useState } from "react";

// Photo preview + "Choisir une photo" button. Calls onFile(file) when a file is picked.
const ImagePicker = ({ value, onFile }) => {
  const [preview, setPreview] = useState(value);

  useEffect(() => () => preview?.startsWith("blob:") && URL.revokeObjectURL(preview), [preview]);

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    onFile(file);
  };

  return (
    <div className="flex items-center gap-4">
      {preview ? (
        <img src={preview} alt="" className="w-20 h-20 rounded-xl object-cover flex-none" />
      ) : (
        <div className="w-20 h-20 rounded-xl bg-green-50 flex items-center justify-center text-3xl flex-none">🍽️</div>
      )}
      <label className="cursor-pointer py-2 px-4 rounded-lg border-2 text-gray-700 font-semibold hover:border-green-500">
        {preview ? "Changer la photo" : "Choisir une photo"}
        <input type="file" accept="image/*" className="hidden" onChange={handleChange} />
      </label>
    </div>
  );
};

export default ImagePicker;
