import { redirect } from "next/navigation";
import { auth, signIn } from "@/lib/auth";

export default async function LoginPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/feed");
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center max-w-sm mx-auto">
      <div className="w-10 h-10 rounded border border-black flex items-center justify-center font-mono font-bold text-sm mb-4 bg-white">
        fg
      </div>
      <h1 className="text-base font-bold tracking-tight mb-4">Sign in to friend-github</h1>
      
      <form
        action={async () => {
          "use server";
          await signIn("github", { redirectTo: "/feed" });
        }}
        className="w-full"
      >
        <button
          type="submit"
          className="inline-flex h-9 items-center justify-center rounded border border-black bg-black px-4 text-xs font-semibold text-white hover:bg-zinc-800 transition-colors w-full cursor-pointer"
        >
          Continue with GitHub
        </button>
      </form>
    </div>
  );
}
