# MTG Anki Templates

A collection of Anki templates for studying Magic: The Gathering cards.

## Templates

### MTG Text Box Occlusion

This template creates flashcards that occlude the rules text box on MTG cards. The template:

- Fetches card images from Scryfall API using card UUID
- Dynamically occludes the text box area on the front of the card
- Colors the occlusion based on the card's color identity (W/U/B/R/G/multicolor)
- Reveals the full card on the back

**Files:**
- [mtg-text-box-front.html](mtg-text-box-front.html) - Front template with text box occlusion
- [mtg-text-box-back.html](mtg-text-box-back.html) - Back template showing full card
- [mtg-text-box.css](mtg-text-box.css) - Shared styling

**Required Fields:**
- `UUID` - Scryfall card UUID
- `Front` - Card name or identifier (hidden on front)

**Color Coding:**
- White (W): Light yellow
- Blue (U): Light blue
- Black (B): Dark gray
- Red (R): Light red
- Green (G): Light green
- Colorless: Light brown
- Multicolor: Gold

## Installation

1. Open Anki
2. Go to Tools → Manage Note Types
3. Click "Add" → "Add: Basic"
4. Click "Fields..." and add a `UUID` field
5. Click "Cards..." and copy the HTML from the template files into the front/back template areas
6. Click "Styling..." and paste the CSS from `mtg-text-box.css`
7. Save and close

## Usage

1. Create a new note using the MTG Text Box template
2. Find your card on [Scryfall](https://scryfall.com)
3. Copy the card's UUID from the URL (e.g., `https://scryfall.com/card/set/123/<uuid>`)
4. Paste the UUID into the `UUID` field
5. Optionally add the card name to the `Front` field for reference

The card image will be fetched automatically when you review the card.

## License

**Code & Templates:** MIT License - See [LICENSE](LICENSE) file for details.

**Magic: The Gathering Content:** All MTG card images, names, and game content are © Wizards of the Coast. This project uses the [Scryfall API](https://scryfall.com) to fetch card images. Card images are used under Wizards of the Coast's [Fan Content Policy](https://company.wizards.com/en/legal/fancontentpolicy).
