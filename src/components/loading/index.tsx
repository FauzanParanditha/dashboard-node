type Props = {};

export default function Loader({}: Props) {
  return (
    <div className="fixed inset-0 z-[999] bg-white/40">
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-100">
        <div className="relative">
          <img
            src="/favicon.ico"
            className="absolute left-1/2 top-1/2 h-auto w-20 -translate-x-1/2 -translate-y-1/2"
            alt="logo"
          />
          <img
            src="/images/loader.png"
            alt=""
            className="aspect-square h-auto w-40 animate-spin"
          />
        </div>
      </div>
    </div>
  );
}
