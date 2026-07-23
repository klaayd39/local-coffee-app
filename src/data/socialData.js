// Mock social feed, users, drinks, beans, badges, and notifications data for Timpla Social

export const CURRENT_USER = {
  id: 'u1',
  name: 'Klyde Joseph Yabo',
  username: 'klydeyabo',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  bio: 'Coffee enthusiast & local cafe explorer ☕ | Malaybalay Coffee Guide Founder',
  location: 'Malaybalay City, PH',
  favoriteBrew: 'V60 Pour-over',
  followersCount: 342,
  followingCount: 189,
  checkInsCount: 48,
  points: 750,
  level: 'Master Cupper',
  stampsCount: 12,
  savedPostIds: ['p2', 'p4'],
};

export const USERS = [
  CURRENT_USER,
  {
    id: 'u2',
    name: 'Sofia Santos',
    username: 'sofia.brews',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    bio: 'Chasing the best Bukidnon Arabica 🌿 | Roaster at heart',
    followersCount: 1205,
    followingCount: 412,
    isFollowing: true,
  },
  {
    id: 'u3',
    name: 'Marco Dev',
    username: 'marcocoffee',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    bio: 'Code + Espresso = Fuel ⚡ | Mechanical Keyboard & AeroPress geek',
    followersCount: 890,
    followingCount: 310,
    isFollowing: false,
  },
  {
    id: 'u4',
    name: 'Bea Alcantara',
    username: 'bea_latteart',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    bio: 'Latte Art Competitor 🏆 | Matcha & Espresso enthusiast',
    followersCount: 2450,
    followingCount: 520,
    isFollowing: true,
  }
];

export const STORIES = [
  {
    id: 's1',
    user: CURRENT_USER,
    hasUnseen: false,
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=400&q=80',
    title: 'Your Story',
  },
  {
    id: 's2',
    user: USERS[1],
    hasUnseen: true,
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=400&q=80',
    title: 'Fresh Roast',
  },
  {
    id: 's3',
    user: USERS[2],
    hasUnseen: true,
    image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=400&q=80',
    title: 'V60 Recipe',
  },
  {
    id: 's4',
    user: USERS[3],
    hasUnseen: false,
    image: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=400&q=80',
    title: 'Latte Art',
  }
];

export const POSTS = [
  {
    id: 'p1',
    user: USERS[1],
    cafeId: 'c7',
    cafeName: 'Malaybalay City Coffee Pimentel (MC2)',
    location: 'Pimentel St., Poblacion',
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1000&q=80',
    drinkName: 'Anaerobic Natural Bukidnon Pour-over',
    beanRoast: 'Light Roast',
    rating: 5,
    tastingNotes: ['Wild Berry', 'Jasmine', 'Honey Sweetness'],
    acidity: 4,
    body: 3,
    sweetness: 5,
    caption: 'Stopped by MC2 for their newly harvested Mount Kitanglad batch! The jasmine floral aroma hit as soon as it cooled down. Absolutely world-class local coffee ☕✨',
    likesCount: 84,
    commentsCount: 12,
    isLiked: true,
    isSaved: false,
    timestamp: '2 hours ago',
    comments: [
      { id: 'c1', user: USERS[2], text: 'That clarity looks amazing! Did you ask for V60 or Kalita Wave?', time: '1h ago' },
      { id: 'c2', user: CURRENT_USER, text: 'Adding this to my weekend coffee crawl list!', time: '30m ago' }
    ]
  },
  {
    id: 'p2',
    user: USERS[2],
    cafeId: 'c8',
    cafeName: 'Coffee Wagon Cafe & Roastery',
    location: 'Fortich St, Poblacion',
    image: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=1000&q=80',
    drinkName: 'Dirty Matcha Espresso',
    beanRoast: 'Medium-Dark Roast',
    rating: 4.8,
    tastingNotes: ['Dark Chocolate', 'Matcha Earthiness', 'Creamy'],
    acidity: 2,
    body: 5,
    sweetness: 4,
    caption: 'Late afternoon coding session powered by Coffee Wagon’s signature Dirty Matcha. The espresso shot balances perfectly with the Uji matcha foam 💻☕',
    likesCount: 142,
    commentsCount: 19,
    isLiked: false,
    isSaved: true,
    timestamp: '5 hours ago',
    comments: [
      { id: 'c3', user: USERS[3], text: 'My absolute favorite combo! Try it with oat milk next time!', time: '4h ago' }
    ]
  },
  {
    id: 'p3',
    user: USERS[3],
    cafeId: 'c9',
    cafeName: 'Breathe Café',
    location: 'Malaybalay Highway',
    image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=1000&q=80',
    drinkName: 'Spanish Iced Latte & Almond Croissant',
    beanRoast: 'Medium Roast',
    rating: 4.9,
    tastingNotes: ['Condensed Milk', 'Toasted Almond', 'Cinnamon'],
    acidity: 1,
    body: 4,
    sweetness: 5,
    caption: 'Sunday mornings are meant for cozy garden vibes at Breathe Café. Their fresh bakery selection paired with sweet iced latte is pure happiness 🌿🥐',
    likesCount: 210,
    commentsCount: 28,
    isLiked: true,
    isSaved: false,
    timestamp: '1 day ago',
    comments: []
  }
];

