const products = [
  {
    id: "1",
    image: "https://picsum.photos/seed/nike-airmax90/400/400",
    name: "Nike Air Max 90",
    details: "Classic design with premium materials",
    price: 95
  },
  {
    id: "2",
    image: "https://picsum.photos/seed/nike-airforce1/400/400",
    name: "Nike Air Force 1 '07",
    details: "Timeless style with all-day comfort",
    price: 75
  },
  {
    id: "3",
    image: "https://picsum.photos/seed/nike-revolution6/400/400",
    name: "Nike Revolution 6",
    details: "Lightweight running shoes for daily wear",
    price: 55
  },
  {
    id: "4",
    image: "https://picsum.photos/seed/nike-pegasus39/400/400",
    name: "Nike Pegasus 39",
    details: "Responsive cushioning for long runs",
    price: 105
  },
  {
    id: "5",
    image: "https://picsum.photos/seed/nike-blazer-mid/400/400",
    name: "Nike Blazer Mid '77",
    details: "Retro basketball style with modern comfort",
    price: 85
  },
  {
    id: "6",
    image: "https://picsum.photos/seed/nike-infinity-run/400/400",
    name: "Nike React Infinity Run Flyknit",
    details: "Supportive running shoe with plush cushioning",
    price: 125
  },
  {
    id: "7",
    image: "https://picsum.photos/seed/nike-metcon8/400/400",
    name: "Nike Metcon 8",
    details: "Durable training shoe built for high-intensity workouts",
    price: 115
  },
  {
    id: "8",
    image: "https://picsum.photos/seed/nike-tanjun/400/400",
    name: "Nike Tanjun",
    details: "Lightweight casual sneakers",
    price: 60
  },
  {
    id: "9",
    image: "https://picsum.photos/seed/nike-zoomfly5/400/400",
    name: "Nike Zoom Fly 5",
    details: "Speed-oriented running shoe",
    price: 140
  },
  {
    id: "10",
    image: "https://picsum.photos/seed/nike-court-vision/400/400",
    name: "Nike Court Vision Low",
    details: "Basketball-inspired casual sneakers",
    price: 65
  },
  {
    id: "11",
    image: "https://picsum.photos/seed/nike-airzoom-structure/400/400",
    name: "Nike Air Zoom Structure 24",
    details: "Stable running shoe with firm cushioning",
    price: 110
  },
  {
    id: "12",
    image: "https://picsum.photos/seed/nike-vaporfly-next/400/400",
    name: "Nike Vaporfly NEXT% 2",
    details: "Elite racing shoe for maximum speed",
    price: 225
  }
];


  
export const getAllProducts = () => {
  return products;
}
  
export const getProductById = (id) => {
  const found = products.find(product => product.id === id);
  return found;
}