"use client";

import { useEffect, useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import { CATEGORIES, CAT_LABEL } from "@/lib/categories";

function isHeic(file: File): boolean {
  const t = (file.type || "").toLowerCase();
  const n = file.name.toLowerCase();
  return t.includes("heic") || t.includes("heif") || n.endsWith(".heic") || n.endsWith(".heif");
}

/**
 * Convert HEIC/HEIF (default iPhone/iPad format) to JPEG in the browser so the
 * photos display everywhere (Chrome/Android can't render HEIC). Safari decodes
 * HEIC natively into an <img>, which we re-encode to JPEG via a canvas. No
 * external dependency. Falls back to the original file if conversion fails.
 * Non-HEIC files are returned untouched (no quality change).
 */
async function maybeConvertHeic(file: File): Promise<File> {
  if (!isHeic(file)) return file;
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const im = new Image();
      im.onload = () => resolve(im);
      im.onerror = () => reject(new Error("HEIC decode not supported in this browser"));
      im.src = url;
    });
    const maxDim = 3000; // generous web-quality cap
    const ratio = Math.min(1, maxDim / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.round(img.naturalWidth * ratio);
    const h = Math.round(img.naturalHeight * ratio);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(img, 0, 0, w, h);
    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/jpeg", 0.92));
    if (!blob) return file;
    const newName = file.name.replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], newName, { type: "image/jpeg" });
  } catch {
    return file; // fall back to original (allowlist still permits heic)
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Upload a file directly from the browser to Vercel Blob (no 4.5 MB limit). */
async function uploadFile(file: File): Promise<string> {
  const toUpload = await maybeConvertHeic(file);
  const ext = (toUpload.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const pathname = `photos/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const blob = await upload(pathname, toUpload, {
    access: "public",
    handleUploadUrl: "/api/admin/upload",
    contentType: toUpload.type || undefined,
    multipart: true, // robust for large photos
  });
  return blob.url;
}

type Photo = { file: string; w: number; h: number; cat: string; title: string; slug?: string };
type SecondaryPhoto = { file: string; w: number; h: number };
type Project = {
  cat: string; title: string; slug: string; main: string; mainW?: number; mainH?: number; folder: string;
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
  const [tab, setTab] = useState<"gallery" | "projects">("projects");

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
  const mainImageFileRef = useRef<HTMLInputElement>(null);
  const [mainImageSlug, setMainImageSlug] = useState<string | null>(null);
  const [showNewProjectForm, setShowNewProjectForm] = useState(false);
  const [newProjectData, setNewProjectData] = useState({ title: "", cat: "sports" });

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
    let failed = 0;
    for (let i = 0; i < files.length; i++) {
      setGalleryStatus(`Uploading ${i + 1}/${files.length}…`);
      const f = files[i];
      const dims = await readDims(f);
      try {
        const url = await uploadFile(f);
        added.push({ file: url, w: dims.w, h: dims.h, cat: "sports", title: f.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ") });
      } catch (err) {
        failed++;
        console.error("Upload failed:", err);
      }
    }
    setPhotos((p) => [...added, ...p]); setGalleryDirty(true); setGalleryBusy(false);
    setGalleryStatus(failed
      ? `${added.length} added, ${failed} failed (${(files[0] as File)?.type || "unknown type"}).`
      : `${added.length} photo(s) added — save to publish.`);
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

  const slugify = (s: string) =>
    s.toLowerCase().normalize("NFD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

  const createProject = () => {
    const title = newProjectData.title.trim();
    if (!title) { setProjectsStatus("Enter a project title first."); return; }
    const base = slugify(title) || `project-${Date.now()}`;
    const existing = new Set(projects.map((p) => p.slug));
    let slug = base, n = 2;
    while (existing.has(slug)) slug = `${base}-${n++}`;
    const newProj: Project = {
      cat: newProjectData.cat, title, slug, main: "", folder: "",
      instagram: "", description: "", secondaryPhotos: [],
    };
    setProjects((ps) => [newProj, ...ps]);
    setProjectsDirty(true);
    setShowNewProjectForm(false);
    setNewProjectData({ title: "", cat: "sports" });
    setExpandedSlug(slug);
    setProjectsStatus("Project created — add a cover & photos, then tap Save Changes.");
  };

  const deleteProject = (slug: string) => {
    if (typeof window !== "undefined" && !window.confirm("Delete this project? This cannot be undone after saving.")) return;
    setProjects((ps) => ps.filter((p) => p.slug !== slug));
    setExpandedSlug(null);
    setProjectsDirty(true);
    setProjectsStatus("Project removed — tap Save Changes to publish.");
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

  const onChangeMainImage = async (slug: string, files: FileList | null) => {
    if (!files?.length) return;
    setProjectsBusy(true);
    setProjectsStatus("Uploading main image…");
    const f = files[0];
    try {
      const dims = await readDims(f);
      const url = await uploadFile(f);
      updateProject(slug, { main: url, mainW: dims.w, mainH: dims.h });
      setProjectsStatus("Main image updated — tap Save Changes to publish.");
    } catch (err) {
      console.error("Main image upload failed:", err);
      setProjectsStatus(`Upload failed: ${(err as Error).message || "unknown error"}`);
    }
    setProjectsBusy(false);
    setMainImageSlug(null);
    if (mainImageFileRef.current) mainImageFileRef.current.value = "";
  };


  const onAddSecondary = async (slug: string, files: FileList | null) => {
    if (!files?.length) return;
    setUploadingSlug(slug); setProjectsBusy(true);
    const added: SecondaryPhoto[] = [];
    let failed = 0;
    for (let i = 0; i < files.length; i++) {
      setProjectsStatus(`Uploading ${i + 1}/${files.length}…`);
      const f = files[i];
      const dims = await readDims(f);
      try {
        const url = await uploadFile(f);
        added.push({ file: url, w: dims.w, h: dims.h });
      } catch (err) {
        failed++;
        console.error("Secondary upload failed:", err);
      }
    }
    setProjects((ps) => ps.map((p) => p.slug !== slug ? p : {
      ...p, secondaryPhotos: [...p.secondaryPhotos, ...added]
    }));
    setProjectsDirty(true); setProjectsBusy(false); setUploadingSlug(null);
    setProjectsStatus(failed
      ? `${added.length} added, ${failed} failed — tap Save Changes.`
      : `${added.length} photo(s) added — tap Save Changes to publish.`);
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
    wrap: { maxWidth: "100%", margin: "0 auto", padding: "16px" } as React.CSSProperties,
    label: { fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "#8a8a8a", marginBottom: 6, display: "block" },
    input: { background: "#141414", border: "1px solid #262626", color: "#f2f2f2", borderRadius: 8, padding: "12px 14px", fontSize: 16, width: "100%", outline: "none" } as React.CSSProperties,
    textarea: { background: "#141414", border: "1px solid #262626", color: "#f2f2f2", borderRadius: 8, padding: "12px 14px", fontSize: 16, width: "100%", outline: "none", resize: "vertical" as const, minHeight: 100, fontFamily: "inherit" } as React.CSSProperties,
    btn: { background: "#fff", color: "#000", border: "none", borderRadius: 10, padding: "14px 20px", fontSize: 14, fontWeight: 500, cursor: "pointer", minHeight: 48, minWidth: 120, transition: "opacity .2s" } as React.CSSProperties,
    btnSecondary: { background: "#1a1a1a", color: "#f2f2f2", border: "1px solid #2a2a2a", borderRadius: 10, padding: "12px 18px", fontSize: 13, cursor: "pointer", minHeight: 44, transition: "background .2s" } as React.CSSProperties,
    btnSmall: { background: "rgba(255,255,255,0.1)", color: "#f2f2f2", border: "1px solid #2a2a2a", borderRadius: 6, padding: "8px 12px", fontSize: 12, cursor: "pointer", minHeight: 40 } as React.CSSProperties,
  };

  if (state === "loading") return <div style={{ ...S.page, display: "grid", placeItems: "center" }}>Loading…</div>;

  if (state === "login") {
    return (
      <div style={{ ...S.page, display: "grid", placeItems: "center" }}>
        <form onSubmit={login} style={{ width: "90%", maxWidth: 380, display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 24, letterSpacing: "0.22em", marginBottom: 8 }}>YASSINE&apos;S&nbsp;LENS</div>
            <div style={{ fontSize: 12, letterSpacing: "0.1em", color: "#8a8a8a" }}>Admin Panel</div>
          </div>
          {!configured && (
            <p style={{ fontSize: 13, color: "#e0a", lineHeight: 1.6, background: "rgba(224, 0, 170, 0.1)", padding: 12, borderRadius: 8 }}>
              ⚠️ <code>ADMIN_PASSWORD</code> not configured.
            </p>
          )}
          <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} style={S.input} autoFocus autoComplete="username" />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={S.input} autoComplete="current-password" />
          {error && <p style={{ fontSize: 13, color: "#ff6b6b" }}>{error}</p>}
          <button type="submit" style={S.btn}>Sign in</button>
        </form>
      </div>
    );
  }

  return (
    <div style={S.page}>
      <div style={S.wrap}>
        {/* Header */}
        <div style={{ marginBottom: 24, paddingBottom: 16, borderBottom: "1px solid #1c1c1c" }}>
          <div style={{ fontSize: 20, letterSpacing: "0.2em", marginBottom: 2 }}>YASSINE&apos;S&nbsp;LENS</div>
          <div style={{ fontSize: 12, color: "#8a8a8a", marginBottom: 16 }}>Content Manager</div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <a href="/" target="_blank" rel="noreferrer" style={{ ...S.btnSecondary, textDecoration: "none" }}>View site ↗</a>
            <button onClick={logout} style={S.btnSecondary}>Sign out</button>
          </div>
        </div>

        {!blobOk && (
          <p style={{ fontSize: 13, color: "#ffcf6b", background: "#1a1407", border: "1px solid #3a2e10", padding: "12px 14px", borderRadius: 8, marginBottom: 20, lineHeight: 1.6 }}>
            ⚠️ <strong>BLOB_READ_WRITE_TOKEN missing.</strong> Upload disabled.<br/>
            <small style={{ marginTop: 6, display: "block", opacity: 0.8 }}>
              Configure in Vercel → Environment Variables.
            </small>
          </p>
        )}

        {/* Tabs */}
        <div style={{ display: "flex", gap: 0, marginBottom: 20, borderBottom: "2px solid #1c1c1c", WebkitOverflowScrolling: "touch", overflowX: "auto" }}>
          {(["projects", "gallery"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} style={{
              background: "none", border: "none", color: tab === t ? "#fff" : "#666",
              fontSize: 14, padding: "12px 20px", cursor: "pointer",
              borderBottom: tab === t ? "3px solid #fff" : "none",
              marginBottom: -2, transition: "color .2s", whiteSpace: "nowrap", fontWeight: tab === t ? 600 : 400,
            }}>
              {t === "gallery" ? "Gallery" : "Projects"}
            </button>
          ))}
        </div>

        {/* ── PROJECTS TAB ───────────────────────────────────────────────────── */}
        {tab === "projects" && (
          <>
            <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", position: "sticky", top: 0, background: "#0a0a0a", paddingTop: 8, paddingBottom: 8, zIndex: 10 }}>
              <button style={{ ...S.btn, opacity: projectsDirty ? 1 : 0.5 }} onClick={saveProjects} disabled={projectsBusy || !projectsDirty}>
                {projectsDirty ? "✓ Save Changes" : "All Saved"}
              </button>
              <button style={S.btnSecondary} onClick={() => setShowNewProjectForm(!showNewProjectForm)}>
                {showNewProjectForm ? "Cancel" : "+ New Project"}
              </button>
              <span style={{ fontSize: 12, color: "#8a8a8a", alignSelf: "center" }}>{projects.length} projects</span>
            </div>

            {projectsStatus && (
              <div style={{ background: "#1a1a2e", border: "1px solid #2a3a5e", color: "#9ad", padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
                {projectsStatus}
              </div>
            )}

            {/* New Project Form */}
            {showNewProjectForm && (
              <div style={{ background: "#111", border: "1px solid #2a2a2a", borderRadius: 10, padding: 18, marginBottom: 18 }}>
                <h3 style={{ margin: "0 0 16px 0", fontSize: 16 }}>Create New Project</h3>
                <div style={{ display: "grid", gap: 12 }}>
                  <div>
                    <label style={S.label}>Project Title</label>
                    <input
                      value={newProjectData.title}
                      onChange={(e) => setNewProjectData({ ...newProjectData, title: e.target.value })}
                      placeholder="e.g., Lboulevard Festival"
                      style={S.input}
                    />
                  </div>
                  <div>
                    <label style={S.label}>Category</label>
                    <select
                      value={newProjectData.cat}
                      onChange={(e) => setNewProjectData({ ...newProjectData, cat: e.target.value })}
                      style={S.input}
                    >
                      {CATEGORIES.map((c) => <option key={c} value={c}>{CAT_LABEL[c]}</option>)}
                    </select>
                  </div>
                </div>
                <p style={{ fontSize: 12, color: "#8a8a8a", marginTop: 12 }}>You'll be able to upload a cover &amp; photos right after creating it.</p>
                <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                  <button style={S.btn} onClick={createProject} disabled={!newProjectData.title.trim()}>
                    Create Project
                  </button>
                  <button style={S.btnSecondary} onClick={() => { setShowNewProjectForm(false); setNewProjectData({ title: "", cat: "sports" }); }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <input
              ref={mainImageFileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => mainImageSlug && onChangeMainImage(mainImageSlug, e.target.files)}
            />
            <input
              ref={secondaryFileRef}
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={(e) => uploadingSlug && onAddSecondary(uploadingSlug, e.target.files)}
            />

            <div style={{ display: "grid", gap: 12 }}>
              {projects.map((proj) => (
                <div key={proj.slug} style={{ background: "#111", border: "1px solid #1f1f1f", borderRadius: 12, overflow: "hidden" }}>
                  {/* Project header - fully tappable */}
                  <div
                    onClick={() => setExpandedSlug(expandedSlug === proj.slug ? null : proj.slug)}
                    style={{
                      padding: 16,
                      display: "flex",
                      gap: 14,
                      alignItems: "center",
                      cursor: "pointer",
                      borderBottom: expandedSlug === proj.slug ? "1px solid #1c1c1c" : "none",
                      transition: "background .2s",
                    }}
                    onTouchStart={(e) => e.currentTarget.style.background = "#1a1a1a"}
                    onTouchEnd={(e) => e.currentTarget.style.background = "transparent"}
                  >
                    {/* Main image - large and tappable */}
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setMainImageSlug(proj.slug);
                        mainImageFileRef.current?.click();
                      }}
                      style={{
                        position: "relative",
                        width: 80,
                        height: 80,
                        borderRadius: 8,
                        overflow: "hidden",
                        flexShrink: 0,
                        cursor: "pointer",
                        border: "2px solid #2a2a2a",
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={proj.main?.startsWith("http") || proj.main?.startsWith("/") ? proj.main : `/photos/${proj.main}`} alt={proj.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          background: "rgba(0,0,0,0.5)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          opacity: 0,
                          transition: "opacity .2s",
                        }}
                        onTouchStart={(e) => (e.currentTarget.style.opacity = "1")}
                        onTouchEnd={(e) => (e.currentTarget.style.opacity = "0")}
                        onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                        onMouseLeave={(e) => (e.currentTarget.style.opacity = "0")}
                      >
                        <span style={{ fontSize: 11, color: "#fff", fontWeight: 600, letterSpacing: "0.08em" }}>TAP TO CHANGE</span>
                      </div>
                    </div>

                    {/* Project info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 500, marginBottom: 4 }}>{proj.title}</h3>
                      <p style={{ margin: 0, fontSize: 13, color: "#8a8a8a" }}>
                        {CAT_LABEL[proj.cat]} · {proj.secondaryPhotos.length} photos
                      </p>
                    </div>

                    <span style={{ fontSize: 24, color: "#555", marginLeft: 8 }}>
                      {expandedSlug === proj.slug ? "−" : "+"}
                    </span>
                  </div>

                  {/* Expanded project editor */}
                  {expandedSlug === proj.slug && (
                    <div style={{ padding: 16, borderTop: "1px solid #1c1c1c", display: "grid", gap: 16 }}>
                      {/* Title */}
                      <div>
                        <label style={S.label}>Project Title</label>
                        <input
                          value={proj.title}
                          onChange={(e) => updateProject(proj.slug, { title: e.target.value })}
                          style={S.input}
                        />
                      </div>

                      {/* Instagram */}
                      <div>
                        <label style={S.label}>Client Instagram (@handle)</label>
                        <input
                          value={proj.instagram}
                          placeholder="@username"
                          onChange={(e) => updateProject(proj.slug, { instagram: e.target.value })}
                          style={S.input}
                        />
                      </div>

                      {/* Description */}
                      <div>
                        <label style={S.label}>Description</label>
                        <textarea
                          value={proj.description}
                          onChange={(e) => updateProject(proj.slug, { description: e.target.value })}
                          placeholder="Add project details..."
                          style={S.textarea}
                        />
                      </div>

                      {/* Secondary photos with drag & drop */}
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                          <label style={{ ...S.label, marginBottom: 0 }}>Gallery Photos ({proj.secondaryPhotos.length})</label>
                          <button
                            style={S.btnSmall}
                            onClick={() => { setUploadingSlug(proj.slug); secondaryFileRef.current?.click(); }}
                            disabled={projectsBusy}
                          >
                            + Add Photos
                          </button>
                        </div>

                        {uploadingSlug === proj.slug && projectsBusy && (
                          <p style={{ fontSize: 12, color: "#9ad", marginBottom: 12 }}>{projectsStatus}</p>
                        )}

                        {proj.secondaryPhotos.length > 0 ? (
                          <div style={{ display: "grid", gap: 10 }}>
                            {proj.secondaryPhotos.map((sp, si) => (
                              <div
                                key={sp.file + si}
                                style={{
                                  display: "grid",
                                  gridTemplateColumns: "1fr 80px",
                                  gap: 10,
                                  alignItems: "center",
                                  padding: 10,
                                  background: "#0a0a0a",
                                  borderRadius: 8,
                                  border: "1px solid #1f1f1f",
                                }}
                              >
                                {/* Image preview */}
                                <div
                                  style={{
                                    position: "relative",
                                    aspectRatio: `${sp.w}/${sp.h}`,
                                    background: "#000",
                                    borderRadius: 6,
                                    overflow: "hidden",
                                  }}
                                >
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={sp.file} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                </div>

                                {/* Controls: up/down and delete */}
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                                  <button
                                    onClick={() => moveSecondary(proj.slug, si, -1)}
                                    disabled={si === 0}
                                    style={{
                                      ...S.btnSmall,
                                      opacity: si === 0 ? 0.3 : 1,
                                      padding: "10px 8px",
                                      fontSize: 16,
                                      fontWeight: "bold",
                                    }}
                                    title="Move up"
                                  >
                                    ↑
                                  </button>
                                  <button
                                    onClick={() => moveSecondary(proj.slug, si, 1)}
                                    disabled={si === proj.secondaryPhotos.length - 1}
                                    style={{
                                      ...S.btnSmall,
                                      opacity: si === proj.secondaryPhotos.length - 1 ? 0.3 : 1,
                                      padding: "10px 8px",
                                      fontSize: 16,
                                      fontWeight: "bold",
                                    }}
                                    title="Move down"
                                  >
                                    ↓
                                  </button>
                                  <button
                                    onClick={() => removeSecondary(proj.slug, si)}
                                    style={{
                                      ...S.btnSmall,
                                      gridColumn: "1 / -1",
                                      padding: "10px 8px",
                                      fontSize: 14,
                                      background: "rgba(255,100,100,0.1)",
                                      borderColor: "rgba(255,100,100,0.3)",
                                      color: "#ff9999",
                                    }}
                                    title="Delete photo"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p style={{ fontSize: 13, color: "#666", textAlign: "center", padding: "20px 0" }}>No gallery photos yet. Tap "+ Add Photos" to get started.</p>
                        )}
                      </div>

                      {/* Danger zone */}
                      <div style={{ borderTop: "1px solid #1c1c1c", paddingTop: 14, marginTop: 2 }}>
                        <button
                          onClick={() => deleteProject(proj.slug)}
                          style={{
                            ...S.btnSecondary,
                            background: "rgba(255,100,100,0.08)",
                            borderColor: "rgba(255,100,100,0.3)",
                            color: "#ff9999",
                            width: "100%",
                          }}
                        >
                          Delete this project
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {projects.length === 0 && (
              <div style={{ textAlign: "center", padding: "40px 20px" }}>
                <p style={{ color: "#8a8a8a", fontSize: 14 }}>No projects yet. Create one to get started.</p>
              </div>
            )}
          </>
        )}

        {/* ── GALLERY TAB ────────────────────────────────────────────────────── */}
        {tab === "gallery" && (
          <>
            <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", position: "sticky", top: 0, background: "#0a0a0a", paddingTop: 8, paddingBottom: 8, zIndex: 10 }}>
              <button style={S.btn} onClick={() => galleryFileRef.current?.click()} disabled={galleryBusy}>+ Add Photos</button>
              <button style={{ ...S.btn, opacity: galleryDirty ? 1 : 0.5 }} onClick={saveGallery} disabled={galleryBusy || !galleryDirty}>
                {galleryDirty ? "✓ Save Changes" : "All Saved"}
              </button>
              <span style={{ fontSize: 12, color: "#8a8a8a", alignSelf: "center" }}>{photos.length} photos</span>
            </div>

            {galleryStatus && (
              <div style={{ background: "#1a1a2e", border: "1px solid #2a3a5e", color: "#9ad", padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
                {galleryStatus}
              </div>
            )}

            <input ref={galleryFileRef} type="file" accept="image/*" multiple hidden onChange={(e) => onAddPhotos(e.target.files)} />

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12 }}>
              {photos.map((p, i) => (
                <div key={p.file + i} style={{ background: "#111", border: "1px solid #1f1f1f", borderRadius: 10, overflow: "hidden" }}>
                  <div style={{ position: "relative", aspectRatio: "4/3", background: "#000" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.file} alt={p.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <button onClick={() => removePhoto(i)} style={{ position: "absolute", top: 6, right: 6, width: 36, height: 36, borderRadius: "50%", background: "rgba(0,0,0,0.7)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", cursor: "pointer", fontSize: 16, minHeight: 36, minWidth: 36 }}>×</button>
                    <div style={{ position: "absolute", top: 6, left: 6, display: "flex", gap: 4 }}>
                      <button onClick={() => movePhoto(i, -1)} style={{ ...S.btnSmall, padding: "6px 8px" }}>↑</button>
                      <button onClick={() => movePhoto(i, 1)} style={{ ...S.btnSmall, padding: "6px 8px" }}>↓</button>
                    </div>
                  </div>
                  <div style={{ padding: 10, display: "grid", gap: 6 }}>
                    <input value={p.title} onChange={(e) => updatePhoto(i, { title: e.target.value })} placeholder="Title" style={{ ...S.input, padding: "8px 10px", fontSize: 13 }} />
                    <select value={p.cat} onChange={(e) => updatePhoto(i, { cat: e.target.value })} style={{ ...S.input, padding: "8px 10px", fontSize: 13, cursor: "pointer" }}>
                      {CATEGORIES.map((c) => <option key={c} value={c}>{CAT_LABEL[c]}</option>)}
                    </select>
                  </div>
                </div>
              ))}
            </div>
            {photos.length === 0 && <p style={{ color: "#8a8a8a", marginTop: 40, textAlign: "center", fontSize: 14 }}>No photos. Add some to get started.</p>}
          </>
        )}

        <div style={{ height: 60 }} />
      </div>
    </div>
  );
}
