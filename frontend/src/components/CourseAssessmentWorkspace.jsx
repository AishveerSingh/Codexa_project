import { useState } from "react";

const initialModules = [
  {
    id: "week-01",
    title: "Week 01",
    expanded: false,
    items: [
      { id: "w1-l5", title: "Lecture 05: Advantages and Limitations of composite materials.", completed: true, type: "lecture" },
      { id: "w1-l6", title: "Lecture 06: Advantages and Limitations of composite materials.", completed: true, type: "lecture" },
      { id: "w1-q1", title: "Quiz: Week 1: Assignment 1", completed: true, type: "quiz" },
      { id: "w1-fb", title: "Feedback For Week 1", completed: true, type: "feedback" }
    ]
  },
  {
    id: "week-02",
    title: "Week 02",
    expanded: true,
    items: [
      { id: "w2-l7", title: "Lecture 07: Different Types of Fiber", completed: true, type: "lecture" },
      { id: "w2-l8", title: "Lecture 08: Glass Fibers", completed: true, type: "lecture" },
      { id: "w2-l9", title: "Lecture 09: Graphite Fibers", completed: false, type: "lecture" },
      { id: "w2-l10", title: "Lecture 10: Aramid and Boron Fibers", completed: true, type: "lecture" },
      { id: "w2-l11", title: "Lecture 11: Ceramic Fibers", completed: true, type: "lecture" },
      { id: "w2-l12", title: "Lecture 12: Matrix – Properties and classifications.", completed: true, type: "lecture" },
      { id: "w2-q2", title: "Quiz: Week 2: Assignment 2", completed: false, type: "quiz" },
      { id: "w2-fb", title: "Feedback For Week 2", completed: false, type: "feedback" }
    ]
  },
  {
    id: "week-03",
    title: "Week 03",
    expanded: false,
    items: [
      { id: "w3-l13", title: "Lecture 13: Micro-mechanics of Composites", completed: false, type: "lecture" },
      { id: "w3-q3", title: "Quiz: Week 3: Assignment 3", completed: false, type: "quiz" }
    ]
  }
];

const sampleQuestions = [
  {
    id: 1,
    question: "Composite materials can be classified on the basis of:",
    points: "1 Point",
    options: [
      "Type of matrix material",
      "Type of reinforcement material",
      "Both of the options are correct",
      "None of the options are correct"
    ],
    selectedOption: 2 // 0-indexed (Both of the options are correct)
  },
  {
    id: 2,
    question: "Which of the following is usually the stronger constituent of a composite laminate?",
    points: "1 Point",
    options: [
      "Matrix",
      "Reinforcement",
      "Both",
      "None of the options are correct."
    ],
    selectedOption: 1 // Reinforcement
  },
  {
    id: 3,
    question: "If material properties are different at different locations then material is formed as ___________.",
    points: "1 Point",
    options: [
      "Anisotropic material",
      "Isotropic material",
      "Orthotropic material",
      "Heterogeneous material"
    ],
    selectedOption: null
  },
  {
    id: 4,
    question: "Which type of fiber generally possesses maximum specific tensile strength?",
    points: "1 Point",
    options: [
      "Glass fiber",
      "Carbon / Graphite fiber",
      "Aramid fiber",
      "Ceramic fiber"
    ],
    selectedOption: 1
  }
];

