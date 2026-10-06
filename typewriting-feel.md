# Digital Typewriter Interaction Mechanism

## UX, Feeling, Interaction Logic, and Implementation Report

**Context:** Editorial writing experience / Ghostwriter\
**Primary interaction goal:** Make digital typing feel tactile,
mechanical, deliberate, and satisfying without compromising the speed
and reliability of a modern text editor.

------------------------------------------------------------------------

## 1. Experience Vision

A convincing digital typewriter should not simply apply a typewriter
font to a text field. The experience should recreate the **cause and
effect** of a mechanical writing machine.

A normal digital editor behaves like:

`key press → character appears`

The proposed typewriter experience behaves like:

`key press → impact → character lands → surface reacts → sound responds → mechanism settles`

The user should feel that each character is being **placed onto a
page**, rather than merely inserted into a text field.

### Desired emotional qualities

The interaction should feel:

-   tactile
-   rhythmic
-   mechanical
-   intimate
-   focused
-   deliberate
-   slightly imperfect
-   responsive
-   satisfying

The experience should suggest physicality without becoming theatrical or
slowing down the writer.

### Core design principle

> Every keystroke should feel like a small act of commitment. The
> character does not simply appear. It lands on the page.

------------------------------------------------------------------------

## 2. The Mechanical Metaphor

A physical typewriter creates a chain of events:

`finger → key → type mechanism → ink ribbon → paper → carriage`

A digital implementation can translate this into:

`keyboard event → text state → character impact → paper response → audio response → settle`

The important distinction is that the product does **not** need to
reproduce every mechanical detail of a real typewriter. It needs to
reproduce the details that create the *feeling* of using one.

This gives the interface permission to preserve modern functionality
such as:

-   undo and redo
-   copy and paste
-   autosave
-   text selection
-   keyboard shortcuts
-   fast typing
-   accessibility controls
-   responsive layouts

The interaction layer can feel analogue while the underlying writing
system remains fully digital.

------------------------------------------------------------------------

## 3. What Happens During One Keystroke

Consider the user pressing the letter **A**.

### Stage 1: Input detection --- approximately 0 ms

The keyboard event is captured immediately.

The character should be committed to the editor state without waiting
for an animation to complete.

**UX requirement:** perceived input latency should remain effectively
zero.

Animation must respond to typing. Typing must never wait for animation.

------------------------------------------------------------------------

### Stage 2: Character impact --- approximately 0 to 40 ms

The new character appears with a tiny impact response.

Possible visual properties:

-   initial scale around `1.02–1.04`
-   vertical displacement around `0.5–1 px`
-   slightly increased ink density on impact
-   extremely small rotational variation
-   rapid snap toward the resting position

This should be subtle enough that the user experiences it as physical
feedback rather than consciously observing an animation.

**Feeling:** `clack`

------------------------------------------------------------------------

### Stage 3: Paper response --- approximately 30 to 100 ms

The writing surface responds to the impact.

Possible responses:

-   manuscript moves vertically by approximately `0.5–1 px`
-   active line receives a tiny impulse
-   paper shadow changes momentarily
-   platen or page layer reacts independently from the surrounding UI

The entire application should **not shake**. The response should be
local to the writing surface.

The objective is to communicate force, not spectacle.

------------------------------------------------------------------------

### Stage 4: Settle --- approximately 80 to 160 ms

The character and writing surface return to their resting state.

Possible character variation:

-   subtle opacity variation
-   tiny baseline variation
-   tiny rotational variation
-   slight texture variation
-   minor differences in perceived ink pressure

The variation should remain constrained. A reader should feel that the
text is organically printed without struggling to read it.

### Recommended rule

**Imperfection should be felt before it is noticed.**

------------------------------------------------------------------------

## 4. The Cursor Versus the Carriage

One of the strongest opportunities is to rethink the traditional digital
cursor.

### Conventional editor

The text remains stationary while the cursor continuously advances:

