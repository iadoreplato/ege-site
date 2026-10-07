/* The course mascot: an original SVG rabbit. Animation (blinking, ear twitches, nose wiggle) lives in styles.css, section "rabbit". */
const FUR = "#F3E7D7", SHADE = "#E2CFB6", EAR = "#EFAF95", CHEEK = "#F4BFA6", NAVY = "#1D2B4A", TERRA = "#C2643A";

/** Rabbit head for the header logo */
export const RabbitMark = ({ className = "rb rb-mark" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 64 64" aria-hidden="true">
    <g className="rb-ear rb-ear-l" style={{ transformOrigin: "27px 30px" }}>
      <ellipse cx="24" cy="15" rx="6.5" ry="14" fill={FUR} transform="rotate(-12 24 15)" />
      <ellipse cx="24" cy="16.5" rx="3.2" ry="10" fill={EAR} transform="rotate(-12 24 16.5)" />
    </g>
    <g className="rb-ear rb-ear-r" style={{ transformOrigin: "37px 30px" }}>
      <ellipse cx="40" cy="15" rx="6.5" ry="14" fill={FUR} transform="rotate(12 40 15)" />
      <ellipse cx="40" cy="16.5" rx="3.2" ry="10" fill={EAR} transform="rotate(12 40 16.5)" />
    </g>
    <ellipse cx="32" cy="41" rx="18" ry="16" fill={FUR} />
    <ellipse cx="32" cy="49" rx="9" ry="6" fill={SHADE} opacity=".55" />
    <circle cx="21.5" cy="46" r="3.2" fill={CHEEK} opacity=".75" />
    <circle cx="42.5" cy="46" r="3.2" fill={CHEEK} opacity=".75" />
    <g className="rb-eyes" style={{ transformOrigin: "32px 39px" }}>
      <ellipse cx="25" cy="39" rx="2.5" ry="3.1" fill={NAVY} />
      <ellipse cx="39" cy="39" rx="2.5" ry="3.1" fill={NAVY} />
      <circle cx="25.9" cy="37.9" r=".9" fill="#fff" />
      <circle cx="39.9" cy="37.9" r=".9" fill="#fff" />
    </g>
    <path className="rb-nose" style={{ transformOrigin: "32px 45px" }} d="M29.6 44.4Q32 43.2 34.4 44.4Q33.2 46.7 32 46.9Q30.8 46.7 29.6 44.4Z" fill={TERRA} />
    <path d="M32 46.9v1.5m0 0q-1.9 1.7-3.5.5m3.5-.5q1.9 1.7 3.5.5" fill="none" stroke={NAVY} strokeWidth="1" strokeLinecap="round" />
  </svg>
);

/** Rabbit reading an open book, for the cover */
export const RabbitReader = () => (
  <svg className="rb rb-reader" viewBox="0 0 240 240" aria-hidden="true">
    <ellipse cx="120" cy="222" rx="92" ry="9" fill="#000" opacity=".18" />
    <g className="rb-ear rb-ear-l" style={{ transformOrigin: "104px 84px" }}>
      <ellipse cx="96" cy="50" rx="15" ry="40" fill={FUR} transform="rotate(-10 96 50)" />
      <ellipse cx="96" cy="54" rx="7.5" ry="30" fill={EAR} transform="rotate(-10 96 54)" />
    </g>
    <g className="rb-ear rb-ear-r" style={{ transformOrigin: "136px 84px" }}>
      <ellipse cx="146" cy="52" rx="15" ry="40" fill={FUR} transform="rotate(16 146 52)" />
      <ellipse cx="146" cy="56" rx="7.5" ry="30" fill={EAR} transform="rotate(16 146 56)" />
    </g>
    <ellipse cx="120" cy="178" rx="54" ry="44" fill={SHADE} />
    <ellipse cx="120" cy="114" rx="47" ry="41" fill={FUR} />
    <ellipse cx="120" cy="134" rx="22" ry="14" fill={SHADE} opacity=".5" />
    <circle cx="91" cy="128" r="8" fill={CHEEK} opacity=".7" />
    <circle cx="149" cy="128" r="8" fill={CHEEK} opacity=".7" />
    <g className="rb-eyes" style={{ transformOrigin: "120px 112px" }}>
      <ellipse cx="102" cy="112" rx="5.6" ry="6.8" fill={NAVY} />
      <ellipse cx="138" cy="112" rx="5.6" ry="6.8" fill={NAVY} />
      <circle cx="103.6" cy="114.6" r="1.8" fill="#fff" />
      <circle cx="139.6" cy="114.6" r="1.8" fill="#fff" />
    </g>
    <path className="rb-nose" style={{ transformOrigin: "120px 126px" }} d="M113.5 124.5Q120 121.5 126.5 124.5Q123.2 130.6 120 131Q116.8 130.6 113.5 124.5Z" fill={TERRA} />
    <path d="M120 131v4m0 0q-4.6 4.2-8.6 1.3m8.6-1.3q4.6 4.2 8.6 1.3" fill="none" stroke={NAVY} strokeWidth="2" strokeLinecap="round" />
    {/* open book */}
    <path d="M44 184Q83 174 120 190Q157 174 196 184V218Q157 209 120 223Q83 209 44 218Z" fill={TERRA} />
    <path d="M52 180Q88 170 120 186V216Q88 202 52 210Z" fill="#FFFDF9" />
    <path d="M188 180Q152 170 120 186V216Q152 202 188 210Z" fill="#FBF3E8" />
    <path d="M64 186q22-6 46 2M64 194q22-6 46 2M64 202q14-4 28 0M130 188q22-8 46-2M130 196q22-8 46-2M130 204q14-5 30-2" fill="none" stroke="#D9C8B0" strokeWidth="2.6" strokeLinecap="round" />
    <ellipse cx="92" cy="182" rx="11" ry="8.5" fill={FUR} />
    <ellipse cx="148" cy="182" rx="11" ry="8.5" fill={FUR} />
    <path d="M88 178.5v5M96 178.5v5M144 178.5v5M152 178.5v5" stroke={SHADE} strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);
