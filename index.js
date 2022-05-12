/// <reference types="../CTAutocomplete" />
/// <reference lib="es2015" />
import Settings from "./config"
import { request } from "requestV2"
import { Promise } from "PromiseV2"
import { gui, saveData, killTime } from "./constants"
import {
    AdditiveConstraint,
    animate,
    Animations,
    ConstantColorConstraint,
    SiblingConstraint,
    UIRoundedRectangle,
    UIImage,
    Window,
    UIText,
    ChildBasedSizeConstraint,
    ChildBasedMaxSizeConstraint,
    ChildBasedRangeConstraint,
    CenterConstraint
} from "../Elementa";

const File = Java.type("java.io.File");
const Color = Java.type("java.awt.Color");
const mainHUD = new Window();
let guiIsSelected = false;

// pass on events to Elementa
this.gui.registerDraw((x, y) => this.mainHUD.draw());
this.gui.registerClicked((x, y, b) => this.mainHUD.mouseClick(x, y, b));
this.gui.registerMouseDragged((x, y, b) => this.mainHUD.mouseDrag(x, y, b));
this.gui.registerScrolled((x, y, s) => this.mainHUD.mouseScroll(s));
this.gui.registerMouseReleased((x, y, b) => this.mainHUD.mouseRelease());

// change the color of the screen to indicate that the user is in the GUI
function guiMover() {
    if (gui.isOpen()) {
        Renderer.drawRect(
            Renderer.color(0, 0, 0, 70),
            0,
            0,
            Renderer.screen.getWidth(),
            Renderer.screen.getHeight()
        );
    }
}

if (Settings.saveData !== "") {
    saveData = JSON.parse(Settings.saveData);
}

if (!Settings.firstRun) {
    const image1 = new Image("bladesoul.png", "https://dawjaw.net/static/bladesoul.png");
    const image2 = new Image("ashfang.png", "https://dawjaw.net/static/ashfang.png");
    const image3 = new Image("mage.png", "https://dawjaw.net/static/mage.png");
    const image4 = new Image("duke.png", "https://dawjaw.net/static/duke.png");
    Settings.firstRun = true;

    ChatLib.chat("§eWelcome to MinibossTimer!§r");
    ChatLib.chat("§2You can open the settigns via /mbt§r");
    ChatLib.chat("§2Move the HUD via /minibosstimerhud§r");
    ChatLib.chat("§2Ashfang kills dont seem to get properly tracked by hypixel and the value might not represent your actual killcount§r");
}

const BLADESOUL_IMAGE = new File(`config/ChatTriggers/images/bladesoul.png`);
const ASHFANG_IMAGE = new File(`config/ChatTriggers/images/ashfang.png`);
const MAGE_IMAGE = new File(`config/ChatTriggers/images/mage.png`);
const DUKE_IMAGE = new File(`config/ChatTriggers/images/duke.png`);

const IMAGES = [BLADESOUL_IMAGE, ASHFANG_IMAGE, MAGE_IMAGE, DUKE_IMAGE];


// im using ticks bc it seems like its not basd on time but on ticks
register('chat', (key) => {
    let changed = true;
    switch (key.trim()) {
        case "MAGE OUTLAW DOWN!":
            saveData.kills_mage += 1;
            killTime.mage = World.getTime() + 2400;
            break;
        case "BARBARIAN DUKE X DOWN!":
            saveData.kills_duke += 1;
            killTime.duke = World.getTime() + 2400;
            break;
        case "BLADESOUL DOWN!":
            saveData.kills_bladesoul += 1;
            killTime.bladesoul = World.getTime() + 2400;
            break;
        case "ASHFANG DOWN!":
            saveData.kills_ashfang += 1;
            killTime.ashfang = World.getTime() + 2400;
            break;
        default:
            changed = false;
            break;
    }
    if (changed) {
        Settings.saveData = JSON.stringify(saveData);
        Settings.save();
    }
}).setCriteria("${key}");

