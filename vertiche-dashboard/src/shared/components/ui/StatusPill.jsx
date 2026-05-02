const colors = {
  success: { bg: '#EBF2EB', text: '#6E8B6B' },
  warning: { bg: '#FBF3E4', text: '#C9963B' },
  error:   { bg: '#F7EDEB', text: '#B65E4A' },
  info:    { bg: '#EEF0F2', text: '#7C8A96' },
};

export default function StatusPill({ status, label }) {
  const c = colors[status] || colors.info;
  return (
    <span style={{
      backgroundColor: c.bg,
      color: c.text,
      borderRadius: 20,
      padding: '3px 10px',
      fontSize: 12,
      fontWeight: 500,
      display: 'inline-block',
      whiteSpace: 'nowrap',
    }}>
      {label || status}
    </span>
  );
}
