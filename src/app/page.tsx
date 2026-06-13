import { redirect } from "next/navigation";
import { auth, signIn } from "@/lib/auth";

export default async function LandingPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/feed");
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto">
      <div className="w-12 h-12 rounded border border-black flex items-center justify-center font-mono font-bold text-lg mb-4 bg-white">
        fg
      </div>
      <h1 className="text-xl font-bold tracking-tight mb-2">friend-github</h1>
      <p className="text-xs text-gray-500 mb-6 max-w-xs leading-relaxed">
        A minimal, fast, and clean social network built exclusively for developers. Connect with friends and share snippets or thoughts.
      </p>
      
      <form
        action={async () => {
          "use server";
          await signIn("github", { redirectTo: "/feed" });
        }}
      >
        <button
          type="submit"
          className="inline-flex h-9 items-center justify-center rounded border border-black bg-black px-4 text-xs font-semibold text-white hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          Continue with GitHub
        </button>
      </form>
    </div>
  );
}
