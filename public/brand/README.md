# Third-party brand assets

Official assets, used as provided by their owners. Do not recolour, redraw, stretch or replace
them with a hand-made version. Brand verification reviews these (see
`prds/google-oauth-identity-linking.md` §5.6.1). To refresh one, re-download it from the source
below and update the date.

| File | Source | Downloaded | Notes |
|---|---|---|---|
| `google-g.png` | Google's *Sign in with Google* asset bundle, https://developers.google.com/static/identity/images/signin-assets.zip → `Android + Web/PNG @4x/Dark/Theme=Dark, Show text=No, Shape=Square, Platform=Android+Web@4x.png` | 2026-10-11 | The standard-colour "G" from the **dark** theme button (it sits on the dark fill `#131314`, which the crop keeps), cropped to its own 20×20 box (x/y 10–30 of the 40×40 button, per the bundle's SVG mask). The logo pixels are unchanged. 80×80 px, shown at 20×20 CSS px. The PNG is used instead of the bundle's SVG because that SVG renders its gradient through `foreignObject`, which browsers don't render reliably in an `<img>`. |

The Google Sans font used on the sign-in buttons is at `app/fonts/`, with its licence
(`GoogleSans-OFL.txt`, SIL Open Font License 1.1, from `google/fonts` `ofl/googlesans`).
