/** Why the last sign-in didn't go through. The message is already allowlisted copy. */
export function SignInError({ message }: { message: string }) {
  return (
    <p role="alert" className="font-mono text-sm text-danger border border-danger/30 bg-danger/5 px-3 py-2 w-full text-left">
      {message}
    </p>
  );
}
