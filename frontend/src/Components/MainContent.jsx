import "../Css/MainContent.css";
import Header from "./Header";
import { 
  IconArrowUp, IconArrowDown } from "./Icons";

export default function MainContent({
  pageTitle,
  pageSubtitle,
  stats = [],
  sections = [],
  children,
}) {
  return (
    <main className="pfl-main">
      <Header pageTitle={pageTitle} pageSubtitle={pageSubtitle} />

      {stats.length > 0 && (
        <section className="pfl-stat-grid">
          {stats.map((stat) => {
            const Icon = stat.icon;
            const trendUp = stat.trend === "up";
            return (
              <div className={`pfl-stat-card pfl-stat-card--${stat.accent || "blue"}`} key={stat.id}>
                <div className="pfl-stat-card__top">
                  <span className="pfl-stat-card__label">{stat.label}</span>
                  {Icon && (
                    <span className="pfl-stat-card__icon">
                      <Icon size={17} />
                    </span>
                  )}
                </div>
                <div className="pfl-stat-card__value">{stat.value}</div>
                {stat.delta && (
                  <div className={`pfl-stat-card__delta ${trendUp ? "is-up" : "is-down"}`}>
                    {trendUp ? <IconArrowUp size={12} /> : <IconArrowDown size={12} />}
                    <span>{stat.delta}</span>
                  </div>
                )}
              </div>
            );
          })}
        </section>
      )}

      {sections.length > 0 && (
        <div className="pfl-section-stack">
          {sections.map((section) => (
            <section className="pfl-panel" key={section.id}>
              {section.title && <h2 className="pfl-panel__title">{section.title}</h2>}
              <div className="pfl-panel__body">{section.content}</div>
            </section>
          ))}
        </div>
      )}

      {children}
    </main>
  );
}