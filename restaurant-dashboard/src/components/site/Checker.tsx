/** Red/white diner checker strip (decorative). `roll` makes it slide slowly sideways. */
export default function Checker({
  className = "",
  roll,
}: {
  className?: string;
  roll?: "left" | "right";
}) {
  const motion = roll === "left" ? "checker-roll" : roll === "right" ? "checker-roll-reverse" : "";
  return <div aria-hidden="true" className={`checker h-7 ${motion} ${className}`} />;
}
