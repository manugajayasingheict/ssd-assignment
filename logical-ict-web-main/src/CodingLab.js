import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Sparkles, Loader2 } from 'lucide-react';
import './CodingLab.css';

export default function CodingLab() {
  const navigate = useNavigate();
  const [language, setLanguage] = useState('html');
  const [code, setCode] = useState('');
  const [previewDoc, setPreviewDoc] = useState('');
  const [consoleOutput, setConsoleOutput] = useState('> Ready for execution...');
  const [isPythonLoading, setIsPythonLoading] = useState(false);
  
  const pyodide = useRef(null);
  const GEMINI_GEM_URL = "https://gemini.google.com/gem/1Mj1gIRwNN_DBbZILZX3YIjsT4uIQh8de?usp=sharing";

  const templates = {
    html: "<style>\n  h1 { color: #FF8C00; text-align: center; }\n</style>\n\n<h1>Hello Logical ICT!</h1>\n<p>Start coding HTML/CSS here.</p>",
    python: "# Python Programming (A/L ICT)\nprint('Learning Python with Manuga Sir')\n\nmarks = [85, 90, 78, 92]\navg = sum(marks) / len(marks)\nprint(f'Average Mark: {avg}')",
    sql: "-- MySQL Query Practice\nSELECT fullName, batch, district \nFROM students \nWHERE batch = '2026AL' \nORDER BY fullName ASC;"
  };

  // Set code template and trigger Python pre-load if needed
  useEffect(() => {
    setCode(templates[language]);
    if (language === 'python' && !pyodide.current) {
      loadPython();
    }
  }, [language]);

  // Live Preview for HTML
  useEffect(() => {
    if (language === 'html') {
      const timeout = setTimeout(() => setPreviewDoc(code), 400);
      return () => clearTimeout(timeout);
    }
  }, [code, language]);

  // FIXED: Robust Python Initialization
  const loadPython = async () => {
    if (pyodide.current) return true;

    if (typeof window.loadPyodide === 'undefined') {
      setConsoleOutput("> Error: Pyodide script not detected in index.html.");
      return false;
    }

    setIsPythonLoading(true);
    setConsoleOutput("> Initializing Python 3.10 Engine... (First time takes 5-10s)");
    
    try {
      // Guide the loader to the official CDN files
      pyodide.current = await window.loadPyodide({
        indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/"
      });
      
      // Essential for capturing print() output
      await pyodide.current.loadPackage("micropip"); 
      setConsoleOutput("> Python Engine Ready.");
      setIsPythonLoading(false);
      return true;
    } catch (err) {
      setConsoleOutput(`> Error Loading Engine: ${err.message}`);
      setIsPythonLoading(false);
      return false;
    }
  };

  const handleRunCode = async () => {
    setConsoleOutput("> Executing...");

    if (language === 'html') {
      setPreviewDoc(code);
      setConsoleOutput("> HTML/CSS rendered.");
    } 
    
    else if (language === 'python') {
      // Final check before run
      if (!pyodide.current) {
        const success = await loadPython();
        if (!success) return;
      }

      try {
        // Redirect stdout to capture print() calls
        await pyodide.current.runPythonAsync(`
          import sys
          import io
          sys.stdout = io.StringIO()
        `);
        
        await pyodide.current.runPythonAsync(code);
        
        const stdout = pyodide.current.runPython("sys.stdout.getvalue()");
        setConsoleOutput(stdout || "> Success: Code executed (No output).");
      } catch (err) {
        setConsoleOutput(`> Python Error:\n${err.message}`);
      }
    } 
    
    else if (language === 'sql') {
      setConsoleOutput(`> Query Result:\n+----------------+---------+----------+\n| Name           | Batch   | District |\n+----------------+---------+----------+\n| Manuga J.      | 2026AL  | Colombo  |\n| ICT Student    | 2026AL  | Gampaha  |\n+----------------+---------+----------+\n(2 rows returned)`);
    }
  };

  return (
    <div className="lab-container">
      <header className="lab-header">
        <div className="lab-brand">
          <button onClick={() => navigate(-1)} className="text-white hover:text-orange-400 transition-colors">
            <ArrowLeft size={28} />
          </button>
          <span className="lab-title">MJay Coding Lab</span>
        </div>

        <div className="controls-cluster">
          <select className="lang-picker" value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option value="html">HTML / CSS</option>
            <option value="python">Python Programming</option>
            <option value="sql">MySQL Queries</option>
          </select>

          <button onClick={handleRunCode} disabled={isPythonLoading} className="btn-lab btn-run">
            {isPythonLoading ? <Loader2 className="animate-spin" size={18} /> : <Play size={18} fill="currentColor" />}
            Run Code
          </button>

          <button onClick={() => window.open(GEMINI_GEM_URL, "_blank")} className="btn-lab btn-ai">
            <Sparkles size={18} /> Ask AI Tutor
          </button>
        </div>
      </header>

      <main className="lab-workspace">
        <div className="pane-editor">
          <Editor
            height="100%"
            theme="vs-dark"
            language={language === 'sql' ? 'mysql' : language}
            value={code}
            onChange={(val) => setCode(val)}
            options={{ fontSize: 16, minimap: { enabled: false }, automaticLayout: true }}
          />
        </div>

        <div className="pane-output">
          <div className="pane-label">{language === 'html' ? "Visual Preview" : "Console Output"}</div>
          {language === 'html' ? (
            <iframe id="preview-frame" title="preview" sandbox="allow-scripts" srcDoc={previewDoc} />
          ) : (
            <div id="console-fallback" className="bg-gray-900 text-green-400 p-6 font-mono overflow-auto flex-1">
              <pre className="whitespace-pre-wrap">{consoleOutput}</pre>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}