`The quick brown fox| →`

### Typewriter inspired editor

The writing point can remain within a stable visual zone while the
manuscript or carriage subtly advances beneath it.

Conceptually:

``` text
                    fixed strike point
                           ↓
              The quick brown fox|
        ← manuscript / carriage movement
```

This creates a stronger illusion of operating a writing machine.

### Recommended approach

Do not literally move the entire document after every character if it
compromises readability.

Instead:

1.  Maintain a comfortable active writing zone.
2.  Allow subtle horizontal or vertical movement around the current
    line.
3.  Recenter smoothly when necessary.
4.  Reserve larger carriage movement for line changes.
5.  Keep selection, scrolling, and editing behaviour predictable.

This is a **perceptual carriage**, not necessarily a physically accurate
carriage simulation.

------------------------------------------------------------------------

## 5. Input Specific Behaviour

Different keyboard actions should create different mechanical responses.

  -----------------------------------------------------------------------
  Input                   Functional action       Suggested physical
                                                  response
  ----------------------- ----------------------- -----------------------
  Letter / number         Insert character        Short strike and settle

  Punctuation             Insert character        Slightly sharper strike

  Space                   Advance position        Soft mechanical tick

  Backspace               Remove character        Small reverse or
                                                  retract response

  Delete                  Remove forward          Controlled mechanical
                          character               click

  Enter / Return          Create new line         Bell, carriage return,
                                                  line advance

  Tab                     Indent                  Longer mechanical
                                                  advance

  Shift                   Modifier                Optional quiet
                                                  mechanical press

  Rapid typing            Continuous input        Rhythmic overlapping
                                                  strikes

  Pause                   No input                Complete stillness
  -----------------------------------------------------------------------

Not every modifier key needs audible or visual feedback. Restraint
protects the writing experience from becoming noisy.

------------------------------------------------------------------------

## 6. Enter / Return as the Hero Interaction

The Return key provides the clearest opportunity to communicate the
typewriter metaphor.

A letter can feel like:

`CLACK`

Return can feel like:

`DING → carriage movement → line advance → settle`

### Suggested sequence

**0 ms**\
Return is registered and the new line is committed.

**0--80 ms**\
A subtle bell or end of line sound begins.

**40--180 ms**\
The manuscript or carriage performs a stronger horizontal movement.

**120--240 ms**\
The writing position drops to the next line.

**200--300 ms**\
The page settles.

The exact timing should be tuned through prototyping. The effect should
remain short enough that a user can immediately continue typing.

The animation should never lock the keyboard.

------------------------------------------------------------------------

## 7. Typing Rhythm

The system should respond differently to isolated typing and sustained
typing.

### Slow typing

Each keystroke can be individually perceived.

This supports:

-   contemplation
-   editorial writing
-   reflective pauses
-   stronger tactile feedback

### Rapid typing

Animations should overlap rather than queue.

Never build:

`animation 1 → animation 2 → animation 3 → animation 4`

Build:

`input 1 ↘` `input 2  ↘ simultaneous independent responses`
`input 3   ↘`

If a user types faster than the visual system can animate, new events
should interrupt, blend with, or supersede previous micro interactions.

### Desired result

Fast typing produces a mechanical **rhythm**, not animation backlog.

------------------------------------------------------------------------

## 8. Sound Design

Sound is a major part of perceived physicality.

However, playing the same sound file at the same volume for every
character will quickly feel artificial.

### Recommended sound model

Maintain a small pool of strike samples:

``` text
keypress
   ↓
classify input
   ↓
select sound family
   ↓
choose slight variation
   ↓
apply restrained volume / pitch variation
   ↓
play immediately
```

### Suggested sound families

1.  standard key strike
2.  harder strike
3.  punctuation strike
4.  space mechanism
5.  backspace
6.  Return / carriage
7.  carriage bell
8.  optional paper or mechanism ambience

