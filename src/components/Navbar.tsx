import Link from "next/link";
import { auth, signOut } from "@/lib/auth";

export async function Navbar() {
  const session = await auth();

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-4xl px-4">
        <div className="flex h-12 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/feed" className="font-mono text-sm font-bold tracking-tight text-black">
              friend-github
            </Link>
            {session?.user && (
              <div className="flex items-center gap-4 text-xs font-medium">
                <Link href="/feed" className="text-gray-600 hover:text-black">
                  Feed
                </Link>
                <Link href="/friends" className="text-gray-600 hover:text-black">
                  Friends
                </Link>
                <Link href="/profile" className="text-gray-600 hover:text-black">
                  Profile
                </Link>
              </div>
            )}
          </div>
          {session?.user && (
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500">
                {(session.user as any).username || session.user.name}
              </span>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/login" });
                }}
              >
                <button
                  type="submit"
                  className="rounded border border-gray-300 bg-white px-2 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Logout
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
