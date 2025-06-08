import Image from "next/image";

import logo from "@/public/logo.png";
import Link from "next/link";

export default function Header() {
  return (
    <header className="relative mx-auto flex w-full shrink-0 items-center justify-center py-6">
      <Link href="/">
        <Image
          src={logo}
          alt=""
          quality={100}
          className="mx-auto h-9 object-contain"
          priority
        />
      </Link>

      <div className="absolute right-3">
        <a
          href="https://aidabot.club"
          target="_blank"
          className="ml-auto hidden items-center gap-3 rounded-full bg-white/95 px-5 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-gray-100 transition-all hover:bg-white hover:shadow-md hover:ring-gray-200 sm:flex"
        >
          <div className="flex items-center gap-1.5">
            <span className="font-medium">AIDA AI</span>
          </div>
        </a>
      </div>
    </header>
  );
}
