export interface MenuItem {
  id: string;
  name: string;
  price: string;
  description?: string;
  badge?: string;
}

export interface MenuCategory {
  id: string;
  name: string;
  stickerLabel: string;
  image: string;
  imageAlt: string;
  items: MenuItem[];
}

export const MENU_CATEGORIES: MenuCategory[] = [
  {
    id: "gravy",
    name: "GRAVY",
    stickerLabel: "GRAVY",
    image: "/assets/menu/gravy.webp",
    imageAlt: "Rich Chicken Tikka Masala Gravy Bowl",
    items: [
      { id: "g1", name: "Chicken Tikka Masala", price: "[PRICE]" },
      { id: "g2", name: "Chicken Karai", price: "[PRICE]" },
      { id: "g3", name: "Chicken Butter Masala", price: "[PRICE]" },
      { id: "g4", name: "Do Peyaza", price: "[PRICE]" },
      { id: "g5", name: "Brain Masala", price: "[PRICE]" },
      { id: "g6", name: "Brain Fry", price: "[PRICE]" },
      { id: "g7", name: "Palang Paneer", price: "[PRICE]" },
      { id: "g8", name: "Mutter Paneer", price: "[PRICE]" },
      { id: "g9", name: "Paneer Butter Masala", price: "[PRICE]" },
    ],
  },
  {
    id: "rice-platters",
    name: "RICE PLATTERS",
    stickerLabel: "RICE PLATTERS",
    image: "/assets/menu/biryani.webp",
    imageAlt: "Fragrant South Asian Chicken Biryani",
    items: [
      { id: "r1", name: "Chicken Biryani", price: "[PRICE]" },
      { id: "r2", name: "Hyderabadi Biryani(Chicken)", price: "[PRICE]" },
      { id: "r3", name: "Hyderabadi Biryani(Beef)", price: "[PRICE]" },
      { id: "r4", name: "Beef Biryani", price: "[PRICE]" },
      { id: "r5", name: "Chicken Pulao", price: "[PRICE]" },
    ],
  },
  {
    id: "add-ons",
    name: "ADD ONS",
    stickerLabel: "ADD ONS",
    image: "/assets/menu/naan.webp",
    imageAlt: "Freshly Baked Tandoori Naan",
    items: [
      { id: "a1", name: "Plain Nan", price: "[PRICE]" },
      { id: "a2", name: "Butter Nan", price: "[PRICE]" },
      { id: "a3", name: "Garlic Nan", price: "[PRICE]" },
      { id: "a4", name: "Lassa Parata", price: "[PRICE]" },
      { id: "a5", name: "Masala Kulcha", price: "[PRICE]" },
      { id: "a6", name: "Jira polao", price: "[PRICE]" },
      { id: "a7", name: "Chicken Roast", price: "[PRICE]" },
    ],
  },
  {
    id: "snacks",
    name: "SNACKS",
    stickerLabel: "SNACKS",
    image: "/assets/menu/hero-shawarma.webp",
    imageAlt: "Classic Grilled Chicken Shawarma",
    items: [
      { id: "s1", name: "Classic Shawarma", price: "[PRICE]" },
      { id: "s2", name: "Cheese Shawarma", price: "[PRICE]" },
      { id: "s3", name: "Alu parata", price: "[PRICE]" },
      { id: "s4", name: "Chicken Parata", price: "[PRICE]" },
      { id: "s5", name: "Samusa Chat", price: "[PRICE]" },
      { id: "s6", name: "Pau Bhaji", price: "[PRICE]" },
    ],
  },
  {
    id: "kabab-grills",
    name: "KABAB & GRILLS",
    stickerLabel: "KABAB & GRILLS",
    image: "/assets/menu/kabab.webp",
    imageAlt: "Charcoal Grilled Kabab Platter",
    items: [
      { id: "k1", name: "Chicken Tikka", price: "[PRICE]" },
      { id: "k2", name: "Chicken Tandoori", price: "[PRICE]" },
      { id: "k3", name: "Reshmi Kabab", price: "[PRICE]" },
      { id: "k4", name: "Hariyali Kabab", price: "[PRICE]" },
      { id: "k5", name: "Boti Kabab (Chicken)", price: "[PRICE]" },
      { id: "k6", name: "Boti Kabab (Beef)", price: "[PRICE]" },
      { id: "k7", name: "Chicken Chap", price: "[PRICE]" },
      { id: "k8", name: "Beef Chap", price: "[PRICE]" },
    ],
  },
];