A pool of approximately **4 to 8 subtle variations** for common strikes
can prevent repetition from becoming obvious.

### Audio principles

-   keep latency extremely low
-   preload short samples
-   avoid excessively loud transients
-   introduce only slight random variation
-   provide a mute control
-   respect browser autoplay restrictions
-   avoid sound on every non writing shortcut
-   prevent audio from accumulating during very fast typing

The Web Audio API is particularly appropriate when precise, low latency
audio control is required. MDN describes it as a modular audio system
with high precision timing and low latency, suitable for interactive
audio experiences.

------------------------------------------------------------------------

## 9. Visual Imperfection System

Mechanical typewriters do not produce perfectly identical marks.

A digital interpretation can introduce controlled imperfection.

### Possible variables

For each newly rendered character:

``` text
inkOpacity = 0.94–1.00
verticalOffset = -0.35px–0.35px
rotation = -0.15deg–0.15deg
scale = 0.995–1.005
```

These values are starting ranges for experimentation, not production
specifications.

### Important constraint

Randomness should be **seeded or constrained** where possible.

If the same document visually changes every time it renders, the
experience can feel unstable.

A better approach is to derive variation from something stable such as:

`character index + document seed`

This allows the same character to retain approximately the same printed
personality across renders.

------------------------------------------------------------------------

## 10. Paper and Surface Behaviour

The page itself should have a distinct interaction layer.

Potential effects include:

-   tiny impact displacement
-   subtle paper grain
-   extremely light shadow response
-   slight line movement during strikes
-   stronger movement during carriage return
-   optional edge movement when the manuscript scrolls

Avoid continuously animating the paper.

**Stillness is part of the experience.**

Movement becomes meaningful because the page is otherwise calm.

**Implemented September 29, 2026:** the writing shell and manuscript are distinct
paper and sheet surfaces with a resting shadow. Eligible key classes produce
different sub-pixel responses on the active line, scaled down during sustained
typing. Return advances the line while the sheet moves once and its shadow
deepens, then both settle. Reduced motion disables all movement. Paper grain,
character landing, and sound are not implemented.

------------------------------------------------------------------------

## 11. The Plume as a Second Interaction Layer

**Original proposal, not adopted:** the Plume is unwired and is not part of the
current writing experience. The native caret is the only cursor in every view.

For the Ghostwriter concept, the plume should not simply mirror every
keystroke.

The typewriter and plume can communicate different dimensions:

### Typewriter

Responds to **what the user physically does**.

Examples:

-   typing
-   deleting
-   spacing
-   returning
-   editing

### Plume

Responds to **how the user is writing**.

Examples:

-   hesitation
-   long pauses
-   rapid bursts
-   deletion streaks
-   completion of a paragraph
-   returning to an older paragraph
-   extended uninterrupted writing

This gives the plume a more expressive role.

### Example states

**Thinking**\
User pauses for several seconds. The plume becomes almost still with a
very subtle idle movement.

**Flow**\
User types continuously. The plume gains controlled rhythmic motion.

**Revision**\
Repeated deletion produces a small backward or corrective gesture.

**Paragraph completion**\
Return after a substantial paragraph produces a slightly more expressive
plume movement.

**Idle**\
The plume settles completely.

The plume should therefore represent the **writer's state**, while the
typewriter represents the **writer's action**.

------------------------------------------------------------------------

## 12. Interaction Architecture

Recommended conceptual architecture:

``` text
                     Keyboard Event
                           │
                           ▼
                    Input Controller
                           │
                 Update text immediately
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
 Character Response   Surface Response    Audio Engine
        │                  │                  │
        ▼                  ▼                  ▼
    Anime.js            Anime.js       Web Audio / Howler
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
                           ▼
                     Visual Settle

                           │
                           ▼
                    Behaviour Signals
                           │
          pause / burst / delete / paragraph
                           │
                           ▼
                       Plume State
                           │
                           ▼
                       Anime.js
```

