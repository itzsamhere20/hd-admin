import { useEffect, useMemo, useState } from "react";
import api from "../api/api";
import toast from "react-hot-toast";
import {
  Users,
  Search,
  X,
  Eye,
  Pencil,
  Trash2,
  ChevronDown,
  AlertTriangle,
  MapPin,
  Phone,
  Mail,
  CheckCircle2,
  Clock,
  User,
  ArrowUpDown,
  MessageCircle,
} from "lucide-react";

/* =========================
   MAIN COMPONENT
========================= */
export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("NEWEST");
  const [filter, setFilter] = useState("ALL"); // ALL | VERIFIED | INCOMPLETE

  // modals
  const [viewTarget, setViewTarget] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);

  // edit form
  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
  });

  /* FETCH */
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/user/all");
        setCustomers(res.data || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load customers");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* OPEN EDIT */
  const openEdit = (customer) => {
    setEditTarget(customer);
    setEditForm({
      name: customer.name || "",
      phone: customer.phone || "",
      address: customer.address || "",
      city: customer.city || "",
      postalCode: customer.postalCode || "",
    });
  };

  /* SAVE EDIT */
  const handleSave = async () => {
    if (!editTarget) return;
    setSaving(true);
    try {
      const res = await api.put(`/user/${editTarget._id}`, editForm);
      const updated = res.data.user;
      setCustomers((prev) =>
        prev.map((c) => (c._id === updated._id ? updated : c)),
      );
      if (viewTarget?._id === updated._id) setViewTarget(updated);
      setEditTarget(null);
      toast.success("Customer updated");
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  /* DELETE */
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/user/${deleteTarget._id}`);
      setCustomers((prev) => prev.filter((c) => c._id !== deleteTarget._id));
      if (viewTarget?._id === deleteTarget._id) setViewTarget(null);
      setDeleteTarget(null);
      toast.success("Customer deleted");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete customer");
    } finally {
      setDeleting(false);
    }
  };

  /* WHATSAPP */
  const openWhatsApp = (customer) => {
    const raw = customer.phone?.toString().replace(/\D/g, "");
    if (!raw) return toast.error("No phone number");
    const phone = raw.startsWith("92") ? raw : `92${raw.replace(/^0/, "")}`;
    window.open(`https://wa.me/${phone}`, "_blank");
  };

  /* FILTER + SEARCH + SORT */
  const filtered = useMemo(() => {
    let data = [...customers];

    if (search) {
      const q = search.toLowerCase();
      data = data.filter(
        (c) =>
          c.name?.toLowerCase().includes(q) ||
          c.email?.toLowerCase().includes(q) ||
          c.phone?.includes(search) ||
          c.city?.toLowerCase().includes(q),
      );
    }

    if (filter === "VERIFIED")
      data = data.filter((c) => c.isVerified && c.name && c.phone);
    if (filter === "INCOMPLETE")
      data = data.filter((c) => !c.name || !c.phone || !c.address);

    if (sort === "NEWEST")
      data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (sort === "OLDEST")
      data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    if (sort === "NAME")
      data.sort((a, b) => (a.name || "").localeCompare(b.name || ""));

    return data;
  }, [customers, search, filter, sort]);

  /* ANALYTICS */
  const totalCustomers = customers.length;
  const verifiedCount = customers.filter(
    (c) => c.isVerified && c.name && c.phone,
  ).length;
  const incompleteCount = customers.filter((c) => !c.name || !c.phone).length;

  /* LOADING */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-black border-t-transparent animate-spin" />
          <p className="font-cormorant text-xl text-gray-500 tracking-widest">
            Loading Customers...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 lg:p-8">
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="font-luxury text-4xl lg:text-5xl text-gray-800 tracking-tight">
          Customers
        </h1>
        <p className="font-cormorant text-xl text-gray-500 mt-1">
          View and manage your customer base
        </p>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard
          icon={<Users size={20} />}
          title="Total Customers"
          value={totalCustomers}
        />
        <StatCard
          icon={<CheckCircle2 size={20} />}
          title="Complete Profiles"
          value={verifiedCount}
          sub="with name & phone"
        />
        <StatCard
          icon={<Clock size={20} />}
          title="Incomplete"
          value={incompleteCount}
          sub="missing details"
        />
      </div>

      {/* CONTROLS */}
      <div className="bg-white border border-[#e7dcc7] rounded-3xl p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* SEARCH */}
          <div className="flex items-center gap-3 border border-[#e7dcc7] rounded-2xl px-4 py-3 flex-1">
            <Search size={17} className="text-gray-400 shrink-0" />
            <input
              className="w-full outline-none bg-transparent text-sm placeholder:text-gray-400"
              placeholder="Search by name, email, phone or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch("")}>
                <X size={15} className="text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>

          {/* FILTER */}
          <div className="relative">
            <select
              className="appearance-none border border-[#e7dcc7] rounded-2xl px-4 py-3 pr-10 bg-white outline-none text-sm w-full lg:w-[180px]"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="ALL">All Customers</option>
              <option value="VERIFIED">Complete Profile</option>
              <option value="INCOMPLETE">Incomplete</option>
            </select>
            <ChevronDown
              size={15}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>

          {/* SORT */}
          <div className="relative">
            <select
              className="appearance-none border border-[#e7dcc7] rounded-2xl px-4 py-3 pr-10 bg-white outline-none text-sm w-full lg:w-[180px]"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="NEWEST">Newest First</option>
              <option value="OLDEST">Oldest First</option>
              <option value="NAME">Name A–Z</option>
            </select>
            <ArrowUpDown
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>
        </div>
      </div>

      {/* RESULTS COUNT */}
      <p className="text-sm text-gray-400 mb-4 px-1">
        Showing{" "}
        <span className="text-gray-700 font-medium">{filtered.length}</span>{" "}
        customer{filtered.length !== 1 ? "s" : ""}
      </p>

      {/* EMPTY STATE */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-[#e7dcc7] rounded-3xl p-14 text-center">
          <Users size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="font-cormorant text-2xl text-gray-400">
            No customers found
          </p>
        </div>
      ) : (
        <>
          {/* DESKTOP TABLE */}
          <div className="hidden lg:block bg-white border border-[#e7dcc7] rounded-3xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#f0ebe2]">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-widest">
                    Customer
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-widest">
                    Contact
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-widest">
                    Location
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-widest">
                    Joined
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-widest">
                    Status
                  </th>
                  <th className="px-6 py-4" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((customer, idx) => {
                  const isComplete = !!(
                    customer.name &&
                    customer.phone &&
                    customer.address
                  );
                  const joined = new Date(
                    customer.createdAt,
                  ).toLocaleDateString("en-PK", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  });
                  return (
                    <tr
                      key={customer._id}
                      className={`border-b border-[#f9f6f1] hover:bg-[#faf7f2] transition-colors ${idx === filtered.length - 1 ? "border-none" : ""}`}
                    >
                      {/* NAME + EMAIL */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={customer.name} email={customer.email} />
                          <div>
                            <p className="font-medium text-gray-800 text-sm">
                              {customer.name || (
                                <span className="text-gray-300 italic">
                                  No name
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-gray-400">
                              {customer.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      {/* PHONE */}
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {customer.phone || (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      {/* CITY */}
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {customer.city ? (
                          `${customer.city}${customer.postalCode ? ` ${customer.postalCode}` : ""}`
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      {/* JOINED */}
                      <td className="px-6 py-4 text-sm text-gray-400">
                        {joined}
                      </td>
                      {/* STATUS */}
                      <td className="px-6 py-4">
                        {isComplete ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            Complete
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                            Incomplete
                          </span>
                        )}
                      </td>
                      {/* ACTIONS */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 justify-end">
                          <ActionBtn
                            icon={
                              <MessageCircle
                                size={14}
                                className="text-[#25D366]"
                              />
                            }
                            title="WhatsApp"
                            onClick={() => openWhatsApp(customer)}
                            hover="hover:bg-[#dcf8c6] hover:border-[#b2e5a0]"
                          />
                          <ActionBtn
                            icon={<Eye size={14} />}
                            title="View"
                            onClick={() => setViewTarget(customer)}
                          />
                          <ActionBtn
                            icon={<Pencil size={14} />}
                            title="Edit"
                            onClick={() => openEdit(customer)}
                          />
                          <ActionBtn
                            icon={<Trash2 size={14} className="text-red-400" />}
                            title="Delete"
                            onClick={() => setDeleteTarget(customer)}
                            hover="hover:bg-red-50 hover:border-red-200"
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* MOBILE CARDS */}
          <div className="lg:hidden space-y-4">
            {filtered.map((customer) => (
              <MobileCard
                key={customer._id}
                customer={customer}
                onView={setViewTarget}
                onEdit={openEdit}
                onDelete={setDeleteTarget}
                onWhatsApp={openWhatsApp}
              />
            ))}
          </div>
        </>
      )}

      {/* VIEW MODAL */}
      {viewTarget && (
        <ViewModal
          customer={viewTarget}
          onClose={() => setViewTarget(null)}
          onEdit={() => {
            openEdit(viewTarget);
          }}
          onDelete={() => {
            setViewTarget(null);
            setDeleteTarget(viewTarget);
          }}
          onWhatsApp={openWhatsApp}
        />
      )}

      {/* EDIT MODAL */}
      {editTarget && (
        <EditModal
          form={editForm}
          customer={editTarget}
          saving={saving}
          onChange={(field, val) =>
            setEditForm((p) => ({ ...p, [field]: val }))
          }
          onSave={handleSave}
          onClose={() => setEditTarget(null)}
        />
      )}

      {/* DELETE MODAL */}
      {deleteTarget && (
        <DeleteModal
          customer={deleteTarget}
          deleting={deleting}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

/* =========================
   MOBILE CARD
========================= */
function MobileCard({ customer, onView, onEdit, onDelete, onWhatsApp }) {
  const isComplete = !!(customer.name && customer.phone && customer.address);
  const joined = new Date(customer.createdAt).toLocaleDateString("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return (
    <div className="bg-white border border-[#e7dcc7] rounded-3xl p-5">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <Avatar name={customer.name} email={customer.email} />
          <div>
            <p className="font-medium text-gray-800 text-[15px]">
              {customer.name || (
                <span className="text-gray-300 italic text-sm">No name</span>
              )}
            </p>
            <p className="text-xs text-gray-400">{customer.email}</p>
          </div>
        </div>
        {isComplete ? (
          <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Complete
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Incomplete
          </span>
        )}
      </div>
      <div className="space-y-1.5 mb-4">
        {customer.phone && (
          <p className="text-sm text-gray-500 flex items-center gap-2">
            <Phone size={13} className="text-gray-300" />
            {customer.phone}
          </p>
        )}
        {customer.city && (
          <p className="text-sm text-gray-500 flex items-center gap-2">
            <MapPin size={13} className="text-gray-300" />
            {customer.city}
          </p>
        )}
        <p className="text-xs text-gray-400 pl-5">Joined {joined}</p>
      </div>
      <div className="flex gap-2 border-t border-[#f0ebe2] pt-4">
        <ActionBtn
          icon={<MessageCircle size={14} className="text-[#25D366]" />}
          title="WhatsApp"
          onClick={() => onWhatsApp(customer)}
          hover="hover:bg-[#dcf8c6] hover:border-[#b2e5a0]"
        />
        <ActionBtn
          icon={<Eye size={14} />}
          title="View"
          onClick={() => onView(customer)}
        />
        <ActionBtn
          icon={<Pencil size={14} />}
          title="Edit"
          onClick={() => onEdit(customer)}
        />
        <button
          onClick={() => onDelete(customer)}
          className="ml-auto flex items-center gap-1.5 text-sm bg-black text-white px-4 py-2 rounded-2xl hover:opacity-80 transition-opacity"
        >
          <Trash2 size={13} /> Delete
        </button>
      </div>
    </div>
  );
}

/* =========================
   VIEW MODAL
========================= */
function ViewModal({ customer, onClose, onEdit, onDelete, onWhatsApp }) {
  const isComplete = !!(customer.name && customer.phone && customer.address);
  const joined = new Date(customer.createdAt).toLocaleDateString("en-PK", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-[99999]">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto">
        {/* HEADER */}
        <div className="sticky top-0 bg-white border-b border-[#f0ebe2] px-6 py-4 flex items-center justify-between rounded-t-3xl z-10">
          <h2 className="font-luxury text-2xl text-gray-800">
            Customer Profile
          </h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-2xl border border-[#e7dcc7] flex items-center justify-center hover:bg-[#faf7f2] transition"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* AVATAR + NAME */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#f0ebe2] border border-[#e7dcc7] flex items-center justify-center text-2xl font-luxury text-gray-500 uppercase">
              {customer.name?.[0] || customer.email?.[0] || "?"}
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 text-lg">
                {customer.name || (
                  <span className="text-gray-400 font-normal italic">
                    No name set
                  </span>
                )}
              </h3>
              <p className="text-sm text-gray-400">Joined {joined}</p>
            </div>
            <div className="ml-auto">
              {isComplete ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Complete
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  Incomplete
                </span>
              )}
            </div>
          </div>

          {/* DETAILS */}
          <div className="bg-[#faf7f2] border border-[#e7dcc7] rounded-2xl p-4 space-y-3">
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
              Contact Info
            </h4>
            <InfoRow
              icon={<Mail size={14} />}
              label="Email"
              value={customer.email}
            />
            <InfoRow
              icon={<Phone size={14} />}
              label="Phone"
              value={customer.phone}
            />
            <InfoRow
              icon={<MapPin size={14} />}
              label="Address"
              value={customer.address}
            />
            <InfoRow
              icon={<MapPin size={14} />}
              label="City"
              value={
                customer.city
                  ? `${customer.city}${customer.postalCode ? `, ${customer.postalCode}` : ""}`
                  : null
              }
            />
          </div>

          {/* ACTIONS */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => onWhatsApp(customer)}
              className="flex items-center gap-2 text-sm border border-[#e7dcc7] px-4 py-2.5 rounded-2xl hover:bg-[#dcf8c6] hover:border-[#b2e5a0] transition-colors"
            >
              <MessageCircle size={15} className="text-[#25D366]" />
              WhatsApp
            </button>
            <button
              onClick={onEdit}
              className="flex items-center gap-2 text-sm border border-[#e7dcc7] px-4 py-2.5 rounded-2xl hover:bg-[#faf7f2] transition-colors"
            >
              <Pencil size={14} />
              Edit
            </button>
            <button
              onClick={onDelete}
              className="ml-auto flex items-center gap-2 text-sm border border-red-200 text-red-500 px-4 py-2.5 rounded-2xl hover:bg-red-50 transition-colors"
            >
              <Trash2 size={14} />
              Delete
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-full bg-primary text-white py-3 rounded-2xl font-medium hover:opacity-80 transition-opacity"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================
   EDIT MODAL
========================= */
function EditModal({ form, customer, saving, onChange, onSave, onClose }) {
  const fields = [
    { key: "name", label: "Full Name", placeholder: "e.g. Aisha Khan" },
    { key: "phone", label: "Phone Number", placeholder: "e.g. 03001234567" },
    { key: "city", label: "City", placeholder: "e.g. Lahore" },
    { key: "postalCode", label: "Postal Code", placeholder: "e.g. 54000" },
    { key: "address", label: "Full Address", placeholder: "Street, area..." },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-[999999]">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto">
        {/* HEADER */}
        <div className="sticky top-0 bg-white border-b border-[#f0ebe2] px-6 py-4 flex items-center justify-between rounded-t-3xl z-10">
          <div>
            <h2 className="font-luxury text-2xl text-gray-800">
              Edit Customer
            </h2>
            <p className="text-sm text-gray-400 font-cormorant">
              {customer.email}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-2xl border border-[#e7dcc7] flex items-center justify-center hover:bg-[#faf7f2] transition"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {fields.map(({ key, label, placeholder }) => (
            <div key={key}>
              <p className="text-sm text-gray-500 mb-1.5">{label}</p>
              <input
                type="text"
                value={form[key]}
                placeholder={placeholder}
                onChange={(e) => onChange(key, e.target.value)}
                className="w-full h-[50px] border border-[#e7dcc7] rounded-2xl px-4 outline-none bg-[#faf7f2] text-sm placeholder:text-gray-300 focus:border-gray-400 transition-colors"
              />
            </div>
          ))}

          <div className="flex gap-3 pt-2">
            <button
              disabled={saving}
              onClick={onClose}
              className="flex-1 h-[50px] rounded-2xl border border-[#e7dcc7] text-gray-700 hover:bg-[#faf7f2] transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              disabled={saving}
              onClick={onSave}
              className="flex-1 h-[50px] rounded-2xl bg-primary text-white hover:opacity-90 transition disabled:opacity-50 font-medium"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================
   DELETE MODAL
========================= */
function DeleteModal({ customer, deleting, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[9999999]">
      <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl">
        <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mb-4">
          <AlertTriangle size={22} className="text-red-500" />
        </div>
        <h2 className="font-luxury text-2xl text-gray-800">Delete Customer?</h2>
        <p className="text-sm text-gray-500 mt-2 leading-relaxed">
          <span className="font-medium text-gray-800">
            {customer.name || customer.email}
          </span>
          's account and all associated data will be permanently removed. This
          cannot be undone.
        </p>
        <div className="flex gap-3 mt-6">
          <button
            disabled={deleting}
            onClick={onCancel}
            className="flex-1 h-[48px] rounded-2xl border border-[#e7dcc7] text-gray-700 hover:bg-[#faf7f2] transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            disabled={deleting}
            onClick={onConfirm}
            className="flex-1 h-[48px] rounded-2xl bg-red-500 text-white hover:bg-red-600 transition disabled:opacity-50 font-medium"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================
   STAT CARD
========================= */
function StatCard({ icon, title, value, sub }) {
  return (
    <div className="bg-white border border-[#e7dcc7] rounded-3xl p-5 flex items-center gap-4">
      <div className="w-11 h-11 rounded-2xl bg-[#f7f4ef] border border-[#e7dcc7] flex items-center justify-center  text-primary/80 shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-400 uppercase tracking-widest">
          {title}
        </p>
        <h3 className="font-semibold text-gray-800 text-lg leading-tight">
          {value}
        </h3>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

/* =========================
   AVATAR
========================= */
function Avatar({ name, email }) {
  const letter = name?.[0] || email?.[0] || "?";
  return (
    <div className="w-10 h-10 rounded-xl bg-[#f0ebe2] border border-[#e7dcc7] flex items-center justify-center font-luxury text-gray-600 uppercase text-base shrink-0">
      {letter}
    </div>
  );
}

/* =========================
   ACTION BUTTON
========================= */
function ActionBtn({ icon, title, onClick, hover = "hover:bg-[#faf7f2]" }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`w-9 h-9 rounded-2xl border border-[#e7dcc7] flex items-center justify-center transition-colors ${hover}`}
    >
      {icon}
    </button>
  );
}

/* =========================
   INFO ROW (view modal)
========================= */
function InfoRow({ icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 text-sm">
      <span className="text-gray-300 mt-0.5 shrink-0">{icon}</span>
      <span className="text-gray-400 w-16 shrink-0">{label}</span>
      <span className="text-gray-800 font-medium">{value}</span>
    </div>
  );
}
