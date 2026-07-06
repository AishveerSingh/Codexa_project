import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getAuthHeaders, getStudentSession, getFacultySession, getAdminSession } from "../../utils/session";

const apiBaseUrl = import.meta.env.VITE_API_URL || "https://codingplatform-qf38.onrender.com/api";
const initialEditor = {
  language: "python",
  sourceCode: ""
};

function getDefaultCodeTemplate(language, problemTitle) {
  const normLang = (language || "").toLowerCase();
  const title = (problemTitle || "").trim();

  if (title === "Sum of Two Numbers") {
    if (normLang === "python") {
      return `class Solution:\n    def solve(self, a: int, b: int) -> int:\n        # Write your code here\n        return a + b\n`;
    }
    if (normLang === "cpp") {
      return `class Solution {\npublic:\n    int solve(int a, int b) {\n        // Write your code here\n        return a + b;\n    }\n};`;
    }
    if (normLang === "java") {
      return `class Solution {\n    public int solve(int a, int b) {\n        // Write your code here\n        return a + b;\n    }\n}`;
    }
    if (normLang === "javascript") {
      return `class Solution {\n    solve(a, b) {\n        // Write your code here\n        return a + b;\n    }\n}`;
    }
  }

  if (title === "Factorial of a Number") {
    if (normLang === "python") {
      return `class Solution:\n    def solve(self, n: int) -> int:\n        # Write your code here\n        \n`;
    }
    if (normLang === "cpp") {
      return `class Solution {\npublic:\n    int solve(int n) {\n        // Write your code here\n        \n    }\n};`;
    }
    if (normLang === "java") {
      return `class Solution {\n    public int solve(int n) {\n        // Write your code here\n        \n    }\n}`;
    }
    if (normLang === "javascript") {
      return `class Solution {\n    solve(n) {\n        // Write your code here\n        \n    }\n}`;
    }
  }

  if (title === "Nth Fibonacci Number") {
    if (normLang === "python") {
      return `class Solution:\n    def solve(self, n: int) -> int:\n        # Write your code here\n        \n`;
    }
    if (normLang === "cpp") {
      return `class Solution {\npublic:\n    int solve(int n) {\n        // Write your code here\n        \n    }\n};`;
    }
    if (normLang === "java") {
      return `class Solution {\n    public int solve(int n) {\n        // Write your code here\n        \n    }\n}`;
    }
    if (normLang === "javascript") {
      return `class Solution {\n    solve(n) {\n        // Write your code here\n        \n    }\n}`;
    }
  }

  if (title === "Palindrome String Check") {
    if (normLang === "python") {
      return `class Solution:\n    def solve(self, s: str) -> bool:\n        # Write your code here\n        \n`;
    }
    if (normLang === "cpp") {
      return `class Solution {\npublic:\n    bool solve(string s) {\n        // Write your code here\n        \n    }\n};`;
    }
    if (normLang === "java") {
      return `class Solution {\n    public boolean solve(String s) {\n        // Write your code here\n        \n    }\n}`;
    }
    if (normLang === "javascript") {
      return `class Solution {\n    solve(s) {\n        // Write your code here\n        \n    }\n}`;
    }
  }

  if (title === "Find the Missing Number") {
    if (normLang === "python") {
      return `from typing import List\n\nclass Solution:\n    def solve(self, nums: List[int]) -> int:\n        # Write your code here\n        \n`;
    }
    if (normLang === "cpp") {
      return `class Solution {\npublic:\n    int solve(vector<int>& nums) {\n        // Write your code here\n        \n    }\n};`;
    }
    if (normLang === "java") {
      return `class Solution {\n    public int solve(int[] nums) {\n        // Write your code here\n        \n    }\n}`;
    }
    if (normLang === "javascript") {
      return `class Solution {\n    solve(nums) {\n        // Write your code here\n        \n    }\n}`;
    }
  }

  if (title === "Valid Parentheses") {
    if (normLang === "python") {
      return `class Solution:\n    def isValid(self, s: str) -> bool:\n        # Write your code here\n        \n`;
    }
    if (normLang === "cpp") {
      return `class Solution {\npublic:\n    bool isValid(string s) {\n        // Write your code here\n        \n    }\n};`;
    }
    if (normLang === "java") {
      return `class Solution {\n    public boolean isValid(String s) {\n        // Write your code here\n        \n    }\n}`;
    }
    if (normLang === "javascript") {
      return `class Solution {\n    isValid(s) {\n        // Write your code here\n        \n    }\n}`;
    }
  }

  if (title === "Two Sum") {
    if (normLang === "python") {
      return `from typing import List\n\nclass Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        # Write your code here\n        \n`;
    }
    if (normLang === "cpp") {
      return `class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Write your code here\n        \n    }\n};`;
    }
    if (normLang === "java") {
      return `class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your code here\n        \n    }\n}`;
    }
    if (normLang === "javascript") {
      return `class Solution {\n    twoSum(nums, target) {\n        // Write your code here\n        \n    }\n}`;
    }
  }

  if (title === "Longest Substring Without Repeating Characters") {
    if (normLang === "python") {
      return `class Solution:\n    def lengthOfLongestSubstring(self, s: str) -> int:\n        # Write your code here\n        \n`;
    }
    if (normLang === "cpp") {
      return `class Solution {\npublic:\n    int lengthOfLongestSubstring(string s) {\n        // Write your code here\n        \n    }\n};`;
    }
    if (normLang === "java") {
      return `class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        // Write your code here\n        \n    }\n}`;
    }
    if (normLang === "javascript") {
      return `class Solution {\n    lengthOfLongestSubstring(s) {\n        // Write your code here\n        \n    }\n}`;
    }
  }

  if (normLang === "python") {
    return `class Solution:\n    def solve(self):\n        pass\n`;
  }
  if (normLang === "cpp") {
    return `class Solution {\npublic:\n    void solve() {\n        \n    }\n};`;
  }
  if (normLang === "java") {
    return `class Solution {\n    public void solve() {\n        \n    }\n}`;
  }
  if (normLang === "javascript") {
    return `class Solution {\n    solve() {\n        \n    }\n}`;
  }

  return "";
}

const editorDraftStorageKey = "coding_platform_problem_drafts";
const problemTimerStorageKey = "coding_platform_problem_timers";