function createHUDOverlay() {
    const dragOffset = { x: 0, y: 0 };

    const mainUIContainer = new UIRoundedRectangle(3)
        .setX((Settings.x).pixels())
        .setY((Settings.y).pixels())
        .setWidth(new AdditiveConstraint(new ChildBasedSizeConstraint(), (48).pixels()))
        .setHeight(new AdditiveConstraint(new ChildBasedRangeConstraint(), (5).pixels()))
        .setColor(new ConstantColorConstraint(new Color(207 / 255, 207 / 255, 196 / 255, 0.3)));

    IMAGES.forEach(image => {
        const image1 = UIImage.Companion.ofFile(image)
            .setX((5).pixels())
            .setY(new AdditiveConstraint(new SiblingConstraint(), (3).pixels()))
            .setWidth((12).pixels())
            .setHeight((24).pixels())
            .setChildOf(mainUIContainer);

        const textElement = new UIText(saveData[`kills_${image.getName().split(".")[0]}`])
            .setX(new AdditiveConstraint(new SiblingConstraint(), (20).pixels()))
            .setY(new AdditiveConstraint(new SiblingConstraint(), (10).pixels()))
            .setChildOf(image1);

        textElement.startTimer(1, 0, function updateText() {
            textElement.setText(saveData[`kills_${image.getName().split(".")[0]}`]);
        });

        timeUntilSpawn = killTime[image.getName().split(".")[0]];
        timeUntilSpawn -= World.getTime();
        timeUntilSpawn*=50;
        if (timeUntilSpawn < 0) timeUntilSpawn = 0;
        let timeString = "";
        if (timeUntilSpawn > 60000) {
            timeString = `${Math.floor(timeUntilSpawn / 60000)}m ${Math.floor(timeUntilSpawn % 60000 / 1000)}s`;
        } else {
            timeString = `${Math.floor(timeUntilSpawn / 1000)}s`;
        }

        const textElement2 = new UIText(`${timeString || "0s"}`)
            .setX(new AdditiveConstraint(new SiblingConstraint(), (35).pixels()))
            .setY(new AdditiveConstraint(new SiblingConstraint(), (0).pixels()))
            .setChildOf(textElement);

        textElement2.startTimer(1, 0, function updateText() {
            timeUntilSpawn = killTime[image.getName().split(".")[0]];
            timeUntilSpawn -= World.getTime();
            timeUntilSpawn*=50;
            if (timeUntilSpawn < 0) timeUntilSpawn = 0;
            let timeString = "";
            if (timeUntilSpawn > 60000) {
                timeString = `${Math.floor(timeUntilSpawn / 60000)}m ${Math.floor(timeUntilSpawn % 60000 / 1000)}s`;
            } else {
                timeString = `${Math.floor(timeUntilSpawn / 1000)}s`;
            }
            textElement2.setText(timeString);
        });
    });

    mainUIContainer
        .onMouseClick((comp, event) => {
            guiIsSelected = true;
            dragOffset.x = event.absoluteX;
            dragOffset.y = event.absoluteY;
        })
        .onMouseRelease(() => {
            guiIsSelected = false;
        })
        .onMouseDrag((comp, mx, my) => {
            if (!guiIsSelected) return;
            const absoluteX = mx + comp.getLeft();
            const absoluteY = my + comp.getTop();
            const dx = absoluteX - dragOffset.x;
            const dy = absoluteY - dragOffset.y;
            dragOffset.x = absoluteX;
            dragOffset.y = absoluteY;
            const newX = mainUIContainer.getLeft() + dx;
            const newY = mainUIContainer.getTop() + dy;
            mainUIContainer.setX(newX.pixels());
            mainUIContainer.setY(newY.pixels());
            Settings.x = newX;
            Settings.y = newY;
            Settings.save();
        })
        .onMouseLeave((comp) => {
            if (!gui.isOpen()) return;
            animate(comp, (animation) => {
                animation.setColorAnimation(
                    Animations.OUT_EXP,
                    0.5,
                    new ConstantColorConstraint(
                        new Color(207 / 255, 207 / 255, 196 / 255, 0.3)
                    )
                );
            });
        })
        .onMouseEnter((comp) => {
            if (!gui.isOpen()) return;
            animate(comp, (animation) => {
                animation.setColorAnimation(
                    Animations.OUT_EXP,
                    0.5,
                    new ConstantColorConstraint(
                        new Color(255 / 255, 255 / 255, 0 / 255)
                    ),
                    0
                );
            });
        })
    return mainUIContainer;
}

// initial gui setup
let foregroundHUD = createHUDOverlay();
let hidden = false;
mainHUD.addChildren(foregroundHUD);

register('renderOverlay', () => {
    guiMover();
    if (Settings.enabled) {
        if (hidden) {
            hidden = false;
            foregroundHUD = createHUDOverlay();
            mainHUD.addChildren(foregroundHUD);
        }
    } else {
        if (!hidden) {
            hidden = true;
            mainHUD.removeChild(foregroundHUD);
            foregroundHUD = null;
        }
    }
    mainHUD.draw();
});

register('step', () => {
    if(!World.isLoaded()) return;
    TabList?.getNames()?.forEach(tab => {
        if (ChatLib.removeFormatting(tab).includes("Area:")) {
            const area = ChatLib.removeFormatting(tab).split(" ")[1];
            if(area !== "Crimson") {
                killTime = {
                    mage: 0,
                    duke: 0,
                    bladesoul: 0,
                    ashfang: 0
                };
            }
        }
    });
}).setDelay(5);

