import {
  ArrowUpRight,
  BrainCircuit,
  BriefcaseBusiness,
  CheckCircle2,
  Code2,
  FileText,
  GraduationCap,
  Play,
  Rocket,
  Sparkles,
  Users,
  PlayCircle,
} from "lucide-react";

const pillars = [
  {
    icon: BrainCircuit,
    number: "01",
    title: "AI Agents",
    text: "Practical AI agents built around useful problems — not another copy-paste chatbot demo.",
    tone: "cyan",
  },
  {
    icon: Code2,
    number: "02",
    title: "Real Projects",
    text: "Projects students can understand, explain, demonstrate and carry into interviews.",
    tone: "violet",
  },
  {
    icon: GraduationCap,
    number: "03",
    title: "Workshops",
    text: "Short, energetic sessions that turn modern technology into something students can actually use.",
    tone: "amber",
  },
];

const projectSteps = [
  { icon: Sparkles, label: "Idea", text: "Find a real problem worth solving." },
  { icon: Code2, label: "Build", text: "Design the agent, product and experience." },
  { icon: FileText, label: "Document", text: "Explain architecture, tools and decisions." },
  { icon: BriefcaseBusiness, label: "Prepare", text: "Turn the work into interview-ready knowledge." },
];

const workshopItems = [
  "Seminar: understand the technology",
  "Lab: see the system working",
  "Walkthrough: understand how it was built",
  "Interview pack: explain the project confidently",
];

const resources = [
  { icon: Rocket, title: "Project Library", text: "Practical projects and future AI-agent builds." },
  { icon: FileText, title: "Documentation", text: "Architecture, setup, explanations and interview notes." },
  { icon: Play, title: "Video Learning", text: "Project walkthroughs, workshops and career motivation." },
  { icon: Users, title: "Student Journey", text: "One place to follow SKYLENT from learning to building." },
];

