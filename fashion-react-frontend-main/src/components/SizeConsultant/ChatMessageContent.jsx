/* eslint-disable react/prop-types */

/** Inline **bold** (markdown) → <strong> */
function renderInline(text) {
  const parts = [];
  const re = /\*\*([^*]+)\*\*/g;
  let last = 0;
  let match;
  let key = 0;

  while ((match = re.exec(text)) !== null) {
    if (match.index > last) {
      parts.push(text.slice(last, match.index));
    }
    parts.push(<strong key={`b-${key++}`}>{match[1]}</strong>);
    last = match.index + match[0].length;
  }

  if (last < text.length) {
    parts.push(text.slice(last));
  }

  return parts.length > 0 ? parts : text;
}

const BULLET_RE = /^\s*([*\-]|\d+\.)\s+(.*)$/;

export default function ChatMessageContent({ content }) {
  const lines = String(content ?? "").split("\n");
  const blocks = [];
  let bulletGroup = [];

  const flushBullets = () => {
    if (bulletGroup.length === 0) return;
    blocks.push(
      <ul key={`ul-${blocks.length}`} className="sc-msg-list">
        {bulletGroup.map((item, i) => (
          <li key={i}>{renderInline(item)}</li>
        ))}
      </ul>
    );
    bulletGroup = [];
  };

  lines.forEach((line, i) => {
    const bullet = line.match(BULLET_RE);
    if (bullet) {
      bulletGroup.push(bullet[2]);
      return;
    }

    flushBullets();

    if (line.trim() === "") {
      if (i < lines.length - 1) {
        blocks.push(<br key={`br-${i}`} />);
      }
      return;
    }

    blocks.push(
      <p key={`p-${i}`} className="sc-msg-line">
        {renderInline(line)}
      </p>
    );
  });

  flushBullets();

  return <div className="sc-msg-body">{blocks}</div>;
}
