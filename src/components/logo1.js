import Image from "next/image";

function Logo1() {
  return (
    <div className="hero-background" aria-hidden="true">
      <Image
        src="/mausDC.png"
        alt=""
        fill
        priority
        sizes="100vw"
        style={{ objectFit: "contain", objectPosition: "right center" }}
      />
    </div>
  );
}

export default Logo1;