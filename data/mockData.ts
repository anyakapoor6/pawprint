import { PetReport, Story, ReportType, PetType, PetSize, ReportStatus } from '@/types/pet';

export const mockReports: PetReport[] = [
  {
    id: '1',
    userId: 'user1',
    name: 'Max',
    type: 'dog',
    breed: 'Golden Retriever',
    color: 'Golden',
    size: 'large',
    gender: 'male',
    ageCategory: 'adult',
    description: 'Last seen near the lake. Wearing a red collar with tags.',
    photos: [
      'https://images.pexels.com/photos/2253275/pexels-photo-2253275.jpeg'
    ],
    reportType: 'lost',
    status: 'active',
    isUrgent: true,
    dateReported: '2024-03-10',
    lastSeenDate: '2024-03-10',
    lastSeenLocation: {
      latitude: 40.785091,
      longitude: -73.968285,
      address: 'Central Park, New York'
    },
    reward: {
      amount: 500,
      description: 'Reward for safe return'
    },
    contactInfo: {
      name: 'John Smith',
      email: 'john.smith@example.com',
      phone: '555-0123'
    },
    tags: ['friendly', 'collar', 'microchipped']
  },
  {
    id: '2',
    userId: 'user2',
    name: 'Luna',
    type: 'cat',
    breed: 'Siamese',
    color: 'Cream',
    size: 'small',
    gender: 'female',
    ageCategory: 'baby',
    description: 'Indoor cat, may be scared. Has a blue collar with bell.',
    photos: [
      'https://images.pexels.com/photos/1770918/pexels-photo-1770918.jpeg'
    ],
    reportType: 'lost',
    status: 'active',
    isUrgent: true,
    dateReported: '2024-03-09',
    lastSeenDate: '2024-03-09',
    lastSeenLocation: {
      latitude: 40.692532,
      longitude: -73.990997,
      address: 'Downtown Brooklyn'
    },
    contactInfo: {
      name: 'Sarah Johnson',
      email: 'sarah.j@example.com',
      phone: '555-0124'
    },
    tags: ['indoor', 'shy', 'microchipped']
  },
  {
    id: '3',
    userId: 'user3',
    name: 'Charlie',
    type: 'dog',
    breed: 'Labrador Retriever',
    color: 'Chocolate',
    size: 'large',
    gender: 'male',
    ageCategory: 'adult',
    description: 'Found wandering near the park. Very friendly, wearing a green collar.',
    photos: [
      'https://images.pexels.com/photos/1805164/pexels-photo-1805164.jpeg'
    ],
    reportType: 'found',
    status: 'active',
    isUrgent: false,
    dateReported: '2024-03-11',
    lastSeenLocation: {
      latitude: 40.761421,
      longitude: -73.981667,
      address: 'Bryant Park, New York'
    },
    contactInfo: {
      name: 'Michael Chen',
      email: 'michael.c@example.com',
      phone: '555-0125'
    },
    tags: ['friendly', 'collar']
  },
  {
    id: '4',
    userId: 'user4',
    name: 'Bella',
    type: 'cat',
    breed: 'Persian',
    color: 'White',
    size: 'small',
    gender: 'female',
    ageCategory: 'adult',
    description: 'Found in residential area. Long-haired white cat with blue eyes.',
    photos: [
      'https://images.pexels.com/photos/1521306/pexels-photo-1521306.jpeg'
    ],
    reportType: 'found',
    status: 'active',
    isUrgent: false,
    dateReported: '2024-03-12',
    lastSeenLocation: {
      latitude: 40.742054,
      longitude: -73.988211,
      address: 'Gramercy Park, New York'
    },
    contactInfo: {
      name: 'Emily Davis',
      email: 'emily.d@example.com',
      phone: '555-0126'
    },
    tags: ['long-hair', 'friendly']
  },
  {
    id: '5',
    userId: 'user5',
    name: 'Rocky',
    type: 'dog',
    breed: 'German Shepherd',
    color: 'Black and Tan',
    size: 'large',
    gender: 'male',
    ageCategory: 'senior',
    description: 'Missing since yesterday evening. Has a distinctive scar on right ear.',
    photos: [
      'https://images.pexels.com/photos/333083/pexels-photo-333083.jpeg'
    ],
    reportType: 'lost',
    status: 'active',
    isUrgent: true,
    dateReported: '2024-03-13',
    lastSeenDate: '2024-03-13',
    lastSeenLocation: {
      latitude: 40.775891,
      longitude: -73.976328,
      address: 'Upper East Side, New York'
    },
    reward: {
      amount: 1000,
      description: 'Substantial reward for finding our beloved Rocky'
    },
    contactInfo: {
      name: 'David Wilson',
      email: 'david.w@example.com',
      phone: '555-0127'
    },
    tags: ['trained', 'microchipped', 'distinctive-marks']
  },
  {
    id: '6',
    userId: 'user6',
    name: 'Milo',
    type: 'cat',
    breed: 'Tabby',
    color: 'Gray and White',
    size: 'small',
    gender: 'male',
    ageCategory: 'baby',
    description: 'Milo slipped out the front door. He’s very playful but may be scared of strangers.',
    photos: [
      'https://images.pexels.com/photos/320014/pexels-photo-320014.jpeg'
    ],
    reportType: 'lost',
    status: 'active',
    isUrgent: false,
    dateReported: '2024-03-14',
    lastSeenDate: '2024-03-14',
    lastSeenLocation: {
      latitude: 40.73061,
      longitude: -73.935242,
      address: 'Astoria, New York'
    },
    contactInfo: {
      name: 'Anna Lopez',
      email: 'anna.lopez@example.com',
      phone: '555-0129'
    },
    tags: ['kitten', 'playful', 'indoor']
  }
];

export const mockStories: Story[] = [
  {
    id: '1',
    userId: 'user1',
    title: 'Bailey Found After 3 Weeks!',
    content: 'We never lost hope of finding our beloved Bailey after he ran away during the 4th of July fireworks. Thanks to a kind stranger who recognized him from PawPrint and the amazing AI matching feature, Bailey is finally back home where he belongs! The reunion was emotional and Bailey couldn\'t stop wagging his tail. We\'re so grateful to this wonderful community!',
    petReportId: '101',
    petName: 'Bailey',
    petPhoto: 'https://images.pexels.com/photos/2253275/pexels-photo-2253275.jpeg',
    userPhoto: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg',
    userName: 'Michael Anderson',
    date: '2024-03-01',
    likes: 342,
    comments: 57,
    photos: [
      'https://images.pexels.com/photos/2253275/pexels-photo-2253275.jpeg',
      'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg'
    ]
  }
];
