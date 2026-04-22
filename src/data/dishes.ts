export interface Dish {
  id: string;
  name: string;
  description: string;
  price: number;
  category: "tacos" | "bebidas" | "entradas" | "postres";
}

export const dishes: Dish[] = [
  {
    id: "1",
    name: "Tacos al Pastor",
    description:
      "Tres tacos de cerdo marinado con piña, cilantro y cebolla en tortilla de maíz.",
    price: 12.5,
    category: "tacos",
  },
  {
    id: "2",
    name: "Quesadilla de Flor de Calabaza",
    description:
      "Tortilla de harina con queso fundido y flor de calabaza fresca, ideal para vegetarianos.",
    price: 9.0,
    category: "tacos",
  },
  {
    id: "3",
    name: "Guacamole con Totopos",
    description:
      "Aguacate fresco machacado con tomate, cebolla, chile serrano y un toque de limón. Servido con totopos crujientes.",
    price: 8.5,
    category: "entradas",
  },
  {
    id: "4",
    name: "Agua de Horchata",
    description:
      "Bebida refrescante de arroz con canela y vainilla. Muy dulce y fría.",
    price: 3.5,
    category: "bebidas",
  },
  {
    id: "5",
    name: "Tacos de Cochinita Pibil",
    description:
      "Cerdo deshebrado marinado en achiote y naranja agria, servido con cebolla morada curtida.",
    price: 13.0,
    category: "tacos",
  },
];
