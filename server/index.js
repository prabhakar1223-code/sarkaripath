
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { exams } from "./exams.js";
import { recommendExams } from "./recommender.js";

const app = express();
const port = Number(process.env.PORT) || 3001;

const currentDirectory = path.dirname(
  fileURLToPath(import.meta.url)
);

// Middleware
app.disable("x-powered-by");
app.use(express.json({ limit: "10kb" }));

// API Routes
app.get("/api/health", (_request, response) => {
  response.json({ status: "ok" });
});

app.get("/api/exams", (_request, response) => {
  response.json(
    exams.map(({ id, name, organization, category, overview }) => ({
      id,
      name,
      organization,
      category,
      overview,
    }))
  );
});

app.post("/api/recommendations", (request, response, next) => {
  try {
    response.json({
      recommendations: recommendExams(request.body),
      disclaimer:
        "Fit scores compare your stated preferences with broad exam criteria. They are not probabilities of passing or guarantees of eligibility. Always verify the latest official notification.",
    });
  } catch (error) {
    next(error);
  }
});

// Serve React + Vite production build
const clientDirectory = path.resolve(
  currentDirectory,
  "../dist"
);

app.use(express.static(clientDirectory));

// React Router fallback (Express 5)
app.get("/{*path}", (_request, response, next) => {
  response.sendFile(
    path.join(clientDirectory, "index.html"),
    (error) => {
      if (error) next(error);
    }
  );
});

// Error Handling
app.use((error, _request, response, _next) => {
  if (error instanceof SyntaxError && "body" in error) {
    return response.status(400).json({
      error: "Request body must be valid JSON.",
    });
  }

  if (error.status === 400) {
    return response.status(400).json({
      error: error.message,
    });
  }

  if (error.status === 413) {
    return response.status(413).json({
      error: "Request body must be 10KB or smaller.",
    });
  }

  console.error("API request failed:", error);

  return response.status(500).json({
    error: "Something went wrong. Please try again.",
  });
});

// Start Server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