### Critical separation

The **text model is authoritative**.

Animations are observers of text input rather than owners of text input.

This protects:

-   typing speed
-   data integrity
-   autosave
-   undo history
-   accessibility
-   keyboard shortcuts
-   composition events
-   paste operations

------------------------------------------------------------------------

## 13. Recommended Technology Stack

### 13.1 Anime.js --- Primary interaction animation engine

**Recommended role:** character impacts, paper impulses, carriage
movement, plume animation, timelines, SVG movement.

Anime.js provides animation, timeline, SVG, text, utility, easing,
event, layout, and Web Animations API related capabilities in its
current documentation.

Use it for:

-   keystroke impact animation
-   character settle
-   paper movement
-   Return sequence
-   plume movement
-   SVG feather deformation or movement
-   timeline orchestration
-   small procedural variations

**Recommendation:** Make Anime.js the primary animation language for
this concept rather than mixing several animation engines for the same
interaction.

Official documentation: https://animejs.com/documentation/

------------------------------------------------------------------------

### 13.2 Web Audio API --- Preferred audio foundation

**Recommended role:** low latency mechanical sound engine.

Use it for:

-   preloaded key strike buffers
-   overlapping key sounds
-   gain control
-   subtle pitch variation
-   panning if desired
-   bell and carriage samples
-   audio throttling
-   precise timing

The browser native Web Audio API provides detailed control over audio
routing and precise timing.

**Best fit:** when sound is a core part of the experience and the
implementation team wants fine control.

Reference:
https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API

------------------------------------------------------------------------

### 13.3 Howler.js --- Simpler audio alternative

**Recommended role:** pragmatic sound playback abstraction.

Howler.js can be considered when the project needs a simpler audio layer
rather than direct Web Audio API management.

Use it for:

-   loading sound effects
-   sound pools
-   volume control
-   muting
-   cross browser playback abstraction

**Choose between Howler and direct Web Audio rather than automatically
using both.**

For this project:

-   **Prototype / simpler implementation:** Howler.js
-   **Highly tuned tactile audio system:** Web Audio API

Official site: https://howlerjs.com/

------------------------------------------------------------------------

### 13.4 Motion --- Optional React UI animation layer

Motion is useful for declarative React animations, gestures, layout
changes, springs, presence animations, and interface transitions.

Possible uses:

-   panel transitions
-   Ghostwriter prompt appearance
-   navigation
-   layout changes
-   drawers
-   overlays
-   general product UI motion

Official documentation: https://motion.dev/docs

### Important recommendation

If Anime.js already controls the typewriter and plume, avoid having
Motion control those same elements.

A clean ownership model would be:

``` text
Anime.js
    → expressive writing mechanics
    → typewriter
    → plume
    → paper
    → carriage

Motion
    → application UI
    → panels
    → menus
    → navigation
    → modal / presence transitions
```

Motion is optional. The product does not require it if Anime.js and CSS
already cover the broader interface.

------------------------------------------------------------------------

### 13.5 CSS Transitions and Keyframes --- Supporting layer

Do not use JavaScript animation for everything.

CSS is sufficient for:

-   hover states
-   focus states
-   simple opacity changes
-   button feedback
-   static texture treatment
-   reduced motion variants
-   uncomplicated UI transitions

This keeps the animation architecture lighter.

------------------------------------------------------------------------

### 13.6 requestAnimationFrame --- Low level coordination

Native `requestAnimationFrame()` can support any custom frame
synchronized behaviour that does not need a full library.

Possible uses:

-   measuring active cursor position
-   syncing manuscript movement
-   high frequency visual calculations
-   batching DOM reads and writes

Use it selectively. Anime.js should remain responsible for the majority
of authored motion.

------------------------------------------------------------------------

