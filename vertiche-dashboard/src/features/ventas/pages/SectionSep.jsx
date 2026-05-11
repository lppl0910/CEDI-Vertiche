import './styles/SectionSep.css';

export function SectionSep({ label }) {
  return (
    <div className="section-sep">
      <span className="section-sep__label">{label}</span>
      <div className="section-sep__line" />
    </div>
  );
}