const initialTimerState = {
  isRunning: false,
  startedAt: 0,
  elapsedBeforePause: 0
};
const initialToastState = {
  visible: false,
  type: "success",
  title: "",
  message: ""
};
const pairedCharacters = {
  "(": ")",
  "{": "}",
  "[": "]",
  '"': '"',
  "'": "'"
};
const languageSuggestions = {
  python: [
    { label: "def", insertText: "def function_name():\n    " },
    { label: "for", insertText: "for    in    :\n    " },
    { label: "if", insertText: "if condition:\n    " },
    { label: "elif", insertText: "elif condition:\n    " },
    { label: "else", insertText: "else:\n    " },
    { label: "while", insertText: "while condition:\n    " },
    { label: "class", insertText: "class Solution:\n    def __init__(self):\n        " },
    { label: "return", insertText: "return " },
    { label: "print", insertText: "print()" },
    { label: "range", insertText: "range()" }
  ],
  javascript: [
    { label: "function", insertText: "function name() {\n  \n}" },
    { label: "const", insertText: "const " },
    { label: "let", insertText: "let " },
    { label: "for", insertText: "for (let i = 0; i < length; i += 1) {\n  \n}" },
    { label: "if", insertText: "if () {\n  \n}" },
    { label: "else", insertText: "else {\n  \n}" },
    { label: "while", insertText: "while () {\n  \n}" },
    { label: "return", insertText: "return " },
    { label: "console", insertText: "console.log();" },
    { label: "class", insertText: "class Solution {\n  constructor() {\n    \n  }\n}" }
  ],
  java: [
    { label: "main", insertText: "public class Main {\n    public static void main(String[] args) {\n        \n    }\n}" },
    { label: "for", insertText: "for (int i = 0; i < n; i++) {\n    \n}" },
    { label: "if", insertText: "if () {\n    \n}" },
    { label: "else", insertText: "else {\n    \n}" },
    { label: "while", insertText: "while () {\n    \n}" },
    { label: "return", insertText: "return " },
    { label: "System", insertText: "System.out.println();" },
    { label: "class", insertText: "class Solution {\n    \n}" }
  ],
  cpp: [
    { label: "include", insertText: "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    \n    return 0;\n}" },
    { label: "for", insertText: "for (int i = 0; i < n; i++) {\n    \n}" },
    { label: "if", insertText: "if () {\n    \n}" },
    { label: "else", insertText: "else {\n    \n}" },
    { label: "while", insertText: "while () {\n    \n}" },
    { label: "return", insertText: "return " },
    { label: "cout", insertText: "cout <<  << endl;" },
    { label: "vector", insertText: "vector<int> " }
  ]
};
const syntaxKeywords = {
  python: [
    "and",
    "as",
    "break",
    "class",
    "continue",
    "def",
    "elif",
    "else",
    "False",
    "for",
    "from",
    "if",
    "import",
    "in",
    "is",
    "lambda",
    "None",
    "not",
    "or",
    "pass",
    "print",
    "return",
    "True",
    "while"
  ],
  javascript: [
    "break",
    "case",
    "catch",
    "class",
    "const",
    "continue",
    "else",
    "export",
    "for",
    "function",
    "if",
    "import",
    "let",
    "new",
    "return",
    "switch",
    "try",
    "while"
  ],
  java: [
    "class",
    "else",
    "for",
    "if",
    "import",
    "int",
    "new",
    "private",
    "public",
    "return",
    "static",
    "String",
    "void",
    "while"
  ],
  cpp: [
    "auto",
    "class",
    "const",
    "cout",
    "else",
    "for",
    "if",
    "include",
    "int",
    "return",
    "string",
    "using",
    "vector",
    "while"
  ]
};

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function readStoredObject(storageKey) {
  try {
    const storedValue = localStorage.getItem(storageKey);

    if (!storedValue) {
      return {};
    }

    const parsedValue = JSON.parse(storedValue);
    return parsedValue && typeof parsedValue === "object" ? parsedValue : {};
  } catch (_error) {
    return {};
  }
}

function getSolvedTimeStorageKey(problemId) {
  return `coding_platform_problem_solved_${problemId}`;
}

function highlightCode(sourceCode, language) {
  const source = sourceCode || "";
  const stringPattern = /("([^"\\]|\\.)*"|'([^'\\]|\\.)*')/g;
  const numberPattern = /\b\d+(\.\d+)?\b/g;
  const commentPattern =
    language === "python" ? /#[^\n]*/g : /\/\/[^\n]*|\/\*[\s\S]*?\*\//g;
  const keywordPattern = new RegExp(`\\b(${(syntaxKeywords[language] || []).join("|")})\\b`, "g");
  const tokenPatterns = [
    { pattern: commentPattern, className: "token-comment" },
    { pattern: stringPattern, className: "token-string" },
    { pattern: keywordPattern, className: "token-keyword" },
    { pattern: numberPattern, className: "token-number" }
  ];
  const matches = [];

  tokenPatterns.forEach(({ pattern, className }) => {
    for (const match of source.matchAll(pattern)) {
      if (match.index === undefined) {
        continue;
      }

      matches.push({
        start: match.index,
        end: match.index + match[0].length,
        className,
        value: match[0]
      });
    }
  });

  matches.sort((firstMatch, secondMatch) => {
    if (firstMatch.start !== secondMatch.start) {
      return firstMatch.start - secondMatch.start;
    }

    return secondMatch.end - firstMatch.end;
  });

  const filteredMatches = [];
  let lastTokenEnd = -1;

  matches.forEach((match) => {
    if (match.start < lastTokenEnd) {
      return;
    }

    filteredMatches.push(match);
    lastTokenEnd = match.end;
  });

  let highlightedCode = "";
  let lastIndex = 0;

  filteredMatches.forEach((match) => {
    highlightedCode += escapeHtml(source.slice(lastIndex, match.start));
    highlightedCode += `<span class="${match.className}">${escapeHtml(match.value)}</span>`;
    lastIndex = match.end;
  });

  highlightedCode += escapeHtml(source.slice(lastIndex));
  return highlightedCode;
}

function getWordStart(value, cursorPosition) {
  let index = cursorPosition;

  while (index > 0 && /[A-Za-z_]/.test(value[index - 1])) {
    index -= 1;
  }

  return index;
}

function buildSuggestions(sourceCode, cursorPosition, language) {
  const wordStart = getWordStart(sourceCode, cursorPosition);
  const currentToken = sourceCode.slice(wordStart, cursorPosition);

  if (!currentToken.trim()) {
    return {
      currentToken: "",
      wordStart,
      matches: []
    };
  }

  const normalizedToken = currentToken.toLowerCase();
  const matches = (languageSuggestions[language] || []).filter((entry) =>
    entry.label.toLowerCase().startsWith(normalizedToken)
  );

  return {
    currentToken,
    wordStart,
    matches
  };
}

function getCaretCoordinates(textarea, cursorPosition) {
  if (!textarea) {
    return { top: 16, left: 16 };
  }

  const computedStyle = window.getComputedStyle(textarea);
  const mirror = document.createElement("div");

  mirror.style.position = "absolute";
  mirror.style.visibility = "hidden";
  mirror.style.pointerEvents = "none";
  mirror.style.whiteSpace = "pre-wrap";
  mirror.style.wordBreak = "break-word";
  mirror.style.overflowWrap = "break-word";
  mirror.style.boxSizing = "border-box";
  mirror.style.left = "-9999px";
  mirror.style.top = "0";
  mirror.style.width = `${textarea.clientWidth}px`;
  mirror.style.fontFamily = computedStyle.fontFamily;
  mirror.style.fontSize = computedStyle.fontSize;
  mirror.style.fontWeight = computedStyle.fontWeight;
  mirror.style.letterSpacing = computedStyle.letterSpacing;
  mirror.style.lineHeight = computedStyle.lineHeight;
  mirror.style.padding = computedStyle.padding;
  mirror.style.border = computedStyle.border;

  mirror.textContent = textarea.value.slice(0, cursorPosition);

  const marker = document.createElement("span");
  marker.textContent = textarea.value[cursorPosition] || " ";
  mirror.appendChild(marker);
  document.body.appendChild(mirror);

  const coordinates = {
    top: marker.offsetTop - textarea.scrollTop + marker.offsetHeight + 8,
    left: marker.offsetLeft - textarea.scrollLeft
  };

  document.body.removeChild(mirror);
  return coordinates;
}

