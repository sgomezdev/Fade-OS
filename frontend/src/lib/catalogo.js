export const servicios = [
  { nombre: "Corte", precio: 25000, preciosPorBarbero: { 1: 30000 } },
  { nombre: "Corte + barba", precio: 35000, preciosPorBarbero: { 1: 40000 } },
  { nombre: "Manhattan Silver", precio: 45000},
  { nombre: "Manhattan Gold", precio: 50000},
   { nombre: "Manhattan Black", precio: 60000},
  { nombre: "Barba", precio: 16000 },
  { nombre: "Cejas", precio: 8000 },
  { nombre: "Cerquillo", precio: 8000 },
];

export const bebidas = [
  { nombre: "Stella Artois", precio: 6000, imagen: "/img/stella.png" },
  { nombre: "Modelo", precio: 8000, imagen: "/img/modelo.png" },
  { nombre: "Gatorade", precio: 5000, imagen: "/img/gatorade.png" },
];

export const capilares = [
  { nombre: "Cera Gold", precio: 32000 },
  { nombre: "Cera Platino", precio: 32000 },
  { nombre: "Cera Red", precio: 35000 },
  { nombre: "Cera Blue", precio: 35000 },
  { nombre: "Cera Kids", precio: 35000 },
  { nombre: "Shampoo Trichogen", precio: 36000 },
  { nombre: "Pomada Barba", precio: 36000 },
  { nombre: "Shampoo Trichogen", precio: 36000 },
  { nombre: "Trichogen", precio: 48000 },

];

export function precioPara(item, barberoId) {
  return item.preciosPorBarbero?.[barberoId] ?? item.precio;
}