## 14. Recommended Library Ownership

  Requirement                 Recommended technology                   Priority
  --------------------------- ---------------------------------------- ----------
  Character impact            Anime.js                                 Core
  Character settle            Anime.js                                 Core
  Paper reaction              Anime.js                                 Core
  Carriage return             Anime.js timeline                        Core
  Plume movement              Anime.js / SVG                           Core
  Key sounds                  Web Audio API or Howler.js               Core
  General React transitions   Motion                                   Optional
  Hover / focus states        CSS                                      Core
  Text persistence            Existing application state               Core
  Autosave                    Existing Ghostwriter persistence layer   Core
  Precise DOM measurement     Browser APIs                             Core
  Reduced motion              CSS + application preference             Core

### Leanest recommended stack

For the first serious prototype:

``` text
React / existing application
        +
Anime.js
        +
Web Audio API
        +
CSS
```

If direct audio implementation becomes unnecessarily complex:

``` text
React / existing application
        +
Anime.js
        +
Howler.js
        +
CSS
```

Motion should be added only if the broader product UI benefits from it.

------------------------------------------------------------------------

## 15. Event Logic

A simplified event model:

``` text
onKeyDown(event)
    │
    ├── Is this a writing key?
    │       │
    │       ├── yes → allow editor to update immediately
    │       │          trigger strike visual
    │       │          trigger paper impulse
    │       │          trigger strike sound
    │       │          update typing rhythm metrics
    │       │
    │       └── no → evaluate shortcut / modifier
    │
    ├── Is Enter?
    │       └── trigger carriage sequence
    │
    ├── Is Backspace?
    │       └── trigger retract feedback
    │
    └── update behavioural signals
            │
            └── update plume state
```

### Do not intercept everything through `keydown`

Modern editors also need to account for:

-   `beforeinput`
-   `input`
-   composition events
-   IME input
-   paste
-   cut
-   selection
-   mobile keyboards
-   accessibility technologies

The animation system should observe the final editing behaviour rather
than assume that every text change originates from one physical keyboard
event.

------------------------------------------------------------------------

## 16. Typing Behaviour State Machine

A lightweight state model can make the plume and ambient mechanics feel
intelligent.

``` text
IDLE
 │
 ├── keypress → WRITING
 │
 ▼
WRITING
 │
 ├── sustained fast input → FLOW
 │
 ├── repeated deletion → REVISING
 │
 ├── short pause → THINKING
 │
 └── long pause → IDLE

FLOW
 │
 ├── speed decreases → WRITING
 │
 └── pause → THINKING

REVISING
 │
 ├── normal characters → WRITING
 │
 └── pause → THINKING

THINKING
 │
 ├── keypress → WRITING
 │
 └── extended pause → IDLE
```

This state machine should drive **expressive secondary behaviour**, not
change the writing functionality itself.

------------------------------------------------------------------------

## 17. Performance Principles

Typing is one of the most latency sensitive interactions in an
application.

### Rules

1.  Never delay text insertion for animation.
2.  Never queue every animation during fast typing.
3.  Prefer `transform` and `opacity` for frequent visual changes.
4.  Avoid repeatedly forcing layout calculations.
5.  Preload audio samples.
6.  Reuse animation targets where possible.
7.  Avoid rendering each character as an unnecessarily heavy React
    component.
8.  Measure performance with long paragraphs and fast typing.
9.  Test holding a key down.
10. Test paste operations separately from individual keystrokes.

### Performance target

The experience should still feel like a **fast editor first** and a
simulation second.

If users notice that the typewriter effect is slowing their thoughts
down, the implementation has failed.

------------------------------------------------------------------------

## 18. Accessibility

The physical metaphor should be optional rather than mandatory.

### Reduced motion

Respect:

`prefers-reduced-motion: reduce`

Reduced motion mode can:

-   remove paper shake
-   remove character scale impact
-   remove carriage movement
-   reduce plume motion
-   preserve only minimal opacity feedback

### Sound

Provide:

