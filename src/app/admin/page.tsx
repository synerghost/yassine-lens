"use client";

import { useEffect, useRef, useState } from "react";
import { CATEGORIES, CAT_LABEL } from "@/lib/categories";

type Photo = { file: string; w: number; h: number; cat: string; title: string; slug?: string };
type SecondaryPhoto = { file: string; w: number; h: number };
type Project = {
  cat: string; title: string; slug: string; main: string; folder: string;
  instagram: string; description: string; secondaryPhotos: SecondaryPhoto[];
};

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
  const [tab, setTab] = useState<"gallery" | "projects">("gallery");

  // Gallery state
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [galleryDirty, setGalleryDirty] = useState(false);
  const [galleryBusy, setGalleryBusy] = useState(false);
  const [galleryStatus, setGalleryStatus] = useState("");
  const galleryFileRef = useRef<HTMLInputElement>(null);

  // Projects state
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsDirty, setProjectsDirty] = useState(false);
  const [projectsBusy, setProjectsBusy] = useState(false);
  const [projectsStatus, setProjectsStatus] = useState("");
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);
  const secondaryFileRef = useRef<HTMLInputElement>(null);
  const [uploadingSlug, setUploadingSlug] = useState<string | null>(null);

  const loadSession = async () => {
    const r = await fetch("/api/admin/session", { cache: "no-store" }).then((x) => x.json());
    setConfigured(r.configured);
    setBlobOk(r.blob);
    if (r.authed) {
      await Promise.all([loadGallery(), loadProjects()]);
      setState("ready");
    } else {
      setState("login");
    }
  };

  const loadGallery = async () => {
    const r = await fetch("/api/admin/gallery", { cache: "no-store" });
    if (r.ok) { const d = await r.json(); setPhotos(d.photos || []); setGalleryDirty(false); }
  };

  const loadProjects = async () => {
    const r = await fetch("/api/admin/projects", { cache: "no-store" });
    if (r.ok) { const d = await r.json(); setProjects(d.projects || []); setProjectsDirty(false); }
  };

  useEffect(() => { loadSession(); }, []);

  const login = async (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    const r = await fetch("/api/admin/login", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (r.ok) { setPassword(""); setUsername(""); await loadSession(); }
    else { const d = await r.json().catch(() => ({})); setError(d.error || "Login failed."); }
  };

  const logout = async () => { await fetch("/api/admin/logout", { method: "POST" }); setState("login"); };

  // ── Gallery actions ─────────────────────────────────────────────────────────
  const onAddPhotos = async (files: FileList | null) => {
    if (!files?.length) return;
    setGalleryBusy(true);
    const added: Photo[] = [];
    for (let i = 0; i < files.length; i++) {
      setGalleryStatus(`Uploading ${i + 1}/${files.length}…`);
      const f = files[i];
      const dims = await readDims(f);
      const fd = new FormData(); fd.append("file", f);
      const r = await fetch("/api/admin/upload", { method: "POST", body: fd });
      if (r.ok) {
        const { url } = await r.json();
        added.push({ file: url, w: dims.w, h: dims.h, cat: "sports", title: f.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ") });
      }
    }
    setPhotos((p) => [...added, ...p]); setGalleryDirty(true); setGalleryBusy(false);
    setGalleryStatus(`${added.length} photo(s) added — save to publish.`);
    if (galleryFileRef.current) galleryFileRef.current.value = "";
  };

  const updatePhoto = (i: number, patch: Partial<Photo>) => {
    setPhotos((p) => p.map((x, j) => j === i ? { ...x, ...patch } : x)); setGalleryDirty(true);
  };
  const removePhoto = (i: number) => { setPhotos((p) => p.filter((_, j) => j !== i)); setGalleryDirty(true); };
  const movePhoto = (i: number, dir: -1 | 1) => {
    setPhotos((p) => { const j = i + dir; if (j < 0 || j >= p.length) return p; const n = [...p]; [n[i], n[j]] = [n[j], n[i]]; return n; });
    setGalleryDirty(true);
  };

  const saveGallery = async () => {
    setGalleryBusy(true); setGalleryStatus("Saving…");
    const r = await fetch("/api/admin/gallery", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ photos }) });
    setGalleryBusy(false);
    if (r.ok) { const d = await r.json(); setGalleryStatus(`Saved ✓ (${d.count} photos live)`); setGalleryDirty(false); }
    else { const d = await r.json().catch(() => ({})); setGalleryStatus(`Error: ${d.error || "save failed"}`); }
  };

  // ── Projects actions ─────────────────────────────────────────────────────────
  const updateProject = (slug: string, patch: Partial<Project>) => {
    setProjects((ps) => ps.map((p) => p.slug === slug ? { ...p, ...patch } : p));
    setProjectsDirty(true);
  };

  const removeSecondary = (slug: string, idx: number) => {
    setProjects((ps) => ps.map((p) => p.slug !== slug ? p : {
      ...p, secondaryPhotos: p.secondaryPhotos.filter((_, i) => i !== idx)
    }));
    setProjectsDirty(true);
  };

  const moveSecondary = (slug: string, idx: number, dir: -1 | 1) => {
    setProjects((ps) => ps.map((p) => {
      if (p.slug !== slug) return p;
      const arr = [...p.secondaryPhotos];
      const j = idx + dir;
      if (j < 0 || j >= arr.length) return p;
      [arr[idx], arr[j]] = [arr[j], arr[idx]];
      return { ...p, secondaryPhotos: arr };
    }));
    setProjectsDirty(true);
  };

  const onAddSecondary = async (slug: string, files: FileList | null) => {
    if (!files?.length) return;
    setUploadingSlug(slug); setProjectsBusy(true);
    const added: SecondaryPhoto[] = [];
    for (let i = 0; i < files.length; i++) {
      setProjectsStatus(`Uploading ${i + 1}/${files.length}…`);
      const f = files[i];
      const dims = await readDims(f);
      const fd = new FormData(); fd.append("file", f);
      const r = await fetch("/api/admin/upload", { method: "POST", body: fd });
      if (r.ok) { const { url } = await r.json(); added.push({ file: url, w: dims.w, h: dims.h }); }
    }
    setProjects((ps) => ps.map((p) => p.slug !== slug ? p : {
      ...p, secondaryPhotos: [...p.secondaryPhotos, ...added]
    }));
    setProjectsDirty(true); setProjectsBusy(false); setUploadingSlug(null);
    setProjectsStatus(`${added.length} photo(s) added — save to publish.`);
    if (secondaryFileRef.current) secondaryFileRef.current.value = "";
  };

  const saveProjects = async () => {
    setProjectsBusy(true); setProjectsStatus("Saving…");
    const r = await fetch("/api/admin/projects", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ projects }) });
    setProjectsBusy(false);
    if (r.ok) { const d = await r.json(); setProjectsStatus(`Saved ✓ (${d.count} projects live)`); setProjectsDirty(false); }
    else { const d = await r.json().catch(() => ({})); setProjectsStatus(`Error: ${d.error || "save failed"}`); }
  };

  // ── Styles ───────────────────────────────────────────────────────────────────
  const S = {
    page: { minHeight: "100vh", background: "#0a0a0a", color: "#f2f2f2", fontFamily: "Inter, system-ui, sans-serif", cursor: "auto" } as React.CSSProperties,
    wrap: { maxWidth: 1100, margin: "0 auto", padding: "40px 24px 100px" } as React.CSSProperties,
    label: { fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: "#8a8a8a" },
    input: { background: "#141414", border: "1px solid #262626", color: "#f2f2f2", borderRadius: 8, padding: "10px 12px", fontSize: 14, width: "100%", outline: "none" } as React.CSSProperties,
    textarea: { background: "#141414", border: "1px solid #262626", color: "#f2f2f2", borderRadius: 8, padding: "10px 12px", fontSize: 13, width: "100%", outline: "none", resize: "vertical" as const, minHeight: 72, fontFamily: "inherit" } as React.CSSProperties,
    btn: { background: "#fff", color: "#000", border: "none", borderRadius: 999, padding: "11px 22px", fontSize: 13, fontWeight: 500, cursor: "pointer" } as React.CSSProperties,
    btnGhost: { background: "transparent", color: "#f2f2f2", border: "1px solid #2a2a2a", borderRadius: 999, padding: "9px 18px", fontSize: 12, cursor: "pointer" } as React.CSSProperties,
    btnSmall: { background: "rgba(255,255,255,0.07)", color: "#f2f2f2", border: "1px solid #2a2a2a", borderRadius: 6, padding: "6px 10px", fontSize: 11, cursor: "pointer" } as React.CSSProperties,
  };

  if (state === "loading") return <div style={{ ...S.page, display: "grid", placeItems: "center" }}>Loading…</div>;

  if (state === "login") {
    return (
      <div style={{ ...S.page, display: "grid", placeItems: "center" }}>
        <form onSubmit={login} style={{ width: 320, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 16, letterSpacing: "0.22em" }}>YASSINE&apos;S&nbsp;LENS</div>
            <div style={{ ...S.label, marginTop: 6 }}>Admin</div>
          </div>
          {!configured && (
            <p style={{ fontSize: 12, color: "#e0a", lineHeight: 1.6 }}>
              ⚠️ <code>ADMIN_PASSWORD</code> n&apos;est pas défini dans Vercel.
            </p>
          )}
          <input type="text" placeholder="Identifiant" value={username} onChange={(e) => setUsername(e.target.value)} style={S.input} autoFocus autoComplete="username" />
          <input type="password" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} style={S.input} autoComplete="current-password" />
          {error && <p style={{ fontSize: 12, color: "#ff6b6b" }}>{error}</p>}
          <button type="submit" style={S.btn}>Se connecter</button>
        </form>
      </div>
    );
  }

  return (
    <div style={S.page}>
      <div style={S.wrap}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 18, letterSpacing: "0.2em" }}>YASSINE&apos;S&nbsp;LENS</div>
            <div style={S.label}>Gestion du contenu</div>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <a href="/" target="_blank" rel="noreferrer" style={S.btnGhost}>Voir le site ↗</a>
            <button onClick={logout} style={S.btnGhost}>Déconnexion</button>
          </div>
        </div>

        {!blobOk && (
          <p style={{ fontSize: 13, color: "#ffcf6b", background: "#1a1407", border: "1px solid #3a2e10", padding: "12px 14px", borderRadius: 8, marginBottom: 20, lineHeight: 1.6 }}>
            ⚠️ Vercel Blob n&apos;est pas activé. Upload/sauvegarde désactivés.
          </p>
        )}

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 24, borderBottom: "1px solid #1c1c1c", paddingBottom: 0 }}>
          {(["gallery", "projects"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} style={{
              background: "none", border: "none", color: tab === t ? "#f2f2f2" : "#555",
              fontSize: 13, padding: "10px 18px", cursor: "pointer",
              borderBottom: tab === t ? "2px solid #f2f2f2" : "2px solid transparent",
              marginBottom: -1, transition: "color .2s",
              fontWeight: tab === t ? 500 : 400,
            }}>
              {t === "gallery" ? "Galerie homepage" : "Projets"}
            </button>
          ))}
        </div>

        {/* ── GALLERY TAB ────────────────────────────────────────────────────── */}
        {tab === "gallery" && (
          <>
            <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap", position: "sticky", top: 0, background: "#0a0a0a", padding: "14px 0", zIndex: 5, borderBottom: "1px solid #1c1c1c", marginBottom: 16 }}>
              <button style={S.btn} onClick={() => galleryFileRef.current?.click()} disabled={galleryBusy}>+ Ajouter des photos</button>
              <input ref={galleryFileRef} type="file" accept="image/*" multiple hidden onChange={(e) => onAddPhotos(e.target.files)} />
              <button style={{ ...S.btn, opacity: galleryDirty ? 1 : 0.4 }} onClick={saveGallery} disabled={galleryBusy || !galleryDirty}>
                Enregistrer{galleryDirty ? " *" : ""}
              </button>
              <span style={{ fontSize: 12, color: "#8a8a8a" }}>{photos.length} photo(s)</span>
              {galleryStatus && <span style={{ fontSize: 12, color: "#9ad" }}>{galleryStatus}</span>}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>
              {photos.map((p, i) => (
                <div key={p.file + i} style={{ background: "#111", border: "1px solid #1f1f1f", borderRadius: 10, overflow: "hidden" }}>
                  <div style={{ position: "relative", aspectRatio: "4/3", background: "#000" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.file} alt={p.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <button onClick={() => removePhoto(i)} style={{ position: "absolute", top: 6, right: 6, width: 26, height: 26, borderRadius: "50%", background: "rgba(0,0,0,0.7)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", cursor: "pointer", fontSize: 14 }}>×</button>
                    <div style={{ position: "absolute", top: 6, left: 6, display: "flex", gap: 4 }}>
                      <button onClick={() => movePhoto(i, -1)} style={S.btnSmall}>↑</button>
                      <button onClick={() => movePhoto(i, 1)} style={S.btnSmall}>↓</button>
                    </div>
                  </div>
                  <div style={{ padding: 10, display: "flex", flexDirection: "column", gap: 7 }}>
                    <input value={p.title} onChange={(e) => updatePhoto(i, { title: e.target.value })} placeholder="Titre" style={{ ...S.input, padding: "7px 10px", fontSize: 12 }} />
                    <select value={p.cat} onChange={(e) => updatePhoto(i, { cat: e.target.value })} style={{ ...S.input, padding: "7px 10px", fontSize: 12, cursor: "pointer" }}>
                      {CATEGORIES.map((c) => <option key={c} value={c}>{CAT_LABEL[c]}</option>)}
                    </select>
                  </div>
                </div>
              ))}
            </div>
            {photos.length === 0 && <p style={{ color: "#8a8a8a", marginTop: 40, textAlign: "center" }}>Aucune photo. Clique « + Ajouter des photos ».</p>}
          </>
        )}

        {/* ── PROJECTS TAB ───────────────────────────────────────────────────── */}
        {tab === "projects" && (
          <>
            <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap", position: "sticky", top: 0, background: "#0a0a0a", padding: "14px 0", zIndex: 5, borderBottom: "1px solid #1c1c1c", marginBottom: 16 }}>
              <button style={{ ...S.btn, opacity: projectsDirty ? 1 : 0.4 }} onClick={saveProjects} disabled={projectsBusy || !projectsDirty}>
                Enregistrer les projets{projectsDirty ? " *" : ""}
              </button>
              <span style={{ fontSize: 12, color: "#8a8a8a" }}>{projects.length} projet(s)</span>
              {projectsStatus && <span style={{ fontSize: 12, color: "#9ad" }}>{projectsStatus}</span>}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {projects.map((proj) => (
                <div key={proj.slug} style={{ background: "#111", border: "1px solid #1f1f1f", borderRadius: 10, overflow: "hidden" }}>
                  {/* Project header row */}
                  <button
                    onClick={() => setExpandedSlug(expandedSlug === proj.slug ? null : proj.slug)}
                    style={{ width: "100%", background: "none", border: "none", cursor: "pointer", padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", color: "#f2f2f2", textAlign: "left" }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={`/photos/${proj.main}`} alt={proj.title} style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 6 }} />
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 500 }}>{proj.title}</div>
                        <div style={{ fontSize: 11, color: "#666", marginTop: 2 }}>{CAT_LABEL[proj.cat] || proj.cat} · {proj.secondaryPhotos.length} photos secondaires</div>
                      </div>
                    </div>
                    <span style={{ fontSize: 18, color: "#555" }}>{expandedSlug === proj.slug ? "−" : "+"}</span>
                  </button>

                  {/* Expanded project editor */}
                  {expandedSlug === proj.slug && (
                    <div style={{ padding: "0 18px 18px", borderTop: "1px solid #1c1c1c" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 14 }}>
                        <div>
                          <div style={S.label}>Titre</div>
                          <input value={proj.title} onChange={(e) => updateProject(proj.slug, { title: e.target.value })} style={{ ...S.input, marginTop: 6 }} />
                        </div>
                        <div>
                          <div style={S.label}>Instagram client (@handle)</div>
                          <input value={proj.instagram} placeholder="@handle" onChange={(e) => updateProject(proj.slug, { instagram: e.target.value })} style={{ ...S.input, marginTop: 6 }} />
                        </div>
                      </div>
                      <div style={{ marginTop: 12 }}>
                        <div style={S.label}>Description</div>
                        <textarea value={proj.description} onChange={(e) => updateProject(proj.slug, { description: e.target.value })} style={{ ...S.textarea, marginTop: 6 }} />
                      </div>

                      {/* Secondary photos */}
                      <div style={{ marginTop: 18 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                          <div style={S.label}>Photos secondaires ({proj.secondaryPhotos.length})</div>
                          <button style={S.btn} onClick={() => { setUploadingSlug(proj.slug); secondaryFileRef.current?.click(); }} disabled={projectsBusy}>
                            + Ajouter des photos
                          </button>
                        </div>
                        <input
                          ref={secondaryFileRef}
                          type="file" accept="image/*" multiple hidden
                          onChange={(e) => uploadingSlug && onAddSecondary(uploadingSlug, e.target.files)}
                        />
                        {uploadingSlug === proj.slug && projectsBusy && <p style={{ fontSize: 12, color: "#9ad" }}>{projectsStatus}</p>}

                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 8 }}>
                          {proj.secondaryPhotos.map((sp, si) => (
                            <div key={sp.file + si} style={{ position: "relative", aspectRatio: `${sp.w}/${sp.h}`, background: "#000", borderRadius: 6, overflow: "hidden" }}>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={sp.file} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                              <div style={{ position: "absolute", top: 0, left: 0, right: 0, display: "flex", justifyContent: "space-between", padding: 4, background: "linear-gradient(to bottom, rgba(0,0,0,0.5), transparent)" }}>
                                <div style={{ display: "flex", gap: 3 }}>
                                  <button onClick={() => moveSecondary(proj.slug, si, -1)} style={{ ...S.btnSmall, padding: "3px 6px" }}>↑</button>
                                  <button onClick={() => moveSecondary(proj.slug, si, 1)} style={{ ...S.btnSmall, padding: "3px 6px" }}>↓</button>
                                </div>
                                <button onClick={() => removeSecondary(proj.slug, si)} style={{ ...S.btnSmall, padding: "3px 6px" }}>×</button>
                              </div>
                            </div>
                          ))}
                        </div>
                        {proj.secondaryPhotos.length === 0 && (
                          <p style={{ fontSize: 12, color: "#555", textAlign: "center", padding: "20px 0" }}>Aucune photo secondaire.</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
