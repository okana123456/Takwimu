"use client";

import { FormEvent, useMemo, useState } from "react";

const programmes = [
  {
    id: "canva",
    name: "Canva",
    description: "Verified schools, champion applications, training assets, posters, reports, and evidence.",
    metrics: [
      ["Verified sheets", "9"],
      ["School fields", "89"],
      ["Contacts", "57"],
      ["Counties", "44"]
    ],
    resources: [
      ["Data Files", "Canva reporting sheets and school lists"],
      ["Google Forms", "Champion applications and follow-up responses"],
      ["Posters & Assets", "Canva school campaign materials"],
      ["Evidence", "Screenshots, attendance proof, and training records"]
    ]
  },
  {
    id: "code-clubs",
    name: "Code Clubs",
    description: "Registered clubs, active clubs, learners, girls reached, mentorship, reports, and verification.",
    metrics: [
      ["Schools/clubs", "408"],
      ["Active clubs", "106"],
      ["Sheets", "8"],
      ["Actions", "33"]
    ],
    resources: [
      ["Data Files", "Master sheets, active clubs, reconciliation"],
      ["Google Forms", "Activation, weekly reports, mentor attendance"],
      ["Recordings", "Training and mentorship sessions"],
      ["Posters & Assets", "Recruitment posters and registration links"]
    ]
  },
  {
    id: "ai-skilling",
    name: "AI Skilling",
    description: "Training registration, attendance, course completion, reporting, recordings, and proof of execution.",
    metrics: [
      ["Registrations", "520"],
      ["Attended", "430"],
      ["Completed", "312"],
      ["Certified", "185"]
    ],
    resources: [
      ["Data Files", "Registration exports and reporting sheets"],
      ["Google Forms", "Registration, feedback, and reporting forms"],
      ["Recordings", "Training sessions and webinars"],
      ["Reports", "Milestone and proof-of-execution reports"]
    ]
  },
  {
    id: "experience-ai",
    name: "Experience AI",
    description: "Teacher sessions, participation data, resources, recordings, posters, reports, and evidence.",
    metrics: [
      ["Sessions", "4"],
      ["Teachers", "165"],
      ["Resources", "12"],
      ["Evidence", "Ready"]
    ],
    resources: [
      ["Data Files", "Session attendance and participant exports"],
      ["Google Forms", "Registration and feedback forms"],
      ["Recordings", "Class and webinar recordings"],
      ["Posters & Assets", "Session posters, branding, invitations"]
    ]
  },
  {
    id: "sia",
    name: "SIA",
    description: "STEAMLabs Innovation Academy enrolment, learner data, payments, classes, posters, and reports.",
    metrics: [
      ["Enrolment forms", "2"],
      ["Learner records", "1"],
      ["Payments", "Tracked"],
      ["Classes", "Active"]
    ],
    resources: [
      ["Data Files", "Responses and paid student lists"],
      ["Google Forms", "Welcome and enrolment forms"],
      ["Recordings", "Class recordings and learner sessions"],
      ["Posters & Assets", "Programme posters and parent materials"]
    ]
  }
];

const files = [
  ["STEAMLabs Code Clubs Master", "Code Clubs", "408 rows", "Active clubs, learners, county analysis"],
  ["Data Analysis & Reconciliation", "Code Clubs", "400 rows", "Duplicates, portal checks, quality flags"],
  ["Master Canva Education Reporting", "Canva", "9 sheets", "Verified schools and county coverage"],
  ["AI Skilling Proof of Execution", "AI Skilling", "Report", "Milestone evidence and reporting"],
  ["Experience AI Sessions", "Experience AI", "4 sessions", "Teacher participation and recordings"],
  ["Innovation Academy Responses", "SIA", "2 sheets", "Learner enrolment and payment tracking"]
];

