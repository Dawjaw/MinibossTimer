import { @Vigilant, @SliderProperty @SwitchProperty @NumberProperty @TextProperty @ButtonProperty } from 'Vigilance';
import { gui } from "./constants";

@Vigilant("MinibossTimer")
class Settings {
    @SwitchProperty({
        name: "firstRun",
        description: "state of the first run",
        category: "General",
        hidden: true
    })
    firstRun = false;

    @SwitchProperty({
        name: "Enabled",
        description: "Enable or Disable the module",
        category: "General",
    })
    enabled = true;

    @ButtonProperty({
        name: 'Move GUI',
        description: 'Move the GUI around',
        category: 'General',
        placeholder: 'Click!',
    })
    moveToolInfo() {
        gui.open();
    }

    @NumberProperty({
        name: "x",
        description: "x location on screen",
        category: "General",
        hidden: true,
    })
    x = 10;

    @NumberProperty({
        name: "y",
        description: "y location on screen",
        category: "General",
        hidden: true,
    })
    y = 10;

    @TextProperty({
        name: "Save Data",
        description: "Save Data",
        category: "General",
        hidden: true,
    })
    saveData = "";

    @TextProperty({
        name: "apiKey",
        description: "apiKey",
        category: "General",
        hidden: true,
    })
    apiKey = "";

    constructor() {
        this.initialize(this);
        this.setCategoryDescription("General", "")
    }
}

export default new Settings();