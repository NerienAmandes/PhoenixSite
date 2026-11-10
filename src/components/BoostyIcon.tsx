type Props = { size?: number | string }

export default function BoostyIcon({ size = 16 }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M5.3 2.5h7.2c2.6 0 4.5.7 5.8 2 1.2 1.2 1.8 2.7 1.8 4.6 0 1.4-.4 2.6-1.2 3.6-.5.6-1.2 1.1-2 1.5 1.2.4 2.1 1.1 2.8 2 .7 1 1.1 2.2 1.1 3.7 0 2-.7 3.6-2.1 4.9-1.4 1.2-3.3 1.9-5.6 1.9H5.3V2.5zm3.5 6.2v3.4h3.7c.8 0 1.4-.2 1.9-.7.4-.4.7-1 .7-1.6 0-.6-.2-1.1-.7-1.5-.5-.4-1.1-.6-1.9-.6H8.8zm0 6.3v4h4c.9 0 1.6-.2 2.1-.7.5-.5.8-1.1.8-1.8 0-.7-.3-1.3-.8-1.7-.5-.6-1.2-.8-2.1-.8h-4z" />
    </svg>
  )
}