export default function Page() {
  const [signedIn, setSignedIn] = useState(false);
  const [activeProgrammeId, setActiveProgrammeId] = useState("code-clubs");
  const [activeSection, setActiveSection] = useState("programmes");
  const [driveUrl, setDriveUrl] = useState("");
  const [driveStatus, setDriveStatus] = useState("Paste a Drive folder URL to connect programme resources.");

  const activeProgramme = useMemo(
    () => programmes.find((programme) => programme.id === activeProgrammeId) ?? programmes[1],
    [activeProgrammeId]
  );

  function handleAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSignedIn(true);
  }

  async function connectDrive() {
    if (!driveUrl.trim()) {
      setDriveStatus("Paste a valid Google Drive folder URL first.");
      return;
    }

    setDriveStatus("Opening Google permission screen...");
    window.location.href = `/api/drive/connect?programmeId=${encodeURIComponent(
      activeProgramme.id
    )}&driveUrl=${encodeURIComponent(driveUrl.trim())}`;
  }

  if (!signedIn) {
    return (
      <main className="auth-page">
        <section className="auth-copy">
          <p className="eyebrow">Takwimu</p>
          <h1>Programme data, files, forms, recordings, posters, reports, and M&E in one secure workspace.</h1>
          <p>
            Sign in to manage each programme separately, connect Google Drive folders, and turn spreadsheets and
            evidence into dashboards.
          </p>
        </section>
        <form className="auth-card" onSubmit={handleAuth}>
          <h2>Sign in</h2>
          <label>
            Work email
            <input type="email" defaultValue="admin@steamlabs.africa" />
          </label>
          <label>
            Password
            <input type="password" defaultValue="password" />
          </label>
          <button type="submit">Open workspace</button>
        </form>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div>
          <strong>Takwimu</strong>
          <span>STEAMLabs Africa</span>
        </div>
        {[
          ["home", "Home"],
          ["programmes", "Programmes"],
          ["files", "Data Files"],
          ["resources", "Resources"],
          ["reports", "Reports"],
          ["tasks", "Tasks"],
          ["roles", "Users & Roles"]
        ].map(([id, label]) => (
          <button
            className={activeSection === id ? "active" : ""}
            key={id}
            type="button"
            onClick={() => setActiveSection(id)}
          >
            {label}
          </button>
        ))}
      </aside>

      <section className="workspace">
        <header className="topbar">
          <input aria-label="Search" placeholder="Search programme data, files, forms, recordings, posters, reports" />
          <button type="button" onClick={() => setActiveSection("resources")}>
            Connect Drive
          </button>
        </header>

        <section className="programme-grid">
          <div className="programme-list">
            <h2>Programmes</h2>
            {programmes.map((programme) => (
              <button
                className={programme.id === activeProgrammeId ? "active" : ""}
                key={programme.id}
                type="button"
                onClick={() => {
                  setActiveProgrammeId(programme.id);
                  setActiveSection("programmes");
                }}
              >
                <strong>{programme.name}</strong>
                <span>{programme.description}</span>
              </button>
            ))}
          </div>

          <div className="programme-panel">
            <div className="panel-title">
              <div>
                <p className="eyebrow">Programme workspace</p>
                <h1>{activeProgramme.name}</h1>
                <p>{activeProgramme.description}</p>
              </div>
              <span>{activeSection}</span>
            </div>

            <nav className="tabs">
              {["Dashboard", "Data Files", "Google Forms", "Reports", "Recordings", "Posters & Assets", "Evidence", "Tasks", "Audit Trail"].map(
                (tab) => (
                  <button key={tab} type="button">
                    {tab}
                  </button>
                )
              )}
            </nav>

            <div className="metrics">
              {activeProgramme.metrics.map(([label, value]) => (
                <div className="metric" key={label}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>

            <div className="content-grid">
              <section className="card large">
                <div className="card-title">
                  <strong>Dashboard analysis</strong>
                  <span>Generated</span>
                </div>
                <div className="chart">
                  <span style={{ height: "44%" }} />
                  <span style={{ height: "62%" }} />
                  <span style={{ height: "78%" }} />
                  <span style={{ height: "58%" }} />
                  <span style={{ height: "86%" }} />
                </div>
              </section>

              <section className="card">
                <div className="card-title">
                  <strong>Resources</strong>
                  <span>Stored per programme</span>
                </div>
                <div className="resources">
                  {activeProgramme.resources.map(([title, detail]) => (
                    <div key={title}>
                      <strong>{title}</strong>
                      <span>{detail}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="card large">
                <div className="card-title">
                  <strong>Data files</strong>
                  <span>Filtered to programme</span>
                </div>
                <table>
                  <tbody>
                    {files
                      .filter((file) => file[1] === activeProgramme.name)
                      .map(([name, programme, size, output]) => (
                        <tr key={name}>
                          <td>{name}</td>
                          <td>{size}</td>
                          <td>{output}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </section>

              <section className="card">
                <div className="card-title">
                  <strong>Connect Drive folder</strong>
                  <span>{activeProgramme.name}</span>
                </div>
                <label>
                  Drive folder URL
                  <input
                    value={driveUrl}
                    onChange={(event) => setDriveUrl(event.target.value)}
                    placeholder="https://drive.google.com/drive/folders/..."
                  />
                </label>
                <button type="button" onClick={connectDrive}>
                  Connect folder
                </button>
                <p>{driveStatus}</p>
              </section>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
