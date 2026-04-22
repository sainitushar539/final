const items = [
  'Business Snapshot', 'Funding Readiness', 'Growth Guidance',
  'Financial Health', 'Documentation Support', 'Action Planning',
  'Business Model Canvas', 'Personalized Coaching',
];

const TrustBar = () => (
  <div className="relative overflow-hidden border-y border-border bg-muted/30">
    <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-background to-transparent z-10" />
    <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-background to-transparent z-10" />
    <div className="flex whitespace-nowrap animate-[marquee_35s_linear_infinite] py-4">
      {[...items, ...items].map((item, i) => (
        <span key={i} className="inline-flex items-center gap-3 px-6 text-xs font-semibold text-muted-foreground tracking-wider uppercase">
          {item}
          <span className="w-1.5 h-1.5 bg-primary/40 rounded-full" />
        </span>
      ))}
    </div>
  </div>
);

export default TrustBar;
