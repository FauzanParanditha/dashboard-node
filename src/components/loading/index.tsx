type Props = {};

export default function Loader({}: Props) {
  return (
    <div className="fixed z-[999] inset-0 bg-white/40">
      <div className="absolute left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2 opacity-100">
        <div className="relative">
          <img
            src="/favicon.ico"
            className="w-20 h-auto absolute top-1/2 left-1/2  -translate-y-1/2 -translate-x-1/2"
            alt="logo"
          />
          <img
            src="/images/loader.png"
            alt=""
            className="w-40 h-auto aspect-square animate-spin"
          />
        </div>
      </div>
    </div>
  );
}