-   mute control
-   remembered sound preference
-   sensible default volume
-   no dependence on sound for functional information

### Keyboard and assistive technology

The underlying editor should retain standard keyboard and semantic
behaviour.

The decorative animation layer should not interfere with:

-   screen readers
-   focus order
-   keyboard navigation
-   selection
-   clipboard actions
-   browser shortcuts

------------------------------------------------------------------------

## 19. UX Risks

### Risk 1: Too much motion

**Symptom:** the page constantly shakes.

**Correction:** localize motion to the active character and immediate
writing surface.

### Risk 2: Artificial randomness

**Symptom:** letters look intentionally distressed.

**Correction:** reduce the variance until imperfection becomes
subconscious.

### Risk 3: Repetitive audio

**Symptom:** typing sounds like one sample being machine gunned.

**Correction:** use a small variation pool and restrained parameter
variation.

### Risk 4: Animation backlog

**Symptom:** visuals continue after the user has stopped typing.

**Correction:** animations must overlap, interrupt, or collapse during
high frequency input.

### Risk 5: Simulation over usability

**Symptom:** users fight the typewriter metaphor to edit text.

**Correction:** preserve modern editing conventions beneath the visual
metaphor.

### Risk 6: Plume becomes decorative clutter

**Symptom:** the plume constantly moves without communicating anything.

**Correction:** connect plume states to meaningful writing behaviour.

------------------------------------------------------------------------

## 20. Prototype Phases

### Phase 1 --- Character feel (implemented: active-line impulse)

The active line responds to eligible keystrokes and settles back to rest. The
text itself is not animated or delayed.

### Phase 2 --- Rhythm (implemented: key-specific response)

Letters, punctuation, spaces, and erase keys have distinct responses. Arrows,
modifiers, and shortcuts produce none; sustained typing reduces the response.
Sound remains unimplemented.

### Phase 3 --- Carriage (implemented: Return movement)

Return advances the line while the sheet moves once and its shadow deepens, then
settles. No bell or sound is played.

### Phase 4 --- Materiality (partial: sheet and shadow)

The paper and sheet are distinct surfaces, and the sheet has a resting shadow
that deepens on Return. Paper texture, ink variation, and character
imperfections are not adopted.

### Phase 5 --- Plume intelligence (not adopted; Plume unwired)

The Plume is retained in source but is not rendered. The native caret is the only
cursor in every view.

### Phase 6 --- Production hardening (partial; author comfort check pending)

Accessibility, reduced motion, keyboard editing, mobile behavior, autosave, and
browser regressions have been checked. The author still needs to assess comfort
in a real long writing session.

------------------------------------------------------------------------

## 21. Recommended Product Direction

The strongest version of this concept is **not a literal browser
recreation of an antique typewriter**.

It is a modern editorial workspace that borrows the typewriter's
strongest sensory qualities:

**impact + rhythm + materiality + ritual + focus**

The implementation should therefore follow four rules:

1.  **Input remains immediate.**
2.  **Motion communicates physical consequence.**
3.  **Sound creates rhythm rather than novelty.**
4.  **The plume communicates the writer's state.**

The resulting experience should make writing feel more intentional
without making the interface less capable.

------------------------------------------------------------------------

## 22. Proposed Experience Formula

``` text
Modern editor reliability
        +
Mechanical keystroke feedback
        +
Subtle material imperfection
        +
Rhythmic sound
        +
Carriage ritual
        +
Behaviour responsive plume
        =
Immersive digital writing experience
```

The success criterion is simple:

> The user should stop thinking about the animation and start feeling
> the act of writing.

------------------------------------------------------------------------

## 23. Reference Documentation

-   Anime.js Documentation --- https://animejs.com/documentation/
-   MDN Web Audio API ---
    https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
-   MDN Web Audio API Best Practices ---
    https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices
-   Howler.js --- https://howlerjs.com/
-   Motion Documentation --- https://motion.dev/docs
