import { auth, signOut } from "@/lib/auth/auth-config";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-[family-name:var(--font-fraunces)] font-semibold">
            Matplan
          </h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {session.user?.image && (
                <img
                  src={session.user.image}
                  alt=""
                  className="w-8 h-8 rounded-full"
                />
              )}
              <span className="text-sm text-[#636E72]">
                {session.user?.name}
              </span>
            </div>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
            >
              <button
                type="submit"
                className="text-sm text-[#636E72] hover:text-[#2D3436] cursor-pointer"
              >
                Logg ut
              </button>
            </form>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-[#E2DDD5] p-6">
          <h2 className="text-xl font-semibold mb-4">
            Velkommen, {session.user?.name?.split(" ")[0]}!
          </h2>
          <p className="text-[#636E72] mb-6">
            Matplan er under utvikling. Snart kan du planlegge måltider,
            sammenligne priser og holde styr på budsjettet.
          </p>
          <div className="grid gap-3">
            <div className="p-4 rounded-md bg-[#FAF7F2] border border-[#E2DDD5]">
              Google-innlogging fungerer
            </div>
            <div className="p-4 rounded-md bg-[#FAF7F2] border border-[#E2DDD5]">
              Database tilkoblet (Neon Frankfurt)
            </div>
            <div className="p-4 rounded-md bg-[#FAF7F2] border border-[#E2DDD5] text-[#636E72]">
              Onboarding-wizard — kommer
            </div>
            <div className="p-4 rounded-md bg-[#FAF7F2] border border-[#E2DDD5] text-[#636E72]">
              Oppskrifter og søk — kommer
            </div>
            <div className="p-4 rounded-md bg-[#FAF7F2] border border-[#E2DDD5] text-[#636E72]">
              Kalender og matplanlegging — kommer
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
