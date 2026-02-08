# MTG Anki Templates

A collection of Anki templates for studying Magic: The Gathering cards. Each template occludes specific card regions with color-coded overlays matched to the card's color identity.

[Live Demo](https://cahrehn.github.io/mtg-anki-templates/)

## Templates

### Text Box Occlusion

Occludes the rules text box. Works for creatures, instants, sorceries, and sagas.

- [mtg-text-box-front.html](mtg-text-box-front.html) - Front template with text box occlusion
- [mtg-text-box-back.html](mtg-text-box-back.html) - Back template showing full card
- [mtg-text-box.css](mtg-text-box.css) - Styling

**Fields:** `UUID`, `Front`

### Adventure Cards

Cloze template for adventure cards. Cloze 1 occludes the adventure text, Cloze 2 occludes the permanent type.

- [mtg-adventure-front.html](mtg-adventure-front.html) - Front template with adventure/permanent occlusions
- [mtg-adventure.css](mtg-adventure.css) - Styling

**Fields:** `UUID`, `Text` (cloze)

### Double-Faced Cards

Shows both faces side by side. Cloze 1 occludes the front face rules text, Cloze 2 occludes the back face.

- [mtg-dfc-front.html](mtg-dfc-front.html) - Front template with dual-face occlusions
- [mtg-dfc-back.html](mtg-dfc-back.html) - Back template showing both faces
- [mtg-dfc.css](mtg-dfc.css) - Styling

**Fields:** `UUID`, `Text` (cloze)

### Split / Room Cards

Rotated 90 degrees for landscape display. Cloze 1 occludes the left half's rules text, Cloze 2 occludes the right half.

- [mtg-split-front.html](mtg-split-front.html) - Front template with split occlusions
- [mtg-split-back.html](mtg-split-back.html) - Back template showing full card
- [mtg-split.css](mtg-split.css) - Styling

**Fields:** `UUID`, `Text` (cloze)

## Color Coding

Occlusion colors match the card's color identity:

- White (W): Light yellow
- Blue (U): Light blue
- Black (B): Dark gray
- Red (R): Light red
- Green (G): Light green
- Multicolor (2 colors): Gradient
- Multicolor (3+): Gold
- Colorless: Light brown

## Installation

1. Open Anki
2. Go to Tools → Manage Note Types
3. Click "Add" → "Add: Basic" (or "Add: Cloze" for adventure/DFC/split templates)
4. Click "Fields..." and add a `UUID` field
5. Click "Cards..." and copy the HTML from the template files into the front/back template areas
6. Click "Styling..." and paste the CSS
7. Save and close

## Usage

1. Create a new note using the appropriate template
2. Find your card on [Scryfall](https://scryfall.com)
3. Copy the card's UUID from the URL (e.g., `https://scryfall.com/card/set/123/<uuid>`)
4. Paste the UUID into the `UUID` field
5. The card image will be fetched automatically when you review the card

## License

**Code & Templates:** MIT License - See [LICENSE](LICENSE) file for details.

**Magic: The Gathering Content:** All MTG card images, names, and game content are © Wizards of the Coast. This project uses the [Scryfall API](https://scryfall.com) to fetch card images. Card images are used under Wizards of the Coast's [Fan Content Policy](https://company.wizards.com/en/legal/fancontentpolicy).
