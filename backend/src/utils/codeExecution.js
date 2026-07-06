import { env } from "../config/env.js";
import { pool } from "../config/db.js";

const languageIds = {
  cpp: Number(env.judge0LanguageCpp) || 105,
  java: Number(env.judge0LanguageJava) || 91,
  javascript: Number(env.judge0LanguageJavascript) || 102,
  python: Number(env.judge0LanguagePython) || 92
};

function encodeBase64(str) {
  return Buffer.from(str ?? "", "utf8").toString("base64");
}

function decodeBase64(str) {
  if (!str) return "";
  return Buffer.from(str, "base64").toString("utf8");
}

function normalizeOutput(output) {
  return (output ?? "").replace(/\r\n/g, "\n").trim();
}

function truncateOutput(output, maxLength = 4000) {
  if (!output) return "";
  return output.length > maxLength ? `${output.slice(0, maxLength)}...` : output;
}

function buildFeedback({ stage, passedTestCases, totalTestCases, stdout = "", stderr = "" }) {
  const failedTestCases = Math.max(0, totalTestCases - passedTestCases);
  const parts = [
    `Stage: ${stage}`,
    `Passed: ${passedTestCases}/${totalTestCases}`,
    `Failed: ${failedTestCases}`
  ];

  if (stdout.trim()) {
    parts.push(`Stdout:\n${truncateOutput(stdout.trim())}`);
  }

  if (stderr.trim()) {
    parts.push(`Stderr:\n${truncateOutput(stderr.trim())}`);
  }

  return parts.join("\n\n");
}

function verdictLabelFromErrorType(errorType) {
  switch (errorType) {
    case "compile_error":
      return "Compile Error";
    case "runtime_error":
      return "Runtime Error";
    case "wrong_answer":
      return "Wrong Answer";
    case "time_limit":
      return "Time Limit Exceeded";
    default:
      return "Accepted";
  }
}