export default function CourseAssessmentWorkspace({
  courseTitle = "Introduction to Composites",
  assignmentTitle = "Week 1: Assignment 1",
  dueDate = "2026-08-05, 23:59 IST",
  lastSubmission = "2026-07-30, 13:12 IST"
}) {
  const [modules, setModules] = useState(initialModules);
  const [activeItemId, setActiveItemId] = useState("w2-q2");
  const [answers, setAnswers] = useState(() => {
    const initial = {};
    sampleQuestions.forEach((q) => {
      if (q.selectedOption !== null) {
        initial[q.id] = q.selectedOption;
      }
    });
    return initial;
  });
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [recordedSubmission, setRecordedSubmission] = useState(lastSubmission);
  const [submitNotification, setSubmitNotification] = useState("");

  const toggleModule = (moduleId) => {
    setModules((prev) =>
      prev.map((mod) =>
        mod.id === moduleId ? { ...mod, expanded: !mod.expanded } : mod
      )
    );
  };

  const handleOptionSelect = (questionId, optionIndex) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const handleSaveSubmission = () => {
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}, ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")} IST`;
    setRecordedSubmission(formattedDate);
    setSubmitNotification("Your responses have been successfully recorded.");
    setTimeout(() => setSubmitNotification(""), 4000);
  };

  const activeModuleItem = modules
    .flatMap((m) => m.items)
    .find((item) => item.id === activeItemId);

  const displayTitle = activeModuleItem?.title || assignmentTitle;

  return (
    <div className={`assessment-workspace-layout ${isFullScreen ? "fullscreen-mode" : ""}`}>
      {/* LEFT SIDEBAR: COURSE CONTENT TREE */}
      <aside className="assessment-sidebar-panel">
        <div className="assessment-sidebar-header">
          <h2 className="assessment-course-name">{courseTitle}</h2>
          <div className="assessment-progress-row">
            <span className="assessment-progress-label">Course Progress</span>
            <span className="assessment-progress-val">72.5% <small>(3 of 4)</small></span>
          </div>
        </div>

        <nav className="assessment-tree-nav">
          {modules.map((mod) => (
            <div key={mod.id} className="assessment-module-block">
              <button
                type="button"
                className={`assessment-module-toggle ${mod.expanded ? "expanded" : ""}`}
                onClick={() => toggleModule(mod.id)}
              >
                <span className="assessment-caret-icon">
                  {mod.expanded ? "∨" : ">"}
                </span>
                <span className="assessment-module-title">{mod.title}</span>
              </button>

              {mod.expanded && (
                <ul className="assessment-item-list">
                  {mod.items.map((item) => {
                    const isActive = item.id === activeItemId;
                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          className={`assessment-item-btn ${isActive ? "active-item" : ""}`}
                          onClick={() => setActiveItemId(item.id)}
                        >
                          <span className={`assessment-status-icon ${item.completed ? "completed" : "pending"}`}>
                            {item.completed ? "✓" : "○"}
                          </span>
                          <span className="assessment-item-text">{item.title}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          ))}

          <div className="assessment-module-block extra-link-block">
            <button type="button" className="assessment-module-toggle extra-toggle">
              <span className="assessment-caret-icon">&gt;</span>
              <span className="assessment-module-title uppercase-title">DOWNLOAD VIDEOS</span>
            </button>
          </div>
        </nav>
      </aside>

      {/* RESIZE DIVIDER BAR */}
      <div className="assessment-resize-divider">
        <span className="assessment-divider-grip">||</span>
      </div>

      {/* RIGHT MAIN PANEL: ASSESSMENT CONTENT */}
      <section className="assessment-main-panel">
        <header className="assessment-topbar">
          <div className="assessment-topbar-left">
            <span className="assessment-pill-badge">Assessment</span>
            <h1 className="assessment-title">{displayTitle}</h1>
            {recordedSubmission && (
              <p className="assessment-last-submission font-emerald">
                Your last recorded submission was on {recordedSubmission}.
              </p>
            )}
          </div>

          <div className="assessment-topbar-right">
            <div className="assessment-due-tag font-red">
              Due date on {dueDate}
            </div>
            <div className="assessment-action-buttons">
              <button
                type="button"
                className={`assessment-action-btn ${isBookmarked ? "active-bookmark" : ""}`}
                onClick={() => setIsBookmarked(!isBookmarked)}
                title="Bookmark assignment"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill={isBookmarked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.2">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
                Bookmark
              </button>

              <button
                type="button"
                className="assessment-action-btn"
                onClick={() => setIsFullScreen(!isFullScreen)}
                title="Toggle fullscreen"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                </svg>
                {isFullScreen ? "Exit Full Screen" : "Full Screen"}
              </button>
            </div>
          </div>
        </header>

        {submitNotification && (
          <div className="assessment-notification-toast">
            {submitNotification}
          </div>
        )}

        {/* QUESTIONS CONTAINER */}
        <div className="assessment-questions-container">
          {sampleQuestions.map((q) => {
            const currentSelected = answers[q.id];
            return (
              <article key={q.id} className="assessment-question-card">
                <div className="assessment-question-header">
                  <span className="assessment-question-text">
                    <strong>{q.id}.</strong> {q.question}
                  </span>
                  <span className="assessment-point-badge">{q.points}</span>
                </div>

                <div className="assessment-options-list">
                  {q.options.map((opt, optIndex) => {
                    const isChecked = currentSelected === optIndex;
                    return (
                      <label
                        key={optIndex}
                        className={`assessment-radio-option ${isChecked ? "selected-radio" : ""}`}
                      >
                        <input
                          type="radio"
                          name={`question-${q.id}`}
                          checked={isChecked}
                          onChange={() => handleOptionSelect(q.id, optIndex)}
                        />
                        <span className="custom-radio-circle"></span>
                        <span className="option-text-label">{opt}</span>
                      </label>
                    );
                  })}
                </div>
              </article>
            );
          })}

          <div className="assessment-footer-actions">
            <button
              type="button"
              className="assessment-submit-btn"
              onClick={handleSaveSubmission}
            >
              Submit Answers
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
