import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Crown,
  Gem,
  Lightbulb,
  ListChecks,
  Sparkles,
  Target,
  Telescope,
  TrendingUp,
} from 'lucide-react';

type Block =
  | { kind: 'h'; level: number; text: string }
  | { kind: 'num'; n: string; text: string }
  | { kind: 'bul'; text: string }
  | { kind: 'p'; text: string }
  | { kind: 'hr' };

type Section = { title: string | null; level: number; blocks: Block[] };
type BlockGroup = { title: string | null; blocks: Block[] };

const DEFAULT_REPORT_TITLES = ['Executive Summary', 'Key Insights', 'Opportunities', 'Action Plan', 'Recommended Next Steps'];

const SECTION_ICONS: { match: RegExp; icon: React.ComponentType<{ className?: string }>; tone: string }[] = [
  { match: /overview|summary|context/i, tone: 'from-sky-500/20 to-blue-500/10 text-sky-300', icon: Sparkles },
  { match: /strategy|approach|plan/i, tone: 'from-violet-500/20 to-fuchsia-500/10 text-violet-300', icon: Target },
  { match: /action|step|next|do|task/i, tone: 'from-amber-500/20 to-orange-500/10 text-amber-300', icon: ListChecks },
  { match: /outcome|result|impact|expect/i, tone: 'from-emerald-500/20 to-teal-500/10 text-emerald-300', icon: TrendingUp },
  { match: /insight|tip|note|important/i, tone: 'from-yellow-500/20 to-amber-500/10 text-yellow-300', icon: Lightbulb },
];

const sectionMeta = (title: string | null) => {
  if (!title) return { Icon: Sparkles, tone: 'from-primary/20 to-purple-500/10 text-primary' };
  const found = SECTION_ICONS.find((s) => s.match.test(title));
  return found
    ? { Icon: found.icon, tone: found.tone }
    : { Icon: Sparkles, tone: 'from-primary/20 to-purple-500/10 text-primary' };
};

const stripMarkdown = (value: string) => value.replace(/\*\*(.*?)\*\*/g, '$1');

const looksLikeSectionHeading = (value: string) => {
  const letters = value.replace(/[^a-zA-Z]/g, '');
  if (letters.length < 8) return false;
  const uppercase = letters.replace(/[^A-Z]/g, '').length;
  return uppercase / letters.length > 0.68;
};