function wrapCodeIfNeeded(sourceCode, language, problemTitle) {
  const normLang = language.trim().toLowerCase();
  const cleanCode = sourceCode.trim();

  // If the code has a main function or does not have Solution class definition, run it as-is
  if (normLang === "python") {
    if (!cleanCode.includes("class Solution")) {
      return sourceCode;
    }
  } else if (normLang === "cpp") {
    if (cleanCode.includes("int main") || !cleanCode.includes("class Solution")) {
      return sourceCode;
    }
  } else if (normLang === "java") {
    if (cleanCode.includes("public static void main") || !cleanCode.includes("class Solution")) {
      return sourceCode;
    }
  } else if (normLang === "javascript") {
    if (!cleanCode.includes("class Solution")) {
      return sourceCode;
    }
  }

  const title = (problemTitle || "").trim();

  if (normLang === "python") {
    let pyWrapper = `
if __name__ == "__main__":
    import sys
    sol = Solution()
    input_data = sys.stdin.read()
    lines = input_data.split()
    title = ${JSON.stringify(title)}
    
    if title == "Sum of Two Numbers":
        if len(lines) >= 2:
            a, b = int(lines[0]), int(lines[1])
            res = sol.sum(a, b) if hasattr(sol, 'sum') else sol.solve(a, b)
            print(res)
    elif title == "Factorial of a Number":
        if lines:
            n = int(lines[0])
            res = sol.factorial(n) if hasattr(sol, 'factorial') else sol.solve(n)
            print(res)
    elif title == "Nth Fibonacci Number":
        if lines:
            n = int(lines[0])
            res = sol.fib(n) if hasattr(sol, 'fib') else sol.solve(n)
            print(res)
    elif title == "Palindrome String Check":
        s = input_data.strip()
        res = sol.isPalindrome(s) if hasattr(sol, 'isPalindrome') else sol.solve(s)
        if isinstance(res, bool):
            print("YES" if res else "NO")
        else:
            print(res)
    elif title == "Find the Missing Number":
        if len(lines) >= 2:
            n = int(lines[0])
            nums = [int(x) for x in lines[1:]]
            res = sol.missingNumber(nums) if hasattr(sol, 'missingNumber') else sol.solve(nums)
            print(res)
    elif title == "Valid Parentheses":
        s = input_data.strip()
        res = sol.isValid(s) if hasattr(sol, 'isValid') else sol.solve(s)
        if isinstance(res, bool):
            print("YES" if res else "NO")
        else:
            print(res)
    elif title == "Two Sum":
        if len(lines) >= 3:
            n, target = int(lines[0]), int(lines[1])
            nums = [int(x) for x in lines[2:]]
            res = sol.twoSum(nums, target) if hasattr(sol, 'twoSum') else sol.solve(nums, target)
            print(" ".join(map(str, sorted(res))))
    elif title == "Longest Substring Without Repeating Characters":
        s = input_data.strip()
        res = sol.lengthOfLongestSubstring(s) if hasattr(sol, 'lengthOfLongestSubstring') else sol.solve(s)
        print(res)
    else:
        # Fallback to solve method with input data
        method = next((m for m in ['solve', 'run'] if hasattr(sol, m)), None)
        if method:
            print(getattr(sol, method)(input_data))
`;
    return sourceCode + "\n" + pyWrapper;
  }

  if (normLang === "cpp") {
    let cppWrapper = `
#include <iostream>
#include <vector>
#include <string>
#include <sstream>
#include <algorithm>

using namespace std;

int main() {
    Solution sol;
    string title = ${JSON.stringify(title)};
    
    if (title == "Sum of Two Numbers") {
        int a, b;
        if (cin >> a >> b) {
            cout << sol.solve(a, b) << endl;
        }
    } else if (title == "Factorial of a Number") {
        int n;
        if (cin >> n) {
            cout << sol.solve(n) << endl;
        }
    } else if (title == "Nth Fibonacci Number") {
        int n;
        if (cin >> n) {
            cout << sol.solve(n) << endl;
        }
    } else if (title == "Palindrome String Check") {
        string s;
        if (cin >> s) {
            bool ans = sol.solve(s);
            cout << (ans ? "YES" : "NO") << endl;
        }
    } else if (title == "Find the Missing Number") {
        int n;
        if (cin >> n) {
            vector<int> nums;
            for (int i = 0; i < n - 1; ++i) {
                int val;
                if (cin >> val) nums.push_back(val);
            }
            cout << sol.solve(nums) << endl;
        }
    } else if (title == "Valid Parentheses") {
        string s;
        if (cin >> s) {
            bool ans = sol.isValid(s);
            cout << (ans ? "YES" : "NO") << endl;
        }
    } else if (title == "Two Sum") {
        int n, target;
        if (cin >> n >> target) {
            vector<int> nums;
            for (int i = 0; i < n; ++i) {
                int val;
                if (cin >> val) nums.push_back(val);
            }
            vector<int> ans = sol.twoSum(nums, target);
            sort(ans.begin(), ans.end());
            if (ans.size() >= 2) {
                cout << ans[0] << " " << ans[1] << endl;
            }
        }
    } else if (title == "Longest Substring Without Repeating Characters") {
        string s;
        if (cin >> s) {
            cout << sol.lengthOfLongestSubstring(s) << endl;
        } else {
            cout << sol.lengthOfLongestSubstring("") << endl;
        }
    }
    return 0;
}
`;
    return sourceCode + "\n" + cppWrapper;
  }

  if (normLang === "java") {
    let javaWrapper = `
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Solution sol = new Solution();
        Scanner sc = new Scanner(System.in);
        String title = ${JSON.stringify(title)};
        
        if (title.equals("Sum of Two Numbers")) {
            if (sc.hasNextInt()) {
                int a = sc.nextInt();
                int b = sc.nextInt();
                System.out.println(sol.solve(a, b));
            }
        } else if (title.equals("Factorial of a Number")) {
            if (sc.hasNextInt()) {
                int n = sc.nextInt();
                System.out.println(sol.solve(n));
            }
        } else if (title.equals("Nth Fibonacci Number")) {
            if (sc.hasNextInt()) {
                int n = sc.nextInt();
                System.out.println(sol.solve(n));
            }
        } else if (title.equals("Palindrome String Check")) {
            if (sc.hasNext()) {
                String s = sc.next();
                boolean ans = sol.solve(s);
                System.out.println(ans ? "YES" : "NO");
            }
        } else if (title.equals("Find the Missing Number")) {
            if (sc.hasNextInt()) {
                int n = sc.nextInt();
                int[] nums = new int[n - 1];
                for (int i = 0; i < n - 1; i++) {
                    nums[i] = sc.nextInt();
                }
                System.out.println(sol.solve(nums));
            }
        } else if (title.equals("Valid Parentheses")) {
            if (sc.hasNext()) {
                String s = sc.next();
                boolean ans = sol.isValid(s);
                System.out.println(ans ? "YES" : "NO");
            }
        } else if (title.equals("Two Sum")) {
            if (sc.hasNextInt()) {
                int n = sc.nextInt();
                int target = sc.nextInt();
                int[] nums = new int[n];
                for (int i = 0; i < n; i++) {
                    nums[i] = sc.nextInt();
                }
                int[] ans = sol.twoSum(nums, target);
                Arrays.sort(ans);
                if (ans.length >= 2) {
                    System.out.println(ans[0] + " " + ans[1]);
                }
            }
        } else if (title.equals("Longest Substring Without Repeating Characters")) {
            String s = sc.hasNext() ? sc.next() : "";
            System.out.println(sol.lengthOfLongestSubstring(s));
        }
    }
}
`;
    return sourceCode + "\n" + javaWrapper;
  }

  if (normLang === "javascript") {
    let jsWrapper = `
const fs = require('fs');
const input = fs.readFileSync(0, 'utf-8').trim();
const lines = input.split(/\\s+/);
const sol = new Solution();
const title = ${JSON.stringify(title)};

if (title === "Sum of Two Numbers") {
    if (lines.length >= 2) {
        const a = parseInt(lines[0], 10);
        const b = parseInt(lines[1], 10);
        console.log(sol.solve(a, b));
    }
} else if (title === "Factorial of a Number") {
    if (lines.length >= 1) {
        const n = parseInt(lines[0], 10);
        console.log(sol.solve(n));
    }
} else if (title === "Nth Fibonacci Number") {
    if (lines.length >= 1) {
        const n = parseInt(lines[0], 10);
        console.log(sol.solve(n));
    }
} else if (title === "Palindrome String Check") {
    const s = input;
    const ans = sol.solve(s);
    console.log(ans === true ? "YES" : ans === false ? "NO" : ans);
} else if (title === "Find the Missing Number") {
    if (lines.length >= 2) {
        const n = parseInt(lines[0], 10);
        const nums = lines.slice(1).map(x => parseInt(x, 10));
        console.log(sol.solve(nums));
    }
} else if (title === "Valid Parentheses") {
    const s = input;
    const ans = sol.isValid(s);
    console.log(ans ? "YES" : "NO");
} else if (title === "Two Sum") {
    if (lines.length >= 3) {
        const n = parseInt(lines[0], 10);
        const target = parseInt(lines[1], 10);
        const nums = lines.slice(2).map(x => parseInt(x, 10));
        const ans = sol.twoSum(nums, target);
        ans.sort((a, b) => a - b);
        console.log(ans.join(" "));
    }
} else if (title === "Longest Substring Without Repeating Characters") {
    console.log(sol.lengthOfLongestSubstring(input));
}
`;
    return sourceCode + "\n" + jsWrapper;
  }

  return sourceCode;
}

