import { useEffect, useState } from "react";
import {
  User2,
  ImagePlus,
  Save,
  Loader2,
  Trash2,
  Gem,
  Sparkles,
  Crown,
  Images,
} from "lucide-react";
import toast from "react-hot-toast";

import SettingsLayout from "../../../components/SettingsLayout";
import api from "../../../../../api/api";

const initialState = {
  /* ======================================================
     OWNER
  ====================================================== */
  name: "",
  description: "",
  image: "",
  public_id: "",

  /* ======================================================
     HERO
  ====================================================== */
  storyImage: "",
  storyImage_public_id: "",

  /* ======================================================
     ABOUT
  ====================================================== */
  aboutLeftImage: "",
  aboutLeftImage_public_id: "",

  aboutRightImage: "",
  aboutRightImage_public_id: "",

  aboutDescription: "",

  /* ======================================================
     PRECIOUS METAL
  ====================================================== */

  // OUR VALUE
  ourValueTitle: "Our Value",

  ourValueImage: "",
  ourValueImage_public_id: "",

  ourValueDescription: "",

  // CENTER IMAGE
  preciousCenterImage: "",
  preciousCenterImage_public_id: "",

  // PHILOSOPHY
  philosophyTitle: "Our Philosophy",

  philosophyImage: "",
  philosophyImage_public_id: "",

  philosophyDescription: "",
};

