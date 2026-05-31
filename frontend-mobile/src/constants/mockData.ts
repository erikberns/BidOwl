export interface AuctionItem {
  id: string;
  index: number;
  title: string;
  basePrice: string;
  image: any;
  owner: string;
  details: string;
  bids: Array<{
    name: string;
    time: string;
    amount: string;
    isLead: boolean;
  }>;
}

export interface Auction {
  id: string;
  title: string;
  category: string;
  location: string;
  date: string;
  time: string;
  image: any;
  itemCount: number;
  description: string;
  auctioneer: string;
  auctioneerAvatar: any;
}

export const MOCK_AUCTIONS: Auction[] = [
  {
    id: '1',
    title: 'Subasta de Colección Original "Rolling Stone"',
    category: 'MÚSICA · COMÚN',
    location: 'Pilar',
    date: '15 / 4 / 2026',
    time: '18:30 UDT-3',
    image: require('@/assets/images/rolling_stone_auction.png'),
    itemCount: 5,
    description: 'Presentamos una oportunidad excepcional para acceder a una cuidada selección de ejemplares originales de una de las revistas más influyentes en la historia de la música, el entretenimiento y la cultura contemporánea. Esta colección reúne ediciones emblemáticas que capturan momentos únicos de la historia del rock.',
    auctioneer: 'Agustin Blanco Vocos',
    auctioneerAvatar: require('@/assets/images/auctioneer_avatar.png'),
  },
  {
    id: '2',
    title: 'Colección Vintage Guitarras Gibson & Fender',
    category: 'MÚSICA · COMÚN',
    location: 'Tigre',
    date: '20 / 4 / 2026',
    time: '19:00 UDT-3',
    image: require('@/assets/images/rolling_stone_auction.png'),
    itemCount: 4,
    description: 'Una venta exclusiva de instrumentos vintage cuidadosamente seleccionados por luthiers profesionales. Esta colección cuenta con piezas históricas de las dos marcas más icónicas en el mundo de las guitarras eléctricas, Gibson y Fender, que definieron el sonido de generaciones.',
    auctioneer: 'Agustin Blanco Vocos',
    auctioneerAvatar: require('@/assets/images/auctioneer_avatar.png'),
  },
];

