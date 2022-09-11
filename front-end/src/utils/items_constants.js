import PaperArmor from '../images/armors/armure_carton.png';
import BronzeArmor from '../images/armors/armure_bronze.png';
import SilverArmor from '../images/armors/armure_argent.png';
import GoldArmor from '../images/armors/armure_or.png';
import StickWeapon from '../images/weapons/baton.png';
import WoodenSword from '../images/weapons/epee_bois.png';
import BronzeSword from '../images/weapons/epee_bronze.png';
import SilverSword from '../images/weapons/epee_argent.png';
import GoldenSword from '../images/weapons/epee_or.png';
import WoodenAxe from '../images/weapons/hache_bois.png';
import BronzeAxe from '../images/weapons/hache_bronze.png';
import SilverAxe from '../images/weapons/hache_argent.png';
import GoldenAxe from '../images/weapons/hache_or.png';
import WoodenMace from '../images/weapons/masse_bois.png';
import BronzeMace from '../images/weapons/masse_bronze.png';
import SilverMace from '../images/weapons/masse_argent.png';
import GoldenMace from '../images/weapons/masse_or.png';

export const BLOB_ARMORS = [ // order matters
    {
        name: "Cardboard armor",
        description: "Better than nothing",
        defense_power: 25,
        attack_power: 0,
        oatmeal_price: 0,
        image: PaperArmor,
    },
    {
        name: "Bronze armor",
        description: "Well manufactured first level armor",
        defense_power: 100,
        attack_power: 25,
        oatmeal_price: 20,
        image: BronzeArmor,
    },
    {
        name: "Silver armor",
        description: "High quality armor",
        defense_power: 400,
        attack_power: 50,
        oatmeal_price: 50,
        image: SilverArmor,
    },
    {
        name: "Gold armor",
        description: "Best blob armor, bright, light and strong",
        defense_power: 1000,
        attack_power: 100,
        oatmeal_price: 100,
        image: GoldArmor,
    },
]

export const WEAPONS_UPGRADE_PRICES = [10, 20, 50, 100];
export const WEAPONS_TYPES = {
    0: 'Initial',
    1: 'Sword',
    2: 'Axe',
    3: 'Mace',
}

export const BLOB_WEAPONS = [ // order matters
    {
        name: "Stick",
        type: 0,
        lvl: 0,
        description: "Better than nothing",
        defense_power: 0,
        attack_power: 25,
        image: StickWeapon,
    },
    {
        name: "Wooden sword",
        type: 1,
        lvl: 0,
        description: "Good training weapon",
        defense_power: 25,
        attack_power: 90,
        image: WoodenSword,
    },
    {
        name: "Bronze sword",
        type: 1,
        lvl: 1,
        description: "Reliable weapon",
        defense_power: 50,
        attack_power: 220,
        image: BronzeSword,
    },
    {
        name: "Silver sword",
        type: 1,
        lvl: 2,
        description: "High quality weapon",
        defense_power: 100,
        attack_power: 500,
        image: SilverSword,
    },
    {
        name: "Golden sword",
        type: 1,
        lvl: 3,
        description: "Best sword for a blob",
        defense_power: 250,
        attack_power: 1100,
        image: GoldenSword,
    },
    {
        name: "Wooden axe",
        type: 2,
        lvl: 0,
        description: "Training non lethal weapon",
        defense_power: 15,
        attack_power: 100,
        image: WoodenAxe,
    },
    {
        name: "Bronze axe",
        type: 2,
        lvl: 1,
        description: "Training non lethal weapon",
        defense_power: 25,
        attack_power: 245,
        image: BronzeAxe,
    },
    {
        name: "Silver axe",
        type: 2,
        lvl: 2,
        description: "High quality axe",
        defense_power: 50,
        attack_power: 550,
        image: SilverAxe,
    },
    {
        name: "Golden axe",
        type: 2,
        lvl: 3,
        description: "Best axe for a blob",
        defense_power: 125,
        attack_power: 1225,
        image: GoldenAxe,
    },
    {
        name: "Wooden mace",
        type: 3,
        lvl: 0,
        description: "Training non lethal weapon",
        defense_power: 0,
        attack_power: 115,
        image: WoodenMace,
    },
    {
        name: "Bronze mace",
        type: 3,
        lvl: 1,
        description: "Training non lethal weapon",
        defense_power: 0,
        attack_power: 270,
        image: BronzeMace,
    },
    {
        name: "Silver mace",
        type: 3,
        lvl: 2,
        description: "High quality mace",
        defense_power: 0,
        attack_power: 600,
        image: SilverMace,
    },
    {
        name: "Golden mace",
        type: 3,
        lvl: 3,
        description: "Best mace for a blob",
        defense_power: 0,
        attack_power: 1350,
        image: GoldenMace,
    },
]