const MENU_TITLES = ["Crimson Isle ➜ Ashfang", "Crimson Isle ➜ Bladesoul", "Crimson Isle ➜ Barbarian Duke X", "Crimson Isle ➜ Mage Outlaw"];
const MENU_TITLES_TO_CREATURES = {"Crimson Isle ➜ Ashfang": "ashfang", "Crimson Isle ➜ Bladesoul": "bladesoul", "Crimson Isle ➜ Barbarian Duke X": "duke", "Crimson Isle ➜ Mage Outlaw": "mage"};
const ITEM_NAME_TO_CREATURE = {"[lv200] ashfang": "ashfang", "[lv200] bladesoul": "bladesoul", "[lv200] barbarian duke x": "duke", "[lv200] mage outlaw": "mage"};

register('step', () => {
    const MENU_TITLE = Player.getContainer().getName().trim();
    if (MENU_TITLES.includes(MENU_TITLE)) {
        Player.getContainer().getItems().forEach(child => {
            if (!child?.getName()?.toLowerCase()) return;
            const CREATURE = ChatLib.removeFormatting(child?.getName()?.toLowerCase().trim());
            if(MENU_TITLES_TO_CREATURES[MENU_TITLE] === ITEM_NAME_TO_CREATURE[CREATURE]) {
                saveData[`kills_${ITEM_NAME_TO_CREATURE[CREATURE]}`] = ChatLib.removeFormatting(child?.getLore()[4]).trim().split(" ")[1];
                Settings.saveData = JSON.stringify(saveData);
                Settings.save();
            }
        });
    }
}).setFps(5);

register('chat', (key) => {
    Settings.apiKey = key;
    Settings.save();
    ChatLib.chat("§eSet api key!§r")
    ChatLib.command("ct load", true);
}).setCriteria("Your new API key is ${key}");

register('step', () => {
    updateAPIStats();
}).setDelay(240);

const sendRequest = (url) => {
    const returnedPromise = request({
        url,
        headers: {
            "User-Agent": "Mozilla/5.0 (ChatTriggers)"
        }
    });
    return new Promise((resolve, reject) => {
        returnedPromise.then((response) => resolve(JSON.parse(response))).catch((error) => reject(error));
    });
}

let oldUpdateData = undefined;
function updateAPIStats() {
    if (Settings.apiKey === "") return;
    let uuid = Player.getUUID();
    let shortUUID = uuid.split("-").join("");

    sendRequest('https://api.hypixel.net/skyblock/profiles?key=' + Settings.apiKey + '&uuid=' + uuid)
    .then(json => {
        if (json.profiles === undefined) {
            ChatLib.chat("&4Couldn't find any Skyblock profiles for this player.§r");
        }
        let last_time = 0;
        let profile_in_use;
        json.profiles.forEach(response => {
            if (last_time < response.members[shortUUID].last_save) {
                last_time = response.members[shortUUID].last_save
                profile_in_use = response.members[shortUUID];
            }
        });
        let totalClientKills = saveData.kills_bladesoul + saveData.kills_duke + saveData.kills_mage + saveData.kills_ashfang;
        let totalServerKills = profile_in_use['stats']['kills_bladesoul'] || 0 + profile_in_use['stats']['kills_duke'] || 0 + profile_in_use['stats']['kills_mage'] || 0 + profile_in_use['stats']['kills_ashfang'] || 0; 
        if(oldUpdateData === undefined) {
            oldUpdateData = profile_in_use;
        } else if(oldUpdateData.last_save !== profile_in_use.last_save && totalServerKills >= totalClientKills) {
            saveData.kills_bladesoul = profile_in_use['stats']['kills_bladesoul'] || 0;
            saveData.kills_mage = profile_in_use['stats']['kills_mage_outlaw'] || 0;
            saveData.kills_duke = profile_in_use['stats']['kills_barbarian_duke_x'] || 0;
            saveData.kills_ashfang = profile_in_use['stats']['kills_ashfang'] || 0;
            Settings.saveData = JSON.stringify(saveData);
            Settings.save();
        }
    }).catch(err => {
        console.log(err);
    });
}
updateAPIStats();

register("command", () => GuiHandler.openGui(gui)).setName("minibosstimerhud");

if(Settings.apiKey === "") {
    ChatLib.chat("&4You need to set an api key!§r");
    ChatLib.chat("&eUse '/mbt key <yourkey>' to set your api key§r");
}

register("command", (arg1, arg2) => {
    if (!arg1 && !arg2) Settings.openGUI();
    if (arg1 === "key" && arg2 !== undefined && arg2.length === 36) {
        Settings.apiKey = arg2;
        Settings.save();
        ChatLib.chat("§eSet api key!§r")
        ChatLib.command("ct load", true);
    } else if (arg1 === "key" && arg2 === undefined) ChatLib.chat("§eInvalid command usage or invalid key§r");
}).setName("mbt");