export const MOCK_AUCTION_ITEMS: Record<string, AuctionItem[]> = {
  '1': [
    { 
      id: 'item-1',
      index: 1, 
      title: 'Guitarra de Keith Richards', 
      basePrice: '1.000.000 ARS', 
      image: require('@/assets/images/rolling_stone_auction.png'),
      owner: 'Agustin Blanco Vocos',
      details: 'Guitarra eléctrica utilizada por Keith Richards durante las sesiones de grabación. Conservada en estuche rígido original y con certificado de autenticidad.',
      bids: [
        { name: 'Erik Bernz', time: 'Hace 4 minutos', amount: '1.155.000 AR$', isLead: true },
        { name: 'Erik Bernz', time: 'Hace 4 minutos', amount: '1.155.000 AR$', isLead: false },
        { name: 'Erik Bernz', time: 'Hace 4 minutos', amount: '1.155.000 AR$', isLead: false },
        { name: 'Erik Bernz', time: 'Hace 6 minutos', amount: '1.100.000 AR$', isLead: false },
        { name: 'Juan Perez', time: 'Hace 8 minutos', amount: '1.080.000 AR$', isLead: false },
        { name: 'Erik Bernz', time: 'Hace 10 minutos', amount: '1.050.000 AR$', isLead: false },
        { name: 'Claudio Gomez', time: 'Hace 12 minutos', amount: '1.020.000 AR$', isLead: false },
        { name: 'Juan Perez', time: 'Hace 15 minutos', amount: '1.000.000 AR$', isLead: false },
      ]
    },
    { 
      id: 'item-2',
      index: 2, 
      title: 'Bajo Original de Bill Wyman', 
      basePrice: '850.000 ARS', 
      image: require('@/assets/images/rolling_stone_auction.png'),
      owner: 'Agustin Blanco Vocos',
      details: 'Un bajo eléctrico histórico utilizado en giras mundiales. Conservado en perfectas condiciones y certificado por la banda.',
      bids: [
        { name: 'Juan Perez', time: 'Hace 2 minutos', amount: '920.000 AR$', isLead: true },
        { name: 'Claudio Gomez', time: 'Hace 5 minutos', amount: '890.000 AR$', isLead: false },
        { name: 'Juan Perez', time: 'Hace 8 minutos', amount: '870.000 AR$', isLead: false },
        { name: 'Maria Lopez', time: 'Hace 10 minutos', amount: '850.000 AR$', isLead: false },
      ]
    },
    { 
      id: 'item-3',
      index: 3, 
      title: 'Disco de Platino Firmado 1978', 
      basePrice: '500.000 ARS', 
      image: require('@/assets/images/rolling_stone_auction.png'),
      owner: 'Agustin Blanco Vocos',
      details: 'Premio oficial de disco de platino otorgado por ventas récord en 1978. Autografiado individualmente por Mick Jagger, Keith Richards, y Ron Wood.',
      bids: [
        { name: 'Maria Lopez', time: 'Hace 10 minutos', amount: '580.000 AR$', isLead: true },
        { name: 'Erik Bernz', time: 'Hace 12 minutos', amount: '550.000 AR$', isLead: false },
        { name: 'Juan Perez', time: 'Hace 15 minutos', amount: '520.000 AR$', isLead: false },
        { name: 'Maria Lopez', time: 'Hace 18 minutos', amount: '500.000 AR$', isLead: false },
      ]
    },
    { 
      id: 'item-4',
      index: 4, 
      title: 'Baquetas Usadas de Charlie Watts', 
      basePrice: '300.000 ARS', 
      image: require('@/assets/images/rolling_stone_auction.png'),
      owner: 'Agustin Blanco Vocos',
      details: 'Un par de baquetas originales de madera usadas en concierto por Charlie Watts durante los años 80, firmadas por el legendario baterista.',
      bids: [
        { name: 'Claudio Gomez', time: 'Hace 1 minuto', amount: '350.000 AR$', isLead: true },
        { name: 'Maria Lopez', time: 'Hace 3 minutos', amount: '320.000 AR$', isLead: false },
        { name: 'Juan Perez', time: 'Hace 5 minutos', amount: '300.000 AR$', isLead: false },
      ]
    },
    { 
      id: 'item-5',
      index: 5, 
      title: 'Póster de Gira de 1975 Enmarcado', 
      basePrice: '150.000 ARS', 
      image: require('@/assets/images/rolling_stone_auction.png'),
      owner: 'Agustin Blanco Vocos',
      details: 'Póster promocional original de la gira norteamericana de la banda en 1975, enmarcado con cristal protector UV.',
      bids: [
        { name: 'Erik Bernz', time: 'Hace 30 segundos', amount: '185.000 AR$', isLead: true },
        { name: 'Juan Perez', time: 'Hace 5 minutos', amount: '170.000 AR$', isLead: false },
        { name: 'Claudio Gomez', time: 'Hace 8 minutos', amount: '160.000 AR$', isLead: false },
        { name: 'Erik Bernz', time: 'Hace 10 minutos', amount: '150.000 AR$', isLead: false },
      ]
    },
  ],
  '2': [
    {
      id: 'guitar-1',
      index: 1,
      title: 'Gibson Les Paul Custom 1968',
      basePrice: '2.500.000 ARS',
      image: require('@/assets/images/rolling_stone_auction.png'),
      owner: 'Agustin Blanco Vocos',
      details: 'Modelo histórico reedición 1968 con pastillas humbucker originales. Acabado Ebony de alto brillo en impecable estado de conservación.',
      bids: [
        { name: 'Erik Bernz', time: 'Hace 2 minutos', amount: '2.700.000 AR$', isLead: true },
        { name: 'Juan Perez', time: 'Hace 5 minutos', amount: '2.600.000 AR$', isLead: false },
        { name: 'Claudio Gomez', time: 'Hace 10 minutos', amount: '2.500.000 AR$', isLead: false },
      ]
    },
    {
      id: 'guitar-2',
      index: 2,
      title: 'Fender Stratocaster Sunburst 1962',
      basePrice: '3.000.000 ARS',
      image: require('@/assets/images/rolling_stone_auction.png'),
      owner: 'Agustin Blanco Vocos',
      details: 'Cuerpo de aliso original con mástil de arce y diapasón de palisandro. Todo el cableado y micrófonos son de época.',
      bids: [
        { name: 'Juan Perez', time: 'Hace 1 minuto', amount: '3.100.000 AR$', isLead: true },
        { name: 'Maria Lopez', time: 'Hace 6 minutos', amount: '3.000.000 AR$', isLead: false },
      ]
    },
    {
      id: 'guitar-3',
      index: 3,
      title: 'Gibson SG Standard Cherry 1971',
      basePrice: '1.800.000 ARS',
      image: require('@/assets/images/rolling_stone_auction.png'),
      owner: 'Agustin Blanco Vocos',
      details: 'Modelo clásico Cherry Red con trémolo Bigsby original. Una guitarra muy resonante con trastes originales en excelente estado.',
      bids: [
        { name: 'Claudio Gomez', time: 'Hace 20 segundos', amount: '1.950.000 AR$', isLead: true },
        { name: 'Erik Bernz', time: 'Hace 3 minutos', amount: '1.880.000 AR$', isLead: false },
        { name: 'Juan Perez', time: 'Hace 5 minutos', amount: '1.800.000 AR$', isLead: false },
      ]
    },
    {
      id: 'guitar-4',
      index: 4,
      title: 'Fender Telecaster Butterscotch 1952',
      basePrice: '4.000.000 ARS',
      image: require('@/assets/images/rolling_stone_auction.png'),
      owner: 'Agustin Blanco Vocos',
      details: 'La legendaria "Blackguard" Telecaster en acabado Butterscotch Blonde. Todo un ícono del rock y el country vintage.',
      bids: []
    }
  ]
};