function formatExecutionMessage(result, successMessage) {
  if (!result) {
    return successMessage;
  }

  if (result.status === "accepted") {
    return successMessage;
  }

  return result.verdictLabel || result.status.replaceAll("_", " ");
}

export default function StudentProblemDetails() {
  const { problemId } = useParams();
  const session = getStudentSession() || getFacultySession() || getAdminSession();
  const student = session?.user;
  const userRole = student?.role || "student";
  const buttonClass = userRole === "admin" ? "admin-button" : "student-button";
  const backToProblemsPath = userRole === "admin" ? "/admin/problems" : userRole === "faculty" ? "/faculty/problems" : "/student/problems";
  const backToDashboardPath = `/${userRole}/dashboard`;
  const editorRef = useRef(null);
  const highlightRef = useRef(null);
  const lineNumbersRef = useRef(null);
  const [problem, setProblem] = useState(null);
  const [status, setStatus] = useState({
    loading: true,
    error: ""
  });
  const [consoleTab, setConsoleTab] = useState("results");
  const [editor, setEditor] = useState(initialEditor);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState("");
  const [latestExecutionDetails, setLatestExecutionDetails] = useState("");
  const [latestSubmitResults, setLatestSubmitResults] = useState([]);
  const [latestSubmitExecution, setLatestSubmitExecution] = useState(null);
  const [runMessage, setRunMessage] = useState("");
  const [runResults, setRunResults] = useState(null);
  const [submissionHistory, setSubmissionHistory] = useState([]);
  const [historyStatus, setHistoryStatus] = useState({
    loading: Boolean(student?.id),
    error: ""
  });
  const [problemOrder, setProblemOrder] = useState([]);
  const [suggestionState, setSuggestionState] = useState({
    visible: false,
    suggestions: [],
    selectedIndex: 0,
    wordStart: 0,
    cursorPosition: 0,
    popupTop: 18,
    popupLeft: 18
  });
  const [editorFontSize, setEditorFontSize] = useState(15);
  const [leftActiveTab, setLeftActiveTab] = useState("description");
  const [activeTestCaseIndex, setActiveTestCaseIndex] = useState(0);
  const [cursorPos, setCursorPos] = useState({ line: 1, column: 1 });

  function updateCursorPos(textarea) {
    if (!textarea) return;
    const textBeforeCursor = textarea.value.slice(0, textarea.selectionStart);
    const lines = textBeforeCursor.split("\n");
    setCursorPos({
      line: lines.length,
      column: lines[lines.length - 1].length + 1
    });
  }
  const [isDraftReady, setIsDraftReady] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [timerState, setTimerState] = useState(initialTimerState);
  const [showRunDetails, setShowRunDetails] = useState(false);
  const [showSubmissionDetails, setShowSubmissionDetails] = useState(false);
  const [toast, setToast] = useState(initialToastState);
  const latestSubmission = submissionHistory[0] ?? null;
  const isSolved = useMemo(() => {
    return submissionHistory.some((submission) => submission.status === "accepted");
  }, [submissionHistory]);

  function showToast(type, title, message) {
    setToast({
      visible: true,
      type,
      title,
      message
    });
  }

  useEffect(() => {
    setIsDraftReady(false);

    const savedDrafts = readStoredObject(editorDraftStorageKey);
    const savedDraft = savedDrafts[problemId];

    if (!savedDraft) {
      setEditor(initialEditor);
      setIsDraftReady(true);
      return;
    }

    setEditor({
      language: savedDraft.language || "python",
      sourceCode: savedDraft.sourceCode || ""
    });
    setIsDraftReady(true);
  }, [problemId]);

  useEffect(() => {
    if (problem?.title) {
      document.title = `Codexa: ${problem.title}`;
    } else {
      document.title = "Codexa: Loading Challenge";
    }
  }, [problem]);

  useEffect(() => {
    if (!problemId || !isDraftReady) {
      return;
    }

    const savedDrafts = readStoredObject(editorDraftStorageKey);
    savedDrafts[problemId] = {
      language: editor.language,
      sourceCode: editor.sourceCode
    };
    localStorage.setItem(editorDraftStorageKey, JSON.stringify(savedDrafts));
  }, [editor.language, editor.sourceCode, isDraftReady, problemId]);

  useEffect(() => {
    let isMounted = true;

    async function loadProblem() {
      try {
        const response = await fetch(`${apiBaseUrl}/problems/${problemId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load coding question.");
        }

        if (isMounted) {
          setProblem(data);
          setStatus({
            loading: false,
            error: ""
          });

          const savedDrafts = readStoredObject(editorDraftStorageKey);
          const savedDraft = savedDrafts[problemId];
          if (!savedDraft || !savedDraft.sourceCode) {
            const initialLang = savedDraft?.language || initialEditor.language;
            setEditor({
              language: initialLang,
              sourceCode: getDefaultCodeTemplate(initialLang, data.title)
            });
          }
        }
      } catch (error) {
        if (isMounted) {
          setStatus({
            loading: false,
            error: error.message
          });
        }
      }
    }

    loadProblem();

    return () => {
      isMounted = false;
    };
  }, [problemId]);

  useEffect(() => {
    let isMounted = true;

    async function loadProblemOrder() {
      try {
        const response = await fetch(`${apiBaseUrl}/problems`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load coding questions.");
        }

        if (isMounted) {
          setProblemOrder(data);
        }
      } catch (_error) {
        if (isMounted) {
          setProblemOrder([]);
        }
      }
    }

    loadProblemOrder();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadSubmissionHistory() {
      if (!student?.id || !session?.token) {
        setHistoryStatus({
          loading: false,
          error: student?.id ? "Log in again to view submission history." : ""
        });
        return;
      }

      try {
        const response = await fetch(
          `${apiBaseUrl}/submissions/student/${student.id}?problemId=${problemId}`,
          {
            headers: {
              ...getAuthHeaders(session.token)
            }
          }
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load submission history.");
        }

        if (isMounted) {
          setSubmissionHistory(data);
          setHistoryStatus({
            loading: false,
            error: ""
          });
        }
      } catch (error) {
        if (isMounted) {
          setHistoryStatus({
            loading: false,
            error: error.message
          });
        }
      }
    }

    loadSubmissionHistory();

    return () => {
      isMounted = false;
    };
  }, [problemId, session?.token, student?.id]);

  useEffect(() => {
    setLatestExecutionDetails(latestSubmission?.compiler_output || "");
  }, [latestSubmission]);

  useEffect(() => {
    setRunResults(null);
    setRunMessage("");
    setSubmissionMessage("");
    setLatestSubmitResults([]);
    setLatestSubmitExecution(null);
    setSubmissionHistory([]);
    setHistoryStatus({
      loading: Boolean(student?.id),
      error: ""
    });
    setShowRunDetails(false);
    setShowSubmissionDetails(false);
  }, [problemId, student?.id]);

  useEffect(() => {
    if (!toast.visible) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setToast((currentToast) => ({
        ...currentToast,
        visible: false
      }));
    }, 2600);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [toast.visible]);

  useEffect(() => {
    if (!problemId) {
      return;
    }

    const solvedTimeKey = getSolvedTimeStorageKey(problemId);
    const savedSolvedTime = localStorage.getItem(solvedTimeKey);

    if (isSolved) {
      if (savedSolvedTime !== null) {
        const parsedSolvedTime = Number.parseInt(savedSolvedTime, 10);
        const normalizedSolvedTime = Number.isNaN(parsedSolvedTime) ? 0 : parsedSolvedTime;

        setElapsedSeconds(normalizedSolvedTime);
        setTimerState({
          isRunning: false,
          startedAt: 0,
          elapsedBeforePause: normalizedSolvedTime
        });
      }
      return;
    }

    const savedTimers = readStoredObject(problemTimerStorageKey);
    const savedTimer = savedTimers[problemId];
    const normalizedTimer =
      savedTimer && typeof savedTimer === "object"
        ? {
            isRunning: savedTimer.isRunning ?? false,
            startedAt: savedTimer.startedAt ?? 0,
            elapsedBeforePause: savedTimer.elapsedBeforePause ?? 0
          }
        : {
            isRunning: false,
            startedAt: 0,
            elapsedBeforePause: typeof savedTimer === "number" ? savedTimer : 0
          };

    if (!savedTimer) {
      savedTimers[problemId] = normalizedTimer;
      localStorage.setItem(problemTimerStorageKey, JSON.stringify(savedTimers));
    }

    setTimerState(normalizedTimer);
  }, [problemId, isSolved]);

  useEffect(() => {
    if (isSolved && problemId) {
      const solvedTimeKey = getSolvedTimeStorageKey(problemId);
      const savedSolvedTime = localStorage.getItem(solvedTimeKey);

      let frozenElapsedSeconds = Number.parseInt(savedSolvedTime || "", 10);

      if (Number.isNaN(frozenElapsedSeconds)) {
        frozenElapsedSeconds =
          timerState.elapsedBeforePause +
          (timerState.isRunning
            ? Math.max(0, Math.floor((Date.now() - timerState.startedAt) / 1000))
            : 0);
        localStorage.setItem(solvedTimeKey, String(frozenElapsedSeconds));
      }

      if (
        timerState.isRunning ||
        timerState.startedAt !== 0 ||
        timerState.elapsedBeforePause !== frozenElapsedSeconds
      ) {
        setTimerState({
          isRunning: false,
          startedAt: 0,
          elapsedBeforePause: frozenElapsedSeconds
        });
      }

      setElapsedSeconds(frozenElapsedSeconds);
    }
  }, [isSolved, problemId, timerState]);

  useEffect(() => {
    if (!problemId) {
      return undefined;
    }

    if (isSolved) {
      return undefined;
    }

    const savedTimers = readStoredObject(problemTimerStorageKey);
    savedTimers[problemId] = timerState;
    localStorage.setItem(problemTimerStorageKey, JSON.stringify(savedTimers));

    if (!timerState.isRunning) {
      setElapsedSeconds(timerState.elapsedBeforePause);
      return undefined;
    }

    const update = () => {
      setElapsedSeconds(
        timerState.elapsedBeforePause +
          Math.max(0, Math.floor((Date.now() - timerState.startedAt) / 1000))
      );
    };

    update();
    const intervalId = window.setInterval(update, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isSolved, problemId, timerState]);

  function updateSuggestionState(sourceCode, cursorPosition, language) {
    const suggestionResult = buildSuggestions(sourceCode, cursorPosition, language);
    const caretCoordinates = getCaretCoordinates(editorRef.current, cursorPosition);

    setSuggestionState({
      visible: suggestionResult.matches.length > 0,
      suggestions: suggestionResult.matches,
      selectedIndex: 0,
      wordStart: suggestionResult.wordStart,
      cursorPosition,
      popupTop: caretCoordinates.top,
      popupLeft: caretCoordinates.left
    });
  }

  function applyEditorValue(nextSourceCode, nextSelectionStart, nextSelectionEnd = nextSelectionStart) {
    setEditor((currentEditor) => ({
      ...currentEditor,
      sourceCode: nextSourceCode
    }));

    window.requestAnimationFrame(() => {
      if (editorRef.current) {
        editorRef.current.focus();
        editorRef.current.setSelectionRange(nextSelectionStart, nextSelectionEnd);
      }
    });

    updateSuggestionState(nextSourceCode, nextSelectionStart, editor.language);
  }

  function acceptSuggestion(index = suggestionState.selectedIndex) {
    const textarea = editorRef.current;

    if (!textarea || !suggestionState.suggestions[index]) {
      return;
    }

    const selectedSuggestion = suggestionState.suggestions[index];
    let before = editor.sourceCode.slice(0, suggestionState.wordStart);
    const after = editor.sourceCode.slice(textarea.selectionStart);
    const insertText = selectedSuggestion.insertText;

    if (before.endsWith("#") && insertText.startsWith("#")) {
      before = before.slice(0, -1);
    }

    const nextSourceCode = `${before}${insertText}${after}`;
    const nextCursorPosition = before.length + insertText.length;

    applyEditorValue(nextSourceCode, nextCursorPosition);
  }

  function handleEditorChange(event) {
    const { name, value } = event.target;

    if (name === "language") {
      setEditor((currentEditor) => ({
        ...currentEditor,
        language: value,
        sourceCode: getDefaultCodeTemplate(value, problem?.title)
      }));
      setSuggestionState({
        visible: false,
        suggestions: [],
        selectedIndex: 0,
        wordStart: 0,
        cursorPosition: 0
      });
      return;
    }

    setEditor((currentEditor) => ({
      ...currentEditor,
      [name]: value
    }));

    updateSuggestionState(value, event.target.selectionStart, editor.language);
  }

  function handleResetCode() {
    if (problem) {
      setEditor((current) => ({
        ...current,
        sourceCode: getDefaultCodeTemplate(current.language, problem.title)
      }));
      showToast("info", "Reset", "Code reset to default template.");
    }
  }
  function handleEditorKeyDown(event) {
    const textarea = event.currentTarget;
    const { selectionStart, selectionEnd, value } = textarea;
    const selectedText = value.slice(selectionStart, selectionEnd);
    const nextCharacter = value[selectionEnd] || "";

    if (suggestionState.visible && event.key === "ArrowDown") {
      event.preventDefault();
      setSuggestionState((current) => ({
        ...current,
        selectedIndex: (current.selectedIndex + 1) % current.suggestions.length
      }));
      return;
    }

    if (suggestionState.visible && event.key === "ArrowUp") {
      event.preventDefault();
      setSuggestionState((current) => ({
        ...current,
        selectedIndex:
          (current.selectedIndex - 1 + current.suggestions.length) % current.suggestions.length
      }));
      return;
    }

    if (suggestionState.visible && event.key === "Tab") {
      event.preventDefault();
      acceptSuggestion();
      return;
    }

    if (suggestionState.visible && event.key === "Enter") {
      setSuggestionState((current) => ({
        ...current,
        visible: false
      }));
      return;
    }

    if (event.key === "Escape") {
      setSuggestionState((current) => ({
        ...current,
        visible: false
      }));
      return;
    }

    if (event.key === "Tab") {
      event.preventDefault();
      const nextSourceCode = `${value.slice(0, selectionStart)}  ${value.slice(selectionEnd)}`;
      applyEditorValue(nextSourceCode, selectionStart + 2);
      return;
    }

    if (event.key === "Enter" && value[selectionStart - 1] === "{" && nextCharacter === "}") {
      event.preventDefault();
      const indent = editor.language === "python" ? "    " : "  ";
      const nextSourceCode = `${value.slice(0, selectionStart)}\n${indent}\n${value.slice(selectionEnd)}`;
      applyEditorValue(nextSourceCode, selectionStart + indent.length + 1);
      return;
    }

    if (pairedCharacters[event.key]) {
      event.preventDefault();
      const closingCharacter = pairedCharacters[event.key];
      const nextSourceCode = `${value.slice(0, selectionStart)}${event.key}${selectedText}${closingCharacter}${value.slice(selectionEnd)}`;
      const nextCursorPosition = selectedText ? selectionEnd + 2 : selectionStart + 1;
      const nextSelectionEnd = selectedText ? selectionEnd + 1 : nextCursorPosition;
      applyEditorValue(nextSourceCode, nextCursorPosition, nextSelectionEnd);
      return;
    }

    if (Object.values(pairedCharacters).includes(event.key) && nextCharacter === event.key) {
      event.preventDefault();
      applyEditorValue(value, selectionStart + 1);
      return;
    }

    if (
      event.key === "Backspace" &&
      selectionStart === selectionEnd &&
      pairedCharacters[value[selectionStart - 1]] === value[selectionStart]
    ) {
      event.preventDefault();
      const nextSourceCode = `${value.slice(0, selectionStart - 1)}${value.slice(selectionStart + 1)}`;
      applyEditorValue(nextSourceCode, selectionStart - 1);
      return;
    }
  }

  function handleEditorScroll(event) {
    const { scrollTop, scrollLeft } = event.currentTarget;

    if (highlightRef.current) {
      highlightRef.current.scrollTop = scrollTop;
      highlightRef.current.scrollLeft = scrollLeft;
    }

    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = scrollTop;
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!student?.id || !session?.token) {
      setSubmissionMessage("Student session not found. Please log in again.");
      return;
    }

    setIsSubmitting(true);
    setSubmissionMessage("");
    setRunResults(null);
    setRunMessage("");
    setConsoleTab("results");
    setLeftActiveTab("testResult");

    try {
      const response = await fetch(`${apiBaseUrl}/submissions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(session.token)
        },
        body: JSON.stringify({
          studentId: student.id,
          problemId,
          language: editor.language,
          sourceCode: editor.sourceCode
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to submit solution.");
      }

      setSubmissionHistory((currentHistory) => [data.submission, ...currentHistory]);
      setSubmissionMessage(
        formatExecutionMessage(data.execution, "Latest result: success.")
      );
      setLatestExecutionDetails(data.submission.compiler_output || "");
      setLatestSubmitResults(data.testCaseResults || []);
      setLatestSubmitExecution(data.execution || null);
      setShowSubmissionDetails(true);

      if (data.submission?.status === "accepted") {
        showToast("success", "Accepted", "Submission passed hidden test cases.");
      } else {
        showToast(
          "error",
          data.execution?.verdictLabel || "Submission failed",
          "Check the submission panel for detailed feedback."
        );
      }
    } catch (error) {
      setSubmissionMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRunCode() {
    if (!session?.token) {
      setRunMessage("Student session not found. Please log in again.");
      return;
    }

    if (!editor.sourceCode.trim()) {
      setRunMessage("Write some code before running sample test cases.");
      return;
    }

    setIsRunning(true);
    setRunMessage("");
    setSubmissionMessage("");
    setLatestExecutionDetails("");
    setLatestSubmitResults([]);
    setLatestSubmitExecution(null);
    setConsoleTab("results");
    setLeftActiveTab("testResult");

    try {
      const response = await fetch(`${apiBaseUrl}/submissions/run`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(session.token)
        },
        body: JSON.stringify({
          problemId,
          language: editor.language,
          sourceCode: editor.sourceCode
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to run sample test cases.");
      }

      setRunResults(data.result);
      setRunMessage(
        formatExecutionMessage(data.result, "Run completed on sample test cases.")
      );
      setShowRunDetails(true);

      if (data.result?.status === "accepted") {
        showToast("success", "Accepted", "All visible test cases passed.");
      } else {
        showToast(
          "error",
          data.result?.verdictLabel || "Run failed",
          "Open the test cases below to review the failure."
        );
      }
    } catch (error) {
      setRunMessage(error.message);
    } finally {
      setIsRunning(false);
    }
  }

  function formatElapsedTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (totalSeconds % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  }

  function handleTimerStart() {
    setTimerState((currentTimerState) => {
      if (isSolved || currentTimerState.isRunning) {
        return currentTimerState;
      }

      return {
        isRunning: true,
        startedAt: Date.now(),
        elapsedBeforePause: currentTimerState.elapsedBeforePause
      };
    });
  }

  function handleTimerPause() {
    setTimerState((currentTimerState) => {
      if (isSolved || !currentTimerState.isRunning) {
        return currentTimerState;
      }

      return {
        isRunning: false,
        startedAt: currentTimerState.startedAt,
        elapsedBeforePause:
          currentTimerState.elapsedBeforePause +
          Math.max(0, Math.floor((Date.now() - currentTimerState.startedAt) / 1000))
      };
    });
  }

  function handleTimerReset() {
    if (problemId) {
      localStorage.removeItem(getSolvedTimeStorageKey(problemId));

      const savedTimers = readStoredObject(problemTimerStorageKey);
      delete savedTimers[problemId];
      localStorage.setItem(problemTimerStorageKey, JSON.stringify(savedTimers));
    }

    setTimerState(initialTimerState);
    setElapsedSeconds(0);
  }

  const currentProblemIndex = problemOrder.findIndex((entry) => entry.id === problemId);
  const previousProblem =
    currentProblemIndex > 0 ? problemOrder[currentProblemIndex - 1] : null;
  const nextProblem =
    currentProblemIndex >= 0 && currentProblemIndex < problemOrder.length - 1
      ? problemOrder[currentProblemIndex + 1]
      : null;
  const failedTestCount = latestSubmission
    ? Math.max((latestSubmission.total_test_cases || 0) - (latestSubmission.passed_test_cases || 0), 0)
    : 0;
  const editorLineNumbers = useMemo(() => {
    const lineCount = Math.max(editor.sourceCode.split("\n").length, 1);
    return Array.from({ length: lineCount }, (_, index) => index + 1);
  }, [editor.sourceCode]);
  const highlightedCode = useMemo(
    () => highlightCode(editor.sourceCode, editor.language),
    [editor.language, editor.sourceCode]
  );
  const submissionMessageClassName = submissionMessage.toLowerCase().includes("success")
    ? "success"
    : "error";
  const runMessageClassName = runResults?.status === "accepted" ? "success" : "error";
  const latestRunErrorType = runResults?.errorType
    ? runResults.errorType.replaceAll("_", " ")
    : "none";
  const latestSubmitErrorType = latestSubmitExecution?.errorType
    ? latestSubmitExecution.errorType.replaceAll("_", " ")
    : "none";

  return (
    <main className="detail-page student-detail-page">
      {toast.visible ? (
        <div className={`workspace-toast workspace-toast-${toast.type}`} role="status" aria-live="polite">
          <strong>{toast.title}</strong>
          <span>{toast.message}</span>
        </div>
      ) : null}
      <section className="detail-card student-detail-card student-workspace-card">
        <header className="leetcode-topbar">
          <div className="leetcode-topbar-left">
            <span className="leetcode-logo">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor" style={{ marginRight: "0.2rem" }}><path d="M13.483 0a1.374 1.374 0 0 0-.961.414l-9.777 9.778a1.375 1.375 0 0 0 0 1.945l1.945 1.945a1.375 1.375 0 0 0 1.945 0l7.832-7.831 2.917 2.917a1.375 1.375 0 0 0 1.945 0l1.945-1.945a1.375 1.375 0 0 0 0-1.945L14.444.414A1.374 1.374 0 0 0 13.483 0zm-8.8 14.444a1.375 1.375 0 0 0-1.945 0l-1.945 1.945a1.375 1.375 0 0 0 0 1.945l9.778 9.778a1.375 1.375 0 0 0 1.945 0l1.945-1.945a1.375 1.375 0 0 0 0-1.945l-7.832-7.832-1.946-1.946z"/></svg>
              Codexa
            </span>
            <span style={{ color: "#2d2d2d", margin: "0 0.5rem" }}>|</span>
            <span style={{ fontSize: "0.85rem", fontWeight: "500" }}>Daily Question</span>
            
            <Link
              className={`leetcode-nav-btn ${previousProblem ? "" : "disabled"}`}
              to={previousProblem ? `/${userRole}/problems/${previousProblem.id}/solve` : "#"}
              aria-disabled={previousProblem ? "false" : "true"}
              onClick={(event) => {
                if (!previousProblem) {
                  event.preventDefault();
                }
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
            </Link>
            <Link
              className={`leetcode-nav-btn ${nextProblem ? "" : "disabled"}`}
              to={nextProblem ? `/${userRole}/problems/${nextProblem.id}/solve` : "#"}
              aria-disabled={nextProblem ? "false" : "true"}
              onClick={(event) => {
                if (!nextProblem) {
                  event.preventDefault();
                }
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
            </Link>
            <Link to={backToProblemsPath} className="leetcode-nav-btn" title="All Problems">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/></svg>
            </Link>
          </div>

          <div className="leetcode-topbar-center">
            <button
              className="leetcode-action-btn"
              onClick={handleRunCode}
              disabled={isRunning || isSubmitting}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              {isRunning ? "Running..." : "Run"}
            </button>
            <button
              className="leetcode-action-btn leetcode-submit-btn"
              type="submit"
              form="problem-editor-form"
              disabled={isSubmitting || isRunning}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "2px" }}><polyline points="20 6 9 17 4 12"/></svg>
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          </div>

          <div className="leetcode-topbar-right">
            <div className="leetcode-timer-wrapper" style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
              <div className={`leetcode-timer-chip ${!timerState.isRunning ? "paused" : ""}`}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
                {formatElapsedTime(elapsedSeconds)}
              </div>
              <button
                type="button"
                className="leetcode-nav-btn"
                onClick={timerState.isRunning ? handleTimerPause : handleTimerStart}
                title={timerState.isRunning ? "Pause timer" : "Start timer"}
              >
                {timerState.isRunning ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                )}
              </button>
              <button
                type="button"
                className="leetcode-nav-btn"
                onClick={handleTimerReset}
                title="Reset timer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
              </button>
            </div>
            <button className="leetcode-premium-btn">Premium</button>
          </div>
        </header>

        {status.loading ? <h1>Loading question...</h1> : null}
        {status.error ? <p className="form-status error">{status.error}</p> : null}

        {problem ? (
          <section className="workspace-shell" style={{ gridTemplateColumns: "1fr 1.15fr", padding: "0.5rem" }}>
            <article className="detail-block workspace-column workspace-problem-panel">
              <div className="leetcode-tab-container">
                <button
                  type="button"
                  className={`leetcode-tab ${leftActiveTab === "description" ? "active" : ""}`}
                  onClick={() => setLeftActiveTab("description")}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
                  Description
                </button>
                <button
                  type="button"
                  className={`leetcode-tab ${leftActiveTab === "editorial" ? "active" : ""}`}
                  onClick={() => setLeftActiveTab("editorial")}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/></svg>
                  Editorial
                </button>
                <button
                  type="button"
                  className={`leetcode-tab ${leftActiveTab === "solutions" ? "active" : ""}`}
                  onClick={() => setLeftActiveTab("solutions")}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3h12M12 3v11M16 14l-4-5-4 5v5a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-5z"/></svg>
                  Solutions
                </button>
                <button
                  type="button"
                  className={`leetcode-tab ${leftActiveTab === "submissions" ? "active" : ""}`}
                  onClick={() => setLeftActiveTab("submissions")}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
                  Submissions
                </button>
                <button
                  type="button"
                  className={`leetcode-tab ${leftActiveTab === "testResult" ? "active" : ""}`}
                  onClick={() => setLeftActiveTab("testResult")}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>
                  Test Result
                </button>
                <button
                  type="button"
                  className={`leetcode-tab ${leftActiveTab === "testcase" ? "active" : ""}`}
                  onClick={() => setLeftActiveTab("testcase")}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#2cbb5d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Testcase
                </button>
              </div>

              <div className="workspace-problem-content-scroll">
                {leftActiveTab === "description" && (
                  <>
                    <div className="workspace-problem-header">
                      <div>
                        <h1 style={{ fontSize: "1.45rem", fontWeight: "700", marginBottom: "0.75rem", color: "#f3f4f6" }}>
                          {currentProblemIndex >= 0 ? `${currentProblemIndex + 1}. ${problem.title}` : problem.title}
                        </h1>
                      </div>
                      <span className="question-count">#{currentProblemIndex >= 0 ? currentProblemIndex + 1 : "-"}</span>
                    </div>

                    <div className="workspace-meta-row workspace-meta-row-rich">
                      <span className={`difficulty-pill ${problem.difficulty}`}>{problem.difficulty}</span>
                      <span className="workspace-meta-chip">
                        {(problem.sample_test_cases || []).length} sample cases
                      </span>
                      <span className="workspace-meta-chip">
                        {(problem.tags || []).length} topics
                      </span>
                    </div>

                    <div className="pill-row" style={{ marginBottom: "1.5rem" }}>
                      {(problem.tags || []).map((tag) => (
                        <span className="tag-pill" key={tag}>
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="workspace-subsection workspace-statement-section">
                      <p className="workspace-statement-copy" style={{ whiteSpace: "pre-line" }}>{problem.statement}</p>
                    </div>

                    <div className="workspace-subsection" style={{ marginTop: "2rem" }}>
                      <div className="workspace-section-heading">
                        <h3>Constraints</h3>
                      </div>
                      <div className="workspace-note-card" style={{ background: "#262626", border: "none" }}>
                        <p style={{ fontFamily: "monospace", fontSize: "0.9rem" }}>{problem.constraints_text || "No constraints provided."}</p>
                      </div>
                    </div>
                  </>
                )}

                {leftActiveTab === "editorial" && (
                  <div style={{ padding: "1rem", color: "#8a8a8a" }}>
                    <h3>Editorial Hint</h3>
                    <p style={{ whiteSpace: "pre-line" }}>{problem.examples_text || "No editorial guide available for this challenge."}</p>
                  </div>
                )}

                {leftActiveTab === "solutions" && (
                  <div style={{ padding: "1rem", color: "#8a8a8a" }}>
                    <h3>Community Solutions</h3>
                    <p>No community solutions have been submitted yet. Be the first to share your approach!</p>
                  </div>
                )}

                {leftActiveTab === "submissions" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div className="workspace-column-header" style={{ marginBottom: "1rem" }}>
                      <h2>Submissions History ({submissionHistory.length})</h2>
                    </div>
                    {historyStatus.loading ? <p className="dashboard-copy">Loading submission history...</p> : null}
                    {historyStatus.error ? <p className="form-status error">{historyStatus.error}</p> : null}

                    {!historyStatus.loading && !historyStatus.error && submissionHistory.length === 0 ? (
                      <p className="dashboard-copy">No submissions yet. Send your first solution above.</p>
                    ) : null}
                    {!historyStatus.loading && !historyStatus.error && submissionHistory.length > 0 ? (
                      <div className="history-list workspace-history-list">
                        {submissionHistory.map((submission) => (
                          <article className="history-card workspace-history-card" key={submission.id}>
                            <div className="question-card-top">
                              <span className={`status-pill ${submission.status}`}>
                                {submission.status.replaceAll("_", " ")}
                              </span>
                              <span className="question-meta">
                                {new Date(submission.submitted_at).toLocaleString()}
                              </span>
                            </div>
                            <strong>{submission.language.toUpperCase()}</strong>
                            <p className="question-meta">
                              {submission.passed_test_cases}/{submission.total_test_cases} passed |{" "}
                              {Math.max(
                                (submission.total_test_cases || 0) - (submission.passed_test_cases || 0),
                                0
                              )} failed | {submission.execution_time_ms ?? "-"} ms
                            </p>
                            {submission.compiler_output ? (
                              <p className="question-meta">{submission.compiler_output.split("\n")[0]}</p>
                            ) : null}
                            <pre className="history-snippet" style={{ maxHeight: "150px", overflowY: "auto" }}>{submission.source_code}</pre>
                          </article>
                        ))}
                      </div>
                    ) : null}
                  </div>
                )}

                {leftActiveTab === "testResult" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div className="workspace-column-header" style={{ marginBottom: "1rem" }}>
                      <h2>Execution Results</h2>
                    </div>

                    {/* Run Results */}
                    {runResults && (
                      <>
                        {runMessage ? <p className={`form-status ${runMessageClassName}`}>{runMessage}</p> : null}
                        <div className="workspace-result-overview testcase-overview">
                          <article className="workspace-result-card">
                            <span>Run verdict</span>
                            <strong className={runMessageClassName}>{runResults.verdictLabel || runResults.status.replaceAll("_", " ")}</strong>
                          </article>
                          <article className="workspace-result-card">
                            <span>Passed</span>
                            <strong>
                              {runResults.passedTestCases}/{runResults.totalTestCases}
                            </strong>
                          </article>
                          <article className="workspace-result-card">
                            <span>Error type</span>
                            <strong>{latestRunErrorType}</strong>
                          </article>
                          <article className="workspace-result-card">
                            <span>Runtime</span>
                            <strong>{runResults.executionTimeMs ?? "-"} ms</strong>
                          </article>
                        </div>

                        <div className="sample-case-list testcase-result-list" style={{ marginTop: "1rem" }}>
                          {(runResults.testCaseResults || []).map((testCaseResult, index) => (
                            <article className="sample-case-card testcase-result-card" key={testCaseResult.id || index}>
                              <div className="sample-case-header">
                                <strong>Test case {index + 1}</strong>
                                <span
                                  className={`status-pill ${
                                    testCaseResult.passed ? "accepted" : "wrong_answer"
                                  }`}
                                >
                                  {testCaseResult.passed ? "passed" : "failed"}
                                </span>
                              </div>
                              <div className="sample-case-block">
                                <span>Input</span>
                                <p className="history-snippet">{testCaseResult.input || "(empty)"}</p>
                              </div>
                              <div className="sample-case-block">
                                <span>Expected output</span>
                                <p className="history-snippet">{testCaseResult.expectedOutput || "(empty)"}</p>
                              </div>
                              <div className="sample-case-block">
                                <span>Your output</span>
                                <p className="history-snippet">{testCaseResult.actualOutput || "(empty)"}</p>
                              </div>
                              {testCaseResult.stderr ? (
                                <div className="sample-case-block">
                                  <span>Error output</span>
                                  <p className="history-snippet">{testCaseResult.stderr}</p>
                                </div>
                              ) : null}
                            </article>
                          ))}
                        </div>

                        {runResults.stderr ? (
                          <div className="workspace-subsection">
                            <div className="workspace-section-heading">
                              <h3>Run error output</h3>
                            </div>
                            <pre className="history-snippet workspace-console-output">{runResults.stderr}</pre>
                          </div>
                        ) : null}
                      </>
                    )}

                    {/* Submit Results */}
                    {latestSubmission && !runResults && (
                      <>
                        {submissionMessage ? (
                          <p className={`form-status ${submissionMessageClassName}`}>{submissionMessage}</p>
                        ) : null}

                        <div className="workspace-result-overview">
                          <article className="workspace-result-card">
                            <span>Latest verdict</span>
                            <strong className={submissionMessageClassName}>
                              {latestSubmitExecution?.verdictLabel ||
                                latestSubmission.status.replaceAll("_", " ")}
                            </strong>
                          </article>
                          <article className="workspace-result-card">
                            <span>Passed tests</span>
                            <strong>
                              {`${latestSubmission.passed_test_cases}/${latestSubmission.total_test_cases}`}
                            </strong>
                          </article>
                          <article className="workspace-result-card">
                            <span>Failed tests</span>
                            <strong>{failedTestCount}</strong>
                          </article>
                          <article className="workspace-result-card">
                            <span>Error type</span>
                            <strong>{latestSubmitErrorType}</strong>
                          </article>
                          <article className="workspace-result-card">
                            <span>Runtime</span>
                            <strong>{`${latestSubmission.execution_time_ms ?? "-"} ms`}</strong>
                          </article>
                        </div>

                        {latestExecutionDetails ? (
                          <div className="workspace-subsection workspace-result-log">
                            <div className="workspace-section-heading">
                              <h3>Latest execution log</h3>
                            </div>
                            <pre className="history-snippet workspace-console-output">{latestExecutionDetails}</pre>
                          </div>
                        ) : null}

                        {latestSubmitExecution?.stderr ? (
                          <div className="workspace-subsection">
                            <div className="workspace-section-heading">
                              <h3>Error output</h3>
                            </div>
                            <pre className="history-snippet workspace-console-output">
                              {latestSubmitExecution.stderr}
                            </pre>
                          </div>
                        ) : null}
                      </>
                    )}

                    {!runResults && !latestSubmission && (
                      <p className="dashboard-copy">
                        Use Run to execute sample test cases, or Submit to evaluate against all test cases.
                      </p>
                    )}
                  </div>
                )}

                {leftActiveTab === "testcase" && (
                  <div className="leetcode-testcase-container">
                    <div className="leetcode-testcase-tab-row">
                      {(problem.sample_test_cases || []).map((testCase, index) => (
                        <button
                          key={index}
                          type="button"
                          className={`leetcode-testcase-tab ${activeTestCaseIndex === index ? "active" : ""}`}
                          onClick={() => setActiveTestCaseIndex(index)}
                        >
                          Case {index + 1}
                        </button>
                      ))}
                      <button type="button" className="leetcode-testcase-tab" style={{ opacity: 0.5, cursor: "not-allowed" }}>
                        +
                      </button>
                    </div>
                    {problem.sample_test_cases?.[activeTestCaseIndex] && (
                      <div className="leetcode-testcase-input-box">
                        <label className="leetcode-testcase-label">intervals =</label>
                        <textarea
                          className="leetcode-testcase-textarea"
                          rows="4"
                          readOnly
                          value={problem.sample_test_cases[activeTestCaseIndex].input_data}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

            </article>

            <article className="detail-block workspace-column editor-column">
              <div className="leetcode-tab-container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", paddingRight: "0.5rem" }}>
                <span className="leetcode-tab active" style={{ cursor: "default", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
                  Code
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", color: "#8a8a8a" }}>
                  <svg className="leetcode-icon-btn" title="Toggle Fullscreen" style={{ cursor: "pointer", opacity: 0.7 }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
                  <svg className="leetcode-icon-btn" title="Collapse" style={{ cursor: "pointer", opacity: 0.7 }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                </div>
              </div>

              <div className="workspace-column-header workspace-editor-header" style={{ padding: "0.5rem 1rem", borderBottom: "1px solid #2d2d2d", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div className="editor-toolbar" style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                  <select
                    id="language"
                    name="language"
                    value={editor.language}
                    onChange={handleEditorChange}
                    style={{ background: "transparent", border: "none", color: "#eff1f5", padding: "0.25rem 0.5rem 0.25rem 0", borderRadius: "4px", outline: "none", cursor: "pointer", fontWeight: "500", fontSize: "0.85rem" }}
                  >
                    <option value="python" style={{ background: "#1e1e1e" }}>Python</option>
                    <option value="cpp" style={{ background: "#1e1e1e" }}>C++</option>
                    <option value="java" style={{ background: "#1e1e1e" }}>Java</option>
                    <option value="javascript" style={{ background: "#1e1e1e" }}>JavaScript</option>
                  </select>
                  <span style={{ color: "#8a8a8a", fontSize: "0.8rem", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    Auto
                  </span>
                </div>
                
                <div className="editor-actions-right" style={{ display: "flex", alignItems: "center", gap: "1rem", color: "#8a8a8a" }}>
                  <button type="button" className="leetcode-nav-btn" title="Format code" style={{ background: "none", border: "none", padding: 0, color: "inherit", cursor: "pointer", display: "flex", alignItems: "center" }}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" y1="10" x2="7" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="7" y2="18"/></svg>
                  </button>
                  <button type="button" className="leetcode-nav-btn" title="Save code" style={{ background: "none", border: "none", padding: 0, color: "inherit", cursor: "pointer", display: "flex", alignItems: "center" }}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                  </button>
                  <button type="button" className="leetcode-nav-btn" title="Show templates" style={{ background: "none", border: "none", padding: 0, color: "inherit", cursor: "pointer", display: "flex", alignItems: "center" }}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 18l6-6-6-6M8 6L2 12l6 6"/></svg>
                  </button>
                  <button type="button" className="leetcode-nav-btn" onClick={handleResetCode} title="Reset code" style={{ background: "none", border: "none", padding: 0, color: "inherit", cursor: "pointer", display: "flex", alignItems: "center" }}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><polyline points="3 3 3 8 8 8"/></svg>
                  </button>
                  <button type="button" className="leetcode-nav-btn" title="Settings" style={{ background: "none", border: "none", padding: 0, color: "inherit", cursor: "pointer", display: "flex", alignItems: "center" }}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
                  </button>
                </div>
              </div>

              <form className="auth-form editor-form" id="problem-editor-form" onSubmit={handleSubmit}>
                <div className="editor-surface">
                  <div
                    className="code-editor-shell"
                    style={{ fontSize: `${editorFontSize}px` }}
                    onClick={(event) => {
                      if (event.target === event.currentTarget || event.target === highlightRef.current) {
                        editorRef.current?.focus();
                      }
                    }}
                  >
                    <div className="code-editor-gutter" ref={lineNumbersRef} aria-hidden="true">
                      {editorLineNumbers.map((lineNumber) => (
                        <span key={lineNumber}>{lineNumber}</span>
                      ))}
                    </div>
                    <div className="code-editor-stage">
                      <pre
                        ref={highlightRef}
                        className="code-editor-highlight"
                        aria-hidden="true"
                        dangerouslySetInnerHTML={{
                          __html: `${highlightedCode}${editor.sourceCode.endsWith("\n") ? "\n " : " "}`
                        }}
                      />
                      <textarea
                        ref={editorRef}
                        id="sourceCode"
                        name="sourceCode"
                        rows="18"
                        className="code-editor-input"
                        placeholder="Write your solution here..."
                        value={editor.sourceCode}
                        onChange={handleEditorChange}
                        onKeyDown={handleEditorKeyDown}
                        onScroll={handleEditorScroll}
                        onKeyUp={(event) => {
                          updateCursorPos(event.currentTarget);
                        }}
                        onSelect={(event) => {
                          updateCursorPos(event.currentTarget);
                        }}
                        onClick={(event) => {
                          updateSuggestionState(
                            event.currentTarget.value,
                            event.currentTarget.selectionStart,
                            editor.language
                          );
                          updateCursorPos(event.currentTarget);
                        }}
                        spellCheck="false"
                        autoCapitalize="off"
                        autoComplete="off"
                        autoCorrect="off"
                        onBlur={() => {
                          window.setTimeout(() => {
                            setSuggestionState((current) => ({
                              ...current,
                              visible: false
                            }));
                          }, 120);
                        }}
                        required
                      />
                    </div>
                  </div>
                  {suggestionState.visible ? (
                    <div
                      className="editor-suggestion-panel"
                      style={{
                        top: `${suggestionState.popupTop}px`,
                        left: `${suggestionState.popupLeft}px`
                      }}
                    >
                      {suggestionState.suggestions.map((entry, index) => (
                        <button
                          className={`editor-suggestion-item ${index === suggestionState.selectedIndex ? "active" : ""}`}
                          key={`${entry.label}-${index}`}
                          type="button"
                          onMouseDown={(event) => {
                            event.preventDefault();
                            acceptSuggestion(index);
                          }}
                        >
                          <strong>{entry.label}</strong>
                          <span>{entry.insertText.replace(/\n/g, " ").slice(0, 42)}</span>
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              </form>

              <div className="editor-status-bar">
                <span>Saved</span>
                <span>Ln {cursorPos.line}, Col {cursorPos.column}</span>
              </div>
            </article>
          </section>
        ) : null}
      </section>
    </main>
  );
}
