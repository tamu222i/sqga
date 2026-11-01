import React from 'react';
import { SquishyItem } from '../../domain/schemas/index.ts';

interface SquishySvgRendererProps {
  item: SquishyItem;
  deformationX: number; // -1 to 1
  deformationY: number; // -1 to 1
  squishDepth: number;  // 0 to 1
  wobble: number;       // vibration / bounce
  isTapping?: boolean;
}

export const SquishySvgRenderer: React.FC<SquishySvgRendererProps> = ({
  item,
  deformationX,
  deformationY,
  squishDepth,
  wobble,
}) => {
  // Compute deformed dimensions
  const scaleX = 1 + deformationX * 0.45 - squishDepth * 0.15 + Math.sin(wobble * 8) * 0.04;
  const scaleY = 1 + deformationY * 0.45 - squishDepth * 0.35 + Math.cos(wobble * 8) * 0.04;

  const isSquishedHard = squishDepth > 0.4;
  const eyeScaleY = isSquishedHard ? 0.2 : 1.0;

  return (
    <div
      className="relative flex items-center justify-center select-none"
      style={{
        transform: `scale(${scaleX}, ${scaleY})`,
        transition: squishDepth > 0 ? 'none' : 'transform 0.12s cubic-bezier(0.34, 1.56, 0.64, 1)',
        willChange: 'transform',
      }}
    >
      <svg
        viewBox="0 0 240 240"
        className="w-56 h-56 sm:w-64 sm:h-64 drop-shadow-[0_16px_24px_rgba(0,0,0,0.35)]"
      >
        <defs>
          {/* Main 3D pillowy surface gradient */}
          <radialGradient id={`grad-${item.id}`} cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
            <stop offset="35%" stopColor={item.color} />
            <stop offset="85%" stopColor={item.accentColor} />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.4" />
          </radialGradient>

          {/* Gel transparency / gloss filter */}
          <linearGradient id={`shine-${item.id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.75" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>

          {/* Subtle foam shadow */}
          <filter id="soft-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="8" stdDeviation="6" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* --- SHAPE RENDERING ACCORDING TO ITEM ICON SHAPE --- */}
        {item.iconShape === 'toast' && (
          <g>
            {/* Bread crust */}
            <rect
              x="36"
              y="40"
              width="168"
              height="160"
              rx="40"
              fill={item.accentColor}
            />
            {/* Soft bread crumb */}
            <rect
              x="46"
              y="50"
              width="148"
              height="140"
              rx="32"
              fill={`url(#grad-${item.id})`}
            />
            {/* Butter pat */}
            <rect
              x="96"
              y="85"
              width="48"
              height="36"
              rx="8"
              fill="#fef08a"
              stroke="#eab308"
              strokeWidth="3"
              className="drop-shadow-sm"
            />
          </g>
        )}

        {item.iconShape === 'donut' && (
          <g>
            {/* Donut base dough */}
            <circle cx="120" cy="120" r="85" fill={item.color} />
            {/* Strawberry glaze */}
            <path
              d="M 120 38 C 170 38 202 70 202 120 C 202 145 190 170 170 190 C 145 205 95 205 70 190 C 50 170 38 145 38 120 C 38 70 70 38 120 38 Z"
              fill={`url(#grad-${item.id})`}
            />
            {/* Donut hole */}
            <circle cx="120" cy="120" r="32" fill="#1e293b" />
            {/* Sprinkles */}
            <rect x="75" y="80" width="12" height="5" rx="2.5" fill="#38bdf8" transform="rotate(25 75 80)" />
            <rect x="150" y="85" width="12" height="5" rx="2.5" fill="#facc15" transform="rotate(-35 150 85)" />
            <rect x="165" y="145" width="12" height="5" rx="2.5" fill="#4ade80" transform="rotate(45 165 145)" />
            <rect x="65" y="140" width="12" height="5" rx="2.5" fill="#f43f5e" transform="rotate(-15 65 140)" />
          </g>
        )}

        {(item.iconShape === 'bear' || item.iconShape === 'panda') && (
          <g>
            {/* Ears */}
            <circle cx="60" cy="65" r="28" fill={item.iconShape === 'panda' ? '#0f172a' : item.accentColor} />
            <circle cx="180" cy="65" r="28" fill={item.iconShape === 'panda' ? '#0f172a' : item.accentColor} />
            <circle cx="60" cy="65" r="14" fill="#fda4af" opacity="0.6" />
            <circle cx="180" cy="65" r="14" fill="#fda4af" opacity="0.6" />

            {/* Main Body */}
            <circle cx="120" cy="130" r="75" fill={`url(#grad-${item.id})`} />

            {item.iconShape === 'panda' && (
              <>
                {/* Panda Eye Patches */}
                <ellipse cx="90" cy="120" rx="18" ry="14" fill="#0f172a" transform="rotate(-20 90 120)" />
                <ellipse cx="150" cy="120" rx="18" ry="14" fill="#0f172a" transform="rotate(20 150 120)" />
              </>
            )}
          </g>
        )}

        {item.iconShape === 'cat' && (
          <g>
            {/* Cat Ears */}
            <polygon points="50,90 70,35 105,75" fill={item.accentColor} />
            <polygon points="190,90 170,35 135,75" fill={item.accentColor} />
            <polygon points="58,85 72,45 98,74" fill="#f472b6" opacity="0.6" />
            <polygon points="182,85 168,45 142,74" fill="#f472b6" opacity="0.6" />

            {/* Cat Face */}
            <circle cx="120" cy="130" r="75" fill={`url(#grad-${item.id})`} />
          </g>
        )}

        {item.iconShape === 'shiba' && (
          <g>
            {/* Shiba Ears */}
            <polygon points="55,85 75,30 110,70" fill={item.accentColor} />
            <polygon points="185,85 165,30 130,70" fill={item.accentColor} />
            {/* Shiba Muzzle Mask */}
            <circle cx="120" cy="130" r="75" fill={`url(#grad-${item.id})`} />
            <ellipse cx="120" cy="148" rx="42" ry="32" fill="#ffffff" />
          </g>
        )}

        {item.iconShape === 'boba' && (
          <g>
            {/* Cup Shape */}
            <path
              d="M 60 70 L 72 195 C 74 210 166 210 168 195 L 180 70 Z"
              fill={`url(#grad-${item.id})`}
            />
            {/* Boba lid */}
            <ellipse cx="120" cy="70" rx="64" ry="14" fill={item.accentColor} />
            {/* Big Boba Straw */}
            <rect x="112" y="15" width="16" height="60" rx="6" fill="#fb7185" />
            {/* Tapioca Pearls inside */}
            <circle cx="90" cy="180" r="12" fill="#1e293b" />
            <circle cx="120" cy="185" r="13" fill="#1e293b" />
            <circle cx="150" cy="178" r="12" fill="#1e293b" />
            <circle cx="105" cy="162" r="11" fill="#1e293b" />
            <circle cx="135" cy="164" r="12" fill="#1e293b" />
          </g>
        )}

        {item.iconShape === 'slime' && (
          <g>
            {/* Gooey Slime Drops */}
            <path
              d="M 120 45 C 180 45 205 90 205 140 C 205 185 175 205 120 205 C 65 205 35 185 35 140 C 35 90 60 45 120 45 Z"
              fill={`url(#grad-${item.id})`}
            />
            {/* Sparkle micro-beads */}
            <circle cx="80" cy="100" r="6" fill="#ffffff" opacity="0.8" />
            <circle cx="160" cy="115" r="8" fill="#ffffff" opacity="0.7" />
            <circle cx="140" cy="165" r="7" fill="#ffffff" opacity="0.8" />
            <circle cx="95" cy="170" r="5" fill="#ffffff" opacity="0.75" />
          </g>
        )}

        {item.iconShape === 'alien' && (
          <g>
            {/* Alien head */}
            <ellipse cx="120" cy="125" rx="78" ry="85" fill={`url(#grad-${item.id})`} />
            {/* Antennas */}
            <line x1="120" y1="40" x2="120" y2="15" stroke={item.accentColor} strokeWidth="6" strokeLinecap="round" />
            <circle cx="120" cy="12" r="10" fill="#a855f7" />
          </g>
        )}

        {item.iconShape === 'capybara' && (
          <g>
            {/* Chubby Capybara Snout */}
            <rect x="50" y="65" width="140" height="135" rx="45" fill={`url(#grad-${item.id})`} />
            <circle cx="58" cy="78" r="14" fill={item.accentColor} />
            <circle cx="182" cy="78" r="14" fill={item.accentColor} />
            {/* Yuzu fruit on head */}
            <circle cx="120" cy="55" r="18" fill="#facc15" />
            <path d="M 120 37 Q 128 32 125 26" stroke="#15803d" strokeWidth="4" fill="none" strokeLinecap="round" />
          </g>
        )}

        {/* --- CUTE FACIAL EXPRESSIONS --- */}
        <g
          transform={`translate(0, ${squishDepth * 10})`}
          style={{ transformOrigin: '120px 130px' }}
        >
          {/* Eyes */}
          <g style={{ transform: `scale(1, ${eyeScaleY})`, transformOrigin: '120px 125px' }}>
            <ellipse cx="95" cy="122" rx="6" ry="7" fill="#0f172a" />
            <ellipse cx="145" cy="122" rx="6" ry="7" fill="#0f172a" />
            {/* Eye glints */}
            {!isSquishedHard && (
              <>
                <circle cx="93" cy="120" r="2.5" fill="#ffffff" />
                <circle cx="143" cy="120" r="2.5" fill="#ffffff" />
              </>
            )}
          </g>

          {/* Cheeks blush */}
          <circle cx="78" cy="134" r="9" fill="#fb7185" opacity={0.65 + squishDepth * 0.3} />
          <circle cx="162" cy="134" r="9" fill="#fb7185" opacity={0.65 + squishDepth * 0.3} />

          {/* Mouth */}
          {isSquishedHard ? (
            /* Open cute o-mouth when squished hard */
            <ellipse cx="120" cy="138" rx="8" ry="10" fill="#991b1b" stroke="#0f172a" strokeWidth="2" />
          ) : (
            /* Soft smile */
            <path
              d="M 112 134 Q 120 142 128 134"
              stroke="#0f172a"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
            />
          )}
        </g>

        {/* --- GLOSS / LIGHT REFLECTION (Distorts with squish) --- */}
        <ellipse
          cx="90"
          cy="80"
          rx={35 * (1 - squishDepth * 0.3)}
          ry={18 * (1 - squishDepth * 0.5)}
          fill="url(#shine-toast)"
          transform="rotate(-25 90 80)"
        />

        {/* Floam texture dots overlay if beads */}
        {item.texturePattern === 'beads' && (
          <g opacity="0.35">
            <circle cx="85" cy="95" r="4" fill="#ffffff" />
            <circle cx="155" cy="90" r="3.5" fill="#ffffff" />
            <circle cx="100" cy="160" r="4.5" fill="#ffffff" />
            <circle cx="145" cy="165" r="4" fill="#ffffff" />
          </g>
        )}
      </svg>
    </div>
  );
};
