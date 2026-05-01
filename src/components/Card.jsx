import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useMemo, useRef } from "react";

const Card = ({ title, value, icon: Icon, accent = "from-violet-500/25 via-cyan-500/10 to-emerald-500/10" }) => {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useTransform(y, [-0.5, 0.5], [10, -10]);
  const rotateY = useTransform(x, [-0.5, 0.5], [-12, 12]);

  const rx = useSpring(rotateX, { stiffness: 180, damping: 18, mass: 0.25 });
  const ry = useSpring(rotateY, { stiffness: 180, damping: 18, mass: 0.25 });

  const handleMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(px);
    y.set(py);
  };

  const handleLeave = () => {
    x.set(0);
    y.set(0);
  };

  const depthStyle = useMemo(() => ({ transform: "translateZ(26px)" }), []);

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 260, damping: 22, mass: 0.3 }}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 900 }}
      className="glass ring-soft relative overflow-hidden rounded-2xl p-6"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${accent}`} />
      <div className="absolute -inset-16 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.10),transparent_60%)] opacity-70" />
      <div className="relative flex items-start justify-between gap-4" style={depthStyle}>
        <div>
          <div className="text-sm text-slate-300">{title}</div>
          <div className="mt-2 text-3xl font-semibold tracking-tight">{value}</div>
        </div>
        {Icon ? (
          <div className="glass-soft ring-soft rounded-xl p-3">
            <Icon className="h-5 w-5 text-slate-100" />
          </div>
        ) : null}
      </div>
    </motion.div>
  );
};

export default Card;