const OwnerSettings = () => {
  const [loading, setLoading] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const [form, setForm] = useState(initialState);

  const [preview, setPreview] = useState({});

  const [files, setFiles] = useState({
    image: null,

    storyImage: null,

    aboutLeftImage: null,
    aboutRightImage: null,

    ourValueImage: null,
    preciousCenterImage: null,
    philosophyImage: null,
  });

  /* ======================================================
     FETCH
  ====================================================== */
  useEffect(() => {
    const fetchOwner = async () => {
      try {
        const { data } = await api.get("/settings/store/owner");

        setForm({
          ...initialState,
          ...data,
        });
      } catch (err) {
        toast.error(err.response?.data?.message || err.message);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchOwner();
  }, []);

  /* ======================================================
     INPUT
  ====================================================== */
  const handleChange = (e) => {
    setDirty(true);

    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  /* ======================================================
     IMAGE SELECT
  ====================================================== */
  const handleImageSelect = (e, key) => {
    const file = e.target.files[0];

    if (!file) return;

    setDirty(true);

    setFiles((prev) => ({
      ...prev,
      [key]: file,
    }));

    setPreview((prev) => ({
      ...prev,
      [key]: URL.createObjectURL(file),
    }));
  };

  /* ======================================================
     UPLOAD IMAGE
  ====================================================== */
  const uploadImage = async (file) => {
    const formData = new FormData();

    formData.append("image", file);

    const res = await api.post("/upload", formData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    return {
      url: res.data.url,
      public_id: res.data.public_id,
    };
  };

  /* ======================================================
     PROCESS IMAGE
  ====================================================== */
  const processImage = async (key, publicKey) => {
    // NO NEW FILE
    if (!files[key]) {
      return {
        image: form[key],
        public_id: form[publicKey],
      };
    }

    // UPLOAD NEW IMAGE
    const uploaded = await uploadImage(files[key]);

    return {
      image: uploaded.url,
      public_id: uploaded.public_id,
    };
  };

  /* ======================================================
     SAVE
  ====================================================== */
  const handleSave = async () => {
    if (loading || !dirty) return;

    try {
      setLoading(true);

      /* ================= OWNER ================= */
      const ownerImage = await processImage("image", "public_id");

      /* ================= HERO ================= */
      const storyImage = await processImage(
        "storyImage",
        "storyImage_public_id",
      );

      /* ================= ABOUT ================= */
      const aboutLeftImage = await processImage(
        "aboutLeftImage",
        "aboutLeftImage_public_id",
      );

      const aboutRightImage = await processImage(
        "aboutRightImage",
        "aboutRightImage_public_id",
      );

      /* ================= PRECIOUS ================= */
      const ourValueImage = await processImage(
        "ourValueImage",
        "ourValueImage_public_id",
      );

      const preciousCenterImage = await processImage(
        "preciousCenterImage",
        "preciousCenterImage_public_id",
      );

      const philosophyImage = await processImage(
        "philosophyImage",
        "philosophyImage_public_id",
      );

      /* ======================================================
         PAYLOAD
      ====================================================== */
      const payload = {
        /* OWNER */
        name: form.name,
        description: form.description,

        image: ownerImage.image,
        public_id: ownerImage.public_id,

        /* HERO */
        storyImage: storyImage.image,
        storyImage_public_id: storyImage.public_id,

        /* ABOUT */
        aboutLeftImage: aboutLeftImage.image,

        aboutLeftImage_public_id: aboutLeftImage.public_id,

        aboutRightImage: aboutRightImage.image,

        aboutRightImage_public_id: aboutRightImage.public_id,

        aboutDescription: form.aboutDescription,

        /* PRECIOUS */
        ourValueTitle: form.ourValueTitle,

        ourValueImage: ourValueImage.image,

        ourValueImage_public_id: ourValueImage.public_id,

        ourValueDescription: form.ourValueDescription,

        preciousCenterImage: preciousCenterImage.image,

        preciousCenterImage_public_id: preciousCenterImage.public_id,

        philosophyTitle: form.philosophyTitle,

        philosophyImage: philosophyImage.image,

        philosophyImage_public_id: philosophyImage.public_id,

        philosophyDescription: form.philosophyDescription,
      };

      const { data } = await api.put("/settings/store/owner", payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setForm(data.owner);

      setDirty(false);

      setFiles({
        image: null,

        storyImage: null,

        aboutLeftImage: null,
        aboutRightImage: null,

        ourValueImage: null,
        preciousCenterImage: null,
        philosophyImage: null,
      });

      setPreview({});

      toast.success("About page updated successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ======================================================
     CLEAR
  ====================================================== */
  const handleClear = () => {
    setForm(initialState);

    setFiles({
      image: null,

      storyImage: null,

      aboutLeftImage: null,
      aboutRightImage: null,

      ourValueImage: null,
      preciousCenterImage: null,
      philosophyImage: null,
    });

    setPreview({});

    setDirty(true);
  };

  const isDisabled = loading || !dirty || initialLoading;

  /* ======================================================
     IMAGE COMPONENT
  ====================================================== */
  const ImageInput = ({ label, value, field }) => (
    <div className="space-y-3">
      <p className="text-[11px] tracking-[0.35em] uppercase text-neutral-400">
        {label}
      </p>

      <div className="relative h-[260px] border border-dashed border-[#d8cfc3] rounded-md bg-[#faf7f2] overflow-hidden flex items-center justify-center">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleImageSelect(e, field)}
          className="absolute inset-0 opacity-0 cursor-pointer z-10"
        />

        {preview[field] || value ? (
          <img
            src={preview[field] || value}
            alt={label}
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="text-center">
            <ImagePlus className="mx-auto text-neutral-400" size={30} />

            <p className="mt-3 text-sm text-neutral-500">Upload Image</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <SettingsLayout
      title="About Us Content"
      description="Manage complete About page content"
    >
      <div className="bg-white border border-[#ece7df] rounded-md overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.04)]">
        {/* ======================================================
           HEADER
        ====================================================== */}
        <div className="px-7 py-6 border-b border-[#f1ebe3] flex items-center gap-4">
          <div className="w-14 h-14 bg-[#faf7f2] border border-[#ece7df] flex items-center justify-center">
            <Gem size={24} className="text-primary" />
          </div>

          <div>
            <p className="text-[11px] tracking-[0.45em] uppercase text-neutral-400">
              Luxury Content
            </p>

            <h2 className="mt-2 text-4xl font-cormorant">
              About Page Settings
            </h2>
          </div>
        </div>

        {/* ======================================================
           CONTENT
        ====================================================== */}
        <div className="p-7 space-y-16">
          {/* ======================================================
             OWNER
          ====================================================== */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <User2 className="text-primary" />

              <h3 className="font-cormorant text-3xl">Owner Details</h3>
            </div>

            <ImageInput label="Owner Image" value={form.image} field="image" />

            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Owner Name"
              className="w-full h-14 px-5 rounded-md border border-[#ece7df] outline-none focus:border-primary"
            />

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={5}
              placeholder="Owner Description"
              className="w-full px-5 py-4 rounded-md border border-[#ece7df] resize-none outline-none focus:border-primary"
            />
          </div>

          {/* ======================================================
             OUR STORY
          ====================================================== */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Images className="text-primary" />

              <h3 className="font-cormorant text-3xl">Our Story Section</h3>
            </div>

            <ImageInput
              label="Our Story Image"
              value={form.storyImage}
              field="storyImage"
            />
          </div>

          {/* ======================================================
             ABOUT US
          ====================================================== */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Sparkles className="text-primary" />

              <h3 className="font-cormorant text-3xl">About Us Section</h3>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <ImageInput
                label="Left Image"
                value={form.aboutLeftImage}
                field="aboutLeftImage"
              />

              <ImageInput
                label="Right Image"
                value={form.aboutRightImage}
                field="aboutRightImage"
              />
            </div>

            <textarea
              name="aboutDescription"
              value={form.aboutDescription}
              onChange={handleChange}
              rows={6}
              placeholder="About Us Paragraph"
              className="w-full px-5 py-4 rounded-md border border-[#ece7df] resize-none outline-none focus:border-primary"
            />
          </div>

          {/* ======================================================
             PRECIOUS METAL
          ====================================================== */}
          <div className="space-y-10">
            <div className="flex items-center gap-3">
              <Crown className="text-primary" />

              <h3 className="font-cormorant text-3xl">
                Precious Metal Section
              </h3>
            </div>

            {/* ================= OUR VALUE ================= */}
            <div className="border border-[#f1ebe3] rounded-md p-6 space-y-6">
              <input
                type="text"
                name="ourValueTitle"
                value={form.ourValueTitle}
                onChange={handleChange}
                placeholder="Our Value Title"
                className="w-full h-14 px-5 rounded-md border border-[#ece7df] outline-none focus:border-primary"
              />

              <ImageInput
                label="Our Value Image"
                value={form.ourValueImage}
                field="ourValueImage"
              />

              <textarea
                name="ourValueDescription"
                value={form.ourValueDescription}
                onChange={handleChange}
                rows={5}
                placeholder="Our Value Paragraph"
                className="w-full px-5 py-4 rounded-md border border-[#ece7df] resize-none outline-none focus:border-primary"
              />
            </div>

            {/* ================= CENTER IMAGE ================= */}
            <div className="border border-[#f1ebe3] rounded-md p-6">
              <ImageInput
                label="Centered Image"
                value={form.preciousCenterImage}
                field="preciousCenterImage"
              />
            </div>

            {/* ================= PHILOSOPHY ================= */}
            <div className="border border-[#f1ebe3] rounded-md p-6 space-y-6">
              <input
                type="text"
                name="philosophyTitle"
                value={form.philosophyTitle}
                onChange={handleChange}
                placeholder="Philosophy Title"
                className="w-full h-14 px-5 rounded-md border border-[#ece7df] outline-none focus:border-primary"
              />

              <ImageInput
                label="Philosophy Image"
                value={form.philosophyImage}
                field="philosophyImage"
              />

              <textarea
                name="philosophyDescription"
                value={form.philosophyDescription}
                onChange={handleChange}
                rows={5}
                placeholder="Philosophy Paragraph"
                className="w-full px-5 py-4 rounded-md border border-[#ece7df] resize-none outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* ======================================================
             BUTTONS
          ====================================================== */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={isDisabled}
              className="h-14 px-8 bg-primary text-white uppercase tracking-[0.2em] text-sm flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Saving
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save Details
                </>
              )}
            </button>

            <button
              onClick={handleClear}
              disabled={loading}
              className="h-14 px-6 border border-[#ece7df] text-gray-600 uppercase tracking-[0.2em] text-sm flex items-center justify-center"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </SettingsLayout>
  );
};

export default OwnerSettings;