export const TRENDING_DRINKS = [
  {
    id: 'td1',
    name: 'Anaerobic Honey Cold Drip',
    cafeName: 'MC2 Coffee Pimentel',
    rating: 4.9,
    orders: 340,
    image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=400&q=80',
    tags: ['Cold Brew', 'Specialty', 'Bukidnon Origin']
  },
  {
    id: 'td2',
    name: 'Smoked Sea Salt Caramel Latte',
    cafeName: 'Coffee Wagon Roastery',
    rating: 4.8,
    orders: 512,
    image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=400&q=80',
    tags: ['Signature', 'Sweet & Savory']
  },
  {
    id: 'td3',
    name: 'Pistachio Cloud Espresso',
    cafeName: 'Breathe Café',
    rating: 4.9,
    orders: 289,
    image: 'https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=400&q=80',
    tags: ['Trend', 'Nutty', 'Foam Top']
  }
];

export const FEATURED_BEANS = [
  {
    id: 'b1',
    name: 'Mount Kitanglad Arabica Single Origin',
    roaster: 'Bukidnon Specialty Coffee Guild',
    elevation: '1,450m',
    process: 'Natural Process',
    flavorProfile: ['Black Cherry', 'Cacao Nibs', 'Brown Sugar'],
    price: '₱580 / 250g',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1587734195503-904fca47e0e9?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'b2',
    name: 'San Fernando Micro-Lot Honey',
    roaster: 'Coffee Wagon Micro-Roastery',
    elevation: '1,200m',
    process: 'Yellow Honey Process',
    flavorProfile: ['Peach Tea', 'Citrus Peel', 'Wildflower Honey'],
    price: '₱620 / 250g',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?auto=format&fit=crop&w=400&q=80'
  }
];

export const BADGES = [
  { id: 'bg1', name: 'Malaybalay Pioneer', icon: '📍', description: 'Checked in at 5+ local coffee shops', unlocked: true },
  { id: 'bg2', name: 'Pour-Over Master', icon: '🧪', description: 'Log 10 specialty single-origin brews', unlocked: true }
];

export const NOTIFICATIONS = [
  {
    id: 'n1',
    type: 'like',
    user: USERS[1],
    text: 'liked your post "Anaerobic Natural Bukidnon Pour-over"',
    time: '10m ago',
    read: false,
  },
  {
    id: 'n2',
    type: 'follow',
    user: USERS[3],
    text: 'started following your coffee journey',
    time: '2h ago',
    read: false,
  },
  {
    id: 'n3',
    type: 'badge',
    icon: '🏆',
    text: 'You unlocked the "Malaybalay Pioneer" badge! (+100 pts)',
    time: '1d ago',
    read: true,
  }
];
