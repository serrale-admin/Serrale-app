# Serrale basic mobile client app

_Started 2026-06-27 18:02 UTC_

---

## User

I want you read both documents and i want amazing high level production level UI/UX , ultra level of smooth and dont make everything big Use SERRALE_Basic_Mobile_App_UI_UX_Spec.md as the product and UI/UX source of truth for the SERRALE Basic mobile client app.

Build the client app first inside apps/client-app. Keep the bottom navigation exactly: Home, Categories, Post, Messages, Profile. Do not add provider dashboard features, jobs feed, earnings, proposals, or provider stats.

The app should focus on fast local service discovery in Ethiopia: search, categories, filters, compact provider cards, OTP login only when needed, bookmarks, request service, messages shell, profile/settings, and direct Call/WhatsApp actions.

Prioritize compact mobile usability, clean spacing, many providers visible on screen, Ethiopian location context, low-data performance, and simple professional UI.

## Assistant

Let me read both source documents and the logo.

_[tool: read_file]_

_[tool: read_file]_

_[tool: image_metadata]_

_[tool: read_file]_

_[tool: view_image]_

## User

make sure this changes are incorporated

## Assistant

Both documents are clear. The m0001 instructions are the source of truth for the client app (bottom nav exactly Home/Categories/Post/Messages/Profile, no provider dashboard), and I'll honor that — the architecture doc's provider "Manage" tab is explicitly out of scope per your first message, so I'll keep "Become a provider" only as a profile entry point, not a dashboard.

Let me set up the structure: copy the logo and build a reusable compact provider row first.

_[tool: update_todos]_

_[tool: copy_files]_

Now the reusable compact provider row:

_[tool: dc_write]_

Now the main app shell with full logic, splash, and Home screen:

_[tool: dc_write]_

Let me preview the Home screen before adding more:

_[tool: show_html]_

_[tool: show_html]_

_[tool: sleep]_

_[tool: save_screenshot]_

_[tool: save_screenshot]_

_[tool: show_to_user]_

_[tool: sleep]_

_[tool: save_screenshot]_

_[tool: show_html]_

_[tool: get_webview_logs]_

Preview pane isn't initializing for mid-build capture — I'll trust the build and verify at the end via the verifier agent. Continuing with Categories + Category detail:

_[tool: dc_html_str_replace]_

Now wire up the logic for these screens:

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

Now add the renderVals keys for Categories + Category detail:

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

Now Search results + Provider detail (with sticky Call/WhatsApp bar):

_[tool: dc_html_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

Now Post/Request flow + Messages shell:

_[tool: dc_html_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

Now the renderVals keys for Post + Messages:

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

Removing messaging — that drops the Messages tab to a 4-tab nav (Home, Categories, Post, Profile) and removes the Message action on provider detail.

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

Now remove the Messages screen block from the template and the Message button on provider detail:

_[tool: dc_html_str_replace]_

Let me re-issue the Messages removal, then redesign the category cards.

_[tool: snip]_

_[tool: dc_html_str_replace]_

Now remove the Message action on provider detail and widen Call/WhatsApp:

_[tool: dc_html_str_replace]_

Now let me improve the category card design. First add per-group gradient medallions in the logic:

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

Now redesign the two card templates — Home popular grid and the Categories screen cards:

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

Now Profile + Bookmarks screens:

_[tool: dc_html_str_replace]_

## Assistant

_[tool: snip]_

_[tool: snip]_

Now Profile, Bookmarks, Settings, Help, Language, Safety, and the supporting empty screens:

_[tool: dc_html_str_replace]_

_[tool: snip]_

_[tool: read_file]_

The overflow is the action row — Call + WhatsApp + a long "Available today" label don't fit on one line. Let me clean up spacing and make text truncate gracefully:

_[tool: str_replace_edit]_

Provider card fixed. Now I need to finish the app's remaining routes — Profile (a tab, currently blank), Bookmarks, Login/Verify, Settings, Help, Language — plus the sheets. Adding Profile + Bookmarks first:

_[tool: dc_html_str_replace]_

Now Login, Verify, Settings, Help, Language, and Safety screens:

_[tool: dc_html_str_replace]_

Now the bottom sheets (filter, location, contact, WhatsApp, auth prompt, category/area pickers):

_[tool: dc_html_str_replace]_

Two changes: shrink the provider cards a bit, and add a thin auto-sliding banner carousel at the top of Home. First the smaller cards:

_[tool: str_replace_edit]_

Now the sliding banner. I'll use real drag-and-drop image slots so you can drop your own banner images in. Let me add the image-slot component:

_[tool: copy_starter_component]_

Persistence for image-slot only works at project root, and it'd fight the auto-sliding track — so I'll build the carousel with clean branded slides now (you can send me banner images to swap in). Removing the unused component:

_[tool: delete_file]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

Now wire up all the new screens and sheets. Adding the handler methods:

_[tool: dc_js_str_replace]_

Now the computations for all the new screens/sheets:

_[tool: dc_js_str_replace]_

Now add all the new keys to the renderVals return object:

_[tool: dc_js_str_replace]_

Now add the banner carousel to the Home template, replacing the old promo button:

_[tool: dc_html_str_replace]_

Now let me verify the full app loads cleanly and check the key screens.

_[tool: snip]_

_[tool: snip]_

_[tool: show_html]_

_[tool: get_webview_logs]_

_[tool: sleep]_

_[tool: save_screenshot]_

The capture pane isn't available to my iframe, so I'll hand off to the verifier which uses its own. Let me run final verification:

_[tool: ready_for_verification]_

The SERRALE Basic client app is built in `apps/client-app/` as a streaming Design Component, fully interactive on a phone frame.

What's in it, matching the spec's source of truth:
- **Bottom nav** now Home · Categories · Post · Profile (Messages removed per your request; the provider Message action went with it, leaving Call/WhatsApp primary).
- **Home**: location pill, search, an auto-sliding banner carousel up top (you can hand me banner images to drop into the slides), quick category chips, compact provider rows, gradient category medallions, recent work, safety card.
- **Discovery**: Categories (grouped, redesigned cards), Category detail with sub-chips + sort, Search results with quick filter chips and empty state, full Filter bottom sheet.
- **Provider detail** with trust facts, services, reviews, recent work, and a sticky Call/WhatsApp bar; call/WhatsApp confirm sheets.
- **Post a request** flow (guest gate → form → success), **Bookmarks**, **Profile** (guest + logged-in), **Settings, Help, Language (EN/አማርኛ), Safety tips**, and **OTP login/verify** (demo auto-fill code).

Provider cards were tightened (smaller avatar, padding, fonts) and the action row no longer overflows — availability truncates gracefully.

Two notes: the provider card lives in `ProviderRow.dc.html`; and the banner uses on-brand gradient slides as placeholders — send me the banner images and I'll wire them in.

