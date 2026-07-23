import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import Papa from "papaparse";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route to fetch and parse Google Sheet data
  app.get("/api/sheet-data", async (req, res) => {
    res.setHeader("Content-Type", "application/json");
    try {
      const sheetUrlParam = req.query.url as string | undefined;
      let spreadsheetId = "1hLt1v3C83j7aTu4nev35w9j7dwiVdYRD1QzyUTgWzLM";
      let gid = "193362198";

      if (sheetUrlParam) {
        // Extract spreadsheetId
        const idMatch = sheetUrlParam.match(/\/d\/([a-zA-Z0-9-_]+)/);
        if (idMatch && idMatch[1]) {
          spreadsheetId = idMatch[1];
        }
        // Extract gid
        const gidMatch = sheetUrlParam.match(/gid=([0-9]+)/);
        if (gidMatch && gidMatch[1]) {
          gid = gidMatch[1];
        } else {
          if (spreadsheetId === "1hLt1v3C83j7aTu4nev35w9j7dwiVdYRD1QzyUTgWzLM") {
            gid = "193362198";
          } else {
            gid = "0";
          }
        }
      } else {
        if (req.query.spreadsheetId) {
          spreadsheetId = req.query.spreadsheetId as string;
        }
        if (req.query.gid) {
          gid = req.query.gid as string;
        }
      }

      // Fetch all endpoints in parallel and pick the fastest successful response
      let csvText = "";
      let isAccessRestricted = false;

      const urlCandidates = [
        `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=${gid}`,
        `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&gid=${gid}`,
        `https://docs.google.com/spreadsheets/d/${spreadsheetId}/pub?output=csv&gid=${gid}`,
        `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv`,
      ];

      const fetchCandidate = async (urlCandidate: string): Promise<string> => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        try {
          const resp = await fetch(urlCandidate, {
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            },
            signal: controller.signal,
          });
          if (resp.ok) {
            const text = await resp.text();
            if (
              text &&
              !text.includes("<!DOCTYPE html") &&
              !text.includes("<html") &&
              !text.includes("google-site-verification")
            ) {
              return text;
            } else if (text && (text.includes("<!DOCTYPE html") || text.includes("<html"))) {
              isAccessRestricted = true;
            }
          }
        } finally {
          clearTimeout(timeoutId);
        }
        throw new Error(`Candidate failed: ${urlCandidate}`);
      };

      try {
        csvText = await Promise.any(urlCandidates.map((url) => fetchCandidate(url)));
      } catch (err) {
        csvText = "";
      }

      if (!csvText || csvText.includes("<!DOCTYPE html") || csvText.includes("<html")) {
        return res.status(403).json({
          error: "ACCESS_RESTRICTED",
          message:
            "This Google Sheet is either private or requires sharing permission. Please set link sharing to 'Anyone with the link can view' in Google Sheets.",
          spreadsheetId,
          gid,
          sheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit?gid=${gid}`,
        });
      }

      // Parse CSV
      const parsed = Papa.parse<string[]>(csvText, {
        skipEmptyLines: "greedy",
      });

      if (parsed.errors.length > 0 && parsed.data.length === 0) {
        return res.status(400).json({
          error: "PARSING_ERROR",
          message: "Failed to parse CSV data from Google Sheet.",
          details: parsed.errors,
        });
      }

      const rows = parsed.data;
      if (rows.length === 0) {
        return res.json({
          spreadsheetId,
          gid,
          headers: [],
          rows: [],
          totalRows: 0,
          updatedAt: new Date().toISOString(),
        });
      }

      const headers = rows[0].map((h, i) => (h ? h.trim() : `Column ${i + 1}`));
      const dataRows = rows.slice(1).map((row, rowIndex) => {
        const obj: Record<string, string> = { _id: String(rowIndex + 1) };
        headers.forEach((header, i) => {
          obj[header] = row[i] !== undefined ? row[i] : "";
        });
        return obj;
      });

      return res.json({
        spreadsheetId,
        gid,
        headers,
        rows: dataRows,
        totalRows: dataRows.length,
        updatedAt: new Date().toISOString(),
        sheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit?gid=${gid}`,
      });
    } catch (error: any) {
      console.error("Error in /api/sheet-data:", error);
      res.status(500).json({
        error: "SERVER_ERROR",
        message: error?.message || "Failed to fetch sheet data",
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
