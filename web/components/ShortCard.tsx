import Icon from "@/components/Icon";

/** Thumbnail link instead of an iframe: no third-party JS on page load. */
export default function ShortCard({ id, title }: { id: string; title: string }) {
  return (
    <a
      href={`https://www.youtube.com/shorts/${id}`}
      target="_blank"
      rel="noopener"
      className="group relative block aspect-[9/16] overflow-hidden rounded-2xl bg-ink"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
        alt={title}
        loading="lazy"
        className="h-full w-full object-cover opacity-90 transition group-hover:scale-105 group-hover:opacity-100"
      />
      <span className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
      <span className="absolute left-1/2 top-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-red shadow-lg transition group-hover:scale-110">
        <Icon name="play" className="h-6 w-6 fill-current" />
      </span>
      <span className="absolute inset-x-0 bottom-0 p-3 text-sm font-semibold leading-snug text-white">{title}</span>
    </a>
  );
}
