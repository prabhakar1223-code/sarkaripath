import { useState } from "react";

const initialProfile = {
  age: "",
  education: "graduate",
  studyHours: "3",
  focusMinutes: "45",
  workStyle: "desk",
  physicalReadiness: "comfortable",
  interests: ["administration", "public-service"],
  state: "",
};

const interestOptions = [
  { value: "administration", label: "Administration" },
  { value: "finance", label: "Banking & finance" },
  { value: "defence", label: "Defence services" },
  { value: "law", label: "Law & policy" },
  { value: "public-service", label: "Helping the public" },
];

const numberFormatter = new Intl.NumberFormat("en-IN");

function Field({ label, hint, children }) {
  return (
    <div className="field">
      <label className="field-label">{label}</label>
      {children}
      {hint && <p className="field-hint">{hint}</p>}
    </div>
  );
}

function RecommendationCard({ exam, index, state }) {
  return (
    <article className={`recommendation-card${index === 0 ? " is-top-pick" : ""}`}>
      <div className="recommendation-top">
        <div className="rank-label">
          <span className="rank-number">0{index + 1}</span>
          <span>{index === 0 ? "BEST FIT" : "ALSO CONSIDER"}</span>
        </div>
        <div
          className="score-badge"
          aria-label={`Profile fit score ${exam.score} out of 100`}
        >
          <span>{exam.score}</span>
          <small>fit</small>
        </div>
      </div>

      <h3>{exam.name}</h3>
      <p className="exam-organization">{exam.organization} <span>·</span> {exam.category}</p>
      <p className="exam-overview">{exam.overview}</p>

      <div className={`eligibility-note${exam.educationMeetsMinimum && exam.ageInRange ? " is-likely" : ""}`}>
        <span aria-hidden="true">{exam.educationMeetsMinimum && exam.ageInRange ? "✓" : "!"}</span>
        {exam.eligibility}
      </div>
      {exam.caution && <p className="caution-note">{exam.caution}</p>}
      {exam.physicalNote && <p className="caution-note">{exam.physicalNote}</p>}

      <details className="exam-details" open={index === 0}>
        <summary>View your starter plan & resources</summary>
        <div className="detail-content">
          <h4>Your first 10 weeks</h4>
          <ol className="plan-list">
            {exam.plan.map((item) => (
              <li key={item.week}>
                <span>{item.week}</span>
                <p>{item.focus}</p>
              </li>
            ))}
          </ol>
          <h4>Core subjects</h4>
          <div className="subject-list">
            {exam.subjects.map((subject) => <span key={subject}>{subject}</span>)}
          </div>
          <h4>Useful starting points</h4>
          <ul className="resource-list">
            {exam.resources.map((resource) => (
              <li key={resource.url + resource.label}>
                <a href={resource.url} target="_blank" rel="noreferrer">
                  {resource.label}<span aria-hidden="true"> ↗</span>
                </a>
              </li>
            ))}
          </ul>
          {state && exam.id === "state-psc" && (
            <p className="state-tip">
              For {state}, search for its official state public service commission site and use that commission’s latest syllabus and notifications.
            </p>
          )}
        </div>
      </details>
    </article>
  );
}

