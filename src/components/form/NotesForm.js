"use client";
import React, { useEffect, useMemo, useRef } from "react";

/** Robust parser untuk division_notes yang sering “kotor”.
 *  - Terima array JS / string JSON valid / string pseudo-JSON dgn kutip melengkung
 *  - Quote key (division|timestamp|msg|author)
 *  - Quote nilai tanggal dd/MM/yyyy, hilangkan trailing comma
 */
function parseDivisionNotes(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;

  if (typeof raw !== "string") {
    const s = String(raw ?? "").trim();
    if (!s) return [];
    raw = s;
  }

  const trimmed = raw.trim();
  // kalau bukan array, kembalikan single bubble
  if (!(trimmed.startsWith("[") && trimmed.endsWith("]"))) {
    return [
      {
        division: "NOTE",
        timestamp: null,
        msg: trimmed,
        author: "System",
      },
    ];
  }

  // 1) coba parse langsung
  try {
    const arr = JSON.parse(trimmed);
    return Array.isArray(arr) ? arr : [];
  } catch { }

  // 2) normalisasi lalu parse
  let s = trimmed
    .replace(/[\u2018\u2019]/g, "'") // ‘ ’ -> '
    .replace(/[\u201C\u201D]/g, '"'); // “ ” -> "

  // quote keys
  s = s.replace(
    /(\s|^)(division|timestamp|msg|author)\s*:/g,
    '"$2":'
  );

  // quote tanggal dd/MM/yyyy jika tidak dikutip
  s = s.replace(
    /"timestamp"\s*:\s*([0-9]{1,2}\/[0-9]{1,2}\/[0-9]{4})/g,
    '"timestamp":"$1"'
  );

  // single quotes -> double quotes untuk string value
  s = s.replace(/'([^']*)'/g, '"$1"');

  // hilangkan trailing comma sebelum } atau ]
  s = s.replace(/,\s*([}\]])/g, "$1");

  // fallback terakhir: nilai tanpa kutip sederhana (alnum/underscore)
  s = s.replace(/:\s*([A-Za-z0-9_]+)\s*([,}])/g, ':"$1"$2');

  try {
    const arr = JSON.parse(s);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function fmtDateTime(s) {
  if (!s) return "";
  // sudah dd/MM/yyyy?
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(s)) return s;

  const d = new Date(s);
  if (isNaN(d)) return String(s);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${dd}/${mm}/${yyyy} ${hh}:${mi}`;
}

// Aturan bubble: CXC/EMPLOYEE di kanan, lainnya di kiri
const isRightSide = (division = "") => {
  const dv = String(division).toUpperCase();
  return dv === "CXC" || dv === "EMPLOYEE";
};

const NotesForm = ({ detail }) => {
  const raw =
    detail?.notes?.raw ??
    detail?.__raw?.division_notes ??
    "";

  const notes = useMemo(() => {
    const arr = parseDivisionNotes(raw);
    return arr.map((n, i) => ({
      id: i,
      division: n?.division ?? "",
      timestamp: n?.timestamp ?? "",
      author: n?.author ?? n?.division ?? "",
      message: n?.msg ?? n?.message ?? "",
    }));
  }, [raw]);

  const scrollRef = useRef(null);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [notes]);

  return (
    <div className="w-full bg-blue-100 p-6 mb-6 rounded-lg border border-gray-300">
      <div className="bg-blue-500 text-white text-center py-2 px-4 rounded-t-lg -m-6 mb-6">
        <h2 className="text-lg font-semibold">Notes</h2>
      </div>

      <div
        ref={scrollRef}
        className="bg-white border border-gray-200 rounded-lg p-4 max-h-96 overflow-y-auto"
      >
        {!notes.length ? (
          <div className="text-sm text-gray-500">No notes yet</div>
        ) : (
          notes.map((n) => {
            const right = isRightSide(n.division);
            return (
              <div
                key={n.id}
                className={`flex mb-3 ${right ? "justify-end" : "justify-start"}`}
              >
                {/* avatar kecil */}
                {!right && (
                  <div className="mr-2 flex h-8 w-8 items-center justify-center rounded-full bg-blue-200 text-blue-800 text-xs font-semibold">
                    {String(n.division || "?").slice(0, 2).toUpperCase()}
                  </div>
                )}

                <div
                  className={[
                    "max-w-[70%] px-3 py-2 text-sm shadow rounded-2xl",
                    right
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-gray-100 text-gray-900 rounded-bl-none",
                  ].join(" ")}
                >
                  <div
                    className={`text-[11px] mb-1 ${right ? "text-white/80" : "text-gray-500"
                      }`}
                  >
                    <span className="font-medium">
                      {n.author || n.division || "Unknown"}
                    </span>{" "}
                    • {fmtDateTime(n.timestamp)}
                  </div>
                  <div className="whitespace-pre-wrap break-words">
                    {n.message}
                  </div>
                </div>

                {right && (
                  <div className="ml-2 flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-semibold">
                    {String(n.division || "ME").slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default NotesForm;