export async function executeSubmission({ language, sourceCode, testCases, problemId }) {
  const normalizedLanguage = language.trim().toLowerCase();
  const languageId = languageIds[normalizedLanguage];

  if (!languageId) {
    return {
      status: "wrong_answer",
      errorType: "compile_error",
      verdictLabel: "Unsupported Language",
      passedTestCases: 0,
      totalTestCases: testCases.length,
      executionTimeMs: 0,
      memoryKb: null,
      stdout: "",
      stderr: `Unsupported language: ${language}`,
      compilerOutput: `Unsupported language: ${language}`
    };
  }

  // Fetch problem title to wrap code dynamically
  let problemTitle = "";
  if (problemId) {
    try {
      let dbResult = await pool.query("SELECT title FROM problems WHERE id = $1", [problemId]);
      if (dbResult.rows.length > 0) {
        problemTitle = dbResult.rows[0].title;
      } else {
        dbResult = await pool.query("SELECT title FROM course_coding_problems WHERE id = $1", [problemId]);
        if (dbResult.rows.length > 0) {
          problemTitle = dbResult.rows[0].title;
        }
      }
    } catch (e) {
      console.error("Error fetching problem title in codeExecution:", e);
    }
  }

  // Wrap code if needed
  const wrappedCode = wrapCodeIfNeeded(sourceCode, normalizedLanguage, problemTitle);

  const casesToRun = testCases.length > 0
    ? testCases
    : [{ input_data: "", expected_output: "", id: "no-test-cases" }];

  // Prepare Judge0 headers
  const headers = {
    "Content-Type": "application/json"
  };
  if (env.judge0ApiKey) {
    headers["X-Auth-Token"] = env.judge0ApiKey;
    if (env.judge0ApiHost) {
      headers["X-RapidAPI-Key"] = env.judge0ApiKey;
      headers["X-RapidAPI-Host"] = env.judge0ApiHost;
    }
  }

  // 1. Submit batch request to Judge0
  const submissionsPayload = {
    submissions: casesToRun.map(tc => ({
      language_id: languageId,
      source_code: encodeBase64(wrappedCode),
      stdin: encodeBase64(tc.input_data),
      expected_output: encodeBase64(tc.expected_output)
    }))
  };

  let tokens = [];
  try {
    const response = await fetch(`${env.judge0BaseUrl}/submissions/batch?base64_encoded=true`, {
      method: "POST",
      headers,
      body: JSON.stringify(submissionsPayload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Judge0 Submit Batch Error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();
    tokens = result.map(sub => sub.token);
  } catch (err) {
    console.error("Judge0 Submission creation failed:", err);
    return {
      status: "wrong_answer",
      errorType: "runtime_error",
      verdictLabel: "Internal Error",
      passedTestCases: 0,
      totalTestCases: casesToRun.length,
      executionTimeMs: 0,
      memoryKb: null,
      stdout: "",
      stderr: `Code execution infrastructure error: ${err.message}`,
      compilerOutput: `Code execution infrastructure error: ${err.message}`
    };
  }

  // 2. Poll Judge0 until all submissions are finished (status.id > 2)
  let attempts = 0;
  const maxAttempts = env.judge0MaxPollAttempts || 20;
  const interval = env.judge0PollIntervalMs || 500;
  let batchResults = [];

  while (attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, interval));
    attempts++;

    try {
      const response = await fetch(`${env.judge0BaseUrl}/submissions/batch?tokens=${tokens.join(",")}&base64_encoded=true`, {
        method: "GET",
        headers
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Judge0 Poll Batch Error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      batchResults = data.submissions || [];

      // Check if all submissions finished processing (status.id > 2)
      const allFinished = batchResults.every(sub => sub.status && sub.status.id > 2);
      if (allFinished) {
        break;
      }
    } catch (err) {
      console.error("Judge0 Polling failed:", err);
    }
  }

  if (batchResults.length === 0) {
    return {
      status: "wrong_answer",
      errorType: "runtime_error",
      verdictLabel: "Execution Timeout",
      passedTestCases: 0,
      totalTestCases: casesToRun.length,
      executionTimeMs: 0,
      memoryKb: null,
      stdout: "",
      stderr: "Judge0 polling timed out or failed to return results.",
      compilerOutput: "Judge0 polling timed out or failed to return results."
    };
  }

  // 3. Process outcomes
  let passedTestCases = 0;
  let totalExecutionTimeMs = 0;
  let maxMemoryKb = 0;
  const testCaseResults = [];

  let overallErrorType = null;
  let overallStatus = "accepted";
  let firstFailedSubmission = null;

  for (let i = 0; i < casesToRun.length; i++) {
    const testCase = casesToRun[i];
    const subResult = batchResults[i] || { status: { id: 13, description: "Internal Error" } };

    const statusId = subResult.status ? subResult.status.id : 13;
    const timeMs = Math.round((parseFloat(subResult.time) || 0) * 1000);
    const memoryKb = parseInt(subResult.memory) || 0;

    totalExecutionTimeMs += timeMs;
    if (memoryKb > maxMemoryKb) {
      maxMemoryKb = memoryKb;
    }

    const stdout = normalizeOutput(decodeBase64(subResult.stdout));
    const stderr = decodeBase64(subResult.stderr || subResult.message);
    const compileOutput = decodeBase64(subResult.compile_output);

    let passed = false;
    let testCaseErrorType = null;

    if (statusId === 3) {
      passed = true;
      passedTestCases++;
    } else if (statusId === 4) {
      testCaseErrorType = "wrong_answer";
    } else if (statusId === 5) {
      testCaseErrorType = "time_limit";
    } else if (statusId === 6) {
      testCaseErrorType = "compile_error";
    } else {
      testCaseErrorType = "runtime_error";
    }

    testCaseResults.push({
      id: testCase.id,
      passed,
      input: testCase.input_data ?? "",
      expectedOutput: normalizeOutput(testCase.expected_output),
      actualOutput: stdout,
      stderr: stderr || compileOutput || (passed ? "" : subResult.status.description),
      executionTimeMs: timeMs,
      isSample: Boolean(testCase.is_sample)
    });

    if (!passed && !firstFailedSubmission) {
      firstFailedSubmission = {
        errorType: testCaseErrorType,
        stdout,
        stderr,
        compileOutput,
        statusDescription: subResult.status.description
      };
    }
  }

  if (firstFailedSubmission) {
    const { errorType, stdout, stderr, compileOutput, statusDescription } = firstFailedSubmission;
    overallErrorType = errorType;

    if (errorType === "compile_error") {
      overallStatus = "wrong_answer";
      const fullCompilerOutput = compileOutput || stderr || statusDescription;
      return {
        status: "wrong_answer",
        errorType: "compile_error",
        verdictLabel: "Compile Error",
        passedTestCases: 0,
        totalTestCases: casesToRun.length,
        executionTimeMs: 0,
        memoryKb: null,
        stdout: "",
        stderr: fullCompilerOutput,
        testCaseResults,
        compilerOutput: fullCompilerOutput
      };
    } else if (errorType === "time_limit") {
      overallStatus = "time_limit";
    } else {
      overallStatus = "wrong_answer";
    }


    const finalFeedback = buildFeedback({
      stage: "run",
      passedTestCases,
      totalTestCases: casesToRun.length,
      stdout: overallErrorType === "wrong_answer"
        ? `Expected:\n${testCaseResults.find(r => !r.passed)?.expectedOutput || ""}\n\nActual:\n${testCaseResults.find(r => !r.passed)?.actualOutput || ""}`
        : stdout,
      stderr: stderr || compileOutput || statusDescription
    });

    return {
      status: overallStatus,
      errorType: overallErrorType,
      verdictLabel: verdictLabelFromErrorType(overallErrorType),
      passedTestCases,
      totalTestCases: casesToRun.length,
      executionTimeMs: totalExecutionTimeMs,
      memoryKb: maxMemoryKb || null,
      stdout,
      stderr: stderr || compileOutput || statusDescription,
      testCaseResults,
      compilerOutput: finalFeedback
    };
  }

  return {
    status: "accepted",
    errorType: null,
    verdictLabel: "Accepted",
    passedTestCases: casesToRun.length,
    totalTestCases: casesToRun.length,
    executionTimeMs: totalExecutionTimeMs,
    memoryKb: maxMemoryKb || null,
    stdout: "All test cases passed.",
    stderr: "",
    testCaseResults,
    compilerOutput: buildFeedback({
      stage: "run",
      passedTestCases: casesToRun.length,
      totalTestCases: casesToRun.length,
      stdout: "All test cases passed."
    })
  };
}
