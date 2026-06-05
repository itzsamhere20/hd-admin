import { useEffect, useState } from "react";
import api from "../../../../../api/api";
import toast from "react-hot-toast";
import SettingsLayout from "../../../components/SettingsLayout";
import {
  Plus,
  Trash2,
  Pencil,
  X,
  ChevronDown,
  ChevronUp,
  Check,
  AlertTriangle,
  HelpCircle,
  FolderPlus,
} from "lucide-react";

/* ══════════════════════════════════════
   MAIN
══════════════════════════════════════ */
export default function FAQSettings() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  // section add/edit
  const [sectionModal, setSectionModal] = useState(false); // "add" | "edit" | false
  const [editSection, setEditSection] = useState(null);
  const [sectionTitle, setSectionTitle] = useState("");
  const [savingSection, setSavingSection] = useState(false);

  // item add/edit
  const [itemModal, setItemModal] = useState(false); // {sectionId, item?}
  const [itemForm, setItemForm] = useState({ question: "", answer: "" });
  const [savingItem, setSavingItem] = useState(false);

  // delete
  const [deleteModal, setDeleteModal] = useState(null); // {type:"section"|"item", sectionId, itemId?, label}
  const [deleting, setDeleting] = useState(false);

  // expanded sections
  const [expanded, setExpanded] = useState({});

  /* ── FETCH ── */
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/settings/store/faq");
        setSections(res.data || []);
        // expand first section by default
        if (res.data?.length > 0) setExpanded({ [res.data[0]._id]: true });
      } catch {
        toast.error("Failed to load FAQs");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const toggleExpand = (id) => setExpanded((p) => ({ ...p, [id]: !p[id] }));

  /* ── ADD SECTION ── */
  const openAddSection = () => {
    setSectionTitle("");
    setEditSection(null);
    setSectionModal(true);
  };

  const openEditSection = (section) => {
    setSectionTitle(section.title);
    setEditSection(section);
    setSectionModal(true);
  };

  const handleSaveSection = async () => {
    if (!sectionTitle.trim()) return;
    setSavingSection(true);
    try {
      if (editSection) {
        const res = await api.put(
          `/settings/store/faq/section/${editSection._id}`,
          { title: sectionTitle },
        );
        setSections((p) =>
          p.map((s) => (s._id === editSection._id ? res.data : s)),
        );
        toast.success("Section updated");
      } else {
        const res = await api.post("/settings/store/faq/section", {
          title: sectionTitle,
        });
        setSections((p) => [...p, res.data]);
        setExpanded((p) => ({ ...p, [res.data._id]: true }));
        toast.success("Section added");
      }
      setSectionModal(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save");
    } finally {
      setSavingSection(false);
    }
  };

  /* ── ADD / EDIT ITEM ── */
  const openAddItem = (sectionId) => {
    setItemForm({ question: "", answer: "" });
    setItemModal({ sectionId, item: null });
  };

  const openEditItem = (sectionId, item) => {
    setItemForm({ question: item.question, answer: item.answer });
    setItemModal({ sectionId, item });
  };

  const handleSaveItem = async () => {
    if (!itemForm.question.trim() || !itemForm.answer.trim()) return;
    setSavingItem(true);
    try {
      if (itemModal.item) {
        const res = await api.put(
          `/settings/store/faq/section/${itemModal.sectionId}/item/${itemModal.item._id}`,
          itemForm,
        );
        setSections((p) =>
          p.map((s) => (s._id === itemModal.sectionId ? res.data : s)),
        );
        toast.success("FAQ updated");
      } else {
        const res = await api.post(
          `/settings/store/faq/section/${itemModal.sectionId}/item`,
          itemForm,
        );
        setSections((p) =>
          p.map((s) => (s._id === itemModal.sectionId ? res.data : s)),
        );
        toast.success("FAQ added");
      }
      setItemModal(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save");
    } finally {
      setSavingItem(false);
    }
  };

  /* ── DELETE ── */
  const handleDelete = async () => {
    if (!deleteModal) return;
    setDeleting(true);
    try {
      if (deleteModal.type === "section") {
        await api.delete(
          `/settings/store/faq/section/${deleteModal.sectionId}`,
        );
        setSections((p) => p.filter((s) => s._id !== deleteModal.sectionId));
        toast.success("Section deleted");
      } else {
        const res = await api.delete(
          `/settings/store/faq/section/${deleteModal.sectionId}/item/${deleteModal.itemId}`,
        );
        setSections((p) =>
          p.map((s) => (s._id === deleteModal.sectionId ? res.data : s)),
        );
        toast.success("FAQ deleted");
      }
      setDeleteModal(null);
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  /* ── LOADING ── */
  if (loading) {
    return (
      <SettingsLayout
        title="FAQ Management"
        description="Manage frequently asked questions"
      >
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 rounded-full border-2 border-black border-t-transparent animate-spin" />
        </div>
      </SettingsLayout>
    );
  }

  return (
    <SettingsLayout
      title="FAQ Management"
      description="Manage frequently asked questions for customers"
    >
      {/* ── HEADER ROW ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-luxury text-3xl text-gray-800">FAQ Sections</h1>
          <p className="font-cormorant text-lg text-gray-500 mt-0.5">
            {sections.length} section{sections.length !== 1 ? "s" : ""} ·{" "}
            {sections.reduce((a, s) => a + (s.items?.length || 0), 0)} questions
            total
          </p>
        </div>
        <button
          onClick={openAddSection}
          className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-2xl hover:opacity-80 transition text-sm font-medium"
        >
          <FolderPlus size={15} /> Add Section
        </button>
      </div>

      {/* ── EMPTY ── */}
      {sections.length === 0 && (
        <div className="bg-white border border-[#e7dcc7] rounded-3xl p-16 text-center">
          <HelpCircle size={40} className="mx-auto text-gray-200 mb-3" />
          <p className="font-cormorant text-2xl text-gray-400 mb-2">
            No FAQ sections yet
          </p>
          <p className="text-sm text-gray-400">
            Add your first section to get started
          </p>
          <button
            onClick={openAddSection}
            className="mt-5 inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-2xl hover:opacity-80 transition text-sm"
          >
            <FolderPlus size={14} /> Add First Section
          </button>
        </div>
      )}

      {/* ── SECTIONS ── */}
      <div className="space-y-4">
        {sections.map((section) => (
          <div
            key={section._id}
            className="bg-white border border-[#e7dcc7] rounded-3xl overflow-hidden"
          >
            {/* SECTION HEADER */}
            <div
              className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-[#faf7f2] transition-colors"
              onClick={() => toggleExpand(section._id)}
            >
              <div className="flex items-center gap-3">
                {expanded[section._id] ? (
                  <ChevronUp size={16} className="text-gray-400" />
                ) : (
                  <ChevronDown size={16} className="text-gray-400" />
                )}
                <div>
                  <p className="font-semibold text-gray-800">{section.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {section.items?.length || 0} question
                    {section.items?.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <div
                className="flex items-center gap-2"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => openAddItem(section._id)}
                  className="flex items-center gap-1.5 text-xs border border-[#e7dcc7] px-3 py-1.5 rounded-xl hover:bg-[#faf7f2] transition text-gray-600"
                >
                  <Plus size={12} /> Add FAQ
                </button>
                <button
                  onClick={() => openEditSection(section)}
                  className="w-8 h-8 rounded-xl border border-[#e7dcc7] flex items-center justify-center hover:bg-[#faf7f2] transition"
                >
                  <Pencil size={13} className="text-gray-500" />
                </button>
                <button
                  onClick={() =>
                    setDeleteModal({
                      type: "section",
                      sectionId: section._id,
                      label: `"${section.title}" section`,
                    })
                  }
                  className="w-8 h-8 rounded-xl border border-[#e7dcc7] flex items-center justify-center hover:bg-red-50 hover:border-red-200 transition"
                >
                  <Trash2 size={13} className="text-red-400" />
                </button>
              </div>
            </div>

            {/* ITEMS */}
            {expanded[section._id] && (
              <div className="border-t border-[#f0ebe2]">
                {section.items?.length === 0 ? (
                  <div className="px-6 py-8 text-center">
                    <p className="text-sm text-gray-400 mb-3">
                      No questions yet in this section
                    </p>
                    <button
                      onClick={() => openAddItem(section._id)}
                      className="inline-flex items-center gap-1.5 text-sm border border-[#e7dcc7] px-4 py-2 rounded-xl hover:bg-[#faf7f2] transition text-gray-600"
                    >
                      <Plus size={14} /> Add first question
                    </button>
                  </div>
                ) : (
                  <div>
                    {section.items.map((item, idx) => (
                      <div
                        key={item._id}
                        className={`px-6 py-4 flex items-start gap-4 hover:bg-[#faf7f2] transition-colors ${idx < section.items.length - 1 ? "border-b border-[#f9f6f1]" : ""}`}
                      >
                        {/* NUMBER */}
                        <div className="w-6 h-6 rounded-lg bg-[#f0ebe2] border border-[#e7dcc7] flex items-center justify-center text-[10px] text-gray-500 font-medium shrink-0 mt-0.5">
                          {idx + 1}
                        </div>

                        {/* CONTENT */}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 text-sm">
                            {item.question}
                          </p>
                          <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                            {item.answer}
                          </p>
                        </div>

                        {/* ACTIONS */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => openEditItem(section._id, item)}
                            className="w-8 h-8 rounded-xl border border-[#e7dcc7] flex items-center justify-center hover:bg-[#faf7f2] transition"
                          >
                            <Pencil size={12} className="text-gray-500" />
                          </button>
                          <button
                            onClick={() =>
                              setDeleteModal({
                                type: "item",
                                sectionId: section._id,
                                itemId: item._id,
                                label: `this question`,
                              })
                            }
                            className="w-8 h-8 rounded-xl border border-[#e7dcc7] flex items-center justify-center hover:bg-red-50 hover:border-red-200 transition"
                          >
                            <Trash2 size={12} className="text-red-400" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ═══ SECTION MODAL ═══ */}
      {sectionModal && (
        <Modal onClose={() => setSectionModal(false)}>
          <h2 className="font-luxury text-2xl text-gray-800 mb-1">
            {editSection ? "Edit Section" : "Add Section"}
          </h2>
          <p className="text-sm text-gray-400 font-cormorant mb-5">
            {editSection ? "Update section title" : "Create a new FAQ category"}
          </p>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-2">Section Title *</p>
              <input
                autoFocus
                type="text"
                value={sectionTitle}
                onChange={(e) => setSectionTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSaveSection()}
                placeholder="e.g. Delivery, Returns, Orders"
                className={INPUT}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                disabled={savingSection}
                onClick={() => setSectionModal(false)}
                className="flex-1 h-[48px] rounded-2xl border border-[#e7dcc7] text-gray-700 hover:bg-[#faf7f2] transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                disabled={savingSection || !sectionTitle.trim()}
                onClick={handleSaveSection}
                className="flex-1 h-[48px] rounded-2xl bg-primary text-white hover:opacity-80 transition disabled:opacity-40 font-medium flex items-center justify-center gap-2"
              >
                {savingSection ? (
                  "Saving..."
                ) : (
                  <>
                    <Check size={15} /> {editSection ? "Update" : "Add Section"}
                  </>
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ═══ ITEM MODAL ═══ */}
      {itemModal && (
        <Modal onClose={() => setItemModal(false)} wide>
          <h2 className="font-luxury text-2xl text-gray-800 mb-1">
            {itemModal.item ? "Edit Question" : "Add Question"}
          </h2>
          <p className="text-sm text-gray-400 font-cormorant mb-5">
            {sections.find((s) => s._id === itemModal.sectionId)?.title} section
          </p>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-2">Question *</p>
              <input
                autoFocus
                type="text"
                value={itemForm.question}
                onChange={(e) =>
                  setItemForm((p) => ({ ...p, question: e.target.value }))
                }
                placeholder="e.g. How long does delivery take?"
                className={INPUT}
              />
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-2">Answer *</p>
              <textarea
                rows={4}
                value={itemForm.answer}
                onChange={(e) =>
                  setItemForm((p) => ({ ...p, answer: e.target.value }))
                }
                placeholder="Write a clear, helpful answer..."
                className={INPUT + " py-3 resize-none h-auto"}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                disabled={savingItem}
                onClick={() => setItemModal(false)}
                className="flex-1 h-[48px] rounded-2xl border border-[#e7dcc7] text-gray-700 hover:bg-[#faf7f2] transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                disabled={
                  savingItem ||
                  !itemForm.question.trim() ||
                  !itemForm.answer.trim()
                }
                onClick={handleSaveItem}
                className="flex-1 h-[48px] rounded-2xl bg-primary text-white hover:opacity-80 transition disabled:opacity-40 font-medium flex items-center justify-center gap-2"
              >
                {savingItem ? (
                  "Saving..."
                ) : (
                  <>
                    <Check size={15} /> {itemModal.item ? "Update" : "Add FAQ"}
                  </>
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ═══ DELETE MODAL ═══ */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[999999]">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mb-4">
              <AlertTriangle size={22} className="text-red-500" />
            </div>
            <h2 className="font-luxury text-2xl text-gray-800">
              Delete {deleteModal.type === "section" ? "Section?" : "Question?"}
            </h2>
            <p className="text-sm text-gray-500 mt-2 leading-relaxed">
              {deleteModal.type === "section" ? (
                <>
                  Deleting{" "}
                  <span className="font-medium text-gray-800">
                    {deleteModal.label}
                  </span>{" "}
                  will also remove all questions inside it.
                </>
              ) : (
                <>This question will be permanently removed.</>
              )}{" "}
              This cannot be undone.
            </p>
            <div className="flex gap-3 mt-6">
              <button
                disabled={deleting}
                onClick={() => setDeleteModal(null)}
                className="flex-1 h-[48px] rounded-2xl border border-[#e7dcc7] text-gray-700 hover:bg-[#faf7f2] transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                disabled={deleting}
                onClick={handleDelete}
                className="flex-1 h-[48px] rounded-2xl bg-red-500 text-white hover:bg-red-600 transition disabled:opacity-50 font-medium"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </SettingsLayout>
  );
}

/* ── MODAL WRAPPER ── */
function Modal({ children, onClose, wide = false }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-[99999]">
      <div
        className={`bg-white w-full ${wide ? "max-w-lg" : "max-w-md"} rounded-t-3xl sm:rounded-3xl overflow-hidden`}
      >
        <div className="sticky top-0 bg-white flex items-center justify-end px-6 pt-4">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl border border-[#e7dcc7] flex items-center justify-center hover:bg-[#faf7f2] transition"
          >
            <X size={14} />
          </button>
        </div>
        <div className="px-6 pb-6">{children}</div>
      </div>
    </div>
  );
}

/* ── SHARED STYLES ── */
const INPUT =
  "w-full h-[50px] border border-[#e7dcc7] rounded-2xl px-4 outline-none bg-[#faf7f2] text-sm placeholder:text-gray-300 focus:border-gray-400 transition-colors";
