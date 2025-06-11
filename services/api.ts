export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  serialNumber: string;
}

const mockProducts: Record<string, Product> = {
  '123456789012': {
    id: '123456789012',
    name: 'Premium Coffee Beans',
    price: 19.99,
    image: 'https://example.com/coffee.jpg',
    serialNumber: '123456789012'
  },
  '987654321098': {
    id: '987654321098',
    name: 'Organic Tea',
    price: 12.99,
    image: 'https://example.com/tea.jpg',
    serialNumber: '987654321098'
  },
  '456789123456': {
    id: '456789123456',
    name: 'Fresh Milk',
    price: 3.99,
    image: 'https://example.com/milk.jpg',
    serialNumber: '456789123456'
  }
};

export const getProductBySerial = (serialNumber: string): Product | null => {
  return mockProducts[serialNumber] || null;
};

export const getProducts = (): Product[] => {
  return Object.values(mockProducts);
};
