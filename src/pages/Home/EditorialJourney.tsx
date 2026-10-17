import { useLayoutEffect, useRef, useState } from "react";
import { useEditorialMotion } from "../../components/motion/useEditorialMotion";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { places } from "../../data/places";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { openLandmark } from "../../scenes/LandmarkExperience/store";
import { isFlagship } from "../../scenes/LandmarkExperience/registry";
import { CinematicStreets } from "../../scenes/CinematicStreets/CinematicStreets";
import "./editorial.css";

export function discoverPlace(id: string) {
  window.dispatchEvent(new CustomEvent("melb:discover-place", { detail: id }));
}
function Photo({ id, className = "" }: { id: string; className?: string }) {
  const photo = places.find((p) => p.id === id)!.photo!;
  return (
    <figure className={`editorial-photo ${className}`}>
      <div className="photo-window">
        <img
          key={id}
          src={photo.src}
          alt={photo.alt}
          loading="lazy"
          decoding="async"
          width="1000"
          height="750"
        />
      </div>
      <figcaption>
        <a href={photo.source} target="_blank" rel="noreferrer">
          {photo.credit}
        </a>{" "}
        ·{" "}
        <a href={photo.licenseUrl} target="_blank" rel="noreferrer">
          {photo.license}
        </a>{" "}
        · Cropped to fit
      </figcaption>
    </figure>
  );
}
function PlaceStory({ ids, label }: { ids: string[]; label: string }) {
  const [selected, setSelected] = useState(ids[0]);
  const place = places.find((p) => p.id === selected)!;
  return (
    <div className="place-story">
      <Photo id={selected} />
      <div className="place-story-copy">
        <div className="editorial-tabs" role="group" aria-label={label}>
          {ids.map((id) => (
            <button
              key={id}
              aria-pressed={id === selected}
              onClick={() => setSelected(id)}
            >
              {places.find((p) => p.id === id)!.short}
            </button>
          ))}
        </div>
        <div aria-live="polite">
          <span className="eyebrow">{place.categories.join(" / ")}</span>
          <h3>{place.name}</h3>
          <p>{place.intro}</p>
          <p>{place.whyVisit}</p>
        </div>
        <div className="editorial-actions">
          <button onClick={() => discoverPlace(selected)}>
            Find on the Melbourne map ↗
          </button>
          {isFlagship(selected) && (
            <button onClick={() => openLandmark(selected)}>
              Enter the 3D landmark ↗
            </button>
          )}
          <a href={place.href} target="_blank" rel="noreferrer">
            Official visitor guide ↗
          </a>
        </div>
      </div>
    </div>
  );
}
export const universities = [
  {
    name: "University of Melbourne",
    area: "Parkville · just north of the city grid",
    note: "Explore courses and research-led learning, then check the requirements for your chosen course. Entry requirements, English-language requirements and fees depend on your application.",
    href: "https://study.unimelb.edu.au/how-to-apply/undergraduate-study/international-applications",
  },
  {
    name: "RMIT University",
    area: "City campus · in the life of the CBD",
    note: "A city campus puts study alongside libraries, galleries and public transport. Explore the international student guide and confirm your course’s campus, fees and application requirements.",
    href: "https://www.rmit.edu.au/study-with-us/international-students",
  },
  {
    name: "Monash University",
    area: "Multiple campuses · including Clayton and Caulfield",
    note: "Melbourne’s university life extends beyond the centre. Choose a course and campus together: your commute, accommodation and everyday neighbourhood will depend on where you study.",
    href: "https://www.monash.edu/study/why-choose-monash/our-locations",
  },
];
export const livingTopics = [
  {
    title: "A neighbourhood that fits",
    text: "Housing is part of the experience, and a major part of the budget. Compare rent, bills, travel time and access to the places you use every day. An inner-city address and a longer suburban commute offer different trade-offs.",
    href: "https://liveinmelbourne.vic.gov.au/live/housing-and-property",
    link: "Explore housing and renting",
  },
  {
    title: "A practical student budget",
    text: "Plan for accommodation, food, transport, study expenses and a buffer for the unexpected. Study Melbourne’s living guide links to budgeting tools and student support; use current estimates suited to your own situation.",
    href: "https://studymelbourne.vic.gov.au/living-here",
    link: "Build a realistic student budget",
  },
  {
    title: "Health and peace of mind",
    text: "Include healthcare arrangements in your move. Check the official guidance for your circumstances before you arrive; access, insurance and out-of-pocket costs can differ between residents and temporary visitors.",
    href: "https://liveinmelbourne.vic.gov.au/live/healthcare-and-wellbeing",
    link: "Read the official healthcare guide",
  },
  {
    title: "Work, connection and possibility",
    text: "Explore local industries and employment resources alongside your interests and qualifications. A move is more than finding work: leave room for community, recreation and a support network. Employment and migration outcomes are never guaranteed.",
    href: "https://liveinmelbourne.vic.gov.au/",
    link: "Explore official relocation resources",
  },
];
export function EditorialJourney() {
  const root = useRef<HTMLDivElement>(null),
    reduced = useReducedMotion();
  const [university, setUniversity] = useState(0);
  const [topic, setTopic] = useState(0);
  useLayoutEffect(() => {
    if (reduced) return;
    const trigger = ScrollTrigger.create({
      trigger: root.current,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) =>
        root.current?.style.setProperty(
          "--story-progress",
          `${self.progress * 100}%`,
        ),
    });
    return () => trigger.kill();
  }, [reduced]);
  useEditorialMotion(root);
  return (
    <div ref={root} className="editorial-journey">
      <section id="why-melbourne" className="editorial-intro">
        <span className="eyebrow">04 / THE MELBOURNE STORIES</span>
        <h2 className="editorial-heading">
          More than
          <br />a <em>destination.</em>
        </h2>
        <div className="intro-bottom">
          <p>
            A city to discover.
            <br />A place to learn, live and belong.
          </p>
          <a href="#sport">Find your Melbourne ↓</a>
        </div>
        <span className="intro-coordinate">37.8136° S / 144.9631° E</span>
      </section>
      <nav className="article-nav" aria-label="Melbourne stories">
        <button
          onClick={() =>
            window.dispatchEvent(
              new CustomEvent("melb:discover-place", { detail: null }),
            )
          }
        >
          ↑ Map
        </button>
        {[
          ["sport", "Sport"],
          ["culture", "Culture"],
          ["education", "Education"],
          ["lifestyle", "Lifestyle"],
          ["quality-of-life", "Belong"],
          ["walk", "Into the streets"],
          ["your-melbourne", "Your next step"],
        ].map(([id, label]) => (
          <a key={id} href={`#${id}`}>
            {label}
          </a>
        ))}
        <span className="story-progress" aria-hidden="true" />
      </nav>
      <article id="sport" className="editorial-article sport-article">
        <header className="editorial-heading">
          <span className="eyebrow">01 / SPORT</span>
          <h2>
            Where passion <em>lives.</em>
          </h2>
          <p className="editorial-deck">
            The sound of a crowd. The promise of a summer. A city that shows up.
          </p>
        </header>
        <PlaceStory
          ids={["mcg", "rod-laver", "marvel"]}
          label="Choose a sporting venue"
        />
        <div className="editorial-columns">
          <p>
            At the MCG, cricket and Australian rules football bring different
            rhythms to the same great oval. Beyond the gates, the walk through
            Yarra Park is part of the occasion: scarves, conversations and
            anticipation.
          </p>
          <p>
            Melbourne Park brings tennis into the city’s sporting story. Choose
            a venue to discover its character, check official event information,
            or step into our architectural study of the MCG. You can enjoy the
            setting without attending a match.
          </p>
        </div>
      </article>
      <article id="culture" className="editorial-article culture-article">
        <header className="editorial-heading">
          <span className="eyebrow">02 / CULTURE</span>
          <h2>
            A city of <em>stories.</em>
          </h2>
          <p className="editorial-deck">
            Old stone. New ideas. Space for a thousand perspectives.
          </p>
        </header>
        <PlaceStory
          ids={["federation", "flinders", "arts-centre", "exhibition"]}
          label="Choose a cultural place"
        />
        <div className="editorial-columns">
          <p>
            Begin at Federation Square, where the public plaza sits alongside
            ACMI and The Ian Potter Centre: NGV Australia. Cross towards
            Flinders Street and the architecture changes its voice: repeated
            arches, a copper dome and the familiar meeting place beneath the
            clocks.
          </p>
          <p>
            Continue to a performance at Arts Centre Melbourne, or look north to
            the Royal Exhibition Building. The city’s cultural life belongs to
            its public spaces as much as its monuments. Follow the official
            programmes for exhibitions, performances and changing events.
          </p>
        </div>
      </article>
      <article id="education" className="editorial-article education-article">
        <header className="editorial-heading">
          <span className="eyebrow">03 / EDUCATION</span>
          <h2>
            A place for <em>ideas.</em>
          </h2>
          <p className="editorial-deck">
            Bring your questions. Find your people. Make space for what comes
            next.
          </p>
        </header>
        <div className="education-grid">
          <Photo id="library" />
          <div className="education-copy">
            <span className="eyebrow">A READING ROOM FOR THE CITY</span>
            <h3>
              Learning extends
              <br />
              beyond the campus.
            </h3>
            <p>
              State Library Victoria is a place to read, research and encounter
              Melbourne’s stories. Around it, student life is woven into the
              everyday city: a tram journey, a gallery visit, a conversation
              after class.
            </p>
            <button
              className="editorial-link"
              onClick={() => discoverPlace("library")}
            >
              Find the library ↗
            </button>
            <p>
              Choose a university below to start exploring. Then compare
              courses, campuses, fees and entry requirements with the
              institution itself.
            </p>
          </div>
        </div>
        <div className="university-picker">
          <div
            className="editorial-tabs"
            role="group"
            aria-label="Choose a university"
          >
            {universities.map((u, i) => (
              <button
                key={u.name}
                aria-pressed={i === university}
                onClick={() => setUniversity(i)}
              >
                {u.name}
              </button>
            ))}
          </div>
          <div className="university-detail" aria-live="polite">
            <span className="eyebrow">{universities[university].area}</span>
            <h3>{universities[university].name}</h3>
            <p>{universities[university].note}</p>
            <a
              href={universities[university].href}
              target="_blank"
              rel="noreferrer"
            >
              Explore official study information ↗
            </a>
          </div>
        </div>
        <p className="editorial-note">
          Starting somewhere new takes support, too.{" "}
          <a
            href="https://studymelbourne.vic.gov.au/living-here"
            target="_blank"
            rel="noreferrer"
          >
            Study Melbourne
          </a>{" "}
          provides practical guidance on accommodation, getting around, money
          and finding community. Course admission and visa eligibility are
          separate requirements.
        </p>
      </article>
      <article id="lifestyle" className="editorial-article lifestyle-article">
        <header className="editorial-heading">
          <span className="eyebrow">04 / EVERYDAY LIFE</span>
          <h2>
            Find your <em>rhythm.</em>
          </h2>
          <p className="editorial-deck">
            A morning at the market. A garden detour. A different route home.
          </p>
        </header>
        <PlaceStory
          ids={["market", "gardens", "arts-centre"]}
          label="Choose an everyday Melbourne experience"
        />
        <div className="editorial-columns">
          <p>
            Let a neighbourhood reveal itself slowly. Pick up something at the
            market, pause for coffee, then follow the city towards the river. A
            memorable visit can be made of small moments as well as famous
            sights.
          </p>
          <p>
            The Royal Botanic Gardens offer a different pace from the city grid.
            Build a day around a few places rather than a long checklist. For
            everyday journeys, compare walking distances and public transport
            options with your accommodation or campus.
          </p>
        </div>
        <a
          className="editorial-link"
          href="https://studymelbourne.vic.gov.au/living-here"
          target="_blank"
          rel="noreferrer"
        >
          Practical guidance for getting around and settling in ↗
        </a>
      </article>
      <article
        id="quality-of-life"
        className="editorial-article belonging-article"
      >
        <header className="editorial-heading">
          <span className="eyebrow">05 / A LIFE HERE</span>
          <h2>
            More room
            <br />
            to <em>belong.</em>
          </h2>
          <p className="editorial-deck">
            Imagine the possibilities. Understand the practicalities.
          </p>
        </header>
        <div className="belonging-grid">
          <Photo id="gardens" />
          <div>
            <p className="belonging-lead">A good life is personal.</p>
            <p>
              For some, it is green space and a short commute. For others, it is
              study, a creative community or a city full of things to see.
              Melbourne offers places to explore those possibilities; the right
              choice still depends on your budget and circumstances.
            </p>
            <div
              className="living-topics"
              role="group"
              aria-label="Explore practical considerations"
            >
              {livingTopics.map((t, i) => (
                <button
                  key={t.title}
                  aria-pressed={topic === i}
                  onClick={() => setTopic(i)}
                >
                  <span>0{i + 1}</span>
                  {t.title}
                  <b>{topic === i ? "−" : "+"}</b>
                </button>
              ))}
            </div>
            <div className="living-answer" aria-live="polite">
              <h3>{livingTopics[topic].title}</h3>
              <p>{livingTopics[topic].text}</p>
              <a
                href={livingTopics[topic].href}
                target="_blank"
                rel="noreferrer"
              >
                {livingTopics[topic].link} ↗
              </a>
            </div>
          </div>
        </div>
      </article>
      <CinematicStreets />
      <section id="your-melbourne" className="your-melbourne" tabIndex={-1}>
        <span className="eyebrow">06 / YOUR NEXT CHAPTER</span>
        <h2>
          Your Melbourne
          <br />
          <em>starts here.</em>
        </h2>
        <p className="editorial-deck">
          Come for the city. Stay curious about the possibilities.
        </p>
        <div className="next-paths">
          {[
            {
              title: "Visit.",
              photo: "flinders",
              body: "Make a little room for the unexpected. Start with official visitor inspiration, then choose the places that speak to you.",
              href: "https://www.visitmelbourne.com/",
              link: "Plan a visit",
            },
            {
              title: "Study.",
              photo: "library",
              body: "Explore courses and campuses. Compare entry requirements, fees, accommodation and student support before you decide.",
              href: "https://studymelbourne.vic.gov.au/",
              link: "Explore studying here",
            },
            {
              title: "Live.",
              photo: "gardens",
              body: "Imagine an everyday life here, with a practical plan for housing, work, healthcare and the requirements of your move.",
              href: "https://liveinmelbourne.vic.gov.au/",
              link: "Explore relocation resources",
            },
          ].map((p) => (
            <div className="next-path" key={p.title}>
              <Photo id={p.photo} />
              <h3>{p.title}</h3>
              <p>{p.body}</p>
              <a href={p.href} target="_blank" rel="noreferrer">
                {p.link} ↗
              </a>
            </div>
          ))}
        </div>
        <p className="editorial-note">
          For current visa options and eligibility, consult the{" "}
          <a
            href="https://immi.homeaffairs.gov.au/"
            target="_blank"
            rel="noreferrer"
          >
            Australian Department of Home Affairs
          </a>
          . This experience does not promise admission, employment or migration
          outcomes. Resource review: October 2026.
        </p>
      </section>
    </div>
  );
}
