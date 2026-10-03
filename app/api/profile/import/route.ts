import { proxyAuthed } from "@/lib/proxy";

// Outlives the BE function (55s) so a BE timeout reaches the client as its own 504.
export const maxDuration = 75;

export async function POST(request: Request) {
  // No Content-Type set by hand: fetch derives the multipart boundary from the FormData.
  return proxyAuthed("/profile/import", { method: "POST", body: await request.formData() });
}
