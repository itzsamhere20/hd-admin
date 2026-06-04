import { useEffect, useMemo, useState } from "react";
import api from "../api/api";
import toast from "react-hot-toast";
import {
  MessageCircle,
  Search,
  X,
  Eye,
  Trash2,
  Mail,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ArrowUpDown,
  ChevronDown,
  Inbox,
} from "lucide-react";

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("NEWEST");
  const [filter, setFilter] = useState("ALL"); // ALL | UNREAD | READ
  const [viewTarget, setViewTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  /* ── FETCH ── */
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/messages");
        setMessages(res.data || []);
      } catch (err) {
        toast.error("Failed to load messages");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ── MARK AS READ ── */
  const markAsRead = async (msg) => {
    if (msg.status !== "read") {
      try {
        await api.put(`/messages/${msg._id}/read`);
        setMessages((prev) =>
          prev.map((m) => (m._id === msg._id ? { ...m, status: "read" } : m)),
        );
        setViewTarget({ ...msg, status: "read" });
      } catch {
        setViewTarget(msg);
      }
    } else {
      setViewTarget(msg);
    }
  };

  /* ── DELETE ── */
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/messages/${deleteTarget._id}`);
      setMessages((p) => p.filter((m) => m._id !== deleteTarget._id));
      if (viewTarget?._id === deleteTarget._id) setViewTarget(null);
      setDeleteTarget(null);
      toast.success("Message deleted");
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  /* ── FILTER + SEARCH + SORT ── */
  const filtered = useMemo(() => {
    let data = [...messages];
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(
        (m) =>
          m.name?.toLowerCase().includes(q) ||
          m.email?.toLowerCase().includes(q) ||
          m.message?.toLowerCase().includes(q),
      );
    }
    if (filter === "UNREAD") data = data.filter((m) => m.status !== "read");
    if (filter === "READ") data = data.filter((m) => m.status === "read");
    if (sort === "NEWEST")
      data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (sort === "OLDEST")
      data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    return data;
  }, [messages, search, sort, filter]);

  const unreadCount = messages.filter((m) => m.status !== "read").length;
  const totalCount = messages.length;

  /* ── LOADING ── */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-black border-t-transparent animate-spin" />
          <p className="font-cormorant text-xl text-gray-500 tracking-widest">
            Loading messages...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 lg:p-8">
      {/* HEADER */}
      <div className="mb-8 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-luxury text-4xl lg:text-5xl text-gray-800 tracking-tight">
            Messages
          </h1>
          <p className="font-cormorant text-xl text-gray-500 mt-1">
            Customer inquiries inbox
          </p>
        </div>
        {unreadCount > 0 && (
          <div className="flex items-center gap-2 bg-black text-white text-sm px-4 py-2 rounded-2xl">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            {unreadCount} unread
          </div>
        )}
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard
          icon={<MessageCircle size={20} />}
          title="Total Messages"
          value={totalCount}
        />
        <StatCard
          icon={<Mail size={20} />}
          title="Unread"
          value={unreadCount}
          sub="awaiting response"
          accent
        />
        <StatCard
          icon={<CheckCircle2 size={20} />}
          title="Read"
          value={totalCount - unreadCount}
          sub="already reviewed"
        />
      </div>

      {/* CONTROLS */}
      <div className="bg-white border border-[#e7dcc7] rounded-3xl p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* SEARCH */}
          <div className="flex items-center gap-3 border border-[#e7dcc7] rounded-2xl px-4 py-3 flex-1">
            <Search size={17} className="text-gray-400 shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email or message..."
              className="w-full outline-none bg-transparent text-sm placeholder:text-gray-400"
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
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="appearance-none border border-[#e7dcc7] rounded-2xl px-4 py-3 pr-10 bg-white outline-none text-sm w-full lg:w-[160px]"
            >
              <option value="ALL">All Messages</option>
              <option value="UNREAD">Unread</option>
              <option value="READ">Read</option>
            </select>
            <ChevronDown
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>

          {/* SORT */}
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="appearance-none border border-[#e7dcc7] rounded-2xl px-4 py-3 pr-10 bg-white outline-none text-sm w-full lg:w-[160px]"
            >
              <option value="NEWEST">Newest First</option>
              <option value="OLDEST">Oldest First</option>
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
        message{filtered.length !== 1 ? "s" : ""}
      </p>

      {/* EMPTY */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-[#e7dcc7] rounded-3xl p-16 text-center">
          <Inbox size={40} className="mx-auto text-gray-200 mb-3" />
          <p className="font-cormorant text-2xl text-gray-400">
            No messages found
          </p>
        </div>
      ) : (
        <>
          {/* DESKTOP TABLE */}
          <div className="hidden lg:block bg-white border border-[#e7dcc7] rounded-3xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#f0ebe2]">
                  {["Sender", "Preview", "Date", "Status", ""].map((h, i) => (
                    <th
                      key={i}
                      className={`px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-widest ${i === 0 || i === 1 ? "text-left" : i === 4 ? "text-right" : "text-left"}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((msg, idx) => {
                  const isUnread = msg.status !== "read";
                  const date = new Date(msg.createdAt).toLocaleDateString(
                    "en-PK",
                    {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    },
                  );
                  return (
                    <tr
                      key={msg._id}
                      className={`border-b border-[#f9f6f1] transition-colors hover:bg-[#faf7f2] ${idx === filtered.length - 1 ? "border-none" : ""} ${isUnread ? "bg-amber-50/30" : ""}`}
                    >
                      {/* SENDER */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {/* AVATAR + UNREAD DOT */}
                          <div className="relative shrink-0">
                            <div className="w-10 h-10 rounded-xl bg-[#f7f4ef] border border-[#e7dcc7] flex items-center justify-center font-luxury text-gray-600 uppercase">
                              {msg.name?.[0] || "?"}
                            </div>
                            {isUnread && (
                              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-400 border-2 border-white" />
                            )}
                          </div>
                          <div>
                            <p
                              className={`text-sm ${isUnread ? "font-semibold text-gray-900" : "font-medium text-gray-700"}`}
                            >
                              {msg.name}
                            </p>
                            <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                              <Mail size={11} /> {msg.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* PREVIEW */}
                      <td className="px-6 py-4 max-w-[280px]">
                        <p
                          className={`text-sm truncate ${isUnread ? "text-gray-800" : "text-gray-500"}`}
                        >
                          {msg.message}
                        </p>
                      </td>

                      {/* DATE */}
                      <td className="px-6 py-4 text-sm text-gray-400 whitespace-nowrap">
                        {date}
                      </td>

                      {/* STATUS BADGE */}
                      <td className="px-6 py-4">
                        {isUnread ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />{" "}
                            Unread
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />{" "}
                            Read
                          </span>
                        )}
                      </td>

                      {/* ACTIONS */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <ActionBtn
                            icon={<Eye size={14} />}
                            title="View"
                            onClick={() => markAsRead(msg)}
                          />
                          <ActionBtn
                            icon={<Trash2 size={14} className="text-red-400" />}
                            title="Delete"
                            onClick={() => setDeleteTarget(msg)}
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
          <div className="lg:hidden space-y-3">
            {filtered.map((msg) => {
              const isUnread = msg.status !== "read";
              const date = new Date(msg.createdAt).toLocaleDateString("en-PK", {
                day: "numeric",
                month: "short",
                year: "numeric",
              });
              return (
                <div
                  key={msg._id}
                  className={`bg-white border rounded-3xl p-5 ${isUnread ? "border-amber-200 bg-amber-50/20" : "border-[#e7dcc7]"}`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        <div className="w-10 h-10 rounded-xl bg-[#f7f4ef] border border-[#e7dcc7] flex items-center justify-center font-luxury text-gray-600 uppercase">
                          {msg.name?.[0] || "?"}
                        </div>
                        {isUnread && (
                          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-400 border-2 border-white" />
                        )}
                      </div>
                      <div>
                        <p
                          className={`text-sm ${isUnread ? "font-semibold text-gray-900" : "font-medium text-gray-700"}`}
                        >
                          {msg.name}
                        </p>
                        <p className="text-xs text-gray-400">{msg.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {isUnread ? (
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                          Unread
                        </span>
                      ) : (
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Read
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                    {msg.message}
                  </p>
                  <div className="flex items-center justify-between border-t border-[#f0ebe2] pt-3">
                    <p className="text-xs text-gray-400">{date}</p>
                    <div className="flex gap-2">
                      <ActionBtn
                        icon={<Eye size={14} />}
                        title="View"
                        onClick={() => markAsRead(msg)}
                      />
                      <ActionBtn
                        icon={<Trash2 size={14} className="text-red-400" />}
                        title="Delete"
                        onClick={() => setDeleteTarget(msg)}
                        hover="hover:bg-red-50 hover:border-red-200"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ═══ VIEW MODAL ═══ */}
      {viewTarget && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-[99999]">
          <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl overflow-hidden">
            {/* MODAL HEADER */}
            <div className="sticky top-0 bg-white border-b border-[#f0ebe2] px-6 py-4 flex items-center justify-between rounded-t-3xl">
              <div>
                <h2 className="font-luxury text-2xl text-gray-800">
                  Message Details
                </h2>
                <p className="text-sm text-gray-400 font-cormorant mt-0.5">
                  {new Date(viewTarget.createdAt).toLocaleDateString("en-PK", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {viewTarget.status === "read" ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Read
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    Unread
                  </span>
                )}
                <button
                  onClick={() => setViewTarget(null)}
                  className="w-9 h-9 rounded-2xl border border-[#e7dcc7] flex items-center justify-center hover:bg-[#faf7f2] transition"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="px-6 py-5 space-y-4">
              {/* SENDER CARD */}
              <div className="bg-[#faf7f2] border border-[#e7dcc7] rounded-2xl p-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
                  Sender
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-[#e7dcc7] flex items-center justify-center font-luxury text-xl text-gray-600 uppercase shrink-0">
                    {viewTarget.name?.[0] || "?"}
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold text-gray-800">
                      {viewTarget.name}
                    </p>
                    <a
                      href={`mailto:${viewTarget.email}`}
                      className="text-sm text-gray-500 flex items-center gap-1.5 hover:text-gray-800 transition-colors"
                    >
                      <Mail size={13} /> {viewTarget.email}
                    </a>
                  </div>
                </div>
              </div>

              {/* DATE CARD */}
              <div className="bg-[#faf7f2] border border-[#e7dcc7] rounded-2xl p-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
                  Received
                </p>
                <p className="text-sm text-gray-700 flex items-center gap-2">
                  <Clock size={14} className="text-gray-400" />
                  {new Date(viewTarget.createdAt).toLocaleString("en-PK", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>

              {/* MESSAGE CARD */}
              <div className="border border-[#e7dcc7] rounded-2xl p-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
                  Message
                </p>
                <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {viewTarget.message}
                </p>
              </div>

              {/* REPLY + CLOSE */}
              <div className="flex gap-3 pt-1">
                <a
                  href={`mailto:${viewTarget.email}?subject=Re: Your inquiry&body=Hi ${viewTarget.name},%0D%0A%0D%0A`}
                  className="flex-1 h-[48px] rounded-2xl border border-[#e7dcc7] text-gray-700 hover:bg-[#faf7f2] transition flex items-center justify-center gap-2 text-sm"
                >
                  <Mail size={15} /> Reply via Email
                </a>
                <button
                  onClick={() => setViewTarget(null)}
                  className="flex-1 h-[48px] rounded-2xl bg-black text-white hover:opacity-80 transition text-sm font-medium"
                >
                  Close
                </button>
              </div>

              {/* DELETE FROM MODAL */}
              <button
                onClick={() => {
                  setViewTarget(null);
                  setDeleteTarget(viewTarget);
                }}
                className="w-full py-2 text-sm text-red-400 hover:text-red-600 transition flex items-center justify-center gap-2"
              >
                <Trash2 size={14} /> Delete this message
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ DELETE MODAL ═══ */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[999999]">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mb-4">
              <AlertTriangle size={22} className="text-red-500" />
            </div>
            <h2 className="font-luxury text-2xl text-gray-800">
              Delete Message?
            </h2>
            <p className="text-sm text-gray-500 mt-2 leading-relaxed">
              Message from{" "}
              <span className="font-medium text-gray-800">
                {deleteTarget.name}
              </span>{" "}
              will be permanently deleted.
            </p>
            <div className="flex gap-3 mt-6">
              <button
                disabled={deleting}
                onClick={() => setDeleteTarget(null)}
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
    </div>
  );
}

/* ── STAT CARD ── */
function StatCard({ icon, title, value, sub, accent }) {
  return (
    <div
      className={`border rounded-3xl p-5 flex items-center gap-4 ${accent && value > 0 ? "bg-amber-50 border-amber-200" : "bg-white border-[#e7dcc7]"}`}
    >
      <div
        className={`w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 ${accent && value > 0 ? "bg-amber-100 border-amber-200" : "bg-[#f7f4ef] border-[#e7dcc7]"}`}
      >
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

/* ── ACTION BTN ── */
function ActionBtn({ icon, onClick, title, hover = "hover:bg-[#faf7f2]" }) {
  return (
    <button
      title={title}
      onClick={onClick}
      className={`w-9 h-9 flex items-center justify-center border border-[#e7dcc7] rounded-2xl transition-colors ${hover}`}
    >
      {icon}
    </button>
  );
}
