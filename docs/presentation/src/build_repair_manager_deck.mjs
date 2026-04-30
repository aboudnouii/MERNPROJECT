import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const presentationDir = path.resolve(__dirname, "..");
const outputDir = path.join(presentationDir, "output");
const scratchDir = path.join(presentationDir, "scratch");
const previewDir = path.join(scratchDir, "previews");
const savedPreviewDir = path.join(scratchDir, "saved-pptx-previews");
const layoutDir = path.join(scratchDir, "layout");

const W = 1920;
const H = 1080;

const C = {
  bg: "#080A0F",
  surface: "#0F1117",
  surface2: "#161921",
  surface3: "#1D2130",
  border: "rgba(255,255,255,0.12)",
  text: "#F1F5F9",
  muted: "#94A3B8",
  dim: "#64748B",
  amber: "#F59E0B",
  amberSoft: "rgba(245,158,11,0.16)",
  green: "#10B981",
  greenSoft: "rgba(16,185,129,0.16)",
  blue: "#3B82F6",
  blueSoft: "rgba(59,130,246,0.16)",
  red: "#EF4444",
  redSoft: "rgba(239,68,68,0.14)",
  purple: "#A855F7",
  purpleSoft: "rgba(168,85,247,0.14)",
  yellow: "#EAB308",
  yellowSoft: "rgba(234,179,8,0.14)",
};

const F = {
  title: "Aptos Display",
  body: "Aptos",
  mono: "Consolas",
};

function pad(n) {
  return String(n).padStart(2, "0");
}

async function saveBlob(blob, filePath) {
  const buffer = Buffer.from(await blob.arrayBuffer());
  await writeFile(filePath, buffer);
}