export default function App() {
  const [profile, setProfile] = useState(initialProfile);
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function updateField(event) {
    const { name, value } = event.target;
    setProfile((current) => ({ ...current, [name]: value }));
  }

  function toggleInterest(value) {
    setProfile((current) => ({
      ...current,
      interests: current.interests.includes(value)
        ? current.interests.filter((interest) => interest !== value)
        : [...current.interests, value],
    }));
  }

  async function submitProfile(event) {
    event.preventDefault();
    setError("");
    setResults(null);
    setLoading(true);

    try {
      const response = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...profile,
          age: Number(profile.age),
          studyHours: Number(profile.studyHours),
          focusMinutes: Number(profile.focusMinutes),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "We couldn't create your recommendations.");
      }
      setResults(data);
    } catch (requestError) {
      setError(
        requestError.message === "Failed to fetch"
          ? "We couldn't reach the recommendation service. Please try again."
          : requestError.message,
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="#" aria-label="Sarkari Path home">
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 32 32" fill="none">
              <path d="M5 24.5 15.8 7l4.4 7.1 3-4.8L29 24.5H5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
              <path d="M5 24.5h24M11 20h4m4 0h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </span>
          <span className="brand-name">sarkari<span>path</span></span>
        </a>
        <div className="header-note"><span className="online-dot" /> A clearer way to choose your next step</div>
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow"><span /> YOUR NEXT CHAPTER STARTS HERE</div>
            <h1>Find the government exam that fits <em>you.</em></h1>
            <p className="hero-description">
              Your strengths, goals, and daily routine matter. Tell us a little about yours and get a focused shortlist—with a plan to start.
            </p>
            <div className="trust-row">
              <span className="trust-icon" aria-hidden="true">✳</span>
              <span>Thoughtful guidance. <strong>Your choice, always.</strong></span>
            </div>
          </div>
          <aside className="hero-aside" aria-label="How it works">
            <div className="aside-orbit" aria-hidden="true"><span>✳</span></div>
            <p className="aside-kicker">A GOOD START IS A</p>
            <p className="aside-heading">plan that<br />fits your life.</p>
            <div className="aside-rule" />
            <div className="aside-steps">
              <div><span>01</span><p>Know your profile</p></div>
              <div><span>02</span><p>Explore your options</p></div>
              <div><span>03</span><p>Take the first step</p></div>
            </div>
          </aside>
        </section>

        <section className="workspace" aria-label="Exam recommendation questionnaire">
          <form className="profile-panel" onSubmit={submitProfile}>
            <div className="panel-heading">
              <div>
                <span className="section-index">01 — YOUR PROFILE</span>
                <h2>Let’s get to know you.</h2>
                <p>No account needed. We don’t save your answers.</p>
              </div>
              <span className="panel-spark" aria-hidden="true">✳</span>
            </div>

            <div className="form-grid">
              <Field label="Your age">
                <div className="input-wrap">
                  <input
                    aria-label="Your age"
                    type="number"
                    name="age"
                    min="15"
                    max="65"
                    placeholder="e.g. 22"
                    value={profile.age}
                    onChange={updateField}
                    required
                  />
                  <span className="input-suffix">years</span>
                </div>
              </Field>
              <Field label="Highest completed education">
                <select name="education" value={profile.education} onChange={updateField}>
                  <option value="10th">Class 10</option>
                  <option value="12th">Class 12</option>
                  <option value="graduate">Graduate</option>
                </select>
              </Field>
              <Field label="State or union territory (optional)">
                <input
                  type="text"
                  name="state"
                  maxLength="60"
                  placeholder="e.g. Karnataka"
                  value={profile.state}
                  onChange={updateField}
                />
              </Field>
            </div>

            <div className="form-divider" />
            <div className="question-block">
              <div className="question-heading">
                <span className="question-number">02</span>
                <div>
                  <h3>What kind of work feels right?</h3>
                  <p>Pick all the areas you’d like to explore.</p>
                </div>
              </div>
              <div className="interest-options">
                {interestOptions.map((option) => (
                  <label className={`interest-chip${profile.interests.includes(option.value) ? " selected" : ""}`} key={option.value}>
                    <input
                      type="checkbox"
                      checked={profile.interests.includes(option.value)}
                      onChange={() => toggleInterest(option.value)}
                    />
                    <span className="chip-check" aria-hidden="true">{profile.interests.includes(option.value) ? "✓" : "+"}</span>
                    {option.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-divider" />
            <div className="form-grid">
              <Field label="Your preferred work setting">
                <select name="workStyle" value={profile.workStyle} onChange={updateField}>
                  <option value="desk">Mostly desk-based</option>
                  <option value="field">Active / field-based</option>
                  <option value="mixed">A mix of both</option>
                  <option value="unsure">I’m not sure yet</option>
                </select>
              </Field>
              <Field label="Daily study time you can manage">
                <select name="studyHours" value={profile.studyHours} onChange={updateField}>
                  <option value="1">About 1 hour</option>
                  <option value="2">About 2 hours</option>
                  <option value="3">About 3 hours</option>
                  <option value="4">About 4 hours</option>
                  <option value="6">5–6 hours</option>
                  <option value="8">More than 6 hours</option>
                </select>
              </Field>
              <Field label="Comfortable focus-session length">
                <select name="focusMinutes" value={profile.focusMinutes} onChange={updateField}>
                  <option value="25">Around 25 minutes</option>
                  <option value="45">Around 45 minutes</option>
                  <option value="60">Around 1 hour</option>
                  <option value="90">Around 1.5 hours</option>
                  <option value="120">2 hours or more</option>
                </select>
              </Field>
              <Field
                label="Physical / medical requirements"
                hint="No diagnosis or health details needed."
              >
                <select name="physicalReadiness" value={profile.physicalReadiness} onChange={updateField}>
                  <option value="comfortable">I’m comfortable exploring them</option>
                  <option value="unsure">I’m unsure</option>
                  <option value="concerned">I’d prefer to avoid them</option>
                </select>
              </Field>
            </div>

            <div className="privacy-note">
              <span aria-hidden="true">⌑</span>
              <p>Your answers are used to make this shortlist and are not saved by this MVP. Health details are never requested.</p>
            </div>

            {error && <div className="error-message" role="alert">{error}</div>}
            <button className="submit-button" type="submit" disabled={loading || profile.interests.length === 0}>
              {loading ? "Finding your best fits…" : "Find my exam matches"}
              {!loading && <span aria-hidden="true">↗</span>}
            </button>
            <p className="button-caption">Free to use <span>·</span> Takes about 2 minutes</p>
          </form>

          <section className="results-panel" aria-live="polite">
            {!results && !loading && (
              <div className="empty-state">
                <div className="empty-art" aria-hidden="true">
                  <span className="art-sun" />
                  <span className="art-line art-line-one" />
                  <span className="art-line art-line-two" />
                  <span className="art-path" />
                  <span className="art-flag">✳</span>
                </div>
                <span className="section-index">02 — YOUR SHORTLIST</span>
                <h2>Your next step<br />starts with a match.</h2>
                <p>Share a few details and we’ll lay out government exam paths that may fit your goals and routine.</p>
                <div className="empty-checklist">
                  <div><span>✓</span> A ranked shortlist to explore</div>
                  <div><span>✓</span> A starter preparation plan</div>
                  <div><span>✓</span> Links to official sources</div>
                </div>
                <div className="empty-footnote"><span>✳</span> No guarantees—just a clearer place to begin.</div>
              </div>
            )}

            {loading && (
              <div className="loading-state" role="status">
                <span className="loading-mark">✳</span>
                <h2>Putting your options together.</h2>
                <p>Matching your interests, eligibility, and study routine…</p>
              </div>
            )}

            {results && (
              <div className="results-content">
                <div className="results-heading">
                  <span className="section-index">02 — YOUR SHORTLIST</span>
                  <h2>Here’s where to start.</h2>
                  <p>Based on the profile you shared. Explore these paths and see which one feels like yours.</p>
                </div>
                <div className="result-summary">
                  <span className="summary-icon" aria-hidden="true">✳</span>
                  <p><strong>{numberFormatter.format(results.recommendations.length)} paths to explore.</strong> Start with the top fit, then compare the requirements.</p>
                </div>
                <div className="recommendation-list">
                  {results.recommendations.map((exam, index) => (
                    <RecommendationCard key={exam.id} exam={exam} index={index} state={profile.state} />
                  ))}
                </div>
                <p className="results-disclaimer">{results.disclaimer}</p>
              </div>
            )}
          </section>
        </section>

        <section className="bottom-note">
          <span className="bottom-mark" aria-hidden="true">✳</span>
          <p><strong>Your path is yours to choose.</strong> Use this as a starting point, then verify every detail in the latest official exam notification.</p>
          <a href="https://upsc.gov.in/" target="_blank" rel="noreferrer">Official exam notices <span aria-hidden="true">↗</span></a>
        </section>
      </main>

      <footer className="site-footer">
        <a className="brand footer-brand" href="#" aria-label="Sarkari Path home">
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 32 32" fill="none">
              <path d="M5 24.5 15.8 7l4.4 7.1 3-4.8L29 24.5H5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
              <path d="M5 24.5h24M11 20h4m4 0h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </span>
          <span className="brand-name">sarkari<span>path</span></span>
        </a>
        <p>Made for the next generation of public service.</p>
        <span className="footer-year">A thoughtful first step · 2026</span>
      </footer>
    </div>
  );
}
