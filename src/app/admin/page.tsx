"use client";

import { useEffect, useRef, useState } from "react";
import { CATEGORIES, CAT_LABEL } from "@/lib/categories";

type Photo = { file: string; w: number; h: number; cat: string; title: string };
const CATS = CATEGORIES;

function readDims(file: File): Promise<{ w: number; h: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ w: img.naturalWidth || 1000, h: img.naturalHeight || 1000 });
    img.onerror = () => resolve({ w: 1000, h: 1000 });
    img.src = URL.createObjectURL(file);
  });
}

export default function AdminPage() {
  const [state, setState] = useState<"loading" | "login" | "ready">("loading");
  const [configured, setConfigured] = useState(true);
  const [blobOk, setBlobOk] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [dirty, setDirty] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const loadSession = async () => {
    const r = await fetch("/api/admin/session", { cache: "no-store" }).then((x) => x.json());
    setConfigured(r.configured);
    setBlobOk(r.blob);
    if (r.authed) {
      await loadGallery();
      setState("ready");
    } else {
      setState("login");
    }
  };

  const loadGallery = async () => {
    const r = await fetch("/api/admin/gallery", { cache: "no-store" });
    if (r.ok) {
      const d = await r.json();
      setPhotos(d.photos || []);
      setDirty(false);
    }
  };

  useEffect(() => {
    loadSession();
  }, []);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const r = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (r.ok) {
      setPassword("");
      setUsername("");
      await loadSession();
    } else {
      const d = await r.json().catch(() => ({}));
      setError(d.error || "Login failed.");
    }
  };

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    setState("login");
  };

  const onAddFiles = async (files: FileList | null) => {
    if (!files || !files.length) return;
    setBusy(true);
    setStatus("Uploading…");
    const added: Photo[] = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      setStatus(`Uploading ${i + 1}/${files.length}…`);
      const dims = await readDims(f);
      const fd = new FormData();
      fd.append("file", f);
      const r = await fetch("/api/admin/upload", { method: "POST", body: fd });
      if (r.ok) {
        const { url } = await r.json();
        added.push({
          file: url,
          w: dims.w,
          h: dims.h,
          cat: "nightlife",
          title: f.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "),
        });
      }
    }
    setPhotos((p) => [...added, ...p]);
    setDirty(true);
    setBusy(false);
    setStatus(`${added.length} photo(s) added — remember to Save.`);
    if (fileRef.current) fileRef.current.value = "";
  };

  const update = (i: number, patch: Partial<Photo>) => {
    setPhotos((p) => p.map((x, j) => (j === i ? { ...x, ...patch } : x)));
    setDirty(true);
  };
  const remove = (i: number) => {
    setPhotos((p) => p.filter((_, j) => j !== i));
    setDirty(true);
  };
  const move = (i: number, dir: -1 | 1) => {
    setPhotos((p) => {
      const j = i + dir;
      if (j < 0 || j >= p.length) return p;
      const n = [...p];
      [n[i], n[j]] = [n[j], n[i]];
      return n;
    });
    setDirty(true);
  };

  const save = async () => {
    setBusy(true);
    setStatus("Saving…");
    const r = await fetch("/api/admin/gallery", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ photos }),
    });
    setBusy(false);
    if (r.ok) {
      const d = await r.json();
      setStatus(`Saved ✓ (${d.count} photos live)`);
      setDirty(false);
    } else {
      const d = await r.json().catch(() => ({}));
      setStatus(`Error: ${d.error || "save failed"}`);
    }
  };

  // ---------- styles ----------
  const S = {
    page: { minHeight: "100vh", background: "#0a0a0a", color: "#f2f2f2", fontFamily: "Inter, system-ui, sans-serif", cursor: "auto" } as React.CSSProperties,
    wrap: { maxWidth: 1100, margin: "0 auto", padding: "40px 24px 100px" } as React.CSSProperties,
    label: { fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "#8a8a8a" } as React.CSSProperties,
    input: { background: "#141414", border: "1px solid #262626", color: "#f2f2f2", borderRadius: 8, padding: "10px 12px", fontSize: 14, width: "100%", outline: "none" } as React.CSSProperties,
    btn: { background: "#fff", color: "#000", border: "none", borderRadius: 999, padding: "11px 22px", fontSize: 13, fontWeight: 500, cursor: "pointer" } as React.CSSProperties,
    btnGhost: { background: "transparent", color: "#f2f2f2", border: "1px solid #2a2a2a", borderRadius: 999, padding: "9px 18px", fontSize: 12, cursor: "pointer" } as React.CSSProperties,
  };

  if (state === "loading") {
    return <div style={{ ...S.page, display: "grid", placeItems: "center" }}>Loading…</div>;
  }

  if (state === "login") {
    return (
      <div style={{ ...S.page, display: "grid", placeItems: "center" }}>
        <form onSubmit={login} style={{ width: 320, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 16, letterSpacing: "0.22em" }}>YASINES&nbsp;LENS</div>
            <div style={{ ...S.label, marginTop: 6 }}>Admin</div>
          </div>
          {!configured && (
            <p style={{ fontSize: 12, color: "#e0a", lineHeight: 1.6 }}>
              ⚠️ <code>ADMIN_PASSWORD</code> n&apos;est pas encore défini dans les variables
              d&apos;environnement Vercel. Ajoute-le puis redéploie.
            </p>
          )}
          <input
            type="text"
            placeholder="Identifiant"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={S.input}
            autoFocus
            autoComplete="username"
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={S.input}
            autoComplete="current-password"
          />
          {error && <p style={{ fontSize: 12, color: "#ff6b6b" }}>{error}</p>}
          <button type="submit" style={S.btn}>Se connecter</button>
        </form>
      </div>
    );
  }

  return (
    <div style={S.page}>
      <div style={S.wrap}>
        {/* header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, marginBottom: 8 }}>
          <div>
            <div style={{ fontSize: 18, letterSpacing: "0.2em" }}>YASINES&nbsp;LENS</div>
            <div style={S.label}>Gestion des médias</div>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <a href="/" target="_blank" rel="noreferrer" style={S.btnGhost}>Voir le site ↗</a>
            <button onClick={logout} style={S.btnGhost}>Déconnexion</button>
          </div>
        </div>

        {!blobOk && (
          <p style={{ fontSize: 13, color: "#ffcf6b", background: "#1a1407", border: "1px solid #3a2e10", padding: "12px 14px", borderRadius: 8, margin: "14px 0", lineHeight: 1.6 }}>
            ⚠️ Le stockage <b>Vercel Blob</b> n&apos;est pas activé. Crée un store Blob dans
            Vercel (Storage → Create → Blob, connecté à ce projet) pour pouvoir uploader et
            enregistrer. Tant que ce n&apos;est pas fait, l&apos;upload/sauvegarde échouera.
          </p>
        )}

        {/* toolbar */}
        <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap", position: "sticky", top: 0, background: "#0a0a0a", padding: "16px 0", zIndex: 5, borderBottom: "1px solid #1c1c1c" }}>
          <button style={S.btn} onClick={() => fileRef.current?.click()} disabled={busy}>+ Ajouter des photos</button>
          <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => onAddFiles(e.target.files)} />
          <button style={{ ...S.btn, opacity: dirty ? 1 : 0.45 }} onClick={save} disabled={busy || !dirty}>
            Enregistrer{dirty ? " *" : ""}
          </button>
          <span style={{ fontSize: 12, color: "#8a8a8a" }}>{photos.length} photo(s)</span>
          {status && <span style={{ fontSize: 12, color: "#9ad" }}>{status}</span>}
        </div>

        {/* grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 16, marginTop: 20 }}>
          {photos.map((p, i) => (
            <div key={p.file + i} style={{ background: "#111", border: "1px solid #1f1f1f", borderRadius: 12, overflow: "hidden" }}>
              <div style={{ position: "relative", aspectRatio: "4 / 3", background: "#000" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.file} alt={p.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <button
                  onClick={() => remove(i)}
                  title="Supprimer"
                  style={{ position: "absolute", top: 8, right: 8, width: 28, height: 28, borderRadius: "50%", background: "rgba(0,0,0,0.6)", color: "#fff", border: "1px solid rgba(255,255,255,0.25)", cursor: "pointer", fontSize: 14 }}
                >
                  ×
                </button>
                <div style={{ position: "absolute", top: 8, left: 8, display: "flex", gap: 4 }}>
                  <button onClick={() => move(i, -1)} title="Monter" style={{ width: 26, height: 26, borderRadius: 6, background: "rgba(0,0,0,0.6)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", cursor: "pointer" }}>↑</button>
                  <button onClick={() => move(i, 1)} title="Descendre" style={{ width: 26, height: 26, borderRadius: 6, background: "rgba(0,0,0,0.6)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", cursor: "pointer" }}>↓</button>
                </div>
              </div>
              <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                <input
                  value={p.title}
                  onChange={(e) => update(i, { title: e.target.value })}
                  placeholder="Titre"
                  style={{ ...S.input, padding: "8px 10px", fontSize: 13 }}
                />
                <select
                  value={p.cat}
                  onChange={(e) => update(i, { cat: e.target.value })}
                  style={{ ...S.input, padding: "8px 10px", fontSize: 13, cursor: "pointer" }}
                >
                  {CATS.map((c) => (
                    <option key={c} value={c}>{CAT_LABEL[c]}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>

        {photos.length === 0 && (
          <p style={{ color: "#8a8a8a", marginTop: 40, textAlign: "center" }}>
            Aucune photo. Clique « + Ajouter des photos » pour commencer.
          </p>
        )}
      </div>
    </div>
  );
}
