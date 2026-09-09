function Base({ size = 24, className = "", children, ...props }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {children}
    </svg>
  );
}

export function Tijeras(props) {
  return (
    <Base {...props}>
      <circle cx="6" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <line x1="20" y1="4" x2="8.12" y2="15.88" />
      <line x1="14.47" y1="14.48" x2="20" y2="20" />
      <line x1="8.12" y1="8.12" x2="12" y2="12" />
    </Base>
  );
}

export function Peine(props) {
  return (
    <Base {...props}>
      <rect x="2" y="5" width="20" height="4" rx="1" />
      <path d="M5 9 v8" /><path d="M8.4 9 v8" /><path d="M11.8 9 v8" /><path d="M15.2 9 v8" /><path d="M18.6 9 v8" />
    </Base>
  );
}

export function Navaja(props) {
  return (
    <Base {...props}>
      <rect x="3" y="7" width="12" height="3.4" rx="1.7" />
      <path d="M15 10 l4 4" />
      <path d="M13 10.4 l4 4" />
      <path d="M17 14.4 l2 -0.4 0.4 -2" />
    </Base>
  );
}

export function Bigote(props) {
  return (
    <Base {...props}>
      <path d="M12 11 C 11 10.4, 10 10.3, 9 10.5 C 7 10.9, 6 11.8, 4.5 11.5 C 3.3 11.3, 2.6 10.4, 2.5 9.4 C 3.4 10.6, 4.8 12.6, 6.8 13.3 C 8.7 14, 10.6 13.2, 12 12.1 C 13.4 13.2, 15.3 14, 17.2 13.3 C 19.2 12.6, 20.6 10.6, 21.5 9.4 C 21.4 10.4, 20.7 11.3, 19.5 11.5 C 18 11.8, 17 10.9, 15 10.5 C 14 10.3, 13 10.4, 12 11 Z" />
    </Base>
  );
}

export function Poste(props) {
  return (
    <Base {...props}>
      <path d="M8 5 h8" /><path d="M8 19 h8" />
      <rect x="9" y="6" width="6" height="12" rx="3" />
      <path d="M9.3 8.5 L 14.7 11" /><path d="M9.3 12 L 14.7 14.5" />
    </Base>
  );
}

export function Botella(props) {
  return (
    <Base {...props}>
      <path d="M10 2 h4 v4 l1.5 3 v11 a1 1 0 0 1 -1 1 h-5 a1 1 0 0 1 -1 -1 v-11 l1.5 -3 z" />
      <path d="M9 12 h6" />
    </Base>
  );
}

export function Spray(props) {
  return (
    <Base {...props}>
      <path d="M8 9 h6 v11 a1 1 0 0 1 -1 1 h-4 a1 1 0 0 1 -1 -1 z" />
      <path d="M8 9 v-3 h4 v3" />
      <path d="M12 6 v-2 h3" />
      <path d="M17 3 h2 M17 5 h2 M16.5 7 h2" />
    </Base>
  );
}

export function Recibo(props) {
  return (
    <Base {...props}>
      <path d="M6 3 h12 v18 l-3 -2 -3 2 -3 -2 -3 2 z" />
      <path d="M9 8 h6 M9 12 h6" />
    </Base>
  );
}

export function Maquina(props) {
  return (
    <Base {...props}>
      <rect x="6" y="9" width="12" height="11" rx="2" />
      <path d="M8 9 V6 h8 v3" />
      <path d="M8.5 6 L9 3 M11 6 L11.3 3 M13 6 L13 3 M15.5 6 L15 3" />
      <path d="M9 20 v1 M15 20 v1" />
    </Base>
  );
}
