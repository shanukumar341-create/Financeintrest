// Social links Netlify/.env ke VITE_ variables se aate hain. Khali variable = icon nahi dikhega.
const ENV = import.meta.env;
const svg = (children) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
);

const LIST = [
  ['Instagram', ENV.VITE_INSTAGRAM_URL, svg(<><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></>)],
  ['Facebook', ENV.VITE_FACEBOOK_URL, svg(<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />)],
  ['YouTube', ENV.VITE_YOUTUBE_URL, svg(<><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" /><path d="m10 15 5-3-5-3z" /></>)],
  ['X', ENV.VITE_X_URL, svg(<><path d="M4 4h4.5L20 20h-4.5z" /><path d="M4 20l6.8-7.6M19.2 4l-6.2 7" /></>)],
  ['Blogger', ENV.VITE_BLOGGER_URL, svg(<><path d="M7 3h5a5 5 0 0 1 5 5v1h.5A1.5 1.5 0 0 1 19 10.5V16a5 5 0 0 1-5 5h-4a5 5 0 0 1-5-5V5a2 2 0 0 1 2-2z" /><path d="M9.5 9h2.5M9.5 15h5" /></>)],
];

// Sirf http(s) links allow (javascript: jaise galat links block)
const ITEMS = LIST.filter(([, url]) => /^https?:\/\//i.test(String(url || '').trim()))
  .map(([n, url, icon]) => [n, String(url).trim(), icon]);

export default function Socials({ className = '' }) {
  if (!ITEMS.length) return null;
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {ITEMS.map(([name, url, icon]) => (
        <a key={name} href={url} target="_blank" rel="noopener noreferrer" aria-label={name} title={name}
          className="w-10 h-10 rounded-lg border border-line bg-panel grid place-items-center text-slate-300 hover:text-gold hover:border-gold transition">
          {icon}
        </a>
      ))}
    </div>
  );
}