export default function Home() {
  return (
    <main className="site-shell">
      <nav className="site-nav" aria-label="Primary navigation">
        <a href="#top" className="brand-lockup" aria-label="SKYLENT home">
          <img src="/branding/skylent-navbar.png" alt="SKYLENT" />
        </a>

        <div className="nav-links">
          <a href="#about">About</a>
          <a href="#projects">AI Projects</a>
          <a href="#workshops">Workshops</a>
          <a href="#resources">Resources</a>
          <a href="#youtube">YouTube</a>
        </div>

        <a href="#beginning" className="nav-cta">
          Join SKYLENT <ArrowUpRight size={16} />
        </a>
      </nav>

      <section id="top" className="hero section-wrap">
        <div className="hero-orb hero-orb-one" />
        <div className="hero-orb hero-orb-two" />
        <div className="hero-grid" />

        <div className="hero-copy reveal">
          <div className="eyebrow eyebrow-cyan">
            <span className="pulse-dot" /> Building what comes next
          </div>

          <h1>
            Learn Today.
            <span>Lead Tomorrow.</span>
          </h1>

          <p className="hero-lead">
            SKYLENT is a technology and learning platform for practical AI,
            real-world projects, workshops and career-ready skills.
          </p>

          <div className="hero-actions">
            <a href="#projects" className="button button-primary">
              Explore SKYLENT <ArrowUpRight size={18} />
            </a>
            <a href="#workshops" className="button button-ghost">
              <Play size={17} /> See the journey
            </a>
          </div>

          <div className="hero-microcopy">
            <span>AI</span><i /> <span>BUILD</span><i /> <span>LEARN</span><i /> <span>FUTURE</span>
          </div>
        </div>

        <div className="hero-art reveal delay-1">
          <div className="hero-art-frame">
            <div className="orbit orbit-a" />
            <div className="orbit orbit-b" />
            <div className="orbit orbit-c" />
            <div className="hero-art-label hero-label-top">THE VISION<strong>Build beyond limits.</strong></div>
            <img src="/branding/skylent-symbol.png" alt="SKYLENT symbol" className="hero-symbol" />
            <div className="hero-art-label hero-label-bottom"><span>NEXT GENERATION</span>AI · Learning · Innovation</div>
          </div>
          <div className="hero-caption">SKYLENT · LEARN TODAY · LEAD TOMORROW</div>
        </div>
      </section>

      <section id="about" className="section-wrap about-section">
        <div className="section-heading reveal">
          <div className="eyebrow eyebrow-violet">What SKYLENT is building</div>
          <h2>Not just learning.<br /><span>Learning by building.</span></h2>
          <p>Every SKYLENT experience is designed around one question: “Can a student understand it well enough to build and explain it?”</p>
        </div>

        <div className="pillar-grid">
          {pillars.map(({ icon: Icon, number, title, text, tone }) => (
            <article key={title} className={`pillar-card tone-${tone} reveal`}>
              <div className="card-top"><span>{number}</span><Icon size={24} /></div>
              <h3>{title}</h3>
              <p>{text}</p>
              <div className="card-line" />
            </article>
          ))}
        </div>
      </section>

      <section id="projects" className="section-wrap projects-section">
        <div className="section-heading split-heading reveal">
          <div>
            <div className="eyebrow eyebrow-cyan">01 · AI Project Library</div>
            <h2>Our first project<br /><span>starts with SKYLENT.</span></h2>
          </div>
          <p>The website is the foundation. After the foundation is ready, SKYLENT moves into its first practical AI-agent build.</p>
        </div>

        <div className="project-showcase reveal delay-1">
          <div className="project-glow" />
          <div className="project-main">
            <div className="status-pill"><span /> FOUNDATION READY</div>
            <h3>First AI Agent</h3>
            <p>Coming next: a practical agent designed around a real use case, with its architecture, documentation, demo and learning path ready for students.</p>
            <div className="project-tags"><span>Agent</span><span>Real use</span><span>Docs</span><span>Demo</span></div>
          </div>
          <div className="project-flow">
            {projectSteps.map(({ icon: Icon, label, text }) => (
              <div className="flow-item" key={label}>
                <div className="flow-icon"><Icon size={19} /></div>
                <div><strong>{label}</strong><span>{text}</span></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="workshops" className="section-wrap workshop-section">
        <div className="workshop-sheen" />
        <div className="section-heading reveal">
          <div className="eyebrow eyebrow-amber">02 · Workshops</div>
          <h2>From curiosity<br /><span>to capability.</span></h2>
          <p>Short, high-energy sessions built for students — simple enough to follow, practical enough to remember, strong enough to discuss in interviews.</p>
        </div>

        <div className="workshop-layout">
          <div className="workshop-card reveal">
            <div className="workshop-number">03–04</div>
            <div className="workshop-unit">DAY WORKSHOP</div>
            <h3>Seminar → Lab → Build → Explain</h3>
            <p>Students don't just watch. They see the idea, understand the system and learn how to talk about what they built.</p>
            <div className="workshop-bar"><span /></div>
          </div>

          <div className="workshop-list reveal delay-1">
            {workshopItems.map((item, index) => (
              <div key={item} className="workshop-item"><span>0{index + 1}</span><CheckCircle2 size={18} />{item}</div>
            ))}
          </div>
        </div>
      </section>

      <section id="resources" className="section-wrap resources-section">
        <div className="section-heading reveal">
          <div className="eyebrow eyebrow-indigo">03 · Resources</div>
          <h2>One place.<br /><span>Everything students need.</span></h2>
          <p>SKYLENT will become the central home for projects, documentation, workshop material, videos and interview preparation.</p>
        </div>

        <div className="resource-grid">
          {resources.map(({ icon: Icon, title, text }, index) => (
            <article className={`resource-card resource-${index + 1} reveal`} key={title}>
              <div className="resource-icon"><Icon size={21} /></div>
              <div className="resource-index">0{index + 1}</div>
              <h3>{title}</h3>
              <p>{text}</p>
              <span className="resource-arrow"><ArrowUpRight size={17} /></span>
            </article>
          ))}
        </div>
      </section>

      <section id="youtube" className="section-wrap youtube-section">
        <div className="youtube-glow" />
        <div className="youtube-layout">
          <div className="youtube-copy reveal">
            <div className="eyebrow eyebrow-red"><PlayCircle size={15} /> SKYLENT on YouTube</div>
            <h2>Learn. <span>Build.</span><br /><strong>Keep moving forward.</strong></h2>
            <p>Practical technology, AI projects, workshops, career guidance and motivation — presented in a way the next generation can actually enjoy.</p>
            <div className="coming-button"><PlayCircle size={17} /> YouTube Channel · Coming Soon</div>
          </div>

          <div className="youtube-card reveal delay-1">
            <div className="youtube-card-glow" />
            <img src="/branding/skylent-youtube.png" alt="SKYLENT YouTube" />
            <div className="youtube-card-kicker">COMING SOON</div>
            <h3>The SKYLENT Channel</h3>
            <p>Projects, AI, workshops, careers and motivation — all from the SKYLENT journey.</p>
            <div className="youtube-tags"><span>AI</span><span>Projects</span><span>Careers</span><span>Motivation</span></div>
          </div>
        </div>
      </section>

      <section id="beginning" className="section-wrap beginning-section">
        <div className="beginning-card reveal">
          <div className="aurora aurora-one" /><div className="aurora aurora-two" />
          <div className="eyebrow eyebrow-violet">The beginning</div>
          <h2>The future doesn't wait.<br /><span>Neither should we.</span></h2>
          <p>SKYLENT starts with one idea, one project and one step. This is only the beginning.</p>
          <div className="motto">Learn Today. Lead Tomorrow.</div>
          <div className="initials">— V S R —</div>
        </div>
      </section>

      <footer className="site-footer">
        <div className="footer-inner">
          <div>
            <img src="/branding/skylent-footer.png" alt="SKYLENT" className="footer-logo" />
            <p>Learn Today. Lead Tomorrow.</p>
          </div>
          <div className="footer-right">
            <div className="footer-links"><a href="#about">About</a><a href="#projects">Projects</a><a href="#workshops">Workshops</a><a href="#youtube">YouTube</a></div>
            <div>© {new Date().getFullYear()} SKYLENT · VSR</div>
          </div>
        </div>
      </footer>
    </main>
  );
}