const looksLikeSubtopic = (value: string) => {
  const clean = stripMarkdown(value).trim();
  if (/^phase\s+\d+/i.test(clean)) return true;
  if (/^month\s+\d+/i.test(clean)) return true;
  if (/^milestone\s*:/i.test(clean)) return false;
  if (/^goal\s*:/i.test(clean)) return false;
  if (/^[A-Z][A-Za-z0-9 "'&/–—-]{2,64}:\s+\S/.test(clean)) return true;
  return false;
};

const AdviceRenderer = ({
  text,
  variant = 'dark',
  reportMode = false,
}: {
  text: string;
  variant?: 'dark' | 'themed';
  reportMode?: boolean;
}) => {
  const isDark = variant === 'dark';

  const strongClass = isDark
    ? 'font-semibold text-white'
    : 'font-semibold text-foreground bg-gradient-to-r from-primary/15 to-transparent px-1.5 -mx-0.5 rounded-md';

  const renderPlain = (value: string) => value;

  const inline = (value: string, keyPrefix: string) => {
    const nodes: React.ReactNode[] = [];
    const boldPattern = /\*\*(.*?)\*\*/g;
    let lastIndex = 0;

    for (const match of value.matchAll(boldPattern)) {
      const full = match[0];
      const content = match[1];
      const index = match.index ?? 0;

      if (index > lastIndex) {
        nodes.push(renderPlain(value.slice(lastIndex, index)));
      }

      nodes.push(
        <strong key={`${keyPrefix}-strong-${index}`} className={strongClass}>
          {renderPlain(content)}
        </strong>,
      );
      lastIndex = index + full.length;
    }

    if (lastIndex < value.length) {
      nodes.push(renderPlain(value.slice(lastIndex)));
    }

    return nodes;
  };

  const blocks: Block[] = [];
  for (const raw of text.split('\n')) {
    const t = raw.trim();
    if (!t) continue;
    if (/^-{3,}$/.test(t)) {
      blocks.push({ kind: 'hr' });
      continue;
    }
    const h = t.match(/^(#{1,3})\s+(.+)$/);
    if (h) {
      blocks.push({ kind: 'h', level: h[1].length, text: stripMarkdown(h[2]) });
      continue;
    }
    const boldHeading = t.match(/^\*\*(.*?)\*\*:?$/);
    if (boldHeading && boldHeading[1].length > 3) {
      blocks.push({ kind: 'h', level: 2, text: stripMarkdown(boldHeading[1]) });
      continue;
    }
    const n = t.match(/^(\d+)[.)]\s+(.+)$/);
    if (n) {
      if (looksLikeSectionHeading(n[2])) {
        blocks.push({ kind: 'h', level: 2, text: `${n[1]}. ${stripMarkdown(n[2])}` });
        continue;
      }
      blocks.push({ kind: 'num', n: n[1], text: n[2] });
      continue;
    }
    const b = t.match(/^[*\-]\s+(.+)$/);
    if (b) {
      blocks.push({ kind: 'bul', text: b[1] });
      continue;
    }
    blocks.push({ kind: 'p', text: t });
  }

  const sections: Section[] = [];
  let current: Section = { title: null, level: 0, blocks: [] };
  for (const b of blocks) {
    if (b.kind === 'h') {
      if (current.title || current.blocks.length) sections.push(current);
      current = { title: b.text, level: b.level, blocks: [] };
    } else {
      current.blocks.push(b);
    }
  }
  if (current.title || current.blocks.length) sections.push(current);

  const reportSections = reportMode && sections.length === 1 && !sections[0].title
    ? (() => {
        const source = sections[0].blocks;
        const size = Math.max(2, Math.ceil(source.length / DEFAULT_REPORT_TITLES.length));
        return DEFAULT_REPORT_TITLES.map((title, index) => ({
          title,
          level: 2,
          blocks: source.slice(index * size, (index + 1) * size),
        })).filter((section) => section.blocks.length);
      })()
    : sections.map((section, index) => ({
        ...section,
        title: section.title || DEFAULT_REPORT_TITLES[Math.min(index, DEFAULT_REPORT_TITLES.length - 1)],
      }));

  const blockText = (block: Block) => {
    if (block.kind === 'hr') return '';
    if (block.kind === 'num') return block.text;
    if (block.kind === 'bul') return block.text;
    if (block.kind === 'p') return block.text;
    return block.text;
  };

  const displaySections = reportMode
    ? reportSections.filter((section, index) => {
        const title = section.title || '';
        const allText = [title, ...section.blocks.map(blockText)].join(' ').toLowerCase();
        const isClosingQuestion =
          index >= 4 &&
          allText.includes('?') &&
          /(which|what).{0,40}(dive|start|first|focus|area)/i.test(allText);
        const isShortClosing =
          index >= 4 &&
          section.blocks.length === 0 &&
          /(let'?s|get to work|dive into first|which of these)/i.test(title);
        return !isClosingQuestion && !isShortClosing;
      })
    : reportSections;

  const bodyText = isDark ? 'text-white/80' : 'text-muted-foreground';
  const subtleText = isDark ? 'text-white/60' : 'text-muted-foreground';
  const titleText = isDark ? 'text-white' : 'text-foreground';
  const cardBg = isDark
    ? 'bg-gradient-to-br from-white/[0.04] via-white/[0.02] to-transparent border-white/[0.08]'
    : 'bg-gradient-to-br from-background to-secondary/30 border-border';
  const ruleClass = isDark ? 'border-white/10' : 'border-border';

  const reveal = (i: number): React.CSSProperties => ({
    animation: 'adviceIn 0.55s cubic-bezier(0.16, 1, 0.3, 1) both',
    animationDelay: `${Math.min(i * 70, 700)}ms`,
  });

  const renderBlocks = (sec: Section) => (
    <div className={reportMode ? 'space-y-4' : 'space-y-2.5'}>
      {sec.blocks.map((blk, bi) => {
        if (blk.kind === 'hr') {
          return <hr key={bi} className={`my-3 border-t ${ruleClass}`} />;
        }

        if (reportMode && (blk.kind === 'num' || blk.kind === 'bul')) {
          return (
            <p key={bi} className={`rounded-lg border border-white/[0.08] bg-[#0a101b] p-4 text-sm ${bodyText} leading-[1.7]`}>
              {inline(blockText(blk), `detail-${bi}`)}
            </p>
          );
        }

        if (blk.kind === 'num') {
          return (
            <div
              key={bi}
              className={`group/item flex gap-3 items-start rounded-xl transition-colors ${
                reportMode ? 'border border-white/[0.08] bg-[#0a101b] p-3 hover:border-[#d8b76a]/20' : 'p-2.5 -mx-2 hover:bg-white/[0.03]'
              }`}
            >
              <span className="relative inline-flex items-center justify-center min-w-[1.75rem] h-7 px-2 rounded-md bg-[#d8b76a]/10 border border-[#d8b76a]/25 text-[#d8b76a] font-semibold text-xs shrink-0">
                {blk.n}
              </span>
              <p className={`text-sm ${bodyText} leading-relaxed flex-1 pt-0.5`}>{inline(blk.text, `num-${bi}`)}</p>
            </div>
          );
        }

        if (blk.kind === 'bul') {
          return (
            <div
              key={bi}
              className={`group/item flex gap-3 items-start rounded-xl transition-colors ${
                reportMode ? 'border border-white/[0.08] bg-[#0a101b] p-3 hover:border-sky-300/20' : 'p-2 -mx-2 hover:bg-white/[0.03]'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-[#d8b76a] mt-0.5 shrink-0" />
              <p className={`text-sm ${bodyText} leading-relaxed flex-1`}>{inline(blk.text, `bul-${bi}`)}</p>
            </div>
          );
        }

        const isCallout = /^(note|tip|important|warning|insight)[:\-]/i.test(blk.text) || (reportMode && bi === 0 && blk.text.length < 190);
        if (isCallout) {
          return (
            <div
              key={bi}
              className="flex gap-3 items-start p-3.5 rounded-lg bg-[#0a101b] border border-[#d8b76a]/18"
            >
              <Lightbulb className="w-4 h-4 text-[#d8b76a] mt-0.5 shrink-0" />
              <p className={`text-sm ${bodyText} leading-relaxed flex-1`}>{inline(blk.text, `callout-${bi}`)}</p>
            </div>
          );
        }

        return (
          <p key={bi} className={`${reportMode ? 'rounded-lg border border-white/[0.08] bg-[#0a101b] p-4 text-sm' : 'text-[0.92rem]'} ${bodyText} leading-[1.7]`}>
            {inline(blk.text, `p-${bi}`)}
          </p>
        );
      })}
    </div>
  );

  const splitSubtopic = (value: string) => {
    const clean = stripMarkdown(value).trim();
    const match = clean.match(/^(.{3,80}?):\s*(.*)$/);
    if (!match) return { title: null, rest: value };
    return { title: match[1], rest: match[2] };
  };

  const groupBlocks = (blocksToGroup: Block[]) => {
    const groups: BlockGroup[] = [];
    let current: BlockGroup | null = null;

    for (const block of blocksToGroup) {
      if (block.kind === 'hr') continue;
      const textValue = blockText(block);
      const startsSubtopic = looksLikeSubtopic(textValue);

      if (startsSubtopic) {
        const split = splitSubtopic(textValue);
        current = { title: split.title || textValue, blocks: split.rest ? [{ kind: 'p', text: split.rest }] : [] };
        groups.push(current);
        continue;
      }

      if (!current) {
        current = { title: null, blocks: [] };
        groups.push(current);
      }
      current.blocks.push(block);
    }

    return groups;
  };

  const renderGroupedBlocks = (sec: Section, sectionIndex: number) => {
    const groups = groupBlocks(sec.blocks);

    return (
      <div className="space-y-4">
        {groups.map((group, groupIndex) => {
          const hasMany = group.blocks.length > 1;
          const shouldFrame = Boolean(group.title) || hasMany;

          if (!shouldFrame) {
            const only = group.blocks[0];
            return only ? (
              <p key={`loose-${sectionIndex}-${groupIndex}`} className={`rounded-lg border border-white/[0.08] bg-[#0a101b] p-4 text-sm ${bodyText} leading-[1.7]`}>
                {inline(blockText(only), `loose-${sectionIndex}-${groupIndex}`)}
              </p>
            ) : null;
          }

          return (
            <article key={`group-${sectionIndex}-${groupIndex}`} className="rounded-lg border border-white/[0.08] bg-[#0a101b] p-4 transition hover:border-[#d8b76a]/22">
              {group.title && (
                <h3 className="mb-3 text-base font-semibold leading-6 text-white">
                  {inline(group.title, `group-title-${sectionIndex}-${groupIndex}`)}
                </h3>
              )}
              <div className="space-y-3">
                {group.blocks.map((block, blockIndex) => (
                  <p key={`group-block-${sectionIndex}-${groupIndex}-${blockIndex}`} className={`text-sm ${bodyText} leading-[1.75]`}>
                    {inline(blockText(block), `group-block-${sectionIndex}-${groupIndex}-${blockIndex}`)}
                  </p>
                ))}
              </div>
            </article>
          );
        })}
      </div>
    );
  };

  if (reportMode) {
    const sectionIds = ['overview', 'insights', 'strategy', 'action-plan'];
    return (
      <>
        <style>{`
          @keyframes adviceIn {
            from { opacity: 0; transform: translateY(8px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
        <div className="space-y-5">
          {displaySections.map((sec, si) => {
            const { Icon } = sectionMeta(sec.title);
            return (
              <section
                id={sectionIds[si]}
                key={`report-section-${si}`}
                style={reveal(si)}
                className="rounded-xl border border-white/[0.08] bg-[#111a2a] p-5 md:p-6"
              >
                <header className="mb-5 flex items-start gap-3 border-b border-white/[0.08] pb-4">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.035]">
                    <Icon className="h-4 w-4 text-[#d8b76a]" />
                  </span>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#d8b76a]">
                      Section {si + 1}
                    </p>
                    <h2 className="mt-2 text-xl font-semibold leading-tight text-white md:text-2xl">
                      {inline(sec.title || DEFAULT_REPORT_TITLES[Math.min(si, DEFAULT_REPORT_TITLES.length - 1)], `report-section-title-${si}`)}
                    </h2>
                  </div>
                </header>
                {renderGroupedBlocks(sec, si)}
              </section>
            );
          })}
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`
        @keyframes adviceIn {
          from { opacity: 0; transform: translateY(10px); filter: blur(3px); }
          to { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
      `}</style>
      <div className={reportMode ? 'space-y-3' : 'space-y-4'}>
        {displaySections.map((sec, si) => {
          const { Icon, tone } = sectionMeta(sec.title);
          const DetailIcon = si === 0 ? Crown : si === 1 ? Gem : si === 2 ? Telescope : Icon;

          if (reportMode) {
            return (
              <details
                key={si}
                open={si < 2}
                style={reveal(si)}
                className="group relative overflow-hidden rounded-[1.35rem] border border-white/[0.11] bg-gradient-to-br from-white/[0.075] via-white/[0.04] to-white/[0.025] shadow-[0_22px_70px_-35px_rgba(0,0,0,.9)] backdrop-blur-xl transition-all duration-300 hover:border-amber-200/25 hover:shadow-[0_24px_80px_-42px_rgba(251,191,36,.55)]"
              >
                <summary className="flex cursor-pointer list-none items-center gap-3 p-4 md:p-5 [&::-webkit-details-marker]:hidden">
                  <span className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${tone} ring-1 ring-white/10 shadow-[0_0_28px_-16px_rgba(255,255,255,.8)]`}>
                    <DetailIcon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className={`${si === 0 ? 'text-lg md:text-xl' : 'text-base md:text-lg'} font-black leading-tight text-white`}>
                        {inline(sec.title || DEFAULT_REPORT_TITLES[si] || 'Strategic Analysis', `report-title-${si}`)}
                      </h3>
                      {si === 0 && (
                        <span className="rounded-full border border-amber-200/20 bg-amber-200/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-amber-100">
                          Top Priority
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-white/35">
                      {sec.blocks.length} insight{sec.blocks.length === 1 ? '' : 's'} ready
                    </p>
                  </div>
                  <ChevronDown className="h-5 w-5 text-white/45 transition-transform duration-300 group-open:rotate-180" />
                </summary>
                <div className="border-t border-white/[0.08] px-4 pb-4 pt-4 md:px-5 md:pb-5">
                  {renderBlocks(sec)}
                </div>
              </details>
            );
          }

          return (
            <section
              key={si}
              style={reveal(si)}
              className={`group relative rounded-2xl border ${cardBg} backdrop-blur-sm p-5 md:p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-[0_8px_30px_-12px_hsl(var(--primary)/0.35)]`}
            >
              {sec.title && (
                <header className="flex items-center gap-3 mb-4 pb-3 border-b border-dashed border-white/[0.06]">
                  <span className={`inline-flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br ${tone} ring-1 ring-white/10 shrink-0 shadow-sm`}>
                    <Icon className="w-4 h-4" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-base md:text-lg font-bold tracking-tight ${titleText} leading-tight`}>
                      {inline(sec.title, `title-${si}`)}
                    </h3>
                    <p className={`text-[11px] uppercase tracking-[0.14em] font-semibold ${subtleText} mt-0.5`}>Section {si + 1}</p>
                  </div>
                </header>
              )}
              {renderBlocks(sec)}
              <ArrowRight className={`absolute top-5 right-5 w-3.5 h-3.5 ${subtleText} opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-300`} />
            </section>
          );
        })}
      </div>
    </>
  );
};

export default AdviceRenderer;