function makeTools(tool) {
  const {
    Presentation,
    PresentationFile,
    row,
    column,
    grid,
    panel,
    text,
    rule,
    fill,
    hug,
    fixed,
    wrap,
    grow,
    fr,
    auto,
  } = tool;

  function txt(value, options = {}) {
    return text(value, {
      name: options.name,
      width: options.width ?? fill,
      height: options.height ?? hug,
      style: {
        fontFace: options.fontFace ?? F.body,
        fontSize: options.size ?? 28,
        color: options.color ?? C.text,
        bold: options.bold ?? false,
        italic: options.italic ?? false,
        lineHeight: options.lineHeight,
        textAlign: options.align,
      },
    });
  }

  function title(value, subtitle) {
    const children = [
      txt(value, {
        name: "slide-title",
        fontFace: F.title,
        size: 54,
        bold: true,
        color: C.text,
        width: fill,
      }),
    ];
    if (subtitle) {
      children.push(
        txt(subtitle, {
          name: "slide-subtitle",
          size: 24,
          color: C.muted,
          width: fill,
          lineHeight: 1.16,
        }),
      );
    }
    return column({ name: "title-stack", width: fill, height: hug, gap: 12 }, children);
  }

  function label(value, color = C.amber, width = 260) {
    return panel(
      {
        name: `label-${value.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
        width: fixed(width),
        height: hug,
        padding: { x: 16, y: 8 },
        fill: "rgba(255,255,255,0.04)",
        stroke: "rgba(255,255,255,0.09)",
      },
      txt(value, {
        width: fill,
        size: 17,
        color,
        bold: true,
        align: "center",
      }),
    );
  }

  function miniCard(name, heading, body, accent = C.amber, height = 156) {
    return panel(
      {
        name,
        width: fill,
        height: fixed(height),
        padding: { x: 24, y: 20 },
        fill: C.surface,
        stroke: C.border,
      },
      column({ width: fill, height: fill, gap: 10 }, [
        rule({ name: `${name}-accent`, width: fixed(74), stroke: accent, weight: 4 }),
        txt(heading, { name: `${name}-heading`, size: 26, bold: true, color: C.text }),
        txt(body, {
          name: `${name}-body`,
          size: 19,
          color: C.muted,
          lineHeight: 1.15,
        }),
      ]),
    );
  }

  function footer(slideNo) {
    return row({ name: "footer", width: fill, height: hug, gap: 24 }, [
      txt("Repair Manager website report", {
        name: "footer-left",
        size: 14,
        color: C.dim,
        width: fill,
      }),
      txt(`${slideNo}/10`, {
        name: "footer-page",
        size: 14,
        color: C.dim,
        width: fixed(70),
        align: "right",
      }),
    ]);
  }

  function shell(slide, slideNo, header, bodyNode, options = {}) {
    const root = panel(
      {
        name: "slide-background",
        width: fill,
        height: fill,
        fill: options.bg ?? C.bg,
        padding: { x: 72, y: 58 },
      },
      column({ name: "slide-root", width: fill, height: fill, gap: 34 }, [
        header,
        bodyNode,
        footer(slideNo),
      ]),
    );
    slide.compose(root, {
      frame: { left: 0, top: 0, width: W, height: H },
      baseUnit: 8,
    });
  }

  return {
    Presentation,
    PresentationFile,
    row,
    column,
    grid,
    panel,
    text,
    rule,
    fill,
    hug,
    fixed,
    wrap,
    grow,
    fr,
    auto,
    txt,
    title,
    label,
    miniCard,
    footer,
    shell,
  };
}

function addCover(presentation, T) {
  const { panel, column, row, grid, rule, fill, hug, fixed, fr, auto, txt, label } = T;
  const slide = presentation.slides.add();
  slide.compose(
    panel(
      {
        name: "cover-background",
        width: fill,
        height: fill,
        fill: C.bg,
        padding: { x: 82, y: 76 },
      },
      grid(
        {
          name: "cover-grid",
          width: fill,
          height: fill,
          columns: [fr(1.18), fr(0.82)],
          rows: [fr(1), auto],
          columnGap: 70,
          rowGap: 34,
        },
        [
          column({ name: "cover-title-stack", width: fill, height: fill, gap: 24 }, [
            label("MERN GARAGE SYSTEM", C.amber, 292),
            txt("Repair Manager", {
              name: "cover-title",
              fontFace: F.title,
              size: 94,
              bold: true,
              color: C.text,
              width: fill,
              lineHeight: 0.92,
            }),
            rule({ name: "cover-rule", width: fixed(250), stroke: C.amber, weight: 7 }),
            txt("A secure website for managing customers, vehicles, repair jobs, costs, and customer tracking codes.", {
              name: "cover-subtitle",
              size: 31,
              color: C.muted,
              width: fixed(900),
              lineHeight: 1.14,
            }),
          ]),
          panel(
            {
              name: "cover-artifact",
              width: fill,
              height: fill,
              fill: C.surface,
              stroke: C.border,
              padding: { x: 36, y: 34 },
            },
            column({ name: "cover-stack", width: fill, height: fill, gap: 22 }, [
              row({ name: "artifact-top", width: fill, height: hug, gap: 12 }, [
                txt("RepairMGR", {
                  name: "artifact-brand",
                  fontFace: F.title,
                  size: 31,
                  bold: true,
                  color: C.text,
                  width: fill,
                }),
                txt("JWT", {
                  name: "artifact-token",
                  fontFace: F.mono,
                  size: 18,
                  color: C.amber,
                  width: fixed(84),
                  align: "right",
                }),
              ]),
              rule({ name: "artifact-rule", width: fill, stroke: "rgba(255,255,255,0.12)", weight: 2 }),
              column({ name: "artifact-kpis", width: fill, height: hug, gap: 14 }, [
                panel({ name: "kpi-open", width: fill, height: fixed(88), fill: C.amberSoft, padding: { x: 24, y: 18 } },
                  row({ width: fill, height: hug, gap: 18 }, [
                    txt("06", { name: "kpi-open-num", fontFace: F.title, size: 48, bold: true, color: C.amber, width: fixed(90) }),
                    txt("Dashboard metrics for garage workload and revenue visibility", { name: "kpi-open-label", size: 21, color: C.text, width: fill }),
                  ])),
                panel({ name: "kpi-flow", width: fill, height: fixed(88), fill: C.blueSoft, padding: { x: 24, y: 18 } },
                  row({ width: fill, height: hug, gap: 18 }, [
                    txt("09", { name: "kpi-flow-num", fontFace: F.title, size: 48, bold: true, color: C.blue, width: fixed(90) }),
                    txt("API endpoints covering auth, repair CRUD, and tracking", { name: "kpi-flow-label", size: 21, color: C.text, width: fill }),
                  ])),
                panel({ name: "kpi-customer", width: fill, height: fixed(88), fill: C.greenSoft, padding: { x: 24, y: 18 } },
                  row({ width: fill, height: hug, gap: 18 }, [
                    txt("RM", { name: "kpi-code-num", fontFace: F.title, size: 48, bold: true, color: C.green, width: fixed(90) }),
                    txt("Tracking code portal for customers with no login required", { name: "kpi-code-label", size: 21, color: C.text, width: fill }),
                  ])),
              ]),
            ]),
          ),
          row({ name: "cover-footer", width: fill, height: hug, columnSpan: 2, gap: 18 }, [
            txt("Technical report and PowerPoint companion", { name: "cover-footer-left", size: 17, color: C.dim, width: fill }),
            txt("April 30, 2026", { name: "cover-date", size: 17, color: C.dim, width: fixed(180), align: "right" }),
          ]),
        ],
      ),
    ),
    { frame: { left: 0, top: 0, width: W, height: H }, baseUnit: 8 },
  );
}

function addOverview(presentation, T) {
  const { row, column, panel, fill, fixed, txt, title, miniCard, shell } = T;
  const slide = presentation.slides.add();
  shell(
    slide,
    2,
    title("What the website solves", "Repair Manager turns a common garage workflow into one connected staff dashboard and customer tracking experience."),
    row({ name: "overview-body", width: fill, height: fill, gap: 38 }, [
      column({ name: "overview-claim", width: fixed(640), height: fill, gap: 22 }, [
        txt("The product is not just a CRUD demo; it models the daily repair lifecycle.", {
          name: "big-claim",
          fontFace: F.title,
          size: 56,
          bold: true,
          color: C.text,
          lineHeight: 0.98,
        }),
        txt("Staff get protected operations. Customers get instant status visibility. The shop gets one source of truth for work, costs, and progress.", {
          name: "claim-support",
          size: 26,
          color: C.muted,
          lineHeight: 1.14,
        }),
      ]),
      column({ name: "overview-cards", width: fill, height: fill, gap: 18 }, [
        miniCard("need-staff", "Secure staff workspace", "Signup, login, local session storage, and JWT bearer requests protect operational screens.", C.amber),
        miniCard("need-jobs", "Full repair lifecycle", "Create, search, edit, complete, and delete repair jobs from a dashboard interface.", C.blue),
        miniCard("need-customer", "Customer self-service", "A public portal lets customers check status with a tracking code, no account required.", C.green),
        miniCard("need-cost", "Cost and workload visibility", "Dashboard totals summarize jobs, status mix, estimated revenue, actual revenue, and average cost.", C.purple),
      ]),
    ]),
  );
}

function addArchitecture(presentation, T) {
  const { row, column, panel, rule, fill, hug, fixed, txt, title, shell } = T;
  const slide = presentation.slides.add();
  const archBox = (name, heading, body, accent) =>
    panel(
      { name, width: fixed(430), height: fixed(310), fill: C.surface, stroke: C.border, padding: { x: 28, y: 26 } },
      column({ width: fill, height: fill, gap: 14 }, [
        rule({ name: `${name}-rule`, width: fixed(96), stroke: accent, weight: 5 }),
        txt(heading, { name: `${name}-heading`, fontFace: F.title, size: 39, bold: true, color: C.text }),
        txt(body, { name: `${name}-body`, size: 21, color: C.muted, lineHeight: 1.13 }),
      ]),
    );
  shell(
    slide,
    3,
    title("System architecture", "The project follows a clear MERN separation: React renders the experience, Express owns the API, and MongoDB persists users and repair jobs."),
    column({ name: "architecture-body", width: fill, height: fill, gap: 34 }, [
      row({ name: "architecture-row", width: fill, height: hug, gap: 18 }, [
        archBox("arch-react", "React frontend", "App.jsx controls authentication state, dashboard tabs, repair data, filters, and customer tracking mode.", C.amber),
        panel({ name: "connector-one", width: fixed(180), height: fixed(310), fill: "rgba(255,255,255,0.02)", padding: { x: 16, y: 115 } },
          column({ width: fill, height: hug, gap: 12 }, [
            rule({ width: fill, stroke: C.dim, weight: 3 }),
            txt("Axios HTTP", { name: "connector-one-label", size: 18, color: C.muted, align: "center" }),
          ])),
        archBox("arch-api", "Express API", "Routes handle auth, protected repair CRUD, public tracking, CORS, and health checks.", C.blue),
        panel({ name: "connector-two", width: fixed(180), height: fixed(310), fill: "rgba(255,255,255,0.02)", padding: { x: 16, y: 115 } },
          column({ width: fill, height: hug, gap: 12 }, [
            rule({ width: fill, stroke: C.dim, weight: 3 }),
            txt("Mongoose", { name: "connector-two-label", size: 18, color: C.muted, align: "center" }),
          ])),
        archBox("arch-db", "MongoDB", "User and RepairJob schemas store accounts, ownership, tracking codes, costs, statuses, and timestamps.", C.green),
      ]),
      row({ name: "architecture-notes", width: fill, height: hug, gap: 18 }, [
        panel({ name: "note-public", width: fill, height: fixed(120), fill: C.greenSoft, padding: { x: 24, y: 22 } },
          txt("Public path: /api/repairs/track/:trackingCode returns limited customer-facing repair information.", { name: "public-note", size: 22, color: C.text })),
        panel({ name: "note-private", width: fill, height: fixed(120), fill: C.amberSoft, padding: { x: 24, y: 22 } },
          txt("Private path: all staff repair routes use the protect middleware and user-scoped database queries.", { name: "private-note", size: 22, color: C.text })),
      ]),
    ]),
  );
}

function addFrontend(presentation, T) {
  const { row, column, panel, grid, rule, fill, hug, fixed, fr, auto, txt, title, shell } = T;
  const slide = presentation.slides.add();
  const navItem = (label, active = false) =>
    panel({ name: `nav-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`, width: fill, height: fixed(44), fill: active ? C.amberSoft : "rgba(255,255,255,0.03)", padding: { x: 14, y: 10 } },
      txt(label, { size: 17, color: active ? C.amber : C.muted, bold: active }));
  const kpi = (label, value, accent) =>
    panel({ name: `mock-kpi-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`, width: fill, height: fixed(96), fill: C.surface2, stroke: C.border, padding: { x: 16, y: 14 } },
      column({ width: fill, height: hug, gap: 4 }, [
        txt(label, { size: 14, color: C.dim, bold: true }),
        txt(value, { fontFace: F.title, size: 36, color: accent, bold: true }),
      ]));
  shell(
    slide,
    4,
    title("Frontend experience", "The React UI is organized around authenticated staff operations, compact dashboard scanning, and a separate customer tracking path."),
    row({ name: "frontend-body", width: fill, height: fill, gap: 34 }, [
      panel(
        { name: "ui-mock", width: fixed(1000), height: fill, fill: C.surface, stroke: C.border, padding: { x: 20, y: 20 } },
        row({ name: "mock-layout", width: fill, height: fill, gap: 18 }, [
          panel({ name: "mock-sidebar", width: fixed(220), height: fill, fill: "#0B0D12", padding: { x: 14, y: 16 } },
            column({ width: fill, height: fill, gap: 14 }, [
              txt("RepairMGR", { fontFace: F.title, size: 28, color: C.text, bold: true }),
              navItem("Dashboard", true),
              navItem("All Repairs"),
              navItem("New Repair"),
              navItem("Completed"),
              navItem("About"),
            ])),
          column({ name: "mock-content", width: fill, height: fill, gap: 18 }, [
            row({ name: "mock-topbar", width: fill, height: fixed(54), gap: 12 }, [
              txt("Garage / Dashboard", { size: 19, color: C.muted, width: fill }),
              panel({ width: fixed(140), height: fixed(44), fill: C.amber, padding: { x: 16, y: 10 } },
                txt("New Repair", { size: 17, color: "#111111", bold: true, align: "center" })),
            ]),
            panel({ name: "mock-hero", width: fill, height: fixed(142), fill: C.surface2, stroke: C.border, padding: { x: 24, y: 20 } },
              column({ width: fill, height: hug, gap: 6 }, [
                txt("Auto Garage Management", { size: 15, color: C.amber, bold: true }),
                txt("Welcome back, Admin", { fontFace: F.title, size: 42, color: C.text, bold: true }),
                txt("Snapshot of garage operations today.", { size: 19, color: C.muted }),
              ])),
            grid({ name: "mock-kpi-grid", width: fill, height: hug, columns: [fr(1), fr(1), fr(1)], rows: [auto, auto], columnGap: 12, rowGap: 12 }, [
              kpi("Total Jobs", "24", C.amber),
              kpi("Pending", "05", C.yellow),
              kpi("In Progress", "07", C.blue),
              kpi("Completed", "11", C.green),
              kpi("Cancelled", "01", C.red),
              kpi("Revenue Est.", "$8.2k", C.purple),
            ]),
          ]),
        ]),
      ),
      column({ name: "frontend-notes", width: fill, height: fill, gap: 20 }, [
        panel({ name: "frontend-note-state", width: fill, height: fixed(148), fill: C.surface, stroke: C.border, padding: { x: 24, y: 20 } },
          txt("App.jsx owns session state, active tab, repair data, filters, dashboard calculations, and CRUD handlers.", { size: 24, color: C.text, lineHeight: 1.14 })),
        panel({ name: "frontend-note-components", width: fill, height: fixed(148), fill: C.surface, stroke: C.border, padding: { x: 24, y: 20 } },
          txt("Components split by job: AuthForm, RepairForm, RepairList, RepairItem, and CustomerTrack.", { size: 24, color: C.text, lineHeight: 1.14 })),
        panel({ name: "frontend-note-ux", width: fill, height: fixed(148), fill: C.surface, stroke: C.border, padding: { x: 24, y: 20 } },
          txt("The visual system uses dark surfaces, amber action states, and colored status badges for operational scanning.", { size: 24, color: C.text, lineHeight: 1.14 })),
      ]),
    ]),
  );
}

function addBackend(presentation, T) {
  const { row, column, panel, grid, fill, fixed, fr, txt, title, shell } = T;
  const slide = presentation.slides.add();
  const route = (method, endpoint, tone) =>
    row({ name: `route-${method}-${endpoint}`.replace(/[^a-z0-9]+/gi, "-"), width: fill, height: fixed(48), gap: 14 }, [
      panel({ width: fixed(82), height: fill, fill: tone, padding: { x: 10, y: 12 } },
        txt(method, { fontFace: F.mono, size: 15, bold: true, color: C.text, align: "center" })),
      txt(endpoint, { fontFace: F.mono, size: 19, color: C.text, width: fill }),
    ]);
  shell(
    slide,
    5,
    title("Backend API and authentication", "Express routes separate public tracking from private staff operations, then use JWT middleware to protect repair data."),
    grid({ name: "backend-grid", width: fill, height: fill, columns: [fr(0.92), fr(1.08)], rows: [fr(1)], columnGap: 34 }, [
      column({ name: "backend-left", width: fill, height: fill, gap: 18 }, [
        panel({ name: "jwt-flow", width: fill, height: fixed(245), fill: C.surface, stroke: C.border, padding: { x: 26, y: 24 } },
          column({ width: fill, height: fill, gap: 12 }, [
            txt("JWT login flow", { fontFace: F.title, size: 36, bold: true, color: C.text }),
            txt("1. Staff submits credentials", { size: 22, color: C.muted }),
            txt("2. Backend verifies bcrypt hash", { size: 22, color: C.muted }),
            txt("3. API returns a 7-day token", { size: 22, color: C.muted }),
            txt("4. Frontend sends Bearer token on private repair requests", { size: 22, color: C.muted }),
          ])),
        panel({ name: "protected-note", width: fill, height: fixed(250), fill: C.amberSoft, padding: { x: 26, y: 24 } },
          txt("The protect middleware verifies the token, loads the user, and rejects missing or invalid credentials with 401 responses.", { size: 28, color: C.text, lineHeight: 1.14 })),
      ]),
      panel({ name: "routes-table", width: fill, height: fill, fill: C.surface, stroke: C.border, padding: { x: 24, y: 22 } },
        column({ name: "routes-stack", width: fill, height: fill, gap: 11 }, [
          txt("Routes implemented", { fontFace: F.title, size: 34, bold: true, color: C.text }),
          route("POST", "/api/auth/signup", C.amberSoft),
          route("POST", "/api/auth/login", C.amberSoft),
          route("GET", "/api/auth/me", C.amberSoft),
          route("GET", "/api/repairs/track/:code", C.greenSoft),
          route("POST", "/api/repairs", C.blueSoft),
          route("GET", "/api/repairs", C.blueSoft),
          route("PUT", "/api/repairs/:id", C.blueSoft),
          route("DELETE", "/api/repairs/:id", C.redSoft),
          route("PATCH", "/api/repairs/:id/complete", C.blueSoft),
        ])),
    ]),
  );
}

function addDatabase(presentation, T) {
  const { row, column, panel, rule, fill, hug, fixed, txt, title, shell } = T;
  const slide = presentation.slides.add();
  const field = (name, desc) =>
    row({ name: `field-${name}`.replace(/[^a-z0-9]+/gi, "-"), width: fill, height: fixed(43), gap: 12 }, [
      txt(name, { fontFace: F.mono, size: 17, color: C.amber, width: fixed(176) }),
      txt(desc, { size: 18, color: C.muted, width: fill }),
    ]);
  const model = (name, accent, fields) =>
    panel({ name: `model-${name}`, width: fill, height: fill, fill: C.surface, stroke: C.border, padding: { x: 26, y: 24 } },
      column({ width: fill, height: fill, gap: 12 }, [
        rule({ width: fixed(98), stroke: accent, weight: 5 }),
        txt(name, { fontFace: F.title, size: 39, bold: true, color: C.text }),
        ...fields,
      ]));
  shell(
    slide,
    6,
    title("Database model", "MongoDB stores a simple ownership model: users own repair jobs, while each repair job has a stable customer tracking code."),
    row({ name: "database-body", width: fill, height: fill, gap: 34 }, [
      model("User", C.amber, [
        field("name", "Required staff display name"),
        field("email", "Unique login identity"),
        field("password", "Hashed with bcrypt, hidden by default"),
        field("timestamps", "Created and updated metadata"),
      ]),
      panel({ name: "relationship", width: fixed(250), height: fill, fill: "rgba(255,255,255,0.02)", padding: { x: 20, y: 188 } },
        column({ width: fill, height: hug, gap: 14 }, [
          txt("1 user", { size: 24, color: C.text, bold: true, align: "center" }),
          rule({ width: fill, stroke: C.dim, weight: 3 }),
          txt("many repair jobs", { size: 24, color: C.text, bold: true, align: "center" }),
        ])),
      model("RepairJob", C.green, [
        field("user", "Owner reference and query scope"),
        field("trackingCode", "Unique public lookup code"),
        field("customerName", "Required customer identity"),
        field("carModel", "Required vehicle model"),
        field("status", "pending, in-progress, completed, cancelled"),
        field("estimatedCost", "Planned cost"),
        field("actualCost", "Final cost"),
        field("completedAt", "Completion timestamp"),
      ]),
    ]),
  );
}

function addWorkflows(presentation, T) {
  const { row, column, panel, rule, fill, hug, fixed, txt, title, shell } = T;
  const slide = presentation.slides.add();
  const step = (n, label, body, accent) =>
    row({ name: `workflow-step-${n}`, width: fill, height: fixed(86), gap: 18 }, [
      panel({ width: fixed(62), height: fixed(62), fill: accent, padding: { x: 12, y: 12 } },
        txt(String(n), { fontFace: F.title, size: 28, bold: true, color: "#090B10", align: "center" })),
      column({ width: fill, height: hug, gap: 4 }, [
        txt(label, { size: 25, bold: true, color: C.text }),
        txt(body, { size: 18, color: C.muted }),
      ]),
    ]);
  shell(
    slide,
    7,
    title("Core user workflows", "The website supports one operational loop for staff and one lightweight status loop for customers."),
    row({ name: "workflow-body", width: fill, height: fill, gap: 34 }, [
      panel({ name: "staff-flow", width: fill, height: fill, fill: C.surface, stroke: C.border, padding: { x: 30, y: 28 } },
        column({ width: fill, height: fill, gap: 16 }, [
          txt("Staff workflow", { fontFace: F.title, size: 39, bold: true, color: C.text }),
          rule({ width: fixed(110), stroke: C.amber, weight: 5 }),
          step(1, "Authenticate", "Signup or login returns user profile and JWT token.", C.amber),
          step(2, "Create job", "RepairForm posts customer, car, issue, status, and cost data.", C.amber),
          step(3, "Operate dashboard", "Staff search, filter, edit, delete, and complete repair jobs.", C.amber),
          step(4, "Review metrics", "Dashboard recomputes workload and revenue statistics.", C.amber),
        ])),
      panel({ name: "customer-flow", width: fill, height: fill, fill: C.surface, stroke: C.border, padding: { x: 30, y: 28 } },
        column({ width: fill, height: fill, gap: 16 }, [
          txt("Customer workflow", { fontFace: F.title, size: 39, bold: true, color: C.text }),
          rule({ width: fixed(110), stroke: C.green, weight: 5 }),
          step(1, "Receive code", "Garage shares a generated RM tracking code.", C.green),
          step(2, "Open portal", "Customer switches from login page to CustomerTrack.", C.green),
          step(3, "Lookup repair", "Frontend calls the public tracking endpoint.", C.green),
          step(4, "Read status", "Progress steps summarize received, in progress, and completed states.", C.green),
        ])),
    ]),
  );
}

function addDeployment(presentation, T) {
  const { row, column, panel, grid, fill, hug, fixed, fr, auto, txt, title, shell } = T;
  const slide = presentation.slides.add();
  const env = (key, desc, accent = C.amber) =>
    row({ name: `env-${key}`.replace(/[^a-z0-9]+/gi, "-"), width: fill, height: fixed(54), gap: 16 }, [
      txt(key, { fontFace: F.mono, size: 18, color: accent, width: fixed(230) }),
      txt(desc, { size: 20, color: C.muted, width: fill }),
    ]);
  shell(
    slide,
    8,
    title("Deployment and configuration", "The README defines a practical split deployment: frontend on Vercel, backend on Render, database on MongoDB Atlas."),
    grid({ name: "deploy-grid", width: fill, height: fill, columns: [fr(1), fr(1)], rows: [auto, fr(1)], columnGap: 34, rowGap: 26 }, [
      panel({ name: "deploy-frontend", width: fill, height: fixed(210), fill: C.surface, stroke: C.border, padding: { x: 28, y: 24 } },
        column({ width: fill, height: hug, gap: 12 }, [
          txt("Frontend: Vercel", { fontFace: F.title, size: 37, bold: true, color: C.text }),
          txt("Root Directory: frontend", { fontFace: F.mono, size: 20, color: C.muted }),
          txt("Build Command: npm run build", { fontFace: F.mono, size: 20, color: C.muted }),
          txt("Output Directory: build", { fontFace: F.mono, size: 20, color: C.muted }),
        ])),
      panel({ name: "deploy-backend", width: fill, height: fixed(210), fill: C.surface, stroke: C.border, padding: { x: 28, y: 24 } },
        column({ width: fill, height: hug, gap: 12 }, [
          txt("Backend: Render", { fontFace: F.title, size: 37, bold: true, color: C.text }),
          txt("Root Directory: backend", { fontFace: F.mono, size: 20, color: C.muted }),
          txt("Build Command: npm install", { fontFace: F.mono, size: 20, color: C.muted }),
          txt("Start Command: npm start", { fontFace: F.mono, size: 20, color: C.muted }),
        ])),
      panel({ name: "env-panel", width: fill, height: fill, fill: C.surface, stroke: C.border, padding: { x: 28, y: 24 }, columnSpan: 2 },
        column({ width: fill, height: fill, gap: 12 }, [
          txt("Environment variables", { fontFace: F.title, size: 37, bold: true, color: C.text }),
          env("MONGO_URI", "MongoDB connection string for local or Atlas database.", C.green),
          env("JWT_SECRET", "Signing secret for 7-day staff auth tokens.", C.amber),
          env("CLIENT_URLS", "Allowed frontend origins for CORS.", C.blue),
          env("REACT_APP_API_URL", "Frontend API base URL such as the Render /api endpoint.", C.purple),
          txt("Production recommendation: remove development fallbacks, restrict database network access, and keep secrets outside source control.", {
            name: "deployment-rec",
            size: 24,
            color: C.text,
            width: fill,
          }),
        ])),
    ]),
  );
}

function addQuality(presentation, T) {
  const { row, column, panel, rule, fill, fixed, txt, title, shell } = T;
  const slide = presentation.slides.add();
  const columnBlock = (name, heading, accent, items) =>
    panel({ name, width: fill, height: fill, fill: C.surface, stroke: C.border, padding: { x: 26, y: 24 } },
      column({ width: fill, height: fill, gap: 14 }, [
        rule({ width: fixed(86), stroke: accent, weight: 5 }),
        txt(heading, { fontFace: F.title, size: 36, bold: true, color: C.text }),
        ...items.map((item, idx) => txt(`${idx + 1}. ${item}`, {
          name: `${name}-item-${idx + 1}`,
          size: 21,
          color: C.muted,
          lineHeight: 1.13,
        })),
      ]));
  shell(
    slide,
    9,
    title("Quality, risks, and next improvements", "The website is a strong functional prototype; the next step is production hardening and test coverage."),
    row({ name: "quality-body", width: fill, height: fill, gap: 26 }, [
      columnBlock("quality-strengths", "Strengths", C.green, [
        "Clear MERN separation",
        "User-scoped repair data",
        "Public tracking without login",
        "Practical dashboard KPIs",
        "Readable route organization",
      ]),
      columnBlock("quality-risks", "Risks to address", C.red, [
        "No automated tests yet",
        "Development JWT fallback",
        "Encoding artifacts in UI text",
        "No rate limiting on public lookup",
        "No role-based authorization",
      ]),
      columnBlock("quality-roadmap", "Roadmap", C.amber, [
        "API validation library",
        "Unit and integration tests",
        "Repair status timeline",
        "Invoices and printable job cards",
        "Email or SMS customer updates",
      ]),
    ]),
  );
}

function addConclusion(presentation, T) {
  const { row, column, panel, rule, fill, fixed, txt, title, shell } = T;
  const slide = presentation.slides.add();
  shell(
    slide,
    10,
    title("Conclusion", "Repair Manager demonstrates a complete full-stack garage management website with real operational workflows."),
    row({ name: "conclusion-body", width: fill, height: fill, gap: 40 }, [
      column({ name: "conclusion-claim", width: fixed(760), height: fill, gap: 24 }, [
        txt("Ready for a project demo; ready for hardening before production.", {
          name: "conclusion-main",
          fontFace: F.title,
          size: 66,
          bold: true,
          color: C.text,
          lineHeight: 0.97,
        }),
        rule({ name: "conclusion-rule", width: fixed(240), stroke: C.amber, weight: 7 }),
        txt("The application shows frontend design, REST API engineering, database modeling, JWT authentication, and deployment awareness in one coherent website.", {
          name: "conclusion-support",
          size: 27,
          color: C.muted,
          lineHeight: 1.13,
        }),
      ]),
      column({ name: "conclusion-proof", width: fill, height: fill, gap: 18 }, [
        panel({ name: "proof-stack", width: fill, height: fixed(132), fill: C.amberSoft, padding: { x: 26, y: 24 } },
          txt("Frontend: React dashboard, customer portal, forms, filters, status badges, and computed KPIs.", { size: 25, color: C.text })),
        panel({ name: "proof-api", width: fill, height: fixed(132), fill: C.blueSoft, padding: { x: 26, y: 24 } },
          txt("Backend: Express routes, CORS rules, health check, JWT auth, and protected repair APIs.", { size: 25, color: C.text })),
        panel({ name: "proof-data", width: fill, height: fixed(132), fill: C.greenSoft, padding: { x: 26, y: 24 } },
          txt("Database: User and RepairJob models with ownership, tracking codes, statuses, costs, and dates.", { size: 25, color: C.text })),
        panel({ name: "proof-next", width: fill, height: fixed(132), fill: C.purpleSoft, padding: { x: 26, y: 24 } },
          txt("Next: tests, validation, rate limiting, production secret policy, roles, and repair history.", { size: 25, color: C.text })),
      ]),
    ]),
  );
}

function collectTextLayoutIssues(layoutJson) {
  const issues = [];
  function visit(node) {
    if (!node || typeof node !== "object") return;
    const bbox = node.bbox || node.frame || node.bounds;
    const textLayout = node.textLayout;
    if (bbox && textLayout) {
      const lines = Array.isArray(textLayout.lines) ? textLayout.lines : [];
      const maxWidth = Math.max(0, ...lines.map((line) => line.width ?? line.widthPx ?? 0));
      const height = textLayout.height ?? textLayout.heightPx ?? 0;
      const boxWidth = bbox.width ?? 0;
      const boxHeight = bbox.height ?? 0;
      const name = node.name || node.aid || node.id || "unnamed";
      if (boxWidth && maxWidth > boxWidth + 2) {
        issues.push(`${name}: rendered line width ${Math.round(maxWidth)} exceeds box ${Math.round(boxWidth)}`);
      }
      if (boxHeight && height > boxHeight + 2) {
        issues.push(`${name}: rendered text height ${Math.round(height)} exceeds box ${Math.round(boxHeight)}`);
      }
    }
    for (const value of Object.values(node)) {
      if (Array.isArray(value)) value.forEach(visit);
      else if (value && typeof value === "object") visit(value);
    }
  }
  visit(layoutJson);
  return issues;
}

async function exportArtifacts(presentation, PresentationFile) {
  await mkdir(outputDir, { recursive: true });
  await mkdir(previewDir, { recursive: true });
  await mkdir(savedPreviewDir, { recursive: true });
  await mkdir(layoutDir, { recursive: true });

  const pptxPath = path.join(outputDir, "output.pptx");
  const pptxBlob = await PresentationFile.exportPptx(presentation);
  await pptxBlob.save(pptxPath);

  const layoutIssues = [];
  const slides = presentation.slides.items;
  for (let i = 0; i < slides.length; i += 1) {
    const slide = slides[i];
    const slideNo = i + 1;
    const previewPath = path.join(previewDir, `slide-${pad(slideNo)}.png`);
    const layoutPath = path.join(layoutDir, `slide-${pad(slideNo)}.layout.json`);
    await saveBlob(await slide.export({ format: "png" }), previewPath);
    const layoutBlob = await slide.export({ format: "layout" });
    await writeFile(layoutPath, await layoutBlob.text(), "utf8");
    const parsed = JSON.parse(await layoutBlob.text());
    const issues = collectTextLayoutIssues(parsed);
    for (const issue of issues) layoutIssues.push(`slide ${slideNo}: ${issue}`);
  }

  const savedBytes = await readFile(pptxPath);
  const imported = await PresentationFile.importPptx(savedBytes);
  const importedSlides = imported.slides.items;
  for (let i = 0; i < importedSlides.length; i += 1) {
    const slideNo = i + 1;
    const previewPath = path.join(savedPreviewDir, `slide-${pad(slideNo)}.png`);
    await saveBlob(await importedSlides[i].export({ format: "png" }), previewPath);
  }

  const qa = {
    generatedAt: new Date().toISOString(),
    slideCount: slides.length,
    pptxPath,
    previewDir,
    savedPreviewDir,
    layoutDir,
    pptxImportSlideCount: importedSlides.length,
    layoutIssueCount: layoutIssues.length,
    layoutIssues,
    pptxParityChecked: importedSlides.length === slides.length,
  };
  const qaPath = path.join(scratchDir, "qa-summary.json");
  await writeFile(qaPath, JSON.stringify(qa, null, 2), "utf8");
  return qa;
}

export async function build(tool) {
  const T = makeTools(tool);
  const { Presentation, PresentationFile } = T;
  const presentation = Presentation.create({
    slideSize: { width: W, height: H },
  });

  addCover(presentation, T);
  addOverview(presentation, T);
  addArchitecture(presentation, T);
  addFrontend(presentation, T);
  addBackend(presentation, T);
  addDatabase(presentation, T);
  addWorkflows(presentation, T);
  addDeployment(presentation, T);
  addQuality(presentation, T);
  addConclusion(presentation, T);

  return exportArtifacts(presentation, PresentationFile);
}
