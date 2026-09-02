import { signIn } from "@/auth";
import { GridBackground, Navbar, Footer } from "../components";
import { FormSubmitButton } from "../components/ui";

export default function LoginPage() {
  return (
    <GridBackground>
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center px-8">
        <div className="text-center">
          <h2 className="text-2xl font-mono font-bold text-neutral-800 mb-2">
            sign in
          </h2>
          <p className="font-mono text-neutral-400 text-sm mb-10">
            discover your professional network.
          </p>
          <form
            action={async () => {
              "use server";
              await signIn("linkedin", { redirectTo: "/dashboard" });
            }}
          >
            <FormSubmitButton>[ sign in with linkedin ]</FormSubmitButton>
          </form>
        </div>
      </main>
      <Footer />
    </GridBackground>
  );
}
